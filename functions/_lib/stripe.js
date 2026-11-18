// Stripe, sans bibliothèque : l'API REST (formulaire encodé) et la vérification des webhooks.
// STRIPE_API peut pointer vers un faux Stripe pour les tests (tests/serveur.test.mjs).

/** Aplatit { a: { b: [1] } } en a[b][0]=1, le format attendu par Stripe. */
function aplatir(objet, prefixe = '', sortie = new URLSearchParams()) {
  for (const [cle, valeur] of Object.entries(objet)) {
    if (valeur == null || valeur === '') continue;
    const nom = prefixe ? `${prefixe}[${cle}]` : cle;
    if (typeof valeur === 'object') aplatir(valeur, nom, sortie);
    else sortie.append(nom, String(valeur));
  }
  return sortie;
}

export async function stripe(env, chemin, corps) {
  const base = env.STRIPE_API || 'https://api.stripe.com';
  const r = await fetch(`${base}/v1/${chemin}`, {
    method: corps ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Stripe-Version': '2025-03-31.basil' },
    body: corps ? aplatir(corps) : undefined,
  });
  const donnees = await r.json();
  if (!r.ok) throw new Error(`Stripe ${r.status} : ${donnees.error?.message || 'erreur'}`);
  return donnees;
}

/**
 * Vérifie l'en-tête Stripe-Signature (t=…,v1=…) : HMAC-SHA256 de « t.corps »
 * avec le secret du webhook, à moins de 5 minutes d'écart.
 */
export async function signatureValide(corps, entete, secret, tolerance = 300) {
  if (!entete || !secret) return false;
  const parties = Object.fromEntries(entete.split(',').map(p => p.split('=')).filter(p => p.length === 2).map(([k, v]) => [k.trim(), v]));
  const t = Number(parties.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > tolerance) return false;
  const signatures = entete.split(',').filter(p => p.trim().startsWith('v1=')).map(p => p.trim().slice(3));
  const cle = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', cle, new TextEncoder().encode(`${t}.${corps}`));
  const attendu = [...new Uint8Array(mac)].map(x => x.toString(16).padStart(2, '0')).join('');
  return signatures.some(s => s.length === attendu.length && [...s].reduce((d, c, i) => d | (c.charCodeAt(0) ^ attendu.charCodeAt(i)), 0) === 0);
}
