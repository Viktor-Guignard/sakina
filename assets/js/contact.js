/* Sakîna : formulaire de la page Contact (envoyé au service, /api/contact). */
(() => {
  const f = document.getElementById('contact');
  if (!f) return;
  const AR = document.documentElement.lang === 'ar';
  const msg = document.getElementById('contact-message');
  const api = f.dataset.api;
  if (api == null || api === 'aucun') { f.querySelector('button').disabled = true; return; }
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const b = f.querySelector('button'); b.disabled = true;
    msg.textContent = AR ? 'جارٍ الإرسال…' : 'Envoi…';
    try {
      const r = await fetch(api + '/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...d, langue: AR ? 'ar' : 'fr' }) });
      const rep = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(rep.erreur);
      f.reset();
      msg.textContent = AR ? 'وصلتنا رسالتكم، جزاكم الله خيرًا. نجيبكم بالبريد قريبًا.' : 'Votre message est bien reçu, merci. Nous vous répondons par e-mail très vite.';
    } catch (err) {
      msg.textContent = err.message || (AR ? 'تعذّر الإرسال، أعيدوا المحاولة.' : 'L’envoi n’a pas abouti, réessayez.');
    }
    b.disabled = false;
  });
})();
