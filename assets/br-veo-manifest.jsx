// BrandReel — Veo clip manifest.
// Maps a (campaignId → hookId → aspectRatio) to a REAL pre-generated video file
// (e.g. a Google Veo render saved under assets/veo/). When an entry exists the
// campaign detail screen plays the real file instead of the in-browser canvas
// render; when it doesn't, it falls back to brRenderUGCVideo() automatically.
//
// ── How to add real clips (once Veo credits are available) ──────────────
// 1. Generate a clip (9:16 / 1:1 / 16:9 to match the platform).
// 2. Drop the file in assets/veo/  e.g. assets/veo/bamboo-h3-916.mp4
// 3. Add an entry below, keyed by campaign id → hook → ratio.
// No other code changes are needed — the renderer picks it up on next load.
//
// You can also inject clips at runtime without editing this file by setting
// window.__brVeoClips before the app mounts, same shape as BR_VEO_CLIPS.

const BR_VEO_CLIPS = {
  // ── Example (uncomment + drop the file in once a clip exists) ──
  // "c-bamboo-tb": {
  //   h3: { "9:16": "assets/veo/bamboo-h3-916.mp4" },
  //   h2: { "9:16": "assets/veo/bamboo-h2-916.mp4" },
  //   h1: { "9:16": "assets/veo/bamboo-h1-916.mp4" },
  // },
};

// Resolve a real clip URL for a campaign+hook+ratio, or null if none exists.
function brVeoClip(campaignId, hookId, ratio) {
  const src = (window.__brVeoClips && typeof window.__brVeoClips === "object")
    ? { ...BR_VEO_CLIPS, ...window.__brVeoClips }
    : BR_VEO_CLIPS;
  const c = src[campaignId];
  if (!c) return null;
  const h = c[hookId];
  if (!h) return null;
  return h[ratio] || null;
}

// True if ANY real Veo clip is registered (used to show the "real footage" badge
// only when it's earned).
function brHasVeo() {
  const src = (window.__brVeoClips && typeof window.__brVeoClips === "object")
    ? { ...BR_VEO_CLIPS, ...window.__brVeoClips }
    : BR_VEO_CLIPS;
  return Object.keys(src).length > 0;
}

Object.assign(window, { BR_VEO_CLIPS, brVeoClip, brHasVeo });
