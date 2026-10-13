// Menu: search, category + dietary filters, item dialog (sizes, milk,
// pairings), recently viewed (localStorage) and #slug deep links.
// Adding to the bag and checkout stay on the ordering site (plain links).
const RECENT_KEY = 'rumi-recent';
const money = (n) => `€${n.toFixed(2)}`;
const TAG_LABEL = { 'Sugar-Free': 'Sugar-free', 'Gluten-Free': 'Gluten-free', 'Dairy-Free': 'Dairy-free' };
const DIET = ['Vegan', 'Gluten-Free', 'Sugar-Free', 'Dairy-Free'];
const TIMER = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 1.5M9.5 3h5"/></svg>';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function readRecent() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]').filter((x) => typeof x === 'string'); } catch { return []; }
}
function writeRecent(ids) {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(ids)); } catch { /* storage blocked */ }
}

export function initMenu() {
  const dataEl = document.getElementById('menu-data');
  if (!dataEl) return;
  const items = JSON.parse(dataEl.textContent);
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  const bySlug = Object.fromEntries(items.map((i) => [i.slug, i]));
  const rows = [...document.querySelectorAll('.menu-item')];
  const groups = [...document.querySelectorAll('.menu-group')];
  const search = document.getElementById('menu-q');
  const count = document.querySelector('[data-count]');
  const empty = document.querySelector('[data-empty]');
  const clearBtns = document.querySelectorAll('[data-clear]');
  const catBtns = [...document.querySelectorAll('[data-cat]')];
  const dietBtns = [...document.querySelectorAll('[data-diet]')];
  document.querySelectorAll('[data-js-only]').forEach((el) => { el.hidden = false; });

  // ------------------------------------------------------------ filters
  const state = { q: '', cat: 'all', diet: new Set() };
  const apply = () => {
    let shown = 0;
    for (const row of rows) {
      const tags = row.dataset.tags ? row.dataset.tags.split('|') : [];
      const okQ = !state.q || row.dataset.search.includes(state.q);
      const okCat = state.cat === 'all' || (state.cat === 'specials' ? row.dataset.best === '1' : row.dataset.category === state.cat);
      const okDiet = [...state.diet].every((d) => tags.includes(d));
      const ok = okQ && okCat && okDiet;
      row.hidden = !ok;
      if (ok) shown++;
    }
    groups.forEach((g) => { g.hidden = !g.querySelector('.menu-item:not([hidden])'); });
    empty.hidden = shown > 0;
    const filtered = state.q || state.cat !== 'all' || state.diet.size;
    count.textContent = filtered ? `${shown} ${shown === 1 ? 'item' : 'items'} found` : `${rows.length} items`;
    document.querySelector('.chip-clear').hidden = !filtered;
  };
  catBtns.forEach((b) => b.addEventListener('click', () => {
    state.cat = b.dataset.cat;
    catBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    apply();
  }));
  dietBtns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', String(on));
    on ? state.diet.add(b.dataset.diet) : state.diet.delete(b.dataset.diet);
    apply();
  }));
  let qt = 0;
  search.addEventListener('input', () => { clearTimeout(qt); qt = setTimeout(() => { state.q = search.value.trim().toLowerCase(); apply(); }, 120); });
  search.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); document.querySelector('.menu-board')?.scrollIntoView({ behavior: 'smooth' }); } });
  clearBtns.forEach((b) => b.addEventListener('click', () => {
    state.q = ''; state.cat = 'all'; state.diet.clear(); search.value = '';
    catBtns.forEach((x, i) => x.setAttribute('aria-pressed', String(i === 0)));
    dietBtns.forEach((x) => x.setAttribute('aria-pressed', 'false'));
    apply();
  }));
  apply();

  // ------------------------------------------------------------- dialog
  const dlg = document.querySelector('[data-item-dialog]');
  const $ = (s) => dlg.querySelector(s);
  let opener = null;
  const optList = (title, list) => `<div><h3>${title}</h3><ul class="opt-list" role="list">${list.map((o) => `<li>${esc(o.name)}${o.delta ? `<span>+${money(o.delta)}</span>` : ''}</li>`).join('')}</ul></div>`;

  const fill = (item) => {
    const img = $('[data-dlg-img]');
    img.src = item.src; img.srcset = item.srcset; img.sizes = '(max-width: 1000px) 100vw, 430px';
    img.style.objectPosition = item.focus || '';
    $('[data-dlg-badges]').innerHTML = [item.bestseller && '<span class="badge">Bestseller</span>', item.sistersChoice && '<span class="badge badge-gold">Sisters\' choice</span>'].filter(Boolean).join('');
    $('[data-dlg-name]').textContent = item.name;
    const from = item.sizes?.length > 1 ? 'from ' : '';
    $('[data-dlg-price]').textContent = `${from}${money(item.price)}`;
    $('[data-dlg-desc]').textContent = item.description;
    $('[data-dlg-meta]').innerHTML = `<span class="menu-prep">${TIMER} ${esc(item.prep)}</span>` + (item.tags || []).map((t) => `<span class="tag${DIET.includes(t) ? ' tag-diet' : ''}">${TAG_LABEL[t] ?? t}</span>`).join('');
    $('[data-dlg-options]').innerHTML = [
      item.sizes?.length > 1 && optList('Sizes', item.sizes),
      item.milk && optList('Milk options', item.milk),
    ].filter(Boolean).join('');
    const pairs = (item.pairings || []).map((id) => byId[id]).filter(Boolean);
    $('[data-dlg-pairings]').innerHTML = pairs.length ? `<h3>Perfect pairings</h3><ul class="pair-list" role="list">${pairs.map((p) => `<li><button type="button" class="pair-btn" data-pair="${p.id}"><img src="${p.src}" alt="" style="object-position:${p.focus || 'center'}">${esc(p.name)} · ${money(p.price)}</button></li>`).join('')}</ul>` : '';
    $('[data-dlg-add]').querySelector('.sr-only')?.replaceChildren(` (add ${item.name}: opens Rumi online ordering)`);
    $('.dlg-inner').scrollTop = 0;
    dlg.scrollTop = 0;
  };

  const open = (id, from) => {
    const item = byId[id];
    if (!item) return;
    fill(item);
    if (!dlg.open) { opener = from || document.activeElement; dlg.showModal(); }
    $('[data-close]').focus({ preventScroll: true });
    if (location.hash !== `#${item.slug}`) history.replaceState(null, '', `#${item.slug}`);
    const recent = [id, ...readRecent().filter((x) => x !== id)].slice(0, 6);
    writeRecent(recent);
    renderRecent();
  };
  const close = () => dlg.open && dlg.close();
  dlg.addEventListener('close', () => {
    history.replaceState(null, '', location.pathname + location.search);
    opener?.focus?.({ preventScroll: true });
  });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg) close(); // backdrop
    if (e.target.closest('[data-close]')) close();
    const pair = e.target.closest('[data-pair]');
    if (pair) open(pair.dataset.pair);
  });
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open]');
    if (btn) { open(btn.dataset.open, btn); return; }
    const link = e.target.closest('[data-open-link]');
    if (link) { e.preventDefault(); open(link.dataset.openLink, link); }
  });

  // ------------------------------------------------------ recently viewed
  const recentBox = document.querySelector('[data-recent]');
  const recentList = document.querySelector('[data-recent-list]');
  function renderRecent() {
    const ids = readRecent().filter((id) => byId[id]);
    recentBox.hidden = !ids.length;
    recentList.innerHTML = ids.map((id) => {
      const i = byId[id];
      return `<li><a class="strip-card" href="#${i.slug}" data-open-link="${i.id}"><img src="${i.src}" alt="" loading="lazy" style="object-position:${i.focus || 'center'}"><span class="strip-name">${esc(i.name)}</span><span class="strip-price">${money(i.price)}</span></a></li>`;
    }).join('');
  }
  renderRecent();

  // ----------------------------------------------------------- deep link
  const fromHash = () => {
    const item = bySlug[decodeURIComponent(location.hash.slice(1))];
    if (item) open(item.id);
  };
  addEventListener('hashchange', fromHash);
  fromHash();
}
