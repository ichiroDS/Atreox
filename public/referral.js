/* ── Referral capture ──────────────────────────────────────────────
   atreoxai.com/?ref=CODE -> localStorage (90 days) -> every CTA that
   points at app.atreoxai.com carries the code forward as ?ref=CODE.

   This is the marketing-site half of the handoff. It does no validation
   and shows the visitor nothing — the dashboard's own middleware
   (atreox-dashboard: middleware.ts) is what checks the code against
   Redis, sets its own cookie, and counts the click, once the visitor
   actually lands there. This script's only job is not losing the code
   between "clicked a partner link" and "clicked Enter panel", which can
   be days apart.

   Plain JS, no dependencies, loaded before the Babel/React app scripts
   so window.withReferral exists by the time any CTA renders.
── */
(function () {
  var STORAGE_KEY = 'atreox_ref';
  var MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

  function readStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed.code !== 'string' || typeof parsed.exp !== 'number') return null;
      if (Date.now() > parsed.exp) { localStorage.removeItem(STORAGE_KEY); return null; }
      return parsed.code;
    } catch (_) {
      return null;
    }
  }

  function store(code) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ code: code, exp: Date.now() + MAX_AGE_MS }));
    } catch (_) {
      /* localStorage unavailable (private mode, quota, disabled) —
         attribution is best-effort and never worth breaking the page over */
    }
  }

  function captureFromUrl() {
    var params = new URLSearchParams(location.search);
    var raw = params.get('ref');
    if (!raw) return;

    // First source wins: an already-stored (and still valid) code is never
    // overwritten by a second link.
    if (!readStored()) {
      var trimmed = raw.trim();
      if (trimmed) store(trimmed);
    }

    // Clean redirect: drop only `ref`, keep every other param, the path and
    // the hash exactly as they were — app.jsx's own routing (PATH_TO_PAGE,
    // the legacy ?p= handling) runs after this and is untouched by it.
    params.delete('ref');
    var qs = params.toString();
    var cleanUrl = location.pathname + (qs ? '?' + qs : '') + location.hash;
    history.replaceState(history.state, '', cleanUrl);
  }

  captureFromUrl();

  /* Appends the remembered code to a URL as ?ref=CODE (&ref=CODE if the URL
     already carries a query string). Returns the URL unchanged — no empty
     ?ref= param, ever — when nothing is stored. */
  window.withReferral = function (url) {
    var code = readStored();
    if (!code) return url;
    var sep = url.indexOf('?') > -1 ? '&' : '?';
    return url + sep + 'ref=' + encodeURIComponent(code);
  };
})();
