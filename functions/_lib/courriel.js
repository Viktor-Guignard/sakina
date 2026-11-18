// Courriels : envoyés par Brevo (prestataire français) si BREVO_API_KEY est défini.
// Sans clé, rien ne part : l'événement est seulement noté dans l'historique de la commande.
import { journal } from './outils.js';

const echapper = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export async function envoyer(env, { a, sujet, lignes, lien, libelleLien, commande, rtl = false }) {
  if (!a) return false;
  const html = `<div dir="${rtl ? 'rtl' : 'ltr'}" style="font-family:Arial,sans-serif;color:#14202E;line-height:1.6;max-width:560px">
    ${lignes.map(l => `<p>${echapper(l)}</p>`).join('')}
    ${lien ? `<p><a href="${echapper(lien)}" style="display:inline-block;padding:10px 18px;background:#1F4E9C;color:#fff;border-radius:10px;text-decoration:none">${echapper(libelleLien)}</a></p>` : ''}
    <p style="color:#46546A">Sakîna · سكينة</p></div>`;
  if (!env.BREVO_API_KEY || !env.EXPEDITEUR_EMAIL) {
    if (commande) await journal(env, commande, 'courriel_non_envoye', { a, sujet });
    return false;
  }
  const r = await fetch(env.BREVO_API || 'https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ sender: { email: env.EXPEDITEUR_EMAIL, name: env.EXPEDITEUR_NOM || 'Sakîna' }, to: [{ email: a }], subject: sujet, htmlContent: html,
      textContent: [...lignes, lien ? `${libelleLien} : ${lien}` : ''].join('\n\n') }),
  });
  if (commande) await journal(env, commande, r.ok ? 'courriel' : 'courriel_echec', { a, sujet, statut: r.status });
  return r.ok;
}
