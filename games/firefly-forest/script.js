(() => {
  "use strict";

  const fireflyArena =
    document.getElementById("fireflyArena");

  const fireflyField =
    document.getElementById("fireflyField");

  const fireflyStartButton =
    document.getElementById("fireflyStartButton");

  const fireflyStatus =
    document.getElementById("fireflyStatus");

  const fireflyJarCount =
    document.getElementById("fireflyJarCount");

  const fireflyGoal =
    document.getElementById("fireflyGoal");

  const fireflyLevelDisplay =
    document.getElementById("fireflyLevel");

  const fireflyMissesDisplay =
    document.getElementById("fireflyMisses");

  const fireflyClickWarning =
    document.getElementById("fireflyClickWarning");

  const trackpadScene =
    document.getElementById("fireflyTrackpadScene");

  const trackpadLeftHand =
    document.getElementById("fireflyTrackpadLeftHand");

  const trackpadRightHand =
    document.getElementById("fireflyTrackpadRightHand");

  const trackpadPressIndicator =
    trackpadScene
      ? trackpadScene.querySelector(
          ".imported-trackpad-press-indicator"
        )
      : null;

  if (
    !fireflyArena ||
    !fireflyField ||
    !fireflyStartButton ||
    !fireflyStatus
  ) {
    return;
  }

  const FIREFLY_LEVELS = [
    {
      goal: 5,
      targetSize: 92,
      missesAllowed: 3,
    },
    {
      goal: 8,
      targetSize: 56,
      missesAllowed: 3,
      targetLifetimeSeconds: 4,
    },
    {
      goal: 8,
      targetSize: 68,
      missesAllowed: 3,
    },
    {
      goal: 10,
      targetSize: 54,
      missesAllowed: 3,
      simultaneousTargets: 6,
    },
  ];

  let currentLevelIndex = 0;
  let firefliesCollected = 0;
  let fireflyMissesRemaining = 0;
  let currentFirefly = null;
  let currentFireflyExpireTimer = null;
  let currentFireflyFadeTimer = null;
  let activeFireflies = [];
  let glowingFirefly = null;
  let lastFireflyPosition = null;
  let fireflyGameRunning = false;
  let fireflyLevelResult = null;

  const clickGameCore =
    window.ClickGameCore &&
    typeof window.ClickGameCore.create === "function"
      ? window.ClickGameCore.create({
          responseLockMs: 650,
          onRapidClick: () => {
            fireflyStatus.textContent =
              "Click once, then wait.";
          },
        })
      : null;

  const fireflyTrackpadGuide =
    window.trackpadGuide &&
    typeof window.trackpadGuide.create === "function" &&
    trackpadScene &&
    trackpadLeftHand &&
    trackpadRightHand
      ? window.trackpadGuide.create({
          scene: trackpadScene,
          leftHand: trackpadLeftHand,
          rightHand: trackpadRightHand,
          pressIndicator: trackpadPressIndicator,
          pointerSpace: "viewport",
          togglePressIndicator: true,
          toggleScenePressedClass: true,
        })
      : null;

  function handlePointerMove(event) {
    if (!fireflyTrackpadGuide) {
      return;
    }

    fireflyTrackpadGuide.updateFromPointerEvent(event);
  }

  function handlePointerDown(event) {
    if (!fireflyTrackpadGuide) {
      return;
    }

    fireflyTrackpadGuide.updateFromPointerEvent(event);
    fireflyTrackpadGuide.setPressed(true);
  }

  function handlePointerUp(event) {
    if (!fireflyTrackpadGuide) {
      return;
    }

    fireflyTrackpadGuide.updateFromPointerEvent(event);
    fireflyTrackpadGuide.setPressed(false);
  }

  function pauseFireflyGameplay() {
    fireflyGameRunning = false;

    if (clickGameCore) {
      clickGameCore.pause();
    }
  }

  function getCurrentLevel() {
    return FIREFLY_LEVELS[currentLevelIndex];
  }

  function prepareCurrentFireflyLevel() {
    clearAllFireflies();

    fireflyGameRunning = false;
    firefliesCollected = 0;
    fireflyMissesRemaining = getCurrentLevel().missesAllowed;
    lastFireflyPosition = null;

    if (clickGameCore) {
      clickGameCore.reset();
      clickGameCore.pause();
    }

    if (fireflyLevelResult) {
      fireflyLevelResult.hide();
    }

    updateProgress();

    fireflyStartButton.hidden = false;
    fireflyStartButton.textContent =
      `Start Level ${currentLevelIndex + 1}`;

    fireflyStatus.textContent =
      `Level ${currentLevelIndex + 1} ready. Click Start Level when you are ready.`;
  }

  function prepareNextFireflyLevel() {
    if (currentLevelIndex >= FIREFLY_LEVELS.length - 1) {
      return;
    }

    currentLevelIndex += 1;
    prepareCurrentFireflyLevel();
  }

  function playFireflyAgain() {
    currentLevelIndex = 0;

    if (fireflyLevelResult) {
      fireflyLevelResult.hide();
    }

    startPracticeRound();
  }

  function showFireflyLevelComplete() {
    pauseFireflyGameplay();

    const completedLevel = currentLevelIndex + 1;
    const isFinalLevel =
      currentLevelIndex >= FIREFLY_LEVELS.length - 1;

    fireflyStatus.textContent =
      `Level ${completedLevel} complete!`;

    if (!fireflyLevelResult) {
      return;
    }

    if (isFinalLevel) {
      fireflyLevelResult.showFinal({
        title: "You Did It!",
        message:
          "You completed all 4 Firefly Forest levels!",
        primaryLabel: "Play Again",
      });
      return;
    }

    fireflyLevelResult.showSuccess({
      title: "Level Complete!",
      message:
        `Great job! Click Level Up for Level ${completedLevel + 1}.`,
      primaryLabel: "Level Up",
    });
  }

  function updateProgress() {
    const level = getCurrentLevel();

    if (fireflyLevelDisplay) {
      fireflyLevelDisplay.textContent =
        String(currentLevelIndex + 1);
    }

    if (fireflyJarCount) {
      fireflyJarCount.textContent =
        String(firefliesCollected);
    }

    if (fireflyGoal) {
      fireflyGoal.textContent =
        `${firefliesCollected}/${level.goal}`;
    }

    if (fireflyMissesDisplay) {
      fireflyMissesDisplay.textContent =
        String(fireflyMissesRemaining);
    }
  }

  function clearCurrentFireflyTimers() {
    if (currentFireflyFadeTimer !== null) {
      window.clearTimeout(currentFireflyFadeTimer);
      currentFireflyFadeTimer = null;
    }

    if (currentFireflyExpireTimer !== null) {
      window.clearTimeout(currentFireflyExpireTimer);
      currentFireflyExpireTimer = null;
    }
  }

  function removeCurrentFirefly() {
    clearCurrentFireflyTimers();

    if (!currentFirefly) {
      return;
    }

    if (clickGameCore) {
      clickGameCore.unregisterTarget(
        currentFirefly
      );
    }

    currentFirefly.remove();
    currentFirefly = null;
  }

  function clearLevelFourFireflies() {
    activeFireflies.forEach((firefly) => {
      if (clickGameCore) {
        clickGameCore.unregisterTarget(firefly);
      }

      firefly.remove();
    });

    activeFireflies = [];
    glowingFirefly = null;
  }

  function clearAllFireflies() {
    removeCurrentFirefly();
    clearLevelFourFireflies();
  }

  function chooseLevelFourGlow() {
    if (activeFireflies.length === 0) {
      glowingFirefly = null;
      return;
    }

    activeFireflies.forEach((firefly) => {
      firefly.classList.remove("is-glowing-target");
      firefly.classList.add("is-dim-target");
      firefly.setAttribute(
        "aria-label",
        "Dim firefly"
      );
    });

    const nextIndex =
      Math.floor(Math.random() * activeFireflies.length);

    glowingFirefly = activeFireflies[nextIndex];
    glowingFirefly.classList.remove("is-dim-target");
    glowingFirefly.classList.add("is-glowing-target");
    glowingFirefly.setAttribute(
      "aria-label",
      "Glowing firefly"
    );
  }

  function chooseFireflyPosition() {
    let position = null;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidate = {
        x: 18 + Math.random() * 60,
        y: 24 + Math.random() * 50,
      };

      if (!lastFireflyPosition) {
        position = candidate;
        break;
      }

      const dx = candidate.x - lastFireflyPosition.x;
      const dy = candidate.y - lastFireflyPosition.y;
      const distance = Math.hypot(dx, dy);

      if (distance >= 18) {
        position = candidate;
        break;
      }
    }

    if (!position) {
      position = {
        x: 20 + Math.random() * 56,
        y: 26 + Math.random() * 46,
      };
    }

    lastFireflyPosition = position;
    return position;
  }

  function showClickOnceWarning() {
    if (!fireflyClickWarning) {
      return;
    }

    fireflyClickWarning.hidden = false;
    fireflyClickWarning.classList.remove("is-visible");

    void fireflyClickWarning.offsetWidth;

    fireflyClickWarning.classList.add("is-visible");

    window.setTimeout(() => {
      fireflyClickWarning.classList.remove("is-visible");
      fireflyClickWarning.hidden = true;
    }, 1200);
  }

  function showFireflyFailure(message) {
    pauseFireflyGameplay();
    clearAllFireflies();

    fireflyStatus.textContent = message;

    if (fireflyLevelResult) {
      fireflyLevelResult.showFailure({
        title: "Try Again!",
        message,
        primaryLabel: "Try Again",
      });
    }
  }

  function applyFireflyMiss(message) {
    if (!fireflyGameRunning) {
      return;
    }

    fireflyMissesRemaining = Math.max(
      0,
      fireflyMissesRemaining - 1
    );

    updateProgress();

    if (fireflyMissesRemaining <= 0) {
      showFireflyFailure(
        "No misses left. Try the level again."
      );
      return;
    }

    fireflyStatus.textContent = message;
  }

  function handleRapidFireflyClick() {
    showClickOnceWarning();

    applyFireflyMiss(
      "Too fast! Click once, then wait."
    );

    if (!fireflyGameRunning) {
      return;
    }

    if (currentFirefly) {
      currentFirefly.classList.add("is-collected");
    }

    window.setTimeout(() => {
      removeCurrentFirefly();

      fireflyStatus.textContent =
        "Try again. Find the glowing firefly and click once.";

      createPracticeFirefly();
    }, 1200);
  }

  function handleLevelFourWrongFirefly() {
    applyFireflyMiss(
      "Miss! Click only the glowing firefly."
    );
  }

  function handleLevelFourPending({ element }) {
    if (!element || element !== glowingFirefly) {
      return;
    }

    element.classList.add("is-pending");

    fireflyStatus.textContent =
      "Nice click...";
  }

  function handleLevelFourRapidClick({ element }) {
    showClickOnceWarning();

    applyFireflyMiss(
      "Too fast! Click once, then wait."
    );

    if (!fireflyGameRunning || !element) {
      return;
    }

    element.classList.remove("is-pending");
  }

  function handleLevelFourCollected({ element }) {
    if (
      !fireflyGameRunning ||
      !element ||
      element !== glowingFirefly
    ) {
      return;
    }

    firefliesCollected += 1;
    updateProgress();

    element.classList.add("is-collected");

    fireflyStatus.textContent =
      "Great click! You caught the glowing firefly.";

    window.setTimeout(() => {
      if (clickGameCore) {
        clickGameCore.unregisterTarget(element);
      }

      element.remove();

      activeFireflies =
        activeFireflies.filter(
          (firefly) => firefly !== element
        );

      if (glowingFirefly === element) {
        glowingFirefly = null;
      }

      if (firefliesCollected >= getCurrentLevel().goal) {
        clearLevelFourFireflies();
        showFireflyLevelComplete();
        return;
      }

      createLevelFourFirefly();
      chooseLevelFourGlow();

      fireflyStatus.textContent =
        "Find the glowing firefly.";
    }, 350);
  }

  function handleFireflyPending() {
    if (!currentFirefly) {
      return;
    }

    currentFirefly.classList.add("is-pending");

    fireflyStatus.textContent =
      "Nice click...";
  }

  function handleFireflyCollected() {
    firefliesCollected += 1;
    updateProgress();

    fireflyStatus.textContent =
      "Great click! You caught the firefly.";

    if (currentFirefly) {
      currentFirefly.classList.add(
        "is-collected"
      );
    }

    window.setTimeout(() => {
      removeCurrentFirefly();

      if (firefliesCollected >= getCurrentLevel().goal) {
        showFireflyLevelComplete();
        return;
      }

      fireflyStatus.textContent =
        "Find the next glowing firefly.";

      createPracticeFirefly();
    }, 350);
  }

  function createLevelFourFirefly() {
    const level = getCurrentLevel();
    const firefly =
      document.createElement("button");

    firefly.type = "button";
    firefly.className =
      "firefly-target is-dim-target";

    firefly.setAttribute(
      "aria-label",
      "Dim firefly"
    );

    firefly.innerHTML = `
      <span class="firefly-glow" aria-hidden="true"></span>
      <span class="firefly-body" aria-hidden="true">
        <span class="firefly-wing firefly-wing-left"></span>
        <span class="firefly-wing firefly-wing-right"></span>
        <span class="firefly-head"></span>
        <span class="firefly-tail"></span>
      </span>
    `;

    const position = chooseFireflyPosition();

    firefly.style.left = `${position.x}%`;
    firefly.style.top = `${position.y}%`;
    firefly.style.width = `${level.targetSize}px`;
    firefly.style.height = `${level.targetSize}px`;

    fireflyField.appendChild(firefly);
    activeFireflies.push(firefly);

    if (!clickGameCore) {
      return;
    }

    clickGameCore.registerTarget(
      firefly,
      {
        id: `level-four-firefly-${Date.now()}-${activeFireflies.length}`,
        isClickable: () => {
          if (firefly !== glowingFirefly) {
            handleLevelFourWrongFirefly();
            return false;
          }

          return true;
        },
        onPending: handleLevelFourPending,
        onClick: handleLevelFourCollected,
        onInvalidated: handleLevelFourRapidClick,
      }
    );

    if (
      typeof clickGameCore.startTargetMovement === "function"
    ) {
      clickGameCore.startTargetMovement(
        firefly,
        {
          speed: 7,
          minX: 14,
          maxX: 82,
          minY: 22,
          maxY: 76,
        }
      );
    }
  }

  function createLevelFourChallenge() {
    clearAllFireflies();

    const targetCount =
      getCurrentLevel().simultaneousTargets || 4;

    for (let index = 0; index < targetCount; index += 1) {
      createLevelFourFirefly();
    }

    chooseLevelFourGlow();

    fireflyStatus.textContent =
      "Click only the glowing firefly.";
  }

  function handleLevelTwoFireflyExpired(firefly) {
    if (
      currentLevelIndex !== 1 ||
      !fireflyGameRunning ||
      firefly !== currentFirefly
    ) {
      return;
    }

    removeCurrentFirefly();

    applyFireflyMiss(
      "Too slow! The firefly flew away."
    );

    if (!fireflyGameRunning) {
      return;
    }

    window.setTimeout(() => {
      if (!fireflyGameRunning) {
        return;
      }

      fireflyStatus.textContent =
        "Find the next firefly before it fades away.";

      createPracticeFirefly();
    }, 300);
  }

  function startLevelTwoFireflyTimer(firefly) {
    if (currentLevelIndex !== 1) {
      return;
    }

    const lifetimeSeconds =
      Number(getCurrentLevel().targetLifetimeSeconds);

    if (
      !Number.isFinite(lifetimeSeconds) ||
      lifetimeSeconds <= 0
    ) {
      return;
    }

    const lifetimeMs =
      Math.round(lifetimeSeconds * 1000);

    const fadeLeadMs =
      Math.min(900, Math.max(300, lifetimeMs * 0.25));

    currentFireflyFadeTimer =
      window.setTimeout(() => {
        if (
          firefly === currentFirefly &&
          fireflyGameRunning
        ) {
          firefly.classList.add("is-expiring");
        }
      }, Math.max(0, lifetimeMs - fadeLeadMs));

    currentFireflyExpireTimer =
      window.setTimeout(() => {
        handleLevelTwoFireflyExpired(firefly);
      }, lifetimeMs);
  }

  function createPracticeFirefly() {
    removeCurrentFirefly();

    const firefly =
      document.createElement("button");

    firefly.type = "button";
    firefly.className =
      "firefly-target";

    firefly.setAttribute(
      "aria-label",
      "Glowing firefly"
    );

    firefly.innerHTML = `
      <span class="firefly-glow" aria-hidden="true"></span>
      <span class="firefly-body" aria-hidden="true">
        <span class="firefly-wing firefly-wing-left"></span>
        <span class="firefly-wing firefly-wing-right"></span>
        <span class="firefly-head"></span>
        <span class="firefly-tail"></span>
      </span>
    `;

    const position = chooseFireflyPosition();
    const level = getCurrentLevel();

    firefly.style.left = `${position.x}%`;
    firefly.style.top = `${position.y}%`;
    firefly.style.width = `${level.targetSize}px`;
    firefly.style.height = `${level.targetSize}px`;

    fireflyField.appendChild(firefly);
    currentFirefly = firefly;

    if (clickGameCore) {
      clickGameCore.registerTarget(
        firefly,
        {
          id: `practice-firefly-${firefliesCollected + 1}`,
          isClickable: () => true,
          onPending: handleFireflyPending,
          onClick: handleFireflyCollected,
          onInvalidated: handleRapidFireflyClick,
        }
      );

      if (
        currentLevelIndex >= 2 &&
        typeof clickGameCore.startTargetMovement === "function"
      ) {
        clickGameCore.startTargetMovement(
          firefly,
          {
            speed: currentLevelIndex === 2 ? 6 : 7,
            minX: 14,
            maxX: 82,
            minY: 22,
            maxY: 76,
          }
        );
      }
    }

    startLevelTwoFireflyTimer(firefly);
  }

  function startPracticeRound() {
    removeCurrentFirefly();

    fireflyGameRunning = true;
    firefliesCollected = 0;
    fireflyMissesRemaining = getCurrentLevel().missesAllowed;
    lastFireflyPosition = null;

    updateProgress();

    if (clickGameCore) {
      clickGameCore.reset();
      clickGameCore.resume();
    }

    if (currentLevelIndex === 3) {
      createLevelFourChallenge();
    } else {
      fireflyStatus.textContent =
        `Level ${currentLevelIndex + 1}: Find the glowing firefly and click it once.`;

      createPracticeFirefly();
    }

    fireflyStartButton.hidden = true;
  }

  fireflyArena.addEventListener("click", (event) => {
    if (!fireflyGameRunning) {
      return;
    }

    if (
      event.target.closest(".firefly-target") ||
      event.target.closest(".firefly-start-button") ||
      event.target.closest(".level-result-overlay")
    ) {
      return;
    }

    applyFireflyMiss(
      "Miss! Find the glowing firefly and click it."
    );
  });

  if (
    window.LevelResultController &&
    fireflyArena
  ) {
    fireflyLevelResult =
      new window.LevelResultController({
        host: fireflyArena,
        pauseGame: pauseFireflyGameplay,
        onNextLevel: prepareNextFireflyLevel,
        onRetry: startPracticeRound,
        onPlayAgain: playFireflyAgain,
        onHome: () => {
          window.location.href = "../../index.html";
        },
        canPlaySound: () => true,
      });
  }

  window.addEventListener(
    "pointermove",
    handlePointerMove
  );

  window.addEventListener(
    "pointerdown",
    handlePointerDown
  );

  window.addEventListener(
    "pointerup",
    handlePointerUp
  );

  window.addEventListener(
    "pointercancel",
    handlePointerUp
  );

  fireflyStartButton.addEventListener(
    "click",
    startPracticeRound
  );

  prepareCurrentFireflyLevel();
})();
