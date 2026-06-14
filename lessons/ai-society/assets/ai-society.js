// Lesson 4 (ai-society) — vocab reveal + persist the 3-sentence thought builder.
(function () {
  for (const term of document.querySelectorAll(".vocab__term")) {
    term.addEventListener("click", () => {
      const row = term.closest(".vocab__row");
      const open = row.classList.toggle("is-open");
      term.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  const KEY = "summerSchool2026.lesson.ai-society.thought";
  const inputs = ["t1", "t2", "t3"].map(id => document.getElementById(id));
  const saveBtn = document.getElementById("thought-save");
  const saved = document.getElementById("thought-saved");
  if (!saveBtn) return;

  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "{}");
    inputs.forEach(i => { if (i && data[i.id]) i.value = data[i.id]; });
  } catch {}

  saveBtn.addEventListener("click", () => {
    const data = {};
    inputs.forEach(i => { if (i) data[i.id] = i.value; });
    localStorage.setItem(KEY, JSON.stringify(data));
    saved.hidden = false;
    setTimeout(() => { saved.hidden = true; }, 2000);
  });
})();
