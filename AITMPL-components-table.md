# aitmpl.com (Claude Code Templates) — What to Install and Why

**Site:** https://aitmpl.com — "Claude Code Templates", an open-source community catalog
(by Daniel Avila, `davila7/claude-code-templates`) of **1000+ components for Claude Code**:
600+ agents, custom commands, skills, MCPs (connectors), 39+ hooks, 60+ settings, project
templates, and a plugin-marketplace directory.

**Prepared for:** Alpha Kaloga — GT2050 / GCF Guinea / "The Red Earth" documentary
**Date:** 2026-07-11
**How this was researched:** the aitmpl.com domain is blocked by this environment's network
policy, so the catalog was verified through the site's own npm CLI package
(`claude-code-templates` v1.29.2 — flags and syntax read from its source) and its public
documentation and indexed pages. Every component named below is real; browse
https://aitmpl.com for the full 1000+ list and weekly trending.

---

## Read this first — two things that matter for you

1. **aitmpl components install into Claude Code** (the terminal/desktop coding tool),
   per project folder — **not** into claude.ai chat. Your claude.ai side (connectors like
   Higgsfield, Notion, Gmail) is covered in `PLUGINS-skills-connectors-guide.md`.
2. **These are community-made, not Anthropic-verified.** Hooks and settings can run scripts
   on your machine. Install only what you'll use, and prefer well-known components.

**Prerequisites (one time):** Node.js 18+, Claude Code installed
(`npm install -g @anthropic-ai/claude-code`).

**Universal install syntax** (run in your project folder):

```bash
# Browse everything interactively
npx claude-code-templates@latest

# Install a specific component (flags can be combined, comma-separate multiples)
npx claude-code-templates@latest --skill <category>/<name> --yes
npx claude-code-templates@latest --agent <category>/<name> --yes
npx claude-code-templates@latest --mcp <category>/<name> --yes
npx claude-code-templates@latest --command <category>/<name> --yes
npx claude-code-templates@latest --hook <category>/<name> --yes
npx claude-code-templates@latest --setting <name> --yes
```

Bonus utilities in the same CLI: `--health-check` (verify your Claude Code setup),
`--analytics` (local usage dashboard), `--skills-manager` (view installed skills),
`--plugins` (plugin dashboard).

---

## 1. SKILLS (from aitmpl.com/skills) — highest value for you

| Skill | Why you need it | How to install | What to use it for |
|---|---|---|---|
| **business-marketing / content-creator** | You're launching "The Red Earth" and run GT2050 comms with no marketing team | `npx claude-code-templates@latest --skill business-marketing/content-creator --yes` | SEO-optimized launch copy, consistent brand voice, social media templates for the documentary release |
| **business-marketing / seo-optimizer** | GT2050's visibility for funders/partners depends on being findable | `npx claude-code-templates@latest --skill business-marketing/seo-optimizer --yes` | Optimizing YouTube description/site pages for "resource curse", "bauxite Guinea", climate-finance keywords |
| **business-marketing / referral-program** | Optional — only if you build an audience-growth push | `npx claude-code-templates@latest --skill business-marketing/referral-program --yes` | Structured sharing/ambassador campaign around the film |

*(The skills catalog spans many more pods — content, SEO, CRO, growth, sales enablement.
Browse aitmpl.com/skills and filter by "business-marketing".)*

## 2. CONNECTORS / MCPs (from aitmpl.com/mcps)

⚠️ **For you, mostly redundant**: your real connectors (Higgsfield, Notion, Gmail, Drive,
Canva, vidIQ…) already live on claude.ai. aitmpl MCPs matter only when you work in the
Claude Code terminal and want the same services there.

| MCP | Why | How to install | Use it for |
|---|---|---|---|
| **github-integration** | Manage this Alpha-Claude repo from the terminal | `npx claude-code-templates@latest --mcp development/github-integration --yes` | Issues, PRs, repo ops on your handoff docs |
| **web-fetch** | Let terminal Claude read web pages | `npx claude-code-templates@latest --mcp web-fetch --yes` | Pulling GCF/UNFCCC pages into drafting sessions |
| **postgresql-integration** | Only if ClimateTaskAI Lite gets a database | `npx claude-code-templates@latest --mcp postgresql-integration --yes` | Querying app data in plain language |

