// src/lib/adapters/facebook.ts — posting video ke Facebook Page (Bab 05).
// accessToken = Page access token; connection.remoteUserId = Page id.
import { baseValidate, type PlatformAdapter } from "./types.js";

const GRAPH = "https://graph.facebook.com/v19.0";

function splitToken(accessToken: string): { pageId: string; token: string } {
  const i = accessToken.indexOf(":");
  if (i === -1) throw new Error("Format token Facebook tidak valid (pageId hilang)");
  return { pageId: accessToken.slice(0, i), token: accessToken.slice(i + 1) };
}

export const facebookAdapter: PlatformAdapter = {
  validate(input) {
    return baseValidate("facebook", input);
  },

  async publish({ accessToken, videoUrl, caption }) {
    const { pageId, token } = splitToken(accessToken);
    const r = await fetch(`${GRAPH}/${pageId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file_url: videoUrl, description: caption, access_token: token }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message ?? `Facebook publish error (${r.status})`);
    const videoId = data.id as string;
    return { remoteId: videoId, permalink: `https://www.facebook.com/${pageId}/videos/${videoId}`, state: "posted" };
  },

  async fetchInsights(accessToken, remoteId) {
    const { token } = splitToken(accessToken);
    const r = await fetch(`${GRAPH}/${remoteId}?fields=likes.summary(true),comments.summary(true)&access_token=${token}`);
    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message ?? `Facebook insights error (${r.status})`);
    return {
      views: 0, // butuh video_insights (izin tambahan) — lihat Bab 05 kalau perlu detail
      likes: data.likes?.summary?.total_count ?? 0,
      comments: data.comments?.summary?.total_count ?? 0,
      shares: 0,
      reach: 0,
    };
  },
};
