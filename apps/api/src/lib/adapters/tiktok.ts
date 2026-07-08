// src/lib/adapters/tiktok.ts — adapter TikTok (Bab 05): Content Posting API,
// sumber video PULL_FROM_URL (TikTok mengambil sendiri dari CDN kita, tak
// perlu chunk-upload manual). Catatan Bab 04: app yang belum lolos audit
// TikTok cuma bisa posting private — hasil publish() bisa berstatus "queued"
// bila TikTok belum menandainya publik.
import { baseValidate, NotImplementedError, type PlatformAdapter } from "./types.js";

const API = "https://open.tiktokapis.com/v2";

export const tiktokAdapter: PlatformAdapter = {
  validate(input) {
    return baseValidate("tiktok", input);
  },

  async publish({ accessToken, videoUrl, caption }) {
    const initRes = await fetch(`${API}/post/publish/video/init/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        post_info: {
          title: caption,
          privacy_level: "SELF_ONLY", // aman default sebelum app lolos audit publik (Bab 04)
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: { source: "PULL_FROM_URL", video_url: videoUrl },
      }),
    });
    const initData = await initRes.json();
    if (!initRes.ok || initData.error?.code !== "ok") {
      throw new Error(initData.error?.message ?? `TikTok init error (${initRes.status})`);
    }
    const publishId = initData.data.publish_id as string;

    // Poll status hingga selesai diproses (bukan menunggu publish publik).
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const statusRes = await fetch(`${API}/post/publish/status/fetch/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ publish_id: publishId }),
      });
      const statusData = await statusRes.json();
      const status = statusData?.data?.status;
      if (status === "PUBLISH_COMPLETE") {
        const postId = statusData.data.publicaly_available_post_id?.[0] ?? publishId;
        return { remoteId: String(postId), permalink: null, state: "posted" };
      }
      if (status === "FAILED") {
        throw new Error(statusData.data?.fail_reason ?? "TikTok publish gagal");
      }
    }
    // Belum selesai diproses saat batas polling habis — tetap tercatat queued (worker/UI bisa cek ulang).
    return { remoteId: publishId, permalink: null, state: "queued" };
  },

  async fetchInsights(accessToken, remoteId) {
    const r = await fetch(`${API}/video/query/?fields=id,view_count,like_count,comment_count,share_count`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ filters: { video_ids: [remoteId] } }),
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message ?? `TikTok insights error (${r.status})`);
    const v = data.data?.videos?.[0];
    if (!v) throw new NotImplementedError("tiktok:fetchInsights (video tidak ditemukan)");
    return {
      views: v.view_count ?? 0,
      likes: v.like_count ?? 0,
      comments: v.comment_count ?? 0,
      shares: v.share_count ?? 0,
      reach: v.view_count ?? 0,
    };
  },
};
