// BrandReel — Light Glassmorphism theme system
// Cool, refined neutral canvases + a swappable accent preset (analogous-hue
// gradients, no clashing). Platform + hook accents live as standalone maps.

// Accent presets — swappable brand color system (merged onto a theme).
// Gradients stay within analogous hues so brand→accent reads smooth, not garish.
const BR_ACCENTS = {
  violet: { brand: "#6A5AF0", brandDk: "#4B3CD6", brandLt: "#A091FF", accent: "#8A6CF6", accentLt: "#B7A2FF", glow: "#CBBFFF" },
  indigo: { brand: "#4C63E6", brandDk: "#3344CC", brandLt: "#8C9AFF", accent: "#4F8FEF", accentLt: "#9FBEFF", glow: "#BCCBFF" },
  coral:  { brand: "#FB5A4D", brandDk: "#DD3A36", brandLt: "#FF8A7E", accent: "#FF7E54", accentLt: "#FFAE86", glow: "#FFC9B6" },
  emerald:{ brand: "#10B585", brandDk: "#0B9A6E", brandLt: "#4FD6A8", accent: "#14B6C2", accentLt: "#6FE0E2", glow: "#A6ECD6" },
};
const BR_ACCENT_ORDER = ["violet", "indigo", "coral", "emerald"];

const BR_THEMES = {
  // DEFAULT — cool soft daylight ("studio")
  mist: {
    name: "Mist",
    canvas:   "#F1F2F6",
    canvasAlt:"#E7E9F0",
    page:     "#FBFBFE",
    glass:    "rgba(255, 255, 255, 0.60)",
    glassDk:  "rgba(255, 255, 255, 0.40)",
    glassHi:  "rgba(255, 255, 255, 0.86)",
    ink:      "#1B1C26",
    ink2:     "#585C6E",
    ink3:     "#9A9EB2",
    hair:     "rgba(24, 26, 48, 0.10)",
    hair2:    "rgba(24, 26, 48, 0.055)",
    pos:      "#12B886",
    warn:     "#E0A11B",
    neg:      "#E5484D",
    info:     "#4F8FF0",
  },
  // pure clean white glass — for projector / bright rooms
  paper: {
    name: "Paper",
    canvas:   "#F6F7FA",
    canvasAlt:"#EEF0F4",
    page:     "#FFFFFF",
    glass:    "rgba(255, 255, 255, 0.68)",
    glassDk:  "rgba(255, 255, 255, 0.44)",
    glassHi:  "rgba(255, 255, 255, 0.94)",
    ink:      "#16171F",
    ink2:     "#565A6A",
    ink3:     "#9498A8",
    hair:     "rgba(12, 14, 28, 0.09)",
    hair2:    "rgba(12, 14, 28, 0.045)",
    pos:      "#0FAE7E",
    warn:     "#D9970F",
    neg:      "#E13B40",
    info:     "#3F83EE",
  },
  // warm refined off-white ("sand")
  sand: {
    name: "Sand",
    canvas:   "#F3EFE8",
    canvasAlt:"#EAE4DA",
    page:     "#FBF8F2",
    glass:    "rgba(255, 253, 249, 0.60)",
    glassDk:  "rgba(255, 253, 249, 0.38)",
    glassHi:  "rgba(255, 254, 250, 0.86)",
    ink:      "#221D15",
    ink2:     "#5F574B",
    ink3:     "#A39A8B",
    hair:     "rgba(50, 38, 20, 0.12)",
    hair2:    "rgba(50, 38, 20, 0.06)",
    pos:      "#13A574",
    warn:     "#C98A12",
    neg:      "#D9433E",
    info:     "#3F7FE0",
  },
  // DARK — cool charcoal with luminous accents
  dark: {
    name: "Night",
    canvas:   "#14151C",
    canvasAlt:"#1C1E28",
    page:     "#0E0F15",
    glass:    "rgba(255, 255, 255, 0.05)",
    glassDk:  "rgba(255, 255, 255, 0.03)",
    glassHi:  "rgba(255, 255, 255, 0.09)",
    ink:      "#ECEDF4",
    ink2:     "#9DA0B2",
    ink3:     "#686C7E",
    hair:     "rgba(255, 255, 255, 0.12)",
    hair2:    "rgba(255, 255, 255, 0.06)",
    pos:      "#2FD39A",
    warn:     "#F0B43A",
    neg:      "#FF6259",
    info:     "#6AA4FF",
  },
};

