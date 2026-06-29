// BrandReel — unit economics + in-app purchase.
// Single source of truth for what every AI/API call costs, what each plan
// nets after the app-store cut, and whether the platform actually profits.
// All prices grounded to public June 2026 rates (see BR_COST.sources).

const { useState: ec_useState } = React;

// ──────────────────────────────────────────────────────────────
// COST INPUTS — real vendor pricing (June 2026)
// ──────────────────────────────────────────────────────────────
const BR_COST = {
  // Anthropic Claude — USD per 1,000,000 tokens (input / output)
  claude: { haiku: { in: 1.00, out: 5.00 }, sonnet: { in: 3.00, out: 15.00 } },
  // Google Veo 3.1 — USD per second of generated video (incl. audio)
  veo: { fast: 0.15, standard: 0.40, liteNoAudio: 0.03 },
  veoClipSec: 6,                 // BrandReel renders 6s UGC clips
  // Infra — USD per unit
  storagePerClip:   0.010,       // object storage write + 30-day retention
  cdnPerPost:       0.006,       // delivery bandwidth per published post
  transcodePerPost: 0.003,       // self-hosted ffmpeg reformat (compute)
  publishApiPerPost:0.0005,      // platform publish call overhead
  smsOtp:           0.0079,      // Twilio SMS (per login, amortized away)
  // Store commission (fraction of gross) + web processor
  store: {
    appstore:    { rate: 0.30, label_en: "App Store · 30%",  label_id: "App Store · 30%",  note_en: "Standard first-year rate", note_id: "Tarif tahun pertama" },
    appstoreSmb: { rate: 0.15, label_en: "App Store · 15%",  label_id: "App Store · 15%",  note_en: "Small Business / yr 2+",  note_id: "Small Business / thn 2+" },
    play:        { rate: 0.15, label_en: "Google Play · 15%",label_id: "Google Play · 15%",note_en: "First $1M / yr rate",    note_id: "Tarif $1J pertama / thn" },
    web:         { rate: 0.029, fixed: 0.30, label_en: "Web · Stripe", label_id: "Web · Stripe", note_en: "2.9% + $0.30, no store cut", note_id: "2,9% + $0,30, tanpa potongan" },
  },
  sources: "Anthropic API & Google Veo 3.1 (Gemini API) public pricing, verified Jun 2026.",
};
const BR_STORE_ORDER = ["appstore", "appstoreSmb", "play", "web"];

// ── primitive cost helpers ──────────────────────────────────────
function brClaudeCost(model, inTok, outTok) {
  const m = BR_COST.claude[model] || BR_COST.claude.haiku;
  return (inTok * m.in + outTok * m.out) / 1e6;
}
function brVeoCost(tier, sec) { return (BR_COST.veo[tier] || BR_COST.veo.fast) * (sec || BR_COST.veoClipSec); }

// ── derived per-action unit costs (the numbers the app's flows incur) ──
const BR_UNIT = {
  hookGen:    brClaudeCost("sonnet", 520, 760),   // 1 campaign → 5 hooks + captions + tags
  caption:    brClaudeCost("haiku", 360, 150),    // per-platform caption adaptation
  copilotMsg: brClaudeCost("sonnet", 800, 220),   // one Copilot turn
  veoClip:    brVeoCost("fast"),                   // one AI video render (Veo 3.1 Fast, 6s)
  veoClipStd: brVeoCost("standard"),
  veoLite:    brVeoCost("liteNoAudio"),
  canvasClip: 0.0008,                              // in-browser render → ~free (server overhead only)
  postOps:    BR_COST.transcodePerPost + BR_COST.cdnPerPost + BR_COST.publishApiPerPost,
};

// ──────────────────────────────────────────────────────────────
// PLANS — price + what each plan includes per month
// veoIncl = AI-video (Veo) renders bundled; overflow falls back to the free
// canvas renderer, so it never costs COGS. That cap is what protects margin.
// ──────────────────────────────────────────────────────────────
const BR_PLAN_ECON = {
  creator: { price: 39,  veoIncl: 12,  posts: 30,   campaigns: 8,  copilot: 40,  persona: "creator", rank: 1 },
  pro:     { price: 99,  veoIncl: 40,  posts: 100,  campaigns: 20, copilot: 150, persona: "brand",   rank: 2 },
  agency:  { price: 299, veoIncl: 150, posts: 1500, campaigns: 60, copilot: 600, persona: "agency_admin", rank: 3, fairUse: true },
};
const BR_PLAN_ORDER = ["creator", "pro", "agency"];

