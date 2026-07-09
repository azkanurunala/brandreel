// src/lib/storage.ts — unggah file (video hasil render, logo brand, foto
// produk) ke object storage S3-kompatibel (Cloudflare R2 / AWS S3) lalu
// kembalikan URL publik lewat CDN (Bab 03).
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../env.js";

export class StorageUnavailableError extends Error {
  constructor() {
    super("STORAGE_* belum diisi (lihat Bab 15)");
    this.name = "StorageUnavailableError";
  }
}

function client(): S3Client {
  if (!env.STORAGE_ACCESS_KEY_ID || !env.STORAGE_SECRET_ACCESS_KEY || !env.STORAGE_BUCKET) {
    throw new StorageUnavailableError();
  }
  return new S3Client({
    region: env.STORAGE_REGION,
    endpoint: env.STORAGE_ENDPOINT,
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY_ID,
      secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY,
    },
  });
}

async function upload(key: string, bytes: Buffer, contentType: string): Promise<string> {
  const s3 = client();
  await s3.send(new PutObjectCommand({
    Bucket: env.STORAGE_BUCKET,
    Key: key,
    Body: bytes,
    ContentType: contentType,
  }));
  const base = env.CDN_BASE_URL ?? `${env.STORAGE_ENDPOINT}/${env.STORAGE_BUCKET}`;
  return `${base.replace(/\/$/, "")}/${key}`;
}

export async function uploadVideo(key: string, bytes: Buffer, contentType = "video/mp4"): Promise<string> {
  return upload(key, bytes, contentType);
}

export async function uploadImage(key: string, bytes: Buffer, contentType: string): Promise<string> {
  return upload(key, bytes, contentType);
}
