# Claude Setup Guide — Skills, Connectors (MCP), Plugins & Loops

**Prepared for:** Alpha Kaloga (GT2050 / GCF Guinea / "The Red Earth" production)
**Date:** July 11, 2026
**Basis:** Live audit of this Claude account (installed connectors, enabled plugins, available
skills) + the official Anthropic plugin marketplace docs (`code.claude.com/docs/en/discover-plugins`,
catalog at `claude.com/plugins`).

Quick vocabulary:
- **Connector (MCP server):** a live connection to an external service (Gmail, Notion,
  Higgsfield…). Installed from the claude.ai directory: **Settings → Connectors → Browse
  connectors → Connect** (OAuth login).
- **Plugin:** a bundle of skills/commands/agents. On claude.ai they come from plugin
  marketplaces (your org uses `knowledge-work-plugins`); in Claude Code use
  `/plugin install <name>@claude-plugins-official`.
- **Skill:** an instruction pack Claude loads for a specific job (e.g. your custom
  `gcf-comment-response`). Managed in **Settings → Capabilities/Skills**, or triggered by name.
- **Loop / Routine:** recurring automation — `/loop <interval> <prompt>` inside a session, or a
  scheduled Routine (cron) that wakes a session on a schedule.

---

## 1. Connectors (MCP servers)

### 1a. Already connected — keep and use

| Connector | Status | Why you need it | What to use it for |
|---|---|---|---|
| **Higgsfield Video** | ✅ Connected | Your entire "Red Earth" asset pipeline lives here (Seedance clips, Sterling VO, credits ~270) | Generating clips/VO in the locked house style, checking `balance` before spending, virality dashboards |
| **vidIQ for Claude** | ✅ Connected | YouTube strategy + **it has a `generate_music` tool — a candidate to solve your missing music bed** | Music-bed generation (test with §4 brief), title/thumbnail scoring, keyword research, trend analysis before publishing the film |
| **Canva** | ✅ Connected | Design without leaving Claude | Title cards, lower-thirds text mockups, YouTube thumbnail, GT2050 presentation decks |
| **Google Drive** | ✅ Connected | Your institutional document base | Searching/reading proposals (SARITEM-2, GCF Readiness), pulling reference docs into drafting sessions |
| **Google Calendar** | ✅ Connected | Multi-front schedule (GT2050, GCF, FRLD, Santiago Network) | Time-audit verification (Phase 1 mentoring), scheduling deep-work blocks, meeting prep |
| **Notion** | ✅ Connected | Structured project tracking | Move the mentoring codex + time audit into a live database; track "Red Earth" open items |
| **Make** | ✅ Connected | No-code automation scenarios | Recurring workflows (e.g. weekly report assembly, form-intake → Drive) |
| **Zapier** | ✅ Connected | 9,000+ app bridge | One-off automations where Make has no scenario yet (e.g. Gmail label → Todoist task) |
| **Supermetrics** | ✅ Connected | Marketing/analytics data (200+ sources) | Post-launch: YouTube/LinkedIn performance of the documentary; GT2050 comms analytics |

### 1b. Installed but needs action

| Connector | Status | Why fix it | How to fix | What to use it for |
|---|---|---|---|---|
| **Gmail** | ⚠️ Installed, **not authenticated** | GCF/FRLD correspondence is email-heavy; unusable until re-authorized | claude.ai → Settings → Connectors → Gmail → **Connect** (Google OAuth) | Summarizing reviewer threads, drafting GCF replies, searching for proposal feedback |
| **Todoist** | ⚠️ Installed, not connected | Your Phase 1 mentoring needs an execution log (fitness 4×/week, time audit) | Same path: Connectors → Todoist → Connect | Daily category logging, fitness check-offs, 90-day-win tracking |
| **Microsoft 365** | ⚠️ Installed, disabled in chat | Only if GCF/AU partners share via SharePoint/Teams | Enable in the chat's connector settings when needed | Reading partner SharePoint docs, Outlook threads |

### 1c. Worth adding (from the public registry)

| Connector | Why | How to install | Use it for |
|---|---|---|---|
| **Semrush** | SEO/competitor visibility for GT2050 web presence | Settings → Connectors → Browse → Semrush → Connect (needs Semrush account) | Keyword research for climate-finance content, backlink audit |
| ~~Music generation (Suno/Udio)~~ | **Not available** — no music-gen connector exists in the registry (checked 2026-07-11) | n/a | Music bed stays external: try **vidIQ `generate_music`** first, else Suno/Artlist directly in the browser |

---

## 2. Plugins

### 2a. Enabled now (claude.ai, `knowledge-work-plugins` marketplace)

