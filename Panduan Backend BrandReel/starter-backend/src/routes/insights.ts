// src/routes/insights.ts — statistik gabungan (Bab 06)
import { Router } from "express";
import { prisma } from "../db.js";

export const insightsRouter = Router();

// GET /insights?range=7d — agregasi snapshot terbaru per post
insightsRouter.get("/insights", async (_req, res) => {
  // Ambil snapshot terbaru tiap post lalu jumlahkan (versi sederhana Fase 1).
  const snapshots = await prisma.insightSnapshot.findMany({
    orderBy: { capturedAt: "desc" },
    include: { post: { select: { platform: true, hookId: true } } },
  });

  const total = { views: 0, likes: 0, comments: 0, shares: 0, reach: 0 };
  const perPlatform: Record<string, typeof total> = {};

  for (const s of snapshots) {
    total.views += s.views;
    total.likes += s.likes;
    total.comments += s.comments;
    total.shares += s.shares;
    total.reach += s.reach;

    const p = s.post.platform;
    perPlatform[p] ??= { views: 0, likes: 0, comments: 0, shares: 0, reach: 0 };
    perPlatform[p].views += s.views;
    perPlatform[p].likes += s.likes;
    perPlatform[p].comments += s.comments;
    perPlatform[p].shares += s.shares;
    perPlatform[p].reach += s.reach;
  }

  res.json({ total, perPlatform });
});
