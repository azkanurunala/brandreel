# Bab 02 — Backend Pertamamu

> Tujuan: punya **server sederhana yang hidup** dan bisa menjawab saat "diketuk". Setelah bab ini, kamu sudah punya fondasi untuk semua fitur lain.
>
> Tidak apa-apa kalau belum paham tiap baris kode. Ikuti dulu, pemahaman datang belakangan.

> 🧩 **Catatan stack (keputusan A):** produksi nanti memakai **TypeScript + Express + Prisma + Neon**, deploy ke **Render**. Bab ini sengaja memakai JavaScript polos dulu supaya konsepnya jelas untuk pemula. Saat handoff ke Claude Code ([Bab 14](./14-handoff-claude-code.md)), semua ditulis dalam TypeScript + Prisma. Contoh JS di sini tetap sah sebagai fondasi pemahaman.

[← Bab 01: Persiapan](./01-persiapan-alat-dan-akun.md) · [Daftar isi](./README.md) · [Bab 03: Kunci AI →](./03-kunci-ai-claude-veo.md)

---

## Langkah 1 — Buat folder proyek

Buka **Terminal / PowerShell**, lalu ketik baris demi baris (tekan Enter tiap baris):

```bash
mkdir brandreel-backend
cd brandreel-backend
```

**Penjelasan:**
- `mkdir brandreel-backend` → **m**a**k**e **dir**ectory = buat folder bernama `brandreel-backend`.
- `cd brandreel-backend` → **c**hange **d**irectory = "masuk" ke folder itu.

> 📁 Sekarang semua perintah yang kamu ketik berlaku di dalam folder ini.

---

## Langkah 2 — Inisialisasi proyek Node.js

```bash
npm init -y
```

**Apa yang terjadi?** Perintah ini membuat file `package.json` — semacam "KTP proyek" yang mencatat nama, versi, dan daftar komponen yang dipakai. `-y` artinya "iya saja untuk semua pertanyaan" (pakai setelan default).

**Cek:** ketik `ls` (Mac) atau `dir` (Windows). Kamu akan lihat file `package.json` muncul.

---

## Langkah 3 — Pasang Express

**Express** adalah komponen siap-pakai paling populer untuk membuat API di Node.js. Ia mengurus bagian rumit supaya kamu cukup menulis "kalau ada yang ngetuk alamat X, lakukan Y".

```bash
npm install express
```

**Apa yang terjadi?**
- npm mengunduh Express dari internet ke folder baru bernama `node_modules`.
- Express dicatat di `package.json` sebagai "dependency" (komponen yang dibutuhkan).

> 📦 `node_modules` bisa berisi ribuan file — itu **normal**. Jangan diutak-atik, dan nanti folder ini **tidak** ikut diunggah ke GitHub (lihat Langkah 7).

→ Dokumentasi resmi: <https://expressjs.com/en/starter/installing.html>

---

## Langkah 4 — Buka folder di VS Code

```bash
code .
```

(`code .` = buka folder saat ini di VS Code. Kalau perintah ini tidak jalan, buka VS Code manual lalu **File → Open Folder → pilih `brandreel-backend`**.)

---

## Langkah 5 — Buat file `index.js`

Di VS Code, klik kanan area kosong → **New File** → beri nama `index.js`. Isi dengan kode ini:

```javascript
// 1. Ambil komponen Express
const express = require("express");

// 2. Buat aplikasi server
const app = express();

// 3. Beri tahu server: kalau ada data masuk berbentuk JSON, pahami otomatis
app.use(express.json());

// 4. Endpoint percobaan: kalau ada yang "GET" ke alamat "/", balas teks
app.get("/", (req, res) => {
  res.send("Halo, backend BrandReel jalan!");
});

// 5. Nyalakan server di "pintu" (port) nomor 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server jalan di http://localhost:3000");
});
```

