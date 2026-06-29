// BrandReel — insights, inbox (alerts), Copilot chat (Claude), profile/RBAC.

const { useState: in_useState, useEffect: in_useEffect, useRef: in_useRef } = React;

// ──────────────────────────────────────────────────────────────
// INSIGHTS — analytics dashboard
// ──────────────────────────────────────────────────────────────
function BrInsights({ onNavigate }) {
  const { theme, lang, scenario } = useBr();
  const t = BR_T[lang];

  const platData = [
    { pid: "tiktok", v: 1200, label: "1.2M" }, { pid: "instagram", v: 272, label: "272K" },
    { pid: "youtube", v: 113, label: "113K" }, { pid: "twitter", v: 28, label: "28K" }, { pid: "linkedin", v: 15, label: "15K" },
  ];
  const maxV = Math.max(...platData.map((d) => d.v));
  const hookData = [
    { hid: "h3", pct: 92 }, { hid: "h2", pct: 71 }, { hid: "h1", pct: 58 }, { hid: "h4", pct: 49 }, { hid: "h5", pct: 38 },
  ];

  return (
    <BrAppShell theme={theme} density="soft">
      <BrAppHeader title={t.insights.title} subtitle={lang === "en" ? "LAST 7 DAYS · ALL CAMPAIGNS" : "7 HARI · SEMUA KAMPANYE"}
        right={<GlassChip theme={theme} color={scenario.accent}>{lang === "en" ? scenario.label_en : scenario.label_id}</GlassChip>} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 24px" }}>
        {/* KPI row */}
        <div style={{ display: "flex", gap: 9 }}>
          {[{ v: scenario.impressions, l: t.home.impressions }, { v: scenario.eng, l: t.home.engagement }, { v: scenario.reach, l: t.home.reach }].map((s, i) => (
            <GlassPanel key={i} theme={theme} padding={13} style={{ flex: 1 }}>
              <div className="br-display br-num" style={{ fontSize: 20, color: theme.ink, letterSpacing: -0.5, lineHeight: 1 }}>{s.v}</div>
              <div className="br-mono" style={{ fontSize: 8, color: theme.ink3, letterSpacing: 0.6, marginTop: 5, textTransform: "uppercase" }}>{s.l}</div>
            </GlassPanel>
          ))}
        </div>

        {/* top performer */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{t.insights.top}</div>
        <button onClick={() => onNavigate({ name: "detail", id: "c-bamboo-tb" })} className="br-press" style={{
          width: "100%", textAlign: "left", border: "none", cursor: "pointer", fontFamily: "inherit",
          borderRadius: 16, padding: 16, position: "relative", overflow: "hidden",
          background: `linear-gradient(135deg, ${theme.brand}, ${theme.accent})`, color: "#fff", boxShadow: `0 12px 26px -12px ${theme.brand}`,
        }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 150, height: 150, borderRadius: "50%", filter: "blur(40px)", opacity: 0.4, background: "rgba(255,255,255,0.5)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span className="br-display" style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>BT</span>
            </div>
            <div style={{ flex: 1 }}>
              <div className="br-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", letterSpacing: 1, fontWeight: 700, textTransform: "uppercase" }}>HOOK 3 · {lang === "en" ? BR_HOOKS.h3.key_en : BR_HOOKS.h3.key_id}</div>
              <div className="br-display" style={{ fontSize: 18, color: "#fff", letterSpacing: -0.4, marginTop: 3 }}>Bamboo toothbrush</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="br-display br-num" style={{ fontSize: 22, color: "#fff", letterSpacing: -0.5, lineHeight: 1 }}>1.2M</div>
              <div className="br-mono" style={{ fontSize: 8, color: "rgba(255,255,255,0.8)", letterSpacing: 0.6, marginTop: 3 }}>5.8% ENG</div>
            </div>
          </div>
        </button>

        {/* by platform */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{t.insights.byPlatform}</div>
        <GlassPanel theme={theme} padding={14}>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {platData.map((d) => {
              const p = BR_PLATFORMS[d.pid];
              return (
                <div key={d.pid} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <span style={{ width: 30, fontFamily: "Geist Mono", fontSize: 11, fontWeight: 700, color: p.color }}>{p.short}</span>
                  <div style={{ flex: 1, height: 10, borderRadius: 99, background: theme.hair2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.max(6, (d.v / maxV) * 100)}%`, background: p.color, borderRadius: 99, transition: "width 600ms ease" }} />
                  </div>
                  <span className="br-mono br-num" style={{ width: 44, textAlign: "right", fontSize: 11, color: theme.ink2, fontWeight: 600 }}>{d.label}</span>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        {/* by hook */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{t.insights.byHook}</div>
        <GlassPanel theme={theme} padding={14}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 9, height: 96 }}>
            {hookData.map((d) => {
              const h = BR_HOOKS[d.hid];
              return (
                <div key={d.hid} style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                  <div style={{ width: "100%", height: `${d.pct}%`, minHeight: 6, borderRadius: "6px 6px 3px 3px", background: `linear-gradient(${h.color}, ${h.color}99)` }} />
                  <span className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.4 }}>{h.glyph}</span>
                </div>
              );
            })}
          </div>
        </GlassPanel>

        {/* recommendation */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{t.insights.reco}</div>
        <GlassPanel theme={theme} padding={14} style={{ display: "flex", gap: 12, borderColor: theme.accent + "40" }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: theme.accent + "1C", border: `1px solid ${theme.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>💡</span>
          <div className="br-sans" style={{ fontSize: 12.5, color: theme.ink2, lineHeight: 1.5 }}>
            {lang === "en"
              ? "Hook 2 (Unboxing) underperforms on LinkedIn. Swap to Testimonial there — it lifts pro-audience engagement ~2.4×."
              : "Hook 2 (Unboxing) lemah di LinkedIn. Ganti ke Testimoni di sana — naikkan engagement audiens pro ~2,4×."}
          </div>
        </GlassPanel>
      </div>
    </BrAppShell>
  );
}

// ──────────────────────────────────────────────────────────────
// INBOX — system alerts + entry to Copilot
// ──────────────────────────────────────────────────────────────
function BrInbox({ onNavigate }) {
  const { theme, lang } = useBr();
  const t = BR_T[lang];
  return (
    <BrAppShell theme={theme} density="soft">
      <BrAppHeader title={t.inbox.title} subtitle={lang === "en" ? "ALERTS · AUTOMATIONS" : "NOTIFIKASI · OTOMASI"} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 24px" }}>
        {/* copilot banner */}
        <button onClick={() => onNavigate({ name: "copilot" })} className="br-press" style={{
          width: "100%", textAlign: "left", border: "none", cursor: "pointer", fontFamily: "inherit",
          borderRadius: 16, padding: 14, position: "relative", overflow: "hidden",
          background: `linear-gradient(120deg, ${theme.accent}, ${theme.brand})`, color: "#fff", boxShadow: `0 12px 26px -12px ${theme.accent}`,
        }}>
          <div style={{ position: "absolute", right: -20, top: -24, width: 130, height: 130, borderRadius: "50%", filter: "blur(36px)", opacity: 0.4, background: "rgba(255,255,255,0.5)" }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>✦</span>
            <div style={{ flex: 1 }}>
              <div className="br-display" style={{ fontSize: 16, color: "#fff", letterSpacing: -0.3 }}>{t.inbox.copilot}</div>
              <div className="br-mono" style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", letterSpacing: 0.6, marginTop: 3, textTransform: "uppercase" }}>{lang === "en" ? "Ask about hooks, captions, timing" : "Tanya soal hook, caption, waktu"}</div>
            </div>
            <span style={{ fontSize: 20, opacity: 0.9 }}>›</span>
          </div>
        </button>

        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{t.inbox.alerts} · {BR_ALERTS.length}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {BR_ALERTS.map((a) => (
            <button key={a.id} onClick={() => onNavigate(a.route)} className="br-press" style={{
              width: "100%", textAlign: "left", border: `1px solid ${theme.hair}`, cursor: "pointer", fontFamily: "inherit",
              background: theme.glassHi, borderRadius: 14, padding: 12, display: "flex", gap: 11, alignItems: "flex-start",
            }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: a.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Geist Mono", fontSize: 9, fontWeight: 800, letterSpacing: 0.3 }}>{a.tag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span className="br-sans" style={{ fontSize: 13.5, color: theme.ink, fontWeight: 700, lineHeight: 1.2 }}>{lang === "en" ? a.title_en : a.title_id}</span>
                  <span className="br-mono" style={{ fontSize: 9, color: theme.ink3, flexShrink: 0, paddingTop: 2 }}>{a.time}</span>
                </div>
                <div className="br-sans" style={{ fontSize: 11.5, color: theme.ink2, marginTop: 3, lineHeight: 1.4 }}>{lang === "en" ? a.body_en : a.body_id}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </BrAppShell>
  );
}

// ──────────────────────────────────────────────────────────────
// COPILOT — Claude-powered marketing assistant
// ──────────────────────────────────────────────────────────────
function BrCopilot({ onBack }) {
  const { theme, lang, persona } = useBr();
  const t = BR_T[lang];
  const storeKey = "br-copilot-" + persona.id + "-" + lang;
  const [messages, setMessages] = in_useState(() => {
    try { const raw = sessionStorage.getItem(storeKey); if (raw) return JSON.parse(raw); } catch (e) {}
    return [{ role: "assistant", text: lang === "en"
      ? `Hi ${persona.name.split(" ")[0]} — I'm your BrandReel Copilot. Ask me to draft hooks, tune captions, or pick the best posting window.`
      : `Hai ${persona.name.split(" ")[0]} — saya Copilot BrandReel. Minta saya buat hook, atur caption, atau pilih waktu posting terbaik.`, time: "" }];
  });
  const [draft, setDraft] = in_useState("");
  const [busy, setBusy] = in_useState(false);
  const scrollRef = in_useRef(null);

  const suggestions = lang === "en"
    ? ["Write a TikTok hook for a bamboo bottle", "Why is my LinkedIn reach low?", "Best time to post Reels?"]
    : ["Buat hook TikTok untuk botol bambu", "Kenapa reach LinkedIn rendah?", "Waktu terbaik posting Reels?"];

  in_useEffect(() => {
    try { sessionStorage.setItem(storeKey, JSON.stringify(messages)); } catch (e) {}
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  async function send(text) {
    const txt = (text != null ? text : draft).trim();
    if (!txt || busy) return;
    setDraft("");
    const now = new Date(); const ts = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
    const history = [...messages, { role: "user", text: txt, time: ts }];
    setMessages(history); setBusy(true);
    try {
      const sys = `You are BrandReel Copilot, an AI marketing assistant inside BrandReel — a tool that auto-generates UGC videos and captions for creators/brands and auto-posts to TikTok, Instagram Reels, YouTube Shorts, LinkedIn and X. You're helping ${persona.name} (${lang === "en" ? persona.role_en : persona.role_id}), brand voice: ${lang === "en" ? persona.voice_en : persona.voice_id}. Be concise, practical, friendly. Reply in ${lang === "en" ? "English" : "Bahasa Indonesia"}. Reference the 5 hook angles (Problem/Solution, Unboxing, Before/After, Testimonial, Trending audio) and platform specs when relevant. Max 3 short sentences or a tight list.`;
      const transcript = history.map((m) => `${m.role === "user" ? "User" : "Copilot"}: ${m.text}`).join("\n");
      const reply = await window.claude.complete(`${sys}\n\n${transcript}\n\nCopilot:`);
      const n2 = new Date(); const ts2 = String(n2.getHours()).padStart(2, "0") + ":" + String(n2.getMinutes()).padStart(2, "0");
      setMessages((m) => [...m, { role: "assistant", text: (reply || "").trim() || "…", time: ts2 }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: lang === "en" ? "(Connection issue — please retry)" : "(Gangguan koneksi — coba lagi)", time: "—" }]);
    } finally { setBusy(false); }
  }

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: theme.canvas }}>
      <BrAppHeader title={t.inbox.copilot} subtitle="AI · CLAUDE" color={theme.accent} onBack={onBack}
        right={<div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 99, background: theme.accent + "16", border: `1px solid ${theme.hair}` }}>
          <span style={{ width: 5, height: 5, borderRadius: 99, background: theme.accent, boxShadow: `0 0 6px ${theme.accent}` }} />
          <span className="br-mono" style={{ fontSize: 9, letterSpacing: 1.2, color: theme.accent, fontWeight: 700 }}>LIVE</span>
        </div>} />

      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m, i) => {
          const u = m.role === "user";
          return (
            <div key={i} style={{ display: "flex", justifyContent: u ? "flex-end" : "flex-start" }}>
              <div className="br-sans" style={{
                maxWidth: "82%", padding: "9px 13px", borderRadius: 15, fontSize: 13.5, lineHeight: 1.45,
                background: u ? `linear-gradient(120deg, ${theme.brand}, ${theme.accent})` : theme.glassHi,
                color: u ? "#fff" : theme.ink, border: u ? "none" : `1px solid ${theme.hair}`,
                boxShadow: u ? `0 6px 16px -6px ${theme.brand}` : "0 2px 8px rgba(60,28,36,0.05)",
              }}>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.text}</div>
                {m.time && <div className="br-mono" style={{ fontSize: 8.5, letterSpacing: 0.8, marginTop: 4, color: u ? "rgba(255,255,255,0.6)" : theme.ink3, textAlign: "right" }}>{m.time}</div>}
              </div>
            </div>
          );
        })}
        {busy && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 14px", borderRadius: 15, background: theme.glassHi, border: `1px solid ${theme.hair}`, display: "inline-flex", gap: 4 }}>
              {[0, 1, 2].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: 99, background: theme.ink3, animation: `protoBlip 1.2s ${i * 0.15}s infinite` }} />)}
            </div>
          </div>
        )}
        {messages.length <= 1 && !busy && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 6 }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)} className="br-press" style={{
                border: `1px solid ${theme.hair}`, background: theme.glassHi, color: theme.ink2, borderRadius: 99, padding: "8px 13px",
                cursor: "pointer", fontFamily: "Plus Jakarta Sans", fontSize: 12, fontWeight: 600, textAlign: "left",
              }}>{s}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: "8px 12px 12px", borderTop: `1px solid ${theme.hair2}`, background: theme.glassHi, display: "flex", gap: 8, alignItems: "flex-end" }}>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={t.inbox.typePh} style={{
          flex: 1, resize: "none", border: `1px solid ${theme.hair}`, borderRadius: 18, padding: "10px 14px", background: theme.canvas, color: theme.ink,
          fontFamily: "Plus Jakarta Sans", fontSize: 13.5, outline: "none", maxHeight: 100,
        }} />
        <button onClick={() => send()} disabled={!draft.trim() || busy} className="br-press" style={{
          border: "none", cursor: !draft.trim() || busy ? "default" : "pointer", width: 38, height: 38, borderRadius: 99, padding: 0,
          background: `linear-gradient(120deg, ${theme.brand}, ${theme.accent})`, color: "#fff", opacity: !draft.trim() || busy ? 0.4 : 1,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M3 11l18-8-8 18-2-7-8-3z"/></svg></button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// PROFILE — account, plan & usage, connected accounts, brand kit, team, RBAC
// ──────────────────────────────────────────────────────────────
const BR_TOKEN_STATUS = {
  tiktok:    { st: "expiring", note_en: "expires in 24h · auto-refresh on", note_id: "kedaluwarsa 24j · auto-refresh aktif" },
  instagram: { st: "ok",       note_en: "valid · 58 days left",            note_id: "valid · 58 hari lagi" },
  youtube:   { st: "ok",       note_en: "valid · quota 42/50 today",        note_id: "valid · kuota 42/50 hari ini" },
  linkedin:  { st: "ok",       note_en: "session alive · refreshed",        note_id: "sesi aktif · disegarkan" },
  twitter:   { st: "ok",       note_en: "valid · 450/15m headroom",         note_id: "valid · 450/15m tersisa" },
  facebook:  { st: "ok",       note_en: "Page token valid · 60 days",       note_id: "Token Page valid · 60 hari" },
};

// Plan tiers (mapped to the RBAC personas that embody them)
const BR_PLANS = [
  { id: "creator", persona: "creator", name: "Creator", price_m: 39, price_y: 31, rank: 1,
    tagline_en: "For solo creators", tagline_id: "Untuk kreator solo",
    feat_en: ["30 posts / month", "12 AI video renders (Veo)", "Unlimited canvas renders", "5 AI hook angles", "Basic insights"],
    feat_id: ["30 post / bulan", "12 render video AI (Veo)", "Render canvas tanpa batas", "5 sudut hook AI", "Insight dasar"] },
  { id: "pro", persona: "brand", name: "Pro", price_m: 99, price_y: 79, rank: 2,
    tagline_en: "For growing DTC brands", tagline_id: "Untuk brand DTC berkembang",
    feat_en: ["100 posts / month", "40 AI video renders (Veo)", "Unlimited canvas renders", "Brand kit & voice learning", "Full insights + Copilot"],
    feat_id: ["100 post / bulan", "40 render video AI (Veo)", "Render canvas tanpa batas", "Brand kit & pembelajaran voice", "Insight penuh + Copilot"] },
  { id: "agency", persona: "agency_admin", name: "Agency", price_m: 299, price_y: 239, rank: 3,
    tagline_en: "For agencies & teams", tagline_id: "Untuk agensi & tim",
    feat_en: ["Unlimited posts · fair use", "150 AI video renders (Veo)", "20 brands · 10 seats", "Team roles & RBAC", "Priority rendering"],
    feat_id: ["Post tanpa batas · wajar", "150 render video AI (Veo)", "20 brand · 10 kursi", "Peran tim & RBAC", "Render prioritas"] },
];
function brPlanRank(id) { const p = BR_PLANS.find((x) => x.id === id); return p ? p.rank : 0; }

const BR_TEAM = [
  { initial: "DA", name: "Devi Anggara",  role_en: "Agency Manager",   role_id: "Manajer Agensi",   color: "#6D4AFF", owner: true },
  { initial: "RW", name: "Rangga Wijaya", role_en: "Team Member",      role_id: "Anggota Tim",      color: "#E0A11B" },
  { initial: "SL", name: "Sari Lestari",  role_en: "Brand Strategist", role_id: "Strategis Brand",  color: "#1FA971" },
  { initial: "BP", name: "Bayu Pratama",  role_en: "Video Editor",     role_id: "Editor Video",     color: "#2D7FF0" },
];
const BR_BRANDS_SAMPLE = ["Eco Goods", "Kopi Nusantara", "Batik Modern", "Hijau Living", "Rasa Lokal", "Sawit Care", "Laut Biru", "Tani Maju", "Kriya Kita", "Sehat Alam", "Gula Aren", "Akar Wangi", "Bambu Lestari", "Madu Hutan", "Tenun Ikat", "Sabun Suci", "Daun Teh", "Pasir Putih", "Rempah Asli", "Bumi Subur"];
const BR_BRAND_COLORS = ["#1FA971", "#F23E5C", "#2D7FF0", "#6D4AFF", "#E0A11B", "#0A66C2"];

// ── Manage plan sheet ──────────────────────────────────────────
function BrPlanSheet({ open, onClose }) {
  const { theme, lang, persona, setPersonaId, fireToast, deviceKind } = useBr();
  const en = lang === "en";
  const [cycle, setCycle] = in_useState("m");
  const [iap, setIap] = in_useState(null);
  if (!open) return null;
  const current = persona.plan;
  const store = deviceKind === "android" ? "play" : "appstore";
  return (
    <React.Fragment>
    <BrSheet open={open} onClose={onClose} title={en ? "Manage plan" : "Kelola paket"} subtitle={en ? "Billing" : "Tagihan"} accent={theme.brand}>
      <div style={{ display: "flex", gap: 5, padding: 4, background: theme.canvasAlt, borderRadius: 12, marginBottom: 16 }}>
        {[{ k: "m", l: en ? "Monthly" : "Bulanan" }, { k: "y", l: en ? "Yearly · −20%" : "Tahunan · −20%" }].map((o) => (
          <button key={o.k} onClick={() => setCycle(o.k)} className="br-press" style={{
            flex: 1, border: "none", cursor: "pointer", borderRadius: 9, padding: "8px 6px",
            fontFamily: "Plus Jakarta Sans", fontSize: 12.5, fontWeight: 700,
            background: cycle === o.k ? theme.page : "transparent", color: cycle === o.k ? theme.ink : theme.ink3,
            boxShadow: cycle === o.k ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
          }}>{o.l}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {BR_PLANS.map((pl) => {
          const isCur = pl.id === current;
          const price = cycle === "y" ? pl.price_y : pl.price_m;
          const up = pl.rank > brPlanRank(current);
          return (
            <div key={pl.id} style={{ border: `1.5px solid ${isCur ? theme.brand : theme.hair}`, borderRadius: 18, padding: 16, background: isCur ? theme.brand + "0C" : theme.glassHi }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div className="br-display" style={{ fontSize: 18, color: theme.ink, letterSpacing: -0.4 }}>{pl.name}</div>
                  <div className="br-sans" style={{ fontSize: 11.5, color: theme.ink3, marginTop: 2 }}>{en ? pl.tagline_en : pl.tagline_id}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="br-display br-num" style={{ fontSize: 24, color: theme.ink, letterSpacing: -0.8, lineHeight: 1 }}>${price}</div>
                  <div className="br-mono" style={{ fontSize: 8, color: theme.ink3, letterSpacing: 0.6, marginTop: 3, textTransform: "uppercase" }}>{en ? "per month" : "per bulan"}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 13 }}>
                {(en ? pl.feat_en : pl.feat_id).map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isCur ? theme.brand : theme.pos} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><path d="M4 12l5 5L20 6"/></svg>
                    <span className="br-sans" style={{ fontSize: 12.5, color: theme.ink2, lineHeight: 1.35 }}>{f}</span>
                  </div>
                ))}
              </div>
              {isCur ? (
                <div style={{ marginTop: 14, textAlign: "center", padding: 10, borderRadius: 12, background: theme.brand + "14", color: theme.brand, fontFamily: "Geist Mono, monospace", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>● {en ? "Current plan" : "Paket aktif"}</div>
              ) : (
                <button onClick={() => {
                  const yearly = cycle === "y";
                  setIap({ kind: "sub", persona: pl.persona, planName: pl.name,
                    title: `${pl.name} — ${yearly ? (en ? "Yearly" : "Tahunan") : (en ? "Monthly" : "Bulanan")}`,
                    sub: "BrandReel Premium",
                    price: yearly ? pl.price_y * 12 : pl.price_m,
                    period: yearly ? (en ? "per year" : "per tahun") : (en ? "per month" : "per bulan"),
                    periodWord: yearly ? (en ? "yr" : "thn") : (en ? "mo" : "bln") });
                }} className="br-press" style={{
                  width: "100%", marginTop: 14, padding: 12, borderRadius: 12, border: "none", cursor: "pointer",
                  fontFamily: "Plus Jakarta Sans", fontSize: 13.5, fontWeight: 700, color: "#fff",
                  background: `linear-gradient(120deg, ${theme.brand}, ${theme.accent})`,
                }}>{up ? (en ? `Upgrade to ${pl.name}` : `Naik ke ${pl.name}`) : (en ? `Switch to ${pl.name}` : `Pindah ke ${pl.name}`)}</button>
              )}
            </div>
          );
        })}
      </div>
      <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.6, textAlign: "center", marginTop: 16, lineHeight: 1.6, textTransform: "uppercase" }}>{en ? "Cancel anytime · prorated billing" : "Batal kapan saja · tagihan proporsional"}</div>
    </BrSheet>
    {iap && <BrIAPSheet product={iap} store={store} onCancel={() => setIap(null)} onComplete={(prod) => {
      setIap(null); setPersonaId(prod.persona);
      fireToast({ tag: "PLAN", color: theme.pos, source: "BrandReel",
        title: en ? `You're now on ${prod.planName}` : `Kamu kini di ${prod.planName}`,
        body: en ? "Subscription active · auto-renews." : "Langganan aktif · perpanjang otomatis." });
      onClose();
    }} />}
    </React.Fragment>
  );
}

// ── Brand kit sheet ────────────────────────────────────────────
function BrBrandKitSheet({ open, onClose }) {
  const { theme, lang, persona, fireToast } = useBr();
  const en = lang === "en";
  const canEdit = persona.can.brandkit;
  const [voice, setVoice] = in_useState("");
  in_useEffect(() => { setVoice(en ? persona.voice_en : persona.voice_id); }, [persona.id, en, open]);
  if (!open) return null;
  const tones = en ? ["Casual", "Friendly", "Eco-conscious"] : ["Santai", "Ramah", "Sadar lingkungan"];
  const palette = [persona.color, theme.brand, theme.accent, "#E0A11B"];
  return (
    <BrSheet open={open} onClose={onClose} title={en ? "Brand kit" : "Brand kit"}
      subtitle={canEdit ? (en ? "Editable" : "Bisa diedit") : (en ? "View only" : "Lihat saja")} accent={persona.color}
      footer={canEdit ? (
        <PrimaryButton onClick={() => { fireToast({ tag: "KIT", color: theme.pos, source: "BrandReel", title: en ? "Brand kit saved" : "Brand kit tersimpan", body: en ? "Applied to all new captions & videos." : "Diterapkan ke caption & video baru." }); onClose(); }} gradient={`linear-gradient(120deg, ${theme.brand}, ${theme.accent})`} color={theme.brand}>{en ? "Save brand kit" : "Simpan brand kit"}</PrimaryButton>
      ) : null}>
      <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
        <div style={{ width: 54, height: 54, borderRadius: 15, background: persona.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 10px 22px -10px ${persona.color}` }}>
          <span className="br-display" style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{persona.initial}</span>
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="br-display" style={{ fontSize: 17, color: theme.ink, letterSpacing: -0.3 }}>{persona.handle.replace("@", "")}</div>
          <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.6, marginTop: 3, textTransform: "uppercase" }}>{en ? persona.role_en : persona.role_id}</div>
        </div>
      </div>

      <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", margin: "20px 0 8px" }}>{en ? "Brand voice" : "Brand voice"}</div>
      {canEdit ? (
        <textarea value={voice} onChange={(e) => setVoice(e.target.value)} rows={2} style={{ width: "100%", boxSizing: "border-box", resize: "none", background: theme.glassHi, border: `1px solid ${theme.hair}`, borderRadius: 12, padding: "11px 13px", fontFamily: "Plus Jakarta Sans", fontSize: 13.5, color: theme.ink, outline: "none", lineHeight: 1.5 }} />
      ) : (
        <GlassPanel theme={theme} padding={13}><div className="br-sans" style={{ fontSize: 13.5, color: theme.ink, lineHeight: 1.5 }}>{voice}</div></GlassPanel>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
        {tones.map((tn, i) => (<span key={i} className="br-sans" style={{ border: `1px solid ${persona.color}40`, background: persona.color + "12", color: persona.color, borderRadius: 99, padding: "6px 12px", fontSize: 12, fontWeight: 600 }}>{tn}</span>))}
      </div>

      <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", margin: "20px 0 8px" }}>{en ? "Brand colors" : "Warna brand"}</div>
      <div style={{ display: "flex", gap: 9 }}>
        {palette.map((c, i) => (<div key={i} style={{ flex: 1 }}><div style={{ height: 40, borderRadius: 11, background: c, border: `1px solid ${theme.hair}` }} /><div className="br-mono" style={{ fontSize: 8, color: theme.ink3, letterSpacing: 0.3, marginTop: 5, textAlign: "center" }}>{c.toUpperCase()}</div></div>))}
      </div>

      <div style={{ marginTop: 18, display: "flex", alignItems: "center", gap: 11, padding: "12px 13px", borderRadius: 14, border: `1px solid ${theme.hair}`, background: theme.glassHi }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: persona.can.voiceLearn ? theme.pos + "1C" : theme.hair, border: `1px solid ${persona.can.voiceLearn ? theme.pos + "40" : theme.hair}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={persona.can.voiceLearn ? theme.pos : theme.ink3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="br-sans" style={{ fontSize: 13, color: theme.ink, fontWeight: 600 }}>{en ? "Voice learning" : "Pembelajaran voice"}</div>
          <div className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.4, marginTop: 2, textTransform: "uppercase" }}>{persona.can.voiceLearn ? (en ? "Learning from your posts" : "Belajar dari post kamu") : (en ? "Not on this plan" : "Tak ada di paket ini")}</div>
        </div>
        <span style={{ width: 34, height: 20, borderRadius: 99, background: persona.can.voiceLearn ? theme.pos : theme.hair, position: "relative", flexShrink: 0 }}><span style={{ position: "absolute", top: 2, left: persona.can.voiceLearn ? 16 : 2, width: 16, height: 16, borderRadius: 99, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} /></span>
      </div>
      {!canEdit && <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.6, textAlign: "center", marginTop: 16, lineHeight: 1.6, textTransform: "uppercase" }}>🔒 {en ? "Managed by your agency admin" : "Dikelola admin agensi"}</div>}
    </BrSheet>
  );
}

// ── Team & brands sheet ────────────────────────────────────────
function BrTeamSheet({ open, onClose }) {
  const { theme, lang, persona, fireToast } = useBr();
  const en = lang === "en";
  if (!open) return null;
  const isManager = persona.can.team;
  const brands = BR_BRANDS_SAMPLE.slice(0, persona.brands);
  return (
    <BrSheet open={open} onClose={onClose} title={en ? "Team & brands" : "Tim & brand"} subtitle="RBAC" accent={persona.color}
      footer={isManager ? (
        <PrimaryButton onClick={() => { fireToast({ tag: "TEAM", color: theme.brand, source: "BrandReel", title: en ? "Invite link copied" : "Tautan undangan disalin", body: en ? "Share it to add a teammate to this workspace." : "Bagikan untuk menambah anggota workspace." }); onClose(); }} gradient={`linear-gradient(120deg, ${theme.brand}, ${theme.accent})`} color={theme.brand}>{en ? "+ Invite teammate" : "+ Undang anggota"}</PrimaryButton>
      ) : null}>
      {isManager ? (
        <React.Fragment>
          <div style={{ display: "flex", gap: 9 }}>
            {[{ n: BR_TEAM.length, l: en ? "seats used" : "kursi dipakai" }, { n: persona.brands, l: en ? "brands" : "brand" }, { n: 10, l: en ? "seat limit" : "batas kursi" }].map((s, i) => (
              <GlassPanel key={i} theme={theme} padding={12} style={{ flex: 1 }}>
                <div className="br-display br-num" style={{ fontSize: 20, color: theme.ink, letterSpacing: -0.5, lineHeight: 1 }}>{s.n}</div>
                <div className="br-mono" style={{ fontSize: 7.5, color: theme.ink3, letterSpacing: 0.6, marginTop: 5, textTransform: "uppercase" }}>{s.l}</div>
              </GlassPanel>
            ))}
          </div>
          <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", margin: "20px 0 8px" }}>{en ? "Members" : "Anggota"} · {BR_TEAM.length}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BR_TEAM.map((mb, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 11px", borderRadius: 13, border: `1px solid ${theme.hair}`, background: theme.glassHi }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: mb.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Space Grotesk", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{mb.initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="br-sans" style={{ fontSize: 13.5, color: theme.ink, fontWeight: 600 }}>{mb.name}</div>
                  <div className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.4, marginTop: 2, textTransform: "uppercase" }}>{en ? mb.role_en : mb.role_id}</div>
                </div>
                {mb.owner ? <GlassChip theme={theme} color={persona.color}>{en ? "Owner" : "Pemilik"}</GlassChip> : <span style={{ color: theme.ink3, fontSize: 17, letterSpacing: 1 }}>⋯</span>}
              </div>
            ))}
          </div>
        </React.Fragment>
      ) : (
        <p className="br-sans" style={{ fontSize: 12.5, color: theme.ink2, lineHeight: 1.5, margin: "0 0 4px" }}>{en ? `You're assigned ${persona.brands} brands by your agency manager. Brand kits and team seats are managed by the admin.` : `Kamu ditugaskan ${persona.brands} brand oleh manajer agensi. Brand kit & kursi tim dikelola admin.`}</p>
      )}
      <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", margin: "20px 0 8px" }}>{en ? "Brands" : "Brand"} · {brands.length}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {brands.map((b, i) => (
          <span key={i} className="br-sans" style={{ display: "inline-flex", alignItems: "center", gap: 7, border: `1px solid ${theme.hair}`, background: theme.glassHi, borderRadius: 99, padding: "5px 12px 5px 6px", fontSize: 12, fontWeight: 600, color: theme.ink2 }}>
            <span style={{ width: 18, height: 18, borderRadius: 6, background: BR_BRAND_COLORS[i % BR_BRAND_COLORS.length], color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8.5, fontWeight: 800, fontFamily: "Space Grotesk" }}>{b[0]}</span>
            {b}
          </span>
        ))}
      </div>
    </BrSheet>
  );
}

