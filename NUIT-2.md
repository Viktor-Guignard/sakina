# Nuit du 18 au 19/11/2026 : travail en autonomie jusqu'à 12 h (heure de Paris)

Objectif de Viktor : un site **complet**, où il ne lui reste plus qu'à connecter Stripe et l'envoi
automatique des courriels (clés à mettre dans Cloudflare). Penser au **référencement**.

Un réveil par heure. À chaque réveil : prendre la première tâche non cochée, la faire, la vérifier
dans le navigateur (captures), relancer `npm test`, enregistrer une version (commit), **pousser sur la
branche `travail`** (autorisé par Viktor ; jamais sur `main`, qui republierait le site), mettre à jour
la sauvegarde zip, noter le résultat dans le journal ci-dessous.

Règles : rien n'est publié (pas de push sur main), supprimé ni envoyé. Pas de nouveau texte religieux sans le
signaler « à relire ». Charte Iznik, arc brisé, aucune ressemblance avec livretsdemesse.

## Tâches (UX / UI d'abord)

- [x] 1. 3D sur téléphone : une page à la fois, en grand, glisser pour tourner.
- [x] 2. « Quelle pièce ? » : une petite vignette de chaque pièce (livret, carte, menu, marque-page…).
- [ ] 3. Commande : récapitulatif clair avant le paiement (pièce, pages, quantité, prix, étapes : épreuve → validation → impression).
- [ ] 4. Accueil : une section qui montre la papeterie assortie (même motif sur livret, faire-part, menu, marque-page).
- [ ] 5. Page « Motifs » : chaque motif décliné sur plusieurs pièces.
- [ ] 6. Lien de relecture : une vue « lecture seule » simple pour l'imam (sans les questions), avec le filigrane.
- [ ] 7. Pages légales en arabe (brouillons, mêmes réserves).
- [ ] 8. Compositeur sur téléphone : passer de la question à l'aperçu sans se perdre (bouton « Voir l'aperçu »).
- [ ] 9. Poids des pages et vitesse (images, scripts) ; vérifier le premier affichage sur téléphone.
- [ ] 10. Relecture générale FR/AR des nouveaux libellés (orthographe, accords, sens de lecture).
- [ ] 11. Référencement (1) : titres et descriptions uniques par page, balise canonique, hreflang FR/AR complet,
        Open Graph et image de partage (générée, au motif), données structurées (Organization, BreadcrumbList, FAQPage, Product).
- [ ] 12. Référencement (2) : une page par pièce (« Faire-part de mariage musulman », « Livret de nikâh »,
        « Carnet du pèlerin »…), en FR et AR, avec texte utile, liens internes, lien vers le compositeur.
- [ ] 13. Page « Questions fréquentes » (FR/AR) : délais, épreuve, relecture, livraison, paiement, respect du sacré.
- [ ] 14. Page « Comment ça marche » + page Contact : formulaire relié au service (messages en base D1, courriel
        à l'administration quand Brevo sera branché), visible dans l'administration.
- [ ] 15. Courriels automatiques complets et soignés (FR/AR) : confirmation, épreuve, rappel d'épreuve non validée
        (tâche planifiée Cloudflare), expédition, devis ; page d'aperçu des courriels dans l'administration.
- [ ] 16. Mise en ligne prête : _headers (sécurité, cache), page 404 FR/AR, redirections, build Cloudflare,
        script `npm run verifier` qui contrôle la configuration ; BACKEND.md réduit à « mettre les clés ».
- [ ] 17. Pied de page et menus : liens vers FAQ, contact, pièces, pages légales (quand validées : laisser l'interrupteur).
- [ ] 17b. Bascule vers Cloudflare (demandée par Viktor, à faire AVEC lui à la fin) : préparer le guide pas à pas
        dans BACKEND.md (création du projet Pages relié à GitHub, base D1, secrets, domaine, Stripe, Brevo),
        un workflow GitHub Actions de déploiement Cloudflare prêt mais inactif, et le plan pour arrêter ensuite
        GitHub Pages (pages.yml) sans coupure. Ne rien basculer seul.
- [ ] 18. Rapport de midi : ce qui a été fait, captures avant/après, ce qui attend Viktor (Stripe, courriels, juriste, imam, domaine).

## Journal

- 00 h 11 · Tâche 1 faite : sur téléphone en portrait, la 3D montre une page à la fois, en grand et centrée ; glisser sur le côté tourne la page (sens arabe respecté), le compteur dit « Page 2 sur 8 ». Le livret est aussi centré quand il dépasse l'écran. Tests : 32 + 476 réussis.
- 00 h 21 · Tâche 2 faite : chaque pièce a sa vignette à l'échelle (livret, carte, menu, rond, marque-page, certificat), aux couleurs du motif choisi, redessinée quand le motif change. Tests : 32 + 476 réussis.
