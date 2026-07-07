// Primitif kaca (glassmorphism) — padanan GlassPanel/GlassChip/BrandMark
// dari prototype assets/br-theme.jsx, versi React Native.

import React from "react";
import { Platform, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { Theme } from "../../theme/tokens";
import { FONT } from "./fonts";

// Panel kaca — blur asli hanya di web (backdrop-filter); di native cukup
// lapisan translusen (visual tetap dekat prototype tanpa biaya BlurView per kartu).
export function GlassPanel({
  theme, tone = "light", padding = 16, style, children,
}: {
  theme: Theme;
  tone?: "light" | "solid" | "dim";
  padding?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  const bg = tone === "solid" ? theme.glassHi : tone === "dim" ? theme.glassDk : theme.glass;
  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderWidth: 1,
          borderColor: theme.hair,
          borderRadius: 16,
          padding,
        },
        Platform.OS === "web" ? ({ backdropFilter: "blur(22px) saturate(150%)" } as unknown as ViewStyle) : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// Pill / chip mono uppercase.
export function GlassChip({
  theme, color, solid = false, style, textStyle, children,
}: {
  theme: Theme;
  color?: string;
  solid?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}) {
  const c = color ?? theme.ink2;
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: solid ? c : c + "16",
          borderColor: solid ? c : c + "3A",
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: solid ? "#fff" : c },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {children}
      </Text>
    </View>
  );
}

// Wordmark "BrandReel" dengan reel-dot gradasi.
export function BrandMark({ theme, size = 22, mono = false }: { theme: Theme; size?: number; mono?: boolean }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: size * 0.34 }}>
      <LinearGradient
        colors={[theme.brand, theme.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size * 1.02,
          height: size * 1.02,
          borderRadius: size * 1.02 * 0.32,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: theme.brand,
          shadowOpacity: 0.53,
          shadowRadius: 7,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <View style={{ width: size * 0.32, height: size * 0.32, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.92)" }} />
      </LinearGradient>
      {!mono && (
        <Text style={{ fontFamily: FONT.display, fontSize: size, color: theme.ink, letterSpacing: -0.6, lineHeight: size * 1.15 }}>
          Brand<Text style={{ color: theme.brand }}>Reel</Text>
        </Text>
      )}
    </View>
  );
}

// Eyebrow mono uppercase kecil.
export function Eyebrow({ color, children, style }: { color: string; children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderWidth: 1,
    borderRadius: 999,
  },
  chipText: {
    fontFamily: FONT.mono,
    fontSize: 9.5,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    fontWeight: "600",
  },
});
