// Progressive enhancement only: every page works and reads without this file.
import { initNav } from './nav.js';
import { initHero } from './hero.js';
import { initReveals } from './reveal.js';
import { initCarousels } from './carousel.js';
import { initOpenStatus } from './hours.js';
import { initMenu } from './menu.js';
import { initGallery } from './gallery.js';

document.documentElement.classList.add('js');

for (const init of [initNav, initHero, initReveals, initCarousels, initOpenStatus, initMenu, initGallery]) {
  try { init(); } catch (err) { console.error(err); } // one module failing never blocks the others
}
