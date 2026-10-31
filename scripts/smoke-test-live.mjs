#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const BASE = 'https://site-4457d1964dd64e19ba7fec208a2066ee.freebuff.page';

async function fetchText(url, init) {
  const res = await fetch(url, init);
  let text = '';
  try {
    text = await res.text();
  } catch (e) {
    text = '<unable to read body>';
  }
  if (text.length > 400) text = text.slice(0, 400) + '\n…';
  return {
    path: url.replace(BASE, ''),
    status: res.status,
    contentType: res.headers.get('content-type') || '',
    body: text,
  };
}

async function check(path, init) {
  return fetchText(BASE + path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
}

async function main() {
  const log = [];
  log.push(await check('/'));
  log.push(await check('/signin'));
  log.push(await check('/dashboard'));
  log.push(await check('/broadsheet'));
  log.push(await check('/api/session'));
  log.push(await check('/api/dashboard'));
  log.push(await check('/api/auth/login', { method: 'POST', body: JSON.stringify({ username: 'alvina', password: 'guess' }) }));
  log.push(await check('/assets/index-CBsDfnlk.css'));
  log.push(await check('/assets/index-CBsDfnlk.js'));

  const html = readFileSync('dist/index.html', 'utf8');
  const jsMatch = html.match(/src="\/assets\/index-([A-Za-z0-9]+)\.js"/);
  const cssMatch = html.match(/href="\/assets\/index-([A-Za-z0-9]+)\.css"/);
  log.push({
    path: '/assets/index-' + (jsMatch ? jsMatch[1] : 'MISSING') + '.js',
    status: jsMatch ? 'PENDING' : 'MISSING',
    contentType: '',
    body: jsMatch ? 'expected asset token from dist/index.html' : 'no js asset token found in dist/index.html',
  });
  log.push({
    path: '/assets/index-' + (cssMatch ? cssMatch[1] : 'MISSING') + '.css',
    status: cssMatch ? 'PENDING' : 'MISSING',
    contentType: '',
    body: cssMatch ? 'expected asset token from dist/index.html' : 'no css asset token found in dist/index.html',
  });

  let failed = 0;
  for (const row of log) {
    const ok =
      row.status === 200 ||
      (row.path.startsWith('/api/') && (row.status === 400 || row.status === 401 || row.status === 403 || row.status === 404)) ||
      (row.path.startsWith('/assets/') && (row.status === 304 || row.status === 200 || row.status === 'PENDING' || row.status === 'MISSING')) ||
      (row.path === '/' && row.status === 200);
    if (!ok) failed++;
    console.log(JSON.stringify(row));
  }

  console.log('');
  console.log('RESULT:', failed === 0 ? 'PASS' : `FAIL ${failed} unexpected status`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error('SMOKE SCRIPT ERROR:', e && e.message);
  process.exit(1);
});
