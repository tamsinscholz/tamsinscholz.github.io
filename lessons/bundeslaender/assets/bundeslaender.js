// Lektion 8 (bundeslaender) — Vokabel-Aufdeckung + Spontan-Liste + Quiz + Vergleich.
(function () {
  // -- Vokabel-Aufdeckung -------------------------------------------------
  for (const term of document.querySelectorAll(".vocab__term")) {
    term.addEventListener("click", () => {
      const row = term.closest(".vocab__row");
      const open = row.classList.toggle("is-open");
      term.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // -- Normalisierung für Vergleiche --------------------------------------
  const norm = (s) => (s || "")
    .toLowerCase()
    .trim()
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[\s\-_.]+/g, "");

  // Standardabkürzungen → kanonischer Name.
  const ALIASES = {
    "bw": "Baden-Württemberg",
    "nrw": "Nordrhein-Westfalen",
    "mv": "Mecklenburg-Vorpommern",
    "sh": "Schleswig-Holstein",
    "rlp": "Rheinland-Pfalz",
    "rp": "Rheinland-Pfalz",
  };

  // -- Quiz ----------------------------------------------------------------
  const KEY = "summerSchool2026.lesson.bundeslaender.matched";
  const pool = document.getElementById("pool");
  const stateList = document.getElementById("states");
  const score = document.getElementById("score");
  const resetBtn = document.getElementById("reset");
  if (!pool || !stateList) return;

  const states = [...stateList.querySelectorAll(".state")];
  const stateNames = states.map(s => s.dataset.state);
  const stateNormMap = new Map(stateNames.map(n => [norm(n), n]));

  // Versucht, einen Spontan-Eintrag einem Bundesland zuzuordnen.
  // Gibt den kanonischen Namen oder null zurück.
  const resolveEntry = (raw) => {
    const n = norm(raw);
    if (!n) return null;
    if (stateNormMap.has(n)) return stateNormMap.get(n);
    if (ALIASES[n]) return ALIASES[n];
    return null;
  };

  // -- Spontan-Liste -------------------------------------------------------
  const SPONTAN_KEY = "summerSchool2026.lesson.bundeslaender.spontan";
  const spontanInput = document.getElementById("spontan-input");
  const spontanAdd = document.getElementById("spontan-add");
  const spontanChips = document.getElementById("spontan-chips");
  const spontanCount = document.getElementById("spontan-count");
  const compareBlock = document.getElementById("compare");
  const compareHits = document.getElementById("compare-hits");
  const compareHitList = document.getElementById("compare-hit-list");
  const compareMissList = document.getElementById("compare-miss-list");

  let spontan = [];
  try {
    const raw = localStorage.getItem(SPONTAN_KEY);
    if (raw) spontan = JSON.parse(raw);
    if (!Array.isArray(spontan)) spontan = [];
  } catch {}

  const saveSpontan = () => localStorage.setItem(SPONTAN_KEY, JSON.stringify(spontan));

  const renderSpontan = () => {
    spontanChips.innerHTML = "";
    for (let i = 0; i < spontan.length; i++) {
      const entry = spontan[i];
      const resolved = resolveEntry(entry);
      const li = document.createElement("li");
      li.className = "spontan__chip" + (resolved ? "" : " is-unknown");
      li.textContent = entry;
      const x = document.createElement("button");
      x.type = "button";
      x.className = "spontan__chip-x";
      x.setAttribute("aria-label", `${entry} entfernen`);
      x.textContent = "×";
      x.addEventListener("click", () => {
        spontan.splice(i, 1);
        saveSpontan();
        renderSpontan();
        renderCompare();
      });
      li.appendChild(x);
      spontanChips.appendChild(li);
    }
    spontanCount.textContent = `${spontan.length} aufgeschrieben`;
  };

  const renderCompare = () => {
    if (spontan.length === 0) {
      compareBlock.hidden = true;
      return;
    }
    compareBlock.hidden = false;

    const hits = new Set();
    for (const entry of spontan) {
      const resolved = resolveEntry(entry);
      if (resolved) hits.add(resolved);
    }
    compareHits.textContent = hits.size;

    compareHitList.innerHTML = "";
    for (const name of stateNames) {
      if (!hits.has(name)) continue;
      const li = document.createElement("li");
      li.className = "compare__chip";
      li.textContent = name;
      compareHitList.appendChild(li);
    }

    compareMissList.innerHTML = "";
    for (const name of stateNames) {
      if (hits.has(name)) continue;
      const li = document.createElement("li");
      li.className = "compare__chip";
      li.textContent = name;
      compareMissList.appendChild(li);
    }
  };

  const addSpontan = () => {
    const raw = spontanInput.value.trim();
    if (!raw) return;
    spontan.push(raw);
    spontanInput.value = "";
    saveSpontan();
    renderSpontan();
    renderCompare();
  };

  spontanAdd.addEventListener("click", addSpontan);
  spontanInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addSpontan(); }
  });

  renderSpontan();
  renderCompare();

  // Reichere jede State-Zeile mit Hint + (verstecktem) Hauptstadt/Fakt-Block an.
  for (const state of states) {
    const hint = document.createElement("span");
    hint.className = "state__hint";
    hint.textContent = "Hauptstadt zuordnen";
    state.appendChild(hint);

    const cap = document.createElement("span");
    cap.className = "state__cap";
    cap.textContent = state.dataset.capital;
    state.appendChild(cap);

    const fact = document.createElement("span");
    fact.className = "state__fact";
    fact.textContent = state.dataset.fact;
    state.appendChild(fact);
  }

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  let matched = new Set();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) matched = new Set(JSON.parse(raw));
  } catch {}

  const capitals = states.map(s => s.dataset.capital);
  const uniqueCapitals = [...new Set(capitals)];

  const renderPool = () => {
    pool.innerHTML = "";
    // Welche Hauptstädte sind noch offen? (Stadtstaaten teilen Namen mit dem Bundesland.)
    const placed = new Set([...matched].map(s => {
      const found = states.find(x => x.dataset.state === s);
      return found ? found.dataset.capital : null;
    }).filter(Boolean));
    const remaining = uniqueCapitals.filter(c => !placed.has(c));
    for (const cap of shuffle(remaining)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cap";
      btn.textContent = cap;
      btn.dataset.cap = cap;
      btn.setAttribute("aria-pressed", "false");
      pool.appendChild(btn);
    }
    wireCapButtons();
  };

  let selectedCap = null;

  const clearSelection = () => {
    selectedCap = null;
    for (const b of pool.querySelectorAll(".cap")) {
      b.setAttribute("aria-pressed", "false");
    }
  };

  const wireCapButtons = () => {
    for (const btn of pool.querySelectorAll(".cap")) {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (selectedCap === btn) { clearSelection(); return; }
        clearSelection();
        selectedCap = btn;
        btn.setAttribute("aria-pressed", "true");
      });
    }
  };

  const renderScore = () => {
    const n = matched.size;
    score.textContent = `${n} von ${states.length} richtig`;
    if (n === states.length) {
      score.classList.add("is-done");
      score.textContent = `${n} von ${states.length} richtig · alle gefunden!`;
      resetBtn.hidden = false;
    } else {
      score.classList.remove("is-done");
      resetBtn.hidden = (n === 0);
    }
  };

  const applyMatched = () => {
    for (const state of states) {
      if (matched.has(state.dataset.state)) {
        state.classList.add("is-correct");
      }
    }
  };

  for (const state of states) {
    state.addEventListener("click", () => {
      if (state.classList.contains("is-correct")) return;
      if (!selectedCap) return;
      const guess = selectedCap.dataset.cap;
      if (guess === state.dataset.capital) {
        matched.add(state.dataset.state);
        state.classList.add("is-correct");
        localStorage.setItem(KEY, JSON.stringify([...matched]));
        clearSelection();
        renderPool();
        renderScore();
      } else {
        state.classList.add("is-wrong");
        setTimeout(() => state.classList.remove("is-wrong"), 450);
      }
    });
  }

  resetBtn.addEventListener("click", () => {
    matched = new Set();
    localStorage.removeItem(KEY);
    for (const state of states) state.classList.remove("is-correct");
    clearSelection();
    renderPool();
    renderScore();
  });

  // Klick außerhalb von Chip & Karte → Auswahl löschen.
  document.addEventListener("click", (e) => {
    if (e.target.closest(".cap") || e.target.closest(".state")) return;
    clearSelection();
  });

  applyMatched();
  renderPool();
  renderScore();

  // -- Karten-Quiz ---------------------------------------------------------
  const MAP_KEY = "summerSchool2026.lesson.bundeslaender.map";
  const mapPool = document.getElementById("map-pool");
  const mapScore = document.getElementById("map-score");
  const mapReset = document.getElementById("map-reset");
  const mapHost = document.getElementById("map-host");
  if (!mapPool || !mapHost) return;

  // Karte aus separater SVG-Datei holen und in den Host injecten,
  // damit Klick-Handler und CSS-Selektoren im selben DOM greifen.
  fetch("assets/germany.svg")
    .then((r) => {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    })
    .then((svgText) => {
      // Mögliche XML-Deklaration vor dem <svg> entfernen.
      const svgStart = svgText.indexOf("<svg");
      mapHost.innerHTML = svgStart >= 0 ? svgText.slice(svgStart) : svgText;
      setupMapQuiz();
    })
    .catch((err) => {
      console.error("Karte konnte nicht geladen werden:", err);
      mapHost.textContent = "Karte konnte nicht geladen werden.";
    });

  function setupMapQuiz() {
  const regions = [...mapHost.querySelectorAll(".region")];
  const labels = [...mapHost.querySelectorAll(".region-label")];
  if (regions.length === 0) return;

  let mapMatched = new Set();
  try {
    const raw = localStorage.getItem(MAP_KEY);
    if (raw) mapMatched = new Set(JSON.parse(raw));
  } catch {}

  let selectedNameChip = null;

  const setLabelShown = (name, shown) => {
    const lbl = labels.find(l => l.dataset.for === name);
    if (lbl) lbl.classList.toggle("is-shown", shown);
  };

  const clearMapSelection = () => {
    selectedNameChip = null;
    for (const c of mapPool.querySelectorAll(".cap")) {
      c.setAttribute("aria-pressed", "false");
    }
  };

  const renderMapPool = () => {
    mapPool.innerHTML = "";
    const remaining = stateNames.filter(n => !mapMatched.has(n));
    for (const name of shuffle(remaining)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cap";
      btn.textContent = name;
      btn.dataset.name = name;
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (selectedNameChip === btn) { clearMapSelection(); return; }
        clearMapSelection();
        selectedNameChip = btn;
        btn.setAttribute("aria-pressed", "true");
      });
      mapPool.appendChild(btn);
    }
  };

  const renderMapScore = () => {
    const n = mapMatched.size;
    mapScore.textContent = `${n} von ${regions.length} platziert`;
    if (n === regions.length) {
      mapScore.classList.add("is-done");
      mapScore.textContent = `${n} von ${regions.length} platziert · alle gefunden!`;
      mapReset.hidden = false;
    } else {
      mapScore.classList.remove("is-done");
      mapReset.hidden = (n === 0);
    }
  };

  const applyMapMatched = () => {
    for (const r of regions) {
      const name = r.dataset.state;
      if (mapMatched.has(name)) {
        r.classList.add("is-correct");
        setLabelShown(name, true);
      }
    }
  };

  for (const region of regions) {
    region.addEventListener("click", (e) => {
      e.stopPropagation();
      if (region.classList.contains("is-correct")) return;
      if (!selectedNameChip) return;
      const guess = selectedNameChip.dataset.name;
      const target = region.dataset.state;
      if (guess === target) {
        mapMatched.add(target);
        region.classList.add("is-correct");
        setLabelShown(target, true);
        localStorage.setItem(MAP_KEY, JSON.stringify([...mapMatched]));
        clearMapSelection();
        renderMapPool();
        renderMapScore();
      } else {
        region.classList.add("is-wrong");
        setTimeout(() => region.classList.remove("is-wrong"), 450);
      }
    });
  }

  mapReset.addEventListener("click", () => {
    mapMatched = new Set();
    localStorage.removeItem(MAP_KEY);
    for (const r of regions) r.classList.remove("is-correct");
    for (const l of labels) l.classList.remove("is-shown");
    clearMapSelection();
    renderMapPool();
    renderMapScore();
  });

  // Klick außerhalb → Auswahl löschen.
  document.addEventListener("click", (e) => {
    if (e.target.closest("#map-pool") || e.target.closest(".map")) return;
    clearMapSelection();
  });

  applyMapMatched();
  renderMapPool();
  renderMapScore();
  }
})();
