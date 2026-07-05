/**
 * Database migration script — applies schema.sql to your PostgreSQL database.
 * Run: node scripts/migrate.mjs
 *
 * Reads DATABASE_URL from environment (or .env file if dotenv is available).
 */

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

const DATABASE_URL = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!DATABASE_URL) {
  console.error(
    "ERROR: DATABASE_URL is not set. For Supabase, copy the Postgres connection string from Settings → Database → Connection string and set it as DATABASE_URL (or SUPABASE_DATABASE_URL)."
  );
  process.exit(1);
}

const sslDisabled = process.env.DATABASE_SSL === "false";

const { default: pg } = await import("pg");
const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: sslDisabled ? false : { rejectUnauthorized: false },
});

const sql = readFileSync(join(__dirname, "..", "schema.sql"), "utf8");

console.log("Connecting to PostgreSQL…");
try {
  await pool.query(sql);
  console.log("✓ Schema applied successfully.");
} catch (err) {
  console.error("✗ Migration failed:", err.message);
  process.exit(1);
} finally {
  await pool.end();
}
