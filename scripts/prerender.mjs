/* ══════════════════════════════════════════════════════════════════
   prerender.mjs — the build step that gives every guide a real page.

   THE PROBLEM THIS SOLVES. The site is a zero-build React app: the
   HTML a crawler downloads is an empty <div id="root">, and every
   guide used to live behind a fragment (/guides#guide-group-parser)
   that never reaches the server. Ten guides, one indexable URL, no
   text in the source of it.

   WHAT IT DOES. Reads catalog.jsx — the same file the browser reads,
   parsed here in a vm with a stubbed window, so the guide text has
   exactly one home and is never copied by hand — and writes:

     guides/<url>.html   one per guide: index.html with its own title,
                         description, canonical and cards, and the full
                         guide rendered into the body as plain HTML.
     sitemap.xml         every page, guides listed individually.
     robots.txt          pointing at the sitemap, blocking nobody.
     index.html          only the slug -> address map inside the
                         SLUG-MAP markers, so the old #guide- anchors
                         keep redirecting as the catalog changes.

   The React app boots on those pages exactly as it does anywhere else
   and replaces the prerendered block (app.jsx drops #prerendered on
   mount), so what a reader sees is the reader, unchanged.

   Runs as the Vercel buildCommand. If it throws, the deploy fails —
   which is the point: a guide that silently stops being generated is
   worse than a build that stops.
══════════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://atreoxai.com';
const OG_FALLBACK = ORIGIN + '/public/apple-touch-icon.png';

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => {
  const full = path.join(ROOT, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, s);
};

/* ── The catalog, read the way the browser reads it ────────────────
   catalog.jsx is plain data — no JSX — but it destructures its icons
   off `window` at the top and assigns its tables back onto `window` at
   the bottom. A Proxy that answers every read with a placeholder is
   enough to run it; what comes back out is the real arrays.
─────────────────────────────────────────────────────────────────── */
function loadCatalog() {
  const box = {};
  const win = new Proxy(box, {
    get: (t, k) => (k in t ? t[k] : `Icon(${String(k)})`),
    has: () => true,
  });
  const ctx = vm.createContext({ window: win, console });
  new vm.Script(read('catalog.jsx'), { filename: 'catalog.jsx' }).runInContext(ctx);

  const { GUIDES, MODULE_BY_KEY } = box;
  if (!Array.isArray(GUIDES) || !GUIDES.length) throw new Error('catalog.jsx exposed no GUIDES');
  for (const g of GUIDES) {
    if (!g.url) throw new Error(`guide "${g.slug}" has no url — every guide needs its own address`);
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(g.url)) throw new Error(`guide url "${g.url}" is not a clean path segment`);
  }
  const seen = new Set();
  for (const g of GUIDES) {
    if (seen.has(g.url)) throw new Error(`two guides share the address /guides/${g.url}`);
    seen.add(g.url);
  }
  return { GUIDES, MODULE_BY_KEY };
}

/* ── HTML ──────────────────────────────────────────────────────── */
const esc = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* The prerendered body. Not a copy of the reader's markup — the reader
   is React and replaces this the moment it mounts. It is the same
   words in plain semantic HTML, which is what a crawler is here for.
   Styling leans on the classes already in index.html so the seconds
   before React takes over don't look broken. */
const P = 'font-family:Barlow,sans-serif;font-weight:300;font-size:1rem;line-height:1.8;color:rgba(255,255,255,0.72);margin:0 0 14px';
const H2 = 'font-family:"JetBrains Mono",monospace;font-weight:500;font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;color:#fff;margin:38px 0 14px';
const H3 = 'font-family:"JetBrains Mono",monospace;font-weight:500;font-size:0.72rem;letter-spacing:0.16em;text-transform:uppercase;color:#fff;margin:0 0 6px';

const section = (title, inner) => `<h2 style="${H2}">${esc(title)}</h2>\n${inner}`;

