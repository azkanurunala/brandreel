// Detail kampanye — porting BrDetail dari prototype br-screens-campaign.jsx.
// Fase 3: bila kampanye baru dibuat via backend (Fase 3), skrip hook & caption
// datang dari Claude nyata (/campaigns/:id/generate + /adapt-caption).
// Pratinjau video tetap kartu gradasi — render Veo asli disambung di layar
// terpisah begitu worker/render selesai (lihat apps/api/src/worker.ts).

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useVideoPlayer, VideoView } from "expo-video";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBr, brStatusMeta } from "@/context/BrContext";
import { BR_HOOKS, BR_HOOK_ORDER, BR_PLATFORMS, type HookId, type PlatformId } from "@/theme/tokens";
import { brBuildCaption, brPreflight, type Campaign } from "@/data/campaigns";
import { getPendingCampaign, type GenerateResult } from "@/data/pendingCampaign";
import { apiGet, apiPost } from "@/lib/api";
import { toViewCampaign, hooksToGenerateResult, type ApiCampaign } from "@/lib/campaignView";
import { BrAppShell, BrAppHeader, FloatingActionBar, GhostButton, PrimaryButton } from "@/components/br/AppChrome";
import { GlassChip, GlassPanel } from "@/components/br/Glass";
import { PlatformBadge } from "@/components/br/BrandGlyph";
import { ScheduleSheet } from "@/components/br/ScheduleSheet";
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

  async function handleGenerateRender() {
    if (!backendId || !activeRatio) return;
    setGeneratingRender(true);
    try {
      await apiPost(`/campaigns/${backendId}/renders`, { hookId: aiHook?.id, ratio: activeRatio });
      await loadRenders();
    } catch (e: any) {
      Alert.alert(lang === "en" ? "Couldn't start render" : "Gagal mulai render", e.message ?? String(e));
    } finally {
      setGeneratingRender(false);
    }
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
  const preflight = brPreflight(c, lang);
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
        {/* Pemilih sudut hook */}
        <View style={{ paddingHorizontal: 4, paddingBottom: 8 }}>
          <Eyebrow color={theme.ink3}>{t.detail.hooks} · 5</Eyebrow>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingBottom: 4 }}>
          {BR_HOOK_ORDER.map((hid) => {
            const h = BR_HOOKS[hid];
            const on = hid === hook;
            const isTop = hid === c.topHook;
            return (
              <Pressable key={hid} onPress={() => setHook(hid)}
                style={({ pressed }) => ({
                  borderWidth: 1, borderColor: on ? h.color : theme.hair,
                  backgroundColor: on ? h.color + "14" : theme.glassHi,
                  borderRadius: 13, paddingVertical: 9, paddingHorizontal: 12, minWidth: 124,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                  <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: h.color, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9, color: "#fff" }}>{h.glyph}</Text>
                  </View>
                  <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9, color: on ? h.color : theme.ink3, letterSpacing: 0.6 }}>
                    HOOK {h.num}
                  </Text>
                  {isTop && <Text style={{ marginLeft: "auto", fontSize: 10, color: theme.warn }}>★</Text>}
                </View>
                <Text style={{ fontFamily: FONT.sansSemi, fontSize: 12, color: theme.ink, marginTop: 6, lineHeight: 13 }}>
                  {lang === "en" ? h.key_en : h.key_id}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Pratinjau video + tab platform */}
        <View style={{ flexDirection: "row", gap: 12, marginTop: 14 }}>
          <View style={{ width: 108, aspectRatio: previewAspect, borderRadius: 14, overflow: "hidden" }}>
            {activeRender?.state === "ready" && activeRender.storageUrl ? (
              <VideoView player={player} style={{ width: "100%", height: "100%" }} contentFit="cover" nativeControls={false} />
            ) : (
              <LinearGradient
                colors={[hk.color, c.logoColor]}
                start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 1 }}
                style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
                <View style={{ position: "absolute", top: 8, left: 8 }}>
                  <PlatformBadge pid={plat} size={22} solid />
                </View>

                {activeRender?.state === "queued" || activeRender?.state === "processing" ? (
                  <>
                    <ActivityIndicator color="#fff" />
                    <Text style={{ fontFamily: FONT.monoSemi, fontSize: 8.5, color: "rgba(255,255,255,0.9)", letterSpacing: 0.6, marginTop: 8, textTransform: "uppercase" }}>
                      {activeRender.state === "queued" ? (lang === "en" ? "Queued" : "Antre") : (lang === "en" ? "Rendering…" : "Merender…")}
                    </Text>
                  </>
                ) : activeRender?.state === "failed" ? (
                  <Pressable onPress={handleGenerateRender} disabled={generatingRender} style={{ alignItems: "center", padding: 8 }}>
                    <Text style={{ fontFamily: FONT.monoSemi, fontSize: 8.5, color: "#fff", letterSpacing: 0.6, textAlign: "center" }}>
                      {lang === "en" ? "Failed — tap to retry" : "Gagal — ketuk ulang"}
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={handleGenerateRender} disabled={generatingRender || !backendId}
                    style={{ alignItems: "center", padding: 8, opacity: !backendId ? 0.5 : 1 }}>
                    {generatingRender ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Svg width={26} height={26} viewBox="0 0 24 24">
                          <Circle cx={12} cy={12} r={11} fill="rgba(0,0,0,0.28)" />
                          <Path d="M9 7l9 5-9 5z" fill="#fff" />
                        </Svg>
                        <Text style={{ fontFamily: FONT.monoSemi, fontSize: 8, color: "rgba(255,255,255,0.9)", letterSpacing: 0.6, marginTop: 6, textAlign: "center" }}>
                          {lang === "en" ? "Generate video" : "Buat video"}
                        </Text>
                      </>
                    )}
                  </Pressable>
                )}

                <View style={{ position: "absolute", bottom: 7, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.42)", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 999 }}>
                  <Text style={{ fontFamily: FONT.mono, fontSize: 8, color: "rgba(255,255,255,0.92)", letterSpacing: 0.6 }}>
                    {platMeta.ratio} · {hook === "h5" ? 4 : 5}s
                  </Text>
                </View>
              </LinearGradient>
            )}
          </View>

          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap" }}>
              {camPlatforms.map((pid) => {
                const p = BR_PLATFORMS[pid];
                const on = pid === plat;
                return (
                  <Pressable key={pid} onPress={() => setPlat(pid)}
                    style={({ pressed }) => ({
                      borderWidth: 1, borderColor: on ? p.color : theme.hair,
                      backgroundColor: on ? p.color + "16" : "transparent",
                      paddingVertical: 5, paddingHorizontal: 9, borderRadius: 999,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}>
                    <Text style={{ fontFamily: FONT.monoSemi, fontSize: 10, color: on ? p.color : theme.ink3, letterSpacing: 0.4 }}>
                      {p.short}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ marginTop: 10, gap: 6 }}>
              {[
                { l: lang === "en" ? "Aspect" : "Rasio", v: platMeta.ratio },
                { l: lang === "en" ? "Duration" : "Durasi", v: `≤ ${platMeta.maxSec}s` },
                { l: lang === "en" ? "Hashtags" : "Hashtag", v: `${platMeta.hashtags}` },
              ].map((r, i) => (
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontFamily: FONT.mono, fontSize: 10.5, color: theme.ink3, letterSpacing: 0.4, textTransform: "uppercase" }}>{r.l}</Text>
                  <Text style={{ fontFamily: FONT.monoSemi, fontSize: 10.5, color: theme.ink2 }}>{r.v}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

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

        {/* Pra-kirim */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingTop: 16, paddingHorizontal: 4, paddingBottom: 8 }}>
          <Eyebrow color={theme.ink3}>{t.detail.preflight}</Eyebrow>
          <GlassChip theme={theme} color={allClear ? theme.pos : theme.neg}>
            {allClear ? (lang === "en" ? "All clear" : "Semua aman") : (lang === "en" ? "1 issue" : "1 masalah")}
          </GlassChip>
        </View>
        <GlassPanel theme={theme} padding={4} tone="solid">
          {preflight.map((r, i) => (
            <View key={r.k} style={{
              flexDirection: "row", alignItems: "center", gap: 11,
              paddingVertical: 10, paddingHorizontal: 11,
              borderTopWidth: i ? 1 : 0, borderTopColor: theme.hair2,
            }}>
              <View style={{
                width: 20, height: 20, borderRadius: 999,
                backgroundColor: r.ok ? theme.pos + "1E" : theme.neg + "1E",
                borderWidth: 1, borderColor: (r.ok ? theme.pos : theme.neg) + "55",
                alignItems: "center", justifyContent: "center",
              }}>
                {r.ok ? (
                  <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={theme.pos} strokeWidth={3.2} strokeLinecap="round">
                    <Path d="M4 12l5 5L20 6" />
                  </Svg>
                ) : (
                  <Text style={{ color: theme.neg, fontSize: 12, fontFamily: FONT.sansXBold }}>!</Text>
                )}
              </View>
              <Text style={{ flex: 1, fontFamily: FONT.sans, fontSize: 12, color: r.ok ? theme.ink2 : theme.neg, lineHeight: 16 }}>
                {lang === "en" ? r.label_en : r.label_id}
              </Text>
            </View>
          ))}
        </GlassPanel>
      </ScrollView>

      <FloatingActionBar>
        <GhostButton theme={theme} onPress={() => setSchedOpen(true)} style={{ paddingHorizontal: 16 }}>
          {t.detail.schedule}
        </GhostButton>
        <PrimaryButton theme={theme} onPress={() => {
          if (backendId) apiPost(`/campaigns/${backendId}/publish`, { hookId: aiHook?.id }).catch((e) => console.warn("publish gagal:", e));
          router.push(`/publishing/${c.id}`);
        }} style={{ flex: 1 }}>
          {t.detail.postNow} →
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
    </BrAppShell>
  );
}
