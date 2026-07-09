// src/lib/x.ts — OAuth 2.0 + PKCE buat X/Twitter (Bab 04).
// PKCE: code_verifier acak dibuat di START, code_challenge (SHA-256-nya)
// dikirim ke X; code_verifier asli dikirim lagi saat tukar token di CALLBACK
// supaya X yakin permintaan token dari pihak yang sama yang mulai alur.
import { createHash, randomBytes } from "node:crypto";
import { env } from "../env.js";

export class XUnavailableError extends Error {
  constructor() {
    super("X_CLIENT_ID/X_CLIENT_SECRET belum diisi (lihat Bab 15)");
    this.name = "XUnavailableError";
  }
}

const SCOPES = "tweet.write tweet.read users.read offline.access";

export function xRedirectUri(): string {
  return `${env.APP_BASE_URL}/auth/x/callback`;
}

export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export function buildXAuthorizeUrl(state: string, codeChallenge: string): string {
  if (!env.X_CLIENT_ID) throw new XUnavailableError();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.X_CLIENT_ID,
    redirect_uri: xRedirectUri(),
    scope: SCOPES,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });
  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}

export interface XTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

export async function exchangeXCode(code: string, codeVerifier: string): Promise<XTokenResponse> {
  if (!env.X_CLIENT_ID || !env.X_CLIENT_SECRET) throw new XUnavailableError();
  const basic = Buffer.from(`${env.X_CLIENT_ID}:${env.X_CLIENT_SECRET}`).toString("base64");
  const r = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${basic}` },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: env.X_CLIENT_ID,
      redirect_uri: xRedirectUri(),
      code_verifier: codeVerifier,
    }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error_description ?? data.error ?? `X token error (${r.status})`);
  return data as XTokenResponse;
}

export async function fetchXUserId(accessToken: string): Promise<string> {
  const r = await fetch("https://api.twitter.com/2/users/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.detail ?? `X user error (${r.status})`);
  return data.data.id as string;
}
