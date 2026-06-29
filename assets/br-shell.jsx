// BrandReel — shell: context, live clock, navigation stack with transitions,
// brand status strip (above the device frame), push-notification toast.

const { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } = React;

const BrCtx = createContext(null);
function useBr() { return useContext(BrCtx); }

// ──────────────────────────────────────────────────────────────
// Live clock — preset hour, real ticking seconds/minutes
// ──────────────────────────────────────────────────────────────
function brNow(timeKey) {
  const presets = { pagi: 8, siang: 13, malam: 20 };
  const d = new Date();
  d.setHours(presets[timeKey] != null ? presets[timeKey] : 8);
  return d;
}
function useLiveClock(timeKey) {
  const [now, setNow] = useState(() => brNow(timeKey));
  useEffect(() => {
    setNow(brNow(timeKey));
    const id = setInterval(() => setNow(brNow(timeKey)), 1000);
    return () => clearInterval(id);
  }, [timeKey]);
  return now;
}
function brFmtTime(d) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
function brFmtDate(d, lang) {
  const days_id = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const days_en = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const mo_id = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const mo_en = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = lang === "en" ? days_en : days_id;
  const mo = lang === "en" ? mo_en : mo_id;
  return `${days[d.getDay()]} · ${d.getDate()} ${mo[d.getMonth()]}`;
}

// ──────────────────────────────────────────────────────────────
// Router — stack of routes + slide transitions
// ──────────────────────────────────────────────────────────────
function useRouter(initialStack) {
  const [stack, setStack] = useState(initialStack || [{ name: "onboard" }]);
  const [transition, setTransition] = useState(null);

  const push = useCallback((route) => {
    setStack((s) => { setTransition({ dir: "push", key: Date.now() }); return [...s, route]; });
  }, []);
  const replace = useCallback((route) => {
    setStack((s) => { setTransition({ dir: "replace", key: Date.now() }); return [...s.slice(0, -1), route]; });
  }, []);
  const back = useCallback(() => {
    setStack((s) => { if (s.length <= 1) return s; setTransition({ dir: "pop", key: Date.now() }); return s.slice(0, -1); });
  }, []);
  const reset = useCallback((route) => { setStack([route]); setTransition({ dir: "reset", key: Date.now() }); }, []);
  const goto = useCallback((route) => { setStack([route]); setTransition({ dir: "tab", key: Date.now() }); }, []);

  return { stack, top: stack[stack.length - 1], push, replace, back, reset, goto, transition };
}

// Animated screen container
function RouteStage({ stack, transition, renderRoute }) {
  const prevStackRef = useRef(stack);
  const [outgoing, setOutgoing] = useState(null);

  useEffect(() => {
    const prev = prevStackRef.current;
    if (transition && transition.key) {
      const prevTop = prev[prev.length - 1];
      const newTop = stack[stack.length - 1];
      if (prevTop !== newTop) {
        setOutgoing({ route: prevTop, dir: transition.dir, key: transition.key });
        const id = setTimeout(() => setOutgoing(null), 320);
        return () => clearTimeout(id);
      }
    }
    prevStackRef.current = stack;
  }, [transition && transition.key, stack]);

  useEffect(() => { prevStackRef.current = stack; }, [stack]);

  const top = stack[stack.length - 1];
  const incomingDir = transition ? transition.dir : null;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {outgoing && (
        <div key={"out-" + outgoing.key} className={"proto-screen proto-out-" + outgoing.dir} style={{ position: "absolute", inset: 0 }}>
          {renderRoute(outgoing.route)}
        </div>
      )}
      <div key={"in-" + (transition ? transition.key : "init") + "-" + (top.name || "")} className={"proto-screen proto-in-" + (incomingDir || "init")} style={{ position: "absolute", inset: 0 }}>
        {renderRoute(top)}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Brand status strip — sits above the device frame (not clipped)
// ──────────────────────────────────────────────────────────────
function BrandStatusBar({ show, persona, lang, autopost, now, dark }) {
  if (!show) return null;
  const ink = dark ? "rgba(255,255,255,0.62)" : "rgba(40,22,30,0.5)";
  const ink2 = dark ? "rgba(255,255,255,0.42)" : "rgba(40,22,30,0.34)";
  return (
    <div style={{
      position: "absolute", top: -34, left: 4, right: 4,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      fontFamily: "Geist Mono, monospace", fontSize: 10, letterSpacing: 1, fontWeight: 600,
      color: ink, textTransform: "uppercase",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: persona.color }} />
        {persona.plan_label} · {persona.posts_used}/{persona.posts_quota === Infinity ? "∞" : persona.posts_quota}
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: ink2 }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: autopost ? "#1FA971" : ink2 }} />
        {lang === "en" ? "Auto-post" : "Auto-post"} {autopost ? "ON" : "OFF"} · {brFmtTime(now)}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Push notification toast
