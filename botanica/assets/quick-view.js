/**
 * Botanica v3 — Quick View Dialog
 * Native <dialog> element, zero dependencies.
 * Progressive enhancement: works only if dialog is supported.
 * Keyboard: ESC closes (native), focus restored to trigger on close,
 * click-outside closes. Variant buttons update the add-to-cart form.
 */
class BtQuickView extends HTMLElement {
  constructor() {
    super();
    this.dialog = null;
    this.loading = false;
    this._product = null;
    this._lastTrigger = null;
    this._lastHandle = null;
    this._boundBackdropClick = this._onBackdropClick.bind(this);
    this._boundDialogClick = this._onDialogClick.bind(this);
    this._boundDialogClose = this._onDialogClose.bind(this);
  }

  connectedCallback() {
    if (typeof HTMLDialogElement === 'undefined') return;
    this._bindTriggers();
  }

  _strings() {
    const s = (typeof window !== 'undefined' && window.theme && window.theme.strings) || {};
    return {
      quickView: s.quickView || 'Quick view',
      quickViewLabel: s.quickViewLabel || 'Quick view: __NAME__',
      addToCart: s.addToCart || 'Add to cart',
      viewDetails: s.viewDetails || 'View full details',
      close: s.close || 'Close',
      closeQuickView: s.closeQuickView || 'Close quick view',
      loadError: s.loadError || 'Unable to load product. Please try again.'
    };
  }

