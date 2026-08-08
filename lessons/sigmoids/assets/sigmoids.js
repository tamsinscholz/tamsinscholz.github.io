// Lesson 3 (sigmoids) — curve + vocab reveal, plus ghost variants on hover.
(function () {
  // Ghost curves are drawn in the same 100x100 viewBox as the real curve, and
  // all of them start at the origin (bottom-left) so the family shares a root.
  const SVG_NS = "http://www.w3.org/2000/svg";
  const X0 = 0, Y0 = 100;

  const DRAW_MS = 1680;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const rand = (lo, hi) => lo + Math.random() * (hi - lo);

  // Sample f(t) for t in 0..1, where f returns "how much" from 0 (none) to 1 (the
  // top of the box). A curve that reaches the top early stops there rather than
  // running along the ceiling, so steep variants leave the frame like real ones.
  function samplePath(f) {
    const points = [];
    let prev = null;
    for (let i = 0; i <= 48; i++) {
      const t = i / 48;
      const v = f(t);
      if (v >= 1) {
        // Interpolate the exact crossing so the line ends flush with the top edge,
        // unless rounding would collapse it onto the point we just emitted.
        const tHit = prev ? prev.t + (1 - prev.v) / (v - prev.v) * (t - prev.t) : t;
        const x = X0 + tHit * 100;
        const last = points[points.length - 1];
        if (!last || x - last[0] > 0.1) points.push([x, Y0 - 100]);
        break;
      }
      points.push([X0 + t * 100, Y0 - v * 100]);
      prev = { t, v };
    }
    return "M " + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ");
  }

  // Each hover re-rolls the family, so consecutive hovers show different siblings.
  // Slopes/rates are drawn from bands to keep the four variants visibly distinct.
  const VARIANTS = {
    // Straight lines from the origin. The last two are steeper than the archetype
    // (slope 1, corner to corner) and so run off the top of the box.
    linear: () =>
      [[0.25, 0.45], [0.55, 0.85], [1.15, 1.6], [1.9, 3]].map(([lo, hi]) => {
        const slope = rand(lo, hi);
        return samplePath((t) => t * slope);
      }),
    // Exponentials from the origin, differing in how hard and how early they take off.
    exponential: () =>
      [[1.8, 2.8], [3.2, 4.2], [4.8, 6], [6.5, 8.5]].map(([lo, hi]) => {
        const k = rand(lo, hi);
        const top = rand(0.85, 1.1);
        return samplePath((t) => ((Math.exp(k * t) - 1) / (Math.exp(k) - 1)) * top);
      }),
    // S-curves from the origin, differing in steepness, where they bend, and how
    // high the ceiling sits.
    sigmoid: () =>
      [[0.3, 0.4], [0.42, 0.52], [0.54, 0.64], [0.66, 0.76]].map(([lo, hi]) => {
        const mid = rand(lo, hi);
        const k = rand(7, 15);
        const top = rand(0.75, 0.97);
        const s = (t) => 1 / (1 + Math.exp(-k * (t - mid)));
        const base = s(0), peak = s(1);
        return samplePath((t) => ((s(t) - base) / (peak - base)) * top);
      }),
  };

  for (const figure of document.querySelectorAll(".curve")) {
    const svg = figure.querySelector("svg");
    const build = VARIANTS[figure.dataset.curve];
    if (!svg || !build) continue;

    // Bumped on every show/hide; a stale draw sequence sees the change and stops.
    let run = 0;

    const addGhost = (d) => {
      const ghost = document.createElementNS(SVG_NS, "path");
      ghost.setAttribute("class", "curve__ghost");
      ghost.setAttribute("d", d);
      // Insert first so ghosts sit behind the real curve.
      svg.insertBefore(ghost, svg.firstChild);
      return ghost;
    };

    const hide = () => {
      run++;
      for (const ghost of svg.querySelectorAll(".curve__ghost")) ghost.remove();
    };

    const show = () => {
      hide();
      const mine = run;
      const paths = build();

      if (reduceMotion.matches) {
        for (const d of paths) addGhost(d);
        return;
      }

      // Draw one variant left to right, then start the next when it finishes.
      const drawNext = (i) => {
        if (run !== mine || i >= paths.length) return;
        const ghost = addGhost(paths[i]);
        const len = ghost.getTotalLength();
        ghost.style.strokeDasharray = len;
        ghost.style.strokeDashoffset = len;
        ghost.getBoundingClientRect(); // flush layout so the transition takes
        ghost.style.transition = `stroke-dashoffset ${DRAW_MS}ms ease`;
        ghost.style.strokeDashoffset = "0";
        setTimeout(() => drawNext(i + 1), DRAW_MS);
      };
      drawNext(0);
    };

    figure.addEventListener("pointerenter", show);
    figure.addEventListener("pointerleave", hide);
    figure.addEventListener("focusin", show);
    figure.addEventListener("focusout", hide);
  }

  for (const term of document.querySelectorAll(".curve__term")) {
    term.addEventListener("click", () => {
      const curve = term.closest(".curve");
      const open = curve.classList.toggle("is-open");
      term.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  for (const term of document.querySelectorAll(".vocab__term")) {
    term.addEventListener("click", () => {
      const row = term.closest(".vocab__row");
      const open = row.classList.toggle("is-open");
      term.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
})();
