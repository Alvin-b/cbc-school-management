# ElimuTrack Enterprise — CBC School SaaS

A Cloudflare Workers SPA: React 18 frontend + a Cloudflare-worker API that talks to Cloudflare D1.

This is the project behind `site-4457d1964dd64e19ba7fec208a2066ee.freebuff.page`.

## What you get

- Teacher sign-in form (`/signin` → `POST /api/auth/login`)
- “Sign in with Freebuff” for the school admin (`/auth/freebuff/signin`)
- Dashboard, marksbook, attendance, broadsheet, report cards, pathways, fees, WhatsApp, schemes, timetable, record of work, progress, KICD designs, approved resources
- Multi-tenant D1 schema: one tenant per school, staff scoper per teacher

## Source of truth for the deployed worker

The deployed worker is **not** the raw `src/` or `worker/src/index.js`. It is the bundled
`dist-worker/index.js`, produced by `npm run build`, and then patched by
`scripts/patch-worker-assets.mjs` so the same build also serves the SPA assets.

Always deploy from `dist/` + `dist-worker/index.js`. Never deploy source files directly.

## Prerequisites

- Node 18+ (tested on Node 20/22; the project uses `"type": "module"`)
- A Cloudflare account with Wrangler installed, used only for:
  - `wrangler.toml` / Wrangler config for D1 bindings
  - `wrangler d1 execute` to seed the local DB schema
  - `wrangler dev` for local preview with the bundled worker + assets
- For a real hosted build you also need:
  - Cloudflare D1 database bound as `DB`
  - Cloudflare Assets binding bound as `ASSETS`
  - (optional) Freebuff auth client/issuer if you want “Sign in with Freebuff”

Do **not** commit `.env`, `.dev.vars`, `wrangler.*.jsonc` with real secrets, or any
`OPENAI_API_KEY` / auth client secrets. Keep secrets in your host secrets store.

## Local install

```bash
npm install
```

If you prefer, use `pnpm install` or `yarn` — the lockfile is committed.

## Build

```bash
npm run build
```

That runs:

1. `vite build` → `dist/` (SPA, hashed JS/CSS in `dist/assets/`)
2. `node scripts/build-worker.mjs` → `dist-worker/index.js` (worker bundle)
3. `node scripts/patch-worker-asserts.mjs` — not run by default on `npm run build`;

The default `build` target is intentionally the frontend + worker bundle only. To get a
deployable artifact for Freebuff Sites-style hosting, run:

```bash
npm run build:sites
```

`build:sites` produces:
- `dist/` — SPA, with `dist/assets/index-*.js` and `dist/assets/index-*.css`
- `dist-worker/index.js` — worker bundle **with asset paths patched into it**
- `dist/sites/manifest.json` — manifest for the deploy tool

## Freebuff Sites deployment

If you are deploying through Freebuff Sites, use the Sites tooling, not raw Wrangler.

```bash
# 1. Prepare Next/Workers manifest (if this is a Sites-hosted project)
npx sites_prepare_next --project-directory .

# 2. Deploy the prepared manifest
npx sites_deploy \\
  --site-id <your-site-id> \\
  --environment preview \\
  --manifest-path dist/sites/manifest.json \\
  --request-id <uuid>
```

The manifest already points at:
- `dist-worker/index.js` as the worker module
- `dist/index.html` as the SPA entry
- `dist/assets/` as the assets directory

## Local Wrangler preview

You can run the same bundle locally before deploying.

```bash
npm run worker:dev
```

That command:
1. Rebuilds `dist-worker/index.js`
2. Patches asset paths inside it (so it can serve `dist/assets/*.js/css`)
3. Starts `wrangler dev --config wrangler.local.jsonc`

`wrangler.local.jsonc` expects:
- `ASSETS` binding to `./dist`
- `DB` binding to a local D1 database named `elimutrack`
- `FREEBUFF_CLIENT_ID`, `FREEBUFF_ISSUER`, `APP_ORIGIN` for local auth dev

## Database setup (local)

1. Create a local D1 database named `elimutrack` and bind it as `DB` in your Wrangler
   config / local vars.
2. Run the schema:

```bash
npm run db:local
```

That runs:

