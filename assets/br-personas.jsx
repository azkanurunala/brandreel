// BrandReel — personas (creator / brand / agency), RBAC, account scenarios, i18n.

const BR_PERSONAS = {
  creator: {
    id: "creator",
    name: "Maya Putri",
    handle: "@mayareviews",
    role_id: "Kreator Solo",
    role_en: "Solo Creator",
    bio_id: "Review gadget · humor satir · 50rb pengikut",
    bio_en: "Tech reviews · sarcastic humor · 50K followers",
    initial: "MP",
    color: "#F23E5C",
    plan: "creator",
    plan_label: "Creator",
    price: "$39/mo",
    posts_used: 18, posts_quota: 30,
    veo_used: 9, veo_quota: 12,
    voice_id: "Santai, lucu, sedikit satir",
    voice_en: "Casual, funny, lightly sarcastic",
    platforms: ["tiktok", "instagram"],
    brands: 1,
    can: { create: true, analytics: true, brandkit: true, voiceLearn: true, team: false, multiBrand: false, billing: true },
  },
  brand: {
    id: "brand",
    name: "Inez Saraswati",
    handle: "@ecogoods.id",
    role_id: "Pemilik Brand DTC",
    role_en: "DTC Brand Owner",
    bio_id: "Eco Goods · produk berkelanjutan",
    bio_en: "Eco Goods · sustainable products",
    initial: "IS",
    color: "#1FA971",
    plan: "pro",
    plan_label: "Pro",
    price: "$99/mo",
    posts_used: 64, posts_quota: 100,
    veo_used: 31, veo_quota: 40,
    voice_id: "Kasual, ramah milenial, sadar lingkungan",
    voice_en: "Casual, millennial-friendly, eco-conscious",
    platforms: ["tiktok", "instagram", "youtube", "linkedin", "twitter"],
    brands: 1,
    can: { create: true, analytics: true, brandkit: true, voiceLearn: true, team: false, multiBrand: false, billing: true },
  },
  agency_admin: {
    id: "agency_admin",
    name: "Devi Anggara",
    handle: "@studiokarya",
    role_id: "Manajer Agensi",
    role_en: "Agency Manager",
    bio_id: "Studio Karya · kelola 20 brand DTC",
    bio_en: "Studio Karya · managing 20 DTC brands",
    initial: "DA",
    color: "#6D4AFF",
    plan: "agency",
    plan_label: "Agency",
    price: "$299/mo",
    posts_used: 482, posts_quota: Infinity,
    veo_used: 118, veo_quota: 150,
    voice_id: "Per-brand · diatur tim",
    voice_en: "Per-brand · set by team",
    platforms: ["tiktok", "instagram", "youtube", "linkedin", "twitter"],
    brands: 20,
    can: { create: true, analytics: true, brandkit: true, voiceLearn: true, team: true, multiBrand: true, billing: true },
  },
  agency_member: {
    id: "agency_member",
    name: "Rangga Wijaya",
    handle: "@studiokarya",
    role_id: "Anggota Tim Agensi",
    role_en: "Agency Team Member",
    bio_id: "Studio Karya · 10 brand ditugaskan",
    bio_en: "Studio Karya · 10 brands assigned",
    initial: "RW",
    color: "#E0A11B",
    plan: "agency",
    plan_label: "Agency · Seat",
    price: "—",
    posts_used: 210, posts_quota: Infinity,
    veo_used: 64, veo_quota: 150,
    voice_id: "Per-brand · diatur manajer",
    voice_en: "Per-brand · set by manager",
    platforms: ["tiktok", "instagram", "youtube", "linkedin", "twitter"],
    brands: 10,
    can: { create: true, analytics: true, brandkit: false, voiceLearn: false, team: false, multiBrand: true, billing: false },
  },
};
const BR_PERSONA_ORDER = ["creator", "brand", "agency_admin", "agency_member"];

