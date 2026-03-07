// Prisma configuration for Prisma 7
import "dotenv/config";
import { defineConfig, type PrismaConfig } from "prisma/config";

const config = {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
} satisfies PrismaConfig;

export default defineConfig(config);
