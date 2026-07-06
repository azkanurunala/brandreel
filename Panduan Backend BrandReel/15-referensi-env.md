# Bab 15 — Referensi Lengkap `.env` (Semua Placeholder)

> Tujuan: satu tempat berisi **semua kunci/secret** yang dibutuhkan, dari mana mengambilnya, dan mana yang wajib vs opsional. File contoh siap-salin ada di folder [`contoh-env/`](./contoh-env/).

[← Bab 14: Handoff Claude Code](./14-handoff-claude-code.md) · [Daftar isi](./README.md)

---

## File yang tersedia

| File | Untuk | Salin menjadi |
|---|---|---|
| [`contoh-env/backend.env.example`](./contoh-env/backend.env.example) | Backend (Node/Express) | `.env` di folder backend |
| [`contoh-env/frontend.env.example`](./contoh-env/frontend.env.example) | Aplikasi Expo | `.env` di folder `brandreel-app` |

> ⚠️ Setelah menyalin & mengisi, **jangan** commit file `.env` ke Git. Pastikan `.env` ada di `.gitignore` ([Bab 08](./08-keamanan.md)). Saat deploy, isi nilainya di **dashboard Render**, bukan mengunggah file.

---

## Aturan emas frontend vs backend

| | Frontend (Expo) | Backend (Node) |
|---|---|---|
| Boleh menyimpan **secret**? | ❌ **TIDAK PERNAH** | ✅ Ya (aman di server) |
| Awalan variabel | wajib `EXPO_PUBLIC_` | bebas |
| Isinya apa? | hanya **alamat** backend & flag | semua kunci API, client secret, DB |

**Kenapa?** Apa pun di frontend bisa diintip pengguna. Maka frontend cukup tahu "alamat backend"; semua rahasia hidup di backend.

---

## Checklist isian BACKEND — dari mana ambilnya

### Wajib untuk mulai (Fase 1–3)
- [ ] `DATABASE_URL` & `DIRECT_URL` → dashboard **Neon** > Connection string. `DATABASE_URL` pakai yang **Pooled**, `DIRECT_URL` pakai yang langsung. → <https://neon.tech/docs/connect/connect-from-any-app>
- [ ] `SESSION_SIGNING_KEY` & `TOKEN_ENCRYPTION_KEY` → buat sendiri, teks acak panjang. Jalankan: `openssl rand -base64 48`
- [ ] `ANTHROPIC_API_KEY` → <https://console.anthropic.com> (aktifkan billing/saldo)
- [ ] `GEMINI_API_KEY` (untuk Veo) → <https://aistudio.google.com/apikey>
- [ ] `PORT`, `APP_BASE_URL`, `WEB_APP_URL`, `NODE_ENV` → isi sesuai contoh

### Wajib untuk fitur posting & insights (Fase 5–6)
- [ ] `REDIS_URL` → lokal (`redis://localhost:6379`), atau **Upstash** gratis (<https://upstash.com>), atau Redis di **Render**
- [ ] `STORAGE_*` & `CDN_BASE_URL` → **Cloudflare R2** (<https://developers.cloudflare.com/r2/>) atau **AWS S3** (<https://docs.aws.amazon.com/s3/>)

### Per platform (isi hanya yang sudah didaftarkan — [Bab 01](./01-persiapan-alat-dan-akun.md))
- [ ] `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` → <https://developers.tiktok.com>
- [ ] `META_APP_ID` / `META_APP_SECRET` (Instagram + Facebook) → <https://developers.facebook.com>
- [ ] `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (YouTube) → <https://console.cloud.google.com>
- [ ] `LINKEDIN_CLIENT_ID` / `LINKEDIN_CLIENT_SECRET` → <https://www.linkedin.com/developers>
- [ ] `X_CLIENT_ID` / `X_CLIENT_SECRET` (posting perlu tier berbayar) → <https://developer.x.com>

### Opsional
- [ ] `GOOGLE_PROJECT_ID` / `GOOGLE_APPLICATION_CREDENTIALS` → hanya jika Veo lewat Vertex AI
- [ ] `META_WEBHOOK_VERIFY_TOKEN` → teks bebas buatan sendiri, dicocokkan di portal Meta
- [ ] `SENTRY_DSN` → <https://sentry.io> untuk pantau error

---

## Checklist isian FRONTEND

- [ ] `EXPO_PUBLIC_API_URL` → alamat backend (`http://localhost:3000` saat lokal; URL Render saat online)
- [ ] `EXPO_PUBLIC_APP_SCHEME` → samakan dengan `scheme` di `app.json` (mis. `brandreel`) — untuk balikan OAuth di HP
- [ ] `EXPO_PUBLIC_SENTRY_DSN` *(opsional)*
- [ ] `EXPO_PUBLIC_ENV` *(opsional)*

---

## Redirect URI yang harus didaftarkan di tiap portal

Untuk tiap platform, daftarkan **dua** alamat (lokal + online). Ganti `<platform>` dengan `tiktok`, `instagram`, `youtube`, dst:

```
http://localhost:3000/auth/<platform>/callback
https://NAMA-BACKEND.onrender.com/auth/<platform>/callback
```

> Platform hanya mau mengarahkan balik ke alamat yang **persis** terdaftar. Salah satu huruf saja → error.

---

## Urutan mengisi (biar tidak kewalahan)

1. **Sekarang:** Neon (`DATABASE_URL`, `DIRECT_URL`) + dua kunci acak + `ANTHROPIC_API_KEY` + `GEMINI_API_KEY`. Cukup untuk Fase 1–3.
2. **Saat fitur posting:** `REDIS_URL` + `STORAGE_*` + `TIKTOK_*` (platform pertama).
3. **Menyusul:** platform lain begitu review-nya lolos.

---

## Peringatan keamanan (ulang, karena penting)

- 🔒 Kalau satu secret pernah ter-commit ke Git/GitHub → anggap **bocor**, langsung **regenerate** di portal.
- 🔒 Frontend **tidak boleh** memuat secret apa pun.
- 🔒 Saat deploy: isi env di **dashboard Render**, jangan unggah file `.env`.

---

[← Bab 14: Handoff Claude Code](./14-handoff-claude-code.md) · [Daftar isi](./README.md)
