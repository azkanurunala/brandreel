// VideoHero — pratinjau video full-width (redesign: dulu thumbnail 108px,
// CTA render paling penting di halaman ini malah jadi tap target terkecil).
// Lihat docs/superpowers/specs/2026-07-11-detail-screen-ux-design.md.

import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, type VideoPlayer } from "expo-video";
import type { Theme } from "../../theme/tokens";
import type { PlatformId } from "../../theme/tokens";
import type { Lang } from "../../i18n/strings";
import { PlatformBadge } from "./BrandGlyph";
import { FONT } from "./fonts";

export interface VideoHeroRender {
  state: "queued" | "processing" | "ready" | "failed";
  storageUrl: string | null;
}

export function VideoHero({
  theme, lang, activeRender, previewAspect, hookColor, logoColor, plat,
  ratioLabel, durationLabel, generatingRender, onBulkRender, onOpenModal, player,
}: {
  theme: Theme;
  lang: Lang;
  activeRender: VideoHeroRender | null;
  previewAspect: number;
  hookColor: string;
  logoColor: string;
  plat: PlatformId;
  ratioLabel: string;
  durationLabel: string;
  generatingRender: boolean;
  onBulkRender: () => void;
  onOpenModal: () => void;
  player: VideoPlayer;
}) {
  const ready = activeRender?.state === "ready" && !!activeRender.storageUrl;

  return (
    <View style={{ width: "100%", aspectRatio: previewAspect, borderRadius: 18, overflow: "hidden" }}>
      {ready ? (
        <Pressable onPress={onOpenModal} style={{ width: "100%", height: "100%" }}>
          <VideoView player={player} style={{ width: "100%", height: "100%" }} contentFit="cover" nativeControls={false} />
          <View style={{
            position: "absolute", top: 10, right: 10, width: 30, height: 30, borderRadius: 999,
            backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
          }}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
            </Svg>
          </View>
        </Pressable>
      ) : (
        <LinearGradient
          colors={[hookColor, logoColor]}
          start={{ x: 0, y: 0 }} end={{ x: 0.8, y: 1 }}
          style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}>
          <View style={{ position: "absolute", top: 12, left: 12 }}>
            <PlatformBadge pid={plat} size={30} solid />
          </View>

          {activeRender?.state === "queued" || activeRender?.state === "processing" ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={{ fontFamily: FONT.monoSemi, fontSize: 11, color: "rgba(255,255,255,0.9)", letterSpacing: 0.8, marginTop: 10, textTransform: "uppercase" }}>
                {activeRender.state === "queued" ? (lang === "en" ? "Queued" : "Antre") : (lang === "en" ? "Rendering…" : "Merender…")}
              </Text>
            </>
          ) : activeRender?.state === "failed" ? (
            <Pressable onPress={onBulkRender} disabled={generatingRender} style={{ alignItems: "center", padding: 12 }}>
              <Text style={{ fontFamily: FONT.monoSemi, fontSize: 11, color: "#fff", letterSpacing: 0.6, textAlign: "center" }}>
                {lang === "en" ? "Failed — tap to retry" : "Gagal — ketuk ulang"}
              </Text>
            </Pressable>
          ) : (
            <Pressable onPress={onBulkRender} disabled={generatingRender}
              style={{ alignItems: "center", padding: 14, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.32)" }}>
              {generatingRender ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Svg width={34} height={34} viewBox="0 0 24 24">
                    <Circle cx={12} cy={12} r={11} fill="rgba(0,0,0,0.28)" />
                    <Path d="M9 7l9 5-9 5z" fill="#fff" />
                  </Svg>
                  <Text style={{ fontFamily: FONT.monoSemi, fontSize: 10.5, color: "#fff", letterSpacing: 0.6, marginTop: 8, textAlign: "center" }}>
                    {lang === "en" ? "Generate all videos" : "Buat semua video"}
                  </Text>
                </>
              )}
            </Pressable>
          )}

          <View style={{ position: "absolute", bottom: 10, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.42)", paddingVertical: 3, paddingHorizontal: 8, borderRadius: 999 }}>
            <Text style={{ fontFamily: FONT.mono, fontSize: 9.5, color: "rgba(255,255,255,0.92)", letterSpacing: 0.6 }}>
              {ratioLabel} · {durationLabel}
            </Text>
          </View>
        </LinearGradient>
      )}
    </View>
  );
}
