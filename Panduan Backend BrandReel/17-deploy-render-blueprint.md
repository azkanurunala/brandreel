# Bab 17 — Deploy Sekali-Klik (Render Blueprint)

> Tujuan: menyediakan berkas siap-pakai agar bagian deploy **tinggal eksekusi** — blueprint Render, `package.json`, dan `tsconfig.json` backend.

[← Bab 16: Skema Database](./16-skema-database.md) · [Daftar isi](./README.md)

---

## Berkas yang disediakan

| File | Taruh di | Fungsi |
|---|---|---|
| [`berkas-siap-pakai/render.yaml`](./berkas-siap-pakai/render.yaml) | **root repositori** (nama: `render.yaml`) | blueprint 4 service Render |
| [`berkas-siap-pakai/backend.package.json`](./berkas-siap-pakai/backend.package.json) | `apps/api/package.json` | dependency & script backend |
| [`berkas-siap-pakai/backend.tsconfig.json`](./berkas-siap-pakai/backend.tsconfig.json) | `apps/api/tsconfig.json` | pengaturan TypeScript |

> Ganti nama saat menyalin (mis. `backend.package.json` → `package.json`).

---

## Apa yang dibuat blueprint ini?

`render.yaml` mendefinisikan **4 komponen** sekaligus (sesuai kebutuhan pipeline BrandReel — Bab 05 & 06):

1. **brandreel-api** (Web Service) — server API Express.
2. **brandreel-worker** (Background Worker) — menjalankan antrean BullMQ (posting).
3. **brandreel-insights** (Cron Job) — mengambil statistik berkala (tiap 15 menit).
4. **brandreel-redis** (Key Value) — Redis untuk antrean.

> **Database TIDAK** ada di blueprint — pakai **Neon** (dibuat terpisah di neon.tech), lalu isi `DATABASE_URL` & `DIRECT_URL` di dashboard.

---

## Cara deploy (langkah demi langkah)

### 1. Siapkan database Neon
- Buat project di <https://neon.tech> → salin dua connection string (pooled & direct). → [Bab 15](./15-referensi-env.md)

### 2. Push kode + `render.yaml` ke GitHub
```bash
git add .
git commit -m "Tambah render.yaml"
git push
```

### 3. Buat Blueprint di Render
- Buka <https://dashboard.render.com> → **New → Blueprint**.
- Pilih repositori-mu. Render membaca `render.yaml` & menampilkan 4 service.
- Klik **Apply**.

### 4. Isi environment variables
- Untuk tiap `sync: false` (rahasia), Render meminta kamu mengisinya. Ambil nilainya dari [Bab 15](./15-referensi-env.md).
- `SESSION_SIGNING_KEY` & `TOKEN_ENCRYPTION_KEY` **dibuat otomatis** (`generateValue: true`) — tidak perlu diisi.
- `REDIS_URL` **tersambung otomatis** dari service Redis — tidak perlu diisi.

### 5. Deploy berjalan
- Render menjalankan `buildCommand` (termasuk `prisma migrate deploy` → tabel otomatis terbentuk di Neon) lalu `startCommand`.
- Setelah hijau, API punya alamat publik, mis. `https://brandreel-api.onrender.com`.

### 6. Langkah akhir
- Daftarkan **Redirect URI** versi online di tiap portal platform ([Bab 04](./04-oauth-hubungkan-akun.md)).
- Arahkan `EXPO_PUBLIC_API_URL` frontend ke alamat API ([Bab 13](./13-sambung-frontend-backend.md)).
- Isi `APP_BASE_URL` = alamat API, `WEB_APP_URL` = alamat frontend web.

→ Referensi blueprint: <https://render.com/docs/blueprint-spec> · Deploy dari Git: <https://render.com/docs/deploys>

---

## Script backend yang tersedia (`package.json`)

| Perintah | Fungsi |
|---|---|
| `npm run dev` | server lokal + auto-reload |
| `npm run dev:worker` | worker antrean lokal |
| `npm run build` | kompilasi TypeScript → `dist/` |
| `npm run start` | jalankan server (produksi) |
| `npm run start:worker` | jalankan worker (produksi) |
| `npm run job:insights` | job statistik (dipakai cron) |
| `npm run db:migrate` | buat/ubah tabel (dev) |
| `npm run db:deploy` | migrasi produksi |
| `npm run db:seed` | isi data contoh |
| `npm run db:studio` | lihat data di browser |

> Dependency utama sudah termasuk: Express, Prisma, BullMQ, ioredis, Anthropic SDK, Google Generative AI, AWS S3 client, zod (validasi), cors. Versi bisa disesuaikan Claude Code saat install.

---

## Catatan tentang free tier Render

- Service **free** bisa "tidur" saat idle & bangun saat ada request (ada jeda beberapa detik). Cukup untuk pengembangan/uji.
- Untuk produksi nyata (posting terjadwal harus selalu jalan), pertimbangkan naik ke paid pada **worker** & **cron** agar tidak terlewat.

---

## Checklist Bab 17

- [ ] Database Neon dibuat, dua connection string disalin
- [ ] `render.yaml` di root repo + di-push ke GitHub
- [ ] Blueprint di-Apply di Render (4 service muncul)
- [ ] Semua env `sync: false` diisi (Bab 15)
- [ ] `package.json` & `tsconfig.json` backend terpasang
- [ ] Deploy hijau → API punya alamat publik
- [ ] Redirect URI online didaftarkan + frontend diarahkan

---

[← Bab 16: Skema Database](./16-skema-database.md) · [Daftar isi](./README.md)
