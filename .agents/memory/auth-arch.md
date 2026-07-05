---
name: Auth architecture
description: Custom JWT auth system replacing Supabase Auth
---

## Rule
No Supabase auth. Custom JWT (jose, HS256, 7-day expiry) + bcryptjs password hashing.

## Token flow
1. `loginFn` / `signupFn` (server functions in src/lib/auth-fns.ts) return `{ token, user }`
2. Client calls `storeAuth(token)` → stored in `localStorage` under key `fud_anatomy_token`
3. `attachAuth` client middleware reads token, adds `Authorization: Bearer {token}` to every server fn request
4. Admin server functions call `ensureAdmin()` inline — reads request header, verifies JWT, checks `role === "admin"`

## Admin bootstrap
First signup with email matching `ADMIN_EMAIL` env var gets `role='admin'` in users table.
If first admin was missed: `UPDATE users SET role='admin' WHERE email='...'` in SQL.

## No Supabase SDK anywhere
All Supabase files are stubs. src/lib/db.ts is the only DB access point.

**Why:** Full control over auth, no vendor lock-in, works on any PostgreSQL host.
