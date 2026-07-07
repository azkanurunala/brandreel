// Unit ekonomi (owner) — porting BrEconomics dari prototype br-economics.jsx.
// Kalkulator margin per plan (proses IAP checkout tidak diporting — di luar
// cakupan MVP; billing asli via App Store/Play Store Connect).

import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBr } from "@/context/BrContext";
import {
  BR_COST, BR_PLAN_ECON, BR_PLAN_ORDER, BR_STORE_ORDER, BR_UNIT, BR_VEO_PACKS,
  brNetRevenue, brPackPnL, brPct, brPlanCOGS, brPlanPnL, brUSD, type StoreKey,
} from "@/data/economics";
import { BrAppHeader } from "@/components/br/AppChrome";
import { GlassChip, GlassPanel } from "@/components/br/Glass";
import { FONT } from "@/components/br/fonts";

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <View style={{ paddingTop: 18, paddingHorizontal: 4, paddingBottom: 8 }}>
      <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color }}>{children}</Text>
    </View>
  );
}

export default function EconomicsScreen() {
  const { theme, lang } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const en = lang === "en";

  const [storeKey, setStoreKey] = useState<StoreKey>("appstore");
  const [veoSlider, setVeoSlider] = useState(BR_PLAN_ECON.pro.veoIncl);
  const [openPlan, setOpenPlan] = useState<string | null>("pro");

  const blended = BR_PLAN_ORDER.reduce((a, k) => a + brPlanPnL(k, storeKey).marginPct, 0) / BR_PLAN_ORDER.length;
  const allProfit = BR_PLAN_ORDER.every((k) => brPlanPnL(k, storeKey).margin > 0);

  const calcPlan = { ...BR_PLAN_ECON.pro, veoIncl: veoSlider };
  const calcCogs = brPlanCOGS(calcPlan);
  const calcNet = brNetRevenue(calcPlan.price, storeKey);
  const calcMargin = calcNet - calcCogs;
  const breakEvenVeo = Math.floor(
    (calcNet - (calcPlan.posts * (BR_UNIT.postOps + BR_UNIT.caption) + calcPlan.campaigns * BR_UNIT.hookGen + calcPlan.copilot * BR_UNIT.copilotMsg)) / BR_UNIT.veoClip
  );

  const costCards = [
    { k: "veo", v: brUSD(BR_UNIT.veoClip), l: en ? "Veo 3.1 render" : "Render Veo 3.1", s: "6s · $0.15/s", hot: true },
    { k: "hook", v: brUSD(BR_UNIT.hookGen), l: en ? "5-hook gen" : "Generasi 5 hook", s: "Claude Sonnet" },
    { k: "cap", v: brUSD(BR_UNIT.caption), l: en ? "Caption adapt" : "Adaptasi caption", s: "Claude Haiku" },
    { k: "copi", v: brUSD(BR_UNIT.copilotMsg), l: en ? "Copilot reply" : "Balasan Copilot", s: "Claude Sonnet" },
    { k: "post", v: brUSD(BR_UNIT.postOps), l: en ? "Publish + CDN" : "Publikasi + CDN", s: en ? "transcode·deliver" : "transcode·kirim" },
    { k: "canvas", v: "~$0.00", l: en ? "Canvas render" : "Render canvas", s: en ? "in-browser · free" : "di-browser · gratis", good: true },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.canvas }}>
      <View style={{ height: insets.top }} />
      <BrAppHeader title={en ? "Unit economics" : "Unit ekonomi"} subtitle={en ? "OWNER · MARGIN MODEL" : "OWNER · MODEL MARGIN"} onBack={() => router.back()} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 28 }}>
        {/* Vonis hero */}
        <GlassPanel theme={theme} padding={16} tone="solid">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              <Text style={{ fontFamily: FONT.display, fontSize: 32, color: allProfit ? theme.pos : theme.neg, letterSpacing: -1 }}>
                {brPct(blended)}
              </Text>
              <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 1, marginTop: 5, textTransform: "uppercase" }}>
                {en ? "avg net margin" : "rata-rata margin net"}
              </Text>
            </View>
            <GlassChip theme={theme} color={allProfit ? theme.pos : theme.neg}>
              {allProfit ? (en ? "All plans profit" : "Semua plan untung") : en ? "Plan underwater" : "Plan rugi"}
            </GlassChip>
          </View>
          <Text style={{ fontFamily: FONT.sans, fontSize: 11.5, color: theme.ink2, marginTop: 12, lineHeight: 17 }}>
            {en
              ? "After the store cut and every AI/API call. Veo video is the cost driver — included renders are capped; overflow uses the free canvas renderer."
              : "Setelah potongan store & semua panggilan AI/API. Video Veo paling mahal — render bawaan dibatasi; sisanya pakai canvas gratis."}
          </Text>
        </GlassPanel>

        {/* Kanal tagihan */}
        <Eyebrow color={theme.ink3}>{en ? "BILLING CHANNEL" : "KANAL TAGIHAN"}</Eyebrow>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
          {BR_STORE_ORDER.map((sk) => {
            const s = BR_COST.store[sk];
            const on = sk === storeKey;
            return (
              <Pressable key={sk} onPress={() => setStoreKey(sk)}
                style={({ pressed }) => ({
                  width: "48%", flexGrow: 1, minWidth: 150,
                  borderWidth: 1, borderColor: on ? theme.brand : theme.hair,
                  backgroundColor: on ? theme.brand + "12" : theme.glassHi,
                  borderRadius: 12, paddingVertical: 9, paddingHorizontal: 11,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                })}>
                <Text style={{ fontFamily: FONT.sansBold, fontSize: 12, color: on ? theme.brand : theme.ink }}>
                  {en ? s.label_en : s.label_id}
                </Text>
                <Text style={{ fontFamily: FONT.mono, fontSize: 8.5, color: theme.ink3, letterSpacing: 0.3, marginTop: 2, textTransform: "uppercase" }}>
                  {en ? s.note_en : s.note_id}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Biaya per panggilan */}
        <Eyebrow color={theme.ink3}>{en ? "WHAT EACH CALL COSTS" : "BIAYA TIAP PANGGILAN"}</Eyebrow>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7 }}>
          {costCards.map((c) => (
            <GlassPanel key={c.k} theme={theme} padding={11} style={{
              width: "31%", flexGrow: 1, minWidth: 100,
              borderColor: c.hot ? theme.warn + "55" : c.good ? theme.pos + "44" : theme.hair,
            }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 15, color: c.hot ? theme.warn : c.good ? theme.pos : theme.ink, letterSpacing: -0.4 }}>
                {c.v}
              </Text>
              <Text style={{ fontFamily: FONT.sansSemi, fontSize: 10.5, color: theme.ink2, marginTop: 6, lineHeight: 13 }}>{c.l}</Text>
              <Text style={{ fontFamily: FONT.mono, fontSize: 7.5, color: theme.ink3, letterSpacing: 0.3, marginTop: 3, textTransform: "uppercase" }}>{c.s}</Text>
            </GlassPanel>
          ))}
        </View>

        {/* P&L per plan */}
        <Eyebrow color={theme.ink3}>{en ? "PER-PLAN P&L · MONTHLY" : "P&L PER PLAN · BULANAN"}</Eyebrow>
        <View style={{ gap: 8 }}>
          {BR_PLAN_ORDER.map((pk) => {
            const plan = BR_PLAN_ECON[pk];
            const pnl = brPlanPnL(pk, storeKey);
            const isOpen = openPlan === pk;
            const pos = pnl.margin > 0;
            return (
              <View key={pk} style={{ backgroundColor: theme.glassHi, borderWidth: 1, borderColor: isOpen ? theme.brand + "55" : theme.hair, borderRadius: 16, overflow: "hidden" }}>
                <Pressable onPress={() => setOpenPlan(isOpen ? null : pk)} style={{ padding: 13, flexDirection: "row", alignItems: "center", gap: 11 }}>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: FONT.sansBold, fontSize: 14, color: theme.ink, textTransform: "capitalize" }}>
                      {pk}{plan.fairUse ? ` · ${en ? "fair-use" : "wajar"}` : ""}
                    </Text>
                    <Text style={{ fontFamily: FONT.mono, fontSize: 8.5, color: theme.ink3, letterSpacing: 0.3, marginTop: 2, textTransform: "uppercase" }}>
                      {brUSD(plan.price)} · {plan.veoIncl} veo · {plan.posts === 1500 ? "∞" : plan.posts} post
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontFamily: FONT.display, fontSize: 17, color: pos ? theme.pos : theme.neg, letterSpacing: -0.4 }}>{brUSD(pnl.margin)}</Text>
                    <Text style={{ fontFamily: FONT.mono, fontSize: 8, color: theme.ink3, letterSpacing: 0.4, marginTop: 2, textTransform: "uppercase" }}>
                      {brPct(pnl.marginPct)} margin
                    </Text>
                  </View>
                  <Text style={{ color: theme.ink3, fontSize: 13 }}>{isOpen ? "⌄" : "›"}</Text>
                </Pressable>
                {isOpen && (
                  <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
                    {[
                      { l: en ? "Gross price" : "Harga kotor", v: pnl.gross, c: theme.ink },
                      { l: en ? "− Store fee" : "− Biaya store", v: -pnl.storeFee, c: theme.neg },
                      { l: en ? "= Net revenue" : "= Pendapatan net", v: pnl.net, c: theme.ink, bold: true },
                      { l: en ? "− Veo renders" : "− Render Veo", v: -(plan.veoIncl * BR_UNIT.veoClip), c: theme.neg },
                      { l: en ? "− Text AI + publish" : "− AI teks + publikasi", v: -(pnl.cogs - plan.veoIncl * BR_UNIT.veoClip), c: theme.neg },
                      { l: en ? "= Margin" : "= Margin", v: pnl.margin, c: pos ? theme.pos : theme.neg, bold: true },
                    ].map((r, i) => (
                      <View key={i} style={{
                        flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingVertical: 6,
                        borderTopWidth: r.bold ? 1 : 0, borderTopColor: theme.hair2,
                      }}>
                        <Text style={{ fontFamily: r.bold ? FONT.sansBold : FONT.sansMed, fontSize: r.bold ? 12.5 : 12, color: r.bold ? theme.ink : theme.ink2 }}>
                          {r.l}
                        </Text>
                        <Text style={{ fontFamily: FONT.monoSemi, fontSize: r.bold ? 13 : 12, color: r.c }}>{brUSD(r.v)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Kalkulator langsung */}
        <Eyebrow color={theme.ink3}>{en ? "LIVE CALCULATOR · PRO PLAN" : "KALKULATOR LANGSUNG · PRO"}</Eyebrow>
        <GlassPanel theme={theme} padding={15} tone="solid">
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" }}>
            <View>
              <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.8, textTransform: "uppercase" }}>
                {en ? "Veo renders included" : "Render Veo termasuk"}
              </Text>
              <Text style={{ fontFamily: FONT.display, fontSize: 26, color: theme.ink, letterSpacing: -0.8, marginTop: 3 }}>{veoSlider}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 22, color: calcMargin > 0 ? theme.pos : theme.neg, letterSpacing: -0.6 }}>{brUSD(calcMargin)}</Text>
              <Text style={{ fontFamily: FONT.mono, fontSize: 8.5, color: theme.ink3, letterSpacing: 0.4, marginTop: 3, textTransform: "uppercase" }}>
                {en ? "margin / user" : "margin / user"}
              </Text>
            </View>
          </View>
          <Slider
            minimumValue={0}
            maximumValue={90}
            step={1}
            value={veoSlider}
            onValueChange={setVeoSlider}
            minimumTrackTintColor={theme.brand}
            maximumTrackTintColor={theme.hair}
            style={{ marginTop: 14 }}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
            <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.4, textTransform: "uppercase" }}>
              COGS {brUSD(calcCogs)}
            </Text>
            <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: calcMargin > 0 ? theme.pos : theme.neg, letterSpacing: 0.4, textTransform: "uppercase" }}>
              {en ? "break-even" : "impas"} ≈ {breakEvenVeo} {en ? "renders" : "render"}
            </Text>
          </View>
        </GlassPanel>

        {/* Ekonomi top-up */}
        <Eyebrow color={theme.ink3}>{en ? "VEO CREDIT TOP-UPS" : "TOP-UP KREDIT VEO"}</Eyebrow>
        <GlassPanel theme={theme} padding={4} tone="solid">
          {BR_VEO_PACKS.map((p, i) => {
            const pn = brPackPnL(p, storeKey);
            return (
              <View key={p.id} style={{
                flexDirection: "row", alignItems: "center", gap: 11,
                paddingVertical: 10, paddingHorizontal: 11,
                borderTopWidth: i ? 1 : 0, borderTopColor: theme.hair2,
              }}>
                <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: theme.brand + "16", borderWidth: 1, borderColor: theme.hair, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.display, fontSize: 12, color: theme.brand }}>{p.renders}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: FONT.sansSemi, fontSize: 12.5, color: theme.ink }}>
                    {p.renders} {en ? "renders" : "render"} · {brUSD(p.price)}
                  </Text>
                  <Text style={{ fontFamily: FONT.mono, fontSize: 8.5, color: theme.ink3, letterSpacing: 0.3, marginTop: 2, textTransform: "uppercase" }}>
                    {brUSD(pn.perRender)}/render · {en ? "cost" : "biaya"} {brUSD(BR_UNIT.veoClip)}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontFamily: FONT.monoSemi, fontSize: 12, color: pn.margin > 0 ? theme.pos : theme.neg }}>{brUSD(pn.margin)}</Text>
                  <Text style={{ fontFamily: FONT.mono, fontSize: 8, color: theme.ink3, letterSpacing: 0.3, marginTop: 2, textTransform: "uppercase" }}>
                    {brPct(pn.marginPct)}
                  </Text>
                </View>
              </View>
            );
          })}
        </GlassPanel>

        <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.4, textAlign: "center", marginTop: 18, lineHeight: 15, textTransform: "uppercase" }}>
          {BR_COST.sources}
        </Text>
      </ScrollView>
    </View>
  );
}
