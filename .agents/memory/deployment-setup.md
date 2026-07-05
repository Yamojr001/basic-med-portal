---
name: Deployment setup
description: How the FUD anatomy portal is configured for multi-platform deployment
---

## Rule
The app is one unified TanStack Start + Nitro SSR monorepo. Frontend and backend deploy together.

## NITRO_PRESET env var
- `vercel` (default) → `npm run build` → outputs `.vercel/output/` → zero-config on Vercel
- `node-server` → `npm run build:node` → outputs `.output/server/index.mjs` → `npm start`
- `netlify` → `npm run build:netlify`

## Key files
- `vite.config.ts` — reads `NITRO_PRESET` env var, passes to nitro preset
- `vercel.json` — explicit Vercel config (buildCommand, outputDirectory)
- `railway.toml` — Railway config (build:node + npm start)
- `render.yaml` — Render config
- `scripts/migrate.mjs` — runs schema.sql against any DATABASE_URL
- `schema.sql` — idempotent (IF NOT EXISTS), safe to re-run

## Schema migration
Must run once before the app works in production:
```bash
DATABASE_URL="..." DATABASE_SSL=true node scripts/migrate.mjs
```
Or paste schema.sql into the cloud provider's SQL editor.

**Why:** Tables don't exist until schema is applied; app throws "relation does not exist" without it.
