# Detail screen UX redesign

Date: 2026-07-11
Scope: `apps/mobile/src/app/detail/[id].tsx` and new components under `apps/mobile/src/components/br/`

## Problem

User feedback: create/render flow "tidak intuitif sama sekali". Concrete issues found reading the current code:

1. Render CTA ("Buat video" / "Gagal — ketuk ulang") lives inside a 108px-wide gradient thumbnail — smallest, least obvious tap target on the page despite being the most important action.
2. Each platform tab maps to a different render (keyed by aspect ratio) but nothing explains this — switching tabs silently swaps/loses the visible video with no context.
3. Preflight checklist ("1 masalah: Video belum di-render") is read-only — no way to jump to the fix from there.
4. "Posting sekarang" button is always tappable, even with preflight issues — user only learns why after a round-trip alert.
5. Hook selector and platform tab use identical chip styling despite controlling different things (script vs. destination+ratio).
6. Video preview is simply too small to read/matter to the user.

## Design

### Components (new, `apps/mobile/src/components/br/`)

- **`VideoHero.tsx`** — full-width 9:16 (or platform-appropriate ratio) hero replacing the small thumbnail. States: ready (tap → fullscreen modal, unchanged from today), queued/processing (spinner + label), failed (inline retry), idle (single **"Buat semua video"** button, see below). Props: `activeRender`, `ratiosNeeded`, `onBulkRender`, `generatingRender`.
- **`PlatformPicker.tsx`** — row of real platform logos (replacing "TT"/"IG" text chips). Each logo carries a small corner status badge sourced from that platform's ratio's render state: ✓ ready, ⋯ queued/processing, ! failed, blank = not started. Tap switches `plat` state same as today.
- **`HookPicker.tsx`** — extracted as-is from current inline hook-card row, with an explicit section title ("Sudut cerita") so it reads as a distinct control from `PlatformPicker`.
- **`PreflightPanel.tsx`** — same two-row checklist (render ready / platform connected), but rows are now `Pressable`. Render row scrolls to/triggers `VideoHero`. Connection row navigates to `/profile`.

`detail/[id].tsx` keeps all state and data-fetching (renders, connections, caption cache, etc.) and composes these four components — no new backend logic.

### "Buat semua video" (bulk render)

No new backend endpoint. Renders are already keyed by ratio, not by platform (`renders.find(r => r.ratio === activeRatio)`), so platforms sharing a ratio (e.g. TikTok+Instagram both 9:16) already share one render row. The button:

1. Computes the distinct ratios required by `camPlatforms` that don't already have a ready/queued/processing render.
2. Fires `POST /campaigns/:id/renders` once per missing ratio, using the currently-selected hook's id for all of them (one narrative, multiple formats).
3. Calls the existing `loadRenders()` poll loop — no new polling logic.
4. Per-ratio failures surface as a `!` badge on whichever platform logo(s) share that ratio, not a blocking `Alert`.

### Post button gating

`allClear` (existing computed var) now also disables `PrimaryButton` when false. Label swaps from "Posting sekarang →" to the first failing preflight row's short reason (e.g. "Render video dulu" / "Connect TikTok dulu"). Re-enables automatically once `allClear` flips true (existing render-polling effect already triggers a re-render).

## Out of scope

- No backend/API changes.
- No changes to `create.tsx` beyond what was already fixed (retry/fallback, prior commit).
- No changes to `ScheduleSheet.tsx` or `publishing/[id].tsx`.

## Testing

- `tsc --noEmit` clean on `apps/mobile` after each component lands.
- Manual verification via Playwright against a real logged-in session (mint test token per existing `playwright-qa@brandreel.test` pattern) — drive: switch platform tabs, tap "Buat semua video", confirm per-logo badges update, confirm Post button disables/enables correctly.
