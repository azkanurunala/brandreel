// BrandReel — shared primitives, app shell, bottom nav, dashboard (Home).

const { useState: hm_useState } = React;

// ──────────────────────────────────────────────────────────────
// Buttons
// ──────────────────────────────────────────────────────────────
function PrimaryButton({ children, onClick, color, style, gradient }) {
  const bg = gradient || color || "#F23E5C";
  return (
    <button onClick={onClick} className="br-press" style={{
      border: "none", cursor: "pointer", padding: "14px 18px", borderRadius: 15,
      background: bg, color: "#fff",
      fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 15, fontWeight: 700, letterSpacing: 0.2,
      width: "100%", boxShadow: `0 10px 24px -10px ${color || "#F23E5C"}cc`, ...style,
    }}>{children}</button>
  );
}
function GhostButton({ children, onClick, style, theme }) {
  const t = theme || (typeof useBr === "function" ? null : null);
  return (
    <button onClick={onClick} className="br-press br-glass" style={{
      border: `1px solid rgba(120,80,90,0.2)`, cursor: "pointer", padding: "12px 16px",
      borderRadius: 13, background: "rgba(255,255,255,0.5)", color: "#241419",
      fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 14, fontWeight: 600, ...style,
    }}>{children}</button>
  );
}

// ──────────────────────────────────────────────────────────────
// App shell — canvas + ornamental backdrop, fills the device frame
// ──────────────────────────────────────────────────────────────
function BrAppShell({ theme, density = "soft", children, scroll = false }) {
  return (
    <div className="br-app" style={{
      position: "absolute", inset: 0, background: theme.canvas,
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <GlassBackdrop theme={theme} density={density} />
      <div style={{ position: "relative", zIndex: 1, flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: scroll ? "auto" : "hidden" }}>
        {children}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Top header chrome
// ──────────────────────────────────────────────────────────────
function BrAppHeader({ title, subtitle, color, onBack, right }) {
  const { theme } = useBr();
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px 11px",
      background: theme.glassHi, backdropFilter: "blur(20px) saturate(140%)", WebkitBackdropFilter: "blur(20px) saturate(140%)",
      borderBottom: `1px solid ${theme.hair2}`, flexShrink: 0, position: "relative", zIndex: 5,
    }}>
      {onBack ? (
        <button onClick={onBack} aria-label="back" className="br-press" style={{
          border: "none", cursor: "pointer", padding: 0, width: 32, height: 32, borderRadius: 99,
          background: theme.canvasAlt, color: theme.ink, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Geist Mono, monospace", fontSize: 17,
        }}>‹</button>
      ) : <div style={{ width: 4 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        {subtitle && <div className="br-mono" style={{ fontSize: 9, color: color || theme.brand, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitle}</div>}
        <div className="br-display" style={{ fontSize: 18, color: theme.ink, letterSpacing: -0.3, lineHeight: 1.1, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

// Floating bottom action bar (above the nav)
function FloatingActionBar({ children }) {
  const { theme } = useBr();
  return (
    <div style={{
      flexShrink: 0, padding: "10px 14px 12px",
      background: theme.glassHi, backdropFilter: "blur(20px) saturate(140%)", WebkitBackdropFilter: "blur(20px) saturate(140%)",
      borderTop: `1px solid ${theme.hair2}`, display: "flex", gap: 8, position: "relative", zIndex: 5,
    }}>{children}</div>
  );
}

// ──────────────────────────────────────────────────────────────
// Platform status dot-row (shows publishing state per channel)
// ──────────────────────────────────────────────────────────────
function PlatformDots({ campaign, theme, size = 22 }) {
  const stateColor = { posted: theme.pos, queued: theme.ink3, retry: theme.warn, failed: theme.neg };
  return (
    <div style={{ display: "flex", gap: 5 }}>
      {BR_PLATFORM_ORDER.map((pid) => {
        const p = BR_PLATFORMS[pid];
        const st = (campaign.platforms || {})[pid];
        const dimmed = !st;
        const col = st ? (stateColor[st.state] || theme.ink3) : theme.ink3;
        return (
          <div key={pid} title={p.name} style={{
            width: size, height: size, borderRadius: size * 0.3, position: "relative",
            background: dimmed ? theme.hair2 : p.color + "1E",
            border: `1px solid ${dimmed ? theme.hair2 : p.color + "40"}`,
            display: "flex", alignItems: "center", justifyContent: "center", opacity: dimmed ? 0.5 : 1,
          }}>
            <span className="br-display" style={{ color: dimmed ? theme.ink3 : p.color, fontSize: size * 0.4, fontWeight: 700, letterSpacing: -0.5 }}>{p.short}</span>
            {st && st.state !== "queued" && (
              <span style={{ position: "absolute", right: -2, top: -2, width: 7, height: 7, borderRadius: 99, background: col, border: `1.5px solid ${theme.glassHi}` }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// BOTTOM NAV — 5 tabs, center Create accent
// ──────────────────────────────────────────────────────────────
function NavIcon({ kind, color, active }) {
  const c = active ? color : "currentColor";
  const common = { width: 23, height: 23, viewBox: "0 0 24 24", fill: "none", stroke: c, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (kind) {
    case "home":     return <svg {...common}><path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z"/></svg>;
    case "insights": return <svg {...common}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>;
    case "inbox":    return <svg {...common}><path d="M21 12a8 8 0 1 1-3-6.3L21 4l-1 4.5A8 8 0 0 1 21 12z"/></svg>;
    case "profile":  return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>;
    default:         return null;
  }
}

const BR_NAV_TABS = [
  { id: "home",     icon: "home" },
  { id: "insights", icon: "insights", needs: "analytics" },
  { id: "create",   icon: "create" },
  { id: "inbox",    icon: "inbox" },
  { id: "profile",  icon: "profile" },
];

function BottomNav({ activeTab, onTab }) {
  const { theme, lang, persona } = useBr();
  const t = BR_T[lang];
  const grad = `linear-gradient(120deg, ${theme.brand}, ${theme.accent})`;
  return (
    <div style={{
      flexShrink: 0, display: "flex", justifyContent: "space-around", alignItems: "flex-end", padding: "8px 6px 10px",
      background: theme.glassHi, backdropFilter: "blur(22px) saturate(150%)", WebkitBackdropFilter: "blur(22px) saturate(150%)",
      borderTop: `1px solid ${theme.hair}`, position: "relative", zIndex: 6,
    }}>
      {BR_NAV_TABS.map((tab) => {
        if (tab.id === "create") {
          return (
            <button key="create" onClick={() => onTab("create")} aria-label={t.nav.create} className="br-press" style={{
              border: "none", cursor: "pointer", background: "transparent", padding: "0 4px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1,
            }}>
              <span style={{
                width: 46, height: 36, borderRadius: 13, background: grad, marginTop: -10,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 8px 18px -6px ${theme.brand}cc`, border: "2px solid " + theme.glassHi,
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </span>
              <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 10, fontWeight: 700, color: theme.brand }}>{t.nav.create}</span>
            </button>
          );
        }
        const active = tab.id === activeTab;
        return (
          <button key={tab.id} onClick={() => onTab(tab.id)} className="br-press" style={{
            flex: 1, border: "none", background: "transparent", cursor: "pointer", padding: "4px 4px 0",
            color: active ? theme.brand : theme.ink3, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          }}>
            <NavIcon kind={tab.icon} color={theme.brand} active={active} />
            <span style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 10, fontWeight: active ? 700 : 500 }}>{t.nav[tab.id]}</span>
          </button>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// DASHBOARD / HOME
// ──────────────────────────────────────────────────────────────
function BrHome({ onNavigate, now }) {
  const { theme, lang, persona, scenario } = useBr();
  const t = BR_T[lang];
  const grad = `linear-gradient(135deg, ${theme.brandDk}, ${theme.accent})`;

  const kpis = [
    { v: scenario.impressions, l: t.home.impressions },
    { v: scenario.eng,         l: t.home.engagement },
    { v: scenario.reach,       l: t.home.reach },
  ];

  // campaigns visible — agency members see fewer brands; everyone sees the set
  const campaigns = BR_CAMPAIGNS;

  return (
    <BrAppShell theme={theme} density="soft">
      {/* Top bar */}
      <div style={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 16px 8px" }}>
        <BrandMark theme={theme} size={19} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => onNavigate({ name: "schedule" })} aria-label="schedule" className="br-press" style={{
            border: `1px solid ${theme.hair}`, background: theme.glassHi, cursor: "pointer", width: 32, height: 32, borderRadius: 99,
            display: "inline-flex", alignItems: "center", justifyContent: "center", color: theme.ink2, padding: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4.5" width="18" height="16" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>
          </button>
          <button onClick={() => onNavigate({ name: "profile" })} className="br-press" style={{
            border: `1px solid ${theme.hair}`, background: theme.glassHi, cursor: "pointer", padding: "4px 11px 4px 5px", borderRadius: 99,
            fontFamily: "Geist Mono, monospace", fontSize: 9, letterSpacing: 0.8, fontWeight: 700, color: theme.ink2,
            display: "inline-flex", alignItems: "center", gap: 7,
          }}>
            <span style={{ width: 20, height: 20, borderRadius: 99, background: persona.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 8.5, fontWeight: 800 }}>{persona.initial}</span>
            {persona.plan_label.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Scroll body */}
      <div style={{ flex: 1, overflow: "auto", padding: "6px 16px 24px" }}>
        {/* Greeting */}
        <div className="br-display" style={{ fontSize: 28, color: theme.ink, lineHeight: 1.05, letterSpacing: -0.9, marginTop: 6 }}>
          {brGreet(persona, lang, proto_time(now))},<br />
          <em style={{ color: theme.brand }}>{persona.name.split(" ")[0]}.</em>
        </div>
        <div className="br-sans" style={{ fontSize: 13, color: theme.ink2, marginTop: 8, lineHeight: 1.5 }}>
          {lang === "en" ? scenario.summary_en : scenario.summary_id}
        </div>

        {/* KPI cards */}
        <div style={{ display: "flex", gap: 9, marginTop: 18 }}>
          {kpis.map((s, i) => (
            <GlassPanel key={i} theme={theme} padding={13} tone="solid" style={{ flex: 1 }}>
              <div className="br-display br-num" style={{ fontSize: 21, color: theme.ink, lineHeight: 1, letterSpacing: -0.6 }}>{s.v}</div>
              <div className="br-mono" style={{ fontSize: 8, color: theme.ink3, marginTop: 6, letterSpacing: 0.6, textTransform: "uppercase" }}>{s.l}</div>
            </GlassPanel>
          ))}
        </div>

        {/* New campaign CTA — the single accent */}
        <button onClick={() => onNavigate({ name: "create" })} className="br-press" style={{
          width: "100%", marginTop: 16, padding: 15, borderRadius: 18, border: "none", cursor: "pointer", textAlign: "left",
          background: `linear-gradient(120deg, ${theme.brand}, ${theme.accent})`, color: "#fff", fontFamily: "inherit",
          boxShadow: `0 14px 30px -14px ${theme.brand}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <span style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.32)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </span>
            <div style={{ flex: 1 }}>
              <div className="br-display" style={{ fontSize: 18, color: "#fff", letterSpacing: -0.4, lineHeight: 1 }}>{t.home.newCampaign}</div>
              <div className="br-mono" style={{ fontSize: 9.5, color: "rgba(255,255,255,0.82)", letterSpacing: 0.6, marginTop: 4, textTransform: "uppercase" }}>{t.create.sub}</div>
            </div>
            <span style={{ fontSize: 22, opacity: 0.9 }}>›</span>
          </div>
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "18px 4px 8px" }}>
          <span className="br-eyebrow" style={{ color: theme.ink3 }}>{t.home.recent} · {campaigns.length}</span>
          {persona.can.multiBrand && <span className="br-mono" style={{ fontSize: 8.5, color: theme.accent, letterSpacing: 1, fontWeight: 700 }}>{persona.brands} BRANDS</span>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {campaigns.map((c) => {
            const sm = brStatusMeta(c.status, theme, t);
            const target = c.status === "draft" ? { name: "create" }
              : c.status === "publishing" ? { name: "publishing", id: c.id }
              : { name: "detail", id: c.id };
            return (
              <button key={c.id} onClick={() => onNavigate(target)} className="br-press" style={{
                width: "100%", textAlign: "left", border: `1px solid ${theme.hair}`, cursor: "pointer", fontFamily: "inherit",
                background: theme.glassHi, borderRadius: 16, padding: 13, display: "flex", flexDirection: "column", gap: 11,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: c.logoColor + "1C", border: `1px solid ${c.logoColor}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span className="br-display" style={{ color: c.logoColor, fontSize: 15, fontWeight: 700, letterSpacing: -0.5 }}>{c.logoGlyph}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="br-display" style={{ fontSize: 16, color: theme.ink, letterSpacing: -0.3, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.product}</div>
                    <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.4, marginTop: 3, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{lang === "en" ? c.created_en : c.created_id}</div>
                  </div>
                  <GlassChip theme={theme} color={sm.color} style={{ flexShrink: 0 }}>
                    {sm.dot && <span style={{ width: 5, height: 5, borderRadius: 99, background: sm.color, boxShadow: `0 0 6px ${sm.color}` }} />}
                    {sm.label}
                  </GlassChip>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <PlatformDots campaign={c} theme={theme} size={22} />
                  {c.views !== "—" ? (
                    <span className="br-mono br-num" style={{ fontSize: 10.5, color: theme.ink2, letterSpacing: 0.3, whiteSpace: "nowrap" }}>
                      {c.views} <span style={{ color: theme.ink3 }}>· {c.eng}</span>
                    </span>
                  ) : (
                    <span style={{ color: theme.ink3, fontSize: 18 }}>›</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </BrAppShell>
  );
}

// map a Date back to a time-key for greeting (keeps greeting in sync w/ tweak)
function proto_time(now) {
  const h = now.getHours();
  if (h < 11) return "pagi";
  if (h < 17) return "siang";
  return "malam";
}

Object.assign(window, {
  PrimaryButton, GhostButton, BrAppShell, BrAppHeader, FloatingActionBar,
  PlatformDots, NavIcon, BR_NAV_TABS, BottomNav, BrHome, proto_time,
});
