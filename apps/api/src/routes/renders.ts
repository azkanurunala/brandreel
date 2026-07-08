// src/routes/renders.ts — trigger & cek status render video Veo (Bab 03)
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { renderQueue } from "../queue.js";

export const rendersRouter = Router();

const createSchema = z.object({
  hookId: z.string().optional(),
  ratio: z.enum(["9:16", "1:1", "16:9"]).default("9:16"),
});

// POST /campaigns/:id/renders — antre render baru
rendersRouter.post("/campaigns/:id/renders", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id } });
  if (!campaign) return res.status(404).json({ error: "Campaign tidak ditemukan" });

  if (parsed.data.hookId) {
    const hook = await prisma.hook.findUnique({ where: { id: parsed.data.hookId } });
    if (!hook || hook.campaignId !== campaign.id) return res.status(404).json({ error: "Hook tidak ditemukan" });
  }

  const render = await prisma.render.create({
    data: {
      campaignId: campaign.id,
      hookId: parsed.data.hookId,
      ratio: parsed.data.ratio,
      provider: "veo",
      state: "queued",
    },
  });

  await renderQueue.add("render", { renderId: render.id }, { attempts: 2 });
  res.status(201).json(render);
});

// GET /campaigns/:id/renders — daftar render campaign
rendersRouter.get("/campaigns/:id/renders", async (req, res) => {
  const items = await prisma.render.findMany({
    where: { campaignId: req.params.id },
    orderBy: { createdAt: "desc" },
  });
  res.json(items);
});

// GET /renders/:id — status satu render (untuk polling frontend)
rendersRouter.get("/renders/:id", async (req, res) => {
  const item = await prisma.render.findUnique({ where: { id: req.params.id } });
  if (!item) return res.status(404).json({ error: "Render tidak ditemukan" });
  res.json(item);
});
