/* ──────────────────────────────────────────────────────────
   CASA · WARM HIGH-TECH — motion layer
   - injects ambient aura + grid
   - reveals .reveal elements on scroll
   - subtle pointer parallax on the ambient light
   Opt-in: pages with <body class="tech"> and this script loaded.
   ────────────────────────────────────────────────────────── */
(function () {
  if (!document.body || !document.body.classList.contains('tech')) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Ambient background layers (once) */
  if (!document.querySelector('.casa-aura')) {
    var aura = document.createElement('div'); aura.className = 'casa-aura';
    var grid = document.createElement('div'); grid.className = 'casa-grid';
    document.body.insertBefore(grid, document.body.firstChild);
    document.body.insertBefore(aura, document.body.firstChild);

    if (!reduce) {
      window.addEventListener('pointermove', function (e) {
        var x = (e.clientX / window.innerWidth - 0.5) * 12;
        var y = (e.clientY / window.innerHeight - 0.5) * 12;
        aura.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      }, { passive: true });
    }
  }

  /* Reveal on scroll.
     Deliberately scroll-based, not IntersectionObserver: scroll/resize events
     fire reliably in every browser and rendering context, so content can never
     get stuck hidden if IO fails to deliver. If motion is reduced, reveal all. */
  if (reduce) {
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); });
    window.casaTechScan = function () {};
    return;
  }

  function revealInView() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var pending = document.querySelectorAll('.reveal:not(.in)');
    pending.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < vh - 40 && r.bottom > 0) el.classList.add('in');
    });
  }

  revealInView();                                              // in-view on load
  window.addEventListener('scroll', revealInView, { passive: true });
  window.addEventListener('resize', revealInView, { passive: true });
  /* Re-scan after dynamic content is injected (browse/feed render via JS) */
  window.casaTechScan = revealInView;
  /* Absolute fail-safe: never leave anything hidden */
  setTimeout(function () {
    document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { el.classList.add('in'); });
  }, 4000);
})();