function BrProfile({ onBack, onLogout, onNavigate }) {
  const { theme, lang, persona, setPersonaId, fireToast, deviceKind, setTweak, veoBonus } = useBr();
  const t = BR_T[lang];
  const [extra, setExtra] = in_useState({});
  const [oauth, setOauth] = in_useState(null);
  const [sheet, setSheet] = in_useState(null);
  const [iap, setIap] = in_useState(null);
  const [packs, setPacks] = in_useState(false);
  const connectedIds = [...persona.platforms, ...BR_PLATFORM_ORDER.filter((p) => extra[p] && !persona.platforms.includes(p))];
  const available = BR_PLATFORM_ORDER.filter((p) => !connectedIds.includes(p));
  const usedPct = persona.posts_quota === Infinity ? 0.48 : persona.posts_used / persona.posts_quota;
  const veoQuota = (persona.veo_quota || 0) + (veoBonus || 0);
  const veoPct = veoQuota ? persona.veo_used / veoQuota : 0;
  const grad = `linear-gradient(135deg, ${theme.brandDk}, ${theme.accent})`;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: theme.canvas }}>
      <BrAppHeader title={t.profile.title} subtitle="ACCOUNT · RBAC" onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 28px" }}>
        {/* persona card */}
        <div style={{ padding: 18, borderRadius: 18, background: grad, color: "#fff", boxShadow: `0 14px 30px -14px ${theme.brand}`, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", right: -30, top: -30, width: 170, height: 170, borderRadius: "50%", filter: "blur(48px)", opacity: 0.5, background: `radial-gradient(circle, ${persona.color} 0%, transparent 65%)` }} />
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: persona.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Space Grotesk", fontSize: 18, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{persona.initial}</div>
            <div style={{ flex: 1 }}>
              <div className="br-mono" style={{ fontSize: 9.5, color: "rgba(255,255,255,0.85)", letterSpacing: 1.2, fontWeight: 700, textTransform: "uppercase" }}>{lang === "en" ? persona.role_en : persona.role_id}</div>
              <div className="br-display" style={{ fontSize: 21, lineHeight: 1.05, marginTop: 3, letterSpacing: -0.4 }}>{persona.name}</div>
              <div className="br-sans" style={{ fontSize: 11.5, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>{persona.handle} · {lang === "en" ? persona.bio_en : persona.bio_id}</div>
            </div>
          </div>
        </div>

        {/* plan & usage */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{t.profile.plan}</div>
        <GlassPanel theme={theme} padding={15}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="br-display" style={{ fontSize: 18, color: theme.ink, letterSpacing: -0.3 }}>{persona.plan_label}</div>
              <div className="br-mono" style={{ fontSize: 9.5, color: theme.ink3, letterSpacing: 0.6, marginTop: 2 }}>{persona.price}</div>
            </div>
            <button onClick={() => setSheet("plan")} className="br-press" style={{ border: `1px solid ${theme.brand}`, background: theme.brand + "12", color: theme.brand, borderRadius: 99, padding: "7px 14px", cursor: "pointer", fontFamily: "Plus Jakarta Sans", fontSize: 12, fontWeight: 700 }}>{t.profile.upgrade}</button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, marginBottom: 6 }}>
            <span className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.8, textTransform: "uppercase" }}>{lang === "en" ? "Posts this month" : "Post bulan ini"}</span>
            <span className="br-mono br-num" style={{ fontSize: 9.5, color: theme.ink2, fontWeight: 600 }}>{persona.posts_used}/{persona.posts_quota === Infinity ? "∞" : persona.posts_quota}</span>
          </div>
          <div style={{ height: 7, borderRadius: 99, background: theme.hair, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, usedPct * 100)}%`, background: `linear-gradient(90deg, ${theme.brand}, ${theme.accent})`, borderRadius: 99 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 15, marginBottom: 6, alignItems: "baseline" }}>
            <span className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.8, textTransform: "uppercase" }}>{lang === "en" ? "AI video renders · Veo" : "Render video AI · Veo"}</span>
            <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
              <span className="br-mono br-num" style={{ fontSize: 9.5, color: veoPct > 0.85 ? theme.warn : theme.ink2, fontWeight: 600 }}>{persona.veo_used}/{veoQuota}{veoBonus ? ` (+${veoBonus})` : ""}</span>
              <button onClick={() => setPacks(true)} className="br-press" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0, fontFamily: "Geist Mono, monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, color: theme.brand, textTransform: "uppercase" }}>{lang === "en" ? "+ Top up" : "+ Top up"}</button>
            </div>
          </div>
          <div style={{ height: 7, borderRadius: 99, background: theme.hair, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, veoPct * 100)}%`, background: veoPct > 0.85 ? `linear-gradient(90deg, ${theme.warn}, ${theme.neg})` : `linear-gradient(90deg, ${theme.brand}, ${theme.accent})`, borderRadius: 99 }} />
          </div>
        </GlassPanel>

        {/* connected accounts */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{t.profile.accounts} · {connectedIds.length}</div>
        <GlassPanel theme={theme} padding={6} tone="solid">
          {connectedIds.map((pid, i) => {
            const p = BR_PLATFORMS[pid]; const tk = BR_TOKEN_STATUS[pid] || { st: "ok", note_en: "valid · just connected", note_id: "valid · baru terhubung" }; const expiring = tk.st === "expiring";
            return (
              <div key={pid} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 10px", borderTop: i ? `1px solid ${theme.hair2}` : "none" }}>
                <PlatformBadge pid={pid} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="br-sans" style={{ fontSize: 13, color: theme.ink, fontWeight: 600 }}>{p.name}</div>
                  <div className="br-mono" style={{ fontSize: 8.5, color: expiring ? theme.warn : theme.ink3, letterSpacing: 0.4, marginTop: 2, textTransform: "uppercase" }}>{lang === "en" ? tk.note_en : tk.note_id}</div>
                </div>
                {expiring ? (
                  <button onClick={() => setOauth({ kind: "platform", id: pid })} className="br-press" style={{ border: `1px solid ${theme.warn}`, background: theme.warn + "16", color: theme.warn, borderRadius: 99, padding: "5px 12px", cursor: "pointer", fontFamily: "Geist Mono, monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase" }}>↻ {t.profile.expired}</button>
                ) : (
                  <GlassChip theme={theme} color={theme.pos}>
                    <span style={{ width: 5, height: 5, borderRadius: 99, background: theme.pos }} />
                    {t.profile.connected}
                  </GlassChip>
                )}
              </div>
            );
          })}
        </GlassPanel>

        {/* add more channels */}
        {available.length > 0 && (
          <React.Fragment>
            <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{lang === "en" ? "ADD CHANNELS" : "TAMBAH CHANNEL"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {available.map((pid) => {
                const p = BR_PLATFORMS[pid];
                return (
                  <button key={pid} onClick={() => setOauth({ kind: "platform", id: pid })} className="br-press" style={{ width: "100%", textAlign: "left", border: `1px solid ${theme.hair}`, cursor: "pointer", fontFamily: "inherit", background: theme.glassHi, borderRadius: 14, padding: "10px 12px", display: "flex", alignItems: "center", gap: 12 }}>
                    <PlatformBadge pid={pid} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="br-sans" style={{ fontSize: 13, color: theme.ink, fontWeight: 600 }}>{p.name}</div>
                      <div className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.4, marginTop: 2, textTransform: "uppercase" }}>{lang === "en" ? "Not connected" : "Belum terhubung"}</div>
                    </div>
                    <span className="br-mono" style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, color: p.color, border: `1px solid ${p.color}55`, background: p.color + "12", borderRadius: 99, padding: "5px 12px", textTransform: "uppercase" }}>{t.onboard.connect}</span>
                  </button>
                );
              })}
            </div>
          </React.Fragment>
        )}

        {/* brand kit / team rows (RBAC) */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{lang === "en" ? "WORKSPACE" : "WORKSPACE"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SettingRow theme={theme} icon="kit" label={t.profile.brandkit} value={lang === "en" ? persona.voice_en : persona.voice_id} locked={!persona.can.brandkit} lockLabel={lang === "en" ? "View only" : "Lihat saja"} onClick={() => setSheet("brandkit")} />
          {persona.can.team
            ? <SettingRow theme={theme} icon="team" label={t.profile.team} value={`${persona.brands} ${lang === "en" ? "brands · 10 seats" : "brand · 10 kursi"}`} onClick={() => setSheet("team")} />
            : persona.can.multiBrand
              ? <SettingRow theme={theme} icon="team" label={lang === "en" ? "Assigned brands" : "Brand ditugaskan"} value={`${persona.brands} ${lang === "en" ? "brands" : "brand"}`} onClick={() => setSheet("team")} />
              : null}
        </div>

        {/* developer / API setup */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{lang === "en" ? "DEVELOPER" : "DEVELOPER"}</div>
        {persona.can.billing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button onClick={() => onNavigate && onNavigate({ name: "setup" })} className="br-press" style={{
            width: "100%", textAlign: "left", border: `1px solid ${theme.hair}`, cursor: "pointer", fontFamily: "inherit",
            background: theme.glassHi, borderRadius: 14, padding: "12px 13px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: theme.accent + "16", border: `1px solid ${theme.hair}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6L3 12l5 6M16 6l5 6-5 6"/></svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="br-sans" style={{ fontSize: 13, color: theme.ink, fontWeight: 600 }}>{lang === "en" ? "API setup" : "Setup API"}</div>
              <div className="br-sans" style={{ fontSize: 11, color: theme.ink3, marginTop: 1 }}>{lang === "en" ? "Connect publishing, AI & messaging APIs" : "Hubungkan API publikasi, AI & pesan"}</div>
            </div>
            <span style={{ color: theme.ink3, fontSize: 18 }}>›</span>
          </button>
          <button onClick={() => onNavigate && onNavigate({ name: "economics" })} className="br-press" style={{
            width: "100%", textAlign: "left", border: `1px solid ${theme.hair}`, cursor: "pointer", fontFamily: "inherit",
            background: theme.glassHi, borderRadius: 14, padding: "12px 13px", display: "flex", alignItems: "center", gap: 12,
          }}>
            <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: theme.pos + "16", border: `1px solid ${theme.hair}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.pos} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="br-sans" style={{ fontSize: 13, color: theme.ink, fontWeight: 600 }}>{lang === "en" ? "Unit economics" : "Unit ekonomi"}</div>
              <div className="br-sans" style={{ fontSize: 11, color: theme.ink3, marginTop: 1 }}>{lang === "en" ? "Margins, API costs & pricing" : "Margin, biaya API & harga"}</div>
            </div>
            <span style={{ color: theme.ink3, fontSize: 18 }}>›</span>
          </button>
          </div>
        ) : (
          <SettingRow theme={theme} icon="kit" label={lang === "en" ? "API setup" : "Setup API"} value={lang === "en" ? "Admin / owner only" : "Hanya admin / owner"} locked lockLabel={lang === "en" ? "Locked" : "Terkunci"} />
        )}

        {/* persona switcher (RBAC demo) */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{t.profile.switch}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {BR_PERSONA_ORDER.map((pid) => {
            const p = BR_PERSONAS[pid]; const active = p.id === persona.id;
            return (
              <button key={pid} onClick={() => setPersonaId(pid)} className="br-press" style={{
                padding: 12, borderRadius: 14, cursor: "pointer", background: active ? theme.glassHi : "transparent",
                border: `1px solid ${active ? theme.brand : theme.hair2}`, display: "flex", alignItems: "center", gap: 12, textAlign: "left", fontFamily: "inherit",
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: p.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Space Grotesk", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{p.initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="br-sans" style={{ fontSize: 13.5, color: theme.ink, fontWeight: 600 }}>{lang === "en" ? p.role_en : p.role_id}</div>
                  <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.5, marginTop: 2, textTransform: "uppercase" }}>{p.plan_label} · {p.platforms.length} {lang === "en" ? "channels" : "channel"}</div>
                </div>
                {active ? <span className="br-mono" style={{ fontSize: 9.5, color: theme.brand, fontWeight: 700, letterSpacing: 1 }}>● {t.profile.active.toUpperCase()}</span> : <span style={{ color: theme.ink3 }}>›</span>}
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 22 }}>
          <GhostButton onClick={onLogout} style={{ width: "100%", color: theme.neg, borderColor: theme.neg + "55" }}>{t.profile.signout}</GhostButton>
        </div>
      </div>

      <BrOAuthSheet target={oauth}
        onCancel={() => setOauth(null)}
        onDone={(tg) => { setOauth(null); if (tg && tg.kind === "platform") setExtra((e) => ({ ...e, [tg.id]: true })); }} />

      <BrPlanSheet open={sheet === "plan"} onClose={() => setSheet(null)} />
      <BrBrandKitSheet open={sheet === "brandkit"} onClose={() => setSheet(null)} />
      <BrTeamSheet open={sheet === "team"} onClose={() => setSheet(null)} />

      {packs && (
        <BrSheet open={packs} onClose={() => setPacks(false)} title={lang === "en" ? "Top up Veo renders" : "Top up render Veo"} subtitle={lang === "en" ? "AI video credits" : "Kredit video AI"} accent={theme.brand}>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {BR_VEO_PACKS.map((p) => (
              <button key={p.id} onClick={() => { setPacks(false); setIap({ kind: "credits", renders: p.renders, title: `${p.renders} ${lang === "en" ? "Veo renders" : "render Veo"}`, sub: lang === "en" ? "AI video credit pack" : "Paket kredit video AI", price: p.price }); }} className="br-press" style={{ width: "100%", textAlign: "left", border: `1px solid ${theme.hair}`, cursor: "pointer", fontFamily: "inherit", background: theme.glassHi, borderRadius: 14, padding: 13, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: theme.brand + "16", border: `1px solid ${theme.brand}33`, display: "flex", alignItems: "center", justifyContent: "center" }}><span className="br-display br-num" style={{ fontSize: 15, color: theme.brand, fontWeight: 700 }}>{p.renders}</span></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="br-sans" style={{ fontSize: 13.5, color: theme.ink, fontWeight: 700 }}>{p.renders} {lang === "en" ? "AI video renders" : "render video AI"}</div>
                  <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.4, marginTop: 2, textTransform: "uppercase" }}>{lang === "en" ? "never expire" : "tak kedaluwarsa"}</div>
                </div>
                <span className="br-display br-num" style={{ fontSize: 16, color: theme.ink, letterSpacing: -0.4 }}>{brUSD(p.price)}</span>
              </button>
            ))}
          </div>
          <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.5, textAlign: "center", marginTop: 16, lineHeight: 1.6, textTransform: "uppercase" }}>{lang === "en" ? "Used when included renders run out · canvas render stays free" : "Dipakai saat render bawaan habis · render canvas tetap gratis"}</div>
        </BrSheet>
      )}
      {iap && <BrIAPSheet product={iap} store={deviceKind === "android" ? "play" : "appstore"} onCancel={() => setIap(null)} onComplete={(prod) => { setIap(null); if (prod.kind === "credits") { setTweak("veoBonus", (veoBonus || 0) + prod.renders); fireToast({ tag: "VEO", color: theme.pos, source: "BrandReel", title: lang === "en" ? `${prod.renders} renders added` : `${prod.renders} render ditambah`, body: lang === "en" ? "Ready for your next campaigns." : "Siap untuk kampanye berikutnya." }); } }} />}
    </div>
  );
}

function SettingRow({ theme, icon, label, value, locked, lockLabel, onClick }) {
  const icons = {
    kit:  <path d="M3 7l9-4 9 4-9 4-9-4zM3 12l9 4 9-4M3 17l9 4 9-4" />,
    team: <g><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M22 20a6 6 0 0 0-4-5.6" /></g>,
  };
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} className={"br-glass" + (onClick ? " br-press" : "")} style={{ width: "100%", textAlign: "left", fontFamily: "inherit", background: theme.glassHi, border: `1px solid ${theme.hair}`, borderRadius: 14, padding: "12px 13px", display: "flex", alignItems: "center", gap: 12, cursor: onClick ? "pointer" : "default" }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, background: theme.brand + "12", border: `1px solid ${theme.hair}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.brand} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icons[icon]}</svg>
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="br-sans" style={{ fontSize: 13, color: theme.ink, fontWeight: 600 }}>{label}</div>
        <div className="br-sans" style={{ fontSize: 11, color: theme.ink3, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
      </div>
      {locked
        ? <GlassChip theme={theme} color={theme.ink3}>🔒 {lockLabel}</GlassChip>
        : <span style={{ color: theme.ink3, fontSize: 18 }}>›</span>}
    </Tag>
  );
}

Object.assign(window, { BrInsights, BrInbox, BrCopilot, BrProfile, SettingRow, BR_TOKEN_STATUS });
