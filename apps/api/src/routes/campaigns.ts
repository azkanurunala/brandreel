// src/routes/campaigns.ts — CRUD campaign dasar (Bab 07)
// Semua route di sini butuh sesi login (requireAuth) dan discope ke
// req.accountId — satu akun cuma bisa lihat/ubah campaign miliknya sendiri.
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { callClaude, parseModelJSON } from "../lib/anthropic.js";
import { HOOK_BRIEF, platformRule } from "../lib/hooks.js";
import { requireAuth } from "../middleware/auth.js";

type HookKey = "h1" | "h2" | "h3" | "h4" | "h5";
const HOOK_KEYS: HookKey[] = ["h1", "h2", "h3", "h4", "h5"];

export const campaignsRouter = Router();

// NB: requireAuth dipasang PER RUTE (bukan campaignsRouter.use(requireAuth))
// — semua router di app ini di-mount di root ("/"), jadi router.use() tanpa
// path akan mencegat SEMUA request yang lewat titik itu di middleware chain
// app, termasuk rute publik router lain yang didaftar setelahnya (mis.
// /auth/google-login/callback, /auth/:platform/callback dari OAuth
// provider — itu butuh TETAP bisa diakses tanpa Authorization header).

// GET /campaigns — daftar campaign MILIK akun yang login
campaignsRouter.get("/campaigns", requireAuth, async (req, res) => {
  const items = await prisma.campaign.findMany({
    where: { accountId: req.accountId },
    orderBy: { createdAt: "desc" },
    include: {
      hooks: true,
      renders: true,
      posts: {
        select: { platform: true, state: true, permalink: true, scheduledAt: true, hook: { select: { label: true } } },
      },
    },
  });
  res.json(items);
});

// GET /campaigns/:id — cuma boleh lihat campaign milik sendiri
campaignsRouter.get("/campaigns/:id", requireAuth, async (req, res) => {
  const item = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: { hooks: true, renders: true, posts: true },
  });
  if (!item || item.accountId !== req.accountId) return res.status(404).json({ error: "Campaign tidak ditemukan" });
  res.json(item);
});

// POST /campaigns — buat campaign milik akun yang login (accountId TIDAK
// dari body lagi — cegah orang bikin campaign atas nama akun orang lain)
const createSchema = z.object({
  product: z.string().min(1),
  description: z.string().optional(),
  productImageUrl: z.string().url().optional(),
  platforms: z.array(z.string()).default([]),
  brandKitId: z.string().optional(),
});

campaignsRouter.post("/campaigns", requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await prisma.campaign.create({
    data: { ...parsed.data, platforms: parsed.data.platforms as any, accountId: req.accountId! },
  });
  res.status(201).json(created);
});

// GET /campaigns/:id/status — status posting per platform (Bab 05)
campaignsRouter.get("/campaigns/:id/status", requireAuth, async (req, res) => {
  const campaign = await prisma.campaign.findUnique({ where: { id: req.params.id }, select: { accountId: true } });
  if (!campaign || campaign.accountId !== req.accountId) return res.status(404).json({ error: "Campaign tidak ditemukan" });

  const posts = await prisma.post.findMany({
    where: { campaignId: req.params.id },
    select: { platform: true, state: true, permalink: true, scheduledAt: true },
  });
  res.json({ perPlatform: posts });
});

