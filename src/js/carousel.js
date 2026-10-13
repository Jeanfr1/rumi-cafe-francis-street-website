// Reviews: a native scroll-snap track (swipe / keyboard scroll without JS);
// JS adds prev/next and dots that follow the scroll position.
export function initCarousels() {
  for (const box of document.querySelectorAll('[data-carousel]')) {
    const track = box.querySelector('.carousel-track');
    const cards = [...track.children];
    const controls = box.querySelector('.carousel-controls');
    const dots = box.querySelector('[data-dots]');
    if (cards.length < 2) continue;
    controls.hidden = false;

    const step = () => cards[1].offsetLeft - cards[0].offsetLeft;
    const current = () => Math.round(track.scrollLeft / step());
    const go = (i) => {
      const max = cards.length - 1;
      const idx = (i + cards.length) % cards.length;
      track.scrollTo({ left: Math.min(idx, max) * step(), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };
    cards.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `Go to review ${i + 1}`);
      b.addEventListener('click', () => go(i));
      dots.append(b);
    });
    const mark = () => {
      const c = Math.min(current(), cards.length - 1);
      [...dots.children].forEach((d, i) => d.setAttribute('aria-current', String(i === c)));
    };
    box.querySelector('[data-prev]').addEventListener('click', () => go(current() - 1));
    box.querySelector('[data-next]').addEventListener('click', () => {
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      go(atEnd ? 0 : current() + 1);
    });
    let t = 0;
    track.addEventListener('scroll', () => { cancelAnimationFrame(t); t = requestAnimationFrame(mark); }, { passive: true });
    mark();
  }
}
