# Bab 12 — Responsive & Adaptif (4 Tampilan)

> Tujuan: membuat aplikasi **otomatis menyesuaikan** bentuknya untuk mobile, tablet portrait, tablet landscape, dan desktop — dengan **satu source code**. Ini jantung permintaanmu.

[← Bab 11: Setup Expo](./11-setup-expo.md) · [Daftar isi](./README.md) · [Bab 13: Sambung Backend →](./13-sambung-frontend-backend.md)

---

## Bagian 1 — Cara aplikasi "tahu" ukuran layar

React Native punya alat bawaan bernama **`useWindowDimensions`** — ia memberi tahu **lebar & tinggi layar saat ini**, dan **otomatis update** saat perangkat diputar atau jendela browser diubah ukurannya.

```tsx
import { useWindowDimensions } from "react-native";

function ContohLayar() {
  const { width } = useWindowDimensions(); // lebar layar sekarang
  // 'width' berubah otomatis saat iPad diputar atau browser di-resize
}
```

> 🔑 **Inilah rahasianya:** karena `width` update otomatis, saat iPad diputar dari portrait ke landscape, lebarnya berubah → aplikasi langsung ganti tampilan **tanpa kode tambahan**.

→ Dokumentasi: <https://reactnative.dev/docs/usewindowdimensions>

---

## Bagian 2 — Menentukan "kelas" tampilan (breakpoints)

Kita buat satu fungsi kecil yang mengubah angka lebar menjadi nama kelas. Simpan sebagai file `hooks/useBreakpoint.ts`:

```tsx
import { useWindowDimensions } from "react-native";

export type Breakpoint = "mobile" | "tabletPortrait" | "tabletLandscape" | "desktop";

export function useBreakpoint(): Breakpoint {
  const { width } = useWindowDimensions();
  if (width < 600) return "mobile";
  if (width < 900) return "tabletPortrait";
  if (width < 1280) return "tabletLandscape";
  return "desktop";
}
```

Sekarang layar mana pun bisa bertanya "saya sedang di kelas apa?" lalu menyesuaikan diri:

```tsx
const bp = useBreakpoint();
const jumlahKolom = bp === "mobile" ? 1 : bp === "desktop" ? 3 : 2;
```

---

## Bagian 3 — Aturan tata letak per kelas (untuk BrandReel)

Ini "peta" bagaimana tiap kelas tampil. Gunakan sebagai standar.

| Elemen | Mobile | Tablet Portrait | Tablet Landscape | Desktop |
|---|---|---|---|---|
| **Navigasi** | Tab bar bawah | Tab bar bawah / rail kiri | **Sidebar kiri** | **Sidebar kiri (tetap)** |
| **Grid kartu** | 1 kolom | 2 kolom | 2–3 kolom | 3–4 kolom |
| **Lebar konten** | penuh | penuh | maks + margin | maks 1200px, di tengah |
| **Detail + daftar** | 1 layar penuh (tumpuk) | tumpuk | **berdampingan (master-detail)** | berdampingan |
| **Modal/dialog** | layar penuh (sheet) | tengah | tengah | tengah |
| **Font & jarak** | kecil-sedang | sedang | sedang-besar | besar |

> **Master-detail** = daftar di kiri + detailnya di kanan dalam satu layar (khas tablet/desktop). Di HP, keduanya jadi dua layar terpisah.

---

## Bagian 4 — Responsive: grid yang melar

Contoh grid kartu campaign yang otomatis mengubah jumlah kolom:

```tsx
import { View, useWindowDimensions } from "react-native";

function CampaignGrid({ items }) {
  const { width } = useWindowDimensions();
  const kolom = width < 600 ? 1 : width < 900 ? 2 : width < 1280 ? 3 : 4;
  const lebarKartu = `${100 / kolom}%`;

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {items.map((item) => (
        <View key={item.id} style={{ width: lebarKartu, padding: 8 }}>
          {/* isi kartu */}
        </View>
      ))}
    </View>
  );
}
```

**Penjelasan:**
- `flexDirection: "row"` + `flexWrap: "wrap"` → kartu berjajar ke samping, lalu turun baris saat penuh.
- `lebarKartu` dihitung dari jumlah kolom → otomatis melar/mengkerut.

---

## Bagian 5 — Adaptif: mengganti navigasi

Contoh: navigasi **berganti bentuk** antara tab bar (mobile) dan sidebar (desktop).

```tsx
function AppShell({ children }) {
  const bp = useBreakpoint();
  const pakaiSidebar = bp === "tabletLandscape" || bp === "desktop";

  if (pakaiSidebar) {
    return (
      <View style={{ flexDirection: "row", flex: 1 }}>
        <Sidebar />          {/* menu kiri */}
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{children}</View>
      <BottomTabBar />       {/* menu bawah */}
    </View>
  );
}
```

> Ini contoh **adaptive**: bukan sekadar melar, tapi **struktur berubah** tergantung kelas layar.

---

## Bagian 6 — Hal khusus yang WAJIB diperhatikan

### 6.1 Safe Area (poni & sudut layar HP)
HP modern punya "poni" (notch) & sudut membulat. Bungkus aplikasi dengan **SafeAreaView** supaya konten tidak tertutup.
→ <https://docs.expo.dev/versions/latest/sdk/safe-area-context/>

### 6.2 Keyboard tidak menutupi input
Saat mengetik, keyboard bisa menutupi kolom isian. Pakai **KeyboardAvoidingView**.
→ <https://reactnative.dev/docs/keyboardavoidingview>

### 6.3 Sentuhan minimal 44px
Tombol/target sentuh minimal **44×44px** supaya mudah ditekan jari (standar aksesibilitas).

### 6.4 Video vertikal (9:16)
Layar preview & feed BrandReel banyak memakai video **9:16**. Pastikan pemutar video menjaga rasio ini di semua ukuran (lihat komponen video Expo: <https://docs.expo.dev/versions/latest/sdk/video/>).

### 6.5 Uji dengan memutar & me-resize
- Di HP/iPad: putar perangkat → tampilan harus ganti mulus.
- Di web: seret ubah ukuran jendela browser → tampilan harus ikut berubah.

---

## Bagian 7 — Pola "tulis sekali, jalan di mana saja" untuk kode khusus platform

Kadang ada beda kecil antar platform. React Native menyediakan `Platform`:

```tsx
import { Platform } from "react-native";

const bayangan = Platform.select({
  ios: { shadowOpacity: 0.1, shadowRadius: 8 },
  android: { elevation: 4 },
  web: { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
});
```

Atau file khusus: `Komponen.ios.tsx`, `Komponen.android.tsx`, `Komponen.web.tsx` — Expo otomatis memilih yang cocok.
→ <https://reactnative.dev/docs/platform-specific-code>

---

## Checklist Bab 12

- [ ] `useWindowDimensions` dipakai untuk membaca lebar layar
- [ ] Fungsi `useBreakpoint` dibuat (4 kelas)
- [ ] Grid melar sesuai jumlah kolom per kelas
- [ ] Navigasi adaptif (tab bar ↔ sidebar)
- [ ] SafeArea & KeyboardAvoiding dipasang
- [ ] Target sentuh ≥ 44px
- [ ] Diuji dengan memutar perangkat & resize browser

---

[← Bab 11: Setup Expo](./11-setup-expo.md) · [Daftar isi](./README.md) · [Bab 13: Sambung Backend →](./13-sambung-frontend-backend.md)
