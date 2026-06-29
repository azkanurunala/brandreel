// BrandReel — first-run onboarding (5 steps) + OTP login.

const { useState: on_useState, useEffect: on_useEffect, useRef: on_useRef } = React;

// ──────────────────────────────────────────────────────────────
// ONBOARDING — welcome → value → connect → brand profile → done
// ──────────────────────────────────────────────────────────────
function BrOnboard({ onDone, onLogin }) {
  const { theme, lang, setTweak } = useBr();
  const t = BR_T[lang];
  const [step, setStep] = on_useState(0);
  const STEPS = 5;
  const [oauth, setOauth] = on_useState(null);

  // connect-accounts state (2 pre-connected to feel mid-setup)
  const [conn, setConn] = on_useState({ tiktok: true, instagram: true, youtube: false, linkedin: false, twitter: false, facebook: false });
  const connectedCount = Object.values(conn).filter(Boolean).length;
  // brand profile state
  const [brandName, setBrandName] = on_useState(lang === "en" ? "Eco Goods" : "Eco Goods");
  const [logoColor, setLogoColor] = on_useState("#1FA971");
  const [voice, setVoice] = on_useState(["casual", "eco"]);

  const grad = `linear-gradient(150deg, ${theme.brandDk}, ${theme.accent})`;
  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const voiceOpts = [
    { id: "casual", en: "Casual", id_: "Santai" }, { id: "funny", en: "Funny", id_: "Lucu" },
    { id: "pro", en: "Professional", id_: "Profesional" }, { id: "bold", en: "Bold", id_: "Berani" },
    { id: "eco", en: "Eco-conscious", id_: "Sadar lingkungan" }, { id: "minimal", en: "Minimal", id_: "Minimalis" },
  ];
  const logoColors = ["#1FA971", "#F23E5C", "#2D7FF0", "#6D4AFF", "#E0A11B"];

  return (
    <BrAppShell theme={theme} density="rich">
      {/* progress + skip */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 18px 4px", flexShrink: 0, position: "relative", zIndex: 3 }}>
        <div style={{ display: "flex", gap: 5, flex: 1 }}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? theme.brand : theme.hair, transition: "background 240ms" }} />
          ))}
        </div>
        {step < STEPS - 1 && (
          <button onClick={onLogin} style={{ border: "none", background: "transparent", cursor: "pointer", color: theme.ink3, fontFamily: "Plus Jakarta Sans", fontSize: 12, fontWeight: 600 }}>{t.onboard.skip}</button>
        )}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "8px 22px 18px", position: "relative", zIndex: 2, display: "flex", flexDirection: "column" }}>
        {/* STEP 0 — welcome */}
        {step === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start" }}>
            <div style={{ width: 74, height: 74, borderRadius: 22, background: grad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 18px 40px -14px ${theme.brand}`, marginBottom: 26 }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.94)" }} />
            </div>
            <div className="br-eyebrow" style={{ color: theme.brand }}>{lang === "en" ? "WELCOME TO" : "SELAMAT DATANG DI"}</div>
            <div className="br-display" style={{ fontSize: 42, lineHeight: 0.98, letterSpacing: -1.4, color: theme.ink, marginTop: 10 }}>
              Brand<span style={{ color: theme.brand }}>Reel</span>
            </div>
            <p className="br-sans" style={{ fontSize: 15, lineHeight: 1.5, color: theme.ink2, margin: "16px 0 0", maxWidth: 300 }}>
              {lang === "en"
                ? "Turn 10 hours of UGC into a 5-minute input. Drop a product name + logo — we generate, format, and auto-post everywhere."
                : "Ubah 10 jam bikin UGC jadi input 5 menit. Cukup nama produk + logo — kami buat, format, dan posting otomatis ke mana-mana."}
            </p>
            <div style={{ width: "100%", marginTop: 26 }}>
              <BrSSORow lang={lang} onPick={(id) => setOauth({ kind: "sso", id })} divider={false} />
            </div>
          </div>
        )}

        {/* STEP 1 — value props */}
        {step === 1 && (
          <div>
            <div className="br-display" style={{ fontSize: 28, letterSpacing: -0.9, color: theme.ink, lineHeight: 1.05, marginTop: 6 }}>
              {lang === "en" ? "From one input to\nevery feed." : "Dari satu input ke\nsemua feed."}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 22 }}>
              {[
                { c: theme.brand, n: "5", t_en: "hook angles auto-written", t_id: "sudut hook ditulis otomatis", s_en: "Problem/Solution · Unboxing · Before/After · Testimonial · Trending", s_id: "Masalah/Solusi · Unboxing · Before/After · Testimoni · Tren" },
                { c: theme.accent, n: "5", t_en: "platforms, each optimized", t_id: "platform, masing-masing dioptimasi", s_en: "Aspect ratio, duration, caption length — adapted per channel", s_id: "Rasio, durasi, panjang caption — disesuaikan per channel" },
                { c: theme.pos, n: "0", t_en: "silent failures", t_id: "kegagalan diam-diam", s_en: "Pre-flight checks catch format, token & rate-limit issues first", s_id: "Pemeriksaan pra-kirim menangkap format, token & rate-limit dulu" },
              ].map((v, i) => (
                <GlassPanel key={i} theme={theme} padding={14} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div className="br-display br-num" style={{ fontSize: 30, color: v.c, lineHeight: 1, letterSpacing: -1, flexShrink: 0, width: 34 }}>{v.n}</div>
                  <div>
                    <div className="br-sans" style={{ fontSize: 14, color: theme.ink, fontWeight: 700 }}>{lang === "en" ? v.t_en : v.t_id}</div>
                    <div className="br-sans" style={{ fontSize: 11.5, color: theme.ink2, marginTop: 3, lineHeight: 1.45 }}>{lang === "en" ? v.s_en : v.s_id}</div>
                  </div>
                </GlassPanel>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — connect accounts */}
        {step === 2 && (
          <div>
            <div className="br-display" style={{ fontSize: 28, letterSpacing: -0.9, color: theme.ink, lineHeight: 1.05, marginTop: 6 }}>
              {lang === "en" ? "Connect your\nchannels." : "Hubungkan\nchannel kamu."}
            </div>
            <p className="br-sans" style={{ fontSize: 13, color: theme.ink2, margin: "10px 0 18px", lineHeight: 1.5 }}>
              {lang === "en" ? "OAuth-secure. We refresh tokens 7 days before they expire — so posts never fail silently." : "Aman dengan OAuth. Token disegarkan 7 hari sebelum kedaluwarsa — posting tak pernah gagal diam-diam."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {BR_PLATFORM_ORDER.map((pid) => {
                const p = BR_PLATFORMS[pid];
                const on = conn[pid];
                return (
                  <button key={pid} onClick={() => { if (on) setConn((c) => ({ ...c, [pid]: false })); else setOauth({ kind: "platform", id: pid }); }} className="br-press" style={{
                    border: `1px solid ${on ? p.color + "66" : theme.hair}`, cursor: "pointer", fontFamily: "inherit",
                    background: on ? p.color + "12" : theme.glassHi, borderRadius: 14, padding: "11px 13px", display: "flex", alignItems: "center", gap: 12,
                  }}>
                    <PlatformBadge pid={pid} size={34} solid={on} />
                    <div style={{ flex: 1, textAlign: "left" }}>
                      <div className="br-sans" style={{ fontSize: 14, color: theme.ink, fontWeight: 700 }}>{p.name}</div>
                      <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.6, marginTop: 2, textTransform: "uppercase" }}>{p.ratio} · {p.maxSec}s max</div>
                    </div>
                    <span style={{
                      padding: "5px 11px", borderRadius: 99, fontFamily: "Geist Mono, monospace", fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8,
                      background: on ? p.color : "transparent", color: on ? "#fff" : theme.ink2, border: on ? "none" : `1px solid ${theme.hair}`,
                      display: "inline-flex", alignItems: "center", gap: 5,
                    }}>
                      {on && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round"><path d="M4 12l5 5L20 6"/></svg>}
                      {on ? t.profile.connected.toUpperCase() : t.onboard.connect.toUpperCase()}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="br-mono" style={{ fontSize: 10, color: theme.ink3, letterSpacing: 1, textAlign: "center", marginTop: 16, textTransform: "uppercase" }}>
              {connectedCount}/{BR_PLATFORM_ORDER.length} {lang === "en" ? "connected" : "terhubung"}
            </div>
          </div>
        )}

        {/* STEP 3 — brand profile */}
        {step === 3 && (
          <div>
            <div className="br-display" style={{ fontSize: 28, letterSpacing: -0.9, color: theme.ink, lineHeight: 1.05, marginTop: 6 }}>
              {lang === "en" ? "Set your\nbrand kit." : "Atur\nbrand kit."}
            </div>
            <p className="br-sans" style={{ fontSize: 13, color: theme.ink2, margin: "10px 0 16px", lineHeight: 1.5 }}>
              {lang === "en" ? "We apply this voice & look to every caption and video." : "Kami terapkan voice & tampilan ini ke setiap caption dan video."}
            </p>

            {/* logo + name */}
            <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: 17, flexShrink: 0, background: logoColor, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 22px -10px ${logoColor}` }}>
                <span className="br-display" style={{ color: "#fff", fontSize: 24, fontWeight: 700, letterSpacing: -0.5 }}>{(brandName[0] || "B").toUpperCase()}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 5 }}>{lang === "en" ? "Brand name" : "Nama brand"}</div>
                <input value={brandName} onChange={(e) => setBrandName(e.target.value)} style={{
                  width: "100%", boxSizing: "border-box", background: theme.glassHi, border: `1px solid ${theme.hair}`, borderRadius: 12, padding: "11px 13px",
                  fontFamily: "Plus Jakarta Sans", fontSize: 15, fontWeight: 600, color: theme.ink, outline: "none",
                }} />
              </div>
            </div>

            <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", margin: "18px 0 8px" }}>{lang === "en" ? "Brand color" : "Warna brand"}</div>
            <div style={{ display: "flex", gap: 9 }}>
              {logoColors.map((c) => (
                <button key={c} onClick={() => setLogoColor(c)} className="br-press" style={{
                  width: 40, height: 40, borderRadius: 12, background: c, border: c === logoColor ? `2.5px solid ${theme.ink}` : "2.5px solid transparent", cursor: "pointer", padding: 0,
                  boxShadow: c === logoColor ? `0 6px 14px -6px ${c}` : "none",
                }} />
              ))}
            </div>

            <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", margin: "18px 0 8px" }}>{t.create.voice}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {voiceOpts.map((v) => {
                const on = voice.includes(v.id);
                return (
                  <button key={v.id} onClick={() => setVoice((vv) => on ? vv.filter((x) => x !== v.id) : [...vv, v.id])} className="br-press" style={{
                    border: `1px solid ${on ? theme.brand : theme.hair}`, background: on ? theme.brand + "14" : theme.glassHi, color: on ? theme.brand : theme.ink2,
                    borderRadius: 99, padding: "8px 14px", cursor: "pointer", fontFamily: "Plus Jakarta Sans", fontSize: 13, fontWeight: 600,
                  }}>{lang === "en" ? v.en : v.id_}</button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4 — done */}
        {step === 4 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <div style={{ width: 86, height: 86, borderRadius: 26, background: grad, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 20px 44px -16px ${theme.brand}`, marginBottom: 22 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>
            </div>
            <div className="br-display" style={{ fontSize: 30, letterSpacing: -0.9, color: theme.ink, lineHeight: 1.05 }}>
              {lang === "en" ? "You're all set." : "Semua siap."}
            </div>
            <p className="br-sans" style={{ fontSize: 14, color: theme.ink2, margin: "12px 0 0", lineHeight: 1.5, maxWidth: 290 }}>
              {lang === "en"
                ? `${connectedCount} channels connected · ${brandName} brand kit saved. Create your first campaign in under 5 minutes.`
                : `${connectedCount} channel terhubung · brand kit ${brandName} tersimpan. Buat kampanye pertama dalam 5 menit.`}
            </p>
          </div>
        )}
      </div>

      {/* footer nav */}
      <div style={{ flexShrink: 0, padding: "10px 22px 16px", display: "flex", gap: 10, position: "relative", zIndex: 3 }}>
        {step > 0 && step < STEPS - 1 && (
          <GhostButton onClick={back} style={{ flex: "0 0 auto", paddingLeft: 18, paddingRight: 18 }}>{t.onboard.back}</GhostButton>
        )}
        {step < STEPS - 1 ? (
          <PrimaryButton onClick={step === 0 ? next : next} color={theme.brand} gradient={step === 0 ? grad : null} style={{ flex: 1 }}>
            {step === 0 ? t.onboard.getStarted : step === 2 ? `${t.onboard.continue} · ${connectedCount}/${BR_PLATFORM_ORDER.length}` : t.onboard.continue}
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={onDone} gradient={grad} color={theme.brand} style={{ flex: 1 }}>{t.onboard.finish} →</PrimaryButton>
        )}
      </div>

      {step === 0 && (
        <button onClick={onLogin} style={{ position: "absolute", bottom: 70, left: 0, right: 0, zIndex: 4, border: "none", background: "transparent", cursor: "pointer", color: theme.ink2, fontFamily: "Plus Jakarta Sans", fontSize: 13 }}>
          {lang === "en" ? "I already have an account" : "Saya sudah punya akun"}
        </button>
      )}

      <BrOAuthSheet target={oauth}
        onCancel={() => setOauth(null)}
        onDone={(tg) => {
          setOauth(null);
          if (tg && tg.kind === "platform") setConn((c) => ({ ...c, [tg.id]: true }));
          else if (tg && tg.kind === "sso") onDone && onDone();
        }} />
    </BrAppShell>
  );
}

// ──────────────────────────────────────────────────────────────
// LOGIN — email/password → 6-digit OTP → verifying
// ──────────────────────────────────────────────────────────────
function BrLogin({ onSuccess }) {
  const { theme, lang } = useBr();
  const t = BR_T[lang].login;
  const [stepN, setStepN] = on_useState(0);
  const [oauth, setOauth] = on_useState(null);
  const [email, setEmail] = on_useState("inez@ecogoods.id");
  const [pass, setPass] = on_useState("••••••••");
  const [otp, setOtp] = on_useState(["", "", "", "", "", ""]);
  const otpRefs = on_useRef([]);
  const grad = `linear-gradient(150deg, ${theme.brandDk}, ${theme.accent})`;

  on_useEffect(() => { if (stepN === 1 && otpRefs.current[0]) otpRefs.current[0].focus(); }, [stepN]);

  function setDigit(i, v) {
    v = String(v).slice(-1).replace(/\D/g, "");
    const nx = [...otp]; nx[i] = v; setOtp(nx);
    if (v && i < 5) otpRefs.current[i + 1] && otpRefs.current[i + 1].focus();
    if (nx.every((x) => x.length === 1)) { setStepN(2); setTimeout(() => onSuccess && onSuccess(), 1200); }
  }
  function demoOtp() { setOtp(["4", "9", "1", "7", "2", "6"]); setStepN(2); setTimeout(() => onSuccess && onSuccess(), 1200); }

  return (
    <BrAppShell theme={theme} density="rich">
      <div style={{ flex: 1, padding: "30px 24px 20px", display: "flex", flexDirection: "column", minHeight: 0, position: "relative", zIndex: 2 }}>
        <BrandMark theme={theme} size={22} />
        <div style={{ marginTop: 34 }}>
          <div className="br-eyebrow" style={{ color: theme.brand }}>{BR_T[lang].tagline}</div>
          <div className="br-display" style={{ fontSize: 40, lineHeight: 0.98, letterSpacing: -1.3, color: theme.ink, marginTop: 10, whiteSpace: "pre-line" }}>{t.title}</div>
          <p className="br-sans" style={{ fontSize: 13.5, color: theme.ink2, margin: "14px 0 0" }}>{t.sub}</p>
        </div>

        <div style={{ marginTop: 22, flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          {stepN === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <BrSSORow lang={lang} onPick={(id) => setOauth({ kind: "sso", id })} />
              <form onSubmit={(e) => { e.preventDefault(); setStepN(1); }} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <LoginField theme={theme} label={t.email} value={email} onChange={setEmail} />
                <LoginField theme={theme} label={t.pass} value={pass} onChange={setPass} secret />
                <PrimaryButton onClick={() => setStepN(1)} gradient={grad} color={theme.brand} style={{ marginTop: 4 }}>{t.continue}</PrimaryButton>
                <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.3, textAlign: "center", marginTop: 4, textTransform: "uppercase" }}>OAuth · HTTPS · 2FA</div>
              </form>
            </div>
          )}
          {stepN === 1 && (
            <div>
              <div className="br-mono" style={{ fontSize: 10, color: theme.brand, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700 }}>{t.otpSent}</div>
              <div className="br-sans" style={{ fontSize: 13, color: theme.ink2, marginTop: 6 }}>{t.otpSub}</div>
              <div style={{ display: "flex", gap: 7, marginTop: 16, justifyContent: "space-between" }}>
                {otp.map((d, i) => (
                  <input key={i} ref={(el) => otpRefs.current[i] = el} value={d} onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1].focus(); }}
                    maxLength={1} inputMode="numeric" style={{
                      width: 44, height: 56, borderRadius: 13, border: `1px solid ${theme.hair}`, background: theme.glassHi,
                      textAlign: "center", fontFamily: "Geist Mono, monospace", fontSize: 22, fontWeight: 700, color: theme.ink, outline: "none",
                    }} />
                ))}
              </div>
              <PrimaryButton onClick={demoOtp} gradient={grad} color={theme.brand} style={{ marginTop: 16 }}>{t.demoOtp}</PrimaryButton>
              <GhostButton onClick={() => setStepN(0)} style={{ marginTop: 8, textAlign: "center" }}>← {BR_T[lang].onboard.back}</GhostButton>
            </div>
          )}
          {stepN === 2 && (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <div style={{ display: "inline-block", width: 56, height: 56, borderRadius: 99, border: `3px solid ${theme.hair}`, borderTopColor: theme.brand, animation: "protoSpin 0.9s linear infinite" }} />
              <div className="br-display" style={{ fontSize: 22, letterSpacing: -0.5, color: theme.ink, marginTop: 16 }}>{t.verifying}</div>
              <div className="br-mono" style={{ fontSize: 10, color: theme.ink3, letterSpacing: 1.4, marginTop: 6, textTransform: "uppercase" }}>OTP · HTTPS</div>
            </div>
          )}
        </div>
      </div>
      <BrOAuthSheet target={oauth} onCancel={() => setOauth(null)} onDone={() => { setOauth(null); onSuccess && onSuccess(); }} />
    </BrAppShell>
  );
}

function LoginField({ theme, label, value, onChange, secret }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <span className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase" }}>{label}</span>
      <input type={secret ? "password" : "text"} value={value} onChange={(e) => onChange(e.target.value)} style={{
        background: theme.glassHi, border: `1px solid ${theme.hair}`, borderRadius: 12, padding: "12px 14px",
        fontFamily: "Geist Mono, monospace", fontSize: 14, color: theme.ink, outline: "none",
      }} />
    </label>
  );
}

Object.assign(window, { BrOnboard, BrLogin, LoginField });