function renderGuide(guide, guides, mod) {
  const parts = [];

  parts.push(`<p style="font-family:'JetBrains Mono',monospace;font-weight:500;font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:#00d9ff;margin:0 0 12px">${esc(mod ? mod.tagline : 'Preparation')}</p>`);
  parts.push(`<h1 style="font-family:'Playfair Display',Georgia,serif;font-weight:500;font-size:2.6rem;line-height:1.1;letter-spacing:-0.015em;color:#fff;margin:0 0 18px">${esc(guide.title)}</h1>`);
  parts.push(`<p style="${P};font-size:1.05rem;color:rgba(255,255,255,0.78)">${esc(guide.summary)}</p>`);

  parts.push(section('In this guide',
    `<ol style="margin:0 0 8px 1.15rem;padding:0">${guide.covers
      .map(c => `<li style="${P};margin-bottom:8px">${esc(c)}</li>`).join('')}</ol>`));

  /* A prep guide carries its own opening paragraph; a module guide is
     its module's write-up, laid out as a lesson — same as the reader. */
  if (guide.intro) parts.push(section('Why it matters', `<p style="${P}">${esc(guide.intro)}</p>`));

  if (mod) {
    parts.push(section('Why it matters', `<p style="${P}">${esc(mod.problem)}</p>`));
    parts.push(section('What the module does', `<p style="${P}">${esc(mod.does)}</p>`));
    parts.push(section('Step by step',
      `<ol style="margin:0 0 8px 1.15rem;padding:0">${mod.steps
        .map(([t, b]) => `<li style="margin-bottom:16px"><h3 style="${H3}">${esc(t)}</h3><p style="${P};font-size:0.94rem;margin:0">${esc(b)}</p></li>`)
        .join('')}</ol>`));
    parts.push(section('What you can change',
      `<dl style="margin:0">${mod.config
        .map(([t, b]) => `<dt style="${H3};color:#00d9ff;margin-top:14px">${esc(t)}</dt><dd style="${P};font-size:0.9rem;margin:0 0 4px">${esc(b)}</dd>`)
        .join('')}</dl>`));
    if (mod.guard) parts.push(section('Read this before you turn it up', `<p style="${P};font-size:0.94rem">${esc(mod.guard)}</p>`));
  }

  /* Every other guide, as links. The reader shows this rail too; here
     it is also how a crawler gets from any one guide to the other nine. */
  const rail = guides.map(g =>
    `<li style="margin-bottom:6px"><a href="/guides/${esc(g.url)}"${g.url === guide.url ? ' aria-current="page"' : ''} style="font-family:Barlow,sans-serif;font-weight:300;font-size:0.9rem;color:${g.url === guide.url ? '#00d9ff' : 'rgba(255,255,255,0.6)'};text-decoration:none">${esc(g.title)}</a></li>`
  ).join('');

  return `<div id="prerendered" style="max-width:1340px;margin:0 auto;padding:128px 5% 64px">
<nav aria-label="Guides" style="margin-bottom:26px">
<a href="/guides" style="font-family:'JetBrains Mono',monospace;font-weight:500;font-size:0.62rem;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.34);text-decoration:none">All guides</a>
<ul style="list-style:none;margin:14px 0 0;padding:0">${rail}</ul>
</nav>
<article id="guide-${esc(guide.slug)}">
${parts.join('\n')}
</article>
</div>`;
}

/* ── The head, per guide ───────────────────────────────────────── */
function headFor(guide, mod, ogImage) {
  const url = `${ORIGIN}/guides/${guide.url}`;
  const title = `${guide.title} — ATREOX guide`;
  const desc = guide.summary;
  return [
    '<!-- HEAD:META -->',
    `  <title>${esc(title)}</title>`,
    `  <meta name="description" content="${esc(desc)}">`,
    `  <link rel="canonical" href="${esc(url)}">`,
    '',
    '  <meta property="og:type" content="article">',
    `  <meta property="og:url" content="${esc(url)}">`,
    '  <meta property="og:site_name" content="ATREOX">',
    `  <meta property="og:title" content="${esc(title)}">`,
    `  <meta property="og:description" content="${esc(desc)}">`,
    `  <meta property="og:image" content="${esc(ogImage)}">`,
    '',
    '  <meta name="twitter:card" content="summary_large_image">',
    `  <meta name="twitter:title" content="${esc(title)}">`,
    `  <meta name="twitter:description" content="${esc(desc)}">`,
    `  <meta name="twitter:image" content="${esc(ogImage)}">`,
    '  <!-- /HEAD:META -->',
  ].join('\n');
}

