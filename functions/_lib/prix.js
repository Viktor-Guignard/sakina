// Prix : même calcul que le compositeur (assets/js/composer.js), à partir des mêmes
// données (donnees.js, généré par build.py). Le prix payé est toujours celui-ci.
import D from './donnees.js';

/** Vérifie la pièce et renvoie son prix TTC en centimes (null : sur devis), ou une erreur. */
export function chiffrer({ produit, ceremonie, pages, quantite }) {
  const M = D.modeles[produit];
  if (!M) return { erreur: 'Pièce inconnue.' };
  if (!D.ceremonies[ceremonie] || !M.ceremonies.includes(ceremonie)) return { erreur: 'Cette pièce n’existe pas pour cette cérémonie.' };
  if (!Number.isInteger(pages) || !Number.isInteger(quantite)) return { erreur: 'Nombre de pages ou d’exemplaires invalide.' };
  let grille;
  if (M.famille === 'livret') {
    if (pages < 8 || pages > 200 || pages % 4) return { erreur: 'Un livret compte un multiple de quatre pages, huit au moins.' };
    if (!Object.keys(D.tarifs[8]).map(Number).includes(quantite)) return { erreur: 'Quantité non proposée.' };
    grille = D.tarifs[pages];
  } else {
    if (pages !== M.faces) return { erreur: 'Nombre de faces invalide.' };
    if (!D.quantites_papeterie.includes(quantite)) return { erreur: 'Quantité non proposée.' };
    grille = D.tarifs_papeterie[produit];
  }
  const ht = grille && grille[quantite];
  if (ht == null) return { montant: null };
  // Arrondi à l'euro supérieur, comme à l'écran.
  return { montant: Math.ceil(D.marge * ht * (1 + D.tva)) * 100 };
}

export const nomPiece = (produit, ceremonie, langue = 'fr') =>
  `${D.modeles[produit]?.[langue] || produit} — ${D.ceremonies[ceremonie]?.[langue] || ceremonie}`;

export const estLivret = produit => D.modeles[produit]?.famille === 'livret';
