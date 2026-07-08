// src/lib/adapters/types.ts — bentuk seragam adapter platform (Bab 05 §1)
// Analogi colokan universal: tiap platform beda cara posting, tapi pipeline
// (worker.ts) cuma tahu 3 perintah ini.
import { PLATFORM_SPEC, type PlatformId } from "../platforms.js";

export class NotImplementedError extends Error {
  constructor(platform: string) {
    super(`Adapter ${platform} belum diimplementasi — lihat Bab 05`);
    this.name = "NotImplementedError";
  }
}

export interface ValidateInput {
  ratio: string;
  durationS: number | null;
  captionLen: number;
}

export interface ValidateResult {
  ok: boolean;
  reason?: string;
}

export interface PublishInput {
  accessToken: string;
  videoUrl: string;
  caption: string;
}

export interface PublishResult {
  remoteId: string;
  permalink: string | null;
  state: "posted" | "queued"; // "queued" jika platform proses async (mis. TikTok belum lolos review = private)
}

export interface InsightsResult {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
}

export interface PlatformAdapter {
  validate(input: ValidateInput): ValidateResult;
  publish(input: PublishInput): Promise<PublishResult>;
  fetchInsights(accessToken: string, remoteId: string): Promise<InsightsResult>;
}

export function baseValidate(platform: PlatformId, input: ValidateInput): ValidateResult {
  const spec = PLATFORM_SPEC[platform];
  if (input.ratio !== spec.ratio) {
    return { ok: false, reason: `${platform} expects aspect ${spec.ratio}, got ${input.ratio}` };
  }
  if (input.durationS != null && input.durationS > spec.maxDurationS) {
    return { ok: false, reason: `${platform} max duration ${spec.maxDurationS}s, got ${input.durationS}s` };
  }
  if (input.captionLen > spec.captionMax) {
    return { ok: false, reason: `${platform} caption max ${spec.captionMax} chars, got ${input.captionLen}` };
  }
  return { ok: true };
}