## 3. AGENTS (from aitmpl.com/agents — 600+)

Mostly developer-oriented; relevant to you **only if ClimateTaskAI Lite development resumes**.

| Agent | Why | How to install | Use it for |
|---|---|---|---|
| **development-team / fullstack-developer** | A whole-app builder persona | `npx claude-code-templates@latest --agent development-team/fullstack-developer --yes` | Building ClimateTaskAI Lite end to end |
| **security / security-auditor** | Climate-finance data = sensitive data | `npx claude-code-templates@latest --agent security/security-auditor --yes` | Security/compliance review before anything goes live |
| **development-tools / code-reviewer** | Quality gate without a second engineer | `npx claude-code-templates@latest --agent development-tools/code-reviewer --yes` | Reviewing generated code |

## 4. HOOKS — the closest thing to "loops" on this site (39+ on aitmpl.com/hooks)

Hooks are **event-driven automations**: they fire automatically on Claude Code events
(before/after edits, on commit, on session end). They are not timed loops — see §6.

| Hook | Why | How to install | Use it for |
|---|---|---|---|
| **git / pre-commit-validation** | Stops broken/malformed files from being committed | `npx claude-code-templates@latest --hook git/pre-commit-validation --yes` | Auto-checks every commit in this repo |
| *Notification hooks (browse catalog)* | Get pinged when long tasks finish | Browse `aitmpl.com/hooks` → copy install command | Alerts when a long generation/build completes |

## 5. PLUGINS (aitmpl.com/plugins — directory of plugin marketplaces)

| Plugin / marketplace | Why | How to install | Use it for |
|---|---|---|---|
| **knowledge-work-plugins** | ✅ *You already use this on claude.ai* (productivity, legal, sales enabled) | Already active; in Claude Code: `/plugin marketplace add anthropics/knowledge-work-plugins` | Enable **marketing** + **operations** from it (see guide #1) |
| **claude-plugins-official** | Anthropic's curated marketplace | Built into Claude Code: `/plugin install <name>@claude-plugins-official` | `github`, `notion`, `commit-commands`, `security-guidance` |
| **alirezarezvani/claude-skills** | 345 skills incl. marketing, product, compliance, C-level advisory, research, business ops — the most non-developer-relevant collection in the directory | `/plugin marketplace add alirezarezvani/claude-skills` then `/plugin` → Discover | Board-level advisory drafts, compliance checklists, research and productivity skills for GT2050/GCF work |

## 6. "Loops" — what actually exists

aitmpl.com has **no "loops" category**. If you meant recurring/automated behavior, these are
your real options, in order of usefulness to you:

| Mechanism | Where | How | Use it for |
|---|---|---|---|
| **Routines (scheduled triggers)** | claude.ai / Claude Code sessions | Ask Claude: "create a routine every Monday 08:00 that…" | Weekly time-audit + fitness check-in (mentoring Phase 1), monthly Higgsfield credit check |
| **/loop skill** | Inside a running Claude Code session | `/loop 30m <prompt>` (default 10m) | Babysitting long jobs (video generation status, CI) |
| **Hooks (aitmpl §4)** | Claude Code, event-driven | `--hook <category>/<name>` | Auto-actions on file edits/commits — not timed |
| **Make / Zapier scenarios** | Your existing connectors | Build a scheduled scenario in Make | Automations that must run with no Claude session at all |

---

## Bottom line — install order for YOU

1. `npx claude-code-templates@latest --skill business-marketing/content-creator,business-marketing/seo-optimizer --yes` — direct payoff for the film launch.
2. `/plugin marketplace add alirezarezvani/claude-skills` — richest non-developer skill pack in the aitmpl plugin directory.
3. `npx claude-code-templates@latest --hook git/pre-commit-validation --yes` — protects this repo.
4. Set up **Routines** for the Phase 1 mentoring cadence (no install needed — just ask).
5. Skip the developer agents/MCPs until ClimateTaskAI Lite work resumes.

**Sources:** aitmpl.com · docs.aitmpl.com/introduction · github.com/davila7/claude-code-templates
· npm `claude-code-templates` v1.29.2 (CLI source) · aitmpl.com/skills, /agents, /mcps, /hooks,
/settings, /plugins category pages (via public index).
