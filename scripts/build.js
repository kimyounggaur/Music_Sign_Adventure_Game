'use strict';
// This is a static Canvas app: validate its scripts/references and emit its web bundle.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
const entries = ['index.html','scene-remaster.js','harmonia-assets.js','comparison.html','comparison.css','comparison.js','asset-review.html','asset-review.css','asset-review.js','style-sheet.html','sw.js','manifest.webmanifest'];
for (const file of entries) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  if (file.endsWith('.js')) new vm.Script(source, { filename: file });
  if (file.endsWith('.html')) {
    for (const [, body] of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(body, { filename: file });
    for (const [, ref] of source.matchAll(/(?:src|href)="([^"?#]+)(?:[?#][^"]*)?"/g)) {
      if (!ref.startsWith('http') && !fs.existsSync(path.join(root, ref))) throw new Error(`Missing reference: ${file} -> ${ref}`);
    }
  }
  fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true });
  fs.copyFileSync(path.join(root, file), path.join(out, file));
}
let images = 0;
function copyImages(dir) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const relative = path.join(dir, entry.name);
    if (entry.isDirectory()) copyImages(relative);
    else if (/\.(png|jpe?g|webp|svg)$/i.test(entry.name)) {
      fs.mkdirSync(path.dirname(path.join(out, relative)), { recursive: true });
      fs.copyFileSync(path.join(root, relative), path.join(out, relative));
      images++;
    }
  }
}
copyImages('icons'); copyImages('01 Source');
copyImages('assets');
fs.copyFileSync(path.join(root,'assets/harmonia/atlas.json'),path.join(out,'assets/harmonia/atlas.json'));
console.log(`Static build passed: ${entries.length} web files, ${images} images. Output: dist/`);
