// src/lib/veo.ts — render video UGC via Google Veo (Gemini API), Bab 03.
// Alur: mulai operasi long-running -> poll sampai selesai -> ambil bytes video.
import { env } from "../env.js";

export class VeoUnavailableError extends Error {
  constructor() {
    super("GEMINI_API_KEY belum diisi (lihat Bab 15)");
    this.name = "VeoUnavailableError";
  }
}

const BASE = "https://generativelanguage.googleapis.com/v1beta";

export interface VeoStartResult {
  operationName: string;
}

export async function startVeoRender(opts: {
  prompt: string;
  ratio: "9:16" | "1:1" | "16:9";
  durationSec: number;
}): Promise<VeoStartResult> {
  if (!env.GEMINI_API_KEY) throw new VeoUnavailableError();

  const r = await fetch(
    `${BASE}/models/${env.VEO_MODEL}:predictLongRunning?key=${env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: opts.prompt }],
        parameters: {
          aspectRatio: opts.ratio,
          durationSeconds: Math.round(opts.durationSec),
        },
      }),
    }
  );
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message ?? `Veo error (${r.status})`);
  if (!data?.name) throw new Error("Veo tidak mengembalikan nama operasi");
  return { operationName: data.name as string };
}

export interface VeoPollResult {
  done: boolean;
  videoBase64?: string;
  mimeType?: string;
  error?: string;
}

export async function pollVeoOperation(operationName: string): Promise<VeoPollResult> {
  if (!env.GEMINI_API_KEY) throw new VeoUnavailableError();

  const r = await fetch(`${BASE}/${operationName}?key=${env.GEMINI_API_KEY}`);
  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message ?? `Veo error (${r.status})`);

  if (!data.done) return { done: false };
  if (data.error) return { done: true, error: data.error.message ?? "Veo gagal render" };

  const sample = data.response?.generateVideoResponse?.generatedSamples?.[0];
  const video = sample?.video;
  if (!video?.bytesBase64Encoded) return { done: true, error: "Veo tidak mengembalikan video" };

  return {
    done: true,
    videoBase64: video.bytesBase64Encoded as string,
    mimeType: (video.mimeType as string) ?? "video/mp4",
  };
}

// Poll dengan backoff sampai selesai atau batas percobaan tercapai.
export async function waitForVeoRender(
  operationName: string,
  opts: { maxAttempts?: number; intervalMs?: number } = {}
): Promise<VeoPollResult> {
  const maxAttempts = opts.maxAttempts ?? 30;
  const intervalMs = opts.intervalMs ?? 10_000;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await pollVeoOperation(operationName);
    if (res.done) return res;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return { done: true, error: "Veo timeout — melebihi batas percobaan polling" };
}
