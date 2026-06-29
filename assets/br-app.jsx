// BrandReel — App: tweaks, router wiring, device frame, tweaks panel, mount.

const { useState: ap_useState, useEffect: ap_useEffect, useRef: ap_useRef, useMemo: ap_useMemo, useCallback: ap_useCallback } = React;

const BR_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "persona": "brand",
  "lang": "en",
  "theme": "mist",
  "accent": "violet",
  "scenario": "viral",
  "time": "pagi",
  "appMode": "app",
  "device": "iphone",
  "statusBar": true,
  "autopost": true,
  "demoMode": false,
  "veoBonus": 0
}/*EDITMODE-END*/;

const TAB_TO_ROUTE = {
  home:     { name: "home" },
  insights: { name: "insights" },
  create:   { name: "create" },
  inbox:    { name: "inbox" },
  profile:  { name: "profile" },
};
const ROUTE_TO_TAB = {
  home: "home", insights: "insights", inbox: "inbox", profile: "profile",
  create: "create", generating: "create", copilot: "inbox",
  detail: "home", publishing: "home", setup: "profile", schedule: "home", economics: "profile",
};
const NO_NAV = ["onboard", "login", "generating", "copilot"];

function App() {
  const [t, setTweak] = useTweaks(BR_TWEAK_DEFAULTS);
  const persona  = BR_PERSONAS[t.persona]   || BR_PERSONAS.brand;
  const scenario = BR_SCENARIOS[t.scenario] || BR_SCENARIOS.viral;
  const baseTheme = BR_THEMES[t.theme] || BR_THEMES.mist;
  const accentSet = BR_ACCENTS[t.accent] || BR_ACCENTS.violet;
  const theme    = ap_useMemo(() => ({ ...baseTheme, ...accentSet }), [baseTheme, accentSet]);
  const now = useLiveClock(t.time);

  const router = useRouter([{ name: "onboard" }]);

  // toast
  const [toast, setToast] = ap_useState(null);
  const fireToast = ap_useCallback((obj) => setToast({ ...obj, id: Date.now() }), []);
  ap_useEffect(() => { if (!toast) return; const id = setTimeout(() => setToast(null), 6500); return () => clearTimeout(id); }, [toast]);

  // sync dark mode bg + body background (app mode fills the viewport)
  ap_useEffect(() => {
    if (t.theme === "dark") document.documentElement.dataset.theme = "dark";
    else document.documentElement.removeAttribute("data-theme");
    document.body.style.background = t.appMode === "preview" ? "" : theme.canvas;
    return () => {};
  }, [t.theme, t.appMode, theme.canvas]);

  // persona change → return to home if mid-app
  const personaKey = persona.id;
  const prevPersona = ap_useRef(personaKey);
  ap_useEffect(() => {
    if (prevPersona.current !== personaKey) {
      prevPersona.current = personaKey;
      const cur = router.top.name;
      if (!["onboard", "login"].includes(cur)) router.goto({ name: "home" });
    }
  }, [personaKey, router]);

  // demo auto-walk
  ap_useEffect(() => {
    if (!t.demoMode) return;
    const seq = [
      { name: "home" }, { name: "schedule" }, { name: "create" }, { name: "generating" },
      { name: "detail", id: "c-bamboo-tb" }, { name: "publishing", id: "c-water-bottle" },
      { name: "insights" }, { name: "inbox" }, { name: "profile" }, { name: "home" },
    ];
    let i = 0;
    const id = setInterval(() => {
      if (i >= seq.length) { setTweak("demoMode", false); return; }
      router.goto(seq[i]); i++;
    }, 3200);
    router.goto(seq[0]); i++;
    return () => clearInterval(id);
  }, [t.demoMode]);

  const setPersonaId = ap_useCallback((pid) => setTweak("persona", pid), [setTweak]);

  const ctx = ap_useMemo(() => ({
    theme, lang: t.lang, persona, scenario, time: t.time, deviceKind: t.device,
    autopost: t.autopost, veoBonus: t.veoBonus || 0, setPersonaId, setTweak, fireToast,
  }), [theme, t.lang, persona, scenario, t.time, t.device, t.autopost, t.veoBonus, setPersonaId, setTweak, fireToast]);

  function renderRoute(route) {
    if (!route) return null;
    switch (route.name) {
      case "onboard":    return <BrOnboard onDone={() => router.reset({ name: "home" })} onLogin={() => router.reset({ name: "login" })} />;
      case "login":      return <BrLogin onSuccess={() => router.reset({ name: "home" })} />;
      case "home":       return <BrHome now={now} onNavigate={(r) => router.push(r)} />;
      case "create":     return <BrCreate onBack={() => router.goto({ name: "home" })} onGenerate={() => router.push({ name: "generating" })} />;
      case "generating": return <BrGenerating onDone={() => router.replace({ name: "detail", id: "__new" })} onBack={() => router.back()} />;
      case "detail":     return <BrDetail id={route.id} now={now} onBack={() => router.back()} onNavigate={(r) => router.push(r)} />;
      case "publishing": return <BrPublishing id={route.id} onBack={() => router.back()} onNavigate={(r) => router.goto(r)} />;
      case "insights":   return <BrInsights onNavigate={(r) => router.push(r)} />;
      case "schedule":   return <BrSchedule now={now} onBack={() => router.back()} onNavigate={(r) => router.push(r)} />;
      case "inbox":      return <BrInbox onNavigate={(r) => router.push(r)} />;
      case "copilot":    return <BrCopilot onBack={() => router.back()} />;
      case "profile":    return <BrProfile onBack={() => router.goto({ name: "home" })} onLogout={() => router.reset({ name: "onboard" })} onNavigate={(r) => router.push(r)} />;
      case "setup":      return <BrSetup onBack={() => router.back()} />;
      case "economics":  return <BrEconomics onBack={() => router.back()} />;
      default:           return null;
    }
  }

  const topName = router.top.name;
  const showBottomNav = !NO_NAV.includes(topName);
  const activeTab = ROUTE_TO_TAB[topName] || "home";
  function handleTab(tabId) {
    if (tabId === "create") { router.push({ name: "create" }); return; }
    const r = TAB_TO_ROUTE[tabId]; if (r) router.goto(r);
  }

  const isTablet = t.device === "tablet";
  const phoneW = 384, phoneH = 826, tabletW = 720, tabletH = 980;
  const W = isTablet ? tabletW : phoneW;
  const H = isTablet ? tabletH : phoneH;
  const dark = t.theme === "dark";

  const showStatusBar = t.statusBar && !["onboard", "login"].includes(topName);
  const stageBg = dark
    ? "linear-gradient(170deg, #181922 0%, #101117 100%)"
    : "linear-gradient(170deg, #EDEFF4 0%, #E2E5EC 100%)";

  function frameInner() {
    return <DeviceContents showBottomNav={showBottomNav} router={router} renderRoute={renderRoute} activeTab={activeTab} handleTab={handleTab} toast={toast} setToast={setToast} deviceKind={t.device} theme={theme} />;
  }

  // ── Responsive app mode (default): one app, adaptive across phone/tablet/desktop ──
  if (t.appMode !== "preview") {
    return (
      <BrCtx.Provider value={ctx}>
        <BrResponsiveApp router={router} renderRoute={renderRoute} theme={theme} persona={persona} lang={t.lang} handleTab={handleTab} toast={toast} setToast={setToast} />
        <BrTweaksPanel t={t} setTweak={setTweak} fireToast={fireToast} router={router} />
      </BrCtx.Provider>
    );
  }

  // ── Device-preview mode: bezel stage (optional demo view) ──
  return (
    <BrCtx.Provider value={ctx}>
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
        background: stageBg,
        padding: "56px 24px 34px", boxSizing: "border-box",
      }}>
        <div style={{ position: "relative" }}>
          <BrandStatusBar show={showStatusBar} persona={persona} lang={t.lang} autopost={t.autopost} now={now} dark={dark} />
          <div style={{ width: W, height: H, position: "relative" }}>
            {t.device === "tablet" ? (
              <IPadDevice width={W} height={H} dark={dark} background={theme.canvas}>
                {frameInner()}
              </IPadDevice>
            ) : t.device === "android" ? (
              <AndroidDevice width={W} height={H} dark={dark} background={theme.canvas}>
                {frameInner()}
              </AndroidDevice>
            ) : (
              <IOSDevice width={W} height={H} dark={dark} background={theme.canvas} safeAreaTop={0}>
                {frameInner()}
              </IOSDevice>
            )}
          </div>
        </div>
        <BrTweaksPanel t={t} setTweak={setTweak} fireToast={fireToast} router={router} />
      </div>
    </BrCtx.Provider>
  );
}