// ──────────────────────────────────────────────────────────────
function PushToast({ toast, onDismiss, onTap }) {
  if (!toast) return null;
  return (
    <div key={toast.id} onClick={() => onTap && onTap(toast)} style={{
      position: "absolute", top: 8, left: 8, right: 8, zIndex: 100,
      background: "rgba(28, 14, 22, 0.92)",
      backdropFilter: "blur(20px) saturate(140%)", WebkitBackdropFilter: "blur(20px) saturate(140%)",
      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: "10px 14px",
      boxShadow: "0 14px 30px rgba(0,0,0,0.4)", animation: "protoToastIn 280ms cubic-bezier(0.22,1,0.36,1)",
      cursor: "pointer", userSelect: "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8, background: toast.color || "#F23E5C", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "Geist Mono, monospace", fontSize: 10, fontWeight: 800, letterSpacing: 0.3,
          }}>{toast.tag || "BR"}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 9, color: "#FF9DAE", letterSpacing: 1.2, fontWeight: 700, textTransform: "uppercase" }}>{toast.source || "BrandReel"}</span>
              <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: 0.6 }}>· now</span>
            </div>
            <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 13, color: "#fff", fontWeight: 600, marginTop: 1, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{toast.title}</div>
            <div style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.72)", marginTop: 2, lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{toast.body}</div>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onDismiss && onDismiss(toast); }} style={{
          border: "none", background: "rgba(255,255,255,0.1)", color: "#fff",
          width: 22, height: 22, borderRadius: 99, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0, flexShrink: 0,
        }}>×</button>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Reusable bottom sheet — backdrop + slide-up panel + drag handle.
// Renders inside the device frame (position:absolute inset:0 sibling).
// ──────────────────────────────────────────────────────────────
function BrSheet({ open, onClose, title, subtitle, accent, children, footer }) {
  const ctx = useBr();
  const theme = ctx ? ctx.theme : null;
  if (!open || !theme) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 85, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{
        position: "absolute", inset: 0, background: "rgba(10,10,18,0.55)",
        backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)", animation: "brBackdropIn 200ms ease",
      }} />
      <div style={{
        position: "relative", background: theme.page, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        boxShadow: "0 -18px 50px -16px rgba(0,0,0,0.5)", maxHeight: "92%", display: "flex", flexDirection: "column",
        overflow: "hidden", animation: "brSheetUp 320ms cubic-bezier(0.22,1,0.36,1)",
      }}>
        <div style={{ flexShrink: 0, padding: "15px 20px 12px", borderBottom: `1px solid ${theme.hair2}`, background: theme.glassHi, position: "relative" }}>
          <span style={{ width: 36, height: 5, borderRadius: 99, background: theme.hair, position: "absolute", left: "50%", transform: "translateX(-50%)", top: 7 }} />
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, marginTop: 5 }}>
            <div style={{ minWidth: 0 }}>
              {subtitle && <div className="br-mono" style={{ fontSize: 9, color: accent || theme.brand, letterSpacing: 1.4, fontWeight: 700, textTransform: "uppercase" }}>{subtitle}</div>}
              <div className="br-display" style={{ fontSize: 20, color: theme.ink, letterSpacing: -0.5, lineHeight: 1.1, marginTop: 2 }}>{title}</div>
            </div>
            <button onClick={onClose} aria-label="close" className="br-press" style={{
              border: "none", background: theme.canvasAlt, cursor: "pointer", width: 30, height: 30, borderRadius: 99,
              color: theme.ink2, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>✕</button>
          </div>
        </div>
        <div className="br-app" style={{ overflow: "auto", padding: "18px 20px 22px", flex: 1, minHeight: 0 }}>{children}</div>
        {footer && <div style={{ flexShrink: 0, padding: "12px 20px 18px", borderTop: `1px solid ${theme.hair2}`, background: theme.glassHi }}>{footer}</div>}
      </div>
    </div>
  );
}

Object.assign(window, {
  BrCtx, useBr, useLiveClock, brNow, brFmtTime, brFmtDate,
  useRouter, RouteStage, BrandStatusBar, PushToast, BrSheet,
});
