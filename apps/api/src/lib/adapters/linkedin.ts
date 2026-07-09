// src/lib/adapters/linkedin.ts — posting video via LinkedIn UGC API (Bab 05).
// Catatan: API LinkedIn sering berganti versi — cek dokumentasi resmi
// (learn.microsoft.com/linkedin) kalau endpoint di sini mulai ditolak.
import { baseValidate, NotImplementedError, type PlatformAdapter } from "./types.js";

// accessToken = "{memberId}:{token}" (memberId dari OpenID 'sub', lihat lib/linkedin.ts).
function splitToken(accessToken: string): { memberId: string; token: string } {
  const i = accessToken.indexOf(":");
  if (i === -1) throw new Error("Format token LinkedIn tidak valid (memberId hilang)");
  return { memberId: accessToken.slice(0, i), token: accessToken.slice(i + 1) };
}

export const linkedinAdapter: PlatformAdapter = {
  validate(input) {
    return baseValidate("linkedin", input);
  },

  async publish({ accessToken, videoUrl, caption }) {
    const { memberId, token } = splitToken(accessToken);
    const author = `urn:li:person:${memberId}`;
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    };

    const regRes = await fetch("https://api.linkedin.com/v2/assets?action=registerUpload", {
      method: "POST",
      headers,
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ["urn:li:digitalmediaRecipe:feedshare-video"],
          owner: author,
          serviceRelationships: [{ relationshipType: "OWNER", identifier: "urn:li:userGeneratedContent" }],
        },
      }),
    });
    const regData = await regRes.json();
    if (!regRes.ok) throw new Error(regData.message ?? `LinkedIn register upload error (${regRes.status})`);
    const uploadUrl = regData.value.uploadMechanism["com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"].uploadUrl as string;
    const asset = regData.value.asset as string;

    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) throw new Error(`Gagal ambil video dari storage (${videoRes.status})`);
    const videoBytes = await videoRes.arrayBuffer();
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: Buffer.from(videoBytes),
    });
    if (!putRes.ok) throw new Error(`LinkedIn upload video error (${putRes.status})`);

    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers,
      body: JSON.stringify({
        author,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: caption },
            shareMediaCategory: "VIDEO",
            media: [{ status: "READY", media: asset }],
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });
    const postId = postRes.headers.get("x-restli-id");
    if (!postRes.ok || !postId) {
      const err = await postRes.json().catch(() => ({}));
      throw new Error(err.message ?? `LinkedIn post error (${postRes.status})`);
    }

    return { remoteId: postId, permalink: `https://www.linkedin.com/feed/update/${postId}`, state: "posted" };
  },

  async fetchInsights() {
    // Statistik per-post LinkedIn butuh izin organisasi (r_organization_social)
    // di luar scope w_member_social/openid yang dipakai alur login pribadi.
    throw new NotImplementedError("linkedin:fetchInsights (butuh izin organisasi tambahan)");
  },
};
