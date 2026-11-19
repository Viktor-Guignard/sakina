// GET   /api/admin/commandes/:id : tout sur une commande, avec son historique.
// PATCH /api/admin/commandes/:id : changer le statut (épreuve envoyée, en impression,
//       expédiée…), noter le suivi du colis ou une note interne. Le client est prévenu.
import { json, erreur, lireJson, texte, maintenant, journal, site } from '../../../_lib/outils.js';
import { STATUTS, SUITES_ADMIN } from '../../../_lib/statuts.js';
import { ecrireAuClient } from '../../../_lib/courriel.js';

export async function onRequestGet({ env, params }) {
  const c = await env.DB.prepare('SELECT * FROM commandes WHERE id = ?').bind(String(params.id)).first();
  if (!c) return erreur('Commande introuvable.', 404);
  const { results } = await env.DB.prepare('SELECT date, type, detail FROM evenements WHERE commande = ? ORDER BY n').bind(c.id).all();
  return json({ ...c, etat: JSON.parse(c.etat), adresse: c.adresse ? JSON.parse(c.adresse) : null, historique: results,
    suites: SUITES_ADMIN[c.statut] || [], statuts: STATUTS });
}

// Le courriel envoyé au client quand la commande avance (voir _lib/courriel.js).
const TYPE = { epreuve_envoyee: 'epreuve', en_impression: 'en_impression', expediee: 'expediee', attente_paiement: 'devis_pret', annulee: 'annulee' };

export async function onRequestPatch({ request, env, params }) {
  const c = await env.DB.prepare('SELECT * FROM commandes WHERE id = ?').bind(String(params.id)).first();
  if (!c) return erreur('Commande introuvable.', 404);
  let corps;
  try { corps = await lireJson(request, 10_000); } catch (e) { return erreur('Demande illisible.'); }
  const maj = [], valeurs = [];
  if (typeof corps.note_interne === 'string') { maj.push('note_interne = ?'); valeurs.push(texte(corps.note_interne, 5000)); }
  if (typeof corps.suivi_colis === 'string') { maj.push('suivi_colis = ?'); valeurs.push(texte(corps.suivi_colis, 200)); }
  // L'épreuve : la pièce telle que relue et corrigée, collée depuis le compositeur (lien #l=…).
  if (typeof corps.lien_epreuve === 'string' && corps.lien_epreuve.includes('#l=')) {
    try {
      const b64 = corps.lien_epreuve.split('#l=')[1].replace(/-/g, '+').replace(/_/g, '/');
      const etat = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b64), ch => ch.charCodeAt(0))));
      if (!etat || etat.c !== c.ceremonie) return erreur('Ce lien ne correspond pas à cette cérémonie.');
      if ((etat.p || 'livret') !== c.produit) return erreur('Ce lien ne correspond pas à cette pièce.');
      maj.push('etat = ?'); valeurs.push(JSON.stringify(etat));
    } catch (e) { return erreur('Lien d’épreuve illisible.'); }
  }
  if (Number.isInteger(corps.pages) && corps.pages > 0) { maj.push('pages = ?'); valeurs.push(corps.pages); }
  if (corps.montant !== undefined && c.statut === 'devis_demande') {   // prix fixé pour une pièce sur devis
    const m = Math.round(Number(corps.montant));
    if (!(m > 0)) return erreur('Montant invalide.');
    maj.push('montant = ?'); valeurs.push(m);
  }
  let statut = null;
  if (corps.statut && corps.statut !== c.statut) {
    if (!(SUITES_ADMIN[c.statut] || []).includes(corps.statut)) return erreur(`Passage impossible : ${STATUTS[c.statut].fr} → ${STATUTS[corps.statut]?.fr || corps.statut}.`, 409);
    if (corps.statut === 'attente_paiement' && c.montant == null && corps.montant === undefined) return erreur('Fixez d’abord le prix.');
    statut = corps.statut;
    maj.push('statut = ?'); valeurs.push(statut);
  }
  if (!maj.length) return erreur('Rien à changer.');
  maj.push('maj_le = ?'); valeurs.push(maintenant());
  await env.DB.prepare(`UPDATE commandes SET ${maj.join(', ')} WHERE id = ?`).bind(...valeurs, c.id).run();
  if (statut) await journal(env, c.id, 'statut', { statut, message: texte(corps.message, 2000) || undefined });
  else await journal(env, c.id, 'modification', Object.keys(corps).join(', '));

  if (statut && TYPE[statut] && corps.prevenir !== false) {
    const apres = await env.DB.prepare('SELECT * FROM commandes WHERE id = ?').bind(c.id).first();
    await ecrireAuClient(env, request, apres, TYPE[statut], { message: texte(corps.message, 2000), suivi_colis: texte(corps.suivi_colis || '', 200) });
  }
  return onRequestGet({ env, params });
}
