# Bab 06 — Statistik (Insights)

> Tujuan: mengganti angka palsu di layar "Insights" dengan **data asli** dari tiap platform — views, likes, komentar, share, jangkauan.

[← Bab 05: Posting](./05-posting-ke-platform.md) · [Daftar isi](./README.md) · [Bab 07: API & Database →](./07-api-endpoint-dan-database.md)

---

## Bagian 1 — Konsep dasar

Statistik tidak diambil sekali lalu selesai. Ia **diambil berulang** seiring waktu supaya kita bisa melihat perkembangan ("momentum"). Caranya: sebuah **job terjadwal** (tugas yang jalan otomatis pada waktu tertentu) mengambil metrik tiap postingan, menyimpannya sebagai "snapshot", lalu menjumlahkannya.

```
Setiap beberapa menit/jam:
  untuk tiap Post yang sudah live:
    ambil metrik dari platform  ──►  simpan 1 InsightSnapshot (dengan cap waktu)
                                       │
                                       ▼
                          jumlahkan jadi: total · per-platform · per-hook · top performer
                                       │
                                       ▼
                          frontend baca lewat  GET /insights?range=7d
```

---

## Bagian 2 — Apa itu "snapshot"?

Setiap kali mengambil data, kita **tidak menimpa** data lama. Kita simpan **foto baru** beserta waktunya. Dengan begitu kita bisa tahu "kemarin 1.000 views, hari ini 5.000 views" → ada pertumbuhan.

Satu `InsightSnapshot` berisi:
- `postId` — postingan mana
- `capturedAt` — kapan diambil
- `views`, `likes`, `comments`, `shares`, `reach`

---

## Bagian 3 — Seberapa sering mengambil? (cadence)

Tidak perlu ambil tiap detik (boros & kena rate limit). Pola yang baik:

| Waktu setelah posting | Frekuensi ambil | Kenapa |
|---|---|---|
| **0–2 jam pertama** | tiap 5–15 menit | momen paling menentukan; ini teks **"monitoring first 2 hours"** |
| **2–24 jam** | tiap jam | pertumbuhan melambat |
| **Setelah 1 hari** | tiap hari | cukup untuk tren jangka panjang |

---

## Bagian 4 — Dari mana ambil datanya? (dokumentasi per platform)

| Platform | Dokumentasi statistik |
|---|---|
| **TikTok** | <https://developers.tiktok.com/doc/research-api-specs-query-videos/> |
| **Instagram** | <https://developers.facebook.com/docs/instagram-platform/insights> |
| **YouTube** | <https://developers.google.com/youtube/analytics> |
| **LinkedIn** | <https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/network-update-social-actions> |
| **X** | <https://developer.x.com/en/docs/x-api/metrics> |

> Tiap adapter (dari [Bab 05](./05-posting-ke-platform.md)) sudah punya perintah `fetchInsights()`. Job terjadwal cukup memanggilnya untuk tiap platform.

---

## Bagian 5 — Mengolah jadi tampilan Insights

Frontend mengharapkan data dalam bentuk tertentu. Server menjumlahkan snapshot menjadi:

1. **Total keseluruhan** — jumlah semua views/likes/dst.
2. **Per platform** — berapa dari TikTok, berapa dari Instagram, dst.
3. **Per jenis hook (angle)** — hook mana yang paling laku.
4. **Top performer** — postingan/hook terbaik.

### Kartu rekomendasi

Prototype menampilkan saran seperti **"Hook 2 underperforms on LinkedIn"**. Ini dihitung dari **selisih performa** per kombinasi hook × platform. Misal: kalau Hook 2 di LinkedIn jauh di bawah rata-rata, munculkan saran itu.

---

## Bagian 6 — Cara menjadwalkan job

**Pilihan sederhana → canggih:**

1. **Cron sederhana** — komponen `node-cron` menjalankan fungsi pada jadwal tertentu.
   → <https://www.npmjs.com/package/node-cron>
2. **Antrean terjadwal** — BullMQ punya "repeatable jobs".
   → <https://docs.bullmq.io/guide/jobs/repeatable>
3. **Penjadwal cloud** — misal cron job bawaan platform deploy (lihat [Bab 09](./09-rollout-dan-deploy.md)).

> Untuk awal, `node-cron` paling mudah dipahami. Naik ke BullMQ saat postingan sudah banyak.

---

## Bagian 7 — Hati-hati rate limit & aturan data

- **Rate limit:** mengambil statistik terlalu sering bisa kena blokir. Patuhi cadence di Bagian 3.
- **Aturan penyimpanan data:** tiap platform punya kebijakan berapa lama kamu boleh menyimpan metrik. Patuhi (lihat [Bab 08](./08-keamanan.md)).

---

## Checklist Bab 06

- [ ] Paham konsep snapshot (simpan foto + waktu, bukan menimpa)
- [ ] Cadence diterapkan (rapat di 2 jam pertama, lalu melonggar)
- [ ] `fetchInsights()` tiap platform dipakai
- [ ] Data diolah jadi total / per-platform / per-hook / top performer
- [ ] Job terjadwal jalan (node-cron / BullMQ)
- [ ] Rate limit & aturan penyimpanan dipatuhi

---

[← Bab 05: Posting](./05-posting-ke-platform.md) · [Daftar isi](./README.md) · [Bab 07: API & Database →](./07-api-endpoint-dan-database.md)
