import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("[Supabase] SUPABASE_URL is not set.");
  if (!key) throw new Error("[Supabase] SUPABASE_SECRET_KEY is not set.");

  // Safety checks: ensure server secrets are not accidentally reused as JWT secret
  if (process.env.JWT_SECRET && process.env.JWT_SECRET === key) {
    throw new Error(
      "[Supabase] SUPABASE_SECRET_KEY must not be the same as JWT_SECRET. Set a separate JWT_SECRET environment variable."
    );
  }

  // Prevent accidental client exposure: don't allow service role key in client-prefixed envs
  if (process.env.VITE_SUPABASE_SECRET_KEY) {
    throw new Error("Detected VITE_SUPABASE_SECRET_KEY — remove any server secrets from client-exposed envs.");
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin = getSupabaseAdmin();
