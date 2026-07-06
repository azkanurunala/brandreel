# Starter Backend — BrandReel API

Kerangka backend siap-jalan (Bab 18). Struktur mengikuti stack final: **Node + TypeScript + Express + Prisma + Neon + BullMQ**.

## Menjalankan (lokal)

```bash
npm install                 # pasang dependency
cp .env.example .env        # lalu isi DATABASE_URL & DIRECT_URL dari Neon (Bab 15)
npx prisma migrate dev --name init   # buat tabel
npm run db:seed             # (opsional) isi data contoh
npm run dev                 # server jalan di http://localhost:3000
```

Cek: buka `http://localhost:3000/health` → `{ ok: true, db: "up" }`.

## Struktur

```
src/
├── index.ts            titik masuk API (Express)
├── env.ts              baca & validasi .env (zod)
├── db.ts               Prisma Client
├── queue.ts            Redis + antrean BullMQ
├── worker.ts           background worker posting (npm run start:worker)
├── jobs/insights.ts    job cron statistik (npm run job:insights)
└── routes/
    ├── health.ts       GET /health
    ├── generate.ts     POST /generate (Claude proxy)
    ├── campaigns.ts    GET/POST /campaigns, GET /campaigns/:id/status
    ├── connections.ts  GET/DELETE /connections
    └── insights.ts     GET /insights
prisma/
├── schema.prisma       skema database (Bab 16)
└── seed.ts             data contoh
```

## Yang masih `TODO` (fase berikutnya — lihat brief Bab 14)

- OAuth `/auth/:platform/start` & `/callback` (Bab 04)
- Adapter platform + pipeline publish di `worker.ts` (Bab 05)
- `fetchInsights` nyata di `jobs/insights.ts` (Bab 06)
- Render Veo di `/campaigns/:id/renders` (Bab 03)

Kerangka ini sengaja minimal tapi **benar-benar berjalan**, supaya Claude Code melengkapinya bertahap tanpa memulai dari nol.
