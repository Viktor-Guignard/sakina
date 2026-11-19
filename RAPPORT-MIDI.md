# Rapport du 19/11/2026, midi

Nuit de travail en autonomie (du 18/11, 23 h, au 19/11, 12 h). Tout est sur la branche **`travail`** du dépôt
`Viktor-Guignard/sakina` (49 versions depuis l'archive de reprise). **Rien n'a été publié** : `main` et le site en
ligne n'ont pas bougé. Le détail heure par heure est dans `NUIT-2.md`.

## État des tests (tous passent)

- Commande de bout en bout avec un faux Stripe : **49 vérifications**
- Compositeur, toutes les pièces, FR/AR, ordinateur/iPhone : **480 vérifications**
- Accessibilité (WCAG A/AA) et défilement latéral : **26 pages sans erreur**
- Référencement : **75 pages contrôlées, 0 problème**

## Ce qui a été fait

**Compositeur et 3D**
- 13 pièces : 6 livrets (cérémonie, carnet du pèlerin, 30 nuits de Ramadan, prière de l'Aïd, livret du prénom,
  registre de condoléances) et 7 pièces de papeterie (faire-part, invitation, menu, carte de remerciement,
  étiquettes rondes, marque-page à verset, certificat de khatm), avec leur vignette.
- Livret 3D à feuilleter ; sur téléphone, une page à la fois, on glisse pour tourner.
- Filigrane « Sakîna · سكينة » sur l'aperçu, la 3D et le PDF ; fichier pour l'imprimeur sans filigrane, avec 3 mm
  de fond perdu, réservé à l'administration.
- Récapitulatif clair avant le paiement ; vue de relecture simple pour l'imam ; bouton « Voir la pièce » sur téléphone.

**Site**
- Pages : Livrets et papeterie, une page par pièce, Questions fréquentes, Comment ça marche, Contact, 404, brouillons
  des pages légales (FR et AR), dossier de relecture pour l'imam.
- Accueil et page Motifs : la papeterie assortie sous un même motif.
- Polices hébergées sur le site (RGPD), pages rapides (1,4 à 2 s sur téléphone en 4G lente).
- Plus aucun lien vers `sakina-livrets.fr` (domaine non enregistré) : la page Contact le remplace.

**Référencement**
- Titres et descriptions propres à chaque page, adresses canoniques et versions FR/AR déclarées à Google, images de
  partage FR et AR, données structurées, plan du site. Adresses sans « .html » (Cloudflare redirige les « .html »).

**Service de commande (Cloudflare + Stripe)**
- Commande → paiement Stripe → épreuve → validation du client → impression → expédition ; pièces sur devis.
- Administration (aussi sur téléphone) : commandes, messages du formulaire de contact, aperçu des courriels,
  relance des épreuves.
- 10 courriels clients en FR et AR, rappel automatique des épreuves en attente depuis 3 jours.
- Sécurité : prix recalculé, paiement vérifié, entrées nettoyées, pas de liens dans les noms, limites par adresse.

**Mise en ligne préparée, rien de basculé**
- `npm run verifier` : la liste de ce qui est prêt et de ce qui manque.
- `BACKEND.md` : les 10 étapes pour poser les clés. `BASCULE-CLOUDFLARE.md` : la bascule, à faire ensemble.
- Publication automatique sur Cloudflare prête mais **inactive** tant que le compte n'est pas branché.

## Défauts trouvés et corrigés pendant la nuit

- La page Contact arabe défilait de côté sur près de 10 000 px.
- Le « Fichier pour l'imprimeur » s'ouvrait avec le filigrane.
- Sur ordinateur, la colonne des questions cachait le bas du formulaire de commande.
- Sur téléphone, le livret 3D sortait de l'écran.
- Le libellé « مقترح » (conseillé) s'affichait « undefined » sur le site arabe.
- Plusieurs libellés inexacts ou maladroits (« une page par nuit », « est arrivé », promesse d'impression janâza).

## Ce qu'il te reste à faire

1. **Créer avec moi le compte Cloudflare dédié** et faire la bascule (`BASCULE-CLOUDFLARE.md`).
2. **Stripe** : la clé du compte Sakîna (mode test d'abord) et le webhook.
3. **Brevo** : la clé et l'adresse d'expédition, pour que les courriels partent.
4. **Domaine et nom définitifs** (puis Google Search Console).
5. **Un juriste** pour les pages légales (`legal.py`, puis l'interrupteur `LEGAL_VALIDE`).
6. **Un imam ou un arabisant** pour les textes religieux (dossier `relecture.html`, aussi en PDF).
7. **Les prix de la papeterie** chez Vistaprint (aujourd'hui « sur devis ») et les **frais de livraison**.
8. **Une décision** : la page « Notre éthique » parle d'ajouter ses propres photos, ce que le compositeur ne permet pas
   (enlever la phrase, ou ajouter cette fonction).
9. **Ton accord** pour fusionner `travail` dans `main` le jour de la bascule.
