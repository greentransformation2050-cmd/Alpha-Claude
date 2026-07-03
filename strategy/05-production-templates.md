# Production Templates — Daily Workflow Kit

Companion to `FACELESS-CHANNEL-STRATEGY.md` Section 10. Ready-to-use templates for the solo-creator daily workflow. Two matching CSV files (`templates/idea-tracker.csv`, `templates/retention-tracker.csv`) are included in this folder — import either directly into Google Sheets/Excel to start using them immediately.

---

## 1. Fill-in-the-Blank Script Template (C.E.T.L. Formula)

Copy this block for every new script. Keep total spoken word count under ~110 words for a 45-second Short (average speaking pace ~150 wpm, minus pause time).

```
VIDEO #: ___
CONCEPT/TOPIC: ______________________________
SOURCE (name the study/mechanism — required, see channel guardrail rule): ______________________________

HOOK (0-2s, one sentence, no intro/logo):
"________________________________________________"

CURIOSITY LOCK (3-8s, name the gap, don't resolve it yet):
"________________________________________________"

ESCALATION (8-20s, one relatable, specific scenario — not abstract):
"________________________________________________"

MID-VIDEO TWIST (~20-35s, the reveal/reframe, cite the real mechanism by name):
"________________________________________________"

EMOTIONAL PAYOFF (35-45s, one concrete, usable takeaway):
"________________________________________________"

COMMENT TRIGGER (final line, specific opinion/identity question, not "thoughts?"):
"________________________________________________"

SHARE TRIGGER (baked in or explicit — who specifically should this be sent to?):
"________________________________________________"

THUMBNAIL TEXT (3-6 words max, from the 30-formula list):
"________________________________________________"

TITLE (from the 50-template list):
"________________________________________________"

VISUAL PLAN (b-roll/motion graphic per beat):
- Hook: ____________
- Escalation: ____________
- Twist: ____________
- Payoff: ____________
```

---

## 2. Daily Workflow Checklist (solo creator, ~3–4 hrs/day)

**Morning block (research + script, ~60–75 min)**
- [ ] Pull 1–2 new concepts from the idea tracker backlog (never start from zero — see Section 10)
- [ ] Verify the source/mechanism is real and nameable (guardrail rule)
- [ ] Write script using the template above
- [ ] Read script aloud once, cut anything that doesn't add new information

**Production block (shoot/generate + edit, ~90–120 min)**
- [ ] Record or generate voiceover
- [ ] Pull/generate b-roll matched to each script beat
- [ ] Edit: captions burned in, pattern-interrupt cut every 2–3s, music bed under -20dB, loop-matched first/last frame
- [ ] Export in platform-native formats (9:16 Shorts/Reels/TikTok, 16:9 for any long-form day)

**Publish block (~20–30 min)**
- [ ] Title from the 50-template list, run 2 candidate titles past the scoring gut-check ("would I click this from a stranger?")
- [ ] Thumbnail text from the 30-formula list (long-form only; Shorts use in-video text)
- [ ] Post to all 3 platforms same day
- [ ] Pin first comment with source + CTA
- [ ] Add current affiliate link(s) to description if topically relevant (never force a mismatched link)

**Next-morning review (~15–20 min, before that day's research block)**
- [ ] Log yesterday's video in the retention tracker (3-sec retention, AVD%, comments, shares, CTR)
- [ ] Identify the single biggest drop-off point
- [ ] Write one sentence: "today's script will fix ___ by doing ___" — this is today's one deliberate iteration (Section 10/11)

---

## 3. Weekly Checklist (do once, on the same day each week)

- [ ] Repurpose the week's best-performing Short into a long-form deep dive outline
- [ ] Draft and send the week's newsletter (1 concept + 1 story, per Section 7)
- [ ] Post 1 value-only Community post (no ask) and 1 poll (from Section 9's 20 ideas)
- [ ] Review sponsor/affiliate application tracker (`strategy/03-sponsor-affiliate-targets.md`) — any new tier to apply to this week?
- [ ] Weekly retro: compare all posts on 3-sec retention/AVD%/comments/shares/CTR — keep the top-2 pattern as next week's default, iterate the bottom-2
- [ ] Update the financial model actuals vs. projection (`strategy/04-financial-model.md`) — are you tracking to the low end, mid, or high end of the current month's range?

---

## 4. Idea Tracker — column structure (see `templates/idea-tracker.csv`)

| Column | Purpose |
|---|---|
| `id` | Sequential number |
| `concept_name` | The named psychological concept/topic |
| `source` | The study/book/named mechanism — must be filled before scripting (guardrail rule) |
| `format` | Short / Long-form |
| `status` | Backlog / Scripted / Shot / Edited / Posted |
| `chapter` | Which Field Guide chapter it maps to (Self / Relationships / Work / Groups) — keeps content balanced across pillars |
| `posted_date` | Date published |
| `notes` | Anything specific (e.g., "good candidate for BetterHelp tie-in") |

**Rule of thumb:** keep the backlog stocked at 15+ rows at all times — research in batches (e.g., read one psychology book/study roundup per week and extract 5–8 concepts at once) rather than daily from scratch.

## 5. Retention Tracker — column structure (see `templates/retention-tracker.csv`)

| Column | Purpose |
|---|---|
| `video_id` | Matches idea tracker `id` |
| `platform` | YouTube / TikTok / Instagram |
| `post_date` | |
| `3sec_retention_pct` | Swipe-away indicator (Section 11) |
| `avg_view_duration_pct` | Pacing/payoff-timing indicator |
| `comments` | Comment-trigger effectiveness |
| `shares` | Share-trigger effectiveness |
| `ctr_pct` | Title/thumbnail effectiveness (YouTube only) |
| `subs_gained` | Channel-signature effectiveness |
| `biggest_issue` | One-word tag: hook / pacing / comment / share / ctr / none |
| `next_video_fix` | The one deliberate change made in response |
