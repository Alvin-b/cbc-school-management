import { readFileSync, writeFileSync, readdirSync, cpSync, mkdirSync } from 'node:fs';

// 1. Rebuild worker from source (uses existing build-worker.mjs).
import { execSync } from 'node:child_process';
console.log('rebuilding worker...');
execSync('node scripts/build-worker.mjs', { stdio: 'inherit' });

// 2. Sync site bundle used for deployment.
const sitesAssets = 'dist/sites/assets';
mkdirSync(sitesAssets, { recursive: true });
cpSync('dist/index.html', `${sitesAssets}/index.html`, { force: true });
for (const name of readdirSync('dist/assets')) {
  if (name.startsWith('index-')) cpSync(`dist/assets/${name}`, `${sitesAssets}/${name}`, { force: true });
}
console.log('synced dist/sites/assets');

// 3. Write a clean manifest that pins the exact hashed assets on disk.
const names = readdirSync(sitesAssets);
const jsFile = names.find(f => /^index-.*\.js$/.test(f));
const cssFile = names.find(f => /^index-.*\.css$/.test(f));
const icoFile = names.find(f => /^favicon\.ico$/i.test(f));

const manifest = {
  entrypoint: 'index.js',
  compatibilityDate: '2025-10-15',
  modules: [
    { name: 'index.js', type: 'esm', path: './dist-worker/index.js' }
  ],
  assetsDirectory: './dist/sites/assets',
  assets: [
    ...(jsFile ? [{ path: `/assets/${jsFile}`, contentType: 'application/javascript' }] : []),
    ...(cssFile ? [{ path: `/assets/${cssFile}`, contentType: 'text/css' }] : []),
    ...(icoFile ? [{ path: '/favicon.ico', contentType: 'image/x-icon' }] : [])
  ],
  spa: true,
};

writeFileSync('dist/sites/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
console.log('wrote dist/sites/manifest.json');
console.log('assets pinned -> js:', jsFile, 'css:', cssFile, 'ico:', icoFile);
console.log(readFileSync('dist/sites/manifest.json', 'utf8'));
