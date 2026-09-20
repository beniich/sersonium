import { PrismaClient } from "@prisma/client";
import path from "path";

// Normaliser DATABASE_URL en chemin absolu sur Windows pour éviter l'erreur SQLite Error Code 14
const getDbUrl = () => {
  const envUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
  if (envUrl.startsWith("file:.")) {
    const relPath = envUrl.replace(/^file:/, "");
    const absPath = path.resolve(process.cwd(), relPath).replace(/\\/g, "/");
    return `file:${absPath}`;
  }
  return envUrl;
};

const dbUrl = getDbUrl();
process.env.DATABASE_URL = dbUrl;

// Global singleton pattern to prevent connection exhaustion in dev/watch mode
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const rawPrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });


if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = rawPrisma;
}
