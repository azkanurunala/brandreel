// Onboarding 5 langkah — porting BrOnboard dari prototype br-screens-onboard.jsx.
// Fase 2: koneksi channel & SSO disimulasikan (sheet OAuth asli dipasang Fase 4).

import React, { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBr } from "@/context/BrContext";
import { BR_PLATFORMS, BR_PLATFORM_ORDER, BR_SSO, type PlatformId } from "@/theme/tokens";
import { BrAppShell, GhostButton, PrimaryButton } from "@/components/br/AppChrome";
import { GlassPanel } from "@/components/br/Glass";
import { BrandGlyph, PlatformBadge } from "@/components/br/BrandGlyph";
import { FONT } from "@/components/br/fonts";

const STEPS = 5;

// Baris tombol SSO Google/Apple (padanan BrSSORow — versi sederhana Fase 2).
function SSORow({ onPick }: { onPick: (id: "google" | "apple") => void }) {
  const { theme, lang } = useBr();
  return (
    <View style={{ gap: 9 }}>
      {(["google", "apple"] as const).map((id) => {
        const s = BR_SSO[id];
        return (
          <Pressable key={id} onPress={() => onPick(id)}
            style={({ pressed }) => ({
              backgroundColor: s.bg,
              borderWidth: s.bordered ? 1 : 0, borderColor: theme.hair,
              borderRadius: 13, paddingVertical: 12, paddingHorizontal: 16,
              flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 10,
              transform: [{ scale: pressed ? 0.975 : 1 }],
            })}>
            <BrandGlyph pid={id} size={18} color={s.ink} />
            <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: s.ink }}>
              {lang === "en" ? `Continue with ${s.name}` : `Lanjut dengan ${s.name}`}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function OnboardScreen() {
  const { theme, lang, t } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [conn, setConn] = useState<Record<PlatformId, boolean>>({
    tiktok: true, instagram: true, youtube: false, linkedin: false, twitter: false, facebook: false,
  });
  const [brandName, setBrandName] = useState("Eco Goods");
  const [logoColor, setLogoColor] = useState("#1FA971");
  const [voice, setVoice] = useState<string[]>(["casual", "eco"]);

  const connectedCount = Object.values(conn).filter(Boolean).length;
  const next = () => setStep((s) => Math.min(STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));
  const finish = () => router.replace("/home");
  const toLogin = () => router.replace("/login");

  const voiceOpts = [
    { id: "casual", en: "Casual", id_: "Santai" }, { id: "funny", en: "Funny", id_: "Lucu" },
    { id: "pro", en: "Professional", id_: "Profesional" }, { id: "bold", en: "Bold", id_: "Berani" },
    { id: "eco", en: "Eco-conscious", id_: "Sadar lingkungan" }, { id: "minimal", en: "Minimal", id_: "Minimalis" },
  ];
  const logoColors = ["#1FA971", "#F23E5C", "#2D7FF0", "#6D4AFF", "#E0A11B"];

  return (
    <BrAppShell theme={theme} density="rich">
      {/* Progres + lewati */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingTop: insets.top + 12, paddingHorizontal: 18, paddingBottom: 4 }}>
        <View style={{ flexDirection: "row", gap: 5, flex: 1 }}>
          {Array.from({ length: STEPS }).map((_, i) => (
            <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? theme.brand : theme.hair }} />
          ))}
        </View>
        {step < STEPS - 1 && (
          <Pressable onPress={toLogin}>
            <Text style={{ fontFamily: FONT.sansSemi, fontSize: 12, color: theme.ink3 }}>{t.onboard.skip}</Text>
          </Pressable>
        )}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 18, flexGrow: 1 }}>
        {/* LANGKAH 0 — sambutan */}
        {step === 0 && (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "flex-start" }}>
            <LinearGradient colors={[theme.brandDk, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 74, height: 74, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 26 }}>
              <View style={{ width: 26, height: 26, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.94)" }} />
            </LinearGradient>
            <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color: theme.brand }}>
              {lang === "en" ? "WELCOME TO" : "SELAMAT DATANG DI"}
            </Text>
            <Text style={{ fontFamily: FONT.display, fontSize: 42, lineHeight: 42, letterSpacing: -1.4, color: theme.ink, marginTop: 10 }}>
              Brand<Text style={{ color: theme.brand }}>Reel</Text>
            </Text>
            <Text style={{ fontFamily: FONT.sans, fontSize: 15, lineHeight: 22.5, color: theme.ink2, marginTop: 16, maxWidth: 300 }}>
              {lang === "en"
                ? "Turn 10 hours of UGC into a 5-minute input. Drop a product name + logo — we generate, format, and auto-post everywhere."
                : "Ubah 10 jam bikin UGC jadi input 5 menit. Cukup nama produk + logo — kami buat, format, dan posting otomatis ke mana-mana."}
            </Text>
            <View style={{ width: "100%", marginTop: 26 }}>
              <SSORow onPick={() => finish()} />
            </View>
            <Pressable onPress={toLogin} style={{ alignSelf: "center", marginTop: 18 }}>
              <Text style={{ fontFamily: FONT.sans, fontSize: 13, color: theme.ink2 }}>
                {lang === "en" ? "I already have an account" : "Saya sudah punya akun"}
              </Text>
            </Pressable>
          </View>
        )}

        {/* LANGKAH 1 — proposisi nilai */}
        {step === 1 && (
          <View>
            <Text style={{ fontFamily: FONT.display, fontSize: 28, letterSpacing: -0.9, color: theme.ink, lineHeight: 30, marginTop: 6 }}>
              {lang === "en" ? "From one input to\nevery feed." : "Dari satu input ke\nsemua feed."}
            </Text>
            <View style={{ gap: 11, marginTop: 22 }}>
              {[
                { c: theme.brand, n: "5", t_en: "hook angles auto-written", t_id: "sudut hook ditulis otomatis", s_en: "Problem/Solution · Unboxing · Before/After · Testimonial · Trending", s_id: "Masalah/Solusi · Unboxing · Before/After · Testimoni · Tren" },
                { c: theme.accent, n: "5", t_en: "platforms, each optimized", t_id: "platform, masing-masing dioptimasi", s_en: "Aspect ratio, duration, caption length — adapted per channel", s_id: "Rasio, durasi, panjang caption — disesuaikan per channel" },
                { c: theme.pos, n: "0", t_en: "silent failures", t_id: "kegagalan diam-diam", s_en: "Pre-flight checks catch format, token & rate-limit issues first", s_id: "Pemeriksaan pra-kirim menangkap format, token & rate-limit dulu" },
              ].map((v, i) => (
                <GlassPanel key={i} theme={theme} padding={14} style={{ flexDirection: "row", gap: 14, alignItems: "flex-start" }}>
                  <Text style={{ fontFamily: FONT.display, fontSize: 30, color: v.c, letterSpacing: -1, width: 34 }}>{v.n}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: theme.ink }}>{lang === "en" ? v.t_en : v.t_id}</Text>
                    <Text style={{ fontFamily: FONT.sans, fontSize: 11.5, color: theme.ink2, marginTop: 3, lineHeight: 16.5 }}>
                      {lang === "en" ? v.s_en : v.s_id}
                    </Text>
                  </View>
                </GlassPanel>
              ))}
            </View>
          </View>
        )}

        {/* LANGKAH 2 — hubungkan channel */}
        {step === 2 && (
          <View>
            <Text style={{ fontFamily: FONT.display, fontSize: 28, letterSpacing: -0.9, color: theme.ink, lineHeight: 30, marginTop: 6 }}>
              {lang === "en" ? "Connect your\nchannels." : "Hubungkan\nchannel kamu."}
            </Text>
            <Text style={{ fontFamily: FONT.sans, fontSize: 13, color: theme.ink2, marginTop: 10, marginBottom: 18, lineHeight: 19.5 }}>
              {lang === "en"
                ? "OAuth-secure. We refresh tokens 7 days before they expire — so posts never fail silently."
                : "Aman dengan OAuth. Token disegarkan 7 hari sebelum kedaluwarsa — posting tak pernah gagal diam-diam."}
            </Text>
            <View style={{ gap: 9 }}>
              {BR_PLATFORM_ORDER.map((pid) => {
                const p = BR_PLATFORMS[pid];
                const on = conn[pid];
                return (
                  <Pressable key={pid} onPress={() => setConn((c) => ({ ...c, [pid]: !on }))}
                    style={({ pressed }) => ({
                      borderWidth: 1, borderColor: on ? p.color + "66" : theme.hair,
                      backgroundColor: on ? p.color + "12" : theme.glassHi,
                      borderRadius: 14, paddingVertical: 11, paddingHorizontal: 13,
                      flexDirection: "row" as const, alignItems: "center" as const, gap: 12,
                      transform: [{ scale: pressed ? 0.985 : 1 }],
                    })}>
                    <PlatformBadge pid={pid} size={34} solid={on} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: theme.ink }}>{p.name}</Text>
                      <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.6, marginTop: 2, textTransform: "uppercase" }}>
                        {p.ratio} · {p.maxSec}s max
                      </Text>
                    </View>
                    <View style={{
                      paddingVertical: 5, paddingHorizontal: 11, borderRadius: 999,
                      backgroundColor: on ? p.color : "transparent",
                      borderWidth: on ? 0 : 1, borderColor: theme.hair,
                      flexDirection: "row", alignItems: "center", gap: 5,
                    }}>
                      {on && (
                        <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round">
                          <Path d="M4 12l5 5L20 6" />
                        </Svg>
                      )}
                      <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9.5, letterSpacing: 0.8, color: on ? "#fff" : theme.ink2 }}>
                        {(on ? t.profile.connected : t.onboard.connect).toUpperCase()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
            <Text style={{ fontFamily: FONT.mono, fontSize: 10, color: theme.ink3, letterSpacing: 1, textAlign: "center", marginTop: 16, textTransform: "uppercase" }}>
              {connectedCount}/{BR_PLATFORM_ORDER.length} {lang === "en" ? "connected" : "terhubung"}
            </Text>
          </View>
        )}

        {/* LANGKAH 3 — brand kit */}
        {step === 3 && (
          <View>
            <Text style={{ fontFamily: FONT.display, fontSize: 28, letterSpacing: -0.9, color: theme.ink, lineHeight: 30, marginTop: 6 }}>
              {lang === "en" ? "Set your\nbrand kit." : "Atur\nbrand kit."}
            </Text>
            <Text style={{ fontFamily: FONT.sans, fontSize: 13, color: theme.ink2, marginTop: 10, marginBottom: 16, lineHeight: 19.5 }}>
              {lang === "en"
                ? "We apply this voice & look to every caption and video."
                : "Kami terapkan voice & tampilan ini ke setiap caption dan video."}
            </Text>

            <View style={{ flexDirection: "row", gap: 13, alignItems: "center" }}>
              <View style={{ width: 60, height: 60, borderRadius: 17, backgroundColor: logoColor, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: FONT.display, color: "#fff", fontSize: 24, letterSpacing: -0.5 }}>
                  {(brandName[0] || "B").toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 5 }}>
                  {lang === "en" ? "Brand name" : "Nama brand"}
                </Text>
                <TextInput value={brandName} onChangeText={setBrandName}
                  style={{
                    backgroundColor: theme.glassHi, borderWidth: 1, borderColor: theme.hair, borderRadius: 12,
                    paddingVertical: 11, paddingHorizontal: 13, fontFamily: FONT.sansSemi, fontSize: 15, color: theme.ink,
                  }} />
              </View>
            </View>

            <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 18, marginBottom: 8 }}>
              {lang === "en" ? "Brand color" : "Warna brand"}
            </Text>
            <View style={{ flexDirection: "row", gap: 9 }}>
              {logoColors.map((c) => (
                <Pressable key={c} onPress={() => setLogoColor(c)}
                  style={({ pressed }) => ({
                    width: 40, height: 40, borderRadius: 12, backgroundColor: c,
                    borderWidth: 2.5, borderColor: c === logoColor ? theme.ink : "transparent",
                    transform: [{ scale: pressed ? 0.9 : 1 }],
                  })} />
              ))}
            </View>

            <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 18, marginBottom: 8 }}>
              {t.create.voice}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {voiceOpts.map((v) => {
                const on = voice.includes(v.id);
                return (
                  <Pressable key={v.id} onPress={() => setVoice((vv) => (on ? vv.filter((x) => x !== v.id) : [...vv, v.id]))}
                    style={({ pressed }) => ({
                      borderWidth: 1, borderColor: on ? theme.brand : theme.hair,
                      backgroundColor: on ? theme.brand + "14" : theme.glassHi,
                      borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14,
                      transform: [{ scale: pressed ? 0.95 : 1 }],
                    })}>
                    <Text style={{ fontFamily: FONT.sansSemi, fontSize: 13, color: on ? theme.brand : theme.ink2 }}>
                      {lang === "en" ? v.en : v.id_}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {/* LANGKAH 4 — selesai */}
        {step === 4 && (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <LinearGradient colors={[theme.brandDk, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 86, height: 86, borderRadius: 26, alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
              <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M4 12l5 5L20 6" />
              </Svg>
            </LinearGradient>
            <Text style={{ fontFamily: FONT.display, fontSize: 30, letterSpacing: -0.9, color: theme.ink, textAlign: "center" }}>
              {lang === "en" ? "You're all set." : "Semua siap."}
            </Text>
            <Text style={{ fontFamily: FONT.sans, fontSize: 14, color: theme.ink2, marginTop: 12, lineHeight: 21, maxWidth: 290, textAlign: "center" }}>
              {lang === "en"
                ? `${connectedCount} channels connected · ${brandName} brand kit saved. Create your first campaign in under 5 minutes.`
                : `${connectedCount} channel terhubung · brand kit ${brandName} tersimpan. Buat kampanye pertama dalam 5 menit.`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Navigasi bawah */}
      <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 16 + insets.bottom }}>
        {step > 0 && step < STEPS - 1 && (
          <GhostButton theme={theme} onPress={back} style={{ paddingHorizontal: 18 }}>{t.onboard.back}</GhostButton>
        )}
        {step < STEPS - 1 ? (
          <PrimaryButton theme={theme} onPress={next} style={{ flex: 1 }}>
            {step === 0 ? t.onboard.getStarted : step === 2 ? `${t.onboard.continue} · ${connectedCount}/${BR_PLATFORM_ORDER.length}` : t.onboard.continue}
          </PrimaryButton>
        ) : (
          <PrimaryButton theme={theme} onPress={finish} style={{ flex: 1 }}>{t.onboard.finish} →</PrimaryButton>
        )}
      </View>
    </BrAppShell>
  );
}
