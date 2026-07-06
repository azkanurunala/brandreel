# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> File ini adalah **instruksi wajib** untuk Claude Code. Baca seluruhnya sebelum menulis kode apa pun. Sumber kebenaran ada di folder [`Panduan Backend BrandReel/`](./Panduan%20Backend%20BrandReel/) — ikuti bab-babnya.

---

## 0. Kondisi repo saat ini (PENTING)

Repo ini adalah **bundle handoff desain + spesifikasi** — **belum ada kode aplikasi** (`apps/` belum dibuat, tidak ada `package.json` di root). Isi repo:

- `BrandReel - Mobile Prototype.html` + `assets/*.jsx` — prototype interaktif: React 18 UMD + Babel standalone; HTML memuat semua `assets/br-*.jsx` sebagai `<script type="text/babel">`. `br-theme/br-shell/br-data` = sistem dasar; `br-screens-*` = layar per fitur; `ios-frame/android-frame/ipad-frame/tweaks-panel` = bingkai preview, bukan bagian produk.
- `BrandReel - Backend Integration Spec.html` — spec ringkas versi HTML.
- `Panduan Backend BrandReel/` — kontrak spesifikasi (Bab 00–18, Bahasa Indonesia) + berkas siap-pakai (lihat §2).
- `.preview/`, `screenshots/` — tangkapan layar prototype (referensi visual saja).
- `export/`, `BrandReel-handoff.zip` — salinan/arsip bundle; jangan diedit.
- `project/` — kosong.

Kode implementasi baru dibuat mengikuti §6 (Fase 1 dst.), berbasis `starter-backend/` dan `starter-mobile/`.

## 0b. Perintah

Belum ada build/test/lint di root. Prototype dibuka langsung di browser (file HTML di root). Setelah scaffold, `apps/api` memakai skrip dari `Panduan Backend BrandReel/starter-backend/package.json`:

```bash
npm run dev          # API lokal (tsx watch src/index.ts)
npm run dev:worker   # worker BullMQ lokal
npm run build        # tsc → dist/
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma db seed
npm run db:studio    # prisma studio
npm run job:insights # job cron insights (dijalankan Render Cron)
```

`apps/mobile` = Expo standar: `npx expo start` (lihat Bab 11).

---

## 1. Tujuan proyek

Membangun **BrandReel**: aplikasi yang membuat video promosi dengan AI, mempostingnya otomatis ke banyak sosial media, lalu menampilkan statistiknya. Harus jalan dari **satu source code** di: iOS, Android, iPad (portrait & landscape), web desktop, web mobile, web tablet.

Pemilik proyek adalah **pemula total** dalam coding. Maka:
- Jelaskan tiap langkah singkat & jelas dalam Bahasa Indonesia.
- Jalankan kode sampai benar-benar berfungsi, jangan hanya menulis.
- Setelah tiap fase: `git commit`, lalu tunjukkan cara menjalankan & buktikan hasilnya.
- Jangan berasumsi; kalau ambigu, tanya dulu.

---

## 2. Sumber acuan (JANGAN mengarang)

- **Visual & daftar layar:** file HTML prototype di root — `BrandReel - Mobile Prototype.html` dan `BrandReel - Backend Integration Spec.html`. Tiru tampilan, alur, enum, dan status **PERSIS**.
- **Spesifikasi & keputusan:** folder `Panduan Backend BrandReel/` (Bab 00–16). Ini kontrak. Ikuti.
- **Berkas siap-pakai:**
  - `Panduan Backend BrandReel/skema-database/schema.prisma` — skema database final.
  - `Panduan Backend BrandReel/skema-database/seed.ts` — data contoh.
  - `Panduan Backend BrandReel/contoh-env/backend.env.example` & `frontend.env.example` — semua placeholder env.
  - `Panduan Backend BrandReel/berkas-siap-pakai/render.yaml` — blueprint deploy Render (4 service).
  - `Panduan Backend BrandReel/berkas-siap-pakai/backend.package.json` & `backend.tsconfig.json` — konfigurasi backend.
  - `Panduan Backend BrandReel/starter-backend/` — **kerangka API siap-jalan** (Express + Prisma + BullMQ). Pakai ini sebagai dasar `apps/api`, jangan mulai dari nol.
  - `Panduan Backend BrandReel/starter-mobile/` — **potongan inti Expo** (breakpoint, AppShell adaptif, pemanggil API). Salin ke `apps/mobile`.

---

## 3. Stack WAJIB (keputusan final — jangan diganti)

