// Detail kampanye — porting BrDetail dari prototype br-screens-campaign.jsx.
// Fase 3: bila kampanye baru dibuat via backend (Fase 3), skrip hook & caption
// datang dari Claude nyata (/campaigns/:id/generate + /adapt-caption).
// Pratinjau video tetap kartu gradasi — render Veo asli disambung di layar
// terpisah begitu worker/render selesai (lihat apps/api/src/worker.ts).

import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBr, brStatusMeta } from "@/context/BrContext";
import { BR_HOOKS, BR_HOOK_ORDER, BR_PLATFORMS, type HookId, type PlatformId } from "@/theme/tokens";
import { BR_CAMPAIGNS, brBuildCaption, brPreflight, type Campaign } from "@/data/campaigns";
import { getPendingCampaign, type GenerateResult } from "@/data/pendingCampaign";
import { apiPost } from "@/lib/api";
import { BrAppShell, BrAppHeader, FloatingActionBar, GhostButton, PrimaryButton } from "@/components/br/AppChrome";
import { GlassChip, GlassPanel } from "@/components/br/Glass";
import { PlatformBadge } from "@/components/br/BrandGlyph";
import { FONT } from "@/components/br/fonts";

function resolveCampaign(id: string | undefined): Campaign {
  if (id === "__new") {
    const p = getPendingCampaign();
    if (p) return p.campaign;
  }
  return BR_CAMPAIGNS.find((c) => c.id === id) ?? BR_CAMPAIGNS[0];
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

  const c = resolveCampaign(id);
  const camPlatforms = (Object.keys(c.platforms).length
    ? Object.keys(c.platforms)
    : persona.platforms) as PlatformId[];

  const [hook, setHook] = useState<HookId>(c.topHook ?? "h2");
  const [plat, setPlat] = useState<PlatformId>(camPlatforms[0]);

  const platMeta = BR_PLATFORMS[plat];
  const hk = BR_HOOKS[hook];

  // Fase 3: hook AI nyata bila kampanye ini baru saja dibuat via backend.
  const pending = id === "__new" ? getPendingCampaign() : null;
  const aiResult: GenerateResult | null = pending?.result ?? null;
  const hasAI = !!aiResult;
  const aiHook = aiResult?.hooks[hook];
  const backendId = pending?.backendId && pending.backendId !== "pending" ? pending.backendId : null;

  const fallbackCap = useMemo(() => brBuildCaption(c, hook, plat, lang), [c, hook, plat, lang]);
  const [capCache, setCapCache] = useState<Record<string, { text: string; len: number; max: number }>>({});
  const cacheKey = `${hook}-${plat}`;
  const cachedCap = capCache[cacheKey];
  const capLoading = hasAI && !!backendId && !!aiHook && !cachedCap;
  const cap = cachedCap ?? fallbackCap;

  useEffect(() => {
    if (!hasAI || !backendId || !aiHook || capCache[cacheKey]) return;
    let alive = true;
    apiPost(`/campaigns/${backendId}/adapt-caption`, { hookId: aiHook.id, platform: plat, lang })
      .then((res) => { if (alive) setCapCache((m) => ({ ...m, [cacheKey]: res })); })
      .catch(() => { if (alive) setCapCache((m) => ({ ...m, [cacheKey]: fallbackCap })); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, hasAI, backendId]);

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
          <LinearGradient
            colors={[hk.color, c.logoColor]}
            start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 1 }}
            style={{
              width: 108, aspectRatio: previewAspect, borderRadius: 14, overflow: "hidden",
              alignItems: "center", justifyContent: "center",
            }}>
            <View style={{ position: "absolute", top: 8, left: 8 }}>
              <PlatformBadge pid={plat} size={22} solid />
            </View>
            <Text style={{ fontFamily: FONT.display, color: "rgba(255,255,255,0.85)", fontSize: 30, letterSpacing: -1 }}>
              {c.logoGlyph}
            </Text>
            <Svg width={26} height={26} viewBox="0 0 24 24" style={{ position: "absolute" }}>
              <Circle cx={12} cy={12} r={11} fill="rgba(0,0,0,0.28)" />
              <Path d="M9 7l9 5-9 5z" fill="#fff" />
            </Svg>
            <View style={{ position: "absolute", bottom: 7, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.42)", paddingVertical: 2, paddingHorizontal: 6, borderRadius: 999 }}>
              <Text style={{ fontFamily: FONT.mono, fontSize: 8, color: "rgba(255,255,255,0.92)", letterSpacing: 0.6 }}>
                {platMeta.ratio} · {hook === "h5" ? 4 : 5}s
              </Text>
            </View>
          </LinearGradient>

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
        <GhostButton theme={theme} onPress={() => router.push("/schedule")} style={{ paddingHorizontal: 16 }}>
          {t.detail.schedule}
        </GhostButton>
        <PrimaryButton theme={theme} onPress={() => router.push(`/publishing/${c.id}`)} style={{ flex: 1 }}>
          {t.detail.postNow} →
        </PrimaryButton>
      </FloatingActionBar>
      <View style={{ height: insets.bottom }} />
    </BrAppShell>
  );
}
