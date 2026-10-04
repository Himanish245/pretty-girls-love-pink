/* Pretty Girls Love Pink — interactions.
 * Pure helpers are exposed on `PGLP` (and module.exports) so they can be unit-tested.
 * The DOM layer is cosmetic only: if Spicetify/document are missing it silently no-ops.
 */
(function (root) {
  'use strict';

  var MAX_PARTICLES = 30;
  var STORAGE_KEY = 'pglp-effects';
  var QUOTES = [
    "buy me books & tell me I'm pretty",
    'pretty girls love pink!',
    'hot girls read books',
    'in my romance era',
    'enemies to lovers, obviously',
    'swear to love you more than anything'
  ];

  /* ------------------------- pure helpers ------------------------- */

  function clampParticles(live, requested, max) {
    var cap = (typeof max === 'number') ? max : MAX_PARTICLES;
    return Math.max(0, Math.min(requested, cap - live));
  }

  function repel(sticker, cursor, radius) {
    var r = (typeof radius === 'number') ? radius : 140;
    var vx = sticker.x - cursor.x;
    var vy = sticker.y - cursor.y;
    var dist = Math.sqrt(vx * vx + vy * vy);
    if (dist >= r) return { dx: 0, dy: 0 };
    var push = (r - dist) / r * 60; // up to 60px nudge
    if (dist === 0) return { dx: push, dy: 0 };
    return { dx: vx / dist * push, dy: vy / dist * push };
  }

  function loadEffectsEnabled(storage) {
    try {
      if (!storage) return true;
      return storage.getItem(STORAGE_KEY) !== 'off';
    } catch (e) {
      return true;
    }
  }

  function saveEffectsEnabled(storage, on) {
    try { if (storage) storage.setItem(STORAGE_KEY, on ? 'on' : 'off'); } catch (e) { /* ignore */ }
  }

  function pickQuote(index) {
    var n = QUOTES.length;
    return QUOTES[((index % n) + n) % n];
  }

  /* --------------------------- DOM layer --------------------------- */

  var ICONS = {
    heart: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 90'%3E%3Cpath d='M50 84C10 56 2 36 2 24 2 10 13 2 26 2c12 0 20 7 24 16C54 9 62 2 74 2c13 0 24 8 24 22 0 12-8 32-48 60Z' fill='%23E8467C' stroke='%23fff' stroke-width='4'/%3E%3C/svg%3E",
    cherry: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 4C40 30 28 52 24 66M50 4c8 26 20 48 24 62' fill='none' stroke='%233E7B3A' stroke-width='4' stroke-linecap='round'/%3E%3Ccircle cx='24' cy='76' r='20' fill='%23B3122E' stroke='%23fff' stroke-width='3'/%3E%3Ccircle cx='74' cy='76' r='20' fill='%23C81A38' stroke='%23fff' stroke-width='3'/%3E%3C/svg%3E",
    bow: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 80'%3E%3Cpath d='M60 40C40 6 6 2 6 26c0 24 30 28 54 14Z' fill='%23B3122E' stroke='%23fff' stroke-width='3'/%3E%3Cpath d='M60 40C80 6 114 2 114 26c0 24-30 28-54 14Z' fill='%23B3122E' stroke='%23fff' stroke-width='3'/%3E%3Crect x='48' y='30' width='24' height='22' rx='8' fill='%23E8467C' stroke='%23fff' stroke-width='3'/%3E%3C/svg%3E"
  };
  var ICON_LIST = [ICONS.heart, ICONS.cherry, ICONS.bow];

  var state = { enabled: true, reduced: false, live: 0, stickers: [], quoteIdx: 0, tries: 0 };

  function hasDom() { return typeof document !== 'undefined' && document.body; }

  function el(tag, cls) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  }

  function motionOk() { return state.enabled && !state.reduced; }

  function burst(x, y, count) {
    if (!motionOk()) return;
    var n = clampParticles(state.live, count || 14);
    for (var i = 0; i < n; i++) {
      var p = el('div', 'pglp-burst');
      var angle = Math.random() * Math.PI * 2;
      var dist = 60 + Math.random() * 110;
      p.style.left = (x - 14) + 'px';
      p.style.top = (y - 14) + 'px';
      p.style.backgroundImage = 'url("' + ICON_LIST[i % ICON_LIST.length] + '")';
      p.style.setProperty('--bx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--by', Math.sin(angle) * dist - 40 + 'px');
      p.style.setProperty('--br', (Math.random() * 360 - 180) + 'deg');
      state.live++;
      document.body.appendChild(p);
      (function (node) {
        setTimeout(function () {
          if (node.parentNode) node.parentNode.removeChild(node);
          state.live = Math.max(0, state.live - 1);
        }, 1000);
      })(p);
    }
  }

  function bigHeart(x, y) {
    if (!motionOk()) return;
    var h = el('div', 'pglp-heart-big');
    h.style.left = x + 'px';
    h.style.top = y + 'px';
    document.body.appendChild(h);
    setTimeout(function () { if (h.parentNode) h.parentNode.removeChild(h); }, 1400);
  }

  function centerOf(node) {
    var r = node.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function wobble(node) {
    if (!motionOk() || !node) return;
    node.classList.remove('pglp-wobble');
    void node.offsetWidth; // restart animation
    node.classList.add('pglp-wobble');
  }

  function playButton() {
    return document.querySelector('[data-testid="control-button-playpause"]');
  }

  function onPlayState() {
    var btn = playButton();
    if (!btn) return;
    wobble(btn);
    var playing = root.Spicetify && root.Spicetify.Player && root.Spicetify.Player.isPlaying
      ? root.Spicetify.Player.isPlaying() : true;
    if (playing) { var c = centerOf(btn); burst(c.x, c.y, 16); }
  }

  function onSongChange() {
    var btn = playButton();
    if (!btn) return;
    var c = centerOf(btn);
    burst(c.x, c.y, 8);
  }

  var LIKE_SELECTOR = '[data-testid="add-button"], button[aria-label*="Save to"], button[aria-label*="Add to Liked"], button[aria-label*="Like"], .control-button-heart';

  function onClick(ev) {
    var t = ev.target && ev.target.closest ? ev.target.closest(LIKE_SELECTOR) : null;
    if (!t) return;
    // Only celebrate when it is about to become liked (aria-checked false) or state is unknown.
    var checked = t.getAttribute('aria-checked');
    if (checked === 'true') return;
    var c = centerOf(t);
    bigHeart(c.x, c.y);
    burst(c.x, c.y, 10);
  }

  function onCardMove(ev) {
    if (!motionOk() || !ev.target || !ev.target.closest) return;
    var card = ev.target.closest('.main-card-card');
    if (!card) return;
    var r = card.getBoundingClientRect();
    var t = ((ev.clientX - r.left) / r.width - 0.5) * 6; // -3deg .. 3deg
    card.style.setProperty('--pglp-tilt', t.toFixed(2) + 'deg');
  }

  function onCardLeave(ev) {
    if (!ev.target || !ev.target.closest) return;
    var card = ev.target.closest('.main-card-card');
    if (card && !card.contains(ev.relatedTarget)) card.style.removeProperty('--pglp-tilt');
  }

  /* ---- background sticker layer ---- */
  var layer = null;

  function layoutStickers() {
    var w = window.innerWidth, h = window.innerHeight;
    state.stickers.forEach(function (s) {
      s.x = Math.min(Math.max(s.fx * w, 8), Math.max(8, w - 64));
      s.y = Math.min(Math.max(s.fy * h, 8), Math.max(8, h - 64));
      s.node.style.left = s.x + 'px';
      s.node.style.top = s.y + 'px';
    });
  }

  function buildStickers() {
    layer = el('div', 'pglp-sticker-layer');
    var spots = [[.02, .12], [.95, .10], [.03, .62], [.94, .55], [.50, .03], [.88, .82], [.12, .88], [.70, .90]];
    spots.forEach(function (sp, i) {
      var n = el('div', 'pglp-sticker');
      n.style.backgroundImage = 'url("' + ICON_LIST[i % ICON_LIST.length] + '")';
      n.style.rotate = (i % 2 ? 1 : -1) * (8 + i * 3) + 'deg';
      layer.appendChild(n);
      state.stickers.push({ node: n, fx: sp[0], fy: sp[1], x: 0, y: 0 });
    });
    document.body.appendChild(layer);
    layoutStickers();
  }

  var rafPending = false, lastCursor = null;
  function onMouseMove(ev) {
    if (!motionOk()) return;
    lastCursor = { x: ev.clientX, y: ev.clientY };
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      state.stickers.forEach(function (s) {
        var d = repel({ x: s.x + 28, y: s.y + 28 }, lastCursor);
        s.node.style.transform = 'translate(' + d.dx + 'px,' + d.dy + 'px)';
      });
    });
  }

  /* ---- quotes ---- */
  var EMPTY_SELECTOR = '[data-testid="empty-state"], [data-testid="search-no-results"], .x-searchEmpty';

  function ensureQuotes() {
    var sidebar = document.querySelector('.Root__nav-bar, .main-navBar-navBar');
    if (sidebar && !sidebar.querySelector('.pglp-quote')) {
      var q = el('span', 'pglp-quote');
      q.textContent = pickQuote(state.quoteIdx);
      sidebar.appendChild(q);
    }
    var empties = document.querySelectorAll(EMPTY_SELECTOR);
    Array.prototype.forEach.call(empties, function (e) {
      if (!e.querySelector('.pglp-quote')) {
        var q2 = el('span', 'pglp-quote');
        q2.textContent = pickQuote(state.quoteIdx + 1);
        e.appendChild(q2);
      }
    });
  }

  function rotateQuotes() {
    state.quoteIdx++;
    var all = document.querySelectorAll('.pglp-quote');
    Array.prototype.forEach.call(all, function (q, i) { q.textContent = pickQuote(state.quoteIdx + i); });
  }

  /* ---- toggle ---- */
  function applyEnabled() {
    document.body.classList.toggle('pglp-effects-off', !state.enabled);
    var b = document.querySelector('.pglp-toggle');
    if (b) b.setAttribute('aria-pressed', String(state.enabled));
  }

  function buildToggle(storage) {
    var b = el('button', 'pglp-toggle');
    b.type = 'button';
    b.title = 'Toggle sparkle effects';
    b.setAttribute('aria-label', 'Toggle sparkle effects');
    b.textContent = '\u2665';
    b.addEventListener('click', function () {
      state.enabled = !state.enabled;
      saveEffectsEnabled(storage, state.enabled);
      applyEnabled();
    });
    document.body.appendChild(b);
  }

  /* ---- bootstrap ---- */
  function start() {
    var storage;
    try { storage = root.localStorage; } catch (e) { storage = undefined; }
    state.enabled = loadEffectsEnabled(storage);
    state.reduced = !!(root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches);

    buildStickers();
    buildToggle(storage);
    applyEnabled();
    ensureQuotes();

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mousemove', onCardMove, { passive: true });
    document.addEventListener('mouseout', onCardLeave, { passive: true });
    document.addEventListener('click', onClick, true);
    root.addEventListener('resize', layoutStickers);

    var P = root.Spicetify.Player;
    P.addEventListener('onplaypause', onPlayState);
    P.addEventListener('songchange', onSongChange);

    if (root.MutationObserver) {
      var pending = false;
      new MutationObserver(function () {
        if (pending) return;
        pending = true;
        setTimeout(function () { pending = false; ensureQuotes(); }, 400);
      }).observe(document.body, { childList: true, subtree: true });
    }
    setInterval(rotateQuotes, 9000);
  }

  function init() {
    if (!hasDom()) return; // not in a browser (e.g. unit tests): no-op
    var ready = root.Spicetify && root.Spicetify.Player && root.Spicetify.Player.addEventListener;
    if (!ready) {
      if (state.tries++ < 20) setTimeout(init, 500);
      return;
    }
    try { start(); } catch (e) { /* cosmetic only: never break Spotify */ }
  }

  var PGLP = {
    clampParticles: clampParticles,
    repel: repel,
    loadEffectsEnabled: loadEffectsEnabled,
    pickQuote: pickQuote,
    init: init
  };
  root.PGLP = PGLP;
  if (typeof module !== 'undefined' && module.exports) module.exports = PGLP;

  if (hasDom()) init();
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
