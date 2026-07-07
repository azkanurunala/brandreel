// Persona + RBAC + skenario momentum — porting dari prototype assets/br-personas.jsx.
// Fase 2: data dummy; nanti diganti data akun asli dari backend.

export type PersonaId = "creator" | "brand" | "agency_admin" | "agency_member";
export type Capability = "create" | "analytics" | "brandkit" | "voiceLearn" | "team" | "multiBrand" | "billing";

export interface Persona {
  id: PersonaId;
  name: string;
  handle: string;
  role_id: string;
  role_en: string;
  bio_id: string;
  bio_en: string;
  initial: string;
  color: string;
  plan: string;
  plan_label: string;
  price: string;
  posts_used: number;
  posts_quota: number; // Infinity = tak terbatas
  veo_used: number;
  veo_quota: number;
  voice_id: string;
  voice_en: string;
  platforms: string[];
  brands: number;
  can: Record<Capability, boolean>;
}

export const BR_PERSONAS: Record<PersonaId, Persona> = {
  creator: {
    id: "creator", name: "Maya Putri", handle: "@mayareviews",
    role_id: "Kreator Solo", role_en: "Solo Creator",
    bio_id: "Review gadget · humor satir · 50rb pengikut", bio_en: "Tech reviews · sarcastic humor · 50K followers",
    initial: "MP", color: "#F23E5C", plan: "creator", plan_label: "Creator", price: "$39/mo",
    posts_used: 18, posts_quota: 30, veo_used: 9, veo_quota: 12,
    voice_id: "Santai, lucu, sedikit satir", voice_en: "Casual, funny, lightly sarcastic",
    platforms: ["tiktok", "instagram"], brands: 1,
    can: { create: true, analytics: true, brandkit: true, voiceLearn: true, team: false, multiBrand: false, billing: true },
  },
  brand: {
    id: "brand", name: "Inez Saraswati", handle: "@ecogoods.id",
    role_id: "Pemilik Brand DTC", role_en: "DTC Brand Owner",
    bio_id: "Eco Goods · produk berkelanjutan", bio_en: "Eco Goods · sustainable products",
    initial: "IS", color: "#1FA971", plan: "pro", plan_label: "Pro", price: "$99/mo",
    posts_used: 64, posts_quota: 100, veo_used: 31, veo_quota: 40,
    voice_id: "Kasual, ramah milenial, sadar lingkungan", voice_en: "Casual, millennial-friendly, eco-conscious",
    platforms: ["tiktok", "instagram", "youtube", "linkedin", "twitter"], brands: 1,
    can: { create: true, analytics: true, brandkit: true, voiceLearn: true, team: false, multiBrand: false, billing: true },
  },
  agency_admin: {
    id: "agency_admin", name: "Devi Anggara", handle: "@studiokarya",
    role_id: "Manajer Agensi", role_en: "Agency Manager",
    bio_id: "Studio Karya · kelola 20 brand DTC", bio_en: "Studio Karya · managing 20 DTC brands",
    initial: "DA", color: "#6D4AFF", plan: "agency", plan_label: "Agency", price: "$299/mo",
    posts_used: 482, posts_quota: Infinity, veo_used: 118, veo_quota: 150,
    voice_id: "Per-brand · diatur tim", voice_en: "Per-brand · set by team",
    platforms: ["tiktok", "instagram", "youtube", "linkedin", "twitter"], brands: 20,
    can: { create: true, analytics: true, brandkit: true, voiceLearn: true, team: true, multiBrand: true, billing: true },
  },
  agency_member: {
    id: "agency_member", name: "Rangga Wijaya", handle: "@studiokarya",
    role_id: "Anggota Tim Agensi", role_en: "Agency Team Member",
    bio_id: "Studio Karya · 10 brand ditugaskan", bio_en: "Studio Karya · 10 brands assigned",
    initial: "RW", color: "#E0A11B", plan: "agency", plan_label: "Agency · Seat", price: "—",
    posts_used: 210, posts_quota: Infinity, veo_used: 64, veo_quota: 150,
    voice_id: "Per-brand · diatur manajer", voice_en: "Per-brand · set by manager",
    platforms: ["tiktok", "instagram", "youtube", "linkedin", "twitter"], brands: 10,
    can: { create: true, analytics: true, brandkit: false, voiceLearn: false, team: false, multiBrand: true, billing: false },
  },
};
export const BR_PERSONA_ORDER: PersonaId[] = ["creator", "brand", "agency_admin", "agency_member"];

export function brCanAccess(persona: Persona | null | undefined, cap: Capability): boolean {
  return !!(persona && persona.can && persona.can[cap]);
}

// Skenario momentum akun — skala baseline KPI.
export type ScenarioId = "steady" | "trending" | "viral";

export interface Scenario {
  id: ScenarioId;
  label_id: string;
  label_en: string;
  accent: string;
  impressions: string;
  eng: string;
  reach: string;
  live: number;
  summary_id: string;
  summary_en: string;
}

export const BR_SCENARIOS: Record<ScenarioId, Scenario> = {
  steady:   { id: "steady", label_id: "Stabil", label_en: "Steady", accent: "#2D7FF0", impressions: "48.2K", eng: "2.1%", reach: "+6%", live: 3, summary_id: "Posting rutin · performa stabil.", summary_en: "Consistent posting · stable performance." },
  trending: { id: "trending", label_id: "Naik", label_en: "Trending", accent: "#E0A11B", impressions: "182K", eng: "3.4%", reach: "+38%", live: 7, summary_id: "Hook unboxing sedang naik daun.", summary_en: "Unboxing hooks are gaining traction." },
  viral:    { id: "viral", label_id: "Viral", label_en: "Viral", accent: "#F23E5C", impressions: "1.4M", eng: "5.8%", reach: "+212%", live: 11, summary_id: "Hook 3 viral di TikTok · 1,2 jt tayangan.", summary_en: "Hook 3 went viral on TikTok · 1.2M views." },
};
export const BR_SCENARIO_ORDER: ScenarioId[] = ["steady", "trending", "viral"];