// ──────────────────────────────────────────────────────────────
// Account momentum scenarios — scale KPI baselines
// ──────────────────────────────────────────────────────────────
const BR_SCENARIOS = {
  steady:   { id: "steady",   label_id: "Stabil",  label_en: "Steady",   accent: "#2D7FF0", impressions: "48.2K", eng: "2.1%", reach: "+6%",  live: 3,  summary_id: "Posting rutin · performa stabil.",            summary_en: "Consistent posting · stable performance." },
  trending: { id: "trending", label_id: "Naik",    label_en: "Trending", accent: "#E0A11B", impressions: "182K",  eng: "3.4%", reach: "+38%", live: 7,  summary_id: "Hook unboxing sedang naik daun.",            summary_en: "Unboxing hooks are gaining traction." },
  viral:    { id: "viral",    label_id: "Viral",   label_en: "Viral",    accent: "#F23E5C", impressions: "1.4M",  eng: "5.8%", reach: "+212%",live: 11, summary_id: "Hook 3 viral di TikTok · 1,2 jt tayangan.",  summary_en: "Hook 3 went viral on TikTok · 1.2M views." },
};
const BR_SCENARIO_ORDER = ["steady", "trending", "viral"];

const BR_TIMES = {
  pagi:  { id: "pagi",  label_id: "Pagi · 08.00",  label_en: "Morning · 08:00", greet_id: "Selamat pagi",  greet_en: "Good morning" },
  siang: { id: "siang", label_id: "Siang · 13.00", label_en: "Midday · 13:00",  greet_id: "Selamat siang", greet_en: "Good afternoon" },
  malam: { id: "malam", label_id: "Malam · 20.00", label_en: "Evening · 20:00", greet_id: "Selamat malam", greet_en: "Good evening" },
};
const BR_TIME_ORDER = ["pagi", "siang", "malam"];

