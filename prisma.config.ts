import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Prefer pooled Accelerate URL (STORAGE_PRISMA_DATABASE_URL); if not set, fall back to DATABASE_URL via process.env
    url:
      env("STORAGE_PRISMA_DATABASE_URL") ??
      (process.env.DATABASE_URL as string),
  },
});
