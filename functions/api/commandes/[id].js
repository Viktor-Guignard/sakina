// GET  /api/commandes/:id?j=jeton : ce que voit le client sur la page de suivi.
// POST /api/commandes/:id?j=jeton : le client valide l'épreuve ou demande des corrections.
import { json, erreur, egal, lireJson, texte, maintenant, journal, site } from '../../_lib/outils.js';
import { STATUTS } from '../../_lib/statuts.js';
import { nomPiece } from '../../_lib/prix.js';
import { envoyer, ecrireAuClient } from '../../_lib/courriel.js';
import { ouvrirPaiement } from '../../_lib/paiement.js';

async function trouver(env, params, request) {
  const j = new URL(request.url).searchParams.get('j') || '';
  const c = await env.DB.prepare('SELECT * FROM commandes WHERE id = ?').bind(String(params.id)).first();
  // Même réponse que la commande existe ou non : on ne devine pas les identifiants.
  return c && egal(c.jeton, j) ? c : null;
}

function vue(c, historique) {
  return {
    id: c.id, statut: c.statut, libelle: STATUTS[c.statut], cree_le: c.cree_le, produit: c.produit, ceremonie: c.ceremonie,
    piece: { fr: nomPiece(c.produit, c.ceremonie, 'fr'), ar: nomPiece(c.produit, c.ceremonie, 'ar') },
    pages: c.pages, quantite: c.quantite, montant: c.montant, livraison: c.livraison, suivi_colis: c.suivi_colis,
    etat: JSON.parse(c.etat),
    historique: historique.map(e => ({ date: e.date, type: e.type })),
  };
}

export async function onRequestGet({ request, env, params }) {
  const c = await trouver(env, params, request);
  if (!c) return erreur('Commande introuvable.', 404);
  const { results } = await env.DB.prepare("SELECT date, type FROM evenements WHERE commande = ? AND type IN ('creation', 'statut', 'epreuve_validee', 'corrections') ORDER BY n").bind(c.id).all();
  return json(vue(c, results));
}

export async function onRequestPost({ request, env, params }) {
  const c = await trouver(env, params, request);
  if (!c) return erreur('Commande introuvable.', 404);
  let corps;
  try { corps = await lireJson(request, 5000); } catch (e) { return erreur('Demande illisible.'); }
  // Payer : une pièce sur devis dont le prix est fixé, ou un paiement resté en route.
  if (corps.action === 'payer') {
    if (!['attente_paiement', 'abandonnee'].includes(c.statut) || c.montant == null) return erreur('Rien à régler pour le moment.', 409);
    if (!env.STRIPE_SECRET_KEY) return erreur('Le paiement en ligne n’est pas encore ouvert.', 503);
    try { return json({ url: await ouvrirPaiement(env, request, c) }); }
    catch (e) { await journal(env, c.id, 'paiement_erreur', String(e.message || e)); return erreur('Le paiement n’a pas pu être ouvert.', 502); }
  }
  if (c.statut !== 'epreuve_envoyee') return erreur('Il n’y a pas d’épreuve à valider pour le moment.', 409);
  const valide = corps.action === 'valider';
  if (!valide && corps.action !== 'corriger') return erreur('Action inconnue.');
  const remarque = texte(corps.remarque, 2000);
  if (!valide && !remarque) return erreur('Dites-nous ce qu’il faut corriger.');
  const statut = valide ? 'epreuve_validee' : 'corrections';
  await env.DB.prepare('UPDATE commandes SET statut = ?, maj_le = ? WHERE id = ? AND statut = ?').bind(statut, maintenant(), c.id, 'epreuve_envoyee').run();
  await journal(env, c.id, statut, remarque || null);
  await ecrireAuClient(env, request, c, valide ? 'epreuve_validee' : 'corrections_recues', { remarque });
  await envoyer(env, { a: env.ADMIN_EMAIL, commande: c.id, sujet: `${c.id} : ${valide ? 'épreuve validée' : 'corrections demandées'}`,
    lignes: [c.nom, nomPiece(c.produit, c.ceremonie), remarque], lien: `${site(env, request)}/admin.html#${c.id}`, libelleLien: 'Ouvrir' });
  return json({ statut, libelle: STATUTS[statut] });
}
