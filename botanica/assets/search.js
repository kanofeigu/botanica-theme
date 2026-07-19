/* Botanica v3 — Predictive Search
   Panel lives in layout/theme.liquid (<bt-predictive-search>),
   toggled from the header search icon ([data-search-toggle]).
   Suggest endpoint: /search/suggest.json (returns JSON). */
class BtPredictiveSearch extends HTMLElement {
  constructor(){super();this.controller=null}
  connectedCallback(){
    this.input=this.querySelector('input[type="search"]');
    this.results=this.querySelector('.bt-predictive-results');
    this.closeBtn=this.querySelector('[data-predictive-close]');
    this.toggle=document.querySelector('[data-search-toggle]');
    if(!this.input||!this.results)return;
    this.input.addEventListener('input',this.debounce(this.onInput.bind(this),250));
    this.input.addEventListener('focus',()=>this.onInput());
    if(this.toggle){
      this.toggle.addEventListener('click',e=>{
        e.preventDefault();
        this.hidden?this.openPanel():this.closePanel();
      });
    }
    if(this.closeBtn)this.closeBtn.addEventListener('click',()=>this.closePanel());
    this.addEventListener('keydown',e=>{if(e.key==='Escape')this.closePanel()});
    document.addEventListener('click',e=>{
      if(this.hidden)return;
      if(this.contains(e.target))return;
      if(this.toggle&&this.toggle.contains(e.target))return;
      this.closePanel();
    });
  }
  openPanel(){
    this.hidden=false;
    if(this.toggle)this.toggle.setAttribute('aria-expanded','true');
    setTimeout(()=>{if(this.input)this.input.focus()},50);
  }
  closePanel(){
    if(this.hidden)return;
    this.hidden=true;
    if(this.results)this.results.hidden=true;
    if(this.toggle){
      this.toggle.setAttribute('aria-expanded','false');
      if(this.contains(document.activeElement))this.toggle.focus();
    }
  }
  debounce(fn,d){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),d)}}
  esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  async onInput(){
    const q=this.input?.value?.trim();
    if(!q||q.length<2){if(this.results){this.results.innerHTML='';this.results.hidden=true}return}
    if(this.controller)this.controller.abort();
    this.controller=new AbortController();
    try{
      const r=await fetch('/search/suggest.json?q='+encodeURIComponent(q)+'&resources[type]=product&resources[limit]=6',{signal:this.controller.signal});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const d=await r.json();
      this.render((d.resources&&d.resources.results&&d.resources.results.products)||[]);
    }catch(e){if(e.name!=='AbortError')console.warn('Search:',e)}
  }
  formatPrice(price){
    if(price==null||price==='')return '';
    const cents=Math.round(parseFloat(price)*100);
    if(isNaN(cents))return this.esc(price);
    if(window.Shopify&&typeof window.Shopify.formatMoney==='function'){
      return window.Shopify.formatMoney(cents,(window.theme&&window.theme.moneyFormat)||'${{amount}}');
    }
    return '$'+(cents/100).toFixed(2);
  }
  render(products){
    if(!this.results)return;
    if(!products.length){this.results.innerHTML='';this.results.hidden=true;return}
    this.results.innerHTML=products.map(p=>{
      const title=this.esc(p.title);
      const img=p.featured_image?(typeof p.featured_image==='string'?p.featured_image:(p.featured_image.url||'')):'';
      const price=this.formatPrice(p.price);
      return '<li class="bt-predictive-item"><a href="'+this.esc(p.url)+'">'
        +(img?'<img src="'+this.esc(img)+'" alt="'+title+'" loading="lazy" width="48" height="48">':'')
        +'<div><span>'+title+'</span>'+(price?'<span>'+price+'</span>':'')+'</div></a></li>';
    }).join('');
    this.results.hidden=false;
  }
}
customElements.define('bt-predictive-search',BtPredictiveSearch);
