// src/queue.ts — koneksi Redis + antrean BullMQ (Bab 05 & 06)
import { Queue } from "bullmq";
import IORedis from "ioredis";
import { env } from "./env.js";

// Koneksi Redis dipakai bersama oleh Queue & Worker.
export const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null, // disyaratkan BullMQ
});

// Antrean untuk pipeline posting (Bab 05).
export const publishQueue = new Queue("publish", { connection });

// Antrean untuk job statistik (Bab 06).
export const insightsQueue = new Queue("insights", { connection });

export const QUEUE_NAMES = { publish: "publish", insights: "insights" } as const;
