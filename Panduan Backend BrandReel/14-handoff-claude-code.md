# Bab 14 — Handoff ke Claude Code

> Tujuan: memberi Claude Code **satu brief lengkap** supaya ia membangun aplikasi sejauh mungkin **fully functional** dalam sekali jalan. Tinggal kamu tempel.

[← Bab 13: Sambung Backend](./13-sambung-frontend-backend.md) · [Daftar isi](./README.md)

---

## Baca ini dulu: ekspektasi jujur soal "100% otomatis"

Claude Code bisa menulis **seluruh kode** — frontend Expo lintas platform + backend + database + integrasi. Tapi beberapa hal **mustahil** dikerjakan kode karena butuh kamu / pihak luar:

| Yang bisa dikerjakan Claude Code | Yang HARUS kamu sendiri |
|---|---|
| Semua kode frontend & backend | Membuat akun developer tiap platform ([Bab 01](./01-persiapan-alat-dan-akun.md)) |
| Skema database (Prisma) + migrasi | Menempel kunci/secret asli ke `.env` |
| OAuth, pipeline posting, insights | **Menunggu review platform** (berminggu-minggu) |
| Layout responsif 4 kelas | Mengisi saldo Anthropic/Google (Veo) |
| Konfigurasi deploy Render | Menekan tombol deploy & hubungkan Neon/Render |

> **Kesimpulan:** kode bisa 100% jadi. "Berfungsi penuh di produksi" baru tercapai setelah kunci diisi & platform menyetujui. Brief di bawah membuat Claude Code mengerjakan **semua bagian kode**, dan menyisakan **placeholder jelas** untuk yang harus kamu isi.

---

## Cara pakai

1. Buka proyek di **Claude Code**.
2. Pastikan folder `Panduan Backend BrandReel/` + file prototype HTML ikut ada (sebagai acuan visual & "kontrak").
3. Tempel brief di bawah sebagai pesan pertama.
4. Kerjakan **bertahap** — jangan minta semua sekaligus; ikuti fase.

---

## 📋 BRIEF SIAP-TEMPEL (salin semua di bawah ini)

```
Kamu adalah senior engineer. Bangun aplikasi "BrandReel" secara bertahap.
Aku pemula — jelaskan tiap langkah singkat & jalankan sampai benar-benar berfungsi.

# Konteks
- Acuan visual & daftar layar: file HTML prototype di proyek ini ("BrandReel - Mobile Prototype.html"
  dan "BrandReel - Backend Integration Spec.html"). Tiru tampilan, alur, enum, dan status
  (queued/posted/retry/failed, expiring/expired) PERSIS dari sana.
- Spesifikasi rinci + keputusan: folder "Panduan Backend BrandReel/". Ikuti bab-babnya.

# Stack (WAJIB ikuti)
- Frontend: Expo (React Native + react-native-web) + TypeScript + Expo Router.
  Satu source code untuk iOS, Android, dan Web.
- Responsif/adaptif 4 kelas: mobile <600, tabletPortrait <900, tabletLandscape <1280, desktop >=1280.
  Navigasi: tab bar (mobile/tablet portrait) -> sidebar (tablet landscape/desktop). Grid kolom
  menyesuaikan. Dukung orientasi portrait & landscape (app.json orientation "default").
- Backend: Node + TypeScript + Express. ORM Prisma. Database Neon (PostgreSQL).
  Antrean BullMQ + Redis. Deploy target: Render (web service + background worker + cron).
- Semua secret via environment variables. JANGAN pernah menaruh secret di frontend.

# Integrasi yang harus dibangun
- AI: proxy Claude (Anthropic Messages API) & Google Veo di backend. Kunci hanya di server.
- OAuth 2.0 per platform: TikTok, Instagram, YouTube, LinkedIn, X, Facebook.
  Penukaran code->token di backend. Simpan token terenkripsi; DB simpan tokenRef, bukan token mentah.
  Auto-refresh token sebelum kedaluwarsa.
- Publish pipeline: adapter per platform dengan validate()/publish()/fetchInsights().
  Pre-flight -> stagger (jeda anti rate-limit) -> publish -> retry backoff (429) -> auto-fix format.
- Insights: job terjadwal (rapat 2 jam pertama, lalu melonggar) -> simpan snapshot -> agregasi
  total/per-platform/per-hook/top-performer + kartu rekomendasi.
- Endpoint (lihat Bab 07): /auth/:platform/start, /auth/:platform/callback, /connections,
  /campaigns, /campaigns/:id/generate, /campaigns/:id/renders, /renders/:id,
  /campaigns/:id/publish, /campaigns/:id/status, /insights, /webhooks/:platform.
- Model data (Bab 07): Account, Connection, BrandKit, Campaign, Render, Post, InsightSnapshot.

# Aturan keras
- Untuk apa pun yang butuh kunci/akun/review platform yang belum kupunya: buat kode LENGKAP,
  taruh placeholder di .env dengan komentar jelas, dan beri aku daftar "yang harus kuisi".
- Sertakan file .env.example untuk backend & frontend.
- Beri README menjalankan lokal + langkah deploy ke Render + connect Neon.

# Urutan pengerjaan (kerjakan fase 1 dulu, tunggu aku bilang "lanjut")
Fase 1: Scaffold monorepo (apps/mobile Expo + apps/api Express) + Prisma schema + Neon connect
        + backend "halo" + Expo jalan di iOS/Android/Web. Tunjukkan cara menjalankan.
Fase 2: Shell responsif 4 kelas + navigasi adaptif + semua layar (data dummy dulu).
Fase 3: Backend AI proxy (Claude+Veo) + sambungkan layar generate/render.
Fase 4: OAuth 1 platform (TikTok) end-to-end + layar Connections.
Fase 5: Publish pipeline + worker + layar Publishing pakai status asli.
Fase 6: Insights jobs + layar Insights asli. Lalu tambah platform lain satu per satu.

Mulai dari Fase 1 sekarang. Tanya kalau ada yang ambigu.
```

