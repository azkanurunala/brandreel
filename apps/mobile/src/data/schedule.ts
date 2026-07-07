// Data jadwal auto-post — porting BR_SCHEDULE dkk dari prototype
// assets/br-screens-schedule.jsx. Fase 2: seed statis + slot buatan user
// (module-level); nanti diganti jadwal asli dari backend.

import type { HookId, PlatformId } from "../theme/tokens";
import { BR_CAMPAIGNS, type Campaign } from "./campaigns";

// [dayOffset, jam, menit, campaignId, platform, hookId] — dayOffset 0 = hari ini.
export type ScheduleRow = [number, number, number, string, PlatformId, HookId];

export const BR_SCHEDULE: ScheduleRow[] = [
  // Hari ini
  [0, 7, 30, "c-bamboo-tb", "tiktok", "h3"],
  [0, 9, 0, "c-bamboo-tb", "instagram", "h3"],
  [0, 11, 30, "c-phone-case", "youtube", "h4"],
  [0, 14, 0, "c-water-bottle", "instagram", "h2"],
  [0, 16, 30, "c-water-bottle", "tiktok", "h2"],
  [0, 17, 0, "c-shampoo", "tiktok", "h1"],
  [0, 19, 30, "c-shampoo", "instagram", "h1"],
  // +1
  [1, 8, 0, "c-phone-case", "linkedin", "h4"],
  [1, 10, 30, "c-water-bottle", "youtube", "h2"],
  [1, 13, 0, "c-coffee-cup", "tiktok", "h5"],
  [1, 18, 30, "c-beeswax", "instagram", "h2"],
  // +2
  [2, 9, 30, "c-shampoo", "youtube", "h1"],
  [2, 12, 0, "c-coffee-cup", "instagram", "h5"],
  [2, 17, 0, "c-bamboo-tb", "linkedin", "h3"],
  // +3
  [3, 8, 30, "c-phone-case", "tiktok", "h4"],
  [3, 15, 0, "c-water-bottle", "linkedin", "h2"],
  // +4
  [4, 10, 0, "c-shampoo", "linkedin", "h1"],
  [4, 19, 0, "c-coffee-cup", "youtube", "h5"],
  // +5
  [5, 11, 0, "c-bamboo-tb", "tiktok", "h3"],
  // +6
  [6, 9, 0, "c-phone-case", "instagram", "h4"],
];

export const BR_DOW = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  id: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"],
};
export const BR_MON = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
};

export interface UserSlot {
  off: number;
  h: number;
  m: number;
  cid: string;
  pid: PlatformId;
  hk: HookId;
}

// Slot buatan user via sheet Jadwalkan (module-level; reset saat reload).
let BR_USER_SCHEDULED: UserSlot[] = [];
export function brAddScheduled(entries: UserSlot[]) {
  BR_USER_SCHEDULED = BR_USER_SCHEDULED.concat(entries);
}
export function brUserScheduled(): UserSlot[] {
  return BR_USER_SCHEDULED;
}

// Jam "ramai" yang direkomendasikan mesin auto-post.
export const BR_PEAK_HOURS = [9, 16, 19];

export function brCampaignById(id: string): Campaign | undefined {
  return BR_CAMPAIGNS.find((c) => c.id === id);
}

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
