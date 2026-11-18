// Ouvre un paiement Stripe Checkout pour une commande déjà enregistrée.
import { stripe } from './stripe.js';
import { maintenant, journal, site } from './outils.js';
import { nomPiece, estLivret } from './prix.js';

export function resume(c, ar) {
  const pages = estLivret(c.produit) ? ` · ${c.pages} ${ar ? 'صفحة' : 'pages'}` : '';
  return `${nomPiece(c.produit, c.ceremonie, ar ? 'ar' : 'fr')}${pages} × ${c.quantite}`;
}

export async function ouvrirPaiement(env, request, c, retour) {
  const ar = c.langue_site === 'ar', base = site(env, request), r = ar ? 'ar/' : '';
  const suivi = `${base}/${r}suivi.html?c=${c.id}&j=${c.jeton}`;
  const pays = (env.PAYS_LIVRAISON || 'FR').split(',').map(s => s.trim()).filter(Boolean);
  const session = await stripe(env, 'checkout/sessions', {
    mode: 'payment', locale: ar ? 'auto' : 'fr', client_reference_id: c.id, customer_email: c.email,
    success_url: `${suivi}&paye=1`, cancel_url: retour || suivi,
    metadata: { commande: c.id }, payment_intent_data: { metadata: { commande: c.id } },
    line_items: [{ quantity: 1, price_data: { currency: 'eur', unit_amount: c.montant, product_data: { name: resume(c, ar) } } }],
    shipping_address_collection: { allowed_countries: pays },
    phone_number_collection: { enabled: 'true' },
    shipping_options: c.livraison != null ? [{ shipping_rate_data: { type: 'fixed_amount', display_name: ar ? 'التوصيل' : 'Livraison',
      fixed_amount: { amount: c.livraison, currency: 'eur' } } }] : null,
  });
  await env.DB.prepare('UPDATE commandes SET stripe_session = ?, statut = ?, maj_le = ? WHERE id = ?').bind(session.id, 'attente_paiement', maintenant(), c.id).run();
  await journal(env, c.id, 'paiement_ouvert', session.id);
  return session.url;
}
