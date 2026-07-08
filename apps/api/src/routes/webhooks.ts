// src/routes/webhooks.ts — telepon-balik dari platform (Bab 05 §5)
// Kerangka: tiap platform punya cara verifikasi tanda tangan berbeda —
// TAMBAHKAN verifikasi sebelum mempercayai payload begitu produksi nyata.
import { Router } from "express";

export const webhooksRouter = Router();

webhooksRouter.post("/webhooks/:platform", (req, res) => {
  // TODO: verifikasi tanda tangan sesuai platform sebelum memproses payload
  // (mis. Meta: X-Hub-Signature-256; TikTok: header tanda tangan khusus).
  console.log(`↩ Webhook ${req.params.platform} diterima (belum diproses — lihat Bab 05 §5)`);
  res.sendStatus(200);
});

// GET dipakai sebagian platform (mis. Meta) untuk verifikasi awal endpoint.
webhooksRouter.get("/webhooks/:platform", (req, res) => {
  const challenge = req.query["hub.challenge"];
  if (challenge) return res.send(String(challenge));
  res.sendStatus(200);
});
