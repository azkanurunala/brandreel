# Bab 00 — Kamus Istilah

> Bab ini bukan untuk dihafal. Baca sekilas sekarang, lalu **balik ke sini setiap kali ketemu kata asing** di bab lain.

[← Kembali ke daftar isi](./README.md)

---

## Bagian 1 — Istilah paling dasar

### Frontend (atau "Client")
Bagian yang **dilihat dan disentuh** pengguna: tombol, teks, gambar di layar HP/browser. Prototype BrandReel yang sudah ada adalah frontend. Kita **tidak** mengubahnya.

> 🏠 **Analogi:** frontend itu seperti **ruang tamu** rumah — yang dilihat tamu.

### Backend (atau "Server")
Komputer "di belakang layar" yang kamu sewa/kontrol. Pengguna tidak pernah melihatnya. Tugasnya: menyimpan rahasia, mengatur logika, berbicara ke layanan luar.

> 🏠 **Analogi:** backend itu **dapur** — tamu tidak masuk, tapi semua makanan dimasak di sana.

### API (Application Programming Interface)
Cara dua program "ngobrol" dengan aturan yang jelas.

> 🍽️ **Analogi:** API itu **pelayan restoran**. Kamu (frontend) tidak masuk dapur. Kamu kasih pesanan ke pelayan (API), pelayan bawa ke dapur (backend), lalu antar makanannya kembali.

### Endpoint
Satu **alamat spesifik** di dalam API untuk satu tugas tertentu.

> 📋 **Analogi:** kalau API adalah pelayan, endpoint adalah **satu baris menu**. `/connections` = "tolong daftar akun saya". `/publish` = "tolong posting video ini".

---

## Bagian 2 — Soal komunikasi

### Request & Response
- **Request** = permintaan yang **kamu kirim**. ("Tolong kasih daftar akun.")
- **Response** = jawaban yang **kamu terima**. ("Ini daftarnya: ...")

### HTTP & HTTPS
Aturan/bahasa baku yang dipakai program untuk saling kirim pesan lewat internet. **HTTPS** = versi aman (terenkripsi). **Selalu pakai HTTPS.**

### Verb / Method (GET, POST, DELETE)
Jenis "niat" dari sebuah request:
- **GET** = "tolong **ambilkan** data" (tidak mengubah apa pun). Contoh: lihat daftar akun.
- **POST** = "tolong **buat / kirim** sesuatu yang baru". Contoh: posting video.
- **DELETE** = "tolong **hapus** ini". Contoh: putuskan akun.

### JSON
Format teks untuk menyusun data dengan rapi, pakai pola `"nama": nilai`. Mudah dibaca manusia & mesin.

```json
{
  "nama": "Kampanye Sepatu",
  "platform": ["tiktok", "instagram"],
  "jumlahVideo": 5
}
```

### REST
Sebuah **gaya umum** membuat API yang memakai HTTP + endpoint + verb di atas. Saat orang bilang "REST API", maksudnya API yang rapi mengikuti pola ini.

---

## Bagian 3 — Soal keamanan & izin

### Secret / API Key
Kunci atau password **rahasia** milik aplikasimu untuk membuka layanan luar. **Tidak boleh bocor** — kalau bocor, orang lain bisa pakai atas namamu (dan kamu yang kena tagihan/blokir).

> 🔑 **Analogi:** seperti **kunci master toko**. Disimpan di brankas, tidak digantung di pintu.

### Token
"Tiket masuk" **sementara** yang diberikan platform **setelah** pengguna login & menyetujui. Berlaku terbatas, bisa dicabut.

> 🎫 **Analogi:** **kartu kamar hotel**. Bukan kunci master, cuma buka kamar tertentu, dan mati saat check-out.

### OAuth 2.0
Cara aman melakukan "Login dengan TikTok/Google/dll" **tanpa aplikasimu pernah tahu password asli** pengguna. Hasil akhirnya: sebuah **token**.

> 🏨 **Analogi:** kamu kasih KTP ke resepsionis (login di halaman resmi platform), lalu dapat kartu kamar (token). Aplikasimu tidak pernah pegang password aslimu.

### Client Secret
Salah satu jenis secret khusus untuk OAuth — bukti bahwa "aplikasi ini benar-benar aplikasimu". Inilah alasan utama OAuth **harus** dijalankan di server, bukan browser.

