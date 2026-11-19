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
- [x] 3. Commande : récapitulatif clair avant le paiement (pièce, pages, quantité, prix, étapes : épreuve → validation → impression).
- [x] 4. Accueil : une section qui montre la papeterie assortie (même motif sur livret, faire-part, menu, marque-page).
- [x] 5. Page « Motifs » : chaque motif décliné sur plusieurs pièces.
- [x] 6. Lien de relecture : une vue « lecture seule » simple pour l'imam (sans les questions), avec le filigrane.
- [x] 7. Pages légales en arabe (brouillons, mêmes réserves).
- [x] 8. Compositeur sur téléphone : passer de la question à l'aperçu sans se perdre (bouton « Voir l'aperçu »).
- [x] 9. Poids des pages et vitesse (images, scripts) ; vérifier le premier affichage sur téléphone.
- [x] 10. Relecture générale FR/AR des nouveaux libellés (orthographe, accords, sens de lecture).
- [x] 11. Référencement (1) : titres et descriptions uniques par page, balise canonique, hreflang FR/AR complet,
        Open Graph et image de partage (générée, au motif), données structurées (Organization, BreadcrumbList, FAQPage, Product).
- [x] 12. Référencement (2) : une page par pièce (« Faire-part de mariage musulman », « Livret de nikâh »,
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
- 01 h 11 · Tâche 3 faite : récapitulatif avant paiement (pièce, cérémonie et noms, format et pages, langue, quantité, prix) et les quatre étapes (paiement, épreuve, accord, impression) ; pour une pièce sur devis, le bouton devient « Demander mon devis ». Corrigé au passage : sur ordinateur, la colonne des questions restait figée et cachait le bas du formulaire de commande ; elle défile maintenant. Tests : 32 + 476 réussis.
- 01 h 21 · Tâche 4 faite : l'accueil montre « Toute la papeterie, sous un même motif » (livret, faire-part, menu, marque-page, étiquette), posés à plat et à l'échelle, chacun mène au compositeur. Test d'accessibilité gardé dans le projet (tests/accessibilite.test.mjs) : 14 pages FR/AR sans erreur. Tests : 32 + 476 réussis.
- 02 h 11 · Tâche 5 faite : la page Motifs montre, pour chacun des 8 motifs, sa papeterie complète (livret, faire-part, menu, marque-page, étiquette) et un lien « Composer avec ce motif ». Corrigé au passage : identifiants SVG en double sur l'accueil. Tests : 32 + 476 réussis, accessibilité 14/14.
- 02 h 20 · Tâche 6 faite : le lien « Copier le lien pour relecture » ouvre une vue simple (composer.html?lecture=1) : la pièce seule, en grand, avec le filigrane, la liste des références à vérifier et un bouton « Modifier la pièce ». L'épreuve envoyée au client s'ouvre aussi dans cette vue. Tests : 32 + 476 réussis, accessibilité 14/14.
- 03 h 11 · Tâche 7 faite : mentions légales, CGV et confidentialité en arabe (ar/), marquées « traduction pour information, le français fait foi » et « à relire », non indexées, liées à leur version française (hreflang). Tests : 32 + 476 réussis, accessibilité 16/16.
- 03 h 20 · Tâche 8 faite : sur téléphone, un bouton flottant « Voir la pièce ↓ » descend jusqu'à la pièce composée, puis devient « Revenir aux questions ↑ » (FR/AR) ; absent sur ordinateur et dans la vue de relecture. Testé automatiquement. Tests : 32 + 480 réussis, accessibilité 16/16.
- 04 h 11 · Tâche 9 faite : mesuré sur iPhone en 4G lente et processeur ralenti ×4 : premier affichage 1,4 à 2 s selon la page (objectif Google < 2,5 s). Scripts en « defer », données du compositeur compactées, police du texte préchargée, fichier _headers pour Cloudflare (cache d'un an des fichiers versionnés, en-têtes de sécurité, politique de contenu). Une fois compressées par Cloudflare, les pages font 5 à 10 Ko. Tests : 32 + 480 réussis, accessibilité 16/16.
- 04 h 20 · Tâche 10 faite : relecture FR/AR des nouveaux libellés. Corrigés : « une page par nuit » (faux, il y en a environ cinq par page), livret du prénom qui supposait un garçon (« est arrivé »), « après la fête » sur la carte aussi proposée pour la janâza, « cette carte » sur le marque-page (→ « cette pièce »), et la promesse de l'accueil pour la janâza (« impression au plus vite ») remplacée par : épreuve en quelques heures, délai d'impression annoncé avant la commande. Tests : 32 + 480 réussis, accessibilité 16/16.
- 05 h 11 · Tâche 11 faite : adresse canonique et hreflang FR/AR (+ x-default) en adresses absolues, réglables par SAKINA_SITE (le domaine définitif) ; Open Graph et Twitter complets ; images de partage FR et AR (1200 × 630, 56 Ko, tools/image-partage.mjs) ; données structurées Organization, WebSite, FAQPage (accueil) et BreadcrumbList (cérémonies, motifs) ; descriptions enrichies. Pas de « Product » : il faudrait des prix définitifs. Nouveau test tests/referencement.test.mjs : 39 pages, 0 problème. Tests : 32 + 480, accessibilité 16/16.
- 05 h 35 · Tâche 12 faite : une page par pièce (13 pages FR + 13 AR, textes propres dans pieces.py : « Faire-part de mariage musulman », « Carnet du pèlerin pour le hajj et la omra », « Certificat de khatm al-Qur’ân »…), chacune avec son visuel, ses cérémonies (liens directs vers le compositeur) et les autres pièces ; une page « Livrets et papeterie » qui les rassemble, ajoutée au menu (« Papeterie »). À relire : les citations de versets et de hadith dans ces textes (Ar-Rûm 30:21, Al-Qamar 54:17, hadith « khayrukum »), déjà présentes dans la bibliothèque. Tests : 32 + 480, accessibilité 20/20, référencement 67 pages sans problème.
