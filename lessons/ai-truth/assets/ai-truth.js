// Lesson 7 (ai-truth) — vocab reveal + sparkle toggle + app audit.
(function () {
  // vocab reveal
  for (const term of document.querySelectorAll(".vocab__term")) {
    term.addEventListener("click", () => {
      const row = term.closest(".vocab__row");
      const open = row.classList.toggle("is-open");
      term.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // sparkle toggle — the joke is that this lesson page IS itself sparkly
  const SPARKLE_KEY = "summerSchool2026.lesson.ai-truth.sparkles";
  const toggle = document.getElementById("sparkle-toggle");
  const label = toggle.querySelector(".sparkle-toggle__label");
  const setSparkles = (on) => {
    document.body.classList.toggle("no-sparkles", !on);
    toggle.setAttribute("aria-pressed", on ? "true" : "false");
    label.textContent = on ? "disable sparkles" : "enable sparkles";
    localStorage.setItem(SPARKLE_KEY, on ? "1" : "0");
  };
  const stored = localStorage.getItem(SPARKLE_KEY);
  setSparkles(stored === null ? true : stored === "1");
  toggle.addEventListener("click", () => {
    const on = toggle.getAttribute("aria-pressed") === "true";
    setSparkles(!on);
  });

  // app audit
  const AUDIT_KEY = "summerSchool2026.lesson.ai-truth.audit";
  const rowsEl = document.getElementById("audit-rows");
  const input = document.getElementById("audit-input");
  const addBtn = document.getElementById("audit-add");

  let audit = [];
  try { audit = JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]"); } catch {}

  const VERDICTS = ["useful", "annoying", "invisible"];

  const save = () => localStorage.setItem(AUDIT_KEY, JSON.stringify(audit));

  const render = () => {
    rowsEl.innerHTML = "";
    for (let i = 0; i < audit.length; i++) {
      const entry = audit[i];
      const row = document.createElement("div");
      row.className = "audit__row";

      const name = document.createElement("span");
      name.className = "audit__app";
      name.textContent = entry.name;

      const verdicts = document.createElement("span");
      verdicts.className = "audit__verdicts";
      for (const v of VERDICTS) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "audit__verdict" + (entry.verdict === v ? " is-on" : "");
        btn.dataset.v = v;
        btn.textContent = v;
        btn.addEventListener("click", () => {
          audit[i].verdict = entry.verdict === v ? null : v;
          save(); render();
        });
        verdicts.appendChild(btn);
      }

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "audit__remove";
      remove.textContent = "×";
      remove.title = "remove";
      remove.addEventListener("click", () => {
        audit.splice(i, 1);
        save(); render();
      });

      row.appendChild(name);
      row.appendChild(verdicts);
      row.appendChild(remove);
      rowsEl.appendChild(row);
    }
  };

  const add = () => {
    const name = input.value.trim();
    if (!name) return;
    audit.push({ name, verdict: null });
    input.value = "";
    save(); render();
    input.focus();
  };

  addBtn.addEventListener("click", add);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); add(); } });

  render();
})();
