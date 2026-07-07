// Sistem tema BrandReel — porting 1:1 dari prototype assets/br-theme.jsx.
// Light glassmorphism: kanvas netral sejuk + preset aksen yang bisa ditukar.

export type AccentKey = "violet" | "indigo" | "coral" | "emerald";
export type ThemeKey = "mist" | "paper" | "sand" | "dark";

export interface Accent {
  brand: string;
  brandDk: string;
  brandLt: string;
  accent: string;
  accentLt: string;
  glow: string;
}

export interface BaseTheme {
  name: string;
  canvas: string;
  canvasAlt: string;
  page: string;
  glass: string;
  glassDk: string;
  glassHi: string;
  ink: string;
  ink2: string;
  ink3: string;
  hair: string;
  hair2: string;
  pos: string;
  warn: string;
  neg: string;
  info: string;
}

export type Theme = BaseTheme & Accent;

export const BR_ACCENTS: Record<AccentKey, Accent> = {
  violet: { brand: "#6A5AF0", brandDk: "#4B3CD6", brandLt: "#A091FF", accent: "#8A6CF6", accentLt: "#B7A2FF", glow: "#CBBFFF" },
  indigo: { brand: "#4C63E6", brandDk: "#3344CC", brandLt: "#8C9AFF", accent: "#4F8FEF", accentLt: "#9FBEFF", glow: "#BCCBFF" },
  coral:  { brand: "#FB5A4D", brandDk: "#DD3A36", brandLt: "#FF8A7E", accent: "#FF7E54", accentLt: "#FFAE86", glow: "#FFC9B6" },
  emerald:{ brand: "#10B585", brandDk: "#0B9A6E", brandLt: "#4FD6A8", accent: "#14B6C2", accentLt: "#6FE0E2", glow: "#A6ECD6" },
};
export const BR_ACCENT_ORDER: AccentKey[] = ["violet", "indigo", "coral", "emerald"];

export const BR_THEMES: Record<ThemeKey, BaseTheme> = {
  mist: {
    name: "Mist",
    canvas: "#F1F2F6", canvasAlt: "#E7E9F0", page: "#FBFBFE",
    glass: "rgba(255, 255, 255, 0.60)", glassDk: "rgba(255, 255, 255, 0.40)", glassHi: "rgba(255, 255, 255, 0.86)",
    ink: "#1B1C26", ink2: "#585C6E", ink3: "#9A9EB2",
    hair: "rgba(24, 26, 48, 0.10)", hair2: "rgba(24, 26, 48, 0.055)",
    pos: "#12B886", warn: "#E0A11B", neg: "#E5484D", info: "#4F8FF0",
  },
  paper: {
    name: "Paper",
    canvas: "#F6F7FA", canvasAlt: "#EEF0F4", page: "#FFFFFF",
    glass: "rgba(255, 255, 255, 0.68)", glassDk: "rgba(255, 255, 255, 0.44)", glassHi: "rgba(255, 255, 255, 0.94)",
    ink: "#16171F", ink2: "#565A6A", ink3: "#9498A8",
    hair: "rgba(12, 14, 28, 0.09)", hair2: "rgba(12, 14, 28, 0.045)",
    pos: "#0FAE7E", warn: "#D9970F", neg: "#E13B40", info: "#3F83EE",
  },
  sand: {
    name: "Sand",
    canvas: "#F3EFE8", canvasAlt: "#EAE4DA", page: "#FBF8F2",
    glass: "rgba(255, 253, 249, 0.60)", glassDk: "rgba(255, 253, 249, 0.38)", glassHi: "rgba(255, 254, 250, 0.86)",
    ink: "#221D15", ink2: "#5F574B", ink3: "#A39A8B",
    hair: "rgba(50, 38, 20, 0.12)", hair2: "rgba(50, 38, 20, 0.06)",
    pos: "#13A574", warn: "#C98A12", neg: "#D9433E", info: "#3F7FE0",
  },
  dark: {
    name: "Night",
    canvas: "#14151C", canvasAlt: "#1C1E28", page: "#0E0F15",
    glass: "rgba(255, 255, 255, 0.05)", glassDk: "rgba(255, 255, 255, 0.03)", glassHi: "rgba(255, 255, 255, 0.09)",
    ink: "#ECEDF4", ink2: "#9DA0B2", ink3: "#686C7E",
    hair: "rgba(255, 255, 255, 0.12)", hair2: "rgba(255, 255, 255, 0.06)",
    pos: "#2FD39A", warn: "#F0B43A", neg: "#FF6259", info: "#6AA4FF",
  },
};

export function buildTheme(themeKey: ThemeKey, accentKey: AccentKey): Theme {
  return { ...BR_THEMES[themeKey], ...BR_ACCENTS[accentKey] };
}

// ── Platform sosial media (aksen + aturan konten per platform) ──
export type PlatformId = "tiktok" | "instagram" | "youtube" | "linkedin" | "twitter" | "facebook";

export interface PlatformMeta {
  id: PlatformId;
  name: string;
  short: string;
  color: string;
  domain: string;
  ratio: string;
  maxSec: number;
  capMax: number;
  hashtags: number;
  note_en: string;
  note_id: string;
  scopes_en: string[];
  scopes_id: string[];
}

