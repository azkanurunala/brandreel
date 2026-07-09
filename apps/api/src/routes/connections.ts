// src/routes/connections.ts — daftar & putuskan koneksi sosmed (Bab 04)
import { Router } from "express";
import { prisma } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

export const connectionsRouter = Router();
// NB: requireAuth per rute, bukan connectionsRouter.use(requireAuth) — semua
// router di-mount di root, jadi .use() tanpa path akan mencegat request ke
// router lain juga (lihat catatan sama di campaigns.ts).

// GET /connections — akun tersambung MILIK akun yang login + kesehatan token
connectionsRouter.get("/connections", requireAuth, async (req, res) => {
  const items = await prisma.connection.findMany({
    where: { accountId: req.accountId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      platform: true,
      handle: true,
      status: true,
      expiresAt: true,
      scopes: true,
    },
  });
  res.json(items);
});

// DELETE /connections/:id — putuskan akun (cuma boleh punya sendiri)
connectionsRouter.delete("/connections/:id", requireAuth, async (req, res) => {
  const conn = await prisma.connection.findUnique({ where: { id: req.params.id } });
  if (!conn || conn.accountId !== req.accountId) return res.status(404).json({ error: "Koneksi tidak ditemukan" });
  await prisma.connection.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
