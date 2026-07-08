// src/routes/accounts.ts — akun demo (Fase 3, sebelum sesi login asli ada)
// Frontend belum punya sesi user; endpoint ini memberi satu accountId tetap
// supaya alur create->generate bisa diuji end-to-end sebelum Bab 04 (auth) selesai.
import { Router } from "express";
import { prisma } from "../db.js";

export const accountsRouter = Router();

accountsRouter.get("/accounts/demo", async (_req, res) => {
  const account = await prisma.account.upsert({
    where: { email: "demo@brandreel.app" },
    update: {},
    create: { email: "demo@brandreel.app", name: "Demo Owner", role: "owner", plan: "pro", postQuota: 100 },
  });
  res.json({ id: account.id, email: account.email });
});
