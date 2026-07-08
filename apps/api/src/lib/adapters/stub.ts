// src/lib/adapters/stub.ts — adapter kerangka untuk platform yang belum
// diimplementasi (Instagram/YouTube/LinkedIn/X/Facebook). validate() tetap
// nyata (spek format sudah pasti dari Bab 05 §2) supaya pre-flight UI benar;
// publish()/fetchInsights() melempar NotImplementedError dengan jelas
// daripada berpura-pura sukses — ikuti pola tiktok.ts saat kredensial &
// dokumentasi API platform tsb siap diimplementasi.
import { baseValidate, NotImplementedError, type PlatformAdapter } from "./types.js";
import type { PlatformId } from "../platforms.js";

export function stubAdapter(platform: Exclude<PlatformId, "tiktok">): PlatformAdapter {
  return {
    validate(input) {
      return baseValidate(platform, input);
    },
    async publish() {
      throw new NotImplementedError(platform);
    },
    async fetchInsights() {
      throw new NotImplementedError(platform);
    },
  };
}
