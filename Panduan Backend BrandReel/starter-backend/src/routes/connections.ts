// src/routes/connections.ts — daftar & putuskan koneksi sosmed (Bab 04)
import { Router } from "express";
import { prisma } from "../db.js";

export const connectionsRouter = Router();

// GET /connections — akun tersambung + kesehatan token
connectionsRouter.get("/connections", async (_req, res) => {
  const items = await prisma.connection.findMany({
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

// DELETE /connections/:id — putuskan akun (+ hapus token di brankas — TODO fase OAuth)
connectionsRouter.delete("/connections/:id", async (req, res) => {
  await prisma.connection.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// TODO (fase OAuth): GET /auth/:platform/start & /auth/:platform/callback
