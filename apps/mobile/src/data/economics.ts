// Unit ekonomi — porting BR_COST/BR_UNIT/BR_PLAN_ECON dkk dari prototype
// assets/br-economics.jsx. Harga acuan publik Anthropic & Google Veo.

export const BR_COST = {
  claude: { haiku: { in: 1.0, out: 5.0 }, sonnet: { in: 3.0, out: 15.0 } },
  veo: { fast: 0.15, standard: 0.4, liteNoAudio: 0.03 },
  veoClipSec: 6,
  storagePerClip: 0.01,
  cdnPerPost: 0.006,
  transcodePerPost: 0.003,
  publishApiPerPost: 0.0005,
  store: {
    appstore: { rate: 0.3, label_en: "App Store · 30%", label_id: "App Store · 30%", note_en: "Standard first-year rate", note_id: "Tarif tahun pertama" },
    appstoreSmb: { rate: 0.15, label_en: "App Store · 15%", label_id: "App Store · 15%", note_en: "Small Business / yr 2+", note_id: "Small Business / thn 2+" },
    play: { rate: 0.15, label_en: "Google Play · 15%", label_id: "Google Play · 15%", note_en: "First $1M / yr rate", note_id: "Tarif $1J pertama / thn" },
    web: { rate: 0.029, fixed: 0.3, label_en: "Web · Stripe", label_id: "Web · Stripe", note_en: "2.9% + $0.30, no store cut", note_id: "2,9% + $0,30, tanpa potongan" },
  },
  sources: "Anthropic API & Google Veo 3.1 (Gemini API) public pricing.",
} as const;

export type StoreKey = keyof typeof BR_COST.store;
export const BR_STORE_ORDER: StoreKey[] = ["appstore", "appstoreSmb", "play", "web"];

export function brClaudeCost(model: "haiku" | "sonnet", inTok: number, outTok: number): number {
  const m = BR_COST.claude[model] ?? BR_COST.claude.haiku;
  return (inTok * m.in + outTok * m.out) / 1e6;
}
export function brVeoCost(tier: keyof typeof BR_COST.veo, sec?: number): number {
  return (BR_COST.veo[tier] ?? BR_COST.veo.fast) * (sec ?? BR_COST.veoClipSec);
}

export const BR_UNIT = {
  hookGen: brClaudeCost("sonnet", 520, 760),
  caption: brClaudeCost("haiku", 360, 150),
  copilotMsg: brClaudeCost("sonnet", 800, 220),
  veoClip: brVeoCost("fast"),
  veoClipStd: brVeoCost("standard"),
  veoLite: brVeoCost("liteNoAudio"),
  canvasClip: 0.0008,
  postOps: BR_COST.transcodePerPost + BR_COST.cdnPerPost + BR_COST.publishApiPerPost,
};

export interface PlanEcon {
  price: number;
  veoIncl: number;
  posts: number;
  campaigns: number;
  copilot: number;
  persona: string;
  rank: number;
  fairUse?: boolean;
}

export const BR_PLAN_ECON: Record<"creator" | "pro" | "agency", PlanEcon> = {
  creator: { price: 39, veoIncl: 12, posts: 30, campaigns: 8, copilot: 40, persona: "creator", rank: 1 },
  pro: { price: 99, veoIncl: 40, posts: 100, campaigns: 20, copilot: 150, persona: "brand", rank: 2 },
  agency: { price: 299, veoIncl: 150, posts: 1500, campaigns: 60, copilot: 600, persona: "agency_admin", rank: 3, fairUse: true },
};
export const BR_PLAN_ORDER: ("creator" | "pro" | "agency")[] = ["creator", "pro", "agency"];

export const BR_VEO_PACKS = [
  { id: "v20", renders: 20, price: 39.99 },
  { id: "v50", renders: 50, price: 89.99 },
  { id: "v120", renders: 120, price: 199.99 },
];

export function brPlanCOGS(plan: PlanEcon): number {
  return plan.veoIncl * BR_UNIT.veoClip
    + plan.posts * (BR_UNIT.postOps + BR_UNIT.caption)
    + plan.campaigns * BR_UNIT.hookGen
    + plan.copilot * BR_UNIT.copilotMsg;
}
export function brNetRevenue(gross: number, storeKey: StoreKey): number {
  const s = BR_COST.store[storeKey] ?? BR_COST.store.appstore;
  const fixed = "fixed" in s ? s.fixed : undefined;
  return fixed != null ? gross * (1 - s.rate) - fixed : gross * (1 - s.rate);
}
export function brPlanPnL(planKey: keyof typeof BR_PLAN_ECON, storeKey: StoreKey) {
  const plan = BR_PLAN_ECON[planKey];
  const gross = plan.price;
  const net = brNetRevenue(gross, storeKey);
  const cogs = brPlanCOGS(plan);
  const margin = net - cogs;
  const s = BR_COST.store[storeKey];
  const fixed = "fixed" in s ? s.fixed : 0;
  return { gross, net, cogs, margin, marginPct: net > 0 ? margin / net : 0, storeFee: gross - net + fixed };
}
export function brPackPnL(pack: { renders: number; price: number }, storeKey: StoreKey) {
  const net = brNetRevenue(pack.price, storeKey);
  const cogs = pack.renders * BR_UNIT.veoClip;
  return { net, cogs, margin: net - cogs, marginPct: net > 0 ? (net - cogs) / net : 0, perRender: pack.price / pack.renders };
}
export const brUSD = (n: number) => (n < 0 ? "-$" : "$") + Math.abs(n).toFixed(2);
export const brPct = (n: number) => Math.round(n * 100) + "%";
