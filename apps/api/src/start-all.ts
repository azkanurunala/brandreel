// src/start-all.ts — jalankan API + worker dalam SATU proses/service.
// Dipakai saat slot service Render terbatas (free tier) — daripada deploy
// worker sebagai service terpisah, keduanya jalan bareng di sini. Kalau
// nanti sudah ada slot/budget lagi, pisah lagi ke service "worker" sendiri
// (render.yaml sudah siap) dan start command API balik ke `npm run start`.
import "./index.js";
import "./worker.js";
