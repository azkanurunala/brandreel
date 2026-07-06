// src/routes/campaigns.ts — CRUD campaign dasar (Bab 07)
// Fase 1: cukup baca/tulis DB. generate/renders/publish dilengkapi di fase berikutnya.
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";

export const campaignsRouter = Router();

// GET /campaigns — daftar campaign
campaignsRouter.get("/campaigns", async (_req, res) => {
  const items = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
    include: { hooks: true, renders: true },
  });
  res.json(items);
});

// GET /campaigns/:id
campaignsRouter.get("/campaigns/:id", async (req, res) => {
  const item = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: { hooks: true, renders: true, posts: true },
  });
  if (!item) return res.status(404).json({ error: "Campaign tidak ditemukan" });
  res.json(item);
});

// POST /campaigns — buat campaign
const createSchema = z.object({
  accountId: z.string(),
  product: z.string().min(1),
  description: z.string().optional(),
  platforms: z.array(z.string()).default([]),
  brandKitId: z.string().optional(),
});

campaignsRouter.post("/campaigns", async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await prisma.campaign.create({
    data: { ...parsed.data, platforms: parsed.data.platforms as any },
  });
  res.status(201).json(created);
});

// GET /campaigns/:id/status — status posting per platform (Bab 05)
campaignsRouter.get("/campaigns/:id/status", async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { campaignId: req.params.id },
    select: { platform: true, state: true, permalink: true, scheduledAt: true },
  });
  res.json({ perPlatform: posts });
});

// TODO (fase berikutnya): POST /campaigns/:id/generate, /renders, /publish
