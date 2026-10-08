/* site.mjs — the public address of the marketing site, in one place.

   Read by prerender.mjs (canonicals, og:url/og:image, JSON-LD, the
   sitemap, robots.txt, the OG card footers) and by verify-seo.mjs
   (which asserts every generated page agrees with it). One definition,
   so the build and the check cannot disagree about which host is real.

   ORIGIN is the host that answers 200. Vercel has www as the project's
   primary domain, so the apex redirects to it — and a canonical, an
   og:url or a sitemap entry pointing at a redirect is a worse signal
   than one pointing at the page. If the apex is ever made primary
   instead, ORIGIN is the only line that has to change.

   2026-10: the site moved from www.atreoxai.com to www.atreox.ai. The
   old host 308s to the new one at the Vercel domain level (path kept),
   so nothing in this repository redirects it. The dashboard, the API,
   the engine and the mailbox stay on atreoxai.com for now —
   app./api./brain.atreoxai.com and hello@atreoxai.com are NOT this
   site's address and must not be rewritten to this one. */

export const ORIGIN = 'https://www.atreox.ai';

/* How the address is written where a human reads it (the OG cards). */
export const DISPLAY_HOST = 'atreox.ai';

/* The site's previous addresses. Nothing generated may still call itself
   by one of these; verify-seo.mjs fails the build if a page does. Bare
   origins only — app.atreoxai.com and friends are other services and are
   matched by neither (the check anchors on the end of the host). */
export const RETIRED_ORIGINS = ['https://www.atreoxai.com', 'https://atreoxai.com'];
