// Lesson 5 (art-imagine) — 15-minute countdown timer.
(function () {
  const display = document.getElementById("timer-display");
  const startBtn = document.getElementById("timer-start");
  const resetBtn = document.getElementById("timer-reset");
  if (!display) return;

  const TOTAL = 15 * 60;
  let remaining = TOTAL;
  let interval = null;

  const format = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const render = () => {
    display.textContent = format(Math.max(0, remaining));
    display.classList.toggle("is-warning", remaining > 0 && remaining <= 60);
    display.classList.toggle("is-done", remaining <= 0);
  };

  const stop = () => {
    clearInterval(interval);
    interval = null;
  };

  startBtn.addEventListener("click", () => {
    if (interval) {
      stop();
      startBtn.textContent = "Resume";
    } else {
      interval = setInterval(() => {
        remaining -= 1;
        render();
        if (remaining <= 0) {
          stop();
          startBtn.textContent = "Done";
          startBtn.disabled = true;
          // gentle attention without an actual audio file
          if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
        }
      }, 1000);
      startBtn.textContent = "Pause";
      resetBtn.hidden = false;
    }
  });

  resetBtn.addEventListener("click", () => {
    stop();
    remaining = TOTAL;
    render();
    startBtn.textContent = "Start the 15";
    startBtn.disabled = false;
    resetBtn.hidden = true;
  });

  render();
})();
