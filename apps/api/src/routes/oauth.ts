// src/routes/oauth.ts — alur OAuth 3-langkah: start -> consent -> callback (Bab 04)
// Semua 6 platform diimplementasi. Instagram/Facebook/LinkedIn menyimpan
// "{id}:{token}" sebagai access_token di vault (adapter publish butuh id
// Page/IG-account/member selain token) — lihat lib/adapters/{instagram,
// facebook,linkedin}.ts. X pakai PKCE (Bab 04 §2), verifier disimpan
// sebentar bareng state.
import { randomBytes } from "node:crypto";
import { Router } from "express";
import { prisma } from "../db.js";
import { encryptTokenRef, decryptTokenRef } from "../lib/vault.js";
import { buildTikTokAuthorizeUrl, exchangeTikTokCode, refreshTikTokToken } from "../lib/tiktok.js";
import { buildMetaAuthorizeUrl, exchangeMetaCode } from "../lib/meta.js";
import { buildGoogleAuthorizeUrl, exchangeGoogleCode, refreshGoogleToken, fetchYouTubeChannelId } from "../lib/google.js";
import { buildLinkedInAuthorizeUrl, exchangeLinkedInCode, fetchLinkedInMemberId } from "../lib/linkedin.js";
import { buildXAuthorizeUrl, exchangeXCode, fetchXUserId, generatePkce } from "../lib/x.js";
import { requireAuth } from "../middleware/auth.js";

export const oauthRouter = Router();

// State anti-CSRF (Bab 04 §2) — tautkan state acak ke accountId sebelum
// redirect ke platform. Map di memori proses; produksi multi-instance
// sebaiknya pakai Redis dengan TTL (lihat queue.ts untuk koneksi Redis yang sudah ada).
const pendingState = new Map<string, { accountId: string; platform: string; createdAt: number; pkceVerifier?: string }>();
const STATE_TTL_MS = 10 * 60 * 1000;

function cleanupExpiredState() {
  const now = Date.now();
  for (const [k, v] of pendingState) if (now - v.createdAt > STATE_TTL_MS) pendingState.delete(k);
}

// POST /auth/:platform/start — bikin state, balas URL izin platform
// (accountId dari sesi login, BUKAN dari body — cegah orang mulai OAuth
// atas nama akun orang lain)
oauthRouter.post("/auth/:platform/start", requireAuth, (req, res) => {
  const platform = req.params.platform;

  cleanupExpiredState();
  const state = randomBytes(24).toString("hex");
  const entry: { accountId: string; platform: string; createdAt: number; pkceVerifier?: string } = {
    accountId: req.accountId!, platform, createdAt: Date.now(),
  };

  try {
    let consentUrl: string;
    switch (platform) {
      case "tiktok":
        consentUrl = buildTikTokAuthorizeUrl(state);
        break;
      case "instagram":
      case "facebook":
        consentUrl = buildMetaAuthorizeUrl(platform, state);
        break;
      case "youtube":
        consentUrl = buildGoogleAuthorizeUrl(state);
        break;
      case "linkedin":
        consentUrl = buildLinkedInAuthorizeUrl(state);
        break;
      case "x": {
        const pkce = generatePkce();
        entry.pkceVerifier = pkce.verifier;
        consentUrl = buildXAuthorizeUrl(state, pkce.challenge);
        break;
      }
      default:
        return res.status(400).json({ error: `Platform ${platform} tidak dikenal` });
    }
    pendingState.set(state, entry);
    res.json({ consentUrl, state });
  } catch (err: any) {
    res.status(501).json({ error: err.message });
  }
});

