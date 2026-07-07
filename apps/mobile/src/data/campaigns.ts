// Data dummy kampanye + alert — porting dari prototype assets/br-data.jsx.
// Fase 2: dipakai layar sebagai pengganti API; Fase 3+ diganti data backend.

import { BR_PLATFORMS, type HookId, type PlatformId } from "../theme/tokens";
import type { Lang } from "../i18n/strings";

export type CampaignStatus = "draft" | "generating" | "ready" | "publishing" | "live" | "failed";
export type PostState = "queued" | "posted" | "retry" | "failed";

export interface PlatformPost {
  state: PostState;
  views?: string;
  eta?: string;
}

export interface Campaign {
  id: string;
  product: string;
  logoGlyph: string;
  logoColor: string;
  desc_en: string;
  desc_id: string;
  created_en: string;
  created_id: string;
  status: CampaignStatus;
  topHook: HookId | null;
  views: string;
  eng: string;
  hashtags: string[];
  platforms: Partial<Record<PlatformId, PlatformPost>>;
}

export const BR_CAMPAIGNS: Campaign[] = [
  {
    id: "c-bamboo-tb", product: "Bamboo toothbrush", logoGlyph: "BT", logoColor: "#1FA971",
    desc_en: "Biodegradable handle · soft charcoal bristles", desc_id: "Gagang terurai · bulu arang lembut",
    created_en: "Live · 2h ago", created_id: "Tayang · 2 jam lalu",
    status: "live", topHook: "h3", views: "1.2M", eng: "5.8%",
    hashtags: ["#eco", "#sustainable", "#zerowaste", "#bamboo", "#plasticfree", "#ecogoods"],
    platforms: { tiktok: { state: "posted", views: "1.2M" }, instagram: { state: "posted", views: "184K" }, youtube: { state: "posted", views: "92K" }, linkedin: { state: "posted", views: "11K" }, twitter: { state: "posted", views: "23K" } },
  },
  {
    id: "c-water-bottle", product: "Bamboo water bottle", logoGlyph: "WB", logoColor: "#2D7FF0",
    desc_en: "750ml · double-wall · leakproof", desc_id: "750ml · dinding ganda · anti bocor",
    created_en: "Publishing · staggered", created_id: "Mengirim · dijeda",
    status: "publishing", topHook: "h2", views: "—", eng: "—",
    hashtags: ["#hydrate", "#eco", "#sustainable", "#bottle", "#zerowaste"],
    platforms: { tiktok: { state: "queued", eta: "+18m" }, instagram: { state: "posted", views: "2.1K" }, youtube: { state: "posted", views: "640" }, linkedin: { state: "queued", eta: "now" }, twitter: { state: "retry" } },
  },
  {
    id: "c-shampoo", product: "Organic shampoo bar", logoGlyph: "SB", logoColor: "#E0A11B",
    desc_en: "Sulfate-free · 80 washes · plastic-free", desc_id: "Bebas sulfat · 80 cuci · tanpa plastik",
    created_en: "Ready · approved", created_id: "Siap · disetujui",
    status: "ready", topHook: "h1", views: "—", eng: "—",
    hashtags: ["#haircare", "#eco", "#shampoobar", "#plasticfree", "#sustainable"],
    platforms: { tiktok: { state: "queued" }, instagram: { state: "queued" }, youtube: { state: "queued" }, linkedin: { state: "queued" }, twitter: { state: "queued" } },
  },
  {
    id: "c-phone-case", product: "Eco phone case", logoGlyph: "PC", logoColor: "#6D4AFF",
    desc_en: "Compostable · drop-tested · 12 colors", desc_id: "Kompos · uji jatuh · 12 warna",
    created_en: "Live · yesterday", created_id: "Tayang · kemarin",
    status: "live", topHook: "h4", views: "318K", eng: "3.1%",
    hashtags: ["#tech", "#eco", "#phonecase", "#sustainable", "#compostable"],
    platforms: { tiktok: { state: "posted", views: "201K" }, instagram: { state: "posted", views: "88K" }, youtube: { state: "posted", views: "21K" }, linkedin: { state: "posted", views: "4.2K" }, twitter: { state: "posted", views: "3.8K" } },
  },
  {
    id: "c-beeswax", product: "Beeswax food wrap", logoGlyph: "FW", logoColor: "#F23E5C",
    desc_en: "Reusable · 3-pack · washable", desc_id: "Pakai ulang · isi 3 · bisa dicuci",
    created_en: "1 platform needs attention", created_id: "1 platform perlu dicek",
    status: "failed", topHook: "h2", views: "—", eng: "—",
    hashtags: ["#kitchen", "#eco", "#zerowaste", "#reusable"],
    platforms: { tiktok: { state: "posted", views: "12K" }, instagram: { state: "failed" }, youtube: { state: "posted", views: "3.1K" }, linkedin: { state: "posted", views: "900" }, twitter: { state: "posted", views: "1.4K" } },
  },
  {
    id: "c-coffee-cup", product: "Reusable coffee cup", logoGlyph: "CC", logoColor: "#0A66C2",
    desc_en: "Collapsible · 350ml · heat-safe", desc_id: "Lipat · 350ml · tahan panas",
    created_en: "Draft · not generated", created_id: "Draf · belum dibuat",
    status: "draft", topHook: null, views: "—", eng: "—",
    hashtags: ["#coffee", "#eco", "#reusable", "#zerowaste"],
    platforms: {},
  },
];

