// src/lib/tiktok.ts — Login Kit TikTok: authorize URL + tukar code/refresh token (Bab 04)
// TikTok v2 MEWAJIBKAN PKCE (code_challenge/code_verifier) — tanpa ini
// authorize redirect balik dengan error_type=code_challenge. Pola sama
// persis kayak x.ts (generatePkce diimpor dari sana di routes/oauth.ts).
import { env } from "../env.js";

export class TikTokUnavailableError extends Error {
  constructor() {
    super("TIKTOK_CLIENT_KEY/TIKTOK_CLIENT_SECRET belum diisi (lihat Bab 15)");
    this.name = "TikTokUnavailableError";
  }
}

const SCOPES = "video.publish,video.upload,user.info.basic,user.info.stats";

export function tiktokRedirectUri(): string {
  return `${env.APP_BASE_URL}/auth/tiktok/callback`;
}

export function buildTikTokAuthorizeUrl(state: string, codeChallenge: string): string {
  if (!env.TIKTOK_CLIENT_KEY) throw new TikTokUnavailableError();
  const params = new URLSearchParams({
    client_key: env.TIKTOK_CLIENT_KEY,
    scope: SCOPES,
    response_type: "code",
    redirect_uri: tiktokRedirectUri(),
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
}

export interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  open_id: string;
  scope: string;
  token_type: string;
}

export async function exchangeTikTokCode(code: string, codeVerifier: string): Promise<TikTokTokenResponse> {
  if (!env.TIKTOK_CLIENT_KEY || !env.TIKTOK_CLIENT_SECRET) throw new TikTokUnavailableError();
  const r = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: tiktokRedirectUri(),
      code_verifier: codeVerifier,
    }),
  });
  const data = await r.json();
  if (!r.ok || data.error) throw new Error(data.error_description ?? data.error ?? `TikTok token error (${r.status})`);
  return data as TikTokTokenResponse;
}

export async function refreshTikTokToken(refreshToken: string): Promise<TikTokTokenResponse> {
  if (!env.TIKTOK_CLIENT_KEY || !env.TIKTOK_CLIENT_SECRET) throw new TikTokUnavailableError();
  const r = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: env.TIKTOK_CLIENT_KEY,
      client_secret: env.TIKTOK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const data = await r.json();
  if (!r.ok || data.error) throw new Error(data.error_description ?? data.error ?? `TikTok refresh error (${r.status})`);
  return data as TikTokTokenResponse;
}
