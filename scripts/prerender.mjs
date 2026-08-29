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

import crypto from 'node:crypto';
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

/* LF, for the same reason build-app.mjs normalises: the prerendered pages
   are built by splicing index.html, and a CRLF working copy would otherwise
   put the builder's line endings into committed output. Line endings alone
   are masked by the build-currency check, so this one is hygiene rather than
   a live bug — but a build whose output depends on the machine is worth
   closing on both sides, not one. */
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8').replace(/\r\n/g, '\n');
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
  /* Both content files, into the SAME box and in this order: the blog
     reads nothing from the catalog today, but it shares the block
     vocabulary and the tool registry, and a box built the other way
     round would work until the first time it did. */
  for (const file of ['catalog.jsx', 'blog-catalog.jsx']) {
    new vm.Script(read(file), { filename: file }).runInContext(ctx);
  }

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

  const { POSTS, BLOG_CATEGORIES, BLOG_CATEGORY_BY_SLUG, BLOG_RESERVED_SLUGS,
          TOOL_BY_ID, BLOCK_KINDS, postsForList, relatedPosts,
          formatPostDate, postWasUpdated } = box;
  if (!Array.isArray(POSTS)) throw new Error('blog-catalog.jsx exposed no POSTS');
  if (!Array.isArray(BLOG_CATEGORIES) || !BLOG_CATEGORIES.length) {
    throw new Error('blog-catalog.jsx exposed no BLOG_CATEGORIES');
  }

  const postSlugs = new Set();
  for (const post of POSTS) {
    if (!post.slug) throw new Error(`a post ("${post.title}") has no slug`);
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(post.slug)) {
      throw new Error(`post slug "${post.slug}" is not a clean path segment`);
    }
    /* /blog/category/<slug> and /blog/<slug> share a namespace, so a
       post slugged "category" would make one of them unreachable. Caught
       here rather than found later as a 404. */
    if (BLOG_RESERVED_SLUGS.includes(post.slug)) {
      throw new Error(`post slug "${post.slug}" is reserved under /blog`);
    }
    if (postSlugs.has(post.slug)) throw new Error(`two posts share the address /blog/${post.slug}`);
    postSlugs.add(post.slug);
    if (!BLOG_CATEGORY_BY_SLUG[post.category]) {
      throw new Error(`post "${post.slug}" is in unknown category "${post.category}"`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(post.published || '')) {
      throw new Error(`post "${post.slug}" needs a published date as YYYY-MM-DD`);
    }
    if (post.updated !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(post.updated)) {
      throw new Error(`post "${post.slug}" has an updated date that is not YYYY-MM-DD`);
    }
    if (post.updated && post.updated < post.published) {
      throw new Error(`post "${post.slug}" was updated before it was published`);
    }
    if (!Array.isArray(post.body) || !post.body.length) {
      throw new Error(`post "${post.slug}" has no body`);
    }
    const anchors = new Set();
    for (const sec of post.body) {
      if (!sec.id) throw new Error(`a section of "${post.slug}" has no id to anchor`);
      if (anchors.has(sec.id)) throw new Error(`post "${post.slug}" repeats the anchor #${sec.id}`);
      anchors.add(sec.id);
    }
  }

  /* A guide address and a post address cannot collide - they live under
     different prefixes - but their OG images did, because those are
     keyed into one flat map. Posts are namespaced under blog/ for that
     reason; this asserts the namespacing is actually doing its job. */
  for (const c of BLOG_CATEGORIES) {
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(c.slug)) {
      throw new Error(`category slug "${c.slug}" is not a clean path segment`);
    }
  }

  return {
    GUIDES, MODULE_BY_KEY,
    POSTS, BLOG_CATEGORIES, TOOL_BY_ID, BLOCK_KINDS,
    postsForList, relatedPosts, formatPostDate, postWasUpdated,
  };
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
const H2 = "font-family:'JetBrains Mono',monospace;font-weight:500;font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;color:#fff;margin:38px 0 14px";
const H3 = "font-family:'JetBrains Mono',monospace;font-weight:500;font-size:0.72rem;letter-spacing:0.16em;text-transform:uppercase;color:#fff;margin:0 0 6px";

const section = (title, inner) => `<h2 style="${H2}">${esc(title)}</h2>\n${inner}`;

/* ── A written guide's own body ────────────────────────────────────
   The mirror of ReaderBlocks in guides.jsx: same catalog data, same
   class names, and those classes are defined once in index.html. So
   this is not a second design of the guide — it is the same design,
   rendered without React for whoever arrives without it. */