### Scope
Daftar **izin** yang kamu minta dari pengguna. Minta seperlunya.

> 🎫 Contoh scope: "boleh posting video", "boleh baca statistik". Mirip aplikasi HP minta izin "akses kamera" / "akses kontak".

### Environment Variable (`.env`)
Tempat menyimpan secret di server, **terpisah dari kode**, supaya saat kode dibagikan (misal ke GitHub) rahasianya tidak ikut bocor.

> 🗄️ **Analogi:** kode = resep masakan yang boleh dibagi. `.env` = brankas berisi kunci toko yang **tidak** ikut dibagikan.

---

## Bagian 4 — Soal proses di balik layar

### Webhook
Kebalikan dari request biasa. Biasanya **kamu** yang menelepon layanan luar. Webhook = **layanan luar yang menelepon balik** server kamu saat ada kabar.

> 📞 **Analogi:** kamu pesan makanan online. Daripada bolak-balik nanya "udah jadi belum?", aplikasi **mengirim notifikasi** saat pesanan siap. Notifikasi itu = webhook.

### Queue (Antrean) & Worker (Pekerja)
- **Queue** = daftar tugas yang menunggu dikerjakan.
- **Worker** = program yang mengambil tugas dari antrean dan mengerjakannya satu per satu di latar belakang.

> 🎫 **Analogi:** loket bank. Antrean = orang yang menunggu. Worker = teller yang melayani satu per satu.

### Rate Limit
Batasan **"berapa kali boleh"** dari platform dalam rentang waktu. Kalau kelewat batas, kamu diblokir sementara (error `429`).

> 🚦 **Analogi:** "maksimal 3 orang masuk per menit". Kalau memaksa lebih, satpam menahan dulu.

### Retry & Backoff
- **Retry** = mencoba ulang tugas yang gagal.
- **Backoff** = setiap percobaan ulang, **jeda waktunya makin lama** (1 detik, lalu 2, lalu 4...) supaya tidak makin membebani.

### Object Storage & CDN
- **Object Storage** = "gudang file" online untuk menyimpan file besar seperti video.
- **CDN** = jaringan server yang menyebarkan file itu ke banyak lokasi supaya **cepat diputar** di mana pun pengguna berada.

---

## Bagian 5 — Soal data

### Database
Tempat menyimpan data secara rapi dan permanen (siapa pengguna, akun mana yang tersambung, video apa yang sudah diposting).

> 🗂️ **Analogi:** lemari arsip raksasa yang terorganisir dan bisa dicari cepat.

### Enkripsi
Mengacak data supaya tidak terbaca kalau dicuri. Hanya bisa "dibuka" dengan kunci yang benar.

### KMS (Key Management Service)
Layanan khusus untuk menyimpan & mengelola kunci enkripsi dengan aman. Dipakai untuk melindungi token pengguna.

### Deploy
Proses **memindahkan** backend dari komputermu (`localhost`) ke server online supaya bisa diakses semua orang dari internet.

> 🚀 **Analogi:** dari masak di dapur rumah → buka restoran beneran yang bisa didatangi pelanggan.

---

## Bagian 6 — Singkatan yang akan sering muncul

| Singkatan | Kepanjangan | Arti singkat |
|---|---|---|
| **API** | Application Programming Interface | cara program ngobrol |
| **URL** | Uniform Resource Locator | "alamat" di internet |
| **JSON** | JavaScript Object Notation | format data rapi |
| **OAuth** | Open Authorization | cara login aman |
| **KMS** | Key Management Service | brankas kunci |
| **CDN** | Content Delivery Network | pengantar file cepat |
| **RBAC** | Role-Based Access Control | atur izin per peran pengguna |
| **SSE** | Server-Sent Events | server kirim update real-time |
| **LTS** | Long-Term Support | versi software paling stabil |
| **429** | (kode error HTTP) | "terlalu sering, coba lagi nanti" |
| **202** | (kode sukses HTTP) | "diterima, sedang diproses" |

---

[← Kembali ke daftar isi](./README.md) · [Lanjut ke Bab 01: Persiapan →](./01-persiapan-alat-dan-akun.md)
