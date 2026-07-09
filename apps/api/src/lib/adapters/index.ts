// src/lib/adapters/index.ts — pilih adapter per platform (Bab 05 §1)
import type { PlatformId } from "../platforms.js";
import type { PlatformAdapter } from "./types.js";
import { tiktokAdapter } from "./tiktok.js";
import { instagramAdapter } from "./instagram.js";
import { facebookAdapter } from "./facebook.js";
import { youtubeAdapter } from "./youtube.js";
import { linkedinAdapter } from "./linkedin.js";
import { xAdapter } from "./x.js";

const ADAPTERS: Record<PlatformId, PlatformAdapter> = {
  tiktok: tiktokAdapter,
  instagram: instagramAdapter,
  facebook: facebookAdapter,
  youtube: youtubeAdapter,
  linkedin: linkedinAdapter,
  x: xAdapter,
};

export function getAdapter(platform: PlatformId): PlatformAdapter {
  return ADAPTERS[platform];
}

export * from "./types.js";
export { PLATFORM_SPEC, type PlatformId } from "../platforms.js";
