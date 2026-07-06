# Bab 18 — Starter Scaffold (Kode Awal Siap-Jalan)

> Tujuan: memberi **kerangka kode nyata** yang sudah berjalan, supaya Claude Code melengkapinya bertahap — bukan memulai dari nol. Ada dua bagian: backend & potongan inti mobile.

[← Bab 17: Deploy Blueprint](./17-deploy-render-blueprint.md) · [Daftar isi](./README.md)

---

## Apa yang disediakan

| Folder | Isi | Status |
|---|---|---|
| [`starter-backend/`](./starter-backend/) | API Express + Prisma + BullMQ lengkap dengan rute dasar | **berjalan** |
| [`starter-mobile/`](./starter-mobile/) | potongan inti Expo: breakpoint, AppShell adaptif, pemanggil API | **siap salin** |

> Kerangka ini **minimal tapi benar-benar jalan**: server hidup, `/health` cek database, `/generate` proxy Claude, CRUD campaign, `/connections`, `/insights`, worker & cron job — semua terhubung ke skema ([Bab 16](./16-skema-database.md)).

---

## Bagian 1 — Menjalankan backend

```bash
# masuk ke folder backend proyekmu (mis. apps/api), salin isi starter-backend ke sana
npm install
cp .env.example .env          # isi DATABASE_URL & DIRECT_URL dari Neon (Bab 15)
npx prisma migrate dev --name init
npm run db:seed               # opsional: data contoh
npm run dev                   # http://localhost:3000
```

Cek: buka `http://localhost:3000/health` → harus `{ ok: true, db: "up" }`.

**Menjalankan worker & cron (opsional saat Fase 1):**
```bash
npm run dev:worker            # worker antrean posting
npm run job:insights          # jalankan job statistik sekali
```

### Struktur backend

```
src/
├── index.ts            Express: middleware + mount semua rute
├── env.ts              baca & validasi .env (zod)
├── db.ts               Prisma Client (singleton)
├── queue.ts            Redis + antrean BullMQ
├── worker.ts           background worker posting  → npm run start:worker
├── jobs/insights.ts    job cron statistik         → npm run job:insights
└── routes/
    ├── health.ts       GET  /health
    ├── generate.ts     POST /generate      (Claude)
    ├── campaigns.ts    GET/POST /campaigns, GET /campaigns/:id/status
    ├── connections.ts  GET/DELETE /connections
    └── insights.ts     GET  /insights
```

---

## Bagian 2 — Memakai potongan mobile

`starter-mobile/` bukan proyek penuh — ia potongan inti yang disalin ke proyek Expo (dibuat di [Bab 11](./11-setup-expo.md)):

- `hooks/useBreakpoint.ts` — kelas layar responsif (Bab 12)
- `components/AppShell.tsx` — navigasi **adaptif** (tab bar ↔ sidebar)
- `lib/api.ts` + `constants/api.ts` — pemanggil API (Bab 13)

Bungkus aplikasi dengan `<AppShell>` lalu render layar sesuai tab aktif. Dua hal tersulit lintas platform (responsif + adaptif) sudah tertangani.

---

## Bagian 3 — Yang sengaja dibiarkan `TODO`

Ditandai jelas di kode, untuk dilengkapi Claude Code per fase (brief [Bab 14](./14-handoff-claude-code.md)):

| TODO | Di file | Bab |
|---|---|---|
| OAuth start/callback + refresh token | `routes/connections.ts` | 04 |
| Adapter platform + pipeline publish | `worker.ts` | 05 |
| `fetchInsights` nyata | `jobs/insights.ts` | 06 |
| Render Veo | `routes/campaigns.ts` | 03 |
| Semua layar mobile meniru prototype | `starter-mobile/` | 10–12 |

---

## Kenapa tidak langsung 100% jadi di sini?

Kerangka ini sengaja **fondasi yang benar**, bukan aplikasi penuh, karena:
1. **Kamu belajar alurnya** saat Claude Code melengkapi tiap fase & menjelaskan.
2. Bagian besar (semua layar, tiap adapter platform) paling baik dibangun **bertahap sambil diuji** — persis peran Claude Code yang bisa menjalankan kode.
3. Fondasi yang benar (struktur, skema, env, deploy) menghilangkan 80% kebingungan awal.

> Jadi urutan idealnya: buka proyek di Claude Code → ia lihat `CLAUDE.md` + scaffold ini → mulai Fase 1 dengan pondasi sudah ada → lanjut fase demi fase.

---

## Checklist Bab 18

- [ ] `starter-backend` disalin, `npm install`, `.env` diisi
- [ ] `prisma migrate dev` sukses + `/health` hijau
- [ ] (opsional) `db:seed`, worker, cron dicoba
- [ ] Potongan `starter-mobile` disalin ke proyek Expo
- [ ] `<AppShell>` membungkus aplikasi & navigasi adaptif jalan
- [ ] Serahkan ke Claude Code untuk melengkapi TODO per fase

---

[← Bab 17: Deploy Blueprint](./17-deploy-render-blueprint.md) · [Daftar isi](./README.md)
