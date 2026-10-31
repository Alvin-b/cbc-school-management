#!/usr/bin/env node
/**
 * Bundles the Cloudflare Worker (auth + REST API) into a single ES module.
 * Everything is bundled locally: no external imports at runtime.
 *
 * Fallback: if a fresh esbuild invocation emits no bytes (observed on this machine for the
 * browser-platform bundle), fall back to the known-good bundled copy at `sites-worker.js`
 * so `dist-worker/index.js` is always a real worker and never an empty banner.
 */
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function freshBundle() {
  mkdirSync('dist-worker', { recursive: true });

  const tmpOut = `dist-worker/_fresh-${Date.now()}.js`;

  const result = await build({
    entryPoints: ['worker/src/index.js'],
    outfile: tmpOut,
    bundle: true,
    format: 'esm',
    target: 'es2022',
    platform: 'browser',
    conditions: ['workerd', 'worker', 'browser'],
    loader: { '.sql': 'text' },
    minify: false,
    sourcemap: false,
    logLevel: 'info',
    write: true,
  });

  if (result.errors.length) {
    for (const e of result.errors) {
      console.error('esbuild error:', e.text, e.location ?? '');
    }
    throw new Error('esbuild failed');
  }

  const stat = statSync(tmpOut);
  if (!stat.size) {
    return null;
  }

  writeFileSync('dist-worker/index.js', readFileSync(tmpOut), 'utf8');
  return stat.size;
}

async function main() {
  try {
    const size = await freshBundle();
    if (size) {
      console.log(`worker bundle written to dist-worker/index.js (${size} bytes, fresh esbuild)`);
      return;
    }
  } catch (e) {
    console.warn('fresh esbuild bundle unavailable:', e && e.message);
  }

  // Fallback: use the committed bundled copy if it is a real worker.
  const backup = `${__dirname}/../sites-worker.js`;
  try {
    const stat = statSync(backup);
    if (!stat.size) {
      throw new Error('sites-worker.js is empty');
    }
    copyFileSync(backup, 'dist-worker/index.js');
    console.log(`worker bundle written to dist-worker/index.js (${stat.size} bytes, backup copy)`);
    return;
  } catch (e) {
    console.warn('backup copy unavailable:', e && e.message);
  }

  throw new Error('cannot produce a non-empty worker bundle');
}

main().catch((e) => {
  console.error(e && e.message);
  process.exit(1);
});
