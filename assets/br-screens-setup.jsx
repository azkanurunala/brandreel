// BrandReel — developer "API Setup" guide. Step-by-step wiring of every
// third-party service the app depends on: social publishing, AI generation,
// media/delivery, auth & messaging. Accordion cards with numbered steps,
// console links, env-var credential fields, and a verify flow.

const { useState: su_useState } = React;

// ── Catalog ───────────────────────────────────────────────────
// group → items[]; each item: id, name, color, glyph (or platform pid),
// purpose, console {label,url}, steps {en[],id[]}, fields [{env,label}], seed(bool)
const BR_API_GROUPS = [
  {
    id: "social", label_en: "Social publishing", label_id: "Publikasi sosial",
    note_en: "OAuth apps the auto-poster uses to push videos to each channel.",
    note_id: "Aplikasi OAuth yang dipakai auto-poster untuk mengirim video ke tiap channel.",
    items: [
      { id: "tiktok", pid: "tiktok", purpose_en: "Post Shorts via Content Posting API", purpose_id: "Posting Shorts via Content Posting API",
        console: { label: "developer.tiktok.com", url: "https://developer.tiktok.com" },
        steps: { en: ["Open the TikTok Developer Portal → Manage apps → create an app", "Add the Content Posting API and Login Kit products", "Set redirect URI to https://app.brandreel.io/oauth/tiktok", "Copy the Client Key & Client Secret below"],
                 id: ["Buka TikTok Developer Portal → Manage apps → buat app", "Tambahkan produk Content Posting API & Login Kit", "Atur redirect URI ke https://app.brandreel.io/oauth/tiktok", "Salin Client Key & Client Secret di bawah"] },
        fields: [{ env: "TIKTOK_CLIENT_KEY", label_en: "Client key", label_id: "Client key" }, { env: "TIKTOK_CLIENT_SECRET", label_en: "Client secret", label_id: "Client secret" }], seed: true },
      { id: "instagram", pid: "instagram", purpose_en: "Publish Reels via Meta Graph API", purpose_id: "Publikasi Reels via Meta Graph API",
        console: { label: "developers.facebook.com", url: "https://developers.facebook.com" },
        steps: { en: ["Create a Business-type app at Meta for Developers", "Add the Instagram Graph API product", "Connect a Professional/Business IG account", "Generate a long-lived access token"],
                 id: ["Buat app tipe Business di Meta for Developers", "Tambahkan produk Instagram Graph API", "Hubungkan akun IG Professional/Business", "Buat long-lived access token"] },
        fields: [{ env: "META_APP_ID", label_en: "App ID", label_id: "App ID" }, { env: "META_APP_SECRET", label_en: "App secret", label_id: "App secret" }, { env: "IG_LONG_LIVED_TOKEN", label_en: "Access token", label_id: "Access token" }], seed: true },
      { id: "youtube", pid: "youtube", purpose_en: "Upload Shorts via YouTube Data API v3", purpose_id: "Unggah Shorts via YouTube Data API v3",
        console: { label: "console.cloud.google.com", url: "https://console.cloud.google.com" },
        steps: { en: ["In Google Cloud Console, enable YouTube Data API v3", "Create an OAuth 2.0 Web client", "Add scope .../auth/youtube.upload", "Set the authorized redirect URI"],
                 id: ["Di Google Cloud Console, aktifkan YouTube Data API v3", "Buat OAuth 2.0 Web client", "Tambahkan scope .../auth/youtube.upload", "Atur authorized redirect URI"] },
        fields: [{ env: "GOOGLE_CLIENT_ID", label_en: "Client ID", label_id: "Client ID" }, { env: "GOOGLE_CLIENT_SECRET", label_en: "Client secret", label_id: "Client secret" }], seed: false },
      { id: "linkedin", pid: "linkedin", purpose_en: "Share posts via LinkedIn Posts API", purpose_id: "Bagikan post via LinkedIn Posts API",
        console: { label: "linkedin.com/developers", url: "https://www.linkedin.com/developers" },
        steps: { en: ["Create an app at LinkedIn Developers", "Request the Share on LinkedIn + Sign In products", "Add your OAuth redirect URL", "Copy the Client ID & Secret"],
                 id: ["Buat app di LinkedIn Developers", "Minta produk Share on LinkedIn + Sign In", "Tambahkan OAuth redirect URL", "Salin Client ID & Secret"] },
        fields: [{ env: "LINKEDIN_CLIENT_ID", label_en: "Client ID", label_id: "Client ID" }, { env: "LINKEDIN_CLIENT_SECRET", label_en: "Client secret", label_id: "Client secret" }], seed: false },
      { id: "twitter", pid: "twitter", purpose_en: "Post to X via API v2 (OAuth 2.0)", purpose_id: "Posting ke X via API v2 (OAuth 2.0)",
        console: { label: "developer.x.com", url: "https://developer.x.com" },
        steps: { en: ["Create a Project + App in the X Developer Portal", "Enable OAuth 2.0 and set the callback URL", "Generate API Key/Secret and a Bearer Token"],
                 id: ["Buat Project + App di X Developer Portal", "Aktifkan OAuth 2.0 & atur callback URL", "Buat API Key/Secret dan Bearer Token"] },
        fields: [{ env: "X_API_KEY", label_en: "API key", label_id: "API key" }, { env: "X_API_SECRET", label_en: "API secret", label_id: "API secret" }, { env: "X_BEARER_TOKEN", label_en: "Bearer token", label_id: "Bearer token" }], seed: false },
    ],
  },
  {
    id: "ai", label_en: "AI generation", label_id: "Generasi AI",
    note_en: "Models that write the 5 hooks, draft captions, and render the videos.",
    note_id: "Model yang menulis 5 hook, membuat caption, dan render video.",
    items: [
      { id: "openai", color: "#10A37F", glyph: "AI", purpose_en: "Hook scripts & per-platform captions", purpose_id: "Skrip hook & caption per platform",
        console: { label: "platform.openai.com", url: "https://platform.openai.com/api-keys" },
        steps: { en: ["Open platform.openai.com → API keys", "Create a new secret key", "Add billing + a usage limit", "Paste the key below"],
                 id: ["Buka platform.openai.com → API keys", "Buat secret key baru", "Tambahkan billing + batas pemakaian", "Tempel key di bawah"] },
        fields: [{ env: "OPENAI_API_KEY", label_en: "Secret key", label_id: "Secret key" }], seed: true },
      { id: "anthropic", color: "#C9633F", glyph: "CL", purpose_en: "Powers the in-app BrandReel Copilot", purpose_id: "Menggerakkan BrandReel Copilot",
        console: { label: "console.anthropic.com", url: "https://console.anthropic.com" },
        steps: { en: ["Open the Anthropic Console → API Keys", "Create a key for your workspace", "Paste the key below"],
                 id: ["Buka Anthropic Console → API Keys", "Buat key untuk workspace kamu", "Tempel key di bawah"] },
        fields: [{ env: "ANTHROPIC_API_KEY", label_en: "API key", label_id: "API key" }], seed: true },
      { id: "replicate", color: "#6A5AF0", glyph: "RP", purpose_en: "Renders UGC video variations", purpose_id: "Render variasi video UGC",
        console: { label: "replicate.com", url: "https://replicate.com/account/api-tokens" },
        steps: { en: ["Open replicate.com → Account → API tokens", "Create a new token", "Pick the video model in Settings → Render"],
                 id: ["Buka replicate.com → Account → API tokens", "Buat token baru", "Pilih model video di Settings → Render"] },
        fields: [{ env: "REPLICATE_API_TOKEN", label_en: "API token", label_id: "API token" }], seed: false },
    ],
  },
  {
    id: "media", label_en: "Media & delivery", label_id: "Media & pengiriman",
    note_en: "Where rendered videos are stored and how formats are transcoded.",
    note_id: "Tempat menyimpan video hasil render dan transcode format.",
    items: [
      { id: "storage", color: "#F38020", glyph: "R2", purpose_en: "Object storage for rendered assets", purpose_id: "Object storage untuk aset hasil render",
        console: { label: "dash.cloudflare.com", url: "https://dash.cloudflare.com" },
        steps: { en: ["Create an R2 (or S3) bucket", "Issue an API token with read/write", "Paste the account ID, keys & bucket"],
                 id: ["Buat bucket R2 (atau S3)", "Terbitkan API token read/write", "Tempel account ID, key & bucket"] },
        fields: [{ env: "R2_ACCOUNT_ID", label_en: "Account ID", label_id: "Account ID" }, { env: "R2_ACCESS_KEY", label_en: "Access key", label_id: "Access key" }, { env: "R2_SECRET_KEY", label_en: "Secret key", label_id: "Secret key" }, { env: "R2_BUCKET", label_en: "Bucket name", label_id: "Nama bucket" }], seed: false },
    ],
    infos: [
      { id: "ffmpeg", color: "#1FA971", glyph: "FF", title_en: "ffmpeg render worker", title_id: "Worker render ffmpeg",
        body_en: "Self-hosted — no key. Deploy the worker container; it crops to each platform's aspect ratio & duration before upload.",
        body_id: "Self-hosted — tanpa key. Deploy container worker; ia crop ke rasio & durasi tiap platform sebelum upload." },
    ],
  },
  {
    id: "auth", label_en: "Auth & messaging", label_id: "Auth & pesan",
    note_en: "Used for the 6-digit OTP login and failure notifications.",
    note_id: "Dipakai untuk login OTP 6 digit dan notifikasi kegagalan.",
    items: [
      { id: "twilio", color: "#F22F46", glyph: "SM", purpose_en: "Sends the SMS one-time passcode", purpose_id: "Mengirim SMS one-time passcode",
        console: { label: "console.twilio.com", url: "https://console.twilio.com" },
        steps: { en: ["Open the Twilio Console", "Copy your Account SID + Auth Token", "Buy/verify a sender number"],
                 id: ["Buka Twilio Console", "Salin Account SID + Auth Token", "Beli/verifikasi nomor pengirim"] },
        fields: [{ env: "TWILIO_ACCOUNT_SID", label_en: "Account SID", label_id: "Account SID" }, { env: "TWILIO_AUTH_TOKEN", label_en: "Auth token", label_id: "Auth token" }, { env: "TWILIO_FROM", label_en: "Sender number", label_id: "Nomor pengirim" }], seed: false },
    ],
  },
];

