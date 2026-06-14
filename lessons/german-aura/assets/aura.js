// Lektion 2 (german-aura) — Vokabel-Chips + Caption-Entwurf speichern.
(function () {
  for (const chip of document.querySelectorAll(".chip")) {
    chip.addEventListener("click", () => {
      const open = chip.getAttribute("aria-expanded") === "true";
      chip.setAttribute("aria-expanded", open ? "false" : "true");
    });
  }

  const KEY = "summerSchool2026.lesson.german-aura.caption";
  const ta = document.getElementById("caption");
  const counter = document.getElementById("caption-count");
  const saveBtn = document.getElementById("caption-save");
  const savedNote = document.getElementById("caption-saved");
  if (!ta) return;

  // Vokabeln zum Mitzählen — muss zu data-de der Chips passen.
  const VOCAB = [...document.querySelectorAll(".chip")].map(c => c.dataset.de.toLowerCase());

  const wordsUsed = (text) => {
    const t = text.toLowerCase();
    return VOCAB.filter(w => t.includes(w)).length;
  };
  const render = () => {
    const n = wordsUsed(ta.value);
    counter.textContent = `${n} ${n === 1 ? "Vokabel" : "Vokabeln"} benutzt`;
  };

  ta.value = localStorage.getItem(KEY) || "";
  render();
  ta.addEventListener("input", render);
  saveBtn.addEventListener("click", () => {
    localStorage.setItem(KEY, ta.value);
    savedNote.hidden = false;
    setTimeout(() => { savedNote.hidden = true; }, 2000);
  });
})();