| Lapisan | Teknologi |
|---|---|
| Frontend | **Expo** (React Native + react-native-web) + **TypeScript** + Expo Router |
| Backend | **Node + TypeScript + Express** |
| Database | **Neon** (PostgreSQL) + **Prisma** |
| Antrean & jadwal | **BullMQ + Redis** |
| Storage video | Object storage kompatibel S3 (Cloudflare R2 / AWS S3) + CDN |
| Deploy | **Render** (Web Service + Background Worker + Cron Job); DB di Neon |

Struktur monorepo: `apps/mobile` (Expo) + `apps/api` (Express) + paket bersama bila perlu.

---

## 4. Aturan keras (tidak boleh dilanggar)

1. **Secret hanya di backend.** Frontend hanya boleh menyimpan alamat backend & flag (`EXPO_PUBLIC_*`). Tidak ada kunci/secret di frontend, selamanya.
2. **Token platform tidak disimpan mentah** di DB — simpan `tokenRef` ke brankas terenkripsi (KMS). Jangan pernah `console.log` token.
3. **Penukaran OAuth code→token wajib di backend.**
4. **`.env` tidak pernah di-commit** (pastikan `.gitignore`). Untuk apa pun yang butuh kunci/akun/review platform yang belum tersedia: tulis kode LENGKAP, beri placeholder di `.env` + komentar jelas, dan berikan daftar "yang harus diisi pemilik".
5. **Enum & status samakan dengan prototype:** `queued/posted/retry/failed`, `expiring/expired`, dll. (lihat schema.prisma).
6. **Responsif 4 kelas:** mobile `<600`, tabletPortrait `<900`, tabletLandscape `<1280`, desktop `>=1280`. Navigasi adaptif: tab bar (mobile/tablet portrait) → sidebar (tablet landscape/desktop). `app.json` orientation = `"default"`.
7. **Sertakan** `.env.example` (backend & frontend) dan README cara menjalankan lokal + deploy Render + connect Neon.

---

## 5. Integrasi yang harus dibangun (ringkas — detail di panduan)

- **AI proxy** (backend): Claude (Anthropic Messages) & Google Veo. Kunci di server. → Bab 03
- **OAuth 2.0** tiap platform: TikTok, Instagram, YouTube, LinkedIn, X, Facebook + auto-refresh token. → Bab 04
- **Publish pipeline**: adapter per platform `validate()/publish()/fetchInsights()`; alur pre-flight → stagger → publish → retry (backoff 429) → auto-fix. → Bab 05
- **Insights jobs** terjadwal (rapat 2 jam pertama, lalu melonggar) → snapshot → agregasi total/per-platform/per-hook/top-performer + kartu rekomendasi. → Bab 06
- **Endpoint** (Bab 07): `/auth/:platform/start`, `/auth/:platform/callback`, `/connections`, `/campaigns`, `/campaigns/:id/generate`, `/campaigns/:id/renders`, `/renders/:id`, `/campaigns/:id/publish`, `/campaigns/:id/status`, `/insights`, `/webhooks/:platform`.
- **Model data**: pakai `schema.prisma` yang sudah disediakan (Bab 16). Jalankan `prisma migrate` + `prisma db seed`.

---

## 6. Urutan pengerjaan (WAJIB bertahap — selesaikan & jalankan tiap fase sebelum lanjut)

- **Fase 1** — Scaffold monorepo (Expo + Express) + Prisma schema + connect Neon + migrate + seed + backend "halo" + Expo jalan di iOS/Android/Web. Tunjukkan cara menjalankan.
- **Fase 2** — Shell responsif 4 kelas + navigasi adaptif + semua layar (data dummy dulu, tiru prototype).
- **Fase 3** — Backend AI proxy (Claude + Veo) + sambungkan layar generate/render.
- **Fase 4** — OAuth 1 platform (TikTok) end-to-end + layar Connections.
- **Fase 5** — Publish pipeline + worker + layar Publishing pakai status asli.
- **Fase 6** — Insights jobs + layar Insights asli. Lalu tambah platform lain satu per satu.

**Mulai dari Fase 1. Berhenti dan tunggu konfirmasi "lanjut" sebelum pindah fase.**

---

## 7. Ekspektasi jujur

Kamu boleh membangun **seluruh kode** hingga 100%. Namun "berfungsi penuh di produksi" bergantung pada hal di luar kode: pemilik mengisi kunci API, mengisi saldo Anthropic/Google, connect Neon/Render, dan **menunggu review platform** (TikTok/Instagram bisa berminggu-minggu). Sediakan semua kode + placeholder + instruksi agar tinggal diisi & di-deploy.

---

*Referensi lengkap: mulai dari `Panduan Backend BrandReel/README.md`.*