// ──────────────────────────────────────────────────────────────
// i18n — chrome + recurring strings
// ──────────────────────────────────────────────────────────────
const BR_T = {
  en: {
    tagline: "5-minute input → multi-platform UGC",
    nav: { home: "Home", insights: "Insights", create: "Create", inbox: "Inbox", profile: "Profile" },
    home: { campaigns: "Campaigns", newCampaign: "New campaign", recent: "Recent campaigns", thisMonth: "This month", impressions: "Impressions", engagement: "Engagement", reach: "Reach", live: "Live now" },
    status: { draft: "Draft", generating: "Generating", ready: "Ready to post", publishing: "Publishing", live: "Live", failed: "Needs attention" },
    create: { title: "New campaign", sub: "Name + logo is all we need", product: "Product name", productPh: "e.g. Bamboo toothbrush", desc: "Short description (optional)", descPh: "What makes it special?", logo: "Brand logo", upload: "Drop logo or tap to upload", voice: "Brand voice", platforms: "Distribute to", generate: "Generate 5 UGC variations", est: "≈ 5 min · 5 hooks × 5 platforms" },
    gen: { title: "Generating your UGC", scripting: "Writing 5 hook scripts", rendering: "Rendering videos", validating: "Validating formats", captioning: "Adapting captions", done: "All variations ready", review: "Review variations" },
    detail: { hooks: "Hook angles", preflight: "Pre-flight checks", postNow: "Post now", schedule: "Schedule", variations: "platform variations" },
    pub: { title: "Publishing", queued: "Queued", posted: "Posted", retry: "Retrying", failed: "Failed", staggered: "staggered to avoid rate limit", retryNote: "Auto-retry · exponential backoff", monitor: "Monitoring first 2 hours" },
    insights: { title: "Insights", top: "Top performer", byPlatform: "By platform", byHook: "By hook angle", reco: "Recommendation", views: "views", eng: "eng" },
    inbox: { title: "Inbox", copilot: "BrandReel Copilot", alerts: "Alerts", typePh: "Ask the Copilot…" },
    profile: { title: "Profile", plan: "Plan & usage", accounts: "Connected accounts", brandkit: "Brand kit", team: "Team", switch: "Switch persona", signout: "Sign out", active: "Active", connected: "Connected", expiring: "Token expiring", expired: "Reconnect", upgrade: "Manage plan" },
    onboard: { skip: "Skip", next: "Next", back: "Back", getStarted: "Get started", connect: "Connect", continue: "Continue", finish: "Enter BrandReel" },
    login: { title: "Welcome\nback", sub: "Sign in to your studio.", email: "Email", emailPh: "you@studio.com", pass: "Password", otpSent: "Code sent · check SMS", otpSub: "We sent a 6-digit code to your number.", demoOtp: "Use demo code", verifying: "Verifying…", continue: "Continue · request OTP" },
  },
  id: {
    tagline: "Input 5 menit → UGC multi-platform",
    nav: { home: "Beranda", insights: "Insight", create: "Buat", inbox: "Kotak", profile: "Profil" },
    home: { campaigns: "Kampanye", newCampaign: "Kampanye baru", recent: "Kampanye terbaru", thisMonth: "Bulan ini", impressions: "Tayangan", engagement: "Engagement", reach: "Jangkauan", live: "Tayang" },
    status: { draft: "Draf", generating: "Membuat", ready: "Siap posting", publishing: "Mengirim", live: "Tayang", failed: "Perlu cek" },
    create: { title: "Kampanye baru", sub: "Cukup nama + logo", product: "Nama produk", productPh: "mis. Sikat gigi bambu", desc: "Deskripsi singkat (opsional)", descPh: "Apa keunggulannya?", logo: "Logo brand", upload: "Letakkan logo atau ketuk untuk unggah", voice: "Brand voice", platforms: "Distribusi ke", generate: "Buat 5 variasi UGC", est: "≈ 5 mnt · 5 hook × 5 platform" },
    gen: { title: "Membuat UGC kamu", scripting: "Menulis 5 skrip hook", rendering: "Render video", validating: "Validasi format", captioning: "Adaptasi caption", done: "Semua variasi siap", review: "Tinjau variasi" },
    detail: { hooks: "Sudut hook", preflight: "Pemeriksaan pra-kirim", postNow: "Posting sekarang", schedule: "Jadwalkan", variations: "variasi platform" },
    pub: { title: "Mengirim", queued: "Antre", posted: "Terkirim", retry: "Coba ulang", failed: "Gagal", staggered: "dijeda agar tak kena rate limit", retryNote: "Auto-retry · exponential backoff", monitor: "Pantau 2 jam pertama" },
    insights: { title: "Insight", top: "Performa terbaik", byPlatform: "Per platform", byHook: "Per sudut hook", reco: "Rekomendasi", views: "tayangan", eng: "eng" },
    inbox: { title: "Kotak Masuk", copilot: "BrandReel Copilot", alerts: "Notifikasi", typePh: "Tanya Copilot…" },
    profile: { title: "Profil", plan: "Paket & pemakaian", accounts: "Akun terhubung", brandkit: "Brand kit", team: "Tim", switch: "Ganti persona", signout: "Keluar", active: "Aktif", connected: "Terhubung", expiring: "Token kedaluwarsa", expired: "Hubungkan ulang", upgrade: "Kelola paket" },
    onboard: { skip: "Lewati", next: "Lanjut", back: "Kembali", getStarted: "Mulai", connect: "Hubungkan", continue: "Lanjut", finish: "Masuk BrandReel" },
    login: { title: "Selamat\ndatang", sub: "Masuk ke studio kamu.", email: "Email", emailPh: "kamu@studio.com", pass: "Kata sandi", otpSent: "Kode terkirim · cek SMS", otpSub: "Kode 6 digit dikirim ke nomor kamu.", demoOtp: "Pakai kode demo", verifying: "Memverifikasi…", continue: "Lanjut · minta OTP" },
  },
};

function brCanAccess(persona, cap) { return !!(persona && persona.can && persona.can[cap]); }
function brGreet(persona, lang, timeKey) {
  const t = BR_TIMES[timeKey] || BR_TIMES.pagi;
  return lang === "en" ? t.greet_en : t.greet_id;
}

Object.assign(window, {
  BR_PERSONAS, BR_PERSONA_ORDER, BR_SCENARIOS, BR_SCENARIO_ORDER,
  BR_TIMES, BR_TIME_ORDER, BR_T, brCanAccess, brGreet,
});
