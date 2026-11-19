// Nettoyage de la pièce reçue du compositeur avant de l'enregistrer : seuls les champs connus,
// des textes de longueur raisonnable, des versets et motifs qui existent. Ce qui est enregistré
// est ensuite affiché dans l'administration et dans la page de suivi : rien d'inattendu n'y entre.
import D from './donnees.js';

const chaine = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const CHAINES = { noms: 120, titre: 80, phrase: 80, date: 80, lieu: 120, accueil_fr: 2000, accueil_ar: 2000, fin_fr: 2000, fin_ar: 2000 };
const DRAPEAUX = ['translit', 'basmala', 'avec_deroule', 'mention'];

export function nettoyer(e) {
  if (!e || typeof e !== 'object' || Array.isArray(e)) return null;
  const propre = {
    c: chaine(e.c, 20), p: chaine(e.p || 'livret', 20),
    m: D.motifs.includes(e.m) ? e.m : D.motifs[0],
    langue: ['fr', 'ar', 'bi'].includes(e.langue) ? e.langue : 'bi',
    genre: e.genre === 'f' ? 'f' : 'm',
    textes: (Array.isArray(e.textes) ? e.textes : []).filter(k => D.textes.includes(k)).slice(0, 40),
    deroule: (Array.isArray(e.deroule) ? e.deroule : []).slice(0, 40).map(x => ({
      fr_t: chaine(x?.fr_t, 200), fr_d: chaine(x?.fr_d, 600), ar_t: chaine(x?.ar_t, 200), ar_d: chaine(x?.ar_d, 600) })),
    libres: Number.isInteger(e.libres) ? Math.min(Math.max(e.libres, 0), 40) : 0,
  };
  for (const [k, max] of Object.entries(CHAINES)) propre[k] = chaine(e[k], max);
  for (const k of DRAPEAUX) propre[k] = !!e[k];
  if (Number.isInteger(e.quantite)) propre.quantite = e.quantite;
  return propre;
}

/** Un nom de personne ne contient ni lien ni balise (il est repris dans les courriels). */
export const nomAcceptable = n => !/(:\/\/|www\.|https?:|<|>|\.(com|net|org|ru|xyz|top)\b)/i.test(n);
