# Bab 08 — Keamanan

> Tujuan: aturan yang **TIDAK boleh dilanggar**. Ini bukan saran — melanggarnya bisa membuat kunci & akun pengguna dicuri, dan kamu bisa kena tagihan atau diblokir platform. Baca pelan-pelan.

[← Bab 07: API & Database](./07-api-endpoint-dan-database.md) · [Daftar isi](./README.md) · [Bab 09: Rollout →](./09-rollout-dan-deploy.md)

---

## Aturan 1 — Secret HANYA di server

**Jangan pernah** menaruh kunci rahasia (`ANTHROPIC_API_KEY`, `*_CLIENT_SECRET`, dll) di:
- kode frontend (browser),
- repositori GitHub (gunakan `.gitignore` untuk `.env`),
- pesan chat, screenshot, atau dokumen yang dibagikan.

> 🔑 Kalau secret pernah ter-upload ke GitHub walau sebentar, anggap **sudah bocor** — segera buat ulang (regenerate) yang baru di portal platform.

---

## Aturan 2 — Token dienkripsi & tidak pernah di-log

- Token pengguna **dienkripsi saat disimpan** (at rest), memakai layanan **KMS** (Key Management Service).
- Di database, simpan hanya **`tokenRef`** (petunjuk ke brankas), bukan token mentah.
- **JANGAN** pernah `console.log(token)` atau menulis token ke file log. Log sering tersimpan & terbaca banyak orang.

**Layanan brankas/KMS:**
| Layanan | Dokumentasi |
|---|---|
| AWS KMS | <https://docs.aws.amazon.com/kms/> |
| Google Cloud KMS | <https://cloud.google.com/kms/docs> |
| HashiCorp Vault | <https://developer.hashicorp.com/vault/docs> |

---

## Aturan 3 — Semua Redirect URI di-allow-list

Di portal tiap platform, daftarkan **persis** alamat callback yang dipakai:
```
http://localhost:3000/auth/tiktok/callback   (saat di komputer)
https://api.brandreel.com/auth/tiktok/callback   (saat online)
```
Platform hanya mau mengarahkan balik ke alamat terdaftar. Ini mencegah penyerang membajak alur login.

---

## Aturan 4 — Patuhi aturan data tiap platform

Tiap platform punya kebijakan:
- **Berapa lama** kamu boleh menyimpan metrik/statistik.
- **Kapan harus menghapus** data jika pengguna mencabut izin.
- Apa yang **boleh & tidak boleh** ditampilkan.

Patuhi, karena pelanggaran bisa membuat akun developer-mu dicabut. Cek "Platform Policy" / "Developer Terms" tiap layanan.

---

## Daftar lengkap secret (environment variables)

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
TOKEN_VAULT_KMS_KEY      # kunci untuk enkripsi token
OBJECT_STORE_BUCKET      # nama gudang file
CDN_BASE_URL             # alamat pengantar file cepat
SESSION_SIGNING_KEY      # kunci untuk mengamankan sesi login pengguna
```

---

## Praktik baik tambahan (bonus, sangat disarankan)

| Praktik | Kenapa |
|---|---|
| **Selalu HTTPS** | Data terenkripsi saat lewat internet. Jangan pakai HTTP biasa di produksi. |
| **Validasi input** | Jangan percaya data dari frontend mentah-mentah; cek dulu (panjang caption, format, dll). |
| **Rate limit di API-mu sendiri** | Cegah penyalahgunaan endpoint-mu. |
| **Prinsip hak minimum** | Minta scope seperlunya saja; beri akses pengguna sesuai perannya (RBAC). |
| **Putar (rotate) secret berkala** | Ganti kunci secara periodik, terutama jika ada kecurigaan bocor. |
| **Backup database** | Supaya data tidak hilang permanen. |
| **Pantau error** | Pakai alat seperti Sentry (<https://docs.sentry.io/>) untuk tahu kalau ada yang rusak. |

---

## Checklist Bab 08

- [ ] Tidak ada satu pun secret di frontend / GitHub
- [ ] `.env` ada di `.gitignore`
- [ ] Token dienkripsi (KMS) & tidak pernah di-log
- [ ] Database hanya simpan `tokenRef`
- [ ] Semua Redirect URI didaftarkan
- [ ] Kebijakan data tiap platform dipatuhi
- [ ] HTTPS dipakai di produksi
- [ ] Input dari frontend divalidasi

---

[← Bab 07: API & Database](./07-api-endpoint-dan-database.md) · [Daftar isi](./README.md) · [Bab 09: Rollout →](./09-rollout-dan-deploy.md)
