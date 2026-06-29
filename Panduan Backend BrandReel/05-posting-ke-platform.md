# Bab 05 — Posting ke Platform

> Tujuan: benar-benar **mengirim video** ke sosial media, dengan antrean yang rapi, jeda otomatis, dan pengulangan saat gagal. Layar "Publishing" di prototype akan menyala dengan data nyata.

[← Bab 04: OAuth](./04-oauth-hubungkan-akun.md) · [Daftar isi](./README.md) · [Bab 06: Statistik →](./06-insights-statistik.md)

---

## Bagian 1 — Konsep "Adapter"

Tiap platform punya cara posting yang berbeda-beda. Daripada menulis kode kacau bercabang-cabang, kita buat **adapter**: satu potong kode khusus per platform, tapi **semua punya 3 perintah yang sama bentuknya**:

```
validate(video, caption)   → cek dulu: rasio benar? durasi pas? caption tidak kepanjangan?
publish(akun, video, caption) → posting beneran → balikan { remoteId, permalink, state }
fetchInsights(akun, remoteId) → ambil statistik (views, likes, dst) — dipakai di Bab 06
```

> 🔌 **Analogi:** adapter itu seperti **colokan listrik universal**. Bentuk colokan tiap negara beda (tiap platform beda), tapi kamu pakai satu adapter dengan "lubang" yang seragam.

**Manfaatnya:** pipeline posting (Bagian 3) tidak perlu tahu detail tiap platform. Ia cukup memanggil `validate()` lalu `publish()`. Mau tambah platform baru? Cukup buat adapter baru dengan 3 perintah yang sama.

---

## Bagian 2 — Cara posting & batasan tiap platform

| Platform | Rasio · Durasi | Cara posting (ringkas) | Batas caption |
|---|---|---|---|
| **TikTok** | 9:16 · ≤60 dtk | Init → unggah bertahap (chunk) → cek status | ≤150 huruf, 5 tagar |
| **Instagram** | 9:16 · ≤90 dtk | Buat "container" → lalu publish (2 langkah) | ≤2200 |
| **YouTube** | 9:16 · ≤60 dtk | `videos.insert` (unggah resumable) + `#Shorts` | judul ≤100 |
| **LinkedIn** | 1:1 · ≤90 dtk | Daftar aset → unggah → buat Post | ≤700, 3 tagar |
| **X** | 16:9 · ≤140 dtk | Unggah media bertahap → buat tweet | ≤280, 2 tagar |
| **Facebook** | 1:1 · ≤90 dtk | `POST /{page-id}/videos` pakai Page token | ≤2200, 4 tagar |

### Penjelasan istilah cara posting

- **Init / chunk upload** — video besar diunggah **sepotong-sepotong** supaya tidak gagal di tengah jalan. "Init" = mulai, lalu kirim potongan, lalu "selesai".
- **Container (Instagram)** — Instagram minta 2 langkah: (1) buat "wadah" berisi info video, (2) baru perintahkan "terbitkan wadah itu".
- **Resumable upload (YouTube)** — kalau koneksi putus, unggahan bisa **dilanjutkan** dari titik terakhir, tidak mulai dari nol.

### Link "cara posting video" tiap platform

| Platform | Dokumentasi posting |
|---|---|
| TikTok | <https://developers.tiktok.com/doc/content-posting-api-reference-upload-video/> |
| Instagram Reels | <https://developers.facebook.com/docs/instagram-platform/content-publishing#reels-posts> |
| YouTube | <https://developers.google.com/youtube/v3/docs/videos/insert> |
| LinkedIn | <https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/videos-api> |
| X | <https://developer.x.com/en/docs/x-api/tweets/manage-tweets/introduction> |
| Facebook | <https://developers.facebook.com/docs/pages-api/posts> |

---

## Bagian 3 — Alur antrean posting (publish pipeline)

Layar "Publishing" menampilkan status `queued → posted → retry → failed`. Inilah tahap nyatanya:

