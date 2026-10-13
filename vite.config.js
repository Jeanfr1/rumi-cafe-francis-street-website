import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { renderPage, pageIds } from './src/render.js';

// Each entry HTML is a stub (<!--@page:id-->); the plugin renders the whole
// document from src/data/site.js at build and dev time, so every fact and
// line of copy is in the static HTML (works without JS).
const entries = {
  home: 'index.html',
  story: 'story/index.html',
  menu: 'menu/index.html',
  gallery: 'gallery/index.html',
  club: 'coffee-club/index.html',
  privacy: 'privacy/index.html',
  terms: 'terms/index.html',
  accessibility: 'accessibility/index.html',
  notfound: '404.html',
};

function rumiPages() {
  return {
    name: 'rumi-pages',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const m = html.match(/<!--@page:([a-z]+)-->/);
        return m ? renderPage(m[1]) : html;
      },
    },
    handleHotUpdate({ file, server }) {
      if (/src[\\/](data|render)/.test(file)) server.ws.send({ type: 'full-reload' });
    },
  };
}

if (Object.keys(entries).sort().join() !== [...pageIds].sort().join()) {
  throw new Error('vite.config entries and render.js pages differ');
}

export default defineConfig({
  plugins: [rumiPages()],
  build: {
    rollupOptions: {
      input: Object.fromEntries(Object.entries(entries).map(([k, v]) => [k, resolve(__dirname, v)])),
    },
    assetsInlineLimit: 0,
  },
});
