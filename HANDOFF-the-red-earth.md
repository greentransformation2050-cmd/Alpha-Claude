# Handoff Summary — "The Red Earth" Documentary Production

## 1. Project Overview

- **Project title:** "The Red Earth" (working title)
- **Purpose:** A ~3-minute cinematic documentary explainer on the **resource curse**, told
  through West African bauxite and the aluminum it becomes. Thesis: the ore is exported raw
  and cheap; the value is captured abroad, so the source country stays poor.
- **Narrative arc:** Hook → name the trap (resource curse / paradox of plenty) → mechanism
  (raw export) → refining (where value is made) → payoff (everyday aluminum) → human cost →
  closing question.
- **Current stage:** **All raw assets generated. Film NOT assembled.** Assembly (mux of clips
  + voiceover + music) is pending and must be done externally.
- **Intended deliverable:** One exported 720p MP4, ~3:05, 16:9, with continuous single-narrator
  voiceover and a music bed.

## 2. Current Status

**Completed:**
- 14 video clips generated (Seedance 2.0, 8s each, 720p except the 1080p hook).
- Full **3:05 narration** generated as 7 voiceover segments (one consistent voice, "Sterling").
- Two virality analyses run (dashboards live in Higgsfield widget).
- Edit Decision List, 720p export settings, music-bed brief, and CapCut assembly walk-through
  written, committed, and pushed (see `VIDEO-export-bauxite-720p.md`).

**In progress / unfinished:**
- **Footage/VO gap — RESOLVED.** Tier A batch generated (6 clips, 216 cr). Now **20 clips
  ≈ 160s** vs 185s VO → residual slow-mo only ~1.0–1.35× (near-native). Balance ~38 cr.
- **Assembly of the film** — not started (external step; cannot run in-session).
- **Music bed** — not generated; brief exists, source not chosen.

**Milestones hit:** asset generation complete; "no voice" problem solved at source; full
assembly package documented in-repo.

## 3. Major Decisions

| Decision | Rationale | Implications |
|---|---|---|
| **720p, not 1080p** | 720p = 36 cr/clip vs 1080p = 72; only 720p fits the ~502 starting balance while finishing the piece and keeping retry margin | Hook clip (`9fca84ae`) is 1080p; normalize down to 720p in edit |
| **Controlled 6-shot batch** (not full 13) | Preserve retry margin; reassess before draining balance | ~286 cr buffer kept after batch |
| **Reuse "Sterling" voice** for new VO | Continuity with existing 42s intro | All 7 segments share voice ID `dc382508-…` |
| **Cover footage gap by slowing/holding clips** (default) | Avoids ~300 cr of new footage that exceeds balance; Seedance's slow moves hold well | Clips run at ~0.6–0.75× in edit |
| **Assemble in CapCut (external NLE), not Higgsfield** | Verified Higgsfield has no timeline/assembly tool — it only generates | User must download assets + assemble manually |
| **Lead with soda-can hook, not refinery clip** | Hook must pattern-interrupt in first 2s; refinery is a mid-film process shot | Soda-can = 0:00 frame + test-post candidate |

## 4. Key Technical Information

- **Platform:** Higgsfield (Plus plan, user `3G0quiSz8ObYq8lh2AbKE4h7pyF`).
- **Video model:** Seedance 2.0. Cost: **720p = 36 cr/clip, 1080p = 72 cr/clip**, 8s clips,
  16:9, `generate_audio: true` (produces **ambient/foley only, never narration**).
- **Voice model:** Seed Audio 1.0. Voice "Sterling" (preset, male),
  voice_id `dc382508-c8bd-443c-8cb2-46e57b8d2e6f`. ~2.3 words/sec documentary pace.
- **House visual style (reuse verbatim for any new clip):** *"Cinematic documentary style,
  photorealistic, 35mm film look, shallow depth of field, warm golden-hour lighting, slow
  deliberate camera moves, no text, no logos, no visible faces."*
- **720p export spec:** 1280×720, 16:9, 24 fps, H.264 High, ~8–10 Mbps; VO ~ -16 LUFS;
  clip ambient ducked to ~ -18 dB under VO; music bed ~ -24 dB.
- **Credit ledger:** started ~502 → −216 (6 clips) → −~13 (VO) → **~270 remaining.**
  (A +1000 subscription grant landed 2026-07-04 00:40.)
- **Assets are text-free by design** — titles/lower-thirds added in the editor.

## 5. Documents and Resources

- **`VIDEO-export-bauxite-720p.md`** (branch `claude/video-export-720p-settings-t7bl6n`,
  latest commit `df7a22c`) — master assembly package: §1 assets, §2 EDL, §3 export settings,
  §4 music brief, §5 CapCut walk-through, §6 open items.
- **`CODEX-kaloga-mentoring.md`** (same repo) — unrelated mentoring codex; not part of this work.
- **14 video clips** — Higgsfield Library
  (CDN prefix `https://d8j0ntlcm91z4.cloudfront.net/user_3G0quiSz8ObYq8lh2AbKE4h7pyF/`).
- **7 VO tracks** — Higgsfield Library.
- **Virality dashboards** — Higgsfield widget: refinery `4856641a`, soda-can hook `da5cf74b`.

**Asset IDs (narrative order):**
- Clips: `9fca84ae` hook(1080p) · `72ab3fb3` map · `6b61fe08` cross-section · `176951a8` aerial
  · `aa1b8b0d` excavator · `d7552e2b` workers · `87cd7e96` port · `7ead2eec` refinery
  · `1f00e239` transformation · `4009d133` red-mud · `da1e785f` montage · `ac8a7898` aircraft
  · `7331705b` village · `21b97590` ingot.
  **Ignore (superseded):** `98f85f3b`, `80b56ece`, `7e1796de`, `ee7a3c42`.
