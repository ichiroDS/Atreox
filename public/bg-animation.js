(function () {
  'use strict';
  /* Static technical backdrop (grid + glows + scanline + grain).
     Layers are pure CSS — see bg-animation.css. This file only builds the DOM
     and keeps the __bgRefresh/__bgApply API that BgColorSystem (shared.jsx)
     calls on page change, so the router integration stays untouched. */

  function ensureDOM() {
    if (document.getElementById('tech-bg')) return;
    var wrap = document.createElement('div');
    wrap.id = 'tech-bg';
    wrap.setAttribute('aria-hidden', 'true');
    ['bg-grid', 'bg-glow-1', 'bg-glow-2', 'bg-scan', 'bg-noise'].forEach(function (id) {
      var el = document.createElement('div');
      el.id = id;
      wrap.appendChild(el);
    });
    document.body.insertBefore(wrap, document.body.firstChild);
  }

  window.__bgRefresh = ensureDOM;
  window.__bgApply = function () {};

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureDOM);
  } else {
    ensureDOM();
  }
})();
