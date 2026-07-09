// src/routes/generate.ts — proxy AI Claude (Bab 03)
// Kunci hanya di server. Frontend memanggil endpoint ini, bukan Claude langsung.
import { Router } from "express";
import { z } from "zod";
import { env } from "../env.js";
import { requireAuth } from "../middleware/auth.js";

export const generateRouter = Router();

const bodySchema = z.object({
  prompt: z.string().min(1),
  maxTokens: z.number().int().positive().max(4096).optional(),
});

// requireAuth — proxy Claude nyata (biaya per token), jangan biarkan
// dipanggil tanpa login (bisa dipakai orang lain buat habisin kuota API).
generateRouter.post("/generate", requireAuth, async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "prompt wajib diisi" });
  if (!env.ANTHROPIC_API_KEY)
    return res.status(501).json({ error: "ANTHROPIC_API_KEY belum diisi (lihat Bab 15)" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL,
        max_tokens: parsed.data.maxTokens ?? 1024,
        messages: [{ role: "user", content: parsed.data.prompt }],
      }),
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: "Gagal memanggil Claude" });
  }
});
