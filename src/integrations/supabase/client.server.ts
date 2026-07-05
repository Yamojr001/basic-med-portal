import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("[Supabase] SUPABASE_URL is not set.");
  if (!key) throw new Error("[Supabase] SUPABASE_SECRET_KEY is not set.");

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin = getSupabaseAdmin();
