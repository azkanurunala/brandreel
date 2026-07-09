// lib/session.ts — token sesi login BrandReel (bukan token OAuth sosmed di
// Profile). Disimpan lokal via AsyncStorage (jalan di web lewat localStorage
// juga, lihat dok @react-native-async-storage/async-storage).
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "brandreel.session.token";

let cached: string | null | undefined; // undefined = belum dimuat dari storage

export async function getToken(): Promise<string | null> {
  if (cached !== undefined) return cached;
  cached = await AsyncStorage.getItem(KEY);
  return cached;
}

export async function setToken(token: string): Promise<void> {
  cached = token;
  await AsyncStorage.setItem(KEY, token);
}

export async function clearToken(): Promise<void> {
  cached = null;
  await AsyncStorage.removeItem(KEY);
}
