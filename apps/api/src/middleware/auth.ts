// src/middleware/auth.ts — wajibkan sesi login BrandReel valid di route yang butuh identitas akun.
import type { NextFunction, Request, Response } from "express";
import { resolveSession } from "../lib/session.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      accountId?: string;
    }
  }
}

function extractToken(req: Request): string | null {
  const auth = req.header("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: "Belum login" });
  const session = await resolveSession(token);
  if (!session) return res.status(401).json({ error: "Sesi tidak valid atau kedaluwarsa — login ulang" });
  req.accountId = session.accountId;
  next();
}

// Versi opsional: kalau ada token valid, isi req.accountId; kalau tidak, lanjut tanpa error
// (dipakai rute yang masih boleh diakses tanpa login tapi personalisasi kalau ada sesi).
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    const session = await resolveSession(token);
    if (session) req.accountId = session.accountId;
  }
  next();
}
