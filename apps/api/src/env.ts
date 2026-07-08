// src/env.ts — memuat & memvalidasi environment variables (Bab 15)
import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(3000),
  APP_BASE_URL: z.string().url().default("http://localhost:3000"),
  WEB_APP_URL: z.string().url().default("http://localhost:8081"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL wajib diisi (Neon)"),
  DIRECT_URL: z.string().optional(),
  REDIS_URL: z.string().default("redis://localhost:6379"),

  SESSION_SIGNING_KEY: z.string().min(16).default("dev-session-key-ganti-di-produksi"),
  TOKEN_ENCRYPTION_KEY: z.string().min(16).default("dev-encrypt-key-ganti-di-produksi"),

  // AI — opsional saat Fase 1, wajib saat Fase 3
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-5"),
  GEMINI_API_KEY: z.string().optional(),
  VEO_MODEL: z.string().default("veo3.1-fast"),

  // OAuth TikTok (Bab 04) — wajib saat fitur connect TikTok dipakai
  TIKTOK_CLIENT_KEY: z.string().optional(),
  TIKTOK_CLIENT_SECRET: z.string().optional(),

  // Storage video (Bab 03/15) — wajib saat render Veo dipakai
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_REGION: z.string().default("auto"),
  STORAGE_ACCESS_KEY_ID: z.string().optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
  CDN_BASE_URL: z.string().optional(),
});

export const env = schema.parse(process.env);
export const isProd = env.NODE_ENV === "production";
