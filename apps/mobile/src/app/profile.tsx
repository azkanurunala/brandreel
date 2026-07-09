// Profil — porting BrProfile dari prototype assets/br-screens-insights.jsx.
// Fase 4: "Akun terhubung" ditarik dari GET /connections nyata (bukan
// persona.platforms dummy lagi) — "Tambah channel" memicu OAuth nyata utk
// semua 6 platform (start -> consent browser -> callback backend ->
// Connection tersimpan terenkripsi). Sheet paket/brand kit/tim menyusul.

import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { useBr } from "@/context/BrContext";
import { BR_PLATFORMS, BR_PLATFORM_ORDER, type PlatformId } from "@/theme/tokens";
import { BR_PERSONAS, BR_PERSONA_ORDER } from "@/data/personas";
import { BrAppShell, BrAppHeader, GhostButton } from "@/components/br/AppChrome";
import { GlassChip, GlassPanel } from "@/components/br/Glass";
import { PlatformBadge } from "@/components/br/BrandGlyph";
import { FONT } from "@/components/br/fonts";
import { apiGet, apiPost } from "@/lib/api";
import { clearToken } from "@/lib/session";

const OAUTH_IMPLEMENTED: PlatformId[] = ["tiktok", "instagram", "youtube", "linkedin", "twitter", "facebook"];

// Enum backend/Prisma pakai "x"; frontend pakai "twitter" (sesuai prototype).
function toBackendPlatform(pid: PlatformId): string {
  return pid === "twitter" ? "x" : pid;
}
function toFrontendPlatform(p: string): PlatformId {
  return p === "x" ? "twitter" : (p as PlatformId);
}

interface LiveConnection {
  id: string;
  platform: string;
  handle: string | null;
  status: "active" | "expiring" | "expired" | "revoked";
  expiresAt: string | null;
}

function connectionNote(c: LiveConnection, lang: "en" | "id"): string {
  if (!c.expiresAt) return lang === "en" ? "connected" : "terhubung";
  const daysLeft = Math.round((new Date(c.expiresAt).getTime() - Date.now()) / 86_400_000);
  if (daysLeft <= 0) return lang === "en" ? "expired" : "kedaluwarsa";
  if (daysLeft <= 3) return lang === "en" ? `expires in ${daysLeft}d` : `kedaluwarsa ${daysLeft}h lagi`;
  return lang === "en" ? `valid · ${daysLeft} days left` : `valid · ${daysLeft} hari lagi`;
}

function Eyebrow({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <View style={{ paddingTop: 18, paddingHorizontal: 4, paddingBottom: 8 }}>
      <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 2.2, textTransform: "uppercase", color }}>{children}</Text>
    </View>
  );
}

function ProgressBar({ pct, colors, track }: { pct: number; colors: [string, string]; track: string }) {
  return (
    <View style={{ height: 7, borderRadius: 999, backgroundColor: track, overflow: "hidden" }}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ height: "100%", width: `${Math.min(100, pct * 100)}%`, borderRadius: 999 }} />
    </View>
  );
}

