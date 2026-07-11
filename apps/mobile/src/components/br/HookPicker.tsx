// HookPicker — pilih sudut cerita/skrip. Diekstrak dari detail/[id].tsx
// as-is (style kartu sudah cukup beda dari PlatformPicker), biar file utama
// gak makin gede tiap kali redesign layar detail ditambah.
// Lihat docs/superpowers/specs/2026-07-11-detail-screen-ux-design.md.

import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BR_HOOKS, BR_HOOK_ORDER, type HookId } from "../../theme/tokens";
import type { Theme } from "../../theme/tokens";
import type { Lang } from "../../i18n/strings";
import { FONT } from "./fonts";

export function HookPicker({
  theme, lang, active, topHook, onSelect,
}: {
  theme: Theme;
  lang: Lang;
  active: HookId;
  topHook: HookId | null | undefined;
  onSelect: (h: HookId) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingBottom: 4 }}>
      {BR_HOOK_ORDER.map((hid) => {
        const h = BR_HOOKS[hid];
        const on = hid === active;
        const isTop = hid === topHook;
        return (
          <Pressable key={hid} onPress={() => onSelect(hid)}
            style={({ pressed }) => ({
              borderWidth: 1, borderColor: on ? h.color : theme.hair,
              backgroundColor: on ? h.color + "14" : theme.glassHi,
              borderRadius: 13, paddingVertical: 9, paddingHorizontal: 12, minWidth: 124,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
              <View style={{ width: 22, height: 22, borderRadius: 7, backgroundColor: h.color, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9, color: "#fff" }}>{h.glyph}</Text>
              </View>
              <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9, color: on ? h.color : theme.ink3, letterSpacing: 0.6 }}>
                HOOK {h.num}
              </Text>
              {isTop && <Text style={{ marginLeft: "auto", fontSize: 10, color: theme.warn }}>★</Text>}
            </View>
            <Text style={{ fontFamily: FONT.sansSemi, fontSize: 12, color: theme.ink, marginTop: 6, lineHeight: 13 }}>
              {lang === "en" ? h.key_en : h.key_id}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
