// Buat kampanye — porting BrCreate dari prototype assets/br-screens-campaign.jsx.
// Fase 2: input produk/logo/voice/platform; hasil generate masih simulasi.

import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBr } from "@/context/BrContext";
import { BR_PLATFORMS, type PlatformId } from "@/theme/tokens";
import { BrAppShell, BrAppHeader, FloatingActionBar, PrimaryButton } from "@/components/br/AppChrome";
import { GlassPanel } from "@/components/br/Glass";
import { PlatformBadge } from "@/components/br/BrandGlyph";
import { FONT } from "@/components/br/fonts";
import { setPendingCampaign } from "@/data/pendingCampaign";

function Label({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <Text style={{ fontFamily: FONT.mono, fontSize: 9, color, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 20, marginBottom: 8 }}>
      {children}
    </Text>
  );
}

export default function CreateScreen() {
  const { theme, lang, t, persona } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const voice = lang === "en" ? persona.voice_en : persona.voice_id;

  const [product, setProduct] = useState("");
  const [desc, setDesc] = useState("");
  const [logoColor, setLogoColor] = useState(theme.brand);
  const [plats, setPlats] = useState<PlatformId[]>(persona.platforms as PlatformId[]);

  const logoColors = [theme.brand, "#1FA971", "#2D7FF0", "#6D4AFF", "#E0A11B"];
  const ready = product.trim().length > 1 && plats.length > 0;
  const glyph = useMemo(() => {
    const p = product.trim();
    return p ? p.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "··";
  }, [product]);

  function generate() {
    if (!ready) return;
    const productName = product.trim();
    setPendingCampaign({
      campaign: {
        id: "__new", product: productName, logoGlyph: glyph, logoColor,
        desc_en: desc || "New product", desc_id: desc || "Produk baru",
        created_en: "Just generated", created_id: "Baru dibuat",
        status: "ready", topHook: "h2", views: "—", eng: "—",
        hashtags: ["#new", "#eco", "#sustainable", "#brandreel", "#ugc", "#viral"],
        platforms: Object.fromEntries(plats.map((p) => [p, { state: "queued" as const }])),
      },
      input: { product: productName, desc: desc.trim(), voice, platforms: plats, lang },
    });
    router.push("/generating");
  }

  return (
    <BrAppShell theme={theme} density="soft">
      <View style={{ height: insets.top }} />
      <BrAppHeader title={t.create.title} subtitle={t.create.sub} onBack={() => router.back()} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}>
        {/* Logo + nama produk */}
        <View style={{ flexDirection: "row", gap: 13, alignItems: "center" }}>
          <View style={{
            width: 62, height: 62, borderRadius: 17, backgroundColor: logoColor,
            alignItems: "center", justifyContent: "center",
            shadowColor: logoColor, shadowOpacity: 0.6, shadowRadius: 11, shadowOffset: { width: 0, height: 10 },
          }}>
            <Text style={{ fontFamily: FONT.display, color: "#fff", fontSize: 20, letterSpacing: -0.5 }}>{glyph}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 5 }}>
              {t.create.product}
            </Text>
            <TextInput
              value={product}
              onChangeText={setProduct}
              placeholder={t.create.productPh}
              placeholderTextColor={theme.ink3}
              style={{
                backgroundColor: theme.glassHi, borderWidth: 1, borderColor: theme.hair, borderRadius: 12,
                paddingVertical: 11, paddingHorizontal: 13,
                fontFamily: FONT.sansSemi, fontSize: 15, color: theme.ink,
              }}
            />
          </View>
        </View>

        {/* Pilihan warna logo */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          {logoColors.map((c, i) => (
            <Pressable key={i} onPress={() => setLogoColor(c)}
              style={({ pressed }) => ({
                width: 32, height: 32, borderRadius: 9, backgroundColor: c,
                borderWidth: 2.5, borderColor: c === logoColor ? theme.ink : "transparent",
                transform: [{ scale: pressed ? 0.9 : 1 }],
              })} />
          ))}
        </View>

        {/* Deskripsi */}
        <Label color={theme.ink3}>{t.create.desc}</Label>
        <TextInput
          value={desc}
          onChangeText={setDesc}
          placeholder={t.create.descPh}
          placeholderTextColor={theme.ink3}
          multiline
          numberOfLines={2}
          style={{
            backgroundColor: theme.glassHi, borderWidth: 1, borderColor: theme.hair, borderRadius: 12,
            paddingVertical: 11, paddingHorizontal: 13, minHeight: 64, textAlignVertical: "top",
            fontFamily: FONT.sans, fontSize: 13.5, color: theme.ink, lineHeight: 20,
          }}
        />

        {/* Brand voice (dari brand kit) */}
        <Label color={theme.ink3}>{t.create.voice}</Label>
        <GlassPanel theme={theme} padding={13} style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
          <View style={{
            width: 30, height: 30, borderRadius: 9, backgroundColor: persona.color + "1C",
            borderWidth: 1, borderColor: persona.color + "40", alignItems: "center", justifyContent: "center",
          }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={persona.color} strokeWidth={1.8} strokeLinecap="round">
              <Path d="M3 10v4h4l5 5V5L7 10H3zM16 9a3 3 0 0 1 0 6" />
            </Svg>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: FONT.sansSemi, fontSize: 13, color: theme.ink }}>{voice}</Text>
            <Text style={{ fontFamily: FONT.mono, fontSize: 8.5, color: theme.ink3, letterSpacing: 0.6, marginTop: 2, textTransform: "uppercase" }}>
              {lang === "en" ? "FROM BRAND KIT" : "DARI BRAND KIT"}
            </Text>
          </View>
        </GlassPanel>

        {/* Platform tujuan */}
        <Label color={theme.ink3}>{t.create.platforms} · {plats.length}</Label>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {(persona.platforms as PlatformId[]).map((pid) => {
            const p = BR_PLATFORMS[pid];
            const on = plats.includes(pid);
            return (
              <Pressable key={pid}
                onPress={() => setPlats((s) => (on ? s.filter((x) => x !== pid) : [...s, pid]))}
                style={({ pressed }) => ({
                  width: "48%" as const, flexGrow: 1, minWidth: 150,
                  borderWidth: 1, borderColor: on ? p.color + "66" : theme.hair,
                  backgroundColor: on ? p.color + "10" : theme.glassHi,
                  borderRadius: 13, paddingVertical: 10, paddingHorizontal: 11,
                  flexDirection: "row" as const, alignItems: "center" as const, gap: 9, opacity: on ? 1 : 0.6,
                  transform: [{ scale: pressed ? 0.975 : 1 }],
                })}>
                <PlatformBadge pid={pid} size={28} solid={on} />
                <View style={{ minWidth: 0, flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontFamily: FONT.sansBold, fontSize: 12, color: theme.ink }}>{p.name}</Text>
                  <Text style={{ fontFamily: FONT.mono, fontSize: 8, color: theme.ink3, letterSpacing: 0.4 }}>{p.ratio}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <FloatingActionBar>
        <View style={{ flex: 1 }}>
          <View style={{ opacity: ready ? 1 : 0.55 }}>
            <PrimaryButton theme={theme} onPress={generate}>{t.create.generate}</PrimaryButton>
          </View>
          <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.8, textAlign: "center", marginTop: 6, textTransform: "uppercase" }}>
            {t.create.est}
          </Text>
        </View>
      </FloatingActionBar>
      <View style={{ height: insets.bottom }} />
    </BrAppShell>
  );
}
