// README captures from the production build (npm run build && npm run preview):
//   node scripts/readme-assets.mjs  ->  qa/out/readme/ (raw) + .github/assets/hero-scroll.gif
// then ~/anaconda3/bin/python3 scripts/readme-composite.py for the framed sheets.
// The opening is captured by seeking the CSS animations (deterministic), then
// the page scrolls into "Stay a little."
import { chromium } from 'playwright-core';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.QA_BASE || 'http://localhost:4192';
const OUT = 'qa/out/readme';
const FRAMES = path.join(OUT, 'frames');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(FRAMES, { recursive: true });
fs.mkdirSync('.github/assets', { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
let n = 0;
const frame = async (page, hold = 1) => {
  const buf = await page.screenshot({ type: 'png' });
  for (let i = 0; i < hold; i++) fs.writeFileSync(path.join(FRAMES, `f_${String(n++).padStart(4, '0')}.png`), buf);
};

// ---------------------------------------------------------------- hero GIF
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelector('[data-replay]').click());
  await page.evaluate(() => document.getAnimations().forEach((a) => a.pause()));
  for (let t = 0; t <= 3000; t += 75) {
    await page.evaluate((ms) => document.getAnimations().forEach((a) => { a.currentTime = ms; }), t);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    await frame(page, t === 0 ? 4 : t === 3000 ? 14 : 1);
  }
  const openingFrames = n; // every opening frame is kept; the scroll part keeps every other one (GIF < 4 MB)
  await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
  for (let i = 1; i <= 16; i++) {
    const y = Math.round((i / 16) ** 1.4 * 900);
    await page.evaluate((yy) => scrollTo({ top: yy, behavior: 'instant' }), y);
    await page.waitForTimeout(260);
    await frame(page, i === 16 ? 12 : 1);
  }
  await page.close();
  execFileSync('ffmpeg', ['-y', '-v', 'error', '-framerate', '14', '-i', path.join(FRAMES, 'f_%04d.png'),
    '-vf', `select='lt(n\\,${openingFrames})+eq(mod(n\\,2)\\,0)',setpts=N/14/TB,fps=14,scale=860:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=112:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle`,
    '-loop', '0', '.github/assets/hero-scroll.gif']);
  console.log('gif', (fs.statSync('.github/assets/hero-scroll.gif').size / 1e6).toFixed(2), 'MB,', n, 'frames');
}

// ------------------------------------------------------- desktop sections
const shots = [
  ['d1-favourites', '/', '#favourites', 0],
  ['d2-menu', '/menu/', '.menu-board', -40],
  ['d3-story', '/story/', '.pick-section', 30],
  ['d4-club', '/coffee-club/', '#gift-cards', -10],
  ['d5-find', '/', '#find-us', -20],
  ['d6-gallery', '/gallery/', 'h1', -160],
];
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  for (const [name, url, sel, dy] of shots) {
    await page.goto(BASE + url, { waitUntil: 'load' });
    await page.evaluate(([s, d]) => { const el = document.querySelector(s); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 92 + d, behavior: 'instant' }); }, [sel, dy]);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  }
  // menu item dialog
  await page.goto(BASE + '/menu/#latte', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'd7-dialog.png') });
  await page.close();
}

// ---------------------------------------------------------------- mobile
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const m = [
    ['m1-hero', '/', null],
    ['m2-place', '/', '#our-place'],
    ['m3-menu', '/menu/', '.menu-group'],
    ['m4-club', '/coffee-club/', null],
  ];
  for (const [name, url, sel] of m) {
    await page.goto(BASE + url, { waitUntil: 'load' });
    if (sel) await page.evaluate((s) => { const el = document.querySelector(s); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 40, behavior: 'instant' }); }, sel);
    await page.waitForTimeout(3300);
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  }
  await page.goto(BASE + '/menu/#flat-white', { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, 'm5-dialog.png') });
  await ctx.close();
}

// ----------------------------------------------------------------- banner
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 420 }, deviceScaleFactor: 2 });
  // data: URIs (a setContent page cannot read file:// assets)
  const abs = (p) => `data:${p.endsWith('.woff2') ? 'font/woff2' : 'image/webp'};base64,${fs.readFileSync(p).toString('base64')}`;
  const logo = fs.readdirSync('public/img').find((f) => /^rumi-logo-v\d+-960\.webp$/.test(f));
  const hero = fs.readdirSync('public/img').find((f) => /^hero-desktop-v\d+-1920\.webp$/.test(f));
  await page.setContent(`<!doctype html><html><head><style>
    @font-face{font-family:D;src:url('${abs('src/fonts/rumi-display.woff2')}')}
    @font-face{font-family:E;src:url('${abs('src/fonts/rumi-editorial-italic.woff2')}')}
    @font-face{font-family:S;src:url('${abs('src/fonts/rumi-sans-bold.woff2')}')}
    body{margin:0;width:1280px;height:420px;position:relative;overflow:hidden;background:#103E49;color:#FFF8E9}
    .bg{position:absolute;inset:0;background:url('${abs('public/img/' + hero)}') right 40%/cover}
    .sh{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,43,51,.97) 0%,rgba(11,43,51,.86) 40%,rgba(16,62,73,.25) 75%,rgba(16,62,73,.1))}
    .c{position:absolute;left:78px;top:64px}
    img{width:250px;display:block}
    h1{font-family:D;font-weight:600;font-size:66px;letter-spacing:-.05em;line-height:1;margin:34px 0 0}
    h1 em{font-family:E;font-weight:300;font-style:italic;display:block;font-size:60px;margin-bottom:4px}
    p{font-family:S;font-size:13px;letter-spacing:.24em;text-transform:uppercase;margin:26px 0 0;color:#D6B76E}
  </style></head><body><div class="bg"></div><div class="sh"></div><div class="c">
    <img src="${abs('public/img/' + logo)}" alt=""><h1><em>Your perfect</em>little pause.</h1><p>28 Francis Street · Dublin 8</p></div></body></html>`);
  await page.waitForTimeout(800);
  await page.screenshot({ path: '.github/assets/banner.png' });
  await page.close();
}

await browser.close();
console.log('raw captures in', OUT);
