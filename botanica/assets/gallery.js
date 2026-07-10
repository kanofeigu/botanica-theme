/* Botanica v3 — Product gallery: media switcher + click-to-zoom lightbox.
   Zoom works even when the product has a single image (no thumbnail strip). */
class BtProductGallery extends HTMLElement {
  constructor(){super()}
  connectedCallback(){
    this.main=this.querySelector('[data-gallery-main]');
    if(!this.main)return;
    this.thumbs=this.querySelectorAll('[data-gallery-thumb]');
    this.thumbs.forEach(t=>t.addEventListener('click',()=>this.switchTo(t)));
    this.thumbs.forEach(t=>t.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();this.switchTo(t)}}));

    /* ── Zoom lightbox (native <dialog>) — works with or without thumbnails ── */
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
    /* Clicking the main media (image itself) opens zoom too */
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
      if(e.key==='Escape'){/* native dialog handles ESC */}
      else if(e.key==='ArrowLeft'&&this.thumbs.length>1){e.preventDefault();this.stepZoom(-1)}
      else if(e.key==='ArrowRight'&&this.thumbs.length>1){e.preventDefault();this.stepZoom(1)}
    });
  }
  switchTo(thumb){
    const src=thumb.dataset.mediaSrc;
    const alt=thumb.dataset.mediaAlt||'';
    const srcset=thumb.dataset.mediaSrcset||src;
    const sizes=thumb.dataset.mediaSizes||'(min-width: 990px) 50vw, 100vw';
    if(!src)return;
    const img=this.main.querySelector('img');
    if(img){img.src=src;img.srcset=srcset;img.sizes=sizes;img.alt=alt}
    this.thumbs.forEach(t=>t.classList.remove('is-active'));
    thumb.classList.add('is-active');
    this.main.setAttribute('data-media-id',thumb.dataset.mediaId||'');
  }
  openZoom(){
    this.lastFocused=document.activeElement;
    if(this.thumbs.length){
      const active=this.parentElement.querySelector('.bt-product__thumb.is-active')||this.thumbs[0];
      this.zoomIndex=Math.max(0,Array.from(this.thumbs).indexOf(active));
    }else{
      this.zoomIndex=0;
    }
    this.renderZoom();
    this.zoomDialog.showModal();
  }
  closeZoom(){if(this.zoomDialog&&this.zoomDialog.open)this.zoomDialog.close()}
  stepZoom(dir){
    const n=this.thumbs.length;
    if(n<=1)return;
    this.zoomIndex=(this.zoomIndex+dir+n)%n;
    this.renderZoom();
    this.switchTo(this.thumbs[this.zoomIndex]);
  }
  renderZoom(){
    let src='',alt='';
    if(this.thumbs.length){
      const thumb=this.thumbs[this.zoomIndex];
      if(thumb){src=thumb.dataset.mediaFull||thumb.dataset.mediaSrc||'';alt=thumb.dataset.mediaAlt||''}
    }
    /* Fallback: use the main image src (single-image product) */
    if(!src){
      const mainImg=this.main.querySelector('img');
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
    if(this.zoomPrev)this.zoomPrev.disabled=(this.thumbs.length<=1);
    if(this.zoomNext)this.zoomNext.disabled=(this.thumbs.length<=1);
  }
}
customElements.define('bt-product-gallery',BtProductGallery);
