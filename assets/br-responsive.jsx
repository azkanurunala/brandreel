// BrandReel — responsive app shell.
// One app, three layouts driven by the live viewport width:
//   compact  (< 720)        phone column + bottom tab bar
//   medium   (720–1023)     icon-rail sidebar + master-detail (iPad)
//   wide     (≥ 1024)       full sidebar + master-detail (desktop)
// Auth screens (onboard/login) render full-bleed centered. The existing
// device-bezel stage is kept separately as an optional "preview" mode.

const { useState: rs_useState, useEffect: rs_useEffect } = React;

const RS_PRIMARY   = ["home", "insights", "inbox", "profile"];
const RS_AUTH      = ["onboard", "login"];
const RS_NONAV     = ["onboard", "login", "generating", "copilot"];
const RS_FULLWIDTH = ["insights", "profile"];   // tabs that span the content area
const RS_ROUTE_TO_TAB = {
  home: "home", insights: "insights", inbox: "inbox", profile: "profile",
  create: "create", generating: "create", copilot: "inbox",
  detail: "home", publishing: "home", setup: "profile", schedule: "home", economics: "profile",
};

function useViewportWidth() {
  const [w, setW] = rs_useState(() => (typeof window !== "undefined" ? window.innerWidth : 1200));
  rs_useEffect(() => {
    let raf = null;
    const onR = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setW(window.innerWidth)); };
    window.addEventListener("resize", onR);
    onR();
    return () => { window.removeEventListener("resize", onR); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return w;
}

// ── vertical sidebar nav (medium = rail, wide = full) ──────────────
function BrSidebar({ rail, activeTab, onTab, theme, persona, lang }) {
  const t = BR_T[lang];
  const grad = `linear-gradient(120deg, ${theme.brand}, ${theme.accent})`;
  const items = [
    { id: "home", icon: "home", label: t.nav.home },
    { id: "insights", icon: "insights", label: t.nav.insights, needs: "analytics" },
    { id: "inbox", icon: "inbox", label: t.nav.inbox },
    { id: "profile", icon: "profile", label: t.nav.profile },
  ].filter((it) => !it.needs || brCanAccess(persona, it.needs));

  return (
    <div style={{
      width: rail ? 68 : 232, flexShrink: 0, background: theme.glassHi,
      borderRight: `1px solid ${theme.hair}`, display: "flex", flexDirection: "column",
      padding: rail ? "16px 0 14px" : "20px 14px 16px", gap: 5, position: "relative", zIndex: 6,
      backdropFilter: "blur(22px) saturate(150%)", WebkitBackdropFilter: "blur(22px) saturate(150%)",
    }}>
      <div style={{ display: "flex", justifyContent: rail ? "center" : "flex-start", padding: rail ? "0 0 14px" : "2px 6px 18px" }}>
        <BrandMark theme={theme} size={rail ? 24 : 21} mono={rail} />
      </div>

      <button onClick={() => onTab("create")} className="br-press" style={{
        border: "none", cursor: "pointer", background: grad, color: "#fff", fontFamily: "inherit",
        borderRadius: 13, padding: rail ? "11px 0" : "11px 14px", marginBottom: 8,
        display: "flex", alignItems: "center", justifyContent: rail ? "center" : "flex-start", gap: 10,
        boxShadow: `0 10px 22px -10px ${theme.brand}`, fontWeight: 700, fontSize: 14,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        {!rail && t.nav.create}
      </button>

      {items.map((it) => {
        const active = it.id === activeTab;
        return (
          <button key={it.id} onClick={() => onTab(it.id)} className="br-press" title={it.label} style={{
            border: "none", cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            background: active ? theme.brand + "16" : "transparent", color: active ? theme.brand : theme.ink2,
            borderRadius: 12, padding: rail ? "11px 0" : "10px 12px",
            display: "flex", alignItems: "center", justifyContent: rail ? "center" : "flex-start", gap: 12,
            fontWeight: active ? 700 : 500, fontSize: 14,
          }}>
            <NavIcon kind={it.icon} color={theme.brand} active={active} />
            {!rail && it.label}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      <button onClick={() => onTab("profile")} className="br-press" style={{
        border: `1px solid ${theme.hair}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
        background: theme.glass, borderRadius: 13, padding: rail ? "8px 0" : "8px 10px",
        display: "flex", alignItems: "center", justifyContent: rail ? "center" : "flex-start", gap: 10,
      }}>
        <span style={{ width: 28, height: 28, borderRadius: 99, flexShrink: 0, background: persona.color, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "Geist Mono, monospace", fontSize: 10, fontWeight: 800 }}>{persona.initial}</span>
        {!rail && (
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: "Plus Jakarta Sans", fontSize: 12.5, fontWeight: 700, color: theme.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{persona.name}</span>
            <span className="br-mono" style={{ display: "block", fontSize: 8.5, color: theme.ink3, letterSpacing: 0.6, textTransform: "uppercase" }}>{persona.plan_label}</span>
          </span>
        )}
      </button>
    </div>
  );
}

// ── empty detail placeholder (master-detail, nothing selected) ─────
function BrEmptyDetail({ theme, lang, onCreate }) {
  const en = lang === "en";
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 40, textAlign: "center" }}>
      <GlassBackdrop theme={theme} density="soft" />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ opacity: 0.9 }}><BrandMark theme={theme} size={26} mono /></div>
        <div className="br-display" style={{ fontSize: 21, color: theme.ink, letterSpacing: -0.5, maxWidth: 300, lineHeight: 1.2 }}>
          {en ? "Pick a campaign to see its variations" : "Pilih kampanye untuk lihat variasinya"}
        </div>
        <div className="br-sans" style={{ fontSize: 13, color: theme.ink3, maxWidth: 320, lineHeight: 1.55 }}>
          {en ? "Choose one on the left, or start a fresh campaign — name + logo is all we need." : "Pilih di kiri, atau mulai kampanye baru — cukup nama + logo."}
        </div>
        <button onClick={onCreate} className="br-press" style={{
          marginTop: 4, border: "none", cursor: "pointer", fontFamily: "inherit", color: "#fff",
          background: `linear-gradient(120deg, ${theme.brand}, ${theme.accent})`, borderRadius: 13, padding: "12px 20px",
          fontSize: 14, fontWeight: 700, boxShadow: `0 12px 26px -12px ${theme.brand}`, display: "inline-flex", alignItems: "center", gap: 9,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
          {en ? "New campaign" : "Kampanye baru"}
        </button>
      </div>
    </div>
  );
}

// A positioned pane that an absolute-filled screen drops into.
function BrPane({ children, style }) {
  return <div style={{ position: "relative", overflow: "hidden", ...style }}>{children}</div>;
}

// ── the responsive app ─────────────────────────────────────────────
function BrResponsiveApp({ router, renderRoute, theme, persona, lang, handleTab, toast, setToast }) {
  const vw = useViewportWidth();
  const compact = vw < 720;
  const rail = vw < 1024;                 // sidebar style when expanded
  const top = router.top;

  const toastEl = (
    <PushToast toast={toast} onDismiss={() => setToast(null)}
      onTap={(tt) => { setToast(null); if (tt.route) router.push(tt.route); }} />
  );

  // ── Auth screens: full-bleed, centered column on big screens ──
  if (RS_AUTH.includes(top.name)) {
    return (
      <div style={{ position: "fixed", inset: 0, background: theme.canvas, display: "flex", justifyContent: "center", alignItems: "stretch" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: compact ? "none" : 460, overflow: "hidden", boxShadow: compact ? "none" : `0 0 0 1px ${theme.hair}` }}>
          <RouteStage stack={router.stack} transition={router.transition} renderRoute={renderRoute} />
        </div>
      </div>
    );
  }

  // ── Compact: phone column + bottom tab ──
  if (compact) {
    const showNav = !RS_NONAV.includes(top.name);
    const activeTab = RS_ROUTE_TO_TAB[top.name] || "home";
    return (
      <div style={{ position: "fixed", inset: 0, background: theme.canvasAlt, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 600, position: "relative", display: "flex", flexDirection: "column", background: theme.canvas, boxShadow: vw > 600 ? `0 0 40px -12px rgba(0,0,0,0.18)` : "none" }}>
          <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
            <RouteStage stack={router.stack} transition={router.transition} renderRoute={renderRoute} />
            {toastEl}
          </div>
          {showNav && <BottomNav activeTab={activeTab} onTab={handleTab} />}
        </div>
      </div>
    );
  }

  // ── Expanded: sidebar + master-detail ──
  const stack = router.stack;
  let masterRoute = { name: "home" };
  for (let i = stack.length - 1; i >= 0; i--) { if (RS_PRIMARY.includes(stack[i].name)) { masterRoute = stack[i]; break; } }
  const detailRoute = RS_PRIMARY.includes(top.name) ? null : top;
  const sidebarActive = ["create", "generating"].includes(top.name) ? "create" : masterRoute.name;
  const fullWidth = RS_FULLWIDTH.includes(masterRoute.name) && !detailRoute;
  const masterW = vw >= 1280 ? 400 : vw >= 1024 ? 372 : 320;

  return (
    <div style={{ position: "fixed", inset: 0, background: theme.canvas, display: "flex" }}>
      <BrSidebar rail={rail} activeTab={sidebarActive} onTab={handleTab} theme={theme} persona={persona} lang={lang} />

      {fullWidth ? (
        <div style={{ flex: 1, minWidth: 0, position: "relative", display: "flex", justifyContent: "center", background: theme.canvasAlt }}>
          <BrPane style={{ width: "min(100%, 880px)", height: "100%", borderLeft: `1px solid ${theme.hair2}`, borderRight: `1px solid ${theme.hair2}` }}>
            {renderRoute(masterRoute)}
            {toastEl}
          </BrPane>
        </div>
      ) : (
        <>
          <BrPane style={{ width: masterW, flexShrink: 0, height: "100%", borderRight: `1px solid ${theme.hair}` }}>
            {renderRoute(masterRoute)}
          </BrPane>
          <div style={{ flex: 1, minWidth: 0, position: "relative", display: "flex", justifyContent: "center", background: theme.canvasAlt }}>
            {detailRoute ? (
              <BrPane key={detailRoute.name + "-" + (detailRoute.id || "")} className="proto-in-replace" style={{ width: "min(100%, 720px)", height: "100%", background: theme.canvas, boxShadow: `0 0 0 1px ${theme.hair2}` }}>
                {renderRoute(detailRoute)}
              </BrPane>
            ) : (
              <BrEmptyDetail theme={theme} lang={lang} onCreate={() => handleTab("create")} />
            )}
            {toastEl}
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, {
  useViewportWidth, BrSidebar, BrEmptyDetail, BrPane, BrResponsiveApp,
  RS_PRIMARY, RS_AUTH, RS_NONAV, RS_FULLWIDTH,
});
