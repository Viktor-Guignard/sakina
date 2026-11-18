/* Sakîna : administration des commandes (admin.html).
 * Le mot de passe reste dans l'onglet (sessionStorage) et part dans l'en-tête Authorization. */
(() => {
  const $ = s => document.getElementById(s);
  const CLE = 'sakina-admin';
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const euros = c => c == null ? 'sur devis' : (c / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  const date = d => new Date(d).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  let jeton = null, statuts = {}, filtre = '', courante = null;
  try { jeton = sessionStorage[CLE] || null; } catch (e) { /* stockage indisponible */ }

  async function api(chemin, options = {}) {
    const r = await fetch('/api/admin/' + chemin, { ...options, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + jeton } });
    const d = await r.json().catch(() => ({}));
    if (r.status === 401) { deconnecter(); throw new Error('Mot de passe refusé.'); }
    if (!r.ok) throw new Error(d.erreur || 'Erreur ' + r.status);
    return d;
  }
  const message = t => { $('admin-message').textContent = t; };
  function deconnecter() { jeton = null; try { sessionStorage.removeItem(CLE); } catch (e) {} $('admin-app').hidden = true; $('admin-connexion').hidden = false; }

  async function liste() {
    const d = await api('commandes' + (filtre ? '?statut=' + filtre : ''));
    statuts = d.statuts;
    $('admin-filtres').innerHTML = [['', 'Toutes', Object.values(d.comptes).reduce((a, b) => a + b, 0)],
      ...Object.keys(statuts).filter(k => d.comptes[k]).map(k => [k, statuts[k].fr, d.comptes[k]])]
      .map(([k, l, n]) => `<button type="button" data-f="${k}"${k === filtre ? ' aria-pressed="true"' : ''}>${esc(l)} <small>${n}</small></button>`).join('');
    $('admin-liste').innerHTML = d.commandes.length ? d.commandes.map(c => `
      <button type="button" class="admin-ligne${c.id === courante ? ' active' : ''}" data-id="${c.id}">
        <strong>${c.id}</strong> <span class="admin-badge admin-${c.statut}">${esc(statuts[c.statut].fr)}</span>
        <span>${esc(c.nom)} · ${esc(c.produit)} / ${esc(c.ceremonie)} · ${c.quantite} ex. · ${euros(c.montant)}</span>
        <small>${date(c.cree_le)}${c.relecture ? '' : ' · textes non relus'}</small></button>`).join('') : '<p class="aide">Aucune commande.</p>';
  }

  function lienComposer(etat) {
    const utf8 = new TextEncoder().encode(JSON.stringify(etat));
    let b = ''; utf8.forEach(o => { b += String.fromCharCode(o); });
    return 'composer.html#l=' + btoa(b).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async function detail(id) {
    courante = id; location.hash = id;
    const c = await api('commandes/' + encodeURIComponent(id));
    const a = c.adresse && c.adresse.livraison;
    const adresse = a ? [a.name, a.address?.line1, a.address?.line2, `${a.address?.postal_code || ''} ${a.address?.city || ''}`, a.address?.country].filter(Boolean).map(esc).join('<br>') : '—';
    $('admin-detail').innerHTML = `
      <h2>${c.id} <span class="admin-badge admin-${c.statut}">${esc(statuts[c.statut].fr)}</span></h2>
      <dl class="admin-dl">
        <dt>Client</dt><dd>${esc(c.nom)} · <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>${c.telephone ? ' · ' + esc(c.telephone) : ''}</dd>
        <dt>Pièce</dt><dd>${esc(c.produit)} · ${esc(c.ceremonie)} · ${c.pages} ${c.produit === 'livret' || ['pelerin', 'nuits', 'priere_aid', 'prenom', 'condoleances'].includes(c.produit) ? 'pages' : 'face(s)'} · ${c.quantite} ex. · langue ${esc(c.langue_piece)}</dd>
        <dt>Montant</dt><dd>${euros(c.montant)}${c.livraison != null ? ' + livraison ' + euros(c.livraison) : ''}</dd>
        <dt>Relecture</dt><dd>${c.relecture ? 'le client dit avoir fait relire les textes' : '<strong>textes non relus</strong> : à faire relire avant l’épreuve'}</dd>
        <dt>Livraison</dt><dd>${adresse}</dd>
        ${c.message ? `<dt>Message</dt><dd>${esc(c.message)}</dd>` : ''}
      </dl>
      <p><a class="btn btn-contour" href="${lienComposer(c.etat)}" target="_blank" rel="noopener">Ouvrir la pièce</a>
        <a class="btn btn-or" href="${lienComposer(c.etat).replace('composer.html', 'composer.html?atelier=1')}" target="_blank">Fichier pour l’imprimeur (sans filigrane)</a></p>
      <p class="aide">Vérifiez le nombre de pages dans le compositeur (déclaré : ${c.pages}). Pour l’épreuve, corrigez la pièce si besoin, copiez son lien de relecture et collez-le ci-dessous.</p>
      <div class="admin-form">
        <label class="champ"><span>Lien de l’épreuve (compositeur, #l=…)</span><input id="a-epreuve" dir="ltr"></label>
        ${c.statut === 'devis_demande' ? '<label class="champ"><span>Prix TTC fixé (€)</span><input id="a-montant" type="number" min="1" step="0.01"></label>' : ''}
        <label class="champ"><span>Numéro de suivi du colis</span><input id="a-colis" value="${esc(c.suivi_colis || '')}" dir="ltr"></label>
        <label class="champ"><span>Note interne</span><textarea id="a-note" rows="2">${esc(c.note_interne || '')}</textarea></label>
        <label class="champ"><span>Message au client (ajouté au courriel)</span><textarea id="a-message" rows="2"></textarea></label>
        <div class="admin-actions">
          <button type="button" class="btn btn-contour" data-statut="">Enregistrer</button>
          ${c.suites.map(s => `<button type="button" class="btn ${s === 'annulee' ? 'btn-contour' : 'btn-or'}" data-statut="${s}">→ ${esc(statuts[s].fr)}</button>`).join('')}
        </div>
      </div>
      <h3>Historique</h3>
      <ol class="admin-histo">${c.historique.map(e => `<li><small>${date(e.date)}</small> ${esc(e.type)}${e.detail ? ` <code>${esc(e.detail)}</code>` : ''}</li>`).join('')}</ol>`;
    liste();
  }

  $('admin-detail').addEventListener('click', async e => {
    const b = e.target.closest('button[data-statut]');
    if (!b) return;
    const corps = { note_interne: $('a-note').value, suivi_colis: $('a-colis').value, message: $('a-message').value };
    if ($('a-epreuve').value.trim()) corps.lien_epreuve = $('a-epreuve').value.trim();
    if ($('a-montant') && $('a-montant').value) corps.montant = Math.round(parseFloat($('a-montant').value) * 100);
    if (b.dataset.statut) {
      if (b.dataset.statut === 'annulee' && !confirm('Annuler cette commande ? Le client sera prévenu. (Un remboursement se fait dans Stripe.)')) return;
      corps.statut = b.dataset.statut;
    }
    b.disabled = true;
    try { await api('commandes/' + encodeURIComponent(courante), { method: 'PATCH', body: JSON.stringify(corps) }); message('Enregistré.'); detail(courante); }
    catch (err) { message(err.message); b.disabled = false; }
  });
  $('admin-liste').addEventListener('click', e => { const b = e.target.closest('[data-id]'); if (b) detail(b.dataset.id).catch(err => message(err.message)); });
  $('admin-filtres').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (b) { filtre = b.dataset.f; liste().catch(err => message(err.message)); } });
  $('admin-connexion').addEventListener('submit', async e => {
    e.preventDefault();
    jeton = e.target.elements.jeton.value;
    try { await demarrer(); try { sessionStorage[CLE] = jeton; } catch (er) {} } catch (err) { message(err.message); }
  });
  async function demarrer() {
    await liste();
    $('admin-connexion').hidden = true; $('admin-app').hidden = false; message('');
    if (location.hash.length > 1) detail(decodeURIComponent(location.hash.slice(1))).catch(err => message(err.message));
  }
  if (jeton) demarrer().catch(err => message(err.message));
})();
