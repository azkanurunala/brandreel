// Jadwal / mesin auto-post — porting BrSchedule dari prototype
// br-screens-schedule.jsx: hero hitung mundur, strip 7 hari, linimasa harian.

import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBr } from "@/context/BrContext";
import { BR_HOOKS, BR_PLATFORMS, type HookId, type PlatformId } from "@/theme/tokens";
import {
  BR_DOW, BR_MON, BR_SCHEDULE, brCampaignById, brFmtCountdown, brFmtTime, brSlotDate, brUserScheduled,
} from "@/data/schedule";
import type { Campaign } from "@/data/campaigns";
import { BrAppShell, BrAppHeader } from "@/components/br/AppChrome";
import { GlassPanel } from "@/components/br/Glass";
import { PlatformBadge } from "@/components/br/BrandGlyph";
import { FONT } from "@/components/br/fonts";

interface SlotPost {
  off: number;
  h: number;
  m: number;
  cid: string;
  pid: PlatformId;
  hk: HookId;
  c: Campaign;
  date: Date;
  ms: number;
  state: "posted" | "queued" | "scheduled" | "retry";
  userAdded: boolean;
}

export default function ScheduleScreen() {
  const { theme, lang, autopost } = useBr();
  const en = lang === "en";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Jam hidup — hitung mundur diperbarui tiap 30 detik.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const posts: SlotPost[] = useMemo(() => {
    const rows = [
      ...BR_SCHEDULE.map((r) => ({ r, user: false })),
      ...brUserScheduled().map((u) => ({ r: [u.off, u.h, u.m, u.cid, u.pid, u.hk] as const, user: true })),
    ];
    return rows
      .map(({ r: [off, h, m, cid, pid, hk], user }): SlotPost | null => {
        const c = brCampaignById(cid);
        if (!c) return null;
        const date = brSlotDate(now, off, h, m);
        const past = date.getTime() <= now.getTime();
        let state: SlotPost["state"] = past ? "posted" : "scheduled";
        if (cid === "c-beeswax" && pid === "instagram" && !user) state = "retry";
        return { off, h, m, cid, pid, hk, c, date, ms: date.getTime() - now.getTime(), state, userAdded: user };
      })
      .filter((p): p is SlotPost => p !== null);
  }, [now]);

  const upcoming = posts.filter((p) => p.ms > 0 && p.state !== "retry").sort((a, b) => a.ms - b.ms);
  const next = upcoming[0] ?? null;

  const [day, setDay] = useState(0);
  const dayPosts = posts.filter((p) => p.off === day).sort((a, b) => a.h * 60 + a.m - (b.h * 60 + b.m));

  const counts = Array.from({ length: 7 }, (_, d) => posts.filter((p) => p.off === d).length);
  const weekTotal = posts.length;
  const postedToday = posts.filter((p) => p.off === 0 && p.state === "posted").length;
  const channels = new Set(posts.map((p) => p.pid)).size;

  const stateMeta = (st: SlotPost["state"]) =>
    ({
      posted: { c: theme.pos, label: en ? "Posted" : "Tayang" },
      queued: { c: theme.warn, label: en ? "Queued" : "Antre" },
      scheduled: { c: theme.ink3, label: en ? "Scheduled" : "Jadwal" },
      retry: { c: theme.neg, label: en ? "Retry" : "Ulang" },
    })[st];

  const selDate = brSlotDate(now, day, 0, 0);
  const dowArr = en ? BR_DOW.en : BR_DOW.id;
  const monArr = en ? BR_MON.en : BR_MON.id;

  return (
    <BrAppShell theme={theme} density="soft">
      <View style={{ height: insets.top }} />
      <BrAppHeader
        title={en ? "Schedule" : "Jadwal"}
        subtitle={en ? "AUTO-POST ENGINE" : "MESIN AUTO-POST"}
        onBack={() => router.back()}
        right={
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 6,
            paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999,
            backgroundColor: autopost ? theme.pos + "16" : theme.hair,
            borderWidth: 1, borderColor: autopost ? theme.pos + "3A" : theme.hair,
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: autopost ? theme.pos : theme.ink3 }} />
            <Text style={{ fontFamily: FONT.monoSemi, fontSize: 8.5, letterSpacing: 0.8, color: autopost ? theme.pos : theme.ink3 }}>
              {autopost ? "ON" : "OFF"}
            </Text>
          </View>
        }
      />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 24 }}>
        {/* Hero mesin — hitung mundur auto-post berikutnya */}
        <GlassPanel theme={theme} padding={0} tone="solid" style={{ overflow: "hidden" }}>
          <View style={{ padding: 15, backgroundColor: autopost ? theme.brand + "10" : "transparent" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Text style={{ fontFamily: FONT.mono, fontSize: 8.5, letterSpacing: 1.4, color: theme.ink3, textTransform: "uppercase" }}>
                {autopost ? (en ? "Next auto-post in" : "Auto-post berikutnya") : en ? "Engine paused" : "Mesin dijeda"}
              </Text>
              <Pressable onPress={() => router.push("/insights")}>
                <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9, letterSpacing: 0.8, color: theme.brand, textTransform: "uppercase" }}>
                  {en ? "Insights ›" : "Insight ›"}
                </Text>
              </Pressable>
            </View>

            {autopost && next ? (
              <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 14, marginTop: 8 }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 40, lineHeight: 40, letterSpacing: -1.6, color: theme.ink }}>
                  {brFmtCountdown(next.ms, en)}
                </Text>
                <View style={{ flex: 1, minWidth: 0, paddingBottom: 3 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <PlatformBadge pid={next.pid} size={26} solid />
                    <View style={{ minWidth: 0, flex: 1 }}>
                      <Text numberOfLines={1} style={{ fontFamily: FONT.sansBold, fontSize: 13, color: theme.ink }}>
                        {next.c.product}
                      </Text>
                      <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.4, marginTop: 2, textTransform: "uppercase" }}>
                        {BR_PLATFORMS[next.pid].name} · {brFmtTime(next.date)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={{ fontFamily: FONT.sans, fontSize: 13, color: theme.ink2, marginTop: 10, lineHeight: 19.5 }}>
                {autopost
                  ? en ? "Nothing left in the queue. Create a campaign to fill the week." : "Antrean kosong. Buat kampanye untuk isi minggu ini."
                  : en ? "Auto-post is off — posts stay as drafts until you publish manually." : "Auto-post mati — post jadi draf sampai kamu kirim manual."}
              </Text>
            )}
          </View>

          {/* Pita statistik mini */}
          <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: theme.hair2 }}>
            {[
              { n: weekTotal, l: en ? "this week" : "minggu ini" },
              { n: postedToday, l: en ? "posted today" : "tayang hari ini" },
              { n: channels, l: en ? "channels" : "channel" },
            ].map((s, i) => (
              <View key={i} style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 12, borderLeftWidth: i ? 1 : 0, borderLeftColor: theme.hair2, alignItems: "center" }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 19, color: theme.ink, letterSpacing: -0.5 }}>{s.n}</Text>
                <Text style={{ fontFamily: FONT.mono, fontSize: 7.5, color: theme.ink3, letterSpacing: 0.7, marginTop: 4, textTransform: "uppercase" }}>{s.l}</Text>
              </View>
            ))}
          </View>
        </GlassPanel>

        {/* Strip minggu */}
        <View style={{ flexDirection: "row", gap: 6, marginTop: 16 }}>
          {Array.from({ length: 7 }, (_, d) => {
            const dt = brSlotDate(now, d, 0, 0);
            const active = d === day;
            const isToday = d === 0;
            const inner = (
              <>
                <Text style={{ fontFamily: FONT.monoSemi, fontSize: 8.5, letterSpacing: 0.6, textTransform: "uppercase", color: active ? "rgba(255,255,255,0.82)" : theme.ink3 }}>
                  {dowArr[dt.getDay()]}
                </Text>
                <Text style={{ fontFamily: FONT.display, fontSize: 17, letterSpacing: -0.5, color: active ? "#fff" : theme.ink }}>
                  {dt.getDate()}
                </Text>
                <View style={{ height: 5, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 2, marginTop: 1 }}>
                  {counts[d] > 0 ? (
                    Array.from({ length: Math.min(counts[d], 4) }, (_, k) => (
                      <View key={k} style={{ width: 3.5, height: 3.5, borderRadius: 999, backgroundColor: active ? "rgba(255,255,255,0.9)" : isToday ? theme.brand : theme.ink3 }} />
                    ))
                  ) : (
                    <View style={{ width: 3.5, height: 3.5, borderRadius: 999, backgroundColor: active ? "rgba(255,255,255,0.4)" : theme.hair }} />
                  )}
                </View>
              </>
            );
            return (
              <Pressable key={d} onPress={() => setDay(d)} style={({ pressed }) => ({ flex: 1, transform: [{ scale: pressed ? 0.95 : 1 }] })}>
                {active ? (
                  <LinearGradient colors={[theme.brand, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.6 }}
                    style={{ borderRadius: 13, paddingTop: 9, paddingBottom: 7, paddingHorizontal: 2, alignItems: "center", gap: 4 }}>
                    {inner}
                  </LinearGradient>
                ) : (
                  <View style={{
                    borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassHi,
                    borderRadius: 13, paddingTop: 9, paddingBottom: 7, paddingHorizontal: 2, alignItems: "center", gap: 4,
                  }}>
                    {inner}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* Label hari terpilih */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingTop: 18, paddingHorizontal: 4, paddingBottom: 10 }}>
          <Text style={{ fontFamily: FONT.display, fontSize: 16, color: theme.ink, letterSpacing: -0.3 }}>
            {day === 0 ? (en ? "Today" : "Hari ini") : day === 1 ? (en ? "Tomorrow" : "Besok") : `${dowArr[selDate.getDay()]}, ${selDate.getDate()} ${monArr[selDate.getMonth()]}`}
          </Text>
          <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.8, textTransform: "uppercase" }}>
            {dayPosts.length} post
          </Text>
        </View>

        {/* Linimasa harian */}
        {dayPosts.length === 0 ? (
          <GlassPanel theme={theme} padding={22} style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: FONT.sans, fontSize: 13, color: theme.ink2 }}>
              {en ? "No posts scheduled." : "Belum ada jadwal."}
            </Text>
            <Pressable onPress={() => router.push("/create")}
              style={({ pressed }) => ({
                marginTop: 12, borderWidth: 1, borderColor: theme.brand + "40", backgroundColor: theme.brand + "12",
                borderRadius: 11, paddingVertical: 8, paddingHorizontal: 16,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}>
              <Text style={{ fontFamily: FONT.sansBold, fontSize: 13, color: theme.brand }}>
                {en ? "+ Reserve a slot" : "+ Pesan slot"}
              </Text>
            </Pressable>
          </GlassPanel>
        ) : (
          <View>
            {/* Rel penghubung */}
            <View style={{ position: "absolute", left: 43, top: 12, bottom: 12, width: 2, backgroundColor: theme.hair, borderRadius: 2 }} />
            <View style={{ gap: 9 }}>
              {dayPosts.map((p, i) => {
                const sm = stateMeta(p.state);
                const hook = BR_HOOKS[p.hk];
                const isNext = !!next && p.cid === next.cid && p.pid === next.pid && p.off === next.off && p.h === next.h && p.m === next.m;
                return (
                  <View key={i} style={{ flexDirection: "row", alignItems: "stretch", gap: 12 }}>
                    <View style={{ width: 34, alignItems: "flex-end", paddingTop: 13 }}>
                      <Text style={{ fontFamily: FONT.monoSemi, fontSize: 11, color: p.state === "posted" ? theme.ink3 : theme.ink2 }}>
                        {brFmtTime(p.date)}
                      </Text>
                    </View>
                    <View style={{ width: 18, alignItems: "center", paddingTop: 13, zIndex: 1 }}>
                      <View style={{
                        width: 11, height: 11, borderRadius: 999, backgroundColor: theme.canvas,
                        borderWidth: 2.5, borderColor: sm.c,
                      }} />
                    </View>
                    <Pressable
                      onPress={() => router.push(p.c.status === "publishing" ? `/publishing/${p.cid}` : `/detail/${p.cid}`)}
                      style={({ pressed }) => ({
                        flex: 1, minWidth: 0,
                        borderWidth: 1,
                        borderColor: isNext ? theme.brand + "55" : p.userAdded ? theme.brand + "4A" : theme.hair,
                        backgroundColor: p.userAdded ? theme.brand + "0D" : theme.glassHi,
                        borderRadius: 14, paddingVertical: 10, paddingHorizontal: 11,
                        flexDirection: "row" as const, alignItems: "center" as const, gap: 11,
                        transform: [{ scale: pressed ? 0.985 : 1 }],
                      })}>
                      <PlatformBadge pid={p.pid} size={32} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
                          <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: FONT.sansBold, fontSize: 13.5, color: theme.ink }}>
                            {p.c.product}
                          </Text>
                          {p.userAdded && p.state !== "posted" && (
                            <View style={{ backgroundColor: theme.brand, borderRadius: 999, paddingVertical: 2, paddingHorizontal: 6 }}>
                              <Text style={{ fontFamily: FONT.monoSemi, fontSize: 7.5, letterSpacing: 0.7, color: "#fff" }}>
                                {en ? "NEW" : "BARU"}
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 }}>
                          <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: hook.color }} />
                          <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT.mono, fontSize: 8.5, color: theme.ink3, letterSpacing: 0.5, textTransform: "uppercase" }}>
                            {en ? hook.key_en : hook.key_id} · {BR_PLATFORMS[p.pid].ratio}
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        {p.state === "posted" && (
                          <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={sm.c} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M4 12l5 5L20 6" />
                          </Svg>
                        )}
                        {p.state === "retry" && (
                          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={sm.c} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5" />
                          </Svg>
                        )}
                        <Text style={{ fontFamily: FONT.monoSemi, fontSize: 8.5, letterSpacing: 0.6, color: sm.c, textTransform: "uppercase" }}>
                          {isNext ? brFmtCountdown(p.ms, en) : sm.label}
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Legenda */}
        <View style={{ flexDirection: "row", justifyContent: "center", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
          {[
            { c: theme.pos, l: en ? "Posted" : "Tayang" },
            { c: theme.warn, l: en ? "Queued" : "Antre" },
            { c: theme.ink3, l: en ? "Scheduled" : "Jadwal" },
            { c: theme.neg, l: en ? "Retry" : "Ulang" },
          ].map((x, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: x.c }} />
              <Text style={{ fontFamily: FONT.mono, fontSize: 8.5, color: theme.ink3, letterSpacing: 0.6, textTransform: "uppercase" }}>{x.l}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </BrAppShell>
  );
}
