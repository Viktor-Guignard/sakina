// Avant la mise en ligne : ce qui est prêt, ce qui manque.   npm run verifier
// Ne change rien et n'envoie rien. Les secrets en ligne ne sont contrôlés que si
// CLOUDFLARE_API_TOKEN est défini (sinon : « à vérifier dans Cloudflare »).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const R = join(dirname(fileURLToPath(import.meta.url)), '..');
const lire = f => readFileSync(join(R, f), 'utf8');
const toml = lire('wrangler.toml');
const val = cle => (toml.match(new RegExp(`^${cle}\\s*=\\s*"([^"]*)"`, 'm')) || [])[1];
const lignes = [];
const ok = (q, m) => lignes.push(`${q === true ? '✓' : q === false ? '✗' : '•'} ${m}`);

console.log('Sakîna · vérification avant mise en ligne\n');
ok(val('database_id') && !val('database_id').startsWith('a-remplacer'), `Base D1 créée et reliée (wrangler.toml, database_id = ${val('database_id')})`);
ok(!!val('SITE_URL') && !/localhost/.test(val('SITE_URL')), `Adresse du site (SITE_URL = ${val('SITE_URL')})`);
ok(val('LIVRAISON_CENTIMES') !== '' ? true : null, `Frais de livraison (LIVRAISON_CENTIMES = ${val('LIVRAISON_CENTIMES') || 'vide : aucune ligne de livraison'})`);
ok(!!val('ADMIN_EMAIL'), `Adresse qui reçoit les commandes (ADMIN_EMAIL = ${val('ADMIN_EMAIL') || 'vide'})`);
ok(!!val('EXPEDITEUR_EMAIL'), `Expéditeur des courriels (EXPEDITEUR_EMAIL = ${val('EXPEDITEUR_EMAIL') || 'vide'})`);
ok(true, `Migrations de la base : ${readdirSync(join(R, 'migrations')).filter(f => f.endsWith('.sql')).join(', ')}`);

const secrets = ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'ADMIN_JETON', 'SEL_IP', 'BREVO_API_KEY'];
if (process.env.CLOUDFLARE_API_TOKEN) {
  try {
    const sortie = execFileSync(join(R, 'node_modules', '.bin', 'wrangler'), ['pages', 'secret', 'list', '--project-name', 'sakina'], { cwd: R, encoding: 'utf8' });
    for (const s of secrets) ok(sortie.includes(s), `Secret ${s}`);
  } catch (e) { ok(false, 'Lecture des secrets Cloudflare impossible (projet « sakina » créé ? jeton valable ?)'); }
} else ok(null, `Secrets à poser dans Cloudflare : ${secrets.join(', ')}`);

// Contenu
const modeles = lire('modeles.py');
ok(/TARIFS_PAPETERIE = \{\s*#/.test(modeles) ? null : true, /TARIFS_PAPETERIE = \{\s*#/.test(modeles) ? 'Prix de la papeterie à relever (pour l’instant : sur devis)' : 'Prix de la papeterie renseignés');
ok(lire('legal.py').includes('[à compléter]') ? false : true, 'Pages légales complétées et validées par un juriste' + (lire('legal.py').includes('[à compléter]') ? ' (des passages [à compléter] restent)' : ''));
ok(null, 'Textes religieux relus par un imam (dossier : relecture.html)');
ok(/sakina-livrets\.fr/.test(lire('contenu.py')) ? null : true, 'Nom et domaine définitifs (contenu.py, MARQUE) ; SAKINA_SITE au build');

// Le site se construit comme sur Cloudflare
try {
  execFileSync('python3', ['build.py'], { cwd: R, env: { ...process.env, SAKINA_API: '', SAKINA_SITE: val('SITE_URL') || 'https://exemple' }, stdio: 'ignore' });
  const d = readFileSync(join(R, 'site', 'assets', 'js', 'donnees.js'), 'utf8');
  ok(d.includes('"api":""'), 'Le site se construit avec le service de commande branché (SAKINA_API vide)');
  ok(existsSync(join(R, 'site', '_headers')) && existsSync(join(R, 'site', '404.html')), 'En-têtes Cloudflare (_headers) et page 404 générés');
  execFileSync('python3', ['build.py'], { cwd: R, stdio: 'ignore' });   // retour à l'état par défaut
} catch (e) { ok(false, 'Le site ne se construit pas : ' + e.message); }

console.log(lignes.join('\n'));
console.log('\n✓ prêt   ✗ manque   • à faire ou à décider');
