// QA against the production build: npm run build && npm run preview, then
//   npm run qa                      (local preview on :4192)
//   QA_BASE=https://... npm run qa  (live site)
// Uses the installed Chrome (playwright-core, channel chrome): the bundled
// headless shell renders at ~1 fps and would fake animation bugs.
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import { order } from '../src/data/site.js';

const BASE = process.env.QA_BASE || 'http://localhost:4192';
const PAGES = ['/', '/story/', '/menu/', '/gallery/', '/coffee-club/', '/privacy/', '/terms/', '/accessibility/', '/404.html'];
const WIDTHS = [320, 390, 430, 768, 1024, 1280, 1440, 1920];
const PROCESS_WORDS = /\b(conceptual|illustrative|mock-?up|campaign|generated|transcribed|reconfirm|placeholder|lorem|TODO|kit)\b/i;
const results = [];
const fail = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); if (!ok) fail.push(`${name} ${detail}`); };

const browser = await chromium.launch({ channel: 'chrome' });

// ---------------------------------------------------------------- cadence
{
  const page = await browser.newPage();
  await page.goto(BASE + '/');
  const ms = await page.evaluate(() => new Promise((res) => {
    const t = []; let last = performance.now();
    const f = (now) => { t.push(now - last); last = now; t.length < 60 ? requestAnimationFrame(f) : res(t.sort((a, b) => a - b)[30]); };
    requestAnimationFrame(f);
  }));
  check('rAF cadence < 40 ms', ms < 40, `${ms.toFixed(1)} ms`);
  await page.close();
}

// -------------------------------------------------- widths, images, errors
const internal = new Set();
for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 700 ? 844 : 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'load' });
    // walk the page so lazy images load and reveals run
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 700) { await page.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), y); await page.waitForTimeout(90); }
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth, iw: innerWidth,
      over: [...document.querySelectorAll('body *')].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.right > innerWidth + 1 && !e.closest('.carousel-track,.strip,.fav-row,.chip-row,.tab-row,.scene,.reviews-section,.gifts-section,.perks-section,.hero,.band-section,.join-section,.nf,.menu-hero'); }).slice(0, 5).map((e) => `${e.tagName}.${e.className.baseVal ?? e.className}`),
      // lazy images parked off-screen (horizontal scrollers) have not started yet: that is not broken
      broken: [...document.images].filter((i) => i.offsetParent && i.complete && !i.naturalWidth).map((i) => i.currentSrc || i.src).slice(0, 5),
      pending: [...document.images].filter((i) => i.offsetParent && !i.complete).map((i) => i.currentSrc || i.src),
      noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
      links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href').split('#')[0]),
      small: [...document.querySelectorAll('a.btn, button, .menu-add, .chip')].filter((e) => e.offsetParent && e.getBoundingClientRect().height < 40).map((e) => e.textContent.trim().slice(0, 30)).slice(0, 5),
    }));
    r.links.forEach((l) => internal.add(l));
    check(`${w}px ${p} no horizontal scroll`, r.sw === r.iw && !r.over.length, `${r.sw}/${r.iw} ${r.over.join(' ')}`);
    const pendingBad = [];
    for (const u of r.pending.slice(0, 8)) { const res = await fetch(u.startsWith('http') ? u : BASE + u); if (!res.ok) pendingBad.push(u); }
    check(`${w}px ${p} images load`, !r.broken.length && !pendingBad.length, [...r.broken, ...pendingBad].join(' '));
    check(`${w}px ${p} every img has alt`, r.noAlt === 0, String(r.noAlt));
    check(`${w}px ${p} tap targets >= 40px`, !r.small.length, r.small.join(' | '));
  }
  check(`${w}px no console errors`, !errors.length, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

// ------------------------------------------------------------ internal links
for (const l of internal) {
  const res = await fetch(BASE + (l || '/'));
  check(`link ${l} -> 200`, res.ok, String(res.status));
}

// -------------------------------------------------------------- no-JS pass
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  const home = await page.evaluate(() => ({
    text: document.body.innerText,
    hidden: [...document.querySelectorAll('.reveal, .hero-copy, .sig-fill')].filter((e) => +getComputedStyle(e).opacity < 1 || +getComputedStyle(e).fillOpacity < 1).length,
  }));
  check('no-JS home: hours, address, reviews visible', /Mon–Sat/.test(home.text) && /28 Francis Street/.test(home.text) && /Yulia L/.test(home.text));
  check('no-JS home: nothing left hidden', home.hidden === 0, String(home.hidden));
  await page.goto(BASE + '/menu/');
  const menu = await page.evaluate(() => ({ items: [...document.querySelectorAll('.menu-item')].filter((e) => e.offsetParent).length, names: [...document.querySelectorAll('.menu-name-static')].filter((e) => e.offsetParent).length }));
  check('no-JS menu: all 18 items and names visible', menu.items === 18 && menu.names === 18, JSON.stringify(menu));
  await page.goto(BASE + '/gallery/');
  const gal = await page.evaluate(() => ({ t: document.querySelectorAll('.t-card').length, g: [...document.querySelectorAll('.g-item')].filter((e) => e.offsetParent).length }));
  check('no-JS gallery: timeline + all photos visible', gal.t === 4 && gal.g === 14, JSON.stringify(gal));
  await ctx.close();
}

