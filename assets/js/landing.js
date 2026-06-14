// Summer School 2026 — landing page logic.
// Loads lessons.json, renders cards, handles per-lesson and master unlock codes,
// persists unlocked slugs in localStorage.

(async function () {
  const grid = document.getElementById("lesson-grid");
  const template = document.getElementById("card-template");
  const resetHint = document.getElementById("reset-hint");
  const resetBtn = document.getElementById("reset-btn");
  const title = document.getElementById("site-title");

  let manifest;
  try {
    const res = await fetch("lessons.json", { cache: "no-store" });
    manifest = await res.json();
  } catch (err) {
    grid.textContent = "Could not load lessons.";
    console.error(err);
    return;
  }

  const STORAGE_KEY = manifest.storageKey || "summerSchool2026.unlocked";

  // --- storage --------------------------------------------------
  const loadUnlocked = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  };
  const saveUnlocked = (set) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  };
  const unlocked = loadUnlocked();

  // --- crypto ---------------------------------------------------
  const sha256 = async (text) => {
    const buf = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
  };

  // --- rendering ------------------------------------------------
  const cards = new Map(); // slug -> { article, lesson }

  for (const lesson of manifest.lessons) {
    const frag = template.content.cloneNode(true);
    const article = frag.querySelector(".card");
    article.dataset.slug = lesson.slug;
    article.style.setProperty("--accent", lesson.accent);
    article.style.setProperty("--accent-soft", lesson.accentSoft || lesson.accent + "22");

    // locked face
    const lockedFace = article.querySelector(".card__face--locked");
    lockedFace.querySelector(".card__number").textContent = `Lesson ${lesson.number}`;
    lockedFace.querySelector(".card__subtitle").textContent = lesson.subtitle || "";
    lockedFace.querySelector(".card__teaser").textContent = lesson.lockedTeaser || "";

    // unlocked face
    const unlockedFace = article.querySelector(".card__face--unlocked");
    unlockedFace.href = lesson.href;
    unlockedFace.querySelector(".card__number").textContent = `Lesson ${lesson.number}`;
    unlockedFace.querySelector(".card__subtitle").textContent = lesson.subtitle || "";
    unlockedFace.querySelector(".card__title").textContent = lesson.title;

    // unlock interaction wiring
    const unlockBtn = lockedFace.querySelector(".card__unlock");
    const form = lockedFace.querySelector(".card__form");
    const input = lockedFace.querySelector(".card__input");

    unlockBtn.addEventListener("click", () => {
      unlockBtn.hidden = true;
      form.hidden = false;
      input.focus();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = input.value.trim().toUpperCase();
      if (!code) return;
      const h = await sha256(code);
      if (h === lesson.unlockHash) {
        unlock(lesson.slug, { celebrate: true });
      } else if (h === manifest.masterCodeHash) {
        for (const l of manifest.lessons) unlock(l.slug, { celebrate: l.slug === lesson.slug });
      } else {
        article.classList.add("is-wrong");
        setTimeout(() => article.classList.remove("is-wrong"), 400);
        input.select();
      }
    });

    grid.appendChild(article);
    cards.set(lesson.slug, { article, lesson });

    if (unlocked.has(lesson.slug)) {
      article.dataset.state = "unlocked";
    }
  }

  function unlock(slug, opts = {}) {
    const entry = cards.get(slug);
    if (!entry) return;
    if (!unlocked.has(slug)) {
      unlocked.add(slug);
      saveUnlocked(unlocked);
    }
    entry.article.dataset.state = "unlocked";
    if (opts.celebrate) {
      entry.article.classList.add("is-just-unlocked");
      setTimeout(() => entry.article.classList.remove("is-just-unlocked"), 600);
    }
  }

  // --- reset affordance: 5 quick clicks on the title -----------
  let clicks = 0, clickTimer;
  title.addEventListener("click", () => {
    clicks++;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clicks = 0; }, 1200);
    if (clicks >= 5) {
      resetHint.hidden = false;
      clicks = 0;
    }
  });
  resetBtn?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
})();
