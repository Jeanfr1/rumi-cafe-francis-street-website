// Opening (06-roteiros/MOTION.md): photo settles, steam rises, the steam
// writes RUMI along the logo's own outlines, then the signature fills.
// 2.85 s, no loop, never blocks scrolling. Replay + Pause/Resume; reduced
// motion (device setting or "paused" remembered for the session) = final frame.
const KEY = 'rumi-motion';

function remembered() {
  try { return sessionStorage.getItem(KEY) === 'paused'; } catch { return false; }
}
function remember(paused) {
  try { paused ? sessionStorage.setItem(KEY, 'paused') : sessionStorage.removeItem(KEY); } catch { /* private mode */ }
}

export function initHero() {
  const hero = document.querySelector('[data-hero]');
  if (!hero) return;
  const root = document.documentElement;
  const controls = hero.querySelector('.motion-controls');
  const replay = hero.querySelector('[data-replay]');
  const toggle = hero.querySelector('[data-motion-toggle]');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = remembered();
  let frame = 0;
  controls.hidden = false;

  const play = () => {
    hero.classList.remove('play');
    void hero.offsetWidth; // restart the CSS animations
    hero.classList.add('play');
  };
  const sync = () => {
    root.classList.toggle('reduced', reduced.matches);
    root.classList.toggle('paused', paused && !reduced.matches);
    replay.disabled = reduced.matches;
    toggle.disabled = reduced.matches;
    toggle.textContent = paused ? 'Resume animation' : 'Pause animation';
    toggle.setAttribute('aria-pressed', String(paused));
    if (reduced.matches) { hero.classList.remove('play'); root.style.setProperty('--photo-offset', '0px'); }
  };

  replay.addEventListener('click', () => {
    if (reduced.matches) return;
    paused = false; remember(false); sync(); play();
  });
  toggle.addEventListener('click', () => {
    paused = !paused; remember(paused); sync();
    if (paused) root.style.setProperty('--photo-offset', '0px');
    else if (!hero.classList.contains('play')) play(); // paused since page load: start now
  });
  reduced.addEventListener('change', () => { sync(); if (!reduced.matches && !paused) play(); });

  // the first background drifts at most 24 px (timeline.json scroll.photoMaxOffsetPx)
  const onScroll = () => {
    if (frame || reduced.matches || paused || innerWidth <= 640) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (scrollY > innerHeight * 1.2) return;
      root.style.setProperty('--photo-offset', `${Math.min(24, Math.max(0, scrollY * 0.035)).toFixed(2)}px`);
    });
  };
  addEventListener('scroll', onScroll, { passive: true });

  sync();
  // a pause remembered from another page shows the final frame until Resume
  if (!reduced.matches && !paused) play();
}
