// Courriels de Sakîna : une mise en page commune (compatible avec les messageries, sans image
// externe) et les messages envoyés au client à chaque étape, en français et en arabe.
// Envoi par Brevo (prestataire français) si BREVO_API_KEY et EXPEDITEUR_EMAIL sont définis ;
// sinon rien ne part : l'envoi est seulement noté dans l'historique de la commande.
import { journal, site } from './outils.js';
import { nomPiece, estLivret } from './prix.js';

const echapper = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** Mise en page d'un courriel : bandeau bleu de nuit avec l'arc brisé, texte, bouton, pied. */
export function rendre({ rtl = false, titre = '', lignes = [], lien, bouton, pied = '' }) {
  const d = rtl ? 'rtl' : 'ltr', align = rtl ? 'right' : 'left';
  const police = rtl ? "Tahoma, 'Geeza Pro', Arial, sans-serif" : 'Helvetica, Arial, sans-serif';
  return `<!doctype html><html lang="${rtl ? 'ar' : 'fr'}" dir="${d}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>${echapper(titre)}</title></head>
<body style="margin:0;padding:0;background:#EEF4F1">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF4F1"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:18px;overflow:hidden">
  <tr><td style="background:#0F2747;padding:22px 28px;text-align:${align}" dir="${d}">
    <svg width="26" height="31" viewBox="0 0 40 48" style="vertical-align:middle"><path d="M2 46V20.5C2 11.6 9.9 5.8 20 2C30.1 5.8 38 11.6 38 20.5V46Z" fill="none" stroke="#FFFFFF" stroke-width="2.4"/></svg>
    <span style="font:20px Georgia,serif;color:#FFFFFF;vertical-align:middle;margin:0 8px">Sakîna</span><span style="font:20px Tahoma,serif;color:#A8DCD5;vertical-align:middle">سكينة</span>
  </td></tr>
  <tr><td style="padding:28px;font:16px/1.65 ${police};color:#14202E;text-align:${align}" dir="${d}">
    ${titre ? `<h1 style="margin:0 0 16px;font:22px/1.3 ${rtl ? police : 'Georgia,serif'};color:#0F2747">${echapper(titre)}</h1>` : ''}
    ${lignes.filter(Boolean).map(l => `<p style="margin:0 0 14px">${echapper(l).replace(/\n/g, '<br>')}</p>`).join('')}
    ${lien ? `<p style="margin:22px 0 6px"><a href="${echapper(lien)}" style="display:inline-block;padding:12px 22px;background:#1F4E9C;color:#FFFFFF;border-radius:18px 18px 10px 10px;text-decoration:none;font-weight:bold">${echapper(bouton)}</a></p>` : ''}
  </td></tr>
  <tr><td style="padding:16px 28px;border-top:1px solid #DCEAE6;font:13px/1.5 ${police};color:#46546A;text-align:${align}" dir="${d}">${echapper(pied)}</td></tr>
</table></td></tr></table></body></html>`;
}

export async function envoyer(env, { a, sujet, lignes = [], lien, libelleLien, commande, rtl = false, titre, pied }) {
  if (!a) return false;
  const html = rendre({ rtl, titre, lignes, lien, bouton: libelleLien, pied: pied ?? 'Sakîna · سكينة' });
  if (!env.BREVO_API_KEY || !env.EXPEDITEUR_EMAIL) {
    if (commande) await journal(env, commande, 'courriel_non_envoye', { a, sujet });
    return false;
  }
  const r = await fetch(env.BREVO_API || 'https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': env.BREVO_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ sender: { email: env.EXPEDITEUR_EMAIL, name: env.EXPEDITEUR_NOM || 'Sakîna' }, to: [{ email: a }], subject: sujet, htmlContent: html,
      textContent: [titre, ...lignes, lien ? `${libelleLien} : ${lien}` : ''].filter(Boolean).join('\n\n') }),
  });
  if (commande) await journal(env, commande, r.ok ? 'courriel' : 'courriel_echec', { a, sujet, statut: r.status });
  return r.ok;
}

// ------------------------------------------------------------------ messages au client

const euros = (c, ar) => (c / 100).toLocaleString(ar ? 'ar' : 'fr-FR', { style: 'currency', currency: 'EUR' });
const quoi = (c, ar) => `${nomPiece(c.produit, c.ceremonie, ar ? 'ar' : 'fr')} · ${estLivret(c.produit) ? `${c.pages} ${ar ? 'صفحة' : 'pages'} · ` : ''}${c.quantite} ${ar ? 'نسخة' : 'exemplaires'}`;

