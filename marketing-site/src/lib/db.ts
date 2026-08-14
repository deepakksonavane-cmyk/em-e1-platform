import { Pool, type QueryResultRow } from "pg";

// Singleton connection pool (survives Next.js dev hot-reload via globalThis).
declare global {
  // eslint-disable-next-line no-var
  var __marketingPgPool: Pool | undefined;
}

// Same SSL fix applied to the LMS and Admin Panel: Neon requires an
// encrypted connection, and `sslmode=require` in the connection string
// alone is not always enough for node-postgres to negotiate TLS correctly
// on Vercel. `rejectUnauthorized: false` is safe here because Neon's
// connection string already pins the exact host.
const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "");

export const pool: Pool =
  global.__marketingPgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
  });

if (process.env.NODE_ENV !== "production") {
  global.__marketingPgPool = pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const res = await pool.query<T>(text, params as unknown[]);
  return res.rows;
}
