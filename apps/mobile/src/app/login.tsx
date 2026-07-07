// Login — porting BrLogin dari prototype br-screens-onboard.jsx.
// Fase 2: email/sandi → OTP 6 digit → verifikasi (simulasi; auth asli
// menyusul saat backend sesi siap).

import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBr } from "@/context/BrContext";
import { BR_SSO } from "@/theme/tokens";
import { BrAppShell, GhostButton, PrimaryButton } from "@/components/br/AppChrome";
import { BrandMark } from "@/components/br/Glass";
import { BrandGlyph } from "@/components/br/BrandGlyph";
import { FONT } from "@/components/br/fonts";

function LoginField({ label, value, onChange, secret }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  secret?: boolean;
}) {
  const { theme } = useBr();
  return (
    <View style={{ gap: 5 }}>
      <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        secureTextEntry={secret}
        autoCapitalize="none"
        style={{
          backgroundColor: theme.glassHi, borderWidth: 1, borderColor: theme.hair, borderRadius: 12,
          paddingVertical: 12, paddingHorizontal: 14,
          fontFamily: FONT.mono, fontSize: 14, color: theme.ink,
        }}
      />
    </View>
  );
}

export default function LoginScreen() {
  const { theme, lang, t } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = t.login;

  const [stepN, setStepN] = useState(0);
  const [email, setEmail] = useState("inez@ecogoods.id");
  const [pass, setPass] = useState("password");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (stepN === 1) otpRefs.current[0]?.focus();
  }, [stepN]);

  function success() {
    router.replace("/home");
  }

  function setDigit(i: number, v: string) {
    const d = v.slice(-1).replace(/\D/g, "");
    const nx = [...otp];
    nx[i] = d;
    setOtp(nx);
    if (d && i < 5) otpRefs.current[i + 1]?.focus();
    if (nx.every((x) => x.length === 1)) {
      setStepN(2);
      setTimeout(success, 1200);
    }
  }

  function demoOtp() {
    setOtp(["4", "9", "1", "7", "2", "6"]);
    setStepN(2);
    setTimeout(success, 1200);
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

        <View style={{ marginTop: 22, flex: 1, justifyContent: "flex-end" }}>
          {stepN === 0 && (
            <View style={{ gap: 14 }}>
              {/* SSO */}
              <View style={{ gap: 9 }}>
                {(["google", "apple"] as const).map((id) => {
                  const p = BR_SSO[id];
                  return (
                    <Pressable key={id} onPress={success}
                      style={({ pressed }) => ({
                        backgroundColor: p.bg,
                        borderWidth: p.bordered ? 1 : 0, borderColor: theme.hair,
                        borderRadius: 13, paddingVertical: 12,
                        flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 10,
                        transform: [{ scale: pressed ? 0.975 : 1 }],
                      })}>
                      <BrandGlyph pid={id} size={18} color={p.ink} />
                      <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: p.ink }}>
                        {lang === "en" ? `Continue with ${p.name}` : `Lanjut dengan ${p.name}`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={{ gap: 12 }}>
                <LoginField label={s.email} value={email} onChange={setEmail} />
                <LoginField label={s.pass} value={pass} onChange={setPass} secret />
                <PrimaryButton theme={theme} onPress={() => setStepN(1)} style={{ marginTop: 4 }}>{s.continue}</PrimaryButton>
                <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 1.3, textAlign: "center", marginTop: 4, textTransform: "uppercase" }}>
                  OAuth · HTTPS · 2FA
                </Text>
              </View>
            </View>
          )}

          {stepN === 1 && (
            <View>
              <Text style={{ fontFamily: FONT.monoSemi, fontSize: 10, color: theme.brand, letterSpacing: 1.5, textTransform: "uppercase" }}>{s.otpSent}</Text>
              <Text style={{ fontFamily: FONT.sans, fontSize: 13, color: theme.ink2, marginTop: 6 }}>{s.otpSub}</Text>
              <View style={{ flexDirection: "row", gap: 7, marginTop: 16, justifyContent: "space-between" }}>
                {otp.map((d, i) => (
                  <TextInput
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    value={d}
                    onChangeText={(v) => setDigit(i, v)}
                    onKeyPress={(e) => {
                      if (e.nativeEvent.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
                    }}
                    maxLength={1}
                    keyboardType="number-pad"
                    style={{
                      width: 44, height: 56, borderRadius: 13,
                      borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassHi,
                      textAlign: "center", fontFamily: FONT.monoSemi, fontSize: 22, color: theme.ink,
                    }}
                  />
                ))}
              </View>
              <PrimaryButton theme={theme} onPress={demoOtp} style={{ marginTop: 16 }}>{s.demoOtp}</PrimaryButton>
              <GhostButton theme={theme} onPress={() => setStepN(0)} style={{ marginTop: 8 }}>← {t.onboard.back}</GhostButton>
            </View>
          )}

          {stepN === 2 && (
            <View style={{ alignItems: "center", paddingVertical: 24 }}>
              <ActivityIndicator size="large" color={theme.brand} />
              <Text style={{ fontFamily: FONT.display, fontSize: 22, letterSpacing: -0.5, color: theme.ink, marginTop: 16 }}>{s.verifying}</Text>
              <Text style={{ fontFamily: FONT.mono, fontSize: 10, color: theme.ink3, letterSpacing: 1.4, marginTop: 6, textTransform: "uppercase" }}>
                OTP · HTTPS
              </Text>
            </View>
          )}
        </View>
      </View>
    </BrAppShell>
  );
}
