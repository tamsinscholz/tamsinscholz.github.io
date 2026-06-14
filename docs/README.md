# Authoring guide — Summer School lessons

This is the rulebook for adding new lessons so the site stays coherent. It captures the conventions established for the first seven lessons (see `lessons/*/index.html` for examples).

If you're adding a new lesson, the short version is:
1. Read [conventions](#conventions) below.
2. Copy [`lesson-template.html`](./lesson-template.html) into a new `lessons/<slug>/` directory.
3. Add an entry to `lessons.json`.
4. Test locally with `python3 -m http.server`.

The rest of this document explains the rules and the why.

---

## How a lesson works

- The **landing page** (`/index.html`) reads `/lessons.json` and renders one card per lesson.
- Cards are **locked** by default (show only "Lesson N" + a category subtitle + a teaser).
- Unlocking happens with a **code per lesson** (or the **master code** for "unlock everything"). Codes are SHA-256-hashed in the manifest. This is a *soft gate*, not security — it's there so the student can't trivially scroll ahead, not to defend against attackers.
- Each lesson is a **standalone HTML page** at `lessons/<slug>/index.html` with its own themed CSS/JS. Lesson pages do not share a stylesheet with the landing page — each one is its own little world.

---

## Required structure of a lesson page

Every lesson page should contain these sections in roughly this order. **Pick `<h2>` titles that describe the *content*, not the *function* of the section** (see [conventions](#conventions)).

| Section | What it does | Length |
|---|---|---|
| **Hero** | Big title, kicker line (`Lesson N · Topic`), one-sentence subtitle | ~3 lines of copy |
| **Intro** | Sets up the topic in plain language. Often ends with a tiny warm-up prompt. | 1–2 short paragraphs |
| **Watch / Listen / Read** | Embedded YouTube (with start/end timestamps in the URL), or a link to an article. Include a one-sentence prompt to "listen *for* this." | iframe + ≤3 lines |
| **Words worth knowing** | Vocabulary. Each word is tap-to-reveal (see [interactivity](#interactivity-expectations)). | 5–10 entries |
| **Solo task** | One thing she does herself. Interactive if it makes sense — checklist, composer, timer, drag-and-drop, persisted to localStorage. | ~10 min of work |
| **Discuss with Oma and Opa** | 3–5 open-ended questions she takes to a grandparent. No right answers. Use this exact heading. | 3–5 questions |
| **Stretch** | Optional bonus for if she's hooked. | 1 paragraph |
| **Footer** | Just a "← all lessons" back link. | one link |

A lesson can omit a section if it doesn't apply (e.g., the art lesson has no vocab). But the **order** should stay roughly the same so the student knows where she is.

---

## Conventions

### Writing & section titles

- **Section titles describe content, not function.**
  - ✅ "Intro" — ❌ "The hook"
  - ✅ "Watch" — ❌ "The video bit"
  - ✅ "Discuss with Oma and Opa" — ❌ "Discussion" (too clinical) or "Now find Oma or Opa" (too directional)
- Address the student directly ("you"). Don't refer to her in third person.
- The grandparents are always referred to as **"Oma and Opa"** (German for grandma/grandpa — matches the family).
- Tone: she's a smart 13-year-old. Real topics, real vocabulary, no babying. Some humor is welcome.

### Interactivity expectations

This is a webpage, not a worksheet. **Lean on JS interactivity** wherever it adds something.

- **Vocabulary section: always tap-to-reveal.** Term shown; tap reveals definition. Lets her guess first.
- **Lists of choices, checklists, multi-step tasks → use real form controls** (`<input>`, `<button>`, etc.).
- **Persist state to localStorage** when it would frustrate her to lose progress (her caption draft, her audit list, her highlight marks). Use a key like `summerSchool2026.lesson.<slug>.<thing>`.
- Don't go *too* heavy — interactivity should serve the lesson, not be a tech demo.

### Theming

- **Each lesson page has a distinct visual identity** that matches its topic. Past examples:
  - `symbols` → parchment / manuscript serif
  - `german-aura` → pastel Gen-Z / faux-Instagram
  - `sigmoids` → graph paper
  - `ai-society` → newsprint op-ed columns
  - `art-imagine` → gallery white, generous space
  - `german-schrei` → punk zine, tilted blocks, marker highlights
  - `ai-truth` → sparkle-saturated, ironic, with a "disable sparkles" toggle
- Lesson stylesheets are independent — copy from the closest existing lesson and rework. Don't try to share styles with `assets/css/base.css` (that's only for the landing page).
- The landing-page card uses the lesson's `accent` color (from `lessons.json`) when unlocked, so pick a color that matches the lesson's theme.

### Media

- **Videos are YouTube embeds only.** Local mp4/mp3 files are gitignored — they don't ship.
- Use `youtube-nocookie.com` for the privacy-friendly embed domain. Specify `start` and `end` to scope the segment. YouTube doesn't always honor `end`, so also state the stop time in the page copy.
- If a video has no YouTube URL handy, run `download_video.py <url>` (existing script) — it saves `videos/*.info.json` which has the canonical URL.
- For articles, link out with a clear "Read · about N minutes" framing.

---

## How to add a new lesson — step by step

### 1. Pick a slug and number

The slug is the directory name and the URL segment. Short, lowercase, hyphenated. Examples: `symbols`, `german-aura`, `ai-truth`. The number is just the lesson order on the landing page.

### 2. Create the directory and starter files

```bash
SLUG=your-new-slug
mkdir -p "lessons/$SLUG/assets"
cp docs/lesson-template.html "lessons/$SLUG/index.html"
```

Then create `lessons/$SLUG/assets/$SLUG.css` and `lessons/$SLUG/assets/$SLUG.js` (look at any existing lesson for shape; the template file references these by name).

### 3. Generate the unlock code

Pick a memorable 4–8 character code (uppercase). It should evoke the topic.

```bash
echo -n "YOURCODE" | shasum -a 256
```

Copy the hex digest (first field).

### 4. Add an entry to `lessons.json`

```jsonc
{
  "slug": "your-new-slug",
  "number": 8,
  "title": "Your real lesson title",
  "subtitle": "Category · Subcategory",
  "lockedTeaser": "A one-line tease the student sees while locked.",
  "accent": "#3a6a7c",        // theme color
  "accentSoft": "#d6e3e9",    // soft version for unlocked card bg
  "unlockHash": "<paste sha256 hex here>",
  "href": "lessons/your-new-slug/"
}
```

Insert it in the `lessons` array in the right position. The landing page renders cards in array order. **No other landing-page changes are needed** — the manifest drives everything.

### 5. Write the lesson page

Edit `lessons/$SLUG/index.html` to fill in the sections. Look at the closest existing lesson by topic for theme + interaction inspiration:

- Word-heavy → see `german-schrei`
- Slangy / playful → see `german-aura`
- Math / shape-based → see `sigmoids`
- Essay / discussion-heavy → see `ai-society`
- Make-something → see `art-imagine`
- Linguistic / historic → see `symbols`
- Tech / meta → see `ai-truth`

### 6. Test locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`, type your unlock code on the new card, click into it, walk through every section. Resize to mobile width.

### 7. Commit and push

```bash
git add lessons.json lessons/$SLUG/
git commit -m "lesson $SLUG: add"
git push
```

GitHub Pages picks it up within a minute.

---

## Local testing

```bash
cd /path/to/summer-school-2026
python3 -m http.server 8000
# open http://localhost:8000
```

A few things to check before pushing:

- **Locked state:** new card shows number, subtitle, teaser, unlock button.
- **Unlock:** code works, card flips to unlocked state with full title in the right accent color, click navigates to the lesson page.
- **Lesson page:** YouTube embed loads with the right start/end, vocab tap-to-reveal works, any persisted state survives a page reload.
- **Master code (`OMA2026`)** still unlocks the new lesson too.
- **Reset:** click the site title 5× quickly on the landing → "Reset all unlocks" appears → use it to test the locked flow again.

---

## A few non-obvious things

- **Don't import `assets/css/base.css` from a lesson page.** That's landing-only. Each lesson is self-contained.
- **The back link (`← all lessons`) appears twice** — once at the top, once in the footer. Both are intentional.
- **The `.nojekyll` file at the repo root is required.** It tells GitHub Pages not to run Jekyll, which would otherwise hide files starting with `_`.
- **`tmp/` and `videos/` are gitignored** — don't accidentally place lesson assets there.

---

## See also

- [`lesson-template.html`](./lesson-template.html) — copy this as the starting point for a new lesson page.
- [`../lessons/README.md`](../lessons/README.md) — the source-of-truth list of lessons and weekly rhythm (this is the *teaching plan*, not the website plumbing).
- The seven existing `lessons/*/index.html` files are the best reference for theming and interaction.
