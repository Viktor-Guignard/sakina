-- Commandes Sakîna. Montants en centimes d'euro, TTC. Dates en ISO 8601 (UTC).
CREATE TABLE commandes (
  id TEXT PRIMARY KEY,                 -- SK-XXXXXXXX, lisible au téléphone
  jeton TEXT NOT NULL,                 -- secret du lien de suivi envoyé au client
  cree_le TEXT NOT NULL,
  maj_le TEXT NOT NULL,
  statut TEXT NOT NULL,                -- voir functions/_lib/statuts.js
  produit TEXT NOT NULL,               -- clé de modeles.py
  ceremonie TEXT NOT NULL,
  langue_site TEXT NOT NULL,           -- fr | ar
  langue_piece TEXT NOT NULL,          -- fr | ar | bi
  pages INTEGER NOT NULL,              -- pages (livret) ou faces (carte), déclarées par le compositeur
  quantite INTEGER NOT NULL,
  montant INTEGER,                     -- NULL = sur devis
  livraison INTEGER,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT,
  message TEXT,
  relecture INTEGER NOT NULL DEFAULT 0, -- le client dit avoir fait relire les textes religieux
  etat TEXT NOT NULL,                  -- JSON de la pièce composée (comme le lien #l=…)
  adresse TEXT,                        -- JSON, recueillie par Stripe
  stripe_session TEXT,
  stripe_paiement TEXT,
  suivi_colis TEXT,
  note_interne TEXT,
  ip_empreinte TEXT
);
CREATE INDEX commandes_statut ON commandes (statut, cree_le);
CREATE INDEX commandes_stripe ON commandes (stripe_session);
CREATE INDEX commandes_ip ON commandes (ip_empreinte, cree_le);

-- Historique de chaque commande : changements de statut, courriels, remarques du client.
CREATE TABLE evenements (
  n INTEGER PRIMARY KEY AUTOINCREMENT,
  commande TEXT NOT NULL REFERENCES commandes (id),
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  detail TEXT
);
CREATE INDEX evenements_commande ON evenements (commande, n);

-- Webhooks Stripe déjà traités (Stripe peut renvoyer le même événement).
CREATE TABLE stripe_evenements (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL
);
