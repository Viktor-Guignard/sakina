// POST /api/commandes : enregistre la pièce composée, puis renvoie l'adresse du paiement
// Stripe (ou, pour une pièce sur devis, celle de la page de suivi).
import { json, erreur, identifiant, jeton, sha256, lireJson, texte, emailValide, maintenant, journal, site } from '../../_lib/outils.js';
import { chiffrer } from '../../_lib/prix.js';
import { ouvrirPaiement, resume } from '../../_lib/paiement.js';
import { envoyer } from '../../_lib/courriel.js';

const MAX_PAR_HEURE = 10;   // commandes depuis une même adresse IP

export async function onRequestPost({ request, env }) {
  let corps;
  try { corps = await lireJson(request); } catch (e) { return erreur('Demande illisible.'); }
  const ar = corps.site === 'ar';
  const E = (fr, a) => erreur(ar ? a : fr);

  if (texte(corps.site_web, 200)) return json({ url: '/' });   // piège à robots : on ne dit rien
  const etat = corps.etat;
  if (!etat || typeof etat !== 'object') return E('La pièce est vide.', 'القطعة فارغة.');
  const contact = corps.contact || {};
  const nom = texte(contact.nom, 80), email = texte(contact.email, 120).toLowerCase();
  if (!nom) return E('Indiquez votre nom.', 'اكتبوا اسمكم.');
  if (!emailValide(email)) return E('Cette adresse e-mail ne semble pas valide.', 'عنوان البريد غير صالح.');

  const produit = String(etat.p || 'livret'), ceremonie = String(etat.c || '');
  const pages = Number(corps.pages), quantite = Number(corps.quantite);
  const prix = chiffrer({ produit, ceremonie, pages, quantite });
  if (prix.erreur) return erreur(prix.erreur);

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const empreinte = ip ? await sha256((env.SEL_IP || 'sakina') + ip) : null;
  if (empreinte) {
    const depuis = new Date(Date.now() - 3600_000).toISOString();
    const { n } = await env.DB.prepare('SELECT COUNT(*) AS n FROM commandes WHERE ip_empreinte = ? AND cree_le > ?').bind(empreinte, depuis).first();
    if (n >= MAX_PAR_HEURE) return E('Trop de demandes : réessayez dans une heure.', 'طلباتٌ كثيرة: أعيدوا المحاولة بعد ساعة.');
  }

  const id = identifiant(), secret = jeton(), date = maintenant();
  const livraison = prix.montant != null && env.LIVRAISON_CENTIMES ? Number(env.LIVRAISON_CENTIMES) : null;
  const statut = prix.montant == null ? 'devis_demande' : 'attente_paiement';
  const etatTexte = JSON.stringify(etat);
  if (etatTexte.length > 100_000) return E('La pièce est trop longue.', 'القطعة طويلة جدًّا.');
  await env.DB.prepare(`INSERT INTO commandes (id, jeton, cree_le, maj_le, statut, produit, ceremonie, langue_site, langue_piece, pages, quantite,
      montant, livraison, nom, email, telephone, message, relecture, etat, ip_empreinte) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(id, secret, date, date, statut, produit, ceremonie, ar ? 'ar' : 'fr', ['fr', 'ar', 'bi'].includes(etat.langue) ? etat.langue : 'bi',
      pages, quantite, prix.montant, livraison, nom, email, texte(contact.telephone, 30) || null, texte(contact.message, 1000) || null,
      corps.relecture ? 1 : 0, etatTexte, empreinte).run();
  await journal(env, id, 'creation', { statut, montant: prix.montant });

  const base = site(env, request), r = ar ? 'ar/' : '';
  const suivi = `${base}/${r}suivi.html?c=${id}&j=${secret}`;
  const quoi = resume({ produit, ceremonie, pages, quantite }, ar);

  await envoyer(env, { a: env.ADMIN_EMAIL, commande: id, sujet: `Nouvelle commande ${id} (${statut === 'devis_demande' ? 'devis' : 'à payer'})`,
    lignes: [`${nom} <${email}>`, quoi, prix.montant != null ? `${(prix.montant / 100).toFixed(2)} € TTC` : 'Sur devis', texte(contact.message, 1000)],
    lien: `${base}/admin.html#${id}`, libelleLien: 'Ouvrir dans l’administration' });

  if (prix.montant == null) {
    await envoyer(env, { a: email, commande: id, rtl: ar,
      sujet: ar ? `طلب عرض السعر ${id}` : `Votre demande de devis ${id}`,
      lignes: ar ? ['السلام عليكم،', `وصلنا طلبكم (${quoi}). سنرسل إليكم السعر قريبًا.`] : ['Bonjour,', `Nous avons bien reçu votre demande (${quoi}). Nous revenons vers vous avec un prix très vite.`],
      lien: suivi, libelleLien: ar ? 'متابعة الطلب' : 'Suivre ma demande' });
    return json({ id, url: suivi });
  }

  if (!env.STRIPE_SECRET_KEY) return E('Le paiement en ligne n’est pas encore ouvert.', 'الدفع عبر الإنترنت غير متاح بعد.');
  try {
    const c = await env.DB.prepare('SELECT * FROM commandes WHERE id = ?').bind(id).first();
    const retour = `${base}/${r}composer.html${texte(corps.lien, 90000).replace(/^[^#]*/, '')}`;
    return json({ id, url: await ouvrirPaiement(env, request, c, retour) });
  } catch (e) {
    await journal(env, id, 'paiement_erreur', String(e.message || e));
    return E('Le paiement n’a pas pu être ouvert. Réessayez dans un instant.', 'تعذّر فتح صفحة الدفع. أعيدوا المحاولة بعد قليل.');
  }
}
