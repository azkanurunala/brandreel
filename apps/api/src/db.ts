// src/db.ts — satu instance Prisma Client dipakai bersama (Bab 16)
import { PrismaClient } from "@prisma/client";

// Pola singleton: hindari membuat banyak koneksi saat hot-reload (dev).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
