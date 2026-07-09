// Login — porting BrLogin dari prototype br-screens-onboard.jsx.
// Fase 4: Google Sign-In asli (lib/googleAuth.ts) — sesi BrandReel dibuat
// beneran lewat backend, bukan simulasi OTP lokal lagi. Apple SSO belum
// diimplementasi server-side, jadi tombolnya jujur bilang belum tersedia
// daripada pura-pura berhasil.

import React, { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBr } from "@/context/BrContext";
import { BR_SSO } from "@/theme/tokens";
import { BrAppShell } from "@/components/br/AppChrome";
import { BrandMark } from "@/components/br/Glass";
import { BrandGlyph } from "@/components/br/BrandGlyph";
import { FONT } from "@/components/br/fonts";
import { loginWithGoogle } from "@/lib/googleAuth";
import { Alert } from "@/lib/alert";

export default function LoginScreen() {
  const { theme, lang, t, reloadAccount } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = t.login;
  const [busy, setBusy] = useState<"google" | null>(null);

  async function handleGoogle() {
    setBusy("google");
    try {
      const ok = await loginWithGoogle();
      if (ok) { await reloadAccount(); router.replace("/home"); }
      else Alert.alert(lang === "en" ? "Login failed" : "Gagal masuk", lang === "en" ? "Try again." : "Coba lagi.");
    } catch (e: any) {
      Alert.alert(lang === "en" ? "Login failed" : "Gagal masuk", e.message ?? String(e));
    } finally {
      setBusy(null);
    }
  }

  function handleApple() {
    Alert.alert(
      lang === "en" ? "Not available yet" : "Belum tersedia",
      lang === "en" ? "Apple Sign-In isn't wired up on the server yet — use Google for now." : "Apple Sign-In belum disambungkan di server — pakai Google dulu."
    );
  }

  return (
    <BrAppShell theme={theme} density="rich">
      <View style={{ flex: 1, paddingTop: insets.top + 30, paddingHorizontal: 24, paddingBottom: 20 + insets.bottom }}>
        <BrandMark theme={theme} size={22} />
        <View style={{ marginTop: 34 }}>
          <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color: theme.brand }}>
            {t.tagline}
          </Text>
          <Text style={{ fontFamily: FONT.display, fontSize: 40, lineHeight: 40, letterSpacing: -1.3, color: theme.ink, marginTop: 10 }}>
            {s.title}
          </Text>
          <Text style={{ fontFamily: FONT.sans, fontSize: 13.5, color: theme.ink2, marginTop: 14 }}>{s.sub}</Text>
        </View>

        <View style={{ marginTop: 22, flex: 1, justifyContent: "flex-end", gap: 14 }}>
          {(["google", "apple"] as const).map((id) => {
            const p = BR_SSO[id];
            const isGoogle = id === "google";
            const isBusy = busy === "google" && isGoogle;
            return (
              <Pressable key={id} onPress={isGoogle ? handleGoogle : handleApple} disabled={isBusy}
                style={({ pressed }) => ({
                  backgroundColor: p.bg,
                  borderWidth: p.bordered ? 1 : 0, borderColor: theme.hair,
                  borderRadius: 13, paddingVertical: 12,
                  flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 10,
                  opacity: isBusy ? 0.7 : 1,
                  transform: [{ scale: pressed ? 0.975 : 1 }],
                })}>
                {isBusy ? (
                  <ActivityIndicator size="small" color={p.ink} />
                ) : (
                  <BrandGlyph pid={id} size={18} color={p.ink} />
                )}
                <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: p.ink }}>
                  {lang === "en" ? `Continue with ${p.name}` : `Lanjut dengan ${p.name}`}
                </Text>
              </Pressable>
            );
          })}
          <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 1.3, textAlign: "center", marginTop: 4, textTransform: "uppercase" }}>
            OAuth · HTTPS
          </Text>
        </View>
      </View>
    </BrAppShell>
  );
}
