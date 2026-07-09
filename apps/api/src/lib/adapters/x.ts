// src/lib/adapters/x.ts — posting via X API v2 tweets + media upload v1.1
// chunked (INIT/APPEND/FINALIZE), Bab 05.
import { baseValidate, type PlatformAdapter } from "./types.js";

const CHUNK_SIZE = 4 * 1024 * 1024; // 4MB per chunk

export const xAdapter: PlatformAdapter = {
  validate(input) {
    return baseValidate("x", input);
  },

  async publish({ accessToken, videoUrl, caption }) {
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error(`Gagal ambil video dari storage (${videoRes.status})`);
    const bytes = Buffer.from(await videoRes.arrayBuffer());

    const initForm = new URLSearchParams({
      command: "INIT",
      media_type: "video/mp4",
      media_category: "tweet_video",
      total_bytes: String(bytes.length),
    });
    const initRes = await fetch(`https://upload.twitter.com/1.1/media/upload.json?${initForm}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const initData = await initRes.json();
    if (!initRes.ok) throw new Error(initData.errors?.[0]?.message ?? `X media INIT error (${initRes.status})`);
    const mediaId = initData.media_id_string as string;

    for (let offset = 0, segment = 0; offset < bytes.length; offset += CHUNK_SIZE, segment++) {
      const chunk = bytes.subarray(offset, offset + CHUNK_SIZE);
      const form = new FormData();
      form.append("command", "APPEND");
      form.append("media_id", mediaId);
      form.append("segment_index", String(segment));
      form.append("media", new Blob([chunk]));
      const appendRes = await fetch("https://upload.twitter.com/1.1/media/upload.json", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form,
      });
      if (!appendRes.ok) throw new Error(`X media APPEND error (${appendRes.status}) segment ${segment}`);
    }

    const finalizeForm = new URLSearchParams({ command: "FINALIZE", media_id: mediaId });
    const finalizeRes = await fetch(`https://upload.twitter.com/1.1/media/upload.json?${finalizeForm}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const finalizeData = await finalizeRes.json();
    if (!finalizeRes.ok) throw new Error(finalizeData.errors?.[0]?.message ?? `X media FINALIZE error (${finalizeRes.status})`);

    let processingSec = finalizeData.processing_info?.check_after_secs ?? 0;
    for (let i = 0; i < 20 && finalizeData.processing_info; i++) {
      if (processingSec > 0) await new Promise((r) => setTimeout(r, processingSec * 1000));
      const statusForm = new URLSearchParams({ command: "STATUS", media_id: mediaId });
      const statusRes = await fetch(`https://upload.twitter.com/1.1/media/upload.json?${statusForm}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const statusData = await statusRes.json();
      const state = statusData.processing_info?.state;
      if (state === "succeeded" || !state) break;
      if (state === "failed") throw new Error(statusData.processing_info?.error?.message ?? "X gagal proses media");
      processingSec = statusData.processing_info?.check_after_secs ?? 3;
    }

    const tweetRes = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ text: caption, media: { media_ids: [mediaId] } }),
    });
    const tweetData = await tweetRes.json();
    if (!tweetRes.ok) throw new Error(tweetData.detail ?? `X tweet error (${tweetRes.status})`);
    const tweetId = tweetData.data.id as string;

    return { remoteId: tweetId, permalink: `https://x.com/i/status/${tweetId}`, state: "posted" };
  },

  async fetchInsights(accessToken, remoteId) {
    const r = await fetch(`https://api.twitter.com/2/tweets/${remoteId}?tweet.fields=public_metrics`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.detail ?? `X insights error (${r.status})`);
    const m = data.data?.public_metrics;
    if (!m) throw new Error("Tweet tidak ditemukan");
    return { views: m.impression_count ?? 0, likes: m.like_count ?? 0, comments: m.reply_count ?? 0, shares: m.retweet_count ?? 0, reach: m.impression_count ?? 0 };
  },
};
