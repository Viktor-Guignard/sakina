// GET /api/admin/messages : les messages de la page Contact, les plus récents d'abord.
// PATCH /api/admin/messages {id, lu} : marquer lu ou non lu.
import { json, erreur, lireJson } from '../../_lib/outils.js';

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare('SELECT id, cree_le, nom, email, sujet, message, langue, lu FROM messages ORDER BY id DESC LIMIT 200').all();
  return json({ messages: results, non_lus: results.filter(m => !m.lu).length });
}

export async function onRequestPatch({ request, env }) {
  let c;
  try { c = await lireJson(request, 1000); } catch (e) { return erreur('Demande illisible.'); }
  if (!Number.isInteger(c.id)) return erreur('Message inconnu.');
  await env.DB.prepare('UPDATE messages SET lu = ? WHERE id = ?').bind(c.lu ? 1 : 0, c.id).run();
  return json({ ok: true });
}
