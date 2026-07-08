// src/lib/hooks.ts — brief sudut hook + aturan gaya per platform (Bab 03)
// Porting dari assets/br-ai.jsx supaya prompt Claude persis dengan prototype.

export const HOOK_BRIEF: Record<"h1" | "h2" | "h3" | "h4" | "h5", string> = {
  h1: "Problem then Solution — name a relatable pain, reveal the product as the fix",
  h2: "Unboxing reveal — anticipation, first look, the satisfying reveal",
  h3: "Before then After — the visible transformation nobody expected",
  h4: "Testimonial — a real-sounding personal endorsement / social proof",
  h5: "Trending audio — POV / trend-led, hooks into a current format",
};

export function platformRule(pid: string, lang: "en" | "id"): string {
  const en = lang === "en";
  const m: Record<string, string> = {
    tiktok: en ? "Punchy and casual, trend-aware, 1 emoji max, very short." : "Singkat, santai, ikut tren, maksimal 1 emoji.",
    instagram: en ? "Cinematic and aspirational, one inviting line, 1 tasteful emoji." : "Sinematik & aspiratif, satu kalimat mengajak, 1 emoji.",
    youtube: en ? "Curiosity hook in the first words, end with 'link in bio', no emoji." : "Hook penasaran di awal, akhiri 'link di bio', tanpa emoji.",
    linkedin: en ? "Professional, value-first, no slang, no emoji, full sentence." : "Profesional, utamakan nilai, tanpa slang, tanpa emoji.",
    twitter: en ? "Very short and witty, one line, no fluff." : "Sangat singkat & cerdas, satu baris.",
  };
  return m[pid] ?? m.tiktok;
}
