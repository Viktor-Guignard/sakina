// GET   /api/admin/commandes/:id : tout sur une commande, avec son historique.
// PATCH /api/admin/commandes/:id : changer le statut (épreuve envoyée, en impression,
//       expédiée…), noter le suivi du colis ou une note interne. Le client est prévenu.
import { json, erreur, lireJson, texte, maintenant, journal, site } from '../../../_lib/outils.js';
import { STATUTS, SUITES_ADMIN } from '../../../_lib/statuts.js';
import { envoyer } from '../../../_lib/courriel.js';
import { nomPiece } from '../../../_lib/prix.js';

export async function onRequestGet({ env, params }) {
  const c = await env.DB.prepare('SELECT * FROM commandes WHERE id = ?').bind(String(params.id)).first();
  if (!c) return erreur('Commande introuvable.', 404);
  const { results } = await env.DB.prepare('SELECT date, type, detail FROM evenements WHERE commande = ? ORDER BY n').bind(c.id).all();
  return json({ ...c, etat: JSON.parse(c.etat), adresse: c.adresse ? JSON.parse(c.adresse) : null, historique: results,
    suites: SUITES_ADMIN[c.statut] || [], statuts: STATUTS });
}

// Ce que l'on écrit au client quand la commande avance.
const MOTS = {
  epreuve_envoyee: { fr: ['Votre épreuve est prête : relisez-la, puis validez-la ou dites-nous quoi corriger.', 'Voir et valider l’épreuve'],
                     ar: ['نسخة المراجعة جاهزة: راجعوها ثم وافقوا عليها أو أخبرونا بما يُعدَّل.', 'عرض النسخة والموافقة عليها'] },
  en_impression:   { fr: ['Votre commande part à l’impression.', 'Suivre ma commande'], ar: ['طلبكم قيد الطباعة الآن.', 'متابعة الطلب'] },
  expediee:        { fr: ['Votre commande est expédiée.', 'Suivre ma commande'], ar: ['تمّ شحن طلبكم.', 'متابعة الطلب'] },
  attente_paiement: { fr: ['Le prix de votre demande est prêt : vous pouvez régler en ligne depuis la page de suivi.', 'Voir ma demande'],
                      ar: ['سعر طلبكم جاهز: يمكنكم الدفع من صفحة المتابعة.', 'عرض الطلب'] },
  annulee:         { fr: ['Votre commande est annulée. Pour toute question, répondez à ce message.', 'Voir ma commande'], ar: ['أُلغي طلبكم. لأيّ سؤال، ردّوا على هذه الرسالة.', 'عرض الطلب'] },
};

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

  if (statut && MOTS[statut] && corps.prevenir !== false) {
    const ar = c.langue_site === 'ar', [phrase, bouton] = MOTS[statut][ar ? 'ar' : 'fr'];
    const lignes = [ar ? 'السلام عليكم،' : 'Bonjour,', phrase];
    if (texte(corps.message, 2000)) lignes.push(texte(corps.message, 2000));
    if (statut === 'expediee' && (corps.suivi_colis || c.suivi_colis)) lignes.push((ar ? 'رقم التتبّع: ' : 'Numéro de suivi : ') + (corps.suivi_colis || c.suivi_colis));
    await envoyer(env, { a: c.email, commande: c.id, rtl: ar, sujet: `${c.id} · ${nomPiece(c.produit, c.ceremonie, ar ? 'ar' : 'fr')}`, lignes,
      lien: `${site(env, request)}/${ar ? 'ar/' : ''}suivi.html?c=${c.id}&j=${c.jeton}`, libelleLien: bouton });
  }
  return onRequestGet({ env, params });
}
