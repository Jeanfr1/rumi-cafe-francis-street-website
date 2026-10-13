// Paper sheets and cards settle in (26 px, -2deg, 650 ms). The hidden state
// is keyed on .reveal-on, which only this module adds, right before observing.
export function initReveals() {
  const els = [...document.querySelectorAll('.reveal')];
  if (!els.length || !('IntersectionObserver' in window)) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
  document.documentElement.classList.add('reveal-on');
  els.forEach((el) => io.observe(el));
  // anything already scrolled past (hash or back navigation) shows at once
  requestAnimationFrame(() => els.forEach((el) => { if (el.getBoundingClientRect().bottom < 0) el.classList.add('visible'); }));
}
