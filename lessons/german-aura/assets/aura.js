// Lesson 2 (german-aura) — vocab chip toggles + persist caption draft.
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

  // vocab words to count — must match data-de attrs on chips.
  const VOCAB = [...document.querySelectorAll(".chip")].map(c => c.dataset.de.toLowerCase());

  const wordsUsed = (text) => {
    const t = text.toLowerCase();
    return VOCAB.filter(w => t.includes(w)).length;
  };
  const render = () => {
    counter.textContent = `${wordsUsed(ta.value)} vocab word${wordsUsed(ta.value) === 1 ? "" : "s"} used`;
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
