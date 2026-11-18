// Le parcours d'une commande. Rien n'est imprimé avant que le client ait validé l'épreuve.
export const STATUTS = {
  devis_demande:    { fr: 'Devis demandé',              ar: 'طلب عرض سعر' },
  attente_paiement: { fr: 'En attente du paiement',     ar: 'بانتظار الدفع' },
  payee:            { fr: 'Payée : épreuve en préparation', ar: 'مدفوعة: نُعدّ نسخة المراجعة' },
  epreuve_envoyee:  { fr: 'Épreuve à valider',          ar: 'نسخة المراجعة بانتظار موافقتكم' },
  corrections:      { fr: 'Corrections demandées',      ar: 'طُلبت تعديلات' },
  epreuve_validee:  { fr: 'Épreuve validée',            ar: 'تمّت الموافقة على النسخة' },
  en_impression:    { fr: 'En impression',              ar: 'قيد الطباعة' },
  expediee:         { fr: 'Expédiée',                   ar: 'تمّ الشحن' },
  annulee:          { fr: 'Annulée',                    ar: 'أُلغيت' },
  abandonnee:       { fr: 'Paiement non abouti',        ar: 'لم يكتمل الدفع' },
};

// Passages permis depuis l'administration (le client, lui, ne fait que valider ou corriger l'épreuve).
export const SUITES_ADMIN = {
  devis_demande: ['attente_paiement', 'annulee'],
  attente_paiement: ['payee', 'annulee'],
  payee: ['epreuve_envoyee', 'annulee'],
  epreuve_envoyee: ['epreuve_validee', 'corrections', 'annulee'],
  corrections: ['epreuve_envoyee', 'annulee'],
  epreuve_validee: ['en_impression', 'epreuve_envoyee', 'annulee'],
  en_impression: ['expediee'],
  expediee: [],
  annulee: [],
  abandonnee: ['attente_paiement', 'annulee'],
};
