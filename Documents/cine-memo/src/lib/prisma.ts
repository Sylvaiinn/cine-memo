import { PrismaClient } from "@prisma/client";
import path from "node:path";

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL ?? "";

  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    // Production — PostgreSQL via adapter-pg
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: url });
    return new PrismaClient({ adapter });
  }

  // Dev — SQLite via adapter-better-sqlite3
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const DB_PATH = path.resolve(process.cwd(), "prisma", "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: DB_PATH });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
