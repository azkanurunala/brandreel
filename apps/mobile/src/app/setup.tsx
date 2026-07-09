// Setup API (developer) — porting BrSetup dari prototype br-screens-setup.jsx.
// Panduan berjenjang untuk mengisi kunci integrasi di .env backend.
// Status "Terhubung/Atur" ditarik NYATA dari GET /setup/status (server cek
// env var ada/tidak — nilai asli tidak pernah dikirim balik). Field teks di
// bawah tiap kartu murni catatan pribadi kamu — TIDAK dikirim ke server,
// nilai sebenarnya harus diisi langsung di .env server lalu restart worker.

import React, { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBr } from "@/context/BrContext";
import { BR_PLATFORMS } from "@/theme/tokens";
import { BR_API_GROUPS, brAllApiItems, type ApiItem } from "@/data/apiSetup";
import { BrAppHeader } from "@/components/br/AppChrome";
import { GlassChip, GlassPanel } from "@/components/br/Glass";
import { PlatformBadge } from "@/components/br/BrandGlyph";
import { FONT } from "@/components/br/fonts";
import { apiGet } from "@/lib/api";

export default function SetupScreen() {
  const { theme, lang } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const en = lang === "en";

  const items = brAllApiItems();
  const [vals, setVals] = useState<Record<string, string>>({});
  const [open, setOpen] = useState<string | null>(null);

  // Status nyata dari server — null = belum dimuat, jangan tebak apa pun.
  const [status, setStatus] = useState<Record<string, boolean> | null>(null);
  useEffect(() => {
    apiGet("/setup/status").then(setStatus).catch(() => setStatus({}));
  }, []);

  const isConnected = (it: ApiItem) => !!status && it.fields.every((f) => status[f.env]);
  const connectedCount = status ? items.filter(isConnected).length : 0;
  const total = items.length;
  const pct = status ? Math.round((connectedCount / total) * 100) : 0;

  function setVal(env: string, v: string) {
    setVals((s) => ({ ...s, [env]: v }));
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.canvas }}>
      <View style={{ height: insets.top }} />
      <BrAppHeader title={en ? "API Setup" : "Setup API"} subtitle={en ? "DEVELOPER · INTEGRATIONS" : "DEVELOPER · INTEGRASI"} onBack={() => router.back()} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 28 }}>
        {/* Hero progres */}
        <GlassPanel theme={theme} padding={16} tone="solid">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text style={{ fontFamily: FONT.display, fontSize: 32, color: theme.ink, letterSpacing: -1 }}>
                {status === null ? "···" : connectedCount}<Text style={{ fontSize: 16, color: theme.ink3 }}>/{total}</Text>
              </Text>
              <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 1, marginTop: 5, textTransform: "uppercase" }}>
                {en ? "services connected" : "layanan terhubung"}
              </Text>
            </View>
            <GlassChip theme={theme} color={pct === 100 ? theme.pos : theme.accent}>
              {pct === 100 ? (en ? "Ready to ship" : "Siap rilis") : `${pct}%`}
            </GlassChip>
          </View>
          <View style={{ height: 6, borderRadius: 999, backgroundColor: theme.hair, marginTop: 14, overflow: "hidden" }}>
            <LinearGradient colors={[theme.brand, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={{ height: "100%", width: `${pct}%`, borderRadius: 999 }} />
          </View>
          <Text style={{ fontFamily: FONT.sans, fontSize: 11.5, color: theme.ink2, marginTop: 12, lineHeight: 17 }}>
            {en
              ? "Add each key to your server's .env — never ship secrets in the app bundle. Restart the worker after saving."
              : "Tambahkan tiap key ke .env server — jangan kirim secret di bundle app. Restart worker setelah menyimpan."}
          </Text>
        </GlassPanel>

        {BR_API_GROUPS.map((g) => (
          <View key={g.id}>
            <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color: theme.ink3, paddingTop: 20, paddingHorizontal: 4, paddingBottom: 3 }}>
              {en ? g.label_en : g.label_id}
            </Text>
            <Text style={{ fontFamily: FONT.sans, fontSize: 11, color: theme.ink3, paddingHorizontal: 4, paddingBottom: 10, lineHeight: 16 }}>
              {en ? g.note_en : g.note_id}
            </Text>

            <View style={{ gap: 8 }}>
              {g.items.map((it) => {
                const conn = isConnected(it);
                const isOpen = open === it.id;
                return (
                  <View key={it.id} style={{
                    backgroundColor: theme.glassHi, borderWidth: 1,
                    borderColor: isOpen ? theme.accent + "55" : theme.hair,
                    borderRadius: 16, overflow: "hidden",
                  }}>
                    <Pressable onPress={() => setOpen(isOpen ? null : it.id)}
                      style={{ padding: 13, flexDirection: "row", alignItems: "center", gap: 12 }}>
                      {it.pid ? (
                        <PlatformBadge pid={it.pid} size={34} />
                      ) : (
                        <View style={{
                          width: 34, height: 34, borderRadius: 10,
                          backgroundColor: (it.color ?? theme.brand) + "1C",
                          borderWidth: 1, borderColor: (it.color ?? theme.brand) + "40",
                          alignItems: "center", justifyContent: "center",
                        }}>
                          <Text style={{ fontFamily: FONT.display, color: it.color, fontSize: 13, letterSpacing: -0.5 }}>{it.glyph}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: theme.ink }}>
                          {it.pid ? BR_PLATFORMS[it.pid].name : it.name}
                        </Text>
                        <Text numberOfLines={1} style={{ fontFamily: FONT.sans, fontSize: 11, color: theme.ink3, marginTop: 2 }}>
                          {en ? it.purpose_en : it.purpose_id}
                        </Text>
                      </View>
                      <GlassChip theme={theme} color={conn ? theme.pos : theme.ink3}>
                        {conn ? (en ? "Connected" : "Terhubung") : en ? "Set up" : "Atur"}
                      </GlassChip>
                      <Text style={{ color: theme.ink3, fontSize: 13, marginLeft: 2 }}>{isOpen ? "⌄" : "›"}</Text>
                    </Pressable>

                    {isOpen && (
                      <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
                        <Pressable onPress={() => Linking.openURL(it.console.url)}
                          style={{
                            flexDirection: "row", alignSelf: "flex-start", alignItems: "center", gap: 7,
                            backgroundColor: theme.canvasAlt, borderWidth: 1, borderColor: theme.hair,
                            borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12, marginBottom: 13,
                          }}>
                          <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={theme.brand} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            <Path d="M7 17L17 7M9 7h8v8" />
                          </Svg>
                          <Text style={{ fontFamily: FONT.monoSemi, fontSize: 10.5, color: theme.ink2 }}>{it.console.label}</Text>
                        </Pressable>

                        <View style={{ gap: 9 }}>
                          {(en ? it.steps.en : it.steps.id).map((s, i) => (
                            <View key={i} style={{ flexDirection: "row", gap: 10 }}>
                              <View style={{ width: 19, height: 19, borderRadius: 999, backgroundColor: theme.brand + "16", alignItems: "center", justifyContent: "center" }}>
                                <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9.5, color: theme.brand }}>{i + 1}</Text>
                              </View>
                              <Text style={{ flex: 1, fontFamily: FONT.sans, fontSize: 12.5, color: theme.ink2, lineHeight: 18 }}>{s}</Text>
                            </View>
                          ))}
                        </View>

                        <View style={{ gap: 9, marginTop: 14 }}>
                          {it.fields.map((f) => (
                            <View key={f.env} style={{ gap: 4 }}>
                              <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.6 }}>
                                {f.env}{status && status[f.env] ? ` · ${en ? "set on server" : "sudah diisi di server"}` : ""}
                              </Text>
                              <TextInput
                                value={vals[f.env] ?? ""}
                                onChangeText={(v) => setVal(f.env, v)}
                                placeholder={en ? f.label_en : f.label_id}
                                placeholderTextColor={theme.ink3}
                                autoCapitalize="none"
                                style={{
                                  backgroundColor: theme.canvas, borderWidth: 1, borderColor: theme.hair, borderRadius: 11,
                                  paddingVertical: 10, paddingHorizontal: 12, fontFamily: FONT.mono, fontSize: 12, color: theme.ink,
                                }}
                              />
                            </View>
                          ))}
                        </View>
                        <Text style={{ fontFamily: FONT.sans, fontSize: 10.5, color: theme.ink3, marginTop: 8, lineHeight: 15 }}>
                          {en
                            ? "This form doesn't save to the server — it's scratch space. Set the real value in the server's .env, then refresh status below."
                            : "Form ini tidak tersimpan ke server — cuma catatan sementara. Isi nilai aslinya di .env server, lalu segarkan status di bawah."}
                        </Text>

                        <Pressable onPress={() => apiGet("/setup/status").then(setStatus).catch(() => {})}
                          style={({ pressed }) => ({ marginTop: 13, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
                          <LinearGradient colors={[theme.brand, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.5 }}
                            style={{ borderRadius: 12, paddingVertical: 11, alignItems: "center" }}>
                            <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: "#fff" }}>
                              {conn ? (en ? "Refresh status" : "Segarkan status") : en ? "Check status" : "Cek status"}
                            </Text>
                          </LinearGradient>
                        </Pressable>
                      </View>
                    )}
                  </View>
                );
              })}

              {(g.infos ?? []).map((nf) => (
                <View key={nf.id} style={{
                  backgroundColor: theme.glass, borderWidth: 1, borderColor: theme.hair, borderStyle: "dashed",
                  borderRadius: 16, padding: 13, flexDirection: "row", gap: 12,
                }}>
                  <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: nf.color + "1C", borderWidth: 1, borderColor: nf.color + "40", alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontFamily: FONT.display, color: nf.color, fontSize: 13, letterSpacing: -0.5 }}>{nf.glyph}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: theme.ink }}>{en ? nf.title_en : nf.title_id}</Text>
                    <Text style={{ fontFamily: FONT.sans, fontSize: 11.5, color: theme.ink2, marginTop: 3, lineHeight: 17 }}>{en ? nf.body_en : nf.body_id}</Text>
                  </View>
                  <GlassChip theme={theme} color={theme.ink3}>{en ? "No key" : "Tanpa key"}</GlassChip>
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text style={{ fontFamily: FONT.mono, fontSize: 9.5, color: theme.ink3, letterSpacing: 0.8, textAlign: "center", marginTop: 22, lineHeight: 15, textTransform: "uppercase" }}>
          {en ? "Secrets stored server-side · rotated every 90 days" : "Secret disimpan di server · dirotasi tiap 90 hari"}
        </Text>
      </ScrollView>
    </View>
  );
}
