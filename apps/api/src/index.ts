// src/index.ts — titik masuk server API (Bab 02, 03, 07)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env.js";
import { healthRouter } from "./routes/health.js";
import { generateRouter } from "./routes/generate.js";
import { campaignsRouter } from "./routes/campaigns.js";
import { connectionsRouter } from "./routes/connections.js";
import { insightsRouter } from "./routes/insights.js";
import { rendersRouter } from "./routes/renders.js";
import { authRouter } from "./routes/auth.js";
import { oauthRouter } from "./routes/oauth.js";
import { publishRouter } from "./routes/publish.js";
import { webhooksRouter } from "./routes/webhooks.js";
import { brandKitRouter } from "./routes/brandkit.js";
import { uploadsRouter } from "./routes/uploads.js";

const app = express();

// --- Middleware dasar ---
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
// CORS: WEB_APP_URL (Bab 15) + dev ports Expo + semua *.vercel.app (produksi
// & preview deploy web app pakai domain vercel.app yang beda tiap deploy).
const ALLOWED_ORIGINS = [
  env.WEB_APP_URL,
  "http://localhost:8081",
  "http://localhost:19006",
  "http://localhost:8090",
  "http://127.0.0.1:8090",
];
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true); // request non-browser (curl, server-to-server)
      if (ALLOWED_ORIGINS.includes(origin) || /\.vercel\.app$/.test(new URL(origin).hostname)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} tidak diizinkan`));
    },
    credentials: true,
  })
);

// --- Rute ---
app.use(healthRouter);
app.use(generateRouter);
app.use(campaignsRouter);
app.use(connectionsRouter);
app.use(insightsRouter);
app.use(rendersRouter);
app.use(authRouter);
app.use(oauthRouter);
app.use(publishRouter);
app.use(webhooksRouter);
app.use(brandKitRouter);
app.use(uploadsRouter);

// --- 404 & error handler sederhana ---
app.use((req, res) => res.status(404).json({ error: "Tidak ditemukan", path: req.path }));
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Kesalahan server" });
});

app.listen(env.PORT, () => {
  console.log(`✅ BrandReel API jalan di ${env.APP_BASE_URL} (port ${env.PORT})`);
});
