import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { newId } from "./db";

// ============================================================================
// File storage — LOCAL DISK STUB, not production cloud storage.
//
// TODO (production): replace this with a real object-storage integration
// (S3 / Cloudflare R2 / GCS) that returns a signed upload URL to the client
// and a durable, publicly (or signed-) accessible URL to store on the
// Submission/InternshipRecord row. Something like:
//
//   const { url, fields } = await s3.createPresignedPost({ Bucket, Key, ... });
//   // client uploads directly to `url`
//   // fileUrl saved on the row = `https://<bucket>.s3.amazonaws.com/<key>`
//
// For this sandboxed build, uploaded files ARE persisted (not faked) — they
// are written to /public/uploads and served statically by Next.js, which is
// sufficient to demonstrate the full submit -> store -> retrieve flow.
// ============================================================================

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveUploadedFile(file: File, subdir: string): Promise<string> {
  await mkdir(path.join(UPLOAD_DIR, subdir), { recursive: true });
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const safeName = `${newId()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(UPLOAD_DIR, subdir, safeName);
  await writeFile(filePath, buffer);
  return `/uploads/${subdir}/${safeName}`;
}
