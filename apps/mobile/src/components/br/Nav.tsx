// Navigasi adaptif — porting NavIcon/BottomNav (br-screens-home.jsx) dan
// BrSidebar (br-responsive.jsx). Tab bar bawah: mobile & tablet portrait;
// sidebar: tablet landscape (rail ikon) & desktop (penuh) — CLAUDE.md aturan 6.

import React from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBr } from "../../context/BrContext";
import { brCanAccess } from "../../data/personas";
import { BrandMark } from "./Glass";
import { FONT } from "./fonts";

export type TabId = "home" | "insights" | "create" | "inbox" | "profile";

export function NavIcon({ kind, color, active, size = 23 }: { kind: string; color: string; active: boolean; size?: number }) {
  const common = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    stroke: color, strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    opacity: active ? 1 : 0.55,
  };
  switch (kind) {
    case "home":
      return <Svg {...common}><Path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z" /></Svg>;
    case "insights":
      return <Svg {...common}><Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Svg>;
    case "inbox":
      return <Svg {...common}><Path d="M21 12a8 8 0 1 1-3-6.3L21 4l-1 4.5A8 8 0 0 1 21 12z" /></Svg>;
    case "profile":
      return <Svg {...common}><Circle cx={12} cy={8} r={4} /><Path d="M4 21a8 8 0 0 1 16 0" /></Svg>;
    default:
      return null;
  }
}

