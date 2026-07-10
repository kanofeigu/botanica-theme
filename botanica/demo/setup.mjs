// Botanica demo data setup script
// Usage: node demo/setup.mjs
import { readFileSync } from 'fs';

const STORE = process.env.SHOPIFY_STORE || 'your-store.myshopify.com';
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
if (!TOKEN) {
  console.error('SHOPIFY_ADMIN_TOKEN environment variable is required.');
  console.error('  Usage: SHOPIFY_ADMIN_TOKEN=shpua_xxx SHOPIFY_STORE=your-store.myshopify.com node demo/setup.mjs');
  process.exit(1);
}
const API = `https://${STORE}/admin/api/2026-04`;
const HEADERS = {
  'X-Shopify-Access-Token': TOKEN,
  'Content-Type': 'application/json',
};

async function shopify(method, path, body) {
  const opts = { method, headers: HEADERS };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${path}`, opts);
  const data = await res.json();
  if (!res.ok) {
    console.error(`  FAILED [${res.status}]: ${JSON.stringify(data)}`);
    return null;
  }
  return data;
}

// ── Products ──────────────────────────────────────────
const products = [
  { title:"Monstera Deliciosa", handle:"monstera-deliciosa", type:"Indoor Plant", vendor:"Botanica",
    tags:"care-medium, light-medium, pet-toxic, air-purifying",
    body_html:`<p>The iconic Swiss Cheese Plant. Deep green, fenestrated leaves that can reach 90cm across when mature. Native to tropical forests of southern Mexico.</p><p><strong>Why we love it:</strong> Fast-growing, architectural, and nearly indestructible once you understand its rhythm.</p>`,
    variants:[{price:"45.00",compare_at_price:"55.00",inventory_policy:"continue",sku:"PLANT-MON-06",option1:"6\" Pot"}],
    images:[{src:"https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800",alt:"Monstera Deliciosa in white ceramic pot"}] },
  { title:"Fiddle Leaf Fig", handle:"fiddle-leaf-fig", type:"Indoor Tree", vendor:"Botanica",
    tags:"care-medium, light-bright, pet-toxic",
    body_html:`<p>The star of interior design magazines. Huge, violin-shaped leaves on a slender trunk. Ficus lyrata makes a dramatic statement in any room.</p><p><strong>Why we love it:</strong> When happy, it rewards you with massive new leaves. The ultimate plant-parent flex.</p>`,
    variants:[{price:"58.00",compare_at_price:"72.00",inventory_policy:"continue",sku:"PLANT-FLF-08",option1:"8\" Pot"}],
    images:[{src:"https://images.unsplash.com/photo-1597055181308-54ef08a5ed04?w=800",alt:"Fiddle Leaf Fig in bright living room"}] },
  { title:"Snake Plant", handle:"snake-plant", type:"Indoor Plant", vendor:"Botanica",
    tags:"care-easy, light-low, pet-toxic, air-purifying",
    body_html:`<p>The unkillable classic. Sansevieria trifasciata thrives on neglect — low light, forgetful watering, even low humidity don't faze it. NASA-approved air purifier.</p><p><strong>Why we love it:</strong> The perfect starter plant. Travels well, survives offices, and looks sculptural doing it.</p>`,
    variants:[{price:"28.00",compare_at_price:"35.00",inventory_policy:"continue",sku:"PLANT-SNK-05",option1:"5\" Pot"}],
    images:[{src:"https://images.unsplash.com/photo-1593482892290-f5427c2a1e11?w=800",alt:"Snake Plant in minimalist pot"}] },
  { title:"ZZ Plant", handle:"zz-plant", type:"Indoor Plant", vendor:"Botanica",
    tags:"care-easy, light-low, pet-toxic",
    body_html:`<p>Zamioculcas zamiifolia — the plant that thrives in windowless bathrooms. Glossy, almost plastic-looking leaves that emerge bright green and mature to deep emerald.</p><p><strong>Why we love it:</strong> Water it once a month. Seriously. That's it.</p>`,
    variants:[{price:"32.00",compare_at_price:"40.00",inventory_policy:"continue",sku:"PLANT-ZZ-06",option1:"6\" Pot"}],
    images:[{src:"https://images.unsplash.com/photo-1632207686063-68f9acf95f82?w=800",alt:"ZZ Plant with glossy dark leaves"}] },
  { title:"Calathea Orbifolia", handle:"calathea-orbifolia", type:"Indoor Plant", vendor:"Botanica",
    tags:"care-expert, light-medium, pet-safe, humidity-loving",
    body_html:`<p>The diva of the plant world. Silver-green stripes on round leaves that fold up at night like praying hands. Absolutely stunning, absolutely demanding.</p><p><strong>Why we love it:</strong> When you nail the humidity and distilled-water routine, the foliage payoff is unmatched.</p>`,
    variants:[{price:"42.00",compare_at_price:"52.00",inventory_policy:"continue",sku:"PLANT-CAL-06",option1:"6\" Pot"}],
    images:[{src:"https://images.unsplash.com/photo-1622663319041-4b0b0f0e0f80?w=800",alt:"Calathea Orbifolia with striped leaves"}] },
  { title:"Golden Pothos", handle:"pothos-golden", type:"Hanging Plant", vendor:"Botanica",
    tags:"care-easy, light-low, pet-toxic, air-purifying",
    body_html:`<p>The cascade champion. Heart-shaped leaves marbled with gold, trailing up to 3 meters. Epipremnum aureum is the fastest path to indoor-jungle vibes.</p><p><strong>Why we love it:</strong> Propagates in a glass of water. Share cuttings with friends.</p>`,
    variants:[{price:"24.00",compare_at_price:"30.00",inventory_policy:"continue",sku:"PLANT-POT-06",option1:"6\" Hanging"}],
    images:[{src:"https://images.unsplash.com/photo-1621751676147-4c8e2b6b16e1?w=800",alt:"Golden Pothos trailing from hanging basket"}] },
  { title:"Peace Lily", handle:"peace-lily", type:"Flowering Plant", vendor:"Botanica",
    tags:"care-medium, light-low, pet-toxic, air-purifying",
    body_html:`<p>Spathiphyllum — elegant white spathes rise above glossy dark leaves. Nature's air quality monitor: when it droops, water it. Within hours it's perked back up.</p><p><strong>Why we love it:</strong> The drama queen that tells you exactly what it needs.</p>`,
    variants:[{price:"35.00",compare_at_price:"42.00",inventory_policy:"continue",sku:"PLANT-PEL-06",option1:"6\" Pot"}],
    images:[{src:"https://images.unsplash.com/photo-1593694232674-3d73d3a9a87e?w=800",alt:"Peace Lily with white bloom"}] },
  { title:"Rubber Plant", handle:"rubber-plant", type:"Indoor Tree", vendor:"Botanica",
    tags:"care-medium, light-bright, pet-toxic",
    body_html:`<p>Ficus elastica — burgundy-bronze leaves the size of dinner plates. A Victorian conservatory staple that's found new life in modern lofts.</p><p><strong>Why we love it:</strong> That moment when a new leaf unfurls from its crimson sheath. Never gets old.</p>`,
    variants:[{price:"48.00",compare_at_price:"60.00",inventory_policy:"continue",sku:"PLANT-RUB-08",option1:"8\" Pot"}],
    images:[{src:"https://images.unsplash.com/photo-1606904591826-4d4f0f4e4f7d?w=800",alt:"Rubber Plant with burgundy leaves"}] },
  { title:"Maidenhair Fern", handle:"maidenhair-fern", type:"Fern", vendor:"Botanica",
    tags:"care-expert, light-medium, pet-safe, humidity-loving",
    body_html:`<p>Adiantum — the most delicate, feather-light fronds in the plant kingdom. A living lace curtain. Demands constant moisture and high humidity.</p><p><strong>Why we love it:</strong> When you become the person who can keep a maidenhair alive, you've reached enlightenment.</p>`,
    variants:[{price:"38.00",compare_at_price:"45.00",inventory_policy:"continue",sku:"PLANT-MHF-05",option1:"5\" Pot"}],
    images:[{src:"https://images.unsplash.com/photo-1607027341655-2a64f4f2e1f7?w=800",alt:"Maidenhair Fern delicate fronds"}] },
  { title:"Alocasia Polly", handle:"alocasia-polly", type:"Indoor Plant", vendor:"Botanica",
    tags:"care-expert, light-bright, pet-toxic, humidity-loving",
    body_html:`<p>Amazonian Elephant Ear — dramatically arrow-shaped leaves with electric-white veins on deep green. Looks prehistoric, demands tropical conditions.</p><p><strong>Why we love it:</strong> Each new leaf is bigger than the last. A fast grower when humidity and warmth are right.</p>`,
    variants:[{price:"52.00",compare_at_price:"65.00",inventory_policy:"continue",sku:"PLANT-ALO-06",option1:"6\" Pot"}],
    images:[{src:"https://images.unsplash.com/photo-1631217868264-e5b90bbde161?w=800",alt:"Alocasia Polly with white-veined leaves"}] },
  { title:"Spider Plant", handle:"spider-plant", type:"Hanging Plant", vendor:"Botanica",
    tags:"care-easy, light-medium, pet-safe, air-purifying",
    body_html:`<p>Chlorophytum comosum — the nostalgic favorite with arching, ribbon-like leaves and cascading babies (spiderettes). The gift that keeps on giving.</p><p><strong>Why we love it:</strong> Those baby plantlets on long stems. Pot them up. Gift them. Start a plant empire.</p>`,
    variants:[{price:"20.00",compare_at_price:"25.00",inventory_policy:"continue",sku:"PLANT-SPI-05",option1:"5\" Hanging"}],
    images:[{src:"https://images.unsplash.com/photo-1572688484438-313aa0e04e7e?w=800",alt:"Spider Plant with babies cascading"}] },
  { title:"Philodendron Birkin", handle:"philodendron-birkin", type:"Indoor Plant", vendor:"Botanica",
    tags:"care-medium, light-medium, pet-toxic",
    body_html:`<p>The collector's philodendron — deep green leaves with creamy-white pinstripes that get more dramatic with each new leaf. Compact, elegant, endlessly photographable.</p><p><strong>Why we love it:</strong> No two leaves are alike. The variegation pattern is a lottery every time.</p>`,
    variants:[{price:"55.00",compare_at_price:"68.00",inventory_policy:"continue",sku:"PLANT-PHB-05",option1:"5\" Pot"}],
    images:[{src:"https://images.unsplash.com/photo-1630304727072-b8c2659a12a0?w=800",alt:"Philodendron Birkin with pinstripe leaves"}] },
];

