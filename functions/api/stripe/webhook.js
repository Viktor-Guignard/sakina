// POST /api/stripe/webhook : Stripe confirme le paiement (ou son abandon).
// À déclarer dans Stripe avec les événements checkout.session.completed,
// checkout.session.async_payment_succeeded et checkout.session.expired.
import { json, erreur, maintenant, journal, site } from '../../_lib/outils.js';
import { signatureValide } from '../../_lib/stripe.js';
import { envoyer, ecrireAuClient } from '../../_lib/courriel.js';
import { nomPiece } from '../../_lib/prix.js';

export async function onRequestPost({ request, env }) {
  const corps = await request.text();
  if (!(await signatureValide(corps, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET))) return erreur('Signature invalide.', 400);
  const ev = JSON.parse(corps);
  // Un même événement peut arriver deux fois : on ne le traite qu'une fois.
  const deja = await env.DB.prepare('INSERT OR IGNORE INTO stripe_evenements (id, date) VALUES (?, ?)').bind(ev.id, maintenant()).run();
  if (!deja.meta.changes) return json({ recu: true, deja: true });

  const s = ev.data?.object || {};
  const id = s.metadata?.commande || s.client_reference_id;
  if (!id) return json({ recu: true });
  const c = await env.DB.prepare('SELECT * FROM commandes WHERE id = ?').bind(id).first();
  if (!c) return json({ recu: true });

  if ((ev.type === 'checkout.session.completed' && s.payment_status === 'paid') || ev.type === 'checkout.session.async_payment_succeeded') {
    if (c.statut !== 'attente_paiement' && c.statut !== 'abandonnee') return json({ recu: true });
    if (s.amount_total != null && s.amount_total < (c.montant || 0)) {   // montant inattendu : on ne valide pas
      await journal(env, id, 'paiement_incoherent', { attendu: c.montant, recu: s.amount_total });
      return json({ recu: true });
    }
    const livraison = s.collected_information?.shipping_details || s.shipping_details || null;
    const adresse = { livraison, client: s.customer_details || null };
    await env.DB.prepare('UPDATE commandes SET statut = ?, stripe_paiement = ?, adresse = ?, telephone = COALESCE(telephone, ?), maj_le = ? WHERE id = ?')
      .bind('payee', s.payment_intent || null, JSON.stringify(adresse), s.customer_details?.phone || null, maintenant(), id).run();
    await journal(env, id, 'statut', { statut: 'payee', montant: s.amount_total });
    const base = site(env, request);
    const payee = await env.DB.prepare('SELECT * FROM commandes WHERE id = ?').bind(id).first();
    await ecrireAuClient(env, request, payee, 'paiement_confirme');
    await envoyer(env, { a: env.ADMIN_EMAIL, commande: id, sujet: `${id} payée`, lignes: [c.nom, nomPiece(c.produit, c.ceremonie), `${((s.amount_total || 0) / 100).toFixed(2)} €`],
      lien: `${base}/admin.html#${id}`, libelleLien: 'Préparer l’épreuve' });
  } else if (ev.type === 'checkout.session.expired' && c.statut === 'attente_paiement') {
    await env.DB.prepare('UPDATE commandes SET statut = ?, maj_le = ? WHERE id = ?').bind('abandonnee', maintenant(), id).run();
    await journal(env, id, 'statut', { statut: 'abandonnee' });
  }
  return json({ recu: true });
}
