#!/usr/bin/env node
/** Batch-populate botanica.* metafields from product tags → metafieldsSet mutations */

import { readFileSync } from 'fs';

// Read from stdin or file argument
const input = process.argv[2]
  ? readFileSync(process.argv[2], 'utf8')
  : readFileSync(0, 'utf8');

const data = JSON.parse(input);
const products = data.data.products.edges.map(e => e.node);

// ── Tag → metafield mapping ──────────────────────────────────────
function extractMetafields(p) {
  const tags = new Set((p.tags || []).map(t => t.toLowerCase()));
  const mf = {};

  if (tags.has('care-easy'))    { mf.care_level = 'easy';    mf.difficulty = 'easy'; }
  if (tags.has('care-medium'))  { mf.care_level = 'moderate'; mf.difficulty = 'moderate'; }
  if (tags.has('care-expert'))  { mf.care_level = 'expert';   mf.difficulty = 'expert'; }

  if (tags.has('light-low'))    mf.light_needs = 'low';
  if (tags.has('light-medium')) mf.light_needs = 'medium';
  if (tags.has('light-bright')) mf.light_needs = 'bright';

  if (tags.has('water-3weeks'))  mf.water_needs = 'infrequent';
  if (tags.has('water-biweekly')) mf.water_needs = 'moderate';
  if (tags.has('water-weekly'))   mf.water_needs = 'regular';

  if (tags.has('size-statement'))      mf.plant_size = 'statement';
  else if (tags.has('size-floor'))     mf.plant_size = 'floor';
  else if (tags.has('size-desk'))      mf.plant_size = 'desk';
  else if (tags.has('size-mini'))      mf.plant_size = 'mini';

  if (tags.has('pet-safe'))   mf.pet_safe = 'true';
  if (tags.has('pet-toxic'))  mf.pet_safe = 'false';

  if (tags.has('air-purifying')) mf.air_purifying = 'true';

  const colors = [];
  for (const t of tags) if (t.startsWith('color-')) colors.push(t.replace('color-', ''));
  if (colors.length) mf.plant_color = colors.join(',');

  const habits = [];
  if (tags.has('vine-trailing'))   habits.push('trailing');
  if (tags.has('bushy'))           habits.push('bushy');
  if (tags.has('tall-upward'))     habits.push('upright');
  if (tags.has('upright-rosette')) habits.push('rosette');
  if (habits.length) mf.growth_habit = habits.join(',');

  const placements = [];
  if (tags.has('hanging-plant'))    placements.push('hanging');
  if (tags.has('shelf-plant'))      placements.push('shelf');
  if (tags.has('windowsill-plant')) placements.push('windowsill');
  if (tags.has('floor-plant'))      placements.push('floor');
  if (tags.has('tabletop-plant'))   placements.push('tabletop');
  if (placements.length) mf.placement = placements.join(',');

  return mf;
}

// ── Build metafieldsSet inputs ────────────────────────────────────
const namespace = 'botanica';
const metafieldsInput = [];

for (const p of products) {
  const mf = extractMetafields(p);
  const entries = Object.entries(mf);
  if (entries.length === 0) continue;
  metafieldsInput.push({
    ownerId: p.id,
    metafields: entries.map(([key, value]) => ({
      namespace,
      key,
      value,
      type: 'single_line_text_field'
    }))
  });
}

// Stats
console.log(JSON.stringify({
  totalProducts: products.length,
  withMetafields: metafieldsInput.length,
  withoutMetafields: products.length - metafieldsInput.length,
  totalMetafieldValues: metafieldsInput.reduce((s, m) => s + m.metafields.length, 0),
  first3: metafieldsInput.slice(0, 3)
}, null, 2));
