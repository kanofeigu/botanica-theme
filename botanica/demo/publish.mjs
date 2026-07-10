const TOKEN='shpua_0f2bfbcbdc39f57bc98df223e1f48ffb';
const API='https://kano-u93kwgf9.myshopify.com/admin/api/2026-04';

const all=await fetch(API+'/products.json?vendor=Botanica&limit=80&fields=id,title',{
  headers:{'X-Shopify-Access-Token':TOKEN}
});
const products=(await all.json()).products;
console.log('Publishing',products.length,'products...\n');

let ok=0,fail=0;
for(const p of products){
  process.stdout.write(p.title.slice(0,45).padEnd(46)+' ');
  const r=await fetch(API+'/products/'+p.id+'.json',{
    method:'PUT',
    headers:{'X-Shopify-Access-Token':TOKEN,'Content-Type':'application/json'},
    body:JSON.stringify({product:{id:p.id,published:true}})
  });
  if(r.ok){ok++;console.log('✓');}
  else{fail++;console.log('✗');}
}
console.log('\nDone:',ok,'published,',fail,'failed');
