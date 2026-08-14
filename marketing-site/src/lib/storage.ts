
Storage · TS
import { promises as fs } from "fs";
import path from "path";
import { query, pool } from "../../lib/db";
 
/**
 * Persistence layer for form submissions (applications, contact messages,
 * newsletter signups).
 *
 * Production (DATABASE_URL set): persists to a `marketing_records` table in
 * the same Neon Postgres database the LMS and Admin Panel use (see
 * sql/init.sql for the one-time schema). Each "collection" (applications,
 * contact-messages, newsletter-subscribers) is stored as JSONB rows keyed by
 * record id, which mirrors the local-file model 1:1 — no data-shape changes
 * needed in applications.ts / contact.ts / newsletter.ts.
 *
 * Local dev / no DATABASE_URL: falls back to append-only JSON files under
 * /data at the project root, guarded by an in-process write queue so
 * concurrent submissions never clobber one another. This keeps `next dev`
 * working with zero setup.
 */
 
const DATA_DIR = path.join(process.cwd(), "data");
const USE_DB = Boolean(process.env.DATABASE_URL);
 
// Serializes writes per-collection so concurrent requests append safely.
const writeQueues = new Map<string, Promise<unknown>>();
 
async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}
 
async function readCollectionFile<T>(file: string): Promise<T[]> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, file);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    if (!raw.trim()) return [];
    return JSON.parse(raw) as T[];
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}
 
async function writeCollectionFile<T>(file: string, records: T[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, file);
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(records, null, 2), "utf-8");
  await fs.rename(tmpPath, filePath);
}
 
async function readCollectionDb<T>(collection: string): Promise<T[]> {
  const rows = await query<{ data: T }>(
    `SELECT data FROM marketing_records WHERE collection = $1 ORDER BY created_at ASC`,
    [collection]
  );
  return rows.map((r) => r.data);
}
 
async function writeCollectionDb<T>(collection: string, records: T[]): Promise<void> {
  // Small demo-scale datasets — replace the whole collection transactionally,
  // which mirrors the previous "rewrite the whole file" semantics exactly.
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`DELETE FROM marketing_records WHERE collection = $1`, [collection]);
    for (const record of records as unknown as { id: string }[]) {
      await client.query(
        `INSERT INTO marketing_records (collection, id, data) VALUES ($1, $2, $3)`,
        [collection, record.id, JSON.stringify(record)]
      );
    }
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
 
export async function appendRecord<T extends { id: string }>(
  file: string,
  record: T
): Promise<T> {
  if (USE_DB) {
    await query(`INSERT INTO marketing_records (collection, id, data) VALUES ($1, $2, $3)`, [
      file,
      record.id,
      JSON.stringify(record),
    ]);
    return record;
  }
 
  const previous = writeQueues.get(file) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(async () => {
      const records = await readCollectionFile<T>(file);
      records.push(record);
      await writeCollectionFile(file, records);
      return record;
    });
  writeQueues.set(file, next);
  return next;
}
 
export async function listRecords<T>(file: string): Promise<T[]> {
  if (USE_DB) return readCollectionDb<T>(file);
  return readCollectionFile<T>(file);
}
 
export async function updateCollection<T>(
  file: string,
  mutate: (records: T[]) => T[]
): Promise<void> {
  if (USE_DB) {
    const records = await readCollectionDb<T>(file);
    const updated = mutate(records);
    await writeCollectionDb(file, updated);
    return;
  }
 
  const previous = writeQueues.get(file) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(async () => {
      const records = await readCollectionFile<T>(file);
      const updated = mutate(records);
      await writeCollectionFile(file, updated);
    });
  writeQueues.set(file, next);
  return next;
}
 
export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}
 

Downloaded db.ts Show in Explorer