/* ─────────────────────────────────────────────
   Atrium — bt-reveal.js
   Scroll-reveal motion kit. IntersectionObserver
   adds .is-revealed to [data-bt-reveal] elements;
   all animation is CSS transition (opacity/transform
   only, see base.css "Scroll reveal" block).

   Degradation contract:
   • No JS            → hidden state never applies
     (it is gated behind html.bt-reveal-armed, which
     only this file sets). Content fully visible.
   • No IO support    → this file bails before arming.
   • Reduced motion   → this file bails before arming
     AND the CSS rules are wrapped in
     @media (prefers-reduced-motion: no-preference).
   ───────────────────────────────────────────── */
(function () {
  'use strict';

  /* ═══════════════════════════════════════════
     IMAGE SHIMMER (motion-agnostic — runs for
     everyone; the CSS decides whether the wash
     animates). Any img still fetching when this
     deferred script runs gets .bt-img-wait; the
     class drops on load/error so the gradient
     never lingers under transparent PNG/SVG art.
     ═══════════════════════════════════════════ */
  function tagImg(img) {
    if (img.complete) return;
    img.classList.add('bt-img-wait');
    var clear = function () { img.classList.remove('bt-img-wait'); };
    img.addEventListener('load', clear, { once: true });
    img.addEventListener('error', clear, { once: true });
  }
  document.querySelectorAll('img').forEach(tagImg);

  /* Bail conditions — page stays fully visible. */
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var root = document.documentElement;
  var io = new IntersectionObserver(
    function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        var el = entries[i].target;
        io.unobserve(el); /* reveal once, then forget */
        el.classList.add('is-revealed');
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.08 }
  );

  function arm(el) {
    if (el.dataset.btRevealArmed) return;
    el.dataset.btRevealArmed = '1';

    /* Optional per-element delay: data-bt-reveal-delay="150" (ms, capped). */
    var delay = parseInt(el.getAttribute('data-bt-reveal-delay'), 10);
    if (delay > 0) el.style.transitionDelay = Math.min(delay, 600) + 'ms';

    if (el.getAttribute('data-bt-reveal') === 'load') {
      /* Load-fired reveals (hero): no IO, reveal on the next frame
         so the transition still animates from the hidden state. */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          el.classList.add('is-revealed');
        });
      });
    } else {
      io.observe(el);
    }
  }

  function scan(scope) {
    var els = (scope || document).querySelectorAll('[data-bt-reveal]');
    if (!els.length) return;
    root.classList.add('bt-reveal-armed');
    for (var i = 0; i < els.length; i++) arm(els[i]);
  }

  scan(document);

  /* Theme editor: sections re-render on setting changes — re-scan new DOM. */
  document.addEventListener('shopify:section:load', function (e) {
    scan(e.target);
  });
})();
