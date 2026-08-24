/**
 * assets/variant-selects.js — Botanica v3 original variant picker behavior.
 *
 * Responsibilities (single custom element, mirrors `variant-picker.liquid`):
 *  - When any option radio inside this <variant-selects> changes, recompute
 *    the matching variant from the embedded <script data-variants> JSON.
 *  - Update the hidden product form `name=id` input value (uses [data-variant-id]
 *    so it stays coupled with main-product.liquid, not a hard-coded selector).
 *  - Update price + compare-at price + sale badge visibility.
 *  - Update the visible "selected value" caption next to each option legend.
 *  - Disable ATC + change its label to "Sold out" when the variant is
 *    unavailable; restore "Add to cart" when available.
 *  - Switch the PDP main media to the variant's featured_media when present.
 *  - Update aria-live region with "Price X. Available/Sold out" announcement.
 *  - Sync the URL `?variant=ID` for shareable links and back/forward.
 *
 * Architecture: pure ES class extending HTMLElement, attached via
 * `customElements.define('variant-selects', …)`. No external dependencies,
 * no shared modules — stays inside the 16KB JS budget. Talks to other
 * Botanica components only through DOM data-* attributes:
 *   [data-variants]            — JSON array of product variants
 *   [data-variant-id]          — hidden id input (in main-product form)
 *   [data-current-price]       — span holding current price text
 *   [data-compare-price]       — s holding compare-at price text (optional)
 *   [data-price-live]         — aria-live polite region for SR announcements
 *   [data-main-atc]            — the add-to-cart <button> from buy-buttons
 *   [data-gallery-main]        — the gallery's main media container
 *   [data-aria-live]           — fallback aria region inside main-product
 *   [data-selected-variant]    — this component's own output JSON for sharing
 */
