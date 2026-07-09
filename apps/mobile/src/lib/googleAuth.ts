// lib/googleAuth.ts — login BrandReel via Google (BEDA dari OAuth koneksi
// sosmed di Profile). Web pakai popup + postMessage (skema brandreel:// gak
// bisa dibaca cross-origin oleh window pembuka); native pakai deep-link
// lewat expo-web-browser, seperti alur koneksi platform di Profile.
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { apiPost } from "./api";
import { setToken } from "./session";

async function loginOnWeb(consentUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const popup = window.open(consentUrl, "brandreel-login", "width=480,height=640");
    if (!popup) { resolve(null); return; }

    function onMessage(e: MessageEvent) {
      if (e.data?.type !== "brandreel-login") return;
      window.removeEventListener("message", onMessage);
      clearInterval(watcher);
      resolve(e.data.status === "ok" ? e.data.token ?? null : null);
    }
    window.addEventListener("message", onMessage);

    const watcher = setInterval(() => {
      if (popup.closed) {
        clearInterval(watcher);
        window.removeEventListener("message", onMessage);
        resolve(null);
      }
    }, 500);
  });
}

async function loginOnNative(consentUrl: string): Promise<string | null> {
  const result = await WebBrowser.openAuthSessionAsync(consentUrl, "brandreel://login-callback");
  if (result.type !== "success") return null;
  const match = result.url.match(/[?&]token=([^&]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// Jalankan alur login Google penuh: start -> consent -> simpan token sesi.
// Balikkan true kalau berhasil.
export async function loginWithGoogle(): Promise<boolean> {
  const { consentUrl } = await apiPost("/auth/google-login/start", {});
  const token = Platform.OS === "web" ? await loginOnWeb(consentUrl) : await loginOnNative(consentUrl);
  if (!token) return false;
  await setToken(token);
  return true;
}
