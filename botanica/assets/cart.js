/* Botanica v3 — Cart drawer with AJAX qty, upsell, gift note & free shipping */

/* ────────────────────────────────────────────────────────────
   Defensive polyfill: Shopify.formatMoney
   The theme calls Shopify.formatMoney but no script defines it.
   Classic implementation (value/placeholder regex), defaults to
   window.theme.moneyFormat (initialized in layout/theme.liquid).
   ──────────────────────────────────────────────────────────── */
if (typeof window.Shopify === 'undefined') window.Shopify = {};
if (typeof window.Shopify.formatMoney !== 'function') {
  window.Shopify.formatMoney = function (cents, format) {
    if (typeof cents === 'string') cents = cents.replace('.', '');
    var value = '';
    var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    var formatString = format || (window.theme && window.theme.moneyFormat) || '${{amount}}';

    function formatWithDelimiters(number, precision, thousands, decimal) {
      precision = precision == null ? 2 : precision;
      thousands = thousands || ',';
      decimal = decimal || '.';
      if (isNaN(number) || number == null) return 0;
      number = (number / 100.0).toFixed(precision);
      var parts = number.split('.');
      var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
      var centsAmount = parts[1] ? decimal + parts[1] : '';
      return dollarsAmount + centsAmount;
    }

    var match = formatString.match(placeholderRegex);
    if (!match) return formatString;
    switch (match[1]) {
      case 'amount':
        value = formatWithDelimiters(cents, 2);
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0);
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, '.', ',');
        break;
    }

    return formatString.replace(placeholderRegex, value);
  };
}

/* Intercept product forms — AJAX add-to-cart → drawer
   Document-level submit delegation: covers PDP forms, quick-view
   dialog forms and any form injected later by AJAX — no one-time
   DOM scan required. */
(function() {
  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    var action = form.getAttribute('action') || '';
    if (action.indexOf('/cart/add') === -1) return;
    e.preventDefault();
    var btn = form.querySelector('[type="submit"]');
    if (btn) { btn.disabled = true; btn.classList.add('bt-btn--loading'); }
    fetch('/cart/add.js', { method: 'POST', body: new FormData(form) })
      .then(function(res) {
        if (!res.ok) throw new Error('Add failed');
        return res.json();
      })
      .then(function(data) {
        document.dispatchEvent(new CustomEvent('cart:added', { detail: data }));
      })
      .catch(function() {
        // Native submit() does not fire a submit event, so this
        // cannot re-enter the delegated listener (no recursion).
        form.submit();
      })
      .finally(function() {
        if (btn) { btn.disabled = false; btn.classList.remove('bt-btn--loading'); }
      });
  });
})();

/* ────────────────────────────────────────────────────────────
   Global quick-add — ONE delegated listener, bound once at
   module load. Handles every .bt-card__quick-add button on any
   page (collection grid, featured collection, etc.), including
   buttons injected later by AJAX. The CartDrawer subscribes to
   `cart:added` and performs the refresh + open itself, so this
   handler never touches cart DOM or fetches /cart.js directly.
   ──────────────────────────────────────────────────────────── */
document.addEventListener('click', function (e) {
  var btn = e.target && e.target.closest ? e.target.closest('.bt-card__quick-add') : null;
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  var variantId = btn.getAttribute('data-variant-id');
  if (!variantId || btn.disabled) return;
  var originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.classList.add('is-loading');
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: parseInt(variantId, 10), quantity: 1 })
  })
    .then(function (res) {
      if (!res.ok) throw new Error('Quick-add failed');
      return res.json();
    })
    .then(function (data) {
      btn.classList.remove('is-loading');
      btn.classList.add('is-added');
      btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg><span class="bt-sr-only">Added to cart</span>';
      document.dispatchEvent(new CustomEvent('cart:added', { detail: data }));
      setTimeout(function () {
        btn.classList.remove('is-added');
        btn.innerHTML = originalHTML;
        btn.disabled = false;
      }, 2000);
    })
    .catch(function () {
      btn.classList.remove('is-loading');
      btn.disabled = false;
    });
});

