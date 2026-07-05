import { supabaseAdmin } from "@/integrations/supabase/client.server";

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
    .reduce((sql, [index, literal]) => sql.replace(new RegExp(`\\$${index}(?!\\d)`, "g"), literal), text);
}

function normalizeQuerySql(text: string): string {
  const trimmed = text.trim();
  if (/^(insert|update|delete)\b/i.test(trimmed) && /\breturning\b/i.test(trimmed)) {
    return `with _result as (${trimmed}) select to_jsonb(_result) as row from _result`;
  }
  return trimmed;
}

async function runQuerySql<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<T[]> {
  const sql = substituteSqlParams(normalizeQuerySql(text), values);
  const { data, error } = await supabaseAdmin.rpc("run_query_sql", { sql });
  if (error) throw error;
  return ((data ?? []) as RpcRow[]).map((item) => item.row as T);
}

async function runExecuteSql(text: string, values?: unknown[]): Promise<number> {
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
