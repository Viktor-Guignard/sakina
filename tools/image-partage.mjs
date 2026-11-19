// Fabrique les images de partage (Open Graph, 1200 × 630) : assets/img/partage-fr.jpg et partage-ar.jpg.
// À relancer si la charte ou les motifs changent :  node tools/image-partage.mjs
// Trois couvertures posées à plat, côte à côte (jamais en éventail), sur le bleu de nuit.
import { spawn, execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8796, BASE = `http://127.0.0.1:${PORT}`;
const { chromium } = createRequire(import.meta.url)('playwright');
execFileSync('python3', ['build.py'], { cwd: RACINE, stdio: 'ignore' });
const serveur = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', join(RACINE, 'site')], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 700));
const D = JSON.parse((await (await fetch(`${BASE}/assets/js/donnees.js`)).text()).replace(/^[\s\S]*?window\.SAKINA = /, '').replace(/;\s*$/, ''));

const couv = (cle, titre, noms) => D.motifs[cle].svg.replace('@@PHRASE@@', D.motifs[cle].svg.includes('@@PHRASE@@') ? phrase(cle) : '')
  .replace('@@TAILLE@@', phrase(cle).length > 14 ? 11 : 15).replace('@@TITRE@@', titre).replace('@@NOMS@@', noms).replace('@@DATE@@', '');
// Étoile à huit branches (khâtam), même tracé que couvertures.py.
const etoile = (cx, cy, R, k = .765) => Array.from({ length: 16 }, (_, i) => {
  const r = i % 2 ? R * k : R, a = -Math.PI / 2 + i * Math.PI / 8;
  return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
}).join(' ');
const phrase = cle => ({ alhambra: 'بارك الله لكما', medine: 'ختم القرآن', nuit: 'رمضان كريم' })[cle];

const TXT = {
  fr: { dir: 'ltr', nom: 'Sakîna', second: 'سكينة', ligne: 'Livrets et papeterie<br>des cérémonies musulmanes', bas: 'Nikâh · Aqîqa · Hajj · Ramadan · Aïd · Janâza',
        couvs: [['alhambra', 'Nikâh', 'Yasmine &amp; Karim'], ['medine', "Khatm al-Qur'ân", 'Adam'], ['nuit', 'Iftar', 'Famille Benali']] },
  ar: { dir: 'rtl', nom: 'سكينة', second: 'Sakîna', ligne: 'كتيّبات وأوراق<br>المناسبات الإسلامية', bas: 'النكاح · العقيقة · الحج · رمضان · العيد · الجنازة',
        couvs: [['alhambra', 'عقد النكاح', 'ياسمين وكريم'], ['medine', 'ختم القرآن', 'آدم'], ['nuit', 'إفطار', 'عائلة بن علي']] },
};

const navigateur = await chromium.launch();
for (const [l, x] of Object.entries(TXT)) {
  const page = await navigateur.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/${l === 'ar' ? 'ar/' : ''}index.html`);   // pour charger les polices du site
  await page.setContent(`<!doctype html><html lang="${l}" dir="${x.dir}"><head><meta charset="utf-8">
    <link rel="stylesheet" href="${BASE}/assets/css/polices.css"><style>
    body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: radial-gradient(120% 120% at 20% 30%, #1B3F6E, #0F2747 60%, #0A1B33);
      color: #fff; font-family: ${l === 'ar' ? "'IBM Plex Sans Arabic'" : 'Manrope'}, sans-serif; display: grid; grid-template-columns: 480px 1fr; align-items: center; }
    .texte { padding: 0 56px; }
    .signe { width: 64px; height: 77px; }
    .nom { margin: 18px 0 0; font: 400 ${l === 'ar' ? '84px/1.2 Amiri' : '78px/1 Marcellus'}, serif; }
    .second { margin: 6px 0 0; font: 400 ${l === 'ar' ? '34px Marcellus' : '40px/1.3 Amiri'}, serif; color: #A8DCD5; }
    .ligne { margin: 26px 0 0; font-size: ${l === 'ar' ? 30 : 28}px; line-height: 1.45; color: #DCEAE6; }
    .bas { margin: 26px 0 0; font-size: 17px; color: #A8DCD5; }
    .couvs { display: flex; gap: 22px; align-items: flex-end; justify-content: center; padding-inline-end: 40px; }
    .couvs div { width: 196px; height: 278px; box-shadow: 0 24px 40px -18px rgba(0,0,0,.6); background: #fff; }
    .couvs div:nth-child(2) { width: 214px; height: 303px; }
    .couvs svg { width: 100%; height: 100%; display: block; }
    </style></head><body>
    <div class="texte">
      <svg class="signe" viewBox="0 0 40 48"><path d="M2 46V20.5C2 11.6 9.9 5.8 20 2C30.1 5.8 38 11.6 38 20.5V46Z" fill="none" stroke="#fff" stroke-width="2"/>
        <polygon points="${etoile(20, 27, 9)}" fill="#2E9C95"/></svg>
      <p class="nom">${x.nom}</p><p class="second">${x.second}</p>
      <p class="ligne">${x.ligne}</p><p class="bas">${x.bas}</p>
    </div>
    <div class="couvs">${x.couvs.map(([k, t, n]) => `<div>${couv(k, t, n)}</div>`).join('')}</div>
    </body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(RACINE, 'assets', 'img', `partage-${l}.jpg`), type: 'jpeg', quality: 88 });
  await page.close();
}
await navigateur.close();
serveur.kill();
console.log('Images de partage : assets/img/partage-fr.jpg, assets/img/partage-ar.jpg');
