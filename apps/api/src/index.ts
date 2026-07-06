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

const app = express();

// --- Middleware dasar ---
app.use(express.json({ limit: "5mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: [env.WEB_APP_URL, "http://localhost:8081", "http://localhost:19006"],
    credentials: true,
  })
);

// --- Rute ---
app.use(healthRouter);
app.use(generateRouter);
app.use(campaignsRouter);
app.use(connectionsRouter);
app.use(insightsRouter);

// --- 404 & error handler sederhana ---
app.use((req, res) => res.status(404).json({ error: "Tidak ditemukan", path: req.path }));
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Kesalahan server" });
});

app.listen(env.PORT, () => {
  console.log(`✅ BrandReel API jalan di ${env.APP_BASE_URL} (port ${env.PORT})`);
});
