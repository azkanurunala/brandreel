// BrandReel — real AI layer. Calls Claude (window.claude.complete) to generate
// hook scripts, base captions, hashtags, and per-platform adapted captions.
// Falls back to the template helpers in br-data.jsx when the model is
// unavailable or returns something unparseable.

// Pull the first balanced {...} block out of a model reply and JSON.parse it.
function brParseJSON(raw) {
  if (!raw) return null;
  let s = String(raw).trim();
  // strip code fences if present
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = s.indexOf("{");
  if (start === -1) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
    } else if (ch === '"') inStr = true;
    else if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) { try { return JSON.parse(s.slice(start, i + 1)); } catch (e) { return null; } } }
  }
  return null;
}

const BR_HOOK_BRIEF = {
  h1: "Problem then Solution — name a relatable pain, reveal the product as the fix",
  h2: "Unboxing reveal — anticipation, first look, the satisfying reveal",
  h3: "Before then After — the visible transformation nobody expected",
  h4: "Testimonial — a real-sounding personal endorsement / social proof",
  h5: "Trending audio — POV / trend-led, hooks into a current format",
};

// Per-platform copy rules used in adaptation.
function brPlatformRule(pid, lang) {
  const en = lang === "en";
  const m = {
    tiktok:   en ? "Punchy and casual, trend-aware, 1 emoji max, very short."
                 : "Singkat, santai, ikut tren, maksimal 1 emoji.",
    instagram:en ? "Cinematic and aspirational, one inviting line, 1 tasteful emoji."
                 : "Sinematik & aspiratif, satu kalimat mengajak, 1 emoji.",
    youtube:  en ? "Curiosity hook in the first words, end with 'link in bio', no emoji."
                 : "Hook penasaran di awal, akhiri 'link di bio', tanpa emoji.",
    linkedin: en ? "Professional, value-first, no slang, no emoji, full sentence."
                 : "Profesional, utamakan nilai, tanpa slang, tanpa emoji.",
    twitter:  en ? "Very short and witty, one line, no fluff."
                 : "Sangat singkat & cerdas, satu baris.",
  };
  return m[pid] || m.tiktok;
}

// One call → 5 hook scripts + base captions + hashtags for the whole campaign.
async function brAIGenerateCampaign({ product, desc, voice, platforms, lang }) {
  if (!(window.claude && typeof window.claude.complete === "function")) {
    throw new Error("AI unavailable");
  }
  const language = lang === "en" ? "English" : "Bahasa Indonesia";
  const angles = Object.entries(BR_HOOK_BRIEF).map(([k, v]) => `${k}=${v}`).join("; ");
  const prompt =
`You are BrandReel's short-form UGC script engine. Create video concepts for one product.
Product name: "${product}"
Product details: "${desc || "(none provided)"}"
Brand voice: "${voice}"
Target platforms: ${platforms.join(", ")}
Write everything in ${language}.

Produce FIVE hook variations, one per angle:
${angles}

Return ONLY minified JSON (no markdown, no commentary) with EXACTLY this shape:
{"hooks":{"h1":{"script":"...","caption":"..."},"h2":{"script":"...","caption":"..."},"h3":{"script":"...","caption":"..."},"h4":{"script":"...","caption":"..."},"h5":{"script":"...","caption":"..."}},"hashtags":["#tag","#tag"]}
Rules:
- "script" = the spoken opening hook line of the video. Max 14 words. Punchy, in the brand voice. No hashtags.
- "caption" = a base social caption (max 26 words) in the brand voice. No hashtags inside it.
- "hashtags" = 8 lowercase relevant hashtags, each starts with #, no spaces, specific to this product.`;

  const reply = await window.claude.complete(prompt);
  const data = brParseJSON(reply);
  if (!data || !data.hooks) throw new Error("bad AI response");
  // normalise
  const hooks = {};
  ["h1", "h2", "h3", "h4", "h5"].forEach((k) => {
    const h = data.hooks[k] || {};
    hooks[k] = {
      script: String(h.script || "").trim(),
      caption: String(h.caption || "").trim(),
    };
  });
  let hashtags = Array.isArray(data.hashtags) ? data.hashtags : [];
  hashtags = hashtags
    .map((t) => String(t).trim())
    .filter(Boolean)
    .map((t) => (t[0] === "#" ? t : "#" + t))
    .map((t) => t.replace(/\s+/g, ""))
    .slice(0, 8);
  if (hashtags.length < 3) hashtags = ["#eco", "#sustainable", "#ugc", "#brandreel"];
  return { hooks, hashtags };
}

// One call → a single platform-adapted caption for a chosen hook.
async function brAIAdaptCaption({ product, voice, angle, baseCaption, pid, lang }) {
  if (!(window.claude && typeof window.claude.complete === "function")) {
    throw new Error("AI unavailable");
  }
  const plat = BR_PLATFORMS[pid];
  const language = lang === "en" ? "English" : "Bahasa Indonesia";
  const prompt =
`Adapt a social caption for ${plat.name} (aspect ${plat.ratio}, ≤${plat.maxSec}s video).
Product: "${product}"
Brand voice: "${voice}"
Hook angle: ${BR_HOOK_BRIEF[angle] || angle}
Base caption: "${baseCaption}"
Platform style: ${brPlatformRule(pid, lang)}
Write in ${language}.

Return ONLY the final caption text — no quotes, no markdown, no labels.
End the caption with exactly ${plat.hashtags} relevant hashtags on their own line.
Hard limit: ${plat.capMax} characters total.`;

  const reply = await window.claude.complete(prompt);
  let text = String(reply || "").trim().replace(/^```[a-z]*|```$/gi, "").trim();
  // strip wrapping quotes the model sometimes adds
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    text = text.slice(1, -1).trim();
  }
  if (!text) throw new Error("empty caption");
  if (text.length > plat.capMax) text = text.slice(0, plat.capMax - 1).trimEnd() + "…";
  return { text, len: text.length, max: plat.capMax };
}

Object.assign(window, {
  brParseJSON, brAIGenerateCampaign, brAIAdaptCaption, BR_HOOK_BRIEF, brPlatformRule,
});
