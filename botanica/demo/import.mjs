// Botanica demo importer — skips existing handles, creates only new ones
// Usage: cd E:/ccfold/shopify/botanica && node demo/import.mjs
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';

const STORE = 'kano-u93kwgf9.myshopify.com';

function gqlExec(gqlFile) {
  return execSync(
    `shopify store execute -s ${STORE} --query-file ${gqlFile} --allow-mutations --json`,
    { encoding: 'utf8', timeout: 30000, stdio: 'pipe' }
  );
}

// Get existing handles
writeFileSync('demo/_q.gql',
  'query { products(first: 100, query: "vendor:Botanica") { nodes { handle } } }', 'utf8');
const qr = JSON.parse(gqlExec('demo/_q.gql'));
const existing = new Set(qr.products.nodes.map(n => n.handle));
unlinkSync('demo/_q.gql');
console.log(`Found ${existing.size} existing Botanica products\n`);

// Parse CSV
const csv = readFileSync('demo/products.csv', 'utf8');
const rows = csv.trim().split('\n').slice(1);

let ok = 0, skip = 0, fail = 0;

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  const cols = [];
  let cur = '', q = false;
  for (const ch of row) {
    if (ch === '"') { q = !q; continue; }
    if (ch === ',' && !q) { cols.push(cur); cur = ''; continue; }
    cur += ch;
  }
  cols.push(cur);

  const [handle, title, bodyHtml, vendor, type, tags, , optName, optVal, sku, price, compareAt] = cols;

  if (existing.has(handle)) {
    skip++;
    console.log(`${i+1}/${rows.length} ${title.slice(0,45).padEnd(46)} ⏭ exists`);
    continue;
  }

  const tagStr = tags.split(',').map(t => `"${t.trim()}"`).filter(Boolean).join(', ');
  const desc = (bodyHtml || '').replace(/"/g, '\\"').replace(/\n/g, ' ').replace(/\\/g, '\\\\');
  const safeTitle = title.replace(/"/g, '\\"').replace(/\\/g, '\\\\');
  const safeVal = optVal.replace(/"/g, '\\"').replace(/\\/g, '\\\\');

  // Step 1: Create product
  const step1 = `mutation {
  productCreate(product: {
    handle: "${handle}"
    title: "${safeTitle}"
    descriptionHtml: "${desc}"
    vendor: "${vendor}"
    productType: "${type}"
    tags: [${tagStr}]
    status: ACTIVE
  }) {
    product { id variants(first: 1) { nodes { id } } }
    userErrors { field message }
  }
}`;

  process.stdout.write(`${i+1}/${rows.length} ${title.slice(0,45).padEnd(46)} `);

  try {
    writeFileSync('demo/_1.gql', step1, 'utf8');
    const r1 = JSON.parse(gqlExec('demo/_1.gql'));
    const errs = r1?.productCreate?.userErrors;
    if (errs?.length > 0) throw new Error(errs.map(e => e.message).join('; '));

    const productId = r1.productCreate.product.id;
    const variantId = r1.productCreate.product.variants.nodes[0].id;

    // Step 2: Set variant price
    const step2 = `mutation {
  productVariantsBulkCreate(
    productId: "${productId}"
    variants: [{
      price: "${price}"
      compareAtPrice: ${compareAt && compareAt !== '0' ? `"${compareAt}"` : 'null'}
      sku: "${sku}"
      optionValues: [{optionName: "${optName || 'Size'}", name: "${safeVal}"}]
      requiresShipping: true
      taxable: true
    }]
    strategy: REMOVE_STANDALONE_VARIANT
  ) {
    productVariants { id price }
    userErrors { field message }
  }
}`;

    writeFileSync('demo/_2.gql', step2, 'utf8');
    const r2 = JSON.parse(gqlExec('demo/_2.gql'));
    const errs2 = r2?.productVariantsBulkCreate?.userErrors;
    if (errs2?.length > 0) throw new Error(errs2.map(e => e.message).join('; '));

    ok++;
    existing.add(handle);
    console.log('✓');
  } catch (e) {
    fail++;
    const msg = e.message.slice(0,100).replace(/\n/g, ' ');
    console.log(`✗ ${msg}`);
  }
}

try { unlinkSync('demo/_1.gql'); unlinkSync('demo/_2.gql'); } catch {}
console.log(`\nDone: ${ok} created, ${skip} skipped, ${fail} failed`);
