# Bab 03 — Kunci AI: Claude & Veo

> Tujuan: memindahkan dua fitur AI yang **sudah berfungsi** (naskah Claude & video Veo) supaya kuncinya disimpan di **server**, bukan di browser. Ini langkah nyata pertama — dan paling mudah, karena logikanya sudah ada, kita cuma memindahkan kunci.

[← Bab 02: Backend Pertama](./02-backend-pertama.md) · [Daftar isi](./README.md) · [Bab 04: OAuth →](./04-oauth-hubungkan-akun.md)

---

## Kenapa harus dipindah ke server?

Saat ini (di prototype), kunci AI ada di kode browser. Masalahnya: **siapa pun yang membuka aplikasimu bisa mengintip kode browser dan mencuri kuncinya.** Kalau dicuri, orang lain bisa memakai kuota AI-mu (dan kamu yang bayar).

Solusinya: kunci disimpan di server. Browser cuma bilang "tolong buatkan naskah", server yang menyimpan kunci & bicara ke AI. Kunci tidak pernah terlihat browser.

```
SEBELUM (bahaya):   [Browser + KUNCI] ──► [Claude]
SESUDAH (aman):     [Browser] ──► [Server + KUNCI] ──► [Claude]
```

---

## Langkah 1 — Simpan rahasia di file `.env`

### 1.1 Pasang `dotenv`

`dotenv` adalah komponen yang membuat server bisa membaca file rahasia `.env`.

```bash
npm install dotenv
```

→ Dokumentasi: <https://github.com/motdotla/dotenv#readme>

### 1.2 Buat file `.env`

Di VS Code, buat file baru bernama `.env` (ada titik di depan), isi:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxx
VEO_API_KEY=xxxxxxxxxxxxxxxxx
GOOGLE_PROJECT=nama-project-google-kamu
```

> Ganti `xxxxx` dengan kunci asli dari portal (lihat [Bab 01](./01-persiapan-alat-dan-akun.md)). **Tidak ada spasi** di sekitar tanda `=`, dan **tidak pakai tanda kutip**.

### 1.3 PASTIKAN `.env` diabaikan Git

Buka file `.gitignore`, pastikan ada baris:

```
.env
node_modules
```

> ⚠️ **Ini krusial.** Kalau `.env` ikut terunggah ke GitHub, kuncimu bocor ke publik. Banyak orang kena masalah ini.

---

## Langkah 2 — Buat endpoint Claude (`/generate`)

Buka `index.js`. **Di baris paling atas**, tambahkan agar `.env` terbaca:

```javascript
require("dotenv").config(); // baca file .env, paling atas sendiri
```

Lalu, **sebelum** baris `app.listen(...)`, tambahkan endpoint ini:

```javascript
// Endpoint: bikin naskah hook + caption pakai Claude
app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body; // teks permintaan dari frontend

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY, // kunci dari .env
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    res.json(data); // kirim hasilnya balik ke frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal memanggil Claude" });
  }
});
```

**Penjelasan kata-kata baru:**
- `app.post(...)` → aturan untuk request jenis **POST** (mengirim sesuatu).
- `async` & `await` → cara menunggu jawaban yang butuh waktu (memanggil AI tidak instan). `await` = "tunggu sampai selesai baru lanjut".
- `req.body` → isi data yang dikirim frontend.
- `process.env.ANTHROPIC_API_KEY` → mengambil kunci dari `.env`.
- `try { ... } catch (err) { ... }` → "coba jalankan; kalau error, tangani dengan rapi" supaya server tidak mati.
- `res.status(500)` → kode "500" artinya "ada error di server".

→ **Dokumentasi resmi Claude:**
> - Mulai cepat: <https://docs.anthropic.com/en/api/getting-started>
> - Endpoint Messages: <https://docs.anthropic.com/en/api/messages>
> - Daftar model: <https://docs.anthropic.com/en/docs/about-claude/models>

---

## Langkah 3 — Tes endpoint Claude dengan Postman

1. Jalankan server: `node index.js`
2. Buka **Postman** → **New → HTTP Request**.
3. Ganti metode jadi **POST**.
4. Isi URL: `http://localhost:3000/generate`
5. Klik tab **Body → raw → JSON**, masukkan:
   ```json
   { "prompt": "Tulis 1 hook iklan singkat untuk sepatu lari." }
   ```
