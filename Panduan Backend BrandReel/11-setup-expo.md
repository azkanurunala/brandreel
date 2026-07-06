# Bab 11 — Setup Proyek Expo (iOS + Android + Web)

> Tujuan: membuat proyek aplikasi Expo dari nol dan **melihatnya jalan** di 3 tempat: HP (iOS/Android), dan browser (web). Setelah bab ini, kamu punya kerangka aplikasi yang siap diisi.

[← Bab 10: Overview](./10-frontend-react-native-lintas-platform.md) · [Daftar isi](./README.md) · [Bab 12: Responsive →](./12-responsive-adaptif.md)

---

## Bagian 1 — Alat tambahan yang dibutuhkan

Kamu sudah punya Node.js & VS Code dari [Bab 01](./01-persiapan-alat-dan-akun.md). Tambahan:

### 1.1 Aplikasi "Expo Go" di HP-mu
Untuk melihat aplikasi langsung di HP tanpa proses ribet:
- **iPhone:** unduh **Expo Go** di App Store.
- **Android:** unduh **Expo Go** di Play Store.

→ Info: <https://expo.dev/go>

### 1.2 (Opsional) Simulator/Emulator
Untuk menjalankan di HP "virtual" di komputer:
- **iOS Simulator** (hanya di Mac): butuh **Xcode** dari App Store. → <https://docs.expo.dev/workflow/ios-simulator/>
- **Android Emulator**: butuh **Android Studio**. → <https://docs.expo.dev/workflow/android-studio-emulator/>

> 💡 Untuk mulai belajar, **Expo Go di HP asli sudah cukup** — simulator bisa menyusul.

---

## Bagian 2 — Membuat proyek

Buka Terminal, keluar dulu dari folder backend kalau masih di sana (`cd ..`), lalu:

```bash
npx create-expo-app@latest brandreel-app
cd brandreel-app
```

**Penjelasan:**
- `npx create-expo-app@latest` → mengunduh & menjalankan pembuat proyek Expo terbaru.
- `brandreel-app` → nama folder aplikasi.
- Ini membuat proyek dengan **Expo Router** (sistem navigasi berbasis file — tiap file = satu layar).

→ Dokumentasi: <https://docs.expo.dev/get-started/create-a-project/>

---

## Bagian 3 — Menjalankan aplikasi

```bash
npx expo start
```

Akan muncul menu di Terminal + sebuah **QR code**. Cara membukanya:

| Ingin lihat di... | Caranya |
|---|---|
| 📱 **HP asli** | Buka **Expo Go**, scan QR code (Android) / scan pakai Kamera (iPhone) |
| 📱 **iOS Simulator** | Tekan huruf **`i`** di Terminal (butuh Xcode/Mac) |
| 📱 **Android Emulator** | Tekan huruf **`a`** (butuh Android Studio) |
| 💻 **Web browser** | Tekan huruf **`w`** — terbuka di browser otomatis |

> 🎉 Kalau tampilan awal muncul di HP **dan** di browser dari perintah yang sama — **itulah bukti "satu source code, semua platform" bekerja!**

### Setup web (kalau diminta)
Saat pertama menekan `w`, Expo mungkin minta memasang paket web:
```bash
npx expo install react-dom react-native-web @expo/metro-runtime
```
Jalankan itu lalu coba lagi.

→ Panduan web: <https://docs.expo.dev/workflow/web/>

---

## Bagian 4 — Memahami struktur folder

Proyek Expo Router kira-kira begini:

```
brandreel-app/
├── app/                  ← SEMUA LAYAR di sini (tiap file = 1 layar/route)
│   ├── _layout.tsx       ← kerangka navigasi utama
│   ├── index.tsx         ← layar pertama (beranda)
│   └── (tabs)/           ← grup layar dengan tab bar
├── components/           ← potongan UI yang dipakai ulang (tombol, kartu)
├── constants/            ← warna, ukuran, dll
├── assets/               ← gambar, font, ikon
├── package.json          ← daftar komponen & perintah
└── app.json              ← pengaturan aplikasi (nama, ikon, orientasi)
```

**Yang paling sering kamu sentuh:** folder `app/` (layar) dan `components/` (bagian UI).

→ Penjelasan Expo Router: <https://docs.expo.dev/router/introduction/>

---

## Bagian 5 — Mengizinkan semua orientasi (penting untuk tablet!)

Supaya iPad bisa portrait **dan** landscape, buka `app.json` dan pastikan:

```json
{
  "expo": {
    "orientation": "default"
  }
}
```

- `"default"` → mengikuti putaran perangkat (portrait & landscape dua-duanya).
- Jangan pakai `"portrait"` (mengunci hanya berdiri) kalau ingin landscape tablet.

→ Referensi: <https://docs.expo.dev/versions/latest/config/app/#orientation>

---

## Bagian 6 — Bahasa: TypeScript (disarankan)

Expo terbaru memakai **TypeScript** (file `.tsx`). Ini JavaScript + "penanda tipe" yang membantu mencegah kesalahan. Sebagai pemula kamu tidak perlu menguasainya dulu — cukup tahu file layar berakhiran `.tsx`.

→ <https://docs.expo.dev/guides/typescript/>

---

## Bagian 7 — Menyimpan ke Git

```bash
git init
git add .
git commit -m "Kerangka aplikasi Expo pertama"
```

`create-expo-app` sudah menyertakan `.gitignore` yang benar (mengabaikan `node_modules`, dll).

---

## Masalah umum

| Gejala | Solusi |
|---|---|
| QR code tidak terbaca / HP tak konek | Pastikan HP & komputer **satu jaringan WiFi**. Coba mode "Tunnel" di menu Expo. |
| Tekan `w` error soal react-dom | Jalankan `npx expo install react-dom react-native-web @expo/metro-runtime` |
| Tekan `i` gagal | Xcode belum terpasang (hanya bisa di Mac) — pakai Expo Go dulu |
| Perubahan tidak muncul | Simpan file; Expo auto-reload. Kalau macet, tekan `r` untuk reload |

---

## Checklist Bab 11

- [ ] Expo Go terpasang di HP
- [ ] Proyek `brandreel-app` dibuat
- [ ] `npx expo start` jalan
- [ ] Aplikasi muncul di **HP** (Expo Go)
- [ ] Aplikasi muncul di **web** (tekan `w`)
- [ ] `orientation` di `app.json` = `"default"` (untuk tablet)
- [ ] Kode tersimpan di Git

---

[← Bab 10: Overview](./10-frontend-react-native-lintas-platform.md) · [Daftar isi](./README.md) · [Bab 12: Responsive →](./12-responsive-adaptif.md)
