// Header: solid once the page scrolls; phone menu panel with Escape + focus return.
export function initNav() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const toggle = header.querySelector('.menu-toggle');
  const nav = header.querySelector('#primary-nav');
  const label = toggle.querySelector('.menu-toggle-label');
  const root = document.documentElement;
  toggle.hidden = false;

  const overlay = header.classList.contains('is-overlay');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    header.classList.toggle('is-scrolled', !overlay || scrollY > 40);
  };
  if (overlay) {
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }

  const setOpen = (open, { focus = false } = {}) => {
    toggle.setAttribute('aria-expanded', String(open));
    label.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
    root.classList.toggle('nav-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) nav.querySelector('a')?.focus({ preventScroll: true });
    else if (focus) toggle.focus();
  };
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) setOpen(false, { focus: true });
  });
  // leaving the phone layout with the panel open
  matchMedia('(min-width: 1001px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
}
