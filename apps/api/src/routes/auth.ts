// src/routes/auth.ts — login BrandReel sendiri via Google (BEDA dari
// routes/oauth.ts yang menghubungkan akun SOSMED untuk posting, Bab 04).
// Alur sama-sama OAuth 3-langkah, tapi ini identitas pengguna BrandReel.
import { randomBytes } from "node:crypto";
import { Router } from "express";
import { prisma } from "../db.js";
import { createSession, deleteSession } from "../lib/session.js";
import { buildGoogleLoginAuthorizeUrl, exchangeGoogleLoginCode, fetchGoogleProfile } from "../lib/google.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = Router();

const pendingLoginState = new Map<string, number>();
const STATE_TTL_MS = 10 * 60 * 1000;
function cleanup() {
  const now = Date.now();
  for (const [k, t] of pendingLoginState) if (now - t > STATE_TTL_MS) pendingLoginState.delete(k);
}

// POST /auth/google-login/start — mulai login pakai akun Google
authRouter.post("/auth/google-login/start", (_req, res) => {
  cleanup();
  const state = randomBytes(24).toString("hex");
  pendingLoginState.set(state, Date.now());
  try {
    res.json({ consentUrl: buildGoogleLoginAuthorizeUrl(state), state });
  } catch (err: any) {
    pendingLoginState.delete(state);
    res.status(501).json({ error: err.message });
  }
});

// GET /auth/google-login/callback — Google redirect balik, buat/masuk akun, buat sesi
authRouter.get("/auth/google-login/callback", async (req, res) => {
  const { code, state, error: googleError } = req.query as Record<string, string>;

  function fail(message: string) {
    res.status(400).send(
      `<html><body style="font-family:sans-serif;padding:24px">` +
      `<h3>Gagal login</h3><p>${message}</p>` +
      `<p><a href="brandreel://login-callback?status=error">Kembali ke aplikasi</a></p>` +
      `</body></html>`
    );
  }

  if (googleError) return fail(String(googleError));
  if (!code || !state || !pendingLoginState.has(state)) return fail("code/state tidak valid atau kedaluwarsa — coba login ulang");
  pendingLoginState.delete(state);

  try {
    const tokens = await exchangeGoogleLoginCode(code);
    const profile = await fetchGoogleProfile(tokens.access_token);

    const account = await prisma.account.upsert({
      where: { email: profile.email },
      update: { name: profile.name ?? undefined },
      create: { email: profile.email, name: profile.name ?? undefined, role: "owner", plan: "free" },
    });

    const session = await createSession(account.id);

    res.send(
      `<html><body style="font-family:sans-serif;padding:24px">` +
      `<h3>Berhasil masuk sebagai ${profile.email}!</h3><p>Kamu bisa menutup halaman ini.</p>` +
      `<script>if(window.opener){window.opener.postMessage({type:"brandreel-login",status:"ok",token:"${session.token}"},"*");window.close();}else{setTimeout(function(){location.href="brandreel://login-callback?status=ok&token=${session.token}";}, 400);}</script>` +
      `<p><a href="brandreel://login-callback?status=ok&token=${session.token}">Kembali ke aplikasi</a></p>` +
      `</body></html>`
    );
  } catch (err: any) {
    console.error(err);
    fail(err.message ?? "Gagal login dengan Google");
  }
});

// GET /auth/me — profil akun yang sedang login
authRouter.get("/auth/me", requireAuth, async (req, res) => {
  const account = await prisma.account.findUnique({ where: { id: req.accountId } });
  if (!account) return res.status(404).json({ error: "Akun tidak ditemukan" });
  res.json({ id: account.id, email: account.email, name: account.name, role: account.role, plan: account.plan, postQuota: account.postQuota });
});

// POST /auth/logout — hapus sesi aktif
authRouter.post("/auth/logout", async (req, res) => {
  const auth = req.header("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (token) await deleteSession(token);
  res.json({ ok: true });
});
