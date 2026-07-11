// Detail kampanye — porting BrDetail dari prototype br-screens-campaign.jsx.
// Fase 3: bila kampanye baru dibuat via backend (Fase 3), skrip hook & caption
// datang dari Claude nyata (/campaigns/:id/generate + /adapt-caption).
// Pratinjau video tetap kartu gradasi — render Veo asli disambung di layar
// terpisah begitu worker/render selesai (lihat apps/api/src/worker.ts).

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBr, brStatusMeta } from "@/context/BrContext";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { BR_HOOKS, BR_PLATFORMS, type HookId, type PlatformId } from "@/theme/tokens";
import { brBuildCaption, type Campaign, type PreflightRow } from "@/data/campaigns";
import { getPendingCampaign, type GenerateResult } from "@/data/pendingCampaign";
import { apiGet, apiPost } from "@/lib/api";
import { Alert } from "@/lib/alert";
import { toViewCampaign, hooksToGenerateResult, type ApiCampaign } from "@/lib/campaignView";
import { BrAppShell, BrAppHeader, FloatingActionBar, GhostButton, PrimaryButton } from "@/components/br/AppChrome";
import { GlassChip, GlassPanel } from "@/components/br/Glass";
import { ScheduleSheet } from "@/components/br/ScheduleSheet";
import { VideoHero } from "@/components/br/VideoHero";
import { PlatformPicker, type RenderBadgeState } from "@/components/br/PlatformPicker";
import { HookPicker } from "@/components/br/HookPicker";
import { PreflightPanel } from "@/components/br/PreflightPanel";
import { FONT } from "@/components/br/fonts";

interface RenderRow {
  id: string;
  hookId: string | null;
  ratio: string;
  state: "queued" | "processing" | "ready" | "failed";
  storageUrl: string | null;
  durationS: number | null;
  error: string | null;
}

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color }}>
      {children}
    </Text>
  );
}

