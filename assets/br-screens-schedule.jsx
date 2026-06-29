// BrandReel — Schedule / auto-post engine. A 7-day content calendar derived
// from campaign data: week strip, live countdown to the next auto-post, and a
// per-day timeline that visualises the staggered publishing queue.

const { useState: sc_useState } = React;

// ── Schedule seed — [dayOffset, hour, min, campaignId, platform, hookId] ──
// dayOffset 0 = today. State (posted / queued / scheduled / retry) is derived
// from the live clock so the board feels real as time advances.
const BR_SCHEDULE = [
  // ── Today ──
  [0, 7, 30, "c-bamboo-tb",    "tiktok",    "h3"],
  [0, 9, 0,  "c-bamboo-tb",    "instagram", "h3"],
  [0, 11, 30,"c-phone-case",   "youtube",   "h4"],
  [0, 14, 0, "c-water-bottle", "instagram", "h2"],
  [0, 16, 30,"c-water-bottle", "tiktok",    "h2"],   // staggered 1/30m
  [0, 17, 0, "c-shampoo",      "tiktok",    "h1"],   // staggered 1/30m
  [0, 19, 30,"c-shampoo",      "instagram", "h1"],
  // ── +1 ──
  [1, 8, 0,  "c-phone-case",   "linkedin",  "h4"],
  [1, 10, 30,"c-water-bottle", "youtube",   "h2"],
  [1, 13, 0, "c-coffee-cup",   "tiktok",    "h5"],
  [1, 18, 30,"c-beeswax",      "instagram", "h2"],   // retry — IG aspect fix
  // ── +2 ──
  [2, 9, 30, "c-shampoo",      "youtube",   "h1"],
  [2, 12, 0, "c-coffee-cup",   "instagram", "h5"],
  [2, 17, 0, "c-bamboo-tb",    "linkedin",  "h3"],
  // ── +3 ──
  [3, 8, 30, "c-phone-case",   "tiktok",    "h4"],
  [3, 15, 0, "c-water-bottle", "linkedin",  "h2"],
  // ── +4 ──
  [4, 10, 0, "c-shampoo",      "linkedin",  "h1"],
  [4, 19, 0, "c-coffee-cup",   "youtube",   "h5"],
  // ── +5 ──
  [5, 11, 0, "c-bamboo-tb",    "tiktok",    "h3"],
  // ── +6 ──
  [6, 9, 0,  "c-phone-case",   "instagram", "h4"],
];

