import { defineConfig } from "prisma/config";
import path from "node:path";

const isProd =
  process.env.NODE_ENV === "production" ||
  (process.env.DATABASE_URL ?? "").startsWith("postgresql");

export default defineConfig({
  schema: isProd ? "prisma/schema.prod.prisma" : "prisma/schema.prisma",
  migrations: {
    path: isProd ? "prisma/migrations-prod" : "prisma/migrations",
  },
  datasource: {
    url: isProd
      ? process.env.DATABASE_URL
      : `file:${path.resolve(process.cwd(), "prisma", "dev.db")}`,
  },
});
