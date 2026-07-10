#!/usr/bin/env node
/**
 * Fetch products, map tags → botanica metafields, execute metafieldsSet in batches.
 */
const TOKEN = 'shpua_624e7e09a55bd1ab57c41204bbe28cb6';
const API = 'https://kano-u93kwgf9.myshopify.com/admin/api/2025-01/graphql.json';
const BATCH = 25;

// ── Tag mapping ─────────────────────────────────────────────────
function extract(p) {
  const t = new Set((p.tags || []).map(s => s.toLowerCase()));
  const m = {};
  if (t.has('care-easy'))    { m.care_level='easy';    m.difficulty='easy'; }
  if (t.has('care-medium'))  { m.care_level='moderate'; m.difficulty='moderate'; }
  if (t.has('care-expert'))  { m.care_level='expert';   m.difficulty='expert'; }
  if (t.has('light-low')) m.light_needs='low';
  if (t.has('light-medium')) m.light_needs='medium';
  if (t.has('light-bright')) m.light_needs='bright';
  if (t.has('water-3weeks')) m.water_needs='infrequent';
  if (t.has('water-biweekly')) m.water_needs='moderate';
  if (t.has('water-weekly')) m.water_needs='regular';
  if (t.has('size-statement')) m.plant_size='statement';
  else if (t.has('size-floor')) m.plant_size='floor';
  else if (t.has('size-desk')) m.plant_size='desk';
  else if (t.has('size-mini')) m.plant_size='mini';
  if (t.has('pet-safe')) m.pet_safe='true';
  if (t.has('pet-toxic')) m.pet_safe='false';
  if (t.has('air-purifying')) m.air_purifying='true';
  const colors = [...t].filter(s => s.startsWith('color-')).map(s => s.slice(6));
  if (colors.length) m.plant_color = colors.join(',');
  const habits = [];
  if (t.has('vine-trailing')) habits.push('trailing');
  if (t.has('bushy')) habits.push('bushy');
  if (t.has('tall-upward')) habits.push('upright');
  if (t.has('upright-rosette')) habits.push('rosette');
  if (habits.length) m.growth_habit = habits.join(',');
  const placements = [];
  if (t.has('hanging-plant')) placements.push('hanging');
  if (t.has('shelf-plant')) placements.push('shelf');
  if (t.has('windowsill-plant')) placements.push('windowsill');
  if (t.has('floor-plant')) placements.push('floor');
  if (t.has('tabletop-plant')) placements.push('tabletop');
  if (placements.length) m.placement = placements.join(',');
  return m;
}

// ── Execution ───────────────────────────────────────────────────
async function main() {
  // Step 1 — fetch products
  console.error('Fetching products...');
  const q1 = '{ products(first: 69) { edges { node { id title tags } } } }';
  const products = (await gql(q1)).data.products.edges.map(e => e.node);
  console.error(`Got ${products.length} products`);

  // Step 2 — map tags → metafields
  const allMF = [];
  for (const p of products) {
    const mf = extract(p);
    for (const [k, v] of Object.entries(mf)) {
      allMF.push({ ownerId: p.id, namespace: 'botanica', key: k, value: v, type: 'single_line_text_field' });
    }
  }
  console.error(`${allMF.length} metafield values to write`);

  // Step 3 — execute in batches
  let ok = 0, fail = 0;
  for (let i = 0; i < allMF.length; i += BATCH) {
    const batch = allMF.slice(i, i + BATCH);
    const batchNum = Math.floor(i / BATCH) + 1;
    const totalBatches = Math.ceil(allMF.length / BATCH);
    console.error(`Batch ${batchNum}/${totalBatches}...`);

    const q = `mutation setMf($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { id key value }
    userErrors { field message }
  }
}`;
    const r = await gql(q, { metafields: batch });
    const mfs = r?.data?.metafieldsSet?.metafields;
    const errs = r?.data?.metafieldsSet?.userErrors || [];
    const written = Array.isArray(mfs) ? mfs.length : 0;
    if (errs.length) {
      console.error(`  ⚠ ${errs.length} errors:`, JSON.stringify(errs));
      fail += errs.length;
    }
    if (written === 0 && errs.length === 0) {
      console.error(`  ⚠ unexpected empty response:`, JSON.stringify(r).slice(0, 200));
    }
    ok += written;
  }
  console.error(`Done: ${ok} written, ${fail} errors`);
}

async function gql(query, variables) {
  const body = { query };
  if (variables) body.variables = variables;
  const r = await fetch(API, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return r.json();
}

main().catch(e => { console.error(e.message); process.exit(1); });
