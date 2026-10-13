// Renders every page from src/data/site.js at build time (see vite.config.js).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from './data/site.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const readJSON = (f) => JSON.parse(fs.readFileSync(path.join(HERE, 'data', f), 'utf8'));
const images = readJSON('images.json');
const trace = readJSON('logo-trace.json');
const mapSvg = fs.readFileSync(path.join(HERE, 'data', 'map.svg'), 'utf8');

const { order, contact, brand } = S;
const byId = Object.fromEntries(S.menuItems.map((i) => [i.id, i]));

// ------------------------------------------------------------ helpers ----

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const money = (n) => `€${n.toFixed(2)}`;
const delta = (n) => (n > 0 ? `+${money(n)}` : 'included');

function src(key, w) {
  const m = images[key];
  if (!m) throw new Error(`image ${key} missing: run npm run images`);
  return `/img/${key}-${m.v}-${w ?? m.widths[m.widths.length - 1]}.webp`;
}
function srcset(key) {
  return images[key].widths.map((w) => `${src(key, w)} ${w}w`).join(', ');
}
/** Responsive <img>. width/height = intrinsic ratio so layout never jumps. */
function img(key, { alt = '', sizes = '100vw', cls = '', eager = false, focus = '', extra = '' } = {}) {
  const m = images[key];
  const style = focus ? ` style="object-position:${focus}"` : '';
  return `<img${cls ? ` class="${cls}"` : ''} src="${src(key, m.widths[Math.min(1, m.widths.length - 1)])}" srcset="${srcset(key)}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${style}${extra}>`;
}
function logo({ cls = 'logo', alt = brand.name, sizes = '180px', eager = false } = {}) {
  const m = images.logo;
  return `<img class="${cls}" src="/img/rumi-logo-${m.v}-480.webp" srcset="${m.widths.map((w) => `/img/rumi-logo-${m.v}-${w}.webp ${w}w`).join(', ')}" sizes="${sizes}" width="${m.w}" height="${m.h}" alt="${esc(alt)}"${eager ? '' : ' loading="lazy"'} decoding="async">`;
}

