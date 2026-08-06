---
name: add-lesson
description: Add a new lesson to the Summer School 2026 site. Use when the user wants to create/add a lesson (e.g. "add a lesson about X", "create the next lesson").
---

Read `docs/README.md` (the authoring guide) and `lessons/README.md` (the teaching plan), and look at 1–2 existing `lessons/*/index.html` closest in style. Then add a new lesson following those conventions exactly.

Gather these from the user first — ask if missing, don't invent (especially the media URL):

- **Lesson:** one-paragraph description of the topic and angle — what should she come away understanding?
- **Category/subtitle:** e.g. "Deutsch · Geschichte"
- **Media:** YouTube URL + start/end timestamps to scope, or an article link — or find a good one and propose it before building.
- **Slug / number:** `<slug>` / next number (check `lessons.json`).
- **Unlock code:** a memorable 4–8 char uppercase code; regenerate its `unlockHash` with `echo -n "CODE" | shasum -a 256` and confirm the master code `OMA2026` still unlocks it.

Match the required section structure, content-not-function headings, tap-to-reveal vocab, and a distinct visual theme (own CSS/JS, don't import the landing `base.css`). Then run `python3 -m http.server 8000`, walk through the locked → unlock → full-page flow, and verify vocab reveal + any persisted state survives reload. Show me the result before committing; don't push.
