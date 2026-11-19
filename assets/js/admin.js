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
    const m = await api('messages');
    $('admin-filtres').innerHTML = `<button type="button" data-messages="1" class="admin-btn-messages">Messages <small>${m.non_lus} non lu${m.non_lus > 1 ? 's' : ''}</small></button>`
      + '<button type="button" data-courriels="1">Courriels</button>' + [['', 'Toutes', Object.values(d.comptes).reduce((a, b) => a + b, 0)],
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
      <button type="button" class="btn-petit admin-retour" data-retour="1">← Toutes les commandes</button>
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
        <a class="btn btn-or" href="${lienComposer(c.etat).replace('composer.html', 'composer.html?atelier=1')}" data-atelier="1">Fichier pour l’imprimeur (sans filigrane)</a></p>
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
    await liste();
    // Téléphone : la liste et le détail sont l'un sous l'autre ; on amène le détail à l'écran
    // (après la mise à jour de la liste, qui change la hauteur au-dessus).
    if (window.matchMedia('(max-width: 860px)').matches) requestAnimationFrame(() => $('admin-detail').scrollIntoView({ block: 'start' }));
  }

  $('admin-detail').addEventListener('click', e => {
    if (!e.target.closest('[data-retour]')) return;
    $('admin-filtres').scrollIntoView({ block: 'start' });
  });
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
  async function messages() {
    location.hash = 'messages';
    const d = await api('messages');
    $('admin-detail').innerHTML = `<h2>Messages</h2>` + (d.messages.length ? d.messages.map(m => `
      <article class="admin-message${m.lu ? '' : ' non-lu'}">
        <p><strong>${esc(m.nom)}</strong> · <a href="mailto:${esc(m.email)}">${esc(m.email)}</a> · ${esc(m.sujet)} · ${m.langue} · <small>${date(m.cree_le)}</small></p>
        <p class="admin-message-texte">${esc(m.message)}</p>
        <button type="button" class="btn-petit" data-lu="${m.id}" data-etat="${m.lu ? 0 : 1}">${m.lu ? 'Marquer non lu' : 'Marquer lu'}</button>
      </article>`).join('') : '<p class="aide">Aucun message.</p>');
  }
  // Le fichier pour l'imprimeur s'ouvre par window.open : le nouvel onglet reçoit ainsi une copie de la
  // session (le mot de passe), ce qu'un simple lien target="_blank" ne fait plus dans les navigateurs récents.
  $('admin-detail').addEventListener('click', e => {
    const a = e.target.closest('a[data-atelier]');
    if (!a) return;
    e.preventDefault();
    window.open(a.href, '_blank');
  });
  $('admin-detail').addEventListener('click', async e => {
    const b = e.target.closest('[data-lu]');
    if (!b) return;
    try { await api('messages', { method: 'PATCH', body: JSON.stringify({ id: +b.dataset.lu, lu: b.dataset.etat === '1' }) }); messages(); liste(); }
    catch (err) { message(err.message); }
  });
  // Aperçu des courriels envoyés aux clients, et relance manuelle des épreuves en attente.
  async function courriels(type = 'epreuve', langue = 'fr') {
    location.hash = 'courriels';
    const d = await api(`courriels?type=${type}&langue=${langue}`);
    $('admin-detail').innerHTML = `<h2>Courriels aux clients</h2>
      <div class="admin-actions"><select id="c-type">${d.types.map(x => `<option${x === type ? ' selected' : ''}>${x}</option>`).join('')}</select>
        <select id="c-langue"><option value="fr"${langue === 'fr' ? ' selected' : ''}>français</option><option value="ar"${langue === 'ar' ? ' selected' : ''}>arabe</option></select>
        <button type="button" class="btn btn-contour" id="c-rappels">Relancer les épreuves en attente</button></div>
      <p class="aide">Objet : <strong>${esc(d.sujet)}</strong></p>
      <iframe class="admin-courriel" title="Aperçu du courriel" sandbox="" srcdoc="${esc(d.html)}"></iframe>`;
    const re = () => courriels($('c-type').value, $('c-langue').value).catch(err => message(err.message));
    $('c-type').addEventListener('change', re); $('c-langue').addEventListener('change', re);
    $('c-rappels').addEventListener('click', async () => {
      try { const r = await api('rappels', { method: 'POST' }); message(r.relances.length ? `Relancé : ${r.relances.join(', ')}` : 'Aucune épreuve à relancer.'); }
      catch (err) { message(err.message); }
    });
  }
  $('admin-filtres').addEventListener('click', e => { if (e.target.closest('[data-courriels]')) courriels().catch(err => message(err.message)); });
  $('admin-filtres').addEventListener('click', e => { if (e.target.closest('[data-messages]')) return void messages().catch(err => message(err.message)); });
  $('admin-filtres').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (b) { filtre = b.dataset.f; liste().catch(err => message(err.message)); } });
  $('admin-connexion').addEventListener('submit', async e => {
    e.preventDefault();
    jeton = e.target.elements.jeton.value;
    try { await demarrer(); try { sessionStorage[CLE] = jeton; } catch (er) {} } catch (err) { message(err.message); }
  });
  async function demarrer() {
    await liste();
    $('admin-connexion').hidden = true; $('admin-app').hidden = false; message('');
    if (location.hash === '#messages') return void messages().catch(err => message(err.message));
    if (location.hash === '#courriels') return void courriels().catch(err => message(err.message));
    if (location.hash.length > 1) detail(decodeURIComponent(location.hash.slice(1))).catch(err => message(err.message));
  }
  if (jeton) demarrer().catch(err => message(err.message));
})();
