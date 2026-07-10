// Kampanye baru yang sedang dibuat — padanan window.__brNewCampaign di prototype.
// Modul singleton sederhana. Fase 3: menyimpan juga id backend asli + promise
// panggilan Claude (/campaigns/:id/generate) supaya layar generating bisa
// menunggu penyelesaian nyata, bukan animasi timer semata.

import type { Campaign } from "./campaigns";
import type { HookId, PlatformId } from "../theme/tokens";
import type { Lang } from "../i18n/strings";
import { apiPost } from "../lib/api";

// Enum backend cuma kenal "x", bukan "twitter" (id internal frontend —
// samakan dengan onboard.tsx/profile.tsx yang connect OAuth platform).
export function toBackendPlatform(pid: PlatformId): string {
  return pid === "twitter" ? "x" : pid;
}

export interface PendingCampaignInput {
  product: string;
  desc: string;
  voice: string;
  platforms: PlatformId[];
  lang: Lang;
  brandKitId?: string;
  productImageUrl?: string;
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

export function getPendingCampaign(): PendingCampaign | null {
  return pending;
}

// Bikin campaign asli + panggil /generate (Claude). Dipakai saat submit
// pertama (create.tsx) MAUPUN retry (generating.tsx) — kalau campaign sudah
// pernah berhasil dibuat sebelumnya (pending.backendId ada), retry cuma
// ulangi /generate, bukan bikin campaign duplikat. Promise ini TIDAK PERNAH
// reject — kegagalan balikin null, artinya AI/backend beneran gagal, harus
// ditampilkan sebagai error ke user, bukan diloloskan diam-diam ke layar detail.
export function runGenerate(input: PendingCampaignInput): Promise<GenerateResult | null> {
  const promise = (async (): Promise<GenerateResult | null> => {
    try {
      let id: string | null = pending?.backendId ?? null;
      if (!id) {
        const campaign = await apiPost("/campaigns", {
          product: input.product,
          description: input.desc || undefined,
          productImageUrl: input.productImageUrl,
          brandKitId: input.brandKitId,
          platforms: input.platforms.map(toBackendPlatform),
        });
        id = campaign.id;
        if (pending) pending.backendId = id;
      }
      const gen = await apiPost(`/campaigns/${id}/generate`, {
        lang: input.lang,
        voice: input.voice.trim() || undefined,
      });
      const hooks = Object.fromEntries(
        (gen.hooks as { id: string; label: string; script: string; caption: string }[]).map((h) => [
          h.label,
          { id: h.id, script: h.script, caption: h.caption },
        ])
      ) as GenerateResult["hooks"];
      return { hooks, hashtags: gen.hashtags as string[] };
    } catch (e) {
      console.warn("Generate backend gagal:", e);
      return null;
    }
  })();
  if (pending) {
    pending.generatePromise = promise;
    promise.then((r) => { if (pending) pending.result = r; });
  }
  return promise;
}
