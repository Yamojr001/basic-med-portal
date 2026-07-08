/**
 * Database migration script — applies schema.sql to your Supabase database.
 * Run: node scripts/migrate.mjs
 *
 * Reads SUPABASE_URL and SUPABASE_SECRET_KEY from environment (or .env file if dotenv is available).
 */

import { createClient } from "@supabase/supabase-js";
import { createRequire } from "module";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env if present
try {
  const { config } = createRequire(import.meta.url)("dotenv");
  config();
} catch {
  /* dotenv not installed — we'll try a manual .env loader below */
}

// Manual .env loader (uses project root .env). Will not overwrite existing env vars.
try {
  const envPath = join(__dirname, "..", ".env");
  if (existsSync(envPath)) {
    const raw = readFileSync(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
    console.log("Loaded environment variables from .env");
  }
} catch (e) {
  // non-fatal
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const PG_CONNECTION = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRESQL_URL || process.env.PG_CONNECTION_STRING;

let supabase = null;
if (!PG_CONNECTION) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    console.error("ERROR: SUPABASE_URL and SUPABASE_SECRET_KEY are required when DATABASE_URL is not provided.");
    process.exit(1);
  }

  supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const sql = readFileSync(join(__dirname, "..", "schema.sql"), "utf8");

function splitStatements(input) {
  const statements = [];
  let buffer = "";
  let state = "normal";
  let dollarTag = null;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i];
    const next = input[i + 1];

    if (state === "line-comment") {
      buffer += ch;
      if (ch === "\n") state = "normal";
      continue;
    }

    if (state === "block-comment") {
      buffer += ch;
      if (ch === "*" && next === "/") {
        buffer += next;
        i += 1;
        state = "normal";
      }
      continue;
    }

    if (state === "single-quote") {
      buffer += ch;
      if (ch === "'" && next === "'") {
        buffer += next;
        i += 1;
      } else if (ch === "'") {
        state = "normal";
      }
      continue;
    }

    if (state === "double-quote") {
      buffer += ch;
      if (ch === '"' && next === '"') {
        buffer += next;
        i += 1;
      } else if (ch === '"') {
        state = "normal";
      }
      continue;
    }

    if (state === "dollar-quote") {
      if (dollarTag && input.startsWith(dollarTag, i)) {
        buffer += dollarTag;
        i += dollarTag.length - 1;
        state = "normal";
        dollarTag = null;
      } else {
        buffer += ch;
      }
      continue;
    }

    if (ch === "-" && next === "-") {
      buffer += ch + next;
      i += 1;
      state = "line-comment";
      continue;
    }

    if (ch === "/" && next === "*") {
      buffer += ch + next;
      i += 1;
      state = "block-comment";
      continue;
    }

    if (ch === "'") {
      buffer += ch;
      state = "single-quote";
      continue;
    }

    if (ch === '"') {
      buffer += ch;
      state = "double-quote";
      continue;
    }

    if (ch === "$") {
      const match = input.slice(i).match(/^(\$[A-Za-z_][A-Za-z0-9_]*\$|\$\$)/);
      if (match) {
        dollarTag = match[1];
        buffer += dollarTag;
        i += dollarTag.length - 1;
        state = "dollar-quote";
        continue;
      }
    }

    if (ch === ";") {
      const statement = buffer.trim();
      if (statement) statements.push(statement);
      buffer = "";
      continue;
    }

    buffer += ch;
  }

  const tail = buffer.trim();
  if (tail) statements.push(tail);
  return statements;
}

console.log(PG_CONNECTION ? "Connecting to Postgres..." : "Connecting to Supabase…");
try {
  const statements = splitStatements(sql);

  if (PG_CONNECTION) {
    // Execute all statements directly against Postgres using pg client
    const { Client } = await import('pg');
    const client = new Client({ connectionString: PG_CONNECTION, ssl: { rejectUnauthorized: false } });
    await client.connect();
    try {
      for (const statement of statements) {
        if (!statement) continue;
        await client.query(statement);
      }
    } finally {
      await client.end();
    }
    console.log("✓ Schema applied successfully via direct Postgres connection.");
    process.exit(0);
  }

  // Bootstrap: execute any RPC-creation statements directly using the
  // Postgres query endpoint so the RPC functions exist before we call them.
  for (const statement of statements) {
    const lower = statement.trim().toLowerCase();
    if (lower.includes('function run_query_sql') || lower.includes('function run_execute_sql')) {
      // Try SDK postgres API first
      if (supabase.postgres && typeof supabase.postgres.query === "function") {
        const res = await supabase.postgres.query({ sql: statement });
        if (res.error) throw res.error;
      } else if (process.env.SUPABASE_ADMIN_SQL_URL) {
        // Fallback: POST to a user-provided Supabase admin SQL endpoint.
        const url = process.env.SUPABASE_ADMIN_SQL_URL;
        const body = JSON.stringify({ sql: statement });
        const headers = {
          "Content-Type": "application/json",
          apikey: SUPABASE_SECRET_KEY,
          Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
        };
        const r = await fetch(url, { method: "POST", headers, body });
        if (!r.ok) {
          const text = await r.text();
          throw new Error(`Admin SQL request failed: ${r.status} ${r.statusText} - ${text}`);
        }
      } else {
        throw new Error(
          "No available method to execute bootstrap SQL: install @supabase/postgres-js or set SUPABASE_ADMIN_SQL_URL"
        );
      }
    }
  }

  // Now run the rest of the statements through the RPC helper.
  for (const statement of statements) {
    const lower = statement.trim().toLowerCase();
    if (lower.includes('function run_query_sql') || lower.includes('function run_execute_sql')) {
      continue;
    }
    const { error } = await supabase.rpc("run_execute_sql", { sql: statement });
    if (error) throw error;
  }
  console.log("✓ Schema applied successfully.");
} catch (err) {
  console.error("✗ Migration failed:", err.message);
  process.exit(1);
}