const ICONS = {
  arrowUR: '<path d="M7 17 17 7M8 7h9v9"/>',
  arrowR: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowL: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
  arrowD: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  arrowU: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  bag: '<path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1Z"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="1.5"/><path d="m4 7 8 6 8-6"/>',
  instagram: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.9" cy="7.1" r=".6" fill="currentColor"/>',
  facebook: '<path d="M14 8.5h2.5V5H14a4 4 0 0 0-4 4v2H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V9a.5.5 0 0 1 .5-.5Z"/>',
  tripadvisor: '<circle cx="7.5" cy="13.5" r="3.5"/><circle cx="16.5" cy="13.5" r="3.5"/><path d="M4 10c2.4-2.4 13.6-2.4 16 0M12 9.5l-1.6 2.6M12 9.5l1.6 2.6"/>',
  star: '<path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z"/>',
  gift: '<rect x="4" y="9" width="16" height="11" rx="1"/><path d="M3 9h18v3H3zM12 9v11M12 9c-1-3-5-4.5-5.5-2S10 9 12 9Zm0 0c1-3 5-4.5 5.5-2S14 9 12 9Z"/>',
  cup: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9Z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5c-.8 1 .8 2 0 3M11 3.5c-.8 1 .8 2 0 3"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/>',
  people: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0M15.5 5.6a3.2 3.2 0 0 1 0 6M17 13.6a5.5 5.5 0 0 1 3.5 5.4"/>',
  leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19 13 11"/>',
  sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  sparkle: '<path d="M12 3c.6 4.6 3.4 7.4 8 8-4.6.6-7.4 3.4-8 8-.6-4.6-3.4-7.4-8-8 4.6-.6 7.4-3.4 8-8Z"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  replay: '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4.5 4.5v4.2h4.2"/>',
  timer: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 1.5M9.5 3h5"/>',
  sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
};
const icon = (name, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
const stars = (n = 5) => `<span class="stars" aria-hidden="true">${icon('star', 'icon star').repeat(n)}</span>`;
const arrowNote = '<svg class="note-arrow" viewBox="0 0 80 75" aria-hidden="true"><path d="M55 3C72 28 62 45 19 58m0 0 16-2m-16 2 7-15"/></svg>';
const ext = (label = '') => `<span class="ext" aria-hidden="true">${icon('arrowUR', 'icon icon-ext')}</span>${label ? `<span class="sr-only"> (${label})</span>` : ''}`;
const orderNote = 'opens Rumi online ordering';

const hoursRows = S.hours.map((h) => `<li><span>${h.short}</span><span>${h.open.replace(/^0/, '')}–${h.close}</span></li>`).join('');
const hoursData = esc(JSON.stringify(S.hours.map(({ dayIdx, open, close }) => ({ dayIdx, open, close }))));
const openStatus = (cls = '') => `<p class="open-status ${cls}" data-open-status data-hours="${hoursData}" hidden></p>`;

// ------------------------------------------------------------- layout ----

function header(page) {
  const overlay = page === 'home';
  const links = S.nav.map((n) => `<li><a href="${n.href}"${n.id === page ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header${overlay ? ' is-overlay' : ' is-solid'}" data-header>
  <div class="header-inner">
    <a class="brand" href="/" aria-label="Rumi Cafe, home">${logo({ cls: 'brand-logo', alt: '', sizes: '160px', eager: true })}</a>
    <nav class="primary-nav" id="primary-nav" aria-label="Main">
      <ul class="nav-list">${links}</ul>
      <div class="nav-panel-extra">
        <a class="btn btn-gold" href="${order.menu}">Order for collection ${ext(orderNote)}</a>
        <p class="nav-panel-address">${contact.street}, ${contact.area}<br>${S.hours.map((h) => `${h.short} ${h.open.replace(/^0/, '')}–${h.close}`).join(' · ')}</p>
      </div>
    </nav>
    <div class="header-actions">
      <span class="header-place">Francis Street · Dublin 8</span>
      <a class="btn btn-gold btn-sm header-order" href="${order.menu}">Order now<span class="sr-only"> (${orderNote})</span></a>
      <a class="bag-link" href="${order.checkout}" aria-label="Your bag: checkout on Rumi online ordering">${icon('bag')}</a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" hidden><span class="menu-toggle-label">Menu</span><span class="burger" aria-hidden="true"><i></i><i></i></span></button>
    </div>
  </div>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <a href="/" aria-label="Rumi Cafe, home">${logo({ cls: 'footer-logo', alt: '', sizes: '170px' })}</a>
      <p class="footer-line">${brand.footerLine}</p>
      <p class="footer-tag"><em>${brand.tagline}</em></p>
    </div>
    <nav class="footer-col" aria-label="Footer">
      <h2 class="footer-h">Navigate</h2>
      <ul>${S.nav.map((n) => `<li><a href="${n.href}">${n.label}</a></li>`).join('')}<li><a href="${order.menu}">Order online ${ext(orderNote)}</a></li></ul>
    </nav>
    <div class="footer-col">
      <h2 class="footer-h">Visit</h2>
      <address>${contact.street}<br>${contact.area}<br>${contact.eircode}</address>
      <ul class="footer-hours">${hoursRows}</ul>
      <a class="footer-link" href="${contact.directions}" target="_blank" rel="noopener">Get directions ${ext('opens Google Maps')}</a>
    </div>
    <div class="footer-col">
      <h2 class="footer-h">Contact</h2>
      <ul>
        <li><a href="mailto:${contact.email}">${contact.email}</a></li>
        <li><a href="${contact.phoneHref}">${contact.phone}</a></li>
      </ul>
      <h2 class="footer-h footer-h-gap">Legal</h2>
      <ul><li><a href="/privacy/">Privacy policy</a></li><li><a href="/terms/">Terms of service</a></li><li><a href="/accessibility/">Accessibility</a></li></ul>
    </div>
    <div class="footer-col">
      <h2 class="footer-h">Connect</h2>
      <ul class="social">
        <li><a href="${contact.instagram}" target="_blank" rel="noopener" aria-label="Instagram ${contact.instagramHandle}">${icon('instagram')}</a></li>
        <li><a href="${contact.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${icon('facebook')}</a></li>
        <li><a href="${contact.tripadvisor}" target="_blank" rel="noopener" aria-label="Tripadvisor">${icon('tripadvisor')}</a></li>
      </ul>
      <p class="footer-small">Speciality coffee by ${contact.coffeeRoaster.name}</p>
    </div>
  </div>
  <div class="footer-bottom">
    <p>© 2026 Rumi Café Bar. All rights reserved.</p>
    <p>Handcrafted with <span class="heart" aria-label="love">♥</span> in Dublin</p>
    <a class="back-top" href="#top">Back to top ${icon('arrowU')}</a>
  </div>
</footer>`;
}

const PAGES = {};
export const pageIds = new Set();
function page(id, def) { PAGES[id] = def; pageIds.add(id); }

export function renderPage(id) {
  const p = PAGES[id];
  if (!p) throw new Error(`unknown page ${id}`);
  const url = S.SITE_URL + (p.path ?? '/');
  const title = p.title ? `${p.title} · Rumi Cafe, Francis Street` : 'Rumi Cafe · Your perfect little pause';
  const desc = p.description ?? brand.description;
  const ld = id === 'home' ? `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'CafeOrCoffeeShop', name: brand.fullName, url: S.SITE_URL,
    image: `${S.SITE_URL}/img/og-${images.logo.v}.jpg`, servesCuisine: ['Coffee', 'Turkish'], priceRange: '€',
    telephone: contact.phone, email: contact.email,
    address: { '@type': 'PostalAddress', streetAddress: contact.street, addressLocality: 'Dublin 8', postalCode: contact.eircode, addressCountry: 'IE' },
    geo: { '@type': 'GeoCoordinates', latitude: S.locations[0].coords[0], longitude: S.locations[0].coords[1] },
    hasMap: contact.place, sameAs: [contact.instagram, contact.facebook, contact.tripadvisor],
    openingHoursSpecification: S.hours.map((h) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: h.dayIdx.map((d) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d]), opens: h.open, closes: h.close })),
  })}</script>` : '';
  return `<!doctype html>
<html lang="en-IE" id="top">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#103E49">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Rumi Cafe">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${S.SITE_URL}/img/og-${images.logo.v}.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/img/favicon-${images.logo.v}-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/img/favicon-${images.logo.v}-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon-${images.logo.v}.png">
<link rel="stylesheet" href="/src/css/main.css">
${ld}
</head>
<body class="page-${id}">
${header(id)}
<main id="main" tabindex="-1">
${p.body()}
</main>
${footer()}
<script type="module" src="/src/js/main.js"></script>
</body>
</html>`;
}

// --------------------------------------------------------- components ----

function signature() {
  // Outlines of the real logo: stroked first (the steam "writes" RUMI), then filled.
  // fill layer: one even-odd path per letter part; line layer: every contour
  // on its own (a dash pattern restarts at each subpath, so one path each).
  const fills = trace.parts.map((p, i) => `<path class="sig-fill${p.y > 560 ? ' sig-cafe' : ''}" style="--i:${i}" d="${p.d}"/>`).join('');
  const lines = trace.parts.flatMap((p, i) => p.d.split('M').filter(Boolean).map((sub) => `<path class="sig-line${p.y > 560 ? ' sig-cafe' : ''}" style="--i:${i}" pathLength="1" d="M${sub}"/>`)).join('');
  return `<div class="hero-signature" aria-hidden="true">
    <svg class="steam" viewBox="0 0 500 160"><path pathLength="1" d="M60 155C115 100 30 86 89 31"/><path pathLength="1" d="M223 154C272 110 173 74 241 15"/><path pathLength="1" d="M361 157C402 103 320 80 375 34"/></svg>
    <svg class="sig" viewBox="0 0 ${trace.w} ${trace.h}" fill-rule="evenodd"><g class="sig-fills">${fills}</g><g class="sig-lines">${lines}</g></svg>
  </div>`;
}

function favouriteCard(item, i) {
  return `<li class="fav-card" style="--tilt:${[-2.2, 1.6, -1.1, 2.1, -1.6][i % 5]}deg">
    <a class="fav-photo" href="/menu/#${item.slug}" aria-label="${esc(item.name)}: see details on the menu">${img(item.image, { alt: '', sizes: '(max-width: 700px) 64vw, 240px', focus: item.focus })}</a>
    <div class="fav-caption">
      <h3 class="fav-name"><a href="/menu/#${item.slug}">${item.name}</a></h3>
      <p class="fav-price">${money(item.price)}</p>
      <a class="fav-add" href="${order.menu}" aria-label="Add ${esc(item.name)} on Rumi online ordering">${icon('plus')}<span>Add</span></a>
    </div>
  </li>`;
}

function reviewCard(r) {
  return `<li class="review-card">
    <figure>
      ${stars()}<span class="sr-only">5 out of 5 stars.</span>
      <blockquote><p>“${esc(r.text)}”</p></blockquote>
      <figcaption><span class="review-avatar" aria-hidden="true">${r.name[0]}</span><span><strong>${r.name}</strong><span>Google review · ${r.date}</span></span></figcaption>
    </figure>
  </li>`;
}

function giftCardArt(tone, value, i = 0) {
  return `<div class="giftcard giftcard-${tone}" style="--i:${i}" aria-hidden="true">
    <span class="giftcard-top"><span class="giftcard-kicker">Gift card</span><span class="giftcard-value">${value}</span></span>
    ${logo({ cls: 'giftcard-logo', alt: '', sizes: '120px' })}
    <span class="giftcard-foot">Rumi Cafe · Francis Street · Dublin 8</span>
  </div>`;
}

function locationCard(l) {
  return `<article class="loc-card${l.primary ? ' is-primary' : ''}" aria-labelledby="loc-${l.id}">
    <div class="loc-photo">${img(l.image, { alt: l.primary ? 'The teal Rumi Cafe Bar storefront on Francis Street' : 'A Rumi takeaway cup', sizes: '(max-width: 700px) 40vw, 200px' })}</div>
    <div class="loc-body">
      <p class="loc-badge">${l.badge} · ${l.type}</p>
      <h3 id="loc-${l.id}" class="loc-name">${l.name}</h3>
      <p class="loc-line">${icon('pin')}<span>${l.address}</span></p>
      <p class="loc-line">${icon('clock')}<span>${l.hoursText}</span></p>
      ${l.primary ? openStatus('loc-open') : ''}
      <a class="btn btn-teal btn-sm" href="${l.directions}" target="_blank" rel="noopener">Get directions ${ext('opens Google Maps')}</a>
    </div>
  </article>`;
}

// --------------------------------------------------------------- home ----

page('home', {
  path: '/',
  body: () => {
    const H = S.home;
    const favs = H.favourites.ids.map((id) => byId[id]);
    return `
<section class="hero" id="welcome" aria-labelledby="hero-title" data-hero>
  <div class="hero-photo"><picture>
    <source media="(max-width: 640px)" srcset="${srcset('table')}" sizes="100vw">
    ${img('hero-desktop', { alt: 'Two lattes in teal cups, a cinnamon swirl and a brownie on a wooden table at Rumi', sizes: '100vw', eager: true })}
  </picture></div>
  <div class="hero-shade"></div>
  <div class="hero-copy">
    <p class="eyebrow">${H.hero.eyebrow}</p>
    <h1 id="hero-title"><em>${H.hero.titleA}</em><span>${H.hero.titleB}</span></h1>
    <p class="hand">${H.hero.note}</p>
    <div class="hero-ctas">
      <a class="btn btn-gold" href="/menu/">Explore the menu ${icon('arrowR')}</a>
      <a class="btn btn-ghost" href="#visit">Find us on Francis Street ${icon('arrowUR')}</a>
    </div>
    <p class="hero-meta"><a href="${contact.reviews}" target="_blank" rel="noopener">${stars()} <span>${S.rating.score} · ${S.rating.count} Google reviews</span>${ext('opens Google Maps')}</a></p>
  </div>
  <div class="coffee-note" aria-hidden="true">${H.hero.sideNote}${arrowNote}</div>
  ${signature()}
  <div class="hero-bottom">
    <a href="#our-place" class="scroll-cue">Take your time ${icon('arrowD')}</a>
    <div class="motion-controls" hidden>
      <button type="button" data-replay>Replay the opening animation ${icon('replay')}</button>
      <button type="button" data-motion-toggle aria-pressed="false">Pause animation</button>
    </div>
  </div>
</section>

<section class="place-section scene" id="our-place" aria-labelledby="place-title">
  <div class="scene-photo counter-photo">${img('counter', { alt: 'The Rumi counter: pendant lamps, the chalkboard menu and the pastry case', sizes: '(max-width: 760px) 100vw, 80vw' })}</div>
  <article class="paper reveal">
    <p class="eyebrow">${H.place.eyebrow}</p>
    <h2 id="place-title"><em>${H.place.title}</em></h2>
    <div class="gold-swish" aria-hidden="true"></div>
    <p>${H.place.body}</p>
    <a class="text-link" href="/gallery/">${H.place.link} ${icon('arrowUR')}</a>
  </article>
  <span class="scene-note" aria-hidden="true">${H.place.note}${arrowNote}</span>
</section>

<section class="favs-section" id="favourites" aria-labelledby="favs-title">
  <div class="section-head reveal">
    <div>
      <p class="eyebrow eyebrow-line">${H.favourites.eyebrow}</p>
      <h2 id="favs-title">${H.favourites.title}</h2>
    </div>
    <a class="btn btn-teal" href="/menu/">View the full menu ${icon('arrowR')}</a>
  </div>
  <ul class="fav-row" role="list">${favs.map(favouriteCard).join('')}</ul>
  <p class="favs-quote reveal"><em>“${H.favourites.quote.text}”</em> <span>— ${H.favourites.quote.name}, Google review</span></p>
</section>

<section class="sweet-section scene" id="coffee" aria-labelledby="coffee-title">
  <div class="scene-photo sweet-photo">${img('table', { alt: 'Coffee, a cinnamon swirl and a brownie at Rumi', sizes: '100vw', focus: '60% 45%' })}</div>
  <div class="sweet-shade"></div>
  <div class="sweet-copy reveal">
    <p class="eyebrow">${H.sweet.eyebrow}</p>
    <h2 id="coffee-title">${H.sweet.title}</h2>
    <p>${H.sweet.body}</p>
    <a class="btn btn-ghost" href="/menu/">See what's on the menu ${icon('arrowR')}</a>
  </div>
  <div class="paper-ribbon" aria-hidden="true"><span>${H.sweet.ribbon}</span><span class="ribbon-mark">Rumi · Dublin 8</span></div>
</section>

<section class="why-section" id="why-rumi" aria-labelledby="why-title">
  <div class="why-head reveal">
    <p class="eyebrow eyebrow-line">${H.why.eyebrow}</p>
    <h2 id="why-title">${H.why.title}</h2>
    <p class="why-lead">${H.why.body}</p>
    <a class="rating-badge" href="${contact.reviews}" target="_blank" rel="noopener">
      <span class="rating-score">${S.rating.score}</span>
      <span class="rating-meta">${stars()}<span>${S.rating.count}+ happy guests on Google</span></span>${ext('opens Google Maps')}
    </a>
  </div>
  <ul class="why-grid" role="list">
    ${H.why.features.map((f, i) => `<li class="why-card reveal" style="--tilt:${[-1.4, 1.2, -0.8, 1.5][i]}deg">
      <div class="why-photo">${img(f.image, { alt: '', sizes: '(max-width: 700px) 86vw, 300px', focus: f.focus })}</div>
      <h3>${f.title}</h3><p>${f.body}</p></li>`).join('')}
  </ul>
  <dl class="info-strip reveal">
    <div><dt>${icon('clock')} Service hours</dt><dd>${S.hours.map((h) => `${h.short} ${h.open.replace(/^0/, '')}–${h.close}`).join('<br>')}</dd></div>
    <div><dt>${icon('sparkle')} Heritage</dt><dd>Authentic Turkish recipes</dd></div>
    <div><dt>${icon('pin')} Location</dt><dd>The Liberties, Dublin 8</dd></div>
  </dl>
</section>

<section class="reviews-section" id="reviews" aria-labelledby="reviews-title">
  <div class="reviews-photo">${img('night', { alt: '', sizes: '(max-width: 760px) 100vw, 55vw' })}</div>
  <div class="reviews-inner">
    <div class="reviews-head reveal">
      <p class="eyebrow">${H.reviews.eyebrow}</p>
      <h2 id="reviews-title">${H.reviews.title}</h2>
      <p class="reviews-score">${stars()} <strong>${S.rating.score}</strong> · ${S.rating.count} reviews on Google</p>
    </div>
    <div class="carousel" data-carousel>
      <ul class="carousel-track" role="list" tabindex="0" aria-label="Guest reviews">${S.reviews.map(reviewCard).join('')}</ul>
      <div class="carousel-controls" hidden>
        <button type="button" class="round-btn" data-prev aria-label="Previous review">${icon('arrowL')}</button>
        <div class="carousel-dots" data-dots></div>
        <button type="button" class="round-btn" data-next aria-label="Next review">${icon('arrowR')}</button>
      </div>
    </div>
    <a class="text-link text-link-light" href="${contact.reviews}" target="_blank" rel="noopener">Read all reviews on Google ${ext('opens Google Maps')}</a>
  </div>
</section>

<section class="gifts-section" id="gifts" aria-labelledby="gifts-title">
  <div class="gifts-photo">${img('to-go', { alt: '', sizes: '(max-width: 760px) 100vw, 50vw', focus: '30% 50%' })}</div>
  <div class="gifts-inner">
    <div class="gifts-copy reveal">
      <p class="eyebrow eyebrow-chip">${icon('gift')} ${H.gifts.eyebrow}</p>
      <h2 id="gifts-title">${H.gifts.title}</h2>
      <p class="gifts-quote"><em>${H.gifts.quote}</em></p>
      <ul class="gifts-list" role="list">${H.gifts.cards.map((c, i) => `<li>${icon(i ? 'heart' : 'star')}<div><h3>${c.title}</h3><p>${c.body}</p></div></li>`).join('')}</ul>
      <a class="btn btn-gold" href="/coffee-club/">Explore the club ${icon('arrowR')}</a>
    </div>
    <div class="gift-fan reveal" aria-hidden="true">
      ${giftCardArt('coffee', '€100', 0)}${giftCardArt('teal', '€75', 1)}${giftCardArt('gold', '€50', 2)}${giftCardArt('paper', '€25', 3)}
    </div>
  </div>
</section>

<section class="visit-section scene" id="visit" aria-labelledby="visit-title">
  <div class="scene-photo facade-photo">${img('facade', { alt: 'The teal-blue Rumi Cafe Bar storefront at 28 Francis Street, with guests at the outdoor tables', sizes: '100vw' })}</div>
  <div class="visit-shade"></div>
  <div class="visit-copy reveal">
    <p class="eyebrow">${H.visit.eyebrow}</p>
    <h2 id="visit-title">${H.visit.title}</h2>
    <address>${contact.street},<br>${contact.area}, ${contact.eircode}</address>
    <ul class="visit-hours">${hoursRows}</ul>
    ${openStatus('visit-open')}
    <div class="visit-ctas">
      <a class="btn btn-gold" href="${contact.directions}" target="_blank" rel="noopener">Get directions ${ext('opens Google Maps')}</a>
      <a class="text-link text-link-light" href="${contact.instagram}" target="_blank" rel="noopener">See what's happening ${ext('opens Instagram')}</a>
    </div>
  </div>
</section>

<section class="find-section" id="find-us" aria-labelledby="find-title">
  <div class="section-head reveal">
    <div>
      <p class="eyebrow eyebrow-line">Locations</p>
      <h2 id="find-title">${H.visit.findTitle}</h2>
      <p class="section-lead">${H.visit.findBody}</p>
    </div>
  </div>
  <div class="find-grid">
    <div class="loc-list">${S.locations.map(locationCard).join('')}</div>
    <figure class="map-card reveal">
      <div class="map-frame">${mapSvg}
        <span class="map-tag map-tag-francis" aria-hidden="true">Rumi · Francis St</span>
        <span class="map-tag map-tag-templebar" aria-hidden="true">Temple Bar pop-up</span>
      </div>
      <figcaption><a href="${contact.place}" target="_blank" rel="noopener">Open Rumi in Google Maps ${ext('opens Google Maps')}</a><span>Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a></span></figcaption>
    </figure>
  </div>
</section>

<section class="around-section" id="around" aria-labelledby="around-title">
  <div class="around-image reveal">${img('cup', { alt: 'A takeaway cup with the Rumi logo outside the café', sizes: '(max-width: 760px) 88vw, 40vw' })}<span class="photo-caption">${H.closing.caption}</span></div>
  <div class="around-copy reveal">
    <p class="eyebrow">${H.closing.eyebrow}</p>
    <h2 id="around-title">${H.closing.title}</h2>
    <p>${H.closing.body}</p>
    <div class="around-ctas">
      <a class="btn btn-dark" href="${contact.instagram}" target="_blank" rel="noopener">Follow Rumi ${ext('opens Instagram')}</a>
      <a class="btn btn-outline" href="${order.menu}">Order for collection ${ext(orderNote)}</a>
    </div>
    <div class="environment-peek">${img('inside', { alt: "Guests at the tables inside Rumi, the counter behind them", sizes: '(max-width: 760px) 52vw, 22vw', focus: '50% 40%' })}</div>
    <span class="small-note" aria-hidden="true">${H.closing.note}</span>
  </div>
</section>`;
  },
});

// -------------------------------------------------------------- story ----

page('story', {
  path: '/story/',
  title: 'Our story',
  description: 'The Rumi story: a family-owned Turkish-Irish café founded by the Balkir sisters on Francis Street, in the heart of the Liberties.',
  body: () => {
    const T = S.story;
    const pick = byId[T.pick.itemId];
    return `
<section class="story-hero" aria-labelledby="story-title">
  <div class="story-photos reveal">
    <figure class="polaroid story-main">${img('sisters', { alt: 'The three Balkir sisters outside Rumi Cafe Bar on Francis Street', sizes: '(max-width: 860px) 86vw, 42vw', eager: true, focus: '50% 30%' })}
      <figcaption class="photo-tag">${icon('heart')} ${T.photoTag}</figcaption></figure>
    <figure class="polaroid story-inset">${img('storefront', { alt: 'The corner storefront of Rumi Cafe Bar', sizes: '220px' })}</figure>
  </div>
  <div class="story-copy">
    <p class="eyebrow eyebrow-line">${T.eyebrow}</p>
    <h1 id="story-title">${T.title}</h1>
    ${T.paragraphs.map((p, i) => `<p class="${i ? '' : 'dropcap'}">${p}</p>`).join('')}
    <ul class="story-facts" role="list">${T.facts.map((f) => `<li>${icon(f.icon)}<span>${f.text}</span></li>`).join('')}</ul>
    <div class="story-ctas">
      <a class="btn btn-teal" href="/menu/">Experience Rumi ${icon('arrowR')}</a>
      <a class="text-link" href="/gallery/">Our legacy in pictures ${icon('arrowUR')}</a>
    </div>
  </div>
</section>

<section class="pick-section" aria-labelledby="pick-title">
  <div class="pick-card reveal">
    <p class="pick-ribbon">${icon('sparkle')} ${T.pick.ribbon} ${icon('sparkle')}</p>
    <figure class="polaroid pick-photo">${img(pick.image, { alt: 'Espresso and lattes with pastries on a Rumi table', sizes: '(max-width: 860px) 80vw, 420px', focus: '50% 60%' })}<span class="pick-heart" aria-hidden="true">${icon('heart')}</span></figure>
    <div class="pick-copy">
      <p class="pill">${T.pick.eyebrow}</p>
      <h2 id="pick-title">${T.pick.titleA}<br><em>${T.pick.titleB}</em></h2>
      <blockquote class="pick-lead"><p>${T.pick.lead}</p></blockquote>
      <p>${T.pick.body}</p>
      <div class="pick-buy">
        <span class="pick-price">${money(pick.price)}</span>
        <a class="btn btn-gold btn-sm" href="${order.menu}">Add to order ${ext(orderNote)}</a>
        <a class="text-link" href="/menu/#${pick.slug}">Explore the full menu ${icon('arrowR')}</a>
      </div>
    </div>
  </div>
</section>

<section class="band-section" aria-labelledby="band-title">
  <div class="scene-photo">${img('interior', { alt: 'Inside Rumi: the counter, the cloud-painted ceiling and the café tables', sizes: '100vw' })}</div>
  <div class="band-shade"></div>
  <div class="band-copy reveal">
    <p class="eyebrow">${contact.street} · Dublin 8</p>
    <h2 id="band-title"><em>Pull up</em> a chair.</h2>
    <ul class="visit-hours">${hoursRows}</ul>
    <div class="visit-ctas">
      <a class="btn btn-gold" href="${contact.directions}" target="_blank" rel="noopener">Get directions ${ext('opens Google Maps')}</a>
      <a class="text-link text-link-light" href="/coffee-club/">Join the Coffee Club ${icon('arrowR')}</a>
    </div>
  </div>
</section>`;
  },
});

// --------------------------------------------------------------- menu ----

function tagLabel(t) {
  return { 'Sugar-Free': 'Sugar-free', 'Gluten-Free': 'Gluten-free', 'Dairy-Free': 'Dairy-free' }[t] ?? t;
}
function menuRow(item) {
  const badges = [item.bestseller && '<span class="badge">Bestseller</span>', item.sistersChoice && `<span class="badge badge-gold">${icon('heart')} Sisters' choice</span>`].filter(Boolean).join('');
  const diet = ['Vegan', 'Gluten-Free', 'Sugar-Free', 'Dairy-Free'];
  return `<li class="menu-item${item.sistersChoice ? ' is-choice' : ''}" id="${item.slug}" data-item="${item.id}" data-category="${item.category}" data-tags="${(item.tags ?? []).join('|')}" data-best="${item.bestseller ? 1 : 0}" data-search="${esc(`${item.name} ${item.description}`.toLowerCase())}">
    <div class="menu-thumb">${img(item.image, { alt: '', sizes: '112px', focus: item.focus })}</div>
    <div class="menu-main">
      <div class="menu-titleline">
        <h3 class="menu-name"><button type="button" class="menu-open" data-open="${item.id}" aria-haspopup="dialog">${item.name}</button><span class="menu-name-static">${item.name}</span></h3>
        ${badges}
        <span class="menu-leader" aria-hidden="true"></span>
        <span class="menu-price">${money(item.price)}</span>
      </div>
      <p class="menu-desc">${item.description}</p>
      <div class="menu-meta">
        ${(item.tags ?? []).map((t) => `<span class="tag${diet.includes(t) ? ' tag-diet' : ''}">${tagLabel(t)}</span>`).join('')}
        <span class="menu-prep">${icon('timer')} ${item.prep}</span>
      </div>
    </div>
    <a class="menu-add" href="${order.menu}">${icon('plus')}<span>Add</span><span class="sr-only"> ${esc(item.name)} (${orderNote})</span></a>
  </li>`;
}

page('menu', {
  path: '/menu/',
  title: 'Menu',
  description: 'The Rumi menu: speciality coffee, chai, Turkish-Irish bakes, cookies and toasted panini on Francis Street, Dublin 8. Order for collection online.',
  body: () => {
    const data = S.menuItems.map((i) => ({ ...i, src: src(i.image, images[i.image].widths[Math.min(1, images[i.image].widths.length - 1)]), srcset: srcset(i.image) }));
    return `
<section class="menu-hero" aria-labelledby="menu-title">
  <div class="scene-photo">${img('counter', { alt: '', sizes: '100vw', eager: true, focus: '50% 30%' })}</div>
  <div class="menu-hero-shade"></div>
  <div class="menu-hero-copy">
    <p class="eyebrow">Artisanal Dublin flavours</p>
    <h1 id="menu-title"><em>Our</em> menu.</h1>
    <p class="menu-hero-lead">Speciality coffee by ${contact.coffeeRoaster.name}, Turkish-Irish bakes and something warm from the kitchen.</p>
    <div class="menu-search" hidden data-js-only>
      <label for="menu-q" class="sr-only">Search the menu</label>
      ${icon('search')}<input id="menu-q" type="search" placeholder="Search dishes…" autocomplete="off" enterkeyhint="search">
    </div>
  </div>
</section>

<div class="order-note">
  <p>${icon('bag')}<span><strong>Order for collection.</strong> Tap <em>Add</em> and finish on ${order.name}, where you choose size, milk and pickup time at Francis Street.</span></p>
  <a class="btn btn-gold btn-sm" href="${order.checkout}">Go to checkout ${ext(orderNote)}</a>
</div>

<section class="menu-board" aria-label="Menu">
  <div class="menu-filters" hidden data-js-only>
    <div class="chip-row" role="group" aria-label="Category">${S.menuCategories.map((c, i) => `<button type="button" class="chip" data-cat="${c.id}" aria-pressed="${i === 0}">${c.label}</button>`).join('')}</div>
    <div class="chip-row chip-row-diet" role="group" aria-label="Dietary filters">${icon('sliders', 'icon chip-row-icon')}${S.dietFilters.map((f) => `<button type="button" class="chip chip-small" data-diet="${f.id}" aria-pressed="false">${f.label}</button>`).join('')}<button type="button" class="chip-clear" data-clear hidden>Clear filters</button></div>
    <p class="menu-count" aria-live="polite" data-count></p>
  </div>

  ${S.menuGroups.map((g) => `<section class="menu-group" data-group="${g.id}" aria-labelledby="g-${g.id}">
    <div class="menu-group-head"><h2 id="g-${g.id}">${g.title}</h2><p>${g.note}</p></div>
    <ul class="menu-list" role="list">${S.menuItems.filter((i) => g.categories.includes(i.category)).map(menuRow).join('')}</ul>
  </section>`).join('')}

  <div class="menu-empty" data-empty hidden>
    <p>No items found matching your filters…</p>
    <button type="button" class="btn btn-teal btn-sm" data-clear>Reset all filters</button>
  </div>

  <section class="strip-section" data-recent hidden aria-labelledby="recent-title">
    <h2 id="recent-title" class="strip-title">Recently viewed</h2>
    <ul class="strip" role="list" data-recent-list></ul>
  </section>
  <section class="strip-section" aria-labelledby="best-title">
    <h2 id="best-title" class="strip-title">Best picks ${icon('sparkle')}</h2>
    <ul class="strip" role="list">${S.menuItems.filter((i) => i.bestseller).map((i) => `<li><a class="strip-card" href="#${i.slug}" data-open-link="${i.id}">${img(i.image, { alt: '', sizes: '150px', focus: i.focus })}<span class="strip-name">${i.name}</span><span class="strip-price">${money(i.price)}</span></a></li>`).join('')}</ul>
  </section>

  <p class="allergen-note">${icon('heart')} Allergies or intolerances? Please tell our team before you order, we're happy to help.</p>
</section>

<aside class="menu-visit" aria-label="Francis Street">
  <p>${icon('pin')} ${contact.street}, Dublin, ${contact.eircode}</p>
  <p>${icon('phone')} <a href="${contact.phoneHref}">${contact.phone}</a></p>
  <p>${icon('clock')} ${S.hours.map((h) => `${h.short} ${h.open}–${h.close}`).join(' · ')}</p>
</aside>

<dialog class="item-dialog" data-item-dialog aria-labelledby="dlg-name">
  <div class="dlg-inner">
    <button type="button" class="dlg-close round-btn" data-close aria-label="Close">${icon('close')}</button>
    <div class="dlg-photo"><img data-dlg-img alt="" width="764" height="1020"></div>
    <div class="dlg-body">
      <div class="dlg-badges" data-dlg-badges></div>
      <h2 id="dlg-name" class="dlg-name" data-dlg-name></h2>
      <p class="dlg-price" data-dlg-price></p>
      <p class="dlg-desc" data-dlg-desc></p>
      <div class="dlg-meta" data-dlg-meta></div>
      <div class="dlg-options" data-dlg-options></div>
      <div class="dlg-pairings" data-dlg-pairings></div>
      <div class="dlg-actions">
        <a class="btn btn-gold" href="${order.menu}" data-dlg-add>Add to order ${ext(orderNote)}</a>
        <button type="button" class="btn btn-outline" data-close>Keep browsing</button>
      </div>
      <p class="dlg-note">You'll choose size, milk and pickup time on ${order.name}.</p>
    </div>
  </div>
</dialog>
<script type="application/json" id="menu-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
  },
});

// ------------------------------------------------------------ gallery ----

function galleryFigure(ph, i) {
  const big = src(ph.image);
  return `<li class="g-item" data-cat="${ph.cat}" style="--i:${i}">
    <a class="g-link" href="${big}" data-lightbox data-title="${esc(ph.title)}"${ph.quote ? ` data-quote="${esc(ph.quote)}"` : ''}>
      ${img(ph.image, { alt: ph.title, sizes: '(max-width: 640px) 92vw, (max-width: 1100px) 45vw, 30vw', focus: ph.focus })}
      <span class="g-caption"><span class="g-cat">${S.gallery.tabs.find((t) => t.id === ph.cat).label}</span><span class="g-title">${ph.title}</span></span>
    </a>
  </li>`;
}

page('gallery', {
  path: '/gallery/',
  title: 'Gallery',
  description: 'Our legacy in Dublin: the Rumi story in pictures, from the sisters’ vision to the teal storefront, the counter and our Francis Street community.',
  body: () => {
    const G = S.gallery;
    return `
<section class="gallery-hero" aria-labelledby="gallery-title">
  <p class="eyebrow eyebrow-center">${icon('sparkle')} ${G.eyebrow} ${icon('sparkle')}</p>
  <h1 id="gallery-title">${G.title}</h1>
  <p class="section-lead">${G.body}</p>
  <div class="tab-row" role="group" aria-label="Show" hidden data-js-only>${G.tabs.map((t, i) => `<button type="button" class="chip chip-tab" data-tab="${t.id}" aria-pressed="${i === 0}">${t.label}</button>`).join('')}</div>
</section>

<section class="timeline-section" data-panel="evolution" aria-labelledby="evo-title">
  <h2 id="evo-title" class="sr-only">Evolution</h2>
  <ol class="timeline" role="list">${G.timeline.map((t, i) => `<li class="t-card reveal" style="--i:${i}">
    <p class="t-year">${icon('clock')} ${t.year}</p>
    <a class="t-photo" href="${src(t.image)}" data-lightbox data-title="${esc(t.title)}" data-quote="${esc(t.quote)}">${img(t.image, { alt: t.title, sizes: '(max-width: 760px) 90vw, 30vw', focus: t.focus })}</a>
    <p class="t-cat">Evolution</p>
    <h3>${t.title}</h3>
    <p>${t.body}</p>
    <p class="t-quote"><em>“${t.quote}”</em></p>
  </li>`).join('')}</ol>
</section>

<section class="photos-section" data-panel="photos" aria-labelledby="photos-title">
  <h2 id="photos-title" class="sr-only">Photos</h2>
  <ul class="g-grid" role="list">${G.photos.map(galleryFigure).join('')}</ul>
</section>

<dialog class="lightbox" data-lightbox-dialog aria-label="Photo">
  <button type="button" class="round-btn lb-close" data-close aria-label="Close">${icon('close')}</button>
  <button type="button" class="round-btn lb-prev" data-lb-prev aria-label="Previous photo">${icon('arrowL')}</button>
  <figure class="lb-figure"><img data-lb-img alt=""><figcaption><span data-lb-title></span><em data-lb-quote></em></figcaption></figure>
  <button type="button" class="round-btn lb-next" data-lb-next aria-label="Next photo">${icon('arrowR')}</button>
</dialog>`;
  },
});

// -------------------------------------------------------- coffee club ----

page('club', {
  path: '/coffee-club/',
  title: 'Coffee Club & gift cards',
  description: 'The Rumi Coffee Club: a free welcome coffee, every 10th coffee free, a birthday drink and member-only treats. Plus gift cards from €10 to €150.',
  body: () => {
    const C = S.club;
    const stamps = Array.from({ length: 10 }, (_, i) => `<span class="stamp${i < 7 ? ' is-on' : ''}${i === 9 ? ' is-free' : ''}">${i === 9 ? 'Free' : icon('cup')}</span>`).join('');
    return `
<section class="club-hero" aria-labelledby="club-title">
  <div class="club-copy">
    <p class="eyebrow eyebrow-chip">${icon('sparkle')} ${C.eyebrow}</p>
    <h1 id="club-title">${C.title}</h1>
    <p class="club-tagline"><em>${C.tagline}</em></p>
    <p>${C.body}</p>
    <div class="club-ctas">
      <a class="btn btn-teal" href="${order.club}">Join the club ${ext(orderNote)}</a>
      <a class="text-link" href="#gift-cards">Gift cards ${icon('arrowD')}</a>
    </div>
  </div>
  <div class="club-visual reveal">
    <figure class="polaroid club-photo">${img('latte', { alt: 'A latte with a muffin and a brownie on a Rumi table', sizes: '(max-width: 860px) 80vw, 40vw', eager: true, focus: '60% 40%' })}</figure>
    <div class="stamp-card" aria-hidden="true">
      <div class="stamp-head">${logo({ cls: 'stamp-logo', alt: '', sizes: '90px' })}<span>Coffee Club</span></div>
      <div class="stamp-grid">${stamps}</div>
      <p class="stamp-foot">Every 10th coffee is on us</p>
    </div>
  </div>
</section>

<section class="giftcards-section" id="gift-cards" aria-labelledby="gc-title">
  <div class="section-head reveal">
    <div>
      <p class="eyebrow eyebrow-line">${icon('gift')} Gift cards</p>
      <h2 id="gc-title">${C.gifts.title.replace('love', '<em>love.</em>')}</h2>
      <p class="section-lead">${C.gifts.body}</p>
    </div>
  </div>
  <ul class="gc-grid" role="list">${C.gifts.cards.map((c, i) => `<li class="gc-card reveal">
    <div class="gc-art">${giftCardArt(c.tone, c.value, i)}</div>
    <h3>${c.title}</h3><p>${c.body}</p></li>`).join('')}</ul>
  <p class="gc-note">${C.gifts.note}</p>
</section>

<section class="perks-section" aria-labelledby="perks-title">
  <div class="perks-photo">${img('iced', { alt: '', sizes: '(max-width: 760px) 100vw, 40vw', focus: '50% 40%' })}</div>
  <div class="perks-inner">
    <p class="eyebrow eyebrow-line">${icon('star')} Member perks</p>
    <h2 id="perks-title"><em>Sip, save,</em> celebrate.</h2>
    <p class="section-lead">${C.perksBody}</p>
    <ul class="perks" role="list">${C.perks.map((p) => `<li>${icon('star')}<span>${p}</span></li>`).join('')}</ul>
  </div>
</section>

<section class="join-section" aria-labelledby="join-title">
  <div class="scene-photo">${img('night', { alt: '', sizes: '100vw' })}</div>
  <div class="join-shade"></div>
  <div class="join-copy reveal">
    <span class="join-icon" aria-hidden="true">${icon('gift')}</span>
    <h2 id="join-title">${C.why.title}</h2>
    <p class="join-quote"><em>${C.why.quote}</em></p>
    <a class="btn btn-gold" href="${order.club}">Join the club now ${ext(orderNote)}</a>
    <p class="join-small">Sign-up and rewards are handled on ${order.name}.</p>
  </div>
</section>`;
  },
});

// -------------------------------------------------------------- legal ----

function legal(id, title, intro, sections) {
  page(id, {
    path: `/${id}/`,
    title,
    description: `${title} for the Rumi Cafe website.`,
    body: () => `
<article class="legal" aria-labelledby="legal-title">
  <header class="legal-head">
    <p class="eyebrow eyebrow-line">Rumi Cafe · Francis Street</p>
    <h1 id="legal-title">${title}</h1>
    <p class="legal-intro">${intro}</p>
    <p class="legal-date">Last updated ${S.legalUpdated}</p>
  </header>
  ${sections.map(([h, body]) => `<section><h2>${h}</h2>${body}</section>`).join('')}
</article>`,
  });
}

// TODO(rumi): owner / legal review of the three pages below.
legal('privacy', 'Privacy policy', 'This page explains what this website does with your information. In short: it collects nothing about you.', [
  ['Who we are', `<p>Rumi Café Bar, ${contact.street}, ${contact.area}, ${contact.eircode}, Ireland. Questions: <a href="mailto:${contact.email}">${contact.email}</a> or <a href="${contact.phoneHref}">${contact.phone}</a>.</p>`],
  ['What this website stores', '<p>This website does not use cookies, analytics, advertising trackers or contact forms. It keeps two small preferences in your own browser, which never leave your device: whether you paused the opening animation (until you close the tab), and the menu items you looked at recently, so they can be shown again on the menu. You can clear them at any time in your browser settings.</p>'],
  ['Online ordering and the Coffee Club', `<p>Adding items to your bag, checkout, payment and Coffee Club sign-up take place on ${order.name} (${order.base.replace('https://', '')}). The details you enter there (such as your name, e-mail address and phone number) are handled by that service for your order. Please read the information shown on that page before you order.</p>`],
  ['Links to other services', '<p>Links to Google Maps, Instagram, Facebook and Tripadvisor open those services, which apply their own privacy policies.</p>'],
  ['Your rights', `<p>Under the GDPR you can ask us what personal data we hold about you, and ask us to correct or delete it. Contact us at <a href="mailto:${contact.email}">${contact.email}</a>. You can also contact the Data Protection Commission (dataprotection.ie).</p>`],
]);

legal('terms', 'Terms of service', 'The terms for using this website.', [
  ['About this website', `<p>This website is run by Rumi Café Bar, ${contact.street}, ${contact.area}, ${contact.eircode}. It presents our café, menu, Coffee Club and gift cards.</p>`],
  ['Menu, prices and hours', '<p>Menu items, prices, opening hours and offers shown here are a guide and may change, including on bank holidays. Items depend on what is on the counter on the day.</p>'],
  ['Allergens', '<p>Dietary tags on the menu are for guidance. If you have an allergy or intolerance, please speak to our team before ordering.</p>'],
  ['Orders', `<p>Orders for collection are placed and paid on ${order.name} and are subject to the terms shown there. Orders are collected from ${contact.street}, Dublin 8.</p>`],
  ['Coffee Club and gift cards', '<p>Coffee Club rewards and gift cards are subject to the conditions given at sign-up or purchase. Ask our team in store for details.</p>'],
  ['Content', '<p>Photographs, text and the Rumi name and logo belong to Rumi Café Bar or are used with permission. Please do not reuse them without asking us.</p>'],
  ['Law', '<p>These terms are governed by the laws of Ireland.</p>'],
]);

legal('accessibility', 'Accessibility', 'We want everyone to enjoy a little pause with us, online and on Francis Street.', [
  ['Our aim', '<p>This website aims to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</p>'],
  ['What we have done', '<ul><li>Every page can be used with a keyboard, with a visible focus outline and a “Skip to content” link.</li><li>The opening animation can be paused or replayed, and it is replaced by a still image when your device asks for reduced motion.</li><li>Photos have text descriptions; decorative drawings are hidden from screen readers.</li><li>Text and buttons meet colour-contrast guidelines, and buttons are at least 44 pixels tall.</li><li>Menu, opening hours and addresses are plain text that works without JavaScript.</li></ul>'],
  ['Known limitations', `<p>Ordering, payment and Coffee Club sign-up happen on ${order.name}, a separate service. If anything there is hard to use, call us on <a href="${contact.phoneHref}">${contact.phone}</a> and we'll help.</p>`],
  ['Feedback', `<p>If something on this website doesn't work for you, tell us at <a href="mailto:${contact.email}">${contact.email}</a> and we'll fix it.</p>`],
]);

// ---------------------------------------------------------------- 404 ----

page('notfound', {
  path: '/404.html',
  title: 'Page not found',
  description: 'This page took a little pause.',
  body: () => `
<section class="nf" aria-labelledby="nf-title">
  <div class="scene-photo">${img('table', { alt: '', sizes: '100vw', focus: '60% 50%' })}</div>
  <div class="band-shade"></div>
  <div class="nf-copy">
    <p class="eyebrow">Error 404</p>
    <h1 id="nf-title"><em>This page took</em><br>a little pause.</h1>
    <p>The page you're looking for isn't here. The coffee is, though.</p>
    <div class="visit-ctas"><a class="btn btn-gold" href="/">Back home ${icon('arrowR')}</a><a class="btn btn-ghost" href="/menu/">See the menu</a></div>
  </div>
</section>`,
});
