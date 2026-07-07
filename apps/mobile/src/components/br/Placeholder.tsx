// Placeholder layar — kerangka sementara sampai porting penuh dari prototype.

import React from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBr } from "../../context/BrContext";
import { BrAppShell, BrAppHeader } from "./AppChrome";
import { FONT } from "./fonts";

export function PlaceholderScreen({ title, subtitle, backable = false }: { title: string; subtitle?: string; backable?: boolean }) {
  const { theme } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <BrAppShell theme={theme}>
      <View style={{ height: insets.top }} />
      <BrAppHeader title={title} subtitle={subtitle} onBack={backable ? () => router.back() : undefined} />
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
        <Text style={{ fontFamily: FONT.display, fontSize: 18, color: theme.ink2, textAlign: "center" }}>
          {title}
        </Text>
        <Text style={{ fontFamily: FONT.sans, fontSize: 13, color: theme.ink3, textAlign: "center", marginTop: 8 }}>
          Layar ini sedang diporting dari prototype…
        </Text>
      </View>
    </BrAppShell>
  );
}
