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

Narration is the spine; footage is cut/held/slowed to fit each segment. Footage total
(~120s over the assigned clips) is < VO total (185s), so shots are slowed ~1.3–1.6×
(Seedance moves are slow and hold well) — no additional generation required.

| Timecode | VO | Clips (in order) | Raw | Fit note |
|----------|----|--------------------|-----|----------|
| 0:00–0:41 | V1 | C1 hook → C2 world map | 16s | Punch-cut the hook at 0:08; hold/slow the map push-in to fill |
| 0:41–1:05 | V2 | C3 cross-section → C4 aerial | 16s | Slow ~1.4× |
| 1:05–1:34 | V3 | C5 excavator → C6 workers → C7 port | 24s | Slow ~1.2× |
| 1:34–2:04 | V4 | C8 refinery → C9 transformation → C10 red-mud | 24s | Slow ~1.25×; land "red waste" on C10 |
| 2:04–2:27 | V5 | C11 aluminum montage → C12 aircraft | 16s | Slow ~1.4× |
| 2:27–2:54 | V6 | C13 village → C6 worker-scale (reuse) | 16s | Hold village on "in the dark"; slow to fill |
| 2:54–3:05 | V7 | C14 closing ingot | 8s | Slow reverent push-in to fill 10.8s |

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

## 4. Open items

- **Music bed** — not generated (Seed Audio here does speech only; use an external
  music source or a music-capable model).
- **Footage shortfall** — 3:05 VO vs ~2:00 raw footage is covered by slowing/holding.
  If smoother motion is preferred over slow-mo, ~8–9 more 8s clips (~290–320 cr) would
  fill it 1:1 — but that exceeds the current ~270-credit balance, so a top-up would be
  needed first.
- **Assembly** — must happen in Higgsfield's editor or a local NLE; cannot mux inside
  the Claude session (media CDN blocked by egress policy, no ffmpeg).
