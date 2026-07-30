# Platform-Specific Formatting

Read this when the user names a target platform, or asks to convert a post from one
platform to another. Default (no platform named): clean Markdown with YAML front
matter, per SKILL.md.

## Static site generators (Hugo, Jekyll, Astro, Eleventy)

- Markdown body + YAML front matter. Field names vary by theme — if the repo has
  existing posts, **copy their front matter fields exactly** rather than inventing a
  schema. Look in `content/`, `_posts/`, or `src/content/`. If no existing posts are
  accessible, use the standard schema from SKILL.md and say so in the change summary
  so the user can swap field names to match their theme.
- Jekyll filenames: `YYYY-MM-DD-slug.md`. Hugo: `content/posts/slug.md` or a page
  bundle `content/posts/slug/index.md` (use a bundle when the post has images).
- Images live next to the post (bundles) or in `static/`/`assets/` — match existing
  convention. Use relative paths.
- Code fences with language tags; most themes highlight automatically.

## WordPress

- Deliver clean HTML **or** Markdown, per the user's setup (Gutenberg pastes
  Markdown well; the classic editor wants HTML).
- HTML subset that survives WordPress: `<h2>`–`<h4>`, `<p>`, `<ul>/<ol>`,
  `<blockquote>`, `<figure><img … alt=""><figcaption>`, `<a>`, `<strong>/<em>`,
  `<pre><code>`. Avoid inline styles — themes override them.
- The post title lives in the title field, so the body starts at `<h2>` (no `<h1>`).
- Provide separately (they go in fields, not in the body): SEO title, meta
  description, slug, focus keyword (Yoast/RankMath), featured-image suggestion,
  category (one) and tags (3–6).
- Add a `<!--more-->` tag after the hook if the theme uses excerpts.

## Medium

- Medium strips most formatting. Available: one level of section title (T-large) and
  subtitle (T-small), bold, italic, blockquote, pull quote, lists, code block, and
  separators (`---` becomes a dinkus).
- No tables — convert tables to lists or an image.
- First image becomes the cover; place a strong one at the very top.
- Subtitle field doubles as the meta description — write it deliberately.
- 5 tags maximum; pick the most-followed relevant ones.
- If canonical publishing matters (post also lives on the user's own blog), remind
  them to use Medium's "import story" tool so the canonical URL points to their blog.

## LinkedIn (articles and posts)

**Articles**: similar constraints to Medium — headings, bold, italic, quotes, lists,
images, links. No tables, no code formatting. Keep to 800–1,200 words; longer loses
readers on LinkedIn.

**Posts** (the short form) are a different genre, not a compressed article:

- ~1,300 visible characters before "…see more" — the first 2 lines decide everything.
  Put the hook in line 1, standing alone.
- Short lines with blank lines between them. Single-sentence paragraphs are normal.
- No markdown renders — plain text only. Sparse emoji as visual bullets are
  acceptable if they match the user's existing style; check their past posts.
- End with one question or one call to action, then 3–5 hashtags.
- When converting a blog post to a LinkedIn post: extract the single sharpest claim
  or number, build the post around it, and link the full article in the comments or
  at the end.

## Email newsletters (Substack, Mailchimp, Buttondown)

- Subject line ≤50 characters; preview text ≤90 — write both, they're the real hook.
- One column, no complex layout. Images sparingly (many clients block them by
  default; the text must work alone).
- Front-load: the first paragraph is what shows in inbox previews.
- One primary call-to-action link, repeated at most twice.

## Conversions between platforms

When converting, don't just reformat — re-edit for the platform's reading context:

| From → To | Key transformations |
|-----------|--------------------|
| Blog → LinkedIn post | Extract one claim, rewrite hook, strip structure, add CTA |
| Blog → Medium | Flatten heading levels, convert tables, set subtitle, pick cover |
| Blog → Newsletter | Add subject + preview, personalize opening, single CTA |
| Notes/thread → Blog | Build structure, expand context, add sources and metadata |
