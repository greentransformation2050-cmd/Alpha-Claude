# Bauxite → Aluminum Documentary — 720p Export Plan & Edit Decision List

**Project:** "The Red Earth" — a ~3-minute cinematic explainer on the resource curse,
told through West African bauxite and the aluminum it becomes.
**Target:** 3:05 runtime, 720p, 16:9, single-narrator voiceover ("Sterling").
**Status:** All assets generated in Higgsfield workspace. Assembly/export pending
(must be done in Higgsfield's editor or a local NLE — the media CDN is blocked by
egress policy inside the Claude session, so the mux cannot run here).

---

## 1. Assets (all generated, Seedance 2.0 clips @ 720p / Seed Audio VO, voice "Sterling")

### Video clips (8s each, 16:9, 720p unless noted)
| # | Job ID | Shot |
|---|--------|------|
| C1 | `9fca84ae` | Soda-can → red-soil match-cut (**1080p** hero) |
| C2 | `72ab3fb3` | World map, West Africa glowing red (push-in) |
| C3 | `6b61fe08` | Geological cross-section → bauxite strata |
| C4 | `176951a8` | Aerial over terraced open-pit mine |
| C5 | `aa1b8b0d` | Excavator biting red laterite |
| C6 | `d7552e2b` | Worker-scale silhouettes vs haul-truck tire |
| C7 | `87cd7e96` | Bulk carriers loading ore at port |
| C8 | `7ead2eec` | Alumina refinery interior (digesters, pipes) |
| C9 | `1f00e239` | 3-stage transformation: rock → alumina → molten metal |
| C10 | `4009d133` | Red-mud tailings pond (aerial) |
| C11 | `da1e785f` | Everyday-aluminum montage (can, foil, laptop, bike) |
| C12 | `ac8a7898` | Aluminum aircraft fuselage at dawn |
| C13 | `7331705b` | West African village at dusk, distant mine glow |
| C14 | `21b97590` | Closing: silver ingot on red laterite earth |

### Video clips — Tier A gap-fill batch (added; 8s each, 720p)
| # | Job ID | Shot | Slots into |
|---|--------|------|-----------|
| N1 | `71705506` | West Africa from orbit at dawn | V1 opening |
| N2 | `79a9fd16` | Miner's hands turning raw bauxite ore (no face) | V3 extraction |
| N3 | `a5f8232b` | Molten aluminum pour (macro) | V4 refining |
| N4 | `d7316bb6` | Laden cargo ship crossing open sea | V3/V5 |
| N5 | `90f02a94` | Aluminum-and-glass skyline at dawn | V5 payoff |
| N6 | `05841861` | Child silhouette in lamp-lit doorway | V6 human cost |

Total footage now **20 clips ≈ 160s** vs 185s VO → residual slow-mo only ~1.15× (barely
perceptible), down from ~1.55×.

Superseded takes (do not use): `98f85f3b` (map v1), `80b56ece` (village v1),
`7e1796de` (aerial v1), `ee7a3c42` (soda-can v1).

### Voiceover segments (Seed Audio, voice "Sterling" `dc382508-c8bd-443c-8cb2-46e57b8d2e6f`)
| Seg | Job ID | Duration | Line (opening) |
|-----|--------|----------|----------------|
| V1 | `e65bdee6` | 41.5s | "The can in your hand… the answer is a trap." |
| V2 | `91e61b7e` | 23.3s | "It's called the resource curse. The paradox of plenty…" |
| V3 | `87269eee` | 29.0s | "Here is how the trap closes. The ore is shipped out raw…" |
| V4 | `f6db344c` | 30.4s | "The money was never in the red earth…" |
| V5 | `3f80bfa4` | 23.2s | "The finished metal returns as everything…" |
| V6 | `88091980` | 26.6s | "This is the paradox, in a single frame… a curse is not a sentence." |
| V7 | `e1189282` | 10.8s | "The red earth will always be worth more as metal than as dirt…" |
| | | **184.8s (3:05)** | |

---

## 2. Edit Decision List (VO-driven timeline)

Narration is the spine; footage is cut/held/slowed to fit each segment. With the Tier A
batch, footage is now ~160s over 20 clips vs 185s VO, so residual slow-mo is only ~1.0–1.35×
(near-native) — no further generation required.

| Timecode | VO | Clips (in order) | Raw | Fit note |
|----------|----|--------------------|-----|----------|
| 0:00–0:41 | V1 | C1 hook → N1 orbit → C2 world map | 24s | Lead on the hook; slow ~1.3× |
| 0:41–1:05 | V2 | C3 cross-section → C4 aerial | 16s | Slow ~1.45× (only tight segment) |
| 1:05–1:34 | V3 | N2 hands → C5 excavator → C7 port → N4 ship | 32s | ~1.0×; land "leaves the port" on N4 ship |
| 1:34–2:04 | V4 | C8 refinery → C9 transformation → N3 molten pour → C10 red-mud | 32s | ~1.0×; "red waste" on C10 |
| 2:04–2:27 | V5 | C11 montage → C12 aircraft → N5 skyline | 24s | ~1.0×; end on the skyline |
| 2:27–2:54 | V6 | C13 village → N6 child → C6 worker-scale | 24s | ~1.1×; hold on "in the dark" |
| 2:54–3:05 | V7 | C14 closing ingot | 8s | Slow ~1.35× reverent push-in |