/* ── Open Graph cards ──────────────────────────────────────────────
   One card per guide so a shared link is not ten identical thumbnails.
   Drawn as SVG here and rasterised only if @resvg/resvg-js is present:
   the PNG is what the social networks actually accept, but an OG image
   is not worth failing a deploy over, so a miss falls back to the
   site-wide icon and says so.
─────────────────────────────────────────────────────────────────── */
/* Shipped rather than borrowed from the host: the Vercel build image is
   not this laptop, and a card that silently renders its text in nothing
   is the failure mode worth spending 500KB to rule out. All three are
   the brand's own faces, OFL-licensed (see scripts/og-fonts/OFL.md). */
const OG_FONTS = ['PlayfairDisplay-Medium.ttf', 'JetBrainsMono-Medium.ttf', 'Marcellus-Regular.ttf']
  .map(f => path.join(ROOT, 'scripts', 'og-fonts', f));

function ogSvg(guide, mod) {
  const kicker = mod ? mod.name.toUpperCase() : 'BEFORE YOU START';
  const words = guide.title.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > 22) { lines.push(cur.trim()); cur = w; }
    else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());

  const sub = guide.short;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#020403"/>
<rect x="0" y="0" width="1200" height="4" fill="#00d9ff"/>
<circle cx="1040" cy="150" r="150" fill="#00d9ff" opacity="0.07"/>
<g stroke="#00d9ff" stroke-width="2" opacity="0.5" fill="none">
<path d="M64 64 h34 M64 64 v34"/><path d="M1136 566 h-34 M1136 566 v-34"/>
</g>
<text x="80" y="140" font-family="JetBrains Mono" font-size="22" letter-spacing="6" fill="#00d9ff">${esc(kicker)}</text>
${lines.map((l, i) => `<text x="80" y="${250 + i * 78}" font-family="Playfair Display" font-weight="500" font-size="70" fill="#ffffff">${esc(l)}</text>`).join('\n')}
<text x="80" y="${276 + lines.length * 78}" font-family="JetBrains Mono" font-size="27" fill="#ffffff" opacity="0.55">${esc(sub)}</text>
<text x="80" y="560" font-family="Marcellus" font-size="26" letter-spacing="9" fill="#00d9ff" opacity="0.9">ATREOX</text>
<text x="1120" y="560" text-anchor="end" font-family="JetBrains Mono" font-size="20" fill="#ffffff" opacity="0.35">atreoxai.com/guides</text>
</svg>`;
}

async function buildOgImages(guides, moduleByKey) {
  let Resvg = null;
  try { ({ Resvg } = await import('@resvg/resvg-js')); }
  catch (_) {
    console.warn('[prerender] @resvg/resvg-js not available — og:image falls back to the site icon');
    return {};
  }

  const out = {};
  for (const g of guides) {
    const mod = g.module ? moduleByKey[g.module] : null;
    const svg = ogSvg(g, mod);
    try {
      const png = new Resvg(svg, {
        fitTo: { mode: 'width', value: 1200 },
        font: { loadSystemFonts: false, fontFiles: OG_FONTS, defaultFontFamily: 'Playfair Display' },
      }).render().asPng();
      write(`public/og/${g.url}.png`, png);
      out[g.url] = `${ORIGIN}/public/og/${g.url}.png`;
    } catch (e) {
      console.warn(`[prerender] og image for ${g.url} failed: ${e.message}`);
    }
  }
  return out;
}

/* ── sitemap / robots ──────────────────────────────────────────── */
const STATIC_PAGES = [
  ['/', '1.0'],
  ['/functions', '0.9'],
  ['/pricing', '0.9'],
  ['/guides', '0.8'],
  ['/privacy', '0.3'],
  ['/terms', '0.3'],
];

function sitemap(guides) {
  const today = new Date().toISOString().slice(0, 10);
  const url = (loc, priority) =>
    `  <url>\n    <loc>${ORIGIN}${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
  const rows = [
    ...STATIC_PAGES.map(([loc, p]) => url(loc, p)),
    ...guides.map(g => url(`/guides/${g.url}`, '0.7')),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows.join('\n')}\n</urlset>\n`;
}

/* Nothing is disallowed, and the AI crawlers are named explicitly so
   that stays a decision rather than an accident of the wildcard. */
const AI_AGENTS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'anthropic-ai',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot', 'Meta-ExternalAgent',
];

const robots = () => [
  '# ATREOX — everything is public and everything is welcome, AI search included.',
  '',
  'User-agent: *',
  'Allow: /',
  '',
  ...AI_AGENTS.flatMap(a => [`User-agent: ${a}`, 'Allow: /', '']),
  `Sitemap: ${ORIGIN}/sitemap.xml`,
  '',
].join('\n');

/* ── Run ───────────────────────────────────────────────────────── */
const { GUIDES, MODULE_BY_KEY } = loadCatalog();

/* The slug -> address map the legacy-anchor redirect in index.html
   uses, refreshed from the catalog so the two cannot drift. */
let shell = read('index.html');
const SLUG_MAP_RE = /\/\* SLUG-MAP \*\/[\s\S]*?\/\* \/SLUG-MAP \*\//;
if (!SLUG_MAP_RE.test(shell)) {
  throw new Error('index.html has no SLUG-MAP markers — the legacy #guide- redirect would go stale');
}
const slugMap = JSON.stringify(Object.fromEntries(GUIDES.map(g => [g.slug, g.url])));
shell = shell.replace(SLUG_MAP_RE, () => `/* SLUG-MAP */${slugMap}/* /SLUG-MAP */`);
write('index.html', shell);

if (!/<!-- HEAD:META -->[\s\S]*?<!-- \/HEAD:META -->/.test(shell)) {
  throw new Error('index.html has no HEAD:META markers — guide pages would ship the site-wide title');
}
if (!shell.includes('<div id="root"></div>')) {
  throw new Error('index.html has no <div id="root"></div> to prerender in front of');
}

const ogImages = await buildOgImages(GUIDES, MODULE_BY_KEY);

for (const guide of GUIDES) {
  const mod = guide.module ? MODULE_BY_KEY[guide.module] : null;
  const html = shell
    .replace(/<!-- HEAD:META -->[\s\S]*?<!-- \/HEAD:META -->/,
      () => headFor(guide, mod, ogImages[guide.url] || OG_FALLBACK))
    .replace('<div id="root"></div>',
      () => `${renderGuide(guide, GUIDES, mod)}\n  <div id="root"></div>`);
  write(`guides/${guide.url}.html`, html);
}

/* A guide renamed in the catalog leaves its old file behind, and the
   deploy serves whatever is in the directory — so the address would go
   on answering with a page nothing links to any more. Sweep it. */
const wanted = new Set(GUIDES.map(g => g.url + '.html'));
for (const f of fs.readdirSync(path.join(ROOT, 'guides'))) {
  if (f.endsWith('.html') && !wanted.has(f)) {
    fs.unlinkSync(path.join(ROOT, 'guides', f));
    console.log(`[prerender] removed stale guides/${f}`);
  }
}

write('sitemap.xml', sitemap(GUIDES));
write('robots.txt', robots());

console.log(`[prerender] ${GUIDES.length} guide pages, sitemap.xml, robots.txt`);
for (const g of GUIDES) console.log(`  /guides/${g.url}`);
