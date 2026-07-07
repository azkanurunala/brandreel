// Glyph merek platform + SSO — porting SVG path dari prototype BR_BRAND_GLYPH.

import React from "react";
import { View, Text } from "react-native";
import Svg, { Path, Rect, Circle } from "react-native-svg";
import { BR_PLATFORMS, type PlatformId } from "../../theme/tokens";
import { FONT } from "./fonts";

export type GlyphId = PlatformId | "google" | "apple";

export function BrandGlyph({ pid, size = 20, color = "#000" }: { pid: GlyphId; size?: number; color?: string }) {
  switch (pid) {
    case "tiktok":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M14.7 2h2.7c.2 1.6 1.1 3 2.7 3.6.5.2 1.1.3 1.6.3v2.7c-1.5 0-2.9-.5-4.1-1.3v6c0 3.3-2.7 6-6 5.7-2.7-.2-4.8-2.5-4.8-5.3 0-3 2.5-5.5 5.5-5.3.2 0 .4 0 .6.1v2.8c-.2-.1-.5-.1-.7-.1-1.4 0-2.6 1.2-2.5 2.7.1 1.3 1.2 2.4 2.5 2.3 1.3 0 2.3-1.1 2.3-2.5V2z" />
        </Svg>
      );
    case "instagram":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Rect x={3} y={3} width={18} height={18} rx={5.2} />
          <Circle cx={12} cy={12} r={4.2} />
          <Circle cx={17.2} cy={6.8} r={1.2} fill={color} stroke="none" />
        </Svg>
      );
    case "youtube":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
          <Rect x={2} y={5.5} width={20} height={13} rx={3.6} />
          <Path d="M10.2 9.3l5 2.7-5 2.7z" fill={color} stroke="none" />
        </Svg>
      );
    case "linkedin":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M4.98 3.5A2.5 2.5 0 1 1 0 3.5a2.5 2.5 0 0 1 4.98 0zM.5 8.3h4.4V23H.5V8.3zM8.3 8.3h4.2v2h.1c.6-1.1 2-2.3 4.3-2.3 4.5 0 5.4 3 5.4 6.8V23h-4.5v-6.2c0-1.5 0-3.4-2.1-3.4s-2.4 1.6-2.4 3.3V23H8.3V8.3z" />
        </Svg>
      );
    case "twitter":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M17.3 3h3.3l-7.2 8.2L22 21h-6.6l-5.2-6.8L4.3 21H1l7.7-8.8L2 3h6.8l4.7 6.2L17.3 3zm-1.2 16h1.8L8 4.8H6.1L16.1 19z" />
        </Svg>
      );
    case "facebook":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.8 3.7-3.8 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.5V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
        </Svg>
      );
    case "google":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.6z" />
          <Path fill="#34A853" d="M12 24c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.4 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3C3.7 21.4 7.6 24 12 24z" />
          <Path fill="#FBBC05" d="M5.6 14.7a7.2 7.2 0 0 1 0-4.6V7H1.8a12 12 0 0 0 0 10.6l3.8-2.9z" />
          <Path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3C17.7 1.2 15.1 0 12 0 7.6 0 3.7 2.6 1.8 6.4l3.8 2.9C6.5 6.7 9 4.8 12 4.8z" />
        </Svg>
      );
    case "apple":
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <Path d="M16.4 12.6c0-2.4 1.9-3.5 2-3.6-1.1-1.6-2.8-1.8-3.4-1.9-1.5-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.4 1.1 0 1.6-.7 3-.7s1.7.7 2.9.7 2-1.1 2.7-2.2c.9-1.3 1.2-2.5 1.2-2.6-.1 0-2.4-.9-2.4-3.5zM14.2 5.2c.6-.8 1-1.8.9-2.9-.9.1-2 .6-2.7 1.4-.6.7-1.1 1.7-.9 2.8 1 .1 2-.5 2.7-1.3z" />
        </Svg>
      );
    default:
      return null;
  }
}

// Badge glyph platform (kotak, glassy) — padanan PlatformBadge prototype.
export function PlatformBadge({ pid, size = 30, solid = false }: { pid: PlatformId; size?: number; solid?: boolean }) {
  const p = BR_PLATFORMS[pid];
  if (!p) return null;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: solid ? p.color : p.color + "1C",
        borderWidth: 1,
        borderColor: solid ? p.color : p.color + "44",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <BrandGlyph pid={pid} size={size * 0.56} color={solid ? "#fff" : p.color} />
    </View>
  );
}

// Logo glyph kampanye (dua huruf berwarna) — dipakai kartu kampanye.
export function LogoGlyph({ glyph, color, size = 40 }: { glyph: string; color: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: color + "1C",
        borderWidth: 1,
        borderColor: color + "44",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontFamily: FONT.monoSemi, fontSize: size * 0.34, color, letterSpacing: 0.3 }}>{glyph}</Text>
    </View>
  );
}
