// src/worker.ts — Background Worker antrean posting & render (Bab 03, 05)
// Jalankan terpisah dari API:  npm run start:worker  (di Render = service "worker")
import { Worker } from "bullmq";
import { connection } from "./queue.js";
import { prisma } from "./db.js";
import { startVeoRender, waitForVeoRender } from "./lib/veo.js";
import { uploadVideo } from "./lib/storage.js";

console.log("👷 BrandReel worker mulai — mendengarkan antrean 'publish' & 'render'");

const publishWorker = new Worker(
  "publish",
  async (job) => {
    const { postId } = job.data as { postId: string };
    console.log(`→ Memproses post ${postId} (percobaan ke-${job.attemptsMade + 1})`);

    // TODO (fase publish): panggil adapter platform validate()/publish()
    // Pola: pre-flight -> publish -> simpan remoteId & permalink -> state "posted".
    // Di sini kita hanya menandai selesai sebagai kerangka.
    await prisma.post.update({
      where: { id: postId },
      data: { state: "posted", postedAt: new Date() },
    });

    return { ok: true };
  },
  {
    connection,
    // Retry otomatis dengan backoff (Bab 05) diatur saat menambah job ke queue:
    //   publishQueue.add("post", { postId }, { attempts: 5, backoff: { type: "exponential", delay: 60000 } })
  }
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