**Penjelasan tiap bagian:**
- `require("express")` → "ambilkan komponen Express yang tadi dipasang".
- `app.use(express.json())` → izinkan server membaca data JSON yang dikirim ke dirinya.
- `app.get("/", ...)` → **aturan**: "kalau ada request **GET** ke alamat `/`, jalankan fungsi ini".
  - `req` = **req**uest (permintaan yang masuk).
  - `res` = **res**ponse (jawaban yang kita kirim balik).
  - `res.send(...)` = "kirim teks ini sebagai jawaban".
- `app.listen(3000, ...)` → "nyalakan server, dengarkan di port 3000".

> 🚪 **Port** itu seperti nomor pintu di sebuah gedung (komputer). Server kita "berdiri" menunggu tamu di pintu nomor 3000.

---

## Langkah 6 — Jalankan server

Kembali ke Terminal, ketik:

```bash
node index.js
```

**Berhasil** kalau muncul tulisan: `Server jalan di http://localhost:3000`

**Sekarang buktikan:**
1. Buka browser (Chrome/Safari/dll).
2. Ketik di address bar: `http://localhost:3000`
3. Kalau muncul **"Halo, backend BrandReel jalan!"** → 🎉 **server pertamamu hidup!**

> ℹ️ `localhost` = "komputer kamu sendiri". Server ini baru bisa diakses dari komputermu, belum dari internet. Cara menaruhnya online ada di [Bab 09](./09-rollout-dan-deploy.md).

**Cara menghentikan server:** di Terminal, tekan `Ctrl + C`.

---

## Langkah 7 — Siapkan Git & file yang harus diabaikan

Sebelum menyimpan kode, buat file bernama `.gitignore` (ada titik di depan, tanpa ekstensi). Isi:

```
node_modules
.env
```

**Kenapa?**
- `node_modules` → folder raksasa, tidak perlu disimpan (bisa dipasang ulang dengan `npm install`).
- `.env` → berisi **rahasia** (Bab 03). **WAJIB** diabaikan supaya tidak pernah bocor.

Lalu simpan versi pertama proyekmu:

```bash
git init
git add .
git commit -m "Backend pertama: server halo"
```

**Penjelasan:**
- `git init` → mulai melacak folder ini dengan Git.
- `git add .` → "siapkan semua file untuk disimpan" (kecuali yang ada di `.gitignore`).
- `git commit -m "..."` → "simpan snapshot sekarang dengan catatan ini".

---

## Masalah umum & solusinya

| Gejala | Kemungkinan sebab | Solusi |
|---|---|---|
| `command not found: node` | Node.js belum terpasang/PATH belum kebaca | Install ulang Node.js, restart Terminal |
| `Error: Cannot find module 'express'` | Lupa `npm install express` | Jalankan `npm install express` di folder proyek |
| `EADDRINUSE: port 3000` | Port 3000 sudah dipakai program lain | Ganti `const PORT = 3000` jadi `3001`, atau matikan program lain |
| Browser "tidak bisa terhubung" | Server tidak sedang jalan | Pastikan `node index.js` masih berjalan di Terminal |

---

## Yang sudah kamu capai

✅ Backend hidup, bisa menerima request & mengirim response.
✅ Paham konsep port, endpoint, GET, request/response.
✅ Kode tersimpan rapi dengan Git.

Di bab berikutnya, server ini akan kita beri tugas pertama yang nyata: menjadi perantara aman untuk AI.

> 🧩 **Ke depan (stack A):** proyek nyata memakai struktur **TypeScript** (`src/` dengan file `.ts`), **Prisma** untuk database ([Bab 16](./16-skema-database.md)), dan variabel di `.env` ([Bab 15](./15-referensi-env.md)). Pola berpikirnya sama persis dengan yang baru kamu pelajari — hanya berbahasa TypeScript.

---

[← Bab 01: Persiapan](./01-persiapan-alat-dan-akun.md) · [Daftar isi](./README.md) · [Bab 03: Kunci AI →](./03-kunci-ai-claude-veo.md)
