import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Pool } from "pg";

const PG_CONNECTION =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRESQL_URL || process.env.PG_CONNECTION_STRING;

let pgPool: Pool | null = null;
async function ensurePgPool() {
  if (!PG_CONNECTION) return;
  if (pgPool) return;
  const pg = await import("pg");
  const PoolCtor = (pg as any).Pool as typeof Pool;
  pgPool = new PoolCtor({ connectionString: PG_CONNECTION, ssl: { rejectUnauthorized: false } });
}

type RpcRow = { row: Record<string, unknown> };

function quoteSqlLiteral(value: unknown): string {
  if (value === null || value === undefined) return "null";
  if (value instanceof Date) return `'${value.toISOString().replace(/'/g, "''")}'`;
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return `'${text.replace(/'/g, "''")}'`;
}

function substituteSqlParams(text: string, values?: unknown[]): string {
  if (!values?.length) return text;
  return values
    .map((value, index) => [index + 1, quoteSqlLiteral(value)] as const)
    .sort((a, b) => b[0] - a[0])
    .reduce(
      (sql, [index, literal]) => sql.replace(new RegExp(`\\$${index}(?!\\d)`, "g"), literal),
      text
    );
}

function normalizeQuerySql(text: string): string {
  return text.trim();
}

async function runQuerySql<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<T[]> {
  // If a plain Postgres connection is provided, use pg driver with parameter binding.
  if (PG_CONNECTION) {
    await ensurePgPool();
    const sql = normalizeQuerySql(text);
    const res = await pgPool!.query(sql, values as any[]);
    return (res.rows ?? []) as T[];
  }

  const sql = substituteSqlParams(normalizeQuerySql(text), values);
  const { data, error } = await supabaseAdmin.rpc("run_query_sql", { sql });
  if (error) throw error;
  return ((data ?? []) as RpcRow[]).map((item) => item.row as T);
}

async function runExecuteSql(text: string, values?: unknown[]): Promise<number> {
  if (PG_CONNECTION) {
    await ensurePgPool();
    const res = await pgPool!.query(text, values as any[]);
    return Number(res.rowCount ?? 0);
  }

  const sql = substituteSqlParams(text, values);
  const { data, error } = await supabaseAdmin.rpc("run_execute_sql", { sql });
  if (error) throw error;
  return Number(data ?? 0);
}

export async function query<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<T[]> {
  return runQuerySql<T>(text, values);
}

export async function queryOne<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<T | null> {
  const rows = await runQuerySql<T>(text, values);
  return (rows[0] ?? null) as T | null;
}

export async function execute(text: string, values?: unknown[]): Promise<number> {
  return runExecuteSql(text, values);
}