export default function ProfileScreen() {
  const { theme, lang, t, persona, setPersonaId } = useBr();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [connections, setConnections] = useState<LiveConnection[] | null>(null);
  const [extra, setExtra] = useState<Record<string, boolean>>({});
  const [connecting, setConnecting] = useState<PlatformId | null>(null);

  const loadConnections = useCallback(async () => {
    try {
      const list = await apiGet("/connections");
      setConnections(list);
    } catch (e) {
      console.warn("gagal ambil /connections:", e);
      setConnections([]);
    }
  }, []);

  useEffect(() => { loadConnections(); }, [loadConnections]);

  async function handleConnect(pid: PlatformId) {
    if (!OAUTH_IMPLEMENTED.includes(pid)) {
      // Belum diimplementasi server-side — simulasi lokal saja (lihat Bab 04 §5).
      setExtra((e) => ({ ...e, [pid]: true }));
      return;
    }
    setConnecting(pid);
    try {
      const { consentUrl } = await apiPost(`/auth/${toBackendPlatform(pid)}/start`, {});
      const result = await WebBrowser.openAuthSessionAsync(consentUrl, "brandreel://oauth-callback");
      if (result.type === "success" && result.url.includes("status=error")) {
        Alert.alert(lang === "en" ? "Connection failed" : "Gagal terhubung", pid);
      }
      // Reload selalu — di web, redirect brandreel:// gak selalu terdeteksi
      // sebagai "success" oleh openAuthSessionAsync, tapi koneksinya bisa
      // saja sudah tersimpan di server (lihat callback HTML "berhasil").
      await loadConnections();
    } catch (e: any) {
      Alert.alert(lang === "en" ? "Connection failed" : "Gagal terhubung", e.message ?? String(e));
    } finally {
      setConnecting(null);
    }
  }

  const liveConnections = connections ?? [];
  const connectedIds = liveConnections.map((c) => toFrontendPlatform(c.platform));
  const available = BR_PLATFORM_ORDER.filter((p) => !connectedIds.includes(p) && !extra[p]);
  const usedPct = persona.posts_quota === Infinity ? 0.48 : persona.posts_used / persona.posts_quota;
  const veoPct = persona.veo_quota ? persona.veo_used / persona.veo_quota : 0;

  return (
    <BrAppShell theme={theme} density="soft">
      <View style={{ height: insets.top }} />
      <BrAppHeader title={t.profile.title} subtitle="ACCOUNT · RBAC" onBack={() => router.back()} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 }}>
        {/* Kartu persona */}
        <LinearGradient colors={[theme.brandDk, theme.accent]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ padding: 18, borderRadius: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: persona.color, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontFamily: FONT.display, fontSize: 18, color: "#fff" }}>{persona.initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9.5, color: "rgba(255,255,255,0.85)", letterSpacing: 1.2, textTransform: "uppercase" }}>
                {lang === "en" ? persona.role_en : persona.role_id}
              </Text>
              <Text style={{ fontFamily: FONT.display, fontSize: 21, color: "#fff", marginTop: 3, letterSpacing: -0.4 }}>{persona.name}</Text>
              <Text style={{ fontFamily: FONT.sans, fontSize: 11.5, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>
                {persona.handle} · {lang === "en" ? persona.bio_en : persona.bio_id}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Paket & pemakaian */}
        <Eyebrow color={theme.ink3}>{t.profile.plan}</Eyebrow>
        <GlassPanel theme={theme} padding={15}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontFamily: FONT.display, fontSize: 18, color: theme.ink, letterSpacing: -0.3 }}>{persona.plan_label}</Text>
              <Text style={{ fontFamily: FONT.mono, fontSize: 9.5, color: theme.ink3, letterSpacing: 0.6, marginTop: 2 }}>{persona.price}</Text>
            </View>
            <Pressable style={({ pressed }) => ({
              borderWidth: 1, borderColor: theme.brand, backgroundColor: theme.brand + "12",
              borderRadius: 999, paddingVertical: 7, paddingHorizontal: 14,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}>
              <Text style={{ fontFamily: FONT.sansBold, fontSize: 12, color: theme.brand }}>{t.profile.upgrade}</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14, marginBottom: 6 }}>
            <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.8, textTransform: "uppercase" }}>
              {lang === "en" ? "Posts this month" : "Post bulan ini"}
            </Text>
            <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9.5, color: theme.ink2 }}>
              {persona.posts_used}/{persona.posts_quota === Infinity ? "∞" : persona.posts_quota}
            </Text>
          </View>
          <ProgressBar pct={usedPct} colors={[theme.brand, theme.accent]} track={theme.hair} />

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 15, marginBottom: 6 }}>
            <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.8, textTransform: "uppercase" }}>
              {lang === "en" ? "AI video renders · Veo" : "Render video AI · Veo"}
            </Text>
            <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9.5, color: veoPct > 0.85 ? theme.warn : theme.ink2 }}>
              {persona.veo_used}/{persona.veo_quota}
            </Text>
          </View>
          <ProgressBar
            pct={veoPct}
            colors={veoPct > 0.85 ? [theme.warn, theme.neg] : [theme.brand, theme.accent]}
            track={theme.hair}
          />
        </GlassPanel>

        {/* Akun terhubung — data nyata dari GET /connections */}
        <Eyebrow color={theme.ink3}>{t.profile.accounts} · {liveConnections.length}</Eyebrow>
        {connections === null ? (
          <GlassPanel theme={theme} padding={16} tone="solid">
            <Text style={{ fontFamily: FONT.mono, fontSize: 10, color: theme.ink3, letterSpacing: 0.6, textTransform: "uppercase" }}>
              {lang === "en" ? "Loading…" : "Memuat…"}
            </Text>
          </GlassPanel>
        ) : liveConnections.length === 0 ? (
          <GlassPanel theme={theme} padding={16} tone="solid">
            <Text style={{ fontFamily: FONT.sans, fontSize: 12.5, color: theme.ink2, lineHeight: 18 }}>
              {lang === "en" ? "No accounts connected yet — add one below." : "Belum ada akun terhubung — tambah di bawah."}
            </Text>
          </GlassPanel>
        ) : (
          <GlassPanel theme={theme} padding={6} tone="solid">
            {liveConnections.map((c, i) => {
              const pid = toFrontendPlatform(c.platform);
              const p = BR_PLATFORMS[pid];
              const expiring = c.status === "expiring" || c.status === "expired";
              return (
                <View key={c.id} style={{
                  flexDirection: "row", alignItems: "center", gap: 12,
                  paddingVertical: 10, paddingHorizontal: 10,
                  borderTopWidth: i ? 1 : 0, borderTopColor: theme.hair2,
                }}>
                  <PlatformBadge pid={pid} size={32} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: FONT.sansSemi, fontSize: 13, color: theme.ink }}>
                      {p.name}{c.handle ? ` · ${c.handle}` : ""}
                    </Text>
                    <Text numberOfLines={1} style={{ fontFamily: FONT.mono, fontSize: 8.5, color: expiring ? theme.warn : theme.ink3, letterSpacing: 0.4, marginTop: 2, textTransform: "uppercase" }}>
                      {connectionNote(c, lang)}
                    </Text>
                  </View>
                  {expiring ? (
                    <Pressable
                      onPress={async () => {
                        try { await apiPost(`/connections/${c.id}/refresh`, {}); await loadConnections(); }
                        catch (e: any) { Alert.alert(lang === "en" ? "Refresh failed" : "Gagal refresh", e.message ?? String(e)); }
                      }}
                      style={({ pressed }) => ({
                        borderWidth: 1, borderColor: theme.warn, backgroundColor: theme.warn + "16",
                        borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12,
                        transform: [{ scale: pressed ? 0.95 : 1 }],
                      })}>
                      <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9.5, color: theme.warn, letterSpacing: 0.6, textTransform: "uppercase" }}>
                        ↻ {t.profile.expired}
                      </Text>
                    </Pressable>
                  ) : (
                    <GlassChip theme={theme} color={theme.pos}>● {t.profile.connected}</GlassChip>
                  )}
                </View>
              );
            })}
          </GlassPanel>
        )}

        {/* Tambah channel — TikTok pakai OAuth nyata; lainnya simulasi sampai diimplementasi */}
        {available.length > 0 && (
          <>
            <Eyebrow color={theme.ink3}>{lang === "en" ? "ADD CHANNELS" : "TAMBAH CHANNEL"}</Eyebrow>
            <View style={{ gap: 8 }}>
              {available.map((pid) => {
                const p = BR_PLATFORMS[pid];
                const busy = connecting === pid;
                return (
                  <Pressable key={pid} onPress={() => handleConnect(pid)} disabled={busy}
                    style={({ pressed }) => ({
                      borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassHi,
                      borderRadius: 14, paddingVertical: 10, paddingHorizontal: 12,
                      flexDirection: "row", alignItems: "center", gap: 12, opacity: busy ? 0.6 : 1,
                      transform: [{ scale: pressed ? 0.985 : 1 }],
                    })}>
                    <PlatformBadge pid={pid} size={32} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontFamily: FONT.sansSemi, fontSize: 13, color: theme.ink }}>{p.name}</Text>
                      <Text style={{ fontFamily: FONT.mono, fontSize: 8.5, color: theme.ink3, letterSpacing: 0.4, marginTop: 2, textTransform: "uppercase" }}>
                        {lang === "en" ? "Not connected" : "Belum terhubung"}
                      </Text>
                    </View>
                    <View style={{ borderWidth: 1, borderColor: p.color + "55", backgroundColor: p.color + "12", borderRadius: 999, paddingVertical: 5, paddingHorizontal: 12 }}>
                      <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9.5, color: p.color, letterSpacing: 0.8, textTransform: "uppercase" }}>
                        {busy ? "···" : t.onboard.connect}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        {/* Workspace */}
        <Eyebrow color={theme.ink3}>WORKSPACE</Eyebrow>
        <View style={{ gap: 8 }}>
          <SettingRow
            icon="kit"
            label={t.profile.brandkit}
            value={lang === "en" ? persona.voice_en : persona.voice_id}
            locked={!persona.can.brandkit}
            lockLabel={lang === "en" ? "View only" : "Lihat saja"}
          />
          {persona.can.team ? (
            <SettingRow icon="team" label={t.profile.team} value={`${persona.brands} ${lang === "en" ? "brands · 10 seats" : "brand · 10 kursi"}`} />
          ) : persona.can.multiBrand ? (
            <SettingRow icon="team" label={lang === "en" ? "Assigned brands" : "Brand ditugaskan"} value={`${persona.brands} ${lang === "en" ? "brands" : "brand"}`} />
          ) : null}
        </View>

        {/* Developer */}
        <Eyebrow color={theme.ink3}>DEVELOPER</Eyebrow>
        {persona.can.billing ? (
          <View style={{ gap: 8 }}>
            <Pressable onPress={() => router.push("/setup")}
              style={({ pressed }) => ({
                borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassHi,
                borderRadius: 14, paddingVertical: 12, paddingHorizontal: 13,
                flexDirection: "row", alignItems: "center", gap: 12,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              })}>
              <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: theme.accent + "16", borderWidth: 1, borderColor: theme.hair, alignItems: "center", justifyContent: "center" }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M8 6L3 12l5 6M16 6l5 6-5 6" />
                </Svg>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: FONT.sansSemi, fontSize: 13, color: theme.ink }}>{lang === "en" ? "API setup" : "Setup API"}</Text>
                <Text style={{ fontFamily: FONT.sans, fontSize: 11, color: theme.ink3, marginTop: 1 }}>
                  {lang === "en" ? "Connect publishing, AI & messaging APIs" : "Hubungkan API publikasi, AI & pesan"}
                </Text>
              </View>
              <Text style={{ color: theme.ink3, fontSize: 18 }}>›</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/economics")}
              style={({ pressed }) => ({
                borderWidth: 1, borderColor: theme.hair, backgroundColor: theme.glassHi,
                borderRadius: 14, paddingVertical: 12, paddingHorizontal: 13,
                flexDirection: "row", alignItems: "center", gap: 12,
                transform: [{ scale: pressed ? 0.985 : 1 }],
              })}>
              <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: theme.pos + "16", borderWidth: 1, borderColor: theme.hair, alignItems: "center", justifyContent: "center" }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={theme.pos} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
                </Svg>
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={{ fontFamily: FONT.sansSemi, fontSize: 13, color: theme.ink }}>{lang === "en" ? "Unit economics" : "Unit ekonomi"}</Text>
                <Text style={{ fontFamily: FONT.sans, fontSize: 11, color: theme.ink3, marginTop: 1 }}>
                  {lang === "en" ? "Margins, API costs & pricing" : "Margin, biaya API & harga"}
                </Text>
              </View>
              <Text style={{ color: theme.ink3, fontSize: 18 }}>›</Text>
            </Pressable>
          </View>
        ) : (
          <SettingRow icon="kit" label={lang === "en" ? "API setup" : "Setup API"} value={lang === "en" ? "Admin / owner only" : "Hanya admin / owner"} locked lockLabel={lang === "en" ? "Locked" : "Terkunci"} />
        )}

        {/* Ganti persona (demo RBAC) */}
        <Eyebrow color={theme.ink3}>{t.profile.switch}</Eyebrow>
        <View style={{ gap: 8 }}>
          {BR_PERSONA_ORDER.map((pid) => {
            const p = BR_PERSONAS[pid];
            const active = p.id === persona.id;
            return (
              <Pressable key={pid} onPress={() => setPersonaId(pid)}
                style={({ pressed }) => ({
                  padding: 12, borderRadius: 14,
                  backgroundColor: active ? theme.glassHi : "transparent",
                  borderWidth: 1, borderColor: active ? theme.brand : theme.hair2,
                  flexDirection: "row", alignItems: "center", gap: 12,
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                })}>
                <View style={{ width: 36, height: 36, borderRadius: 11, backgroundColor: p.color, alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontFamily: FONT.display, fontSize: 12, color: "#fff" }}>{p.initial}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: FONT.sansSemi, fontSize: 13.5, color: theme.ink }}>
                    {lang === "en" ? p.role_en : p.role_id}
                  </Text>
                  <Text style={{ fontFamily: FONT.mono, fontSize: 9, color: theme.ink3, letterSpacing: 0.5, marginTop: 2, textTransform: "uppercase" }}>
                    {p.plan_label} · {p.platforms.length} {lang === "en" ? "channels" : "channel"}
                  </Text>
                </View>
                {active ? (
                  <Text style={{ fontFamily: FONT.monoSemi, fontSize: 9.5, color: theme.brand, letterSpacing: 1 }}>
                    ● {t.profile.active.toUpperCase()}
                  </Text>
                ) : (
                  <Text style={{ color: theme.ink3 }}>›</Text>
                )}
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 22 }}>
          <GhostButton theme={theme} onPress={async () => {
            try { await apiPost("/auth/logout", {}); } catch { /* token mungkin sudah invalid — tetap lanjut hapus lokal */ }
            await clearToken();
            router.replace("/login");
          }}>
            <Text style={{ color: theme.neg }}>{t.profile.signout}</Text>
          </GhostButton>
        </View>
      </ScrollView>
    </BrAppShell>
  );
}