if (!customElements.get('bt-cart-drawer')) {
  class BtCartDrawer extends HTMLElement {
    constructor() {
      super();
      this.bodyLocked = false;
    }

    connectedCallback() {
      this.toggleBtn = document.querySelector('[data-cart-toggle]');
      this.closeBtn = this.querySelector('[data-cart-close]');
      this.overlay = this.querySelector('[data-cart-overlay]');
      this.badge = document.querySelector('[data-cart-count-badge]');
      this.giftNote = this.querySelector('[data-cart-gift-note]');
      this.shippingEl = this.querySelector('[data-cart-shipping]');
      this.itemsEl = this.querySelector('[data-cart-items]');
      this.emptyEl = this.querySelector('[data-cart-empty]');
      this.footerEl = this.querySelector('[data-cart-drawer-footer]');
      this.subtotalEl = this.querySelector('[data-cart-subtotal]');
      this.upsellEl = this.querySelector('[data-cart-upsell]');

      this.toggleBtn?.addEventListener('click', () => this.open());
      this.closeBtn?.addEventListener('click', () => this.close());
      this.overlay?.addEventListener('click', () => this.close());
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && this.isOpen) { this.close(); }
      });

      this.addEventListener('click', e => {
        const btn = e.target.closest('button');
        if (!btn || !btn.dataset.action) return;
        const key = btn.dataset.key;
        if (btn.dataset.action === 'qty-plus') {
          const cur = parseInt(btn.closest('[data-qty-stepper]').querySelector('[data-qty-value]').textContent, 10);
          this._changeItem(key, cur + 1);
        } else if (btn.dataset.action === 'qty-minus') {
          const cur = parseInt(btn.closest('[data-qty-stepper]').querySelector('[data-qty-value]').textContent, 10);
          if (cur > 1) this._changeItem(key, cur - 1);
        } else if (btn.dataset.action === 'remove') {
          this._changeItem(key, 0);
        }
      });

      this.giftNote?.addEventListener('change', () => this._saveNote());

      document.addEventListener('cart:added', () => this.open());
      document.addEventListener('cart:refresh', () => this._refreshCart());
    }

    get isOpen() { return this.hasAttribute('open'); }

    open() {
      this.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
      this.bodyLocked = true;
      this._refreshCart();
    }

    close() {
      this.removeAttribute('open');
      document.body.style.overflow = '';
      this.bodyLocked = false;
    }

    async _refreshCart() {
      try {
        const res = await fetch('/cart.js');
        if (!res.ok) throw new Error('Cart fetch failed');
        const cart = await res.json();
        this._render(cart);
      } catch (e) { /* silent */ }
    }

    async _changeItem(key, qty) {
      this.setAttribute('loading', '');
      try {
        const res = await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, quantity: qty })
        });
        if (!res.ok) throw new Error('Cart change failed');
        const cart = await res.json();
        this._render(cart);
      } catch (e) {
        this._refreshCart();
      } finally {
        this.removeAttribute('loading');
      }
    }

    async _saveNote() {
      try {
        await fetch('/cart/update.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: this.giftNote.value || '' })
        });
      } catch (e) { /* silent */ }
    }

    _render(cart) {
      // Free shipping bar
      if (this.shippingEl && cart.item_count > 0) {
        const threshold = parseInt(this.dataset.freeShippingThreshold, 10) || 0;
        const thresholdCents = threshold * 100;
        if (thresholdCents > 0) {
          const remaining = thresholdCents - cart.total_price;
          const pct = Math.min(100, Math.round(cart.total_price * 100 / thresholdCents));
          const fmt = window.theme.moneyFormat;
          if (remaining > 0) {
            this.shippingEl.innerHTML = '<p class="bt-cart-drawer__shipping-msg">' + this.dataset.freeShippingMsg.replace('{amount}', Shopify.formatMoney(remaining, fmt)) + '</p><div class="bt-cart-drawer__shipping-track"><div class="bt-cart-drawer__shipping-fill" style="width:' + pct + '%"></div></div>';
          } else {
            this.shippingEl.innerHTML = '<p class="bt-cart-drawer__shipping-msg bt-cart-drawer__shipping-msg--reached">' + (this.dataset.freeShippingReached || 'You qualify for free shipping!') + '</p>';
          }
          this.shippingEl.hidden = false;
        } else {
          this.shippingEl.hidden = true;
        }
      } else if (this.shippingEl) {
        this.shippingEl.hidden = true;
      }

      // Items
      if (cart.item_count > 0) {
        if (this.emptyEl) this.emptyEl.hidden = true;
        this.itemsEl.innerHTML = cart.items.map(item => this._itemHTML(item)).join('');
        this.itemsEl.hidden = false;
        if (this.footerEl) this.footerEl.hidden = false;
        if (this.subtotalEl) this.subtotalEl.textContent = Shopify.formatMoney(cart.total_price, window.theme.moneyFormat);
        var viewBtn = this.querySelector('[data-cart-view-btn]');
        var checkoutForm = this.querySelector('[data-cart-checkout-form]');
        if (viewBtn) viewBtn.hidden = false;
        if (checkoutForm) checkoutForm.hidden = false;
      } else {
        if (this.emptyEl) this.emptyEl.hidden = false;
        this.itemsEl.innerHTML = '';
        this.itemsEl.hidden = true;
        if (this.footerEl) this.footerEl.hidden = true;
        if (this.upsellEl) this.upsellEl.innerHTML = '';
        var viewBtn = this.querySelector('[data-cart-view-btn]');
        var checkoutForm = this.querySelector('[data-cart-checkout-form]');
        if (viewBtn) viewBtn.hidden = true;
        if (checkoutForm) checkoutForm.hidden = true;
      }

      // Cart count badge
      if (this.toggleBtn) {
        const countEl = this.toggleBtn.querySelector('[data-cart-count]');
        if (countEl) {
          countEl.textContent = cart.item_count;
          countEl.hidden = cart.item_count === 0;
        }
      }

      // Gift note
      if (this.giftNote) this.giftNote.value = cart.note || '';

      // Upsell
      this._loadUpsell(cart);
    }

    _itemHTML(item) {
      var img = item.image
        ? '<img src="' + item.image + '" alt="' + item.title + '" width="80" height="80" loading="lazy">'
        : '<div class="bt-cart-drawer__item-placeholder"></div>';
      var variant = item.variant_title && item.variant_title !== 'Default Title'
        ? '<p class="bt-cart-drawer__item-variant">' + item.variant_title + '</p>'
        : '';
      var compareAt = item.variant_compare_at_price && item.variant_compare_at_price > item.final_price
        ? '<span class="bt-cart-drawer__item-compare">' + Shopify.formatMoney(item.variant_compare_at_price, window.theme.moneyFormat) + '</span>'
        : '';

      return '<li class="bt-cart-drawer__item" role="listitem">' +
        '<div class="bt-cart-drawer__item-media"><a href="' + item.url + '">' + img + '</a></div>' +
        '<div class="bt-cart-drawer__item-info">' +
          '<a href="' + item.url + '" class="bt-cart-drawer__item-title">' + item.product_title + '</a>' +
          variant +
          '<div class="bt-cart-drawer__item-qty-row">' +
            '<div class="bt-qty-stepper" data-qty-stepper>' +
              '<button type="button" class="bt-qty-stepper__btn" data-action="qty-minus" data-key="' + item.key + '" aria-label="Decrease">\u2212</button>' +
              '<span class="bt-qty-stepper__value" data-qty-value>' + item.quantity + '</span>' +
              '<button type="button" class="bt-qty-stepper__btn" data-action="qty-plus" data-key="' + item.key + '" aria-label="Increase">+</button>' +
            '</div>' +
            '<span class="bt-cart-drawer__item-price">' + compareAt + ' ' + Shopify.formatMoney(item.final_line_price, window.theme.moneyFormat) + '</span>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="bt-cart-drawer__item-remove" data-action="remove" data-key="' + item.key + '" aria-label="Remove">' +
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
        '</button>' +
      '</li>';
    }

    async _loadUpsell(cart) {
      var container = this.upsellEl;
      if (!container || cart.item_count === 0) {
        if (container) container.innerHTML = '';
        return;
      }
      var productId = cart.items[0]?.product_id;
      if (!productId) return;

      try {
        var res = await fetch('/recommendations/products.json?product_id=' + productId + '&limit=4');
        if (!res.ok) throw new Error('Upsell fetch failed');
        var data = await res.json();
        if (!data.products || !data.products.length) { container.innerHTML = ''; return; }

        var html = '<div class="bt-cart-upsell"><h3 class="bt-cart-upsell__title">You might also like</h3><div class="bt-cart-upsell__grid">';

        for (var i = 0; i < data.products.length; i++) {
          var p = data.products[i];
          var v = p.variants[0];
          var price = Shopify.formatMoney(v.price, window.theme.moneyFormat);
          var imgSrc = p.images[0]?.src || p.featured_image;
          html += '<div class="bt-cart-upsell__item">' +
            '<div class="bt-cart-upsell__media">' +
              (imgSrc ? '<img src="' + imgSrc + '" alt="' + p.title + '" width="100" height="100" loading="lazy">' : '<div class="bt-cart-upsell__placeholder"></div>') +
            '</div>' +
            '<p class="bt-cart-upsell__name">' + p.title + '</p>' +
            '<span class="bt-cart-upsell__price">' + price + '</span>' +
            '<button type="button" class="bt-btn bt-btn--sm bt-btn--primary" data-upsell-add data-variant-id="' + v.id + '">Add</button>' +
          '</div>';
        }
        html += '</div></div>';
        container.innerHTML = html;

        var buttons = container.querySelectorAll('[data-upsell-add]');
        for (var j = 0; j < buttons.length; j++) {
          buttons[j].addEventListener('click', (function(btn) {
            var self = this;
            return function(e) {
              e.preventDefault();
              var id = btn.dataset.variantId;
              btn.disabled = true;
              btn.textContent = 'Adding\u2026';
              fetch('/cart/add.js', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: parseInt(id, 10), quantity: 1 })
              }).then(function() {
                self._refreshCart();
              }).catch(function() {
                btn.textContent = 'Error';
              });
            };
          }).call(this, buttons[j]));
        }
      } catch (e) { /* silent */ }
    }
  }

  customElements.define('bt-cart-drawer', BtCartDrawer);
}
