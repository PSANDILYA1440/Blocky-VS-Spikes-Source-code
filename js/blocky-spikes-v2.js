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
  const soundButton = document.querySelector("#sound-button");

  if (!game || !blocky || !obstacle || !scoreDisplay || !bestDisplay || !finalScore || !startScreen || !gameOverScreen || !startButton || !restartButton || !soundButton) return;

  const bestKey = "blocky-and-the-spikes-best";
  const startSpeed = 3.35;
  const minSpeed = 2.35;
  const speedDrop = 0.025;
  const speedDropEvery = 3;

  let running = false;
  let jumping = false;
  let score = 0;
  let startedAt = 0;
  let frameId = 0;
  let speed = startSpeed;
  let passes = 0;
  let muted = localStorage.getItem("blocky-sound-muted") === "true";
  let audioContext;

  const storedBest = Number.parseInt(localStorage.getItem(bestKey), 10) || 0;
  bestDisplay.textContent = storedBest;
  updateSoundButton();

  function getAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function playTone(frequency, duration, type = "square", volume = 0.08, slideTo) {
    if (muted || !window.AudioContext && !window.webkitAudioContext) return;
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  function playJumpSound() { playTone(330, 0.12, "square", 0.055, 660); }
  function playScoreSound() { playTone(740, 0.08, "square", 0.045, 880); }
  function playCrashSound() { playTone(160, 0.22, "sawtooth", 0.07, 70); }

  function updateSoundButton() {
    soundButton.textContent = muted ? "OFF" : "ON";
    soundButton.setAttribute("aria-label", muted ? "Turn sound on" : "Turn sound off");
    soundButton.title = muted ? "Sound off" : "Sound on";
  }

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
    playJumpSound();
    window.setTimeout(() => { jumping = false; }, 720);
  }

  function rectanglesOverlap(a, b) {
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
  }

  function getBlockyHitBox() {
    const rect = blocky.getBoundingClientRect();
    return {
      left: rect.left + rect.width * 0.16,
      right: rect.right - rect.width * 0.16,
      top: rect.top + rect.height * 0.14,
      bottom: rect.bottom - rect.height * 0.08,
    };
  }

  function getSpikeHitBox() {
    const rect = obstacle.getBoundingClientRect();
    return {
      left: rect.left + rect.width * 0.18,
      right: rect.right - rect.width * 0.18,
      top: rect.top + rect.height * 0.5,
      bottom: rect.bottom - rect.height * 0.08,
    };
  }

  function update() {
    if (!running) return;

    score = Math.floor((performance.now() - startedAt) / 120);
    scoreDisplay.textContent = score;

    if (rectanglesOverlap(getBlockyHitBox(), getSpikeHitBox())) {
      endGame();
      return;
    }

    frameId = requestAnimationFrame(update);
  }

  function startGame() {
    getAudioContext();
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
    playTone(440, 0.08, "square", 0.045, 660);
    frameId = requestAnimationFrame(update);
  }

  function endGame() {
    running = false;
    cancelAnimationFrame(frameId);
    obstacle.classList.remove("is-running");
    finalScore.textContent = score;
    playCrashSound();

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
    playScoreSound();
    if (passes % speedDropEvery === 0) speed = Math.max(minSpeed, speed - speedDrop);
    obstacle.style.setProperty("--run-duration", `${speed}s`);
  });

  function handleAction(event) {
    if (event) event.preventDefault();
    if (!running) startGame();
    else jump();
  }

  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", startGame);
  soundButton.addEventListener("click", (event) => {
    event.stopPropagation();
    muted = !muted;
    localStorage.setItem("blocky-sound-muted", String(muted));
    updateSoundButton();
    if (!muted) playTone(520, 0.08, "square", 0.045, 720);
  });
  game.addEventListener("pointerdown", (event) => {
    if (event.target.tagName !== "BUTTON") handleAction(event);
  });
  window.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") handleAction(event);
  });
})();
