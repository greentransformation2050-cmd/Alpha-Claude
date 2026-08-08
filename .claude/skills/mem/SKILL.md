---
name: mem
description: >
  Persistent cross-session memory for this repo. Use this skill whenever the user
  says "mem", "/mem", "remember this", "save this to memory", "what do you know
  about me / this project", "recall", "update memory", "where were we", "resume",
  "continue the project", or asks for a handoff or status of past work — and also
  at the START of any session that touches an ongoing project, before doing
  substantive work, so prior decisions and state are loaded instead of re-derived.
  Covers reading memory, saving new facts/decisions/state, starting a new project
  memory, and archiving finished ones.
---

# mem — persistent memory for this repo

This repo is Alpha's cross-session workspace. Claude sessions here run in
ephemeral containers: anything not committed is lost, and each new session
starts blind. The `memory/` directory is the fix — a small, curated store of
durable facts that every session reads before working and updates before
ending. Treat it as the single source of truth about the user and their
projects. Ad-hoc handoff files in the repo root (e.g. `HANDOFF-*.md`) predate
this system: keep them as deep-detail references that memory files may link
to, but write all new durable state into `memory/` — don't create new
root-level handoff files.

## Layout

```
memory/
├── MEMORY.md          # index: user profile, standing preferences, active-projects table
├── projects/          # one file per ongoing project (slug.md)
└── archive/           # finished/dormant project files, moved here verbatim
```

## Operations

Pick the operation from what the user asked; "recall" is the default when the
request is just "mem" or ambiguous.

### recall (default — also do this silently at the start of project work)

1. Read `memory/MEMORY.md`.
2. Read the project file(s) relevant to the task at hand (all of them if the
   user asked "what do you know").
3. Answer in the user's style: terse, decision-first. Lead with current state
   and the next pending decision, not a recap of history.

If memory contradicts something cheaply observable in the repo (a file
changed, a branch merged), trust the observation, say so, and fix memory in
the same turn. Don't spend external calls (paid APIs, credit-balance checks)
just to verify memory during recall — surface the uncertainty and let the
user decide.

### save

Use when the user says "remember/save this", and also proactively at the end
of any session where durable state changed (a decision made, a milestone hit,
a preference expressed, a blocker discovered).

1. Decide where each fact belongs: user-level → `MEMORY.md`; project-level →
   the project file (create one if the project is new — see below).
2. Edit the file in place — update the existing section rather than appending
   a log line. Memory is a snapshot, not a transcript.
3. Update the file's `Last updated:` line and, if project status changed, the
   active-projects table in `MEMORY.md`.
4. Commit with message `mem: <what changed>` and push. An unsaved memory dies
   with the container, so a save is not done until it is pushed.

What earns a place in memory: decisions and their rationale, current state and
next actions, hard constraints (budgets, IDs, deadlines), user preferences,
corrections the user made. What does not: transcripts, speculation, anything
recoverable by reading the codebase, and never secrets, tokens, or credentials.

### new project

Create `memory/projects/<slug>.md` from this template:

```markdown
# <Project name>

Status: active
Last updated: <date>

## What this is
<2–4 lines: goal and deliverable>

## Current state
<where things stand right now>

## Decisions
- <decision> — <why>

## Constraints & key facts
- <budgets, IDs, tools, style locks, deadlines>

## Next actions
1. <ordered, concrete>

## Open questions / blockers
- <what's unresolved and who/what it waits on>
```

Add a row to the active-projects table in `MEMORY.md`.

### archive

When a project is finished or the user drops it: set `Status: archived` with a
one-line outcome, `git mv` the file to `memory/archive/`, remove its row from
the active-projects table, commit and push.

## Writing style for memory files

Write for a future session with zero context: spell out IDs, amounts, and
dates; no pronouns pointing outside the file. Keep each project file under
~120 lines — when it grows past that, compress history into the Decisions
section and cut anything a future session wouldn't act on. The value of
memory is that it is short enough to actually be read.
