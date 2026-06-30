// Stub — Supabase has been replaced with direct PostgreSQL.
// This file exists only to prevent import errors. All data access is via server functions.
// @ts-nocheck

export const supabase = new Proxy({} as never, {
  get() {
    console.warn("[supabase] Direct Supabase SDK calls are no longer used. Use server functions.");
    return () => Promise.resolve({ data: null, error: new Error("Supabase SDK not configured") });
  },
});
