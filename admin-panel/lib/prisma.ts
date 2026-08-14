import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// This app's Prisma Client is generated with `engineType = "client"` (see
// prisma/schema.prisma) — a Rust-free client that runs entirely on the WASM
// query compiler bundled inside @prisma/client. That mode requires an
// explicit driver adapter instead of Prisma's usual native connection
// pooling, so we hand it a plain `pg` Pool via @prisma/adapter-pg.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

function createClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
