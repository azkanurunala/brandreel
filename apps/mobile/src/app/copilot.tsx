// Copilot — porting BrCopilot dari prototype assets/br-screens-insights.jsx.
// Balasan nyata dari Claude lewat proxy backend (POST /generate, Bab 03) —
// bukan fakeReply kaleng lagi.

import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useBr } from "@/context/BrContext";
import { BrAppHeader } from "@/components/br/AppChrome";
import { FONT } from "@/components/br/fonts";
import { apiPost } from "@/lib/api";

interface Msg {
  role: "user" | "assistant";
  text: string;
  time: string;
}

function ts(): string {
  const n = new Date();
  return `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
}

async function askCopilot(history: Msg[], question: string, lang: "en" | "id"): Promise<string> {
  const language = lang === "en" ? "English" : "Bahasa Indonesia";
  const context = history.slice(-6).map((m) => `${m.role === "user" ? "User" : "Copilot"}: ${m.text}`).join("\n");
  const prompt = `You are BrandReel Copilot, an assistant embedded in a short-form UGC video app. Help the user with hook ideas, caption tuning, and posting-time advice. Be concise (2-4 sentences unless asked for a list). Reply in ${language}.\n\n${context ? context + "\n" : ""}User: ${question}`;
  const res = await apiPost("/generate", { prompt, maxTokens: 500 });
  const text = res?.content?.[0]?.text;
  if (!text) throw new Error("Balasan kosong dari Claude");
  return text.trim();
}

export default function CopilotScreen() {
  const { theme, lang, t, account } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Msg[]>([{
    role: "assistant",
    time: "",
    text: lang === "en"
      ? `Hi ${(account?.name ?? account?.email ?? "there").split(" ")[0]} — I'm your BrandReel Copilot. Ask me to draft hooks, tune captions, or pick the best posting window.`
      : `Hai ${(account?.name ?? account?.email ?? "").split(" ")[0]} — saya Copilot BrandReel. Minta saya buat hook, atur caption, atau pilih waktu posting terbaik.`,
  }]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const suggestions = lang === "en"
    ? ["Write a TikTok hook for a bamboo bottle", "Why is my LinkedIn reach low?", "Best time to post Reels?"]
    : ["Buat hook TikTok untuk botol bambu", "Kenapa reach LinkedIn rendah?", "Waktu terbaik posting Reels?"];

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, busy]);

  async function send(text?: string) {
    const txt = (text ?? draft).trim();
    if (!txt || busy) return;
    setDraft("");
    const history = messages;
    setMessages((m) => [...m, { role: "user", text: txt, time: ts() }]);
    setBusy(true);
    try {
      const reply = await askCopilot(history, txt, lang);
      setMessages((m) => [...m, { role: "assistant", text: reply, time: ts() }]);
    } catch (e: any) {
      setMessages((m) => [...m, {
        role: "assistant",
        text: e.message ?? (lang === "en" ? "(Connection issue — please retry)" : "(Gangguan koneksi — coba lagi)"),
        time: "—",
      }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: theme.canvas }}>
      <View style={{ height: insets.top }} />
      <BrAppHeader
        title={t.inbox.copilot}
        subtitle="AI · CLAUDE"
        color={theme.accent}
        onBack={() => router.back()}
        right={
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 5,
            paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999,
            backgroundColor: theme.accent + "16", borderWidth: 1, borderColor: theme.hair,
          }}>
            <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: theme.accent }} />
            <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9, letterSpacing: 1.2, color: theme.accent }}>LIVE</Text>
          </View>
        }
      />

      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8, gap: 8 }}>
        {messages.map((m, i) => {
          const u = m.role === "user";
          const bubble = (
            <View style={{
              maxWidth: "82%",
              paddingVertical: 9, paddingHorizontal: 13, borderRadius: 15,
              backgroundColor: u ? undefined : theme.glassHi,
              borderWidth: u ? 0 : 1, borderColor: theme.hair,
              overflow: "hidden",
            }}>
              <Text style={{ fontFamily: FONT.sans, fontSize: 13.5, lineHeight: 19.5, color: u ? "#fff" : theme.ink }}>{m.text}</Text>
              {!!m.time && (
                <Text style={{ fontFamily: FONT.mono, fontSize: 8.5, letterSpacing: 0.8, marginTop: 4, color: u ? "rgba(255,255,255,0.6)" : theme.ink3, textAlign: "right" }}>
                  {m.time}
                </Text>
              )}
            </View>
          );
          return (
            <View key={i} style={{ flexDirection: "row", justifyContent: u ? "flex-end" : "flex-start" }}>
              {u ? (
                <LinearGradient colors={[theme.brand, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.6 }}
                  style={{ maxWidth: "82%", borderRadius: 15 }}>
                  <View style={{ paddingVertical: 9, paddingHorizontal: 13 }}>
                    <Text style={{ fontFamily: FONT.sans, fontSize: 13.5, lineHeight: 19.5, color: "#fff" }}>{m.text}</Text>
                    {!!m.time && (
                      <Text style={{ fontFamily: FONT.mono, fontSize: 8.5, letterSpacing: 0.8, marginTop: 4, color: "rgba(255,255,255,0.6)", textAlign: "right" }}>
                        {m.time}
                      </Text>
                    )}
                  </View>
                </LinearGradient>
              ) : bubble}
            </View>
          );
        })}

        {busy && (
          <View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
            <View style={{
              paddingVertical: 10, paddingHorizontal: 14, borderRadius: 15,
              backgroundColor: theme.glassHi, borderWidth: 1, borderColor: theme.hair, flexDirection: "row", gap: 4,
            }}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: theme.ink3 }} />
              ))}
            </View>
          </View>
        )}

        {messages.length <= 1 && !busy && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, marginTop: 6 }}>
            {suggestions.map((s, i) => (
              <Pressable key={i} onPress={() => send(s)}
                style={({ pressed }) => ({
                  borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassHi,
                  borderRadius: 999, paddingVertical: 8, paddingHorizontal: 13,
                  transform: [{ scale: pressed ? 0.95 : 1 }],
                })}>
                <Text style={{ fontFamily: FONT.sansSemi, fontSize: 12, color: theme.ink2 }}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Komposer */}
      <View style={{
        paddingTop: 8, paddingHorizontal: 12, paddingBottom: 12 + insets.bottom,
        borderTopWidth: 1, borderTopColor: theme.hair2, backgroundColor: theme.glassHi,
        flexDirection: "row", gap: 8, alignItems: "flex-end",
      }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => send()}
          placeholder={t.inbox.typePh}
          placeholderTextColor={theme.ink3}
          multiline
          style={{
            flex: 1, borderWidth: 1, borderColor: theme.hair, borderRadius: 18,
            paddingVertical: 10, paddingHorizontal: 14, backgroundColor: theme.canvas, color: theme.ink,
            fontFamily: FONT.sans, fontSize: 13.5, maxHeight: 100,
          }}
        />
        <Pressable onPress={() => send()} disabled={!draft.trim() || busy}
          style={({ pressed }) => ({ opacity: !draft.trim() || busy ? 0.4 : 1, transform: [{ scale: pressed ? 0.9 : 1 }] })}>
          <LinearGradient colors={[theme.brand, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0.6 }}
            style={{ width: 38, height: 38, borderRadius: 999, alignItems: "center", justifyContent: "center" }}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="#fff">
              <Path d="M3 11l18-8-8 18-2-7-8-3z" />
            </Svg>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
