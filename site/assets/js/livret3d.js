/* Sakîna : feuilleter la pièce composée en 3D.
 *
 * Les pages de l'aperçu (#apercu) sont recopiées sur des feuilles en volume
 * (CSS 3D, sans bibliothèque) : chaque feuille porte deux pages, recto et
 * verso, et tourne autour du dos du livret. Un livret arabe s'ouvre de droite
 * à gauche. Une carte se retourne sur elle-même.
 *
 * Gestes : glisser pour faire pivoter le livret ; toucher une page (ou les
 * flèches du clavier) pour la tourner ; Échap pour fermer.
 */
(() => {
  const bouton = document.getElementById('voir-3d');
  const apercu = document.getElementById('apercu');
  if (!bouton || !apercu) return;
  const AR = document.documentElement.lang === 'ar';
  const chiffres = x => AR ? String(x).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : String(x);
  const MM = 96 / 25.4;
  const TXT = AR
    ? { titre: 'تصفّح القطعة', fermer: 'إغلاق', prec: 'الصفحة السابقة', suiv: 'الصفحة التالية', aide: 'اسحبوا لتدوير الكتيّب، والمسوا صفحةً لقلبها.', aideEtroit: 'اسحبوا الصفحة جانبًا لقلبها.',
        couv: 'الغلاف', dos: 'الظهر', page: (a, n) => `الصفحة ${chiffres(a)} من ${chiffres(n)}`, pages: (a, b, n) => `الصفحتان ${chiffres(a)}–${chiffres(b)} من ${chiffres(n)}`, recto: 'الوجه', verso: 'الظهر' }
    : { titre: 'Feuilleter la pièce', fermer: 'Fermer', prec: 'Page précédente', suiv: 'Page suivante', aide: 'Glissez pour faire tourner le livret ; touchez une page pour la tourner.', aideEtroit: 'Glissez la page sur le côté pour la tourner.',
        couv: 'Couverture', dos: 'Dos', page: (a, n) => `Page ${a} sur ${n}`, pages: (a, b, n) => `Pages ${a}–${b} sur ${n}`, recto: 'Recto', verso: 'Verso' };

  let info = { carte: false, format: [148, 210] };
  document.addEventListener('sakina:compose', e => { info = e.detail; if (scene && !scene.hidden) construire(); });

  let scene, livre, plateau, feuilles = [], tournees = 0, rtl = false, inclinaison = { x: 16, y: 0 };
  // Écran étroit (téléphone en portrait) : une page à la fois, en grand. « vue » compte les pages
  // lues une à une : 0 = couverture, puis gauche et droite de chaque double page, enfin le dos.
  let etroit = false, vue = 0;
  const tourneesDe = v => Math.ceil(v / 2);
  const reduit = window.matchMedia('(prefers-reduced-motion: reduce)');

  function creerScene() {
    scene = document.createElement('div');
    scene.className = 'scene-3d';
    scene.id = 'scene-3d';
    scene.hidden = true;
    scene.setAttribute('role', 'dialog');
    scene.setAttribute('aria-modal', 'true');
    scene.setAttribute('aria-label', TXT.titre);
    scene.innerHTML = `
      <div class="s3d-barre">
        <span class="s3d-titre">${TXT.titre}</span>
        <span class="s3d-compte" aria-live="polite"></span>
        <button type="button" class="s3d-fermer" aria-label="${TXT.fermer}">✕</button>
      </div>
      <div class="s3d-plateau"><div class="s3d-livre"></div></div>
      <div class="s3d-nav">
        <button type="button" class="s3d-prec" aria-label="${TXT.prec}"><span aria-hidden="true">${AR ? '→' : '←'}</span></button>
        <p class="s3d-aide">${TXT.aide}</p>
        <button type="button" class="s3d-suiv" aria-label="${TXT.suiv}"><span aria-hidden="true">${AR ? '←' : '→'}</span></button>
      </div>`;
    document.body.appendChild(scene);
    livre = scene.querySelector('.s3d-livre');
    plateau = scene.querySelector('.s3d-plateau');
    scene.querySelector('.s3d-fermer').addEventListener('click', fermer);
    scene.querySelector('.s3d-prec').addEventListener('click', () => tourner(-1));
    scene.querySelector('.s3d-suiv').addEventListener('click', () => tourner(1));
    document.addEventListener('keydown', e => {
      if (scene.hidden) return;
      if (e.key === 'Escape') fermer();
      if (e.key === 'ArrowRight') tourner(rtl ? -1 : 1);
      if (e.key === 'ArrowLeft') tourner(rtl ? 1 : -1);
      if (e.key === 'Tab') {   // le focus reste dans la fenêtre
        const f = [...scene.querySelectorAll('button')];
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    gestes();
    // Le téléphone pivote : nouvelle taille, et passage de la page seule à la double page (ou l'inverse).
    window.addEventListener('resize', () => {
      if (scene.hidden) return;
      const avant = etroit;
      dimensionner();
      if (avant && !etroit) vue = 0;
      if (!avant && etroit) vue = Math.max(0, Math.min(2 * feuilles.length - 1, tournees * 2 - 1));
      placer();
    });
  }

  /** Recopie les pages de l'aperçu sur des feuilles (deux pages par feuille). */
  function construire() {
    const pages = [...apercu.querySelectorAll('.lp-page')];
    rtl = apercu.dir === 'rtl';
    livre.innerHTML = '';
    livre.classList.toggle('s3d-carte', !!info.carte);
    livre.classList.toggle('filigrane', apercu.classList.contains('filigrane'));
    livre.classList.toggle('s3d-rtl', rtl && !info.carte);
    feuilles = [];
    const paires = [];
    if (info.carte) paires.push([pages[0], pages[1] || null]);
    else for (let i = 0; i < pages.length; i += 2) paires.push([pages[i], pages[i + 1] || null]);
    paires.forEach(([recto, verso], i) => {
      const f = document.createElement('div');
      f.className = 's3d-feuille';
      f.innerHTML = '<div class="s3d-face s3d-recto"></div><div class="s3d-face s3d-verso"></div>';
      const poser = (page, face) => {
        const zone = f.querySelector(face);
        if (!page) { zone.classList.add('s3d-blanche'); return; }
        const copie = page.cloneNode(true);
        copie.removeAttribute('id');
        copie.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
        zone.appendChild(copie);
      };
      poser(recto, '.s3d-recto'); poser(verso, '.s3d-verso');
      f.addEventListener('transitionend', e => { if (e.propertyName === 'transform') f.classList.remove('s3d-en-vol'); });
      livre.appendChild(f);
      feuilles.push(f);
    });
    // Les clipPath des SVG recopiés gardent des identifiants uniques : on les renomme.
    livre.querySelectorAll('clipPath[id]').forEach((c, i) => {
      const ancien = c.id, nouveau = `s3d-${i}-${ancien}`;
      c.id = nouveau;
      c.closest('svg').querySelectorAll(`[clip-path="url(#${ancien})"]`).forEach(n => n.setAttribute('clip-path', `url(#${nouveau})`));
    });
    tournees = Math.min(tournees, feuilles.length);
    dimensionner();
    if (etroit) { vue = Math.min(vue, 2 * feuilles.length - 1); tournees = tourneesDe(vue); }
    placer();
  }

  /** Taille des pages : une double page doit tenir dans l'écran. */
  function dimensionner() {
    const [l, h] = info.format;
    etroit = !info.carte && plateau.clientWidth < 700 && plateau.clientWidth < plateau.clientHeight * .95;
    livre.classList.toggle('s3d-etroit', etroit);
    scene.querySelector('.s3d-aide').textContent = etroit ? TXT.aideEtroit : TXT.aide;
    const largeurs = info.carte ? 1.15 : etroit ? 1.06 : 2.1;
    const dispoL = plateau.clientWidth * .94, dispoH = plateau.clientHeight * .78;
    const k = Math.min(dispoL / (largeurs * l * MM), dispoH / (h * MM), 1.6);
    livre.style.setProperty('--k', k.toFixed(4));
    livre.style.setProperty('--lw', l + 'mm'); livre.style.setProperty('--lh', h + 'mm');
    plateau.style.setProperty('--pw', (l * MM * k).toFixed(1) + 'px');
    plateau.style.setProperty('--ph', (h * MM * k).toFixed(1) + 'px');
  }

  /** Place chaque feuille : tournée (à gauche) ou non (à droite), légèrement empilées. */
  function placer() {
    const n = feuilles.length;
    const sens = rtl ? 1 : -1;
    feuilles.forEach((f, i) => {
      const tournee = i < tournees;
      // Épaisseur : les feuilles non tournées s'empilent sous la page de droite, les autres à gauche.
      const z = tournee ? i * .6 : (n - i) * .6;
      f.style.transform = `translateZ(${z.toFixed(1)}px) rotateY(${tournee ? 180 * sens : 0}deg)`;
      f.style.zIndex = tournee ? i : n - i;
      f.classList.toggle('s3d-tournee', tournee);
    });
    // Livret fermé : la couverture (ou le dos) au centre ; ouvert : le dos du livret au centre.
    const w = 'var(--pw)';
    let decalage = '0px';
    if (etroit) {
      // Une seule page au centre. Couverture : à droite (à gauche en arabe) ; dos : l'inverse ;
      // dans une double page, d'abord la page de gauche puis celle de droite (l'inverse en arabe).
      let droite;
      if (vue === 0) droite = !rtl;
      else if (vue === 2 * n - 1) droite = rtl;
      else droite = vue % 2 === 1 ? rtl : !rtl;
      decalage = `calc(${w} / ${droite ? -2 : 2})`;
    } else if (!info.carte) {
      if (tournees === 0) decalage = `calc(${w} / ${rtl ? 2 : -2})`;
      else if (tournees === n) decalage = `calc(${w} / ${rtl ? -2 : 2})`;
    }
    livre.style.setProperty('--decalage', decalage);
    orienter();
    compter();
    scene.querySelector('.s3d-prec').disabled = etroit ? vue === 0 : tournees === 0;
    scene.querySelector('.s3d-suiv').disabled = etroit ? vue === 2 * n - 1 : tournees === n;
  }

  function orienter() {
    livre.style.transform = `rotateX(${inclinaison.x}deg) rotateY(${inclinaison.y}deg) translateX(var(--decalage))`;
  }

  function compter() {
    const n = feuilles.length, total = apercu.childElementCount;
    let t;
    if (info.carte) t = tournees ? TXT.verso : TXT.recto;
    else if (etroit) t = vue === 0 ? TXT.couv : vue === 2 * n - 1 ? TXT.dos : TXT.page(vue + 1, total);
    else if (tournees === 0) t = TXT.couv;
    else if (tournees === n) t = TXT.dos;
    else t = TXT.pages(tournees * 2, tournees * 2 + 1, total);
    scene.querySelector('.s3d-compte').textContent = t;
  }

  function tourner(d) {
    const avant = tournees;
    if (etroit) {
      vue = Math.max(0, Math.min(2 * feuilles.length - 1, vue + d));
      tournees = tourneesDe(vue);
      if (tournees === avant) return placer();   // même double page : on glisse seulement vers l'autre page
    } else tournees = Math.max(0, Math.min(feuilles.length, tournees + d));
    if (tournees === avant) return;
    // La feuille qui tourne passe au-dessus des autres pendant son vol.
    const f = feuilles[d > 0 ? avant : tournees];
    f.classList.add('s3d-en-vol');
    placer();
  }

  /** Glisser : faire pivoter ; toucher sans glisser : tourner la page du côté touché. */
  function gestes() {
    let depart = null;
    plateau.addEventListener('pointerdown', e => {
      depart = { x: e.clientX, y: e.clientY, ix: inclinaison.x, iy: inclinaison.y, bouge: false };
      plateau.setPointerCapture(e.pointerId);
    });
    plateau.addEventListener('pointermove', e => {
      if (!depart) return;
      const dx = e.clientX - depart.x, dy = e.clientY - depart.y;
      if (Math.hypot(dx, dy) > 6) depart.bouge = true;
      if (!depart.bouge) return;
      if (!etroit) inclinaison.y = Math.max(-50, Math.min(50, depart.iy + dx * .25));
      inclinaison.x = Math.max(-10, Math.min(60, depart.ix - dy * .25));
      livre.classList.add('s3d-libre');
      orienter();
    });
    const fin = e => {
      if (!depart) return;
      livre.classList.remove('s3d-libre');
      const dx = e.clientX - depart.x, dy = e.clientY - depart.y;
      // Téléphone : glisser à l'horizontale tourne la page (vers la gauche = page suivante, l'inverse en arabe).
      if (etroit && depart.bouge && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) tourner((dx < 0) !== rtl ? 1 : -1);
      else if (!depart.bouge) {
        if (info.carte) tourner(tournees ? -1 : 1);
        else {
          const r = plateau.getBoundingClientRect();
          const droite = e.clientX > r.left + r.width / 2;
          tourner(droite !== rtl ? 1 : -1);
        }
      }
      depart = null;
    };
    plateau.addEventListener('pointerup', fin);
    plateau.addEventListener('pointercancel', () => { depart = null; livre.classList.remove('s3d-libre'); });
  }

  let retour;
  function ouvrir() {
    if (!scene) creerScene();
    retour = document.activeElement;
    scene.hidden = false;
    document.documentElement.classList.add('s3d-ouvert');
    livre.classList.toggle('s3d-sans-anim', reduit.matches);
    tournees = 0; vue = 0;
    inclinaison = { x: 16, y: reduit.matches ? 0 : -14 };
    construire();
    scene.querySelector('.s3d-fermer').focus();
    // Une légère rotation d'entrée montre que le livret est en volume.
    if (!reduit.matches) requestAnimationFrame(() => requestAnimationFrame(() => { inclinaison.y = 0; orienter(); }));
  }
  function fermer() {
    scene.hidden = true;
    document.documentElement.classList.remove('s3d-ouvert');
    if (retour) retour.focus();
  }

  bouton.addEventListener('click', ouvrir);
})();
