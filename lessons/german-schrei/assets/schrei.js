// Lesson 6 (german-schrei) — clickable lyric highlighter (3 states) + vocab reveal.
(function () {
  // vocab reveal (shared pattern)
  for (const term of document.querySelectorAll(".vocab__term")) {
    term.addEventListener("click", () => {
      const row = term.closest(".vocab__row");
      const open = row.classList.toggle("is-open");
      term.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // lyric highlighter
  const KEY = "summerSchool2026.lesson.german-schrei.marks";
  const counts = document.getElementById("counts");
  const lines = document.querySelectorAll(".lyric[data-i]");

  let state = {};
  try { state = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch {}

  const order = ["", "insult", "empathy"];

  const updateCounts = () => {
    let insult = 0, empathy = 0;
    for (const v of Object.values(state)) {
      if (v === "insult") insult++;
      else if (v === "empathy") empathy++;
    }
    counts.textContent = `${insult} insult · ${empathy} empathy`;
  };

  const apply = (line) => {
    const i = line.dataset.i;
    const mark = state[i];
    if (mark) line.dataset.mark = mark;
    else line.removeAttribute("data-mark");
  };

  for (const line of lines) {
    apply(line);
    line.addEventListener("click", () => {
      const i = line.dataset.i;
      const current = state[i] || "";
      const next = order[(order.indexOf(current) + 1) % order.length];
      if (next) state[i] = next;
      else delete state[i];
      apply(line);
      localStorage.setItem(KEY, JSON.stringify(state));
      updateCounts();
    });
  }
  updateCounts();
})();
