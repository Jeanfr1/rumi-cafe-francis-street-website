// Gallery: tabs filter the archive (Evolution = timeline); every photo link
// opens the lightbox, falling back to the full-size file without JS.
export function initGallery() {
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const timeline = document.querySelector('[data-panel="evolution"]');
  const photos = document.querySelector('[data-panel="photos"]');
  const dlg = document.querySelector('[data-lightbox-dialog]');
  if (!dlg) return;
  document.querySelectorAll('[data-js-only]').forEach((el) => { el.hidden = false; });

  const show = (tab) => {
    tabs.forEach((t) => t.setAttribute('aria-pressed', String(t.dataset.tab === tab)));
    timeline.hidden = !(tab === 'evolution' || tab === 'all');
    photos.hidden = tab === 'evolution';
    for (const li of photos.querySelectorAll('.g-item')) li.hidden = !(tab === 'all' || li.dataset.cat === tab);
  };
  tabs.forEach((t) => t.addEventListener('click', () => show(t.dataset.tab)));
  if (tabs.length) show('evolution');

  // ------------------------------------------------------------ lightbox
  const img = dlg.querySelector('[data-lb-img]');
  const title = dlg.querySelector('[data-lb-title]');
  const quote = dlg.querySelector('[data-lb-quote]');
  let list = [];
  let idx = 0;
  let opener = null;
  const visibleLinks = () => [...document.querySelectorAll('[data-lightbox]')].filter((a) => a.offsetParent !== null);
  const render = () => {
    const a = list[idx];
    const thumb = a.querySelector('img');
    img.src = a.href;
    img.alt = thumb?.alt || a.dataset.title;
    title.textContent = a.dataset.title;
    quote.textContent = a.dataset.quote ? `“${a.dataset.quote}”` : '';
  };
  const step = (d) => { idx = (idx + d + list.length) % list.length; render(); };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-lightbox]');
    if (!a) return;
    e.preventDefault();
    list = visibleLinks();
    idx = Math.max(0, list.indexOf(a));
    opener = a;
    render();
    dlg.showModal();
  });
  dlg.querySelector('[data-lb-prev]').addEventListener('click', () => step(-1));
  dlg.querySelector('[data-lb-next]').addEventListener('click', () => step(1));
  dlg.querySelector('[data-close]').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  });
  dlg.addEventListener('close', () => opener?.focus({ preventScroll: true }));
}
