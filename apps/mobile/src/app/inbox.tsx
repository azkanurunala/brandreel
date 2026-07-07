// Kotak masuk — porting BrInbox dari prototype assets/br-screens-insights.jsx.

import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBr } from "@/context/BrContext";
import { BR_ALERTS } from "@/data/campaigns";
import { BrAppShell, BrAppHeader } from "@/components/br/AppChrome";
import { FONT } from "@/components/br/fonts";

function routeToPath(route: { name: string; id?: string }): string {
  switch (route.name) {
    case "detail": return `/detail/${route.id}`;
    case "publishing": return `/publishing/${route.id}`;
    case "insights": return "/insights";
    case "profile": return "/profile";
    default: return "/home";
  }
}

export default function InboxScreen() {
  const { theme, lang, t } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <BrAppShell theme={theme} density="soft">
      <View style={{ height: insets.top }} />
      <BrAppHeader title={t.inbox.title} subtitle={lang === "en" ? "ALERTS · AUTOMATIONS" : "NOTIFIKASI · OTOMASI"} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 24 }}>
        {/* Banner Copilot */}
        <Pressable onPress={() => router.push("/copilot")} style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.985 : 1 }] })}>
          <LinearGradient colors={[theme.accent, theme.brand]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.5 }}
            style={{ borderRadius: 16, padding: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{
                width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)",
                borderWidth: 1, borderColor: "rgba(255,255,255,0.35)", alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ fontSize: 20, color: "#fff" }}>✦</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 16, color: "#fff", letterSpacing: -0.3 }}>{t.inbox.copilot}</Text>
                <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: "rgba(255,255,255,0.85)", letterSpacing: 0.6, marginTop: 3, textTransform: "uppercase" }}>
                  {lang === "en" ? "Ask about hooks, captions, timing" : "Tanya soal hook, caption, waktu"}
                </Text>
              </View>
              <Text style={{ fontSize: 20, color: "rgba(255,255,255,0.9)" }}>›</Text>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Daftar alert */}
        <View style={{ paddingTop: 18, paddingHorizontal: 4, paddingBottom: 8 }}>
          <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color: theme.ink3 }}>
            {t.inbox.alerts} · {BR_ALERTS.length}
          </Text>
        </View>
        <View style={{ gap: 8 }}>
          {BR_ALERTS.map((a) => (
            <Pressable key={a.id} onPress={() => router.push(routeToPath(a.route) as never)}
              style={({ pressed }) => ({
                borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassHi,
                borderRadius: 14, padding: 12, flexDirection: "row", gap: 11, alignItems: "flex-start",
                transform: [{ scale: pressed ? 0.985 : 1 }],
              })}>
              <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: a.color, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9, color: "#fff", letterSpacing: 0.3 }}>{a.tag}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
                  <Text style={{ flex: 1, fontFamily: FONT.sansBold, fontSize: 13.5, color: theme.ink, lineHeight: 16 }}>
                    {lang === "en" ? a.title_en : a.title_id}
                  </Text>
                  <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, paddingTop: 2 }}>{a.time}</Text>
                </View>
                <Text style={{ fontFamily: FONT.sans, fontSize: 11.5, color: theme.ink2, marginTop: 3, lineHeight: 16 }}>
                  {lang === "en" ? a.body_en : a.body_id}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </BrAppShell>
  );
}
