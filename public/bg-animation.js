(function () {
  'use strict';
  /* Technical backdrop: blueprint grid + glows + scanline + grain (pure CSS,
     see bg-animation.css) plus an interactive layer built here:
       #bg-particles  — canvas constellation of drifting data-nodes whose
                        links brighten and bend around the cursor
     Keeps the __bgRefresh/__bgApply API that BgColorSystem (shared.jsx)
     calls on page change, so the router integration stays untouched. */

  var ACCENT_RGB = '0,217,255';
  var REDUCED = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var engineStarted = false;

  function ensureDOM() {
    if (document.getElementById('tech-bg')) return;
    var wrap = document.createElement('div');
    wrap.id = 'tech-bg';
    wrap.setAttribute('aria-hidden', 'true');
    ['bg-grid', 'bg-glow-1', 'bg-glow-2'].forEach(function (id) {
      var el = document.createElement('div');
      el.id = id;
      wrap.appendChild(el);
    });
    var canvas = document.createElement('canvas');
    canvas.id = 'bg-particles';
    wrap.appendChild(canvas);
    ['bg-scan', 'bg-noise'].forEach(function (id) {
      var el = document.createElement('div');
      el.id = id;
      wrap.appendChild(el);
    });
    document.body.insertBefore(wrap, document.body.firstChild);
    if (!engineStarted) { engineStarted = true; startEngine(canvas); }
  }

  function startEngine(canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var isMobile = window.innerWidth < 768;
    var COUNT = isMobile ? 34 : 70;
    var LINK = isMobile ? 110 : 140;
    var MOUSE_LINK = 190;   /* px — cursor links to nearby nodes */
    var REPEL = 120;        /* px — cursor gently pushes nodes */
    var MAX_SPEED = 0.5;

    var W = 0, H = 0;
    var pts = [];
    var mouse = { x: -9999, y: -9999 };
    var raf = 0;

    function resize() {
      var prevW = W, prevH = H;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * DPR);
      canvas.height = Math.round(H * DPR);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      if (!pts.length || prevW < 100 || prevH < 100) {
        /* first run, or the window was degenerate (e.g. loaded hidden):
           distribute fresh across the real viewport */
        spawn();
        mouse.x = W / 2; mouse.y = H * 0.35;
      } else {
        /* keep existing nodes on screen after a normal resize */
        for (var i = 0; i < pts.length; i++) {
          if (pts[i].x > W) pts[i].x = Math.random() * W;
          if (pts[i].y > H) pts[i].y = Math.random() * H;
        }
      }
    }

    function spawn() {
      pts = [];
      for (var i = 0; i < COUNT; i++) {
        pts.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.24,
          vy: (Math.random() - 0.5) * 0.24,
          r: Math.random() * 1.3 + 0.7,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      var t = now / 1000;
      ctx.clearRect(0, 0, W, H);

      var i, j, p, q, dx, dy, d;

      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        /* cursor repulsion — a gentle push, damped so it never explodes */
        dx = p.x - mouse.x; dy = p.y - mouse.y;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < REPEL && d > 0.001) {
          var f = (1 - d / REPEL) * 0.035;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx *= 0.985; p.vy *= 0.985;
        var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (sp > MAX_SPEED) { p.vx = (p.vx / sp) * MAX_SPEED; p.vy = (p.vy / sp) * MAX_SPEED; }
        if (sp < 0.05) { p.vx += (Math.random() - 0.5) * 0.02; p.vy += (Math.random() - 0.5) * 0.02; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
      }

      /* node-to-node links */
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        for (j = i + 1; j < pts.length; j++) {
          q = pts[j];
          dx = p.x - q.x; dy = p.y - q.y;
          if (Math.abs(dx) > LINK || Math.abs(dy) > LINK) continue;
          d = Math.sqrt(dx * dx + dy * dy);
          if (d > LINK) continue;
          ctx.strokeStyle = 'rgba(' + ACCENT_RGB + ',' + ((1 - d / LINK) * 0.16).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      /* cursor-to-node links — brighter, makes the field feel alive */
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        dx = p.x - mouse.x; dy = p.y - mouse.y;
        d = Math.sqrt(dx * dx + dy * dy);
        if (d < MOUSE_LINK) {
          ctx.strokeStyle = 'rgba(' + ACCENT_RGB + ',' + ((1 - d / MOUSE_LINK) * 0.32).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      /* nodes — slow twinkle via per-particle phase */
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        var a = 0.45 + Math.sin(t * 0.9 + p.phase) * 0.25;
        ctx.fillStyle = 'rgba(' + ACCENT_RGB + ',' + a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function staticFrame() {
      /* reduced motion: one calm, motionless constellation */
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d > LINK) continue;
          ctx.strokeStyle = 'rgba(' + ACCENT_RGB + ',' + ((1 - d / LINK) * 0.14).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(' + ACCENT_RGB + ',0.5)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    resize();
    window.addEventListener('resize', function () { resize(); if (REDUCED) staticFrame(); });

    if (REDUCED) { staticFrame(); return; }

    window.addEventListener('mousemove', function (e) {
      mouse.x = e.clientX; mouse.y = e.clientY;
    }, { passive: true });
    window.addEventListener('mouseout', function (e) {
      if (!e.relatedTarget) { mouse.x = W / 2; mouse.y = H * 0.35; }
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else {
        if (canvas.width === 0) resize(); /* window became real while we slept */
        if (!raf) raf = requestAnimationFrame(frame);
      }
    });

    raf = requestAnimationFrame(frame);
  }

  window.__bgRefresh = ensureDOM;
  window.__bgApply = function () {};

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ensureDOM);
  } else {
    ensureDOM();
  }
})();
