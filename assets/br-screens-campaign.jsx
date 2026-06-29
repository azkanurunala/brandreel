// BrandReel — campaign flow: create → generating → detail → publishing.

const { useState: cp_useState, useEffect: cp_useEffect, useRef: cp_useRef } = React;

function resolveCampaign(id) {
  if (id === "__new" && window.__brNewCampaign) return window.__brNewCampaign;
  return BR_CAMPAIGNS.find((c) => c.id === id) || BR_CAMPAIGNS[0];
}

// ──────────────────────────────────────────────────────────────
// CREATE — product name + logo + voice + platforms
// ──────────────────────────────────────────────────────────────
function BrCreate({ onBack, onGenerate }) {
  const { theme, lang, persona } = useBr();
  const voice = lang === "en" ? persona.voice_en : persona.voice_id;
  const t = BR_T[lang];
  const [product, setProduct] = cp_useState("");
  const [desc, setDesc] = cp_useState("");
  const [logoColor, setLogoColor] = cp_useState(theme.brand);
  const [logoImage, setLogoImage] = cp_useState(null);
  const [plats, setPlats] = cp_useState(persona.platforms);
  const logoColors = [theme.brand, "#1FA971", "#2D7FF0", "#6D4AFF", "#E0A11B"];
  const ready = product.trim().length > 1 && plats.length > 0;
  const glyph = product.trim() ? product.trim().split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "··";

  function generate() {
    if (!ready) return;
    const productName = product.trim();
    window.__brNewCampaign = {
      id: "__new", product: productName, logoGlyph: glyph, logoColor, logoImage,
      desc_en: desc || "New product", desc_id: desc || "Produk baru",
      created_en: "Just generated", created_id: "Baru dibuat",
      status: "ready", topHook: "h2", views: "—", eng: "—",
      hashtags: ["#new", "#eco", "#sustainable", "#brandreel", "#ugc", "#viral"],
      platforms: plats.reduce((a, p) => (a[p] = { state: "queued" }, a), {}),
      // AI fields (filled in by BrGenerating): aiHooks, aiError
      aiHooks: null, aiError: false,
    };
    // Inputs the generating screen feeds to the real model.
    window.__brNewCampaignInput = {
      product: productName, desc: desc.trim(), voice,
      platforms: plats, lang,
    };
    onGenerate();
  }

  return (
    <BrAppShell theme={theme} density="soft">
      <BrAppHeader title={t.create.title} subtitle={t.create.sub} onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "16px 16px 20px" }}>
        {/* logo + name */}
        <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
          <div style={{ width: 62, height: 62, borderRadius: 17, flexShrink: 0, background: logoColor, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 22px -10px ${logoColor}` }}>
            {logoImage
              ? <img src={logoImage} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <span className="br-display" style={{ color: "#fff", fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>{glyph}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 5 }}>{t.create.product}</div>
            <input value={product} onChange={(e) => setProduct(e.target.value)} placeholder={t.create.productPh} style={{
              width: "100%", boxSizing: "border-box", background: theme.glassHi, border: `1px solid ${theme.hair}`, borderRadius: 12, padding: "11px 13px",
              fontFamily: "Plus Jakarta Sans", fontSize: 15, fontWeight: 600, color: theme.ink, outline: "none",
            }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {logoColors.map((c, i) => (
            <button key={i} onClick={() => setLogoColor(c)} className="br-press" style={{ width: 32, height: 32, borderRadius: 9, background: c, border: c === logoColor ? `2.5px solid ${theme.ink}` : "2.5px solid transparent", cursor: "pointer", padding: 0 }} />
          ))}
          <div style={{ flex: 1 }} />
          <label className="br-glass br-press" style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 12px", borderRadius: 9, border: `1px dashed ${logoImage ? theme.brand + "88" : theme.hair}`, color: logoImage ? theme.brand : theme.ink3, fontFamily: "Plus Jakarta Sans", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
            {logoImage ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></svg>
            )}
            {logoImage ? (lang === "en" ? "Logo added" : "Logo siap") : (lang === "en" ? "Upload logo" : "Unggah logo")}
            <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => setLogoImage(String(r.result)); r.readAsDataURL(f); }} style={{ display: "none" }} />
          </label>
        </div>

        <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", margin: "20px 0 8px" }}>{t.create.desc}</div>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t.create.descPh} rows={2} style={{
          width: "100%", boxSizing: "border-box", resize: "none", background: theme.glassHi, border: `1px solid ${theme.hair}`, borderRadius: 12, padding: "11px 13px",
          fontFamily: "Plus Jakarta Sans", fontSize: 13.5, color: theme.ink, outline: "none", lineHeight: 1.5,
        }} />

        {/* brand voice (read from kit) */}
        <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", margin: "20px 0 8px" }}>{t.create.voice}</div>
        <GlassPanel theme={theme} padding={13} style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: persona.color + "1C", border: `1px solid ${persona.color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={persona.color} strokeWidth="1.8" strokeLinecap="round"><path d="M3 10v4h4l5 5V5L7 10H3zM16 9a3 3 0 0 1 0 6"/></svg>
          </span>
          <div style={{ flex: 1 }}>
            <div className="br-sans" style={{ fontSize: 13, color: theme.ink, fontWeight: 600 }}>{lang === "en" ? persona.voice_en : persona.voice_id}</div>
            <div className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.6, marginTop: 2, textTransform: "uppercase" }}>{lang === "en" ? "FROM BRAND KIT" : "DARI BRAND KIT"}</div>
          </div>
        </GlassPanel>

        {/* platforms */}
        <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", margin: "20px 0 8px" }}>{t.create.platforms} · {plats.length}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {persona.platforms.map((pid) => {
            const p = BR_PLATFORMS[pid];
            const on = plats.includes(pid);
            return (
              <button key={pid} onClick={() => setPlats((s) => on ? s.filter((x) => x !== pid) : [...s, pid])} className="br-press" style={{
                border: `1px solid ${on ? p.color + "66" : theme.hair}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                background: on ? p.color + "10" : theme.glassHi, borderRadius: 13, padding: "10px 11px", display: "flex", alignItems: "center", gap: 9, opacity: on ? 1 : 0.6,
              }}>
                <PlatformBadge pid={pid} size={28} solid={on} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="br-sans" style={{ fontSize: 12, color: theme.ink, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div className="br-mono" style={{ fontSize: 8, color: theme.ink3, letterSpacing: 0.4 }}>{p.ratio}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <FloatingActionBar>
        <div style={{ flex: 1 }}>
          <PrimaryButton onClick={generate} gradient={ready ? `linear-gradient(120deg, ${theme.brand}, ${theme.accent})` : null} color={ready ? theme.brand : theme.ink3} style={{ opacity: ready ? 1 : 0.55, cursor: ready ? "pointer" : "default" }}>
            {t.create.generate}
          </PrimaryButton>
          <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.8, textAlign: "center", marginTop: 6, textTransform: "uppercase" }}>{t.create.est}</div>
        </div>
      </FloatingActionBar>
    </BrAppShell>
  );
}

// ──────────────────────────────────────────────────────────────
// GENERATING — phased async simulation
// ──────────────────────────────────────────────────────────────
function BrGenerating({ onDone, onBack }) {
  const { theme, lang } = useBr();
  const t = BR_T[lang].gen;
  const phases = [
    { k: "scripting",  label: t.scripting,  ms: 1500 },
    { k: "rendering",  label: t.rendering,  ms: 2400 },
    { k: "validating", label: t.validating, ms: 1600 },
    { k: "captioning", label: t.captioning, ms: 1500 },
  ];
  const [phase, setPhase] = cp_useState(0);
  const [pct, setPct] = cp_useState(0);
  const [aiSettled, setAiSettled] = cp_useState(false);
  const aiSettledRef = cp_useRef(false);
  const grad = `linear-gradient(120deg, ${theme.brand}, ${theme.accent})`;

  // Fire the REAL model call once, on mount. Merge results into the pending campaign.
  cp_useEffect(() => {
    let alive = true;
    const input = window.__brNewCampaignInput;
    const finish = () => { if (!alive) return; aiSettledRef.current = true; setAiSettled(true); };
    if (!input) { finish(); return () => { alive = false; }; }
    (async () => {
      try {
        const { hooks, hashtags } = await brAIGenerateCampaign(input);
        if (window.__brNewCampaign) {
          window.__brNewCampaign.aiHooks = hooks;
          window.__brNewCampaign.hashtags = hashtags;
          window.__brNewCampaign.aiError = false;
        }
      } catch (e) {
        if (window.__brNewCampaign) window.__brNewCampaign.aiError = true;
      } finally { finish(); }
    })();
    return () => { alive = false; };
  }, []);

  cp_useEffect(() => {
    const start = Date.now();
    const total = phases.reduce((a, p) => a + p.ms, 0);
    const id = setInterval(() => {
      const el = Date.now() - start;
      const ready = aiSettledRef.current;
      let acc = 0, cp = 0;
      for (let i = 0; i < phases.length; i++) { if (el >= acc + phases[i].ms) { acc += phases[i].ms; cp = i + 1; } else { break; } }
      const timedDone = el >= total;
      if (timedDone && ready) {
        // Both the staged animation AND the real model call are finished.
        setPhase(phases.length); setPct(100); clearInterval(id);
      } else if (timedDone) {
        // Animation done but model still working — hold on the captioning phase.
        setPhase(phases.length - 1); setPct(94);
      } else {
        setPhase(Math.min(cp, phases.length - 1));
        setPct(Math.min(92, Math.round((el / total) * 100)));
      }
    }, 90);
    return () => clearInterval(id);
  }, []);

  const allDone = phase >= phases.length;
  const waitingOnAI = pct >= 90 && !allDone;

  return (
    <BrAppShell theme={theme} density="rich">
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "24px 26px", position: "relative", zIndex: 2 }}>
        {/* ring */}
        <div style={{ alignSelf: "center", position: "relative", width: 132, height: 132, marginBottom: 28 }}>
          <svg width="132" height="132" viewBox="0 0 132 132" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="66" cy="66" r="58" fill="none" stroke={theme.hair} strokeWidth="8" />
            <circle cx="66" cy="66" r="58" fill="none" stroke={theme.brand} strokeWidth="8" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 58} strokeDashoffset={2 * Math.PI * 58 * (1 - pct / 100)} style={{ transition: "stroke-dashoffset 200ms linear" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div className="br-display br-num" style={{ fontSize: 34, color: theme.ink, letterSpacing: -1 }}>{pct}<span style={{ fontSize: 16, color: theme.ink3 }}>%</span></div>
            <div className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 1.4, marginTop: 2, textTransform: "uppercase" }}>25 {lang === "en" ? "assets" : "aset"}</div>
          </div>
        </div>

        <div className="br-display" style={{ fontSize: 24, letterSpacing: -0.7, color: theme.ink, textAlign: "center", lineHeight: 1.1 }}>
          {allDone ? t.done : t.title}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 24 }}>
          {phases.map((p, i) => {
            const done = phase > i;
            const active = phase === i;
            return (
              <div key={p.k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 13, background: active ? theme.glassHi : "transparent", border: `1px solid ${active ? theme.hair : "transparent"}` }}>
                <span style={{ width: 24, height: 24, borderRadius: 99, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                  background: done ? theme.pos : active ? theme.brand : theme.hair2, border: done || active ? "none" : `1px solid ${theme.hair}` }}>
                  {done ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round"><path d="M4 12l5 5L20 6"/></svg>
                    : active ? <span style={{ width: 14, height: 14, borderRadius: 99, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "protoSpin 0.8s linear infinite" }} />
                    : <span className="br-mono" style={{ fontSize: 10, color: theme.ink3, fontWeight: 700 }}>{i + 1}</span>}
                </span>
                <span className="br-sans" style={{ flex: 1, fontSize: 13.5, color: done || active ? theme.ink : theme.ink3, fontWeight: active ? 700 : 500 }}>{p.label}</span>
                {active && <span className="br-mono" style={{ fontSize: 9.5, color: theme.brand, letterSpacing: 0.8 }}>···</span>}
                {done && <span className="br-mono" style={{ fontSize: 9.5, color: theme.pos, letterSpacing: 0.8 }}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flexShrink: 0, padding: "10px 22px 18px", position: "relative", zIndex: 3 }}>
        {allDone ? (
          <PrimaryButton onClick={onDone} gradient={grad} color={theme.brand}>{t.review} →</PrimaryButton>
        ) : (
          <div className="br-mono" style={{ fontSize: 10, color: waitingOnAI ? theme.brand : theme.ink3, letterSpacing: 1.2, textAlign: "center", textTransform: "uppercase" }}>
            {waitingOnAI ? (lang === "en" ? "Claude · writing your hooks…" : "Claude · menulis hook…") : "Claude · Replicate · ffmpeg"}
          </div>
        )}
      </div>
    </BrAppShell>
  );
}

// ──────────────────────────────────────────────────────────────
// DETAIL — hook angles + per-platform variations + pre-flight
// ──────────────────────────────────────────────────────────────
function BrDetail({ id, now, onBack, onNavigate }) {
  const { theme, lang, persona } = useBr();
  const t = BR_T[lang];
  const c = resolveCampaign(id);
  const camPlatforms = Object.keys(c.platforms || {}).length ? Object.keys(c.platforms) : persona.platforms;
  const [hook, setHook] = cp_useState(c.topHook || "h2");
  const [plat, setPlat] = cp_useState(camPlatforms[0]);
  const [schedOpen, setSchedOpen] = cp_useState(false);
  const voice = lang === "en" ? persona.voice_en : persona.voice_id;
  const aiHooks = c.aiHooks || null;
  const hasAI = !!aiHooks;
  const aiScript = hasAI && aiHooks[hook] ? aiHooks[hook].script : "";

  // Per-platform adapted captions: real model call on demand, cached per hook+platform.
  const fallbackCap = brBuildCaption(c, hook, plat, lang);
  const [capCache, setCapCache] = cp_useState({});
  const cacheKey = hook + "-" + plat;
  const aiCap = capCache[cacheKey];
  const capLoading = hasAI && !aiCap;
  const cap = aiCap || fallbackCap;

  cp_useEffect(() => {
    if (!hasAI || capCache[cacheKey]) return undefined;
    let alive = true;
    const base = (aiHooks[hook] && aiHooks[hook].caption) || fallbackCap.text;
    brAIAdaptCaption({ product: c.product, voice, angle: hook, baseCaption: base, pid: plat, lang })
      .then((res) => { if (alive) setCapCache((m) => ({ ...m, [cacheKey]: res })); })
      .catch(() => { if (alive) setCapCache((m) => ({ ...m, [cacheKey]: fallbackCap })); });
    return () => { alive = false; };
  }, [cacheKey, hasAI]);

  const platMeta = BR_PLATFORMS[plat];
  const hk = BR_HOOKS[hook];
  const preflight = brPreflight(c, lang);
  const allClear = preflight.every((r) => r.ok);

  // ── REAL video generation: render an animated UGC short to a WebM blob ──
  const seedLine = ((BR_HOOK_LINES[hook] || {})[lang === "en" ? "en" : "id"] || "").replace("{p}", c.product.toLowerCase());
  const videoScript = aiScript || seedLine || (lang === "en" ? hk.key_en : hk.key_id);
  const videoCaption = (hasAI && aiHooks[hook] && aiHooks[hook].caption) || fallbackCap.text;
  const vKey = hook + "-" + plat;
  const [vidMap, setVidMap] = cp_useState({});
  const vid = vidMap[vKey] || { status: "idle", progress: 0, url: null };
  const videoOK = brVideoSupported();
  const fsRef = cp_useRef(null);

  cp_useEffect(() => {
    if (vidMap[vKey] && vidMap[vKey].status !== "idle") return undefined;
    // Prefer a real pre-generated Veo clip for this campaign+hook+ratio when one exists.
    const veoUrl = brVeoClip(c.id, hook, platMeta.ratio);
    if (veoUrl) {
      setVidMap((m) => ({ ...m, [vKey]: { status: "ready", progress: 1, url: veoUrl, real: true, mime: "video/mp4" } }));
      return undefined;
    }
    if (!videoOK) return undefined;
    let alive = true;
    setVidMap((m) => ({ ...m, [vKey]: { status: "rendering", progress: 0, url: null } }));
    brRenderUGCVideo({
      ratio: platMeta.ratio, duration: hook === "h5" ? 4.2 : 4.8,
      product: c.product, glyph: c.logoGlyph, logoColor: c.logoColor, hookColor: hk.color, logoImage: c.logoImage,
      hookLabel: "Hook " + hk.num + " · " + (lang === "en" ? hk.key_en : hk.key_id),
      script: videoScript, caption: videoCaption, brand: "BrandReel",
      platShort: platMeta.short, platColor: platMeta.color, platName: platMeta.name,
      handle: persona.handle, lang,
      onProgress: (p) => { if (alive) setVidMap((m) => ({ ...m, [vKey]: { ...(m[vKey] || {}), status: "rendering", progress: p } })); },
    })
      .then((res) => { if (alive) setVidMap((m) => ({ ...m, [vKey]: { status: "ready", progress: 1, url: res.url, mime: res.mime } })); })
      .catch(() => { if (alive) setVidMap((m) => ({ ...m, [vKey]: { status: "error", progress: 0, url: null } })); });
    return () => { alive = false; };
  }, [vKey]);

  function openFullscreen() {
    const el = fsRef.current;
    if (el && el.requestFullscreen) { try { el.requestFullscreen(); } catch (e) {} }
  }

  return (
    <BrAppShell theme={theme} density="soft">
      <BrAppHeader title={c.product} subtitle={(lang === "en" ? c.desc_en : c.desc_id)} color={c.logoColor} onBack={onBack}
        right={<GlassChip theme={theme} color={brStatusMeta(c.status, theme, t).color}>{brStatusMeta(c.status, theme, t).label}</GlassChip>} />

      <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 20px" }}>
        {/* hook angle selector */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "0 4px 8px" }}>{t.detail.hooks} · 5</div>
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 4, margin: "0 -2px" }}>
          {BR_HOOK_ORDER.map((hid) => {
            const h = BR_HOOKS[hid];
            const on = hid === hook;
            const isTop = hid === c.topHook;
            return (
              <button key={hid} onClick={() => setHook(hid)} className="br-press" style={{
                flexShrink: 0, border: `1px solid ${on ? h.color : theme.hair}`, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                background: on ? h.color + "14" : theme.glassHi, borderRadius: 13, padding: "9px 12px", minWidth: 124, position: "relative",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 7, background: h.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Geist Mono", fontSize: 9, fontWeight: 800 }}>{h.glyph}</span>
                  <span className="br-mono" style={{ fontSize: 9, color: on ? h.color : theme.ink3, letterSpacing: 0.6, fontWeight: 700 }}>HOOK {h.num}</span>
                  {isTop && <span style={{ marginLeft: "auto", fontSize: 10, color: theme.warn }}>★</span>}
                </div>
                <div className="br-sans" style={{ fontSize: 12, color: theme.ink, fontWeight: 600, marginTop: 6, lineHeight: 1.1 }}>{lang === "en" ? h.key_en : h.key_id}</div>
              </button>
            );
          })}
        </div>

        {/* video preview + platform tabs */}
        <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
          {/* preview — REAL generated video */}
          <div style={{
            width: 108, flexShrink: 0, aspectRatio: platMeta.ratio === "9:16" ? "9/16" : platMeta.ratio === "1:1" ? "1/1" : "16/9",
            borderRadius: 14, overflow: "hidden", position: "relative", background: `linear-gradient(160deg, ${hk.color}, ${c.logoColor})`,
            display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 26px -12px ${hk.color}`,
          }}>
            {vid.status === "ready" && vid.url ? (
              <>
                <video ref={fsRef} key={vid.url} src={vid.url} autoPlay loop muted playsInline
                  onClick={(e) => { const v = e.currentTarget; if (v.paused) v.play(); else v.pause(); }}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", background: "#000" }} />
                <button onClick={openFullscreen} className="br-press" title={lang === "en" ? "Fullscreen" : "Layar penuh"} style={{
                  position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 7, border: "none", cursor: "pointer", padding: 0,
                  background: "rgba(0,0,0,0.42)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/></svg>
                </button>
                <div style={{ position: "absolute", top: 6, left: 6, display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 99,
                  background: vid.real ? theme.pos + "E6" : "rgba(0,0,0,0.42)" }}>
                  {vid.real && <span style={{ width: 4, height: 4, borderRadius: 99, background: "#fff" }} />}
                  <span className="br-mono" style={{ fontSize: 7.5, fontWeight: 700, color: "#fff", letterSpacing: 0.6 }}>{vid.real ? "VEO" : "GEN"}</span>
                </div>
                <div style={{ position: "absolute", bottom: 7, left: 0, right: 0, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
                  <span className="br-mono" style={{ fontSize: 8, color: "rgba(255,255,255,0.92)", letterSpacing: 0.6, background: "rgba(0,0,0,0.42)", padding: "2px 6px", borderRadius: 99 }}>{platMeta.ratio} · {Math.round(hook === "h5" ? 4.2 : 4.8)}s</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ position: "absolute", inset: 0, opacity: 0.12, backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
                <div style={{ position: "absolute", top: 8, left: 8 }}><PlatformBadge pid={plat} size={22} solid /></div>
                {c.logoImage
                  ? <img src={c.logoImage} alt="" style={{ width: 54, height: 54, borderRadius: 13, objectFit: "cover", position: "relative", opacity: 0.92, boxShadow: "0 8px 20px -8px rgba(0,0,0,0.5)" }} />
                  : <span className="br-display" style={{ color: "#fff", fontSize: 30, fontWeight: 700, letterSpacing: -1, position: "relative", opacity: 0.85 }}>{c.logoGlyph}</span>}
                {vid.status === "rendering" ? (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(8,6,12,0.34)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 99, border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", animation: "protoSpin 0.8s linear infinite" }} />
                    <span className="br-mono" style={{ fontSize: 8.5, color: "#fff", letterSpacing: 0.8 }}>{lang === "en" ? "RENDERING" : "RENDER"} {Math.round((vid.progress || 0) * 100)}%</span>
                  </div>
                ) : vid.status === "error" ? (
                  <div style={{ position: "absolute", bottom: 7, left: 0, right: 0, textAlign: "center" }}>
                    <span className="br-mono" style={{ fontSize: 7.5, color: "rgba(255,255,255,0.92)", letterSpacing: 0.4, background: "rgba(0,0,0,0.42)", padding: "2px 6px", borderRadius: 99 }}>{lang === "en" ? "PREVIEW ONLY" : "PRATINJAU"}</span>
                  </div>
                ) : (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="rgba(255,255,255,0.95)" style={{ position: "absolute" }}><circle cx="12" cy="12" r="11" fill="rgba(0,0,0,0.28)"/><path d="M9 7l9 5-9 5z" fill="#fff"/></svg>
                )}
              </>
            )}
          </div>

          {/* platform tabs + spec */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {camPlatforms.map((pid) => {
                const p = BR_PLATFORMS[pid]; const on = pid === plat;
                return (
                  <button key={pid} onClick={() => setPlat(pid)} className="br-press" style={{
                    border: `1px solid ${on ? p.color : theme.hair}`, background: on ? p.color + "16" : "transparent", cursor: "pointer", padding: "5px 9px", borderRadius: 99,
                    display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "Geist Mono", fontSize: 10, fontWeight: 700, color: on ? p.color : theme.ink3, letterSpacing: 0.4,
                  }}>{p.short}</button>
                );
              })}
            </div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { l: lang === "en" ? "Aspect" : "Rasio", v: platMeta.ratio },
                { l: lang === "en" ? "Duration" : "Durasi", v: `≤ ${platMeta.maxSec}s` },
                { l: lang === "en" ? "Hashtags" : "Hashtag", v: `${platMeta.hashtags}` },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontFamily: "Geist Mono, monospace", fontSize: 10.5 }}>
                  <span style={{ color: theme.ink3, letterSpacing: 0.4, textTransform: "uppercase" }}>{r.l}</span>
                  <span style={{ color: theme.ink2, fontWeight: 600 }}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI hook script */}
        {hasAI && aiScript && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 4px 8px" }}>
              <span className="br-eyebrow" style={{ color: theme.ink3 }}>{lang === "en" ? "HOOK SCRIPT" : "SKRIP HOOK"}</span>
              <span className="br-mono" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 9, color: hk.color, letterSpacing: 0.6, fontWeight: 700 }}>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: hk.color, boxShadow: `0 0 6px ${hk.color}` }} />CLAUDE
              </span>
            </div>
            <GlassPanel theme={theme} padding={14} style={{ borderLeft: `3px solid ${hk.color}` }}>
              <div className="br-sans" style={{ fontSize: 14, color: theme.ink, lineHeight: 1.5, fontWeight: 600 }}>“{aiScript}”</div>
            </GlassPanel>
          </>
        )}

        {/* adapted caption */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 4px 8px" }}>
          <span className="br-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: theme.ink3 }}>
            {lang === "en" ? "ADAPTED CAPTION" : "CAPTION TERADAPTASI"}
            {hasAI && <span className="br-mono" style={{ fontSize: 8, letterSpacing: 0.6, color: theme.accent, fontWeight: 700, border: `1px solid ${theme.accent}55`, borderRadius: 99, padding: "1px 6px" }}>AI</span>}
          </span>
          <span className="br-mono" style={{ fontSize: 9.5, color: cap.len > cap.max * 0.92 ? theme.warn : theme.ink3, letterSpacing: 0.4 }}>{capLoading ? "···" : `${cap.len}/${cap.max}`}</span>
        </div>
        <GlassPanel theme={theme} padding={14}>
          {capLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={{ display: "inline-flex", gap: 4 }}>
                {[0, 1, 2].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: 99, background: theme.accent, animation: `protoBlip 1.2s ${i * 0.15}s infinite` }} />)}
              </span>
              <span className="br-mono" style={{ fontSize: 10, color: theme.ink3, letterSpacing: 0.6, textTransform: "uppercase" }}>{lang === "en" ? `Adapting for ${platMeta.name}…` : `Mengadaptasi untuk ${platMeta.name}…`}</span>
            </div>
          ) : (
            <div className="br-sans" style={{ fontSize: 13, color: theme.ink, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{cap.text}</div>
          )}
        </GlassPanel>

        {/* pre-flight */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "16px 4px 8px" }}>
          <span className="br-eyebrow" style={{ color: theme.ink3 }}>{t.detail.preflight}</span>
          <GlassChip theme={theme} color={allClear ? theme.pos : theme.neg}>{allClear ? (lang === "en" ? "All clear" : "Semua aman") : (lang === "en" ? "1 issue" : "1 masalah")}</GlassChip>
        </div>
        <GlassPanel theme={theme} padding={4} tone="solid">
          {preflight.map((r, i) => (
            <div key={r.k} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 11px", borderTop: i ? `1px solid ${theme.hair2}` : "none" }}>
              <span style={{ width: 20, height: 20, borderRadius: 99, flexShrink: 0, background: r.ok ? theme.pos + "1E" : theme.neg + "1E", border: `1px solid ${r.ok ? theme.pos : theme.neg}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {r.ok ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={theme.pos} strokeWidth="3.2" strokeLinecap="round"><path d="M4 12l5 5L20 6"/></svg>
                  : <span style={{ color: theme.neg, fontSize: 12, fontWeight: 800 }}>!</span>}
              </span>
              <span className="br-sans" style={{ flex: 1, fontSize: 12, color: r.ok ? theme.ink2 : theme.neg, lineHeight: 1.35 }}>{lang === "en" ? r.label_en : r.label_id}</span>
            </div>
          ))}
        </GlassPanel>
      </div>

      <FloatingActionBar>
        <GhostButton onClick={() => setSchedOpen(true)} style={{ flex: "0 0 auto", paddingLeft: 16, paddingRight: 16 }}>{t.detail.schedule}</GhostButton>
        <PrimaryButton onClick={() => onNavigate({ name: "publishing", id: c.id })} gradient={`linear-gradient(120deg, ${theme.brand}, ${theme.accent})`} color={theme.brand} style={{ flex: 1 }}>{t.detail.postNow} →</PrimaryButton>
      </FloatingActionBar>

      {schedOpen && (
        <BrScheduleSheet
          campaign={c}
          platforms={camPlatforms}
          hook={hook}
          now={now}
          onClose={() => setSchedOpen(false)}
          onScheduled={() => { setSchedOpen(false); onNavigate({ name: "schedule" }); }}
        />
      )}
    </BrAppShell>
  );
}

// ──────────────────────────────────────────────────────────────
// PUBLISHING — per-platform queue/posted/retry/failed + monitor
// ──────────────────────────────────────────────────────────────
function BrPublishing({ id, onBack, onNavigate }) {
  const { theme, lang } = useBr();
  const t = BR_T[lang];
  const c = resolveCampaign(id);
  const plats = Object.keys(c.platforms || {}).length ? c.platforms : Object.fromEntries(BR_PLATFORM_ORDER.map((p) => [p, { state: "queued" }]));

  // animate queued → posted over time for a "live" feel
  const [states, setStates] = cp_useState(() => Object.fromEntries(Object.entries(plats).map(([k, v]) => [k, { ...v }])));
  cp_useEffect(() => {
    const order = Object.keys(states).filter((k) => states[k].state === "queued");
    const timers = order.map((k, i) => setTimeout(() => {
      setStates((s) => ({ ...s, [k]: { ...s[k], state: "posted", views: ["240", "1.1K", "86", "12", "57"][i % 5] } }));
    }, 1200 + i * 1100));
    return () => timers.forEach(clearTimeout);
  }, []);

  const meta = {
    posted: { label: t.pub.posted, color: theme.pos },
    queued: { label: t.pub.queued, color: theme.ink3 },
    retry:  { label: t.pub.retry,  color: theme.warn },
    failed: { label: t.pub.failed, color: theme.neg },
  };
  const postedCount = Object.values(states).filter((s) => s.state === "posted").length;
  const total = Object.keys(states).length;

  return (
    <BrAppShell theme={theme} density="soft">
      <BrAppHeader title={t.pub.title} subtitle={c.product} color={c.logoColor} onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 24px" }}>
        {/* progress hero */}
        <GlassPanel theme={theme} padding={16} tone="solid" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div className="br-display br-num" style={{ fontSize: 34, color: theme.ink, letterSpacing: -1, lineHeight: 1 }}>{postedCount}<span style={{ fontSize: 17, color: theme.ink3 }}>/{total}</span></div>
              <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1, marginTop: 4, textTransform: "uppercase" }}>{lang === "en" ? "channels live" : "channel tayang"}</div>
            </div>
            <GlassChip theme={theme} color={theme.pos}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: theme.pos, boxShadow: `0 0 6px ${theme.pos}` }} />
              {t.pub.monitor}
            </GlassChip>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: theme.hair, marginTop: 14, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(postedCount / total) * 100}%`, background: `linear-gradient(90deg, ${theme.brand}, ${theme.accent})`, borderRadius: 99, transition: "width 500ms ease" }} />
          </div>
        </GlassPanel>

        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "16px 4px 8px" }}>{lang === "en" ? "PER-CHANNEL STATUS" : "STATUS PER CHANNEL"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {Object.entries(states).map(([pid, st]) => {
            const p = BR_PLATFORMS[pid]; const m = meta[st.state] || meta.queued;
            return (
              <GlassPanel key={pid} theme={theme} padding={12} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <PlatformBadge pid={pid} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="br-sans" style={{ fontSize: 13.5, color: theme.ink, fontWeight: 700 }}>{p.name}</div>
                  <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.5, marginTop: 2, textTransform: "uppercase" }}>
                    {st.state === "queued" && st.eta ? `${t.pub.queued} · ${st.eta}` : st.state === "queued" ? `${p.ratio} · ${t.pub.staggered}` : st.state === "retry" ? t.pub.retryNote : st.views ? `${st.views} ${t.insights.views}` : p.ratio}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  {st.state === "queued" && <span style={{ width: 13, height: 13, borderRadius: 99, border: `2px solid ${theme.hair}`, borderTopColor: theme.ink3, animation: "protoSpin 1s linear infinite" }} />}
                  {st.state === "retry" && <span style={{ width: 13, height: 13, borderRadius: 99, border: `2px solid ${theme.warn}55`, borderTopColor: theme.warn, animation: "protoSpin 0.8s linear infinite" }} />}
                  <GlassChip theme={theme} color={m.color}>
                    {(st.state === "posted" || st.state === "failed") && <span style={{ width: 5, height: 5, borderRadius: 99, background: m.color }} />}
                    {m.label}
                  </GlassChip>
                </div>
              </GlassPanel>
            );
          })}
        </div>

        {/* error log if any failed */}
        {Object.values(states).some((s) => s.state === "failed" || s.state === "retry") && (
          <>
            <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{lang === "en" ? "ERROR LOG" : "LOG ERROR"}</div>
            <GlassPanel theme={theme} padding={13} style={{ borderColor: theme.neg + "40" }}>
              <div className="br-mono" style={{ fontSize: 10.5, color: theme.neg, letterSpacing: 0.4, lineHeight: 1.6 }}>
                <div>[IG] reject · aspect 9:16 expected, got 9:15</div>
                <div style={{ color: theme.ink3 }}>↳ {lang === "en" ? "auto-fix: smart-crop to 9:16 · re-queued" : "auto-fix: smart-crop ke 9:16 · diantrekan ulang"}</div>
                <div style={{ marginTop: 6 }}>[X] 429 rate-limited · {lang === "en" ? "retry in 60s (backoff)" : "ulang 60d (backoff)"}</div>
              </div>
            </GlassPanel>
          </>
        )}

        <div style={{ marginTop: 18 }}>
          <GhostButton onClick={() => onNavigate({ name: "insights" })} style={{ width: "100%" }}>{lang === "en" ? "View live insights →" : "Lihat insight live →"}</GhostButton>
        </div>
      </div>
    </BrAppShell>
  );
}

Object.assign(window, { resolveCampaign, BrCreate, BrGenerating, BrDetail, BrPublishing });
