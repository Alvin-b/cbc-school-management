#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const WORKER = join(ROOT, 'dist-worker/index.js');

const s = readFileSync(WORKER, 'utf8');

// The freshly built worker uses env.ASSETS as the catch-all for non-API paths,
// which would serve index.html for /assets/index-*.js/css and break those URLs.
// Restore an explicit /assets/ branch that proxies straight to env.ASSETS.
const assetBranch = `    if (url.pathname.startsWith("/assets/")) {
      const res = await env.ASSETS.fetch(request);
      if (res.status === 404) {
        return new Response("Not found", { status: 404 });
      }
      return res;
    }
`;

const needle = '    if (url.pathname.startsWith("/api/")) {';
const idx = s.indexOf(needle);
if (idx < 0) throw new Error('could not locate /api/ branch in worker bundle');

const out = s.slice(0, idx) + assetBranch + s.slice(idx);
writeFileSync(WORKER, out, 'utf8');

console.log('patched worker asset routing:', WORKER);
console.log('bytes:', out.length);
console.log('has /assets/ branch:', out.includes('url.pathname.startsWith("/assets/")'));
