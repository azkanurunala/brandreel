// Beranda / dashboard — porting BrHome dari prototype assets/br-screens-home.jsx.

import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBr, brStatusMeta } from "@/context/BrContext";
import { brGreet, type TimeKey } from "@/i18n/strings";
import { BR_CAMPAIGNS, type Campaign } from "@/data/campaigns";
import { BrAppShell, PlatformDots } from "@/components/br/AppChrome";
import { BrandMark, GlassChip, GlassPanel } from "@/components/br/Glass";
import { FONT } from "@/components/br/fonts";

function timeKeyNow(): TimeKey {
  const h = new Date().getHours();
  if (h < 11) return "pagi";
  if (h < 17) return "siang";
  return "malam";
}

function CalendarIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Rect x={3} y={4.5} width={18} height={16} rx={3} />
      <Path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </Svg>
  );
}

function PlusIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.1} strokeLinecap="round">
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

function CampaignCard({ c, onPress }: { c: Campaign; onPress: () => void }) {
  const { theme, lang, t } = useBr();
  const sm = brStatusMeta(c.status, theme, t);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({
      borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassHi,
      borderRadius: 16, padding: 13, gap: 11,
      transform: [{ scale: pressed ? 0.985 : 1 }],
    })}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{
          width: 42, height: 42, borderRadius: 12,
          backgroundColor: c.logoColor + "1C", borderWidth: 1, borderColor: c.logoColor + "40",
          alignItems: "center", justifyContent: "center",
        }}>
          <Text style={{ fontFamily: FONT.display, color: c.logoColor, fontSize: 15, letterSpacing: -0.5 }}>{c.logoGlyph}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={{ fontFamily: FONT.display, fontSize: 16, color: theme.ink, letterSpacing: -0.3 }}>
            {c.product}
          </Text>
          <Text numberOfLines={1} style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.4, marginTop: 3, textTransform: "uppercase" }}>
            {lang === "en" ? c.created_en : c.created_id}
          </Text>
        </View>
        <GlassChip theme={theme} color={sm.color}>
          {sm.dot ? "● " : ""}{sm.label}
        </GlassChip>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <PlatformDots campaign={c} theme={theme} size={22} />
        {c.views !== "—" ? (
          <Text style={{ fontFamily: FONT.mono, fontSize: 10.5, color: theme.ink2, letterSpacing: 0.3 }}>
            {c.views} <Text style={{ color: theme.ink3 }}>· {c.eng}</Text>
          </Text>
        ) : (
          <Text style={{ color: theme.ink3, fontSize: 18 }}>›</Text>
        )}
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const { theme, lang, t, persona, scenario } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const kpis = [
    { v: scenario.impressions, l: t.home.impressions },
    { v: scenario.eng, l: t.home.engagement },
    { v: scenario.reach, l: t.home.reach },
  ];

  const campaigns = BR_CAMPAIGNS;

  function openCampaign(c: Campaign) {
    if (c.status === "draft") router.push("/create");
    else if (c.status === "publishing") router.push(`/publishing/${c.id}`);
    else router.push(`/detail/${c.id}`);
  }

  return (
    <BrAppShell theme={theme} density="soft">
      {/* Bilah atas */}
      <View style={{
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 8,
      }}>
        <BrandMark theme={theme} size={19} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable onPress={() => router.push("/schedule")} accessibilityLabel="schedule"
            style={({ pressed }) => ({
              borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassHi,
              width: 32, height: 32, borderRadius: 999, alignItems: "center", justifyContent: "center",
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}>
            <CalendarIcon color={theme.ink2} />
          </Pressable>
          <Pressable onPress={() => router.push("/profile")}
            style={({ pressed }) => ({
              borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassHi,
              paddingVertical: 4, paddingLeft: 5, paddingRight: 11, borderRadius: 999,
              flexDirection: "row", alignItems: "center", gap: 7,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}>
            <View style={{ width: 20, height: 20, borderRadius: 999, backgroundColor: persona.color, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontFamily: FONT.monoSemi, fontSize: 8.5, color: "#fff" }}>{persona.initial}</Text>
            </View>
            <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9, letterSpacing: 0.8, color: theme.ink2 }}>
              {persona.plan_label.toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Isi scroll */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 6, paddingHorizontal: 16, paddingBottom: 24 }}>
        {/* Sapaan */}
        <Text style={{ fontFamily: FONT.display, fontSize: 28, color: theme.ink, lineHeight: 30, letterSpacing: -0.9, marginTop: 6 }}>
          {brGreet(lang, timeKeyNow())},{"\n"}
          <Text style={{ color: theme.brand, fontStyle: "italic", fontFamily: FONT.displayMed }}>
            {persona.name.split(" ")[0]}.
          </Text>
        </Text>
        <Text style={{ fontFamily: FONT.sans, fontSize: 13, color: theme.ink2, marginTop: 8, lineHeight: 19.5 }}>
          {lang === "en" ? scenario.summary_en : scenario.summary_id}
        </Text>

        {/* Kartu KPI */}
        <View style={{ flexDirection: "row", gap: 9, marginTop: 18 }}>
          {kpis.map((s, i) => (
            <GlassPanel key={i} theme={theme} padding={13} tone="solid" style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 21, color: theme.ink, letterSpacing: -0.6, fontVariant: ["tabular-nums"] }}>{s.v}</Text>
              <Text style={{ fontFamily: FONT.mono, fontSize: 8, color: theme.ink3, marginTop: 6, letterSpacing: 0.6, textTransform: "uppercase" }}>{s.l}</Text>
            </GlassPanel>
          ))}
        </View>

        {/* CTA kampanye baru */}
        <Pressable onPress={() => router.push("/create")} style={({ pressed }) => ({ marginTop: 16, transform: [{ scale: pressed ? 0.985 : 1 }] })}>
          <LinearGradient colors={[theme.brand, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.5 }}
            style={{ padding: 15, borderRadius: 18 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 13 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.2)",
                borderWidth: 1, borderColor: "rgba(255,255,255,0.32)", alignItems: "center", justifyContent: "center",
              }}>
                <PlusIcon />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 18, color: "#fff", letterSpacing: -0.4 }}>{t.home.newCampaign}</Text>
                <Text style={{ fontFamily: FONT.mono, fontSize: 9.5, color: "rgba(255,255,255,0.82)", letterSpacing: 0.6, marginTop: 4, textTransform: "uppercase" }}>
                  {t.create.sub}
                </Text>
              </View>
              <Text style={{ fontSize: 22, color: "rgba(255,255,255,0.9)" }}>›</Text>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Daftar kampanye */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingTop: 18, paddingHorizontal: 4, paddingBottom: 8 }}>
          <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color: theme.ink3 }}>
            {t.home.recent} · {campaigns.length}
          </Text>
          {persona.can.multiBrand && (
            <Text style={{ fontFamily: FONT.monoSemi, fontSize: 8.5, color: theme.accent, letterSpacing: 1 }}>
              {persona.brands} BRANDS
            </Text>
          )}
        </View>

        <View style={{ gap: 9 }}>
          {campaigns.map((c) => (
            <CampaignCard key={c.id} c={c} onPress={() => openCampaign(c)} />
          ))}
        </View>
      </ScrollView>
    </BrAppShell>
  );
}