// GET /auth/:platform/callback — platform redirect balik dengan ?code&state
oauthRouter.get("/auth/:platform/callback", async (req, res) => {
  const platform = req.params.platform;
  const { code, state, error: platformError } = req.query as Record<string, string>;

  function fail(message: string) {
    res.status(400).send(
      `<html><body style="font-family:sans-serif;padding:24px">` +
      `<h3>Gagal menghubungkan ${platform}</h3><p>${message}</p>` +
      `<p><a href="brandreel://oauth-callback?platform=${platform}&status=error">Kembali ke aplikasi</a></p>` +
      `</body></html>`
    );
  }
  function success() {
    res.send(
      `<html><body style="font-family:sans-serif;padding:24px">` +
      `<h3>Akun ${platform} berhasil terhubung!</h3><p>Kamu bisa menutup halaman ini.</p>` +
      `<script>setTimeout(function(){location.href="brandreel://oauth-callback?platform=${platform}&status=ok";}, 400);</script>` +
      `<p><a href="brandreel://oauth-callback?platform=${platform}&status=ok">Kembali ke aplikasi</a></p>` +
      `</body></html>`
    );
  }

  if (platformError) return fail(String(platformError));
  if (!code || !state) return fail("code atau state tidak ada");

  const pending = pendingState.get(state);
  pendingState.delete(state);
  if (!pending || pending.platform !== platform) return fail("state tidak valid atau kedaluwarsa — coba hubungkan ulang");

  try {
    let remoteUserId: string;
    let tokenRefPayload: Record<string, unknown>;
    let scopes: string[];
    let expiresAt: Date;

    switch (platform) {
      case "tiktok": {
        const tokens = await exchangeTikTokCode(code);
        remoteUserId = tokens.open_id;
        tokenRefPayload = { access_token: tokens.access_token, refresh_token: tokens.refresh_token };
        scopes = tokens.scope.split(",");
        expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
        break;
      }
      case "instagram":
      case "facebook": {
        const page = await exchangeMetaCode(platform, code);
        remoteUserId = platform === "instagram" ? page.instagramBusinessId! : page.pageId;
        tokenRefPayload = { access_token: `${remoteUserId}:${page.pageAccessToken}` };
        scopes = platform === "instagram"
          ? ["instagram_basic", "instagram_content_publish"]
          : ["pages_manage_posts", "pages_read_engagement"];
        expiresAt = new Date(Date.now() + 60 * 24 * 3600 * 1000); // Page token Meta ~60 hari
        break;
      }
      case "youtube": {
        const tokens = await exchangeGoogleCode(code);
        remoteUserId = await fetchYouTubeChannelId(tokens.access_token);
        tokenRefPayload = { access_token: tokens.access_token, refresh_token: tokens.refresh_token };
        scopes = tokens.scope.split(" ");
        expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
        break;
      }
      case "linkedin": {
        const tokens = await exchangeLinkedInCode(code);
        const memberId = await fetchLinkedInMemberId(tokens.access_token);
        remoteUserId = memberId;
        tokenRefPayload = { access_token: `${memberId}:${tokens.access_token}`, refresh_token: tokens.refresh_token };
        scopes = ["w_member_social"];
        expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
        break;
      }
      case "x": {
        if (!pending.pkceVerifier) throw new Error("PKCE verifier hilang — mulai ulang dari /auth/x/start");
        const tokens = await exchangeXCode(code, pending.pkceVerifier);
        remoteUserId = await fetchXUserId(tokens.access_token);
        tokenRefPayload = { access_token: tokens.access_token, refresh_token: tokens.refresh_token };
        scopes = tokens.scope.split(" ");
        expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
        break;
      }
      default:
        throw new Error(`Platform ${platform} tidak dikenal`);
    }

    const tokenRef = encryptTokenRef(tokenRefPayload);
    await prisma.connection.upsert({
      where: { accountId_platform_remoteUserId: { accountId: pending.accountId, platform: platform as any, remoteUserId } },
      update: { tokenRef, scopes, status: "active", expiresAt },
      create: { accountId: pending.accountId, platform: platform as any, remoteUserId, tokenRef, scopes, status: "active", expiresAt },
    });

    success();
  } catch (err: any) {
    console.error(err);
    fail(err.message ?? "Gagal menukar code ke token");
  }
});

// POST /connections/:id/refresh — perpanjang token sebelum kedaluwarsa (Bab 04 §4)
oauthRouter.post("/connections/:id/refresh", requireAuth, async (req, res) => {
  const conn = await prisma.connection.findUnique({ where: { id: req.params.id } });
  if (!conn || conn.accountId !== req.accountId) return res.status(404).json({ error: "Koneksi tidak ditemukan" });

  try {
    let tokenRef: string;
    let expiresAt: Date;

    if (conn.platform === "tiktok") {
      const current = decryptTokenRef<{ refresh_token: string }>(conn.tokenRef);
      const tokens = await refreshTikTokToken(current.refresh_token);
      tokenRef = encryptTokenRef({ access_token: tokens.access_token, refresh_token: tokens.refresh_token });
      expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    } else if (conn.platform === "youtube") {
      const current = decryptTokenRef<{ refresh_token: string }>(conn.tokenRef);
      const tokens = await refreshGoogleToken(current.refresh_token);
      tokenRef = encryptTokenRef({ access_token: tokens.access_token, refresh_token: current.refresh_token });
      expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
    } else {
      // Instagram/Facebook (Page token ~60 hari), LinkedIn, X: belum ada
      // mekanisme refresh otomatis di sini — user connect ulang manual dari Profile.
      throw new Error(`Refresh ${conn.platform} belum diimplementasi — hubungkan ulang manual`);
    }

    const updated = await prisma.connection.update({
      where: { id: conn.id },
      data: { tokenRef, status: "active", expiresAt },
    });
    res.json({ id: updated.id, status: updated.status, expiresAt: updated.expiresAt });
  } catch (err: any) {
    await prisma.connection.update({ where: { id: conn.id }, data: { status: "expired" } });
    console.error(err);
    res.status(502).json({ error: err.message });
  }
});