(() => {
  if (customElements.get('variant-selects')) return;

  function money(cents, fmt) {
    if (!fmt) return '$' + (cents / 100).toFixed(2);
    const amount = (cents / 100).toFixed(2);
    return fmt.replace(/\{\{\s*amount\s*\}\}/, amount)
              .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/, amount.replace('.', ','));
  }

  class VariantSelects extends HTMLElement {
    constructor() {
      super();
      this.variants = [];
      this.product = null;
      this.moneyFormat = (window.theme && window.theme.moneyFormat) || '${{amount}}';
      this.i18n = (window.theme && window.theme.variantI18n) || {
        inStock: 'In stock',
        soldOut: 'Sold out',
        unavailable: 'Unavailable'
      };
      this.greeting = this.greeting.bind(this);
    }

    greeting() { return 'bt'; }

    connectedCallback() {
      this.readVariants();
      this.attachListeners();
      this.syncFromCurrentVariant();
    }

    readVariants() {
      const node = this.querySelector('[data-variants]');
      if (!node) return;
      try { this.variants = JSON.parse(node.textContent); }
      catch (e) { this.variants = []; }
      const productNode = this.querySelector('[data-product]');
      if (productNode) {
        try { this.product = JSON.parse(productNode.textContent); }
        catch (e) { this.product = null; }
      }
    }

    attachListeners() {
      this.addEventListener('change', this.onChange.bind(this));
    }

    /**
     * Resolve the currently selected option values from the radio inputs
     * belonging to the wrapped form (`form=this.closest('form')`).
     */
    selectedOptions() {
      const inputs = this.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked');
      return Array.from(inputs).map((el) => el.value);
    }

    findVariantByOptions(options) {
      if (!this.variants.length) return null;
      return this.variants.find((v) => {
        if (v.options.length !== options.length) return false;
        return v.options.every((opt, i) => String(opt) === String(options[i]));
      }) || null;
      // Note: matches by raw option position to stay robust to special chars.
    }

    findVariantById(id) {
      return this.variants.find((v) => Number(v.id) === Number(id)) || null;
    }

    /**
     * Sync UI from the variant id present in the hidden input on load.
     * Only runs when the URL explicitly pins a variant (?variant=ID) —
     * otherwise keep the server-rendered "From $X" range price on
     * price_varies products instead of overwriting it with an exact price.
     */
    syncFromCurrentVariant() {
      let hasVariantParam = false;
      try {
        hasVariantParam = new URLSearchParams(window.location.search).has('variant');
      } catch (e) { hasVariantParam = false; }
      if (!hasVariantParam) return;
      const idInput = document.querySelector('[data-variant-id]');
      if (idInput && idInput.value) {
        const v = this.findVariantById(idInput.value);
        if (v) this.applyVariant(v, { updateUrl: false });
      }
    }

    onChange(event) {
      const target = event.target;
      if (!target || target.name === 'quantity') return;
      const selected = this.selectedOptions();
      // Iterate option values to live-update the "selected value" caption
      // next to each <legend>.
      this.querySelectorAll('fieldset').forEach((fs) => {
        const legendVal = fs.querySelector('[data-selected-value]');
        const checked = fs.querySelector('input:checked');
        if (legendVal && checked) legendVal.textContent = checked.value;
      });

      const variant = this.findVariantByOptions(selected);
      if (!variant) {
        this.markUnavailable();
        return;
      }
      this.applyVariant(variant, { updateUrl: true });
    }

    applyVariant(variant, opts) {
      opts = opts || {};
      // 1. Hidden id input
      const idInput = document.querySelector('[data-variant-id]');
      if (idInput) idInput.value = variant.id;

      // 2. Output our own selected-variant JSON for other components
      const sr = this.querySelector('[data-selected-variant]');
      if (sr) sr.textContent = JSON.stringify(variant);

      // 3. URL sync
      if (opts.updateUrl && variant.id && window.history && history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        history.replaceState(history.state, '', url.toString());
      }

      // 4. Price + compare + unit price
      const current = document.querySelector('[data-current-price]');
      const compare = document.querySelector('[data-compare-price]');
      // Dedicated value hook so the sr-only "Regular price:" label survives.
      const compareValue = compare
        ? (compare.querySelector('[data-compare-price-value]') || compare)
        : null;
      if (current) {
        current.textContent = money(variant.price, this.moneyFormat);
      }
      if (compare) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          if (compareValue) compareValue.textContent = money(variant.compare_at_price, this.moneyFormat);
          compare.hidden = false;
        } else {
          compare.hidden = true;
        }
      }
      const unitWrap = document.querySelector('[data-unit-price-wrap]');
      const unitValue = document.querySelector('[data-unit-price]');
      if (unitWrap) {
        if (variant.available && variant.unit_price_measurement && variant.unit_price != null) {
          if (unitValue) unitValue.textContent = money(variant.unit_price, this.moneyFormat);
          unitWrap.hidden = false;
        } else {
          unitWrap.hidden = true;
        }
      }

      // 5. ATC button state
      const atc = document.querySelector('[data-atc-button]') || document.querySelector('[data-main-atc] button[type="submit"]');
      if (atc) {
        const labelNode = atc.querySelector('[data-atc-label]');
        if (variant.available) {
          atc.removeAttribute('disabled');
          atc.setAttribute('aria-disabled', 'false');
          if (labelNode) labelNode.textContent = this.i18n.addToCart || 'Add to cart';
        } else {
          atc.setAttribute('disabled', '');
          atc.setAttribute('aria-disabled', 'true');
          if (labelNode) labelNode.textContent = this.i18n.soldOut || 'Sold out';
        }
      }

      // 6. aria-live polite announcement
      const live = document.querySelector('[data-aria-live], [data-price-live]');
      if (live) {
        const status = variant.available ? this.i18n.inStock : this.i18n.soldOut;
        const text = money(variant.price, this.moneyFormat) + ' · ' + status;
        live.textContent = text;
      }

      // 7. Gallery media swap
      if (variant.featured_media && variant.featured_media.id) {
        this.swapMainMedia(variant.featured_media);
      }

      // 8. Disable radios for unavailable sibling variants on this option
      this.markSiblingAvailability(variant);

      // 9. Broadcast the fully-applied variant for other components
      //    (sticky-atc.js updates its price/button state from this).
      document.dispatchEvent(new CustomEvent('theme:variantChange', {
        detail: { variant: variant, product: this.product || null }
      }));
    }

    swapMainMedia(media) {
      /* Slide-based gallery (bt-product-gallery) owns stage switching —
         delegate so video/model slides and zoom state stay consistent. */
      const gallery = document.querySelector('bt-product-gallery');
      if (gallery && typeof gallery.activateMedia === 'function') {
        gallery.activateMedia(media.id);
        return;
      }
      /* Legacy fallback: single-img stage without the custom element */
      const img = document.querySelector('[data-gallery-main] img');
      const url = media.preview_image ? media.preview_image.src : null;
      if (img && url) {
        img.src = url;
        const widths = [400, 600, 800, 1000];
        img.srcset = widths.map((w) => `${url}&width=${w} ${w}w`).join(', ');
      }
    }

    markSiblingAvailability() {
      // Light pass: for each option row, mark radios whose siblings+row selection
      // yields no available variant as `.is-unavailable`. Skips when no variants.
      if (!this.variants.length) return;
      this.querySelectorAll('fieldset').forEach((fs) => {
        const inputs = fs.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        inputs.forEach((input) => {
          // Build a hypothetical selection with this radio picked
          const selected = this.selectedOptions();
          const optionIndex = Array.from(this.querySelectorAll('fieldset')).indexOf(fs);
          if (optionIndex < 0) return;
          selected[optionIndex] = input.value;
          const candidate = this.findVariantByOptions(selected);
          const label = input.parentElement;
          if (!label) return;
          if (!candidate || !candidate.available) {
            label.classList.add('is-unavailable');
            input.setAttribute('aria-disabled', 'true');
            input.disabled = true;
          } else {
            label.classList.remove('is-unavailable');
            input.removeAttribute('aria-disabled');
            input.disabled = false;
          }
        });
      });
    }

    markUnavailable() {
      const atc = document.querySelector('[data-atc-button]') || document.querySelector('[data-main-atc] button[type="submit"]');
      if (atc) {
        atc.setAttribute('disabled', '');
        atc.setAttribute('aria-disabled', 'true');
        const labelNode = atc.querySelector('[data-atc-label]');
        if (labelNode) labelNode.textContent = this.i18n.unavailable || 'Unavailable';
      }
      const live = document.querySelector('[data-aria-live], [data-price-live]');
      if (live) live.textContent = this.i18n.unavailable || 'Unavailable';
      document.dispatchEvent(new CustomEvent('theme:variantChange', {
        detail: { variant: null, product: this.product || null }
      }));
    }
  }

  customElements.define('variant-selects', VariantSelects);
})();