```
   [ POST /campaigns/:id/publish ]
              │
              ▼
   ┌──────────────────────┐
   │ 1. PRE-FLIGHT (cek)   │  validate(): rasio? durasi? token valid? belum dobel?
   └──────────┬───────────┘
              ▼
   ┌──────────────────────┐
   │ 2. STAGGER (beri jeda)│  spasikan posting, mis. TikTok 1 / 30 menit
   └──────────┬───────────┘
              ▼
   ┌──────────────────────┐
   │ 3. PUBLISH (posting)  │  adapter posting → simpan remoteId + permalink
   └──────────┬───────────┘
       ┌──────┴──────┐
       ▼             ▼
   [ posted ]   [ gagal? ]
                     ▼
   ┌──────────────────────┐
   │ 4. RETRY (ulang)      │  error 429 → tunggu makin lama → ulang
   └──────────┬───────────┘
              ▼
   ┌──────────────────────┐
   │ 5. AUTO-FIX           │  format salah → potong/ubah ulang → antre lagi
   └──────────────────────┘
```

### Penjelasan tiap tahap

1. **Pre-flight** — jalankan `validate()` tiap adapter. Inilah "pre-flight checklist" di prototype: cek rasio/durasi/codec, token masih berlaku, belum kena rate limit, tidak dobel posting.
2. **Stagger (beri jeda)** — **jangan** posting semua sekaligus. Beri jarak waktu (misal TikTok 1 posting / 30 menit) supaya tidak dianggap spam dan kena blokir. Ini teks **"staggered to avoid rate limit"** di prototype.
3. **Publish** — adapter posting, lalu simpan `remoteId` (ID video di platform) dan `permalink` (link publiknya).
4. **Retry** — kalau kena error `429` (terlalu sering) atau gangguan sesaat, **tunggu lalu ulang** dengan jeda makin lama (1 dtk → 2 → 4...). Ini baris log **"X · 429 rate-limited, retry in 60s"**.
5. **Auto-fix** — kalau ditolak karena format (misal **"IG aspect 9:16 expected, got 9:15"**), potong/ubah ulang video lalu masukkan antrean lagi — jangan langsung dianggap gagal total.

### Status WAJIB pakai kata yang sama

Gunakan status persis: `queued` · `posted` · `retry` · `failed`. Frontend (`br-screens-campaign.jsx`) sudah dibuat untuk membaca kata-kata ini. **Pakai sama → tampilan langsung menyala tanpa ubah apa pun.**

---

## Bagian 4 — Worker & antrean di latar belakang

Posting butuh waktu (unggah video besar, tunggu platform proses). Kalau dikerjakan langsung saat pengguna menekan tombol, aplikasi terasa "menggantung". Solusinya: **worker** mengerjakannya di **latar belakang**, dan frontend cukup mengecek status berkala.

**Alat populer untuk antrean (queue):**
- **BullMQ** — <https://docs.bullmq.io/> (berjalan di atas **Redis**: <https://redis.io/docs/>)

**Cara frontend tahu progres:**
- **Polling** — frontend bertanya berkala "sudah selesai belum?" ke `GET /campaigns/:id/status`.
- **SSE (Server-Sent Events)** — server mendorong update otomatis ke frontend. Lebih mulus, tapi lebih rumit. Untuk awal, polling sudah cukup.

---

## Bagian 5 — Webhook (telepon balik dari platform)

Sebagian platform memproses video secara **asinkron** — artinya saat kamu kirim, mereka jawab "sedang diproses", lalu **menelepon balik** server kamu saat selesai. "Telepon balik" ini masuk ke endpoint khusus:

```
POST /webhooks/:platform
```

Server menerima kabar ini, lalu memperbarui status `Post` (misal dari `queued` jadi `posted`). Pastikan endpoint webhook ini **memverifikasi** bahwa kabar benar-benar dari platform (tiap platform punya cara verifikasi tanda tangan).

---

## Checklist Bab 05

- [ ] Paham konsep adapter (3 perintah seragam)
- [ ] Tahu cara posting & batasan tiap platform
- [ ] Pipeline 5 tahap dipahami (pre-flight → stagger → publish → retry → auto-fix)
- [ ] Status `queued/posted/retry/failed` dipakai persis
- [ ] Worker + antrean direncanakan (BullMQ/Redis)
- [ ] Endpoint webhook `/webhooks/:platform` disiapkan & diverifikasi

---

[← Bab 04: OAuth](./04-oauth-hubungkan-akun.md) · [Daftar isi](./README.md) · [Bab 06: Statistik →](./06-insights-statistik.md)