// Template narasi hook ({p} = produk) — dipakai menyusun caption per platform.
export const BR_HOOK_LINES: Record<HookId, { en: string; id: string }> = {
  h1: { en: "Your old {p} is quietly costing you. Here's the swap →", id: "{p} lama kamu diam-diam bikin rugi. Ini gantinya →" },
  h2: { en: "Unboxing the {p} you've all been asking about 📦", id: "Unboxing {p} yang kalian tunggu-tunggu 📦" },
  h3: { en: "{p}: the before & after nobody expected", id: "{p}: before & after yang nggak nyangka" },
  h4: { en: "I didn't buy the hype around {p}… until this", id: "Awalnya skeptis sama {p}… sampai akhirnya coba" },
  h5: { en: "POV: you finally tried the {p} everyone's on about", id: "POV: akhirnya nyobain {p} yang lagi rame" },
};

// Susun caption teradaptasi per platform — aturan per-platform dari PRD.
export function brBuildCaption(campaign: Campaign, hookId: HookId, pid: PlatformId, lang: Lang) {
  const plat = BR_PLATFORMS[pid];
  const baseTpl = (BR_HOOK_LINES[hookId] ?? BR_HOOK_LINES.h1)[lang === "en" ? "en" : "id"];
  const line = baseTpl.replace("{p}", campaign.product.toLowerCase());
  let body = "";
  if (pid === "linkedin") {
    body = lang === "en"
      ? `\n\nWe rebuilt the ${campaign.product.toLowerCase()} from the ground up — here's what changed, and why it matters for everyday sustainability.`
      : `\n\nKami rancang ulang ${campaign.product.toLowerCase()} dari nol — ini yang berubah, dan kenapa itu penting untuk keberlanjutan sehari-hari.`;
  } else if (pid === "twitter") {
    body = "";
  } else if (pid === "instagram") {
    body = lang === "en"
      ? `\n\nSwipe to see the difference. Small switch, big impact 🌱`
      : `\n\nGeser untuk lihat bedanya. Ganti kecil, dampak besar 🌱`;
  } else if (pid === "youtube") {
    body = lang === "en" ? `\n\nFull review in 60s. Link in bio.` : `\n\nReview lengkap 60 detik. Link di bio.`;
  }
  const tags = campaign.hashtags.slice(0, plat.hashtags).join(" ");
  let text = `${line}${body}\n\n${tags}`;
  if (text.length > plat.capMax) text = text.slice(0, plat.capMax - 1).trimEnd() + "…";
  return { text, len: text.length, max: plat.capMax };
}

