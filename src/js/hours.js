// "Open now · until 19:00" from the hours rendered into the page, in Dublin time.
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const mins = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
const show = (hhmm) => hhmm.replace(/^0/, '');

function dublinNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Dublin', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  return { day: DAYS.indexOf(get('weekday')), minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

export function statusText(hours, now = dublinNow()) {
  const forDay = (d) => hours.find((h) => h.dayIdx.includes(d));
  const today = forDay(now.day);
  if (today && now.minutes >= mins(today.open) && now.minutes < mins(today.close)) {
    return { open: true, text: `Open now · until ${show(today.close)}` };
  }
  if (today && now.minutes < mins(today.open)) return { open: false, text: `Closed now · opens at ${show(today.open)}` };
  for (let k = 1; k <= 7; k++) {
    const d = (now.day + k) % 7;
    const h = forDay(d);
    if (h) return { open: false, text: `Closed now · opens ${k === 1 ? 'tomorrow' : DAYS[d]} at ${show(h.open)}` };
  }
  return null;
}

export function initOpenStatus() {
  for (const el of document.querySelectorAll('[data-open-status]')) {
    try {
      const s = statusText(JSON.parse(el.dataset.hours));
      if (!s) continue;
      el.textContent = s.text;
      el.classList.toggle('is-closed', !s.open);
      el.hidden = false;
    } catch { /* leave the static hours alone */ }
  }
}
