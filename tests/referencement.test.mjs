// Référencement : contrôle des pages générées (sans navigateur).
// Chaque page publique : titre unique, description de 70 à 200 caractères, adresse canonique absolue,
// versions FR/AR réciproques (hreflang), image de partage existante, données structurées lisibles.
// Les pages privées (suivi, administration, brouillons) : « noindex » et absentes du plan du site.
//   npm run test:referencement
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..'), SITE = join(RACINE, 'site');
const BASE = 'https://exemple.sakina.test';
execFileSync('python3', ['build.py'], { cwd: RACINE, env: { ...process.env, SAKINA_SITE: BASE }, stdio: 'ignore' });

const PRIVEES = ['suivi.html', 'admin.html', 'relecture.html', 'mentions-legales.html', 'cgv.html', 'confidentialite.html', '404.html'];
const fichiers = [...readdirSync(SITE).filter(f => f.endsWith('.html')), ...readdirSync(join(SITE, 'ar')).filter(f => f.endsWith('.html')).map(f => 'ar/' + f)];
const plan = readFileSync(join(SITE, 'sitemap.xml'), 'utf8');
const attr = (html, re) => (html.match(re) || [])[1];
const echecs = [], titres = new Map(), canoniques = new Map();

for (const f of fichiers) {
  const html = readFileSync(join(SITE, f), 'utf8'), nom = f.replace(/^ar\//, '');
  const prive = PRIVEES.includes(nom), faute = m => echecs.push(`${f} : ${m}`);
  const titre = attr(html, /<title>([^<]*)<\/title>/), desc = attr(html, /<meta name="description" content="([^"]*)"/);
  const canon = attr(html, /<link rel="canonical" href="([^"]*)"/);
  const url = `${BASE}/${f}`.replace(/\/index\.html$/, '/');
  if (!canon || canon !== url) faute(`canonique ${canon} au lieu de ${url}`);
  canoniques.set(canon, f);
  if (prive) {
    if (!/<meta name="robots" content="noindex/.test(html)) faute('page privée sans noindex');
    if (plan.includes(`/${f}<`)) faute('page privée dans le plan du site');
    continue;
  }
  if (!titre) faute('sans titre'); else if (titres.has(titre)) faute(`titre en double avec ${titres.get(titre)}`); else titres.set(titre, f);
  if (!desc || desc.length < 70 || desc.length > 200) faute(`description de ${desc ? desc.length : 0} caractères`);
  if (/<meta name="robots" content="noindex/.test(html)) faute('page publique en noindex');
  if (!plan.includes(`<loc>${url}</loc>`) && !plan.includes(`<loc>${BASE}/${f}</loc>`)) faute('absente du plan du site');
  const image = attr(html, /<meta property="og:image" content="([^"]*)"/);
  if (!image || !existsSync(join(SITE, image.replace(BASE + '/', '')))) faute(`image de partage introuvable : ${image}`);
  for (const [, j] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { const d = JSON.parse(j); if (!d['@context'] || !d['@type']) faute('données structurées incomplètes'); } catch (e) { faute('données structurées illisibles'); }
  }
  // hreflang réciproque
  const alt = [...html.matchAll(/<link rel="alternate" hreflang="(fr|ar)" href="([^"]*)"/g)].map(m => [m[1], m[2]]);
  for (const [langue, href] of alt) {
    const cible = href.replace(BASE + '/', '').replace(/\/$/, '/index.html').replace(/^$/, 'index.html') || 'index.html';
    const chemin = join(SITE, cible.endsWith('/') ? cible + 'index.html' : cible);
    if (!existsSync(chemin)) { faute(`hreflang ${langue} vers une page absente : ${href}`); continue; }
    const retour = readFileSync(chemin, 'utf8');
    if (!retour.includes(`hreflang="${f.startsWith('ar/') ? 'ar' : 'fr'}" href="${url}"`)) faute(`hreflang ${langue} non réciproque`);
  }
}
if (!/Sitemap: https?:\/\//.test(readFileSync(join(SITE, 'robots.txt'), 'utf8'))) echecs.push('robots.txt sans plan du site');
// Le site est régénéré avec l'adresse par défaut.
execFileSync('python3', ['build.py'], { cwd: RACINE, stdio: 'ignore' });
echecs.forEach(e => console.log('  ✗', e));
console.log(`\nRéférencement : ${fichiers.length} pages contrôlées, ${echecs.length} problème(s)`);
process.exit(echecs.length ? 1 : 0);
