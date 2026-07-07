// Kerangka layar BrandReel — porting BrAppShell/BrAppHeader/PrimaryButton/
// GhostButton/FloatingActionBar/PlatformDots dari prototype br-screens-home.jsx.

import React from "react";
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import type { Theme } from "../../theme/tokens";
import { BR_PLATFORMS, BR_PLATFORM_ORDER } from "../../theme/tokens";
import type { Campaign } from "../../data/campaigns";
import { useBr } from "../../context/BrContext";
import { FONT } from "./fonts";

// Latar ornamen — blob gradasi lembut di belakang kaca (padanan GlassBackdrop).
export function GlassBackdrop({ theme, density = "soft" }: { theme: Theme; density?: "soft" | "rich" }) {
  const blobs = density === "rich"
    ? [
        { c: theme.brand, o: 0.30, x: "8%", y: "6%", r: 230 },
        { c: theme.accent, o: 0.24, x: "88%", y: "4%", r: 260 },
        { c: theme.glow, o: 0.24, x: "60%", y: "88%", r: 200 },
      ]
    : [
        { c: theme.brand, o: 0.13, x: "4%", y: "8%", r: 190 },
        { c: theme.accent, o: 0.13, x: "92%", y: "86%", r: 190 },
      ];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <Defs>
          {blobs.map((b, i) => (
            <RadialGradient key={i} id={`blob${i}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={b.c} stopOpacity={b.o} />
              <Stop offset="62%" stopColor={b.c} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {blobs.map((b, i) => (
          <Circle key={i} cx={b.x} cy={b.y} r={b.r} fill={`url(#blob${i})`} />
        ))}
      </Svg>
    </View>
  );
}

// Shell layar — kanvas + backdrop, mengisi area layar.
export function BrAppShell({ theme, density = "soft", style, children }: {
  theme: Theme;
  density?: "soft" | "rich";
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}) {
  return (
    <View style={[{ flex: 1, backgroundColor: theme.canvas, overflow: "hidden" }, style]}>
      <GlassBackdrop theme={theme} density={density} />
      <View style={{ flex: 1, minHeight: 0 }}>{children}</View>
    </View>
  );
}

// Header atas — judul + subjudul eyebrow + tombol kembali opsional.
export function BrAppHeader({ title, subtitle, color, onBack, right }: {
  title: string;
  subtitle?: string;
  color?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const { theme } = useBr();
  return (
    <View style={{
      flexDirection: "row", alignItems: "center", gap: 12,
      paddingHorizontal: 14, paddingTop: 12, paddingBottom: 11,
      backgroundColor: theme.glassHi, borderBottomWidth: 1, borderBottomColor: theme.hair2, zIndex: 5,
    }}>
      {onBack ? (
        <Pressable onPress={onBack} accessibilityLabel="back" style={({ pressed }) => ({
          width: 32, height: 32, borderRadius: 999, backgroundColor: theme.canvasAlt,
          alignItems: "center", justifyContent: "center", transform: [{ scale: pressed ? 0.95 : 1 }],
        })}>
          <Text style={{ fontFamily: FONT.mono, fontSize: 17, color: theme.ink, lineHeight: 19 }}>‹</Text>
        </Pressable>
      ) : (
        <View style={{ width: 4 }} />
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        {!!subtitle && (
          <Text numberOfLines={1} style={{ fontFamily: FONT.mono, fontSize: 9, color: color ?? theme.brand, letterSpacing: 1.5, textTransform: "uppercase" }}>
            {subtitle}
          </Text>
        )}
        <Text numberOfLines={1} style={{ fontFamily: FONT.display, fontSize: 18, color: theme.ink, letterSpacing: -0.3, marginTop: 2 }}>
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

// Tombol utama — gradasi brand→accent, lebar penuh.
export function PrimaryButton({ children, onPress, theme, colors, style }: {
  children: React.ReactNode;
  onPress?: () => void;
  theme: Theme;
  colors?: [string, string];
  style?: StyleProp<ViewStyle>;
}) {
  const [c1, c2] = colors ?? [theme.brand, theme.accent];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.975 : 1 }] }, style]}>
      <LinearGradient
        colors={[c1, c2]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.4 }}
        style={{ paddingVertical: 14, paddingHorizontal: 18, borderRadius: 15, alignItems: "center" }}
      >
        <Text style={{ fontFamily: FONT.sansBold, fontSize: 15, color: "#fff", letterSpacing: 0.2 }}>{children}</Text>
      </LinearGradient>
    </Pressable>
  );
}

// Tombol sekunder kaca.
export function GhostButton({ children, onPress, theme, style }: {
  children: React.ReactNode;
  onPress?: () => void;
  theme: Theme;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{
      borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glass,
      paddingVertical: 12, paddingHorizontal: 16, borderRadius: 13, alignItems: "center",
      transform: [{ scale: pressed ? 0.975 : 1 }],
    }, style]}>
      <Text style={{ fontFamily: FONT.sansSemi, fontSize: 14, color: theme.ink }}>{children}</Text>
    </Pressable>
  );
}

// Bilah aksi bawah mengambang (di atas nav).
export function FloatingActionBar({ children }: { children: React.ReactNode }) {
  const { theme } = useBr();
  return (
    <View style={{
      paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12,
      backgroundColor: theme.glassHi, borderTopWidth: 1, borderTopColor: theme.hair2,
      flexDirection: "row", gap: 8, zIndex: 5,
    }}>
      {children}
    </View>
  );
}

// Baris kotak status platform per kampanye (padanan PlatformDots).
export function PlatformDots({ campaign, theme, size = 22 }: { campaign: Campaign; theme: Theme; size?: number }) {
  const stateColor: Record<string, string> = { posted: theme.pos, queued: theme.ink3, retry: theme.warn, failed: theme.neg };
  return (
    <View style={{ flexDirection: "row", gap: 5 }}>
      {BR_PLATFORM_ORDER.map((pid) => {
        const p = BR_PLATFORMS[pid];
        const st = campaign.platforms[pid];
        const dimmed = !st;
        const col = st ? (stateColor[st.state] ?? theme.ink3) : theme.ink3;
        return (
          <View key={pid} style={{
            width: size, height: size, borderRadius: size * 0.3,
            backgroundColor: dimmed ? theme.hair2 : p.color + "1E",
            borderWidth: 1, borderColor: dimmed ? theme.hair2 : p.color + "40",
            alignItems: "center", justifyContent: "center", opacity: dimmed ? 0.5 : 1,
          }}>
            <Text style={{ fontFamily: FONT.display, color: dimmed ? theme.ink3 : p.color, fontSize: size * 0.4, letterSpacing: -0.5 }}>
              {p.short}
            </Text>
            {st && st.state !== "queued" && (
              <View style={{
                position: "absolute", right: -2, top: -2, width: 7, height: 7, borderRadius: 999,
                backgroundColor: col, borderWidth: 1.5, borderColor: theme.glassHi,
              }} />
            )}
          </View>
        );
      })}
    </View>
  );
}
