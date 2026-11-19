// Audit d'accessibilité (axe-core, règles WCAG 2 A et AA) des pages principales, en français et en arabe.
//   npm run test:accessibilite
import { spawn, execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8797, BASE = `http://127.0.0.1:${PORT}`;
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axe = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const env = { ...process.env }; delete env.SAKINA_API;
execFileSync('python3', ['build.py'], { cwd: RACINE, env, stdio: 'ignore' });
const serveur = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', join(RACINE, 'site')], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 800));

const pages = ['index.html', 'composer.html', 'ceremonies.html', 'ceremonie-nikah.html', 'motifs.html', 'respect.html', 'suivi.html', 'cgv.html', 'papeterie.html', 'carnet-du-pelerin-hajj.html', 'questions-frequentes.html', 'comment-ca-marche.html', 'contact.html'];
let ko = 0;
const navigateur = await chromium.launch();
for (const u of [...pages, ...pages.map(p => 'ar/' + p)]) {
  const p = await navigateur.newPage();
  await p.addInitScript(l => { try { localStorage['sakina-langue'] = l; } catch (e) {} }, u.startsWith('ar/') ? 'ar' : 'fr');
  await p.goto(`${BASE}/${u}`);
  await p.waitForTimeout(500);
  await p.addScriptTag({ content: axe });
  const v = await p.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] })).violations
    .map(x => `${x.id} (${x.impact}) ×${x.nodes.length} : ${x.nodes.slice(0, 2).map(n => n.target.join(' ')).join(' | ')}`));
  // Aucune page ne doit défiler de côté (piège classique du site arabe, de droite à gauche).
  const cote = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  if (cote > 1) v.push(`la page défile de côté sur ${cote} px`);
  if (v.length) { ko++; console.log('  ✗', u, '\n     ' + v.join('\n     ')); }
  await p.close();
}
await navigateur.close();
serveur.kill();
console.log(`\nAccessibilité : ${pages.length * 2 - ko} pages sans erreur, ${ko} avec erreurs`);
process.exit(ko ? 1 : 0);
