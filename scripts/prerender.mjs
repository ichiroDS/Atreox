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
import { optimizeImages } from './optimize-images.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/* The host that answers 200. Vercel has www as the project's primary
   domain, so the apex 307s to it — and a canonical, an og:url or a
   sitemap entry pointing at a redirect is a worse signal than one
   pointing at the page. If the apex is ever made primary instead, this
   line is the only thing that has to change. */
const ORIGIN = 'https://www.atreoxai.com';
const OG_FALLBACK = ORIGIN + '/public/apple-touch-icon.png';

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => {
  const full = path.join(ROOT, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, s);
};

/* A <picture><source> that points at a missing file doesn't fall back
   to the <img> the way a broken <img src> alone would — a browser that
   commits to a <source> and then gets a 404 just shows a broken image.
   optimize-images.mjs writes a .webp next to every screenshot, but a
   file it couldn't touch (still open elsewhere, say) has none, so the
   <source> is only worth emitting once the sibling is confirmed to
   exist — the same failure that skipped the file skips its <source>. */
const webpSrc = src => {
  const webp = src.replace(/\.(jpe?g|png)$/i, '.webp');
  return fs.existsSync(path.join(ROOT, webp.replace(/^\//, ''))) ? webp : null;
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

/* ── A written guide's own body ────────────────────────────────────
   The mirror of ReaderBlocks in guides.jsx: same catalog data, same
   class names, and those classes are defined once in index.html. So
   this is not a second design of the guide — it is the same design,
   rendered without React for whoever arrives without it. */
const NUM = 'display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;box-sizing:border-box;border-radius:3px;border:1px solid rgba(0,217,255,0.32);background:rgba(0,217,255,0.07);font-family:"JetBrains Mono",monospace;font-weight:600;font-size:0.58rem;color:#00d9ff;margin-right:11px;vertical-align:middle';

/* Mirror of ControlReplica in guides.jsx — same shapes, same classes.
   Inert by construction: these are spans with CSS, not inputs, so there
   is nothing here that could take a value or send one anywhere. */
function controlReplica(c) {
  switch (c.kind) {
    case 'toggle':
      return `<span aria-hidden="true" class="g-r-toggle${c.on ? ' is-on' : ''}"></span>`;
    case 'slider':
      return `<span aria-hidden="true" class="g-r-slider"><span class="g-r-slider-fill" style="width:${c.pct ?? 50}%"></span><span class="g-r-slider-thumb" style="left:${c.pct ?? 50}%"></span></span>`;
    case 'select':
      return `<span aria-hidden="true" class="g-r-select"><span class="g-r-select-v">${esc(c.value)}</span><span class="g-r-caret"></span></span>`;
    case 'field':
      return `<span aria-hidden="true" class="g-r-field">${esc(c.value)}</span>`;
    case 'tile':
      return `<span aria-hidden="true" class="g-r-tile${c.tone ? ' t-' + c.tone : ''}"><span class="g-r-tile-n">${esc(c.value)}</span></span>`;
    case 'badge':
      return `<span aria-hidden="true" class="g-r-badge${c.tone ? ' t-' + c.tone : ''}">${esc(c.value)}</span>`;
    default:
      return `<span aria-hidden="true" class="g-r-btn${c.tone ? ' t-' + c.tone : ''}">${esc(c.value || c.name)}</span>`;
  }
}

function renderBlocks(blocks) {
  return blocks.map(([kind, v]) => {
    switch (kind) {
      case 'p':
        return `<p class="g-p">${esc(v)}</p>`;

      case 'callout':
        return `<div class="g-callout">${v.map(t => `<p class="g-p">${esc(t)}</p>`).join('')}</div>`;

      case 'steps':
        return `<ol class="g-steps">${v.map(t => `<li><p class="g-p">${esc(t)}</p></li>`).join('')}</ol>`;

      case 'card':
        return `<div class="g-card">${v.kicker ? `<span class="g-kicker">${esc(v.kicker)}</span>` : ''}${renderBlocks(v.blocks)}</div>`;

      case 'cards':
        return `<div class="g-cards">${v.map(c =>
          `<div class="g-card">${c.kicker ? `<span class="g-kicker">${esc(c.kicker)}</span>` : ''}${renderBlocks(c.blocks)}</div>`).join('')}</div>`;

      case 'options':
        return `<div class="g-options">${v.map(o =>
          `<div class="g-option">${o.badge ? `<span class="g-option-badge">${esc(o.badge)}</span>` : ''}<p class="g-p" style="margin:0">${esc(o.text)}</p></div>`).join('')}</div>`;

      case 'kv':
        return `<dl class="g-kv">${v.map(([k, val]) =>
          `<div class="g-kv-row"><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`).join('')}</dl>`;

      case 'stat':
        return `<div class="g-stat"><span class="g-stat-value">${esc(v.value)}</span><p class="g-p" style="margin:0">${esc(v.label)}</p></div>`;

      case 'faq':
        return `<div class="g-faq">${v.map(qa =>
          `<details><summary>${esc(qa.q)}</summary><p class="g-p">${esc(qa.a)}</p></details>`).join('')}</div>`;

      case 'map':
        return `<ol class="g-map">${v.map((region, j) =>
          `<li><span class="g-map-n">${String(j + 1).padStart(2, '0')}</span><span class="g-map-body"><span class="g-map-name">${esc(region.name)}</span><span class="g-map-holds">${esc(region.holds)}</span></span></li>`
        ).join('')}</ol>`;

      /* Mirror of ReaderBlocks' 'controls'. Every explanation row is in
         this markup whether or not anyone ever opens the <details> —
         the fold is presentation, the text is the page. */
      case 'controls':
        return `<div class="g-ctl">
<p class="g-ctl-warn"><span class="g-ctl-warn-badge">Illustration</span><span class="g-ctl-warn-text">Not the live panel — nothing here is connected: no state, no saving, no requests. Click a control to read what it does.</span></p>
${v.map(c => `<details class="g-ctl-item"${c.id ? ` id="${esc(c.id)}"` : ''}><summary><span class="g-ctl-stage">${controlReplica(c)}</span><span class="g-ctl-label"><span class="g-ctl-name">${esc(c.name)}</span>${c.where ? `<span class="g-ctl-where">${esc(c.where)}</span>` : ''}</span><span class="g-ctl-plus" aria-hidden="true"></span></summary><dl class="g-ctl-rows">${
          c.rows.map(([k, val]) => `<div><dt>${esc(k)}</dt><dd>${esc(val)}</dd></div>`).join('')
        }</dl></details>`).join('\n')}
</div>`;

      case 'figure': {
        const webp = webpSrc(v.src);
        const source = webp ? `<source srcset="${esc(webp)}" type="image/webp">` : '';
        return `<figure class="g-fig"><picture>${source}<img src="${esc(v.src)}" alt="${esc(v.alt)}" width="${v.w}" height="${v.h}" loading="lazy" decoding="async"></picture><figcaption>${esc(v.caption)}</figcaption></figure>`;
      }

      case 'plates':
        return `<div class="g-plates">${v.map(p =>
          `<div class="g-plate g-${p.tone}"><span class="g-plate-label">${esc(p.label)}</span><p class="g-p">${esc(p.text)}</p></div>`).join('')}</div>`;

      case 'table':
        return `<div class="g-tablewrap panel"><table class="g-table"><thead><tr>${
          v.head.map(h => `<th scope="col">${esc(h)}</th>`).join('')
        }</tr></thead><tbody>${
          v.rows.map(r => `<tr>${r.map((c, k) => `<td data-label="${esc(v.head[k])}">${
            Array.isArray(c) ? `<ul class="g-td-list">${c.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : esc(c)
          }</td>`).join('')}</tr>`).join('')
        }</tbody></table></div>`;

      /* Plain checkboxes with no name and no script: they tick on the
         prerendered page exactly as they do once React is up, and
         neither version remembers a thing. */
      case 'checklist':
        return `<div class="g-lists">${v.map(col =>
          `<div class="g-list g-${col.tone}"><h3 class="g-list-h">${esc(col.title)}</h3><ul>${
            col.items.map(([label, text]) =>
              `<li><label class="g-check"><input type="checkbox"><span class="g-check-t"><b>${esc(label)}</b> ${esc(text)}</span></label></li>`).join('')
          }</ul></div>`).join('')}</div>`;

      case 'note':
        return `<p class="g-note">${esc(v)}</p>`;

      case 'bullets':
        return `<ul class="g-bullets">${v.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;

      case 'linkout':
        return `<a href="${esc(v.href)}" class="quiet-link" style="margin-bottom:16px">${esc(v.label)} →</a>`;

      default:
        throw new Error(`unknown guide block "${kind}" — prerender and guides.jsx have drifted`);
    }
  }).join('\n');
}

function renderGuide(guide, guides, mod) {
  const parts = [];

  parts.push(`<p style="font-family:'JetBrains Mono',monospace;font-weight:500;font-size:0.62rem;letter-spacing:0.18em;text-transform:uppercase;color:#00d9ff;margin:0 0 12px">${esc(mod ? mod.tagline : 'Preparation')}</p>`);
  parts.push(`<h1 style="font-family:'Playfair Display',Georgia,serif;font-weight:500;font-size:2.6rem;line-height:1.1;letter-spacing:-0.015em;color:#fff;margin:0 0 18px">${esc(guide.title)}</h1>`);
  parts.push(`<p style="${P};font-size:1.05rem;color:rgba(255,255,255,0.78)">${esc(guide.summary)}</p>`);

  /* The chapter list is the guide's own sections when it has a body,
     and the anchors are real: a search result deep-linking to one
     lands on it before a line of JavaScript has run. */
  parts.push(section('In this guide', guide.body
    ? `<div class="g-toc panel" style="padding:16px 18px">${guide.body
        .map((s, i) => `<a href="#${esc(s.id)}"><span class="g-toc-n">${String(i + 1).padStart(2, '0')}</span><span class="g-toc-t">${esc(s.title)}</span></a>`)
        .join('')}</div>`
    : `<ol style="margin:0 0 8px 1.15rem;padding:0">${guide.covers
        .map(c => `<li style="${P};margin-bottom:8px">${esc(c)}</li>`).join('')}</ol>`));

  /* A written guide carries its own text, section by section. */
  if (guide.body) {
    for (const [i, s] of guide.body.entries()) {
      parts.push(`<h2 id="${esc(s.id)}" style="${H2}"><span style="${NUM}">${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}</h2>\n${renderBlocks(s.blocks)}`);
    }
  }

  /* A prep guide carries its own opening paragraph; a module guide is
     its module's write-up, laid out as a lesson — same as the reader. */
  if (guide.intro) parts.push(section('Why it matters', `<p style="${P}">${esc(guide.intro)}</p>`));

  /* Superseded the moment the guide has a body of its own — same rule
     as the reader, so the two never disagree about what a page holds. */
  if (mod && !guide.body) {
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

  return `<div id="prerendered" style="max-width:1340px;margin:0 auto;padding:128px 6% 88px">
<nav aria-label="Guides" style="margin-bottom:26px">
<a href="/guides" style="font-family:'JetBrains Mono',monospace;font-weight:500;font-size:0.62rem;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.34);text-decoration:none">All guides</a>
<ul style="list-style:none;margin:14px 0 0;padding:0">${rail}</ul>
</nav>
<article id="guide-${esc(guide.slug)}">
${parts.join('\n')}
</article>
</div>`;
}

/* ── /referral-program — one page, hand-written to match
   referral-page.jsx, the same way renderGuide()'s hand-written module
   sections mirror GuideReader's JSX. There is only one of these, so it
   isn't worth building a second block-kind engine for it. ───────── */
function renderReferral() {
  const refWebp = webpSrc('/public/screenshots/reffereal-programme/ref.png');
  const refSource = refWebp ? `<source srcset="${esc(refWebp)}" type="image/webp">` : '';
  const step = (n, html) =>
    `<div style="display:flex;gap:16px;padding-bottom:18px"><span style="width:28px;height:28px;border-radius:3px;flex-shrink:0;border:1px solid rgba(0,217,255,0.34);background:rgba(0,217,255,0.07);display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-weight:600;font-size:0.62rem;color:#00d9ff;line-height:1">${n}</span><p class="g-p" style="margin:0;padding-top:4px">${html}</p></div>`;

  return `<div id="prerendered" style="max-width:1340px;margin:0 auto;padding:128px 6% 88px">
<div style="max-width:760px;margin:0 auto">
<h1 style="font-family:'Playfair Display',Georgia,serif;font-weight:500;font-size:2.6rem;line-height:1.1;letter-spacing:-0.015em;color:#fff;margin:0 0 18px">Send them the link. Get paid while they stay.</h1>
<p style="font-family:Barlow,sans-serif;font-weight:300;font-size:1.02rem;color:rgba(255,255,255,0.66);line-height:1.7;margin:0 0 32px">Open to content creators and regular users alike — anyone with a link to share.</p>

${step('1', 'Open <b>Settings</b> inside the ATREOX dashboard.')}
${step('2', 'Copy your referral link from the <b>Refer a customer</b> card.')}
${step('3', "Everyone who buys through it shows up in your panel — referred total, who's currently paying, and what that's worth this month.")}

<figure class="g-fig" style="margin:22px 0 32px">
<picture>${refSource}
<img src="/public/screenshots/reffereal-programme/ref.png" alt="ATREOX Settings page showing the referral link, referral stats, and commission rate" width="1400" height="723" loading="lazy" decoding="async"></picture>
<figcaption>Refer a customer, in Settings — the link, and everyone who's used it</figcaption>
</figure>

<div class="g-callout" style="max-width:none;text-align:center;padding:30px 26px">
<span style="display:block;font-family:'Playfair Display',Georgia,serif;font-weight:500;font-size:2.6rem;color:#00d9ff;line-height:1;text-shadow:0 0 26px rgba(0,217,255,0.3);margin-bottom:10px">25%</span>
<p class="g-p" style="margin:0 auto;max-width:520px;text-align:center">You earn <b>25% recurring commission</b> for as long as a customer you referred stays subscribed.</p>
</div>

<p class="g-note">The number in your panel is re-calculated from current subscriptions — it's an estimate, not an invoice. The actual payout is based on invoices that have actually been paid.</p>
</div>
</div>`;
}

/* ── The head, per page — shared by every prerendered file ───────── */
function metaBlock({ url, title, desc, ogImage, type }) {
  return [
    '<!-- HEAD:META -->',
    `  <title>${esc(title)}</title>`,
    `  <meta name="description" content="${esc(desc)}">`,
    `  <link rel="canonical" href="${esc(url)}">`,
    '',
    `  <meta property="og:type" content="${type}">`,
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

function headFor(guide, mod, ogImage) {
  /* The <h1> on the page is always guide.title. What a search result
     shows can say more than that without changing the page, so a guide
     whose text has outgrown its one-line summary carries its own pair
     in the catalog and everything else falls back to the old shape. */
  const title = guide.seoTitle ? `${guide.seoTitle} — ATREOX` : `${guide.title} — ATREOX guide`;
  return metaBlock({
    url: `${ORIGIN}/guides/${guide.url}`, title,
    desc: guide.seoDescription || guide.summary,
    ogImage, type: 'article',
  });
}

function headForReferral() {
  return metaBlock({
    url: `${ORIGIN}/referral-program`,
    title: 'Referral program — ATREOX',
    desc: 'Earn 25% recurring commission for as long as a customer you referred stays subscribed. Copy your link from Settings — open to creators and regular users alike.',
    ogImage: OG_FALLBACK, type: 'website',
  });
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
  ['/referral-program', '0.5'],
  ['/contact', '0.4'],
  ['/privacy', '0.3'],
  ['/terms', '0.3'],
  ['/refund', '0.3'],
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
const imgResult = await optimizeImages(path.join(ROOT, 'public', 'screenshots'));
if (imgResult.processed) console.log(`[optimize-images] ${imgResult.processed} image(s) optimized, ${imgResult.skipped} already small`);

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

/* One page, same shell-swap trick as every guide above. */
{
  const html = shell
    .replace(/<!-- HEAD:META -->[\s\S]*?<!-- \/HEAD:META -->/, () => headForReferral())
    .replace('<div id="root"></div>', () => `${renderReferral()}\n  <div id="root"></div>`);
  write('referral-program.html', html);
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

console.log(`[prerender] ${GUIDES.length} guide pages, 1 referral page, sitemap.xml, robots.txt`);
for (const g of GUIDES) console.log(`  /guides/${g.url}`);
console.log('  /referral-program');
