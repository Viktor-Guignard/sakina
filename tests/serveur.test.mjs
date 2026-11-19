// Test de bout en bout du service de commande, sans aucun compte réel :
// un faux Stripe local, la base D1 locale (dossier temporaire), le site servi par
// `wrangler pages dev`, et un navigateur (Playwright) qui commande comme un client.
//
//   npm test
//
// Rien ne sort de la machine : ni paiement, ni courriel (pas de clé Brevo).
import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHmac } from 'node:crypto';
import { createRequire } from 'node:module';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 8799, PORT_STRIPE = 12111, BASE = `http://127.0.0.1:${PORT}`;
const ADMIN = 'jeton-de-test-assez-long-123', WHSEC = 'whsec_test_sakina';
const ETAT = mkdtempSync(join(tmpdir(), 'sakina-test-'));
const { chromium } = createRequire(import.meta.url)('playwright');

let ok = 0, ko = 0;
const verifier = (cond, quoi) => { if (cond) { ok++; console.log('  ✓', quoi); } else { ko++; console.log('  ✗', quoi); } };

// ---------------------------------------------------------------- faux Stripe
const sessions = [];
const fauxStripe = createServer((req, res) => {
  let corps = '';
  req.on('data', c => { corps += c; });
  req.on('end', () => {
    if (req.method === 'POST' && req.url === '/v1/checkout/sessions') {
      const p = new URLSearchParams(corps);
      const s = { id: 'cs_test_' + (sessions.length + 1), url: `${BASE}/index.html?faux-stripe=${sessions.length + 1}`, params: p, auth: req.headers.authorization };
      sessions.push(s);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ id: s.id, url: s.url }));
    }
    res.writeHead(404); res.end('{}');
  });
}).listen(PORT_STRIPE);

function webhook(evenement, secret = WHSEC) {
  const corps = JSON.stringify(evenement), t = Math.floor(Date.now() / 1000);
  const sig = createHmac('sha256', secret).update(`${t}.${corps}`).digest('hex');
  return fetch(`${BASE}/api/stripe/webhook`, { method: 'POST', body: corps, headers: { 'Stripe-Signature': `t=${t},v1=${sig}`, 'Content-Type': 'application/json' } });
}
const admin = (chemin, options = {}) => fetch(`${BASE}/api/admin/${chemin}`, { ...options, headers: { Authorization: `Bearer ${ADMIN}`, 'Content-Type': 'application/json' } });

// ---------------------------------------------------------------- serveur local
const env = { ...process.env, SAKINA_API: '', SAKINA_SITE: BASE, NO_PROXY: '127.0.0.1,localhost', no_proxy: '127.0.0.1,localhost', WRANGLER_SEND_METRICS: 'false' };
execFileSync('python3', ['build.py'], { cwd: RACINE, env, stdio: 'inherit' });
const wrangler = join(RACINE, 'node_modules', '.bin', 'wrangler');
execFileSync(wrangler, ['d1', 'migrations', 'apply', 'sakina', '--local', '--persist-to', ETAT], { cwd: RACINE, env, stdio: 'ignore' });
const serveur = spawn(wrangler, ['pages', 'dev', 'site', '--port', String(PORT), '--ip', '127.0.0.1', '--persist-to', ETAT,
  '--binding', `STRIPE_SECRET_KEY=sk_test_faux`, '--binding', `STRIPE_WEBHOOK_SECRET=${WHSEC}`, '--binding', `ADMIN_JETON=${ADMIN}`,
  '--binding', `STRIPE_API=http://127.0.0.1:${PORT_STRIPE}`, '--binding', `SITE_URL=${BASE}`, '--binding', 'LIVRAISON_CENTIMES=690'],
  { cwd: RACINE, env, stdio: ['ignore', 'pipe', 'pipe'] });
let journalServeur = '';
serveur.stdout.on('data', d => { journalServeur += d; });
serveur.stderr.on('data', d => { journalServeur += d; });
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(`${BASE}/index.html`)).ok) break; } catch (e) { /* pas encore prêt */ }
  await new Promise(r => setTimeout(r, 500));
}