---

## 3. 720p Export Settings

- **Resolution:** 1280 × 720 (16:9). Upscale C1 (1080p) down to match, or keep the
  film at 1080p and letterbox the 720p clips — recommended: normalize everything to 720p.
- **Frame rate:** 24 fps (matches the "35mm film look" grade).
- **Codec:** H.264 (High profile), ~8–10 Mbps target — clean for YouTube at 720p.
- **Audio:**
  - Narration bus: Sterling VO segments in sequence, normalized to ~ -16 LUFS.
  - Ambient bus: keep each clip's Seedance foley but **duck to ~ -18 dB under VO**
    (sidechain to the narration) so machine hum/wind supports, never competes.
  - Add a low bed of music at ~ -24 dB if desired (not yet generated).
- **Titles:** clips were generated text-free by design — add lower-thirds / title card
  in the editor ("The Red Earth", source stat, closing question).

---

## 4. Music-bed direction

The music is a **bed, not a score**: ~ -24 dB under narration, swelling only in the gaps
between VO segments, ducking back the instant Sterling speaks. Documentary underscore,
not trailer music.

**Emotional arc (mapped to the EDL):**

| Section | Timecode | Mood | Instrumentation |
|---------|----------|------|-----------------|
| I. The Hook & the Trap | 0:00–1:05 (V1–V2) | Curious, ominous | Sparse: low sustained drone (cello/synth pad), lone kalimba or ngoni figure (West African texture), distant sub-bass pulse. Space and silence. |
| II. The Mechanism | 1:05–2:27 (V3–V5) | Building weight, industrial inevitability | Add slow mechanical percussion pulse (heartbeat/machine), low brass swells under "the value multiplies," rising tension under the red-mud beat. Momentum, not drama. |
| III. Cost & Resolve | 2:27–3:05 (V6–V7) | Melancholic → quietly hopeful | Strip back to opening drone + ngoni; resolve harmony upward on "a curse is not a sentence." End on a single held warm note under the closing question. Last ~2s: no music, ambient only. |

**Specs:**
- Tempo ~60–70 BPM; minor/modal, one tonal center, lift to relative major in III.
- One continuous ~3:10 instrumental bed (trim room), or three ~60–80s crossfaded stems.
- Recurring West African string/kalimba motif bookends hook → close.
- Deliver **instrumental only**, dynamically restrained (low peak-to-average) for a clean
  sidechain duck under narration.

**Sourcing:** Higgsfield Seed Audio does speech only; `sonilo_music` is walled to the game
pipeline. Bed must come from an **external source** — a music-gen tool (Suno/Udio-style),
a licensed library (Artlist/Epidemic/Musicbed), or a composer. This brief hands off as-is.

---

## 5. Assembly walk-through (CapCut — free)

Higgsfield has **no timeline/assembly editor** (it only generates), and the mux cannot run
inside the Claude session (media CDN egress-blocked, no ffmpeg). Assemble in an external NLE.
CapCut (desktop/mobile, free) is the most accessible; DaVinci Resolve is the pro-free option.

0. **Download assets** from the Higgsfield Library: all 14 clips + 7 Sterling VO `.wav`s
   (keep job IDs in filenames to match this doc).
1. **New project:** canvas 16:9, **1280×720**, **24 fps**.
2. **Video spine** (order = EDL §2): C1 hook → C2 map → C3 cross-section → C4 aerial →
   C5 excavator → C6 workers → C7 port → C8 refinery → C9 transformation → C10 red-mud →
   C11 montage → C12 aircraft → C13 village → C14 ingot.
3. **Narration:** on audio track 1, drop V1→V7 back-to-back from 0:00 (~3:05 total). This is
   the sync spine — everything aligns to it. (This is the fix for "no voice.")
4. **Fill the footage gap** (~2:00 footage vs 3:05 VO): per clip, Speed → ~0.6–0.75× or
   freeze last frame, so each clip block sits under its assigned VO segment (EDL timecodes).
5. **Audio balance:** VO ~ -16 LUFS; duck each clip's ambient to ~ -18 dB under the voice.
6. **Music bed** (once sourced per §4): audio track 2 at ~ -24 dB, three-movement arc.
7. **Titles:** clips are text-free by design — add title card, source-stat lower-third,
   closing question over C14.
8. **Export:** 720p, 24 fps, H.264, ~8–10 Mbps → finished narrated film, one file.

---

## 6. Open items

- **Music bed** — not generated (Seed Audio here does speech only; use an external
  music source or a music-capable model).
- **Footage shortfall** — RESOLVED via Tier A batch (6 clips). Footage now ~160s over 20
  clips vs 185s VO; residual slow-mo ~1.0–1.35× (near-native). Only V2 (0:41–1:05) still
  runs ~1.45×; one more clip there would make it fully native but is not required.
- **Assembly** — must happen in Higgsfield's editor or a local NLE; cannot mux inside
  the Claude session (media CDN blocked by egress policy, no ffmpeg).
