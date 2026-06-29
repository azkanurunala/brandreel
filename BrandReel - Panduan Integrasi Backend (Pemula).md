# Panduan Integrasi Backend BrandReel — Versi Pemula Total

> **Untuk siapa dokumen ini?**
> Untuk kamu yang **belum pernah ngoding sama sekali**. Setiap istilah dijelaskan dengan bahasa sehari-hari, setiap langkah diberi urutan yang jelas, dan setiap layanan punya link ke dokumentasi resminya.
> Tujuannya: kamu paham **apa yang harus dibangun**, **kenapa**, dan **dari mana mulainya** — bahkan kalau nanti yang ngerjain adalah developer yang kamu sewa, kamu tetap bisa mengikuti dan mengawasi prosesnya.

---

## Daftar Isi

1. [Apa itu BrandReel & kenapa butuh "backend"?](#1-apa-itu-brandreel--kenapa-butuh-backend)
2. [Kamus istilah (baca ini dulu!)](#2-kamus-istilah-baca-ini-dulu)
3. [Gambaran besar: bagaimana semuanya tersambung](#3-gambaran-besar-bagaimana-semuanya-tersambung)
4. [Apa yang sudah jalan vs. apa yang harus dibangun](#4-apa-yang-sudah-jalan-vs-apa-yang-harus-dibangun)
5. [Persiapan: alat & akun yang kamu butuhkan](#5-persiapan-alat--akun-yang-kamu-butuhkan)
6. [Langkah 0 — Bikin "backend" pertamamu](#6-langkah-0--bikin-backend-pertamamu)
7. [Langkah 1 — Pindahkan kunci AI (Claude & Veo) ke server](#7-langkah-1--pindahkan-kunci-ai-claude--veo-ke-server)
8. [Langkah 2 — Menghubungkan akun sosial media (OAuth)](#8-langkah-2--menghubungkan-akun-sosial-media-oauth)
9. [Langkah 3 — Mempublikasikan video ke tiap platform](#9-langkah-3--mempublikasikan-video-ke-tiap-platform)
10. [Langkah 4 — Mengambil data statistik (Insights)](#10-langkah-4--mengambil-data-statistik-insights)
11. [Daftar endpoint API yang harus dibuat](#11-daftar-endpoint-api-yang-harus-dibuat)
12. [Keamanan: aturan yang TIDAK boleh dilanggar](#12-keamanan-aturan-yang-tidak-boleh-dilanggar)
13. [Rencana pengerjaan bertahap (rollout)](#13-rencana-pengerjaan-bertahap-rollout)
14. [Kumpulan link dokumentasi resmi](#14-kumpulan-link-dokumentasi-resmi)

---

## 1. Apa itu BrandReel & kenapa butuh "backend"?

**BrandReel** adalah aplikasi yang membuat video promosi pakai AI, lalu mempostingnya otomatis ke berbagai sosial media (TikTok, Instagram, YouTube, dll), lalu menampilkan statistiknya.

Yang sudah ada sekarang namanya **prototype** — yaitu versi "pura-pura". Tampilannya sudah jadi dan jalan di browser, tapi sebagian fitur cuma **simulasi** (datanya palsu, postingannya tidak benar-benar terkirim).

> **Analogi:** prototype itu seperti dapur restoran yang sudah lengkap dengan kompor, panci, dan menu — tapi belum tersambung ke gas dan air. Dokumen ini menjelaskan cara "menyambungkan gas dan air" supaya dapur benar-benar bisa masak.

### Kenapa harus ada server / backend?

Karena beberapa hal **tidak boleh dan tidak bisa** dilakukan langsung dari browser:

- **Kunci rahasia (secret).** Untuk posting ke TikTok atau Instagram, kamu butuh semacam "kunci rahasia perusahaan". Kalau kunci ini ditaruh di browser, **siapa pun bisa mencurinya** (browser bisa diintip oleh siapa saja). Jadi kunci harus disimpan di komputer server yang kamu kontrol.
- **Aturan platform.** TikTok, Instagram, dll. **mewajibkan** proses login & posting dilakukan dari server, bukan dari browser pengguna.

Singkatnya: **backend** = komputer server milikmu yang menyimpan semua kunci rahasia dan menjadi "perantara" antara aplikasi dan layanan luar.

[↑ kembali ke atas](#daftar-isi)

---

## 2. Kamus istilah (baca ini dulu!)

| Istilah | Artinya dengan bahasa sehari-hari |
|---|---|
| **Frontend / Client** | Bagian yang dilihat & disentuh pengguna (tampilan di browser/HP). Prototype BrandReel adalah ini. |
| **Backend / Server** | Komputer "di belakang layar" yang kamu sewa, menyimpan rahasia & mengatur logika. Pengguna tidak melihatnya. |
| **API** | Cara dua program "ngobrol". Bayangkan pelayan restoran: kamu pesan ("kasih saya data X"), dia antar jawabannya. |
| **Endpoint** | Satu "alamat" tertentu di API. Contoh: `/connections` adalah alamat untuk minta daftar akun yang tersambung. |
| **Request / Response** | Request = permintaan yang kamu kirim. Response = jawaban yang kamu terima. |
| **REST / JSON** | REST = gaya umum membuat API. JSON = format teks rapi untuk menyusun data (daftar berisi nama: nilai). |
| **Token** | "Tiket masuk" sementara. Setelah login berhasil, platform kasih token sebagai bukti kamu boleh posting. |
| **OAuth** | Cara aman "login dengan akun X" tanpa kamu tahu password aslinya. Hasil akhirnya adalah token. |
| **Secret / API Key** | Kunci/password rahasia milik aplikasimu. **Tidak boleh bocor.** |
| **Environment Variable (env)** | Tempat menyimpan secret di server, terpisah dari kode, supaya aman. |
| **Webhook** | Kebalikan dari request biasa: platform yang **menelepon balik** server kamu saat ada kabar (misal "video sudah selesai diproses"). |
| **Queue / Worker** | Antrean pekerjaan + "pekerja" yang menjalankannya satu per satu di latar belakang (misal posting 6 video bergiliran). |
| **Object Storage / CDN** | Gudang file online (untuk menyimpan video) + jaringan pengantar cepat supaya video lancar diputar. |
| **Rate limit** | Batasan "berapa kali boleh" dari platform. Kalau kebanyakan, kamu diblokir sementara. |

> 💡 **Tips:** Kamu tidak harus hafal. Balik lagi ke tabel ini setiap ketemu istilah asing.

[↑ kembali ke atas](#daftar-isi)

---

## 3. Gambaran besar: bagaimana semuanya tersambung

Alur dasarnya selalu sama:

```
[ PENGGUNA di browser/HP ]
            │
            │  (1) "Tolong posting video ini ke TikTok"
            ▼
[ BACKEND BRANDREEL — server milikmu ]   ← menyimpan SEMUA kunci rahasia
            │
            │  (2) pakai kunci rahasia untuk bicara ke TikTok
            ▼
[ LAYANAN LUAR: TikTok, Instagram, YouTube, Claude AI, Google Veo ]
            │
            │  (3) "OK, sudah diposting. Ini link-nya."
            ▼
[ BACKEND ] ──(4) "Berhasil!"──► [ PENGGUNA ]
```

**Poin terpenting:** browser pengguna **tidak pernah** memegang kunci platform. Browser hanya bicara ke **server kamu**. Server kamu yang memegang semua kunci dan bicara ke pihak ketiga.

### Komponen yang perlu dibangun di backend

1. **Auth service** — mengurus login pengguna + proses menghubungkan akun sosial media.
2. **Secret store (brankas)** — tempat menyimpan token terenkripsi. Jangan pernah dicetak ke log.
3. **Render workers** — memanggil Google Veo untuk bikin video, lalu menyimpannya di gudang file.
4. **Publish workers + scheduler** — mengatur antrean posting ke tiap platform, mengatur jeda, dan mengulang kalau gagal.
5. **Webhook sink** — menerima "telepon balik" dari platform.
6. **Insights jobs** — mengambil statistik postingan secara berkala.

> Pemula tidak harus membangun keenamnya sekaligus. Lihat [rencana bertahap di §13](#13-rencana-pengerjaan-bertahap-rollout).

[↑ kembali ke atas](#daftar-isi)

---

## 4. Apa yang sudah jalan vs. apa yang harus dibangun

| Fitur | Status sekarang | Yang perlu dilakukan |
|---|---|---|
| **Naskah hook & caption (AI)** | ✅ SUDAH NYATA | Pindahkan kunci Claude ke server, panggil lewat endpoint `POST /generate`. |
| **Pembuatan video klip (Veo)** | ✅ NYATA* | Panggilan Veo sudah jalan; *terhalang kredit organisasi. Jalankan di server, simpan hasil di gudang file. |
| **Login / hubungkan akun (OAuth)** | ⚠️ SIMULASI | Bangun OAuth 2.0 untuk tiap platform. (§8) |
| **Posting & penjadwalan** | ⚠️ SIMULASI | Bangun "adapter" posting tiap platform + penjadwal antrean. (§9) |
| **Statistik / analitik** | ⚠️ SIMULASI | Bangun job pengambilan statistik berkala. (§10) |

**Kabar baik:** tampilan (frontend) sudah selesai. Kamu **tidak perlu** mengubah tampilan. Pekerjaannya murni di sisi server — mengganti data palsu dengan data asli, satu per satu.

[↑ kembali ke atas](#daftar-isi)

---

## 5. Persiapan: alat & akun yang kamu butuhkan

### A. Alat di komputermu (gratis)

1. **Node.js** — program untuk menjalankan kode JavaScript di server. Ini "mesin" backend-nya.
   → Unduh & install: <https://nodejs.org/> (pilih versi **LTS**, yang artinya paling stabil)
2. **Editor kode** — tempat menulis kode. Yang paling populer & ramah pemula:
   → **Visual Studio Code**: <https://code.visualstudio.com/>
3. **Git** — alat untuk menyimpan & melacak perubahan kode.
   → <https://git-scm.com/downloads>
4. **Postman** — alat untuk "mengetes" API tanpa perlu tampilan. Sangat membantu pemula.
   → <https://www.postman.com/downloads/>

### B. Cara cek Node.js sudah terpasang

Buka aplikasi **Terminal** (Mac) atau **Command Prompt / PowerShell** (Windows), lalu ketik:

```bash
node --version
```

Kalau muncul tulisan seperti `v20.11.0`, berarti **berhasil**. Kalau muncul "command not found", install ulang Node.js.

### C. Akun developer yang harus didaftarkan

Setiap layanan luar mewajibkan kamu **mendaftar sebagai developer** dan **membuat "App"** di portal mereka. Ini gratis tapi makan waktu (apalagi proses verifikasi). Daftarkan dari sekarang:

| Layanan | Portal pendaftaran |
|---|---|
| Claude (Anthropic) | <https://console.anthropic.com/> |
| Google Veo & YouTube | <https://console.cloud.google.com/> |
| TikTok | <https://developers.tiktok.com/> |
| Instagram & Facebook (Meta) | <https://developers.facebook.com/> |
| LinkedIn | <https://www.linkedin.com/developers/> |
| X (Twitter) | <https://developer.x.com/> |

> ⏳ **Penting soal waktu:** bagian paling lama BUKAN ngodingnya, tapi **proses persetujuan (review) dari platform**. TikTok & Instagram bisa makan waktu **berminggu-minggu** sebelum mengizinkan aplikasimu posting. **Daftarkan dan ajukan review TikTok + Instagram di hari pertama.**

[↑ kembali ke atas](#daftar-isi)

---

## 6. Langkah 0 — Bikin "backend" pertamamu

Tujuan langkah ini: punya server sederhana yang bisa menjawab "halo". Ini fondasinya.

### Step-by-step

**1. Buat folder proyek.** Di Terminal:

```bash
mkdir brandreel-backend
cd brandreel-backend
```

(`mkdir` = bikin folder, `cd` = masuk ke folder)

**2. Mulai proyek Node.js:**

```bash
npm init -y
```

Ini membuat file `package.json` (semacam "KTP" proyekmu).

**3. Pasang Express** (alat paling populer untuk bikin API di Node.js):

```bash
npm install express
```

→ Dokumentasi resmi Express: <https://expressjs.com/en/starter/installing.html>

**4. Buat file `index.js`** di editor, isi dengan:

```javascript
const express = require("express");
const app = express();
app.use(express.json()); // supaya server paham data JSON

// endpoint percobaan
app.get("/", (req, res) => {
  res.send("Halo, backend BrandReel jalan!");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log("Server jalan di http://localhost:3000");
});
```

**5. Jalankan server:**

```bash
node index.js
```

**6. Cek hasilnya.** Buka browser, ketik alamat: `http://localhost:3000`
Kalau muncul tulisan "Halo, backend BrandReel jalan!" — **selamat, backend pertamamu hidup!** 🎉

> `localhost` artinya "komputer kamu sendiri". Nanti saat siap, backend dipindah (di-*deploy*) ke server online seperti **Render** (<https://render.com/>), **Railway** (<https://railway.app/>), atau **Vercel** (<https://vercel.com/>) supaya bisa diakses dari mana saja.

[↑ kembali ke atas](#daftar-isi)

---

## 7. Langkah 1 — Pindahkan kunci AI (Claude & Veo) ke server

Ini langkah pertama yang nyata karena dua fitur ini **sudah berfungsi** — kita hanya memindahkan kuncinya supaya aman.

### 7.1 Simpan kunci rahasia dengan aman (environment variables)

**1. Pasang dotenv** (alat untuk membaca file rahasia):

```bash
npm install dotenv
```

→ Dokumentasi: <https://github.com/motdotla/dotenv#readme>

**2. Buat file bernama `.env`** (perhatikan ada titik di depan) di folder proyek:

```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
VEO_API_KEY=xxxxxxxxxxxxx
GOOGLE_PROJECT=nama-project-google-kamu
```

> Ganti `xxxxx` dengan kunci asli dari portal masing-masing (lihat §5C).

**3. JANGAN sampai file `.env` ikut terkirim ke internet.** Buat file `.gitignore` dan tulis di dalamnya:

```
.env
node_modules
```

Ini memberi tahu Git: "abaikan file ini, jangan pernah simpan/unggah".

### 7.2 Buat endpoint untuk Claude

Tambahkan di `index.js` (di atas baris `app.listen`):

```javascript
require("dotenv").config(); // baca file .env

app.post("/generate", async (req, res) => {
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
  res.json(data); // kirim balik hasilnya ke frontend
});
```

→ **Dokumentasi resmi Claude API:** <https://docs.anthropic.com/en/api/getting-started>
→ Cara membuat pesan: <https://docs.anthropic.com/en/api/messages>

**Apa yang terjadi di sini?** Frontend tidak lagi memanggil Claude langsung. Ia memanggil server kamu (`/generate`), lalu **server** yang memegang kunci dan bicara ke Claude. Kunci tidak pernah terlihat oleh browser. ✅

### 7.3 Endpoint untuk Google Veo (pembuat video)

Polanya **sama persis** — frontend memanggil server kamu, server memanggil Veo dengan kunci rahasia, lalu menyimpan video hasilnya di gudang file.

→ **Dokumentasi Veo (lewat Gemini API):** <https://ai.google.dev/gemini-api/docs/video>
→ **Veo lewat Vertex AI (untuk skala besar):** <https://cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos>

Pengaturan video mengikuti yang sudah dipakai prototype:
- Model: `veo3.1-fast`
- Rasio menyesuaikan platform: `9:16` (TikTok/IG/Shorts), `1:1` (LinkedIn/FB), `16:9` (X)
- Durasi: 4–8 detik

Setelah video jadi, simpan ke **gudang file online**, lalu daftarkan link-nya dengan susunan `campaign → hook → ratio → url` (susunan yang sudah dibaca frontend). Pilihan gudang file populer:
- **Amazon S3**: <https://docs.aws.amazon.com/s3/>
- **Google Cloud Storage**: <https://cloud.google.com/storage/docs>
- **Cloudflare R2**: <https://developers.cloudflare.com/r2/>

[↑ kembali ke atas](#daftar-isi)

---

## 8. Langkah 2 — Menghubungkan akun sosial media (OAuth)

Ini bagian "Login dengan TikTok / Instagram / dll". Konsepnya disebut **OAuth 2.0**.

### 8.1 Memahami OAuth dengan analogi

Bayangkan kamu menginap di hotel:
1. Kamu ke resepsionis dan bilang "saya mau check-in" → **(Start)**
2. Resepsionis minta KTP & kamu setuju → **(Consent / persetujuan)**
3. Resepsionis kasih **kartu kamar** (bukan kunci master hotel) → **(Token)**

Token = kartu kamar. Ia hanya bisa membuka hal-hal tertentu (misal "boleh posting video"), berlaku sementara, dan bisa dicabut kapan saja. Aplikasimu **tidak pernah** tahu password asli pengguna.

→ Penjelasan resmi OAuth 2.0: <https://oauth.net/2/>

### 8.2 Alur 3 langkah (sama untuk semua platform)

```
1 · START      Frontend panggil  POST /auth/tiktok/start
               → server balas "buka halaman izin TikTok ini"

2 · CONSENT    Pengguna klik "Izinkan" di halaman TikTok

3 · CALLBACK   TikTok mengarahkan balik ke  GET /auth/tiktok/callback
               → SERVER menukar "kode" jadi "token" → simpan di brankas
```

> **Yang krusial:** penukaran *kode → token* di langkah 3 **wajib** terjadi di server, karena butuh **client secret** (kunci rahasia aplikasi). Inilah alasan utama backend ada.

### 8.3 Token harus diperbarui otomatis (refresh)

Token punya masa berlaku (misal 24 jam). Kalau habis, posting gagal. Solusinya: buat **penjadwal** yang memperbarui token **sebelum** kedaluwarsa. Inilah yang di prototype tampil sebagai "token refreshed 7d ahead". Kalau perpanjangan gagal, ubah status koneksi jadi `expiring` / `expired` (status ini sudah ditampilkan di layar Profile & Inbox).

### 8.4 Scope & dokumentasi per platform

"Scope" = daftar izin yang kamu minta (misal: izin posting, izin baca statistik). Minta seperlunya saja.

| Platform | Portal & dokumentasi | Izin (scope) utama |
|---|---|---|
| **TikTok** | Login Kit: <https://developers.tiktok.com/doc/login-kit-web/> · Content Posting: <https://developers.tiktok.com/doc/content-posting-api-get-started/> | `video.publish`, `video.upload`, `user.info.basic`, `user.info.stats` |
| **Instagram** | <https://developers.facebook.com/docs/instagram-platform/content-publishing> | `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `business_management` |
| **YouTube** | <https://developers.google.com/youtube/v3/guides/authentication> | `youtube.upload`, `youtube.readonly`, `yt-analytics.readonly` |
| **LinkedIn** | <https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api> | `w_member_social`, `r_basicprofile` (atau `w_organization_social`) |
| **X (Twitter)** | <https://developer.x.com/en/docs/authentication/oauth-2-0> | `tweet.write`, `tweet.read`, `users.read`, `offline.access` |
| **Facebook** | <https://developers.facebook.com/docs/pages-api/posts> | `pages_manage_posts`, `pages_read_engagement` |

> ⚠️ **Catatan penting per platform:**
> - **TikTok:** aplikasi yang belum lolos review hanya bisa posting *private* (cuma kamu yang lihat).
> - **Instagram:** wajib pakai akun **Business/Creator** yang terhubung ke sebuah **Facebook Page**. Wajib lolos "App Review".
> - **YouTube:** butuh verifikasi karena izinnya "sensitif".
> - **X:** fitur posting butuh **tier API berbayar**.
> - **Facebook:** posting pakai *Page access token*, bukan token pengguna.
>
> Dokumentasi platform **sering berubah**. Selalu cek dokumentasi terbaru saat mengerjakan.

[↑ kembali ke atas](#daftar-isi)

---

## 9. Langkah 3 — Mempublikasikan video ke tiap platform

Tiap platform punya cara posting yang berbeda. Solusinya: buat **"adapter"** — satu potong kode khusus per platform, tapi semuanya punya bentuk perintah yang sama:

```
validate()       → cek dulu: rasio benar? durasi pas? caption tidak kepanjangan?
publish()        → posting beneran, lalu simpan ID & link hasilnya
fetchInsights()  → ambil statistik (views, likes, dll)
```

### 9.1 Cara posting & batasan tiap platform

| Platform | Rasio · Durasi | Cara posting (ringkas) | Batas caption |
|---|---|---|---|
| **TikTok** | 9:16 · ≤60d | Init → unggah bertahap → cek status | ≤150 huruf, 5 tagar |
| **Instagram** | 9:16 · ≤90d | Buat "container" → lalu `media_publish` (2 langkah) | ≤2200 |
| **YouTube** | 9:16 · ≤60d | `videos.insert` (unggah resumable), tambah `#Shorts` | judul ≤100 |
| **LinkedIn** | 1:1 · ≤90d | Daftar aset → unggah → buat Post | ≤700, 3 tagar |
| **X** | 16:9 · ≤140d | Unggah media bertahap → `POST /2/tweets` | ≤280, 2 tagar |
| **Facebook** | 1:1 · ≤90d | `POST /{page-id}/videos` pakai Page token | ≤2200, 4 tagar |

**Link "cara posting video" tiap platform:**
- TikTok: <https://developers.tiktok.com/doc/content-posting-api-reference-upload-video/>
- Instagram Reels: <https://developers.facebook.com/docs/instagram-platform/content-publishing#reels-posts>
- YouTube `videos.insert`: <https://developers.google.com/youtube/v3/docs/videos/insert>
- LinkedIn Video: <https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/videos-api>
- X (post tweet): <https://developer.x.com/en/docs/x-api/tweets/manage-tweets/introduction>
- Facebook Page video: <https://developers.facebook.com/docs/pages-api/posts>

### 9.2 Alur "antrean posting" (publish pipeline)

Layar "Publishing" di prototype yang menampilkan status *queued → posted → retry → failed* akan jadi nyata lewat tahap-tahap ini:

1. **Pre-flight (cek dulu)** — jalankan `validate()`: cek rasio/durasi, token masih berlaku, belum kena batas, tidak dobel.
2. **Stagger (beri jeda)** — jangan posting sekaligus. Beri jeda (misal TikTok 1 posting / 30 menit) supaya tidak dianggap spam. Inilah teks "staggered to avoid rate limit".
3. **Publish** — adapter posting, lalu simpan `remoteId` + `permalink` (link hasilnya).
4. **Retry (ulang)** — kalau kena error `429` (terlalu sering), tunggu lalu ulang otomatis dengan jeda makin lama.
5. **Auto-fix** — kalau ditolak karena format salah (misal "rasio harusnya 9:16"), potong/ubah ulang video lalu masukkan antrean lagi — bukan langsung gagal.

> Gunakan status `queued · posted · retry · failed` **persis** seperti itu, karena layar Publishing sudah dibuat untuk membaca kata-kata ini. Pakai nama yang sama, layar langsung menyala tanpa perlu ubah tampilan.

→ Tentang **rate limit** (batas frekuensi), tiap platform punya aturan berbeda — cek di dokumentasi masing-masing.
→ Untuk antrean & worker, alat populer: **BullMQ** (<https://docs.bullmq.io/>) yang berjalan di atas **Redis**.

[↑ kembali ke atas](#daftar-isi)

---

## 10. Langkah 4 — Mengambil data statistik (Insights)

Layar "Insights" yang sekarang menampilkan angka palsu akan diisi data asli lewat **job terjadwal**: secara berkala, server mengambil statistik tiap postingan dari platform, menyimpannya, lalu menjumlahkannya.

### Cara kerjanya
1. Untuk tiap postingan yang sudah live, ambil metrik (views, likes, komentar, share, jangkauan).
2. Simpan sebagai satu "snapshot" beserta waktunya.
3. Jumlahkan jadi total, per-platform, per-jenis-hook, dan "top performer".

### Seberapa sering mengambil data?
- **2 jam pertama:** sering (tiap 5–15 menit) — inilah teks "monitoring first 2 hours".
- **Setelahnya:** kurangi jadi per jam, lalu per hari.

### Dokumentasi statistik tiap platform
- TikTok (query video / insights): <https://developers.tiktok.com/doc/research-api-specs-query-videos/>
- Instagram (media insights): <https://developers.facebook.com/docs/instagram-platform/insights>
- YouTube Analytics API: <https://developers.google.com/youtube/analytics>
- LinkedIn (social actions): <https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/network-update-social-actions>
- X (tweet metrics): <https://developer.x.com/en/docs/x-api/metrics>

[↑ kembali ke atas](#daftar-isi)

---

## 11. Daftar endpoint API yang harus dibuat

Ini "menu" lengkap alamat-alamat yang nanti dipanggil frontend, menggantikan data palsu. Semua pakai JSON lewat HTTPS.

| Cara | Alamat (path) | Gunanya |
|---|---|---|
| POST | `/auth/:platform/start` | Mulai proses login OAuth → balas link halaman izin |
| GET | `/auth/:platform/callback` | Tukar kode jadi token, simpan koneksi (di server) |
| GET | `/connections` | Daftar akun yang tersambung + kesehatan token |
| DELETE | `/connections/:id` | Putuskan akun + hapus token |
| POST | `/campaigns` | Buat campaign baru (nama, logo, voice, platform) |
| POST | `/campaigns/:id/generate` | Bikin hook & caption pakai Claude |
| POST | `/campaigns/:id/renders` | Antre pembuatan video Veo per hook × rasio |
| GET | `/renders/:id` | Status video + link video (yang sudah diamankan) |
| POST | `/campaigns/:id/publish` | Jadwalkan & posting ke platform terpilih |
| GET | `/campaigns/:id/status` | Status posting per platform |
| GET | `/insights?range=` | Statistik gabungan |
| POST | `/webhooks/:platform` | Terima "telepon balik" dari platform |

**Contoh bentuk data** saat menyuruh server posting (`POST /campaigns/:id/publish`):

```json
{
  "variations": [
    { "hook": "h3", "platform": "tiktok", "renderId": "rnd_8x..", "caption": "…" }
  ],
  "schedule": { "mode": "stagger", "perPlatformGapMin": 30 }
}
```

Server menjawab:

```json
{ "jobId": "...", "perPlatform": [{ "platform": "tiktok", "state": "queued", "eta": "..." }] }
```

> `:platform` dan `:id` adalah "isian" — diganti nilai nyata, misal `/auth/tiktok/start` atau `/connections/123`.

### Bahan data yang disimpan (database)

| Hal yang disimpan | Isi pentingnya |
|---|---|
| **Account** | id, peran/role pengguna, paket langganan, kuota posting |
| **Connection** | platform, id pengguna di platform, *tokenRef* (di brankas), scope, status, kapan kedaluwarsa |
| **BrandKit** | voice, logo, warna — jadi bahan prompt Claude |
| **Campaign** | id, produk, deskripsi, daftar platform, status, hook terbaik |
| **Render** | hook, rasio, provider (veo/canvas), link file, durasi, status |
| **Post** | platform, link video, caption, id di platform, permalink, status, jadwal |
| **InsightSnapshot** | views, likes, komentar, share, jangkauan + waktu pengambilan |

→ Database ramah pemula: **PostgreSQL** (<https://www.postgresql.org/docs/>). Untuk mengelolanya lebih mudah, banyak yang pakai **Prisma** (<https://www.prisma.io/docs>).

[↑ kembali ke atas](#daftar-isi)

---

## 12. Keamanan: aturan yang TIDAK boleh dilanggar

Ini bukan saran — ini wajib. Melanggarnya bisa membuat akun & kunci dicuri.

- 🔒 **Secret hanya di server.** Jangan pernah taruh kunci rahasia di kode frontend atau di GitHub.
- 🔒 **Token dienkripsi saat disimpan** (pakai layanan KMS), dan **jangan pernah dicetak ke log**.
- 🔒 **Semua "redirect URI" harus didaftarkan** (allow-list) di portal tiap platform.
- 🔒 **Patuhi aturan penyimpanan & penghapusan data** tiap platform untuk statistik yang kamu simpan.

**Kebutuhan kunci (environment variables) lengkap:**

```
# AI
ANTHROPIC_API_KEY        VEO_API_KEY / GOOGLE_PROJECT

# OAuth tiap platform
TIKTOK_CLIENT_KEY        TIKTOK_CLIENT_SECRET
META_APP_ID              META_APP_SECRET          # Instagram + Facebook
GOOGLE_CLIENT_ID         GOOGLE_CLIENT_SECRET     # YouTube
LINKEDIN_CLIENT_ID       LINKEDIN_CLIENT_SECRET
X_CLIENT_ID              X_CLIENT_SECRET

# Infrastruktur
TOKEN_VAULT_KMS_KEY      OBJECT_STORE_BUCKET      CDN_BASE_URL      SESSION_SIGNING_KEY
```

→ Layanan brankas/KMS: **AWS KMS** (<https://docs.aws.amazon.com/kms/>), **Google Cloud KMS** (<https://cloud.google.com/kms/docs>), atau **HashiCorp Vault** (<https://developer.hashicorp.com/vault/docs>).

[↑ kembali ke atas](#daftar-isi)

---

## 13. Rencana pengerjaan bertahap (rollout)

Jangan bangun semua sekaligus. Ikuti urutan ini supaya tidak kewalahan:

- **Fase 0 — Fondasi.** Bikin backend + sistem login pengguna. Pindahkan kunci Claude & Veo ke server (tampilan tidak berubah, kunci jadi aman). → [§6](#6-langkah-0--bikin-backend-pertamamu) & [§7](#7-langkah-1--pindahkan-kunci-ai-claude--veo-ke-server)
- **Fase 1 — Satu platform dulu.** Selesaikan OAuth + daftar koneksi untuk **TikTok** dari ujung ke ujung. **Ajukan review TikTok + Instagram bersamaan** (karena lama). → [§8](#8-langkah-2--menghubungkan-akun-sosial-media-oauth)
- **Fase 2 — Posting nyata.** Bangun antrean posting + penjadwal untuk platform yang sudah disetujui. Sambungkan layar Publishing ke `/status` asli. → [§9](#9-langkah-3--mempublikasikan-video-ke-tiap-platform)
- **Fase 3 — Sisanya.** Tambah platform lain begitu review-nya lolos. Aktifkan pengambilan statistik → layar Insights jadi nyata. → [§10](#10-langkah-4--mengambil-data-statistik-insights)

> **Intinya:** frontend sudah berbentuk produk jadi. Pekerjaannya adalah membangun backend yang "berbicara bahasa yang sama". Bangun API-nya, biarkan frontend apa adanya, dan ganti data palsu jadi data asli **satu fase demi satu fase**.

[↑ kembali ke atas](#daftar-isi)

---

## 14. Kumpulan link dokumentasi resmi

**Alat dasar**
- Node.js — <https://nodejs.org/en/docs>
- Express — <https://expressjs.com/>
- Visual Studio Code — <https://code.visualstudio.com/docs>
- Git — <https://git-scm.com/doc>
- Postman — <https://learning.postman.com/docs/getting-started/introduction/>
- dotenv — <https://github.com/motdotla/dotenv#readme>

**AI**
- Claude / Anthropic API — <https://docs.anthropic.com/en/api/getting-started>
- Google Veo (Gemini API) — <https://ai.google.dev/gemini-api/docs/video>
- Google Veo (Vertex AI) — <https://cloud.google.com/vertex-ai/generative-ai/docs/video/generate-videos>

**Platform sosial media**
- TikTok for Developers — <https://developers.tiktok.com/>
- Meta for Developers (Instagram + Facebook) — <https://developers.facebook.com/docs/>
- Instagram Content Publishing — <https://developers.facebook.com/docs/instagram-platform/content-publishing>
- YouTube Data API — <https://developers.google.com/youtube/v3>
- YouTube Analytics API — <https://developers.google.com/youtube/analytics>
- LinkedIn Marketing API — <https://learn.microsoft.com/en-us/linkedin/marketing/>
- X (Twitter) API — <https://developer.x.com/en/docs/x-api>

**Konsep & keamanan**
- OAuth 2.0 — <https://oauth.net/2/>
- AWS S3 (gudang file) — <https://docs.aws.amazon.com/s3/>
- Google Cloud Storage — <https://cloud.google.com/storage/docs>
- Cloudflare R2 — <https://developers.cloudflare.com/r2/>
- AWS KMS (brankas kunci) — <https://docs.aws.amazon.com/kms/>
- PostgreSQL (database) — <https://www.postgresql.org/docs/>
- Prisma (pengelola database) — <https://www.prisma.io/docs>
- BullMQ (antrean pekerjaan) — <https://docs.bullmq.io/>

**Tempat deploy (menaruh backend online)**
- Render — <https://render.com/docs>
- Railway — <https://docs.railway.app/>
- Vercel — <https://vercel.com/docs>

---

*Dokumen ini menerjemahkan "BrandReel — Backend Integration Spec" ke panduan langkah-demi-langkah untuk pemula. Untuk detail teknis tiap endpoint, lihat spec aslinya.*