| Plugin | Status | Use it for |
|---|---|---|
| **productivity** | ✅ Enabled | Task/priority workflows — pairs with the mentoring codex |
| **legal** | ✅ Enabled | Reviewing FRLD/GCF agreements, MOUs, data-sharing terms |
| **sales** | ✅ Enabled | Partnership/funder outreach framing (less central — disable if unused to save context) |
| **cowork-plugin-management** | ✅ Enabled | Managing the plugins themselves |

### 2b. Recommended to enable

| Plugin | Why you need it | How to install | Use it for |
|---|---|---|---|
| **marketing** | You're about to launch a documentary and run GT2050 comms | claude.ai plugin settings → `knowledge-work-plugins` → enable **marketing** | Launch plan for "The Red Earth", social copy, audience positioning, campaign briefs |
| **operations** | Multi-project coordination (SARITEM-2 USD 19M, GCF Readiness USD 2.5M, AIP, Enabel) | Same marketplace → enable **operations** | Process docs, project trackers, meeting-to-action pipelines |
| **enterprise-search** | Your knowledge is split across Drive, Notion, Gmail | Same marketplace → enable **enterprise-search** | Cross-tool search when drafting proposals ("find every mention of co-financing") |

### 2c. Claude Code (terminal) — official marketplace, if/when you code

Install with `/plugin install <name>@claude-plugins-official`:

| Plugin | Why | Use it for |
|---|---|---|
| **github** | Pre-configured GitHub MCP | Managing this Alpha-Claude repo, issues, PRs |
| **notion** | Same Notion workspace from the terminal | Syncing repo docs ↔ Notion |
| **commit-commands** | Clean git workflows | `/commit-commands:commit` for tidy commits of handoff docs |
| **security-guidance** | Auto security review | Only if ClimateTaskAI Lite development resumes |

---

## 3. Skills

| Skill | Status | Why you need it | How to enable | Use it for |
|---|---|---|---|---|
| **gcf-comment-response** (custom) | ✅ Enabled | Purpose-built for your highest-stakes work | Already on | GCF Secretariat/iTAP comment matrices, SARITEM-2 resubmissions, compliance checks |
| **canvas-design** | ✅ Enabled | Visual deliverables without a designer | Already on | Posters, one-pagers, the film's title-card concepts as PDF/PNG |
| **doc-coauthoring** | ❌ Disabled — **turn on** | Structured co-writing beats ad-hoc drafting for 19M-dollar proposals | Settings → Capabilities → Skills → enable **doc-coauthoring** | SARITEM-2 narrative sections, concept notes, decision docs |
| **deep-research** (built-in, Claude Code sessions) | Available | Cited multi-source research | Invoke: ask for a "deep research report" | Resource-curse source stats for the film's on-screen citations; GCF policy scans |
| **dataviz** (built-in) | Available | Consistent, accessible charts | Auto-triggers on chart requests | Time-audit visualization (Phase 1 day-14 review), proposal figures |

---

## 4. Loops & Routines (recurring automation)

| Tool | Why you need it | How to use | Use it for |
|---|---|---|---|
| **/loop skill** (in-session) | Repeats a prompt on an interval while a session runs | In a Claude Code session: `/loop 30m <prompt>` (default 10m) | Babysitting a long job: "check Higgsfield generation status", "watch PR CI until green" |
| **Routines / scheduled triggers** (cron) | Fires on a schedule even when you're away — this is what your mentoring cadence needs | Ask Claude: "create a routine every Monday 08:00 that asks for my weekly time-audit log" (uses `create_trigger`, min. hourly) | Weekly fitness/time-audit check-in (Phase 1 → 65 kg by ~Sept 18), monthly credit-balance check on Higgsfield, quarterly mentoring review |
| **send_later** (one-shot reminder) | Single future nudge into an existing session | "Remind me in this session tomorrow at 09:00 to review the EDL" | Day-14-style one-off checkpoints |
| **Make/Zapier scheduled scenarios** | Automation that should run without any Claude session | Build in Make: Scheduler module → action chain | Auto-filing Gmail attachments to Drive, weekly Supermetrics pull → Notion |

---

## 5. Priority actions (do these first)

1. **Re-authenticate Gmail** — it's installed but dead until you click Connect.
2. **Enable `doc-coauthoring`** skill — direct payoff for SARITEM-2 and GCF Readiness drafting.
3. **Enable the `marketing` plugin** — "The Red Earth" launch is imminent.
4. **Test `vidIQ generate_music`** against the §4 music brief in `VIDEO-export-bauxite-720p.md`
   — potentially closes your last asset blocker at no Higgsfield credit cost.
5. **Connect Todoist + create a weekly Routine** — turns the Phase 1 mentoring audit from
   intention into logged data.