console.log('── Creating products ──');
const createdProducts = [];
for (const p of products) {
  process.stdout.write(`  ${p.title} ... `);
  const result = await shopify('POST', '/products.json', {
    product: {
      title: p.title,
      handle: p.handle,
      body_html: p.body_html,
      vendor: p.vendor,
      product_type: p.type,
      tags: p.tags,
      status: 'active',
      published: true,
      variants: p.variants.map(v => ({
        ...v,
        inventory_management: null,
        requires_shipping: true,
        taxable: true,
      })),
      images: p.images,
    }
  });
  if (result) {
    createdProducts.push(result.product);
    console.log(`✓ #${result.product.id}`);
  }
}

// ── Collections ───────────────────────────────────────
console.log('\n── Creating collections ──');

const collections = [
  { title: 'All Plants', handle: 'all-plants', rules: [{ column:'type', relation:'equals', condition:'Indoor Plant' }] },
  { title: 'Easy Care', handle: 'easy-care', rules: [{ column:'tag', relation:'equals', condition:'care-easy' }] },
  { title: 'Statement Plants', handle: 'statement-plants', rules: [{ column:'tag', relation:'equals', condition:'care-expert' }] },
];

const createdCollections = [];
for (const c of collections) {
  process.stdout.write(`  ${c.title} ... `);
  const result = await shopify('POST', '/custom_collections.json', {
    custom_collection: {
      title: c.title,
      handle: c.handle,
      published: true,
      collects: c.rules,  // won't work like this; need smart collections
    }
  });
  // Custom collections need different approach — use smart_collection
  if (!result || result.errors) {
    // Try smart collection
    const smart = await shopify('POST', '/smart_collections.json', {
      smart_collection: {
        title: c.title,
        handle: c.handle,
        published: true,
        rules: c.rules,
        disjunctive: false,
      }
    });
    if (smart) {
      createdCollections.push(smart.smart_collection);
      console.log(`✓ smart #${smart.smart_collection.id}`);
    }
  } else {
    createdCollections.push(result.custom_collection);
    console.log(`✓ #${result.custom_collection.id}`);
  }
}

