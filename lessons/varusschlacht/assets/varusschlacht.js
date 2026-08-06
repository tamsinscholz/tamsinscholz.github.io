// Lektion 9 (varusschlacht) — interaktive Teile.
(function () {

  // --- Wortschatz: antippen zum Aufdecken ---
  for (const term of document.querySelectorAll(".vocab__term")) {
    term.addEventListener("click", () => {
      const row = term.closest(".vocab__row");
      const open = row.classList.toggle("is-open");
      term.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // --- Solo-Aufgabe: Ereignisse in die richtige Reihenfolge bringen ---
  const STORAGE_KEY = "summerSchool2026.lesson.varusschlacht.trap";

  // id = korrekte Position (1..6). text = Ereignis.
  const EVENTS = [
    { id: 1, text: "Arminius wächst in Rom auf, wird zum römischen Offizier ausgebildet — und zu Varus’ Vertrautem." },
    { id: 2, text: "Der Fürst Segestes warnt Varus: „Arminius plant Verrat.“ Varus glaubt ihm nicht." },
    { id: 3, text: "Arminius erfindet einen kleinen Aufstand, um Varus von der sicheren Route wegzulocken." },
    { id: 4, text: "Die römische Kolonne zieht 15–20 km lang durch unbekannten Wald — bei Sturm und Dauerregen." },
    { id: 5, text: "Aus dem Hinterhalt greifen Arminius’ Krieger an; der aufgeweichte Boden lähmt die schweren Römer." },
    { id: 6, text: "Drei Legionen werden vernichtet. Varus stürzt sich in sein eigenes Schwert." },
  ];

  const pool    = document.getElementById("trap-pool");
  const slots   = document.getElementById("trap-slots");
  const checkBtn = document.getElementById("trap-check");
  const resetBtn = document.getElementById("trap-reset");
  const status  = document.getElementById("trap-status");
  const payoff  = document.getElementById("trap-payoff");

  if (!pool || !slots) return;

  const total = EVENTS.length;
  const byId = new Map(EVENTS.map(e => [e.id, e]));
  let placed = load();          // Array von ids in gewählter Reihenfolge

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return raw.filter(id => byId.has(id));
    } catch { return []; }
  }
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(placed)); }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // Stabile, gemischte Anzeige-Reihenfolge für den Pool.
  const poolOrder = shuffle(EVENTS.map(e => e.id));

  function makeCard(ev) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "trap__card";
    btn.textContent = ev.text;
    btn.addEventListener("click", () => { placed.push(ev.id); save(); render(); });
    return btn;
  }
  function makeSlot(ev, index) {
    const li = document.createElement("li");
    const span = document.createElement("span");
    span.className = "trap__card-text";
    span.textContent = ev.text;
    li.appendChild(span);
    li.title = "zurück in den Vorrat";
    li.addEventListener("click", () => { placed.splice(index, 1); save(); render(); });
    return li;
  }

  function render() {
    // Pool: alle noch nicht gesetzten Karten, in stabiler gemischter Reihenfolge.
    pool.innerHTML = "";
    for (const id of poolOrder) {
      if (!placed.includes(id)) pool.appendChild(makeCard(byId.get(id)));
    }
    // Slots: gesetzte Karten in gewählter Reihenfolge.
    slots.innerHTML = "";
    placed.forEach((id, i) => slots.appendChild(makeSlot(byId.get(id), i)));

    status.textContent = `${placed.length} von ${total} gesetzt`;
    checkBtn.disabled = placed.length !== total;
    resetBtn.hidden = placed.length === 0;
    payoff.hidden = true;
    status.classList.remove("is-hidden");
  }

  checkBtn.addEventListener("click", () => {
    const lis = [...slots.children];
    let allRight = true;
    placed.forEach((id, i) => {
      const right = id === (i + 1);   // korrekte Position ist id === Slot-Nummer
      lis[i].classList.toggle("is-right", right);
      lis[i].classList.toggle("is-wrong", !right);
      if (!right) allRight = false;
    });
    if (allRight) {
      payoff.hidden = false;
      status.textContent = "Alle sechs stimmen. So schnappte die Falle zu.";
      payoff.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      status.textContent = "Noch nicht ganz — die roten Karten sitzen falsch. Tipp sie an und versuch’s neu.";
    }
  });

  resetBtn.addEventListener("click", () => { placed = []; save(); render(); });

  render();
})();
