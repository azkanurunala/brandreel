// src/routes/oauth.ts — alur OAuth 3-langkah: start -> consent -> callback (Bab 04)
// Baru TikTok yang diimplementasi penuh; platform lain (Instagram/YouTube/
// LinkedIn/X/Facebook) mengikuti pola identik — lihat Bab 04 §5 untuk scope
// & dokumentasi tiap platform saat menambahkannya.
import { randomBytes } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { encryptTokenRef } from "../lib/vault.js";
import { buildTikTokAuthorizeUrl, exchangeTikTokCode, refreshTikTokToken } from "../lib/tiktok.js";
import { env } from "../env.js";

export const oauthRouter = Router();

// State anti-CSRF (Bab 04 §2) — tautkan state acak ke accountId sebelum
// redirect ke platform. Map di memori proses; produksi multi-instance
// sebaiknya pakai Redis dengan TTL (lihat queue.ts untuk koneksi Redis yang sudah ada).
const pendingState = new Map<string, { accountId: string; platform: string; createdAt: number }>();
const STATE_TTL_MS = 10 * 60 * 1000;

function cleanupExpiredState() {
  const now = Date.now();
  for (const [k, v] of pendingState) if (now - v.createdAt > STATE_TTL_MS) pendingState.delete(k);
}

const startSchema = z.object({ accountId: z.string() });

// POST /auth/:platform/start — bikin state, balas URL izin platform
oauthRouter.post("/auth/:platform/start", (req, res) => {
  const platform = req.params.platform;
  const parsed = startSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  cleanupExpiredState();
  const state = randomBytes(24).toString("hex");
  pendingState.set(state, { accountId: parsed.data.accountId, platform, createdAt: Date.now() });

  try {
    let consentUrl: string;
    switch (platform) {
      case "tiktok":
        consentUrl = buildTikTokAuthorizeUrl(state);
        break;
      default:
        return res.status(501).json({ error: `OAuth ${platform} belum diimplementasi — lihat Bab 04` });
    }
    res.json({ consentUrl, state });
  } catch (err: any) {
    pendingState.delete(state);
    res.status(501).json({ error: err.message });
  }
});

// GET /auth/:platform/callback — platform redirect balik dengan ?code&state
oauthRouter.get("/auth/:platform/callback", async (req, res) => {
  const platform = req.params.platform;
  const { code, state, error: platformError } = req.query as Record<string, string>;
  const appReturnUrl = `${env.WEB_APP_URL.replace(/\/$/, "")}`;

  function fail(message: string) {
    res.status(400).send(
      `<html><body style="font-family:sans-serif;padding:24px">` +
      `<h3>Gagal menghubungkan ${platform}</h3><p>${message}</p>` +
      `<p><a href="brandreel://oauth-callback?platform=${platform}&status=error">Kembali ke aplikasi</a></p>` +
      `</body></html>`
    );
  }

  if (platformError) return fail(String(platformError));
  if (!code || !state) return fail("code atau state tidak ada");

  const pending = pendingState.get(state);
  pendingState.delete(state);
  if (!pending || pending.platform !== platform) return fail("state tidak valid atau kedaluwarsa — coba hubungkan ulang");

  try {
    if (platform !== "tiktok") throw new Error(`OAuth ${platform} belum diimplementasi`);

    const tokens = await exchangeTikTokCode(code);
    const tokenRef = encryptTokenRef({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    await prisma.connection.upsert({
      where: {
        accountId_platform_remoteUserId: {
          accountId: pending.accountId,
          platform: "tiktok",
          remoteUserId: tokens.open_id,
        },
      },
      update: {
        tokenRef,
        scopes: tokens.scope.split(","),
        status: "active",
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      },
      create: {
        accountId: pending.accountId,
        platform: "tiktok",
        remoteUserId: tokens.open_id,
        tokenRef,
        scopes: tokens.scope.split(","),
        status: "active",
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    res.send(
      `<html><body style="font-family:sans-serif;padding:24px">` +
      `<h3>Akun ${platform} berhasil terhubung!</h3><p>Kamu bisa menutup halaman ini.</p>` +
      `<script>setTimeout(function(){location.href="brandreel://oauth-callback?platform=${platform}&status=ok";}, 400);</script>` +
      `<p><a href="brandreel://oauth-callback?platform=${platform}&status=ok">Kembali ke aplikasi</a></p>` +
      `</body></html>`
    );
  } catch (err: any) {
    console.error(err);
    fail(err.message ?? "Gagal menukar code ke token");
  }
});

// POST /connections/:id/refresh — perpanjang token sebelum kedaluwarsa (Bab 04 §4)
oauthRouter.post("/connections/:id/refresh", async (req, res) => {
  const conn = await prisma.connection.findUnique({ where: { id: req.params.id } });
  if (!conn) return res.status(404).json({ error: "Koneksi tidak ditemukan" });

  try {
    if (conn.platform !== "tiktok") throw new Error(`Refresh ${conn.platform} belum diimplementasi`);
    const { decryptTokenRef } = await import("../lib/vault.js");
    const current = decryptTokenRef<{ refresh_token: string }>(conn.tokenRef);
    const tokens = await refreshTikTokToken(current.refresh_token);
    const tokenRef = encryptTokenRef({ access_token: tokens.access_token, refresh_token: tokens.refresh_token });

    const updated = await prisma.connection.update({
      where: { id: conn.id },
      data: { tokenRef, status: "active", expiresAt: new Date(Date.now() + tokens.expires_in * 1000) },
    });
    res.json({ id: updated.id, status: updated.status, expiresAt: updated.expiresAt });
  } catch (err: any) {
    await prisma.connection.update({ where: { id: conn.id }, data: { status: "expired" } });
    console.error(err);
    res.status(502).json({ error: err.message });
  }
});
