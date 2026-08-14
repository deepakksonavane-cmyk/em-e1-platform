// This sandbox environment's egress policy blocks binaries.prisma.sh, so the
// Prisma CLI cannot download its native query-engine / schema-engine binaries
// on `npm install` / `prisma generate`. Since the generator uses
// `engineType = "client"` (WASM query compiler + `pg` driver adapter, see
// lib/prisma.ts), those native binaries are never actually executed at
// runtime — the CLI just checks that *something* exists at the expected path
// before it will proceed. This script creates harmless empty placeholder
// files there so `prisma generate`/`migrate` skip the (blocked) download.
//
// Safe to delete this script and the two PRISMA_*_BINARY vars in .env in any
// environment where binaries.prisma.sh is reachable — Prisma will just
// download the real engines as usual.
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "node_modules", "@prisma", "engines");

try {
  fs.mkdirSync(dir, { recursive: true });
  const files = [
    "libquery_engine-debian-openssl-3.0.x.so.node",
    "schema-engine-debian-openssl-3.0.x",
  ];
  for (const f of files) {
    const p = path.join(dir, f);
    if (!fs.existsSync(p)) fs.writeFileSync(p, "");
    fs.chmodSync(p, 0o755);
  }
  console.log("[prepare-engine-stubs] Placeholder Prisma engine files ready.");
} catch (err) {
  console.warn("[prepare-engine-stubs] Skipped (non-fatal):", err.message);
}