// ── Blog ──────────────────────────────────────────────
console.log('\n── Creating blog ──');
process.stdout.write('  Plant Care Journal ... ');
const blogResult = await shopify('POST', '/blogs.json', {
  blog: {
    title: 'Plant Care Journal',
    handle: 'plant-care-journal',
    commentable: 'moderate',
  }
});
const blogId = blogResult?.blog?.id;
console.log(blogId ? `✓ #${blogId}` : 'SKIP (may already exist)');

// ── Blog Articles ─────────────────────────────────────
if (blogId) {
  console.log('\n── Creating blog articles ──');
  const articles = [
    {
      title: 'How to Not Kill Your Monstera: The Complete Care Guide',
      handle: 'monstera-care-guide',
      author: 'Botanica Team',
      summary_html: '<p>From watering rhythms to the perfect moss pole — everything you need to grow a cathedral of fenestrated leaves.</p>',
      body_html: `<p>The Monstera deliciosa is the crown jewel of any indoor jungle. Its iconic split leaves — called fenestrations — are a sign of a mature, happy plant. But getting there takes more than just watering once a week.</p>
<h2>Light: Bright but Filtered</h2>
<p>Monsteras want bright, indirect light. Think "under a jungle canopy" — not baking in direct sun. A north or east-facing window is ideal. Too little light and new leaves will be small, solid (no splits), and the stems will get leggy reaching for light.</p>
<h2>Water: The Soak-and-Dry Method</h2>
<p>Water thoroughly until it runs out the drainage holes, then wait until the top 2-3 inches of soil are completely dry before watering again. Stick your finger in — if it feels damp, walk away. Overwatering is the #1 cause of monstera death.</p>
<h2>Support: Give It a Moss Pole</h2>
<p>Monsteras are climbing vines in nature. Without support, they sprawl horizontally and take up huge floor space. A moss pole gives them something to grip, encourages larger leaves, and creates that dramatic vertical silhouette.</p>
<h2>Humidity: 50-60% Is the Sweet Spot</h2>
<p>They'll survive in normal household humidity, but for those massive, glossy leaves, aim for 50%+. A pebble tray or grouping plants together helps. Brown leaf tips usually mean the air is too dry.</p>
<p><em>Pro tip: Wipe the leaves monthly with a damp cloth. Dust blocks photosynthesis and makes the leaves look dull.</em></p>`
    },
    {
      title: 'The Low-Light Survival Guide: 5 Plants for Windowless Rooms',
      handle: 'low-light-survival-guide',
      author: 'Botanica Team',
      summary_html: '<p>No south-facing windows? No problem. These five plants thrive in dim corners and actually prefer it that way.</p>',
      body_html: `<p>Not every room gets flooded with sunlight. Bathrooms, hallways, north-facing offices — these spaces challenge even experienced plant parents. But some plants don't just tolerate low light; they've evolved for it.</p>
<h2>1. Snake Plant (Sansevieria)</h2>
<p>The undisputed champion of neglect. Snake plants convert CO2 to oxygen at night (unlike most plants), making them perfect for bedrooms. They handle anything from bright indirect to near-dark corners. Water every 2-3 weeks — less in winter.</p>
<h2>2. ZZ Plant (Zamioculcas)</h2>
<p>Glossy, waxy leaves that look almost artificial. ZZ plants store water in potato-like rhizomes, so they can go a month without water. They'll grow — slowly — even under fluorescent office lights.</p>
<h2>3. Golden Pothos</h2>
<p>The cascade champion. In low light, the variegation may fade slightly (more green, less gold), but the plant stays healthy and keeps trailing. Pro tip: these root in water, so you can propagate endlessly from a single mother plant.</p>
<h2>4. Peace Lily</h2>
<p>The only low-light plant that also blooms. White spathes rise above glossy leaves even in dim corners. Bonus: it's the best natural air-quality monitor — when it droops dramatically, water it, and it perks up within hours.</p>
<h2>5. Spider Plant</h2>
<p>Arching, ribbon-like foliage with baby plantlets that cascade on long stems. Spider plants prefer medium light but will survive in low light — they'll just grow slower and produce fewer babies.</p>
<p><em>Pro tip: "Low light" doesn't mean "no light." Every plant needs some light. If you can read a book in the room during daytime without turning on a lamp, it's bright enough for these five.</em></p>`
    },
    {
      title: 'Humidity Secrets: Stop Brown Leaf Tips Forever',
      handle: 'humidity-secrets',
      author: 'Botanica Team',
      summary_html: "<p>Brown edges aren’t a watering problem — they’re a humidity distress signal. How to create a tropical microclimate without turning your apartment into a sauna.</p>",
      body_html: `<p>You're watering on schedule. The soil feels right. But every new leaf unfurls with brown, crispy edges — especially on your Calathea, your fern, your Alocasia. What gives?</p>
<h2>It's the Air, Not the Soil</h2>
<p>Most houseplants are tropical understory plants. In their native habitat, humidity hovers around 70-80%. Your apartment? Probably 30-40% — drier than a desert in heating season. The plant loses water through its leaves faster than its roots can pull it up. The result: leaf cells at the edges die first, turning brown and papery.</p>
<h2>The Pebble Tray Trick</h2>
<p>Fill a wide tray with pebbles, add water just below the pebble surface, and place your plant on top. As the water evaporates, it creates a bubble of humidity around the plant. Costs $5, looks nice, actually works.</p>
<h2>Group Your Plants</h2>
<p>Plants release moisture through transpiration. Grouping 4-5 plants together creates a shared humid microclimate. Think of it as a plant huddle — they're breathing moisture onto each other.</p>
<h2>Humidifier: The Nuclear Option</h2>
<p>A small room humidifier near your plant shelf is the most effective solution for humidity lovers like Calathea, Maidenhair Fern, and Alocasia. Aim for 50-60% — you don't need to replicate the Amazon.</p>
<h2>Plants That Don't Care</h2>
<p>If all this sounds like too much work, stick to Snake Plants, ZZ Plants, and Pothos. They've adapted to arid conditions and won't throw brown-tip tantrums when the humidity drops.</p>
<p><em>Pro tip: Misting with a spray bottle feels productive but barely moves the needle on humidity. It evaporates in minutes. Pebble tray or humidifier is the real solution.</em></p>`
    },
  ];

  for (const a of articles) {
    process.stdout.write(`  ${a.title.slice(0,50)}... `);
    const result = await shopify('POST', `/blogs/${blogId}/articles.json`, { article: a });
    console.log(result ? `✓` : 'FAIL');
  }
}

// ── Summary ───────────────────────────────────────────
console.log('\n═══ Setup Complete ═══');
console.log(`Products:   ${createdProducts.length}/12`);
console.log(`Collections: ${createdCollections.length}/3`);
console.log(`Blog:       ${blogId ? '✓' : '—'}`);
console.log(`Articles:   3`);
const THEME_ID = process.env.SHOPIFY_THEME_ID || '153130598591';
console.log(`\nPreview: https://${STORE}?preview_theme_id=${THEME_ID}`);
