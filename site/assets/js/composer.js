/* Compositeur Sakîna : une pièce composée question par question.
 *
 * Deux familles de pièces (voir modeles.py) : les livrets A5 agrafés (livret de
 * cérémonie, carnet du pèlerin, 30 nuits…) et la papeterie à une ou deux faces
 * (faire-part, menu, marque-page…). Les données (versets, cérémonies, modèles,
 * gabarits de couverture) viennent de donnees.js, généré par build.py. L'état
 * est gardé dans le navigateur et peut être partagé par lien (#l=…), pour le
 * faire relire. L'impression (PDF) passe par le navigateur, une face par feuille.
 */
(() => {
  const D = window.SAKINA;
  const SITE = document.querySelector('.composer').dataset.langueSite; // 'fr' | 'ar'
  const form = document.getElementById('compo-form');
  const apercu = document.getElementById('apercu');
  const CLE = 'sakina-livret';
  const MM = 96 / 25.4;

  const UI = {
    fr: {
      pages: n => `${n} pages`, conseille: 'conseillé', copie: 'Lien copié : envoyez-le à votre imam pour relecture.',
      copieManuelle: 'Copiez ce lien :', voirTous: 'Voir toute la bibliothèque', voirMoins: 'Seulement les textes de la cérémonie',
      monter: 'Monter', descendre: 'Descendre', supprimer: 'Supprimer', titreFr: 'Titre (français)', texteFr: 'Texte (français)',
      titreAr: 'Titre (arabe)', texteAr: 'Texte (arabe)', imprimer: 'Une fenêtre s’ouvre : comme destination, prenez le PDF, et réglez les marges sur « aucune ».',
      sujet: 'Demande d’impression', corps: 'Bonjour,\n\nJe souhaite faire imprimer ce livret :\n',
      noms: 'Noms', lieu: 'Mosquée, salle…', faces: n => n > 1 ? 'recto verso' : 'une face',
      bientot: 'La commande en ligne ouvre bientôt. En attendant, enregistrez le PDF ou copiez le lien.',
      envoi: 'Envoi de la commande…', erreur: 'La commande n’a pas pu être envoyée. Réessayez dans un instant.',
      ex: n => `${n} exemplaires`, unite: p => `soit ${p} la pièce`, ttc: 'TTC, hors livraison', devis: 'Au-delà de 24 pages : sur devis.', devisCarte: 'Prix sur devis pour cette pièce : demandez-le, la réponse vient vite.',
    },
    ar: {
      pages: n => `${chiffres(n)} ${n >= 3 && n <= 10 ? 'صفحات' : 'صفحة'}`,   // accord du nombre en arabe
      conseille: 'مقترح', copie: 'نُسخ الرابط: أرسلوه إلى إمامكم للمراجعة.',
      copieManuelle: 'انسخ هذا الرابط:', voirTous: 'عرض المكتبة كاملة', voirMoins: 'نصوص المناسبة فقط',
      monter: 'إلى الأعلى', descendre: 'إلى الأسفل', supprimer: 'حذف', titreFr: 'العنوان (بالفرنسية)', texteFr: 'النص (بالفرنسية)',
      titreAr: 'العنوان (بالعربية)', texteAr: 'النص (بالعربية)', imprimer: 'تُفتح نافذة: اختر PDF وجهةً، واضبط الهوامش على «بلا».',
      sujet: 'طلب طباعة', corps: 'السلام عليكم،\n\nأرغب في طباعة هذا الكتيّب:\n',
      noms: 'الأسماء', lieu: 'المسجد، القاعة…', faces: n => n > 1 ? 'على الوجهين' : 'وجهٌ واحد',
      bientot: 'الطلب عبر الإنترنت قريبًا. إلى ذلك الحين، احفظوا ملف PDF أو انسخوا الرابط.',
      envoi: 'جارٍ إرسال الطلب…', erreur: 'تعذّر إرسال الطلب. أعيدوا المحاولة بعد قليل.',
      ex: n => `${chiffres(n)} نسخة`, unite: p => `أي ${p} للقطعة الواحدة`, ttc: 'شامل الضريبة، دون التوصيل', devis: 'أكثر من ٢٤ صفحة: بعرض سعر.', devisCarte: 'سعر هذه القطعة بعرضٍ خاص: اطلبوه وسنجيبكم سريعًا.',
    },
  }[SITE];

  // Titres des sections du livret, dans la langue du livret.
  const T = {
    accueil: ['As-salâmu ‘alaykum', 'السلام عليكم'],
    deroule: ['Le fil de la cérémonie', 'سير الحفل'],
    textes: ['Versets et invocations', 'آيات وأدعية'],
    fin: ['Jazâkumu-llâhu khayran', 'جزاكم الله خيرًا'],
    nuits: ['Les trente nuits', 'الليالي الثلاثون'],
    dix: ['Les dix dernières nuits', 'العشر الأواخر'],
    menu: ['Menu', 'قائمة الطعام'],
    mention_carte: ['Cette carte porte un verset du Coran : merci de la conserver, ou de la confier à un recyclage respectueux.',
                    'تحمل هذه البطاقة آيةً من القرآن الكريم: يُرجى حفظها أو التخلّص منها بطريقة لائقة.'],
    mention: ['Ce livret contient des versets du Coran et le nom de Dieu : merci de le conserver, ou de le confier à un recyclage respectueux.',
              'يتضمّن هذا الكتيّب آياتٍ من القرآن الكريم واسمَ الله: يُرجى حفظه أو التخلّص منه بطريقة لائقة.'],
  };
  const DATE = { fr: 'Samedi 14 juin 2027', ar: 'السبت ١٤ يونيو ٢٠٢٧' };

  function chiffres(x) { return String(x).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]); }
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const arabe = s => /[؀-ۿ]/.test(s || '');
  // Brouillon gardé dans ce navigateur seulement (absent en navigation privée).
  function brouillon() { try { const v = window.localStorage[CLE]; return v ? JSON.parse(v) : null; } catch (e) { return null; } }
  function garder(v) { try { window.localStorage[CLE] = JSON.stringify(v); } catch (e) { /* stockage indisponible */ } }

  // ------------------------------------------------------------------ état

  /** Pièces proposées pour une cérémonie, dans l'ordre des modèles. */
  const piecesDe = c => Object.keys(D.modeles).filter(k => D.modeles[k].ceremonies.includes(c));
  const modele = () => D.modeles[etat.p] || D.modeles.livret;
  const estCarte = () => modele().famille === 'carte';
  /** Textes proposés par défaut, avant les « {noms} » : ceux du modèle, sinon ceux de la cérémonie. */
  function proposes(p, c) {
    const M = D.modeles[p], C = D.ceremonies[c];
    const paire = (M.a_par && M.a_par[c]) || M.a;
    const occ = D.occasions[c] || ['', ''];
    return {
      titre: M.t ? M.t : [C.titre_fr, C.titre_ar],
      accueil: paire ? [paire[0].split('{occasion}').join(occ[0]), paire[1].split('{occasion}').join(occ[1])] : [C.accueil_fr, C.accueil_ar],
      fin: M.f ? M.f : [C.fin_fr, C.fin_ar],
      textes: M.x || C.textes,
      coches: (M.x || C.textes).slice(0, M.n ?? C.defaut),
      deroule: M.d ? M.d.map(([f, a]) => ({ fr_t: f[0], fr_d: f[1], ar_t: a[0], ar_d: a[1] })) : C.deroule,
      avec_deroule: M.avec_deroule ?? (M.famille === 'livret' && c !== 'janaza'),
    };
  }

  function defaut(c, base = {}) {
    const C = D.ceremonies[c];
    const p = base.p && D.modeles[base.p] && D.modeles[base.p].ceremonies.includes(c) ? base.p : 'livret';
    const M = D.modeles[p], P = proposes(p, c);
    const langue = base.langue || (SITE === 'ar' ? 'ar' : 'bi');
    const genre = C.genre || 'm';
    return {
      c, p, m: C.motif, langue, translit: base.translit ?? langue !== 'ar', genre,
      noms: langue === 'ar' ? C.noms_ar : C.noms, titre: langue === 'ar' ? P.titre[1] : P.titre[0], phrase: C.phrase,
      date: langue === 'ar' ? DATE.ar : DATE.fr, lieu: '',
      basmala: M.famille === 'livret' && c !== 'henne' && c !== 'khitan',
      accueil_fr: P.accueil[0], accueil_ar: P.accueil[1],
      fin_fr: P.fin[0], fin_ar: (genre === 'f' && !M.f && C.fin_ar_f) || P.fin[1],
      avec_deroule: P.avec_deroule, deroule: P.deroule.map(e => ({ ...e })),
      textes: P.coches.slice(), mention: true, libres: M.libres ? M.libres.defaut : 0,
      quantite: base.quantite,
    };
  }

  function depuisLien() {
    const m = location.hash.match(/^#l=([\w-]+)/);
    if (!m) return null;
    try {
      const b = atob(m[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(new TextDecoder().decode(Uint8Array.from(b, ch => ch.charCodeAt(0))));
    } catch (e) { return null; }
  }

  function versLien(etat) {
    const utf8 = new TextEncoder().encode(JSON.stringify(etat));
    let b = ''; utf8.forEach(o => { b += String.fromCharCode(o); });
    return location.origin + location.pathname + '#l=' + btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  const params = new URLSearchParams(location.search);
  let etat = depuisLien();
  if (!etat || !D.ceremonies[etat.c]) {
    const dejaSaisi = brouillon();
    const c = D.ceremonies[params.get('c')] ? params.get('c') : (dejaSaisi && D.ceremonies[dejaSaisi.c] ? dejaSaisi.c : D.ordre[0]);
    const p = D.modeles[params.get('p')] ? params.get('p') : null;
    const memeChose = dejaSaisi && dejaSaisi.c === c && (!p || p === (dejaSaisi.p || 'livret'));
    etat = memeChose && !params.get('m') ? dejaSaisi : defaut(c, { ...(dejaSaisi || {}), p: p || (dejaSaisi && dejaSaisi.p) });
    if (D.motifs[params.get('m')]) etat.m = params.get('m');
  }
  // Brouillons et liens d'avant les modèles : c'était un livret de cérémonie.
  if (!D.modeles[etat.p] || !D.modeles[etat.p].ceremonies.includes(etat.c)) etat.p = 'livret';
  if (etat.libres == null) etat.libres = modele().libres ? modele().libres.defaut : 0;
  let tousLesTextes = false;

  // ------------------------------------------------------------------ formulaire

  const ARABE_CEREMONIE = { nikah: 'نكاح', aqiqa: 'عقيقة', khitan: 'ختان', khatm: 'ختم القرآن', hajj: 'حج', ramadan: 'رمضان', aid: 'عيد', henne: 'حناء', janaza: 'جنازة' };
  function dessinerOccasions() {
    document.getElementById('f-ceremonie').innerHTML = D.ordre.map(id => `
      <label class="occasion"><input type="radio" name="ceremonie" value="${id}"${id === etat.c ? ' checked' : ''}>
        <span class="occasion-ar" lang="ar">${ARABE_CEREMONIE[id]}</span>
        <span class="occasion-nom">${esc(D.ceremonies[id][SITE === 'ar' ? 'nom_ar' : 'nom_fr'])}</span></label>`).join('');
  }

  /** Vignette d'une pièce : sa forme à l'échelle (livret, carte, menu, rond, marque-page), aux couleurs du motif choisi. */
  function vignette(k) {
    const M = D.modeles[k], g = D.motifs[etat.m] || D.motifs[D.ceremonies[etat.c].motif];
    const [l, h] = M.format, e = 40 / Math.max(l, h), w = l * e, H = h * e, x = (48 - w) / 2, y = (44 - H) / 2;
    const fond = M.famille === 'carte' && k === 'certificat' ? '#FFFFFF' : g.fond;
    let forme;
    if (M.rond) forme = `<circle cx="24" cy="22" r="${w / 2}" fill="${g.fond}" stroke="${g.trait}" stroke-width=".8"/><circle cx="24" cy="22" r="${w / 2 - 3}" fill="none" stroke="${g.trait}" stroke-width=".4"/>`;
    else {
      const ax = k === 'certificat' ? x + 3 : x + w * .16, aw = k === 'certificat' ? w * .34 : w * .68, ah = k === 'menu' ? H * .42 : H * .78;
      forme = (M.famille === 'livret' ? `<rect x="${x + 2.4}" y="${y + 1.6}" width="${w}" height="${H}" rx="1" fill="#FFFFFF" stroke="${g.trait}" stroke-width=".4" opacity=".8"/>` : '')
        + `<rect x="${x}" y="${y}" width="${w}" height="${H}" rx="1" fill="${fond}" stroke="${g.trait}" stroke-width=".5"/>`
        + `<path d="${arcBrise(ax, y + H * .1, aw, ah)}" fill="${k === 'certificat' ? g.fond : 'none'}" stroke="${g.trait}" stroke-width=".7"/>`
        + (k === 'menu' || k === 'certificat' ? [0, 1, 2].map(i => `<line x1="${k === 'certificat' ? x + w * .5 : x + w * .25}" x2="${x + w * .85}" y1="${y + H * (k === 'menu' ? .62 : .35) + i * 3.4}" y2="${y + H * (k === 'menu' ? .62 : .35) + i * 3.4}" stroke="${g.trait}" stroke-width=".5" opacity=".7"/>`).join('') : '');
    }
    return `<svg class="piece-vignette" viewBox="0 0 48 44" aria-hidden="true">${forme}</svg>`;
  }

  function dessinerPieces() {
    const M = k => D.modeles[k], ar = SITE === 'ar';
    const html = fam => piecesDe(etat.c).filter(k => M(k).famille === fam).map(k => `
      <label class="piece"><input type="radio" name="p" value="${k}"${k === etat.p ? ' checked' : ''}>${vignette(k)}
        <span class="piece-nom">${esc(ar ? M(k).nom_ar : M(k).nom_fr)}</span>
        <span class="piece-court">${esc(ar ? M(k).court_ar : M(k).court_fr)}</span></label>`).join('');
    document.getElementById('f-pieces-livrets').innerHTML = html('livret');
    const cartes = html('carte');
    document.getElementById('f-pieces-cartes').innerHTML = cartes;
    document.getElementById('f-pieces-cartes').previousElementSibling.hidden = !cartes;
  }

  function couverture(cle, e) {
    const g = D.motifs[cle];
    const boite = document.createElement('div');
    boite.innerHTML = g.svg
      .replace('@@PHRASE@@', esc(e.phrase)).replace('@@TAILLE@@', e.phrase.length > 14 ? 11 : 15)
      .replace('@@TITRE@@', esc(e.titre)).replace('@@NOMS@@', esc(e.noms)).replace('@@DATE@@', esc(e.date));
    // Marcellus et Manrope n'ont pas de glyphes arabes : on passe en Amiri, un peu plus grand.
    const arabiser = (classe, taille) => {
      const t = boite.querySelector('.' + classe);
      if (t && arabe(t.textContent)) { t.setAttribute('font-family', 'Amiri, serif'); t.setAttribute('font-size', taille); }
    };
    arabiser('c-titre', 7.5); arabiser('c-noms', 14); arabiser('c-date', 5.4);
    return boite.innerHTML;
  }

  function dessinerMotifs() {
    const C = D.ceremonies[etat.c];
    const ordre = [...C.motifs, ...Object.keys(D.motifs).filter(k => !C.motifs.includes(k))];
    document.getElementById('f-motifs').innerHTML = ordre.map(k => `
      <label class="choix-motif">
        <input type="radio" name="m" value="${k}"${k === etat.m ? ' checked' : ''}>
        <span class="choix-motif-couv">${couverture(k, etat)}</span>
        <span class="choix-motif-nom">${esc(D.motifs[k][SITE === 'ar' ? 'nom_ar' : 'nom_fr'])}${C.motifs.includes(k) ? ` <em>${UI.conseille}</em>` : ''}</span>
      </label>`).join('');
  }

  function dessinerDeroule() {
    const fr = etat.langue !== 'ar', ar = etat.langue !== 'fr';
    document.getElementById('f-deroule').innerHTML = etat.deroule.map((e, i) => `
      <div class="etape-edition" data-i="${i}">
        <div class="etape-outils">
          <span>${SITE === 'ar' ? chiffres(i + 1) : i + 1}</span>
          <button type="button" data-action="haut" aria-label="${UI.monter}"${i === 0 ? ' disabled' : ''}>↑</button>
          <button type="button" data-action="bas" aria-label="${UI.descendre}"${i === etat.deroule.length - 1 ? ' disabled' : ''}>↓</button>
          <button type="button" data-action="suppr" aria-label="${UI.supprimer}">✕</button>
        </div>
        ${fr ? `<input data-champ="fr_t" value="${esc(e.fr_t)}" aria-label="${UI.titreFr}" lang="fr" dir="ltr" placeholder="${UI.titreFr}">
        <textarea data-champ="fr_d" rows="2" aria-label="${UI.texteFr}" lang="fr" dir="ltr" placeholder="${UI.texteFr}">${esc(e.fr_d)}</textarea>` : ''}
        ${ar ? `<input data-champ="ar_t" value="${esc(e.ar_t)}" aria-label="${UI.titreAr}" lang="ar" dir="rtl" placeholder="${UI.titreAr}">
        <textarea data-champ="ar_d" rows="2" aria-label="${UI.texteAr}" lang="ar" dir="rtl" placeholder="${UI.texteAr}">${esc(e.ar_d)}</textarea>` : ''}
      </div>`).join('');
    document.getElementById('f-deroule').hidden = !etat.avec_deroule;
    document.getElementById('ajout-etape').hidden = !etat.avec_deroule;
  }

  function listeTextes() {
    const propres = proposes(etat.p, etat.c).textes;
    const autres = Object.keys(D.textes).filter(k => !propres.includes(k));
    // Un texte coché hors de la cérémonie reste visible.
    return tousLesTextes ? [...propres, ...autres] : [...propres, ...autres.filter(k => etat.textes.includes(k))];
  }

  function dessinerTextes() {
    document.getElementById('f-textes').innerHTML = listeTextes().map(k => {
      const x = D.textes[k];
      return `<label class="texte-choix"><input type="checkbox" name="texte" value="${k}"${etat.textes.includes(k) ? ' checked' : ''}>
        <span><span class="texte-ar" lang="ar" dir="rtl">${esc(x.ar.split(/[﴿،]/)[0])}</span>
        <small>${esc(SITE === 'ar' ? x.ref_ar : x.ref_fr)}</small></span></label>`;
    }).join('');
    document.getElementById('voir-tous').textContent = tousLesTextes ? UI.voirMoins : UI.voirTous;
  }

  function remplir() {
    dessinerOccasions();
    dessinerPieces();
    const C = D.ceremonies[etat.c], M = modele();
    for (const nom of ['noms', 'titre', 'phrase', 'date', 'lieu', 'accueil_fr', 'accueil_ar', 'fin_fr', 'fin_ar']) form.elements[nom].value = etat[nom];
    for (const nom of ['translit', 'basmala', 'avec_deroule', 'mention']) form.elements[nom].checked = !!etat[nom];
    form.querySelector(`[name="langue"][value="${etat.langue}"]`).checked = true;
    form.elements.lieu.placeholder = UI.lieu;
    document.getElementById('l-noms').textContent = SITE === 'ar' ? C.noms_label_ar : C.noms_label_fr;
    document.getElementById('champ-genre').hidden = etat.c !== 'janaza';
    const g = form.querySelector(`[name="genre"][value="${etat.genre}"]`); if (g) g.checked = true;
    form.querySelectorAll('.bloc-langue').forEach(b => {
      b.hidden = (b.dataset.pour === 'fr' && etat.langue === 'ar') || (b.dataset.pour === 'ar' && etat.langue === 'fr');
    });
    // Le « fil » change de sens selon la pièce : moments, gestes de la prière, plats du menu, fiche du prénom.
    const libD = M.titre_deroule ? M.titre_deroule[SITE === 'ar' ? 1 : 0] : (SITE === 'ar' ? 'شرح سير المناسبة' : 'Expliquer le fil de la cérémonie');
    document.getElementById('l-deroule').textContent = libD;
    const libres = document.getElementById('champ-libres');
    libres.hidden = !M.libres;
    if (M.libres) {
      const sel = form.elements.libres;
      sel.innerHTML = '';
      for (let n = M.libres.min; n <= M.libres.max; n += 2) sel.add(new Option(UI.pages(n), n));
      sel.value = String(etat.libres);
    }
    document.getElementById('nom-format').textContent = format();
    dessinerMotifs(); dessinerDeroule(); dessinerTextes();
    filtrerQuestions();
  }

  /** Format affiché au-dessus de l'aperçu. */
  function format() {
    const M = modele(), [l, h] = M.format;
    const mm = SITE === 'ar' ? `${chiffres(l)} × ${chiffres(h)} مم` : `${l} × ${h} mm`;
    if (M.famille === 'livret') return `A5 · ${mm}`;
    return `${M.rond ? (SITE === 'ar' ? 'قطر ' + chiffres(l) + ' مم' : 'Ø ' + l + ' mm') : mm} · ${UI.faces(M.faces)}`;
  }

  // ------------------------------------------------------------------ livret

  const remplace = s => String(s || '').split('{noms}').join(etat.noms);
  const SVG_KHATAM = '<svg class="lp-etoile" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1l2.6 3.7 4.4-.7-.7 4.4L20 10l-3.7 2.6.7 4.4-4.4-.7L10 20l-2.6-3.7-4.4.7.7-4.4L0 10l3.7-2.6-.7-4.4 4.4.7z"/></svg>';

  function titre(cle) {
    const [fr, ar] = Array.isArray(cle) ? cle.map(remplace) : T[cle];
    if (etat.langue === 'fr') return `<h2 class="lp-h">${fr}</h2>`;
    if (etat.langue === 'ar') return `<h2 class="lp-h" lang="ar">${ar}</h2>`;
    return `<h2 class="lp-h lp-h-bi"><span>${fr}</span><span lang="ar">${ar}</span></h2>`;
  }

  function paragraphes(fr, ar) {
    let h = '';
    if (etat.langue !== 'ar' && fr.trim()) h += `<p class="lp-p">${esc(remplace(fr))}</p>`;
    if (etat.langue !== 'fr' && ar.trim()) h += `<p class="lp-p lp-p-ar" lang="ar" dir="rtl">${esc(remplace(ar))}</p>`;
    return h;
  }

  function texte(k) {
    const x = D.textes[k], f = etat.genre === 'f' && x.ar_f ? '_f' : '';
    const ref = etat.langue === 'ar' ? x.ref_ar : x.ref_fr;
    return `<div class="lp-texte">
      <p class="lp-t-ar" lang="ar" dir="rtl">${esc(x['ar' + f] || x.ar)}</p>
      ${etat.translit ? `<p class="lp-t-tr" lang="fr">${esc(x['tr' + f] || x.tr)}</p>` : ''}
      ${etat.langue !== 'ar' ? `<p class="lp-t-fr">${esc(x['fr' + f] || x.fr)}</p>` : ''}
      <p class="lp-t-ref"${etat.langue === 'ar' ? ' lang="ar"' : ''}>${esc(ref)}</p></div>`;
  }

  function etape(e) {
    const fr = etat.langue !== 'ar', ar = etat.langue !== 'fr';
    return `<div class="lp-etape">
      <div class="lp-etape-t">${fr && e.fr_t ? `<span>${esc(e.fr_t)}</span>` : ''}${ar && e.ar_t ? `<span lang="ar" dir="rtl">${esc(e.ar_t)}</span>` : ''}</div>
      ${fr && e.fr_d ? `<p class="lp-etape-d">${esc(e.fr_d)}</p>` : ''}
      ${ar && e.ar_d ? `<p class="lp-etape-d" lang="ar" dir="rtl">${esc(e.ar_d)}</p>` : ''}</div>`;
  }

  /** Blocs de contenu, dans l'ordre ; « suite » = à garder avec le bloc suivant. */
  function contenuDuLivret() {
    const b = [];
    if (etat.basmala) b.push({ html: '<p class="lp-basmala" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>' });
    b.push({ html: titre('accueil'), suite: true });
    b.push({ html: paragraphes(etat.accueil_fr, etat.accueil_ar) });
    const infos = [etat.date, etat.lieu].filter(s => s.trim()).map(esc).join(' · ');
    if (infos) b.push({ html: `<p class="lp-infos">${infos}</p>` });
    const etapes = etat.deroule.filter(e => (e.fr_t + e.fr_d + e.ar_t + e.ar_d).trim());
    if (etat.avec_deroule && etapes.length) {
      b.push({ html: titre(modele().titre_deroule || 'deroule'), suite: true, saut: true });
      etapes.forEach(e => b.push({ html: etape(e) }));
    }
    const ks = listeTextes().filter(k => etat.textes.includes(k));
    if (ks.length) {
      b.push({ html: titre('textes'), suite: true, saut: true });
      ks.forEach((k, i) => b.push({ html: (i ? `<div class="lp-orn">${SVG_KHATAM}</div>` : '') + texte(k) }));
    }
    if (modele().nuits) {
      b.push({ html: titre('nuits'), suite: true, saut: true });
      D.juz.forEach((j, i) => {
        if (i === 20) {
          b.push({ html: titre('dix'), suite: true, saut: true });
          b.push({ html: texte('laylat_qadr'), suite: true });
        }
        b.push({ html: nuit(i + 1, j) });
      });
    }
    if ((etat.fin_fr + etat.fin_ar).trim()) {
      b.push({ html: `<div class="lp-orn lp-orn-fin">${SVG_KHATAM}</div>` + titre('fin'), suite: true, saut: true });
      b.push({ html: paragraphes(etat.fin_fr, etat.fin_ar) + `<p class="lp-signature">${esc(etat.noms)}</p>` });
    }
    return b;
  }

  const deux = (fr, ar) => etat.langue === 'fr' ? fr : etat.langue === 'ar' ? ar : `${fr} · <span lang="ar">${ar}</span>`;
  const CASES = [['Jeûne', 'الصيام'], ['Tarâwîh', 'التراويح'], ['Lecture', 'القراءة'], ['Aumône', 'الصدقة']];

  /** Une nuit de Ramadan : le juz' du jour, quatre cases à cocher, une ligne pour soi. */
  function nuit(n, [sfr, sar, v]) {
    const nAr = chiffres(n);
    const juz = deux(`Juz’ ${n} · dès ${esc(sfr)}, v. ${v}`, `الجزء ${nAr} · من سورة ${sar}، الآية ${chiffres(v)}`);
    return `<div class="lp-nuit${n > 20 ? ' lp-nuit-dix' : ''}">
      <div class="lp-nuit-t"><span class="lp-nuit-n">${etat.langue === 'ar' ? nAr : n}</span>
        <span>${deux(`Nuit ${n}`, `الليلة ${nAr}`)}</span><small>${juz}</small></div>
      <div class="lp-cases">${CASES.map(([f, a]) => `<span><i></i>${deux(f, a)}</span>`).join('')}</div>
      <div class="lp-ligne"></div></div>`;
  }

  /** Pages à remplir à la main : entrées (« De la part de… ») ou registre (nom et quelques lignes). */
  function pagesLibres(n) {
    const L = modele().libres;
    const registre = L.gabarit === 'registre';
    const champ = deux(L.champ_fr, L.champ_ar);
    const entree = `<div class="lp-entree${registre ? ' lp-entree-reg' : ''}"><p class="lp-entree-t">${champ}<span class="lp-ligne"></span></p>
      ${'<div class="lp-ligne"></div>'.repeat(registre ? 2 : 5)}</div>`;
    for (let i = 0; i < n; i++) {
      const corps = pageInterieure();
      corps.innerHTML = (i === 0 ? titre([L.titre_fr, L.titre_ar]) : '') + entree.repeat(registre ? (i === 0 ? 4 : 5) : 2);
    }
  }

  function nouvellePage(classe) {
    const p = document.createElement('div');
    p.className = 'lp-page ' + classe + (etat.langue === 'ar' ? ' lp-ar' : '');
    const g = D.motifs[etat.m];
    const sombre = ['#11706B', '#0F2747'].includes(g.fond);
    p.style.setProperty('--a', sombre ? g.fond : g.accent);
    p.style.setProperty('--t', sombre ? g.fond : g.trait);
    p.style.setProperty('--fond', g.fond);
    p.style.setProperty('--texte-dos', g.texte);
    const [l, h] = modele().format;
    const cadre = document.createElement('div');
    cadre.className = 'lp-cadre-ext';
    cadre.style.setProperty('--lw', l + 'mm'); cadre.style.setProperty('--lh', h + 'mm');
    // Couleur du fond perdu : celle du motif pour la couverture, le dos et le recto des cartes.
    const plein = /lp-couv|lp-dos|lc-recto/.test(classe) || (/lc-long/.test(classe) && !/lc-verso/.test(classe));
    cadre.style.setProperty('--perdu', plein ? g.fond : '#FFFFFF');
    cadre.appendChild(p);
    apercu.appendChild(cadre);
    return p;
  }

  function pageInterieure() {
    const p = nouvellePage('lp-int');
    p.innerHTML = '<div class="lp-frise lp-frise-haut"></div><div class="lp-corps"></div><div class="lp-frise lp-frise-bas"></div><div class="lp-folio"></div>';
    return p.querySelector('.lp-corps');
  }

  const depasse = corps => corps.scrollHeight > corps.clientHeight + 1;
  // Hauteur réellement occupée (scrollHeight vaut au moins la hauteur de la page).
  const rempli = corps => corps.lastElementChild ? corps.lastElementChild.offsetTop + corps.lastElementChild.offsetHeight : 0;

  /** Remplit les pages intérieures ; « aere » : chaque section commence sur une nouvelle page. */
  function mettreEnPage(liste, aere) {
    let corps = pageInterieure();
    for (let i = 0; i < liste.length; i++) {
      // Un titre de section ne reste jamais seul en bas de page : on le teste avec le bloc suivant.
      const groupe = [liste[i]];
      while (groupe[groupe.length - 1].suite && i + 1 < liste.length) groupe.push(liste[++i]);
      const bloc = document.createElement('div');
      bloc.className = 'lp-bloc';
      bloc.innerHTML = groupe.map(x => x.html).join('');
      // Une nouvelle section commence sur une nouvelle page si la page en cours est déjà bien remplie.
      if (groupe[0].saut && corps.childElementCount && (aere || rempli(corps) > corps.clientHeight * .62)) corps = pageInterieure();
      corps.appendChild(bloc);
      if (depasse(corps) && corps.childElementCount > 1) {
        corps.removeChild(bloc);
        corps = pageInterieure();
        corps.appendChild(bloc);
      }
    }
  }

  function composer() {
    apercu.innerHTML = '';
    apercu.dir = etat.langue === 'ar' ? 'rtl' : 'ltr';   // un livret arabe se lit de droite à gauche
    formatImpression();
    if (estCarte()) return composerCarte();
    nouvellePage('lp-couv').innerHTML = couverture(etat.m, etat);

    // Mise en page serrée d'abord ; si des pages blanches sont de toute façon nécessaires pour
    // atteindre un multiple de quatre, on aère plutôt : une section par page, sans page de plus.
    // Un livret à pages libres (carnet, registre) complète plutôt avec des pages à remplir.
    const liste = contenuDuLivret();
    mettreEnPage(liste, false);
    if (modele().libres) {
      const avant = apercu.childElementCount + 1;
      pagesLibres(etat.libres + (Math.ceil((avant + etat.libres) / 4) * 4 - avant - etat.libres));
    }
    // Huit pages au moins : c'est la plus petite brochure de l'imprimeur.
    const serre = apercu.childElementCount + 1, cible = Math.max(8, Math.ceil(serre / 4) * 4);
    if (cible > serre && !modele().libres) {
      const sauvegarde = [...apercu.children].slice(1);
      sauvegarde.forEach(n => n.remove());
      mettreEnPage(liste, true);
      if (apercu.childElementCount + 1 > cible) {
        [...apercu.children].slice(1).forEach(n => n.remove());
        sauvegarde.forEach(n => apercu.appendChild(n));
      }
    }

    // Un livret piqué compte un multiple de quatre pages : on complète avec des pages de notes.
    let total = apercu.childElementCount + 1;
    while (total % 4 || total < 8) { nouvellePage('lp-int lp-vide').innerHTML = `<div class="lp-frise lp-frise-haut"></div><div class="lp-vide-orn">${SVG_KHATAM}</div><div class="lp-frise lp-frise-bas"></div>`; total++; }

    const dos = nouvellePage('lp-dos');
    dos.innerHTML = `<div class="lp-dos-int">${SVG_KHATAM}
      ${etat.mention && etat.textes.length ? `<p class="lp-mention"${etat.langue === 'ar' ? ' lang="ar" dir="rtl"' : ''}>${etat.langue === 'ar' ? T.mention[1] : T.mention[0]}</p>
        ${etat.langue === 'bi' ? `<p class="lp-mention" lang="ar" dir="rtl">${T.mention[1]}</p>` : ''}` : ''}
      <p class="lp-dos-marque">Sakîna · <span lang="ar">سكينة</span></p></div>`;

    // Folios (la couverture et le dos n'en portent pas).
    apercu.querySelectorAll('.lp-folio').forEach((f, i) => {
      const n = i + 2;
      f.innerHTML = etat.langue === 'ar' ? chiffres(n) : n;
      f.classList.add(n % 2 ? 'lp-folio-impair' : 'lp-folio-pair');   // toujours sur le bord extérieur
    });
    finir();
  }

  /** Une carte a une place fixe : si son texte déborde, on le réduit (jusqu'aux deux tiers). */
  function ajusterCartes() {
    apercu.querySelectorAll('.lc-verso-corps, .lc-menu, .lc-certif-txt').forEach(z => {
      z.style.zoom = '';
      for (let f = 1; f > .66 && z.scrollHeight > z.clientHeight + 1; f -= .04) z.style.zoom = f.toFixed(2);
    });
  }

  function finir() {
    const n = apercu.childElementCount;
    if (estCarte()) ajusterCartes();
    document.getElementById('nb-pages').textContent = estCarte() ? UI.faces(n) : UI.pages(n);
    apercu.classList.toggle('apercu-cartes', estCarte());
    ajusterZoom();
    afficherPrix();
    document.dispatchEvent(new CustomEvent('sakina:compose', { detail: { etat, pages: n, carte: estCarte(), format: modele().format } }));
  }

  /** À l'impression, une face par feuille, au format de la pièce. */
  function formatImpression() {
    const [l, h] = modele().format;
    let st = document.getElementById('format-page');
    if (!st) { st = document.createElement('style'); st.id = 'format-page'; document.head.appendChild(st); }
    // Atelier : 3 mm de fond perdu de chaque côté, comme le demande l'imprimeur.
    const perdu = document.documentElement.classList.contains('atelier') ? 6 : 0;
    st.textContent = `@page { size: ${l + perdu}mm ${h + perdu}mm; margin: 0; }`;
  }

  function ajusterZoom() {
    const largeur = apercu.clientWidth, [l, h] = modele().format;
    // Un livret : couverture puis doubles pages ; une carte : ses faces côte à côte si elles tiennent.
    const colonnes = estCarte() ? (l > 200 ? 1 : Math.min(apercu.childElementCount, largeur > 380 ? 2 : 1)) : (largeur > 380 ? 2 : 1);
    let k = Math.min(1, (largeur - (colonnes - 1) * 16) / colonnes / (l * MM));
    if (estCarte()) k = Math.min(k, 520 / (h * MM));   // une pièce longue ne prend pas tout l'écran
    apercu.style.setProperty('--k', k.toFixed(4));
  }

  // ------------------------------------------------------------------ papeterie

  /** Arc brisé (mihrab), même tracé que couvertures.py : base en (x, y+h), sommet en (x+l/2, y). */
  function arcBrise(x, y, l, h) {
    const f = v => +v.toFixed(2);
    return `M${f(x)} ${f(y + h)}V${f(y + h * .42)}C${f(x)} ${f(y + h * .2)} ${f(x + l * .22)} ${f(y + h * .08)} ${f(x + l / 2)} ${f(y)}`
         + `C${f(x + l * .78)} ${f(y + h * .08)} ${f(x + l)} ${f(y + h * .2)} ${f(x + l)} ${f(y + h * .42)}V${f(y + h)}`;
  }

  /** Décor du motif (dessiné autour de 74,66 sur une largeur de 148), placé au centre (cx, cy) à l'échelle s. */
  const decor = (g, cx, cy, s) => `<g transform="translate(${(cx - 74 * s).toFixed(2)} ${(cy - 66 * s).toFixed(2)}) scale(${s.toFixed(3)})">${g.decor}</g>`;

  let idClip = 0;
  /** Fond d'une face recto : couleur du motif, arc brisé (ou cercle pour une étiquette), décor dans l'arc. */
  function fondRecto(l, h, zone) {
    const g = D.motifs[etat.m], id = 'cl' + (++idClip);
    if (modele().rond) {
      return `<svg class="lc-fond" viewBox="0 0 ${l} ${h}" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="${l / 2}" cy="${h / 2}" r="${l / 2 - 3}"/></clipPath></defs>
        <circle cx="${l / 2}" cy="${h / 2}" r="${l / 2}" fill="${g.fond}"/>
        <circle cx="${l / 2}" cy="${h / 2}" r="${l / 2 - 2.5}" fill="none" stroke="${g.trait}" stroke-width=".45"/>
        <g clip-path="url(#${id})" opacity=".28">${decor(g, l / 2, h / 2, l / 70)}</g></svg>`;
    }
    const [x, y, al, ah] = zone;
    return `<svg class="lc-fond" viewBox="0 0 ${l} ${h}" aria-hidden="true"><defs><clipPath id="${id}"><path d="${arcBrise(x, y, al, ah)}Z"/></clipPath></defs>
      <rect width="${l}" height="${h}" fill="${g.fond}"/>
      <path d="${arcBrise(x, y, al, ah)}" fill="none" stroke="${g.trait}" stroke-width=".7"/>
      <path d="${arcBrise(x + al * .035, y + ah * .035, al * .93, ah * .965)}" fill="none" stroke="${g.trait}" stroke-width=".22" opacity=".7"/>
      <g clip-path="url(#${id})">${decor(g, x + al / 2, y + ah * .3, al / 128)}</g></svg>`;
  }

  /** Bloc de textes du recto : formule arabe, titre, noms, date. */
  function textesRecto(avecTitre = true) {
    const ar = arabe(etat.titre) ? ' lang="ar"' : '', arN = arabe(etat.noms) ? ' lang="ar"' : '', arD = arabe(etat.date) ? ' lang="ar"' : '';
    return `${etat.phrase.trim() ? `<p class="lc-phrase" lang="ar" dir="rtl">${esc(etat.phrase)}</p>` : ''}
      ${avecTitre && etat.titre.trim() ? `<p class="lc-titre"${ar}>${esc(etat.titre)}</p>` : ''}
      ${etat.noms.trim() ? `<p class="lc-noms"${arN}>${esc(etat.noms)}</p>` : ''}
      <span class="lc-etoile">${SVG_KHATAM}</span>
      ${etat.date.trim() ? `<p class="lc-date"${arD}>${esc(etat.date)}</p>` : ''}`;
  }

  /** Textes cochés, au plus « max » (une carte n'en porte qu'un ou deux). */
  const textesCoches = (max = 1) => listeTextes().filter(k => etat.textes.includes(k)).slice(0, max);
  const infos = () => [etat.date, etat.lieu].filter(s => s.trim()).map(esc).join(' · ');

  function face(classe) {
    const p = nouvellePage('lp-carte ' + classe);
    const [l, h] = modele().format;
    return [p, l, h];
  }

  function composerCarte() {
    const M = modele(), k = etat.p;
    const sombre = ['#11706B', '#0F2747'].includes(D.motifs[etat.m].fond);
    // Sur fond sombre, le recto prend les couleurs claires du motif (la page intérieure, elle, reste blanche).
    const g = D.motifs[etat.m];
    const marque = p => { p.classList.toggle('lc-sombre', sombre); if (sombre) { p.style.setProperty('--a', g.accent); p.style.setProperty('--t', g.trait); } };

    if (k === 'etiquette') {
      const [p, l, h] = face('lc-rond'); marque(p);
      p.innerHTML = fondRecto(l, h) + `<div class="lc-txt lc-txt-rond">${textesRecto(false)}</div>`;
      return finir();
    }
    const rtl = etat.langue === 'ar';
    if (k === 'certificat') {
      const [p, l, h] = face('lc-paysage lc-certif');
      const ax = rtl ? l - 16 - 96 : 16;
      const sig = (M.signatures || []).map(([f, a]) => `<div><span class="lp-ligne"></span><small>${deux(f, a)}</small></div>`).join('');
      const t = textesCoches(1)[0];
      p.innerHTML = fondRecto(l, h, [ax, 16, 96, h - 32]).replace(`<rect width="${l}" height="${h}" fill="${g.fond}"/>`,
        `<rect width="${l}" height="${h}" fill="#FFF"/><path d="${arcBrise(ax, 16, 96, h - 32)}Z" fill="${g.fond}"/>`)
        + `<div class="lc-certif-arc">${etat.phrase.trim() ? `<p class="lc-phrase" lang="ar" dir="rtl" style="color:${sombre ? g.trait : g.accent}">${esc(etat.phrase)}</p>` : ''}</div>
        <div class="lc-certif-txt">
          <p class="lc-titre-grand"${arabe(etat.titre) ? ' lang="ar"' : ''}>${esc(etat.titre)}</p>
          <p class="lc-petit">${deux('décerné à', 'تُمنح لـ')}</p>
          <p class="lc-noms">${esc(etat.noms)}</p>
          ${paragraphes(etat.accueil_fr, etat.accueil_ar)}
          ${infos() ? `<p class="lc-petit">${infos()}</p>` : ''}
          ${t ? `<div class="lc-verset">${texte(t)}</div>` : ''}
          <div class="lc-signatures">${sig}</div>
        </div>`;
      return finir();
    }
    if (k === 'menu') {
      const [p, l, h] = face('lc-long'); marque(p);
      const plats = etat.deroule.filter(e => (e.fr_t + e.fr_d + e.ar_t + e.ar_d).trim()).map(etape).join('');
      p.innerHTML = fondRecto(l, h, [9, 9, l - 18, 74]) + `<div class="lc-menu-haut">${etat.phrase.trim() ? `<p class="lc-phrase" lang="ar" dir="rtl">${esc(etat.phrase)}</p>` : ''}</div>
        <div class="lc-menu"><p class="lc-titre-grand"${arabe(etat.titre) ? ' lang="ar"' : ''}>${esc(etat.titre)}</p>
          ${etat.noms.trim() ? `<p class="lc-petit">${esc(etat.noms)}</p>` : ''}
          ${etat.avec_deroule ? `<div class="lc-plats">${plats}</div>` : ''}
          ${paragraphes(etat.accueil_fr, etat.accueil_ar)}
          <span class="lc-etoile">${SVG_KHATAM}</span>${infos() ? `<p class="lc-petit">${infos()}</p>` : ''}</div>`;
      return finir();
    }

    // Cartes recto verso : faire-part, invitation, remerciement, marque-page.
    const [r, l, h] = face('lc-recto'); marque(r);
    const paysage = l > h, long = h / l > 2.4;
    if (paysage) {
      r.classList.add('lc-paysage');
      r.innerHTML = fondRecto(l, h, [rtl ? l - 8 - h * .62 : 8, 8, h * .62, h - 16]) + `<div class="lc-txt lc-txt-cote">${textesRecto()}</div>`;
    } else {
      if (long) r.classList.add('lc-long');
      const zone = long ? [6, 6, l - 12, h - 12] : [8, 8, l - 16, h - 16];
      r.innerHTML = fondRecto(l, h, zone) + `<div class="lc-txt${long ? ' lc-txt-long' : ''}">${textesRecto(!long)}</div>`;
    }
    const v = nouvellePage('lp-carte lc-verso' + (paysage ? ' lc-paysage' : '') + (long ? ' lc-long' : ''));
    const ts = textesCoches(1).map(texte).join('');
    const mention = etat.mention && ts ? `<p class="lp-mention lc-mention"${etat.langue === 'ar' ? ' lang="ar" dir="rtl"' : ''}>${etat.langue === 'ar' ? T.mention_carte[1] : T.mention_carte[0]}</p>` : '';
    v.innerHTML = `<div class="lp-frise lp-frise-haut"></div><div class="lc-verso-corps">
        ${etat.basmala ? '<p class="lp-basmala" lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>' : ''}
        ${long ? ts : paragraphes(etat.accueil_fr, etat.accueil_ar)}
        ${!long && infos() ? `<p class="lp-infos">${infos()}</p>` : ''}
        ${!long && ts ? `<div class="lp-orn">${SVG_KHATAM}</div>${ts}` : ''}
        ${!long && etat.noms.trim() ? `<p class="lp-signature">${esc(etat.noms)}</p>` : ''}
        ${mention}
      </div><div class="lp-frise lp-frise-bas"></div>`;
    finir();
  }

  // ------------------------------------------------------------------ prix

  const euros = v => v.toLocaleString(SITE === 'ar' ? 'ar' : 'fr-FR', { style: 'currency', currency: 'EUR' });
  /** Prix TTC : MARGE × le prix Vistaprint du même palier, arrondi à l'euro supérieur. */
  // Même calcul côté serveur (functions/_lib/prix.js) : le prix payé est toujours recalculé là-bas.
  function prix(pages, quantite) {
    const grille = estCarte() ? D.tarifs_papeterie[etat.p] : D.tarifs[pages];
    return grille && grille[quantite] != null ? Math.ceil(D.marge * grille[quantite] * (1 + D.tva)) : null;
  }
  function afficherPrix() {
    const pages = apercu.childElementCount, choix = document.getElementById('f-quantite');
    const quantites = estCarte() ? D.quantites_papeterie : Object.keys(D.tarifs[8]).map(Number);
    if (choix.dataset.pour !== String(estCarte())) {
      choix.innerHTML = quantites.map(q => `<option value="${q}">${UI.ex(q)}</option>`).join('');
      choix.dataset.pour = String(estCarte());
    }
    choix.value = String(quantites.includes(etat.quantite) ? etat.quantite : 50);
    const total = prix(pages, +choix.value);
    const detail = estCarte() ? UI.faces(pages) : UI.pages(pages);
    document.getElementById('devis-prix').innerHTML = total == null ? (estCarte() ? UI.devisCarte : UI.devis)
      : `<strong>${euros(total)}</strong> ${UI.ttc}<br><small>${UI.unite(euros(total / +choix.value))} · ${detail}</small>`;
  }

  // ------------------------------------------------------------------ événements

  let minuterie;
  function changer({ redessiner = false } = {}) {
    clearTimeout(minuterie);
    if (redessiner) remplir();
    minuterie = setTimeout(() => { composer(); garder(etat); }, 120);
  }

  form.addEventListener('input', ev => {
    const el = ev.target;
    if (el.closest('.etape-edition')) {
      etat.deroule[+el.closest('.etape-edition').dataset.i][el.dataset.champ] = el.value;
      return changer();
    }
    if (el.name === 'ceremonie') { etat = defaut(el.value, etat); return changer({ redessiner: true }); }
    if (el.name === 'p') { etat = defaut(etat.c, { ...etat, p: el.value }); return changer({ redessiner: true }); }
    if (el.name === 'libres') { etat.libres = +el.value; return changer(); }
    if (el.closest('.commande')) return;
    if (el.name === 'm') { etat.m = el.value; dessinerPieces(); return changer(); }
    if (el.name === 'quantite') { etat.quantite = +el.value; afficherPrix(); return garder(etat); }
    if (el.name === 'langue') {
      const C = D.ceremonies[etat.c], avant = etat.langue;
      etat.langue = el.value;
      // Les textes proposés suivent la langue tant qu'ils n'ont pas été modifiés.
      const P = proposes(etat.p, etat.c);
      if (etat.titre === P.titre[0] || etat.titre === P.titre[1]) etat.titre = el.value === 'ar' ? P.titre[1] : P.titre[0];
      if (etat.date === DATE.fr || etat.date === DATE.ar) etat.date = el.value === 'ar' ? DATE.ar : DATE.fr;
      if (etat.noms === C.noms || etat.noms === C.noms_ar) etat.noms = el.value === 'ar' ? C.noms_ar : C.noms;
      if (avant !== el.value) return changer({ redessiner: true });
    }
    if (el.name === 'genre') {
      const C = D.ceremonies[etat.c];
      etat.genre = el.value;
      if (C.fin_ar_f && (etat.fin_ar === C.fin_ar || etat.fin_ar === C.fin_ar_f)) etat.fin_ar = el.value === 'f' ? C.fin_ar_f : C.fin_ar;
      return changer({ redessiner: true });
    }
    if (el.name === 'texte') {
      etat.textes = listeTextes().filter(k => k === el.value ? el.checked : etat.textes.includes(k));
      return changer();
    }
    if (el.type === 'checkbox') {
      etat[el.name] = el.checked;
      if (el.name === 'avec_deroule') dessinerDeroule();
      return changer();
    }
    if (el.name in etat) {
      etat[el.name] = el.value;
      if (['noms', 'titre', 'phrase', 'date'].includes(el.name)) dessinerMotifs();
      changer();
    }
  });

  document.getElementById('f-deroule').addEventListener('click', ev => {
    const b = ev.target.closest('button[data-action]');
    if (!b) return;
    const i = +b.closest('.etape-edition').dataset.i, d = etat.deroule;
    if (b.dataset.action === 'suppr') d.splice(i, 1);
    if (b.dataset.action === 'haut') [d[i - 1], d[i]] = [d[i], d[i - 1]];
    if (b.dataset.action === 'bas') [d[i + 1], d[i]] = [d[i], d[i + 1]];
    dessinerDeroule(); changer();
  });
  document.getElementById('ajout-etape').addEventListener('click', () => {
    etat.deroule.push({ fr_t: '', fr_d: '', ar_t: '', ar_d: '' });
    dessinerDeroule(); changer();
    document.querySelector('.etape-edition:last-child input')?.focus();
  });
  document.getElementById('voir-tous').addEventListener('click', () => { tousLesTextes = !tousLesTextes; dessinerTextes(); });
  document.getElementById('reinitialiser').addEventListener('click', () => { etat = defaut(etat.c, etat); changer({ redessiner: true }); });
  // Le PDF au nom de la pièce, dans la langue du site.
  const nomPiece = () => (SITE === 'ar' ? modele().nom_ar : modele().nom_fr);

  const message = texte => { document.getElementById('message').textContent = texte; };
  document.getElementById('partager').addEventListener('click', async () => {
    const lien = versLien(etat);
    history.replaceState(null, '', lien);
    try { await navigator.clipboard.writeText(lien); message(UI.copie); }
    catch (e) {
      // Presse-papiers refusé : on affiche le lien, déjà sélectionné, à copier soi-même.
      const zone = document.getElementById('message');
      zone.innerHTML = `${UI.copieManuelle}<input class="lien-partage" readonly dir="ltr" value="${esc(lien)}">`;
      zone.querySelector('input').select();
    }
  });
  // Commande : un petit formulaire, puis le paiement (Stripe) ou la demande de devis.
  // Sans service de commande configuré (site statique seul), on le dit simplement.
  const commande = document.getElementById('commande');
  document.getElementById('commander').addEventListener('click', ev => {
    ev.preventDefault();
    if (D.api == null) return message(UI.bientot);
    commande.hidden = !commande.hidden;
    if (!commande.hidden) commande.querySelector('input').focus();
  });
  document.getElementById('envoyer-commande').addEventListener('click', async () => {
    const champs = [...commande.querySelectorAll('input, textarea')];
    const invalide = champs.find(c => !c.checkValidity());
    if (invalide) { invalide.reportValidity(); return; }
    const f = { get: n => { const c = commande.querySelector(`[name="${n}"]`); return c.type === 'checkbox' ? (c.checked ? 'on' : '') : c.value.trim(); } };
    const bouton = document.getElementById('envoyer-commande');
    const corps = {
      etat, pages: apercu.childElementCount, quantite: etat.quantite || 50, site: SITE, lien: versLien(etat),
      contact: { nom: f.get('c_nom'), email: f.get('c_email'), telephone: f.get('c_tel'), message: f.get('c_message') },
      relecture: f.get('c_relecture') === 'on', site_web: f.get('c_site'),   // site_web : piège à robots, reste vide
    };
    bouton.disabled = true; message(UI.envoi);
    try {
      const r = await fetch(D.api + '/api/commandes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) });
      const rep = await r.json().catch(() => ({}));
      if (!r.ok || !rep.url) throw new Error(rep.erreur || r.status);
      location.href = rep.url;
    } catch (e) {
      message(typeof e.message === 'string' && e.message.length > 4 ? e.message : UI.erreur);
      bouton.disabled = false;
    }
  });
  document.getElementById('imprimer').addEventListener('click', () => {
    message(UI.imprimer);
    const titreDoc = document.title;
    document.title = `${nomPiece()} - ${D.ceremonies[etat.c][SITE === 'ar' ? 'nom_ar' : 'nom_fr']} - ${etat.noms}`.replace(/[\\/:*?"<>|]/g, '');
    window.print();
    document.title = titreDoc;
  });

  // ------------------------------------------------------------------ questions, une à la fois

  const questions = [...form.querySelectorAll('.question')];
  const etoiles = [...document.querySelectorAll('#progression button')];
  const prec = document.getElementById('precedent'), suiv = document.getElementById('suivant');
  let courante = 0, vues = 0;
  // Certaines questions ne concernent qu'une famille (le mot de fin : les livrets).
  const active = i => !questions[i].dataset.familles || questions[i].dataset.familles.split(' ').includes(modele().famille);
  function filtrerQuestions() {
    const actives = questions.map((q, i) => i).filter(active);
    etoiles.forEach((b, i) => { b.parentElement.hidden = !active(i); });
    questions.forEach((q, i) => {
      const num = q.querySelector('.question-num');
      const rang = actives.indexOf(i) + 1, total = actives.length;
      if (num && rang) num.textContent = SITE === 'ar' ? `${chiffres(rang)} / ${chiffres(total)}` : `${rang} / ${total}`;
    });
    if (questions.length && !active(courante)) montrerQuestion(courante, false);
  }
  function montrerQuestion(n, focus = true, sens = 1) {
    n = Math.max(0, Math.min(questions.length - 1, n));
    while (!active(n) && n > 0 && n < questions.length - 1) n += sens;
    courante = n;
    vues = Math.max(vues, courante);
    questions.forEach((q, i) => { q.hidden = i !== courante; });
    etoiles.forEach((b, i) => {
      b.classList.toggle('faite', i <= vues);
      b.toggleAttribute('aria-current', i === courante);
    });
    prec.hidden = courante === 0;
    suiv.hidden = courante === questions.length - 1;
    if (focus) questions[courante].querySelector('.question-titre').focus({ preventScroll: true });
    if (focus && window.innerWidth < 900) form.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  questions.forEach(q => q.querySelector('.question-titre').setAttribute('tabindex', '-1'));
  prec.addEventListener('click', () => montrerQuestion(courante - 1, true, -1));
  suiv.addEventListener('click', () => montrerQuestion(courante + 1, true, 1));
  etoiles.forEach((b, i) => b.addEventListener('click', () => montrerQuestion(i)));
  // Un lien partagé (relecture) ouvre directement la dernière étape.
  if (location.hash.startsWith('#l=')) { vues = questions.length - 1; montrerQuestion(questions.length - 1, false); } else montrerQuestion(0, false);

  // Atelier : le fichier pour l'imprimeur, sans filigrane. Réservé à l'administration (mot de passe
  // vérifié par le serveur). Le filigrane décourage la copie ; il ne remplace pas ce contrôle.
  if (params.get('atelier') && D.api != null) {
    let j = null;
    try { j = sessionStorage['sakina-admin']; } catch (e) { /* stockage indisponible */ }
    if (j) fetch(D.api + '/api/admin/commandes?statut=annulee', { headers: { Authorization: 'Bearer ' + j } })
      .then(r => { if (r.ok) { apercu.classList.remove('filigrane'); document.documentElement.classList.add('atelier'); composer(); } }).catch(() => {});
  }
  window.addEventListener('resize', ajusterZoom);
  remplir();
  composer();
  // Les mesures dépendent des polices : on recompose quand elles sont chargées.
  document.fonts?.ready.then(composer);
})();