```bash
wrangler d1 execute elimutrack --config wrangler.local.jsonc --local --file worker/schema.sql
```

`worker/schema.sql` is the full schema: tenants, learners, marks, attendance, observations,
payments, staff, staff_classes, staff_services, staff_sessions, lesson plans, schemes,
timetable, record of work, progress, fees, KICD designs, approved resources, KLB books/topics,
mappings, school settings, SMS/WhatsApp logs.

## Auth variables (local dev)

For “Sign in with Freebuff” locally, set these in your Wrangler config / env:

```bash
FREEBUFF_CLIENT_ID=<dev client id>
FREEBUFF_ISSUER=https://freebuff.com/oidc
APP_ORIGIN=http://localhost:8787
```

For production hosting elsewhere, replace with your real OIDC client/issuer and the public
origin of the deployed site. The worker reads `APP_ORIGIN` to decide localhost vs production
auth flows.

## Hosting elsewhere (non-Freebuff)

This is a Workers app. To host it somewhere else you need:

- A Workers-compatible runtime, or a translator of your own
- A SQLite database with the D1-compatible API, or a replacement for `env.DB`
- An asset-serving layer for `dist/` (static files + SPA fallback to `dist/index.html`)

If you are moving off Cloudflare, the two bindings to replace are:

- `env.DB` — current code uses `env.DB.prepare(...).bind(...).first()/run()/all()/batch()`
- `env.ASSETS` — current code fetches assets from this binding for the SPA

Everything else is plain ES module worker code with no Node/bundler runtime dependency at
request time.

## Smoke tests

There are helper scripts under `scripts/`:

- `scripts/smoke-test-live.mjs` — hits the live site’s `/api/session`, `/api/auth/login`,
  and the asset URLs the HTML actually references
- `scripts/build-worker.mjs` — rebuilds the worker bundle from `worker/src/index.js`
- `scripts/patch-worker-assets.mjs` — rewrites asset paths in the bundled worker

Run the live smoke test against your deployed URL:

```bash
node scripts/smoke-test-live.mjs
```

It will print:
- the JS/CSS paths the HTML references
- HTTP status + content-type for each asset
- `/api/session` status and whether it returns HTML (bad) or JSON
- `/api/auth/login` POST status and whether it returns 405 (bad)

## Sign-in problems this project has had

Two classes of failure have shown up in production:

1. `/api/auth/login` returning `405 Method Not Allowed`
   - Cause: the bundled worker’s route table did not include `/api/auth/login`.
   - Fix: ensure `SERVICE_BY_PATH` in the worker includes
     `"/api/auth/login": "staff"` and `"/api/auth/logout": "staff"`, and that the handler
     accepts `POST`.
   - This is the most common cause of the teacher sign-in 405.

2. “Sign in with Freebuff” bouncing back to the login page
   - Cause: `/api/session` returning the SPA HTML instead of JSON, so the frontend treats
     the user as unauthenticated.
   - Cause 2: the Freebuff session cookie is not being honored by the deployed worker, often
     because `APP_ORIGIN` / client id / issuer on the live site do not match the site origin.
   - Fix: deploy the patched worker, verify `/api/session` returns JSON, and set the correct
     Freebuff auth variables on the live environment.

## Repo hygiene

- Commit `dist/` artifacts for deployment: `dist/`, `dist-worker/index.js`,
  `dist/sites/manifest.json`
- Do **not** commit local D1 files, `.env`, `.dev.vars`, or secrets
- Keep `worker/schema.sql` in sync with whatever the worker expects
- After any worker source change, rebuild with `npm run build` (or `build:sites`) before
  deploying

## If you only want to run the frontend locally

```bash
npm run dev
```

That starts Vite on port 5173. API calls to `/api/*` are proxied to
`http://127.0.0.1:8787`, so you normally run the worker (`npm run worker:dev`) in a second
terminal.

## If something is broken after deploy

1. Rebuild from source: `npm run build:sites`
2. Verify the deployed worker is the patched bundle, not an old one
3. Run `node scripts/smoke-test-live.mjs` against the live URL
4. Confirm `/api/auth/login` accepts POST and `/api/session` returns JSON
5. Confirm Freebuff auth vars on the live environment match the site origin

