#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DIST = join(ROOT, 'dist');
const ASSETS = join(DIST, 'assets');
const MANIFEST_DIR = join(DIST, 'sites');
const MANIFEST = join(MANIFEST_DIR, 'manifest.json');

mkdirSync(MANIFEST_DIR, { recursive: true });

const html = readFileSync(join(DIST, 'index.html'), 'utf8');

const jsMatch = html.match(/"\/assets\/(index-[a-zA-Z0-9]+\.js)"/);
const cssMatch = html.match(/"\/assets\/(index-[a-zA-Z0-9]+\.css)"/);

if (!jsMatch || !cssMatch) {
  console.error('Could not find hashed index JS/CSS in dist/index.html');
  console.log('jsMatch:', jsMatch ? jsMatch[1] : null);
  console.log('cssMatch:', cssMatch ? cssMatch[1] : null);
  process.exit(1);
}

const jsName = jsMatch[1];
const cssName = cssMatch[1];

const files = readdirSync(ASSETS);
const present = {
  js: files.includes(jsName),
  css: files.includes(cssName),
};

if (!present.js || !present.css) {
  console.error('Hashed asset referenced in index.html is missing from dist/assets/');
  console.log('js present:', present.js, jsName);
  console.log('css present:', present.css, cssName);
  process.exit(1);
}

const manifest = {
  entrypoint: 'index.js',
  compatibilityDate: '2025-06-01',
  modules: [
    {
      name: 'index.js',
      type: 'esm',
      path: './dist-worker/index.js',
    },
  ],
  assetsDirectory: './dist',
  spa: true,
  _pinnedFrom: process.cwd(),
  _htmlAssetRefs: {
    js: jsName,
    css: cssName,
  },
};

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log('wrote', MANIFEST);
console.log('manifest:', JSON.stringify(manifest, null, 2));