const NUM = "display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;box-sizing:border-box;border-radius:3px;border:1px solid rgba(0,217,255,0.32);background:rgba(0,217,255,0.07);font-family:'JetBrains Mono',monospace;font-weight:600;font-size:0.58rem;color:#00d9ff;margin-right:11px;vertical-align:middle";

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

      /* The static half of LiteVideo (shared.jsx). React replaces this
         the moment it mounts; what matters is that the version a crawler
         and a no-JS visitor get is ALSO free of Google — so it is the
         same poster with a plain link to the watch page rather than a
         button that needs a script to do anything. Clicking leaves the
         site, which costs a navigation and loads nothing here. */
      case 'video': {
        const inner = `<img src="${esc(v.poster)}" alt="" width="1280" height="720" loading="lazy" decoding="async"><span class="g-video-play" aria-hidden="true"></span><span class="g-video-note">${
          esc(v.note || 'Plays from YouTube - nothing is loaded from Google until you press play')
        }</span>`;
        const frame = v.id
          ? `<a class="g-video-frame" href="https://www.youtube.com/watch?v=${esc(v.id)}" rel="noopener" aria-label="Play: ${esc(v.title)}">${inner}</a>`
          : `<div class="g-video-frame" style="cursor:default"><img src="${esc(v.poster)}" alt="" width="1280" height="720" loading="lazy" decoding="async"><span class="g-video-note">Video coming soon</span></div>`;
        return `<figure class="g-video">${frame}${v.caption ? `<figcaption>${esc(v.caption)}</figcaption>` : ''}</figure>`;
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

      /* Mirror of ReaderBlocks' 'toolcta'. Unlike the reader, an
         unknown tool id THROWS: the reader is the copy a visitor sees
         after React mounts, this is the copy a crawler sees, and a
         silently missing call-to-action in the crawled page is a hole
         in the one thing the blog exists to do. Failing the build is
         the cheaper end of that trade. */
      case 'toolcta': {
        const tool = TOOL_BY_ID[v.tool];
        if (!tool) {
          throw new Error(`unknown tool "${v.tool}" in a toolcta block — add it to TOOLS in catalog.jsx`);
        }
        return `<aside class="g-toolcta"><span class="g-toolcta-kicker">Free tool</span><span class="g-toolcta-name">${esc(tool.name)}</span><p class="g-p g-toolcta-text">${esc(v.angle || tool.blurb)}</p><a class="g-toolcta-cta" href="${esc(tool.panel)}" rel="noopener">${esc(tool.cta)} →</a></aside>`;
      }

      default:
        throw new Error(`unknown block kind "${kind}" — prerender.mjs and guides.jsx have drifted`);
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

/* ── The pages the router owns ─────────────────────────────────────
   Everything under here is a client-side route: one index.html served
   at nine addresses. That is fine for a reader and was quietly fatal
   for search — every one of them shipped the SAME title, the same
   description and, worse, the same canonical pointing at "/". The
   sitemap asked Google to index nine pages while each page said "I am
   really the home page", and canonical wins that argument. Eight pages
   were excluded from the index by our own markup, /pricing among them.

   So each route now gets its own prerendered shell with its own head.
   The BODY is still rendered by React - these pages are interactive and
   prerendering them is a different job - but the head is what decides
   whether a page is indexed at all, and it no longer lies.
─────────────────────────────────────────────────────────────────── */
const SITE_PAGES = [
  {
    file: 'functions.html', route: '/functions', kicker: 'MODULES',
    title: 'What each module does — ATREOX',
    heading: 'Eight modules',
    short: 'Comments, DMs, reactions, discovery',
    desc: 'Eight Telegram automation modules, one panel: comment generation, DM replies, account warming, reactions, and channel and group discovery. What each does, and what it costs.',
  },
  {
    file: 'pricing.html', route: '/pricing', kicker: 'PRICING',
    title: 'Pricing — pick the modules you need — ATREOX',
    heading: 'What it costs',
    short: 'Per module, or the full licence',
    desc: 'Modules are priced one at a time from EUR 20/month, or take all of them on one licence for EUR 120. Monthly or annual, cancel any time, no free trial.',
  },
  {
    file: 'guides.html', route: '/guides', kicker: 'GUIDES',
    title: 'Telegram automation guides — setup, limits and safety — ATREOX',
    heading: 'Guides',
    short: 'Ten walkthroughs, end to end',
    desc: 'Ten walkthroughs: buying Telegram accounts, matching proxies, warming accounts safely, finding channels worth commenting in, and every control in the panel.',
  },
  {
    file: 'contact.html', route: '/contact', kicker: 'CONTACT',
    title: 'Contact ATREOX — one form, one inbox',
    heading: 'Get in touch',
    short: 'Billing, bugs, refunds',
    desc: 'Billing, something broken, a refund, or anything else. One form that lands in one inbox, answered Mon-Fri 08:00-20:00 CET.',
  },
  {
    /* The first of the free tools, and the entry point of the tools
       funnel: search finds this page, the page explains what the
       checker reports that a generic uptime checker cannot, and its
       button lands in the panel where an account is required.

       Head-only, like every other row here - the body is rendered by
       React. Worth naming as a deliberate limit rather than an
       oversight: this is a page written to be found in search, so it
       is a candidate for a real prerendered body the day the guides'
       block renderer is generalised. */
    file: 'tools/proxy-checker.html', route: '/tools/proxy-checker', kicker: 'FREE TOOL',
    title: 'Free Telegram proxy checker — country, DC and exit IP — ATREOX',
    heading: 'Proxy checker',
    short: 'What Telegram sees through it',
    desc: 'Check a SOCKS5, HTTP or MTProto proxy against Telegram: the country and nearest data centre Telegram itself reports through it, the real exit IP, its network and type, and both latencies. Free with any account.',
  },
  {
    file: 'privacy.html', route: '/privacy', kicker: 'LEGAL',
    title: 'Privacy Policy — ATREOX',
    heading: 'Privacy Policy',
    short: 'What we hold, and why',
    desc: 'What ATREOX holds as controller, what it processes on your behalf, how long each kind of record is kept, and the rights you have over any of it.',
  },
  {
    file: 'terms.html', route: '/terms', kicker: 'LEGAL',
    title: 'Terms of Service — ATREOX',
    heading: 'Terms of Service',
    short: 'What you agree to',
    desc: 'The terms for using ATREOX: the accounts you supply and what you are responsible for, acceptable use, billing and module changes, and the referral programme.',
  },
  {
    file: 'refund.html', route: '/refund', kicker: 'LEGAL',
    title: 'Refund Policy — ATREOX',
    heading: 'Refund Policy',
    short: 'What you can get back',
    desc: 'Cancel a new subscription within 14 days and get your money back, no reason needed. What is refundable, what is not, and how to ask.',
  },
];

/* The home page keeps index.html, so it is described here rather than
   generated: same table, one row, so the copy lives in one place. */
const HOME_PAGE = {
  route: '/', kicker: 'ATREOX', heading: 'Telegram growth', short: 'Eight modules, one panel',
  title: 'ATREOX — Telegram automation: comments, DMs, warming, discovery',
  desc: 'Run a network of Telegram accounts from one panel: AI comments on the channels your audience reads, DM replies, account warming, reactions, and channel discovery. Eight modules, priced separately.',
};

/* ── Structured data ───────────────────────────────────────────────
   There was none anywhere. Three kinds, each only where it is true:

   Organization + WebSite on every page - who publishes this, and what
   the site is called, so a search result can show the brand rather
   than guessing it from the domain.

   SoftwareApplication with real offers, on /pricing only. The prices
   are read from the catalog, not typed here, so they cannot drift from
   what the page itself renders.

   Article + BreadcrumbList on each guide. The breadcrumb is what turns
   a result into "atreoxai.com > Guides > Buying Telegram accounts"
   instead of a bare URL.

   No FAQPage and no Review: Google stopped showing FAQ rich results for
   most sites, and there are no reviews to mark up. Marking up something
   we do not have is how a site earns a manual action.
─────────────────────────────────────────────────────────────────── */
const jsonLd = (obj) =>
  `  <script type="application/ld+json">${JSON.stringify(obj)}</script>`;

const ORG_ID = ORIGIN + '/#organization';

function orgAndSiteLd() {
  return jsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'ATREOX',
        url: ORIGIN + '/',
        logo: ORIGIN + '/public/apple-touch-icon.png',
        email: 'hello@atreoxai.com',
        sameAs: ['https://t.me/atreoxai'],
      },
      {
        '@type': 'WebSite',
        '@id': ORIGIN + '/#website',
        url: ORIGIN + '/',
        name: 'ATREOX',
        publisher: { '@id': ORG_ID },
        inLanguage: 'en',
      },
    ],
  });
}