// Platform accents — social channels BrandReel posts to.
// domain + scopes drive the realistic OAuth consent sheet.
const BR_PLATFORMS = {
  tiktok:   { id: "tiktok",   name: "TikTok",    short: "TT", color: "#FE2C55", domain: "tiktok.com",         ratio: "9:16", maxSec: 60, capMax: 150,  hashtags: 5, note_en: "Fast cuts · trending audio · 15–20s", note_id: "Cepat · audio tren · 15–20d",
    scopes_en: ["Publish videos to your account", "Read your profile & follower count", "Read video views & insights"],
    scopes_id: ["Posting video ke akun kamu", "Baca profil & jumlah pengikut", "Baca tayangan & insight video"] },
  instagram:{ id: "instagram",name: "Instagram", short: "IG", color: "#E1306C", domain: "instagram.com",      ratio: "9:16", maxSec: 90, capMax: 2200, hashtags: 8, note_en: "Cinematic · on-screen captions · 15–30s", note_id: "Sinematik · teks layar · 15–30d",
    scopes_en: ["Publish Reels & feed posts", "Read your profile & media", "Read reach & engagement insights"],
    scopes_id: ["Posting Reels & feed", "Baca profil & media", "Baca insight jangkauan & engagement"] },
  youtube:  { id: "youtube",  name: "YouTube",   short: "YT", color: "#FF0000", domain: "accounts.google.com", ratio: "9:16", maxSec: 60, capMax: 100,  hashtags: 3, note_en: "Hook in 3s · CTA end · max 60s", note_id: "Hook 3d · CTA akhir · maks 60d",
    scopes_en: ["Upload & manage your videos", "View your channel details", "View YouTube Analytics reports"],
    scopes_id: ["Unggah & kelola video", "Lihat detail channel", "Lihat laporan YouTube Analytics"] },
  linkedin: { id: "linkedin", name: "LinkedIn",  short: "in", color: "#0A66C2", domain: "linkedin.com",        ratio: "1:1",  maxSec: 90, capMax: 700,  hashtags: 3, note_en: "Pro tone · value-first · 20–40s", note_id: "Profesional · nilai dulu · 20–40d",
    scopes_en: ["Post & share on your behalf", "Read your basic profile", "Read page & post analytics"],
    scopes_id: ["Posting & bagikan atas nama kamu", "Baca profil dasar", "Baca analitik halaman & post"] },
  twitter:  { id: "twitter",  name: "X",         short: "X",  color: "#16161A", domain: "x.com",              ratio: "16:9", maxSec: 140,capMax: 280,  hashtags: 2, note_en: "Hook + image · short copy", note_id: "Hook + gambar · teks pendek",
    scopes_en: ["Post & delete Posts for you", "Read your profile & follows", "Read post engagement metrics"],
    scopes_id: ["Posting & hapus Post untukmu", "Baca profil & following", "Baca metrik engagement post"] },
  facebook: { id: "facebook", name: "Facebook",  short: "f",  color: "#1877F2", domain: "facebook.com",        ratio: "1:1",  maxSec: 90, capMax: 2200, hashtags: 4, note_en: "Page posts · link CTA · 15–30s", note_id: "Post Page · CTA link · 15–30d",
    scopes_en: ["Publish posts to your Page", "Read your Page details", "Read Page & post insights"],
    scopes_id: ["Posting ke Page kamu", "Baca detail Page", "Baca insight Page & post"] },
};
const BR_PLATFORM_ORDER = ["tiktok", "instagram", "youtube", "linkedin", "twitter", "facebook"];

// SSO identity providers — Google & Apple sign-in.
const BR_SSO = {
  google: { id: "google", name: "Google", domain: "accounts.google.com", bg: "#FFFFFF", ink: "#1F1F1F", bordered: true,
    scopes_en: ["Your name, email & profile picture", "Confirm it’s really you"],
    scopes_id: ["Nama, email & foto profil kamu", "Konfirmasi ini benar kamu"] },
  apple:  { id: "apple", name: "Apple", domain: "appleid.apple.com", bg: "#000000", ink: "#FFFFFF", bordered: false,
    scopes_en: ["Your name & email address", "Option to Hide My Email"],
    scopes_id: ["Nama & alamat email kamu", "Opsi Sembunyikan Email"] },
};

