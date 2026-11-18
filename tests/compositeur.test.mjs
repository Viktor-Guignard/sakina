// Test du compositeur dans un navigateur : chaque pièce, sur le site français et le site arabe,
// dans les trois langues de pièce, sur ordinateur et sur un écran d'iPhone.
// Vérifie : aucune erreur JavaScript, rien ne déborde des pages, livrets en multiple de 4 (8 au moins),
// pas de défilement horizontal sur téléphone, filigrane présent, 3D qui s'ouvre et se ferme.
//
//   npm run test:compositeur          (CAPTURES=dossier pour garder les captures téléphone)
import { spawn, execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8798, BASE = `http://127.0.0.1:${PORT}`;
const { chromium, devices } = createRequire(import.meta.url)('playwright');
const env = { ...process.env }; delete env.SAKINA_API;
execFileSync('python3', ['build.py'], { cwd: RACINE, env, stdio: 'ignore' });
const serveur = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', join(RACINE, 'site')], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));

// Les pièces et leurs cérémonies, lues dans les données du site.
const D = JSON.parse((await (await fetch(`${BASE}/assets/js/donnees.js`)).text()).replace(/^[\s\S]*?window\.SAKINA = /, '').replace(/;\s*$/, ''));
const cas = [];
for (const [p, m] of Object.entries(D.modeles)) for (const c of m.ceremonies) cas.push({ p, c, famille: m.famille });

let ok = 0, ko = 0;
const echecs = [];
const navigateur = await chromium.launch();
const ecrans = { ordinateur: { viewport: { width: 1280, height: 860 } }, iphone: devices['iPhone 13'] };

for (const [nomEcran, ecran] of Object.entries(ecrans)) {
  for (const site of ['fr', 'ar']) {
    const ctx = await navigateur.newContext({ ...ecran });
    await ctx.addInitScript(l => { try { localStorage.clear(); localStorage['sakina-langue'] = l; } catch (e) {} }, site);
    const page = await ctx.newPage();
    const erreurs = [];
    page.on('pageerror', e => erreurs.push(e.message));
    // Sur téléphone, une seule langue de pièce (la plus chargée : bilingue) pour aller vite.
    const langues = nomEcran === 'iphone' ? ['bi'] : ['fr', 'bi', 'ar'];
    for (const { p, c, famille } of cas) {
      for (const langue of langues) {
        await page.goto(`${BASE}/${site === 'ar' ? 'ar/' : ''}composer.html?c=${c}&p=${p}`);
        await page.waitForSelector('#apercu .lp-page');
        await page.evaluate(l => {   // choisir la langue de la pièce comme le ferait un client
          const r = document.querySelector(`[name="langue"][value="${l}"]`); r.checked = true; r.dispatchEvent(new Event('input', { bubbles: true }));
        }, langue);
        await page.waitForTimeout(260);
        const r = await page.evaluate(() => {
          const pages = document.querySelectorAll('#apercu .lp-page').length;
          const deborde = [...document.querySelectorAll('#apercu .lp-corps, #apercu .lc-verso-corps, #apercu .lc-menu, #apercu .lc-certif-txt')]
            .filter(z => z.scrollHeight > z.clientHeight + 2).length;
          return { pages, deborde, largeur: document.documentElement.scrollWidth - window.innerWidth,
            filigrane: document.getElementById('apercu').classList.contains('filigrane') };
        });
        const nom = `${nomEcran} · site ${site} · ${p}/${c} · pièce ${langue}`;
        const fautes = [];
        if (erreurs.length) fautes.push('erreur JS : ' + erreurs.splice(0).join(' | '));
        if (r.deborde) fautes.push(`${r.deborde} zone(s) de texte débordent`);
        if (famille === 'livret' && (r.pages % 4 || r.pages < 8)) fautes.push(`${r.pages} pages`);
        if (famille === 'carte' && r.pages !== D.modeles[p].faces) fautes.push(`${r.pages} faces`);
        if (r.largeur > 1) fautes.push(`défilement horizontal de ${r.largeur} px`);
        if (!r.filigrane) fautes.push('pas de filigrane');
        if (fautes.length) { ko++; echecs.push(`${nom} : ${fautes.join(' ; ')}`); } else ok++;
      }
      if (nomEcran === 'iphone' && process.env.CAPTURES && ['livret', 'nuits', 'faire_part', 'certificat'].includes(p) && c === D.modeles[p].ceremonies[0])
        await page.screenshot({ path: join(process.env.CAPTURES, `iphone-${site}-${p}.png`), fullPage: false });
    }
    // La 3D, une fois par écran et par site.
    await page.goto(`${BASE}/${site === 'ar' ? 'ar/' : ''}composer.html?c=nikah&p=livret`);
    await page.waitForSelector('#apercu .lp-page');
    await page.click('#voir-3d');
    await page.waitForTimeout(400);
    await page.click('.s3d-suiv');
    await page.waitForTimeout(1100);
    const t3d = await page.evaluate(() => { const l = document.querySelector('.s3d-livre').getBoundingClientRect();
      return { feuilles: document.querySelectorAll('.s3d-feuille').length, filigrane: document.querySelector('.s3d-livre').classList.contains('filigrane'),
        dansEcran: l.left >= -2 && l.right <= window.innerWidth + 2, largeurPage: document.documentElement.scrollWidth - window.innerWidth }; });
    if (process.env.CAPTURES && nomEcran === 'iphone') await page.screenshot({ path: join(process.env.CAPTURES, `iphone-${site}-3d.png`) });
    await page.keyboard.press('Escape');
    const ferme = await page.isHidden('#scene-3d');
    if (t3d.feuilles >= 4 && t3d.filigrane && t3d.dansEcran && t3d.largeurPage <= 1 && ferme && !erreurs.length) ok++; else { ko++; echecs.push(`${nomEcran} · site ${site} · 3D : ${JSON.stringify({ ...t3d, ferme, erreurs })}`); }
    await ctx.close();
  }
}
await navigateur.close();
serveur.kill();
echecs.forEach(e => console.log('  ✗', e));
console.log(`\n${ok} réussis, ${ko} échoués (${cas.length} pièces × cérémonies)`);
process.exit(ko ? 1 : 0);
