// Konteks global BrandReel: tema, bahasa, persona, skenario.
// Padanan BrCtx di prototype (assets/br-shell.jsx + br-app.jsx).

import React, { createContext, useContext, useMemo, useState } from "react";
import { buildTheme, type AccentKey, type Theme, type ThemeKey } from "../theme/tokens";
import { BR_T, type Lang, type Strings } from "../i18n/strings";
import { BR_PERSONAS, BR_SCENARIOS, type Persona, type PersonaId, type Scenario, type ScenarioId } from "../data/personas";
import type { CampaignStatus } from "../data/campaigns";

export interface BrContextValue {
  theme: Theme;
  themeKey: ThemeKey;
  accentKey: AccentKey;
  lang: Lang;
  t: Strings;
  persona: Persona;
  scenario: Scenario;
  autopost: boolean;
  setThemeKey: (k: ThemeKey) => void;
  setAccentKey: (k: AccentKey) => void;
  setLang: (l: Lang) => void;
  setPersonaId: (p: PersonaId) => void;
  setScenarioId: (s: ScenarioId) => void;
  setAutopost: (v: boolean) => void;
}

const BrCtx = createContext<BrContextValue | null>(null);

export function BrProvider({ children }: { children: React.ReactNode }) {
  const [themeKey, setThemeKey] = useState<ThemeKey>("mist");
  const [accentKey, setAccentKey] = useState<AccentKey>("violet");
  const [lang, setLang] = useState<Lang>("id");
  const [personaId, setPersonaId] = useState<PersonaId>("brand");
  const [scenarioId, setScenarioId] = useState<ScenarioId>("viral");
  const [autopost, setAutopost] = useState(true);

  const value = useMemo<BrContextValue>(() => ({
    theme: buildTheme(themeKey, accentKey),
    themeKey,
    accentKey,
    lang,
    t: BR_T[lang],
    persona: BR_PERSONAS[personaId],
    scenario: BR_SCENARIOS[scenarioId],
    autopost,
    setThemeKey,
    setAccentKey,
    setLang,
    setPersonaId,
    setScenarioId,
    setAutopost,
  }), [themeKey, accentKey, lang, personaId, scenarioId, autopost]);

  return <BrCtx.Provider value={value}>{children}</BrCtx.Provider>;
}

export function useBr(): BrContextValue {
  const ctx = useContext(BrCtx);
  if (!ctx) throw new Error("useBr harus dipakai di dalam <BrProvider>");
  return ctx;
}

// Metadata tampilan status kampanye (warna dari tema saat render).
export function brStatusMeta(status: CampaignStatus, theme: Theme, t: Strings) {
  const m = {
    draft: { label: t.status.draft, color: theme.ink3, dot: false },
    generating: { label: t.status.generating, color: theme.accent, dot: true },
    ready: { label: t.status.ready, color: theme.info, dot: false },
    publishing: { label: t.status.publishing, color: theme.warn, dot: true },
    live: { label: t.status.live, color: theme.pos, dot: true },
    failed: { label: t.status.failed, color: theme.neg, dot: true },
  } as const;
  return m[status] ?? m.draft;
}
