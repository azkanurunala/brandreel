// src/worker.ts — Background Worker antrean posting (Bab 05)
// Jalankan terpisah dari API:  npm run start:worker  (di Render = service "worker")
import { Worker } from "bullmq";
import { connection } from "./queue.js";
import { prisma } from "./db.js";

console.log("👷 BrandReel worker mulai — mendengarkan antrean 'publish'");

const worker = new Worker(
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

worker.on("failed", (job, err) => {
  console.error(`✗ Job ${job?.id} gagal:`, err.message);
});
worker.on("completed", (job) => {
  console.log(`✓ Job ${job.id} selesai`);
});
