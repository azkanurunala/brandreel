// Kotak masuk — porting BrInbox dari prototype assets/br-screens-insights.jsx.
// Dulu pakai BR_ALERTS (array notifikasi hardcode, nunjuk ke campaign id
// dummy yang bahkan udah gak ada) — sekarang alert nyata diturunkan dari
// data asli yang sudah ada: token sosmed yang mau/sudah kedaluwarsa
// (GET /connections) dan post yang gagal/berhasil tayang (GET /campaigns).
// Belum ada tabel Alert khusus di backend, jadi ini dihitung di klien dari
// data yang memang beneran terjadi — bukan tabel notifikasi terpisah yang
// bisa basi/gak sinkron.

import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBr } from "@/context/BrContext";
import { BR_PLATFORMS } from "@/theme/tokens";
import { apiGet } from "@/lib/api";
import { relativeTime, toFrontendPlatform, type ApiCampaign } from "@/lib/campaignView";
import { BrAppShell, BrAppHeader } from "@/components/br/AppChrome";
import { FONT } from "@/components/br/fonts";

interface LiveConnection {
  id: string;
  platform: string;
  status: "active" | "expiring" | "expired" | "revoked";
  expiresAt: string | null;
}

interface InboxAlert {
  id: string;
  tag: string;
  color: string;
  title: string;
  body: string;
  time: string;
  sortAt: number;
  route: string;
}

export default function InboxScreen() {
  const { theme, lang, t } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [campaigns, setCampaigns] = useState<ApiCampaign[] | null>(null);
  const [connections, setConnections] = useState<LiveConnection[] | null>(null);

  useEffect(() => {
    apiGet("/campaigns").then(setCampaigns).catch(() => setCampaigns([]));
    apiGet("/connections").then(setConnections).catch(() => setConnections([]));
  }, []);

  const loading = campaigns === null || connections === null;

  const alerts = useMemo<InboxAlert[]>(() => {
    if (!campaigns || !connections) return [];
    const list: InboxAlert[] = [];

    for (const conn of connections) {
      if (conn.status !== "expiring" && conn.status !== "expired") continue;
      const pid = toFrontendPlatform(conn.platform);
      const platMeta = BR_PLATFORMS[pid];
      const expired = conn.status === "expired";
      list.push({
        id: `conn-${conn.id}`,
        tag: "TKN",
        color: expired ? "#E0413B" : "#E0A11B",
        title: lang === "en"
          ? `${platMeta?.name ?? conn.platform} token ${expired ? "expired" : "expiring soon"}`
          : `Token ${platMeta?.name ?? conn.platform} ${expired ? "kedaluwarsa" : "mau kedaluwarsa"}`,
        body: lang === "en" ? "Reconnect from Profile to keep posting." : "Hubungkan ulang dari Profil biar posting jalan terus.",
        time: conn.expiresAt ? relativeTime(conn.expiresAt)[lang] : "",
        sortAt: expired ? Date.now() + 2 : Date.now() + 1, // urgent — selalu di atas
        route: "/profile",
      });
    }

    for (const c of campaigns) {
      for (const post of c.posts ?? []) {
        const pid = toFrontendPlatform(post.platform);
        const platMeta = BR_PLATFORMS[pid];
        if (post.state === "failed") {
          list.push({
            id: `post-fail-${c.id}-${post.platform}`,
            tag: "FAIL",
            color: "#E0413B",
            title: lang === "en" ? `${c.product} · ${platMeta?.name ?? post.platform} needs attention` : `${c.product} · ${platMeta?.name ?? post.platform} perlu dicek`,
            body: post.lastError || (lang === "en" ? "Publish failed — tap to retry from campaign detail." : "Gagal posting — ketuk untuk kirim ulang dari detail kampanye."),
            time: post.postedAt ? relativeTime(post.postedAt)[lang] : "",
            sortAt: post.postedAt ? new Date(post.postedAt).getTime() : Date.now(),
            route: `/detail/${c.id}`,
          });
        } else if (post.state === "posted" && post.postedAt) {
          list.push({
            id: `post-live-${c.id}-${post.platform}`,
            tag: "LIVE",
            color: "#1FA971",
            title: lang === "en" ? `${c.product} is live` : `${c.product} tayang`,
            body: lang === "en" ? `Posted on ${platMeta?.name ?? post.platform}.` : `Tayang di ${platMeta?.name ?? post.platform}.`,
            time: relativeTime(post.postedAt)[lang],
            sortAt: new Date(post.postedAt).getTime(),
            route: `/detail/${c.id}`,
          });
        }
      }
    }

    return list.sort((a, b) => b.sortAt - a.sortAt);
  }, [campaigns, connections, lang]);

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
            {t.inbox.alerts} · {alerts.length}
          </Text>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 24, alignItems: "center" }}>
            <ActivityIndicator color={theme.brand} />
          </View>
        ) : alerts.length === 0 ? (
          <View style={{ borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassHi, borderRadius: 14, padding: 16 }}>
            <Text style={{ fontFamily: FONT.sans, fontSize: 12.5, color: theme.ink2, lineHeight: 18 }}>
              {lang === "en" ? "Nothing needs attention right now." : "Belum ada yang perlu dicek."}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            {alerts.map((a) => (
              <Pressable key={a.id} onPress={() => router.push(a.route as never)}
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
                      {a.title}
                    </Text>
                    {!!a.time && <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, paddingTop: 2 }}>{a.time}</Text>}
                  </View>
                  <Text style={{ fontFamily: FONT.sans, fontSize: 11.5, color: theme.ink2, marginTop: 3, lineHeight: 16 }}>
                    {a.body}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </BrAppShell>
  );
}