// Brand glyphs — recognizable single/multi-color marks (size, color) => <svg>
const BR_BRAND_GLYPH = {
  tiktok: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M14.7 2h2.7c.2 1.6 1.1 3 2.7 3.6.5.2 1.1.3 1.6.3v2.7c-1.5 0-2.9-.5-4.1-1.3v6c0 3.3-2.7 6-6 5.7-2.7-.2-4.8-2.5-4.8-5.3 0-3 2.5-5.5 5.5-5.3.2 0 .4 0 .6.1v2.8c-.2-.1-.5-.1-.7-.1-1.4 0-2.6 1.2-2.5 2.7.1 1.3 1.2 2.4 2.5 2.3 1.3 0 2.3-1.1 2.3-2.5V2z"/></svg>
  ),
  instagram: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="5.2"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.2" cy="6.8" r="1.2" fill={c} stroke="none"/></svg>
  ),
  youtube: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2"><rect x="2" y="5.5" width="20" height="13" rx="3.6"/><path d="M10.2 9.3l5 2.7-5 2.7z" fill={c} stroke="none"/></svg>
  ),
  linkedin: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8.3h4.4V23H.5V8.3zM8.3 8.3h4.2v2h.1c.6-1.1 2-2.3 4.3-2.3 4.5 0 5.4 3 5.4 6.8V23h-4.5v-6.2c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V23H8.3V8.3z"/></svg>
  ),
  twitter: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M17.3 3h3.3l-7.2 8.2L22 21h-6.6l-5.2-6.8L4.3 21H1l7.7-8.8L2 3h6.8l4.7 6.2L17.3 3zm-1.2 16h1.8L8 4.8H6.1L16.1 19z"/></svg>
  ),
  facebook: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.8 3.7-3.8 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>
  ),
  google: (s) => (
    <svg width={s} height={s} viewBox="0 0 24 24"><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z"/><path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.4 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21.4 7.6 24 12 24z"/><path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6V7H1.8a12 12 0 0 0 0 10.6l3.8-2.9z"/><path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.2 15.1 0 12 0 7.6 0 3.7 2.6 1.8 6.4l3.8 2.9C6.5 6.7 9 4.8 12 4.8z"/></svg>
  ),
  apple: (s, c) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M16.4 12.6c0-2.4 1.9-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.9-1.5-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.4 1.1 0 1.6-.7 3-.7s1.7.7 2.9.7 2-1.1 2.7-2.2c.9-1.3 1.2-2.5 1.2-2.6-.1 0-2.4-.9-2.4-3.5zM14.2 5.2c.6-.8 1-1.8.9-2.9-.9.1-2 .6-2.7 1.4-.6.7-1.1 1.7-.9 2.8 1 .1 2-.5 2.7-1.3z"/></svg>
  ),
};
function BrandGlyph({ pid, size = 20, color }) {
  const g = BR_BRAND_GLYPH[pid];
  return g ? g(size, color || "currentColor") : null;
}

// Hook angles — the 5 UGC narrative variations generated per campaign.
const BR_HOOKS = {
  h1: { id: "h1", num: 1, color: "#2D7FF0", key_en: "Problem → Solution", key_id: "Masalah → Solusi",   glyph: "PS" },
  h2: { id: "h2", num: 2, color: "#6D4AFF", key_en: "Unboxing reveal",    key_id: "Unboxing",            glyph: "UB" },
  h3: { id: "h3", num: 3, color: "#FF5A47", key_en: "Before → After",     key_id: "Sebelum → Sesudah",   glyph: "BA" },
  h4: { id: "h4", num: 4, color: "#1FA971", key_en: "Testimonial",        key_id: "Testimoni",           glyph: "TM" },
  h5: { id: "h5", num: 5, color: "#E0A11B", key_en: "Trending audio",     key_id: "Audio tren",          glyph: "TR" },
};
const BR_HOOK_ORDER = ["h1", "h2", "h3", "h4", "h5"];

// Font + base style injection
(function () {
  if (typeof document === 'undefined') return;
  if (document.getElementById('br-fonts')) return;
  const link = document.createElement('link');
  link.id = 'br-fonts';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap';
  document.head.appendChild(link);

  const style = document.createElement('style');
  style.id = 'br-styles';
  style.textContent = `
    .br-display { font-family: 'Space Grotesk', 'Plus Jakarta Sans', system-ui, sans-serif; font-weight: 600; letter-spacing: -0.035em; }
    .br-display em { font-style: italic; font-weight: 500; }
    .br-sans    { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    .br-mono    { font-family: 'Geist Mono', 'JetBrains Mono', Menlo, monospace; }
    .br-eyebrow { font-family: 'Geist Mono', monospace; font-size: 10px; letter-spacing: 2.2px; text-transform: uppercase; font-weight: 500; }
    .br-num     { font-variant-numeric: tabular-nums; font-feature-settings: 'tnum'; }
    .br-app, .br-app * { scrollbar-width: none; -ms-overflow-style: none; }
    .br-app::-webkit-scrollbar, .br-app *::-webkit-scrollbar { width: 0; height: 0; display: none; }
    .br-glass { backdrop-filter: blur(22px) saturate(150%); -webkit-backdrop-filter: blur(22px) saturate(150%); }
    .br-press { transition: transform 120ms ease, box-shadow 120ms ease; }
    .br-press:active { transform: scale(0.975); }
    .br-backdrop { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
    .br-blob { position: absolute; border-radius: 50%; filter: blur(58px); opacity: 0.28; }
    @keyframes brBar { from { background-position: 0 0; } to { background-position: 28px 0; } }
    @keyframes brSheetUp { from { transform: translateY(22px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    @keyframes brBackdropIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes brPop { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
  `;
  document.head.appendChild(style);
})();

