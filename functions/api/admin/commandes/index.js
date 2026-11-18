// GET /api/admin/commandes?statut=… : la liste des commandes, les plus récentes d'abord.
import { json } from '../../../_lib/outils.js';
import { STATUTS } from '../../../_lib/statuts.js';

export async function onRequestGet({ request, env }) {
  const statut = new URL(request.url).searchParams.get('statut');
  const filtre = statut && STATUTS[statut] ? ' WHERE statut = ?' : '';
  const q = env.DB.prepare(`SELECT id, cree_le, maj_le, statut, produit, ceremonie, pages, quantite, montant, nom, email, relecture
    FROM commandes${filtre} ORDER BY cree_le DESC LIMIT 200`);
  const { results } = await (filtre ? q.bind(statut) : q).all();
  const { results: comptes } = await env.DB.prepare('SELECT statut, COUNT(*) AS n FROM commandes GROUP BY statut').all();
  return json({ commandes: results, comptes: Object.fromEntries(comptes.map(c => [c.statut, c.n])), statuts: STATUTS });
}
