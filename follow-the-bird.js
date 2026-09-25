(() => {
  const arena = document.getElementById("followBirdArena");
  const bird = document.getElementById("followBirdBird");

  const startPanel = document.getElementById("followBirdStartPanel");
  const startButton = document.getElementById("followBirdStartButton");

  const resultPanel = document.getElementById("followBirdResultPanel");
  const resultRating = document.getElementById("followBirdResultRating");
  const resultScore = document.getElementById("followBirdResultScore");
  const resultMessage = document.getElementById("followBirdResultMessage");
  const playAgainButton = document.getElementById("followBirdPlayAgainButton");

  const timeDisplay = document.getElementById("followBirdTime");
  const trackingDisplay = document.getElementById("followBirdTracking");
  const speedDisplay = document.getElementById("followBirdSpeed");

  const homeButton = document.getElementById("followBirdHomeButton");
  const soundButton = document.getElementById("followBirdSoundButton");
  const flapAudio = document.getElementById("followBirdFlapAudio");
  const successAudio = document.getElementById("followBirdSuccessAudio");

  let soundOn = true;

  function updateSoundButton() {
    if (!soundButton) {
      return;
    }

    soundButton.textContent = soundOn ? "🔊" : "🔇";
    soundButton.setAttribute(
      "aria-label",
      soundOn ? "Sound on" : "Sound off"
    );
    soundButton.title = soundOn ? "Sound on" : "Sound off";
    soundButton.setAttribute("aria-pressed", String(soundOn));
  }

  if (
    !arena ||
    !bird ||
    !startPanel ||
    !startButton ||
    !resultPanel
  ) {
    return;
  }

  const ROUND_LENGTH = 60;

  const MIN_SPEED = 65;
  const START_SPEED = 95;
  const MAX_SPEED = 380;

  const EXCELLENT_DISTANCE = 55;
  const GOOD_DISTANCE = 90;
  const TRACKING_DISTANCE = 135;

  let running = false;
  let animationFrame = null;

  let startTime = 0;
  let lastFrameTime = 0;
  let lastAdaptTime = 0;

  let pointerX = null;
  let pointerY = null;

  let birdX = 0;
  let birdY = 0;

  let targetX = 0;
  let targetY = 0;

  let currentSpeed = START_SPEED;



  let totalTrackingSamples = 0;
  let closeTrackingSamples = 0;
  let excellentSamples = 0;

  let distanceSum = 0;

  let recentSamples = [];

  let settledSpeedSum = 0;
  let settledSpeedSamples = 0;

  let recoveryStart = null;
  let recoveryTimes = [];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.hypot(dx, dy);
  }

  function getArenaSize() {
    return {
      width: arena.clientWidth,
      height: arena.clientHeight
    };
  }

  function getBirdSize() {
    return {
      width: bird.offsetWidth || 90,
      height: bird.offsetHeight || 65
    };
  }

  function getBirdCenter() {
    const size = getBirdSize();

    return {
      x: birdX + size.width / 2,
      y: birdY + size.height / 2
    };
  }

  function chooseTarget() {
    const arenaSize = getArenaSize();
    const birdSize = getBirdSize();

    const paddingX = Math.max(35, birdSize.width * 0.45);
    const paddingY = Math.max(30, birdSize.height * 0.45);

    targetX =
      paddingX +
      Math.random() *
        Math.max(
          1,
          arenaSize.width - birdSize.width - paddingX * 2
        );

    targetY =
      paddingY +
      Math.random() *
        Math.max(
          1,
          arenaSize.height - birdSize.height - paddingY * 2
        );
  }

  function placeBird() {
    bird.style.transform =
      `translate3d(${birdX}px, ${birdY}px, 0)`;
  }

  function resetBirdPosition() {
    const arenaSize = getArenaSize();
    const birdSize = getBirdSize();

    birdX = Math.max(
      20,
      arenaSize.width / 2 - birdSize.width / 2
    );

    birdY = Math.max(
      20,
      arenaSize.height / 2 - birdSize.height / 2
    );

    chooseTarget();
    placeBird();
  }

  function updateSpeedLabel() {
    let label = "Slow";

    if (currentSpeed >= 310) {
      label = "Lightning Speed";
    } else if (currentSpeed >= 240) {
      label = "Very Fast";
    } else if (currentSpeed >= 185) {
      label = "Fast";
    } else if (currentSpeed >= 125) {
      label = "Medium";
    }

    speedDisplay.textContent = label;
  }

  function recordTrackingSample() {
    if (pointerX === null || pointerY === null) {
      return;
    }

    const birdCenter = getBirdCenter();

    const pointerDistance = distance(
      pointerX,
      pointerY,
      birdCenter.x,
      birdCenter.y
    );

    totalTrackingSamples += 1;
    distanceSum += pointerDistance;

    const isTracking =
      pointerDistance <= TRACKING_DISTANCE;

    const isExcellent =
      pointerDistance <= EXCELLENT_DISTANCE;

    if (isTracking) {
      closeTrackingSamples += 1;
    }

    if (isExcellent) {
      excellentSamples += 1;
    }

    recentSamples.push({
      distance: pointerDistance,
      tracking: isTracking
    });

    if (recentSamples.length > 90) {
      recentSamples.shift();
    }

    if (pointerDistance > TRACKING_DISTANCE) {
      if (recoveryStart === null) {
        recoveryStart = performance.now();
      }
    } else if (recoveryStart !== null) {
      const recoveryTime =
        (performance.now() - recoveryStart) / 1000;

      recoveryTimes.push(recoveryTime);
      recoveryStart = null;
    }

    const trackingPercent =
      totalTrackingSamples > 0
        ? Math.round(
            (closeTrackingSamples / totalTrackingSamples) *
              100
          )
        : 0;

    trackingDisplay.textContent =
      `${trackingPercent}%`;
  }

  function adaptSpeed(now) {
    if (now - lastAdaptTime < 2500) {
      return;
    }

    lastAdaptTime = now;

    if (recentSamples.length < 15) {
      return;
    }

    const averageDistance =
      recentSamples.reduce(
        (sum, sample) => sum + sample.distance,
        0
      ) / recentSamples.length;

    const trackingRate =
      recentSamples.filter(sample => sample.tracking).length /
      recentSamples.length;

    if (
      averageDistance <= EXCELLENT_DISTANCE &&
      trackingRate >= 0.9
    ) {
      currentSpeed += 18;
    } else if (
      averageDistance <= GOOD_DISTANCE &&
      trackingRate >= 0.78
    ) {
      currentSpeed += 10;
    } else if (
      averageDistance > TRACKING_DISTANCE ||
      trackingRate < 0.55
    ) {
      currentSpeed -= 18;
    } else if (
      averageDistance > GOOD_DISTANCE &&
      trackingRate < 0.7
    ) {
      currentSpeed -= 8;
    }

    currentSpeed = clamp(
      currentSpeed,
      MIN_SPEED,
      MAX_SPEED
    );

    settledSpeedSum += currentSpeed;
    settledSpeedSamples += 1;

    updateSpeedLabel();

    recentSamples = [];
  }

  function updateBird(deltaSeconds) {
    const dx = targetX - birdX;
    const dy = targetY - birdY;

    const targetDistance = Math.hypot(dx, dy);

    if (targetDistance < 35) {
      chooseTarget();
      return;
    }

    const directionX = dx / targetDistance;
    const directionY = dy / targetDistance;

    const moveDistance =
      currentSpeed * deltaSeconds;

    birdX += directionX * moveDistance;
    birdY += directionY * moveDistance;

    const birdVisual =
      bird.querySelector(".code-bird-visual");

    if (birdVisual) {
      if (directionX < -0.05) {
        birdVisual.classList.add("facing-left");
      } else if (directionX > 0.05) {
        birdVisual.classList.remove("facing-left");
      }
    }

    placeBird();
  }

  function updateTimer(now) {
    const elapsed =
      (now - startTime) / 1000;

    const remaining =
      Math.max(0, ROUND_LENGTH - elapsed);

    timeDisplay.textContent =
      `0:${Math.ceil(remaining)
        .toString()
        .padStart(2, "0")}`;

    return remaining;
  }

  function getFinalScore() {
    if (totalTrackingSamples === 0) {
      return 0;
    }

    const trackingRate =
      closeTrackingSamples / totalTrackingSamples;

    const excellentRate =
      excellentSamples / totalTrackingSamples;

    const averageDistance =
      distanceSum / totalTrackingSamples;

    const distanceScore =
      clamp(
        1 - averageDistance / 220,
        0,
        1
      );

    const averageAdaptiveSpeed =
      settledSpeedSamples > 0
        ? settledSpeedSum / settledSpeedSamples
        : currentSpeed;

    const speedScore =
      clamp(
        (averageAdaptiveSpeed - MIN_SPEED) /
          (MAX_SPEED - MIN_SPEED),
        0,
        1
      );

    let recoveryScore = 1;

    if (recoveryTimes.length > 0) {
      const averageRecovery =
        recoveryTimes.reduce(
          (sum, value) => sum + value,
          0
        ) / recoveryTimes.length;

      recoveryScore =
        clamp(
          1 - averageRecovery / 4,
          0,
          1
        );
    }

    const score =
      trackingRate * 45 +
      excellentRate * 15 +
      distanceScore * 15 +
      speedScore * 20 +
      recoveryScore * 5;

    return Math.round(
      clamp(score, 0, 100)
    );
  }

  function getRating(score) {
    if (score >= 90) {
      return {
        title: "Trackpad Expert",
        message:
          "Amazing tracking! You stayed with the bird even when it was flying very fast."
      };
    }

    if (score >= 75) {
      return {
        title: "Great Control",
        message:
          "Great job! You followed the bird closely and handled faster movement well."
      };
    }

    if (score >= 60) {
      return {
        title: "Good Control",
        message:
          "Nice work! Your trackpad control is getting strong."
      };
    }

    if (score >= 40) {
      return {
        title: "Growing",
        message:
          "Good practice! Keep working on smooth finger movement and following the bird."
      };
    }

    return {
      title: "Getting Started",
      message:
        "Keep practicing! Try moving your finger smoothly and staying close to the bird."
    };
  }

  function finishRound() {
    running = false;

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    if (flapAudio) {
      flapAudio.pause();
      flapAudio.currentTime = 0;
    }

    timeDisplay.textContent = "0:00";

    const score = getFinalScore();
    resultScore.textContent = String(score);

    const achievedSpeed =
      settledSpeedSamples > 0
        ? settledSpeedSum / settledSpeedSamples
        : currentSpeed;

    let achievedLevel = "turtle";

    if (achievedSpeed >= 310) {
      achievedLevel = "lightning";
    } else if (achievedSpeed >= 240) {
      achievedLevel = "cheetah";
    } else if (achievedSpeed >= 185) {
      achievedLevel = "rabbit";
    } else if (achievedSpeed >= 125) {
      achievedLevel = "squirrel";
    }

    document
      .querySelectorAll(".speed-meter-level")
      .forEach(level => {
        level.classList.toggle(
          "active",
          level.dataset.speedLevel === achievedLevel
        );
      });

    resultPanel.hidden = false;

    if (successAudio && soundOn) {
      successAudio.pause();
      successAudio.currentTime = 0;
      successAudio.play().catch(error => {
        console.warn("Success sound could not play:", error);
      });
    }
  }

  function gameLoop(now) {
    if (!running) {
      return;
    }

    if (!lastFrameTime) {
      lastFrameTime = now;
    }

    const deltaSeconds =
      Math.min(
        (now - lastFrameTime) / 1000,
        0.04
      );

    lastFrameTime = now;

    const remaining = updateTimer(now);

    updateBird(deltaSeconds);
    recordTrackingSample();
    adaptSpeed(now);

    if (remaining <= 0) {
      finishRound();
      return;
    }

    animationFrame =
      requestAnimationFrame(gameLoop);
  }

  function resetRound() {
    running = false;

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    pointerX = null;
    pointerY = null;

    currentSpeed = START_SPEED;

    totalTrackingSamples = 0;
    closeTrackingSamples = 0;
    excellentSamples = 0;

    distanceSum = 0;

    recentSamples = [];

    settledSpeedSum = 0;
    settledSpeedSamples = 0;

    recoveryStart = null;
    recoveryTimes = [];

    timeDisplay.textContent = "1:00";
    trackingDisplay.textContent = "0%";
    speedDisplay.textContent = "Starting";

    resultPanel.hidden = true;

    resetBirdPosition();
  }

  function startRound() {
    resetRound();

    startPanel.hidden = true;
    resultPanel.hidden = true;

    running = true;

    if (flapAudio && soundOn) {
      flapAudio.currentTime = 0;
      flapAudio.play().catch(() => {});
    }

    const now = performance.now();

    startTime = now;
    lastFrameTime = now;
    lastAdaptTime = now;

    animationFrame =
      requestAnimationFrame(gameLoop);
  }

  arena.addEventListener("pointermove", event => {
    if (!running) {
      return;
    }

    const rect = arena.getBoundingClientRect();

    pointerX =
      event.clientX - rect.left;

    pointerY =
      event.clientY - rect.top;
  });

  arena.addEventListener("pointerleave", () => {
    if (!running) {
      return;
    }

    pointerX = null;
    pointerY = null;
  });

  if (soundButton) {
    soundButton.addEventListener("click", () => {
      soundOn = !soundOn;
      updateSoundButton();

      if (flapAudio) {
        if (!soundOn) {
          flapAudio.pause();
        } else if (running) {
          flapAudio.play().catch(() => {});
        }
      }
    });

    updateSoundButton();
  }

  startButton.addEventListener(
    "click",
    startRound
  );

  playAgainButton.addEventListener(
    "click",
    startRound
  );

  homeButton.addEventListener(
    "click",
    () => {
      window.location.href = "index.html";
    }
  );

  window.addEventListener(
    "resize",
    () => {
      if (!running) {
        resetBirdPosition();
      }
    }
  );

  const trackpadScene =
    document.getElementById("followBirdTrackpadScene");

  const trackpadLeftHand =
    document.getElementById("followBirdTrackpadLeftHand");

  const trackpadRightHand =
    document.getElementById("followBirdTrackpadRightHand");

  const trackpadPressIndicator =
    trackpadScene
      ? trackpadScene.querySelector(
          ".imported-trackpad-press-indicator"
        )
      : null;

  let followBirdTrackpadGuide = null;

  if (
    window.trackpadGuide &&
    trackpadScene &&
    trackpadLeftHand &&
    trackpadRightHand
  ) {
    followBirdTrackpadGuide =
      window.trackpadGuide.create({
        scene: trackpadScene,
        leftHand: trackpadLeftHand,
        rightHand: trackpadRightHand,
        pressIndicator: trackpadPressIndicator,
        pointerSpace: "viewport"
      });
  }

  if (followBirdTrackpadGuide) {
    window.addEventListener(
      "pointermove",
      event => {
        followBirdTrackpadGuide.updateFromPointerEvent(event);
      }
    );
  }

  resetBirdPosition();
})();



















