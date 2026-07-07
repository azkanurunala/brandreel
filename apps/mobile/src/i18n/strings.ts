// i18n BrandReel — porting dari prototype assets/br-personas.jsx (BR_T).

export type Lang = "en" | "id";

const BR_T_SOURCE = {
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

export type Strings = (typeof BR_T_SOURCE)["en"];
export const BR_T: Record<Lang, Strings> = BR_T_SOURCE;

export const BR_TIMES = {
  pagi: { id: "pagi", label_id: "Pagi · 08.00", label_en: "Morning · 08:00", greet_id: "Selamat pagi", greet_en: "Good morning" },
  siang: { id: "siang", label_id: "Siang · 13.00", label_en: "Midday · 13:00", greet_id: "Selamat siang", greet_en: "Good afternoon" },
  malam: { id: "malam", label_id: "Malam · 20.00", label_en: "Evening · 20:00", greet_id: "Selamat malam", greet_en: "Good evening" },
} as const;
export type TimeKey = keyof typeof BR_TIMES;

export function brGreet(lang: Lang, timeKey: TimeKey): string {
  const t = BR_TIMES[timeKey] ?? BR_TIMES.pagi;
  return lang === "en" ? t.greet_en : t.greet_id;
}
