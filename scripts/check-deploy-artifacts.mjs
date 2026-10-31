import { readFileSync, readdirSync } from 'node:fs';

const html = readFileSync('dist/index.html', 'utf8');
const jshash = html.match(/assets\/index-[A-Za-z0-9_]+\.js/);
const csshash = html.match(/assets\/index-[A-Za-z0-9_]+\.css/);
console.log('dist/index.html refs => js:', jshash ? jshash[0] : 'NONE', 'css:', csshash ? csshash[0] : 'NONE');

const dir = readdirSync('dist/sites/assets');
console.log('dist/sites/assets names:', dir.filter(f => /index-/.test(f)).join(', '));

const html2 = readFileSync('dist/sites/assets/index.html', 'utf8');
const jshash2 = html2.match(/assets\/index-[A-Za-z0-9_]+\.js/);
const csshash2 = html2.match(/assets\/index-[A-Za-z0-9_]+\.css/);
console.log('dist/sites/assets/index.html refs => js:', jshash2 ? jshash2[0] : 'NONE', 'css:', csshash2 ? csshash2[0] : 'NONE');