// POST /campaigns/:id/generate — Claude tulis 5 hook (naskah+caption) + hashtag (Bab 03)
campaignsRouter.post("/campaigns/:id/generate", requireAuth, async (req, res) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: req.params.id },
    include: { brandKit: true },
  });
  if (!campaign || campaign.accountId !== req.accountId) return res.status(404).json({ error: "Campaign tidak ditemukan" });

  const lang: "en" | "id" = req.body?.lang === "en" ? "en" : "id";
  const voice = campaign.brandKit?.voice ?? "casual, friendly";
  const platforms = campaign.platforms.length ? campaign.platforms : ["tiktok", "instagram"];
  const language = lang === "en" ? "English" : "Bahasa Indonesia";
  const angles = HOOK_KEYS.map((k) => `${k}=${HOOK_BRIEF[k]}`).join("; ");

  const prompt = `You are BrandReel's short-form UGC script engine. Create video concepts for one product.
Product name: "${campaign.product}"
Product details: "${campaign.description ?? "(none provided)"}"
Brand voice: "${voice}"
Target platforms: ${platforms.join(", ")}
Write everything in ${language}.

Produce FIVE hook variations, one per angle:
${angles}

Return ONLY minified JSON (no markdown, no commentary) with EXACTLY this shape:
{"hooks":{"h1":{"script":"...","caption":"..."},"h2":{"script":"...","caption":"..."},"h3":{"script":"...","caption":"..."},"h4":{"script":"...","caption":"..."},"h5":{"script":"...","caption":"..."}},"hashtags":["#tag","#tag"]}
Rules:
- "script" = the spoken opening hook line of the video. Max 14 words. Punchy, in the brand voice. No hashtags.
- "caption" = a base social caption (max 26 words) in the brand voice. No hashtags inside it.
- "hashtags" = 8 lowercase relevant hashtags, each starts with #, no spaces, specific to this product.`;

  try {
    await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "generating" } });

    const reply = await callClaude(prompt, 1400);
    const data = parseModelJSON<{ hooks?: Record<string, { script?: string; caption?: string }>; hashtags?: string[] }>(reply);
    if (!data?.hooks) throw new Error("Balasan Claude tidak sesuai skema");

    await prisma.hook.deleteMany({ where: { campaignId: campaign.id } });
    const hooks = await Promise.all(
      HOOK_KEYS.map((k) => {
        const h = data.hooks?.[k] ?? {};
        return prisma.hook.create({
          data: {
            campaignId: campaign.id,
            label: k,
            angle: HOOK_BRIEF[k],
            script: String(h.script ?? "").trim(),
            caption: String(h.caption ?? "").trim(),
          },
        });
      })
    );

    let hashtags = Array.isArray(data.hashtags) ? data.hashtags : [];
    hashtags = hashtags
      .map((t) => String(t).trim())
      .filter(Boolean)
      .map((t) => (t.startsWith("#") ? t : `#${t}`))
      .map((t) => t.replace(/\s+/g, ""))
      .slice(0, 8);

    const updated = await prisma.campaign.update({
      where: { id: campaign.id },
      data: { status: "ready", topHook: "h1" },
      include: { hooks: true },
    });

    res.json({ campaign: updated, hooks, hashtags });
  } catch (err: any) {
    await prisma.campaign.update({ where: { id: campaign.id }, data: { status: "draft" } });
    console.error(err);
    res.status(502).json({ error: err.message ?? "Gagal generate hook" });
  }
});

// POST /campaigns/:id/adapt-caption — caption teradaptasi per platform (Bab 03)
const adaptSchema = z.object({
  hookId: z.string(),
  platform: z.string(),
  lang: z.enum(["en", "id"]).default("id"),
});

campaignsRouter.post("/campaigns/:id/adapt-caption", requireAuth, async (req, res) => {
  const parsed = adaptSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const hook = await prisma.hook.findUnique({
    where: { id: parsed.data.hookId },
    include: { campaign: { include: { brandKit: true } } },
  });
  if (!hook || hook.campaignId !== req.params.id || hook.campaign.accountId !== req.accountId) {
    return res.status(404).json({ error: "Hook tidak ditemukan" });
  }

  const { platform, lang } = parsed.data;
  const voice = hook.campaign.brandKit?.voice ?? "casual, friendly";
  const language = lang === "en" ? "English" : "Bahasa Indonesia";
  const CAP_MAX: Record<string, number> = { tiktok: 150, instagram: 2200, youtube: 100, linkedin: 700, twitter: 280, facebook: 2200 };
  const HASHTAG_N: Record<string, number> = { tiktok: 5, instagram: 8, youtube: 3, linkedin: 3, twitter: 2, facebook: 4 };
  const capMax = CAP_MAX[platform] ?? 150;
  const hashtagN = HASHTAG_N[platform] ?? 5;

  const prompt = `Adapt a social caption for ${platform} (≤${capMax} characters).
Product: "${hook.campaign.product}"
Brand voice: "${voice}"
Hook angle: ${hook.angle ?? hook.label}
Base caption: "${hook.caption ?? ""}"
Platform style: ${platformRule(platform, lang)}
Write in ${language}.

Return ONLY the final caption text — no quotes, no markdown, no labels.
End the caption with exactly ${hashtagN} relevant hashtags on their own line.
Hard limit: ${capMax} characters total.`;

  try {
    const reply = await callClaude(prompt, 400);
    let text = reply.trim().replace(/^```[a-z]*|```$/gi, "").trim();
    if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
      text = text.slice(1, -1).trim();
    }
    if (!text) throw new Error("Caption kosong");
    if (text.length > capMax) text = text.slice(0, capMax - 1).trimEnd() + "…";
    res.json({ text, len: text.length, max: capMax });
  } catch (err: any) {
    console.error(err);
    res.status(502).json({ error: err.message ?? "Gagal adaptasi caption" });
  }
});
