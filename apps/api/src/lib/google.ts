// src/lib/google.ts — OAuth Google buat YouTube (Bab 04).
import { env } from "../env.js";

export class GoogleUnavailableError extends Error {
  constructor() {
    super("GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET belum diisi (lihat Bab 15)");
    this.name = "GoogleUnavailableError";
  }
}

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/yt-analytics.readonly",
].join(" ");

export function googleRedirectUri(): string {
  return `${env.APP_BASE_URL}/auth/youtube/callback`;
}

export function buildGoogleAuthorizeUrl(state: string): string {
  if (!env.GOOGLE_CLIENT_ID) throw new GoogleUnavailableError();
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: SCOPES,
    access_type: "offline", // wajib supaya dapat refresh_token
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export async function exchangeGoogleCode(code: string): Promise<GoogleTokenResponse> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) throw new GoogleUnavailableError();
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error_description ?? data.error ?? `Google token error (${r.status})`);
  return data as GoogleTokenResponse;
}

export async function refreshGoogleToken(refreshToken: string): Promise<GoogleTokenResponse> {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) throw new GoogleUnavailableError();
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error_description ?? data.error ?? `Google refresh error (${r.status})`);
  return data as GoogleTokenResponse;
}

export async function fetchYouTubeChannelId(accessToken: string): Promise<string> {
  const r = await fetch("https://www.googleapis.com/youtube/v3/channels?part=id&mine=true", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error?.message ?? `YouTube channel error (${r.status})`);
  const id = data.items?.[0]?.id;
  if (!id) throw new Error("Channel YouTube tidak ditemukan untuk akun ini");
  return id;
}
