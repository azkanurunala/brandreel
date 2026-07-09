// lib/campaignView.ts — ubah Campaign dari backend (Prisma) jadi bentuk
// tampilan yang dipakai layar (data/campaigns.ts Campaign) — dipakai
// home.tsx & detail/[id].tsx supaya campaign asli (bukan BR_CAMPAIGNS
// dummy) tampil konsisten di semua layar.
import type { Campaign, CampaignStatus, PlatformPost } from "@/data/campaigns";
import type { PlatformId, HookId } from "@/theme/tokens";
import type { GenerateResult } from "@/data/pendingCampaign";

const PALETTE = ["#1FA971", "#2D7FF0", "#6D4AFF", "#E0A11B", "#F23E5C", "#0A66C2"];

function hashColor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function glyphOf(product: string): string {
  const p = product.trim();
  return p ? p.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "··";
}

// Enum backend/Prisma pakai "x"; frontend pakai "twitter" (sesuai prototype).
export function toFrontendPlatform(p: string): PlatformId {
  return p === "x" ? "twitter" : (p as PlatformId);
}

const STATUS_MAP: Record<string, CampaignStatus> = {
  draft: "draft",
  generating: "generating",
  rendering: "generating",
  ready: "ready",
  publishing: "publishing",
  completed: "live",
  archived: "live",
};

export function relativeTime(iso: string): { en: string; id: string } {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return { en: "just now", id: "baru saja" };
  if (mins < 60) return { en: `${mins}m ago`, id: `${mins} menit lalu` };
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return { en: `${hrs}h ago`, id: `${hrs} jam lalu` };
  const days = Math.round(hrs / 24);
  return { en: `${days}d ago`, id: `${days} hari lalu` };
}

export interface ApiPost {
  platform: string;
  state: "queued" | "posted" | "retry" | "failed";
  permalink?: string | null;
  scheduledAt?: string | null;
  postedAt?: string | null;
  lastError?: string | null;
  hook?: { label: string } | null;
}
export interface ApiHook {
  id: string;
  label: string;
  angle: string | null;
  script: string;
  caption: string | null;
}
export interface ApiCampaign {
  id: string;
  product: string;
  description: string | null;
  platforms: string[];
  status: string;
  topHook: string | null;
  createdAt: string;
  hooks?: ApiHook[];
  posts?: ApiPost[];
}

export function toViewCampaign(api: ApiCampaign): Campaign {
  const posts = api.posts ?? [];
  const hasFailed = posts.some((p) => p.state === "failed");
  let status = STATUS_MAP[api.status] ?? "draft";
  if (hasFailed && status !== "draft" && status !== "generating") status = "failed";

  // Cuma isi state dari Post BENERAN — jangan tebak "queued" cuma karena
  // status campaign "publishing", soalnya publish bisa gagal pre-flight di
  // SEMUA platform (belum connect dsb) tanpa satu Post pun tercipta, dan
  // dulu di sini kena tandai "queued" biar keliatan jalan padahal enggak.
  const platforms: Partial<Record<PlatformId, PlatformPost>> = {};
  for (const raw of api.platforms) {
    const pid = toFrontendPlatform(raw);
    const post = posts.find((p) => toFrontendPlatform(p.platform) === pid);
    platforms[pid] = { state: post ? post.state : "not_started" };
  }

  const rel = relativeTime(api.createdAt);
  const desc = api.description ?? "";

  return {
    id: api.id,
    product: api.product,
    logoGlyph: glyphOf(api.product),
    logoColor: hashColor(api.id),
    desc_en: desc,
    desc_id: desc,
    created_en: rel.en,
    created_id: rel.id,
    status,
    topHook: (api.topHook as HookId | null) ?? null,
    views: "—",
    eng: "—",
    hashtags: [],
    platforms,
  };
}

// Ubah hooks nyata dari backend (GET /campaigns/:id) jadi bentuk yang sama
// dipakai layar detail buat hook AI baru saja dibuat (data/pendingCampaign).
export function hooksToGenerateResult(hooks: ApiHook[] | undefined): GenerateResult | null {
  if (!hooks || hooks.length === 0) return null;
  const entries = hooks.map((h) => [h.label, { id: h.id, script: h.script, caption: h.caption ?? "" }]);
  return { hooks: Object.fromEntries(entries) as GenerateResult["hooks"], hashtags: [] };
}
