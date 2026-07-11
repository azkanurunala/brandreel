// PlatformPicker — pilih platform tujuan (rasio video + akun posting).
// Redesign: logo asli + badge status render per-platform, ganti chip teks
// "TT"/"IG" yang keliatan sama persis dengan HookPicker padahal beda fungsi.
// Lihat docs/superpowers/specs/2026-07-11-detail-screen-ux-design.md.

import React from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { BR_PLATFORMS, type PlatformId } from "../../theme/tokens";
import type { Theme } from "../../theme/tokens";
import { PlatformBadge } from "./BrandGlyph";
import { FONT } from "./fonts";

export type RenderBadgeState = "ready" | "pending" | "failed" | null;

function StatusDot({ theme, state }: { theme: Theme; state: RenderBadgeState }) {
  if (!state) return null;
  if (state === "ready") {
    return (
      <View style={{
        position: "absolute", bottom: -2, right: -2, width: 15, height: 15, borderRadius: 999,
        backgroundColor: theme.pos, borderWidth: 2, borderColor: theme.canvas,
        alignItems: "center", justifyContent: "center",
      }}>
        <Svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={4} strokeLinecap="round">
          <Path d="M4 12l5 5L20 6" />
        </Svg>
      </View>
    );
  }
  if (state === "failed") {
    return (
      <View style={{
        position: "absolute", bottom: -2, right: -2, width: 15, height: 15, borderRadius: 999,
        backgroundColor: theme.neg, borderWidth: 2, borderColor: theme.canvas,
        alignItems: "center", justifyContent: "center",
      }}>
        <Text style={{ color: "#fff", fontSize: 9, fontFamily: FONT.sansXBold, lineHeight: 10 }}>!</Text>
      </View>
    );
  }
  // pending (queued/processing)
  return (
    <View style={{
      position: "absolute", bottom: -2, right: -2, width: 15, height: 15, borderRadius: 999,
      backgroundColor: theme.warn, borderWidth: 2, borderColor: theme.canvas,
      alignItems: "center", justifyContent: "center",
    }}>
      <Text style={{ color: "#fff", fontSize: 9, fontFamily: FONT.monoSemi, lineHeight: 10 }}>⋯</Text>
    </View>
  );
}

export function PlatformPicker({
  theme, platforms, active, statusFor, onSelect,
}: {
  theme: Theme;
  platforms: PlatformId[];
  active: PlatformId;
  statusFor: (pid: PlatformId) => RenderBadgeState;
  onSelect: (pid: PlatformId) => void;
}) {
  return (
    <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
      {platforms.map((pid) => {
        const on = pid === active;
        const p = BR_PLATFORMS[pid];
        return (
          <Pressable key={pid} onPress={() => onSelect(pid)}
            style={({ pressed }) => ({
              alignItems: "center", gap: 4, opacity: pressed ? 0.85 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}>
            <View style={{
              borderRadius: 14, padding: on ? 2 : 0,
              borderWidth: on ? 1.5 : 0, borderColor: on ? p.color : "transparent",
            }}>
              <View style={{ position: "relative" }}>
                <PlatformBadge pid={pid} size={40} solid={on} />
                <StatusDot theme={theme} state={statusFor(pid)} />
              </View>
            </View>
            <Text style={{ fontFamily: on ? FONT.sansBold : FONT.sansMed, fontSize: 9.5, color: on ? p.color : theme.ink3 }}>
              {p.short}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
