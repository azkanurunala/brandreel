# Bab 04 — Menghubungkan Akun (OAuth)

> Tujuan: membuat fitur **"Login dengan TikTok / Instagram / YouTube / dll"** menjadi nyata. Inilah bagian yang paling banyak istilah barunya — tapi kita pecah pelan-pelan.
>
> Ini bab tersulit. Kerjakan **satu platform dulu** (disarankan TikTok), pahami betul, baru ulangi untuk yang lain.

[← Bab 03: Kunci AI](./03-kunci-ai-claude-veo.md) · [Daftar isi](./README.md) · [Bab 05: Posting →](./05-posting-ke-platform.md)

---

## Bagian 1 — Memahami OAuth dengan analogi hotel

OAuth 2.0 adalah cara aman pengguna memberi izin aplikasimu **tanpa pernah memberikan password aslinya**.

Bayangkan check-in hotel:

| Langkah hotel | Langkah OAuth |
|---|---|
| 1. Kamu ke resepsionis: "mau check-in" | **START** — aplikasi mengarahkan ke halaman izin platform |
| 2. Kasih KTP, resepsionis verifikasi | **CONSENT** — pengguna login di halaman resmi platform & klik "Izinkan" |
| 3. Dapat **kartu kamar** (bukan kunci master) | **TOKEN** — platform memberi token: bukti boleh posting |
| 4. Kartu bisa dibatalkan kapan saja | token bisa dicabut, dan ada masa berlaku |

**Kunci pemahaman:** aplikasimu tidak pernah tahu password pengguna. Ia cuma pegang "kartu kamar" (token) yang izinnya terbatas.

→ Penjelasan resmi & netral: <https://oauth.net/2/>

---

## Bagian 2 — Alur teknis 3 langkah

Setiap platform memakai pola yang sama:

```
┌─────────┐   1. POST /auth/tiktok/start    ┌──────────────┐
│ FRONTEND│ ───────────────────────────────►│ SERVER KAMU  │
│         │◄── balas: "buka URL izin ini" ───│              │
└────┬────┘                                  └──────────────┘
     │ 2. pengguna dibuka ke halaman izin TikTok, klik "Izinkan"
     ▼
┌─────────┐
│ TIKTOK  │ 3. arahkan balik ke /auth/tiktok/callback?code=ABC
└────┬────┘
     ▼
┌──────────────┐  4. tukar "code" jadi "token" (pakai CLIENT SECRET)
│ SERVER KAMU  │  ─────────────────────────────────────────────► TikTok
│              │  5. simpan token di BRANKAS, tandai akun tersambung
└──────────────┘
```

### Kenapa harus di server?

Di langkah 4, penukaran **code → token** membutuhkan **Client Secret** (kunci rahasia aplikasimu). Kalau ini dilakukan di browser, secret bocor. Maka **wajib di server**. Inilah alasan paling mendasar kenapa backend ada.

### Dua istilah keamanan tambahan

- **`state`** — kode acak yang server buat di langkah 1 dan cek lagi di langkah 3, untuk memastikan jawaban yang datang benar-benar dari proses yang kamu mulai (mencegah penipuan).
- **PKCE** — lapisan keamanan tambahan (sepasang kode acak) yang diwajibkan beberapa platform seperti TikTok & X.

> Kamu tidak perlu paham detail matematisnya. Komponen OAuth siap-pakai mengurus ini. Yang penting: **jangan dihilangkan**.

---

## Bagian 3 — Membuat endpoint OAuth (contoh: TikTok)

### 3.1 Tambahkan secret platform ke `.env`

```
TIKTOK_CLIENT_KEY=xxxxxxxx
TIKTOK_CLIENT_SECRET=xxxxxxxx
```

### 3.2 Daftarkan Redirect URI di portal TikTok

Di portal developer TikTok, di pengaturan app, masukkan **Redirect URI**:
```
http://localhost:3000/auth/tiktok/callback
```
(Saat sudah online nanti, ganti dengan alamat server aslimu, misal `https://api.brandreel.com/auth/tiktok/callback`.)

> Platform **hanya** mau mengarahkan balik ke alamat yang sudah didaftarkan (allow-list). Kalau tidak cocok, error.

### 3.3 Endpoint START

```javascript
// 1. Mulai proses: kirim pengguna ke halaman izin TikTok
app.post("/auth/tiktok/start", (req, res) => {
  const state = Math.random().toString(36).slice(2); // kode acak anti-penipuan
  // (simpan `state` di sesi/database untuk dicek nanti)

  const consentUrl =
    "https://www.tiktok.com/v2/auth/authorize/" +
    "?client_key=" + process.env.TIKTOK_CLIENT_KEY +
    "&scope=video.publish,video.upload,user.info.basic" +
    "&response_type=code" +
    "&redirect_uri=http://localhost:3000/auth/tiktok/callback" +
    "&state=" + state;

  res.json({ consentUrl }); // frontend membuka URL ini
});
```

