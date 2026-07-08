// src/jobs/insights.ts — dijalankan oleh Cron Render (Bab 06)
// Ambil metrik tiap post live via adapter.fetchInsights() -> simpan snapshot baru.
import { prisma } from "../db.js";
import { decryptTokenRef } from "../lib/vault.js";
import { getAdapter, type PlatformId } from "../lib/adapters/index.js";

async function run() {
  console.log("📊 Job insights mulai:", new Date().toISOString());

  const livePosts = await prisma.post.findMany({
    where: { state: "posted", remoteId: { not: null } },
    include: { connection: true },
  });

  let ok = 0;
  let skipped = 0;

  for (const post of livePosts) {
    if (!post.remoteId) { skipped++; continue; }
    try {
      const adapter = getAdapter(post.platform as PlatformId);
      const { access_token } = decryptTokenRef<{ access_token: string }>(post.connection.tokenRef);
      const metrics = await adapter.fetchInsights(access_token, post.remoteId);
      await prisma.insightSnapshot.create({
        data: {
          postId: post.id,
          views: metrics.views,
          likes: metrics.likes,
          comments: metrics.comments,
          shares: metrics.shares,
          reach: metrics.reach,
        },
      });
      ok++;
    } catch (e: any) {
      // Adapter belum diimplementasi utk platform ini, atau token kedaluwarsa —
      // lewati post ini, jangan hentikan seluruh job (Bab 06: kerjakan bertahap).
      console.warn(`⚠ Lewati post ${post.id} (${post.platform}): ${e.message ?? e}`);
      skipped++;
    }
  }

  console.log(`✅ Insights selesai: ${ok} snapshot dibuat, ${skipped} dilewati (dari ${livePosts.length} post live)`);
}

run()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error("❌ Job insights gagal:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
