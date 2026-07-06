// src/jobs/insights.ts — dijalankan oleh Cron Render (Bab 06)
// Ambil metrik tiap post live -> simpan snapshot baru. Lalu proses keluar.
import { prisma } from "../db.js";

async function run() {
  console.log("📊 Job insights mulai:", new Date().toISOString());

  const livePosts = await prisma.post.findMany({
    where: { state: "posted" },
    select: { id: true, platform: true, remoteId: true },
  });

  for (const post of livePosts) {
    // TODO (fase insights): panggil adapter fetchInsights(platform, remoteId).
    // Sekarang: tulis snapshot kosong sebagai kerangka agar alurnya terbukti jalan.
    await prisma.insightSnapshot.create({
      data: { postId: post.id, views: 0, likes: 0, comments: 0, shares: 0, reach: 0 },
    });
  }

  console.log(`✅ Insights selesai untuk ${livePosts.length} post`);
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
