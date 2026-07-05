# Deployment Guide — Department of Anatomy Portal

This is a **fullstack TanStack Start** application. The frontend (React SSR) and backend (API/server functions) are one unified codebase — you deploy them together as a single service. No separate frontend/backend repos needed.

---

## Table of Contents

1. [Architecture overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Database setup](#3-database-setup)
4. [Environment variables](#4-environment-variables)
5. [Option A — Vercel (recommended)](#5-option-a--vercel-recommended)
6. [Option B — Railway](#6-option-b--railway)
7. [Option C — Render](#7-option-c--render)
8. [Post-deployment checklist](#8-post-deployment-checklist)
9. [Running the schema migration on production](#9-running-the-schema-migration-on-production)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Architecture overview

```
┌──────────────────────────────────────────┐
│           Single Git Repository          │
│                                          │
│  src/routes/         ← React pages (SSR) │
│  src/lib/data-fns.ts ← Server functions  │
│  src/lib/admin-fns.ts← Admin API         │
│  src/lib/auth-fns.ts ← Auth (JWT)        │
│  src/lib/db.ts       ← PostgreSQL pool   │
│                                          │
│  Build → Nitro bundles both into one     │
│           deployable output              │
└──────────────────────────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
 Vercel              Railway / Render
 (preset: vercel)    (preset: node-server)
```

**Key point:** There is no separate API server. All data fetching happens through TanStack Start server functions, which Nitro bundles and deploys alongside the React frontend.

---

## 2. Prerequisites

- **Node.js 20+** on your machine
- **Git** repository (push to GitHub, GitLab, or Bitbucket)
- **PostgreSQL database** — see [Section 3](#3-database-setup)
- Accounts on your chosen platform (Vercel, Railway, or Render — all have free tiers)

---

## 3. Database setup

You need a hosted PostgreSQL database. **Neon is strongly recommended** for Vercel deployments (serverless-compatible, generous free tier). Any standard PostgreSQL provider works.

### Option A: Neon (recommended for Vercel)

1. Go to [neon.tech](https://neon.tech) → Create account → New project
2. Choose a region close to your users
3. Copy the **Connection string** — it looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
4. This becomes your `DATABASE_URL`. Set `DATABASE_SSL=true`.

### Option B: Supabase (PostgreSQL only — no SDK used)

1. Go to [supabase.com](https://supabase.com) → New project
2. Go to **Settings → Database → Connection string → URI**
3. Copy the URI (use the **direct connection**, not the pooler, for migrations)
4. Set `DATABASE_SSL=true`.

### Option C: Railway PostgreSQL

1. In your Railway project, click **+ New** → **Database** → **PostgreSQL**
2. Go to the PostgreSQL service → **Connect** → copy **DATABASE_URL**
3. Set `DATABASE_SSL=false` (Railway's internal Postgres doesn't need SSL).

### Option D: Render PostgreSQL

1. In Render dashboard → **New** → **PostgreSQL**
2. After creation, go to the DB → **Connections** → copy **External Database URL**
3. Set `DATABASE_SSL=true`.

---

## 4. Environment variables

These four variables are **required** in production. Set them in your platform's secret/env dashboard — never commit them to git.

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | Full PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `DATABASE_SSL` | `"true"` for cloud DBs, `"false"` for local | `true` |
| `JWT_SECRET` | Long random string (min 32 chars) for signing auth tokens | `8d5dc3efe75c...` |
| `ADMIN_EMAIL` | Email of the first admin account | `admin@yourdomain.com` |

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 5. Option A — Vercel (recommended)

**Best for:** Fast global CDN, generous free tier, zero-config SSR.

### Step 1: Push to GitHub

```bash
git init          # if not already a git repo
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repository
3. In **Configure Project**:
   - **Framework Preset**: `Other`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.vercel/output` *(leave as detected)*
   - **Install Command**: `npm install`
4. Click **Environment Variables** and add all four variables from Section 4

### Step 3: Deploy

Click **Deploy**. Vercel runs `npm run build`, detects `.vercel/output/`, and deploys automatically.

After deployment, note your production URL (e.g. `https://your-app.vercel.app`).

### Step 4: Run the database migration

Open a terminal on your local machine with the production `DATABASE_URL` set:

```bash
DATABASE_URL="your-production-url" DATABASE_SSL=true node scripts/migrate.mjs
```

Or use Neon's SQL editor / Supabase SQL editor and paste the contents of `schema.sql` directly.

### Step 5: Create your admin account

Visit `https://your-app.vercel.app/auth`, sign up with the exact email you set as `ADMIN_EMAIL`. Your account is automatically granted admin role.

---

## 6. Option B — Railway

**Best for:** Full Node.js control, built-in PostgreSQL, easy scaling.

### Step 1: Push to GitHub

Same as [Vercel Step 1](#step-1-push-to-github) above.

### Step 2: Create a Railway project

1. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo**
2. Select your repository
3. Railway auto-detects the `railway.toml` config in the repo

### Step 3: Add a PostgreSQL database

1. In your Railway project, click **+ New** → **Database** → **PostgreSQL**
2. Click the PostgreSQL service → **Connect** tab → copy the `DATABASE_URL`

### Step 4: Set environment variables

In your web service → **Variables** tab, add:

```
DATABASE_URL     = (paste from Railway PostgreSQL service)
DATABASE_SSL     = false
JWT_SECRET       = (your generated secret)
ADMIN_EMAIL      = admin@yourdomain.com
NODE_ENV         = production
```

### Step 5: Configure build & start

The `railway.toml` already sets this up:
- **Build command**: `npm run build:node`
- **Start command**: `npm start` (runs `node .output/server/index.mjs`)

Railway will automatically build and deploy on every push to `main`.

### Step 6: Run the schema migration

In Railway, open the PostgreSQL service → **Query** tab, paste the contents of `schema.sql`, and run it.

Alternatively from your terminal:
```bash
DATABASE_URL="your-railway-db-url" DATABASE_SSL=false node scripts/migrate.mjs
```

### Step 7: Create your admin account

Visit your Railway app URL → `/auth` → sign up with your `ADMIN_EMAIL`.

---

## 7. Option C — Render

**Best for:** Simple deployment, free tier, no credit card required.

### Step 1: Push to GitHub

Same as [Vercel Step 1](#step-1-push-to-github) above.

### Step 2: Create a Render web service

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `anatomy-portal`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build:node`
   - **Start Command**: `npm start`

### Step 3: Set environment variables

In the **Environment** section, add:

```
DATABASE_URL     = (your PostgreSQL connection string)
DATABASE_SSL     = true
JWT_SECRET       = (your generated secret)
ADMIN_EMAIL      = admin@yourdomain.com
NODE_ENV         = production
```

### Step 4: Create a Render PostgreSQL database (optional)

1. **New** → **PostgreSQL** → create the DB
2. Copy the **External Database URL** and use it as `DATABASE_URL`
3. Change `DATABASE_SSL=true`

### Step 5: Run the schema migration

Use Render's **Shell** tab in your web service:
```bash
node scripts/migrate.mjs
```

Or from your local terminal:
```bash
DATABASE_URL="your-render-db-url" DATABASE_SSL=true node scripts/migrate.mjs
```

### Step 6: Create your admin account

Visit your Render app URL → `/auth` → sign up with your `ADMIN_EMAIL`.

---

## 8. Post-deployment checklist

After deploying to any platform:

- [ ] App loads at the production URL (no 500 errors)
- [ ] `/auth` page works — you can sign up
- [ ] Admin account created with `ADMIN_EMAIL` — role shows as "admin"
- [ ] `/admin` dashboard loads (redirects to `/auth` if not logged in)
- [ ] Admin can create a department at `/admin/departments`
- [ ] Site settings saved at `/admin/settings`
- [ ] Public pages load: `/courses`, `/timetable/lectures`, `/announcements`

---

## 9. Running the schema migration on production

The `schema.sql` file must be run **once** against your production database before the app will work. It is idempotent — safe to run multiple times (`IF NOT EXISTS` guards all statements).

### Method 1: Migration script (recommended)

```bash
# From your local machine with production credentials:
DATABASE_URL="postgresql://..." DATABASE_SSL=true node scripts/migrate.mjs
```

### Method 2: Cloud provider SQL editor

| Provider | Where to run SQL |
|---|---|
| Neon | Dashboard → SQL Editor → paste schema.sql |
| Supabase | Dashboard → SQL Editor → paste schema.sql |
| Railway | PostgreSQL service → Query tab → paste schema.sql |
| Render | PostgreSQL dashboard → PSQL Command → `\i schema.sql` |

### Method 3: psql

```bash
psql "postgresql://user:pass@host/db?sslmode=require" -f schema.sql
```

---

## 10. Troubleshooting

### "relation does not exist" error

The schema hasn't been applied. Run the migration — see [Section 9](#9-running-the-schema-migration-on-production).

### "DATABASE_URL environment variable is not set"

The env var isn't reaching the server. Double-check your platform's secrets/env dashboard. On Railway, make sure the variable is on the **web service**, not just the DB service.

### SSL/TLS connection errors

- Cloud databases (Neon, Supabase, Render): set `DATABASE_SSL=true`
- Railway internal DB: set `DATABASE_SSL=false`
- Local development: set `DATABASE_SSL=false`

### "JWT_SECRET environment variable is not set"

The JWT_SECRET wasn't added to the platform. Add it and redeploy.

### Admin login doesn't work / role is "user" not "admin"

The first account with the `ADMIN_EMAIL` address gets admin role **at the moment of sign-up**. If you signed up with a different email first, go to `/admin/users` (if you have any other admin), or run this SQL directly on your database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

### Build fails on Vercel with "Cannot find module"

Make sure `npm install` runs before `npm run build`. Vercel does this automatically. If it still fails, check that all packages are in `dependencies` (not just `devDependencies`).

### Blank page / white screen in production

Open browser DevTools → Console. Common causes:
1. A server function is crashing — check platform logs
2. Database not reachable — verify `DATABASE_URL` and SSL settings
3. Schema not applied — run migration

---

## Quick reference

| | Vercel | Railway | Render |
|---|---|---|---|
| Build command | `npm run build` | `npm run build:node` | `npm run build:node` |
| Start command | *(handled by Vercel)* | `npm start` | `npm start` |
| Output dir | `.vercel/output` | `.output/server/` | `.output/server/` |
| Nitro preset | `vercel` | `node-server` | `node-server` |
| Free tier | ✅ | ✅ | ✅ |
| Built-in PostgreSQL | ❌ (use Neon) | ✅ | ✅ |

---

*Schema version: 2025 — all tables in `schema.sql` are created with `IF NOT EXISTS` guards.*
