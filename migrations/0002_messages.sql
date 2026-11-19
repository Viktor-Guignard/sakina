-- Messages envoyés par la page Contact (lus dans l'administration).
CREATE TABLE messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cree_le TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  sujet TEXT,
  message TEXT NOT NULL,
  langue TEXT NOT NULL,
  lu INTEGER NOT NULL DEFAULT 0,
  ip_empreinte TEXT
);
CREATE INDEX messages_date ON messages (cree_le);
CREATE INDEX messages_ip ON messages (ip_empreinte, cree_le);
