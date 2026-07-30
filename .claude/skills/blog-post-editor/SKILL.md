---
name: blog-post-editor
description: Format, edit, and polish blog posts, articles, and newsletters from rough draft to publish-ready. Use this skill whenever the user wants to write, draft, restructure, edit, proofread, format, or publish a blog post, article, op-ed, newsletter issue, or LinkedIn article — even if they just paste rough text and say "clean this up," "make this publishable," "format this for my blog," or "turn these notes into a post." Also use it for SEO titles and meta descriptions, converting posts between platforms (Markdown, WordPress, Medium, LinkedIn), and English/French blog content.
---

# Blog Post Editor

Turn rough drafts, notes, or ideas into publish-ready blog posts, and edit existing
posts without erasing the author's voice.

## Step 1: Identify the job

Users rarely say precisely what they need. Classify the request into one of these
modes before touching the text, and confirm only if genuinely ambiguous:

| Mode | Signals | What you do |
|------|---------|-------------|
| **Draft** | "write a post about…", notes/bullets provided | Structure + write from scratch |
| **Structural edit** | Draft exists but rambles, buries the lead, no clear arc | Reorganize sections, cut, reorder |
| **Line edit** | Draft is well-structured but wordy or flat | Tighten sentences, sharpen verbs |
| **Format** | "format for my blog/WordPress/Medium/LinkedIn" | Apply platform conventions |
| **Publish pass** | "make this ready to publish", "final check" | All of the above + SEO + QA checklist |

A "publish pass" runs the full pipeline: structure → line edit → format → metadata → QA.

## Step 2: Understand the post before editing

Read the whole draft first. Identify:

- **The one idea.** Every good post argues or explains exactly one thing. If the draft
  contains two posts, say so and propose splitting it.
- **The audience.** A post for policymakers reads differently from one for a general
  audience. Infer from context (the user's other writing, the platform, the topic) and
  state your assumption in the summary.
- **The author's voice.** Note recurring phrases, sentence rhythm, level of formality,
  and first-person usage. Editing must preserve these — a post that comes back sounding
  like a different person has failed, even if every sentence is technically better.

## Step 3: Structure

A blog post that works almost always has this shape. Use it when drafting; check
against it when editing:

1. **Hook (first 1–3 sentences).** A concrete image, surprising fact, sharp question,
   or stakes statement. Never open with throat-clearing ("In today's world…",
   "It is widely known that…"). If the draft's best sentence is buried in paragraph 4,
   it probably belongs at the top.
2. **The promise.** Within the first ~100 words, the reader knows what they'll get.
3. **Body in scannable sections.** A subheading (`##`) every 150–300 words. Subheadings
   should carry meaning on their own — a reader skimming only the headings should get
   the argument's skeleton. "Why raw exports keep countries poor" beats "The problem".
4. **Paragraphs of 1–4 sentences.** Long paragraphs die on phones, where most blog
   reading happens. One idea per paragraph.
5. **Lists and tables** where the content is genuinely enumerable — not as decoration.
6. **A real ending.** Land on the strongest implication, a call to action, or a
   forward-looking question. Never a summary that just repeats the post ("In
   conclusion, we have seen that…").

## Step 4: Line editing

Work sentence by sentence, but change only what earns its change:

- **Cut ruthlessly.** Most drafts shrink 20–30% with no loss. Kill filler ("it is
  important to note that", "in order to", "the fact that"), redundant qualifiers
  ("very unique"), and sentences that restate the previous one.
- **Prefer concrete over abstract.** "Guinea exports bauxite at ~$40/tonne while
  finished aluminum sells for ~$2,400" beats "significant value is captured abroad."
  Keep the author's numbers and examples; ask for specifics where the draft is vague.
- **Active voice by default**, passive only when the actor is unknown or irrelevant.
- **Vary sentence length.** A short sentence after two long ones lands hard. Use that.
- **One metaphor at a time.** Mixed metaphors ("the roadmap unlocks a level playing
  field") read as carelessness.

### Avoid AI-sounding prose

Edited posts must read as human-written. Watch for and remove these tells:

- Overused words: *delve, tapestry, landscape (figurative), robust, leverage,
  navigate (figurative), foster, testament, pivotal, crucial, seamless, elevate*
- The "rule of three" reflex: three parallel phrases in every other sentence
- Negative parallelisms: "It's not just X — it's Y"
- Em-dash overuse (more than ~1 per paragraph is a tell)
- Uniform paragraph lengths and uniformly medium sentences
- Empty intensifiers and inflated significance ("groundbreaking", "game-changing")
- Vague attributions ("experts agree", "studies show") without a named source

## Step 5: Formatting and metadata

Default output is clean Markdown with YAML front matter, since it converts to
everything else. For platform-specific output (WordPress, Medium, LinkedIn, static
site generators), read `references/platform-formatting.md`.

Standard deliverable for a formatted post:

```markdown
---
title: "Post title (≤60 characters, benefit- or curiosity-driven)"
description: "Meta description, 150–160 characters, contains the main keyword."
slug: kebab-case-3-to-5-words
date: YYYY-MM-DD
tags: [tag-one, tag-two, tag-three]
lang: en   # or fr
---

# Post title

Body…
```

Metadata rules:

- **Title ≤60 characters** so search results don't truncate it. Make it specific:
  "Why Guinea's bauxite leaves poorer than it arrives" beats "Thoughts on mining".
- **Meta description 150–160 characters**, written as a hook, not a summary.
- **Slug**: 3–5 lowercase words, hyphens, no stopwords, stable once published.
- **Date**: use today's date unless the user names a publish date; mention in the
  change summary that they should update it if publishing later.
- **Keyword use**: the main keyword appears in the title, first 100 words, one
  subheading, and the meta description — naturally. If it reads stuffed, it is.
- **Images**: every image gets descriptive alt text (for accessibility and SEO) and
  a caption if it carries information. Mark missing images with
  `<!-- IMAGE: description of what should go here -->` placeholders.
- **Links**: descriptive anchor text ("the GCF readiness programme", never "click
  here"). Flag claims that need a source with `<!-- SOURCE NEEDED -->`.

## Bilingual posts (English / French)

When the user works in both languages:

- Translate meaning and register, not words. A French blog post uses its own idiom —
  "Plongée dans…" not a calque of "A deep dive into…".
- Keep proper nouns and institution names in their official form (Fonds vert pour le
  climat / Green Climate Fund — match the language of the post, give the acronym once).
- French typography: space before `: ; ! ?`, guillemets « » for quotes, and French
  capitalization rules for titles (sentence case, not Title Case).
- Produce separate front matter per language version (`lang`, distinct `slug`).

## Step 6: Deliver

Always deliver two things:

1. **The edited post** — as a file when working in a repo or workspace, otherwise
   inline in full.
2. **A change summary** — a short list of the substantive changes and why: moved the
   hook, cut X words, retitled sections, flagged N missing sources. Never list
   mechanical fixes (typos, spacing) individually. If you made an assumption about
   audience or platform, state it here so the user can correct it cheaply.

For a publish pass, also run the pre-publish checklist in
`references/editing-checklist.md` and report anything that fails.

## What not to do

- Don't rewrite a competent draft to your own taste. The bar for changing a sentence
  is "measurably clearer or tighter," not "how I would have said it."
- Don't invent facts, statistics, or quotes to fill gaps — insert a
  `<!-- SOURCE NEEDED -->` or ask.
- Don't pad. If a post says what it needs in 600 words, don't inflate it to 1,200
  for imagined SEO benefit — thin content stretched long ranks worse, not better.
- Don't strip personality. Idiosyncratic phrasing that is clear stays.