---

## Tips saat bekerja dengan Claude Code

- **Satu fase per waktu.** Selesaikan & jalankan Fase 1 sebelum lanjut. Ini mencegah kesalahan menumpuk.
- **Minta ia menjalankan & memperlihatkan hasil**, bukan hanya menulis kode.
- **Simpan ke Git tiap fase selesai** (`git commit`) supaya bisa mundur kalau rusak.
- **Kalau ada error, tempel pesan error-nya apa adanya** — Claude Code akan memperbaiki.
- **Isi `.env` dari daftar placeholder** yang ia berikan, memakai kunci dari [Bab 01](./01-persiapan-alat-dan-akun.md).

---

## Setelah kode jadi: langkah terakhir jadi "benar-benar hidup"

1. Isi semua secret di `.env` (backend) & dashboard Render/Neon.
2. Deploy backend ke Render + hubungkan database Neon ([Bab 09](./09-rollout-dan-deploy.md)).
3. Daftarkan Redirect URI versi online di tiap platform ([Bab 04](./04-oauth-hubungkan-akun.md)).
4. Arahkan `EXPO_PUBLIC_API_URL` frontend ke alamat Render ([Bab 13](./13-sambung-frontend-backend.md)).
5. Bangun aplikasi mobile untuk store dengan **EAS Build**: <https://docs.expo.dev/build/introduction/>
6. Tunggu **review platform** lolos → fitur posting publik aktif.

---

## 🎉 Penutup panduan

Alur lengkapmu: **prototype (acuan) → backend Node+Prisma+Neon di Render → frontend Expo lintas platform → handoff ke Claude Code → isi kunci → deploy → review platform**.

Tiga pengingat:
1. **Satu source code (Expo)** → iOS, Android, iPad (portrait+landscape), web desktop/mobile/tablet.
2. **Satu bahasa (TypeScript)** → frontend & backend, mudah dipelihara.
3. **Kerjakan bertahap** → satu fase, satu platform, satu kemenangan.

---

[← Bab 13: Sambung Backend](./13-sambung-frontend-backend.md) · [Daftar isi](./README.md)
