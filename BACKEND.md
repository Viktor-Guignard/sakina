# Sakîna : mise en ligne du service de commande

Tout est prêt et testé en local (`npm test`). Il ne reste qu'à **créer les comptes et poser les clés**,
ensemble (Viktor + Claude). Rien n'est en ligne tant que ce n'est pas fait.

`npm run verifier` affiche à tout moment ce qui est prêt (✓), ce qui manque (✗) et ce qui reste à décider (•).

## Ce qui existe déjà

- **Site** : `python3 build.py` → `site/` (FR + AR), avec `_headers` (cache, sécurité), `404.html`, `sitemap.xml`, `robots.txt`.
- **Service** (`functions/`, Cloudflare Pages Functions) et **base** D1 (`migrations/`) :
  commandes, paiement Stripe Checkout, webhook signé, suivi client et validation de l'épreuve,
  administration (`admin.html` : commandes, messages, aperçu des courriels, relance des épreuves),
  formulaire de contact.
- **Courriels** (`functions/_lib/courriel.js`) : 10 messages clients FR/AR + alertes à l'administration.
  Sans clé Brevo, rien ne part : chaque envoi est noté dans l'historique de la commande.
- **Rappel d'épreuve** chaque matin : `.github/workflows/rappels.yml` (inactif sans secrets).
- **Tests** : `npm test` (commande de bout en bout avec un faux Stripe, compositeur, accessibilité, référencement).

## Ce qu'il reste à faire (dans l'ordre)

1. **Compte Cloudflare** dédié à Sakîna, puis `npx wrangler login`.
2. **Base** : `npx wrangler d1 create sakina` → recopier `database_id` dans `wrangler.toml`,
   puis `npx wrangler d1 migrations apply sakina --remote`.
3. **Projet Pages** relié au dépôt GitHub `Viktor-Guignard/sakina`, branche `main` :
   - commande de build : `SAKINA_API= SAKINA_SITE=https://<domaine> python3 build.py`
   - dossier publié : `site`
4. **Réglages** dans `wrangler.toml` (`[vars]`) : `SITE_URL` (le domaine), `ADMIN_EMAIL`, `EXPEDITEUR_EMAIL`,
   `LIVRAISON_CENTIMES` (ex. `690` pour 6,90 €), `PAYS_LIVRAISON`.
5. **Clés secrètes** (jamais dans le dépôt) : `npx wrangler pages secret put NOM --project-name sakina`
   - `ADMIN_JETON` : mot de passe de l'administration, 16 caractères au moins
   - `SEL_IP` : une phrase au hasard
   - `STRIPE_SECRET_KEY` : compte Stripe **de Sakîna** (distinct de livretsdemesse)
   - `STRIPE_WEBHOOK_SECRET` : voir l'étape 6
   - `BREVO_API_KEY` : envoi des courriels (compte Brevo, domaine d'envoi vérifié)
6. **Stripe** : ajouter un webhook vers `https://<domaine>/api/stripe/webhook`, événements
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired` ;
   recopier son secret (`whsec_…`) dans `STRIPE_WEBHOOK_SECRET`. Faire d'abord un essai en mode test.
7. **Cloudflare Access** sur `/admin.html` et `/api/admin/*` (seule l'adresse de Viktor) : double protection.
8. **Rappels** : dans GitHub, Settings > Secrets, ajouter `SAKINA_URL` et `ADMIN_JETON`.
9. **Domaine** : le relier au projet Pages ; puis Google Search Console (envoyer `sitemap.xml`).
10. **Avant la première vente** : pages légales validées par un juriste (`legal.py`), textes religieux relus
    (`relecture.html`), prix de la papeterie relevés (`modeles.py`, `TARIFS_PAPETERIE`), imprimeur choisi.

## Parcours d'une commande

Composer → « Le faire imprimer » → nom + e-mail → paiement Stripe (adresse de livraison recueillie par Stripe)
→ webhook : « payée » → l'administration prépare l'épreuve (fichier sans filigrane : « Fichier pour l'imprimeur »)
et colle le lien de l'épreuve → le client valide ou demande une correction → « en impression » → « expédiée »
(avec numéro de suivi). Pièce sans prix : demande de devis → l'administration fixe le prix → le client paie
depuis sa page de suivi. Statuts et passages permis : `functions/_lib/statuts.js`.

## Routes

| Route | Rôle |
|---|---|
| `POST /api/commandes` | créer une commande (paiement ou devis) ; prix toujours recalculé côté serveur |
| `GET/POST /api/commandes/:id?j=…` | suivi client ; valider/corriger l'épreuve ; payer un devis |
| `POST /api/stripe/webhook` | confirmation Stripe (signature vérifiée, événements dédoublonnés) |
| `POST /api/contact` | message de la page Contact |
| `/api/admin/…` | commandes, messages, courriels (aperçu), rappels — mot de passe `ADMIN_JETON` |

Protections : prix recalculé, montant payé vérifié, jeton secret par commande, limites par adresse IP
(seule une empreinte salée est gardée), piège à robots, taille des envois limitée, en-têtes de sécurité.
