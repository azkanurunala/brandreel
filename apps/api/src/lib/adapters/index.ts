// src/lib/adapters/index.ts — pilih adapter per platform (Bab 05 §1)
import type { PlatformId } from "../platforms.js";
import type { PlatformAdapter } from "./types.js";
import { tiktokAdapter } from "./tiktok.js";
import { stubAdapter } from "./stub.js";

export function getAdapter(platform: PlatformId): PlatformAdapter {
  if (platform === "tiktok") return tiktokAdapter;
  return stubAdapter(platform);
}

export * from "./types.js";
export { PLATFORM_SPEC, type PlatformId } from "../platforms.js";
