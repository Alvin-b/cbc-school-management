#!/usr/bin/env node
/**
 * Internal debug helper used during incidents: normalise duplicated route bodies in a
 * hand-patched dist-worker/index.js copy.
 *
 * Canonical bodies are read from the committed worker bundle at `sites-worker.js`. If a
 * route body needs to change, fix `worker/src/index.js` and rebuild with
 * `npm run build:sites`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = `${__dirname}/../dist-worker/index.js`;
const BACKUP = `${__dirname}/../sites-worker.js`;

let src = readFileSync(SRC, 'utf8');
const committed = readFileSync(BACKUP, 'utf8');

function SliceBetween(text, needleStart, needleEnd) {
  const s = text.indexOf(needleStart);
  if (s === -1) return null;
  const t = text.slice(s);
  const e = t.indexOf(needleEnd, needleStart.length);
  if (e === -1) return null;
  return t.slice(0, e + needleEnd.length);
}

const OPTIONS_GATE_LINE = '  if (mutating && !isSameOriginRequest(request, env.APP_ORIGIN)) {';
const SESSION_LINE = '  if (path === "/api/session") {';
const LOGIN_LINE = '  if (path === "/api/auth/login" && method === "POST") {';

const OPTIONS_GATE = SliceBetween(committed, OPTIONS_GATE_LINE, '\n  }') || OPTIONS_GATE_LINE + '\n    return err(403, "BAD_ORIGIN", "Cross-origin request rejected");\n  }';
const SESSION = SliceBetween(committed, SESSION_LINE, '\n  }') || SESSION_LINE + '\n    const access2 = await accessFor(env, user, request);\n    return json(sessionPayload(access2, user));\n  }';
const LOGIN = SliceBetween(committed, LOGIN_LINE, '\n  }') || LOGIN_LINE + '\n    if (!isSameOriginRequest(request, env.APP_ORIGIN)) {\n      return err(403, "BAD_ORIGIN", "Cross-origin request rejected");\n    }\n    return staffLogin(env, request, body);\n  }';

// Collapse any line-bearing variant of these route bodies back to the canonical version.
function replaceFirstAll(text, re, replacement) {
  let out = text;
  let m;
  let changed = false;
  while ((m = re.exec(out)) !== null) {
    out = out.slice(0, m.index) + replacement + out.slice(m.index + m[0].length);
    changed = true;
    // only one replacement per site
    break;
  }
  return { out, changed };
}

const edits = [
  {
    label: 'origin gate',
    re: /\bif \(mutating && !isSameOriginRequest\(request, env\.APP_ORIGIN\)\) \{\s*(\/\/[^\n]*\n[ \t]*)?return err\(403, "BAD_ORIGIN", "Cross-origin request rejected"\);\n  \}/,
    replace: OPTIONS_GATE,
  },
  {
    label: 'session route',
    re: /\bif \(path === "\/api\/session"\) \{\s*(\/\/[^\n]*\n[ \t]*)?const access2 = await accessFor\(env, user, request\);\n[ \t]*return json\(sessionPayload\(access2, user\)\);\n  \}/,
    replace: SESSION,
  },
  {
    label: 'staff login origin check',
    re: /\bif \(path === "\/api\/auth\/login" && method === "POST"\) \{\s*\n[ \t]*if \(!isSameOriginRequest\(request, env\.APP_ORIGIN\)\) \{\n[ \t]*return err\(403, "BAD_ORIGIN", "Cross-origin request rejected"\);\n[ \t]*\}\s*(\/\/[^\n]*\n[ \t]*)?return staffLogin\(env, request, body\);\n  \}/,
    replace: LOGIN,
  },
];

let changed = false;
for (const edit of edits) {
  const { out, changed: c } = replaceFirstAll(src, edit.re, edit.replace);
  if (c) {
    src = out;
    changed = true;
  }
}

writeFileSync(SRC, src, 'utf8');
console.log(changed ? 'dist-worker/index.js normalized' : 'dist-worker/index.js already normalized');
