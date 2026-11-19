// GET /api/admin/courriels?type=epreuve&langue=ar : aperçu d'un courriel client, avec une commande d'exemple.
import { json, erreur, site } from '../../_lib/outils.js';
import { MESSAGES, message, rendre } from '../../_lib/courriel.js';

export async function onRequestGet({ request }) {
  const q = new URL(request.url).searchParams, type = q.get('type') || 'epreuve';
  if (!MESSAGES[type]) return erreur('Courriel inconnu.');
  const ar = q.get('langue') === 'ar';
  const exemple = { id: 'SK-EXEMPLE1', jeton: 'exemple', nom: ar ? 'ياسمين' : 'Yasmine', langue_site: ar ? 'ar' : 'fr', produit: 'livret', ceremonie: 'nikah',
                    pages: 12, quantite: 100, montant: 24300, livraison: 690, suivi_colis: '6A12345678901' };
  const m = message(type, exemple, { message: ar ? 'راجعها الإمام.' : 'Le texte a été relu par l’imam.', remarque: ar ? 'تصحيح التاريخ.' : 'Corriger la date, svp.' }, site({}, request));
  return json({ types: Object.keys(MESSAGES), sujet: m.sujet, html: rendre({ rtl: m.rtl, titre: m.titre, lignes: m.lignes, lien: m.lien, bouton: m.bouton, pied: m.pied }) });
}
