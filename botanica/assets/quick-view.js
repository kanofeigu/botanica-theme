/**
 * Botanica v3 — Quick View Dialog
 * Native <dialog> element, zero dependencies.
 * Progressive enhancement: works only if dialog is supported.
 * Keyboard: ESC closes, focus trap (native), click-outside.
 */
class BtQuickView extends HTMLElement {
  constructor() {
    super();
    this.dialog = null;
    this.loading = false;
    this._boundClose = this.close.bind(this);
    this._boundBackdropClick = this._onBackdropClick.bind(this);
    this._boundKeydown = this._onKeydown.bind(this);
  }

  connectedCallback() {
    if (typeof HTMLDialogElement === 'undefined') return;
    this._bindTriggers();
  }

  _bindTriggers() {
    // Delegate: listen for clicks on any [data-quick-view] in the document
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-quick-view]');
      if (!trigger) return;
      e.preventDefault();
      const handle = trigger.dataset.quickView;
      if (handle) this.open(handle);
    });
  }

  async open(productHandle) {
    if (this.loading) return;
    this.loading = true;

    // 1. Create dialog if needed
    if (!this.dialog) {
      this.dialog = document.createElement('dialog');
      this.dialog.className = 'bt-quick-view-dialog';
      this.dialog.setAttribute('role', 'dialog');
      this.dialog.setAttribute('aria-modal', 'true');
      this.dialog.setAttribute('aria-label', 'Quick view');
      this.dialog.addEventListener('click', this._boundBackdropClick);
      this.dialog.addEventListener('keydown', this._boundKeydown);
      document.body.appendChild(this.dialog);
    }

    // 2. Show loading state
    this.dialog.innerHTML = this._loadingHTML();
    this.dialog.showModal();
    document.body.style.overflow = 'hidden';

    // 3. Fetch product data from Shopify AJAX API
    try {
      const resp = await fetch(`${window.shopUrl || ''}/products/${productHandle}.js`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const product = await resp.json();
      this._render(product);
    } catch (err) {
      this.dialog.innerHTML = this._errorHTML();
      console.warn('Quick view: failed to load product', err);
    } finally {
      this.loading = false;
    }
  }

  close() {
    if (!this.dialog) return;
    this.dialog.close();
    document.body.style.overflow = '';
    // Restore focus to the trigger that opened this
    const trigger = document.querySelector(`[data-quick-view="${this._lastHandle}"]`);
    if (trigger) trigger.focus();
  }

  _onBackdropClick(e) {
    if (e.target === this.dialog) this.close();
  }

  _onKeydown(e) {
    if (e.key === 'Escape') {
      // Native <dialog> already handles ESC — but ensure cleanup
      requestAnimationFrame(() => {
        document.body.style.overflow = '';
      });
    }
  }

  _render(product) {
    if (!this.dialog) return;
    const image = product.featured_image || (product.images && product.images[0]);
    const imageSrc = image ? image.src : '';
    const imageAlt = product.title;
    const moneyFormat = window.theme?.moneyFormat || '${{amount}}';
    const price = this._formatMoney(product.price, moneyFormat);
    const comparePrice = product.compare_at_price && product.compare_at_price > product.price
      ? this._formatMoney(product.compare_at_price, moneyFormat)
      : null;

    this.dialog.innerHTML = `
      <button type="button" class="bt-quick-view__close" aria-label="Close quick view" data-qv-close>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <div class="bt-quick-view__media">
        ${imageSrc ? `<img src="${imageSrc}" alt="${imageAlt}" loading="lazy" width="600" height="750">` : '<div class="bt-skeleton" style="width:100%;height:100%"></div>'}
      </div>
      <div class="bt-quick-view__info">
        <span class="bt-eyebrow">${product.vendor || ''}</span>
        <h2 class="bt-h2">${product.title}</h2>
        <div class="bt-product__price-line" style="display:flex;align-items:center;gap:8px">
          <span class="bt-h3" style="color:var(--bt-color-primary)">${price}</span>
          ${comparePrice ? `<s style="color:var(--bt-color-text-muted);font-size:var(--bt-fs-body)">${comparePrice}</s>` : ''}
        </div>
        ${product.options && product.options.length > 0 ? this._variantsHTML(product) : ''}
        <div class="bt-quick-view__actions" style="display:flex;gap:var(--bt-space-xs);margin-top:var(--bt-space-sm)">
          <a href="${product.url}" class="bt-btn bt-btn--secondary" style="flex:1">View full details</a>
          <form method="post" action="/cart/add" style="flex:1">
            <input type="hidden" name="id" value="${product.variants[0]?.id || ''}">
            <input type="hidden" name="quantity" value="1">
            <button type="submit" class="bt-btn bt-btn--primary bt-btn--block" style="width:100%">Add to cart</button>
          </form>
        </div>
      </div>
    `;

    this.dialog.querySelector('[data-qv-close]')?.addEventListener('click', () => this.close());

    // Update dialog label
    this.dialog.setAttribute('aria-label', `Quick view: ${product.title}`);
  }

  _variantsHTML(product) {
    if (!product.variants || product.variants.length <= 1) return '';
    const option = product.options[0];
    if (!option) return '';
    return `
      <div style="margin-top:var(--bt-space-xs)">
        <label class="bt-label">${option.name}</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${option.values.map((val, i) => {
            const variant = product.variants.find(v => v.option1 === val);
            const available = variant ? variant.available : true;
            return `<button type="button" class="bt-btn bt-btn--secondary bt-btn--sm" style="min-height:36px;font-size:var(--bt-fs-body-xs)" ${!available ? 'disabled' : ''} data-qv-variant="${variant ? variant.id : ''}">${val}</button>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  _formatMoney(cents, format) {
    if (typeof Shopify !== 'undefined' && Shopify.formatMoney) {
      return Shopify.formatMoney(cents, format);
    }
    // Fallback: simple formatting
    const dollars = (cents / 100).toFixed(2);
    return format.replace('{{amount}}', dollars);
  }

  _loadingHTML() {
    return `
      <div style="display:flex;align-items:center;justify-content:center;min-height:400px">
        <div class="bt-spinner"></div>
      </div>
    `;
  }

  _errorHTML() {
    return `
      <div style="display:flex;align-items:center;justify-content:center;min-height:400px;flex-direction:column;gap:16px">
        <p style="color:var(--bt-color-text-muted)">Unable to load product. Please try again.</p>
        <button type="button" class="bt-btn bt-btn--secondary" data-qv-close>Close</button>
      </div>
    `;
  }
}

customElements.define('bt-quick-view', BtQuickView);
