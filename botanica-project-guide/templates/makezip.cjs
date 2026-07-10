// makezip.cjs — Create Shopify theme zip with forward-slash paths
// Usage: node makezip.cjs
// Configure: edit SOURCE (theme directory) and OUTPUT (zip file path) below

const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const SOURCE = 'botanica';            // ← change to your theme directory
const OUTPUT = 'theme.zip';           // ← change output filename

// Files/directories to EXCLUDE from the zip
const EXCLUDE = [
    'release-notes.md',    // disallowed for unpublished themes
    'SUBMISSION.md',
    'CLAUDE.md',
    'LOOP.md',
    'PLAN.md',
    'CONTRACTS.md',
    'AGENTS.md',
    'STATE.md',
    'STATE.json',
    'demo',
    'screenshots',
    'node_modules',
    '.git',
    '.vscode',
    '.DS_Store',
    'Thumbs.db',
];

if (fs.existsSync(OUTPUT)) fs.unlinkSync(OUTPUT);

const zip = new AdmZip();
let count = 0;

function addDir(dir, zipPrefix) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
        const full = path.join(dir, item.name);
        const zipPath = zipPrefix ? `${zipPrefix}/${item.name}` : item.name;

        if (item.isDirectory()) {
            addDir(full, zipPath);
        } else {
            zip.addFile(zipPath, fs.readFileSync(full));
            count++;
        }
    }
}

console.log('Adding files...');
addDir(SOURCE, '');
console.log(`Packed ${count} files`);

zip.writeZip(OUTPUT);
const kb = Math.round(fs.statSync(OUTPUT).size / 1024);
console.log(`Written: ${OUTPUT} (${kb} KB)`);