- VO (total 3:05): `e65bdee6` (41.5s) · `91e61b7e` · `87269eee` · `f6db344c` · `3f80bfa4`
  · `88091980` · `e1189282`.

## 6. Open Issues

- **[Decision needed — IMMEDIATE] Footage < voice:** ~2:00 of footage vs 3:05 of VO
  (confirmed). Four options presented, awaiting the user's pick:
  1. **Slow-mo, spend nothing** (0 cr, EDL default; some shots may feel sluggish).
  2. **Partial fill** — ~6 more 720p clips (~216 cr, no top-up, leaves ~55 cr; halves the
     slow-mo). **← recommended.** Candidate shots: miners' hands on ore, conveyor detail,
     smelter pour close-up, second aerial, cargo ship at sea, child in village at dusk.
  3. **Full native** — top up, then ~9 clips (~324 cr; zero slow-mo; needs top-up over ~270).
  4. **Hold** — leave at slow-mo default, revisit later.
- **[Blocker → external] Music bed:** none generated. Higgsfield Seed Audio does speech only;
  `sonilo_music` is walled to the game pipeline. **Must come from an external source**
  (Suno/Udio-style, licensed library, or composer).
- **[Blocker → external] Assembly:** cannot run in the Claude session — media CDN is
  egress-policy-blocked (hard 403, non-retryable) and no ffmpeg. User must download from
  Higgsfield Library and assemble in an NLE.
- **[Unverified assumption] Virality scores:** dashboards exist but scores render only in the
  Higgsfield widget, not retrievable as text. Editorial read (hook > refinery) is an assumption
  pending the on-screen numbers.
- **[Unknown] Titles/branding copy** — exact title-card text, source stat wording, and closing
  on-screen text not yet specified.

## 7. Next Actions (prioritized)

1. **Assemble in CapCut (PRIMARY — where voice appears)** — *Objective:* one finished 720p MP4
   with narration. *Approach:* download all 20 clips + 7 VO tracks from Higgsfield Library;
   follow `VIDEO-export-bauxite-720p.md` §5 (720p/24fps canvas → clips in EDL order → 7 VO
   tracks on the timeline → duck ambient under voice → titles → export). *Output:* the film,
   ~3:05, voiced. *Dependency:* runs on the user's machine (cannot mux in-session). ~30–40 min.
2. **Source a music bed** (parallel, optional for v1) — *Approach:* §4 brief → Suno/Udio or a
   licensed library; instrumental, ~3:10, restrained. *Dependency:* external; film works without.
3. **(Optional) Top up credits** — only if further Higgsfield generation is wanted (music
   preview, re-rolls). Balance ~38 cr. NOT needed to finish the current cut.
4. **(Optional) Confirm virality numbers** — read the two widget dashboards; if they contradict
   the hook > refinery read, re-plan the lead frame.

**Note:** footage gap is RESOLVED (Tier A done, 20 clips). A ~36 cr "voiced preview" was offered
and declined-by-interrupt — skip it; real voice appears for free at step 1.

## 8. Important Context to Preserve

- **Honesty over polish:** the user has been given corrected information twice (Higgsfield has
  no editor; "~930 all-in" is total-project not per-charge). Maintain candor — flag blockers.
- **Credit-frugality is a live constraint** — the user watches the balance; do not spend without
  a clear nod, and preflight costs with `get_cost`.
- **Communication style:** terse approvals ("ok"/"yes"); expects concise, decision-first
  responses with concrete IDs and links.
- **Institutional context:** user is GT2050 president / GCF liaison (Guinea); this video is an
  "experimental" side project (per `CODEX-kaloga-mentoring.md`) — keep effort proportionate.
- **Git discipline:** all work on branch `claude/video-export-720p-settings-t7bl6n`; commit +
  push deliverables; do not open a PR unless asked; no model identifiers in commits.
- **Style lock:** all clips text-free, photoreal, no faces, golden-hour — any new asset must
  match the house-style string and voice_id.

## 9. Risks and Watch Points

- **Consistency risk:** new clips must use the exact house-style string; new VO must use
  voice_id `dc382508-…`.
- **Technical risk:** slow-mo to 0.6× can look sluggish; if motion suffers, more footage is the
  fallback (cost/balance implication).
- **Resource risk:** ~270 cr balance is below what 1:1 footage needs; assume a top-up is
  required for any material new generation.
- **Continuity risk:** the film only "speaks" after assembly — until muxed, any single clip
  still yields "no voice." Generated VO ≠ assembled film.
- **Data risk:** CDN links provided but unverified in-session (blocked); user should confirm they
  open. Virality scores unverified (widget-only).
- **Assumption to verify:** that CapCut/an NLE is acceptable to the user (not confirmed).

## 10. Suggested Prompt to Resume

> Continue from this project state for "The Red Earth" bauxite→aluminum documentary. All 14
> clips and 7 "Sterling" VO tracks are generated and listed in `VIDEO-export-bauxite-720p.md`
> (branch `claude/video-export-720p-settings-t7bl6n`, commit `df7a22c`). Maintain all prior
> decisions: 720p export, slow-mo gap-fill default, soda-can hook leads, assemble externally in
> CapCut. Do not spend Higgsfield credits (~270 balance) without confirming cost first, and
> preflight with `get_cost`. Next priorities in order: (1) source the external music bed per §4,
> (2) confirm footage strategy (slow-mo vs. top-up + ~8–9 new clips in the locked house style),
> (3) assemble per §5. Hard constraints: Higgsfield has no assembly editor, and the media CDN is
> egress-blocked in-session so the user must download and mux externally. Flag blockers honestly;
> keep responses concise and decision-first.