try {
  console.log('Commande d’un livret, du compositeur au paiement');
  const navigateur = await chromium.launch();
  const page = await navigateur.newPage();
  await page.addInitScript(() => { localStorage['sakina-langue'] = 'fr'; });
  const erreursPage = [];
  page.on('pageerror', e => erreursPage.push(e.message));
  await page.goto(`${BASE}/composer.html?c=nikah&p=livret`);
  await page.waitForTimeout(800);
  await page.click('#progression li:last-child button');
  await page.selectOption('#f-quantite', '100');
  const prixAffiche = await page.textContent('#devis-prix');
  await page.click('#commander');
  await page.fill('[name=c_nom]', 'Yasmine Test');
  await page.fill('[name=c_email]', 'yasmine@example.org');
  await page.check('[name=c_relecture]');
  await Promise.all([page.waitForURL(/faux-stripe=1/, { timeout: 15000 }), page.click('#envoyer-commande')]);
  verifier(sessions.length === 1, 'le compositeur ouvre un paiement Stripe');
  const s = sessions[0];
  const id = s.params.get('client_reference_id');
  verifier(/^SK-[A-Z0-9]{8}$/.test(id), `identifiant de commande lisible (${id})`);
  verifier(s.auth === 'Bearer sk_test_faux', 'la clé Stripe part dans l’en-tête');
  const affiche = Math.round(parseFloat(prixAffiche.replace(/\s/g, '').replace(',', '.')) * 100);
  verifier(affiche === 21600 && s.params.get('line_items[0][price_data][unit_amount]') === String(affiche),
    `le serveur recalcule le même prix qu’à l’écran : 3 × 59,99 € HT × 1,2 → 216 € pour 8 p. × 100`);
  verifier(s.params.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]') === '690', 'frais de livraison ajoutés');
  verifier(s.params.get('shipping_address_collection[allowed_countries][0]') === 'FR', 'Stripe recueille l’adresse de livraison');

  const commande = await (await admin(`commandes/${id}`)).json();
  verifier(commande.statut === 'attente_paiement' && commande.relecture === 1, 'commande enregistrée en attente de paiement');

  console.log('Webhook Stripe');
  const evenement = { id: 'evt_1', type: 'checkout.session.completed', data: { object: { id: s.id, client_reference_id: id, metadata: { commande: id },
    payment_status: 'paid', amount_total: 22290, payment_intent: 'pi_1', customer_details: { email: 'yasmine@example.org', phone: '+33600000000' },
    collected_information: { shipping_details: { name: 'Yasmine Test', address: { line1: '1 rue de la Paix', postal_code: '75002', city: 'Paris', country: 'FR' } } } } } };
  verifier((await webhook(evenement, 'whsec_faux')).status === 400, 'signature fausse refusée');
  verifier((await webhook(evenement)).ok, 'signature juste acceptée');
  const deux = await (await webhook(evenement)).json();
  verifier(deux.deja === true, 'un événement reçu deux fois n’est traité qu’une fois');
  const payee = await (await admin(`commandes/${id}`)).json();
  verifier(payee.statut === 'payee' && payee.adresse.livraison.address.city === 'Paris', 'commande payée, adresse enregistrée');

  console.log('Suivi par le client');
  await page.goto(s.params.get('success_url'));
  await page.waitForSelector('#suivi-contenu:not([hidden])');
  verifier((await page.textContent('#suivi-statut')).includes('Payée'), 'la page de suivi affiche « Payée »');
  const r404 = await fetch(`${BASE}/api/commandes/${id}?j=mauvais`);
  verifier(r404.status === 404, 'un mauvais jeton ne montre rien');

  console.log('Épreuve : envoyée par l’administration, validée par le client');
  verifier((await fetch(`${BASE}/api/admin/commandes`)).status === 401, 'administration fermée sans mot de passe');
  const lienEpreuve = `${BASE}/composer.html#l=` + Buffer.from(JSON.stringify({ ...payee.etat, noms: 'Yasmine & Karim B.' })).toString('base64url');
  const r = await admin(`commandes/${id}`, { method: 'PATCH', body: JSON.stringify({ statut: 'epreuve_envoyee', lien_epreuve: lienEpreuve, message: 'Relue par l’imam.' }) });
  verifier(r.ok && (await r.json()).etat.noms === 'Yasmine & Karim B.', 'épreuve déposée (pièce corrigée)');
  const saut = await admin(`commandes/${id}`, { method: 'PATCH', body: JSON.stringify({ statut: 'expediee' }) });
  verifier(saut.status === 409, 'on ne saute pas d’étape (épreuve → expédiée refusé)');
  await page.reload();
  await page.waitForSelector('#suivi-epreuve:not([hidden])');
  verifier((await page.getAttribute('#voir-epreuve', 'href')).startsWith('composer.html?lecture=1#l='), 'le client peut ouvrir l’épreuve');
  await page.click('#valider');
  await page.waitForFunction(() => document.getElementById('suivi-statut').textContent.includes('validée'));
  verifier(true, 'le client valide l’épreuve');
  const histo = (await (await admin(`commandes/${id}`)).json()).historique.map(e => e.type);
  verifier(histo.includes('epreuve_validee') && histo.includes('courriel_non_envoye'), 'historique tenu (courriels notés, non envoyés sans clé)');

  console.log('Pièce sur devis (papeterie sans grille de prix)');
  const devis = await fetch(`${BASE}/api/commandes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
    etat: { c: 'nikah', p: 'faire_part', langue: 'bi', noms: 'Y & K' }, pages: 2, quantite: 100, site: 'fr', contact: { nom: 'Test', email: 'test@example.org' } }) });
  const dv = await devis.json();
  verifier(devis.ok && dv.url.includes('suivi.html') && sessions.length === 1, 'un faire-part part en devis, sans paiement');
  const prixFixe = await admin(`commandes/${dv.id}`, { method: 'PATCH', body: JSON.stringify({ statut: 'attente_paiement', montant: 8900 }) });
  verifier(prixFixe.ok, 'l’administration fixe le prix');
  const jetonDevis = new URL(dv.url).searchParams.get('j');
  const payer = await (await fetch(`${BASE}/api/commandes/${dv.id}?j=${jetonDevis}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"action":"payer"}' })).json();
  verifier(payer.url && sessions[1].params.get('line_items[0][price_data][unit_amount]') === '8900', 'le client règle le devis en ligne');

  console.log('Refus');
  const post = corps => fetch(`${BASE}/api/commandes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) });
  const base = { etat: { c: 'nikah', p: 'livret' }, pages: 8, quantite: 50, site: 'fr', contact: { nom: 'A', email: 'a@example.org' } };
  verifier((await post({ ...base, pages: 7 })).status === 400, 'nombre de pages impossible refusé');
  verifier((await post({ ...base, quantite: 33 })).status === 400, 'quantité non proposée refusée');
  verifier((await post({ ...base, etat: { c: 'janaza', p: 'menu' } })).status === 400, 'pièce hors cérémonie refusée');
  verifier((await post({ ...base, contact: { nom: 'A', email: 'pas-un-email' } })).status === 400, 'e-mail invalide refusé');
  verifier((await post({ ...base, etat: { c: 'nikah', p: 'faire_part' }, pages: 2, contact: { nom: 'Gagnez https://arnaque.example', email: 'victime@example.org' } })).status === 400,
    'un nom contenant un lien est refusé (le service n’écrit pas de liens à des inconnus)');
  for (let i = 0; i < 5; i++) await post({ ...base, etat: { c: 'nikah', p: 'faire_part' }, pages: 2, contact: { nom: 'Répété', email: 'repete@example.org' } });
  verifier((await post({ ...base, etat: { c: 'nikah', p: 'faire_part' }, pages: 2, contact: { nom: 'Répété', email: 'repete@example.org' } })).status === 400,
    'au plus 5 demandes par jour pour une même adresse');
  const bizarre = await (await post({ ...base, etat: { c: 'nikah', p: 'faire_part', m: '<script>', textes: ['rum21', 'inconnu'], noms: 'x'.repeat(5000), pirate: 1 }, pages: 2,
    contact: { nom: 'Propre', email: 'propre@example.org' } })).json();
  const enBase = (await (await admin(`commandes/${bizarre.id}`)).json()).etat;
  verifier(enBase.m === 'alhambra' && enBase.textes.join() === 'rum21' && enBase.noms.length === 120 && !('pirate' in enBase), 'la pièce reçue est nettoyée avant d’être enregistrée');
  const pieges = sessions.length;
  verifier((await post({ ...base, site_web: 'http://spam' })).ok && sessions.length === pieges, 'robot piégé sans commande');

  console.log('Courriels');
  const ap = await (await admin('courriels?type=epreuve&langue=ar')).json();
  verifier(ap.types.length >= 10 && ap.html.includes('dir="rtl"') && ap.sujet.includes('SK-EXEMPLE1'), `aperçu des courriels (${ap.types.length} modèles, arabe de droite à gauche)`);
  const histoAvant = (await (await admin(`commandes/${id}`)).json()).historique.filter(e => e.type === 'courriel_non_envoye').length;
  verifier(histoAvant >= 3, `chaque étape écrit au client (${histoAvant} courriels prêts, non envoyés sans clé Brevo)`);
  const rap = await (await admin('rappels', { method: 'POST' })).json();
  verifier(Array.isArray(rap.relances) && !rap.relances.includes(id), 'rappels : une épreuve validée n’est pas relancée');

  console.log('Page introuvable');
  const p404 = await fetch(`${BASE}/une/adresse/qui/n-existe/pas`);
  const t404 = await p404.text();
  verifier(p404.status === 404 && t404.includes('<base href="/">') && /n’existe pas/.test(t404), 'une adresse inconnue renvoie la page 404 (statut 404, styles et liens justes)');
  const p404ar = await fetch(`${BASE}/ar/n-existe-pas`);
  verifier(p404ar.status === 404 && (await p404ar.text()).includes('هذه الصفحة غير موجودة'), 'et en arabe sous ar/');

  console.log('Page Contact');
  await page.goto(`${BASE}/contact.html`);
  await page.fill('#contact [name=nom]', 'Samira');
  await page.fill('#contact [name=email]', 'samira@example.org');
  await page.selectOption('#contact [name=sujet]', 'janaza');
  await page.fill('#contact [name=message]', 'Bonjour, pour une janâza demain : quel délai ?');
  await page.click('#contact button');
  await page.waitForFunction(() => /reçu/.test(document.getElementById('contact-message').textContent));
  const msgs = await (await admin('messages')).json();
  verifier(msgs.messages.some(m => m.nom === 'Samira' && m.sujet === 'janaza') && msgs.non_lus >= 1, 'le message de contact arrive dans l’administration');
  const vide = await fetch(`${BASE}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nom: 'A', email: 'a@example.org', message: '' }) });
  verifier(vide.status === 400, 'message vide refusé');

  console.log('Page d’administration');
  await page.goto(`${BASE}/admin.html`);
  await page.fill('[name=jeton]', 'mauvais-mot-de-passe');
  await page.click('#admin-connexion button');
  await page.waitForFunction(() => document.getElementById('admin-message').textContent.length > 0);
  verifier(await page.isHidden('#admin-app'), 'mauvais mot de passe : rien ne s’affiche');
  await page.fill('[name=jeton]', ADMIN);
  await page.click('#admin-connexion button');
  await page.waitForSelector('.admin-ligne');
  verifier((await page.locator('.admin-ligne').count()) >= 2, 'la liste des commandes s’affiche');
  await page.click(`.admin-ligne[data-id="${id}"]`);
  await page.waitForSelector('#admin-detail h2');
  verifier((await page.textContent('#admin-detail')).includes('Paris'), 'le détail montre l’adresse de livraison');
  verifier((await page.locator('#admin-detail button[data-statut="en_impression"]').count()) === 1, 'l’étape suivante est proposée (en impression)');
  await page.click('[data-messages]');
  await page.waitForSelector('.admin-message');
  await page.click('.admin-message [data-lu]');
  await page.waitForFunction(() => document.querySelector('[data-messages] small').textContent.startsWith('0'));
  verifier(true, 'messages lus dans l’administration, puis marqués lus');
  if (process.env.CAPTURES) await page.screenshot({ path: join(process.env.CAPTURES, 'admin.png'), fullPage: true });

  verifier(erreursPage.length === 0, 'aucune erreur JavaScript dans les pages' + (erreursPage.length ? ' : ' + erreursPage.join(' | ') : ''));
  await navigateur.close();
} catch (e) {
  ko++;
  console.log('ÉCHEC :', e.message);
  console.log(journalServeur.slice(-3000));
} finally {
  serveur.kill();
  fauxStripe.close();
  rmSync(ETAT, { recursive: true, force: true });
  // Le site est régénéré sans service de commande, comme en ligne aujourd'hui.
  const sansApi = { ...process.env }; delete sansApi.SAKINA_API;
  execFileSync('python3', ['build.py'], { cwd: RACINE, env: sansApi, stdio: 'ignore' });
  console.log(`\n${ok} réussis, ${ko} échoués`);
  process.exit(ko ? 1 : 0);
}
