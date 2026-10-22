/* Compositeur Sakîna : un livret A5 (brochure) composé question par question.
 *
 * Les données (versets, cérémonies, gabarits de couverture) viennent de
 * donnees.js, généré par build.py. L'état du livret est gardé dans le
 * navigateur et peut être partagé par lien (#l=…), pour le faire relire.
 * L'impression (PDF) passe par le navigateur : une page A5 par feuille.
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
      noms: 'Noms', lieu: 'Mosquée, salle…',
      ex: n => `${n} exemplaires`, unite: p => `soit ${p} le livret`, ttc: 'TTC, hors livraison', devis: 'Au-delà de 24 pages : sur devis.',
    },
    ar: {
      pages: n => `${chiffres(n)} ${n >= 3 && n <= 10 ? 'صفحات' : 'صفحة'}`,   // accord du nombre en arabe conseille: 'مقترح', copie: 'نُسخ الرابط: أرسلوه إلى إمامكم للمراجعة.',
      copieManuelle: 'انسخ هذا الرابط:', voirTous: 'عرض المكتبة كاملة', voirMoins: 'نصوص المناسبة فقط',
      monter: 'إلى الأعلى', descendre: 'إلى الأسفل', supprimer: 'حذف', titreFr: 'العنوان (بالفرنسية)', texteFr: 'النص (بالفرنسية)',
      titreAr: 'العنوان (بالعربية)', texteAr: 'النص (بالعربية)', imprimer: 'تُفتح نافذة: اختر PDF وجهةً، واضبط الهوامش على «بلا».',
      sujet: 'طلب طباعة', corps: 'السلام عليكم،\n\nأرغب في طباعة هذا الكتيّب:\n',
      noms: 'الأسماء', lieu: 'المسجد، القاعة…',
      ex: n => `${chiffres(n)} نسخة`, unite: p => `أي ${p} للكتيّب الواحد`, ttc: 'شامل الضريبة، دون التوصيل', devis: 'أكثر من ٢٤ صفحة: بعرض سعر.',
    },
  }[SITE];

  // Titres des sections du livret, dans la langue du livret.
  const T = {
    accueil: ['Bienvenue', 'أهلًا وسهلًا'],
    deroule: ['Le déroulé', 'مراحل الحفل'],
    textes: ['Versets et invocations', 'آيات وأدعية'],
    fin: ['Avec gratitude', 'مع الشكر'],
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

  function defaut(c, base = {}) {
    const C = D.ceremonies[c];
    const langue = base.langue || (SITE === 'ar' ? 'ar' : 'bi');
    const genre = C.genre || 'm';
    return {
      c, m: C.motif, langue, translit: base.translit ?? langue !== 'ar', genre,
      noms: langue === 'ar' ? C.noms_ar : C.noms, titre: langue === 'ar' ? C.titre_ar : C.titre_fr, phrase: C.phrase,
      date: langue === 'ar' ? DATE.ar : DATE.fr, lieu: '',
      basmala: c !== 'henne' && c !== 'khitan',
      accueil_fr: C.accueil_fr, accueil_ar: C.accueil_ar,
      fin_fr: C.fin_fr, fin_ar: (genre === 'f' && C.fin_ar_f) || C.fin_ar,
      avec_deroule: c !== 'janaza', deroule: C.deroule.map(e => ({ ...e })),
      textes: C.textes.slice(0, C.defaut), mention: true,
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
    etat = dejaSaisi && dejaSaisi.c === c && !params.get('m') ? dejaSaisi : defaut(c, dejaSaisi || {});
    if (D.motifs[params.get('m')]) etat.m = params.get('m');
  }
  let tousLesTextes = false;

  // ------------------------------------------------------------------ formulaire

  const ARABE_CEREMONIE = { nikah: 'نكاح', aqiqa: 'عقيقة', khitan: 'ختان', khatm: 'ختم القرآن', hajj: 'حج', ramadan: 'رمضان', aid: 'عيد', henne: 'حناء', janaza: 'جنازة' };
  function dessinerOccasions() {
    document.getElementById('f-ceremonie').innerHTML = D.ordre.map(id => `
      <label class="occasion"><input type="radio" name="ceremonie" value="${id}"${id === etat.c ? ' checked' : ''}>
        <span class="occasion-ar" lang="ar">${ARABE_CEREMONIE[id]}</span>
        <span class="occasion-nom">${esc(D.ceremonies[id][SITE === 'ar' ? 'nom_ar' : 'nom_fr'])}</span></label>`).join('');
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
    const propres = D.ceremonies[etat.c].textes;
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
    const C = D.ceremonies[etat.c];
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
    dessinerMotifs(); dessinerDeroule(); dessinerTextes();
  }

  // ------------------------------------------------------------------ livret

  const remplace = s => String(s || '').split('{noms}').join(etat.noms);
  const SVG_KHATAM = '<svg class="lp-etoile" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1l2.6 3.7 4.4-.7-.7 4.4L20 10l-3.7 2.6.7 4.4-4.4-.7L10 20l-2.6-3.7-4.4.7.7-4.4L0 10l3.7-2.6-.7-4.4 4.4.7z"/></svg>';

  function titre(cle) {
    const [fr, ar] = T[cle];
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
      b.push({ html: titre('deroule'), suite: true, saut: true });
      etapes.forEach(e => b.push({ html: etape(e) }));
    }
    const ks = listeTextes().filter(k => etat.textes.includes(k));
    if (ks.length) {
      b.push({ html: titre('textes'), suite: true, saut: true });
      ks.forEach((k, i) => b.push({ html: (i ? `<div class="lp-orn">${SVG_KHATAM}</div>` : '') + texte(k) }));
    }
    if ((etat.fin_fr + etat.fin_ar).trim()) {
      b.push({ html: `<div class="lp-orn lp-orn-fin">${SVG_KHATAM}</div>` + titre('fin'), suite: true, saut: true });
      b.push({ html: paragraphes(etat.fin_fr, etat.fin_ar) + `<p class="lp-signature">${esc(etat.noms)}</p>` });
    }
    return b;
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
    const cadre = document.createElement('div');
    cadre.className = 'lp-cadre-ext';
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
    nouvellePage('lp-couv').innerHTML = couverture(etat.m, etat);

    // Mise en page serrée d'abord ; si des pages blanches sont de toute façon nécessaires pour
    // atteindre un multiple de quatre, on aère plutôt : une section par page, sans page de plus.
    const liste = contenuDuLivret();
    mettreEnPage(liste, false);
    const serre = apercu.childElementCount + 1, cible = Math.ceil(serre / 4) * 4;
    if (cible > serre) {
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
    while (total % 4) { nouvellePage('lp-int lp-vide').innerHTML = `<div class="lp-frise lp-frise-haut"></div><div class="lp-vide-orn">${SVG_KHATAM}</div><div class="lp-frise lp-frise-bas"></div>`; total++; }

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
    document.getElementById('nb-pages').textContent = UI.pages(apercu.childElementCount);
    ajusterZoom();
    afficherPrix();
  }

  function ajusterZoom() {
    const largeur = apercu.clientWidth;
    const colonnes = largeur > 700 ? 2 : (largeur > 380 ? 2 : 1);
    const k = Math.min(1, (largeur - (colonnes - 1) * 16) / colonnes / (148 * MM));
    apercu.style.setProperty('--k', k.toFixed(4));
  }

  // ------------------------------------------------------------------ prix

  const euros = v => v.toLocaleString(SITE === 'ar' ? 'ar' : 'fr-FR', { style: 'currency', currency: 'EUR' });
  /** Prix TTC : MARGE × le prix Vistaprint du même palier, arrondi à l'euro supérieur. */
  function prix(pages, quantite) {
    const grille = D.tarifs[pages];
    return grille ? Math.ceil(D.marge * grille[quantite] * (1 + D.tva)) : null;
  }
  function afficherPrix() {
    const pages = apercu.childElementCount, choix = document.getElementById('f-quantite');
    const quantites = Object.keys(D.tarifs[8]).map(Number);
    if (!choix.options.length) choix.innerHTML = quantites.map(q => `<option value="${q}">${UI.ex(q)}</option>`).join('');
    choix.value = String(etat.quantite || 50);
    const total = prix(pages, +choix.value);
    document.getElementById('devis-prix').innerHTML = total == null ? UI.devis
      : `<strong>${euros(total)}</strong> ${UI.ttc}<br><small>${UI.unite(euros(total / +choix.value))} · ${UI.pages(pages)}</small>`;
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
    if (el.name === 'm') { etat.m = el.value; return changer(); }
    if (el.name === 'quantite') { etat.quantite = +el.value; afficherPrix(); return garder(etat); }
    if (el.name === 'langue') {
      const C = D.ceremonies[etat.c], avant = etat.langue;
      etat.langue = el.value;
      // Les textes proposés suivent la langue tant qu'ils n'ont pas été modifiés.
      if (etat.titre === C.titre_fr || etat.titre === C.titre_ar) etat.titre = el.value === 'ar' ? C.titre_ar : C.titre_fr;
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
  document.getElementById('commander').addEventListener('click', ev => {
    ev.preventDefault();
    const C = D.ceremonies[etat.c];
    const sujet = `${UI.sujet} — ${C.nom_fr} — ${etat.noms}`;
    const total = prix(apercu.childElementCount, etat.quantite || 50);
    const corps = `${UI.corps}${versLien(etat)}\n\n${UI.pages(apercu.childElementCount)}, A5 — ${UI.ex(etat.quantite || 50)}${total ? ` — ${euros(total)} ${UI.ttc}` : ''}\n`;
    const q = new URLSearchParams({ subject: sujet, body: corps }).toString().replace(/\+/g, '%20');
    location.href = 'mailto:' + D.email + '?' + q;
  });
  document.getElementById('imprimer').addEventListener('click', () => {
    message(UI.imprimer);
    const titreDoc = document.title;
    document.title = `Livret ${D.ceremonies[etat.c].nom_fr} - ${etat.noms}`.replace(/[\\/:*?"<>|]/g, '');
    window.print();
    document.title = titreDoc;
  });

  // ------------------------------------------------------------------ questions, une à la fois

  const questions = [...form.querySelectorAll('.question')];
  const etoiles = [...document.querySelectorAll('#progression button')];
  const prec = document.getElementById('precedent'), suiv = document.getElementById('suivant');
  let courante = 0, vues = 0;
  function montrerQuestion(n, focus = true) {
    courante = Math.max(0, Math.min(questions.length - 1, n));
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
  prec.addEventListener('click', () => montrerQuestion(courante - 1));
  suiv.addEventListener('click', () => montrerQuestion(courante + 1));
  etoiles.forEach((b, i) => b.addEventListener('click', () => montrerQuestion(i)));
  // Un lien partagé (relecture) ouvre directement la dernière étape.
  if (location.hash.startsWith('#l=')) { vues = questions.length - 1; montrerQuestion(questions.length - 1, false); } else montrerQuestion(0, false);

  window.addEventListener('resize', ajusterZoom);
  remplir();
  composer();
  // Les mesures dépendent des polices : on recompose quand elles sont chargées.
  document.fonts?.ready.then(composer);
})();