/** Ce que l'on écrit au client à chaque étape. x : { message, suivi_colis, remarque }. */
export const MESSAGES = {
  devis_recu: {
    fr: (c) => ({ sujet: `Votre demande de devis ${c.id}`, titre: 'Votre demande est bien reçue', bouton: 'Suivre ma demande',
                  lignes: [`Bonjour ${c.nom},`, `Nous avons bien reçu votre demande : ${quoi(c)}.`, 'Nous vous écrivons très vite avec un prix. Vous pourrez ensuite régler en ligne depuis votre page de suivi.'] }),
    ar: (c) => ({ sujet: `طلب عرض السعر ${c.id}`, titre: 'وصلنا طلبكم', bouton: 'متابعة الطلب',
                  lignes: [`السلام عليكم ${c.nom}،`, `وصلنا طلبكم: ${quoi(c, true)}.`, 'سنرسل إليكم السعر قريبًا، ثم يمكنكم الدفع من صفحة المتابعة.'] }),
  },
  paiement_confirme: {
    fr: (c) => ({ sujet: `Commande ${c.id} confirmée`, titre: 'Merci, votre commande est confirmée', bouton: 'Suivre ma commande',
                  lignes: [`Bonjour ${c.nom},`, `Votre paiement de ${euros((c.montant || 0) + (c.livraison || 0))} est bien reçu pour : ${quoi(c)}.`,
                           'Nous préparons maintenant l’épreuve et vous l’envoyons par e-mail. Rien ne sera imprimé avant votre accord.'] }),
    ar: (c) => ({ sujet: `تأكيد الطلب ${c.id}`, titre: 'جزاكم الله خيرًا، تأكّد طلبكم', bouton: 'متابعة الطلب',
                  lignes: [`السلام عليكم ${c.nom}،`, `وصلنا دفعكم بمبلغ ${euros((c.montant || 0) + (c.livraison || 0), true)} مقابل: ${quoi(c, true)}.`,
                           'نُعدّ الآن نسخة المراجعة ونرسلها إليكم بالبريد. لن يُطبع شيءٌ قبل موافقتكم.'] }),
  },
  epreuve: {
    fr: (c, x) => ({ sujet: `${c.id} · votre épreuve est prête`, titre: 'Votre épreuve est prête', bouton: 'Voir et valider l’épreuve',
                     lignes: [`Bonjour ${c.nom},`, 'Voici l’épreuve de votre pièce. Relisez chaque page, et faites relire les versets par votre imam si ce n’est pas déjà fait.',
                              x.message, 'Validez-la, ou dites-nous ce qu’il faut corriger : nous n’imprimons rien avant votre accord.'] }),
    ar: (c, x) => ({ sujet: `${c.id} · نسخة المراجعة جاهزة`, titre: 'نسخة المراجعة جاهزة', bouton: 'عرض النسخة والموافقة عليها',
                     lignes: [`السلام عليكم ${c.nom}،`, 'هذه نسخة المراجعة لقطعتكم. راجعوا كلّ صفحة، واعرضوا الآيات على إمامكم إن لم تفعلوا بعد.',
                              x.message, 'وافقوا عليها أو أخبرونا بما يُعدَّل: لا نطبع شيئًا قبل موافقتكم.'] }),
  },
  rappel_epreuve: {
    fr: (c) => ({ sujet: `${c.id} · votre épreuve attend votre accord`, titre: 'Votre épreuve attend votre accord', bouton: 'Voir l’épreuve',
                  lignes: [`Bonjour ${c.nom},`, 'Votre épreuve est prête depuis quelques jours. Tant qu’elle n’est pas validée, nous ne pouvons pas lancer l’impression.',
                           'Un détail à changer ? Écrivez-le directement sur la page de l’épreuve.'] }),
    ar: (c) => ({ sujet: `${c.id} · نسخة المراجعة بانتظار موافقتكم`, titre: 'نسخة المراجعة بانتظار موافقتكم', bouton: 'عرض النسخة',
                  lignes: [`السلام عليكم ${c.nom}،`, 'نسخة المراجعة جاهزة منذ أيام. ولا نستطيع بدء الطباعة قبل موافقتكم.', 'تريدون تعديل شيء؟ اكتبوه في صفحة النسخة مباشرة.'] }),
  },
  epreuve_validee: {
    fr: (c) => ({ sujet: `${c.id} · épreuve validée`, titre: 'Épreuve validée, merci', bouton: 'Suivre ma commande',
                  lignes: [`Bonjour ${c.nom},`, 'Votre accord est bien reçu. Votre pièce part à l’impression ; vous recevrez un e-mail à l’expédition, avec le numéro de suivi.'] }),
    ar: (c) => ({ sujet: `${c.id} · تمّت الموافقة على النسخة`, titre: 'تمّت الموافقة، جزاكم الله خيرًا', bouton: 'متابعة الطلب',
                  lignes: [`السلام عليكم ${c.nom}،`, 'وصلتنا موافقتكم. تذهب قطعتكم إلى الطباعة، وتصلكم رسالةٌ عند الشحن مع رقم التتبّع.'] }),
  },
  corrections_recues: {
    fr: (c, x) => ({ sujet: `${c.id} · vos corrections`, titre: 'Vos corrections sont bien reçues', bouton: 'Suivre ma commande',
                     lignes: [`Bonjour ${c.nom},`, 'Nous avons bien reçu vos remarques :', x.remarque, 'Nous vous envoyons une nouvelle épreuve très vite.'] }),
    ar: (c, x) => ({ sujet: `${c.id} · تعديلاتكم`, titre: 'وصلتنا تعديلاتكم', bouton: 'متابعة الطلب',
                     lignes: [`السلام عليكم ${c.nom}،`, 'وصلتنا ملاحظاتكم:', x.remarque, 'سنرسل إليكم نسخةً جديدة قريبًا.'] }),
  },
  devis_pret: {
    fr: (c, x) => ({ sujet: `${c.id} · le prix de votre demande`, titre: 'Le prix de votre demande', bouton: 'Voir et régler',
                     lignes: [`Bonjour ${c.nom},`, `Pour ${quoi(c)}, le prix est de ${euros(c.montant || 0)} TTC${c.livraison != null ? `, plus ${euros(c.livraison)} de livraison` : ''}.`,
                              x.message, 'Vous pouvez régler en ligne depuis votre page de suivi ; nous préparons ensuite l’épreuve.'] }),
    ar: (c, x) => ({ sujet: `${c.id} · سعر طلبكم`, titre: 'سعر طلبكم', bouton: 'العرض والدفع',
                     lignes: [`السلام عليكم ${c.nom}،`, `سعر ${quoi(c, true)}: ${euros(c.montant || 0, true)} شامل الضريبة${c.livraison != null ? `، يُضاف إليه ${euros(c.livraison, true)} للتوصيل` : ''}.`,
                              x.message, 'يمكنكم الدفع من صفحة المتابعة، ثم نُعدّ نسخة المراجعة.'] }),
  },
  en_impression: {
    fr: (c, x) => ({ sujet: `${c.id} · en impression`, titre: 'Votre pièce est en impression', bouton: 'Suivre ma commande',
                     lignes: [`Bonjour ${c.nom},`, 'Votre pièce est chez l’imprimeur. Nous vous écrivons dès son expédition.', x.message] }),
    ar: (c, x) => ({ sujet: `${c.id} · قيد الطباعة`, titre: 'قطعتكم قيد الطباعة', bouton: 'متابعة الطلب',
                     lignes: [`السلام عليكم ${c.nom}،`, 'قطعتكم لدى المطبعة، ونكتب إليكم عند شحنها.', x.message] }),
  },
  expediee: {
    fr: (c, x) => ({ sujet: `${c.id} · expédiée`, titre: 'Votre commande est en route', bouton: 'Suivre ma commande',
                     lignes: [`Bonjour ${c.nom},`, 'Votre commande vient d’être expédiée.', (x.suivi_colis || c.suivi_colis) ? `Numéro de suivi : ${x.suivi_colis || c.suivi_colis}` : '',
                              x.message, 'Qu’elle accompagne un beau moment, in shâ’ Allâh.'] }),
    ar: (c, x) => ({ sujet: `${c.id} · تمّ الشحن`, titre: 'طلبكم في الطريق', bouton: 'متابعة الطلب',
                     lignes: [`السلام عليكم ${c.nom}،`, 'تمّ شحن طلبكم.', (x.suivi_colis || c.suivi_colis) ? `رقم التتبّع: ${x.suivi_colis || c.suivi_colis}` : '',
                              x.message, 'جعلها الله رفيقةَ لحظةٍ طيّبة.'] }),
  },
  annulee: {
    fr: (c, x) => ({ sujet: `${c.id} · commande annulée`, titre: 'Votre commande est annulée', bouton: 'Voir ma commande',
                     lignes: [`Bonjour ${c.nom},`, 'Votre commande est annulée. Si vous aviez payé, le remboursement suit sur votre carte.', x.message, 'Pour toute question, répondez à ce message.'] }),
    ar: (c, x) => ({ sujet: `${c.id} · أُلغي الطلب`, titre: 'أُلغي طلبكم', bouton: 'عرض الطلب',
                     lignes: [`السلام عليكم ${c.nom}،`, 'أُلغي طلبكم. وإن كنتم دفعتم، فسيُردّ المبلغ إلى بطاقتكم.', x.message, 'لأيّ سؤال، ردّوا على هذه الرسالة.'] }),
  },
};

/** Le message d'une étape, prêt à envoyer (ou à prévisualiser). */
export function message(type, c, x = {}, base = '') {
  const ar = c.langue_site === 'ar';
  const m = MESSAGES[type][ar ? 'ar' : 'fr'](c, x);
  return { ...m, rtl: ar, lien: `${base}/${ar ? 'ar/' : ''}suivi.html?c=${c.id}&j=${c.jeton}`,
           pied: ar ? `الطلب ${c.id} · سكينة` : `Commande ${c.id} · Sakîna` };
}

export async function ecrireAuClient(env, request, c, type, x = {}) {
  const m = message(type, c, x, site(env, request));
  return envoyer(env, { a: c.email, commande: c.id, rtl: m.rtl, sujet: m.sujet, titre: m.titre, lignes: m.lignes, lien: m.lien, libelleLien: m.bouton, pied: m.pied });
}