function brAllApiItems() { return BR_API_GROUPS.flatMap((g) => g.items); }

function BrSetup({ onBack }) {
  const { theme, lang } = useBr();
  const items = brAllApiItems();

  // seed pre-connected services with masked secrets
  const [vals, setVals] = su_useState(() => {
    const v = {};
    items.forEach((it) => { if (it.seed) it.fields.forEach((f) => { v[f.env] = "••••••••••••••••"; }); });
    return v;
  });
  const [open, setOpen] = su_useState(null);
  const [verifying, setVerifying] = su_useState(null);

  const isConnected = (it) => it.fields.every((f) => (vals[f.env] || "").trim().length > 0);
  const connectedCount = items.filter(isConnected).length;
  const total = items.length;
  const pct = Math.round((connectedCount / total) * 100);

  function setVal(env, v) { setVals((s) => ({ ...s, [env]: v })); }
  function verify(it) {
    setVerifying(it.id);
    setTimeout(() => {
      setVals((s) => { const n = { ...s }; it.fields.forEach((f) => { if (!(n[f.env] || "").trim()) n[f.env] = "••••••••••••••••"; }); return n; });
      setVerifying(null); setOpen(null);
    }, 950);
  }

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: theme.canvas }}>
      <BrAppHeader title={lang === "en" ? "API Setup" : "Setup API"} subtitle={lang === "en" ? "DEVELOPER · INTEGRATIONS" : "DEVELOPER · INTEGRASI"} onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 28px" }}>
        {/* progress hero */}
        <GlassPanel theme={theme} padding={16} tone="solid">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div className="br-display br-num" style={{ fontSize: 32, color: theme.ink, letterSpacing: -1, lineHeight: 1 }}>{connectedCount}<span style={{ fontSize: 16, color: theme.ink3 }}>/{total}</span></div>
              <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1, marginTop: 5, textTransform: "uppercase" }}>{lang === "en" ? "services connected" : "layanan terhubung"}</div>
            </div>
            <GlassChip theme={theme} color={pct === 100 ? theme.pos : theme.accent}>
              {pct === 100 ? (lang === "en" ? "Ready to ship" : "Siap rilis") : `${pct}%`}
            </GlassChip>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: theme.hair, marginTop: 14, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${theme.brand}, ${theme.accent})`, borderRadius: 99, transition: "width 500ms ease" }} />
          </div>
          <div className="br-sans" style={{ fontSize: 11.5, color: theme.ink2, marginTop: 12, lineHeight: 1.5 }}>
            {lang === "en"
              ? "Add each key to your server's .env — never ship secrets in the app bundle. Restart the worker after saving."
              : "Tambahkan tiap key ke .env server — jangan kirim secret di bundle app. Restart worker setelah menyimpan."}
          </div>
        </GlassPanel>

        {BR_API_GROUPS.map((g) => (
          <div key={g.id}>
            <div className="br-eyebrow" style={{ color: theme.ink3, padding: "20px 4px 3px" }}>{lang === "en" ? g.label_en : g.label_id}</div>
            <div className="br-sans" style={{ fontSize: 11, color: theme.ink3, padding: "0 4px 10px", lineHeight: 1.45 }}>{lang === "en" ? g.note_en : g.note_id}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {g.items.map((it) => {
                const conn = isConnected(it);
                const isOpen = open === it.id;
                const busy = verifying === it.id;
                return (
                  <div key={it.id} style={{ background: theme.glassHi, border: `1px solid ${isOpen ? theme.accent + "55" : theme.hair}`, borderRadius: 16, overflow: "hidden", transition: "border-color 160ms" }}>
                    {/* header row */}
                    <button onClick={() => setOpen(isOpen ? null : it.id)} className="br-press" style={{
                      width: "100%", textAlign: "left", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit",
                      padding: 13, display: "flex", alignItems: "center", gap: 12,
                    }}>
                      {it.pid ? <PlatformBadge pid={it.pid} size={34} /> : (
                        <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: it.color + "1C", border: `1px solid ${it.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span className="br-display" style={{ color: it.color, fontSize: 13, fontWeight: 700, letterSpacing: -0.5 }}>{it.glyph}</span>
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="br-sans" style={{ fontSize: 14, color: theme.ink, fontWeight: 700 }}>{it.pid ? BR_PLATFORMS[it.pid].name : (it.id === "openai" ? "OpenAI" : it.id === "anthropic" ? "Anthropic Claude" : it.id === "replicate" ? "Replicate" : it.id === "storage" ? "Cloudflare R2 / S3" : "Twilio")}</div>
                        <div className="br-sans" style={{ fontSize: 11, color: theme.ink3, marginTop: 2, lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lang === "en" ? it.purpose_en : it.purpose_id}</div>
                      </div>
                      <GlassChip theme={theme} color={conn ? theme.pos : theme.ink3}>
                        {conn && <span style={{ width: 5, height: 5, borderRadius: 99, background: theme.pos }} />}
                        {conn ? (lang === "en" ? "Connected" : "Terhubung") : (lang === "en" ? "Set up" : "Atur")}
                      </GlassChip>
                      <span style={{ color: theme.ink3, fontSize: 13, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 180ms", marginLeft: 2 }}>›</span>
                    </button>

                    {/* expanded body */}
                    {isOpen && (
                      <div style={{ padding: "2px 14px 14px", animation: "protoFadeIn 200ms ease both" }}>
                        {/* console link */}
                        <a href={it.console.url} target="_blank" rel="noreferrer" className="br-press" style={{
                          display: "inline-flex", alignItems: "center", gap: 7, textDecoration: "none",
                          background: theme.canvasAlt, border: `1px solid ${theme.hair}`, borderRadius: 99, padding: "6px 12px", marginBottom: 13,
                          fontFamily: "Geist Mono, monospace", fontSize: 10.5, color: theme.ink2, fontWeight: 600,
                        }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg>
                          {it.console.label}
                        </a>

                        {/* numbered steps */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                          {(lang === "en" ? it.steps.en : it.steps.id).map((s, i) => (
                            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                              <span className="br-mono" style={{ width: 19, height: 19, borderRadius: 99, flexShrink: 0, background: theme.brand + "16", color: theme.brand, fontSize: 9.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                              <span className="br-sans" style={{ flex: 1, fontSize: 12.5, color: theme.ink2, lineHeight: 1.5 }}>{s}</span>
                            </div>
                          ))}
                        </div>

                        {/* credential fields */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
                          {it.fields.map((f) => (
                            <label key={f.env} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              <span className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.6 }}>{f.env}</span>
                              <input value={vals[f.env] || ""} onChange={(e) => setVal(f.env, e.target.value)} placeholder={(lang === "en" ? f.label_en : f.label_id)} spellCheck={false} style={{
                                width: "100%", boxSizing: "border-box", background: theme.canvas, border: `1px solid ${theme.hair}`, borderRadius: 11, padding: "10px 12px",
                                fontFamily: "Geist Mono, monospace", fontSize: 12, color: theme.ink, outline: "none",
                              }} />
                            </label>
                          ))}
                        </div>

                        <PrimaryButton onClick={() => verify(it)} gradient={`linear-gradient(120deg, ${theme.brand}, ${theme.accent})`} color={theme.brand} style={{ marginTop: 13, padding: "11px 16px", fontSize: 14 }}>
                          {busy ? (lang === "en" ? "Verifying…" : "Memverifikasi…") : conn ? (lang === "en" ? "Re-verify connection" : "Verifikasi ulang") : (lang === "en" ? "Save & verify" : "Simpan & verifikasi")}
                        </PrimaryButton>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* info-only rows (no keys) */}
              {(g.infos || []).map((nf) => (
                <div key={nf.id} style={{ background: theme.glass, border: `1px dashed ${theme.hair}`, borderRadius: 16, padding: 13, display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: nf.color + "1C", border: `1px solid ${nf.color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="br-display" style={{ color: nf.color, fontSize: 13, fontWeight: 700, letterSpacing: -0.5 }}>{nf.glyph}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="br-sans" style={{ fontSize: 14, color: theme.ink, fontWeight: 700 }}>{lang === "en" ? nf.title_en : nf.title_id}</div>
                    <div className="br-sans" style={{ fontSize: 11.5, color: theme.ink2, marginTop: 3, lineHeight: 1.5 }}>{lang === "en" ? nf.body_en : nf.body_id}</div>
                  </div>
                  <GlassChip theme={theme} color={theme.ink3}>{lang === "en" ? "No key" : "Tanpa key"}</GlassChip>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="br-mono" style={{ fontSize: 9.5, color: theme.ink3, letterSpacing: 0.8, textAlign: "center", marginTop: 22, lineHeight: 1.7, textTransform: "uppercase" }}>
          {lang === "en" ? "Secrets stored server-side · rotated every 90 days" : "Secret disimpan di server · dirotasi tiap 90 hari"}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BR_API_GROUPS, brAllApiItems, BrSetup });
