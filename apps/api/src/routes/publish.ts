// src/routes/publish.ts — POST /campaigns/:id/publish (Bab 05 §3)
// Pre-flight -> stagger -> antre. Publish nyata terjadi di worker.ts.
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { publishQueue } from "../queue.js";
import { getAdapter, PLATFORM_SPEC, type PlatformId } from "../lib/adapters/index.js";

export const publishRouter = Router();

const publishSchema = z.object({ hookId: z.string().optional() });

publishRouter.post("/campaigns/:id/publish", async (req, res) => {
  const parsed = publishSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: { renders: true, hooks: true },
  });
  if (!campaign) return res.status(404).json({ error: "Campaign tidak ditemukan" });

  const hookId = parsed.data.hookId ?? campaign.hooks.find((h) => h.label === campaign.topHook)?.id;
  const hook = hookId ? campaign.hooks.find((h) => h.id === hookId) : campaign.hooks[0];

  const results: { platform: string; ok: boolean; reason?: string; postId?: string }[] = [];

  for (const platformRaw of campaign.platforms) {
    const platform = platformRaw as PlatformId;
    const spec = PLATFORM_SPEC[platform];
    if (!spec) { results.push({ platform, ok: false, reason: "platform tidak dikenal" }); continue; }

    // Pre-flight: koneksi aktif?
    const connection = await prisma.connection.findFirst({
      where: { accountId: campaign.accountId, platform, status: "active" },
    });
    if (!connection) {
      results.push({ platform, ok: false, reason: "belum terhubung — lihat halaman Profile" });
      continue;
    }

    // Pre-flight: render siap dgn rasio yang benar?
    const render = campaign.renders.find((r) => r.ratio === spec.ratio && r.state === "ready");
    if (!render) {
      results.push({ platform, ok: false, reason: `render ${spec.ratio} belum siap` });
      continue;
    }

    // Pre-flight: format/caption via adapter.validate()
    const caption = hook?.caption ?? campaign.product;
    const adapter = getAdapter(platform);
    const check = adapter.validate({ ratio: render.ratio, durationS: render.durationS, captionLen: caption.length });
    if (!check.ok) {
      results.push({ platform, ok: false, reason: check.reason });
      continue;
    }

    // Cegah dobel posting (belum ada Post queued/posted utk render+platform ini)
    const dupe = await prisma.post.findFirst({
      where: { campaignId: campaign.id, platform, renderId: render.id, state: { in: ["queued", "posted"] } },
    });
    if (dupe) { results.push({ platform, ok: false, reason: "sudah pernah diposting" }); continue; }

    // Stagger: TikTok dijeda dari post TikTok terakhir yang antre/tayang
    let scheduledAt = new Date();
    if (spec.staggerMinutes) {
      const last = await prisma.post.findFirst({
        where: { platform, state: { in: ["queued", "posted"] } },
        orderBy: { scheduledAt: "desc" },
      });
      if (last?.scheduledAt) {
        const earliest = new Date(last.scheduledAt.getTime() + spec.staggerMinutes * 60_000);
        if (earliest > scheduledAt) scheduledAt = earliest;
      }
    }

    const post = await prisma.post.create({
      data: {
        campaignId: campaign.id,
        connectionId: connection.id,
        hookId: hook?.id,
        renderId: render.id,
        platform,
        caption,
        state: "queued",
        scheduledAt,
      },
    });

    await publishQueue.add(
      "post",
      { postId: post.id },
      { delay: Math.max(0, scheduledAt.getTime() - Date.now()), attempts: 5, backoff: { type: "exponential", delay: 60_000 } }
    );

    results.push({ platform, ok: true, postId: post.id });
  }

  await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "publishing" } });
  res.status(202).json({ results });
});
