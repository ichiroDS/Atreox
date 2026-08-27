// Extracts the design system's inline assets out of index.html so the
// design-sync converter can consume them as files, while index.html stays
// the single source of truth (this repo is intentionally zero-build):
//   <style> block            -> .design-sync/.cache/atreox.css
//   FramerMotion shim script -> .design-sync/.cache/fm-shim.js
// The Google Fonts stylesheet <link> is turned into an @import at the top of
// the CSS so the brand families resolve at runtime, exactly like the site.
// Run via cfg.buildCmd before every converter build.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.design-sync', '.cache');
mkdirSync(CACHE, { recursive: true });

const html = readFileSync(join(ROOT, 'index.html'), 'utf8');

const style = /<style>([\s\S]*?)<\/style>/.exec(html);
if (!style) throw new Error('index.html: no <style> block found');

const fontsHref = /<link href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/.exec(html);
const fontsImport = fontsHref ? `@import url('${fontsHref[1].replace(/&amp;/g, '&')}');\n\n` : '';

writeFileSync(join(CACHE, 'atreox.css'), fontsImport + style[1].trim() + '\n');

const shim = /<script>\s*(window\.FramerMotion[\s\S]*?)<\/script>/.exec(html);
if (!shim) throw new Error('index.html: FramerMotion shim script not found');
writeFileSync(join(CACHE, 'fm-shim.js'), shim[1].trim() + '\n');

console.log('extracted: atreox.css (%d bytes), fm-shim.js (%d bytes)',
  fontsImport.length + style[1].trim().length, shim[1].trim().length);
