// src/lib/meta.ts — OAuth Meta (Instagram + Facebook berbagi App yang sama), Bab 04.
// Alur: Facebook Login -> tukar code jadi user token -> tukar jadi long-lived
// -> ambil Page (kita pakai Page pertama yang dikelola akun — MVP; kalau
// user punya banyak Page, tambahkan langkah pilih Page di UI nanti) -> untuk
// Instagram, ambil instagram_business_account milik Page tsb.
import { env } from "../env.js";

export class MetaUnavailableError extends Error {
  constructor() {
    super("META_APP_ID/META_APP_SECRET belum diisi (lihat Bab 15)");
    this.name = "MetaUnavailableError";
  }
}

const GRAPH = "https://graph.facebook.com/v19.0";
const IG_SCOPES = "instagram_basic,instagram_content_publish,pages_show_list,business_management";
const FB_SCOPES = "pages_manage_posts,pages_read_engagement,pages_show_list";

export function metaRedirectUri(platform: "instagram" | "facebook"): string {
  return `${env.APP_BASE_URL}/auth/${platform}/callback`;
}

export function buildMetaAuthorizeUrl(platform: "instagram" | "facebook", state: string): string {
  if (!env.META_APP_ID) throw new MetaUnavailableError();
  const params = new URLSearchParams({
    client_id: env.META_APP_ID,
    redirect_uri: metaRedirectUri(platform),
    state,
    response_type: "code",
    scope: platform === "instagram" ? IG_SCOPES : FB_SCOPES,
  });
  return `https://www.facebook.com/v19.0/dialog/oauth?${params.toString()}`;
}

export interface MetaPageConnection {
  pageId: string;
  pageAccessToken: string;
  pageName: string;
  instagramBusinessId: string | null; // hanya terisi kalau platform=instagram & Page-nya tertaut IG
}

// Tukar code -> user token -> long-lived -> Page + (opsional) IG business account.
export async function exchangeMetaCode(platform: "instagram" | "facebook", code: string): Promise<MetaPageConnection> {
  if (!env.META_APP_ID || !env.META_APP_SECRET) throw new MetaUnavailableError();

  const tokenRes = await fetch(
    `${GRAPH}/oauth/access_token?${new URLSearchParams({
      client_id: env.META_APP_ID,
      redirect_uri: metaRedirectUri(platform),
      client_secret: env.META_APP_SECRET,
      code,
    })}`
  );
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(tokenData.error?.message ?? `Meta token error (${tokenRes.status})`);

  const longRes = await fetch(
    `${GRAPH}/oauth/access_token?${new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: env.META_APP_ID,
      client_secret: env.META_APP_SECRET,
      fb_exchange_token: tokenData.access_token,
    })}`
  );
  const longData = await longRes.json();
  if (!longRes.ok) throw new Error(longData.error?.message ?? `Meta long-lived token error (${longRes.status})`);
  const userToken = longData.access_token as string;

  const pagesRes = await fetch(`${GRAPH}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userToken}`);
  const pagesData = await pagesRes.json();
  if (!pagesRes.ok) throw new Error(pagesData.error?.message ?? `Meta pages error (${pagesRes.status})`);
  const page = pagesData.data?.[0];
  if (!page) throw new Error("Tidak ada Facebook Page yang bisa dikelola akun ini");

  if (platform === "instagram" && !page.instagram_business_account) {
    throw new Error("Page ini belum tertaut akun Instagram Business/Creator — lihat Bab 04");
  }

  return {
    pageId: page.id,
    pageAccessToken: page.access_token,
    pageName: page.name,
    instagramBusinessId: page.instagram_business_account?.id ?? null,
  };
}
