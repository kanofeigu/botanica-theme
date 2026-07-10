/* Botanica v3 — Predictive Search (original, ≤3KB) */
class BtPredictiveSearch extends HTMLElement {
  constructor(){super();this.controller=null}
  connectedCallback(){
    this.input=this.querySelector('input[type="search"]');
    this.results=this.querySelector('.bt-predictive-results');
    if(!this.input||!this.results)return;
    this.input.addEventListener('input',this.debounce(this.onInput.bind(this),250));
    this.input.addEventListener('focus',()=>this.onInput());
    document.addEventListener('click',e=>{if(this.results&&!this.contains(e.target))this.results.hidden=true});
  }
  debounce(fn,d){let t;return(...a)=>{clearTimeout(t);t=setTimeout(()=>fn(...a),d)}}
  async onInput(){
    const q=this.input?.value?.trim();
    if(q.length<2){if(this.results){this.results.innerHTML='';this.results.hidden=true}return}
    if(this.controller)this.controller.abort();
    this.controller=new AbortController();
    try{
      const r=await fetch('/search/suggest?q='+encodeURIComponent(q)+'&resources[type]=product&resources[limit]=6',{signal:this.controller.signal});
      if(!r.ok)return;
      const d=await r.json();
      this.render(d.resources?.results?.products||[]);
    }catch(e){if(e.name!=='AbortError')console.warn('Search:',e)}
  }
  render(products){
    if(!this.results)return;
    if(!products.length){this.results.hidden=true;return}
    this.results.innerHTML=products.map(p=>'<li class="bt-predictive-item"><a href="'+p.url+'">'+(p.featured_image?'<img src="'+p.featured_image+'" alt="'+p.title+'" loading="lazy" width="60" height="60">':'')+'<div><span>'+p.title+'</span>'+(p.price?'<span>'+p.price+'</span>':'')+'</div></a></li>').join('');
    this.results.hidden=false;
  }
}
customElements.define('bt-predictive-search',BtPredictiveSearch);
