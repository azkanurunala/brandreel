// Rute awal — kalau ada sesi login tersimpan, langsung ke /home; kalau
// tidak, mulai dari onboarding (sama seperti prototype).
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useBr } from "@/context/BrContext";
import { getToken } from "@/lib/session";

export default function Index() {
  const { theme } = useBr();
  const [dest, setDest] = useState<"/home" | "/onboard" | null>(null);

  useEffect(() => {
    getToken().then((token) => setDest(token ? "/home" : "/onboard"));
  }, []);

  if (!dest) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.canvas }}>
        <ActivityIndicator color={theme.brand} />
      </View>
    );
  }
  return <Redirect href={dest} />;
}
