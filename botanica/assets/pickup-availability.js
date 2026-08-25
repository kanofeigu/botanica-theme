/**
 * pickup-availability.js — Fetches and displays store pickup availability
 * for the selected product variant. Uses Shopify's pickup_availability API.
 * Zero dependencies. ES module compatible, also works as classic script.
 */
class BtPickupAvailability extends HTMLElement {
  constructor() {
    super();
    this.variantId = this.dataset.variantId;
    this.rootUrl = (this.dataset.rootUrl || '').replace(/\/$/, ''); /* strip trailing slash: "/" + "/variants/..." would become protocol-relative "//variants/..." (DNS error) */
    this.showWhenUnavailable = this.dataset.showWhenUnavailable === 'true';
    this.preview = this.querySelector('[data-pickup-preview]');
    this.drawer = this.querySelector('[data-pickup-drawer]');
    this.locationsList = this.querySelector('[data-pickup-locations]');
    this.toggleBtn = this.querySelector('[data-pickup-toggle]');
    this.closeBtn = this.querySelector('[data-pickup-close]');

    if (!this.variantId) return;

    this.fetchAvailability();
    this.bindEvents();
  }

  bindEvents() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggleDrawer());
    }
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.closeDrawer());
    }
    // Close drawer on outside click
    document.addEventListener('click', (e) => {
      if (this.drawer && !this.drawer.hasAttribute('hidden') && !this.contains(e.target)) {
        this.closeDrawer();
      }
    });
  }

  toggleDrawer() {
    if (!this.drawer) return;
    const isOpen = !this.drawer.hasAttribute('hidden');
    if (isOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  openDrawer() {
    if (!this.drawer) return;
    this.drawer.removeAttribute('hidden');
    this.toggleBtn?.setAttribute('aria-expanded', 'true');
  }

  closeDrawer() {
    if (!this.drawer) return;
    this.drawer.setAttribute('hidden', '');
    this.toggleBtn?.setAttribute('aria-expanded', 'false');
  }

  fetchAvailability() {
    if (!this.variantId) return;

    const url = `${this.rootUrl}/variants/${this.variantId}/?section_id=pickup-availability`;

    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.text();
      })
      .then(html => {
        const container = document.createElement('div');
        container.innerHTML = html;

        // Extract pickup-availability content from section response
        const pickupContent = container.querySelector('pickup-availability');
        if (!pickupContent) {
          this.hide();
          return;
        }

        const newPreview = pickupContent.querySelector('[data-pickup-preview]');
        const newLocations = pickupContent.querySelector('[data-pickup-locations]');

        if (newPreview && this.preview) {
          this.preview.innerHTML = newPreview.innerHTML;
          // Re-bind toggle button after replacing HTML
          this.toggleBtn = this.querySelector('[data-pickup-toggle]');
          this.bindEvents();
        }

        if (newLocations && this.locationsList) {
          this.locationsList.innerHTML = newLocations.innerHTML;
        }

        // Check if any locations have availability
        const hasAvailability = pickupContent.querySelector('.bt-pickup__status--available');
        if (!hasAvailability && !this.showWhenUnavailable) {
          // Keep showing but with unavailable status
        }
      })
      .catch(() => {
        this.hide();
      });
  }

  hide() {
    this.style.display = 'none';
    this.setAttribute('hidden', '');
  }
}

customElements.define('pickup-availability', BtPickupAvailability);