function DeviceContents({ showBottomNav, router, renderRoute, activeTab, handleTab, toast, setToast, deviceKind, theme }) {
  const ios = deviceKind === "iphone";
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", background: theme.canvas }}>
      {ios && <div style={{ height: 50, flexShrink: 0, background: theme.canvas }} />}
      <div style={{ flex: 1, minHeight: 0, position: "relative", overflow: "hidden" }}>
        <RouteStage stack={router.stack} transition={router.transition} renderRoute={renderRoute} />
        <PushToast toast={toast} onDismiss={() => setToast(null)} onTap={(tt) => { setToast(null); if (tt.route) router.push(tt.route); }} />
      </div>
      {showBottomNav && <div style={{ flexShrink: 0, paddingBottom: ios ? 16 : 0, background: "transparent" }}><BottomNav activeTab={activeTab} onTab={handleTab} /></div>}
      {!showBottomNav && ios && <div style={{ height: 20, flexShrink: 0, background: theme.canvas }} />}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// TWEAKS PANEL
// ──────────────────────────────────────────────────────────────
function BrTweaksPanel({ t, setTweak, fireToast, router }) {
  const en = t.lang === "en";
  function notifLive() {
    fireToast({ tag: "LIVE", color: "#1FA971", source: "BrandReel", title: en ? "Bamboo toothbrush is live" : "Sikat gigi bambu tayang", body: en ? "Hook 3 leading · 1.2M views in 2h on TikTok." : "Hook 3 memimpin · 1,2 jt tayangan 2 jam di TikTok.", route: { name: "detail", id: "c-bamboo-tb" } });
  }
  function notifRate() {
    fireToast({ tag: "RATE", color: "#E0A11B", source: "BrandReel", title: en ? "TikTok queue staggered" : "Antrean TikTok dijeda", body: en ? "Bamboo bottle posting 1/30m — clear of shadow-ban." : "Botol bambu dikirim 1/30m — aman dari shadow-ban.", route: { name: "publishing", id: "c-water-bottle" } });
  }
  function notifFail() {
    fireToast({ tag: "FAIL", color: "#E0413B", source: "BrandReel", title: en ? "Beeswax wrap · IG needs attention" : "Beeswax wrap · IG perlu dicek", body: en ? "Instagram rejected aspect ratio. Auto-fix ready." : "Instagram menolak rasio. Auto-fix siap.", route: { name: "detail", id: "c-beeswax" } });
  }
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label={en ? "Layout" : "Tata letak"}>
        <TweakRadio label={en ? "Mode" : "Mode"} value={t.appMode} onChange={(v) => setTweak("appMode", v)} options={[{ value: "app", label: en ? "Responsive" : "Responsif" }, { value: "preview", label: en ? "Device" : "Perangkat" }]} />
        {t.appMode === "preview" && (
          <TweakRadio label={en ? "Form factor" : "Bentuk"} value={t.device} onChange={(v) => setTweak("device", v)} options={[{ value: "iphone", label: "iPhone" }, { value: "android", label: "Android" }, { value: "tablet", label: "iPad" }]} />
        )}
      </TweakSection>

      <TweakSection label="Persona · RBAC">
        <TweakSelect label={en ? "Account" : "Akun"} value={t.persona} onChange={(v) => setTweak("persona", v)}
          options={BR_PERSONA_ORDER.map((id) => ({ value: id, label: (t.lang === "en" ? BR_PERSONAS[id].role_en : BR_PERSONAS[id].role_id) + " · " + BR_PERSONAS[id].plan_label }))} />
      </TweakSection>

      <TweakSection label={en ? "Language & theme" : "Bahasa & tema"}>
        <TweakRadio label={en ? "Language" : "Bahasa"} value={t.lang} onChange={(v) => setTweak("lang", v)} options={[{ value: "en", label: "EN" }, { value: "id", label: "ID" }]} />
        <TweakSelect label={en ? "Glass theme" : "Tema kaca"} value={t.theme} onChange={(v) => setTweak("theme", v)}
          options={[{ value: "mist", label: "Mist · cool" }, { value: "paper", label: "Paper · white" }, { value: "sand", label: "Sand · warm" }, { value: "dark", label: "Night · dark" }]} />
        <TweakColor label={en ? "Accent" : "Aksen"} value={BR_ACCENTS[t.accent] ? BR_ACCENTS[t.accent].brand : "#6A5AF0"}
          onChange={(hex) => { const k = BR_ACCENT_ORDER.find((id) => BR_ACCENTS[id].brand.toLowerCase() === String(hex).toLowerCase()); if (k) setTweak("accent", k); }}
          options={BR_ACCENT_ORDER.map((id) => BR_ACCENTS[id].brand)} />
      </TweakSection>

      <TweakSection label={en ? "Account state" : "Kondisi akun"}>
        <TweakRadio label={en ? "Momentum" : "Momentum"} value={t.scenario} onChange={(v) => setTweak("scenario", v)}
          options={BR_SCENARIO_ORDER.map((id) => ({ value: id, label: t.lang === "en" ? BR_SCENARIOS[id].label_en : BR_SCENARIOS[id].label_id }))} />
        <TweakRadio label={en ? "Time" : "Waktu"} value={t.time} onChange={(v) => setTweak("time", v)}
          options={BR_TIME_ORDER.map((id) => ({ value: id, label: id === "pagi" ? (en ? "AM" : "Pagi") : id === "siang" ? (en ? "Mid" : "Siang") : (en ? "PM" : "Malam") }))} />
      </TweakSection>

      <TweakSection label={en ? "Demo controls" : "Kontrol demo"}>
        <TweakToggle label={en ? "Auto-walkthrough" : "Demo otomatis"} value={t.demoMode} onChange={(v) => setTweak("demoMode", v)} />
        <TweakToggle label={en ? "Status strip" : "Status strip"} value={t.statusBar} onChange={(v) => setTweak("statusBar", v)} />
        <TweakToggle label={en ? "Auto-post" : "Auto-post"} value={t.autopost} onChange={(v) => setTweak("autopost", v)} />
        <TweakButton label={en ? "▲ Post is live" : "▲ Post tayang"} onClick={notifLive} />
        <TweakButton label={en ? "▲ Rate-limit queue" : "▲ Antrean rate-limit"} onClick={notifRate} />
        <TweakButton label={en ? "▲ Failure alert" : "▲ Notif gagal"} onClick={notifFail} />
        <TweakButton label={en ? "↺ Restart onboarding" : "↺ Ulang onboarding"} onClick={() => router.reset({ name: "onboard" })} secondary />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
