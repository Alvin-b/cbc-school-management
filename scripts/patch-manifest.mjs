import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const manifestPath = 'dist/sites/manifest.json';
let m = readFileSync(manifestPath, 'utf8');

// Normalise broken field siblings: prefer a valid schema shape.
const fixed = m
  .replace(/"entries":/g, '"modules":')
  .replace(/"assetsDirectory":/g, '"assetsDirectory":');

// If an assets array already exists and is valid, keep it; otherwise rebuild.
const assetsDir = 'dist/sites/assets';
const names = readdirSync(assetsDir);
const jsFile = names.find(f => /^index-.*\.js$/.test(f));
const cssFile = names.find(f => /^index-.*\.css$/.test(f));
const icoFile = names.find(f => /^favicon\.ico$/i.test(f));

const desiredAssets = [
  ...(jsFile ? [{ path: `/assets/${jsFile}`, contentType: 'application/javascript' }] : []),
  ...(cssFile ? [{ path: `/assets/${cssFile}`, contentType: 'text/css' }] : []),
  ...(icoFile ? [{ path: `/favicon.ico`, contentType: 'image/x-icon' }] : []),
];

const hasValidAssetsArray = desiredAssets.length && /"assets":\s*\[[\s\S]*?\]/.test(fixed);
let out;
if (hasValidAssetsArray) {
  out = fixed;
} else {
  out = fixed.replace(/"spa":\s*true/, () =>
    JSON.stringify({ assets: desiredAssets, spa: true }, null, 2)
  );
}

writeFileSync(manifestPath, out);
console.log('patched manifest -> js:', jsFile, 'css:', cssFile, 'ico:', icoFile);
console.log(readFileSync(manifestPath, 'utf8'));