function pricingLd(modules) {
  const priced = modules.filter(m => !m.included && m.price > 0);
  return jsonLd({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'ATREOX',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: ORIGIN + '/pricing',
    publisher: { '@id': ORG_ID },
    offers: priced.map(m => ({
      '@type': 'Offer',
      name: m.name,
      price: String(m.price),
      priceCurrency: 'EUR',
      category: 'subscription',
      url: ORIGIN + '/pricing',
    })),
  });
}

function guideLd(guide, ogImage) {
  const url = `${ORIGIN}/guides/${guide.url}`;
  return [
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.seoTitle || guide.title,
      description: guide.seoDescription || guide.summary,
      image: ogImage,
      mainEntityOfPage: url,
      author: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      inLanguage: 'en',
    }),
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Guides', item: ORIGIN + '/guides' },
        { '@type': 'ListItem', position: 2, name: guide.title, item: url },
      ],
    }),
  ].join('\n');
}

/* index.html is BOTH the shell every other page is cut from and a page in
   its own right, so anything written outside the HEAD:META markers is read
   back in as part of the shell on the next build and written again. The
   first version of this appended the JSON-LD after the closing marker and
   grew a fresh copy of Organization+WebSite on every single build - three
   of them after three builds. Splicing it INSIDE the markers means the same
   replacement that rewrites the meta also replaces the last run's LD. */
const withLd = (meta, ...blocks) =>
  meta.replace(
    '  <!-- /HEAD:META -->',
    blocks.filter(Boolean).join('\n') + '\n' + '  <!-- /HEAD:META -->',
  );

