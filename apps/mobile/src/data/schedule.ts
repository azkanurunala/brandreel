// Helper jadwal auto-post — porting fungsi format dari prototype
// assets/br-screens-schedule.jsx. Data kampanye/post sekarang datang dari
// backend nyata (lib/campaignView.ts + GET /campaigns) — bukan seed statis
// lagi (lihat app/schedule.tsx).

export const BR_DOW = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  id: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
};
export const BR_MON = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
};

// Jam "ramai" yang direkomendasikan mesin auto-post.
export const BR_PEAK_HOURS = [9, 16, 19];

// Tanggal absolut untuk satu baris jadwal, berpatokan pada `now`.
export function brSlotDate(now: Date, dayOffset: number, h: number, m: number): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
}

export function brFmtCountdown(ms: number, en: boolean): string {
  if (ms <= 0) return en ? "now" : "sekarang";
  const totalMin = Math.floor(ms / 60000);
  const dd = Math.floor(totalMin / 1440);
  const hh = Math.floor((totalMin % 1440) / 60);
  const mm = totalMin % 60;
  if (dd > 0) return `${dd}${en ? "d" : "h"} ${hh}${en ? "h" : "j"}`;
  if (hh > 0) return `${hh}${en ? "h" : "j"} ${mm}m`;
  return `${mm}m`;
}

export function brFmtTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
