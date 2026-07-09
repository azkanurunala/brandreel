// src/lib/linkedin.ts — OAuth LinkedIn (Bab 04).
// Catatan: API LinkedIn sering berganti versi (REST API vs UGC API lama) —
// cek dokumentasi resmi kalau endpoint di sini mulai menolak (lihat Bab 04 §5).
import { env } from "../env.js";

export class LinkedInUnavailableError extends Error {
  constructor() {
    super("LINKEDIN_CLIENT_ID/LINKEDIN_CLIENT_SECRET belum diisi (lihat Bab 15)");
    this.name = "LinkedInUnavailableError";
  }
}

const SCOPES = "openid profile w_member_social";

export function linkedinRedirectUri(): string {
  return `${env.APP_BASE_URL}/auth/linkedin/callback`;
}

export function buildLinkedInAuthorizeUrl(state: string): string {
  if (!env.LINKEDIN_CLIENT_ID) throw new LinkedInUnavailableError();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.LINKEDIN_CLIENT_ID,
    redirect_uri: linkedinRedirectUri(),
    state,
    scope: SCOPES,
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

export interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export async function exchangeLinkedInCode(code: string): Promise<LinkedInTokenResponse> {
  if (!env.LINKEDIN_CLIENT_ID || !env.LINKEDIN_CLIENT_SECRET) throw new LinkedInUnavailableError();
  const r = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: linkedinRedirectUri(),
      client_id: env.LINKEDIN_CLIENT_ID,
      client_secret: env.LINKEDIN_CLIENT_SECRET,
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error_description ?? data.error ?? `LinkedIn token error (${r.status})`);
  return data as LinkedInTokenResponse;
}

// 'sub' dari userinfo OpenID = ID member LinkedIn (dipakai sebagai remoteUserId & author URN).
export async function fetchLinkedInMemberId(accessToken: string): Promise<string> {
  const r = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.message ?? `LinkedIn userinfo error (${r.status})`);
  if (!data.sub) throw new Error("LinkedIn tidak mengembalikan ID member");
  return data.sub as string;
}