// ---------------------------------------------------------- reduced motion
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  await page.waitForTimeout(300);
  const r = await page.evaluate(() => ({
    play: document.querySelector('[data-hero]').classList.contains('play'),
    fill: getComputedStyle(document.querySelector('.sig-fill')).fillOpacity,
    copy: getComputedStyle(document.querySelector('.hero-copy')).opacity,
    steam: getComputedStyle(document.querySelector('.steam')).display,
    replay: document.querySelector('[data-replay]').disabled,
  }));
  check('reduced motion: final frame at once', !r.play && r.fill === '1' && r.copy === '1' && r.steam === 'none' && r.replay, JSON.stringify(r));
  await ctx.close();
}

// ------------------------------------------------------------ interactions
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  await page.waitForTimeout(3200);
  const sig = await page.evaluate(() => getComputedStyle(document.querySelector('.sig-fill')).fillOpacity);
  check('opening ends on the filled signature', sig === '1', sig);
  const hrefs = await page.evaluate(() => ({
    bag: document.querySelector('.bag-link').href, order: document.querySelector('.header-order').href,
    adds: [...document.querySelectorAll('.fav-add')].map((a) => a.href),
  }));
  check('bag -> online checkout', hrefs.bag === order.checkout, hrefs.bag);
  check('Order now -> online menu', hrefs.order === order.menu, hrefs.order);
  check('favourite Add buttons -> online menu', hrefs.adds.length === 5 && hrefs.adds.every((h) => h === order.menu));
  await page.click('[data-motion-toggle]');
  check('pause toggles aria-pressed', (await page.getAttribute('[data-motion-toggle]', 'aria-pressed')) === 'true');
  await page.click('[data-motion-toggle]');
  await page.click('[data-replay]');
  check('replay restarts the opening', await page.evaluate(() => document.querySelector('[data-hero]').classList.contains('play')));
  await page.click('.hero-ctas >> text=Find us on Francis Street');
  await page.waitForTimeout(1200);
  check('hero "Find us" lands on #visit', await page.evaluate(() => Math.abs(document.getElementById('visit').getBoundingClientRect().top) < 140));
  await page.locator('#reviews').scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => document.querySelector('.carousel-track').scrollLeft);
  await page.click('[data-next]');
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => document.querySelector('.carousel-track').scrollLeft);
  check('reviews: next scrolls the track', after > before, `${before} -> ${after}`);
  const status = await page.evaluate(() => document.querySelector('[data-open-status]:not([hidden])')?.textContent || '');
  check('open-now status rendered', /^(Open now|Closed now)/.test(status), status);
  await page.click('.hero-ctas >> text=Explore the menu').catch(async () => { await page.evaluate(() => scrollTo(0, 0)); await page.click('.hero-ctas >> text=Explore the menu'); });
  await page.waitForURL('**/menu/');
  check('hero "Explore the menu" opens /menu/', page.url().endsWith('/menu/'));

  // menu
  const visible = () => page.evaluate(() => [...document.querySelectorAll('.menu-item')].filter((e) => !e.hidden).length);
  await page.click('[data-cat="specials"]');
  check('menu: Specials = 5 bestsellers', (await visible()) === 5, String(await visible()));
  await page.click('[data-cat="all"]');
  await page.click('[data-diet="Vegan"]');
  check('menu: Vegan = 1', (await visible()) === 1, String(await visible()));
  await page.click('.chip-clear');
  await page.fill('#menu-q', 'croissant');
  await page.waitForTimeout(300);
  check('menu: search "croissant" = 2', (await visible()) === 2, String(await visible()));
  await page.fill('#menu-q', 'zzz');
  await page.waitForTimeout(300);
  check('menu: empty state shown', await page.isVisible('[data-empty]'));
  await page.click('[data-empty] [data-clear]');
  check('menu: reset = 18', (await visible()) === 18, String(await visible()));
  await page.click('.menu-open[data-open="c5"]');
  const dlg = await page.evaluate(() => ({ open: document.querySelector('[data-item-dialog]').open, name: document.querySelector('[data-dlg-name]').textContent, opts: document.querySelectorAll('.opt-list li').length, pairs: document.querySelectorAll('[data-pair]').length, add: document.querySelector('[data-dlg-add]').href, hash: location.hash }));
  check('menu: Latte dialog with 3 sizes + 4 milks + 2 pairings', dlg.open && dlg.name === 'Latte' && dlg.opts === 7 && dlg.pairs === 2 && dlg.hash === '#latte', JSON.stringify(dlg));
  check('menu: dialog Add -> online menu', dlg.add === order.menu, dlg.add);
  await page.click('[data-pair="p1"]');
  check('menu: pairing opens Butter Croissant', (await page.textContent('[data-dlg-name]')) === 'Butter Croissant');
  await page.keyboard.press('Escape');
  check('menu: Escape closes the dialog', !(await page.evaluate(() => document.querySelector('[data-item-dialog]').open)));
  check('menu: recently viewed lists 2', (await page.locator('[data-recent-list] li').count()) === 2);
  const rowAdds = await page.evaluate(() => [...document.querySelectorAll('.menu-add')].every((a) => a.href === document.querySelector('.menu-add').href) && document.querySelector('.menu-add').href);
  check('menu: every row Add -> online menu', rowAdds === order.menu, String(rowAdds));
  await page.goto(BASE + '/menu/#mocha');
  await page.waitForTimeout(400);
  check('menu: /menu/#mocha opens Mocha', (await page.evaluate(() => document.querySelector('[data-item-dialog]').open && document.querySelector('[data-dlg-name]').textContent)) === 'Mocha');

  // gallery
  await page.goto(BASE + '/gallery/');
  await page.click('[data-tab="interiors"]');
  const g = await page.evaluate(() => ({ items: [...document.querySelectorAll('.g-item')].filter((e) => !e.hidden).length, tl: document.querySelector('[data-panel="evolution"]').hidden }));
  check('gallery: Interiors = 7, timeline hidden', g.items === 7 && g.tl, JSON.stringify(g));
  await page.click('.g-item:not([hidden]) .g-link >> nth=0');
  const t1 = await page.textContent('[data-lb-title]');
  await page.click('[data-lb-next]');
  const t2 = await page.textContent('[data-lb-title]');
  check('gallery: lightbox opens and steps', t1 !== t2, `${t1} -> ${t2}`);
  await page.keyboard.press('Escape');
  check('gallery: Escape closes the lightbox', !(await page.evaluate(() => document.querySelector('[data-lightbox-dialog]').open)));

  // coffee club
  await page.goto(BASE + '/coffee-club/');
  const joins = await page.evaluate(() => [...document.querySelectorAll('a')].filter((a) => /Join the club/.test(a.textContent)).map((a) => a.href));
  check('club: Join buttons -> online club', joins.length === 2 && joins.every((h) => h === order.club), joins.join(' '));
  await ctx.close();
}

