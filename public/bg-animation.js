(function () {
  'use strict';
  var PALETTES = {
    'blue-violet':  { b1: '#3b4ef7', b2: '#7c3aed', b3: '#4f46e5', op: 0.16 },
    'teal-violet':  { b1: '#0d9488', b2: '#4f46e5', b3: '#7c3aed', op: 0.15 },
    'deep-violet':  { b1: '#6d28d9', b2: '#4338ca', b3: '#7c3aed', op: 0.16 },
    'blue-rose':    { b1: '#1e40af', b2: '#9f1239', b3: '#6d28d9', op: 0.15 },
    'rose-violet':  { b1: '#9f1239', b2: '#6d28d9', b3: '#1e40af', op: 0.14 },
    'sky-blue':     { b1: '#0369a1', b2: '#1d4ed8', b3: '#4338ca', op: 0.14 },
    'indigo':       { b1: '#1e1b4b', b2: '#4c1d95', b3: '#1e3a8a', op: 0.18 },
    'forest-green': { b1: '#166534', b2: '#0d9488', b3: '#14532d', op: 0.16 },
    'crimson':      { b1: '#991b1b', b2: '#7c2d12', b3: '#6d28d9', op: 0.15 },
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

  window.__bgRefresh = refresh;
  window.__bgApply = applyPalette;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
