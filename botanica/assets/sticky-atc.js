/**
 * Botanica v3 — Sticky Add-to-Cart
 * IntersectionObserver-based. Appears when main ATC scrolls out.
 * Vanilla JS, ES module, ~600 bytes minified.
 */
class BtStickyATC extends HTMLElement {
  constructor() {
    super();
    this.observer = null;
    this.visibleClass = 'is-visible';
  }

  connectedCallback() {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: always show on mobile
      this.classList.add(this.visibleClass);
      return;
    }

    // Observe the main buy button area
    const targetId = this.dataset.observe;
    const target = targetId ? document.getElementById(targetId) : document.querySelector('[data-main-atc]');

    if (!target) {
      this.classList.add(this.visibleClass);
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0].isIntersecting;
        this.classList.toggle(this.visibleClass, !isVisible);
        // Notify body so we can add bottom padding
        document.body.classList.toggle('bt-has-sticky-atc', !isVisible);
      },
      { threshold: 0 }
    );

    this.observer.observe(target);
  }

  disconnectedCallback() {
    if (this.observer) this.observer.disconnect();
    document.body.classList.remove('bt-has-sticky-atc');
  }
}

customElements.define('bt-sticky-atc', BtStickyATC);