export default function DetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, lang, t, persona } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDesktop = useBreakpoint() === "desktop";

  const isNew = id === "__new";
  const pending = isNew ? getPendingCampaign() : null;

  // Kampanye baru (belum lama dibuat): pakai data optimistik dari create.tsx.
  // Kampanye lain: ambil dari backend nyata (GET /campaigns/:id) — bukan
  // BR_CAMPAIGNS dummy lagi.
  const [fetched, setFetched] = useState<{ campaign: Campaign; ai: GenerateResult | null } | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (isNew || !id) return;
    let alive = true;
    apiGet(`/campaigns/${id}`)
      .then((api: ApiCampaign) => {
        if (!alive) return;
        setFetched({ campaign: toViewCampaign(api), ai: hooksToGenerateResult(api.hooks) });
      })
      .catch(() => { if (alive) setLoadError(true); });
    return () => { alive = false; };
  }, [id, isNew]);

  const c: Campaign | null = isNew ? (pending?.campaign ?? null) : fetched?.campaign ?? null;
  const camPlatforms = (c && Object.keys(c.platforms).length
    ? Object.keys(c.platforms)
    : persona.platforms) as PlatformId[];

  const [hook, setHook] = useState<HookId>("h2");
  const [plat, setPlat] = useState<PlatformId | null>(null);
  const [schedOpen, setSchedOpen] = useState(false);

  useEffect(() => {
    if (!c) return;
    setHook(c.topHook ?? "h2");
    setPlat((camPlatforms[0] as PlatformId) ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c?.id]);

  // Hook AI nyata: dari hasil generate baru saja (kampanye "__new") atau dari
  // hooks tersimpan di backend (kampanye yang sudah ada).
  const aiResult: GenerateResult | null = isNew ? (pending?.result ?? null) : fetched?.ai ?? null;
  const hasAI = !!aiResult;
  const aiHook = aiResult?.hooks[hook];
  const backendId = isNew
    ? (pending?.backendId && pending.backendId !== "pending" ? pending.backendId : null)
    : id ?? null;

  // NB: hook harus dipanggil tanpa syarat (Rules of Hooks) — c/plat bisa
  // null sebentar saat masih memuat, jadi cabang di dalam body-nya, bukan
  // dengan return awal sebelum hook ini.
  const fallbackCap = useMemo(
    () => (c && plat ? brBuildCaption(c, hook, plat, lang) : { text: "", len: 0, max: 1 }),
    [c, hook, plat, lang]
  );
  const [capCache, setCapCache] = useState<Record<string, { text: string; len: number; max: number }>>({});
  const cacheKey = `${hook}-${plat}`;
  const cachedCap = capCache[cacheKey];
  const capLoading = hasAI && !!backendId && !!aiHook && !cachedCap;
  const cap = cachedCap ?? fallbackCap;

  useEffect(() => {
    if (!plat || !hasAI || !backendId || !aiHook || capCache[cacheKey]) return;
    let alive = true;
    apiPost(`/campaigns/${backendId}/adapt-caption`, { hookId: aiHook.id, platform: plat, lang })
      .then((res) => { if (alive) setCapCache((m) => ({ ...m, [cacheKey]: res })); })
      .catch(() => { if (alive) setCapCache((m) => ({ ...m, [cacheKey]: fallbackCap })); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, hasAI, backendId, plat]);

  // Render video Veo nyata (Bab 03) — daftar render campaign ini, di-poll
  // selama ada yang masih queued/processing (worker.ts yang benar-benar
  // memprosesnya di background).
  const [renders, setRenders] = useState<RenderRow[] | null>(null);
  const [generatingRender, setGeneratingRender] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Koneksi sosmed akun nyata (Bab 04) — dipakai buat cek pra-kirim beneran,
  // bukan checklist statis ok:true semua (lihat data/campaigns.ts lama).
  const [connections, setConnections] = useState<{ platform: string; status: string }[] | null>(null);
  useEffect(() => {
    apiGet("/connections").then(setConnections).catch(() => setConnections([]));
  }, []);

  const loadRenders = useCallback(async () => {
    if (!backendId) return;
    try { setRenders(await apiGet(`/campaigns/${backendId}/renders`)); }
    catch { /* biarkan state sebelumnya kalau gagal — jangan reset ke kosong */ }
  }, [backendId]);

  useEffect(() => { loadRenders(); }, [loadRenders]);

  useEffect(() => {
    if (!renders?.some((r) => r.state === "queued" || r.state === "processing")) return;
    const timer = setInterval(loadRenders, 4000);
    return () => clearInterval(timer);
  }, [renders, loadRenders]);

  const activeRatio = plat ? BR_PLATFORMS[plat].ratio : null;
  const activeRender = renders?.find((r) => r.ratio === activeRatio) ?? null;

  const player = useVideoPlayer(
    activeRender?.state === "ready" && activeRender.storageUrl ? activeRender.storageUrl : null,
    (p) => { p.loop = true; }
  );
  useEffect(() => {
    if (activeRender?.state === "ready") player.play();
  }, [activeRender?.id, activeRender?.state, player]);

  // Render dikunci per rasio, bukan per platform — TikTok/IG/YouTube yang
  // sama-sama 9:16 berbagi satu render. "Buat semua video" cukup render tiap
  // rasio YANG BEDA sekali jalan, bukan sekali per platform.
  function ratioOf(pid: PlatformId) { return BR_PLATFORMS[pid].ratio; }
  function renderForRatio(ratio: string) { return renders?.find((r) => r.ratio === ratio) ?? null; }
  const neededRatios = useMemo(
    () => Array.from(new Set(camPlatforms.map(ratioOf))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [camPlatforms]
  );

  async function handleGenerateAllRenders() {
    if (!backendId) return;
    const missing = neededRatios.filter((ratio) => {
      const s = renderForRatio(ratio)?.state;
      return s !== "ready" && s !== "queued" && s !== "processing";
    });
    if (!missing.length) return;
    setGeneratingRender(true);
    try {
      const results = await Promise.allSettled(
        missing.map((ratio) => apiPost(`/campaigns/${backendId}/renders`, { hookId: aiHook?.id, ratio }))
      );
      await loadRenders();
      if (results.every((r) => r.status === "rejected")) {
        Alert.alert(
          lang === "en" ? "Couldn't start render" : "Gagal mulai render",
          lang === "en" ? "None of the videos could start rendering." : "Gak ada video yang berhasil mulai di-render."
        );
      }
    } finally {
      setGeneratingRender(false);
    }
  }

  function statusFor(pid: PlatformId): RenderBadgeState {
    const r = renderForRatio(ratioOf(pid));
    if (!r) return null;
    if (r.state === "ready") return "ready";
    if (r.state === "failed") return "failed";
    return "pending";
  }

  if (!c || !plat) {
    return (
      <BrAppShell theme={theme} density="soft">
        <View style={{ height: insets.top }} />
        <BrAppHeader title={lang === "en" ? "Loading…" : "Memuat…"} subtitle="" onBack={() => router.back()} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          {loadError ? (
            <Text style={{ fontFamily: FONT.sans, fontSize: 13, color: theme.ink2, textAlign: "center" }}>
              {lang === "en" ? "Couldn't load this campaign." : "Kampanye ini gagal dimuat."}
            </Text>
          ) : (
            <ActivityIndicator color={theme.brand} />
          )}
        </View>
      </BrAppShell>
    );
  }

  const platMeta = BR_PLATFORMS[plat];
  const hk = BR_HOOKS[hook];

  // Pra-kirim beneran — cuma dua hal yang bisa kita verifikasi nyata dari
  // sini: render video sudah siap, dan akun sudah connect ke platform
  // tujuan. Tidak ada baris rate-limit/duplikat/brand-voice fiktif lagi.
  const backendPlat = plat === "twitter" ? "x" : plat;
  const platConnection = connections?.find((cn) => cn.platform === backendPlat) ?? null;
  const preflight: PreflightRow[] = [
    {
      k: "format",
      ok: activeRender?.state === "ready",
      label_en: activeRender?.state === "ready" ? "Video render ready · aspect, duration, codec" : "Video not rendered yet",
      label_id: activeRender?.state === "ready" ? "Render video siap · rasio, durasi, codec" : "Video belum di-render",
    },
    {
      k: "token",
      ok: platConnection?.status === "active",
      label_en: platConnection?.status === "active" ? `${platMeta.name} connected · token active` : `Not connected to ${platMeta.name} yet`,
      label_id: platConnection?.status === "active" ? `${platMeta.name} terhubung · token aktif` : `Belum terhubung ke ${platMeta.name}`,
    },
  ];
  const allClear = preflight.every((r) => r.ok);
  const sm = brStatusMeta(c.status, theme, t);

  const previewAspect = platMeta.ratio === "9:16" ? 9 / 16 : platMeta.ratio === "1:1" ? 1 : 16 / 9;

  return (
    <BrAppShell theme={theme} density="soft">
      <View style={{ height: insets.top }} />
      <BrAppHeader
        title={c.product}
        subtitle={lang === "en" ? c.desc_en : c.desc_id}
        color={c.logoColor}
        onBack={() => router.back()}
        right={<GlassChip theme={theme} color={sm.color}>{sm.label}</GlassChip>}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 20 }}>
        {/* Desktop: video 50% lebar kiri, SEMUA panel lain (platform, sudut
            cerita, skrip, caption, pra-kirim) di kolom kanan — bukan
            ditumpuk di bawah, layar lebar sayang kalau semuanya full-width.
            Mobile/tablet: tetap ditumpuk berurutan seperti sebelumnya. */}
        <View style={{ flexDirection: isDesktop ? "row" : "column", gap: isDesktop ? 24 : 0, alignItems: "flex-start" }}>
          <View style={{ width: isDesktop ? "40%" : "100%" }}>
            <VideoHero
              theme={theme}
              lang={lang}
              activeRender={activeRender}
              previewAspect={previewAspect}
              hookColor={hk.color}
              logoColor={c.logoColor}
              plat={plat}
              ratioLabel={platMeta.ratio}
              durationLabel={`${hook === "h5" ? 4 : 5}s`}
              generatingRender={generatingRender}
              onBulkRender={handleGenerateAllRenders}
              onOpenModal={() => setVideoModalOpen(true)}
              player={player}
            />
          </View>

          <View style={{ width: isDesktop ? undefined : "100%", flex: isDesktop ? 1 : undefined }}>
            {/* Platform tujuan (rasio + status render) + info format */}
            <View style={{ flexDirection: "row", gap: 12, marginTop: isDesktop ? 0 : 14, alignItems: "flex-start" }}>
              <View style={{ flex: 1 }}>
                <PlatformPicker
                  theme={theme}
                  platforms={camPlatforms}
                  active={plat}
                  statusFor={statusFor}
                  onSelect={setPlat}
                />
              </View>
              <View style={{ gap: 6, minWidth: 112, paddingTop: 4 }}>
                {[
                  { l: lang === "en" ? "Aspect" : "Rasio", v: platMeta.ratio },
                  { l: lang === "en" ? "Duration" : "Durasi", v: `≤ ${platMeta.maxSec}s` },
                  { l: lang === "en" ? "Hashtags" : "Hashtag", v: `${platMeta.hashtags}` },
                ].map((r, i) => (
                  <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                    <Text style={{ fontFamily: FONT.mono, fontSize: 10.5, color: theme.ink3, letterSpacing: 0.4, textTransform: "uppercase" }}>{r.l}</Text>
                    <Text style={{ fontFamily: FONT.monoSemi, fontSize: 10.5, color: theme.ink2 }}>{r.v}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Pemilih sudut cerita — beda fungsi dari platform di atas (skrip, bukan tujuan) */}
            <View style={{ paddingHorizontal: 4, paddingTop: 18, paddingBottom: 8 }}>
              <Eyebrow color={theme.ink3}>{t.detail.hooks} · 5</Eyebrow>
            </View>
            <HookPicker theme={theme} lang={lang} active={hook} topHook={c.topHook} onSelect={setHook} />

            {/* Skrip hook AI (hanya bila hasil Claude nyata tersedia) */}
            {hasAI && aiHook?.script && (
              <>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingTop: 16, paddingHorizontal: 4, paddingBottom: 8 }}>
                  <Eyebrow color={theme.ink3}>{lang === "en" ? "HOOK SCRIPT" : "SKRIP HOOK"}</Eyebrow>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: hk.color }} />
                    <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9, color: hk.color, letterSpacing: 0.6 }}>CLAUDE</Text>
                  </View>
                </View>
                <GlassPanel theme={theme} padding={14} style={{ borderLeftWidth: 3, borderLeftColor: hk.color }}>
                  <Text style={{ fontFamily: FONT.sansSemi, fontSize: 14, color: theme.ink, lineHeight: 21 }}>“{aiHook.script}”</Text>
                </GlassPanel>
              </>
            )}

            {/* Caption teradaptasi */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingTop: 16, paddingHorizontal: 4, paddingBottom: 8 }}>
              <Eyebrow color={theme.ink3}>{lang === "en" ? "ADAPTED CAPTION" : "CAPTION TERADAPTASI"}</Eyebrow>
              <Text style={{ fontFamily: FONT.mono, fontSize: 9.5, color: cap.len > cap.max * 0.92 ? theme.warn : theme.ink3, letterSpacing: 0.4 }}>
                {capLoading ? "···" : `${cap.len}/${cap.max}`}
              </Text>
            </View>
            <GlassPanel theme={theme} padding={14}>
              {capLoading ? (
                <Text style={{ fontFamily: FONT.mono, fontSize: 10, color: theme.ink3, letterSpacing: 0.6, textTransform: "uppercase" }}>
                  {lang === "en" ? `Adapting for ${platMeta.name}…` : `Mengadaptasi untuk ${platMeta.name}…`}
                </Text>
              ) : (
                <Text style={{ fontFamily: FONT.sans, fontSize: 13, color: theme.ink, lineHeight: 20 }}>{cap.text}</Text>
              )}
            </GlassPanel>

            {/* Pra-kirim — baris gagal bisa diketuk buat langsung ke perbaikannya */}
            <PreflightPanel
              theme={theme}
              lang={lang}
              title={t.detail.preflight}
              rows={preflight}
              allClear={allClear}
              onFixRow={(k) => {
                if (k === "format") handleGenerateAllRenders();
                else if (k === "token") router.push("/profile");
              }}
            />
          </View>
        </View>
      </ScrollView>

      <FloatingActionBar>
        <GhostButton theme={theme} onPress={() => setSchedOpen(true)} style={{ paddingHorizontal: 16 }}>
          {t.detail.schedule}
        </GhostButton>
        <PrimaryButton theme={theme} disabled={!allClear} style={{ flex: 1 }} onPress={async () => {
          if (!backendId) { router.push(`/publishing/${c.id}`); return; }
          try {
            const res = await apiPost(`/campaigns/${backendId}/publish`, { hookId: aiHook?.id });
            const results = (res?.results ?? []) as { platform: string; ok: boolean; reason?: string }[];
            if (results.length && !results.some((r) => r.ok)) {
              // Semua platform ditolak pre-flight (belum connect, render belum
              // siap, dst) — jangan pindah ke layar Publishing seolah-olah ada
              // yang jalan, tunjukkan alasannya biar user tahu apa yang harus
              // dibenerin dulu.
              const lines = results.map((r) => `${r.platform}: ${r.reason ?? "gagal"}`).join("\n");
              Alert.alert(
                lang === "en" ? "Nothing was queued" : "Tidak ada yang terkirim",
                lang === "en" ? `All platforms rejected:\n${lines}` : `Semua platform ditolak:\n${lines}`
              );
              return;
            }
          } catch (e: any) {
            Alert.alert(lang === "en" ? "Couldn't post" : "Gagal posting", e.message ?? String(e));
            return;
          }
          router.push(`/publishing/${c.id}`);
        }}>
          {allClear
            ? `${t.detail.postNow} →`
            : (() => {
                const firstFailing = preflight.find((r) => !r.ok);
                if (firstFailing?.k === "format") return lang === "en" ? "Render video first" : "Render video dulu";
                if (firstFailing?.k === "token") return lang === "en" ? `Connect ${platMeta.name} first` : `Hubungkan ${platMeta.name} dulu`;
                return t.detail.postNow;
              })()}
        </PrimaryButton>
      </FloatingActionBar>
      <View style={{ height: insets.bottom }} />

      <ScheduleSheet
        visible={schedOpen}
        onClose={() => setSchedOpen(false)}
        campaign={c}
        platforms={camPlatforms}
        hook={hook}
        backendId={backendId}
        hookRowId={aiHook?.id ?? null}
        onScheduled={() => { setSchedOpen(false); router.push("/schedule"); }}
      />

      {activeRender?.state === "ready" && activeRender.storageUrl && (
        <Modal visible={videoModalOpen} transparent animationType="fade" onRequestClose={() => setVideoModalOpen(false)}>
          <Pressable onPress={() => setVideoModalOpen(false)}
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.92)", alignItems: "center", justifyContent: "center" }}>
            <Pressable onPress={(e) => e.stopPropagation()}
              style={{
                width: Math.min(Dimensions.get("window").width * 0.92, previewAspect >= 1 ? 640 : 420),
                aspectRatio: previewAspect, borderRadius: 16, overflow: "hidden",
              }}>
              <VideoView player={player} style={{ width: "100%", height: "100%" }} contentFit="contain" nativeControls />
            </Pressable>
            <Pressable onPress={() => setVideoModalOpen(false)}
              style={{
                position: "absolute", top: insets.top + 16, right: 20, width: 36, height: 36, borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center",
              }}>
              <Text style={{ color: "#fff", fontSize: 18 }}>✕</Text>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </BrAppShell>
  );
}
