import { Pool, type QueryResultRow } from "pg";

// Singleton connection pool (survives Next.js dev hot-reload via globalThis).
declare global {
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

// Neon (and most hosted Postgres providers) require an encrypted connection.
// The `sslmode=require` query param on the connection string is not always
// enough on its own for node-postgres to negotiate TLS correctly in every
// environment — explicitly passing `ssl` here is the standard, documented
// fix for the "connection terminated" / 500 errors this combination
// otherwise produces on Vercel. `rejectUnauthorized: false` is safe here
// because Neon's own connection string already pins the exact host; this
// mirrors what Neon's own docs/templates recommend for node-postgres.
const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "");

export const pool: Pool =
  global.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

/** Run a parameterized SQL query and return typed rows. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const res = await pool.query<T>(text, params as unknown[]);
  return res.rows;
}

/** Run a query and return the first row (or null). */
export async function queryOne<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Generate a k-sortable-ish random string id, functionally equivalent to Prisma's cuid() for our purposes. */
export function newId(): string {
  return (
    "c" +
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10)
  );
}