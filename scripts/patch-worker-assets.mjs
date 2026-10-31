import { readFileSync, writeFileSync } from 'node:fs';

const p = 'dist-worker/index.js';
let s = readFileSync(p, 'utf8');

// Force staff cookie SameSite=None so the cookie survives the Freebuff redirect
// back to the app domain on cross-site sign-in. deployScripts is on HTTPS so the
// Secure flag stays valid; we only relax SameSite here.
s = s.replace(
  "const sameSite = isSecureOrigin ? \"None\" : \"Lax\";",
  "const sameSite = 'None';"
);

writeFileSync(p, s, 'utf8');
console.log('Patched dist-worker/index.js SameSite to None');
