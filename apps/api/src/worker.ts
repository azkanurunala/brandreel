// src/worker.ts — Background Worker antrean posting & render (Bab 03, 05)
// Jalankan terpisah dari API:  npm run start:worker  (di Render = service "worker")
import { Worker } from "bullmq";
import { connection } from "./queue.js";
import { prisma } from "./db.js";
import { startVeoRender, waitForVeoRender } from "./lib/veo.js";
import { uploadVideo } from "./lib/storage.js";
import { decryptTokenRef } from "./lib/vault.js";
import { getAdapter, type PlatformId } from "./lib/adapters/index.js";

console.log("👷 BrandReel worker mulai — mendengarkan antrean 'publish' & 'render'");

// Posting nyata via adapter (Bab 05 §1/§3). Retry/backoff diatur saat job
// ditambahkan (publish.ts): attempts:5, backoff exponential mulai 60d.
// Status Post disinkronkan tiap percobaan supaya layar Publishing selalu benar.
const publishWorker = new Worker(
  "publish",
  async (job) => {
    const { postId } = job.data as { postId: string };
    const isLastAttempt = job.attemptsMade + 1 >= (job.opts.attempts ?? 1);

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { connection: true, render: true },
    });
    if (!post) throw new Error(`Post ${postId} tidak ditemukan`);
    if (!post.render?.storageUrl) throw new Error(`Render untuk post ${postId} belum punya storageUrl`);

    console.log(`→ Memproses post ${postId} (${post.platform}, percobaan ke-${job.attemptsMade + 1})`);

    try {
      const { access_token } = decryptTokenRef<{ access_token: string }>(post.connection.tokenRef);
      const adapter = getAdapter(post.platform as PlatformId);
      const result = await adapter.publish({
        accessToken: access_token,
        videoUrl: post.render.storageUrl,
        caption: post.caption ?? "",
      });

      await prisma.post.update({
        where: { id: postId },
        data: {
          state: result.state,
          remoteId: result.remoteId,
          permalink: result.permalink,
          postedAt: result.state === "posted" ? new Date() : null,
          attempts: { increment: 1 },
          lastError: null,
        },
      });
      return { ok: true };
    } catch (err: any) {
      const message = err.message ?? String(err);
      await prisma.post.update({
        where: { id: postId },
        data: { state: isLastAttempt ? "failed" : "retry", attempts: { increment: 1 }, lastError: message },
      });
      throw err; // biarkan BullMQ jadwalkan retry berikutnya (kecuali percobaan terakhir)
    }
  },
  { connection }
);

// Render video UGC via Veo (Bab 03): mulai operasi -> poll -> unggah -> simpan URL.
const renderWorker = new Worker(
  "render",
  async (job) => {
    const { renderId } = job.data as { renderId: string };
    const render = await prisma.render.findUnique({
      where: { id: renderId },
      include: { campaign: true, hook: true },
    });
    if (!render) throw new Error(`Render ${renderId} tidak ditemukan`);

    await prisma.render.update({ where: { id: renderId }, data: { state: "processing" } });

    const durationS = render.hook?.label === "h5" ? 5 : 6;
    const script = render.hook?.script || render.campaign.product;
    const prompt = `${durationS}s vertical UGC-style product video for "${render.campaign.product}". Hook: ${script}. Natural handheld phone footage, authentic creator energy, good lighting.`;

    const { operationName } = await startVeoRender({
      prompt,
      ratio: render.ratio as "9:16" | "1:1" | "16:9",
      durationSec: durationS,
    });
    const result = await waitForVeoRender(operationName);

    if (result.error || !result.videoBase64) {
      await prisma.render.update({
        where: { id: renderId },
        data: { state: "failed", error: result.error ?? "Render gagal" },
      });
      throw new Error(result.error ?? "Render gagal");
    }

    const bytes = Buffer.from(result.videoBase64, "base64");
    const key = `renders/${render.campaignId}/${render.id}.mp4`;
    const url = await uploadVideo(key, bytes, result.mimeType ?? "video/mp4");

    await prisma.render.update({
      where: { id: renderId },
      data: { state: "ready", storageUrl: url, durationS, error: null },
    });

    return { ok: true, url };
  },
  { connection }
);

for (const w of [publishWorker, renderWorker]) {
  w.on("failed", (job, err) => console.error(`✗ Job ${job?.queueName}/${job?.id} gagal:`, err.message));
  w.on("completed", (job) => console.log(`✓ Job ${job.queueName}/${job.id} selesai`));
}
