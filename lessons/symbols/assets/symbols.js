// Lesson 1 (symbols) — interactive bits.
(function () {
  // --- Scavenger hunt: persist checked state in localStorage ---
  const STORAGE_KEY = "summerSchool2026.lesson.symbols.hunt";
  const list = document.getElementById("hunt");
  const counter = document.getElementById("hunt-count");

  if (list) {
    const boxes = [...list.querySelectorAll('input[type="checkbox"]')];
    const total = boxes.length;

    const load = () => {
      try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); }
      catch { return new Set(); }
    };
    const state = load();
    const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify([...state]));
    const updateCount = () => {
      counter.textContent = `${state.size} of ${total} found`;
    };

    for (const box of boxes) {
      if (state.has(box.dataset.key)) box.checked = true;
      box.addEventListener("change", () => {
        if (box.checked) state.add(box.dataset.key);
        else state.delete(box.dataset.key);
        save();
        updateCount();
      });
    }
    updateCount();
  }

  // --- Vocabulary: tap to reveal definition ---
  for (const term of document.querySelectorAll(".vocab__term")) {
    term.addEventListener("click", () => {
      const row = term.closest(".vocab__row");
      const open = row.classList.toggle("is-open");
      term.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
})();
