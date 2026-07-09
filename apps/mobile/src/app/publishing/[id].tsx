// Status publishing per platform — porting BrPublishing dari prototype
// br-screens-campaign.jsx. Fase 5: bila kampanye ini punya backendId nyata,
// status di-poll dari /campaigns/:id/status (Post asli, hasil worker.ts);
// kalau tidak (kampanye demo bawaan tanpa baris DB), pakai simulasi timer.

import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBr } from "@/context/BrContext";
import { BR_PLATFORMS, type PlatformId } from "@/theme/tokens";
import { type PlatformPost } from "@/data/campaigns";
import { getPendingCampaign } from "@/data/pendingCampaign";
import { apiGet } from "@/lib/api";
import { toViewCampaign, type ApiCampaign } from "@/lib/campaignView";
import { BrAppShell, BrAppHeader, GhostButton } from "@/components/br/AppChrome";
import { GlassChip, GlassPanel } from "@/components/br/Glass";
import { PlatformBadge } from "@/components/br/BrandGlyph";
import { FONT } from "@/components/br/fonts";

export default function PublishingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, lang, t } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isNew = id === "__new";
  const pending = isNew ? getPendingCampaign() : null;
  // "__new" barusan dibuat: pakai backendId yang sudah diketahui dari
  // create.tsx. Kampanye lain: id di URL ADALAH id backend asli sekarang
  // (BR_CAMPAIGNS dummy sudah tak dipakai lagi di routing manapun).
  const backendId = isNew
    ? (pending?.backendId && pending.backendId !== "pending" ? pending.backendId : null)
    : id ?? null;

  const [fetchedCampaign, setFetchedCampaign] = useState(isNew ? pending?.campaign ?? null : null);
  useEffect(() => {
    if (!backendId) return;
    let alive = true;
    apiGet(`/campaigns/${backendId}`)
      .then((api: ApiCampaign) => { if (alive) setFetchedCampaign(toViewCampaign(api)); })
      .catch((e) => console.warn("gagal ambil campaign:", e));
    return () => { alive = false; };
  }, [backendId]);

  const c = fetchedCampaign;
  const initial: Record<string, PlatformPost> = c
    ? Object.fromEntries(Object.entries(c.platforms).map(([k, v]) => [k, { ...(v as PlatformPost) }]))
    : {};

  const [states, setStates] = useState(initial);
  useEffect(() => { setStates(initial); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [c?.id]);

  // Poll status asli dari backend (hasil worker.ts).
  useEffect(() => {
    if (!backendId) return;
    let alive = true;
    async function poll() {
      try {
        const res = await apiGet(`/campaigns/${backendId}/status`);
        const perPlatform = res.perPlatform as { platform: string; state: string; permalink: string | null }[];
        if (!alive || !perPlatform.length) return;
        setStates((prev) => {
          const next = { ...prev };
          for (const row of perPlatform) {
            next[row.platform] = { ...(next[row.platform] ?? {}), state: row.state as PlatformPost["state"] };
          }
          return next;
        });
      } catch (e) {
        console.warn("poll status gagal:", e);
      }
    }
    poll();
    const id2 = setInterval(poll, 3000);
    return () => { alive = false; clearInterval(id2); };
  }, [backendId]);

  const meta: Record<string, { label: string; color: string }> = {
    posted: { label: t.pub.posted, color: theme.pos },
    queued: { label: t.pub.queued, color: theme.ink3 },
    retry: { label: t.pub.retry, color: theme.warn },
    failed: { label: t.pub.failed, color: theme.neg },
    not_started: { label: t.pub.notStarted, color: theme.ink3 },
  };
  const postedCount = Object.values(states).filter((s) => s.state === "posted").length;
  const total = Object.keys(states).length;

  if (!c) {
    return (
      <BrAppShell theme={theme} density="soft">
        <View style={{ height: insets.top }} />
        <BrAppHeader title={t.pub.title} subtitle="" onBack={() => router.back()} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <ActivityIndicator color={theme.brand} />
        </View>
      </BrAppShell>
    );
  }

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

        <View style={{ marginTop: 18 }}>
          <GhostButton theme={theme} onPress={() => router.push("/insights")}>
            {lang === "en" ? "View live insights →" : "Lihat insight live →"}
          </GhostButton>
        </View>
      </ScrollView>
    </BrAppShell>
  );
}