// Veo credit top-up packs — consumable IAP. Priced ABOVE the store-fee-adjusted
// render cost so each pack clears margin even through the 30% store cut.
const BR_VEO_PACKS = [
  { id: "v20",  renders: 20,  price: 39.99 },
  { id: "v50",  renders: 50,  price: 89.99 },
  { id: "v120", renders: 120, price: 199.99 },
];

// ── P&L math ────────────────────────────────────────────────────
function brPlanCOGS(plan) {
  return plan.veoIncl * BR_UNIT.veoClip
       + plan.posts * (BR_UNIT.postOps + BR_UNIT.caption)
       + plan.campaigns * BR_UNIT.hookGen
       + plan.copilot * BR_UNIT.copilotMsg;
}
function brNetRevenue(gross, storeKey) {
  const s = BR_COST.store[storeKey] || BR_COST.store.appstore;
  return s.fixed != null ? gross * (1 - s.rate) - s.fixed : gross * (1 - s.rate);
}
function brPlanPnL(planKey, storeKey) {
  const plan = BR_PLAN_ECON[planKey];
  const gross = plan.price;
  const net = brNetRevenue(gross, storeKey);
  const cogs = brPlanCOGS(plan);
  const margin = net - cogs;
  return { gross, net, cogs, margin, marginPct: net > 0 ? margin / net : 0, storeFee: gross - net + (BR_COST.store[storeKey].fixed || 0) };
}
function brPackPnL(pack, storeKey) {
  const net = brNetRevenue(pack.price, storeKey);
  const cogs = pack.renders * BR_UNIT.veoClip;
  return { net, cogs, margin: net - cogs, marginPct: net > 0 ? (net - cogs) / net : 0, perRender: pack.price / pack.renders };
}
const brUSD = (n) => (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2);
const brPct = (n) => Math.round(n * 100) + "%";

