# Sakîna — livrets & papeterie pour les cérémonies musulmanes

Site bilingue (français `site/`, arabe `site/ar/`) de livrets et de papeterie pour les cérémonies musulmanes
(nom de travail : **Sakîna**, سكينة — Coran 48 : 4). Au cœur du site, un **compositeur** : une pièce se compose
question par question, se feuillette en 3D, se fait relire par l'imam, puis se commande.

- En ligne (provisoire, sans commande) : https://viktor-guignard.github.io/sakina/ — publié par `.github/workflows/pages.yml`.
- Mise en ligne avec commandes et paiement : `BACKEND.md` (clés à poser) et `BASCULE-CLOUDFLARE.md` (à faire ensemble).

## Commandes

| Commande | Rôle |
|---|---|
| `python3 build.py` | génère le site dans `site/` (sans dépendance) |
| `python3 -m http.server 4181 --directory site` | aperçu local du site |
| `npm install` puis `npm test` | tous les tests (commande de bout en bout avec un faux Stripe, compositeur, accessibilité, référencement) |
| `npm run dev` | site + service de commande en local (Cloudflare, `wrangler pages dev`) |
| `npm run verifier` | ce qui est prêt et ce qui manque avant la mise en ligne |
| `npm run image-partage` | refait les images de partage (Open Graph) |

Variables du build : `SAKINA_API` (absent = pas de commande en ligne ; vide = même site), `SAKINA_SITE` (adresse publique).

## Contenu (Python, une seule source pour les deux langues)

| Fichier | Contenu |
|---|---|
| `contenu.py`, `contenu_ar.py` | marque, 9 cérémonies, motifs |
| `livrets.py` | bibliothèque de versets et invocations (références, variantes au féminin), textes par défaut, **tarifs** (3 × Vistaprint) |
| `modeles.py` | les 13 pièces du compositeur (6 livrets, 7 pièces de papeterie), les 30 juz', prix de la papeterie (à relever) |
| `pieces.py` | une page par pièce (référencement) |
| `faq.py` | questions fréquentes |
| `legal.py` | brouillons des pages légales FR/AR ; interrupteur `LEGAL_VALIDE` |
| `couvertures.py` | couvertures et vignettes SVG (arc brisé, géométrie, calligraphie ; jamais de figures) |
| `build.py` | génère toutes les pages, `donnees.js`, `sitemap.xml`, `robots.txt`, `_headers`, `404.html` |

## Navigateur

| Fichier | Rôle |
|---|---|
| `assets/js/composer.js` | le compositeur : questions, mise en page automatique (multiple de 4 pages), papeterie, filigrane, relecture (`?lecture=1`), atelier (`?atelier=1`, fichier pour l'imprimeur avec fond perdu), prix, commande |
| `assets/js/livret3d.js` | feuilleter en 3D (une page à la fois sur téléphone) |
| `assets/js/suivi.js`, `admin.js`, `contact.js` | suivi client, administration, formulaire de contact |
| `assets/css/style.css`, `polices.css`, `assets/fonts/` | charte Iznik ; polices hébergées sur le site (RGPD) |

## Service de commande (Cloudflare Pages Functions + D1)

`functions/` (routes `api/…`), `functions/_lib/` (prix, Stripe, courriels FR/AR, statuts, nettoyage des entrées),
`migrations/` (tables), `wrangler.toml` (réglages). Détails et parcours d'une commande : `BACKEND.md`.

## Règles du projet

Aucune ressemblance avec livretsdemesse.fr ; aucune mention de VIKTO LABS ; rien de supprimé, publié ou envoyé
sans l'accord de Viktor ; textes religieux à faire relire par un imam (`relecture.html`) ; aucune figure humaine
ou animale, ni représentation des Lieux saints ; versets toujours en arabe avec leur référence.
