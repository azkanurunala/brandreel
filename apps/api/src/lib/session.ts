// src/lib/session.ts — sesi login BrandReel sendiri (bukan OAuth platform
// sosmed di Bab 04 — ini akun pengguna BrandReel itu sendiri).
// Token mentah cuma dikirim SEKALI ke client saat login; DB cuma simpan hash
// (SHA-256), sama seperti prinsip password hashing — kalau DB bocor, token
// aktif user tidak langsung bisa dipakai penyerang.
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "../db.js";

const SESSION_TTL_MS = 30 * 24 * 3600 * 1000; // 30 hari

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(accountId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({ data: { accountId, token: hashToken(token), expiresAt } });
  return { token, expiresAt };
}

export async function resolveSession(token: string): Promise<{ accountId: string } | null> {
  const session = await prisma.session.findUnique({ where: { token: hashToken(token) } });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  return { accountId: session.accountId };
}

export async function deleteSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token: hashToken(token) } });
}