// --------------------------------------------------------- phone nav panel
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE + '/story/');
  await page.click('.menu-toggle');
  const open = await page.evaluate(() => ({ exp: document.querySelector('.menu-toggle').getAttribute('aria-expanded'), vis: !!document.querySelector('#primary-nav').offsetParent || getComputedStyle(document.querySelector('#primary-nav')).display !== 'none' }));
  check('phone nav opens', open.exp === 'true' && open.vis, JSON.stringify(open));
  await page.keyboard.press('Escape');
  const closed = await page.evaluate(() => ({ exp: document.querySelector('.menu-toggle').getAttribute('aria-expanded'), focus: document.activeElement === document.querySelector('.menu-toggle') }));
  check('phone nav: Escape closes, focus returns', closed.exp === 'false' && closed.focus, JSON.stringify(closed));
  await page.click('.menu-toggle');
  await page.click('#primary-nav >> text=Menu');
  await page.waitForURL('**/menu/');
  check('phone nav link navigates', page.url().endsWith('/menu/'));
  await ctx.close();
}

// ------------------------------------------------ visible copy has no notes
{
  const page = await browser.newPage();
  for (const p of PAGES) {
    await page.goto(BASE + p);
    const t = await page.evaluate(() => document.body.innerText + ' ' + [...document.querySelectorAll('[alt],[aria-label],title')].map((e) => e.getAttribute('alt') || e.getAttribute('aria-label') || e.textContent).join(' '));
    const m = t.match(PROCESS_WORDS);
    check(`${p} no production notes in copy`, !m, m ? m[0] : '');
  }
}

await browser.close();
fs.mkdirSync('qa/out', { recursive: true });
fs.writeFileSync('qa/out/report.json', JSON.stringify({ base: BASE, date: new Date().toISOString(), results }, null, 1));
console.log(`${results.length - fail.length}/${results.length} checks passed on ${BASE}`);
if (fail.length) { console.log('FAILED:\n- ' + fail.join('\n- ')); process.exit(1); }
