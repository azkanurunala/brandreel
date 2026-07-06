# Starter Mobile — potongan inti Expo

Potongan kode inti untuk aplikasi Expo (Bab 18). **Bukan** proyek Expo lengkap — ini komponen kunci yang disalin ke dalam proyek `brandreel-app` (dibuat dengan `npx create-expo-app`, lihat [Bab 11](../11-setup-expo.md)).

## Cara pakai

1. Buat proyek Expo: `npx create-expo-app brandreel-app` (Bab 11).
2. Salin folder ini ke dalamnya:
   - `hooks/useBreakpoint.ts`
   - `components/AppShell.tsx`
   - `lib/api.ts`
   - `constants/api.ts`
3. Buat `.env` dari `contoh-env/frontend.env.example` → isi `EXPO_PUBLIC_API_URL`.
4. Bungkus layar-layarmu dengan `<AppShell>`:

```tsx
import { useState } from "react";
import { AppShell } from "./components/AppShell";

export default function App() {
  const [tab, setTab] = useState("home");
  return (
    <AppShell active={tab} onNavigate={setTab}>
      {/* render layar sesuai `tab` */}
    </AppShell>
  );
}
```

## Isi

| File | Fungsi | Bab |
|---|---|---|
| `hooks/useBreakpoint.ts` | tentukan kelas layar (mobile/tablet portrait/landscape/desktop) + jumlah kolom grid | 12 |
| `components/AppShell.tsx` | navigasi **adaptif**: tab bar bawah ↔ sidebar kiri | 12 |
| `lib/api.ts` | pemanggil API (`apiGet/apiPost/apiDelete`) | 13 |
| `constants/api.ts` | alamat backend dari `EXPO_PUBLIC_API_URL` | 13 |

Ini menutup dua hal tersulit lintas platform (responsif + adaptif) sehingga sisanya tinggal membangun tiap layar meniru prototype.
