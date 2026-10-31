#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const SRC = 'dist-worker/index.js';
let src = readFileSync(SRC, 'utf8');

const ORIGIN_GATE_CANONICAL =
  '  if (mutating && !isSameOriginRequest(request, env.APP_ORIGIN)) {\n    return err(403, "BAD_ORIGIN", "Cross-origin request rejected");\n  }';

const SESSION_CANONICAL =
  `  if (path === "/api/session") {\n    const access2 = await accessFor(env, user, request);\n    return json(sessionPayload(access2, user));\n  }`;

const LOGIN_ORIGIN_CANONICAL =
  `  if (path === "/api/auth/login" && method === "POST") {\n    if (!isSameOriginRequest(request, env.APP_ORIGIN)) {\n      return err(403, "BAD_ORIGIN", "Cross-origin request rejected");\n    }\n    return staffLogin(env, request, body);\n  }`;

const edits = [
  {
    label: 'origin gate',
    find: `  if (mutating && !isSameOriginRequest(request, env.APP_ORIGIN)) {\n    // Sites that serve API responses for a different origin still need to let the\n    // staff sign-in form and session refresh through.\n    return err(403, "BAD_ORIGIN", "Cross-origin request rejected");\n  }`,
    replace: ORIGIN_GATE_CANONICAL,
  },
  {
    label: 'session route',
    find: `  if (path === "/api/session") {\n    // A session read is an authenticated read through the normal API gate so the\n    // same Freebuff token + staff-cookie logic applies everywhere, including sites\n    // that serve CORS from a different origin.\n    const access2 = await accessFor(env, user, request);\n    return json(sessionPayload(access2, user));\n  }`,
    replace: SESSION_CANONICAL,
  },
  {
    label: 'staff login origin check',
    find: `  if (path === "/api/auth/login" && method === "POST") {\n    if (!isSameOriginRequest(request, env.APP_ORIGIN)) {\n      return err(403, "BAD_ORIGIN", "Cross-origin request rejected");\n    }\n    // Keeping this POST handler reachable for the teacher sign-in form.\n    return staffLogin(env, request, body);\n  }`,
    replace: LOGIN_ORIGIN_CANONICAL,
  },
];

let changed = false;
for (const edit of edits) {
  if (!src.includes(edit.find)) {
    console.error('SMOKE EDIT: expected', edit.label, 'not found');
    process.exit(1);
  }
  src = src.replace(edit.find, edit.replace);
  changed = true;
}

writeFileSync(SRC, src, 'utf8');
console.log(changed ? 'dist-worker/index.js normalized' : 'dist-worker/index.js already normalized');
