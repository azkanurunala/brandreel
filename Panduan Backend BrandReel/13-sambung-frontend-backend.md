# Bab 13 — Menyambungkan Frontend ke Backend

> Tujuan: menghubungkan aplikasi Expo (Bab 10–12) ke backend (Bab 02–09). **Stack backend final: Node/TypeScript + Prisma + Neon → Render.**

[← Bab 12: Responsive](./12-responsive-adaptif.md) · [Daftar isi](./README.md) · [Bab 14: Handoff Claude Code →](./14-handoff-claude-code.md)

---

## Bagian 1 — Stack final (keputusan A)

| Lapisan | Teknologi | Kenapa |
|---|---|---|
| **Frontend** | Expo (React Native + Web), TypeScript | satu source code, semua platform |
| **Backend** | Node + TypeScript (Express) | **bahasa sama** dengan frontend |
| **Database** | **Neon** (PostgreSQL cloud) | free tier bagus, cepat |
| **ORM** | **Prisma** | menulis model data dengan mudah |
| **Antrean/Cron** | BullMQ + Redis (Render) / cron Render | pipeline posting & insights |
| **Deploy** | **Render** (web service + worker + cron) | worker persisten, free tier |

→ Neon: <https://neon.tech/docs> · Prisma: <https://www.prisma.io/docs> · Render: <https://render.com/docs>

> Satu bahasa (TypeScript) dari frontend sampai backend = jauh lebih mudah dipelihara pemula.

---

## Bagian 2 — Alamat backend disimpan di satu tempat

Di proyek Expo, buat `constants/api.ts`:

```tsx
export const API_BASE =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
```

Lalu di file `.env` proyek Expo:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```
Saat backend sudah online (Render), ganti jadi `https://brandreel-backend.onrender.com`.

> Variabel Expo yang boleh dibaca frontend **harus** diawali `EXPO_PUBLIC_`. Jangan taruh secret di sini — secret tetap di backend (Bab 08).

---

## Bagian 3 — Fungsi pemanggil API

Buat `lib/api.ts` — satu tempat untuk semua panggilan:

```tsx
import { API_BASE } from "../constants/api";

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`GET ${path} gagal: ${res.status}`);
  return res.json();
}

export async function apiPost(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} gagal: ${res.status}`);
  return res.json();
}
```

`credentials: "include"` → mengirim cookie sesi login (agar backend tahu siapa penggunanya).

---

## Bagian 4 — Contoh memakai di layar

```tsx
import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

function InsightsScreen() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiGet("/insights?range=7d").then(setData).catch(console.error);
  }, []);

  if (!data) return <LoadingSpinner />;
  return <InsightsView data={data} />;
}
```

> 💡 Untuk aplikasi nyata, disarankan pakai **TanStack Query** (<https://tanstack.com/query>) — ia mengurus loading, error, cache, dan polling status posting (Bab 05) secara otomatis.

---

## Bagian 5 — CORS (izin browser web memanggil backend)

Saat frontend web memanggil backend beda alamat, browser butuh izin **CORS** dari backend. Di backend Express:

```bash
npm install cors
```
```javascript
const cors = require("cors");
app.use(cors({
  origin: ["http://localhost:8081", "https://app.brandreel.com"], // alamat frontend
  credentials: true,
}));
```
(Untuk iOS/Android asli, CORS tidak berlaku — ini khusus web.)
→ <https://expressjs.com/en/resources/middleware/cors.html>

---

## Bagian 6 — Alur OAuth dari aplikasi HP

Di HP, membuka halaman izin platform pakai **expo-web-browser**, dan menangkap balikan pakai **expo-linking** (deep link). Ini mengganti "redirect callback" versi web.
→ <https://docs.expo.dev/guides/authentication/> · <https://docs.expo.dev/versions/latest/sdk/webbrowser/>

Backend tetap yang menukar code→token (Bab 04). Aplikasi HP hanya membuka halaman izin & menerima sinyal "berhasil".

---

## Checklist Bab 13

- [ ] `API_BASE` disimpan di satu tempat + `.env` Expo
- [ ] `lib/api.ts` (apiGet/apiPost) dibuat
- [ ] Layar memanggil API nyata, bukan data palsu
- [ ] CORS diaktifkan di backend untuk web
- [ ] Alur OAuth HP pakai expo-web-browser + expo-linking
- [ ] (Opsional) TanStack Query untuk loading/cache/polling

---

[← Bab 12: Responsive](./12-responsive-adaptif.md) · [Daftar isi](./README.md) · [Bab 14: Handoff Claude Code →](./14-handoff-claude-code.md)
