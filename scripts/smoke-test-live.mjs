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
    method: init?.method || 'GET',
    status: res.status,
    contentType: res.headers.get('content-type') || '',
    body: text,
  };
}

async function main() {
  const loginPost = await fetchText(BASE + '/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'alvina', password: 'guess' }),
  });
  const loginOptions = await fetchText(BASE + '/api/auth/login', {
    headers: {
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
      Origin: BASE,
    },
    method: 'OPTIONS',
  });
  const session = await fetchText(BASE + '/api/session', { credentials: 'include' });

  console.log(JSON.stringify(loginPost));
  console.log(JSON.stringify(loginOptions));
  console.log(JSON.stringify(session));

  const problems = [];
  if (loginPost.status === 405) {
    problems.push(`/api/auth/login POST returned 405. The deployed worker still cannot handle that route.`);
  } else if (loginPost.status !== 200 && loginPost.status !== 400 && loginPost.status !== 401 && loginPost.status !== 500) {
    problems.push(`/api/auth/login POST returned ${loginPost.status} — unexpected.`);
  }
  if (loginOptions.status !== 200 && loginOptions.status !== 405) {
    problems.push(`/api/auth/login OPTIONS returned ${loginOptions.status} — unexpected.`);
  }
  if (!session.contentType.includes('application/json')) {
    problems.push(`/api/session returned content-type ${session.contentType} (expected JSON). This is the usual cause of the Freebuff loop-back if it is returning HTML.`);
  }

  if (problems.length) {
    console.log('');
    console.log('PROBLEMS:');
    for (const p of problems) console.log(' -', p);
    console.log('');
    console.log('RESULT: FAIL — sign-in endpoints still misbehaving');
    process.exit(1);
  }

  console.log('');
  console.log('RESULT: PASS — /api/auth/login accepts POST and /api/session returns JSON');
}

main().catch((e) => {
  console.error('SMOKE SCRIPT ERROR:', e && e.message);
  process.exit(1);
});
