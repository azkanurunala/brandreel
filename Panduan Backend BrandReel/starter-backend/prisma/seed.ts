// ============================================================
//  BrandReel — Seed Data (data contoh awal)
//  Mengisi database dengan 1 akun + brand kit + 1 campaign demo
//  supaya bisa langsung dites setelah migrasi.
// ------------------------------------------------------------
//  CARA PAKAI (di folder backend):
//    1. taruh file ini di  prisma/seed.ts
//    2. pasang runner TS:  npm install -D tsx
//    3. tambahkan ke package.json:
//         "prisma": { "seed": "tsx prisma/seed.ts" }
//    4. jalankan:  npx prisma db seed
//  (Aman diulang: memakai upsert, jadi tidak menggandakan data.)
// ============================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // --- 1. Akun demo (pemilik) ---
  const account = await prisma.account.upsert({
    where: { email: "demo@brandreel.app" },
    update: {},
    create: {
      email: "demo@brandreel.app",
      name: "Demo Owner",
      role: "owner",
      plan: "pro",
      postQuota: 100,
    },
  });

  // --- 2. Brand kit ---
  const brandKit = await prisma.brandKit.create({
    data: {
      accountId: account.id,
      name: "Sneaker Co.",
      voice: "energik, gaul, singkat",
      logoUrl: "https://placehold.co/200x200?text=Logo",
      colors: ["#111111", "#FF4D2E", "#F5F5F5"],
    },
  });

  // --- 3. Campaign demo ---
  const campaign = await prisma.campaign.create({
    data: {
      accountId: account.id,
      brandKitId: brandKit.id,
      product: "Sepatu Lari X1",
      description: "Peluncuran sepatu lari ringan untuk pelari pemula.",
      platforms: ["tiktok", "instagram", "youtube"],
      status: "ready",
      topHook: "h1",
    },
  });

  // --- 4. Tiga hook contoh (hasil AI) ---
  const hooksData = [
    { label: "h1", angle: "problem-solution", script: "Kaki pegal tiap lari? Ini solusinya.", caption: "Ringan di kaki 🏃 #lari #sepatu" },
    { label: "h2", angle: "social-proof", script: "10.000 pelari sudah pindah ke X1.", caption: "Kenapa semua beralih? #running" },
    { label: "h3", angle: "bold-claim", script: "Sepatu teringan yang pernah kamu pakai.", caption: "Coba & rasakan bedanya. #sneaker" },
  ];
  const hooks = [];
  for (const h of hooksData) {
    hooks.push(
      await prisma.hook.create({ data: { campaignId: campaign.id, ...h } })
    );
  }

  // --- 5. Render demo (video 9:16 siap) ---
  const render = await prisma.render.create({
    data: {
      campaignId: campaign.id,
      hookId: hooks[0].id,
      ratio: "9:16",
      provider: "veo",
      state: "ready",
      storageUrl: "https://placehold.co/1080x1920.mp4",
      durationS: 6,
    },
  });

  // --- 6. Koneksi TikTok demo (status aktif) ---
  const connection = await prisma.connection.create({
    data: {
      accountId: account.id,
      platform: "tiktok",
      remoteUserId: "demo_tiktok_123",
      handle: "@sneakerco",
      tokenRef: "vault://demo/tiktok",   // hanya petunjuk — token asli di brankas (Bab 08)
      scopes: ["video.publish", "video.upload", "user.info.basic"],
      status: "active",
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000), // 7 hari lagi
    },
  });

  // --- 7. Post demo (sudah posted) + 1 snapshot statistik ---
  const post = await prisma.post.create({
    data: {
      campaignId: campaign.id,
      connectionId: connection.id,
      hookId: hooks[0].id,
      renderId: render.id,
      platform: "tiktok",
      caption: hooks[0].caption,
      state: "posted",
      postedAt: new Date(),
      remoteId: "tt_demo_987",
      permalink: "https://www.tiktok.com/@sneakerco/video/987",
    },
  });

  await prisma.insightSnapshot.create({
    data: {
      postId: post.id,
      views: 12450,
      likes: 830,
      comments: 47,
      shares: 112,
      reach: 15200,
    },
  });

  console.log("✅ Seed selesai:");
  console.log("   akun     :", account.email);
  console.log("   campaign :", campaign.product);
  console.log("   hooks    :", hooks.length);
  console.log("   post     :", post.permalink);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed gagal:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