  _bindTriggers() {
    // Delegate: listen for clicks on any [data-quick-view] in the document
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-quick-view]');
      if (!trigger) return;
      e.preventDefault();
      const handle = trigger.dataset.quickView;
      if (handle) this.open(handle, trigger);
    });
  }

  async open(productHandle, trigger) {
    if (this.loading) return;
    this.loading = true;

    // Remember the trigger so focus can be restored on close
    this._lastTrigger = trigger || null;
    this._lastHandle = productHandle;

    // 1. Create dialog if needed
    if (!this.dialog) {
      this.dialog = document.createElement('dialog');
      this.dialog.className = 'bt-quick-view-dialog';
      this.dialog.setAttribute('role', 'dialog');
      this.dialog.setAttribute('aria-modal', 'true');
      this.dialog.setAttribute('aria-label', this._strings().quickView);
      this.dialog.addEventListener('click', this._boundBackdropClick);
      this.dialog.addEventListener('click', this._boundDialogClick);
      this.dialog.addEventListener('close', this._boundDialogClose);
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
    if (!this.dialog || !this.dialog.open) return;
    // Cleanup (scroll unlock, focus restore) runs in _onDialogClose,
    // which also covers native ESC dismissal.
    this.dialog.close();
  }

  _onDialogClose() {
    document.body.style.overflow = '';
    // Restore focus to the trigger that opened this dialog
    if (this._lastTrigger && this._lastTrigger.isConnected) {
      this._lastTrigger.focus();
    } else if (this._lastHandle) {
      const fallback = document.querySelector(`[data-quick-view="${this._lastHandle}"]`);
      if (fallback) fallback.focus();
    }
    this._lastTrigger = null;
  }

  _onBackdropClick(e) {
    if (e.target === this.dialog) this.close();
  }

  _onDialogClick(e) {
    const closeBtn = e.target.closest('[data-qv-close]');
    if (closeBtn) {
      this.close();
      return;
    }
    const variantBtn = e.target.closest('[data-qv-variant]');
    if (variantBtn && !variantBtn.disabled) {
      this._selectVariant(variantBtn);
    }
  }

  _selectVariant(btn) {
    const id = btn.dataset.qvVariant;
    if (!id || !this.dialog) return;

    // 1. Point the add-to-cart form at the chosen variant
    const idInput = this.dialog.querySelector('form[action*="/cart/add"] input[name="id"]');
    if (idInput) idInput.value = id;

    // 2. Update pressed/selected state on the variant buttons
    this.dialog.querySelectorAll('[data-qv-variant]').forEach((b) => {
      const active = b === btn;
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
      b.classList.toggle('is-selected', active);
    });

    // 3. Update the displayed price for the chosen variant
    const variant = this._product && this._product.variants
      ? this._product.variants.find((v) => String(v.id) === String(id))
      : null;
    if (variant) {
      const moneyFormat = window.theme?.moneyFormat || '${{amount}}';
      const priceEl = this.dialog.querySelector('[data-qv-price]');
      if (priceEl) priceEl.textContent = this._formatMoney(variant.price, moneyFormat);
      const compareEl = this.dialog.querySelector('[data-qv-compare]');
      if (compareEl) {
        if (variant.compare_at_price && variant.compare_at_price > variant.price) {
          compareEl.textContent = this._formatMoney(variant.compare_at_price, moneyFormat);
          compareEl.hidden = false;
        } else {
          compareEl.hidden = true;
        }
      }
    }
  }

  _render(product) {
    if (!this.dialog) return;
    this._product = product;
    const strings = this._strings();
    const image = product.featured_image || (product.images && product.images[0]);
    const imageSrc = image ? image.src : '';
    const imageAlt = product.title;
    const moneyFormat = window.theme?.moneyFormat || '${{amount}}';
    const selected = product.variants.find((v) => v.available) || product.variants[0];
    const price = this._formatMoney(selected ? selected.price : product.price, moneyFormat);
    const comparePrice = selected && selected.compare_at_price && selected.compare_at_price > selected.price
      ? this._formatMoney(selected.compare_at_price, moneyFormat)
      : null;

    this.dialog.innerHTML = `
      <button type="button" class="bt-quick-view__close" aria-label="${strings.closeQuickView}" data-qv-close>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
      <div class="bt-quick-view__media">
        ${imageSrc ? `<img src="${imageSrc}" alt="${imageAlt}" loading="lazy" width="600" height="750">` : '<div class="bt-skeleton" style="width:100%;height:100%"></div>'}
      </div>
      <div class="bt-quick-view__info">
        <span class="bt-eyebrow">${product.vendor || ''}</span>
        <h2 class="bt-h2">${product.title}</h2>
        <div class="bt-product__price-line" style="display:flex;align-items:center;gap:8px">
          <span class="bt-h3" style="color:var(--bt-color-primary)" data-qv-price>${price}</span>
          <s style="color:var(--bt-color-text-muted);font-size:var(--bt-fs-body)" data-qv-compare ${comparePrice ? '' : 'hidden'}>${comparePrice || ''}</s>
        </div>
        ${product.options && product.options.length > 0 ? this._variantsHTML(product, selected ? selected.id : null) : ''}
        <div class="bt-quick-view__actions" style="display:flex;gap:var(--bt-space-xs);margin-top:var(--bt-space-sm)">
          <a href="${product.url}" class="bt-btn bt-btn--secondary" style="flex:1">${strings.viewDetails}</a>
          <form method="post" action="/cart/add" style="flex:1">
            <input type="hidden" name="id" value="${selected ? selected.id : ''}">
            <input type="hidden" name="quantity" value="1">
            <button type="submit" class="bt-btn bt-btn--primary bt-btn--block" style="width:100%">${strings.addToCart}</button>
          </form>
        </div>
      </div>
    `;

    // Update dialog label
    this.dialog.setAttribute('aria-label', strings.quickViewLabel.replace('__NAME__', product.title));
  }

  _variantsHTML(product, selectedId) {
    if (!product.variants || product.variants.length <= 1) return '';
    const option = product.options[0];
    if (!option) return '';
    return `
      <div style="margin-top:var(--bt-space-xs)">
        <label class="bt-label">${option.name}</label>
        <div style="display:flex;flex-wrap:wrap;gap:8px" role="group" aria-label="${option.name}">
          ${option.values.map((val) => {
            const variant = product.variants.find(v => v.option1 === val);
            const available = variant ? variant.available : true;
            const isSelected = variant && selectedId && String(variant.id) === String(selectedId);
            return `<button type="button" class="bt-btn bt-btn--secondary bt-btn--sm${isSelected ? ' is-selected' : ''}" style="min-height:36px;font-size:var(--bt-fs-body-xs)" ${!available ? 'disabled' : ''} data-qv-variant="${variant ? variant.id : ''}" aria-pressed="${isSelected ? 'true' : 'false'}">${val}</button>`;
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
    const strings = this._strings();
    return `
      <div style="display:flex;align-items:center;justify-content:center;min-height:400px;flex-direction:column;gap:16px">
        <p style="color:var(--bt-color-text-muted)">${strings.loadError}</p>
        <button type="button" class="bt-btn bt-btn--secondary" data-qv-close>${strings.close}</button>
      </div>
    `;
  }
}

customElements.define('bt-quick-view', BtQuickView);
