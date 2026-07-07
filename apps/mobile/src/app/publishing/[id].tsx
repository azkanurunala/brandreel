// Status publishing per platform — porting BrPublishing dari prototype
// br-screens-campaign.jsx. Fase 2: animasi queued→posted simulasi;
// Fase 5 diganti status asli dari backend (/campaigns/:id/status).

import React, { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBr } from "@/context/BrContext";
import { BR_PLATFORMS, BR_PLATFORM_ORDER, type PlatformId } from "@/theme/tokens";
import { BR_CAMPAIGNS, type Campaign, type PlatformPost } from "@/data/campaigns";
import { getPendingCampaign } from "@/data/pendingCampaign";
import { BrAppShell, BrAppHeader, GhostButton } from "@/components/br/AppChrome";
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

export default function PublishingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, lang, t } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const c = resolveCampaign(id);
  const initial: Record<string, PlatformPost> = Object.keys(c.platforms).length
    ? Object.fromEntries(Object.entries(c.platforms).map(([k, v]) => [k, { ...(v as PlatformPost) }]))
    : Object.fromEntries(BR_PLATFORM_ORDER.map((p) => [p, { state: "queued" as const }]));

  const [states, setStates] = useState(initial);

  // Simulasi "live": antre → terkirim bertahap (Fase 5: polling status backend).
  useEffect(() => {
    const order = Object.keys(states).filter((k) => states[k].state === "queued");
    const timers = order.map((k, i) =>
      setTimeout(() => {
        setStates((s) => ({ ...s, [k]: { ...s[k], state: "posted", views: ["240", "1.1K", "86", "12", "57"][i % 5] } }));
      }, 1200 + i * 1100)
    );
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const meta: Record<string, { label: string; color: string }> = {
    posted: { label: t.pub.posted, color: theme.pos },
    queued: { label: t.pub.queued, color: theme.ink3 },
    retry: { label: t.pub.retry, color: theme.warn },
    failed: { label: t.pub.failed, color: theme.neg },
  };
  const postedCount = Object.values(states).filter((s) => s.state === "posted").length;
  const total = Object.keys(states).length;
  const hasIssue = Object.values(states).some((s) => s.state === "failed" || s.state === "retry");

  return (
    <BrAppShell theme={theme} density="soft">
      <View style={{ height: insets.top }} />
      <BrAppHeader title={t.pub.title} subtitle={c.product} color={c.logoColor} onBack={() => router.back()} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 24 }}>
        {/* Hero progres */}
        <GlassPanel theme={theme} padding={16} tone="solid" style={{ overflow: "hidden" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text style={{ fontFamily: FONT.display, fontSize: 34, color: theme.ink, letterSpacing: -1, lineHeight: 36 }}>
                {postedCount}<Text style={{ fontSize: 17, color: theme.ink3 }}>/{total}</Text>
              </Text>
              <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 1, marginTop: 4, textTransform: "uppercase" }}>
                {lang === "en" ? "channels live" : "channel tayang"}
              </Text>
            </View>
            <GlassChip theme={theme} color={theme.pos}>● {t.pub.monitor}</GlassChip>
          </View>
          <View style={{ height: 6, borderRadius: 999, backgroundColor: theme.hair, marginTop: 14, overflow: "hidden" }}>
            <LinearGradient colors={[theme.brand, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ height: "100%", width: `${(postedCount / total) * 100}%`, borderRadius: 999 }} />
          </View>
        </GlassPanel>

        {/* Status per channel */}
        <View style={{ paddingTop: 16, paddingHorizontal: 4, paddingBottom: 8 }}>
          <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color: theme.ink3 }}>
            {lang === "en" ? "PER-CHANNEL STATUS" : "STATUS PER CHANNEL"}
          </Text>
        </View>
        <View style={{ gap: 8 }}>
          {Object.entries(states).map(([pid, st]) => {
            const p = BR_PLATFORMS[pid as PlatformId];
            const m = meta[st.state] ?? meta.queued;
            return (
              <GlassPanel key={pid} theme={theme} padding={12} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <PlatformBadge pid={pid as PlatformId} size={36} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: FONT.sansBold, fontSize: 13.5, color: theme.ink }}>{p.name}</Text>
                  <Text numberOfLines={1} style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.5, marginTop: 2, textTransform: "uppercase" }}>
                    {st.state === "queued" && st.eta ? `${t.pub.queued} · ${st.eta}`
                      : st.state === "queued" ? `${p.ratio} · ${t.pub.staggered}`
                      : st.state === "retry" ? t.pub.retryNote
                      : st.views ? `${st.views} ${t.insights.views}`
                      : p.ratio}
                  </Text>
                </View>
                <GlassChip theme={theme} color={m.color}>
                  {(st.state === "posted" || st.state === "failed") ? "● " : ""}{m.label}
                </GlassChip>
              </GlassPanel>
            );
          })}
        </View>

        {/* Log error bila ada */}
        {hasIssue && (
          <>
            <View style={{ paddingTop: 18, paddingHorizontal: 4, paddingBottom: 8 }}>
              <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color: theme.ink3 }}>
                {lang === "en" ? "ERROR LOG" : "LOG ERROR"}
              </Text>
            </View>
            <GlassPanel theme={theme} padding={13} style={{ borderColor: theme.neg + "40" }}>
              <Text style={{ fontFamily: FONT.mono, fontSize: 10.5, color: theme.neg, letterSpacing: 0.4, lineHeight: 17 }}>
                [IG] reject · aspect 9:16 expected, got 9:15{"\n"}
                <Text style={{ color: theme.ink3 }}>
                  ↳ {lang === "en" ? "auto-fix: smart-crop to 9:16 · re-queued" : "auto-fix: smart-crop ke 9:16 · diantrekan ulang"}{"\n"}
                </Text>
                [X] 429 rate-limited · {lang === "en" ? "retry in 60s (backoff)" : "ulang 60d (backoff)"}
              </Text>
            </GlassPanel>
          </>
        )}

        <View style={{ marginTop: 18 }}>
          <GhostButton theme={theme} onPress={() => router.push("/insights")}>
            {lang === "en" ? "View live insights →" : "Lihat insight live →"}
          </GhostButton>
        </View>
      </ScrollView>
    </BrAppShell>
  );
}
