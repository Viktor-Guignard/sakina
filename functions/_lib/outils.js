// Outils communs du service de commande (Cloudflare Pages Functions).

export const maintenant = () => new Date().toISOString();

export function json(donnees, statut = 200, entetes = {}) {
  return new Response(JSON.stringify(donnees), {
    status: statut,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...entetes },
  });
}

export const erreur = (message, statut = 400) => json({ erreur: message }, statut);

/** Identifiant lisible : SK- et 8 caractères sans ambiguïté (ni 0/O, ni 1/I/L). */
export function identifiant() {
  const A = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const o = crypto.getRandomValues(new Uint8Array(8));
  return 'SK-' + [...o].map(x => A[x % A.length]).join('');
}

export function jeton(octets = 24) {
  return [...crypto.getRandomValues(new Uint8Array(octets))].map(x => x.toString(16).padStart(2, '0')).join('');
}

export async function sha256(texte) {
  const h = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte));
  return [...new Uint8Array(h)].map(x => x.toString(16).padStart(2, '0')).join('');
}

/** Comparaison en temps constant (jetons, signatures). */
export function egal(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

/** Lit un corps JSON en refusant les envois trop gros. */
export async function lireJson(requete, max = 120_000) {
  const texte = await requete.text();
  if (texte.length > max) throw new Error('trop_gros');
  return JSON.parse(texte);
}

export const texte = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
export const emailValide = e => /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/.test(e) && e.length <= 120;

export async function journal(env, commande, type, detail = null) {
  await env.DB.prepare('INSERT INTO evenements (commande, date, type, detail) VALUES (?, ?, ?, ?)')
    .bind(commande, maintenant(), type, detail == null ? null : (typeof detail === 'string' ? detail : JSON.stringify(detail))).run();
}

/** Adresse publique du site (liens dans les courriels et retours de Stripe). */
export const site = (env, requete) => (env.SITE_URL || new URL(requete.url).origin).replace(/\/$/, '');
