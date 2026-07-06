# Bab 16 — Skema Database (Siap Eksekusi)

> Tujuan: skema database **lengkap & siap jalan** memakai Prisma + Neon. Tinggal salin, isi `.env`, jalankan beberapa perintah — tabel langsung terbentuk.

[← Bab 15: Referensi .env](./15-referensi-env.md) · [Daftar isi](./README.md)

---

## File skema

📄 [`skema-database/schema.prisma`](./skema-database/schema.prisma) — seluruh model, enum, relasi, & indeks.
📄 [`skema-database/seed.ts`](./skema-database/seed.ts) — data contoh awal (1 akun + brand kit + campaign + hook + render + koneksi + post + snapshot).

Skema ini mewujudkan model data di [Bab 07](./07-api-endpoint-dan-database.md), ditambah tabel pendukung (Session, Hook, JobRun).

---

## Apa itu Prisma & "migrasi"?

- **Prisma** = alat yang mengubah "cetak biru" (`schema.prisma`) menjadi tabel database sungguhan, dan memberi kamu cara aman menulis/membaca data dari TypeScript.
- **Migrasi (migrate)** = proses membuat/mengubah tabel di database agar cocok dengan skema. Prisma mencatat riwayatnya, jadi bisa diulang di server mana pun.

> 🏗️ **Analogi:** `schema.prisma` = gambar arsitek. `migrate` = tukang yang membangun sesuai gambar.

---

## Langkah eksekusi (di folder backend)

```bash
# 1. Pasang Prisma
npm install prisma --save-dev
npm install @prisma/client

# 2. Buat folder prisma & salin skema ke dalamnya
#    (letakkan file jadi:  prisma/schema.prisma)

# 3. Pastikan .env berisi DATABASE_URL & DIRECT_URL dari Neon (Bab 15)

# 4. Buat tabel di database (development)
npx prisma migrate dev --name init

# 5. Buat client TypeScript agar bisa dipakai di kode
npx prisma generate
```

**Saat deploy ke Render (produksi):** gunakan
```bash
npx prisma migrate deploy
```
(biasanya dijalankan otomatis saat build — Claude Code akan mengaturnya).

### Mengisi data contoh (seed)

Setelah tabel jadi, isi data demo agar bisa langsung dites:

```bash
npm install -D tsx                 # runner TypeScript
# tambahkan ke package.json:  "prisma": { "seed": "tsx prisma/seed.ts" }
npx prisma db seed
```

File [`skema-database/seed.ts`](./skema-database/seed.ts) membuat 1 akun demo + brand kit + campaign + 3 hook + render + koneksi TikTok + 1 post + snapshot statistik. Aman diulang (pakai `upsert` di akun). → <https://www.prisma.io/docs/orm/prisma-migrate/workflows/seeding>

→ Dokumentasi: <https://www.prisma.io/docs/orm/prisma-migrate> · Prisma + Neon: <https://neon.tech/docs/guides/prisma>

---

## Melihat isi database (tanpa perlu tahu SQL)

```bash
npx prisma studio
```
Membuka tampilan tabel di browser — kamu bisa lihat & edit data seperti spreadsheet. Sangat membantu pemula.
→ <https://www.prisma.io/docs/orm/tools/prisma-studio>

---

## Isi skema secara ringkas

| Model (tabel) | Fungsi | Bab terkait |
|---|---|---|
| **Account** | pengguna BrandReel (role, plan, kuota) | 07 |
| **Session** | sesi login first-party | 04 |
| **Connection** | akun sosmed tersambung + `tokenRef` & status token | 04 |
| **BrandKit** | voice/logo/warna → bahan prompt AI | 03 |
| **Campaign** | kampanye + platform tujuan + status | 07 |
| **Hook** | naskah hook/angle hasil Claude | 03 |
| **Render** | video hasil Veo/canvas + link file | 03 |
| **Post** | postingan ke platform + state + retry | 05 |
| **InsightSnapshot** | foto statistik berkala | 06 |
| **JobRun** | riwayat job (publish/insights/refresh) | 05–06 |

### Enum yang disamakan dengan prototype
- `ConnectionStatus`: `active · expiring · expired · revoked`
- `PostState`: `queued · posted · retry · failed`
- `RenderState`: `queued · processing · ready · failed`
- `CampaignStatus`: `draft · generating · rendering · ready · publishing · completed · archived`

> Enum ini sengaja memakai kata yang **sama** dengan status di layar prototype, supaya frontend langsung cocok tanpa penyesuaian.

---

## Catatan desain penting

- **Token tidak disimpan mentah.** Kolom `tokenRef` hanya menyimpan *petunjuk* ke brankas terenkripsi (KMS) — lihat [Bab 08](./08-keamanan.md).
- **`onDelete: Cascade`** — saat pengguna dihapus, data turunannya (koneksi, kampanye, dst) ikut terhapus rapi.
- **Indeks (`@@index`)** — dipasang di kolom yang sering dicari (mis. `state`, `accountId`) agar query cepat.
- **`@@map`** — nama tabel di database dibuat rapi (mis. `insight_snapshots`), sementara kode tetap memakai nama model.

---

## Checklist Bab 16

- [ ] Prisma terpasang
- [ ] `schema.prisma` disalin ke `prisma/schema.prisma`
- [ ] `DATABASE_URL` & `DIRECT_URL` (Neon) terisi di `.env`
- [ ] `npx prisma migrate dev --name init` sukses → tabel muncul
- [ ] `npx prisma generate` sukses
- [ ] `npx prisma studio` bisa membuka & melihat tabel
- [ ] (Produksi) `migrate deploy` diatur saat deploy Render

---

[← Bab 15: Referensi .env](./15-referensi-env.md) · [Daftar isi](./README.md)