function PlusIcon({ size = 22, stroke = "#fff" }: { size?: number; stroke?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round">
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

const BR_NAV_TABS: { id: TabId; icon: string; needs?: "analytics" }[] = [
  { id: "home", icon: "home" },
  { id: "insights", icon: "insights", needs: "analytics" },
  { id: "create", icon: "create" },
  { id: "inbox", icon: "inbox" },
  { id: "profile", icon: "profile" },
];

// ── Tab bar bawah (mobile / tablet portrait) ──
export function BottomNav({ activeTab, onTab }: { activeTab: TabId; onTab: (t: TabId) => void }) {
  const { theme, t, persona } = useBr();
  const insets = useSafeAreaInsets();
  return (
    <View style={{
      flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end",
      paddingTop: 8, paddingHorizontal: 6, paddingBottom: 10 + insets.bottom,
      backgroundColor: theme.glassHi, borderTopWidth: 1, borderTopColor: theme.hair, zIndex: 6,
    }}>
      {BR_NAV_TABS.map((tab) => {
        if (tab.needs && !brCanAccess(persona, tab.needs)) return null;
        if (tab.id === "create") {
          return (
            <Pressable key="create" onPress={() => onTab("create")} accessibilityLabel={t.nav.create}
              style={({ pressed }) => ({ flex: 1, alignItems: "center", gap: 4, paddingHorizontal: 4, transform: [{ scale: pressed ? 0.95 : 1 }] })}>
              <LinearGradient colors={[theme.brand, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.6 }}
                style={{
                  width: 46, height: 36, borderRadius: 13, marginTop: -10,
                  alignItems: "center", justifyContent: "center",
                  borderWidth: 2, borderColor: theme.glassHi,
                  shadowColor: theme.brand, shadowOpacity: 0.8, shadowRadius: 9, shadowOffset: { width: 0, height: 8 },
                }}>
                <PlusIcon />
              </LinearGradient>
              <Text style={{ fontFamily: FONT.sansBold, fontSize: 10, color: theme.brand }}>{t.nav.create}</Text>
            </Pressable>
          );
        }
        const active = tab.id === activeTab;
        const color = active ? theme.brand : theme.ink3;
        return (
          <Pressable key={tab.id} onPress={() => onTab(tab.id)}
            style={({ pressed }) => ({ flex: 1, alignItems: "center", gap: 3, paddingTop: 4, paddingHorizontal: 4, transform: [{ scale: pressed ? 0.95 : 1 }] })}>
            <NavIcon kind={tab.icon} color={active ? theme.brand : theme.ink3} active={active} />
            <Text style={{ fontFamily: active ? FONT.sansBold : FONT.sansMed, fontSize: 10, color }}>{t.nav[tab.id]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ── Sidebar vertikal (tablet landscape = rail ikon · desktop = penuh) ──
export function BrSidebar({ rail, activeTab, onTab }: { rail: boolean; activeTab: TabId; onTab: (t: TabId) => void }) {
  const { theme, t, persona, account } = useBr();
  const identityLabel = account ? (account.name ?? account.email) : "…";
  const identityInitial = account ? (account.name?.[0] ?? account.email[0]).toUpperCase() : "…";
  const identityPlan = account ? account.plan.toUpperCase() : "···";
  const items = [
    { id: "home" as TabId, icon: "home", label: t.nav.home },
    { id: "insights" as TabId, icon: "insights", label: t.nav.insights, needs: "analytics" as const },
    { id: "inbox" as TabId, icon: "inbox", label: t.nav.inbox },
    { id: "profile" as TabId, icon: "profile", label: t.nav.profile },
  ].filter((it) => !it.needs || brCanAccess(persona, it.needs));

  return (
    <View style={{
      width: rail ? 68 : 232, backgroundColor: theme.glassHi,
      borderRightWidth: 1, borderRightColor: theme.hair,
      paddingVertical: rail ? 16 : 20, paddingHorizontal: rail ? 0 : 14, gap: 5, zIndex: 6,
    }}>
      <View style={{ alignItems: rail ? "center" : "flex-start", paddingBottom: rail ? 14 : 18, paddingHorizontal: rail ? 0 : 6, paddingTop: 2 }}>
        <BrandMark theme={theme} size={rail ? 24 : 21} mono={rail} />
      </View>

      <Pressable onPress={() => onTab("create")} style={({ pressed }) => ({ marginBottom: 8, transform: [{ scale: pressed ? 0.975 : 1 }] })}>
        <LinearGradient colors={[theme.brand, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.6 }}
          style={{
            borderRadius: 13, paddingVertical: 11, paddingHorizontal: rail ? 0 : 14,
            flexDirection: "row", alignItems: "center", justifyContent: rail ? "center" : "flex-start", gap: 10,
            marginHorizontal: rail ? 10 : 0,
            shadowColor: theme.brand, shadowOpacity: 0.6, shadowRadius: 11, shadowOffset: { width: 0, height: 10 },
          }}>
          <PlusIcon size={20} />
          {!rail && <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: "#fff" }}>{t.nav.create}</Text>}
        </LinearGradient>
      </Pressable>

      {items.map((it) => {
        const active = it.id === activeTab;
        return (
          <Pressable key={it.id} onPress={() => onTab(it.id)}
            style={({ pressed }) => ({
              backgroundColor: active ? theme.brand + "16" : "transparent",
              borderRadius: 12, paddingVertical: rail ? 11 : 10, paddingHorizontal: rail ? 0 : 12,
              flexDirection: "row", alignItems: "center", justifyContent: rail ? "center" : "flex-start", gap: 12,
              marginHorizontal: rail ? 10 : 0,
              transform: [{ scale: pressed ? 0.975 : 1 }],
            })}>
            <NavIcon kind={it.icon} color={active ? theme.brand : theme.ink2} active={active} />
            {!rail && (
              <Text style={{ fontFamily: active ? FONT.sansBold : FONT.sansMed, fontSize: 14, color: active ? theme.brand : theme.ink2 }}>
                {it.label}
              </Text>
            )}
          </Pressable>
        );
      })}

      <View style={{ flex: 1 }} />

      <Pressable onPress={() => onTab("profile")}
        style={({ pressed }) => ({
          borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glass,
          borderRadius: 13, paddingVertical: 8, paddingHorizontal: rail ? 0 : 10,
          flexDirection: "row", alignItems: "center", justifyContent: rail ? "center" : "flex-start", gap: 10,
          marginHorizontal: rail ? 10 : 0,
          transform: [{ scale: pressed ? 0.975 : 1 }],
        })}>
        <View style={{ width: 28, height: 28, borderRadius: 999, backgroundColor: theme.brand, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontFamily: FONT.monoSemi, fontSize: 10, color: "#fff" }}>{identityInitial}</Text>
        </View>
        {!rail && (
          <View style={{ minWidth: 0, flex: 1 }}>
            <Text numberOfLines={1} style={{ fontFamily: FONT.sansBold, fontSize: 12.5, color: theme.ink }}>{identityLabel}</Text>
            <Text numberOfLines={1} style={{ fontFamily: FONT.mono, fontSize: 8.5, color: theme.ink3, letterSpacing: 0.6, textTransform: "uppercase" }}>{identityPlan}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}
