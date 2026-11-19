// POST /api/admin/rappels : relance les clients dont l'épreuve attend depuis plus de 3 jours
// (au plus une relance tous les 3 jours). Appelé chaque matin par .github/workflows/rappels.yml,
// ou à la main depuis l'administration.
import { json, journal } from '../../_lib/outils.js';
import { ecrireAuClient } from '../../_lib/courriel.js';

const JOURS = 3;

export async function onRequestPost({ request, env }) {
  const avant = new Date(Date.now() - JOURS * 86400_000).toISOString();
  const { results } = await env.DB.prepare(`SELECT * FROM commandes c WHERE statut = 'epreuve_envoyee' AND maj_le < ?
      AND NOT EXISTS (SELECT 1 FROM evenements e WHERE e.commande = c.id AND e.type = 'rappel' AND e.date > ?)`).bind(avant, avant).all();
  for (const c of results) {
    await ecrireAuClient(env, request, c, 'rappel_epreuve');
    await journal(env, c.id, 'rappel', null);
  }
  return json({ relances: results.map(c => c.id) });
}
