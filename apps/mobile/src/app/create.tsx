// Buat kampanye — porting BrCreate dari prototype assets/br-screens-campaign.jsx.
// Fase 3: submit membuat Campaign asli di backend lalu memanggil
// /campaigns/:id/generate (Claude) — promise-nya ditunggu di layar generating.

import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBr } from "@/context/BrContext";
import { BR_PLATFORMS, type PlatformId } from "@/theme/tokens";
import { BrAppShell, BrAppHeader, FloatingActionBar, PrimaryButton } from "@/components/br/AppChrome";
import { GlassPanel } from "@/components/br/Glass";
import { PlatformBadge } from "@/components/br/BrandGlyph";
import { FONT } from "@/components/br/fonts";
import { setPendingCampaign, setPendingBackend, type GenerateResult } from "@/data/pendingCampaign";
import { apiGet, apiPost } from "@/lib/api";
import { pickAndUploadImage } from "@/lib/imageUpload";

function Label({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <Text style={{ fontFamily: FONT.mono, fontSize: 9, color, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 20, marginBottom: 8 }}>
      {children}
    </Text>
  );
}

interface BrandKit {
  id: string;
  name: string;
  voice: string | null;
  logoUrl: string | null;
  colors: string[];
}

export default function CreateScreen() {
  const { theme, lang, t, persona } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [product, setProduct] = useState("");
  const [desc, setDesc] = useState("");
  const [logoColor, setLogoColor] = useState(theme.brand);
  const [plats, setPlats] = useState<PlatformId[]>(persona.platforms as PlatformId[]);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [voice, setVoice] = useState("");

  // Akun boleh punya banyak brand kit (mis. agensi kelola beberapa klien) —
  // pilih salah satu buat campaign ini; voice & warna tetap bisa ditimpa
  // manual di bawah tanpa mengubah brand kit yang tersimpan.
  const [kits, setKits] = useState<BrandKit[] | null>(null);
  const [selectedKitId, setSelectedKitId] = useState<string | null>(null);

  useEffect(() => {
    apiGet("/brand-kits").then((list: BrandKit[]) => {
      setKits(list);
      const first = list[0];
      if (first) {
        setSelectedKitId(first.id);
        if (first.colors?.[0]) setLogoColor(first.colors[0]);
        if (first.voice) setVoice(first.voice);
      }
    }).catch(() => setKits([]));
  }, []);

  function selectKit(kit: BrandKit) {
    setSelectedKitId(kit.id);
    if (kit.colors?.[0]) setLogoColor(kit.colors[0]);
    setVoice(kit.voice ?? "");
  }

  async function handlePickProductImage() {
    setImageUploading(true);
    try {
      const url = await pickAndUploadImage();
      if (url) setProductImageUrl(url);
    } finally {
      setImageUploading(false);
    }
  }

  const [newKitOpen, setNewKitOpen] = useState(false);
  const [newKitName, setNewKitName] = useState("");
  const [savingKit, setSavingKit] = useState(false);

  async function saveNewKit() {
    if (!newKitName.trim()) return;
    setSavingKit(true);
    try {
      const kit: BrandKit = await apiPost("/brand-kits", { name: newKitName.trim(), colors: [theme.brand] });
      setKits((prev) => [...(prev ?? []), kit]);
      selectKit(kit);
      setNewKitName("");
      setNewKitOpen(false);
    } catch (e: any) {
      console.warn("gagal bikin brand kit:", e);
    } finally {
      setSavingKit(false);
    }
  }

  const logoColors = [theme.brand, "#1FA971", "#2D7FF0", "#6D4AFF", "#E0A11B"];
  const ready = product.trim().length > 1 && plats.length > 0;
  const glyph = useMemo(() => {
    const p = product.trim();
    return p ? p.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "··";
  }, [product]);

  async function generate() {
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

    // Mulai panggilan backend nyata; promise ditunggu di layar generating.
    let createdId = "pending";
    async function runGenerate(): Promise<GenerateResult | null> {
      try {
        const campaign = await apiPost("/campaigns", {
          product: productName,
          description: desc.trim() || undefined,
          productImageUrl: productImageUrl ?? undefined,
          brandKitId: selectedKitId ?? undefined,
          platforms: plats,
        });
        createdId = campaign.id;
        const gen = await apiPost(`/campaigns/${campaign.id}/generate`, { lang, voice: voice.trim() || undefined });
        const hooks = Object.fromEntries(
          (gen.hooks as { id: string; label: string; script: string; caption: string }[]).map((h) => [
            h.label,
            { id: h.id, script: h.script, caption: h.caption },
          ])
        ) as GenerateResult["hooks"];
        return { hooks, hashtags: gen.hashtags as string[] };
      } catch (e) {
        console.warn("Generate backend gagal, pakai fallback lokal:", e);
        return null;
      }
    }
    const promise = runGenerate();
    setPendingBackend(createdId, promise);
    promise.then(() => setPendingBackend(createdId, promise));

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

        {/* Brand kit — akun boleh punya banyak, pilih salah satu (opsional) */}
        <Label color={theme.ink3}>{lang === "en" ? "Brand" : "Brand"}</Label>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
          {(kits ?? []).map((kit) => {
            const on = kit.id === selectedKitId;
            return (
              <Pressable key={kit.id} onPress={() => selectKit(kit)}
                style={({ pressed }) => ({
                  flexDirection: "row", alignItems: "center", gap: 7,
                  borderWidth: 1, borderColor: on ? theme.brand : theme.hair,
                  backgroundColor: on ? theme.brand + "14" : theme.glassHi,
                  borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12,
                  transform: [{ scale: pressed ? 0.96 : 1 }],
                })}>
                <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: kit.colors?.[0] ?? theme.brand }} />
                <Text style={{ fontFamily: FONT.sansSemi, fontSize: 12.5, color: on ? theme.brand : theme.ink2 }}>{kit.name}</Text>
              </Pressable>
            );
          })}
          <Pressable onPress={() => setNewKitOpen((v) => !v)}
            style={({ pressed }) => ({
              borderWidth: 1, borderColor: theme.hair, borderStyle: "dashed", backgroundColor: theme.glassHi,
              borderRadius: 999, paddingVertical: 7, paddingHorizontal: 12,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}>
            <Text style={{ fontFamily: FONT.sansSemi, fontSize: 12.5, color: theme.ink2 }}>
              + {lang === "en" ? "New brand" : "Brand baru"}
            </Text>
          </Pressable>
        </View>
        {newKitOpen && (
          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <TextInput value={newKitName} onChangeText={setNewKitName}
              placeholder={lang === "en" ? "Brand name" : "Nama brand"}
              placeholderTextColor={theme.ink3}
              style={{
                flex: 1, backgroundColor: theme.glassHi, borderWidth: 1, borderColor: theme.hair, borderRadius: 12,
                paddingVertical: 10, paddingHorizontal: 13, fontFamily: FONT.sansSemi, fontSize: 13.5, color: theme.ink,
              }} />
            <Pressable onPress={saveNewKit} disabled={savingKit || !newKitName.trim()}
              style={{ borderRadius: 12, backgroundColor: theme.brand, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", opacity: savingKit || !newKitName.trim() ? 0.6 : 1 }}>
              {savingKit ? <ActivityIndicator color="#fff" /> : <Text style={{ fontFamily: FONT.sansBold, fontSize: 13, color: "#fff" }}>{lang === "en" ? "Save" : "Simpan"}</Text>}
            </Pressable>
          </View>
        )}

        {/* Brand voice — default dari brand kit terpilih, bisa ditimpa manual
            buat campaign ini saja (gak mengubah brand kit tersimpan) */}
        <Label color={theme.ink3}>{t.create.voice}</Label>
        <GlassPanel theme={theme} padding={13} style={{ flexDirection: "row", alignItems: "center", gap: 11 }}>
          <View style={{
            width: 30, height: 30, borderRadius: 9, backgroundColor: theme.brand + "1C",
            borderWidth: 1, borderColor: theme.brand + "40", alignItems: "center", justifyContent: "center",
          }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={theme.brand} strokeWidth={1.8} strokeLinecap="round">
              <Path d="M3 10v4h4l5 5V5L7 10H3zM16 9a3 3 0 0 1 0 6" />
            </Svg>
          </View>
          <TextInput value={voice} onChangeText={setVoice}
            placeholder={lang === "en" ? "e.g. casual, funny" : "mis. santai, lucu"}
            placeholderTextColor={theme.ink3}
            style={{ flex: 1, fontFamily: FONT.sansSemi, fontSize: 13, color: theme.ink, padding: 0 }} />
        </GlassPanel>

        {/* Foto produk (opsional) */}
        <Label color={theme.ink3}>{lang === "en" ? "Product photo (optional)" : "Foto produk (opsional)"}</Label>
        <Pressable onPress={handlePickProductImage} disabled={imageUploading}
          style={({ pressed }) => ({
            borderWidth: 1, borderStyle: "dashed", borderColor: theme.hair, backgroundColor: theme.glassHi,
            borderRadius: 13, height: productImageUrl ? 140 : 64, alignItems: "center", justifyContent: "center",
            overflow: "hidden", transform: [{ scale: pressed ? 0.99 : 1 }],
          })}>
          {imageUploading ? (
            <ActivityIndicator color={theme.brand} />
          ) : productImageUrl ? (
            <Image source={{ uri: productImageUrl }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
          ) : (
            <Text style={{ fontFamily: FONT.sansSemi, fontSize: 12.5, color: theme.ink2 }}>
              {lang === "en" ? "+ Upload a product photo" : "+ Unggah foto produk"}
            </Text>
          )}
        </Pressable>

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
