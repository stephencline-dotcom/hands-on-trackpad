(() => {
  const arena = document.getElementById("followBirdArena");
  const bird = document.getElementById("followBirdBird");

  const startPanel = document.getElementById("followBirdStartPanel");
  const startButton = document.getElementById("followBirdStartButton");

  const normalStart =
    document.getElementById("followBirdNormalStart");

  const modeChooser =
    document.getElementById("followBirdModeChooser");

  const slidingModeButton =
    document.getElementById("followBirdSlidingModeButton");

  const clickingModeButton =
    document.getElementById("followBirdClickingModeButton");

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

  let followBirdClickingEnabled = false;
  let selectedFollowBirdMode = "sliding";

  async function loadFollowBirdModeSetting() {
    try {
      const response = await fetch("/api/settings", {
        cache: "no-store"
      });

      if (response.ok) {
        const settings = await response.json();

        followBirdClickingEnabled =
          Boolean(
            settings &&
            settings.followBirdClickingEnabled
          );

        localStorage.setItem(
          "followBirdClickingEnabled",
          String(followBirdClickingEnabled)
        );

        return;
      }
    } catch (error) {
      console.warn(
        "Follow the Bird settings could not be loaded from the server:",
        error
      );
    }

    followBirdClickingEnabled =
      localStorage.getItem(
        "followBirdClickingEnabled"
      ) === "true";
  }

  function updateFollowBirdStartChoice() {
    if (!normalStart || !modeChooser) {
      return;
    }

    if (followBirdClickingEnabled) {
      normalStart.hidden = true;
      modeChooser.hidden = false;
    } else {
      normalStart.hidden = false;
      modeChooser.hidden = true;
      selectedFollowBirdMode = "sliding";
    }
  }

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

  /* Clicking mode */
  const CLICK_WINDOW_START = 2200;
  const CLICK_WINDOW_MIN = 650;
  const CLICK_WINDOW_MAX = 3000;
  const CLICKING_END_SPEED = 360;

  let clickWindowMs = CLICK_WINDOW_START;
  let clickingState = "flying";
  let clickableSince = 0;

  let clickingHits = 0;
  let clickingMisses = 0;
  let clickingReactionTimes = [];
  let recentClickReactions = [];

  let recentClickPresses = [];
  const activeClickPointers = new Set();
  let clickWarningTimer = null;
  let suppressClickUntil = 0;



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

    const score =
      selectedFollowBirdMode === "clicking"
        ? getClickingScore()
        : getFinalScore();

    resultScore.textContent = String(score);

    let achievedLevel = "turtle";

    if (selectedFollowBirdMode === "clicking") {
      if (score >= 90) {
        achievedLevel = "lightning";
      } else if (score >= 75) {
        achievedLevel = "cheetah";
      } else if (score >= 60) {
        achievedLevel = "rabbit";
      } else if (score >= 40) {
        achievedLevel = "squirrel";
      }

      if (resultRating) {
        resultRating.textContent =
          "Clicking Skill";
      }

      if (resultMessage) {
        const attempts =
          clickingHits + clickingMisses;

        const accuracy =
          attempts > 0
            ? Math.round(
                clickingHits / attempts * 100
              )
            : 0;

        resultMessage.textContent =
          `${accuracy}% accurate • ${clickingHits} successful clicks`;
      }
    } else {
      const achievedSpeed =
        settledSpeedSamples > 0
          ? settledSpeedSum / settledSpeedSamples
          : currentSpeed;

      if (achievedSpeed >= 310) {
        achievedLevel = "lightning";
      } else if (achievedSpeed >= 240) {
        achievedLevel = "cheetah";
      } else if (achievedSpeed >= 185) {
        achievedLevel = "rabbit";
      } else if (achievedSpeed >= 125) {
        achievedLevel = "squirrel";
      }
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

  function setBirdClickable(clickable, now = performance.now()) {
    clickingState = clickable ? "waiting" : "flying";

    bird.classList.toggle(
      "follow-bird-click-target",
      clickable
    );

    if (clickable) {
      clickableSince = now;
    } else {
      clickableSince = 0;
      chooseTarget();
    }
  }

  function adaptClickWindow(success, reactionTime = null) {
    if (!success) {
      clickWindowMs = Math.min(
        CLICK_WINDOW_MAX,
        clickWindowMs + 220
      );

      recentClickReactions = [];
    } else {
      recentClickReactions.push(reactionTime);

      if (recentClickReactions.length > 4) {
        recentClickReactions.shift();
      }

      const average =
        recentClickReactions.reduce(
          (sum, value) => sum + value,
          0
        ) / recentClickReactions.length;

      if (recentClickReactions.length >= 2) {
        if (average <= 650) {
          clickWindowMs -= 220;
        } else if (average <= 900) {
          clickWindowMs -= 150;
        } else if (average <= 1200) {
          clickWindowMs -= 80;
        } else if (average >= clickWindowMs * 0.85) {
          clickWindowMs += 100;
        }
      }

      clickWindowMs = clamp(
        clickWindowMs,
        CLICK_WINDOW_MIN,
        CLICK_WINDOW_MAX
      );
    }

    if (selectedFollowBirdMode === "clicking") {
      trackingDisplay.textContent =
        `${(clickWindowMs / 1000).toFixed(1)}s`;
    }
  }

  function updateClickingSkillDisplay(reactionTime = null, missed = false) {
    if (selectedFollowBirdMode !== "clicking") {
      return;
    }

    if (missed) {
      speedDisplay.textContent = "Miss";
      return;
    }

    if (reactionTime === null) {
      speedDisplay.textContent = "Ready";
      return;
    }

    const seconds =
      (reactionTime / 1000).toFixed(2);

    let label = "Slow";

    if (reactionTime <= 550) {
      label = "⚡";
    } else if (reactionTime <= 800) {
      label = "Fast";
    } else if (reactionTime <= 1100) {
      label = "Good";
    } else if (reactionTime <= 1450) {
      label = "Steady";
    }

    speedDisplay.textContent =
      `${label} ${seconds}s`;
  }

  function updateClickingBird(now, deltaSeconds) {
    if (clickingState === "waiting") {
      if (now - clickableSince >= clickWindowMs) {
        clickingMisses += 1;
        adaptClickWindow(false);
        setBirdClickable(false, now);
      }

      return;
    }

    const dx = targetX - birdX;
    const dy = targetY - birdY;
    const distance = Math.hypot(dx, dy);

    if (distance < 35) {
      birdX = targetX;
      birdY = targetY;
      placeBird();
      setBirdClickable(true, now);
      return;
    }

    const directionX = dx / distance;
    const directionY = dy / distance;

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

  function getClickingScore() {
    const attempts = clickingHits + clickingMisses;

    if (attempts <= 0) {
      return 0;
    }

    const accuracy = clickingHits / attempts;

    const averageReaction =
      clickingReactionTimes.length > 0
        ? clickingReactionTimes.reduce(
            (sum, value) => sum + value,
            0
          ) / clickingReactionTimes.length
        : CLICK_WINDOW_MAX;

    const reactionScore = clamp(
      1 -
        (averageReaction - CLICK_WINDOW_MIN) /
          (CLICK_WINDOW_MAX - CLICK_WINDOW_MIN),
      0,
      1
    );

    const difficultyScore = clamp(
      (CLICK_WINDOW_START - clickWindowMs) /
        (CLICK_WINDOW_START - CLICK_WINDOW_MIN),
      0,
      1
    );

    return Math.round(
      clamp(
        accuracy * 55 +
        reactionScore * 30 +
        difficultyScore * 15,
        0,
        100
      )
    );
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

    if (selectedFollowBirdMode === "clicking") {
      const clickingRoundProgress =
        clamp(
          (now - startTime) /
            (ROUND_LENGTH * 1000),
          0,
          1
        );

      currentSpeed =
        START_SPEED +
        (
          CLICKING_END_SPEED -
          START_SPEED
        ) * clickingRoundProgress;

      updateClickingBird(now, deltaSeconds);
    } else {
      updateBird(deltaSeconds);
      recordTrackingSample();
      adaptSpeed(now);
    }

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

    clickWindowMs = CLICK_WINDOW_START;
    clickingState = "flying";
    clickableSince = 0;

    clickingHits = 0;
    clickingMisses = 0;
    clickingReactionTimes = [];
    recentClickReactions = [];
    recentClickPresses = [];
    activeClickPointers.clear();

    if (clickWarningTimer) {
      clearTimeout(clickWarningTimer);
      clickWarningTimer = null;
    }

    if (clickInputWarning) {
      clickInputWarning.hidden = true;
    }

    bird.classList.remove(
      "follow-bird-click-target"
    );

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
    speedDisplay.textContent =
      selectedFollowBirdMode === "clicking"
        ? "Ready"
        : "Starting";

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



  const clickInputWarning = document.createElement("div");
  clickInputWarning.className = "follow-bird-input-warning";
  clickInputWarning.hidden = true;
  arena.appendChild(clickInputWarning);

  function showClickInputWarning(message) {
    clickInputWarning.textContent = message;
    clickInputWarning.hidden = false;

    if (clickWarningTimer) {
      clearTimeout(clickWarningTimer);
    }

    clickWarningTimer = window.setTimeout(() => {
      clickInputWarning.hidden = true;
    }, 1400);
  }

  function registerClickingHit(now) {
    if (clickingState !== "waiting") {
      return;
    }

    const reactionTime = now - clickableSince;

    /* Remove the glow immediately. */
    bird.classList.remove("follow-bird-click-target");

    clickingHits += 1;
    clickingReactionTimes.push(reactionTime);
    updateClickingSkillDisplay(reactionTime);

    adaptClickWindow(true, reactionTime);
    setBirdClickable(false, now);
  }


  function releaseClickPointer(event) {
    activeClickPointers.delete(event.pointerId);
  }

  arena.addEventListener("pointerup", releaseClickPointer);
  arena.addEventListener("pointercancel", releaseClickPointer);
  arena.addEventListener("pointerleave", releaseClickPointer);



  /*
   * Clicking mode input is handled here so invalid
   * presses can never accidentally count as hits.
   */
  arena.addEventListener(
    "pointerdown",
    event => {
      if (
        !running ||
        selectedFollowBirdMode !== "clicking"
      ) {
        return;
      }

      const now = performance.now();

      activeClickPointers.add(
        event.pointerId
      );

      /*
       * A two-finger trackpad press commonly arrives
       * as a secondary/right click. Touch devices may
       * expose the extra finger as another pointer.
       */
      const invalidFingerInput =
        activeClickPointers.size > 1 ||
        event.isPrimary === false ||
        event.button !== 0;

      if (invalidFingerInput) {
        suppressClickUntil =
          now + 700;

        recentClickPresses = [];

        showClickInputWarning(
          "☝️ Use one finger!"
        );

        event.preventDefault();
        event.stopImmediatePropagation();

        return;
      }

      /*
       * Watch for repeated rapid clicking.
       */
      recentClickPresses =
        recentClickPresses.filter(
          time => now - time <= 650
        );

      recentClickPresses.push(now);

      if (recentClickPresses.length >= 3) {
        suppressClickUntil =
          now + 500;

        recentClickPresses = [];

        showClickInputWarning(
          "⚠️ Too many clicks! Wait for the glow."
        );

        event.preventDefault();
        event.stopImmediatePropagation();

        return;
      }

      /*
       * Clicking while the bird is flying does
       * nothing. Students must wait for the glow.
       */
      if (clickingState !== "waiting") {
        return;
      }

      const arenaRect =
        arena.getBoundingClientRect();

      const birdCenter =
        getBirdCenter();

      const clickX =
        event.clientX -
        arenaRect.left;

      const clickY =
        event.clientY -
        arenaRect.top;

      const distance =
        Math.hypot(
          clickX - birdCenter.x,
          clickY - birdCenter.y
        );

      const birdSize =
        getBirdSize();

      /*
       * The glowing ring counts as part of the
       * clickable target.
       */
      const clickRadius =
        Math.max(
          70,
          Math.max(
            birdSize.width,
            birdSize.height
          ) * 0.8
        );

      if (distance > clickRadius) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      registerClickingHit(now);
    },
    true
  );


  /*
   * Prevent a blocked pointer press from later
   * becoming a browser-generated click.
   */
  arena.addEventListener(
    "click",
    event => {
      if (
        selectedFollowBirdMode === "clicking" &&
        performance.now() < suppressClickUntil
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true
  );


  /*
   * A two-finger Chromebook trackpad click commonly
   * generates a contextmenu event.
   */
  arena.addEventListener(
    "contextmenu",
    event => {
      if (
        !running ||
        selectedFollowBirdMode !== "clicking"
      ) {
        return;
      }

      suppressClickUntil =
        performance.now() + 700;

      recentClickPresses = [];

      showClickInputWarning(
        "☝️ Use one finger!"
      );

      event.preventDefault();
      event.stopImmediatePropagation();
    },
    true
  );
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
    () => {
      selectedFollowBirdMode = "sliding";
      startRound();
    }
  );

  if (slidingModeButton) {
    slidingModeButton.addEventListener(
      "click",
      () => {
        selectedFollowBirdMode = "sliding";
        startRound();
      }
    );
  }

  if (clickingModeButton) {
    clickingModeButton.addEventListener(
      "click",
      () => {
        selectedFollowBirdMode = "clicking";
        startRound();
      }
    );
  }

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

  async function initializeFollowBird() {
    await loadFollowBirdModeSetting();
    updateFollowBirdStartChoice();
    resetBirdPosition();
  }

  initializeFollowBird();
})();

































