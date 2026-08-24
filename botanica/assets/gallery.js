/* Botanica v3 — Product gallery: slide-based media switcher (image / video /
   external video / 3D model) + click-to-zoom lightbox (images only).
   Public API: activateMedia(id) — used by variant-selects.js. */
class BtProductGallery extends HTMLElement {
  constructor(){super()}
  connectedCallback(){
    this.main=this.querySelector('[data-gallery-main]');
    if(!this.main)return;
    this.slides=Array.from(this.main.querySelectorAll('[data-gallery-slide]'));
    this.thumbs=Array.from(this.querySelectorAll('[data-gallery-thumb]'));
    this.thumbs.forEach(t=>{
      t.addEventListener('click',()=>this.switchTo(t));
      t.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.switchTo(t)}});
    });

    /* 3D model support — Shopify platform loader (model-viewer-ui). */
    if(this.main.querySelector('[data-media-type="model"]')&&window.Shopify&&typeof window.Shopify.loadFeatures==='function'){
      window.Shopify.loadFeatures([{name:'model-viewer-ui',version:'1.0'}]);
    }

    /* ── Zoom lightbox (native <dialog>) — images only ── */
    this.zoomDialog=this.parentElement.querySelector('.bt-zoom-dialog');
    this.zoomImg=this.zoomDialog&&this.zoomDialog.querySelector('[data-zoom-image]');
    this.zoomPrev=this.zoomDialog&&this.zoomDialog.querySelector('[data-zoom-prev]');
    this.zoomNext=this.zoomDialog&&this.zoomDialog.querySelector('[data-zoom-next]');
    this.zoomCloseBtn=this.zoomDialog&&this.zoomDialog.querySelector('[data-zoom-close]');
    this.zoomBtn=this.main.querySelector('[data-zoom-open]');
    this.lastFocused=null;
    this.zoomIndex=0;

    if(!this.zoomDialog||!this.zoomImg||typeof this.zoomDialog.showModal!=='function')return;

    if(this.zoomBtn){
      this.zoomBtn.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();this.openZoom()});
    }
    /* Clicking the main stage opens zoom too (guarded to image slides inside openZoom) */
    this.main.addEventListener('click',(e)=>{
      if(e.target.closest('[data-zoom-open]'))return;
      this.openZoom();
    });

    this.zoomCloseBtn&&this.zoomCloseBtn.addEventListener('click',()=>this.closeZoom());
    this.zoomPrev&&this.zoomPrev.addEventListener('click',()=>this.stepZoom(-1));
    this.zoomNext&&this.zoomNext.addEventListener('click',()=>this.stepZoom(1));
    this.zoomDialog.addEventListener('click',(e)=>{if(e.target===this.zoomDialog)this.closeZoom()});
    this.zoomDialog.addEventListener('close',()=>{if(this.lastFocused&&typeof this.lastFocused.focus==='function')this.lastFocused.focus()});
    document.addEventListener('keydown',(e)=>{
      if(!this.zoomDialog||!this.zoomDialog.open)return;
      if(e.key==='ArrowLeft'&&this.zoomList().length>1){e.preventDefault();this.stepZoom(-1)}
      else if(e.key==='ArrowRight'&&this.zoomList().length>1){e.preventDefault();this.stepZoom(1)}
    });
  }

  /* Only image media participate in the zoom lightbox */
  zoomList(){
    if(this.thumbs.length)return this.thumbs.filter(t=>!t.dataset.mediaType||t.dataset.mediaType==='image');
    return this.slides.filter(s=>!s.dataset.mediaType||s.dataset.mediaType==='image');
  }

  activeSlide(){
    return this.slides.find(s=>s.classList.contains('is-active'))||this.slides[0]||null;
  }

  showSlide(slide){
    this.slides.forEach(s=>{
      const on=s===slide;
      s.classList.toggle('is-active',on);
      if(on){
        s.removeAttribute('hidden');
      }else{
        s.setAttribute('hidden','');
        /* pause local video; restart-free stop for external iframes */
        const v=s.querySelector('video');v&&typeof v.pause==='function'&&v.pause();
        const f=s.querySelector('iframe');
        if(f&&f.src){const src=f.src;f.src='';f.src=src}
      }
    });
    this.main.setAttribute('data-media-id',slide.dataset.mediaId||'');
  }

  switchTo(thumb){
    const id=thumb.dataset.mediaId;
    const slide=this.slides.find(s=>s.dataset.mediaId===String(id));
    if(!slide)return;
    this.showSlide(slide);
    this.thumbs.forEach(t=>t.classList.toggle('is-active',t===thumb));
  }

  /* variant-selects.js: activate the variant's featured media */
  activateMedia(id){
    const thumb=this.thumbs.find(t=>t.dataset.mediaId===String(id));
    if(thumb){this.switchTo(thumb);return}
    /* No thumb strip (single-media product): switch the slide directly */
    const slide=this.slides.find(s=>s.dataset.mediaId===String(id));
    if(slide)this.showSlide(slide);
  }

  openZoom(){
    const active=this.activeSlide();
    if(active&&active.dataset.mediaType&&active.dataset.mediaType!=='image')return;
    this.lastFocused=document.activeElement;
    const list=this.zoomList();
    let idx=0;
    if(this.thumbs.length){
      const activeThumb=this.querySelector('.bt-product__thumb.is-active');
      const i=list.indexOf(activeThumb);
      idx=i>-1?i:0;
    }
    this.zoomIndex=Math.max(0,idx);
    this.renderZoom();
    this.zoomDialog.showModal();
  }
  closeZoom(){if(this.zoomDialog&&this.zoomDialog.open)this.zoomDialog.close()}
  stepZoom(dir){
    const n=this.zoomList().length;
    if(n<=1)return;
    this.zoomIndex=(this.zoomIndex+dir+n)%n;
    this.renderZoom();
    const t=this.zoomList()[this.zoomIndex];
    if(t&&t.hasAttribute('data-gallery-thumb'))this.switchTo(t);
  }
  renderZoom(){
    let src='',alt='';
    const item=this.zoomList()[this.zoomIndex];
    if(item&&item.dataset&&item.dataset.mediaFull){src=item.dataset.mediaFull;alt=item.dataset.mediaAlt||''}
    /* Fallback: use the active slide's <img> (single-image product) */
    if(!src){
      const active=this.activeSlide();
      const mainImg=active?active.querySelector('img'):this.main.querySelector('img');
      if(mainImg){src=mainImg.currentSrc||mainImg.src||'';alt=mainImg.alt||''}
    }
    if(src){
      /* Upgrade to a larger width for full-screen viewing */
      src=src.replace(/&width=\d+/,'').replace(/\?width=\d+/,'?');
      if(src.indexOf('?')>-1)src+=(src.indexOf('width=')>-1?'':'&width=1600');
      else src+='?width=1600';
    }
    this.zoomImg.src=src;
    this.zoomImg.alt=alt;
    const n=this.zoomList().length;
    if(this.zoomPrev)this.zoomPrev.disabled=(n<=1);
    if(this.zoomNext)this.zoomNext.disabled=(n<=1);
  }
}
customElements.define('bt-product-gallery',BtProductGallery);