// ══════════════════════════════════════════════════════════════
// IN-APP PURCHASE SHEET — App Store / Google Play style checkout.
// product: { kind:"sub"|"credits", title, sub, price, period, planKey|pack }
// ══════════════════════════════════════════════════════════════
function BrIAPSheet({ product, store, onCancel, onComplete }) {
  const { theme, lang, persona } = useBr();
  const en = lang === "en";
  const [phase, setPhase] = ec_useState("review"); // review → auth → processing → done
  const key = product ? product.title + ":" + (product.price || 0) : null;

  React.useEffect(() => { if (product) setPhase("review"); }, [key]);
  React.useEffect(() => {
    if (phase === "auth")       { const t = setTimeout(() => setPhase("processing"), 1500); return () => clearTimeout(t); }
    if (phase === "processing") { const t = setTimeout(() => setPhase("done"), 1400); return () => clearTimeout(t); }
    if (phase === "done")       { const t = setTimeout(() => onComplete && onComplete(product), 1050); return () => clearTimeout(t); }
  }, [phase]);

  if (!product) return null;
  const isPlay = store === "play";
  const storeName = isPlay ? "Google Play" : "App Store";
  const storeAccent = isPlay ? "#01875F" : "#0A84FF";
  const acct = isPlay ? persona.handle.replace(/^@/, "") + "@gmail.com" : persona.handle.replace(/^@/, "") + "@icloud.com";
  const recurring = product.kind === "sub";

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 95, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={() => phase === "review" && onCancel && onCancel()} style={{ position: "absolute", inset: 0, background: "rgba(8,8,14,0.6)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", animation: "brBackdropIn 200ms ease" }} />
      <div style={{ position: "relative", background: theme.page, borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: "0 -18px 50px -16px rgba(0,0,0,0.55)", overflow: "hidden", animation: "brSheetUp 320ms cubic-bezier(0.22,1,0.36,1)" }}>
        {/* store chrome */}
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "13px 18px", borderBottom: `1px solid ${theme.hair2}`, background: theme.glassHi }}>
          <span style={{ width: 22, height: 22, borderRadius: 6, background: storeAccent, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isPlay
              ? <svg width="12" height="12" viewBox="0 0 24 24"><path fill="#fff" d="M4 3l11 9L4 21z"/></svg>
              : <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><path d="M16.4 12.6c0-2.4 1.9-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.9-1.5-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.4 1.1 0 1.6-.7 3-.7s1.7.7 2.9.7 2-1.1 2.7-2.2c.9-1.3 1.2-2.5 1.2-2.6-.1 0-2.4-.9-2.4-3.5z"/></svg>}
          </span>
          <span className="br-sans" style={{ fontSize: 13, fontWeight: 700, color: theme.ink }}>{storeName}</span>
          <div style={{ flex: 1 }} />
          {phase === "review" && (
            <button onClick={() => onCancel && onCancel()} aria-label="close" className="br-press" style={{ border: "none", background: theme.canvasAlt, cursor: "pointer", width: 26, height: 26, borderRadius: 99, color: theme.ink2, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
          )}
        </div>

        <div style={{ padding: "20px 20px 22px" }}>
          {phase === "review" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <div style={{ width: 52, height: 52, borderRadius: 13, flexShrink: 0, background: `linear-gradient(135deg, ${theme.brand}, ${theme.accent})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 20px -8px ${theme.brand}` }}>
                  <span style={{ width: 17, height: 17, borderRadius: "50%", background: "rgba(255,255,255,0.92)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="br-sans" style={{ fontSize: 15, fontWeight: 700, color: theme.ink, lineHeight: 1.15 }}>{product.title}</div>
                  <div className="br-sans" style={{ fontSize: 12, color: theme.ink3, marginTop: 2 }}>{product.sub}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="br-display br-num" style={{ fontSize: 19, color: theme.ink, letterSpacing: -0.4, lineHeight: 1 }}>{brUSD(product.price)}</div>
                  {recurring && <div className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.4, marginTop: 3, textTransform: "uppercase" }}>{product.period}</div>}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, padding: "9px 12px", borderRadius: 11, background: theme.canvasAlt }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={theme.ink3} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
                <span className="br-mono" style={{ fontSize: 10.5, color: theme.ink2, letterSpacing: 0.2 }}>{acct}</span>
                <div style={{ flex: 1 }} />
                <span className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.8, textTransform: "uppercase" }}>{en ? "Account" : "Akun"}</span>
              </div>

              <button onClick={() => setPhase("auth")} className="br-press" style={{
                width: "100%", marginTop: 16, padding: "14px 18px", borderRadius: 13, border: "none", cursor: "pointer",
                fontFamily: "Plus Jakarta Sans", fontSize: 15, fontWeight: 700, color: "#fff", background: storeAccent,
                boxShadow: `0 12px 26px -12px ${storeAccent}`,
              }}>{recurring ? (en ? "Subscribe" : "Langganan") : (en ? "Confirm & Buy" : "Konfirmasi & Beli")}</button>

              <div className="br-sans" style={{ fontSize: 10.5, color: theme.ink3, lineHeight: 1.5, marginTop: 13 }}>
                {recurring
                  ? (en
                    ? `${brUSD(product.price)}/${product.periodWord} after any trial. Renews automatically until canceled in Settings ≥24h before the period ends.`
                    : `${brUSD(product.price)}/${product.periodWord} setelah masa coba. Diperpanjang otomatis sampai dibatalkan di Setelan ≥24 jam sebelum periode berakhir.`)
                  : (en
                    ? "One-time purchase. Veo render credits are added to your account immediately and never expire."
                    : "Pembelian sekali. Kredit render Veo langsung ditambahkan dan tidak kedaluwarsa.")}
              </div>
            </div>
          )}

          {phase === "auth" && (
            <div style={{ textAlign: "center", padding: "14px 0 8px" }}>
              <div style={{ width: 62, height: 62, borderRadius: 16, margin: "0 auto", border: `2.5px solid ${storeAccent}`, display: "flex", alignItems: "center", justifyContent: "center", animation: "brPop 360ms ease both" }}>
                {isPlay
                  ? <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={storeAccent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11c0-3 0-6 0-7M9 8v5M15 8v6M6 11v3a6 6 0 0 0 12 0v-2"/></svg>
                  : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={storeAccent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="9.5" cy="10.5" r="0.6" fill={storeAccent}/><circle cx="14.5" cy="10.5" r="0.6" fill={storeAccent}/><path d="M9 14.5c.9 1 2 1.5 3 1.5s2.1-.5 3-1.5"/></svg>}
              </div>
              <div className="br-display" style={{ fontSize: 18, color: theme.ink, marginTop: 16, letterSpacing: -0.3 }}>{isPlay ? (en ? "Confirm with fingerprint" : "Konfirmasi sidik jari") : (en ? "Double-click to confirm" : "Klik dua kali untuk konfirmasi")}</div>
              <div className="br-mono" style={{ fontSize: 10, color: theme.ink3, letterSpacing: 1, marginTop: 7, textTransform: "uppercase" }}>{isPlay ? (en ? "Google Play protect" : "Google Play protect") : (en ? "Pay with Face ID" : "Bayar dengan Face ID")}</div>
            </div>
          )}

          {phase === "processing" && (
            <div style={{ textAlign: "center", padding: "22px 0 16px" }}>
              <div style={{ display: "inline-block", width: 44, height: 44, borderRadius: 99, border: `3px solid ${theme.hair}`, borderTopColor: storeAccent, animation: "protoSpin 0.9s linear infinite" }} />
              <div className="br-display" style={{ fontSize: 18, color: theme.ink, marginTop: 16, letterSpacing: -0.3 }}>{en ? "Completing purchase…" : "Menyelesaikan pembelian…"}</div>
              <div className="br-mono" style={{ fontSize: 10, color: theme.ink3, letterSpacing: 1, marginTop: 7, textTransform: "uppercase" }}>{storeName} · {en ? "secure" : "aman"}</div>
            </div>
          )}

          {phase === "done" && (
            <div style={{ textAlign: "center", padding: "26px 0 18px" }}>
              <div style={{ width: 68, height: 68, borderRadius: 21, margin: "0 auto", background: theme.pos, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 16px 34px -14px ${theme.pos}`, animation: "brPop 380ms ease both" }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>
              </div>
              <div className="br-display" style={{ fontSize: 20, color: theme.ink, marginTop: 15, letterSpacing: -0.4 }}>{recurring ? (en ? "You're Premium" : "Kamu Premium") : (en ? "Credits added" : "Kredit ditambahkan")}</div>
              <div className="br-sans" style={{ fontSize: 12.5, color: theme.ink2, marginTop: 6 }}>{product.title}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ECONOMICS SCREEN — owner/admin: prove every plan profits.
// ══════════════════════════════════════════════════════════════
function BrEconomics({ onBack }) {
  const { theme, lang, deviceKind } = useBr();
  const en = lang === "en";
  const [storeKey, setStoreKey] = ec_useState(deviceKind === "android" ? "play" : "appstore");
  const [veoSlider, setVeoSlider] = ec_useState(BR_PLAN_ECON.pro.veoIncl);
  const [openPlan, setOpenPlan] = ec_useState("pro");

  const blended = BR_PLAN_ORDER.reduce((a, k) => a + brPlanPnL(k, storeKey).marginPct, 0) / BR_PLAN_ORDER.length;
  const allProfit = BR_PLAN_ORDER.every((k) => brPlanPnL(k, storeKey).margin > 0);

  // live calculator — Pro plan with adjustable Veo renders
  const calcPlan = { ...BR_PLAN_ECON.pro, veoIncl: veoSlider };
  const calcCogs = brPlanCOGS(calcPlan);
  const calcNet = brNetRevenue(calcPlan.price, storeKey);
  const calcMargin = calcNet - calcCogs;
  const breakEvenVeo = Math.floor((calcNet - (calcPlan.posts * (BR_UNIT.postOps + BR_UNIT.caption) + calcPlan.campaigns * BR_UNIT.hookGen + calcPlan.copilot * BR_UNIT.copilotMsg)) / BR_UNIT.veoClip);

  const costCards = [
    { k: "veo",   v: brUSD(BR_UNIT.veoClip),    l: en ? "Veo 3.1 render" : "Render Veo 3.1", s: "6s · $0.15/s",      hot: true },
    { k: "hook",  v: brUSD(BR_UNIT.hookGen),    l: en ? "5-hook gen" : "Generasi 5 hook",     s: "Claude Sonnet 4.6" },
    { k: "cap",   v: brUSD(BR_UNIT.caption),    l: en ? "Caption adapt" : "Adaptasi caption", s: "Claude Haiku 4.5" },
    { k: "copi",  v: brUSD(BR_UNIT.copilotMsg), l: en ? "Copilot reply" : "Balasan Copilot",  s: "Claude Sonnet 4.6" },
    { k: "post",  v: brUSD(BR_UNIT.postOps),    l: en ? "Publish + CDN" : "Publikasi + CDN",   s: en ? "transcode·deliver" : "transcode·kirim" },
    { k: "canvas",v: "~$0.00",                  l: en ? "Canvas render" : "Render canvas",     s: en ? "in-browser · free" : "di-browser · gratis", good: true },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", background: theme.canvas }}>
      <BrAppHeader title={en ? "Unit economics" : "Unit ekonomi"} subtitle={en ? "OWNER · MARGIN MODEL" : "OWNER · MODEL MARGIN"} onBack={onBack} />
      <div style={{ flex: 1, overflow: "auto", padding: "14px 14px 28px" }}>

        {/* hero verdict */}
        <GlassPanel theme={theme} padding={16} tone="solid">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div>
              <div className="br-display br-num" style={{ fontSize: 32, color: allProfit ? theme.pos : theme.neg, letterSpacing: -1, lineHeight: 1 }}>{brPct(blended)}</div>
              <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1, marginTop: 5, textTransform: "uppercase" }}>{en ? "avg net margin" : "rata-rata margin net"}</div>
            </div>
            <GlassChip theme={theme} color={allProfit ? theme.pos : theme.neg}>
              <span style={{ width: 5, height: 5, borderRadius: 99, background: allProfit ? theme.pos : theme.neg }} />
              {allProfit ? (en ? "All plans profit" : "Semua plan untung") : (en ? "Plan underwater" : "Plan rugi")}
            </GlassChip>
          </div>
          <div className="br-sans" style={{ fontSize: 11.5, color: theme.ink2, marginTop: 12, lineHeight: 1.5 }}>
            {en
              ? "After the store cut and every AI/API call. Veo video is the cost driver — included renders are capped; overflow uses the free canvas renderer."
              : "Setelah potongan store & semua panggilan AI/API. Video Veo paling mahal — render bawaan dibatasi; sisanya pakai canvas gratis."}
          </div>
        </GlassPanel>

        {/* store selector */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{en ? "BILLING CHANNEL" : "KANAL TAGIHAN"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
          {BR_STORE_ORDER.map((sk) => {
            const s = BR_COST.store[sk]; const on = sk === storeKey;
            return (
              <button key={sk} onClick={() => setStoreKey(sk)} className="br-press" style={{
                border: `1px solid ${on ? theme.brand : theme.hair}`, background: on ? theme.brand + "12" : theme.glassHi, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                borderRadius: 12, padding: "9px 11px",
              }}>
                <div className="br-sans" style={{ fontSize: 12, fontWeight: 700, color: on ? theme.brand : theme.ink }}>{en ? s.label_en : s.label_id}</div>
                <div className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.3, marginTop: 2, textTransform: "uppercase" }}>{en ? s.note_en : s.note_id}</div>
              </button>
            );
          })}
        </div>

        {/* cost inputs */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "18px 4px 8px" }}>{en ? "WHAT EACH CALL COSTS" : "BIAYA TIAP PANGGILAN"}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
          {costCards.map((c) => (
            <GlassPanel key={c.k} theme={theme} padding={11} style={{ borderColor: c.hot ? theme.warn + "55" : c.good ? theme.pos + "44" : theme.hair }}>
              <div className="br-display br-num" style={{ fontSize: 15, color: c.hot ? theme.warn : c.good ? theme.pos : theme.ink, letterSpacing: -0.4, lineHeight: 1 }}>{c.v}</div>
              <div className="br-sans" style={{ fontSize: 10.5, color: theme.ink2, fontWeight: 600, marginTop: 6, lineHeight: 1.15 }}>{c.l}</div>
              <div className="br-mono" style={{ fontSize: 7.5, color: theme.ink3, letterSpacing: 0.3, marginTop: 3, textTransform: "uppercase" }}>{c.s}</div>
            </GlassPanel>
          ))}
        </div>

        {/* per-plan P&L */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "20px 4px 8px" }}>{en ? "PER-PLAN P&L · MONTHLY" : "P&L PER PLAN · BULANAN"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {BR_PLAN_ORDER.map((pk) => {
            const plan = BR_PLAN_ECON[pk]; const pnl = brPlanPnL(pk, storeKey); const isOpen = openPlan === pk;
            const pos = pnl.margin > 0;
            return (
              <div key={pk} style={{ background: theme.glassHi, border: `1px solid ${isOpen ? theme.brand + "55" : theme.hair}`, borderRadius: 16, overflow: "hidden" }}>
                <button onClick={() => setOpenPlan(isOpen ? null : pk)} className="br-press" style={{ width: "100%", textAlign: "left", border: "none", background: "transparent", cursor: "pointer", fontFamily: "inherit", padding: 13, display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="br-sans" style={{ fontSize: 14, fontWeight: 700, color: theme.ink, textTransform: "capitalize" }}>{pk}{plan.fairUse ? <span className="br-mono" style={{ fontSize: 8, color: theme.ink3, letterSpacing: 0.4, marginLeft: 6, textTransform: "uppercase" }}>{en ? "fair-use" : "wajar"}</span> : null}</div>
                    <div className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.3, marginTop: 2, textTransform: "uppercase" }}>{brUSD(plan.price)} · {plan.veoIncl} {en ? "veo" : "veo"} · {plan.posts === 1500 ? "∞" : plan.posts} {en ? "posts" : "post"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="br-display br-num" style={{ fontSize: 17, color: pos ? theme.pos : theme.neg, letterSpacing: -0.4, lineHeight: 1 }}>{brUSD(pnl.margin)}</div>
                    <div className="br-mono" style={{ fontSize: 8, color: theme.ink3, letterSpacing: 0.4, marginTop: 2, textTransform: "uppercase" }}>{brPct(pnl.marginPct)} {en ? "margin" : "margin"}</div>
                  </div>
                  <span style={{ color: theme.ink3, fontSize: 13, transform: isOpen ? "rotate(90deg)" : "none", transition: "transform 180ms" }}>›</span>
                </button>
                {isOpen && (
                  <div style={{ padding: "0 14px 14px", animation: "protoFadeIn 200ms ease both" }}>
                    {[
                      { l: en ? "Gross price" : "Harga kotor", v: pnl.gross, c: theme.ink },
                      { l: en ? "− Store fee" : "− Biaya store", v: -pnl.storeFee, c: theme.neg },
                      { l: en ? "= Net revenue" : "= Pendapatan net", v: pnl.net, c: theme.ink, bold: true },
                      { l: en ? "− Veo renders" : "− Render Veo", v: -(plan.veoIncl * BR_UNIT.veoClip), c: theme.neg, sub: `${plan.veoIncl} × ${brUSD(BR_UNIT.veoClip)}` },
                      { l: en ? "− Text AI + publish" : "− AI teks + publikasi", v: -(pnl.cogs - plan.veoIncl * BR_UNIT.veoClip), c: theme.neg },
                      { l: en ? "= Margin" : "= Margin", v: pnl.margin, c: pos ? theme.pos : theme.neg, bold: true },
                    ].map((r, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0", borderTop: r.bold ? `1px solid ${theme.hair2}` : "none" }}>
                        <span className="br-sans" style={{ fontSize: r.bold ? 12.5 : 12, color: r.bold ? theme.ink : theme.ink2, fontWeight: r.bold ? 700 : 500 }}>{r.l}{r.sub ? <span className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, marginLeft: 6 }}>{r.sub}</span> : null}</span>
                        <span className="br-mono br-num" style={{ fontSize: r.bold ? 13 : 12, color: r.c, fontWeight: 700 }}>{brUSD(r.v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* live calculator */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "20px 4px 8px" }}>{en ? "LIVE CALCULATOR · PRO PLAN" : "KALKULATOR LANGSUNG · PRO"}</div>
        <GlassPanel theme={theme} padding={15} tone="solid">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.8, textTransform: "uppercase" }}>{en ? "Veo renders included" : "Render Veo termasuk"}</div>
              <div className="br-display br-num" style={{ fontSize: 26, color: theme.ink, letterSpacing: -0.8, lineHeight: 1, marginTop: 3 }}>{veoSlider}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="br-display br-num" style={{ fontSize: 22, color: calcMargin > 0 ? theme.pos : theme.neg, letterSpacing: -0.6, lineHeight: 1 }}>{brUSD(calcMargin)}</div>
              <div className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.4, marginTop: 3, textTransform: "uppercase" }}>{en ? "margin / user" : "margin / user"}</div>
            </div>
          </div>
          <input type="range" min={0} max={90} value={veoSlider} onChange={(e) => setVeoSlider(parseInt(e.target.value, 10))} style={{ width: "100%", marginTop: 14, accentColor: theme.brand }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.4, textTransform: "uppercase" }}>{en ? "COGS" : "COGS"} {brUSD(calcCogs)}</span>
            <span className="br-mono" style={{ fontSize: 9, color: calcMargin > 0 ? theme.pos : theme.neg, letterSpacing: 0.4, textTransform: "uppercase" }}>{en ? "break-even" : "impas"} ≈ {breakEvenVeo} {en ? "renders" : "render"}</span>
          </div>
        </GlassPanel>

        {/* top-up economics */}
        <div className="br-eyebrow" style={{ color: theme.ink3, padding: "20px 4px 8px" }}>{en ? "VEO CREDIT TOP-UPS" : "TOP-UP KREDIT VEO"}</div>
        <GlassPanel theme={theme} padding={4} tone="solid">
          {BR_VEO_PACKS.map((p, i) => {
            const pn = brPackPnL(p, storeKey);
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 11px", borderTop: i ? `1px solid ${theme.hair2}` : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: theme.brand + "16", border: `1px solid ${theme.hair}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="br-display br-num" style={{ fontSize: 12, color: theme.brand, fontWeight: 700 }}>{p.renders}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="br-sans" style={{ fontSize: 12.5, color: theme.ink, fontWeight: 600 }}>{p.renders} {en ? "renders" : "render"} · {brUSD(p.price)}</div>
                  <div className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.3, marginTop: 2, textTransform: "uppercase" }}>{brUSD(pn.perRender)}/{en ? "render retail" : "render"} · {en ? "cost" : "biaya"} {brUSD(BR_UNIT.veoClip)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="br-mono br-num" style={{ fontSize: 12, color: pn.margin > 0 ? theme.pos : theme.neg, fontWeight: 700 }}>{brUSD(pn.margin)}</div>
                  <div className="br-mono" style={{ fontSize: 8, color: theme.ink3, letterSpacing: 0.3, marginTop: 2, textTransform: "uppercase" }}>{brPct(pn.marginPct)}</div>
                </div>
              </div>
            );
          })}
        </GlassPanel>

        <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.4, textAlign: "center", marginTop: 18, lineHeight: 1.7, textTransform: "uppercase" }}>{BR_COST.sources}</div>
      </div>
    </div>
  );
}

Object.assign(window, {
  BR_COST, BR_UNIT, BR_PLAN_ECON, BR_PLAN_ORDER, BR_VEO_PACKS, BR_STORE_ORDER,
  brClaudeCost, brVeoCost, brPlanCOGS, brNetRevenue, brPlanPnL, brPackPnL, brUSD, brPct,
  BrIAPSheet, BrEconomics,
});