// Baris pemeriksaan pra-kirim (ok | warn).
export interface PreflightRow {
  k: string;
  ok: boolean;
  label_en: string;
  label_id: string;
}

export function brPreflight(campaign: Campaign | null, _lang: Lang): PreflightRow[] {
  const rows: PreflightRow[] = [
    { k: "format", ok: true, label_en: "All specs match · aspect, duration, codec", label_id: "Semua spek cocok · rasio, durasi, codec" },
    { k: "token", ok: true, label_en: "Auth tokens valid · refreshed 7d ahead", label_id: "Token auth valid · disegarkan 7 hari" },
    { k: "rate", ok: true, label_en: "Rate limits clear · TikTok staggered 1/30m", label_id: "Rate limit aman · TikTok dijeda 1/30m" },
    { k: "dupe", ok: true, label_en: "No duplicate in 30-day schedule", label_id: "Tak ada duplikat di jadwal 30 hari" },
    { k: "voice", ok: true, label_en: "Brand voice match · 94% on-tone", label_id: "Brand voice cocok · 94% sesuai" },
  ];
  if (campaign && campaign.status === "failed") {
    rows[0] = { k: "format", ok: false, label_en: "IG rejected · aspect 9:16 expected, got 9:15", label_id: "IG menolak · rasio 9:16, dikirim 9:15" };
  }
  return rows;
}

// Inbox — alert sistem + rekomendasi.
export interface Alert {
  id: string;
  tag: string;
  color: string;
  title_en: string;
  title_id: string;
  body_en: string;
  body_id: string;
  time: string;
  route: { name: string; id?: string };
}

export const BR_ALERTS: Alert[] = [
  { id: "a1", tag: "LIVE", color: "#1FA971", title_en: "Bamboo toothbrush is live", title_id: "Sikat gigi bambu tayang", body_en: "Hook 3 (Before/After) leading · 1.2M views in 2h on TikTok.", body_id: "Hook 3 (Before/After) memimpin · 1,2 jt tayangan 2 jam di TikTok.", time: "2h", route: { name: "detail", id: "c-bamboo-tb" } },
  { id: "a2", tag: "RATE", color: "#E0A11B", title_en: "TikTok queue staggered", title_id: "Antrean TikTok dijeda", body_en: "Bamboo water bottle posting 1/30m to stay clear of shadow-ban.", body_id: "Botol air bambu dikirim 1/30m agar aman dari shadow-ban.", time: "20m", route: { name: "publishing", id: "c-water-bottle" } },
  { id: "a3", tag: "FAIL", color: "#E0413B", title_en: "Beeswax wrap · IG needs attention", title_id: "Beeswax wrap · IG perlu dicek", body_en: "Instagram rejected aspect ratio. Auto-fix ready — tap to re-post.", body_id: "Instagram menolak rasio. Auto-fix siap — ketuk untuk kirim ulang.", time: "1h", route: { name: "detail", id: "c-beeswax" } },
  { id: "a4", tag: "TKN", color: "#2D7FF0", title_en: "LinkedIn token refreshed", title_id: "Token LinkedIn disegarkan", body_en: "Refreshed 7 days before expiry. No action needed.", body_id: "Disegarkan 7 hari sebelum kedaluwarsa. Tak perlu tindakan.", time: "5h", route: { name: "profile" } },
  { id: "a5", tag: "TIP", color: "#6D4AFF", title_en: "Recommendation ready", title_id: "Rekomendasi siap", body_en: "Hook 2 (Unboxing) underperforms on LinkedIn — try Testimonial there.", body_id: "Hook 2 (Unboxing) lemah di LinkedIn — coba Testimoni di sana.", time: "1d", route: { name: "insights" } },
];
