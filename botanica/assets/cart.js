/* Botanica v3 — Cart drawer (original, ≤2KB) */
class BtCartDrawer extends HTMLElement {
  constructor(){super();this.bodyLocked=false}
  connectedCallback(){
    this.toggleBtn=document.querySelector('[data-cart-toggle]');
    this.closeBtn=this.querySelector('[data-cart-close]');
    this.overlay=this.querySelector('[data-cart-overlay]');
    this.toggleBtn?.addEventListener('click',()=>this.open());
    this.closeBtn?.addEventListener('click',()=>this.close());
    this.overlay?.addEventListener('click',()=>this.close());
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&this.isOpen){this.close();this.toggleBtn?.focus()}});
  }
  get isOpen(){return this.hasAttribute('open')}
  open(){this.setAttribute('open','');document.body.style.overflow='hidden';this.bodyLocked=true;this.querySelector('a, button')?.focus()}
  close(){this.removeAttribute('open');document.body.style.overflow='';this.bodyLocked=false}
}
customElements.define('bt-cart-drawer',BtCartDrawer);
