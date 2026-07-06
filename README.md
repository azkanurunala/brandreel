# BrandReel

Aplikasi pembuat video promosi AI → posting otomatis ke banyak sosial media → statistik gabungan.
Satu source code untuk **iOS, Android, iPad, dan Web** (desktop/mobile/tablet).

## Struktur

```
apps/
  api/      → Backend: Node + TypeScript + Express + Prisma (Neon) + BullMQ (Redis)
  mobile/   → Frontend: Expo (React Native + react-native-web) + Expo Router
render.yaml → Blueprint deploy Render (API + worker + cron + Redis)
Panduan Backend BrandReel/ → Spesifikasi lengkap (Bab 00–18)
```

## Menjalankan lokal

Prasyarat: Node.js 20+ dan npm.

```bash
# 1. Install semua dependency (sekali saja, dari root)
npm install

# 2. Isi environment
#    - apps/api/.env      (salin dari apps/api/.env.example, isi DATABASE_URL Neon)
#    - apps/mobile/.env   (salin dari apps/mobile/.env.example)

# 3. Siapkan database (setelah DATABASE_URL Neon terisi)
npm run db:migrate   # buat tabel
npm run db:seed      # isi data contoh

# 4. Jalankan backend
npm run api          # API di http://localhost:3000  (cek: /health)

# 5. Jalankan frontend (terminal terpisah)
npm run mobile       # Expo — tekan: w=web, a=Android, i=iOS
```

Perintah lain: `npm run api:worker` (worker antrean), `npm run db:studio` (lihat isi DB), `npm run mobile:web` (langsung web).

## Deploy

1. **Database:** buat project di [neon.tech](https://neon.tech), salin connection string (pooled → `DATABASE_URL`, direct → `DIRECT_URL`).
2. **Backend:** di [Render](https://render.com) pilih **New > Blueprint**, arahkan ke repo ini — `render.yaml` membuat API + worker + cron + Redis. Isi env yang bertanda `sync: false` di dashboard.
3. **Frontend web:** `npx expo export --platform web` lalu host folder `dist/` (atau pakai EAS Hosting). Isi `EXPO_PUBLIC_API_URL` ke alamat Render.
4. **iOS/Android:** build dengan [EAS Build](https://docs.expo.dev/build/introduction/).

Daftar lengkap kunci yang harus diisi: `Panduan Backend BrandReel/15-referensi-env.md`.

---

## Catatan handoff desain

Repo ini berawal dari bundle handoff Claude Design. Prototype visual (sumber kebenaran UI):

- `BrandReel - Mobile Prototype.html` + `assets/*.jsx` — prototype interaktif (buka langsung di browser).
- `BrandReel - Backend Integration Spec.html` — spec ringkas.
- `.preview/`, `screenshots/` — referensi visual.

Implementasi harus meniru tampilan, alur, enum, dan status prototype **persis** (lihat `CLAUDE.md`).
