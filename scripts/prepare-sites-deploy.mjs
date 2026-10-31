#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

function run(cmd) {
  console.log('run:', cmd);
  execSync(`node "${join(ROOT, cmd)}"`, { stdio: 'inherit', cwd: ROOT });
}

run('scripts/build-worker.mjs');
run('scripts/patch-worker-bundle.mjs');
run('scripts/patch-manifest.mjs');
run('scripts/patch-worker-assets.mjs');

console.log('prepared deploy artifacts: dist/ + dist-worker/index.js + dist/sites/manifest.json');
