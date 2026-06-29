# Bab 01 — Persiapan Alat & Akun

> Tujuan bab ini: menyiapkan semua "perkakas" di komputermu dan **mendaftarkan akun developer** ke tiap layanan. Bagian akun developer **wajib dimulai dari sekarang** karena prosesnya yang paling lama.

[← Bab 00: Kamus](./00-kamus-istilah.md) · [Daftar isi](./README.md) · [Bab 02: Backend Pertama →](./02-backend-pertama.md)

---

## Bagian A — Install alat di komputermu

Semua gratis. Ikuti satu per satu.

### A.1 — Node.js (mesin backend)

**Apa ini?** Program yang membuat komputermu bisa menjalankan kode JavaScript sebagai server. Ini fondasi backend.

**Cara install:**
1. Buka <https://nodejs.org/>
2. Klik tombol versi **LTS** (Long-Term Support = paling stabil). **Jangan** pilih "Current".
3. Buka file yang terunduh, klik **Next → Next → Install** sampai selesai.

**Cara memastikan berhasil:**
1. Buka **Terminal** (Mac: tekan `Cmd+Spasi`, ketik "Terminal") atau **PowerShell** (Windows: tekan tombol Start, ketik "PowerShell").
2. Ketik perintah ini lalu tekan Enter:
   ```bash
   node --version
   ```
3. **Berhasil** kalau muncul angka seperti `v20.11.0`.
4. **Gagal** kalau muncul `command not found` → install ulang & restart komputer.

> 💡 Saat install Node.js, otomatis ikut terpasang **npm** (Node Package Manager) — alat untuk menambah "komponen siap pakai". Cek dengan `npm --version`.

### A.2 — Visual Studio Code (editor kode)

**Apa ini?** Tempat menulis & mengedit kode. Paling populer dan ramah pemula.

**Cara install:**
1. Buka <https://code.visualstudio.com/>
2. Klik **Download**, install seperti biasa.
3. Buka VS Code. Untuk membuka folder proyek: menu **File → Open Folder**.

**Ekstensi yang disarankan** (klik ikon kotak-kotak di kiri, lalu cari namanya):
- **Prettier** — merapikan kode otomatis.
- **ESLint** — memberi tahu kalau ada kesalahan kode.

### A.3 — Git (pelacak perubahan kode)

**Apa ini?** Alat untuk menyimpan riwayat perubahan kode, supaya bisa "kembali ke versi kemarin" kalau ada yang rusak.

**Cara install:** <https://git-scm.com/downloads> → unduh sesuai sistem operasi → install dengan setelan default.

**Cek berhasil:**
```bash
git --version
```

### A.4 — Postman (alat tes API)

**Apa ini?** Alat untuk "mengetuk" endpoint API dan melihat jawabannya, **tanpa perlu tampilan**. Sangat membantu memastikan backend bekerja sebelum disambungkan ke frontend.

**Cara install:** <https://www.postman.com/downloads/>

> Alternatif yang lebih ringan & gratis: ekstensi **Thunder Client** di dalam VS Code.

---

## Bagian B — Daftar akun developer (MULAI HARI INI)

Setiap layanan luar mengharuskan kamu:
1. **Mendaftar** sebagai developer.
2. **Membuat "App"** di portal mereka.
3. **Mendapat kunci** (Client Key/Secret atau API Key).
4. Untuk sosial media: **mengajukan review/persetujuan** agar boleh posting ke publik.

### B.1 — Tabel portal pendaftaran

| Layanan | Portal | Yang kamu dapat |
|---|---|---|
| **Claude (Anthropic)** | <https://console.anthropic.com/> | `ANTHROPIC_API_KEY` |
| **Google (Veo + YouTube)** | <https://console.cloud.google.com/> | `GOOGLE_CLIENT_ID/SECRET`, kunci Veo |
| **TikTok** | <https://developers.tiktok.com/> | `TIKTOK_CLIENT_KEY/SECRET` |
| **Meta (Instagram + Facebook)** | <https://developers.facebook.com/> | `META_APP_ID/SECRET` |
| **LinkedIn** | <https://www.linkedin.com/developers/> | `LINKEDIN_CLIENT_ID/SECRET` |
| **X (Twitter)** | <https://developer.x.com/> | `X_CLIENT_ID/SECRET` |

### B.2 — Langkah umum membuat "App" (polanya mirip di semua portal)

1. **Login** ke portal, lengkapi profil developer (kadang minta verifikasi email/nomor HP).
2. Klik **"Create App"** / **"New Project"**.
3. Isi nama aplikasi (misal "BrandReel"), deskripsi, dan **kategori** (pilih yang sesuai, misal "Content & publishing").
4. Catat **Client ID/Key** dan **Client Secret** yang muncul — simpan baik-baik (nanti masuk file `.env` di Bab 03).
5. Daftarkan **Redirect URI** (alamat tempat platform mengarahkan balik setelah login). Saat masih di komputer: `http://localhost:3000/auth/<platform>/callback`. Detail di [Bab 04](./04-oauth-hubungkan-akun.md).
6. Pilih **scope/izin** yang dibutuhkan (lihat tabel di [Bab 04](./04-oauth-hubungkan-akun.md)).

> ⚠️ **Client Secret biasanya hanya ditampilkan SEKALI.** Kalau lupa menyalin, kamu harus membuat ulang (generate) yang baru. Simpan langsung di tempat aman.

### B.3 — Proses review (ini yang paling lama!)

Sosial media tidak langsung mengizinkan aplikasi baru posting ke publik. Mereka minta:
- **Verifikasi bisnis** (kadang perlu dokumen perusahaan).
- **Video demo** yang menunjukkan cara aplikasimu memakai izin tersebut.
- **Kebijakan privasi** (halaman web berisi cara kamu menangani data pengguna).
- **Penjelasan** kenapa butuh tiap izin.

| Platform | Catatan review |
|---|---|
| **TikTok** | Sebelum lolos, app hanya bisa posting **private** (cuma kamu yang lihat). |
| **Instagram** | Wajib akun **Business/Creator** terhubung ke **Facebook Page**. Wajib "App Review". |
| **YouTube** | Verifikasi "sensitive scope" karena izin upload. |
| **X** | Fitur posting butuh **tier API berbayar**. |

> ⏳ **AKSI HARI INI:** daftar & ajukan review **TikTok + Instagram** lebih dulu. Keduanya menggerbangi seluruh fitur posting dan bisa makan **berminggu-minggu**. Sambil menunggu review, kamu kerjakan Bab 02–03 yang tidak butuh persetujuan.

---

## Checklist sebelum lanjut ke Bab 02

- [ ] `node --version` memunculkan angka
- [ ] `npm --version` memunculkan angka
- [ ] `git --version` memunculkan angka
- [ ] VS Code terpasang & bisa membuka folder
- [ ] Postman (atau Thunder Client) terpasang
- [ ] Akun developer Anthropic dibuat, `ANTHROPIC_API_KEY` didapat
- [ ] Akun developer TikTok & Instagram **didaftarkan + review diajukan**
- [ ] Client ID/Secret tiap platform disimpan di tempat aman

Kalau semua ✅, lanjut.

---

[← Bab 00: Kamus](./00-kamus-istilah.md) · [Daftar isi](./README.md) · [Bab 02: Backend Pertama →](./02-backend-pertama.md)
