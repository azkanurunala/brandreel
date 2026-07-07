// Kampanye baru yang sedang dibuat — padanan window.__brNewCampaign di prototype.
// Modul singleton sederhana; Fase 3 diganti state dari backend.

import type { Campaign } from "./campaigns";
import type { PlatformId } from "../theme/tokens";
import type { Lang } from "../i18n/strings";

export interface PendingCampaignInput {
  product: string;
  desc: string;
  voice: string;
  platforms: PlatformId[];
  lang: Lang;
}

export interface PendingCampaign {
  campaign: Campaign;
  input: PendingCampaignInput;
}

let pending: PendingCampaign | null = null;

export function setPendingCampaign(p: PendingCampaign) {
  pending = p;
}

export function getPendingCampaign(): PendingCampaign | null {
  return pending;
}
