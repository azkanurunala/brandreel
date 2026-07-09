// src/routes/brandkit.ts — brand kit akun (nama, voice, logo, warna) —
// dipakai onboarding step "Atur brand kit" & prompt AI (Bab 03).
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const brandKitRouter = Router();

// GET /brand-kit — brand kit MILIK akun yang login (null kalau belum diatur)
brandKitRouter.get("/brand-kit", requireAuth, async (req, res) => {
  const kit = await prisma.brandKit.findFirst({
    where: { accountId: req.accountId },
    orderBy: { createdAt: "asc" },
  });
  res.json(kit);
});

// PUT /brand-kit — buat atau perbarui brand kit akun yang login (satu akun = satu brand kit utama)
const putSchema = z.object({
  name: z.string().min(1),
  voice: z.string().optional(),
  logoUrl: z.string().url().optional(),
  colors: z.array(z.string()).default([]),
});

brandKitRouter.put("/brand-kit", requireAuth, async (req, res) => {
  const parsed = putSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.brandKit.findFirst({ where: { accountId: req.accountId } });
  const kit = existing
    ? await prisma.brandKit.update({ where: { id: existing.id }, data: parsed.data })
    : await prisma.brandKit.create({ data: { ...parsed.data, accountId: req.accountId! } });

  res.json(kit);
});
