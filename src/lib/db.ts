import pg from "pg";

const { Pool } = pg;

let pool: pg.Pool | undefined;

function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("[DB] DATABASE_URL environment variable is not set. Add it to your .env file.");
    }
    pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
    });
    pool.on("error", (err) => {
      console.error("[DB] Unexpected pool error", err);
    });
  }
  return pool;
}

export async function query<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<T[]> {
  const result = await getPool().query(text, values);
  return result.rows as T[];
}

export async function queryOne<T = Record<string, unknown>>(text: string, values?: unknown[]): Promise<T | null> {
  const result = await getPool().query(text, values);
  return (result.rows[0] ?? null) as T | null;
}

export async function execute(text: string, values?: unknown[]): Promise<number> {
  const result = await getPool().query(text, values);
  return result.rowCount ?? 0;
}
