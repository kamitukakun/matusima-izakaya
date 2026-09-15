/* 凪火 — 暗闇から浮かび上がるリビール + ページ遷移の暗転 */
(function () {
  if (window.__nagibi) return;
  window.__nagibi = true;

  var seen = new WeakSet();
  function mode() { return window.__nagibiMotion || 'full'; }
  function reduced() {
    return mode() === 'off' ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function show(el) { el.style.opacity = '1'; el.style.transform = 'none'; }

  var io = null;
  function ensureIO() {
    if (io || reduced() || !('IntersectionObserver' in window)) return io;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var d = mode() === 'calm' ? 0 : parseInt(e.target.getAttribute('data-delay') || '0', 10);
        setTimeout(function () { show(e.target); }, d);
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    return io;
  }

  function scan() {
    var obs = ensureIO();
    var nodes = document.querySelectorAll('[data-reveal]');
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (seen.has(el)) continue;
      seen.add(el);
      if (obs) obs.observe(el); else show(el);
    }
  }

  function fallback() {
    var nodes = document.querySelectorAll('[data-reveal]');
    for (var i = 0; i < nodes.length; i++) {
      var r = nodes[i].getBoundingClientRect();
      if (r.top < (window.innerHeight || 800) * 1.2) show(nodes[i]);
    }
  }

  var overlay = null;
  function ensureOverlay() {
    if (overlay || !document.body) return overlay;
    overlay = document.createElement('div');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;background:#0a0908;opacity:0;pointer-events:none;transition:opacity .42s ease;z-index:9999';
    document.body.appendChild(overlay);
    return overlay;
  }

  function onClick(e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || a.target === '_blank') return;
    var href = a.getAttribute('href') || '';
    if (!/\.html(#.*)?$/.test(href)) return;
    if (reduced()) return;
    var ov = ensureOverlay();
    if (!ov) return;
    e.preventDefault();
    ov.style.opacity = '1';
    setTimeout(function () { window.location.href = a.href; }, 400);
  }

  function start() {
    scan();
    new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener('click', onClick, true);
    setTimeout(fallback, 2500);
    window.addEventListener('load', function () { setTimeout(fallback, 400); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
    setTimeout(start, 300);
  } else {
    start();
  }
})();

/* ハンバーガーメニュー（スマホ幅・ドロワー） */
(function () {
  function init() {
    var btn = document.getElementById('nav-toggle-btn');
    var drawer = document.getElementById('site-nav-drawer');
    if (!btn || !drawer) return;

    var label = btn.querySelector('span');
    var bars = btn.querySelectorAll('span[aria-hidden] > span');

    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      drawer.setAttribute('aria-hidden', String(!open));
      drawer.style.maxHeight = open ? '520px' : '0px';
      drawer.style.opacity = open ? '1' : '0';
      if (label) label.textContent = open ? 'CLOSE' : 'MENU';
      if (bars.length === 3) {
        bars[0].style.transform = open ? 'translateY(6.5px) rotate(45deg)' : 'none';
        bars[1].style.opacity = open ? '0' : '1';
        bars[2].style.transform = open ? 'translateY(-6.5px) rotate(-45deg)' : 'none';
      }
    }

    btn.addEventListener('click', function () {
      setOpen(btn.getAttribute('aria-expanded') !== 'true');
    });
    drawer.addEventListener('click', function (e) {
      if (e.target && e.target.closest && e.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 640) setOpen(false);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
