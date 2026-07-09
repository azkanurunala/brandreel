// Sheet Jadwalkan — porting BrScheduleSheet dari prototype br-screens-schedule.jsx.
// Pilih hari + jam sebelum mengantre kampanye; jeda otomatis antar platform.

import React, { useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useBr } from "../../context/BrContext";
import { BR_PLATFORMS, type HookId, type PlatformId } from "../../theme/tokens";
import { BR_DOW, BR_MON, BR_PEAK_HOURS, brSlotDate } from "../../data/schedule";
import type { Campaign } from "../../data/campaigns";
import { apiPost } from "../../lib/api";
import { PlatformBadge } from "./BrandGlyph";
import { FONT } from "./fonts";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 → 22:00

export function ScheduleSheet({
  visible, onClose, campaign, platforms, hook, backendId, hookRowId, onScheduled,
}: {
  visible: boolean;
  onClose: () => void;
  campaign: Campaign;
  platforms: PlatformId[];
  hook: HookId;
  backendId: string | null;
  hookRowId: string | null;
  onScheduled: () => void;
}) {
  const { theme, lang } = useBr();
  const en = lang === "en";
  const now = new Date();
  const dowArr = en ? BR_DOW.en : BR_DOW.id;
  const monArr = en ? BR_MON.en : BR_MON.id;

  const multi = platforms.length > 1;
  const defaultPeak = BR_PEAK_HOURS.find((h) => h * 60 > now.getHours() * 60 + now.getMinutes());
  const [day, setDay] = useState(defaultPeak ? 0 : 1);
  const [hour, setHour] = useState(defaultPeak ?? 9);
  const [min, setMin] = useState(0);
  const [stagger, setStagger] = useState(multi);
  const [busy, setBusy] = useState(false);

  const slotDate = brSlotDate(now, day, hour, min);
  const selectedPast = slotDate.getTime() <= now.getTime();
  const dayLabel = day === 0 ? (en ? "Today" : "Hari ini") : day === 1 ? (en ? "Tomorrow" : "Besok") : `${dowArr[slotDate.getDay()]}, ${slotDate.getDate()} ${monArr[slotDate.getMonth()]}`;
  const fmt2 = (n: number) => String(n).padStart(2, "0");
  const timeLabel = `${fmt2(hour)}:${fmt2(min)}`;

  async function confirm() {
    if (selectedPast || busy) return;
    if (!backendId) {
      Alert.alert(en ? "Not ready yet" : "Belum siap", en ? "This campaign isn't saved on the server yet." : "Kampanye ini belum tersimpan di server.");
      return;
    }
    setBusy(true);
    try {
      await apiPost(`/campaigns/${backendId}/publish`, {
        hookId: hookRowId ?? undefined,
        scheduledAt: slotDate.toISOString(),
      });
      onScheduled();
    } catch (e: any) {
      Alert.alert(en ? "Scheduling failed" : "Gagal menjadwalkan", e.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable onPress={onClose} style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(10,10,18,0.55)" }} />
        <View style={{
          backgroundColor: theme.page, borderTopLeftRadius: 24, borderTopRightRadius: 24,
          maxHeight: "88%",
        }}>
          {/* Header */}
          <View style={{ padding: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: theme.hair2, backgroundColor: theme.glassHi, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <View style={{ width: 36, height: 5, borderRadius: 999, backgroundColor: theme.hair, alignSelf: "center", marginBottom: 10 }} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: campaign.logoColor, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: FONT.display, color: "#fff", fontSize: 17 }}>{(campaign.product[0] ?? "B").toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: FONT.display, fontSize: 19, color: theme.ink, letterSpacing: -0.4 }}>
                  {en ? "Schedule post" : "Jadwalkan post"}
                </Text>
                <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.6, marginTop: 3, textTransform: "uppercase" }}>
                  {campaign.product} · {platforms.length} channel
                </Text>
              </View>
              <Pressable onPress={onClose} style={{ width: 30, height: 30, borderRadius: 999, backgroundColor: theme.canvasAlt, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ color: theme.ink2, fontSize: 15 }}>✕</Text>
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 8 }}>
            {/* Platform chips */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
              {platforms.map((pid) => (
                <View key={pid} style={{
                  flexDirection: "row", alignItems: "center", gap: 7,
                  paddingVertical: 5, paddingLeft: 5, paddingRight: 11, borderRadius: 999,
                  backgroundColor: theme.glassHi, borderWidth: 1, borderColor: theme.hair,
                }}>
                  <PlatformBadge pid={pid} size={22} />
                  <Text style={{ fontFamily: FONT.sansSemi, fontSize: 12, color: theme.ink2 }}>{BR_PLATFORMS[pid].name}</Text>
                </View>
              ))}
            </View>

            {/* Tanggal */}
            <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 9 }}>
              {en ? "Publish date" : "Tanggal tayang"}
            </Text>
            <View style={{ flexDirection: "row", gap: 6 }}>
              {Array.from({ length: 7 }, (_, d) => {
                const dt = brSlotDate(now, d, 0, 0);
                const active = d === day;
                const inner = (
                  <>
                    <Text style={{ fontFamily: FONT.monoSemi, fontSize: 8.5, letterSpacing: 0.6, textTransform: "uppercase", color: active ? "rgba(255,255,255,0.82)" : theme.ink3 }}>
                      {dowArr[dt.getDay()]}
                    </Text>
                    <Text style={{ fontFamily: FONT.display, fontSize: 17, letterSpacing: -0.5, color: active ? "#fff" : theme.ink }}>{dt.getDate()}</Text>
                  </>
                );
                return (
                  <Pressable key={d} onPress={() => setDay(d)} style={{ flex: 1 }}>
                    {active ? (
                      <LinearGradient colors={[theme.brand, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.6 }}
                        style={{ borderRadius: 13, paddingVertical: 9, alignItems: "center", gap: 3 }}>
                        {inner}
                      </LinearGradient>
                    ) : (
                      <View style={{ borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassHi, borderRadius: 13, paddingVertical: 9, alignItems: "center", gap: 3 }}>
                        {inner}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Waktu */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginTop: 20, marginBottom: 9 }}>
              <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase" }}>
                {en ? "Publish time" : "Waktu tayang"}
              </Text>
              <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9, color: theme.brand, letterSpacing: 0.6, textTransform: "uppercase" }}>
                ● {en ? "= peak window" : "= jam ramai"}
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6, marginBottom: 9 }}>
              {[0, 30].map((mm) => {
                const on = min === mm;
                return (
                  <Pressable key={mm} onPress={() => setMin(mm)} style={{
                    flex: 1, paddingVertical: 8, borderRadius: 11,
                    borderWidth: 1, borderColor: on ? theme.brand : theme.hair,
                    backgroundColor: on ? theme.brand + "14" : theme.glassHi, alignItems: "center",
                  }}>
                    <Text style={{ fontFamily: FONT.monoSemi, fontSize: 12, color: on ? theme.brand : theme.ink2 }}>:{fmt2(mm)}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {HOURS.map((h) => {
                const on = h === hour;
                const isPeak = BR_PEAK_HOURS.includes(h);
                const past = brSlotDate(now, day, h, min).getTime() <= now.getTime();
                const inner = (
                  <Text style={{ fontFamily: FONT.monoSemi, fontSize: 12.5, color: on ? "#fff" : past ? theme.ink3 : theme.ink }}>
                    {fmt2(h)}:{fmt2(min)}
                  </Text>
                );
                return (
                  <Pressable key={h} disabled={past} onPress={() => setHour(h)}
                    style={{
                      width: "18%", paddingVertical: 9, borderRadius: 11, alignItems: "center", opacity: past ? 0.4 : 1,
                      borderWidth: 1, borderColor: on ? theme.brand : isPeak && !past ? theme.brand + "33" : theme.hair,
                      backgroundColor: on ? theme.brand : isPeak && !past ? theme.brand + "0C" : theme.glassHi,
                    }}>
                    {inner}
                  </Pressable>
                );
              })}
            </View>

            {/* Stagger */}
            {multi && (
              <Pressable onPress={() => setStagger((s) => !s)} style={{
                marginTop: 16, borderWidth: 1, borderColor: stagger ? theme.brand + "44" : theme.hair,
                backgroundColor: stagger ? theme.brand + "0D" : theme.glassHi,
                borderRadius: 14, padding: 13, flexDirection: "row", alignItems: "center", gap: 12,
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.sansBold, fontSize: 13.5, color: theme.ink }}>
                    {en ? "Stagger across channels" : "Jeda antar channel"}
                  </Text>
                  <Text style={{ fontFamily: FONT.sans, fontSize: 11.5, color: theme.ink2, marginTop: 2, lineHeight: 16 }}>
                    {en ? "Post 1 channel every 30 min — clears platform rate-limits." : "Kirim 1 channel tiap 30 mnt — aman dari rate-limit."}
                  </Text>
                </View>
                <View style={{ width: 42, height: 25, borderRadius: 999, backgroundColor: stagger ? theme.brand : theme.hair }}>
                  <View style={{
                    width: 20, height: 20, borderRadius: 999, backgroundColor: "#fff", marginTop: 2.5,
                    marginLeft: stagger ? 20 : 2.5,
                  }} />
                </View>
              </Pressable>
            )}

            {/* Ringkasan */}
            <View style={{
              marginTop: 16, padding: 13, borderRadius: 14, backgroundColor: theme.canvasAlt,
              borderWidth: 1, borderColor: theme.hair2, flexDirection: "row", alignItems: "center", gap: 12,
            }}>
              {selectedPast ? (
                <Text style={{ fontFamily: FONT.sansSemi, fontSize: 12.5, color: theme.neg, flex: 1, lineHeight: 18 }}>
                  {en ? "That time has already passed — pick a later slot." : "Waktu itu sudah lewat — pilih slot berikutnya."}
                </Text>
              ) : (
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: FONT.sansBold, fontSize: 13.5, color: theme.ink }}>{dayLabel} · {timeLabel}</Text>
                  <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.5, marginTop: 3, textTransform: "uppercase" }}>
                    {stagger && multi
                      ? (en ? `${platforms.length} channels · staggered 1/30 min` : `${platforms.length} channel · jeda 1/30 mnt`)
                      : (en ? "all channels at once" : "semua channel sekaligus")}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={{ flexDirection: "row", gap: 10, padding: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.hair2 }}>
            <Pressable onPress={onClose} style={{
              borderWidth: 1, borderColor: theme.hair, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 20,
            }}>
              <Text style={{ fontFamily: FONT.sansSemi, fontSize: 14, color: theme.ink2 }}>{en ? "Cancel" : "Batal"}</Text>
            </Pressable>
            <Pressable onPress={confirm} disabled={selectedPast || busy} style={{ flex: 1, opacity: selectedPast ? 0.5 : 1 }}>
              <LinearGradient colors={[theme.brand, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.5 }}
                style={{ borderRadius: 14, paddingVertical: 13, alignItems: "center" }}>
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ fontFamily: FONT.sansBold, fontSize: 15, color: "#fff" }}>
                    {en ? `Schedule ${platforms.length} post${platforms.length > 1 ? "s" : ""}` : `Jadwalkan ${platforms.length} post`} →
                  </Text>
                )}
              </LinearGradient>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
