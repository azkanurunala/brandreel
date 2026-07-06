# Bab 07 — API & Database

> Tujuan: dua referensi penting — **(1)** daftar lengkap "alamat" API yang harus dibuat backend, dan **(2)** data apa saja yang perlu disimpan di database. Bab ini lebih ke peta/rujukan daripada langkah berurutan.

[← Bab 06: Statistik](./06-insights-statistik.md) · [Daftar isi](./README.md) · [Bab 08: Keamanan →](./08-keamanan.md)

---

## Bagian 1 — Daftar endpoint API

Ini "menu" lengkap alamat yang dipanggil frontend untuk menggantikan data palsu. Semua memakai **JSON lewat HTTPS** dan **session login pengguna** (first-party).

| Verb | Alamat (path) | Gunanya | Ganti bagian prototype |
|---|---|---|---|
| POST | `/auth/:platform/start` | Mulai OAuth, balas link halaman izin | br-oauth.jsx |
| GET | `/auth/:platform/callback` | Tukar kode→token, simpan koneksi (server) | — |
| GET | `/connections` | Daftar akun tersambung + kesehatan token | Profile |
| DELETE | `/connections/:id` | Putuskan akun + hapus token | — |
| POST | `/campaigns` | Buat campaign (nama, logo, voice, platform) | BrCreate |
| POST | `/campaigns/:id/generate` | Bikin hook & caption pakai Claude | br-ai.jsx |
| POST | `/campaigns/:id/renders` | Antre render video Veo per hook × rasio | br-video.jsx |
| GET | `/renders/:id` | Status video + link video aman | — |
| POST | `/campaigns/:id/publish` | Jadwalkan & posting ke platform terpilih | BrPublishing |
| GET | `/campaigns/:id/status` | Status posting per platform (polling/SSE) | — |
| GET | `/insights?range=` | Statistik gabungan | BrInsights |
| POST | `/webhooks/:platform` | Terima "telepon balik" dari platform | — |

> `:platform` dan `:id` adalah **isian** yang diganti nilai nyata. Contoh: `/auth/tiktok/start`, `/connections/123`, `/campaigns/abc/publish`.

### Mengingat arti verb (dari Bab 00)

- **GET** = ambil data (tidak mengubah apa pun)
- **POST** = buat / kirim sesuatu yang baru
- **DELETE** = hapus

---

## Bagian 2 — Contoh request & response

### Menyuruh posting: `POST /campaigns/:id/publish`

**Yang dikirim frontend (request body):**
```json
{
  "variations": [
    { "hook": "h3", "platform": "tiktok", "renderId": "rnd_8x..", "caption": "…" }
  ],
  "schedule": { "mode": "stagger", "perPlatformGapMin": 30 }
}
```

**Yang dijawab server (response):**
```json
{
  "jobId": "job_123",
  "perPlatform": [
    { "platform": "tiktok", "state": "queued", "eta": "2026-06-29T10:30:00Z" }
  ]
}
```

**Penjelasan:**
- `variations` → daftar video yang mau diposting (hook mana, platform mana, video mana, caption apa).
- `schedule.mode: "stagger"` → minta diberi jeda antar posting.
- `perPlatformGapMin: 30` → jeda 30 menit per platform.
- Server menjawab `202` (= "diterima, sedang diproses") berisi `jobId` untuk dilacak, dan status awal tiap platform (`queued`).

### Mengecek status: `GET /campaigns/:id/status`

Frontend memanggil ini berkala untuk tahu progres (`queued` → `posted`, dst). Lihat polling/SSE di [Bab 05](./05-posting-ke-platform.md).

---

## Bagian 3 — Model data (apa yang disimpan di database)

Database menyimpan data secara permanen & rapi. Berikut "tabel-tabel" utamanya:

### Account (akun pengguna BrandReel)
| Field | Arti |
|---|---|
| `id` | nomor unik pengguna |
| `persona` / `role` | peran (mengatur izin fitur — RBAC) |
| `plan` | paket langganan |
| `postQuota` | jatah posting (membatasi fitur seperti `BR_PERSONAS.can`) |

### Connection (akun sosial media yang tersambung)
| Field | Arti |
|---|---|
| `accountId` | milik pengguna mana |
| `platform` | tiktok / instagram / dll |
| `remoteUserId` | ID pengguna di platform itu |
| `tokenRef` | **petunjuk** ke token di brankas (bukan token mentah!) |
| `scopes` | izin yang diberikan |
| `status` | aktif / `expiring` / `expired` |
| `expiresAt` | kapan token kedaluwarsa |

> ⚠️ Perhatikan: kolom token bukan token mentah, tapi `tokenRef` — **referensi** ke brankas terenkripsi. Detail di [Bab 08](./08-keamanan.md).

### BrandKit (identitas merek)
| Field | Arti |
|---|---|
| `accountId` | milik siapa |
| `voice`, `logo`, `colors` | gaya bahasa, logo, warna — jadi bahan prompt Claude |

### Campaign (kampanye)
| Field | Arti |
|---|---|
| `id`, `product`, `desc` | identitas kampanye |
| `platforms[]` | daftar platform tujuan |
| `status` | tahap kampanye |
| `topHook` | hook terbaik |

### Render (video hasil Veo)
| Field | Arti |
|---|---|
| `campaignId` | milik kampanye mana |
| `hook`, `ratio` | hook & rasio video |
| `provider` | `veo` atau `canvas` (cadangan instan) |
| `storageUrl` | link file di gudang |
| `durationS`, `state` | durasi & status |

### Post (postingan ke platform)
| Field | Arti |
|---|---|
| `campaignId`, `hook`, `platform` | konteks |
| `renderId` | video mana |
| `caption` | teks caption |
| `remoteId`, `permalink` | ID & link di platform |
| `state` | `queued`/`posted`/`retry`/`failed` |
| `scheduledAt` | jadwal posting |

### InsightSnapshot (foto statistik)
| Field | Arti |
|---|---|
| `postId` | postingan mana |
| `capturedAt` | kapan diambil |
| `views`, `likes`, `comments`, `shares`, `reach` | metriknya |

---

## Bagian 4 — Alat database ramah pemula

- **Neon** — **PostgreSQL cloud** yang cepat & punya free tier bagus (pilihan stack final). <https://neon.tech/docs>
- **Prisma** — membuat pengelolaan database jauh lebih mudah (kamu menulis model, ia urus detailnya). <https://www.prisma.io/docs>
- **PostgreSQL** — mesin database di baliknya. <https://www.postgresql.org/docs/>

> 💡 **Stack final (keputusan A): Neon + Prisma.** Skema database lengkap siap-eksekusi ada di [Bab 16](./16-skema-database.md) — tinggal `prisma migrate`.

---

## Checklist Bab 07

- [ ] Semua endpoint di tabel direncanakan
- [ ] Paham bentuk request/response `publish` & `status`
- [ ] Model data dibuat (Account, Connection, BrandKit, Campaign, Render, Post, InsightSnapshot)
- [ ] Token disimpan sebagai `tokenRef`, bukan mentah
- [ ] Alat database: **Neon + Prisma** (skema siap di Bab 16)

---

[← Bab 06: Statistik](./06-insights-statistik.md) · [Daftar isi](./README.md) · [Bab 08: Keamanan →](./08-keamanan.md)
