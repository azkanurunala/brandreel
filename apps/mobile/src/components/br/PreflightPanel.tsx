// PreflightPanel — checklist pra-kirim. Redesign: baris yang gagal sekarang
// bisa diketuk buat langsung ke perbaikannya (dulu cuma teks read-only, user
// harus nebak sendiri harus scroll/klik ke mana).
// Lihat docs/superpowers/specs/2026-07-11-detail-screen-ux-design.md.

import React from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import type { Theme } from "../../theme/tokens";
import type { Lang } from "../../i18n/strings";
import type { PreflightRow } from "../../data/campaigns";
import { GlassChip, GlassPanel } from "./Glass";
import { FONT } from "./fonts";

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color }}>
      {children}
    </Text>
  );
}

export function PreflightPanel({
  theme, lang, title, rows, allClear, onFixRow,
}: {
  theme: Theme;
  lang: Lang;
  title: string;
  rows: PreflightRow[];
  allClear: boolean;
  onFixRow: (k: string) => void;
}) {
  return (
    <>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingTop: 16, paddingHorizontal: 4, paddingBottom: 8 }}>
        <Eyebrow color={theme.ink3}>{title}</Eyebrow>
        <GlassChip theme={theme} color={allClear ? theme.pos : theme.neg}>
          {allClear
            ? (lang === "en" ? "All clear" : "Semua aman")
            : (() => {
                const n = rows.filter((r) => !r.ok).length;
                return lang === "en" ? `${n} issue${n === 1 ? "" : "s"}` : `${n} masalah`;
              })()}
        </GlassChip>
      </View>
      <GlassPanel theme={theme} padding={4} tone="solid">
        {rows.map((r, i) => (
          <Pressable
            key={r.k}
            onPress={() => !r.ok && onFixRow(r.k)}
            disabled={r.ok}
            style={({ pressed }) => ({
              flexDirection: "row", alignItems: "center", gap: 11,
              paddingVertical: 10, paddingHorizontal: 11,
              borderTopWidth: i ? 1 : 0, borderTopColor: theme.hair2,
              opacity: pressed ? 0.7 : 1,
            })}>
            <View style={{
              width: 20, height: 20, borderRadius: 999,
              backgroundColor: r.ok ? theme.pos + "1E" : theme.neg + "1E",
              borderWidth: 1, borderColor: (r.ok ? theme.pos : theme.neg) + "55",
              alignItems: "center", justifyContent: "center",
            }}>
              {r.ok ? (
                <Svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke={theme.pos} strokeWidth={3.2} strokeLinecap="round">
                  <Path d="M4 12l5 5L20 6" />
                </Svg>
              ) : (
                <Text style={{ color: theme.neg, fontSize: 12, fontFamily: FONT.sansXBold }}>!</Text>
              )}
            </View>
            <Text style={{ flex: 1, fontFamily: FONT.sans, fontSize: 12, color: r.ok ? theme.ink2 : theme.neg, lineHeight: 16 }}>
              {lang === "en" ? r.label_en : r.label_id}
            </Text>
            {!r.ok && (
              <Text style={{ fontFamily: FONT.sansBold, fontSize: 11, color: theme.neg }}>
                {lang === "en" ? "Fix" : "Benerin"} →
              </Text>
            )}
          </Pressable>
        ))}
      </GlassPanel>
    </>
  );
}