### 3.4 Endpoint CALLBACK (penukaran rahasia terjadi di sini)

```javascript
// 2. TikTok mengarahkan balik ke sini dengan "code"
app.get("/auth/tiktok/callback", async (req, res) => {
  const { code, state } = req.query; // ?code=...&state=...
  // (cek `state` cocok dengan yang disimpan di START)

  // Tukar code → token. SECRET dipakai DI SINI, di server.
  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "http://localhost:3000/auth/tiktok/callback",
    }),
  });

  const tokens = await response.json();
  // tokens = { access_token, refresh_token, expires_in, open_id, scope }
  // ►► SIMPAN ke brankas/database (Bab 07 & 08). JANGAN di-console.log!

  res.send("Akun TikTok berhasil terhubung! Bisa tutup halaman ini.");
});
```

**Penjelasan:**
- `req.query` → bagian setelah tanda `?` di URL (`?code=ABC&state=XYZ`).
- `grant_type: "authorization_code"` → memberi tahu TikTok "saya menukar kode menjadi token".
- Hasilnya berisi `access_token` (untuk posting), `refresh_token` (untuk perpanjang nanti), `expires_in` (berapa lama berlaku).

→ **Dokumentasi:**
> - TikTok Login Kit: <https://developers.tiktok.com/doc/login-kit-web/>
> - TikTok manage access token: <https://developers.tiktok.com/doc/oauth-user-access-token-management/>

---

## Bagian 4 — Token harus diperbarui otomatis (refresh)

Token punya masa berlaku (`expires_in`). Kalau habis, posting gagal.

**Solusi:** buat **penjadwal** yang:
1. Mengecek koneksi yang tokennya hampir habis.
2. Memakai `refresh_token` untuk minta token baru **sebelum** kedaluwarsa.
3. Kalau perpanjangan gagal, ubah status koneksi → `expiring` lalu `expired`.

> Ini persis yang ditampilkan prototype sebagai **"token refreshed 7d ahead"** dan status koneksi di layar Profile & Inbox. Pakai status `expiring` / `expired` yang sama supaya tampilan langsung cocok.

---

## Bagian 5 — Scope & dokumentasi tiap platform

**Scope** = daftar izin yang diminta. Minta seperlunya.

| Platform | Dokumentasi OAuth | Scope utama |
|---|---|---|
| **TikTok** | [Login Kit](https://developers.tiktok.com/doc/login-kit-web/) | `video.publish` `video.upload` `user.info.basic` `user.info.stats` |
| **Instagram** | [Content Publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing) | `instagram_basic` `instagram_content_publish` `pages_show_list` `business_management` |
| **YouTube** | [Authentication](https://developers.google.com/youtube/v3/guides/authentication) | `youtube.upload` `youtube.readonly` `yt-analytics.readonly` |
| **LinkedIn** | [Share API](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/share-api) | `w_member_social` `r_basicprofile` |
| **X** | [OAuth 2.0](https://developer.x.com/en/docs/authentication/oauth-2-0) | `tweet.write` `tweet.read` `users.read` `offline.access` |
| **Facebook** | [Pages API](https://developers.facebook.com/docs/pages-api/posts) | `pages_manage_posts` `pages_read_engagement` |

### Catatan penting per platform

- **TikTok** — app yang belum lolos review hanya bisa posting **private**.
- **Instagram** — wajib akun **Business/Creator** terhubung ke **Facebook Page**; wajib App Review.
- **YouTube** — perlu verifikasi "sensitive scope".
- **X** — fitur posting butuh **tier API berbayar**.
- **Facebook** — posting pakai **Page access token**, bukan token pengguna.

> ⚠️ Dokumentasi & aturan platform **sering berubah**. Selalu cek versi terbaru saat mengerjakan.

---

## Checklist Bab 04

- [ ] Paham analogi 3 langkah (start → consent → callback)
- [ ] Mengerti kenapa penukaran token wajib di server
- [ ] Redirect URI didaftarkan di portal platform
- [ ] Endpoint `/auth/tiktok/start` & `/auth/tiktok/callback` jalan
- [ ] Token tersimpan di brankas (bukan di-log)
- [ ] Penjadwal refresh token direncanakan
- [ ] Status `expiring`/`expired` dipakai sesuai prototype

---

[← Bab 03: Kunci AI](./03-kunci-ai-claude-veo.md) · [Daftar isi](./README.md) · [Bab 05: Posting →](./05-posting-ke-platform.md)
