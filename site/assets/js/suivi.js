/* Sakîna : page de suivi d'une commande (lien personnel : suivi.html?c=SK-…&j=…).
 * Montre où en est la commande, permet de payer une pièce sur devis et de valider l'épreuve. */
(() => {
  const AR = document.getElementById('suivi').dataset.langueSite === 'ar';
  const q = new URLSearchParams(location.search), id = q.get('c'), j = q.get('j');
  const $ = s => document.getElementById(s);
  const chiffres = x => AR ? String(x).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : String(x);
  const euros = c => (c / 100).toLocaleString(AR ? 'ar' : 'fr-FR', { style: 'currency', currency: 'EUR' });
  const T = AR ? {
    introuvable: 'لم نجد هذا الطلب. تحقّقوا من الرابط الذي وصلكم بالبريد.', intro: n => `الطلب ${n}`, paye: 'وصلنا دفعكم، جزاكم الله خيرًا.',
    devis: 'بعرض سعر', ttc: 'شامل الضريبة', ex: n => `${chiffres(n)} نسخة`, pages: n => `${chiffres(n)} صفحة`,
    etapes: ['استلام الطلب', 'الدفع', 'نسخة المراجعة', 'الموافقة', 'الطباعة', 'الشحن'], valide: 'شكرًا، تمّت الموافقة. ننتقل إلى الطباعة.',
    corrige: 'وصلتنا ملاحظاتكم: سنرسل نسخةً جديدة.', erreur: 'حدث خطأ، أعيدوا المحاولة.', colis: 'رقم التتبّع: ',
  } : {
    introuvable: 'Nous ne trouvons pas cette commande. Vérifiez le lien reçu par e-mail.', intro: n => `Commande ${n}`, paye: 'Votre paiement est bien reçu, merci.',
    devis: 'Sur devis', ttc: 'TTC', ex: n => `${n} exemplaires`, pages: n => `${n} pages`,
    etapes: ['Commande reçue', 'Paiement', 'Épreuve', 'Validation', 'Impression', 'Expédition'], valide: 'Merci, l’épreuve est validée : nous passons à l’impression.',
    corrige: 'Vos remarques sont bien reçues : nous vous envoyons une nouvelle épreuve.', erreur: 'Une erreur est survenue, réessayez.', colis: 'Numéro de suivi : ',
  };
  // Rang de chaque statut sur la frise des étapes.
  const RANG = { devis_demande: 0, attente_paiement: 0, abandonnee: 0, payee: 1, epreuve_envoyee: 2, corrections: 2, epreuve_validee: 3, en_impression: 4, expediee: 5 };
  const api = (corps) => fetch(`/api/commandes/${encodeURIComponent(id)}?j=${encodeURIComponent(j)}`, corps ? {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) } : undefined)
    .then(async r => ({ ok: r.ok, d: await r.json().catch(() => ({})) }));

  function lienPiece(etat) {
    const utf8 = new TextEncoder().encode(JSON.stringify(etat));
    let b = ''; utf8.forEach(o => { b += String.fromCharCode(o); });
    return `composer.html?lecture=1#l=${btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
  }

  function afficher(c) {
    $('suivi-intro').textContent = T.intro(c.id) + (q.get('paye') && c.statut === 'payee' ? ' · ' + T.paye : '');
    $('suivi-contenu').hidden = false;
    $('suivi-statut').textContent = c.libelle[AR ? 'ar' : 'fr'];
    const livret = c.etat && (!c.etat.p || ['livret', 'pelerin', 'nuits', 'priere_aid', 'prenom', 'condoleances'].includes(c.etat.p));
    $('suivi-piece').textContent = `${c.piece[AR ? 'ar' : 'fr']} · ${livret ? T.pages(c.pages) + ' · ' : ''}${T.ex(c.quantite)}`;
    $('suivi-prix').textContent = c.montant == null ? T.devis : `${euros(c.montant + (c.livraison || 0))} ${T.ttc}` + (c.suivi_colis ? ` · ${T.colis}${c.suivi_colis}` : '');
    const rang = RANG[c.statut] ?? -1;
    $('suivi-etapes').innerHTML = T.etapes.map((e, i) => `<li class="${i < rang ? 'faite' : i === rang ? 'courante' : ''}">${e}</li>`).join('');
    $('suivi-etapes').hidden = c.statut === 'annulee';
    $('suivi-payer').hidden = !(['attente_paiement', 'abandonnee'].includes(c.statut) && c.montant != null);
    $('suivi-epreuve').hidden = c.statut !== 'epreuve_envoyee';
    $('voir-epreuve').href = lienPiece(c.etat);
  }

  async function charger() {
    if (!id || !j) { $('suivi-intro').textContent = T.introuvable; return; }
    const { ok, d } = await api().catch(() => ({ ok: false, d: {} }));
    if (!ok) { $('suivi-intro').textContent = T.introuvable; return; }
    afficher(d);
  }

  async function agir(corps, bouton, reussi) {
    bouton.disabled = true;
    const { ok, d } = await api(corps).catch(() => ({ ok: false, d: {} }));
    bouton.disabled = false;
    if (!ok) { $('suivi-message').textContent = d.erreur || T.erreur; return null; }
    if (reussi) $('suivi-message').textContent = reussi;
    return d;
  }
  $('valider').addEventListener('click', async e => { if (await agir({ action: 'valider' }, e.currentTarget, T.valide)) charger(); });
  $('corriger').addEventListener('click', async e => {
    if (await agir({ action: 'corriger', remarque: $('remarque').value }, e.currentTarget, T.corrige)) { $('remarque').value = ''; charger(); }
  });
  $('payer').addEventListener('click', async e => { const d = await agir({ action: 'payer' }, e.currentTarget); if (d && d.url) location.href = d.url; });
  charger();
})();
