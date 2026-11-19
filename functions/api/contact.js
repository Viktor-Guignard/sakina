// POST /api/contact : un message de la page Contact. Gardé en base, signalé à l'administration
// par courriel quand Brevo est branché (sinon visible seulement dans admin.html).
import { json, erreur, lireJson, texte, emailValide, maintenant, sha256, site } from '../_lib/outils.js';
import { envoyer } from '../_lib/courriel.js';
import { nomAcceptable } from '../_lib/etat.js';

const SUJETS = ['question', 'devis', 'commande', 'janaza', 'autre'];

export async function onRequestPost({ request, env }) {
  let c;
  try { c = await lireJson(request, 10_000); } catch (e) { return erreur('Demande illisible.'); }
  const ar = c.langue === 'ar';
  const E = (fr, a) => erreur(ar ? a : fr);
  if (texte(c.site_web, 200)) return json({ ok: true });   // piège à robots
  const nom = texte(c.nom, 80), email = texte(c.email, 120).toLowerCase(), message = texte(c.message, 3000);
  const sujet = SUJETS.includes(c.sujet) ? c.sujet : 'autre';
  if (!nom || !nomAcceptable(nom)) return E('Indiquez votre nom, sans lien.', 'اكتبوا اسمكم، دون رابط.');
  if (!emailValide(email)) return E('Cette adresse e-mail ne semble pas valide.', 'عنوان البريد غير صالح.');
  if (message.length < 5) return E('Écrivez votre message.', 'اكتبوا رسالتكم.');
  const ip = request.headers.get('CF-Connecting-IP') || '';
  const empreinte = ip ? await sha256((env.SEL_IP || 'sakina') + ip) : null;
  if (empreinte) {
    const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM messages WHERE ip_empreinte = ? AND cree_le > ?')
      .bind(empreinte, new Date(Date.now() - 3600_000).toISOString()).first();
    if (n >= 5) return E('Trop de messages : réessayez dans une heure.', 'رسائل كثيرة: أعيدوا المحاولة بعد ساعة.');
  }
  await env.DB.prepare('INSERT INTO messages (cree_le, nom, email, sujet, message, langue, ip_empreinte) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(maintenant(), nom, email, sujet, message, ar ? 'ar' : 'fr', empreinte).run();
  await envoyer(env, { a: env.ADMIN_EMAIL, sujet: `Message (${sujet}) de ${nom}`, lignes: [`${nom} <${email}>`, message],
    lien: `${site(env, request)}/admin.html#messages`, libelleLien: 'Lire dans l’administration' });
  return json({ ok: true });
}
