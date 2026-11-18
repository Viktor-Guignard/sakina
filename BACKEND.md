# Service de commande Sakîna (Cloudflare)

Le site reste généré par `python3 build.py`. Le service de commande vit dans `functions/`
(Cloudflare Pages Functions) avec une base D1 (`migrations/`). **Rien n'est en ligne** :
tout a été testé en local (`npm test`, faux Stripe, aucun courriel envoyé).

## Parcours d'une commande

1. Le client compose sa pièce, clique « Le faire imprimer », donne nom + e-mail.
2. Le serveur **recalcule le prix** (mêmes grilles que l'écran, `functions/_lib/donnees.js`
   généré par `build.py`), enregistre la commande, ouvre **Stripe Checkout** (adresse de
   livraison et téléphone recueillis par Stripe). Pièce sans grille de prix → **devis**.
3. Stripe prévient le webhook → statut « payée », courriel au client et à l'administration.
4. Dans `admin.html` : ouvrir la pièce, la faire relire, coller le lien de l'**épreuve**,
   « → Épreuve à valider » (le client reçoit un lien vers `suivi.html`).
5. Le client **valide** l'épreuve ou demande une correction. Rien n'est imprimé avant.
6. Administration : « → En impression », puis « → Expédiée » avec le numéro de colis.

Statuts et passages permis : `functions/_lib/statuts.js`.

## Routes

| Route | Rôle |
|---|---|
| `POST /api/commandes` | créer une commande (paiement ou devis) |
| `GET/POST /api/commandes/:id?j=…` | suivi client ; valider/corriger l'épreuve ; payer un devis |
| `POST /api/stripe/webhook` | confirmation Stripe (signature vérifiée, événements dédoublonnés) |
| `/api/admin/commandes[/:id]` | liste, détail, changement de statut (mot de passe `ADMIN_JETON`) |

Protections : prix toujours recalculé côté serveur, montant payé vérifié, jeton secret par
commande, 10 commandes/heure/IP (seule une empreinte salée de l'IP est gardée), piège à robots,
taille des envois limitée.

## Tester en local

```
npm install
npm test
```

## Mise en ligne (à faire avec Viktor, rien n'est fait)

1. Compte Cloudflare au nom de Sakîna ; `npx wrangler login`.
2. `npx wrangler d1 create sakina` → recopier l'identifiant dans `wrangler.toml`,
   puis `npx wrangler d1 migrations apply sakina --remote`.
3. Projet Pages relié au dépôt : commande de build `SAKINA_API= python3 build.py`, dossier `site`.
   Mettre `SITE_URL` sur l'adresse définitive.
4. Secrets : `npx wrangler pages secret put STRIPE_SECRET_KEY` (puis `STRIPE_WEBHOOK_SECRET`,
   `ADMIN_JETON` (16 caractères au moins), `SEL_IP`, et `BREVO_API_KEY` pour les courriels).
5. Stripe (compte Sakîna distinct) : webhook vers `https://…/api/stripe/webhook`, événements
   `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`.
6. Cloudflare Access sur `/admin.html` et `/api/admin/*` (double protection).
7. Décider : frais de livraison (`LIVRAISON_CENTIMES`), adresses `ADMIN_EMAIL` / `EXPEDITEUR_EMAIL`,
   prix de la papeterie (`TARIFS_PAPETERIE` dans `modeles.py`), CGV et mentions légales.

Sans `SAKINA_API` au build (cas de GitHub Pages aujourd'hui), le bouton « Le faire imprimer »
affiche seulement « La commande en ligne ouvre bientôt ».
