// src/lib/vault.ts — brankas token terenkripsi (Bab 08 aturan 2)
// Tanpa layanan KMS terpisah (AWS/GCP KMS) di lingkungan dev ini, kita pakai
// enkripsi AES-256-GCM di level aplikasi dengan TOKEN_ENCRYPTION_KEY sebagai
// kunci induk — setara fungsinya: DB hanya menyimpan blob buram (tokenRef),
// dekripsi hanya bisa terjadi di server yang pegang TOKEN_ENCRYPTION_KEY.
// Produksi skala besar: ganti deriveKey() dengan panggilan KMS asli (lihat Bab 08).
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";
import { env } from "../env.js";

const ALGO = "aes-256-gcm";

function deriveKey(): Buffer {
  return scryptSync(env.TOKEN_ENCRYPTION_KEY, "brandreel-token-vault", 32);
}

// Enkripsi objek token platform -> string tokenRef buram (aman disimpan di DB).
export function encryptTokenRef(payload: unknown): string {
  const key = deriveKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64");
}

// Dekripsi tokenRef -> objek token asli. Hanya dipanggil server-side saat perlu posting/refresh.
export function decryptTokenRef<T = unknown>(tokenRef: string): T {
  const raw = Buffer.from(tokenRef, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const key = deriveKey();
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}
