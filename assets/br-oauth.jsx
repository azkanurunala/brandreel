// BrandReel — OAuth layer: branded consent sheet for connecting social
// channels + Google/Apple SSO sign-in. Mimics a real in-app OAuth browser
// (lock + provider domain → consent + scopes → authorizing → granted).

const { useState: oa_useState, useEffect: oa_useEffect } = React;

// Small lock glyph for the faux browser bar
function OaLock({ c }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────
// SSO buttons — "Continue with Google / Apple"
// ──────────────────────────────────────────────────────────────
function BrSSOButton({ provider, label, onClick }) {
  const dark = provider === "apple";
  return (
    <button onClick={onClick} className="br-press" style={{
      width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      padding: "13px 16px", borderRadius: 13, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif",
      fontSize: 14.5, fontWeight: 700, boxSizing: "border-box",
      background: dark ? "#000" : "#fff", color: dark ? "#fff" : "#1F1F1F",
      border: dark ? "1px solid #000" : "1px solid rgba(0,0,0,0.16)",
      boxShadow: "0 3px 10px -6px rgba(0,0,0,0.45)",
    }}>
      {BR_BRAND_GLYPH[provider](19, dark ? "#fff" : "#1F1F1F")}
      <span>{label}</span>
    </button>
  );
}

// Row of both SSO providers + an "or" divider
function BrSSORow({ lang, onPick, divider = true }) {
  const en = lang === "en";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <BrSSOButton provider="google" label={en ? "Continue with Google" : "Lanjut dengan Google"} onClick={() => onPick("google")} />
      <BrSSOButton provider="apple" label={en ? "Continue with Apple" : "Lanjut dengan Apple"} onClick={() => onPick("apple")} />
      {divider && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 2px" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(120,120,140,0.25)" }} />
          <span className="br-mono" style={{ fontSize: 9.5, color: "rgba(120,120,140,0.9)", letterSpacing: 1.4, textTransform: "uppercase" }}>{en ? "or" : "atau"}</span>
          <div style={{ flex: 1, height: 1, background: "rgba(120,120,140,0.25)" }} />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// OAuth consent sheet — target = { kind: "platform"|"sso", id }
// ──────────────────────────────────────────────────────────────
function BrOAuthSheet({ target, onCancel, onDone }) {
  const { theme, lang, persona } = useBr();
  const en = lang === "en";
  const [phase, setPhase] = oa_useState("consent"); // consent → working → done
  const key = target ? target.kind + ":" + target.id : null;

  oa_useEffect(() => { if (target) setPhase("consent"); }, [key]);

  oa_useEffect(() => {
    if (phase === "working") {
      const a = setTimeout(() => setPhase("done"), 1350);
      return () => clearTimeout(a);
    }
    if (phase === "done") {
      const b = setTimeout(() => onDone && onDone(target), 920);
      return () => clearTimeout(b);
    }
  }, [phase]);

  if (!target) return null;
  const isSSO = target.kind === "sso";
  const meta = isSSO ? BR_SSO[target.id] : BR_PLATFORMS[target.id];
  if (!meta) return null;
  const accent = isSSO ? (target.id === "apple" ? "#000000" : "#4285F4") : meta.color;
  const scopes = en ? meta.scopes_en : meta.scopes_id;
  const handle = persona.handle.replace(/^@/, "");
  const email = handle.includes(".") ? handle : handle + ".id";
  const acctSub = isSSO
    ? (target.id === "apple" ? `${handle}@icloud.com` : `${handle}@gmail.com`)
    : persona.handle;

  // ── header content per phase ──
  const title = isSSO
    ? (en ? "Sign in to BrandReel" : "Masuk ke BrandReel")
    : (en ? `Connect ${meta.name}` : `Hubungkan ${meta.name}`);
  const subline = isSSO
    ? (en ? `to continue with ${meta.name}` : `lanjut dengan ${meta.name}`)
    : (en ? `BrandReel wants to access your ${meta.name} account` : `BrandReel ingin mengakses akun ${meta.name} kamu`);

  const big = (color) => (
    <div style={{
      width: 60, height: 60, borderRadius: isSSO ? "50%" : 17, flexShrink: 0,
      background: isSSO ? (target.id === "apple" ? "#000" : "#fff") : meta.color,
      border: isSSO ? "1px solid rgba(0,0,0,0.12)" : "none",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: `0 10px 26px -12px ${accent}`,
    }}>
      {BR_BRAND_GLYPH[target.id]
        ? BR_BRAND_GLYPH[target.id](isSSO ? 30 : 32, isSSO ? (target.id === "apple" ? "#fff" : undefined) : "#fff")
        : null}
    </div>
  );

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {/* dim backdrop */}
      <div onClick={() => phase === "consent" && onCancel && onCancel()} style={{
        position: "absolute", inset: 0, background: "rgba(10,10,18,0.55)",
        backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)",
      }} />

      {/* sheet */}
      <div style={{
        position: "relative", background: theme.page, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        boxShadow: "0 -18px 50px -16px rgba(0,0,0,0.5)", maxHeight: "90%", display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* faux browser chrome */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px 10px", borderBottom: `1px solid ${theme.hair2}`, background: theme.glassHi }}>
          <span style={{ width: 36, height: 5, borderRadius: 99, background: theme.hair, position: "absolute", left: "50%", transform: "translateX(-50%)", top: 6 }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: 99, background: theme.canvasAlt, marginTop: 4 }}>
            <OaLock c={theme.pos} />
            <span className="br-mono" style={{ fontSize: 10.5, color: theme.ink2, letterSpacing: 0.2 }}>{meta.domain}</span>
          </span>
          <div style={{ flex: 1 }} />
          <button onClick={() => phase === "consent" && onCancel && onCancel()} aria-label="close" className="br-press" style={{
            border: "none", background: theme.canvasAlt, cursor: phase === "consent" ? "pointer" : "default", width: 28, height: 28, borderRadius: 99,
            color: theme.ink2, fontSize: 15, marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center",
            opacity: phase === "consent" ? 1 : 0.4,
          }}>✕</button>
        </div>

        {/* body */}
        <div style={{ padding: "22px 22px 26px", overflow: "auto" }}>
          {phase === "consent" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {big(accent)}
                <div style={{ minWidth: 0 }}>
                  <div className="br-display" style={{ fontSize: 21, color: theme.ink, letterSpacing: -0.5, lineHeight: 1.1 }}>{title}</div>
                  <div className="br-sans" style={{ fontSize: 12.5, color: theme.ink2, marginTop: 4, lineHeight: 1.35 }}>{subline}</div>
                </div>
              </div>

              {/* account chip */}
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 18, padding: "11px 12px", border: `1px solid ${theme.hair}`, borderRadius: 14, background: theme.glassHi }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", flexShrink: 0, background: persona.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Space Grotesk", fontSize: 14, fontWeight: 700 }}>{persona.initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="br-sans" style={{ fontSize: 13.5, color: theme.ink, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{persona.name}</div>
                  <div className="br-mono" style={{ fontSize: 10.5, color: theme.ink3, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acctSub}</div>
                </div>
                <span className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1, textTransform: "uppercase" }}>{en ? "Switch" : "Ganti"}</span>
              </div>

              {/* scopes */}
              <div className="br-mono" style={{ fontSize: 9.5, color: theme.ink3, letterSpacing: 1.3, textTransform: "uppercase", margin: "20px 0 10px" }}>
                {isSSO ? (en ? "BrandReel will receive" : "BrandReel akan menerima") : (en ? "BrandReel will be able to" : "BrandReel dapat")}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {scopes.map((sc, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 99, flexShrink: 0, marginTop: 1, background: accent + "1A", border: `1px solid ${accent}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent === "#000000" ? theme.ink : accent} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
                    </span>
                    <span className="br-sans" style={{ fontSize: 13, color: theme.ink, lineHeight: 1.4, flex: 1 }}>{sc}</span>
                  </div>
                ))}
              </div>

              {/* note */}
              <div className="br-sans" style={{ fontSize: 11, color: theme.ink3, lineHeight: 1.5, marginTop: 18 }}>
                {isSSO
                  ? (en ? "By continuing, you agree to BrandReel’s Terms & Privacy Policy." : "Dengan lanjut, kamu setuju Ketentuan & Kebijakan Privasi BrandReel.")
                  : (en ? "You can revoke access anytime in Profile → Connected accounts. Tokens auto-refresh 7 days before expiry." : "Cabut akses kapan saja di Profil → Akun terhubung. Token disegarkan otomatis 7 hari sebelum kedaluwarsa.")}
              </div>

              {/* actions */}
              <button onClick={() => setPhase("working")} className="br-press" style={{
                width: "100%", marginTop: 20, padding: "14px 18px", borderRadius: 14, cursor: "pointer",
                fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 15, fontWeight: 700, boxSizing: "border-box",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
                background: isSSO && target.id === "google" ? "#fff" : accent,
                color: isSSO && target.id === "google" ? "#1F1F1F" : "#fff",
                border: isSSO && target.id === "google" ? "1px solid rgba(0,0,0,0.16)" : "none",
                boxShadow: isSSO && target.id === "google" ? "0 3px 10px -6px rgba(0,0,0,0.4)" : `0 12px 26px -12px ${accent}`,
              }}>
                {isSSO && BR_BRAND_GLYPH[target.id](18, target.id === "apple" ? "#fff" : undefined)}
                {isSSO ? (en ? `Continue as ${persona.name.split(" ")[0]}` : `Lanjut sebagai ${persona.name.split(" ")[0]}`) : (en ? "Authorize" : "Izinkan")}
              </button>
              <button onClick={() => onCancel && onCancel()} className="br-press" style={{
                width: "100%", marginTop: 9, padding: "12px 18px", borderRadius: 14, cursor: "pointer",
                fontFamily: "Plus Jakarta Sans, sans-serif", fontSize: 14, fontWeight: 600,
                background: "transparent", color: theme.ink2, border: `1px solid ${theme.hair}`,
              }}>{en ? "Cancel" : "Batal"}</button>
            </div>
          )}

          {phase === "working" && (
            <div style={{ textAlign: "center", padding: "26px 0 18px" }}>
              {big(accent)}
              <div style={{ display: "inline-block", width: 44, height: 44, borderRadius: 99, border: `3px solid ${theme.hair}`, borderTopColor: accent === "#000000" ? theme.ink : accent, animation: "protoSpin 0.9s linear infinite", margin: "20px 0 0" }} />
              <div className="br-display" style={{ fontSize: 19, color: theme.ink, marginTop: 16, letterSpacing: -0.3 }}>
                {isSSO ? (en ? "Signing you in…" : "Memasukkan kamu…") : (en ? `Connecting to ${meta.name}…` : `Menghubungkan ${meta.name}…`)}
              </div>
              <div className="br-mono" style={{ fontSize: 10, color: theme.ink3, letterSpacing: 1.3, marginTop: 8, textTransform: "uppercase" }}>OAuth 2.0 · {meta.domain}</div>
            </div>
          )}

          {phase === "done" && (
            <div style={{ textAlign: "center", padding: "30px 0 22px" }}>
              <div style={{ width: 70, height: 70, borderRadius: 22, margin: "0 auto", background: theme.pos, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 16px 34px -14px ${theme.pos}` }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6" /></svg>
              </div>
              <div className="br-display" style={{ fontSize: 21, color: theme.ink, marginTop: 16, letterSpacing: -0.4 }}>
                {isSSO ? (en ? "Signed in" : "Berhasil masuk") : (en ? `${meta.name} connected` : `${meta.name} terhubung`)}
              </div>
              <div className="br-sans" style={{ fontSize: 12.5, color: theme.ink2, marginTop: 6 }}>
                {isSSO ? (en ? "Welcome to BrandReel." : "Selamat datang di BrandReel.") : (en ? "Token stored · auto-refresh on." : "Token tersimpan · auto-refresh aktif.")}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BrOAuthSheet, BrSSORow, BrSSOButton });
