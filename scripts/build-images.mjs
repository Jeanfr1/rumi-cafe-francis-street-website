// Encode every photo in src/data/photos.json to public/img/<key>-v1-<w>.webp
// (bump VERSION to swap a file: assets are served with immutable caching),
// plus logo, favicons and the share image. Writes src/data/images.json
// (intrinsic size per key) for src/render.js.
//
// Source per key: assets-src/upscaled/<key>.png when the key has
// "upscale": true (npm run upscale), else the original with the crop rect.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const P = (...a) => path.join(ROOT, ...a);
const VERSION = 'v1';
const OUT = P('public', 'img');
const photos = Object.fromEntries(Object.entries(JSON.parse(fs.readFileSync(P('src/data/photos.json'), 'utf8'))).filter(([k]) => !k.startsWith('_')));
fs.mkdirSync(OUT, { recursive: true });

const only = process.argv.slice(2);
const manifest = fs.existsSync(P('src/data/images.json')) ? JSON.parse(fs.readFileSync(P('src/data/images.json'), 'utf8')) : {};

async function source(key, job) {
  const up = P('assets-src', 'upscaled', `${key}.png`);
  if (job.upscale) {
    if (!fs.existsSync(up)) throw new Error(`${key}: run npm run upscale first`);
    return sharp(up);
  }
  let img = sharp(P(job.src));
  if (job.rect) {
    const [left, top, width, height] = job.rect;
    img = img.extract({ left, top, width, height });
  }
  return img;
}

for (const [key, job] of Object.entries(photos)) {
  if (only.length && !only.includes(key)) continue;
  const base = await source(key, job);
  const buf = await base.toBuffer();
  const meta = await sharp(buf).metadata();
  const widths = job.widths.filter((w) => w <= meta.width);
  if (!widths.length) widths.push(meta.width);
  for (const w of widths) {
    await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 76, effort: 6, smartSubsample: true })
      .toFile(path.join(OUT, `${key}-${VERSION}-${w}.webp`));
  }
  manifest[key] = { w: meta.width, h: meta.height, widths, v: VERSION };
  console.log(key, `${meta.width}x${meta.height}`, widths.join(','));
}

// ---- logo (cleaned by npm run logo) ----
const logoSrc = P('assets-src', 'logo', 'rumi-logo-gold.png');
if (!only.length || only.includes('logo')) {
  const lm = await sharp(logoSrc).metadata();
  for (const w of [240, 480, 960, 1400]) {
    await sharp(logoSrc).resize({ width: w }).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(path.join(OUT, `rumi-logo-${VERSION}-${w}.webp`));
  }
  await sharp(logoSrc).resize({ width: 480 }).png({ compressionLevel: 9, palette: true }).toFile(path.join(OUT, `rumi-logo-${VERSION}-480.png`));
  manifest.logo = { w: lm.width, h: lm.height, widths: [240, 480, 960, 1400], v: VERSION };

  // favicon: teal disc with the gold signature, as on the café's cups
  const disc = (size) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#267B8D"/></svg>`);
  for (const size of [32, 180, 192, 512]) {
    const mark = await sharp(logoSrc).resize({ width: Math.round(size * 0.74) }).png().toBuffer();
    const mm = await sharp(mark).metadata();
    await sharp(disc(size)).composite([{ input: mark, left: Math.round((size - mm.width) / 2), top: Math.round((size - mm.height) / 2) }])
      .png().toFile(path.join(OUT, size === 180 ? `apple-touch-icon-${VERSION}.png` : `favicon-${VERSION}-${size}.png`));
  }

  // share image 1200x630: campaign table photo + deep-teal band + logo
  const hero = P('assets-src', 'upscaled', 'hero-desktop.png');
  const bg = await sharp(hero).resize(1200, 630, { fit: 'cover', position: 'right' }).toBuffer();
  const shade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#0b2b33" stop-opacity=".92"/><stop offset=".55" stop-color="#103E49" stop-opacity=".45"/><stop offset="1" stop-color="#103E49" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`);
  const ogLogo = await sharp(logoSrc).resize({ width: 470 }).png().toBuffer();
  await sharp(bg).composite([{ input: shade }, { input: ogLogo, left: 80, top: 190 }]).jpeg({ quality: 84, mozjpeg: true })
    .toFile(path.join(OUT, `og-${VERSION}.jpg`));
}

fs.writeFileSync(P('src/data/images.json'), JSON.stringify(manifest, null, 1) + '\n');
console.log('images.json updated');
