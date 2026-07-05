---
name: DB config
description: PostgreSQL pool config and SSL behavior per environment
---

## Rule
`DATABASE_SSL` env var controls SSL — must match the host environment.

| Environment | DATABASE_SSL | Why |
|---|---|---|
| Replit helium (local dev) | `false` | Local socket, no SSL |
| Neon / Supabase / Render | `true` | TLS required by provider |
| Railway internal DB | `false` | Internal network, no SSL |

## Pool singleton
`src/lib/db.ts` — lazy-initializes pg.Pool on first use, max 10 connections, 30s idle timeout.

## Helper functions
- `query<T>()` — returns rows array
- `queryOne<T>()` — returns first row or null
- `execute()` — returns rowCount (for INSERT/UPDATE/DELETE without RETURNING)

**Why:** Dynamic SSL prevents "self-signed cert" errors on local dev and "SSL required" errors on cloud hosts.
