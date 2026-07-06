// components/AppShell.tsx — navigasi ADAPTIF (Bab 12)
// Mobile & tablet portrait  -> tab bar bawah
// Tablet landscape & desktop -> sidebar kiri (tetap)
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useBreakpoint } from "../hooks/useBreakpoint";

type NavItem = { key: string; label: string };
const NAV: NavItem[] = [
  { key: "home", label: "Beranda" },
  { key: "create", label: "Buat" },
  { key: "publishing", label: "Publishing" },
  { key: "insights", label: "Insights" },
  { key: "profile", label: "Profil" },
];

export function AppShell({
  active,
  onNavigate,
  children,
}: {
  active: string;
  onNavigate: (key: string) => void;
  children: React.ReactNode;
}) {
  const bp = useBreakpoint();
  const useSidebar = bp === "tabletLandscape" || bp === "desktop";

  if (useSidebar) {
    return (
      <View style={styles.rowRoot}>
        <View style={styles.sidebar}>
          <Text style={styles.brand}>BrandReel</Text>
          {NAV.map((n) => (
            <Pressable key={n.key} onPress={() => onNavigate(n.key)} style={styles.sideItem}>
              <Text style={[styles.sideLabel, active === n.key && styles.activeText]}>{n.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  // Mobile / tablet portrait -> tab bar bawah
  return (
    <View style={styles.colRoot}>
      <View style={styles.content}>{children}</View>
      <View style={styles.tabBar}>
        {NAV.map((n) => (
          <Pressable key={n.key} onPress={() => onNavigate(n.key)} style={styles.tabItem}>
            <Text style={[styles.tabLabel, active === n.key && styles.activeText]}>{n.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rowRoot: { flex: 1, flexDirection: "row" },
  colRoot: { flex: 1, flexDirection: "column" },
  sidebar: { width: 220, backgroundColor: "#111", paddingVertical: 24, paddingHorizontal: 16, gap: 4 },
  brand: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 24 },
  sideItem: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 8 },
  sideLabel: { color: "#bbb", fontSize: 15 },
  content: { flex: 1, backgroundColor: "#F5F5F5" },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
    paddingBottom: 8,
  },
  tabItem: { flex: 1, alignItems: "center", paddingVertical: 10, minHeight: 44, justifyContent: "center" },
  tabLabel: { color: "#888", fontSize: 12 },
  activeText: { color: "#FF4D2E", fontWeight: "700" },
});
