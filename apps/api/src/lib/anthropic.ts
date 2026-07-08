// src/lib/anthropic.ts — panggilan Claude terpusat (Bab 03)
// Kunci hanya hidup di server; semua route AI lewat sini.
import { env } from "../env.js";

export class AnthropicUnavailableError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY belum diisi (lihat Bab 15)");
    this.name = "AnthropicUnavailableError";
  }
}

export async function callClaude(prompt: string, maxTokens = 1024): Promise<string> {
  if (!env.ANTHROPIC_API_KEY) throw new AnthropicUnavailableError();

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: env.ANTHROPIC_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await r.json();
  if (!r.ok) throw new Error(data?.error?.message ?? `Claude error (${r.status})`);
  const text = data?.content?.[0]?.text;
  if (typeof text !== "string") throw new Error("Balasan Claude tidak berisi teks");
  return text;
}

// Ambil blok {...} seimbang pertama dari balasan model lalu JSON.parse.
export function parseModelJSON<T = unknown>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  let s = raw.trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = s.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(s.slice(start, i + 1)) as T;
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}
