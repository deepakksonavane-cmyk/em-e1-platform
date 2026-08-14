import { promises as fs } from "fs";
import path from "path";

/**
 * Lightweight JSON-file persistence layer.
 *
 * There is no live database provisioned for the marketing site in this
 * environment, so form submissions (applications, contact messages,
 * newsletter signups) are persisted to append-only JSON files under
 * /data at the project root. Each collection is guarded by an in-process
 * write queue so concurrent submissions never clobber one another.
 *
 * This is intentionally swappable: the shared Prisma schema at
 * /home/claude/em_e1_platform/shared/prisma/schema.prisma already defines
 * an `Application` model. To plug the marketing site into the same
 * Postgres database the LMS/Admin apps use, replace the implementations
 * below with `prisma.application.create(...)` calls (see the shared
 * schema for the exact field names) — the public function signatures in
 * this file would not need to change.
 */

const DATA_DIR = path.join(process.cwd(), "data");

// Serializes writes per-collection so concurrent requests append safely.
const writeQueues = new Map<string, Promise<unknown>>();

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readCollection<T>(file: string): Promise<T[]> {
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

async function writeCollection<T>(file: string, records: T[]): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, file);
  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, JSON.stringify(records, null, 2), "utf-8");
  await fs.rename(tmpPath, filePath);
}

export async function appendRecord<T extends { id: string }>(
  file: string,
  record: T
): Promise<T> {
  const previous = writeQueues.get(file) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(async () => {
      const records = await readCollection<T>(file);
      records.push(record);
      await writeCollection(file, records);
      return record;
    });
  writeQueues.set(file, next);
  return next;
}

export async function listRecords<T>(file: string): Promise<T[]> {
  return readCollection<T>(file);
}

export async function updateCollection<T>(
  file: string,
  mutate: (records: T[]) => T[]
): Promise<void> {
  const previous = writeQueues.get(file) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(async () => {
      const records = await readCollection<T>(file);
      const updated = mutate(records);
      await writeCollection(file, updated);
    });
  writeQueues.set(file, next);
  return next;
}

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}
