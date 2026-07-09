// Katalog integrasi — porting BR_API_GROUPS dari prototype br-screens-setup.jsx.
// Layar Setup API murni panduan developer; field di sini TIDAK pernah
// dikirim ke jaringan — nilai hanya disimpan di state lokal layar (Fase 2 UI-only).

import type { PlatformId } from "../theme/tokens";

export interface ApiField {
  env: string;
  label_en: string;
  label_id: string;
}

export interface ApiItem {
  id: string;
  pid?: PlatformId;
  color?: string;
  glyph?: string;
  name: string;
  purpose_en: string;
  purpose_id: string;
  console: { label: string; url: string };
  steps: { en: string[]; id: string[] };
  fields: ApiField[];
  seed: boolean;
}

export interface ApiGroup {
  id: string;
  label_en: string;
  label_id: string;
  note_en: string;
  note_id: string;
  items: ApiItem[];
  infos?: { id: string; color: string; glyph: string; title_en: string; title_id: string; body_en: string; body_id: string }[];
}

export const BR_API_GROUPS: ApiGroup[] = [
  {
    id: "social", label_en: "Social publishing", label_id: "Publikasi sosial",
    note_en: "OAuth apps the auto-poster uses to push videos to each channel.",
    note_id: "Aplikasi OAuth yang dipakai auto-poster untuk mengirim video ke tiap channel.",
    items: [
      {
        id: "tiktok", pid: "tiktok", name: "TikTok",
        purpose_en: "Post Shorts via Content Posting API", purpose_id: "Posting Shorts via Content Posting API",
        console: { label: "developer.tiktok.com", url: "https://developer.tiktok.com" },
        steps: {
          en: ["Open the TikTok Developer Portal → Manage apps → create an app", "Add the Content Posting API and Login Kit products", "Set redirect URI to https://app.brandreel.io/oauth/tiktok", "Copy the Client Key & Client Secret below"],
          id: ["Buka TikTok Developer Portal → Manage apps → buat app", "Tambahkan produk Content Posting API & Login Kit", "Atur redirect URI ke https://app.brandreel.io/oauth/tiktok", "Salin Client Key & Client Secret di bawah"],
        },
        fields: [{ env: "TIKTOK_CLIENT_KEY", label_en: "Client key", label_id: "Client key" }, { env: "TIKTOK_CLIENT_SECRET", label_en: "Client secret", label_id: "Client secret" }],
        seed: true,
      },
      {
        id: "instagram", pid: "instagram", name: "Instagram",
        purpose_en: "Publish Reels via Meta Graph API", purpose_id: "Publikasi Reels via Meta Graph API",
        console: { label: "developers.facebook.com", url: "https://developers.facebook.com" },
        steps: {
          en: ["Create a Business-type app at Meta for Developers", "Add the Instagram Graph API product", "Connect a Professional/Business IG account", "Generate a long-lived access token"],
          id: ["Buat app tipe Business di Meta for Developers", "Tambahkan produk Instagram Graph API", "Hubungkan akun IG Professional/Business", "Buat long-lived access token"],
        },
        fields: [{ env: "META_APP_ID", label_en: "App ID", label_id: "App ID" }, { env: "META_APP_SECRET", label_en: "App secret", label_id: "App secret" }],
        seed: true,
      },
      {
        id: "youtube", pid: "youtube", name: "YouTube",
        purpose_en: "Upload Shorts via YouTube Data API v3", purpose_id: "Unggah Shorts via YouTube Data API v3",
        console: { label: "console.cloud.google.com", url: "https://console.cloud.google.com" },
        steps: {
          en: ["In Google Cloud Console, enable YouTube Data API v3", "Create an OAuth 2.0 Web client", "Add scope .../auth/youtube.upload", "Set the authorized redirect URI"],
          id: ["Di Google Cloud Console, aktifkan YouTube Data API v3", "Buat OAuth 2.0 Web client", "Tambahkan scope .../auth/youtube.upload", "Atur authorized redirect URI"],
        },
        fields: [{ env: "GOOGLE_CLIENT_ID", label_en: "Client ID", label_id: "Client ID" }, { env: "GOOGLE_CLIENT_SECRET", label_en: "Client secret", label_id: "Client secret" }],
        seed: false,
      },
      {
        id: "linkedin", pid: "linkedin", name: "LinkedIn",
        purpose_en: "Share posts via LinkedIn Posts API", purpose_id: "Bagikan post via LinkedIn Posts API",
        console: { label: "linkedin.com/developers", url: "https://www.linkedin.com/developers" },
        steps: {
          en: ["Create an app at LinkedIn Developers", "Request the Share on LinkedIn + Sign In products", "Add your OAuth redirect URL", "Copy the Client ID & Secret"],
          id: ["Buat app di LinkedIn Developers", "Minta produk Share on LinkedIn + Sign In", "Tambahkan OAuth redirect URL", "Salin Client ID & Secret"],
        },
        fields: [{ env: "LINKEDIN_CLIENT_ID", label_en: "Client ID", label_id: "Client ID" }, { env: "LINKEDIN_CLIENT_SECRET", label_en: "Client secret", label_id: "Client secret" }],
        seed: false,
      },
      {
        id: "twitter", pid: "twitter", name: "X",
        purpose_en: "Post to X via API v2 (OAuth 2.0)", purpose_id: "Posting ke X via API v2 (OAuth 2.0)",
        console: { label: "developer.x.com", url: "https://developer.x.com" },
        steps: {
          en: ["Create a Project + App in the X Developer Portal", "Enable OAuth 2.0 and set the callback URL", "Generate API Key/Secret and a Bearer Token"],
          id: ["Buat Project + App di X Developer Portal", "Aktifkan OAuth 2.0 & atur callback URL", "Buat API Key/Secret dan Bearer Token"],
        },
        fields: [{ env: "X_CLIENT_ID", label_en: "Client ID", label_id: "Client ID" }, { env: "X_CLIENT_SECRET", label_en: "Client secret", label_id: "Client secret" }],
        seed: false,
      },
    ],
  },
  {
    id: "ai", label_en: "AI generation", label_id: "Generasi AI",
    note_en: "Models that write the 5 hooks, draft captions, and render the videos.",
    note_id: "Model yang menulis 5 hook, membuat caption, dan render video.",
    items: [
      {
        id: "anthropic", color: "#C9633F", glyph: "CL", name: "Anthropic Claude",
        purpose_en: "Powers the in-app BrandReel Copilot & hook scripts", purpose_id: "Menggerakkan BrandReel Copilot & skrip hook",
        console: { label: "console.anthropic.com", url: "https://console.anthropic.com" },
        steps: {
          en: ["Open the Anthropic Console → API Keys", "Create a key for your workspace", "Paste the key below"],
          id: ["Buka Anthropic Console → API Keys", "Buat key untuk workspace kamu", "Tempel key di bawah"],
        },
        fields: [{ env: "ANTHROPIC_API_KEY", label_en: "API key", label_id: "API key" }],
        seed: true,
      },
      {
        id: "veo", color: "#4285F4", glyph: "VE", name: "Google Veo",
        purpose_en: "Renders UGC video variations", purpose_id: "Render variasi video UGC",
        console: { label: "aistudio.google.com", url: "https://aistudio.google.com/apikey" },
        steps: {
          en: ["Open Google AI Studio → Get API key", "Enable billing on the linked project", "Paste the key below"],
          id: ["Buka Google AI Studio → Get API key", "Aktifkan billing di project terhubung", "Tempel key di bawah"],
        },
        fields: [{ env: "GEMINI_API_KEY", label_en: "API key", label_id: "API key" }],
        seed: false,
      },
    ],
  },
  {
    id: "media", label_en: "Media & delivery", label_id: "Media & pengiriman",
    note_en: "Where rendered videos are stored and how formats are transcoded.",
    note_id: "Tempat menyimpan video hasil render dan transcode format.",
    items: [
      {
        id: "storage", color: "#F38020", glyph: "R2", name: "Cloudflare R2 / S3",
        purpose_en: "Object storage for rendered assets", purpose_id: "Object storage untuk aset hasil render",
        console: { label: "dash.cloudflare.com", url: "https://dash.cloudflare.com" },
        steps: {
          en: ["Create an R2 (or S3) bucket", "Issue an API token with read/write", "Paste the account ID, keys & bucket"],
          id: ["Buat bucket R2 (atau S3)", "Terbitkan API token read/write", "Tempel account ID, key & bucket"],
        },
        fields: [{ env: "STORAGE_ACCESS_KEY_ID", label_en: "Access key", label_id: "Access key" }, { env: "STORAGE_SECRET_ACCESS_KEY", label_en: "Secret key", label_id: "Secret key" }, { env: "STORAGE_BUCKET", label_en: "Bucket name", label_id: "Nama bucket" }],
        seed: false,
      },
    ],
    infos: [
      {
        id: "bullmq", color: "#1FA971", glyph: "BQ", title_en: "BullMQ + Redis worker", title_id: "Worker BullMQ + Redis",
        body_en: "Self-hosted — no key. The worker crops each render to the right aspect ratio & duration before upload.",
        body_id: "Self-hosted — tanpa key. Worker crop tiap render ke rasio & durasi yang sesuai sebelum upload.",
      },
    ],
  },
];

export function brAllApiItems(): ApiItem[] {
  return BR_API_GROUPS.flatMap((g) => g.items);
}
