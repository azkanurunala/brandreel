// src/lib/adapters/youtube.ts — Shorts via YouTube Data API v3, resumable
// upload (Bab 05). Unggah satu-PUT (cukup buat video pendek UGC ≤60d;
// video besar produksi sebaiknya di-chunk — lihat dokumentasi resumable upload).
import { baseValidate, type PlatformAdapter } from "./types.js";

export const youtubeAdapter: PlatformAdapter = {
  validate(input) {
    return baseValidate("youtube", input);
  },

  async publish({ accessToken, videoUrl, caption }) {
    const title = caption.split("\n")[0].slice(0, 95) + " #Shorts";

    const initRes = await fetch(
      "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": "video/mp4",
        },
        body: JSON.stringify({
          snippet: { title, description: caption, categoryId: "22" },
          status: { privacyStatus: "unlisted" }, // aman default; ubah ke "public" setelah siap
        }),
      }
    );
    if (!initRes.ok) throw new Error(`YouTube init error (${initRes.status})`);
    const uploadUrl = initRes.headers.get("location");
    if (!uploadUrl) throw new Error("YouTube tidak mengembalikan upload URL");

    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error(`Gagal ambil video dari storage (${videoRes.status})`);
    const videoBytes = await videoRes.arrayBuffer();

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "video/mp4" },
      body: Buffer.from(videoBytes),
    });
    const putData = await putRes.json();
    if (!putRes.ok) throw new Error(putData.error?.message ?? `YouTube upload error (${putRes.status})`);

    const videoId = putData.id as string;
    return { remoteId: videoId, permalink: `https://youtube.com/watch?v=${videoId}`, state: "posted" };
  },

  async fetchInsights(accessToken, remoteId) {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${remoteId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message ?? `YouTube insights error (${r.status})`);
    const stats = data.items?.[0]?.statistics;
    if (!stats) throw new Error("Video YouTube tidak ditemukan");
    return {
      views: Number(stats.viewCount ?? 0),
      likes: Number(stats.likeCount ?? 0),
      comments: Number(stats.commentCount ?? 0),
      shares: 0,
      reach: Number(stats.viewCount ?? 0),
    };
  },
};
