// src/routes/insights.ts — statistik gabungan (Bab 06)
import { Router } from "express";
import { prisma } from "../db.js";

export const insightsRouter = Router();

// GET /insights — agregasi snapshot terbaru: total, per platform, per hook, top performer
insightsRouter.get("/insights", async (_req, res) => {
  const snapshots = await prisma.insightSnapshot.findMany({
    orderBy: { capturedAt: "desc" },
    include: {
      post: {
        select: {
          platform: true,
          campaignId: true,
          campaign: { select: { product: true } },
          hook: { select: { label: true, angle: true } },
        },
      },
    },
  });

  const total = { views: 0, likes: 0, comments: 0, shares: 0, reach: 0 };
  const perPlatform: Record<string, typeof total> = {};
  const perHook: Record<string, { views: number; engagement: number }> = {};

  // Snapshot terbaru per post (dedupe — daftar sudah urut terbaru dulu).
  const seenPost = new Set<string>();
  let top: { product: string; hookLabel: string | null; views: number; engagementPct: number } | null = null;

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

    const hookLabel = s.post.hook?.label ?? "unknown";
    perHook[hookLabel] ??= { views: 0, engagement: 0 };
    perHook[hookLabel].views += s.views;
    perHook[hookLabel].engagement += s.likes + s.comments + s.shares;

    if (!seenPost.has(s.postId)) {
      seenPost.add(s.postId);
      const eng = s.views > 0 ? ((s.likes + s.comments + s.shares) / s.views) * 100 : 0;
      if (!top || s.views > top.views) {
        top = { product: s.post.campaign.product, hookLabel: s.post.hook?.label ?? null, views: s.views, engagementPct: eng };
      }
    }
  }

  const maxHookViews = Math.max(1, ...Object.values(perHook).map((h) => h.views));
  const byHook = Object.entries(perHook)
    .map(([label, h]) => ({ label, views: h.views, pct: Math.round((h.views / maxHookViews) * 100) }))
    .sort((a, b) => b.views - a.views);

  res.json({ total, perPlatform, byHook, top });
});