const BR_DOW = { en: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"], id: ["Min","Sen","Sel","Rab","Kam","Jum","Sab"] };
const BR_MON = { en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], id: ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"] };

// User-scheduled posts created via the Schedule sheet. Module-level so the
// Schedule screen reflects them as soon as the user lands there (reset on reload).
// Each row: { off, h, m, cid, pid, hk }. dayOffset is relative to "now".
let BR_USER_SCHEDULED = [];
function brAddScheduled(entries) { BR_USER_SCHEDULED = BR_USER_SCHEDULED.concat(entries); }
// "Peak" windows the auto-post engine recommends (highest engagement).
const BR_PEAK_HOURS = [9, 16, 19];

function brCampaignById(id) { return BR_CAMPAIGNS.find((c) => c.id === id); }

// absolute Date for a schedule row, anchored to `now`
function brSlotDate(now, dayOffset, h, m) {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
}

function brFmtCountdown(ms, en) {
  if (ms <= 0) return en ? "now" : "sekarang";
  const totalMin = Math.floor(ms / 60000);
  const dd = Math.floor(totalMin / 1440);
  const hh = Math.floor((totalMin % 1440) / 60);
  const mm = totalMin % 60;
  if (dd > 0) return `${dd}${en ? "d" : "h"} ${hh}${en ? "h" : "j"}`;
  if (hh > 0) return `${hh}${en ? "h" : "j"} ${mm}m`;
  return `${mm}m`;
}

// ──────────────────────────────────────────────────────────────
// SCHEDULE SCREEN
// ──────────────────────────────────────────────────────────────
function BrSchedule({ now, onBack, onNavigate }) {
  const { theme, lang, autopost, fireToast } = useBr();
  const en = lang === "en";
  const grad = `linear-gradient(120deg, ${theme.brand}, ${theme.accent})`;

  // build the full list of dated posts once per render (cheap)
  const allRows = [
    ...BR_SCHEDULE.map((r) => ({ r, user: false })),
    ...BR_USER_SCHEDULED.map((u) => ({ r: [u.off, u.h, u.m, u.cid, u.pid, u.hk], user: true })),
  ];
  const posts = allRows.map(({ r: [off, h, m, cid, pid, hk], user }) => {
    const c = brCampaignById(cid);
    const date = brSlotDate(now, off, h, m);
    const past = date.getTime() <= now.getTime();
    let state = past ? "posted" : "scheduled";
    if (cid === "c-beeswax" && pid === "instagram" && !user) state = "retry"; // continuity w/ existing data
    return { off, h, m, cid, pid, hk, c, date, ms: date.getTime() - now.getTime(), state, userAdded: user };
  });

  // next auto-post = earliest future, non-retry slot
  const upcoming = posts.filter((p) => p.ms > 0 && p.state !== "retry").sort((a, b) => a.ms - b.ms);
  const next = upcoming[0] || null;

  const [day, setDay] = sc_useState(0);
  const dayPosts = posts.filter((p) => p.off === day).sort((a, b) => (a.h * 60 + a.m) - (b.h * 60 + b.m));

  // per-day counts for the week strip
  const counts = Array.from({ length: 7 }, (_, d) => posts.filter((p) => p.off === d).length);
  const weekTotal = posts.length;
  const postedToday = posts.filter((p) => p.off === 0 && p.state === "posted").length;
  const channels = new Set(posts.map((p) => p.pid)).size;

  const stateMeta = (st) => ({
    posted:    { c: theme.pos,  label: en ? "Posted"    : "Tayang" },
    queued:    { c: theme.warn, label: en ? "Queued"    : "Antre"  },
    scheduled: { c: theme.ink3, label: en ? "Scheduled" : "Jadwal" },
    retry:     { c: theme.neg,  label: en ? "Retry"     : "Ulang"  },
  }[st] || { c: theme.ink3, label: st });

  function reserve() {
    fireToast({ tag: "PLAN", color: theme.brand, source: "BrandReel",
      title: en ? "Open slot reserved" : "Slot kosong dipesan",
      body: en ? "Pick a draft to fill this slot — auto-post will handle the rest." : "Pilih draf untuk slot ini — auto-post urus sisanya.",
      route: { name: "create" } });
  }

  const selDate = brSlotDate(now, day, 0, 0);
  const dowArr = en ? BR_DOW.en : BR_DOW.id;
  const monArr = en ? BR_MON.en : BR_MON.id;

  return (
    <BrAppShell theme={theme} density="soft">
      <BrAppHeader
        title={en ? "Schedule" : "Jadwal"}
        subtitle={en ? "AUTO-POST ENGINE" : "MESIN AUTO-POST"}
        onBack={onBack}
        right={
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 99,
            background: autopost ? theme.pos + "16" : theme.hair, border: `1px solid ${autopost ? theme.pos + "3A" : theme.hair}`,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 99, background: autopost ? theme.pos : theme.ink3, boxShadow: autopost ? `0 0 7px ${theme.pos}` : "none" }} />
            <span className="br-mono" style={{ fontSize: 8.5, letterSpacing: 0.8, fontWeight: 700, color: autopost ? theme.pos : theme.ink3, textTransform: "uppercase" }}>{autopost ? "ON" : "OFF"}</span>
          </span>
        }
      />

      <div style={{ flex: 1, overflow: "auto", padding: "12px 14px 24px" }}>
        {/* ── Engine hero — live countdown to next auto-post ── */}
        <GlassPanel theme={theme} padding={0} tone="solid" style={{ overflow: "hidden" }}>
          <div style={{ padding: 15, background: autopost ? `linear-gradient(125deg, ${theme.brand}14, ${theme.accent}10)` : "transparent" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="br-mono" style={{ fontSize: 8.5, letterSpacing: 1.4, color: theme.ink3, textTransform: "uppercase" }}>
                {autopost ? (en ? "Next auto-post in" : "Auto-post berikutnya") : (en ? "Engine paused" : "Mesin dijeda")}
              </div>
              <button onClick={() => onNavigate({ name: "insights" })} className="br-press" style={{ border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
                <span className="br-mono" style={{ fontSize: 9, letterSpacing: 0.8, color: theme.brand, fontWeight: 700, textTransform: "uppercase" }}>{en ? "Insights ›" : "Insight ›"}</span>
              </button>
            </div>

            {autopost && next ? (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginTop: 8 }}>
                <div className="br-display br-num" style={{ fontSize: 40, lineHeight: 0.92, letterSpacing: -1.6, color: theme.ink }}>
                  {brFmtCountdown(next.ms, en)}
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PlatformBadge pid={next.pid} size={26} solid />
                    <div style={{ minWidth: 0 }}>
                      <div className="br-sans" style={{ fontSize: 13, fontWeight: 700, color: theme.ink, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{next.c.product}</div>
                      <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.4, marginTop: 2, textTransform: "uppercase" }}>
                        {BR_PLATFORMS[next.pid].name} · {brFmtTime(next.date)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="br-sans" style={{ fontSize: 13, color: theme.ink2, marginTop: 10, lineHeight: 1.5 }}>
                {autopost
                  ? (en ? "Nothing left in the queue. Create a campaign to fill the week." : "Antrean kosong. Buat kampanye untuk isi minggu ini.")
                  : (en ? "Auto-post is off — posts stay as drafts until you publish manually." : "Auto-post mati — post jadi draf sampai kamu kirim manual.")}
              </div>
            )}
          </div>

          {/* mini stat ribbon */}
          <div style={{ display: "flex", borderTop: `1px solid ${theme.hair2}` }}>
            {[
              { n: weekTotal, l: en ? "this week" : "minggu ini" },
              { n: postedToday, l: en ? "posted today" : "tayang hari ini" },
              { n: channels, l: en ? "channels" : "channel" },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: "10px 12px", borderLeft: i ? `1px solid ${theme.hair2}` : "none", textAlign: "center" }}>
                <div className="br-display br-num" style={{ fontSize: 19, color: theme.ink, letterSpacing: -0.5, lineHeight: 1 }}>{s.n}</div>
                <div className="br-mono" style={{ fontSize: 7.5, color: theme.ink3, letterSpacing: 0.7, marginTop: 4, textTransform: "uppercase" }}>{s.l}</div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* ── Week strip ── */}
        <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
          {Array.from({ length: 7 }, (_, d) => {
            const dt = brSlotDate(now, d, 0, 0);
            const active = d === day;
            const isToday = d === 0;
            return (
              <button key={d} onClick={() => setDay(d)} className="br-press" style={{
                flex: 1, border: active ? "none" : `1px solid ${theme.hair}`, cursor: "pointer", fontFamily: "inherit",
                background: active ? grad : theme.glassHi, borderRadius: 13, padding: "9px 2px 7px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                boxShadow: active ? `0 8px 18px -10px ${theme.brand}` : "none",
              }}>
                <span className="br-mono" style={{ fontSize: 8.5, letterSpacing: 0.6, fontWeight: 700, textTransform: "uppercase", color: active ? "rgba(255,255,255,0.82)" : theme.ink3 }}>{dowArr[dt.getDay()]}</span>
                <span className="br-display br-num" style={{ fontSize: 17, letterSpacing: -0.5, lineHeight: 1, color: active ? "#fff" : theme.ink }}>{dt.getDate()}</span>
                <span style={{ height: 5, display: "flex", alignItems: "center", justifyContent: "center", gap: 2, marginTop: 1 }}>
                  {counts[d] > 0 ? (
                    Array.from({ length: Math.min(counts[d], 4) }, (_, k) => (
                      <span key={k} style={{ width: 3.5, height: 3.5, borderRadius: 99, background: active ? "rgba(255,255,255,0.9)" : (isToday ? theme.brand : theme.ink3) }} />
                    ))
                  ) : (
                    <span style={{ width: 3.5, height: 3.5, borderRadius: 99, background: active ? "rgba(255,255,255,0.4)" : theme.hair }} />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* selected-day label */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "18px 4px 10px" }}>
          <span className="br-display" style={{ fontSize: 16, color: theme.ink, letterSpacing: -0.3 }}>
            {day === 0 ? (en ? "Today" : "Hari ini") : day === 1 ? (en ? "Tomorrow" : "Besok") : `${dowArr[selDate.getDay()]}, ${selDate.getDate()} ${monArr[selDate.getMonth()]}`}
          </span>
          <span className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.8, textTransform: "uppercase" }}>
            {dayPosts.length} {en ? (dayPosts.length === 1 ? "post" : "posts") : "post"}
          </span>
        </div>

        {/* ── Day timeline ── */}
        {dayPosts.length === 0 ? (
          <GlassPanel theme={theme} padding={22} style={{ textAlign: "center" }}>
            <div className="br-sans" style={{ fontSize: 13, color: theme.ink2, lineHeight: 1.5 }}>{en ? "No posts scheduled." : "Belum ada jadwal."}</div>
            <button onClick={reserve} className="br-press" style={{ marginTop: 12, border: `1px solid ${theme.brand}40`, background: theme.brand + "12", color: theme.brand, cursor: "pointer", borderRadius: 11, padding: "8px 16px", fontFamily: "Plus Jakarta Sans", fontSize: 13, fontWeight: 700 }}>
              {en ? "+ Reserve a slot" : "+ Pesan slot"}
            </button>
          </GlassPanel>
        ) : (
          <div style={{ position: "relative" }}>
            {/* connecting rail */}
            <div style={{ position: "absolute", left: 43, top: 12, bottom: 12, width: 2, background: theme.hair, borderRadius: 2 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {dayPosts.map((p, i) => {
                const sm = stateMeta(p.state);
                const hook = BR_HOOKS[p.hk];
                const isNext = next && p.cid === next.cid && p.pid === next.pid && p.off === next.off && p.h === next.h && p.m === next.m;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "stretch", gap: 12, position: "relative" }}>
                    {/* time + node */}
                    <div style={{ width: 34, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", paddingTop: 13 }}>
                      <span className="br-mono br-num" style={{ fontSize: 11, fontWeight: 700, color: p.state === "posted" ? theme.ink3 : theme.ink2, lineHeight: 1 }}>{brFmtTime(p.date)}</span>
                    </div>
                    <div style={{ width: 18, flexShrink: 0, display: "flex", justifyContent: "center", paddingTop: 13, position: "relative", zIndex: 1 }}>
                      <span style={{
                        width: 11, height: 11, borderRadius: 99, background: theme.canvas,
                        border: `2.5px solid ${sm.c}`, boxShadow: isNext ? `0 0 0 4px ${theme.brand}22` : "none",
                      }} />
                    </div>
                    {/* card */}
                    <button onClick={() => onNavigate({ name: p.c.status === "publishing" ? "publishing" : "detail", id: p.cid })} className="br-press" style={{
                      flex: 1, minWidth: 0, textAlign: "left", cursor: "pointer", fontFamily: "inherit",
                      border: `1px solid ${isNext ? theme.brand + "55" : (p.userAdded ? theme.brand + "4A" : theme.hair)}`,
                      background: p.userAdded ? theme.brand + "0D" : theme.glassHi, borderRadius: 14, padding: "10px 11px",
                      display: "flex", alignItems: "center", gap: 11,
                    }}>
                      <PlatformBadge pid={p.pid} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                          <span className="br-sans" style={{ fontSize: 13.5, fontWeight: 700, color: theme.ink, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.c.product}</span>
                          {p.userAdded && p.state !== "posted" && (
                            <span className="br-mono" style={{ flexShrink: 0, fontSize: 7.5, fontWeight: 800, letterSpacing: 0.7, color: "#fff", background: theme.brand, borderRadius: 99, padding: "2px 6px", lineHeight: 1 }}>{en ? "NEW" : "BARU"}</span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                          <span style={{ width: 5, height: 5, borderRadius: 99, background: hook.color, flexShrink: 0 }} />
                          <span className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.5, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {en ? hook.key_en : hook.key_id} · {BR_PLATFORMS[p.pid].ratio}
                          </span>
                        </div>
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                        {p.state === "posted" && (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={sm.c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12l5 5L20 6"/></svg>
                        )}
                        {(p.state === "queued" || p.state === "scheduled" || isNext) && p.state !== "posted" && p.state !== "retry" && (
                          <span style={{ width: 6, height: 6, borderRadius: 99, background: isNext ? theme.warn : sm.c, boxShadow: isNext ? `0 0 7px ${theme.warn}` : "none" }} />
                        )}
                        {p.state === "retry" && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={sm.c} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"/></svg>
                        )}
                        <span className="br-mono" style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 0.6, color: sm.c, textTransform: "uppercase" }}>
                          {isNext ? brFmtCountdown(p.ms, en) : sm.label}
                        </span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* reserve-slot footer */}
            <button onClick={reserve} className="br-press" style={{
              width: "100%", marginTop: 12, marginLeft: 46, maxWidth: "calc(100% - 46px)", boxSizing: "border-box",
              border: `1.5px dashed ${theme.hair}`, background: "transparent", cursor: "pointer",
              borderRadius: 14, padding: "11px", color: theme.ink3, fontFamily: "Plus Jakarta Sans", fontSize: 12.5, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              {en ? "Reserve an open slot" : "Pesan slot kosong"}
            </button>
          </div>
        )}

        {/* legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
          {[
            { c: theme.pos,  l: en ? "Posted" : "Tayang" },
            { c: theme.warn, l: en ? "Queued" : "Antre" },
            { c: theme.ink3, l: en ? "Scheduled" : "Jadwal" },
            { c: theme.neg,  l: en ? "Retry" : "Ulang" },
          ].map((x, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 7, height: 7, borderRadius: 99, background: x.c }} />
              <span className="br-mono" style={{ fontSize: 8.5, color: theme.ink3, letterSpacing: 0.6, textTransform: "uppercase" }}>{x.l}</span>
            </span>
          ))}
        </div>
      </div>
    </BrAppShell>
  );
}

Object.assign(window, { BR_SCHEDULE, BrSchedule, brSlotDate, brFmtCountdown });

// ──────────────────────────────────────────────────────────────
// SCHEDULE SHEET — pick a day + time before queueing a campaign.
// Bottom sheet shown over the campaign detail. On confirm it writes the
// chosen slot(s) into BR_USER_SCHEDULED so they appear on the Schedule board.
// ──────────────────────────────────────────────────────────────
function BrScheduleSheet({ campaign, platforms, hook, now: nowProp, onClose, onScheduled }) {
  const { theme, lang, fireToast } = useBr();
  const en = lang === "en";
  const grad = `linear-gradient(120deg, ${theme.brand}, ${theme.accent})`;
  const now = nowProp || new Date();
  const dowArr = en ? BR_DOW.en : BR_DOW.id;
  const monArr = en ? BR_MON.en : BR_MON.id;

  const multi = platforms.length > 1;
  // default to the next upcoming peak window today, else tomorrow 09:00
  const defaultPeak = BR_PEAK_HOURS.find((h) => h * 60 > now.getHours() * 60 + now.getMinutes());
  const [day, setDay] = sc_useState(defaultPeak ? 0 : 1);
  const [hour, setHour] = sc_useState(defaultPeak || 9);
  const [min, setMin] = sc_useState(0);
  const [stagger, setStagger] = sc_useState(multi);

  const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 → 22:00
  const slotDate = brSlotDate(now, day, hour, min);
  const selectedPast = slotDate.getTime() <= now.getTime();

  const dayLabel = day === 0 ? (en ? "Today" : "Hari ini") : day === 1 ? (en ? "Tomorrow" : "Besok")
    : `${dowArr[slotDate.getDay()]}, ${slotDate.getDate()} ${monArr[slotDate.getMonth()]}`;
  const fmt2 = (n) => String(n).padStart(2, "0");
  const timeLabel = `${fmt2(hour)}:${fmt2(min)}`;

  function confirm() {
    if (selectedPast) return;
    const base = hour * 60 + min;
    const entries = platforms.map((pid, i) => {
      const total = base + (stagger ? i * 30 : 0);
      const tt = total % 1440;
      return { off: day + Math.floor(total / 1440), h: Math.floor(tt / 60), m: tt % 60, cid: campaign.id, pid, hk: hook };
    });
    brAddScheduled(entries);
    fireToast({
      tag: en ? "PLAN" : "PLAN", color: theme.brand, source: "BrandReel",
      title: en ? `Scheduled · ${platforms.length} post${platforms.length > 1 ? "s" : ""}` : `Dijadwalkan · ${platforms.length} post`,
      body: en
        ? `${campaign.product} → ${dayLabel}, ${timeLabel}${stagger && multi ? " · staggered 1/30m" : ""}.`
        : `${campaign.product} → ${dayLabel}, ${timeLabel}${stagger && multi ? " · jeda 1/30m" : ""}.`,
      route: { name: "schedule" },
    });
    onScheduled && onScheduled();
  }

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 80, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={() => onClose && onClose()} style={{ position: "absolute", inset: 0, background: "rgba(10,10,18,0.55)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }} />

      <div style={{ position: "relative", background: theme.page, borderTopLeftRadius: 24, borderTopRightRadius: 24, boxShadow: "0 -18px 50px -16px rgba(0,0,0,0.5)", maxHeight: "92%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* header */}
        <div style={{ position: "relative", padding: "18px 20px 14px", borderBottom: `1px solid ${theme.hair2}`, background: theme.glassHi, flexShrink: 0 }}>
          <span style={{ width: 36, height: 5, borderRadius: 99, background: theme.hair, position: "absolute", left: "50%", transform: "translateX(-50%)", top: 7 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: campaign.logoColor || theme.brand, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 8px 18px -10px ${campaign.logoColor || theme.brand}` }}>
              <span className="br-display" style={{ color: "#fff", fontSize: 17, fontWeight: 700 }}>{(campaign.product[0] || "B").toUpperCase()}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="br-display" style={{ fontSize: 19, color: theme.ink, letterSpacing: -0.4, lineHeight: 1.1 }}>{en ? "Schedule post" : "Jadwalkan post"}</div>
              <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.6, marginTop: 3, textTransform: "uppercase" }}>
                {campaign.product} · {platforms.length} {en ? (platforms.length === 1 ? "channel" : "channels") : "channel"}
              </div>
            </div>
            <button onClick={() => onClose && onClose()} aria-label="close" className="br-press" style={{ border: "none", background: theme.canvasAlt, cursor: "pointer", width: 30, height: 30, borderRadius: 99, color: theme.ink2, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>
        </div>

        {/* body */}
        <div style={{ padding: "16px 20px 8px", overflow: "auto" }}>
          {/* platform chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 18 }}>
            {platforms.map((pid) => (
              <span key={pid} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 11px 5px 5px", borderRadius: 99, background: theme.glassHi, border: `1px solid ${theme.hair}` }}>
                <PlatformBadge pid={pid} size={22} />
                <span className="br-sans" style={{ fontSize: 12, fontWeight: 600, color: theme.ink2 }}>{BR_PLATFORMS[pid].name}</span>
              </span>
            ))}
          </div>

          {/* DATE */}
          <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 9 }}>{en ? "Publish date" : "Tanggal tayang"}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: 7 }, (_, d) => {
              const dt = brSlotDate(now, d, 0, 0);
              const active = d === day;
              return (
                <button key={d} onClick={() => setDay(d)} className="br-press" style={{
                  flex: 1, border: active ? "none" : `1px solid ${theme.hair}`, cursor: "pointer", fontFamily: "inherit",
                  background: active ? grad : theme.glassHi, borderRadius: 13, padding: "9px 2px 7px",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  boxShadow: active ? `0 8px 18px -10px ${theme.brand}` : "none",
                }}>
                  <span className="br-mono" style={{ fontSize: 8.5, letterSpacing: 0.6, fontWeight: 700, textTransform: "uppercase", color: active ? "rgba(255,255,255,0.82)" : theme.ink3 }}>{dowArr[dt.getDay()]}</span>
                  <span className="br-display br-num" style={{ fontSize: 17, letterSpacing: -0.5, lineHeight: 1, color: active ? "#fff" : theme.ink }}>{dt.getDate()}</span>
                </button>
              );
            })}
          </div>

          {/* TIME */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "20px 0 9px" }}>
            <span className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 1.4, textTransform: "uppercase" }}>{en ? "Publish time" : "Waktu tayang"}</span>
            <span className="br-mono" style={{ fontSize: 9, color: theme.brand, letterSpacing: 0.6, fontWeight: 700, textTransform: "uppercase" }}>● {en ? "= peak window" : "= jam ramai"}</span>
          </div>
          {/* minute segmented */}
          <div style={{ display: "flex", gap: 6, marginBottom: 9 }}>
            {[0, 30].map((mm) => {
              const on = min === mm;
              return (
                <button key={mm} onClick={() => setMin(mm)} className="br-press" style={{
                  flex: 1, cursor: "pointer", fontFamily: "Geist Mono, monospace", fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                  border: `1px solid ${on ? theme.brand : theme.hair}`, background: on ? theme.brand + "14" : theme.glassHi,
                  color: on ? theme.brand : theme.ink2, borderRadius: 11, padding: "8px 0",
                }}>:{fmt2(mm)}</button>
              );
            })}
          </div>
          {/* hour grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {HOURS.map((h) => {
              const on = h === hour;
              const isPeak = BR_PEAK_HOURS.includes(h);
              const past = brSlotDate(now, day, h, min).getTime() <= now.getTime();
              return (
                <button key={h} onClick={() => !past && setHour(h)} disabled={past} className="br-press" style={{
                  position: "relative", cursor: past ? "not-allowed" : "pointer", fontFamily: "Geist Mono, monospace",
                  fontSize: 12.5, fontWeight: 700, letterSpacing: 0.3,
                  border: `1px solid ${on ? theme.brand : (isPeak && !past ? theme.brand + "33" : theme.hair)}`,
                  background: on ? grad : (isPeak && !past ? theme.brand + "0C" : theme.glassHi),
                  color: on ? "#fff" : past ? theme.ink3 : theme.ink, opacity: past ? 0.38 : 1,
                  borderRadius: 11, padding: "9px 0",
                  boxShadow: on ? `0 8px 18px -10px ${theme.brand}` : "none",
                }}>
                  {fmt2(h)}:{fmt2(min)}
                  {isPeak && !on && !past && <span style={{ position: "absolute", top: 5, right: 6, width: 4, height: 4, borderRadius: 99, background: theme.brand }} />}
                </button>
              );
            })}
          </div>

          {/* stagger */}
          {multi && (
            <button onClick={() => setStagger((s) => !s)} className="br-press" style={{
              width: "100%", marginTop: 16, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              border: `1px solid ${stagger ? theme.brand + "44" : theme.hair}`, background: stagger ? theme.brand + "0D" : theme.glassHi,
              borderRadius: 14, padding: "12px 13px", display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="br-sans" style={{ fontSize: 13.5, fontWeight: 700, color: theme.ink }}>{en ? "Stagger across channels" : "Jeda antar channel"}</div>
                <div className="br-sans" style={{ fontSize: 11.5, color: theme.ink2, marginTop: 2, lineHeight: 1.4 }}>{en ? "Post 1 channel every 30 min — clears platform rate-limits." : "Kirim 1 channel tiap 30 mnt — aman dari rate-limit."}</div>
              </div>
              <span style={{ width: 42, height: 25, borderRadius: 99, flexShrink: 0, background: stagger ? theme.brand : theme.hair, position: "relative", transition: "background 180ms" }}>
                <span style={{ position: "absolute", top: 2.5, left: stagger ? 20 : 2.5, width: 20, height: 20, borderRadius: 99, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)", transition: "left 180ms" }} />
              </span>
            </button>
          )}

          {/* summary */}
          <div style={{ marginTop: 16, padding: "13px 14px", borderRadius: 14, background: theme.canvasAlt, border: `1px solid ${theme.hair2}`, display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.brand} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <div style={{ flex: 1, minWidth: 0 }}>
              {selectedPast ? (
                <div className="br-sans" style={{ fontSize: 12.5, color: theme.neg, fontWeight: 600, lineHeight: 1.4 }}>{en ? "That time has already passed — pick a later slot." : "Waktu itu sudah lewat — pilih slot berikutnya."}</div>
              ) : (
                <>
                  <div className="br-sans" style={{ fontSize: 13.5, fontWeight: 700, color: theme.ink, lineHeight: 1.2 }}>{dayLabel} · {timeLabel}</div>
                  <div className="br-mono" style={{ fontSize: 9, color: theme.ink3, letterSpacing: 0.5, marginTop: 3, textTransform: "uppercase" }}>
                    {stagger && multi ? (en ? `${platforms.length} channels · staggered 1 / 30 min` : `${platforms.length} channel · jeda 1/30 mnt`) : (en ? "all channels at once" : "semua channel sekaligus")}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: "12px 20px 18px", flexShrink: 0, display: "flex", gap: 10, borderTop: `1px solid ${theme.hair2}` }}>
          <button onClick={() => onClose && onClose()} className="br-press" style={{ flex: "0 0 auto", cursor: "pointer", fontFamily: "Plus Jakarta Sans", fontSize: 14, fontWeight: 600, background: "transparent", color: theme.ink2, border: `1px solid ${theme.hair}`, borderRadius: 14, padding: "13px 20px" }}>{en ? "Cancel" : "Batal"}</button>
          <button onClick={confirm} disabled={selectedPast} className="br-press" style={{
            flex: 1, cursor: selectedPast ? "not-allowed" : "pointer", fontFamily: "Plus Jakarta Sans", fontSize: 15, fontWeight: 700,
            background: selectedPast ? theme.hair : grad, color: selectedPast ? theme.ink3 : "#fff", border: "none", borderRadius: 14, padding: "13px 18px",
            boxShadow: selectedPast ? "none" : `0 12px 26px -12px ${theme.brand}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {en ? `Schedule ${platforms.length} post${platforms.length > 1 ? "s" : ""}` : `Jadwalkan ${platforms.length} post`} →
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { BrScheduleSheet, BR_USER_SCHEDULED, brAddScheduled });