// Brand wordmark — "BrandReel" with a gradient reel-dot
function BrandMark({ theme, size = 22, mono = false }) {
  const grad = `linear-gradient(120deg, ${theme.brand}, ${theme.accent})`;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: size * 0.34 }}>
      <span style={{
        width: size * 1.02, height: size * 1.02, borderRadius: "32%",
        background: grad, position: "relative", flexShrink: 0,
        boxShadow: `0 4px 14px -4px ${theme.brand}88`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ width: size * 0.32, height: size * 0.32, borderRadius: "50%", background: "rgba(255,255,255,0.92)" }} />
      </span>
      {!mono && (
        <span className="br-display" style={{ fontSize: size, color: theme.ink, letterSpacing: -0.6, lineHeight: 1 }}>
          Brand<span style={{ color: theme.brand }}>Reel</span>
        </span>
      )}
    </span>
  );
}

// Ornamental backdrop — soft blurred gradient blobs behind glass.
function GlassBackdrop({ theme, density = "soft" }) {
  const blobs = density === "rich"
    ? [
        { c: theme.brand  + "4D", x: "-6%", y: "-4%", w: 460, h: 460 },
        { c: theme.accent + "3D", x: "72%", y: "-6%", w: 520, h: 520 },
        { c: theme.glow   + "3D", x: "48%", y: "72%", w: 400, h: 400 },
      ]
    : [
        { c: theme.brand  + "22", x: "-8%", y: "-2%", w: 380, h: 380 },
        { c: theme.accent + "22", x: "78%", y: "70%", w: 380, h: 380 },
      ];
  return (
    <div className="br-backdrop">
      {blobs.map((b, i) => (
        <div key={i} className="br-blob" style={{
          left: b.x, top: b.y, width: b.w, height: b.h,
          background: `radial-gradient(circle, ${b.c} 0%, transparent 62%)`,
        }} />
      ))}
    </div>
  );
}

// Reusable glass panel
function GlassPanel({ theme, style = {}, children, tone = "light", padding = 16, className = "" }) {
  const bg = tone === "solid" ? theme.glassHi : tone === "dim" ? theme.glassDk : theme.glass;
  return (
    <div className={"br-glass " + className} style={{
      background: bg, border: `1px solid ${theme.hair}`, borderRadius: 16, padding, ...style,
    }}>{children}</div>
  );
}

// Pill / chip
function GlassChip({ theme, color, children, style = {}, solid = false }) {
  const c = color || theme.ink2;
  return (
    <span className="br-mono" style={{
      display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 9px",
      background: solid ? c : c + "16",
      border: `1px solid ${solid ? c : c + "3A"}`,
      color: solid ? "#fff" : c,
      fontSize: 9.5, letterSpacing: 1.1, textTransform: "uppercase", fontWeight: 600,
      borderRadius: 999, whiteSpace: "nowrap", ...style,
    }}>{children}</span>
  );
}

// Smooth sparkline
function GlassSparkline({ color, width = 60, height = 18, points }) {
  const pts = points || [4, 6, 5, 7, 6, 9, 8, 11, 9, 12];
  const max = Math.max(...pts), min = Math.min(...pts);
  const w = width / (pts.length - 1);
  const xys = pts.map((p, i) => [i * w, height - ((p - min) / (max - min || 1)) * (height - 2) - 1]);
  const path = xys.map(([x, y], i) => {
    if (i === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    const [px, py] = xys[i - 1];
    return `Q ${((px + x) / 2).toFixed(1)} ${py.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// Platform glyph badge (square, glassy) — renders the real brand mark
function PlatformBadge({ pid, size = 30, solid = false }) {
  const p = BR_PLATFORMS[pid];
  if (!p) return null;
  const glyph = BR_BRAND_GLYPH[pid];
  return (
    <div style={{
      width: size, height: size, flexShrink: 0, borderRadius: size * 0.3,
      background: solid ? p.color : p.color + "1C",
      border: `1px solid ${p.color}${solid ? "" : "44"}`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {glyph
        ? glyph(size * 0.56, solid ? "#fff" : p.color)
        : <span className="br-display" style={{ color: solid ? "#fff" : p.color, fontSize: size * 0.4, fontWeight: 700, letterSpacing: -0.5 }}>{p.short}</span>}
    </div>
  );
}

Object.assign(window, {
  BR_THEMES, BR_ACCENTS, BR_ACCENT_ORDER, BR_PLATFORMS, BR_PLATFORM_ORDER, BR_HOOKS, BR_HOOK_ORDER,
  BR_SSO, BR_BRAND_GLYPH, BrandGlyph,
  BrandMark, GlassBackdrop, GlassPanel, GlassChip, GlassSparkline, PlatformBadge,
});
