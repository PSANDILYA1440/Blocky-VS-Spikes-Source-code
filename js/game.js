(() => {
  const game = document.querySelector("#game");
  const cat = document.querySelector("#cat");
  const obstacle = document.querySelector("#obstacle");
  const scoreDisplay = document.querySelector("#score");
  const bestDisplay = document.querySelector("#best-score");
  const finalScore = document.querySelector("#final-score");
  const startScreen = document.querySelector("#start-screen");
  const gameOverScreen = document.querySelector("#game-over-screen");
  const startButton = document.querySelector("#start-button");
  const restartButton = document.querySelector("#restart-button");

  const bestKey = "cat-vs-errors-best";
  let running = false;
  let jumping = false;
  let score = 0;
  let startedAt = 0;
  let frameId = 0;
  let speed = 2.2;

  const storedBest = Number.parseInt(localStorage.getItem(bestKey), 10) || 0;
  bestDisplay.textContent = storedBest;

  function resetObstacle() {
    obstacle.classList.remove("is-running");
    obstacle.style.setProperty("--run-duration", speed + "s");
    void obstacle.offsetWidth;
    obstacle.classList.add("is-running");
  }

  function jump() {
    if (!running || jumping) return;
    jumping = true;
    cat.classList.remove("is-jumping");
    void cat.offsetWidth;
    cat.classList.add("is-jumping");
    window.setTimeout(() => { jumping = false; }, 620);
  }

  function rectanglesOverlap(a, b) {
    const inset = 12;
    return a.left + inset < b.right - inset &&
      a.right - inset > b.left + inset &&
      a.top + inset < b.bottom - inset &&
      a.bottom - inset > b.top + inset;
  }

  function update() {
    if (!running) return;

    score = Math.floor((performance.now() - startedAt) / 100);
    scoreDisplay.textContent = score;

    if (rectanglesOverlap(cat.getBoundingClientRect(), obstacle.getBoundingClientRect())) {
      endGame();
      return;
    }
    frameId = requestAnimationFrame(update);
  }

  function startGame() {
    cancelAnimationFrame(frameId);
    running = true;
    jumping = false;
    score = 0;
    speed = 2.2;
    startedAt = performance.now();
    scoreDisplay.textContent = "0";
    startScreen.classList.add("is-hidden");
    gameOverScreen.classList.add("is-hidden");
    cat.classList.remove("is-jumping");
    resetObstacle();
    frameId = requestAnimationFrame(update);
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(frameId);
    obstacle.classList.remove("is-running");
    finalScore.textContent = score;
    const currentBest = Number.parseInt(bestDisplay.textContent, 10) || 0;
    if (score > currentBest) {
      bestDisplay.textContent = score;
      localStorage.setItem(bestKey, String(score));
    }
    gameOverScreen.classList.remove("is-hidden");
  }

  obstacle.addEventListener("animationiteration", () => {
    if (!running) return;
    speed = Math.max(0.72, speed - 0.12);
    obstacle.style.setProperty("--run-duration", speed + "s");
  });

  function handleAction(event) {
    if (event) event.preventDefault();
    if (!running) {
      startGame();
    } else {
      jump();
    }
  }

  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", startGame);
  game.addEventListener("pointerdown", (event) => {
    if (event.target.tagName !== "BUTTON") handleAction(event);
  });
  window.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") handleAction(event);
  });
})();
