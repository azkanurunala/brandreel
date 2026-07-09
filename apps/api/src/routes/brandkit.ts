// src/routes/brandkit.ts — brand kit (nama, voice, logo, warna) — akun boleh
// punya banyak (mis. agensi kelola beberapa brand klien), dipilih per
// campaign lewat Campaign.brandKitId (Bab 03).
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const brandKitRouter = Router();

// GET /brand-kits — semua brand kit MILIK akun yang login
brandKitRouter.get("/brand-kits", requireAuth, async (req, res) => {
  const kits = await prisma.brandKit.findMany({
    where: { accountId: req.accountId },
    orderBy: { createdAt: "asc" },
  });
  res.json(kits);
});

const bodySchema = z.object({
  name: z.string().min(1),
  voice: z.string().optional(),
  logoUrl: z.string().url().optional(),
  colors: z.array(z.string()).default([]),
});

// POST /brand-kits — bikin brand kit baru (bukan satu-satunya lagi)
brandKitRouter.post("/brand-kits", requireAuth, async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const kit = await prisma.brandKit.create({ data: { ...parsed.data, accountId: req.accountId! } });
  res.status(201).json(kit);
});

// PUT /brand-kits/:id — ubah brand kit milik sendiri
brandKitRouter.put("/brand-kits/:id", requireAuth, async (req, res) => {
  const parsed = bodySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.brandKit.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.accountId !== req.accountId) return res.status(404).json({ error: "Brand kit tidak ditemukan" });

  const kit = await prisma.brandKit.update({ where: { id: existing.id }, data: parsed.data });
  res.json(kit);
});

// DELETE /brand-kits/:id — hapus brand kit milik sendiri
brandKitRouter.delete("/brand-kits/:id", requireAuth, async (req, res) => {
  const existing = await prisma.brandKit.findUnique({ where: { id: req.params.id } });
  if (!existing || existing.accountId !== req.accountId) return res.status(404).json({ error: "Brand kit tidak ditemukan" });
  await prisma.brandKit.delete({ where: { id: existing.id } });
  res.json({ ok: true });
});