function SettingRow({ icon, label, value, locked, lockLabel }: {
  icon: "kit" | "team";
  label: string;
  value: string;
  locked?: boolean;
  lockLabel?: string;
}) {
  const { theme } = useBr();
  return (
    <View style={{
      backgroundColor: theme.glassHi, borderWidth: 1, borderColor: theme.hair,
      borderRadius: 14, paddingVertical: 12, paddingHorizontal: 13,
      flexDirection: "row", alignItems: "center", gap: 12,
    }}>
      <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: theme.brand + "12", borderWidth: 1, borderColor: theme.hair, alignItems: "center", justifyContent: "center" }}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={theme.brand} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
          {icon === "kit" ? (
            <Path d="M3 7l9-4 9 4-9 4-9-4zM3 12l9 4 9-4M3 17l9 4 9-4" />
          ) : (
            <G>
              <Circle cx={9} cy={8} r={3} />
              <Path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M22 20a6 6 0 0 0-4-5.6" />
            </G>
          )}
        </Svg>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: FONT.sansSemi, fontSize: 13, color: theme.ink }}>{label}</Text>
        <Text numberOfLines={1} style={{ fontFamily: FONT.sans, fontSize: 11, color: theme.ink3, marginTop: 1 }}>{value}</Text>
      </View>
      {locked ? (
        <GlassChip theme={theme} color={theme.ink3}>🔒 {lockLabel}</GlassChip>
      ) : (
        <Text style={{ color: theme.ink3, fontSize: 18 }}>›</Text>
      )}
    </View>
  );
}
