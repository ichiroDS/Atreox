/* ══════════════════════════════════════════════════════════════════
   build-app.mjs — compiles the browser app ahead of time.

   The site used to ship its .jsx files raw and let @babel/standalone
   transpile them in the visitor's browser, running on React's
   development builds. That worked, and charged every visitor the
   slowest part of the load. This step spends that cost once, here:

     public/app.js             every app .jsx, transpiled and minified
                               into one script. Each file is wrapped in
                               an IIFE first — that reproduces the
                               per-file function scope Babel's script
                               runner gave them, which is why two files
                               can both open with `const React = ...`
                               and only ever talk through `window`.
     public/vendor/react*.js   React 18.3.1 production UMD builds,
                               copied out of node_modules so the page
                               depends on no third-party CDN at all.

   Order matters and mirrors the old script tags: shared first (it
   populates window), catalog before every page that renders a module,
   app.jsx last (it mounts the router).

   Runs before prerender.mjs in the Vercel buildCommand. Locally, run
   `npm run build:app` after editing any .jsx — or `npm run watch` to
   have it rebuild on save. The compiled output is committed so a fresh
   clone serves without a build; the deploy always rebuilds it anyway.
══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformSync } from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const APP_FILES = [
  'shared.jsx',
  'catalog.jsx',
  'home.jsx',
  'functions.jsx',
  'guides.jsx',
  'new-pages.jsx',
  'legal-pages.jsx',
  'referral-page.jsx',
  'contact-page.jsx',
  'app.jsx',
];

const VENDOR = [
  ['node_modules/react/umd/react.production.min.js', 'public/vendor/react.production.min.js'],
  ['node_modules/react-dom/umd/react-dom.production.min.js', 'public/vendor/react-dom.production.min.js'],
];

function buildOnce() {
  const t0 = Date.now();
  const parts = APP_FILES.map(f => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    /* Wrap before minifying: inside a function scope esbuild can mangle
       every local name safely; at top level it could not. */
    const wrapped = `(function () {\n${src}\n})();`;
    try {
      return transformSync(wrapped, {
        loader: 'jsx',
        target: 'es2019',
        minify: true,
      }).code;
    } catch (e) {
      throw new Error(`${f}: ${e.message}`);
    }
  });

  const banner = '/* built by scripts/build-app.mjs — do not edit; edit the .jsx sources */\n';
  fs.writeFileSync(path.join(ROOT, 'public/app.js'), banner + parts.join('\n'));

  fs.mkdirSync(path.join(ROOT, 'public/vendor'), { recursive: true });
  for (const [from, to] of VENDOR) {
    fs.copyFileSync(path.join(ROOT, from), path.join(ROOT, to));
  }

  const kb = (fs.statSync(path.join(ROOT, 'public/app.js')).size / 1024).toFixed(0);
  console.log(`build-app: public/app.js ${kb} KB, vendor ×${VENDOR.length} (${Date.now() - t0}ms)`);
}

buildOnce();

if (process.argv.includes('--watch')) {
  console.log('build-app: watching .jsx sources…');
  let timer = null;
  for (const f of APP_FILES) {
    fs.watch(path.join(ROOT, f), () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        try { buildOnce(); } catch (e) { console.error(String(e.message || e)); }
      }, 120);
    });
  }
}
