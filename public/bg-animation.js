(function () {
  'use strict';
  var PALETTES = {
    'blue-violet':  { b1: '#00e676', b2: '#00bfa5', b3: '#00c853', op: 0.16 },
    'teal-violet':  { b1: '#00bfa5', b2: '#1de9b6', b3: '#00897b', op: 0.15 },
    'deep-violet':  { b1: '#00695c', b2: '#00c853', b3: '#1de9b6', op: 0.16 },
    'blue-rose':    { b1: '#00e676', b2: '#2e7d32', b3: '#00bfa5', op: 0.15 },
    'rose-violet':  { b1: '#2e7d32', b2: '#00bfa5', b3: '#00e676', op: 0.14 },
    'sky-blue':     { b1: '#1de9b6', b2: '#00c853', b3: '#00695c', op: 0.14 },
    'indigo':       { b1: '#00332b', b2: '#00695c', b3: '#004d40', op: 0.18 },
    'forest-green': { b1: '#166534', b2: '#00bfa5', b3: '#14532d', op: 0.16 },
    'crimson':      { b1: '#00c853', b2: '#1b5e20', b3: '#00bfa5', op: 0.15 },
  };
  var obs = null, obsTimer = null;

  function ensureDOM() {
    if (document.getElementById('animated-bg')) return;
    var wrap = document.createElement('div');
    wrap.id = 'animated-bg';
    wrap.setAttribute('aria-hidden', 'true');
    for (var i = 1; i <= 3; i++) {
      var blob = document.createElement('div');
      blob.id = 'bg-blob-' + i;
      blob.className = 'bg-blob';
      wrap.appendChild(blob);
    }
    document.body.insertBefore(wrap, document.body.firstChild);
  }

  function applyPalette(name) {
    var p = PALETTES[name] || PALETTES['blue-violet'];
    var b1 = document.getElementById('bg-blob-1');
    var b2 = document.getElementById('bg-blob-2');
    var b3 = document.getElementById('bg-blob-3');
    if (!b1) return;
    b1.style.backgroundColor = p.b1; b1.style.opacity = p.op;
    b2.style.backgroundColor = p.b2; b2.style.opacity = p.op;
    b3.style.backgroundColor = p.b3; b3.style.opacity = +(p.op * 0.7).toFixed(3);
  }

  function startObserver() {
    if (obs) { obs.disconnect(); obs = null; }
    obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && e.target.dataset && e.target.dataset.bgPalette) {
          applyPalette(e.target.dataset.bgPalette);
        }
      });
    }, { threshold: 0.25 });
    document.querySelectorAll('[data-bg-palette]').forEach(function (el) { obs.observe(el); });
  }

  function refresh() {
    ensureDOM();
    applyPalette('blue-violet');
    if (obs) { obs.disconnect(); obs = null; }
    clearTimeout(obsTimer);
    obsTimer = setTimeout(startObserver, 400);
  }

  function init() {
    ensureDOM();
    applyPalette('blue-violet');
    startObserver();
  }
  // NOTE: palette keys (e.g. 'blue-violet') are historical labels wired to
  // section data-bg-palette attributes across the JSX files — only the hex
  // values were recolored to green, renaming the keys would require touching
  // every section that references them.

  window.__bgRefresh = refresh;
  window.__bgApply = applyPalette;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
