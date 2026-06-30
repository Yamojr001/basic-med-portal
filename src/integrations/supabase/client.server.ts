// Stub — server-side Supabase client replaced with direct PostgreSQL via src/lib/db.ts
// This file exists only to prevent import errors during migration.
// @ts-nocheck

export const supabaseAdmin = new Proxy({} as never, {
  get() {
    throw new Error("[supabaseAdmin] Supabase admin client is no longer used. Use src/lib/db.ts directly.");
  },
});
