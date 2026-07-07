// Insights — porting BrInsights dari prototype assets/br-screens-insights.jsx.
// Fase 2: data dummy; Fase 6 diganti agregasi backend (/insights).

import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBr } from "@/context/BrContext";
import { BR_HOOKS, BR_PLATFORMS, type HookId, type PlatformId } from "@/theme/tokens";
import { BrAppShell, BrAppHeader } from "@/components/br/AppChrome";
import { GlassChip, GlassPanel } from "@/components/br/Glass";
import { FONT } from "@/components/br/fonts";

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <View style={{ paddingTop: 18, paddingHorizontal: 4, paddingBottom: 8 }}>
      <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color }}>{children}</Text>
    </View>
  );
}

export default function InsightsScreen() {
  const { theme, lang, t, scenario } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const platData: { pid: PlatformId; v: number; label: string }[] = [
    { pid: "tiktok", v: 1200, label: "1.2M" },
    { pid: "instagram", v: 272, label: "272K" },
    { pid: "youtube", v: 113, label: "113K" },
    { pid: "twitter", v: 28, label: "28K" },
    { pid: "linkedin", v: 15, label: "15K" },
  ];
  const maxV = Math.max(...platData.map((d) => d.v));
  const hookData: { hid: HookId; pct: number }[] = [
    { hid: "h3", pct: 92 }, { hid: "h2", pct: 71 }, { hid: "h1", pct: 58 }, { hid: "h4", pct: 49 }, { hid: "h5", pct: 38 },
  ];

  return (
    <BrAppShell theme={theme} density="soft">
      <View style={{ height: insets.top }} />
      <BrAppHeader
        title={t.insights.title}
        subtitle={lang === "en" ? "LAST 7 DAYS · ALL CAMPAIGNS" : "7 HARI · SEMUA KAMPANYE"}
        right={<GlassChip theme={theme} color={scenario.accent}>{lang === "en" ? scenario.label_en : scenario.label_id}</GlassChip>}
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 24 }}>
        {/* Baris KPI */}
        <View style={{ flexDirection: "row", gap: 9 }}>
          {[
            { v: scenario.impressions, l: t.home.impressions },
            { v: scenario.eng, l: t.home.engagement },
            { v: scenario.reach, l: t.home.reach },
          ].map((s, i) => (
            <GlassPanel key={i} theme={theme} padding={13} style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 20, color: theme.ink, letterSpacing: -0.5 }}>{s.v}</Text>
              <Text style={{ fontFamily: FONT.mono, fontSize: 8, color: theme.ink3, letterSpacing: 0.6, marginTop: 5, textTransform: "uppercase" }}>{s.l}</Text>
            </GlassPanel>
          ))}
        </View>

        {/* Performa terbaik */}
        <Eyebrow color={theme.ink3}>{t.insights.top}</Eyebrow>
        <Pressable onPress={() => router.push("/detail/c-bamboo-tb")} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.985 : 1 }] })}>
          <LinearGradient colors={[theme.brand, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.7 }}
            style={{ borderRadius: 16, padding: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{
                width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)",
                borderWidth: 1, borderColor: "rgba(255,255,255,0.35)", alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ fontFamily: FONT.display, color: "#fff", fontSize: 16 }}>BT</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9, color: "rgba(255,255,255,0.85)", letterSpacing: 1, textTransform: "uppercase" }}>
                  HOOK 3 · {lang === "en" ? BR_HOOKS.h3.key_en : BR_HOOKS.h3.key_id}
                </Text>
                <Text style={{ fontFamily: FONT.display, fontSize: 18, color: "#fff", letterSpacing: -0.4, marginTop: 3 }}>Bamboo toothbrush</Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 22, color: "#fff", letterSpacing: -0.5 }}>1.2M</Text>
                <Text style={{ fontFamily: FONT.mono, fontSize: 8, color: "rgba(255,255,255,0.8)", letterSpacing: 0.6, marginTop: 3 }}>5.8% ENG</Text>
              </View>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Per platform */}
        <Eyebrow color={theme.ink3}>{t.insights.byPlatform}</Eyebrow>
        <GlassPanel theme={theme} padding={14}>
          <View style={{ gap: 11 }}>
            {platData.map((d) => {
              const p = BR_PLATFORMS[d.pid];
              return (
                <View key={d.pid} style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
                  <Text style={{ width: 30, fontFamily: FONT.monoSemi, fontSize: 11, color: p.color }}>{p.short}</Text>
                  <View style={{ flex: 1, height: 10, borderRadius: 999, backgroundColor: theme.hair2, overflow: "hidden" }}>
                    <View style={{ height: "100%", width: `${Math.max(6, (d.v / maxV) * 100)}%`, backgroundColor: p.color, borderRadius: 999 }} />
                  </View>
                  <Text style={{ width: 44, textAlign: "right", fontFamily: FONT.monoSemi, fontSize: 11, color: theme.ink2 }}>{d.label}</Text>
                </View>
              );
            })}
          </View>
        </GlassPanel>

        {/* Per hook */}
        <Eyebrow color={theme.ink3}>{t.insights.byHook}</Eyebrow>
        <GlassPanel theme={theme} padding={14}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 9, height: 96 }}>
            {hookData.map((d) => {
              const h = BR_HOOKS[d.hid];
              return (
                <View key={d.hid} style={{ flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                  <View style={{
                    width: "100%", height: `${d.pct}%`, minHeight: 6,
                    borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
                    backgroundColor: h.color,
                  }} />
                  <Text style={{ fontFamily: FONT.mono, fontSize: 8.5, color: theme.ink3, letterSpacing: 0.4 }}>{h.glyph}</Text>
                </View>
              );
            })}
          </View>
        </GlassPanel>

        {/* Rekomendasi */}
        <Eyebrow color={theme.ink3}>{t.insights.reco}</Eyebrow>
        <GlassPanel theme={theme} padding={14} style={{ flexDirection: "row", gap: 12, borderColor: theme.accent + "40" }}>
          <View style={{
            width: 30, height: 30, borderRadius: 9, backgroundColor: theme.accent + "1C",
            borderWidth: 1, borderColor: theme.accent + "40", alignItems: "center", justifyContent: "center",
          }}>
            <Text style={{ fontSize: 15 }}>💡</Text>
          </View>
          <Text style={{ flex: 1, fontFamily: FONT.sans, fontSize: 12.5, color: theme.ink2, lineHeight: 19 }}>
            {lang === "en"
              ? "Hook 2 (Unboxing) underperforms on LinkedIn. Swap to Testimonial there — it lifts pro-audience engagement ~2.4×."
              : "Hook 2 (Unboxing) lemah di LinkedIn. Ganti ke Testimoni di sana — naikkan engagement audiens pro ~2,4×."}
          </Text>
        </GlassPanel>
      </ScrollView>
    </BrAppShell>
  );
}
