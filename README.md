# Sakîna — livrets & papeterie pour les cérémonies musulmanes

Prototype du site (nom de travail : **Sakîna**, سكينة — Coran 48 : 4), en français (`site/`) et en arabe (`site/ar/`).
En ligne : https://viktor-guignard.github.io/sakina/ (publié par `.github/workflows/pages.yml` à chaque push).

- `contenu.py` / `contenu_ar.py` : marque, 9 cérémonies (nikâh, aqîqa, khitân, khatm, hajj, Ramadan, Aïd, henné, janâza), motifs.
- `livrets.py` : bibliothèque des versets et invocations (arabe vocalisé, translittération, traduction, référence) et textes par défaut de chaque livret.
- `couvertures.py` : couvertures SVG des motifs (géométrie et calligraphie, sans figures).
- `build.py` : génère le site statique dans `site/` → `python3 build.py`.
- `assets/js/composer.js` : le compositeur (une question à la fois, mise en page A5 automatique, lien de relecture, PDF par l'impression du navigateur).
- `assets/css/style.css` : charte (variables), voir `site/charte-graphique.html`.

Aperçu local : `python3 -m http.server 4181 --directory site`.

À faire avant toute mise en ligne publique : faire relire les textes arabes, les versets et les invocations par un imam ou un arabisant ; choisir le nom et le domaine ; polices auto-hébergées depuis le 19/11/2026.

## Ajouts de novembre 2026

- `modeles.py` : les pièces du compositeur (livret de cérémonie, carnet du pèlerin, 30 nuits de Ramadan, prière de l'Aïd,
  livret du prénom, registre de condoléances ; faire-part, invitation, menu, carte de remerciement, étiquettes, marque-page, certificat de khatm).
- `assets/js/livret3d.js` : feuilleter la pièce en 3D (bouton au-dessus de l'aperçu).
- `functions/`, `migrations/`, `wrangler.toml` : service de commande (Cloudflare + Stripe), voir `BACKEND.md`. Test : `npm test`.
