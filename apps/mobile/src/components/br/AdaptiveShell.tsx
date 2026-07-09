// Shell adaptif 4 kelas tampilan (CLAUDE.md aturan 6):
//   mobile <600 & tabletPortrait <900  → konten + tab bar bawah
//   tabletLandscape <1280              → sidebar rail ikon + konten
//   desktop ≥1280                      → sidebar penuh + konten
// Rute auth (onboard/login) & fokus (generating/copilot) tampil tanpa nav.

import React, { useCallback } from "react";
import { View } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useBr } from "../../context/BrContext";
import { useBreakpoint } from "../../hooks/useBreakpoint";
import { BottomNav, BrSidebar, type TabId } from "./Nav";

const NO_NAV_PREFIX = ["/onboard", "/login", "/generating", "/copilot"];

function pathToTab(path: string): TabId {
  if (path.startsWith("/insights")) return "insights";
  if (path.startsWith("/inbox") || path.startsWith("/copilot")) return "inbox";
  if (path.startsWith("/profile") || path.startsWith("/setup") || path.startsWith("/economics")) return "profile";
  if (path.startsWith("/create") || path.startsWith("/generating")) return "create";
  return "home";
}

export function AdaptiveShell({ children }: { children: React.ReactNode }) {
  const { theme } = useBr();
  const bp = useBreakpoint();
  const path = usePathname();
  const router = useRouter();

  const activeTab = pathToTab(path);
  const hideNav = NO_NAV_PREFIX.some((p) => path.startsWith(p));
  const useSidebar = bp === "tabletLandscape" || bp === "desktop";
  const showSidebar = useSidebar && !hideNav;
  const showBottomNav = !useSidebar && !hideNav;

  const onTab = useCallback((tab: TabId) => {
    if (tab === "create") {
      router.push("/create");
      return;
    }
    const target = tab === "home" ? "/home" : `/${tab}`;
    if (path !== target) router.replace(target as never);
  }, [router, path]);

  // `children` (o Stack expo-router) HARUS selalu berada di posisi/kedalaman
  // pohon React yang sama di semua kombinasi hideNav/sidebar/bottomnav —
  // kalau strukturnya beda (mis. return berbeda antar cabang if), React
  // remount total subtree Stack saat pindah rute lintas cabang, yang reset
  // state routing expo-router web dan melempar user balik ke "/" → /home.
  // Makanya sidebar/bottomnav dirender sebagai sibling kondisional, BUKAN
  // early return dengan bentuk wrapper berbeda.
  return (
    <View style={{ flex: 1, flexDirection: showSidebar ? "row" : "column", backgroundColor: theme.canvas }}>
      {showSidebar && <BrSidebar rail={bp === "tabletLandscape"} activeTab={activeTab} onTab={onTab} />}
      <View style={{ flex: 1, minWidth: 0, minHeight: 0 }}>{children}</View>
      {showBottomNav && <BottomNav activeTab={activeTab} onTab={onTab} />}
    </View>
  );
}
