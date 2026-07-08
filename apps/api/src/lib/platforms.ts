// src/lib/platforms.ts — spesifikasi tiap platform (Bab 05 §2), dipakai
// server-side untuk pre-flight validate(). Samakan dengan tokens.ts frontend.
export type PlatformId = "tiktok" | "instagram" | "youtube" | "linkedin" | "twitter" | "facebook";

export interface PlatformSpec {
  ratio: "9:16" | "1:1" | "16:9";
  maxDurationS: number;
  captionMax: number;
  hashtagMax: number;
  staggerMinutes: number | null; // null = tak perlu jeda
}

export const PLATFORM_SPEC: Record<PlatformId, PlatformSpec> = {
  tiktok: { ratio: "9:16", maxDurationS: 60, captionMax: 150, hashtagMax: 5, staggerMinutes: 30 },
  instagram: { ratio: "9:16", maxDurationS: 90, captionMax: 2200, hashtagMax: 8, staggerMinutes: null },
  youtube: { ratio: "9:16", maxDurationS: 60, captionMax: 100, hashtagMax: 3, staggerMinutes: null },
  linkedin: { ratio: "1:1", maxDurationS: 90, captionMax: 700, hashtagMax: 3, staggerMinutes: null },
  twitter: { ratio: "16:9", maxDurationS: 140, captionMax: 280, hashtagMax: 2, staggerMinutes: null },
  facebook: { ratio: "1:1", maxDurationS: 90, captionMax: 2200, hashtagMax: 4, staggerMinutes: null },
};