function headForPage(page, ogImage) {
  return metaBlock({
    url: page.route === '/' ? ORIGIN + '/' : ORIGIN + page.route,
    title: page.title, desc: page.desc, ogImage, type: 'website',
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

/* ══════════════════════════════════════════════════════════════════
   The blog: one page per article, one per category, and the index.

   Everything below reuses renderBlocks — the same function the guides
   go through, with the same block kinds and the same g-* classes. What
   is new here is only the frame around a body: breadcrumbs, the two
   dates, the contents rail and the read-next block. That split is the
   point: an article and a guide differ in their frame, not in what a
   paragraph is, so there is exactly one block renderer to keep honest.
══════════════════════════════════════════════════════════════════ */

/* ── lastmod, and why it is not `new Date()` ──────────────────────
   Every URL in the sitemap used to carry today's date, rewritten on
   every build. That is not a small inaccuracy: a sitemap that claims
   the whole site changed today, every day, teaches a crawler that
   lastmod on this domain means nothing — and the cost lands hardest on
   exactly the pages where it would have helped, the new articles.

   Four ways to get a real date, and what each costs:

     a) a hand-kept `updated` field per guide. Free to build; the
        failure mode is the discipline it depends on. Edit the prose,
        forget the field, and the date now lies STALE, which a crawler
        acts on (it stops re-reading the page) rather than merely
        discounting.
     b) the git time of catalog.jsx. All eleven guides live in that one
        file, so every guide's date moves whenever any guide is
        touched: right once, wrong ten times.
     c) `git log -L` over each guide's line range. Precise, and three
        problems: it needs real git history at build time, which a
        shallow CI clone may not have; it is eleven history walks per
        build; and the line range has to be located by parsing the
        catalog, so a reformat silently relocates it.
     d) file mtime. Meaningless in CI — a fresh checkout is always now.

   So: (e), a committed manifest keyed by a hash of the content itself.
   The build hashes each guide's own data, and only when that hash
   differs from the manifest does the date move to today. No git, no
   discipline, identical on a laptop and on Vercel, and stable across
   rebuilds — which matters because verify-build-current.mjs reruns the
   build and compares, so a date that moved on every run would make
   that check flap forever.

   The manifest is tracked, and forgetting to commit it after a content
   change is caught by verify-build-current.mjs like any other generated
   file. The first build stamps today for everything, once: we do not
   know when these were last edited, and today is when we started
   keeping track.
─────────────────────────────────────────────────────────────────── */
const LASTMOD_FILE = 'content-lastmod.json';

function contentHash(value) {
  /* JSON.stringify over a literal is stable here: the objects come from
     source literals, so key order is the order they are written in, and
     it only has to be consistent between two runs of the same file. */
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

function resolveLastmod(entries, today) {
  let previous = {};
  try {
    previous = JSON.parse(fs.readFileSync(path.join(ROOT, LASTMOD_FILE), 'utf8'));
  } catch (_) {
    /* Missing or unreadable: everything is stamped today and the file is
       written. Deliberately not an error - a fresh clone that has not
       committed it yet should build, not fail. */
  }

  const next = {};
  const dates = {};
  for (const [id, value] of entries) {
    const hash = contentHash(value);
    const before = previous[id];
    const date = before && before.hash === hash ? before.date : today;
    next[id] = { hash, date };
    dates[id] = date;
  }

  /* Which entries actually MOVED, as opposed to which are merely new.
     Only used for the drift warning on articles: a post whose text
     changed while its author-set `updated` field did not is the one
     case where an editorial date can quietly start lying, and a first
     build (where every entry is new) must not warn about all of them. */
  const changed = new Set(
    Object.keys(next).filter(id => previous[id] && previous[id].hash !== next[id].hash),
  );

  if (JSON.stringify(next) !== JSON.stringify(previous)) {
    write(LASTMOD_FILE, JSON.stringify(next, null, 2) + '\n');
  }
  return { dates, changed };
}

/* ── One article ──────────────────────────────────────────────────── */
const CRUMB = "font-family:'JetBrains Mono',monospace;font-weight:500;font-size:0.6rem;letter-spacing:0.16em;text-transform:uppercase;text-decoration:none";

function breadcrumbs(trail) {
  const items = trail.map((c, i) => {
    const last = i === trail.length - 1;
    const inner = last
      ? `<span style="${CRUMB};color:rgba(255,255,255,0.5)" aria-current="page">${esc(c.name)}</span>`
      : `<a href="${esc(c.href)}" style="${CRUMB};color:#00d9ff">${esc(c.name)}</a>`;
    return `<li style="display:inline">${inner}${last ? '' : `<span aria-hidden="true" style="${CRUMB};color:rgba(255,255,255,0.28);padding:0 8px">/</span>`}</li>`;
  }).join('');
  return `<nav aria-label="Breadcrumb" style="margin-bottom:22px"><ol style="list-style:none;margin:0;padding:0">${items}</ol></nav>`;
}

/* Published always, Updated only when the article has genuinely been
   revised. An "Updated" line on the day of publication says nothing and
   trains a reader to stop reading the one place it will eventually
   matter - which is why blog-catalog.jsx leaves `updated` absent rather
   than defaulting it to the publication date. */
function postDates(post) {
  const parts = [
    `<time datetime="${esc(post.published)}">Published ${esc(formatPostDate(post.published))}</time>`,
  ];
  if (postWasUpdated(post)) {
    parts.push(`<time datetime="${esc(post.updated)}">Updated ${esc(formatPostDate(post.updated))}</time>`);
  }
  return `<p class="g-postmeta">${parts.join('<span aria-hidden="true" class="g-postmeta-sep">·</span>')}</p>`;
}

function renderPost(post, category, related) {
  const parts = [];

  parts.push(breadcrumbs([
    { name: 'Blog', href: '/blog' },
    { name: category.name, href: `/blog/category/${category.slug}` },
    { name: post.title },
  ]));

  parts.push(`<h1 style="font-family:'Playfair Display',Georgia,serif;font-weight:500;font-size:2.6rem;line-height:1.1;letter-spacing:-0.015em;color:#fff;margin:0 0 16px">${esc(post.title)}</h1>`);
  parts.push(postDates(post));
  parts.push(`<p style="${P};font-size:1.05rem;color:rgba(255,255,255,0.78)">${esc(post.summary)}</p>`);

  /* The contents, as real anchors: a search result deep-linking to a
     section lands on it before a line of JavaScript has run. Same
     markup and the same classes as a guide's chapter list. */
  parts.push(section('In this article',
    `<div class="g-toc panel" style="padding:16px 18px">${post.body
      .map((s, i) => `<a href="#${esc(s.id)}"><span class="g-toc-n">${String(i + 1).padStart(2, '0')}</span><span class="g-toc-t">${esc(s.title)}</span></a>`)
      .join('')}</div>`));

  for (const [i, s] of post.body.entries()) {
    parts.push(`<h2 id="${esc(s.id)}" style="${H2}"><span style="${NUM}">${String(i + 1).padStart(2, '0')}</span>${esc(s.title)}</h2>\n${renderBlocks(s.blocks)}`);
  }

  if (related.length) {
    parts.push(section('Read next',
      `<div class="g-toc panel" style="padding:16px 18px">${related
        .map(r => `<a href="/blog/${esc(r.slug)}"><span class="g-toc-t">${esc(r.title)}</span></a>`)
        .join('')}</div>`));
  }

  return `<div id="prerendered" style="max-width:1340px;margin:0 auto;padding:128px 6% 88px">
<article id="post-${esc(post.slug)}" style="max-width:860px;margin:0 auto">
${parts.join('\n')}
</article>
</div>`;
}

/* ── The index and the category pages ─────────────────────────────
   Given real prerendered bodies rather than the head-only treatment
   /guides and /pricing get, and for one reason: those two are reachable
   from every guide page's rail, so a crawler finds them and what they
   link to either way. A young blog has no such web - the index and the
   category pages ARE the internal linking, and a page whose HTML holds
   no links to the articles leaves the sitemap as the only way in.
─────────────────────────────────────────────────────────────────── */
function postCard(post, category) {
  return `<li style="margin:0 0 2px"><a href="/blog/${esc(post.slug)}" class="g-postcard">
<span class="g-postcard-cat">${esc(category.name)}</span>
<span class="g-postcard-title">${esc(post.title)}</span>
<span class="g-postcard-sum">${esc(post.summary)}</span>
<time class="g-postcard-date" datetime="${esc(post.published)}">${esc(formatPostDate(post.published))}</time>
</a></li>`;
}

function renderPostList({ heading, lead, posts, categoryBySlug, crumbs, categories }) {
  const cards = posts.length
    ? `<ul style="list-style:none;margin:0;padding:0">${posts.map(p => postCard(p, categoryBySlug[p.category])).join('\n')}</ul>`
    : `<p style="${P}">Nothing here yet.</p>`;

  /* The category rail is on the index AND on every category page, so
     any one of them reaches all the others in one hop. */
  const rail = categories.length > 1 || crumbs.length > 1
    ? `<nav aria-label="Categories" style="margin:0 0 30px"><ul style="list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:8px">${
        categories.map(c => `<li><a href="/blog/category/${esc(c.slug)}" class="g-postcat">${esc(c.name)}</a></li>`).join('')
      }</ul></nav>`
    : '';

  return `<div id="prerendered" style="max-width:1340px;margin:0 auto;padding:128px 6% 88px">
<div style="max-width:860px;margin:0 auto">
${crumbs.length > 1 ? breadcrumbs(crumbs) : ''}
<h1 style="font-family:'Playfair Display',Georgia,serif;font-weight:500;font-size:2.6rem;line-height:1.1;letter-spacing:-0.015em;color:#fff;margin:0 0 16px">${esc(heading)}</h1>
<p style="${P};font-size:1.05rem;color:rgba(255,255,255,0.78);margin-bottom:30px">${esc(lead)}</p>
${rail}
${cards}
</div>
</div>`;
}

/* ── Structured data ──────────────────────────────────────────────
   Article and BreadcrumbList, and deliberately NOT FAQPage even for an
   article that carries an faq block. Google has restricted FAQ rich
   results to government and health sites since 2023, so the markup buys
   no snippet; Article and BreadcrumbList are what actually describe the
   page. An faq block is still an faq block - it just carries no schema.

   dateModified falls back to datePublished: the field has to be present
   for the markup to be complete, and an article that has never been
   revised was last modified when it was written. Nothing on the page
   claims a revision that did not happen - see postDates above.
─────────────────────────────────────────────────────────────────── */
function postLd(post, category, ogImage) {
  const url = `${ORIGIN}/blog/${post.slug}`;
  return [
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.seoTitle || post.title,
      description: post.seoDescription || post.summary,
      image: ogImage,
      mainEntityOfPage: url,
      datePublished: post.published,
      dateModified: post.updated || post.published,
      author: { '@id': ORG_ID },
      publisher: { '@id': ORG_ID },
      inLanguage: 'en',
      articleSection: category.name,
    }),
    jsonLd({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Blog', item: ORIGIN + '/blog' },
        { '@type': 'ListItem', position: 2, name: category.name, item: `${ORIGIN}/blog/category/${category.slug}` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    }),
  ].join('\n');
}

function blogListLd(crumbs) {
  return jsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem', position: i + 1, name: c.name, item: ORIGIN + c.href,
    })),
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

/* Takes {kicker, heading, short} rather than a guide, so the site pages
   get real 1200x630 cards too. The home page and every router route used
   apple-touch-icon.png - a 180x180 app icon - which is why sharing the
   pricing page produced a thumbnail the size of a postage stamp. */
function ogSvg(card) {
  const kicker = card.kicker;
  const words = card.heading.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > 22) { lines.push(cur.trim()); cur = w; }
    else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());

  const sub = card.short;
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
<text x="1120" y="560" text-anchor="end" font-family="JetBrains Mono" font-size="20" fill="#ffffff" opacity="0.35">${esc(card.footer || 'atreoxai.com')}</text>
</svg>`;
}

async function buildOgImages(guides, moduleByKey, posts, categories, blogIndexCard) {
  let Resvg = null;
  try { ({ Resvg } = await import('@resvg/resvg-js')); }
  catch (_) {
    console.warn('[prerender] @resvg/resvg-js not available — og:image falls back to the site icon');
    return {};
  }

  const out = {};
  const render = (name, card) => {
    try {
      const png = new Resvg(ogSvg(card), {
        fitTo: { mode: 'width', value: 1200 },
        font: { loadSystemFonts: false, fontFiles: OG_FONTS, defaultFontFamily: 'Playfair Display' },
      }).render().asPng();
      write(`public/og/${name}.png`, png);
      out[name] = `${ORIGIN}/public/og/${name}.png`;
    } catch (e) {
      console.warn(`[prerender] og image for ${name} failed: ${e.message}`);
    }
  };

  for (const g of guides) {
    const mod = g.module ? moduleByKey[g.module] : null;
    render(g.url, {
      kicker: mod ? mod.name.toUpperCase() : 'BEFORE YOU START',
      heading: g.title, short: g.short, footer: 'atreoxai.com/guides',
    });
  }
  for (const page of [HOME_PAGE, ...SITE_PAGES]) {
    render(page.route === '/' ? 'home' : page.route.slice(1), page);
  }

  /* The blog's cards are keyed under blog/ rather than by bare slug.
     `out` is one flat map, so an article slugged the same as a guide's
     url would otherwise overwrite that guide's card - the two live at
     different addresses and could never collide as pages, which is
     exactly what makes the collision easy to miss. */
  render('blog', blogIndexCard);
  for (const c of categories) {
    render(`blog/category/${c.slug}`, {
      kicker: 'BLOG', heading: c.name, short: c.blurb.split('.')[0],
      footer: 'atreoxai.com/blog',
    });
  }
  for (const p of posts) {
    const cat = categories.find(c => c.slug === p.category);
    render(`blog/${p.slug}`, {
      kicker: cat ? cat.name.toUpperCase() : 'BLOG',
      heading: p.title, short: p.summary.split('.')[0],
      footer: 'atreoxai.com/blog',
    });
  }
  return out;
}

/* ── sitemap / robots ──────────────────────────────────────────── */
const STATIC_PAGES = [
  ['/', '1.0'],
  ['/functions', '0.9'],
  ['/pricing', '0.9'],
  ['/guides', '0.8'],
  /* A search-entry page for its own query ("telegram proxy checker"),
     which is why it sits above the referral page rather than with the
     legal tail. */
  ['/tools/proxy-checker', '0.8'],
  ['/referral-program', '0.5'],
  ['/contact', '0.4'],
  ['/privacy', '0.3'],
  ['/terms', '0.3'],
  ['/refund', '0.3'],
];

/* Every row carries the date its OWN content last changed, not the date
   of the build. That distinction is the whole point of resolveLastmod
   above: a sitemap claiming the entire site changed today, every day,
   teaches a crawler that lastmod means nothing on this domain — and the
   pages that lose most from being ignored are the newest ones, which is
   exactly the blog.

   Takes rows of [loc, priority, lastmod] rather than building them, so
   the three content types can each decide their own date: guides and
   router pages from the content hash, articles from what their author
   actually wrote. */
function sitemap(rows) {
  const body = rows.map(([loc, priority, lastmod]) =>
    `  <url>\n    <loc>${ORIGIN}${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body.join('\n')}\n</urlset>\n`;
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

const {
  GUIDES, MODULE_BY_KEY,
  POSTS, BLOG_CATEGORIES, TOOL_BY_ID, BLOCK_KINDS,
  postsForList, relatedPosts, formatPostDate, postWasUpdated,
} = loadCatalog();

/* The slug -> address map the legacy-anchor redirect in index.html
   uses, refreshed from the catalog so the two cannot drift. */
let shell = read('index.html');
const SLUG_MAP_RE = /\/\* SLUG-MAP \*\/[\s\S]*?\/\* \/SLUG-MAP \*\//;
if (!SLUG_MAP_RE.test(shell)) {
  throw new Error('index.html has no SLUG-MAP markers — the legacy #guide- redirect would go stale');
}
const slugMap = JSON.stringify(Object.fromEntries(GUIDES.map(g => [g.slug, g.url])));
shell = shell.replace(SLUG_MAP_RE, () => `/* SLUG-MAP */${slugMap}/* /SLUG-MAP */`);

if (!/<!-- HEAD:META -->[\s\S]*?<!-- \/HEAD:META -->/.test(shell)) {
  throw new Error('index.html has no HEAD:META markers — guide pages would ship the site-wide title');
}
if (!shell.includes('<div id="root"></div>')) {
  throw new Error('index.html has no <div id="root"></div> to prerender in front of');
}

const BLOG_CATEGORY_BY_SLUG = Object.fromEntries(BLOG_CATEGORIES.map(c => [c.slug, c]));
const ALL_POSTS = postsForList().items;

const BLOG_INDEX = {
  route: '/blog',
  title: 'Telegram automation blog — ATREOX',
  desc: 'Articles on running Telegram accounts at scale: buying and checking accounts, matching proxies, warming safely, and finding channels worth commenting in.',
  heading: 'Blog',
  lead: 'What we have learned running Telegram accounts at scale, written for the questions people actually search for.',
  kicker: 'BLOG',
  short: 'Written for the questions people search',
};

const ogImages = await buildOgImages(
  GUIDES, MODULE_BY_KEY, ALL_POSTS, BLOG_CATEGORIES, BLOG_INDEX,
);
const MODULES_LIST = Object.values(MODULE_BY_KEY);

const HEAD_RE = /<!-- HEAD:META -->[\s\S]*?<!-- \/HEAD:META -->/;

/* index.html is both the shell every other page is cut from and the home
   page itself, so its head is written last - after the shell has been used
   to stamp the others, and with the home page's own title rather than the
   one the shell happened to carry. */
write('index.html', shell.replace(HEAD_RE, () =>
  withLd(headForPage(HOME_PAGE, ogImages.home || OG_FALLBACK), orgAndSiteLd())));

for (const page of SITE_PAGES) {
  const name = page.route.slice(1);
  const extra = page.route === '/pricing' ? pricingLd(MODULES_LIST) : null;
  write(page.file, shell.replace(HEAD_RE, () =>
    withLd(headForPage(page, ogImages[name] || OG_FALLBACK), orgAndSiteLd(), extra)));
}

for (const guide of GUIDES) {
  const mod = guide.module ? MODULE_BY_KEY[guide.module] : null;
  const html = shell
    .replace(HEAD_RE, () => {
      const og = ogImages[guide.url] || OG_FALLBACK;
      return withLd(headFor(guide, mod, og), orgAndSiteLd(), guideLd(guide, og));
    })
    .replace('<div id="root"></div>',
      () => `${renderGuide(guide, GUIDES, mod)}\n  <div id="root"></div>`);
  write(`guides/${guide.url}.html`, html);
}

/* One page, same shell-swap trick as every guide above. */
{
  const html = shell
    .replace(HEAD_RE, () => withLd(headForReferral(), orgAndSiteLd()))
    .replace('<div id="root"></div>', () => `${renderReferral()}\n  <div id="root"></div>`);
  write('referral-program.html', html);
}

/* ── The blog's own pages ────────────────────────────────────────
   Three kinds, all cut from the same shell as everything else, each
   with its own head from metaBlock — which is what keeps the canonical
   honest. The bug this site already had (nine routes serving one head,
   all of them claiming to be "/") could only happen to a page that had
   no head of its own; every page below has one, and verify-seo.mjs
   asserts that for every generated file rather than trusting it.
─────────────────────────────────────────────────────────────────── */
/* /blog */
{
  const html = shell
    .replace(HEAD_RE, () => withLd(
      metaBlock({
        url: ORIGIN + '/blog',
        title: BLOG_INDEX.title, desc: BLOG_INDEX.desc,
        ogImage: ogImages['blog'] || OG_FALLBACK, type: 'website',
      }),
      orgAndSiteLd(),
      blogListLd([{ name: 'Blog', href: '/blog' }]),
    ))
    .replace('<div id="root"></div>', () => `${renderPostList({
      heading: BLOG_INDEX.heading,
      lead: BLOG_INDEX.lead,
      posts: ALL_POSTS,
      categoryBySlug: BLOG_CATEGORY_BY_SLUG,
      crumbs: [{ name: 'Blog', href: '/blog' }],
      categories: BLOG_CATEGORIES,
    })}\n  <div id="root"></div>`);
  write('blog.html', html);
}

/* /blog/category/<slug> */
for (const category of BLOG_CATEGORIES) {
  const crumbs = [
    { name: 'Blog', href: '/blog' },
    { name: category.name, href: `/blog/category/${category.slug}` },
  ];
  const html = shell
    .replace(HEAD_RE, () => withLd(
      metaBlock({
        url: `${ORIGIN}/blog/category/${category.slug}`,
        title: category.seoTitle || `${category.name} — ATREOX blog`,
        desc: category.seoDescription || category.blurb,
        ogImage: ogImages[`blog/category/${category.slug}`] || OG_FALLBACK,
        type: 'website',
      }),
      orgAndSiteLd(),
      blogListLd(crumbs),
    ))
    .replace('<div id="root"></div>', () => `${renderPostList({
      heading: category.name,
      lead: category.blurb,
      posts: postsForList({ category: category.slug }).items,
      categoryBySlug: BLOG_CATEGORY_BY_SLUG,
      crumbs,
      categories: BLOG_CATEGORIES,
    })}\n  <div id="root"></div>`);
  write(`blog/category/${category.slug}.html`, html);
}

/* /blog/<slug> */
for (const post of ALL_POSTS) {
  const category = BLOG_CATEGORY_BY_SLUG[post.category];
  const og = ogImages[`blog/${post.slug}`] || OG_FALLBACK;
  const html = shell
    .replace(HEAD_RE, () => withLd(
      metaBlock({
        url: `${ORIGIN}/blog/${post.slug}`,
        title: post.seoTitle || post.title,
        desc: post.seoDescription || post.summary,
        ogImage: og, type: 'article',
      }),
      orgAndSiteLd(),
      postLd(post, category, og),
    ))
    .replace('<div id="root"></div>',
      () => `${renderPost(post, category, relatedPosts(post))}\n  <div id="root"></div>`);
  write(`blog/${post.slug}.html`, html);
}

/* A post renamed in the catalog leaves its old file behind, and the
   deploy serves whatever is in the directory — so the address would go
   on answering with a page nothing links to any more. The guides have
   their own sweep over their own directory; these are separate on
   purpose, each with its own wanted-set, so neither can ever delete the
   other's pages. */
const wantedPosts = new Set(ALL_POSTS.map(p => p.slug + '.html'));
for (const f of fs.readdirSync(path.join(ROOT, 'blog'))) {
  if (f.endsWith('.html') && !wantedPosts.has(f)) {
    fs.unlinkSync(path.join(ROOT, 'blog', f));
    console.log(`[prerender] removed stale blog/${f}`);
  }
}
const wantedCategories = new Set(BLOG_CATEGORIES.map(c => c.slug + '.html'));
for (const f of fs.readdirSync(path.join(ROOT, 'blog', 'category'))) {
  if (f.endsWith('.html') && !wantedCategories.has(f)) {
    fs.unlinkSync(path.join(ROOT, 'blog', 'category', f));
    console.log(`[prerender] removed stale blog/category/${f}`);
  }
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

/* ── lastmod, resolved once for everything the build owns ────────── */
const TODAY = new Date().toISOString().slice(0, 10);

/* The shell, minus the two regions this build rewrites on every run.
   Without stripping them the shell's hash would change every time the
   catalog did, and every router page would claim to have changed with
   it — the same "everything moved today" noise, one level down. */
const SHELL_FINGERPRINT = contentHash(
  read('index.html')
    .replace(SLUG_MAP_RE, '')
    .replace(HEAD_RE, ''),
);

const { dates: LASTMOD, changed: CONTENT_CHANGED } = resolveLastmod([
  /* A router page's served HTML is its head plus the shell; its body is
     React and not something this build can hash. So the hash covers
     what the build DOES own, and a shell change legitimately moves all
     of them — the bytes those addresses serve really did change. */
  ...[HOME_PAGE, ...SITE_PAGES].map(page =>
    [`page:${page.route}`, { page, shell: SHELL_FINGERPRINT }]),
  ['page:/referral-program', { page: 'referral', shell: SHELL_FINGERPRINT }],
  ['page:/blog', { posts: ALL_POSTS.map(p => p.slug), shell: SHELL_FINGERPRINT }],
  ...BLOG_CATEGORIES.map(c => [`blogcat:${c.slug}`, {
    category: c,
    posts: postsForList({ category: c.slug }).items.map(p => p.slug),
    shell: SHELL_FINGERPRINT,
  }]),
  ...GUIDES.map(g => [`guide:${g.url}`, g]),
  /* Articles are hashed too, but NOT to date them — their dates are
     editorial and belong to the author. This is only so the warning
     below can fire. */
  ...ALL_POSTS.map(p => [`post:${p.slug}`, p]),
], TODAY);

/* An article whose text changed while its `updated` field did not. Not
   an error: the author may be fixing a typo, and forcing a date bump
   for that would make `updated` meaningless in the other direction. But
   it is the one case where an author-controlled date starts lying
   silently, so it is said out loud once per build. */
for (const post of ALL_POSTS) {
  if (CONTENT_CHANGED.has(`post:${post.slug}`) && post.updated !== TODAY) {
    console.warn(
      `[prerender] "${post.slug}" changed but its updated date is ` +
      `${post.updated || '(unset)'} — set updated: '${TODAY}' if this was a revision`,
    );
  }
}

const postLastmod = p => p.updated || p.published;

write('sitemap.xml', sitemap([
  ...STATIC_PAGES.map(([loc, priority]) => [loc, priority, LASTMOD[`page:${loc}`] || TODAY]),
  ['/blog', '0.8', LASTMOD['page:/blog']],
  ...BLOG_CATEGORIES.map(c => [`/blog/category/${c.slug}`, '0.5', LASTMOD[`blogcat:${c.slug}`]]),
  ...ALL_POSTS.map(p => [`/blog/${p.slug}`, '0.7', postLastmod(p)]),
  ...GUIDES.map(g => [`/guides/${g.url}`, '0.7', LASTMOD[`guide:${g.url}`]]),
]));
write('robots.txt', robots());

console.log(`[prerender] ${GUIDES.length} guide pages, ${ALL_POSTS.length} article(s), ${BLOG_CATEGORIES.length} category page(s), 1 referral page, sitemap.xml, robots.txt`);
for (const g of GUIDES) console.log(`  /guides/${g.url}`);
console.log('  /referral-program');
