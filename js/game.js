(() => {
  const game = document.querySelector("#game");
  const blocky = document.querySelector("#blocky");
  const obstacle = document.querySelector("#obstacle");
  const scoreDisplay = document.querySelector("#score");
  const bestDisplay = document.querySelector("#best-score");
  const finalScore = document.querySelector("#final-score");
  const startScreen = document.querySelector("#start-screen");
  const gameOverScreen = document.querySelector("#game-over-screen");
  const startButton = document.querySelector("#start-button");
  const restartButton = document.querySelector("#restart-button");

  const bestKey = "blocky-and-the-spikes-best";
  const startSpeed = 3.05;
  const minSpeed = 2.05;
  const speedDrop = 0.04;
  const speedDropEvery = 2;

  let running = false;
  let jumping = false;
  let score = 0;
  let startedAt = 0;
  let frameId = 0;
  let speed = startSpeed;
  let passes = 0;

  const storedBest = Number.parseInt(localStorage.getItem(bestKey), 10) || 0;
  bestDisplay.textContent = storedBest;

  function resetObstacle() {
    obstacle.classList.remove("is-running");
    obstacle.style.setProperty("--run-duration", `${speed}s`);
    void obstacle.offsetWidth;
    obstacle.classList.add("is-running");
  }

  function jump() {
    if (!running || jumping) return;
    jumping = true;
    blocky.classList.remove("is-jumping");
    void blocky.offsetWidth;
    blocky.classList.add("is-jumping");
    window.setTimeout(() => {
      jumping = false;
    }, 720);
  }

  function rectanglesOverlap(a, b) {
    const inset = 18;
    return a.left + inset < b.right - inset &&
      a.right - inset > b.left + inset &&
      a.top + inset < b.bottom - inset &&
      a.bottom - inset > b.top + inset;
  }

  function getSpikeHitBox() {
    const rect = obstacle.getBoundingClientRect();
    return {
      left: rect.left + 22,
      right: rect.right - 22,
      top: rect.top + rect.height * 0.34,
      bottom: rect.bottom - 8,
    };
  }

  function update() {
    if (!running) return;

    score = Math.floor((performance.now() - startedAt) / 100);
    scoreDisplay.textContent = score;

    if (rectanglesOverlap(blocky.getBoundingClientRect(), getSpikeHitBox())) {
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
    speed = startSpeed;
    passes = 0;
    startedAt = performance.now();
    scoreDisplay.textContent = "0";
    startScreen.classList.add("is-hidden");
    gameOverScreen.classList.add("is-hidden");
    blocky.classList.remove("is-jumping");
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
    passes += 1;
    if (passes % speedDropEvery === 0) {
      speed = Math.max(minSpeed, speed - speedDrop);
    }
    obstacle.style.setProperty("--run-duration", `${speed}s`);
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
    if (event.code === "Space" || event.code === "ArrowUp") {
      handleAction(event);
    }
  });
})();
