// Toutes les routes /api/admin/* : mot de passe (ADMIN_JETON) dans l'en-tête Authorization.
// En ligne, protéger aussi admin.html et /api/admin par Cloudflare Access (voir BACKEND.md).
import { egal, erreur } from '../../_lib/outils.js';

export async function onRequest({ request, env, next }) {
  const fourni = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_JETON || env.ADMIN_JETON.length < 16 || !egal(fourni, env.ADMIN_JETON)) return erreur('Accès refusé.', 401);
  return next();
}