export const BR_PLATFORMS: Record<PlatformId, PlatformMeta> = {
  tiktok: {
    id: "tiktok", name: "TikTok", short: "TT", color: "#FE2C55", domain: "tiktok.com",
    ratio: "9:16", maxSec: 60, capMax: 150, hashtags: 5,
    note_en: "Fast cuts · trending audio · 15–20s", note_id: "Cepat · audio tren · 15–20d",
    scopes_en: ["Publish videos to your account", "Read your profile & follower count", "Read video views & insights"],
    scopes_id: ["Posting video ke akun kamu", "Baca profil & jumlah pengikut", "Baca tayangan & insight video"],
  },
  instagram: {
    id: "instagram", name: "Instagram", short: "IG", color: "#E1306C", domain: "instagram.com",
    ratio: "9:16", maxSec: 90, capMax: 2200, hashtags: 8,
    note_en: "Cinematic · on-screen captions · 15–30s", note_id: "Sinematik · teks layar · 15–30d",
    scopes_en: ["Publish Reels & feed posts", "Read your profile & media", "Read reach & engagement insights"],
    scopes_id: ["Posting Reels & feed", "Baca profil & media", "Baca insight jangkauan & engagement"],
  },
  youtube: {
    id: "youtube", name: "YouTube", short: "YT", color: "#FF0000", domain: "accounts.google.com",
    ratio: "9:16", maxSec: 60, capMax: 100, hashtags: 3,
    note_en: "Hook in 3s · CTA end · max 60s", note_id: "Hook 3d · CTA akhir · maks 60d",
    scopes_en: ["Upload & manage your videos", "View your channel details", "View YouTube Analytics reports"],
    scopes_id: ["Unggah & kelola video", "Lihat detail channel", "Lihat laporan YouTube Analytics"],
  },
  linkedin: {
    id: "linkedin", name: "LinkedIn", short: "in", color: "#0A66C2", domain: "linkedin.com",
    ratio: "1:1", maxSec: 90, capMax: 700, hashtags: 3,
    note_en: "Pro tone · value-first · 20–40s", note_id: "Profesional · nilai dulu · 20–40d",
    scopes_en: ["Post & share on your behalf", "Read your basic profile", "Read page & post analytics"],
    scopes_id: ["Posting & bagikan atas nama kamu", "Baca profil dasar", "Baca analitik halaman & post"],
  },
  twitter: {
    id: "twitter", name: "X", short: "X", color: "#16161A", domain: "x.com",
    ratio: "16:9", maxSec: 140, capMax: 280, hashtags: 2,
    note_en: "Hook + image · short copy", note_id: "Hook + gambar · teks pendek",
    scopes_en: ["Post & delete Posts for you", "Read your profile & follows", "Read post engagement metrics"],
    scopes_id: ["Posting & hapus Post untukmu", "Baca profil & following", "Baca metrik engagement post"],
  },
  facebook: {
    id: "facebook", name: "Facebook", short: "f", color: "#1877F2", domain: "facebook.com",
    ratio: "1:1", maxSec: 90, capMax: 2200, hashtags: 4,
    note_en: "Page posts · link CTA · 15–30s", note_id: "Post Page · CTA link · 15–30d",
    scopes_en: ["Publish posts to your Page", "Read your Page details", "Read Page & post insights"],
    scopes_id: ["Posting ke Page kamu", "Baca detail Page", "Baca insight Page & post"],
  },
};
export const BR_PLATFORM_ORDER: PlatformId[] = ["tiktok", "instagram", "youtube", "linkedin", "twitter", "facebook"];

// ── SSO providers ──
export const BR_SSO = {
  google: {
    id: "google", name: "Google", domain: "accounts.google.com", bg: "#FFFFFF", ink: "#1F1F1F", bordered: true,
    scopes_en: ["Your name, email & profile picture", "Confirm it’s really you"],
    scopes_id: ["Nama, email & foto profil kamu", "Konfirmasi ini benar kamu"],
  },
  apple: {
    id: "apple", name: "Apple", domain: "appleid.apple.com", bg: "#000000", ink: "#FFFFFF", bordered: false,
    scopes_en: ["Your name & email address", "Option to Hide My Email"],
    scopes_id: ["Nama & alamat email kamu", "Opsi Sembunyikan Email"],
  },
} as const;

// ── Sudut hook — 5 variasi narasi UGC per kampanye ──
export type HookId = "h1" | "h2" | "h3" | "h4" | "h5";

export interface HookMeta {
  id: HookId;
  num: number;
  color: string;
  key_en: string;
  key_id: string;
  glyph: string;
}

export const BR_HOOKS: Record<HookId, HookMeta> = {
  h1: { id: "h1", num: 1, color: "#2D7FF0", key_en: "Problem → Solution", key_id: "Masalah → Solusi", glyph: "PS" },
  h2: { id: "h2", num: 2, color: "#6D4AFF", key_en: "Unboxing reveal", key_id: "Unboxing", glyph: "UB" },
  h3: { id: "h3", num: 3, color: "#FF5A47", key_en: "Before → After", key_id: "Sebelum → Sesudah", glyph: "BA" },
  h4: { id: "h4", num: 4, color: "#1FA971", key_en: "Testimonial", key_id: "Testimoni", glyph: "TM" },
  h5: { id: "h5", num: 5, color: "#E0A11B", key_en: "Trending audio", key_id: "Audio tren", glyph: "TR" },
};
export const BR_HOOK_ORDER: HookId[] = ["h1", "h2", "h3", "h4", "h5"];
