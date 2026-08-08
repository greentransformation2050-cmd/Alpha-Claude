# The Red Earth — bauxite/resource-curse documentary

Status: active
Last updated: 2026-08-08

## What this is
A ~3:05 cinematic documentary explainer on the resource curse, told through
West African bauxite → aluminum. Deliverable: one 720p MP4, 16:9, single
narrator ("Sterling") plus music bed. Experimental side project — keep
effort proportionate.

## Current state
All raw assets generated; film NOT assembled. 20 clips (~160s) + 7 VO tracks
(3:05 total) live in the Higgsfield Library. Assembly must happen externally
(CapCut) — Higgsfield has no editor and the media CDN is egress-blocked
in-session. Full assembly package (EDL, export spec, music brief, CapCut
walk-through) is in `VIDEO-export-bauxite-720p.md`; fuller handoff in
`HANDOFF-the-red-earth.md`.

## Decisions
- 720p (36 cr/clip), not 1080p — fits credit balance. Hook clip is 1080p,
  normalize down in edit.
- Soda-can hook leads the film (pattern-interrupt), not the refinery shot.
- Footage gap covered by Tier A batch (6 clips, 216 cr) + mild slow-mo
  (~1.0–1.35×) instead of full native fill.
- Reuse voice "Sterling" (`dc382508-c8bd-443c-8cb2-46e57b8d2e6f`) for all VO.
- Assemble in CapCut per §5 of the export doc.

## Constraints & key facts
- Platform: Higgsfield Plus, user `3G0quiSz8ObYq8lh2AbKE4h7pyF`; video model
  Seedance 2.0 (720p = 36 cr, 1080p = 72 cr, 8s clips).
- House style string (reuse verbatim for any new clip): "Cinematic documentary
  style, photorealistic, 35mm film look, shallow depth of field, warm
  golden-hour lighting, slow deliberate camera moves, no text, no logos, no
  visible faces."
- Export: 1280×720, 24 fps, H.264 High ~8–10 Mbps; VO ~-16 LUFS, ambient
  ~-18 dB under VO, music ~-24 dB.
- Credit balance: handoff states both "~38 cr" (post-Tier-A, §2) and "~270"
  (ledger, §4, plus a +1000 grant on 2026-07-04) — **discrepancy; verify live
  balance before any spend.**
- Asset IDs: see `HANDOFF-the-red-earth.md` §5.

## Next actions
1. Source music bed externally (Suno/Udio/library) per §4 brief —
   instrumental, ~3:10, restrained dynamics.
2. User downloads assets and assembles in CapCut per §5 walk-through.
3. Optional: read virality scores in the Higgsfield widget dashboards
   (refinery `4856641a`, soda-can `da5cf74b`) to confirm hook choice.

## Open questions / blockers
- Music bed: no in-session generator available — external source required.
- Assembly: external only (CDN egress-blocked, no ffmpeg in-session).
- Title-card / closing text copy not yet specified.
- CapCut acceptability assumed, not confirmed with user.
