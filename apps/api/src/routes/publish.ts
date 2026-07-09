// src/routes/publish.ts — POST /campaigns/:id/publish (Bab 05 §3)
// Pre-flight -> stagger -> antre. Publish nyata terjadi di worker.ts.
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { publishQueue } from "../queue.js";
import { getAdapter, PLATFORM_SPEC, type PlatformId } from "../lib/adapters/index.js";
import { requireAuth } from "../middleware/auth.js";

export const publishRouter = Router();
// NB: requireAuth per rute — lihat catatan di campaigns.ts soal kenapa
// publishRouter.use(requireAuth) tidak aman (semua router di-mount di root).

const publishSchema = z.object({ hookId: z.string().optional(), scheduledAt: z.string().datetime().optional() });

publishRouter.post("/campaigns/:id/publish", requireAuth, async (req, res) => {
  const parsed = publishSchema.safeParse(req.body ?? {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: { renders: true, hooks: true },
  });
  if (!campaign || campaign.accountId !== req.accountId) return res.status(404).json({ error: "Campaign tidak ditemukan" });

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

    // Jadwal: waktu pilihan pengguna (Bab-Jadwal) atau sekarang; TikTok
    // tetap dijeda dari post TikTok terakhir yang antre/tayang di bawah.
    let scheduledAt = parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : new Date();
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

  // Cuma tandai "publishing" kalau MINIMAL satu platform beneran ke-queue —
  // kalau semua gagal pre-flight (belum connect dsb), status kampanye tidak
  // boleh berubah seolah-olah ada yang jalan (lihat toViewCampaign yang
  // membaca status ini buat nge-render papan status per-channel).
  const anyQueued = results.some((r) => r.ok);
  if (anyQueued) {
    await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "publishing" } });
  }
  res.status(202).json({ results, anyQueued });
});
