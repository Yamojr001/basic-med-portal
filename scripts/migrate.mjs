/**
 * Database migration script — applies schema.sql to your Supabase database.
 * Run: node scripts/migrate.mjs
 *
 * Reads SUPABASE_URL and SUPABASE_SECRET_KEY from environment (or .env file if dotenv is available).
 */

import { createClient } from "@supabase/supabase-js";
import { createRequire } from "module";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env if present
try {
  const { config } = createRequire(import.meta.url)("dotenv");
  config();
} catch {
  /* dotenv not installed — use system env */
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error("ERROR: SUPABASE_URL and SUPABASE_SECRET_KEY are required.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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

console.log("Connecting to Supabase…");
try {
  for (const statement of splitStatements(sql)) {
    const { error } = await supabase.rpc("run_execute_sql", { sql: statement });
    if (error) throw error;
  }
  console.log("✓ Schema applied successfully.");
} catch (err) {
  console.error("✗ Migration failed:", err.message);
  process.exit(1);
}
