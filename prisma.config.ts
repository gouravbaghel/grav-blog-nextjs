// Prisma configuration for Prisma 7
import "dotenv/config";
import { defineConfig, type PrismaConfig } from "prisma/config";
import { getDatabaseUrl } from "./src/lib/database-url";

const databaseUrl = getDatabaseUrl();
process.env.DATABASE_URL = databaseUrl;

const config = {
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
} satisfies PrismaConfig;

export default defineConfig(config);
