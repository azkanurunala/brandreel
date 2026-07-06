# 📘 Panduan Integrasi Backend BrandReel

> **Untuk siapa?** Untuk kamu yang **belum pernah ngoding sama sekali**. Panduan ini memecah pekerjaan besar menjadi bab-bab kecil yang bisa kamu kerjakan satu per satu. Setiap bab berdiri sendiri, jadi kamu tidak perlu membaca semuanya sekaligus.

---

## Cara memakai panduan ini

1. **Baca berurutan dari atas ke bawah.** Setiap bab membangun di atas bab sebelumnya.
2. **Jangan loncat-loncat di awal.** Selesaikan Bab 00–02 dulu sebelum yang lain.
3. **Kerjakan sambil baca.** Buka Terminal & editor di sebelah panduan ini, lalu ikuti tiap langkah.
4. **Kalau ketemu istilah asing**, balik ke [Bab 00 — Kamus Istilah](./00-kamus-istilah.md).

---

## Daftar bab

| # | Bab | Isi singkat | Tingkat |
|---|---|---|---|
| 00 | [Kamus Istilah](./00-kamus-istilah.md) | Arti semua kata teknis dengan analogi sehari-hari | ⭐ wajib baca |
| 01 | [Persiapan Alat & Akun](./01-persiapan-alat-dan-akun.md) | Install Node.js, editor, daftar akun developer | ⭐ wajib |
| 02 | [Backend Pertamamu](./02-backend-pertama.md) | Bikin server sederhana yang bisa menjawab "halo" | ⭐ pemula |
| 03 | [Kunci AI: Claude & Veo](./03-kunci-ai-claude-veo.md) | Pindahkan kunci AI ke server dengan aman | ⭐⭐ |
| 04 | [Menghubungkan Akun (OAuth)](./04-oauth-hubungkan-akun.md) | "Login dengan TikTok/Instagram/dll" | ⭐⭐⭐ |
| 05 | [Posting ke Platform](./05-posting-ke-platform.md) | Mengirim video ke tiap sosial media | ⭐⭐⭐ |
| 06 | [Statistik (Insights)](./06-insights-statistik.md) | Mengambil data views, likes, dll | ⭐⭐ |
| 07 | [API & Database](./07-api-endpoint-dan-database.md) | Daftar alamat API + cara menyimpan data | ⭐⭐ |
| 08 | [Keamanan](./08-keamanan.md) | Aturan yang TIDAK boleh dilanggar | ⭐ wajib |
| 09 | [Rollout & Deploy](./09-rollout-dan-deploy.md) | Urutan pengerjaan + menaruh backend online | ⭐⭐ |
| 10 | [Frontend Lintas Platform](./10-frontend-react-native-lintas-platform.md) | Konsep 1 source code untuk semua (Expo) | ⭐⭐ |
| 11 | [Setup Expo](./11-setup-expo.md) | Bikin app jalan di iOS/Android/Web | ⭐⭐ |
| 12 | [Responsive & Adaptif](./12-responsive-adaptif.md) | 4 tampilan: mobile/tablet portrait/landscape/desktop | ⭐⭐⭐ |
| 13 | [Sambung Frontend↔Backend](./13-sambung-frontend-backend.md) | Menghubungkan Expo ke API | ⭐⭐ |
| 14 | [Handoff ke Claude Code](./14-handoff-claude-code.md) | Brief siap-tempel agar app dibangun penuh | ⭐ wajib |
| 15 | [Referensi `.env`](./15-referensi-env.md) | Semua placeholder kunci + file contoh siap-salin | ⭐ wajib |
| 16 | [Skema Database](./16-skema-database.md) | Prisma schema siap eksekusi + cara migrasi | ⭐⭐ |
| 17 | [Deploy Sekali-Klik](./17-deploy-render-blueprint.md) | Render blueprint + package.json siap-pakai | ⭐⭐ |
| 18 | [Starter Scaffold](./18-starter-scaffold.md) | Kode awal backend siap-jalan + inti mobile | ⭐⭐ |

**Berkas siap-pakai:** [`contoh-env/`](./contoh-env/) (`.env.example`) · [`skema-database/`](./skema-database/) (`schema.prisma` + `seed.ts`) · [`berkas-siap-pakai/`](./berkas-siap-pakai/) (`render.yaml` + config) · [`starter-backend/`](./starter-backend/) (API siap-jalan) · [`starter-mobile/`](./starter-mobile/) (inti Expo)

---

## Stack teknologi (keputusan final)

| Lapisan | Teknologi |
|---|---|
| **Frontend** | Expo (React Native + Web) + TypeScript — 1 source code untuk iOS/Android/iPad/Web |
| **Backend** | Node + TypeScript (Express) — bahasa sama dengan frontend |
| **Database** | Neon (PostgreSQL cloud) + Prisma |
| **Antrean/Cron** | BullMQ + Redis |
| **Deploy** | Render (web service + worker + cron) |

---

## Peta besar (lihat ini supaya tidak tersesat)

```
[ PENGGUNA di browser/HP ]              ← tampilan (frontend) SUDAH JADI
            │
            │  bicara HANYA ke server kamu
            ▼
[ BACKEND BRANDREEL — server milikmu ]  ← INI yang kita bangun (Bab 02–09)
            │  simpan semua kunci rahasia di sini
            ▼
[ Claude · Veo · TikTok · Instagram · YouTube · LinkedIn · X · Facebook ]
```

**Inti seluruh proyek:** tampilan sudah jadi. Tugas kita hanya membangun "server perantara" yang memegang kunci rahasia dan berbicara ke layanan luar. Kita kerjakan **bertahap, satu bab demi satu bab.**

---

## Status fitur saat ini

- ✅ **Sudah nyata:** naskah AI (Claude) & pembuatan video (Veo) — tinggal dipindah ke server (Bab 03).
- ⚠️ **Masih simulasi:** login akun, posting, statistik — ini yang dibangun di Bab 04–06.

---

## Estimasi waktu (kasar, untuk pemula dibantu developer)

| Fase | Bab | Perkiraan |
|---|---|---|
| Fondasi | 02–03 | 1–2 minggu |
| Satu platform penuh | 04–05 (TikTok) | 2–3 minggu + **review platform (berminggu-minggu)** |
| Statistik | 06 | 1 minggu |
| Platform lain | 04–06 diulang | tergantung review |

> ⏳ **Mulai daftar & ajukan review TikTok + Instagram di HARI PERTAMA** — ini bagian paling lama dan tidak bisa dipercepat. Detailnya di [Bab 01](./01-persiapan-alat-dan-akun.md).

---

*Panduan ini adalah versi rinci dari dokumen "BrandReel — Backend Integration Spec". Mulai dari [Bab 00](./00-kamus-istilah.md).*
