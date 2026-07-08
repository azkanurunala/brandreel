// Layar generating — porting BrGenerating dari prototype br-screens-campaign.jsx.
// Fase 3: menunggu panggilan Claude nyata (/campaigns/:id/generate) yang
// dimulai di create.tsx — animasi fase tetap berjalan sampai keduanya selesai.

import React, { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBr } from "@/context/BrContext";
import { BrAppShell, PrimaryButton } from "@/components/br/AppChrome";
import { FONT } from "@/components/br/fonts";
import { getPendingCampaign } from "@/data/pendingCampaign";

const RADIUS = 58;
const CIRC = 2 * Math.PI * RADIUS;

export default function GeneratingScreen() {
  const { theme, lang, t } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const g = t.gen;

  const phases = [
    { k: "scripting", label: g.scripting, ms: 1500 },
    { k: "rendering", label: g.rendering, ms: 2400 },
    { k: "validating", label: g.validating, ms: 1600 },
    { k: "captioning", label: g.captioning, ms: 1500 },
  ];

  const [phase, setPhase] = useState(0);
  const [pct, setPct] = useState(0);
  const aiSettledRef = useRef(false);

  // Tunggu promise generate nyata yang dimulai di create.tsx (Claude via /generate).
  useEffect(() => {
    let alive = true;
    const pending = getPendingCampaign();
    const promise = pending?.generatePromise ?? Promise.resolve(null);
    promise.finally(() => { if (alive) aiSettledRef.current = true; });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const start = Date.now();
    const total = phases.reduce((a, p) => a + p.ms, 0);
    const id = setInterval(() => {
      const el = Date.now() - start;
      const ready = aiSettledRef.current;
      let acc = 0;
      let cp = 0;
      for (let i = 0; i < phases.length; i++) {
        if (el >= acc + phases[i].ms) { acc += phases[i].ms; cp = i + 1; } else break;
      }
      const timedDone = el >= total;
      if (timedDone && ready) {
        setPhase(phases.length); setPct(100); clearInterval(id);
      } else if (timedDone) {
        setPhase(phases.length - 1); setPct(94);
      } else {
        setPhase(Math.min(cp, phases.length - 1));
        setPct(Math.min(92, Math.round((el / total) * 100)));
      }
    }, 90);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allDone = phase >= phases.length;
  const waitingOnAI = pct >= 90 && !allDone;

  return (
    <BrAppShell theme={theme} density="rich">
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 26, paddingTop: insets.top }}>
        {/* Cincin progres */}
        <View style={{ alignSelf: "center", width: 132, height: 132, marginBottom: 28 }}>
          <Svg width={132} height={132} viewBox="0 0 132 132" style={{ transform: [{ rotate: "-90deg" }] }}>
            <Circle cx={66} cy={66} r={RADIUS} fill="none" stroke={theme.hair} strokeWidth={8} />
            <Circle cx={66} cy={66} r={RADIUS} fill="none" stroke={theme.brand} strokeWidth={8} strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct / 100)} />
          </Svg>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontFamily: FONT.display, fontSize: 34, color: theme.ink, letterSpacing: -1 }}>
              {pct}<Text style={{ fontSize: 16, color: theme.ink3 }}>%</Text>
            </Text>
            <Text style={{ fontFamily: FONT.mono, fontSize: 8.5, color: theme.ink3, letterSpacing: 1.4, marginTop: 2, textTransform: "uppercase" }}>
              25 {lang === "en" ? "assets" : "aset"}
            </Text>
          </View>
        </View>

        <Text style={{ fontFamily: FONT.display, fontSize: 24, letterSpacing: -0.7, color: theme.ink, textAlign: "center", lineHeight: 27 }}>
          {allDone ? g.done : g.title}
        </Text>

        {/* Daftar fase */}
        <View style={{ gap: 9, marginTop: 24 }}>
          {phases.map((p, i) => {
            const done = phase > i;
            const active = phase === i;
            return (
              <View key={p.k} style={{
                flexDirection: "row", alignItems: "center", gap: 12,
                paddingVertical: 11, paddingHorizontal: 14, borderRadius: 13,
                backgroundColor: active ? theme.glassHi : "transparent",
                borderWidth: 1, borderColor: active ? theme.hair : "transparent",
              }}>
                <View style={{
                  width: 24, height: 24, borderRadius: 999, alignItems: "center", justifyContent: "center",
                  backgroundColor: done ? theme.pos : active ? theme.brand : theme.hair2,
                  borderWidth: done || active ? 0 : 1, borderColor: theme.hair,
                }}>
                  {done ? (
                    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3.2} strokeLinecap="round">
                      <Path d="M4 12l5 5L20 6" />
                    </Svg>
                  ) : active ? (
                    <Text style={{ fontFamily: FONT.mono, fontSize: 10, color: "#fff" }}>…</Text>
                  ) : (
                    <Text style={{ fontFamily: FONT.monoSemi, fontSize: 10, color: theme.ink3 }}>{i + 1}</Text>
                  )}
                </View>
                <Text style={{ flex: 1, fontFamily: active ? FONT.sansBold : FONT.sansMed, fontSize: 13.5, color: done || active ? theme.ink : theme.ink3 }}>
                  {p.label}
                </Text>
                {active && <Text style={{ fontFamily: FONT.mono, fontSize: 9.5, color: theme.brand, letterSpacing: 0.8 }}>···</Text>}
                {done && <Text style={{ fontFamily: FONT.mono, fontSize: 9.5, color: theme.pos, letterSpacing: 0.8 }}>✓</Text>}
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ paddingHorizontal: 22, paddingTop: 10, paddingBottom: 18 + insets.bottom }}>
        {allDone ? (
          <PrimaryButton theme={theme} onPress={() => router.replace("/detail/__new")}>{g.review} →</PrimaryButton>
        ) : (
          <Text style={{
            fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1.2, textAlign: "center", textTransform: "uppercase",
            color: waitingOnAI ? theme.brand : theme.ink3,
          }}>
            {waitingOnAI ? (lang === "en" ? "Claude · writing your hooks…" : "Claude · menulis hook…") : "Claude · Veo · ffmpeg"}
          </Text>
        )}
      </View>
    </BrAppShell>
  );
}
