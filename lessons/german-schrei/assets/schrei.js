// Lektion 6 (german-schrei) — Lyrics-Marker (3 Zustände) + Vokabel-Aufdeckung.
(function () {
  // Vokabel-Aufdeckung
  for (const term of document.querySelectorAll(".vocab__term")) {
    term.addEventListener("click", () => {
      const row = term.closest(".vocab__row");
      const open = row.classList.toggle("is-open");
      term.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Englische Übersetzung: erst verschwommen, beim Antippen scharf.
  for (const en of document.querySelectorAll(".vocab__en")) {
    en.setAttribute("role", "button");
    en.setAttribute("tabindex", "0");
    en.setAttribute("aria-pressed", "false");
    const reveal = () => en.setAttribute("aria-pressed", "true");
    en.addEventListener("click", reveal);
    en.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reveal(); }
    });
  }

  // Lyrics-Marker
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
    const beleid = `${insult} ${insult === 1 ? "Beleidigung" : "Beleidigungen"}`;
    const empa = `${empathy} ${empathy === 1 ? "Empathie" : "Empathien"}`;
    counts.textContent = `${beleid} · ${empa}`;
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
