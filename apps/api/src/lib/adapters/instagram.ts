// src/lib/adapters/instagram.ts — Reels via Meta Graph API, 2-langkah
// container (Bab 05): buat container -> poll status -> publish container.
// accessToken = Page access token; connection.remoteUserId = IG business account id.
import { baseValidate, type PlatformAdapter } from "./types.js";

const GRAPH = "https://graph.facebook.com/v19.0";

// Adapter butuh IG business account id, tapi bentuk PublishInput generik cuma
// bawa accessToken. Kita simpan igUserId di bagian depan accessToken saat
// disimpan ke vault (lihat routes/oauth.ts callback instagram) memakai
// format "{igUserId}:{token}" supaya tak perlu ubah skema Connection.
function splitToken(accessToken: string): { igUserId: string; token: string } {
  const i = accessToken.indexOf(":");
  if (i === -1) throw new Error("Format token Instagram tidak valid (igUserId hilang)");
  return { igUserId: accessToken.slice(0, i), token: accessToken.slice(i + 1) };
}

export const instagramAdapter: PlatformAdapter = {
  validate(input) {
    return baseValidate("instagram", input);
  },

  async publish({ accessToken, videoUrl, caption }) {
    const { igUserId, token } = splitToken(accessToken);

    const createRes = await fetch(`${GRAPH}/${igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ media_type: "REELS", video_url: videoUrl, caption, access_token: token }),
    });
    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(createData.error?.message ?? `IG container error (${createRes.status})`);
    const creationId = createData.id as string;

    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const statusRes = await fetch(`${GRAPH}/${creationId}?fields=status_code&access_token=${token}`);
      const statusData = await statusRes.json();
      if (statusData.status_code === "FINISHED") break;
      if (statusData.status_code === "ERROR") throw new Error("IG gagal proses video (status ERROR)");
      if (i === 19) throw new Error("IG timeout — video belum selesai diproses");
    }

    const publishRes = await fetch(`${GRAPH}/${igUserId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: creationId, access_token: token }),
    });
    const publishData = await publishRes.json();
    if (!publishRes.ok) throw new Error(publishData.error?.message ?? `IG publish error (${publishRes.status})`);
    const mediaId = publishData.id as string;

    const permaRes = await fetch(`${GRAPH}/${mediaId}?fields=permalink&access_token=${token}`);
    const permaData = await permaRes.json();

    return { remoteId: mediaId, permalink: permaData.permalink ?? null, state: "posted" };
  },

  async fetchInsights(accessToken, remoteId) {
    const { token } = splitToken(accessToken);
    const r = await fetch(`${GRAPH}/${remoteId}/insights?metric=reach,likes,comments,shares,plays&access_token=${token}`);
    const data = await r.json();
    if (!r.ok) throw new Error(data.error?.message ?? `IG insights error (${r.status})`);
    const val = (name: string) => (data.data as any[])?.find((m) => m.name === name)?.values?.[0]?.value ?? 0;
    return { views: val("plays"), likes: val("likes"), comments: val("comments"), shares: val("shares"), reach: val("reach") };
  },
};
