// src/routes/health.ts — cek server & database hidup
import { Router } from "express";
import { prisma } from "../db.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // pastikan DB terjangkau
    res.json({ ok: true, service: "brandreel-api", db: "up" });
  } catch {
    res.status(503).json({ ok: false, db: "down" });
  }
});