6. Klik **Send**.
7. **Berhasil** kalau muncul jawaban berisi teks dari Claude. 🎉

> Kalau muncul error soal "credit/billing", berarti akun Anthropic-mu belum punya saldo. Isi saldo di <https://console.anthropic.com/>.

---

## Langkah 4 — Endpoint Veo (pembuat video)

Polanya **sama persis**: frontend memanggil server, server memanggil Veo dengan kunci rahasia, lalu **menyimpan video hasilnya** ke gudang file.

→ **Dokumentasi Veo:**
> - Lewat Gemini API (lebih sederhana): <https://ai.google.dev/gemini-api/docs/video>
> - Lewat Vertex AI (untuk skala besar/produksi): <https://cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos>

**Pengaturan video** (ikuti yang sudah dipakai prototype):
- Model: `veo3.1-fast`
- Rasio menyesuaikan platform tujuan:
  - `9:16` → TikTok, Instagram Reels, YouTube Shorts (video tegak)
  - `1:1` → LinkedIn, Facebook (kotak)
  - `16:9` → X (lebar)
- Durasi: 4–8 detik

### Alur render video

```
1. Frontend minta render → POST /campaigns/:id/renders
2. Server panggil Veo (pakai VEO_API_KEY)
3. Veo butuh waktu → server simpan dulu sebagai "sedang diproses"
4. Saat video jadi → simpan file ke GUDANG FILE online
5. Daftarkan link-nya dengan susunan: campaign → hook → ratio → url
6. Frontend cek status lewat GET /renders/:id → dapat link video
```

> Susunan `campaign → hook → ratio → url` itu **penting** karena frontend sudah dibuat untuk membaca bentuk ini (dari `br-veo-manifest.jsx`). Ikuti persis supaya tampilan langsung jalan.

### Pilihan gudang file (object storage)

| Layanan | Dokumentasi |
|---|---|
| Amazon S3 | <https://docs.aws.amazon.com/s3/> |
| Google Cloud Storage | <https://cloud.google.com/storage/docs> |
| Cloudflare R2 (murah) | <https://developers.cloudflare.com/r2/> |

> 💡 Karena Veo butuh waktu memproses, video sebaiknya dibuat oleh **worker di latar belakang** (lihat konsep Queue/Worker di [Bab 00](./00-kamus-istilah.md) dan penerapannya di [Bab 05](./05-posting-ke-platform.md)). Untuk awal, versi sederhana "tunggu sampai jadi" sudah cukup untuk belajar.

---

## Langkah 5 — Sambungkan frontend (nanti)

Setelah endpoint server siap & teruji di Postman, frontend tinggal diarahkan: dari yang tadinya memanggil AI langsung, menjadi memanggil `http://localhost:3000/generate` (atau alamat server online nanti). Bagian ini biasanya dikerjakan developer frontend; yang penting **bentuk data (JSON) tetap sama** seperti yang prototype harapkan.

---

## Checklist Bab 03

- [ ] `dotenv` terpasang
- [ ] File `.env` berisi kunci asli & **diabaikan** oleh `.gitignore`
- [ ] Endpoint `/generate` jalan & teruji di Postman
- [ ] Paham alur render Veo (panggil → tunggu → simpan ke gudang → daftarkan link)
- [ ] Memilih satu layanan gudang file

---

## Yang sudah kamu capai

✅ Kunci AI tidak lagi bocor ke browser — sudah aman di server.
✅ Endpoint nyata pertama (`/generate`) bekerja.
✅ Paham pola "frontend → server → layanan luar" yang akan dipakai di SEMUA fitur berikutnya.

---

[← Bab 02: Backend Pertama](./02-backend-pertama.md) · [Daftar isi](./README.md) · [Bab 04: OAuth →](./04-oauth-hubungkan-akun.md)
