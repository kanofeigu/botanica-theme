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
    this._onVariantChange = this._onVariantChange.bind(this);
  }

  connectedCallback() {
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: always show on mobile
      this.classList.add(this.visibleClass);
    } else {
      // Observe the main buy button area
      const targetId = this.dataset.observe;
      const target = targetId ? document.getElementById(targetId) : document.querySelector('[data-main-atc]');

      if (!target) {
        this.classList.add(this.visibleClass);
      } else {
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
    }

    // Keep price / variant name / button state in sync with the PDP picker
    document.addEventListener('theme:variantChange', this._onVariantChange);
  }

  disconnectedCallback() {
    if (this.observer) this.observer.disconnect();
    document.body.classList.remove('bt-has-sticky-atc');
    document.removeEventListener('theme:variantChange', this._onVariantChange);
  }

  _strings() {
    const i18n = (window.theme && window.theme.variantI18n) || {};
    return {
      addToCart: i18n.addToCart || 'Add to cart',
      soldOut: i18n.soldOut || 'Sold out',
      unavailable: i18n.unavailable || 'Unavailable'
    };
  }

  _formatMoney(cents) {
    const format = (window.theme && window.theme.moneyFormat) || '${{amount}}';
    if (typeof Shopify !== 'undefined' && typeof Shopify.formatMoney === 'function') {
      return Shopify.formatMoney(cents, format);
    }
    // Fallback: replace the {{amount}} placeholder manually
    return format.replace(/\{\{\s*amount\s*\}\}/, (cents / 100).toFixed(2));
  }

  _onVariantChange(event) {
    const variant = event.detail ? event.detail.variant : null;
    const strings = this._strings();
    const btn = this.querySelector('[data-sticky-button]');
    const label = this.querySelector('[data-sticky-label]');

    if (!variant) {
      // Option combination matches no variant — mirror the main ATC
      if (btn) btn.disabled = true;
      if (label) label.textContent = strings.unavailable;
      return;
    }

    const priceEl = this.querySelector('[data-sticky-price]');
    if (priceEl) priceEl.textContent = this._formatMoney(variant.price);

    const compareEl = this.querySelector('[data-sticky-compare]');
    if (compareEl) {
      if (variant.compare_at_price && variant.compare_at_price > variant.price) {
        compareEl.textContent = this._formatMoney(variant.compare_at_price);
        compareEl.hidden = false;
      } else {
        compareEl.hidden = true;
      }
    }

    const variantEl = this.querySelector('[data-sticky-variant]');
    if (variantEl) {
      const name = variant.title || (variant.options ? variant.options.join(' / ') : '');
      variantEl.textContent = name;
      variantEl.hidden = !name || name === 'Default Title';
    }

    if (btn) btn.disabled = !variant.available;
    if (label) label.textContent = variant.available ? strings.addToCart : strings.soldOut;
  }
}

customElements.define('bt-sticky-atc', BtStickyATC);
