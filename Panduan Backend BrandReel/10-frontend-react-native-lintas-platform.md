# Bab 10 — Frontend Lintas Platform (React Native + Expo)

> Tujuan: memahami **strategi besar** membuat SATU source code yang jalan di iOS, Android, dan web — dengan tampilan yang menyesuaikan mobile, tablet portrait, tablet landscape, dan desktop.
>
> Bab ini konsep dulu (tanpa banyak kode). Praktiknya di [Bab 11](./11-setup-expo.md) & [Bab 12](./12-responsive-adaptif.md).

[← Bab 09: Rollout](./09-rollout-dan-deploy.md) · [Daftar isi](./README.md) · [Bab 11: Setup Expo →](./11-setup-expo.md)

---

## Bagian 1 — "Satu source code untuk semua" itu apa?

Kamu ingin **menulis kode sekali**, lalu aplikasi yang sama berjalan di:

| Target | Bentuk |
|---|---|
| 📱 **iOS** | aplikasi di iPhone (App Store) |
| 📱 **Android** | aplikasi di HP Android (Play Store) |
| 📲 **iPad / Tablet** | aplikasi tablet — 2 orientasi: **portrait** (berdiri) & **landscape** (tidur) |
| 💻 **Web desktop** | dibuka di browser komputer |
| 📱 **Web mobile** | dibuka di browser HP |
| 📲 **Web tablet** | dibuka di browser tablet |

**Kunci untuk mencapai ini: React Native + Expo.**

- **React Native** = menulis aplikasi HP (iOS & Android) memakai React (bahasa yang sama dengan web).
- **Expo** = "paket lengkap" di atas React Native yang membuat semuanya jauh lebih mudah — termasuk **menjalankan yang sama di web** lewat teknologi bernama **react-native-web**.

```
              ┌──────────────────────────────┐
              │   SATU SOURCE CODE (Expo)     │
              └──────────────┬───────────────┘
        ┌──────────┬─────────┼─────────┬──────────┐
        ▼          ▼         ▼         ▼          ▼
      iOS      Android     iPad      Web       Web
     (HP)       (HP)     (tablet)  desktop    mobile
```

→ Situs resmi Expo: <https://docs.expo.dev/>
→ React Native: <https://reactnative.dev/>
→ react-native-web (yang bikin bisa jalan di web): <https://necolas.github.io/react-native-web/>

---

## Bagian 2 — Kenapa Expo, bukan yang lain?

| Pilihan | Bisa iOS+Android? | Bisa Web? | Ramah pemula? |
|---|---|---|---|
| **Expo (React Native)** ✅ | Ya | **Ya** (bawaan) | **Paling mudah** |
| React Native "telanjang" | Ya | Perlu setup rumit | Sulit |
| Flutter | Ya | Ya | Bahasa beda (Dart) |
| Native (Swift/Kotlin) | Terpisah 2x kerja | Tidak | Sulit |

Expo dipilih karena: satu perintah untuk jalan di semua platform, update mudah, dan **web sudah termasuk** tanpa kerja ekstra besar.

> ⚠️ **Catatan penting:** prototype BrandReel yang sekarang ditulis dalam **HTML** (bukan React Native). Artinya frontend akan **dibangun ulang** sebagai aplikasi Expo, dengan **tampilan & alur yang sama persis** seperti prototype sebagai acuan. Prototype berfungsi sebagai "cetak biru" visual dan daftar layar. Ini pekerjaan yang akan dilakukan Claude Code (lihat [Bab 14](./14-handoff-claude-code.md)).

---

## Bagian 3 — Dua istilah penting: Responsive vs Adaptive

Kamu menyebut "semua responsive dengan satu source code". Ada dua teknik yang dipakai bersama:

### Responsive (menyesuaikan ukuran)
Tata letak **melar/mengkerut** mengikuti lebar layar. Contoh: kartu yang di HP 1 kolom, di tablet jadi 2 kolom, di desktop jadi 3 kolom.

### Adaptive (mengganti tata letak)
Pada ukuran tertentu, tampilan **berganti bentuk**, bukan sekadar melar. Contoh: menu di HP berupa **tab bar di bawah**, tapi di desktop berupa **sidebar di kiri**.

> 🎯 BrandReel butuh **keduanya**. Detail aturannya di [Bab 12](./12-responsive-adaptif.md).

---

## Bagian 4 — Empat "kelas" tampilan yang kamu minta

Kita definisikan 4 rentang lebar layar (breakpoint). Angka ini standar & bisa disesuaikan:

| Kelas | Lebar layar | Contoh perangkat | Tata letak inti |
|---|---|---|---|
| **Mobile** | < 600px | HP (iOS/Android), web mobile | 1 kolom, tab bar bawah |
| **Tablet Portrait** | 600–899px | iPad berdiri, web tablet | 2 kolom, tab bar / rail |
| **Tablet Landscape** | 900–1279px | iPad tidur | 2–3 kolom, sidebar muncul |
| **Desktop** | ≥ 1280px | web di komputer | sidebar tetap + konten lebar |

**Penting soal orientasi tablet:** iPad portrait vs landscape dibedakan **bukan** dari jenis perangkat, tapi dari **lebar layar saat itu**. Saat iPad diputar, lebarnya berubah → tampilan otomatis ganti kelas. Inilah kenapa "portrait" dan "landscape" tertangani otomatis dengan satu aturan lebar.

---

## Bagian 5 — Gambaran alur kerja keseluruhan

```
1. Backend (Bab 02–09)  ── sudah/akan jadi ──►  menyediakan API
                                                     │
2. Frontend Expo (Bab 11–13) ── memanggil API ─────┘
   • satu source code
   • responsive + adaptive (Bab 12)
   • jalan di iOS/Android/Web (Bab 11)

3. Handoff ke Claude Code (Bab 14)
   • kamu tempel "brief" lengkap
   • Claude Code membangun kode penuh
   • kamu isi kunci & jalankan
```

---

## Checklist Bab 10

- [ ] Paham bahwa **Expo** = satu source code untuk iOS/Android/Web
- [ ] Paham beda **responsive** (melar) vs **adaptive** (ganti bentuk)
- [ ] Hafal 4 kelas tampilan (mobile / tablet portrait / tablet landscape / desktop)
- [ ] Paham orientasi tablet ditentukan oleh **lebar layar**, bukan jenis perangkat
- [ ] Sadar frontend akan **dibangun ulang** di Expo, dengan prototype sebagai acuan visual

---

[← Bab 09: Rollout](./09-rollout-dan-deploy.md) · [Daftar isi](./README.md) · [Bab 11: Setup Expo →](./11-setup-expo.md)
