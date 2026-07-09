// src/routes/setup.ts — status konfigurasi integrasi buat layar Setup API
// (Profile → Developer). Cuma balikin ADA/TIDAKNYA tiap env var — TIDAK
// PERNAH nilai aslinya (secret tetap cuma hidup di server, CLAUDE.md §4).
import { Router } from "express";
import { env } from "../env.js";
import { requireAuth } from "../middleware/auth.js";

export const setupRouter = Router();

const CHECKED_VARS = [
  "TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET",
  "META_APP_ID", "META_APP_SECRET",
  "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET",
  "LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET",
  "X_CLIENT_ID", "X_CLIENT_SECRET",
  "ANTHROPIC_API_KEY", "GEMINI_API_KEY",
  "STORAGE_ACCESS_KEY_ID", "STORAGE_SECRET_ACCESS_KEY", "STORAGE_BUCKET",
] as const;

setupRouter.get("/setup/status", requireAuth, (_req, res) => {
  const status: Record<string, boolean> = {};
  for (const key of CHECKED_VARS) {
    status[key] = !!(env as Record<string, unknown>)[key];
  }
  res.json(status);
});
