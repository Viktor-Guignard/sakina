# Bascule de GitHub Pages vers Cloudflare (à faire ensemble, Viktor + Claude)

Aujourd'hui le site est publié par GitHub Pages (`pages.yml`, à chaque push sur `main`), sans service
de commande. La bascule le met sur Cloudflare Pages, avec le service (commandes, paiement, courriels).
**Rien n'est basculé tant que Viktor n'a pas dit « oui » à chaque étape.** Durée : environ une heure.

## 0. Avant (Viktor, depuis le téléphone)

- Créer un compte Cloudflare **dédié à Sakîna** (adresse e-mail de Sakîna, pas celle d'un autre projet).
- Avoir sous la main : le compte Stripe de Sakîna (mode test d'abord), un compte Brevo, le domaine (si choisi).

## 1. Créer le projet et la base (Claude guide, Viktor clique)

1. Cloudflare > Workers & Pages > Créer > Pages > « Direct Upload » : nom du projet **`sakina`** (sans relier Git :
   c'est le workflow `cloudflare.yml` qui publie, après les tests).
2. Cloudflare > Mon profil > Jetons d'API > « Modifier Cloudflare Workers » (droits Pages + D1) → copier le jeton.
3. Dans GitHub > `Viktor-Guignard/sakina` > Settings > Secrets and variables > Actions :
   - secrets : `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (visible sur la page d'accueil Cloudflare) ;
   - variable : `SAKINA_SITE` = `https://sakina.pages.dev` (puis le domaine définitif).
4. Base : `npx wrangler d1 create sakina` (ou depuis le tableau de bord D1) → `database_id` dans `wrangler.toml`.

## 2. Les clés (voir BACKEND.md, étape 5)

`ADMIN_JETON`, `SEL_IP`, `STRIPE_SECRET_KEY` (clé **de test** d'abord), `STRIPE_WEBHOOK_SECRET`, `BREVO_API_KEY` :
Cloudflare > projet `sakina` > Paramètres > Variables et secrets. Et dans `wrangler.toml` : `SITE_URL`,
`ADMIN_EMAIL`, `EXPEDITEUR_EMAIL`, `LIVRAISON_CENTIMES`. Puis `npm run verifier` : tout doit être ✓.

## 3. Premier déploiement, sans toucher au site actuel

- Fusionner la branche `travail` dans `main` (avec l'accord de Viktor). Le push sur `main` lance **les deux**
  publications : GitHub Pages (site actuel, inchangé pour les visiteurs) et Cloudflare (nouveau, sur `sakina.pages.dev`).
- Claude vérifie sur `https://sakina.pages.dev` : pages FR/AR, compositeur, 3D, commande complète en **mode test
  Stripe** (carte 4242 4242 4242 4242), webhook, courriels reçus, administration, page 404, en-têtes de sécurité.

## 4. Protéger l'administration

Cloudflare > Zero Trust > Access > Applications : protéger `sakina.pages.dev/admin.html` et `/api/admin/*`
(puis le domaine) ; seule l'adresse e-mail de Viktor est autorisée.

## 5. Le domaine

Cloudflare > projet `sakina` > Domaines personnalisés : ajouter le domaine. Mettre `SAKINA_SITE` et `SITE_URL`
sur ce domaine, republier. Stripe : webhook vers `https://<domaine>/api/stripe/webhook`.

## 6. Arrêter GitHub Pages, sans coupure

Seulement quand le domaine répond sur Cloudflare :
1. Remplacer le contenu publié par GitHub Pages par une page de redirection vers le domaine
   (le site n'a pas encore été partagé : aucun lien ne se perd) ;
2. ou, plus simple, désactiver Pages dans GitHub > Settings > Pages, puis supprimer `pages.yml`
   — **avec l'accord de Viktor** (règle : ne rien supprimer sans son oui).

## 7. Passer en vrai

Remplacer la clé Stripe de test par la clé réelle, refaire une commande réelle de faible montant, la rembourser.
Search Console : déclarer le domaine et envoyer `sitemap.xml`.
