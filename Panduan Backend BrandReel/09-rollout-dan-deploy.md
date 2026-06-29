# Bab 09 — Rollout & Deploy

> Tujuan: dua hal terakhir — **(1) urutan pengerjaan** supaya tidak kewalahan, dan **(2)** cara **menaruh backend online** (deploy) agar bisa diakses dari mana saja.

[← Bab 08: Keamanan](./08-keamanan.md) · [Daftar isi](./README.md)

---

## Bagian 1 — Rencana pengerjaan bertahap

**Jangan bangun semua sekaligus.** Ikuti fase ini berurutan. Tiap fase menghasilkan sesuatu yang bekerja, jadi kamu selalu punya kemajuan nyata.

### Fase 0 — Fondasi
- Bikin backend + sistem login pengguna (session).
- Pindahkan kunci **Claude & Veo** ke server.
- **Hasil:** tampilan tidak berubah, tapi kunci AI sudah aman.
- 📖 Bab: [02](./02-backend-pertama.md) & [03](./03-kunci-ai-claude-veo.md)

### Fase 1 — Satu platform penuh (TikTok)
- Selesaikan OAuth + daftar koneksi untuk **TikTok** dari ujung ke ujung.
- **Ajukan review TikTok + Instagram bersamaan** (paralel, karena lama).
- **Hasil:** pengguna bisa benar-benar menghubungkan akun TikTok.
- 📖 Bab: [04](./04-oauth-hubungkan-akun.md)

### Fase 2 — Posting nyata
- Bangun pipeline posting + penjadwal untuk platform yang sudah disetujui.
- Sambungkan layar Publishing ke `/status` asli.
- **Hasil:** video benar-benar terkirim & statusnya terlihat nyata.
- 📖 Bab: [05](./05-posting-ke-platform.md)

### Fase 3 — Platform lain + statistik
- Tambah platform lain begitu review-nya lolos (Instagram, YouTube, dst).
- Aktifkan pengambilan statistik → layar Insights jadi nyata.
- **Hasil:** produk lengkap.
- 📖 Bab: [06](./06-insights-statistik.md)

> **Intinya:** frontend sudah berbentuk produk jadi — enum, layar, dan manifest Veo-nya adalah "kontrak integrasi". Pekerjaannya adalah membangun backend yang bicara bahasa yang sama. Bangun API-nya, biarkan frontend apa adanya, ganti simulasi jadi endpoint **satu fase demi satu fase.**

---

## Bagian 2 — Apa itu "Deploy"?

Selama ini backend berjalan di `http://localhost:3000` — hanya bisa diakses dari komputermu. **Deploy** = memindahkannya ke server online supaya punya alamat publik (misal `https://api.brandreel.com`) yang bisa diakses siapa saja.

> 🚀 **Analogi:** dari masak di dapur rumah → buka restoran beneran yang punya alamat dan bisa didatangi pelanggan.

---

## Bagian 3 — Tempat deploy ramah pemula

| Layanan | Cocok untuk | Dokumentasi |
|---|---|---|
| **Render** | Pemula; gratis untuk mulai, mudah | <https://render.com/docs> |
| **Railway** | Pemula; setup cepat | <https://docs.railway.app/> |
| **Vercel** | Bagus untuk frontend & fungsi kecil | <https://vercel.com/docs> |
| **Fly.io** | Lebih fleksibel, sedikit teknis | <https://fly.io/docs/> |

> Untuk backend Node.js + database, **Render** atau **Railway** paling ramah pemula.

---

## Bagian 4 — Langkah umum deploy (pola di hampir semua layanan)

1. **Simpan kode ke GitHub.**
   ```bash
   git add .
   git commit -m "Siap deploy"
   git push
   ```
   (Buat repositori di <https://github.com/> lalu ikuti instruksi "push existing repository".)

2. **Hubungkan layanan deploy ke GitHub.** Di Render/Railway, klik "New → Web Service", pilih repositori-mu.

3. **Atur perintah:**
   - Build command: `npm install`
   - Start command: `node index.js`

4. **Masukkan environment variables.** Di dashboard layanan, ada bagian "Environment". Salin SEMUA isi `.env`-mu ke sana (jangan upload file `.env`; isi manual di dashboard). Ini cara aman menaruh secret online.

5. **Deploy.** Layanan akan memasang & menjalankan backend, lalu memberi alamat publik (misal `https://brandreel-backend.onrender.com`).

6. **Perbarui Redirect URI.** Di portal tiap platform (Bab 04), tambahkan alamat callback versi online:
   ```
   https://brandreel-backend.onrender.com/auth/tiktok/callback
   ```

7. **Arahkan frontend** ke alamat backend online itu.

---

## Bagian 5 — Setelah online: yang perlu dipantau

| Hal | Alat / cara |
|---|---|
| **Error & crash** | Sentry (<https://docs.sentry.io/>) atau log bawaan layanan deploy |
| **Database backup** | Aktifkan backup otomatis (Supabase/Render punya fitur ini) |
| **Token kedaluwarsa** | Pastikan penjadwal refresh (Bab 04) berjalan |
| **Rate limit** | Pantau error 429; sesuaikan jeda (Bab 05) |
| **Biaya** | Pantau pemakaian AI (Claude/Veo) & server |

---

## Checklist Bab 09

- [ ] Paham 4 fase rollout & urutannya
- [ ] Memilih layanan deploy (Render/Railway)
- [ ] Kode tersimpan di GitHub (tanpa `.env`!)
- [ ] Environment variables dimasukkan di dashboard, bukan di kode
- [ ] Redirect URI versi online didaftarkan di tiap platform
- [ ] Pemantauan error & backup diaktifkan

---

## 🎉 Penutup

Kalau kamu sampai di sini dan sudah menjalankan Fase 0–3, kamu sudah mengubah prototype "pura-pura" menjadi produk yang benar-benar bekerja: membuat video AI, posting ke banyak platform, dan menampilkan statistik nyata — semua dengan backend yang aman.

Ingat tiga hal kunci:
1. **Frontend sudah jadi** — jangan diubah, cukup disambungkan.
2. **Secret selalu di server** — tidak pernah di browser.
3. **Kerjakan bertahap** — satu platform, satu fase, satu kemenangan kecil dalam satu waktu.

---

[← Bab 08: Keamanan](./08-keamanan.md) · [Daftar isi](./README.md)
