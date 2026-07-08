// Kampanye baru yang sedang dibuat — padanan window.__brNewCampaign di prototype.
// Modul singleton sederhana. Fase 3: menyimpan juga id backend asli + promise
// panggilan Claude (/campaigns/:id/generate) supaya layar generating bisa
// menunggu penyelesaian nyata, bukan animasi timer semata.

import type { Campaign } from "./campaigns";
import type { HookId, PlatformId } from "../theme/tokens";
import type { Lang } from "../i18n/strings";

export interface PendingCampaignInput {
  product: string;
  desc: string;
  voice: string;
  platforms: PlatformId[];
  lang: Lang;
}

export interface GenerateResult {
  hooks: Record<HookId, { id: string; script: string; caption: string }>;
  hashtags: string[];
}

export interface PendingCampaign {
  campaign: Campaign;
  input: PendingCampaignInput;
  backendId: string | null;
  generatePromise: Promise<GenerateResult | null> | null;
  result: GenerateResult | null;
}

let pending: PendingCampaign | null = null;

export function setPendingCampaign(p: Omit<PendingCampaign, "backendId" | "generatePromise" | "result">) {
  pending = { ...p, backendId: null, generatePromise: null, result: null };
}

export function setPendingBackend(backendId: string, generatePromise: Promise<GenerateResult | null>) {
  if (!pending) return;
  pending.backendId = backendId;
  pending.generatePromise = generatePromise;
  generatePromise.then((r) => {
    if (pending) pending.result = r;
  });
}

export function getPendingCampaign(): PendingCampaign | null {
  return pending;
}
