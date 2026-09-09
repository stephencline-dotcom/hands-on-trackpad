(() => {
  "use strict";

  const monsterArena =
    document.getElementById("monsterArena");

  const monsterStartButton =
    document.getElementById("monsterStartButton");

  const monsterStatus =
    document.getElementById("monsterStatus");

  const monsterFoodField =
    document.getElementById("monsterFoodField");

  const monsterRequestedFood =
    document.getElementById("monsterRequestedFood");

  const monsterCharacter =
    document.getElementById("monsterCharacter");

  const monsterMouth =
    document.getElementById("monsterMouth");

  const monsterGoalDisplay =
    document.getElementById("monsterGoal");

  const monsterMissesDisplay =
    document.getElementById("monsterMisses");

  const monsterScoreDisplay =
    document.getElementById("monsterScore");

  const monsterTimeDisplay =
    document.getElementById("monsterTime");

  const monsterClickWarning =
    document.getElementById("monsterClickWarning");

  const monsterSnatcher =
    document.getElementById("monsterSnatcher");

  const trackpadScene =
    document.getElementById("monsterTrackpadScene");

  const trackpadLeftHand =
    document.getElementById("monsterTrackpadLeftHand");

  const trackpadRightHand =
    document.getElementById("monsterTrackpadRightHand");

  const trackpadPressIndicator =
    trackpadScene
      ? trackpadScene.querySelector(
          ".imported-trackpad-press-indicator"
        )
      : null;

  if (
    !monsterArena ||
    !monsterStartButton ||
    !monsterStatus ||
    !monsterFoodField ||
    !monsterRequestedFood
  ) {
    return;
  }

  const MONSTER_LEVELS = [
    {
      goal: 5,
      missesAllowed: 3,
      choiceCount: 3,
      foodSize: 118,
      moving: false,
      moveSpeed: 0,
      timeLimitEnabled: false,
      timeLimit: 35,
    },
    {
      goal: 7,
      missesAllowed: 3,
      choiceCount: 5,
      foodSize: 88,
      moving: false,
      moveSpeed: 0,
      timeLimitEnabled: false,
      timeLimit: 35,
    },
    {
      goal: 8,
      missesAllowed: 3,
      choiceCount: 5,
      foodSize: 88,
      moving: true,
      moveSpeed: 5,
      timeLimitEnabled: true,
      timeLimit: 35,
      snatcherDelaySeconds: 5,
    },
    {
      goal: 10,
      missesAllowed: 3,
      choiceCount: 9,
      foodSize: 82,
      moving: true,
      moveSpeed: 6,
      timeLimitEnabled: true,
      timeLimit: 30,
      snatcherDelaySeconds: 3.5,
    },
  ];

  let currentLevelIndex = 0;

  const FOODS = [
    {
      id: "cookie",
      label: "COOKIE",
      emoji: "🍪",
      splatColor: "#9a5a33",
      minLevel: 1,
    },
    {
      id: "apple",
      label: "APPLE",
      emoji: "🍎",
      splatColor: "#ef4444",
      minLevel: 1,
    },
    {
      id: "banana",
      label: "BANANA",
      emoji: "🍌",
      splatColor: "#facc15",
      minLevel: 1,
    },
    {
      id: "pizza",
      label: "PIZZA",
      emoji: "🍕",
      splatColor: "#f97316",
      minLevel: 1,
    },
    {
      id: "cheese",
      label: "CHEESE",
      emoji: "🧀",
      splatColor: "#fbbf24",
      minLevel: 1,
    },
    {
      id: "grapes",
      label: "GRAPES",
      emoji: "🍇",
      splatColor: "#7e22ce",
      minLevel: 1,
    },
    {
      id: "taco",
      label: "TACO",
      emoji: "🌮",
      splatColor: "#d97706",
      minLevel: 1,
    },
    {
      id: "meatballs",
      label: "MEATBALLS",
      emoji: "🍝",
      splatColor: "#b91c1c",
      minLevel: 1,
    },
    {
      id: "ice-cream",
      label: "ICE CREAM",
      emoji: "🍦",
      splatColor: "#f9a8d4",
      minLevel: 1,
    },
    {
      id: "pretzel",
      label: "PRETZEL",
      emoji: "🥨",
      splatColor: "#a16207",
      minLevel: 1,
    },
    {
      id: "burger",
      label: "BURGER",
      emoji: "🍔",
      splatColor: "#a16207",
      minLevel: 3,
    },
    {
      id: "hot-dog",
      label: "HOT DOG",
      emoji: "🌭",
      splatColor: "#dc2626",
      minLevel: 3,
    },
    {
      id: "pancakes",
      label: "PANCAKES",
      emoji: "🥞",
      splatColor: "#d97706",
      minLevel: 3,
    },
    {
      id: "cupcake",
      label: "CUPCAKE",
      emoji: "🧁",
      splatColor: "#ec4899",
      minLevel: 3,
    },
    {
      id: "strawberry",
      label: "STRAWBERRY",
      emoji: "🍓",
      splatColor: "#ef4444",
      minLevel: 3,
    },
  ];

  let score = 0;
  let missesRemaining =
    MONSTER_LEVELS[0].missesAllowed;
  let currentRequest = null;
  let activeFoodButtons = [];
  let roundActive = false;

  let monsterTimeLeft = 0;
  let monsterTimerId = null;

  let snatcherTimerId = null;
  let snatcherActive = false;

  const clickGameCore =
    window.ClickGameCore &&
    typeof window.ClickGameCore.create === "function"
      ? window.ClickGameCore.create({
          responseLockMs: 650,
          onRapidClick: () => {
            showClickOnceWarning();
            applyMiss("Too fast! Click once, then wait.");
          },
        })
      : null;

  const monsterTrackpadGuide =
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
    if (!monsterTrackpadGuide) {
      return;
    }

    monsterTrackpadGuide.updateFromPointerEvent(event);
  }

  function handlePointerDown(event) {
    if (!monsterTrackpadGuide) {
      return;
    }

    monsterTrackpadGuide.updateFromPointerEvent(event);
    monsterTrackpadGuide.setPressed(true);
  }

  function handlePointerUp(event) {
    if (!monsterTrackpadGuide) {
      return;
    }

    monsterTrackpadGuide.updateFromPointerEvent(event);
    monsterTrackpadGuide.setPressed(false);
  }

  function getCurrentLevel() {
    return MONSTER_LEVELS[currentLevelIndex];
  }

  function stopMonsterTimer() {
    if (monsterTimerId !== null) {
      window.clearInterval(monsterTimerId);
      monsterTimerId = null;
    }
  }

  function updateMonsterTimeDisplay() {
    if (!monsterTimeDisplay) {
      return;
    }

    const level = getCurrentLevel();

    if (!level.timeLimitEnabled) {
      monsterTimeDisplay.textContent = "—";
      return;
    }

    monsterTimeDisplay.textContent =
      String(Math.max(0, monsterTimeLeft));
  }

  function handleMonsterTimeExpired() {
    stopMonsterTimer();

    roundActive = false;
    clearFoods();

    if (clickGameCore) {
      clickGameCore.pause();
    }

    monsterRequestedFood.textContent =
      "TIME UP";

    monsterStartButton.hidden = false;
    monsterStartButton.textContent =
      "Try Again";

    updateMonsterTimeDisplay();
  }

  function startMonsterTimer() {
    stopMonsterTimer();

    const level = getCurrentLevel();

    monsterTimeLeft = level.timeLimit;
    updateMonsterTimeDisplay();

    if (!level.timeLimitEnabled) {
      return;
    }

    monsterTimerId = window.setInterval(() => {
      if (!roundActive) {
        return;
      }

      monsterTimeLeft = Math.max(
        0,
        monsterTimeLeft - 1
      );

      updateMonsterTimeDisplay();

      if (monsterTimeLeft <= 0) {
        handleMonsterTimeExpired();
      }
    }, 1000);
  }

  function updateHud() {
    const level = getCurrentLevel();

    const monsterLevelDisplay =
      document.getElementById("monsterLevel");

    if (monsterLevelDisplay) {
      monsterLevelDisplay.textContent =
        String(currentLevelIndex + 1);
    }

    if (monsterGoalDisplay) {
      monsterGoalDisplay.textContent =
        `${score}/${level.goal}`;
    }

    if (monsterMissesDisplay) {
      monsterMissesDisplay.textContent =
        String(missesRemaining);
    }

    if (monsterScoreDisplay) {
      monsterScoreDisplay.textContent =
        String(score);
    }

    updateMonsterTimeDisplay();
  }

  function stopSnatcherTimer() {
    if (snatcherTimerId !== null) {
      window.clearTimeout(snatcherTimerId);
      snatcherTimerId = null;
    }
  }

  function resetSnatcherVisual() {
    if (!monsterSnatcher) {
      return;
    }

    monsterSnatcher.classList.remove(
      "is-snatching"
    );

    monsterSnatcher.style.removeProperty(
      "--snatch-x"
    );

    monsterSnatcher.style.removeProperty(
      "--snatch-y"
    );

    monsterSnatcher.hidden = true;
    snatcherActive = false;
  }

  function findRequestedFoodButton() {
    return activeFoodButtons.find(
      (button) =>
        button.dataset.foodId ===
        currentRequest?.id
    ) || null;
  }

  function handleSnatcherSteal() {
    snatcherTimerId = null;

    if (
      !roundActive ||
      currentLevelIndex < 2 ||
      snatcherActive
    ) {
      return;
    }

    const targetButton =
      findRequestedFoodButton();

    if (!targetButton || !monsterSnatcher) {
      return;
    }

    snatcherActive = true;
    roundActive = false;

    if (clickGameCore) {
      clickGameCore.pause();
    }

    const arenaRect =
      monsterArena.getBoundingClientRect();

    const targetRect =
      targetButton.getBoundingClientRect();

    const targetX =
      targetRect.left -
      arenaRect.left +
      targetRect.width / 2;

    const targetY =
      targetRect.top -
      arenaRect.top +
      targetRect.height / 2;

    monsterSnatcher.style.setProperty(
      "--snatch-x",
      `${targetX}px`
    );

    monsterSnatcher.style.setProperty(
      "--snatch-y",
      `${targetY}px`
    );

    monsterSnatcher.hidden = false;

    void monsterSnatcher.offsetWidth;

    monsterSnatcher.classList.add(
      "is-snatching"
    );

    targetButton.classList.add(
      "is-being-stolen"
    );

    monsterStatus.textContent =
      `Too slow! The snack snatcher stole ${currentRequest.label}.`;

    window.setTimeout(() => {
      targetButton.classList.add(
        "is-stolen"
      );
    }, 520);

    window.setTimeout(() => {
      roundActive = true;

      applyMiss(
        `Too slow! The snack snatcher stole ${currentRequest.label}.`
      );

      clearFoods();
      resetSnatcherVisual();

      if (missesRemaining <= 0) {
        return;
      }

      roundActive = true;

      if (clickGameCore) {
        clickGameCore.reset();
        clickGameCore.resume();
      }

      startFoodRound();
    }, 1050);
  }

  function startSnatcherTimer() {
    stopSnatcherTimer();

    if (currentLevelIndex < 2) {
      return;
    }

    const delay =
      Number(
        getCurrentLevel()
          .snatcherDelaySeconds
      );

    if (
      !Number.isFinite(delay) ||
      delay <= 0
    ) {
      return;
    }

    snatcherTimerId =
      window.setTimeout(
        handleSnatcherSteal,
        delay * 1000
      );
  }

  function clearFoods() {
    activeFoodButtons.forEach((button) => {
      if (clickGameCore) {
        clickGameCore.unregisterTarget(button);
      }

      button.remove();
    });

    activeFoodButtons = [];
  }

  function showClickOnceWarning() {
    if (!monsterClickWarning) {
      return;
    }

    monsterClickWarning.hidden = false;
    monsterClickWarning.classList.add("is-visible");

    window.setTimeout(() => {
      monsterClickWarning.classList.remove("is-visible");
      monsterClickWarning.hidden = true;
    }, 1200);
  }

  function applyMiss(message) {
    if (!roundActive) {
      return;
    }

    missesRemaining = Math.max(
      0,
      missesRemaining - 1
    );

    updateHud();

    monsterStatus.textContent = message;

    if (missesRemaining <= 0) {
      roundActive = false;
      stopMonsterTimer();
      clearFoods();

      if (clickGameCore) {
        clickGameCore.pause();
      }

      monsterRequestedFood.textContent =
        "TRY AGAIN";

      monsterStartButton.hidden = false;
      monsterStartButton.textContent =
        "Try Again";
    }
  }

  function chooseRoundFoods() {
    const levelNumber =
      currentLevelIndex + 1;

    const availableFoods =
      FOODS.filter(
        (food) =>
          !food.minLevel ||
          food.minLevel <= levelNumber
      );

    const shuffled =
      [...availableFoods].sort(
        () => Math.random() - 0.5
      );

    const choices = shuffled.slice(
      0,
      getCurrentLevel().choiceCount
    );

    currentRequest =
      choices[
        Math.floor(Math.random() * choices.length)
      ];

    return choices;
  }

  function handleWrongFood(button, food) {
    if (!roundActive) {
      return;
    }

    stopSnatcherTimer();
    roundActive = false;

    if (clickGameCore) {
      clickGameCore.pause();
    }

    button.classList.add("is-wrong-launch");

    if (monsterCharacter) {
      monsterCharacter.classList.add(
        "is-wrong-reaction"
      );
    }

    window.setTimeout(() => {
      button.classList.add("is-splatted");
    }, 260);

    window.setTimeout(() => {
      applyMiss(
        `Not ${food.label}. Find ${currentRequest.label}.`
      );

      clearFoods();

      if (monsterCharacter) {
        monsterCharacter.classList.remove(
          "is-wrong-reaction"
        );
      }

      if (missesRemaining <= 0) {
        return;
      }

      roundActive = true;

      if (clickGameCore) {
        clickGameCore.reset();
        clickGameCore.resume();
      }

      startFoodRound();
    }, 620);
  }

  function handleCorrectFood(button, food) {
    if (!roundActive) {
      return;
    }

    stopSnatcherTimer();
    roundActive = false;

    if (clickGameCore) {
      clickGameCore.pause();
    }

    const buttonRect =
      button.getBoundingClientRect();

    const monsterRect =
      monsterMouth
        ? monsterMouth.getBoundingClientRect()
        : monsterCharacter
          ? monsterCharacter.getBoundingClientRect()
          : null;

    if (monsterRect) {
      const buttonCenterX =
        buttonRect.left + buttonRect.width / 2;

      const buttonCenterY =
        buttonRect.top + buttonRect.height / 2;

      const monsterCenterX =
        monsterRect.left + monsterRect.width / 2;

      const monsterCenterY =
        monsterRect.top + monsterRect.height * 0.7;

      button.style.setProperty(
        "--feed-x",
        `${monsterCenterX - buttonCenterX}px`
      );

      button.style.setProperty(
        "--feed-y",
        `${monsterCenterY - buttonCenterY}px`
      );
    }

    activeFoodButtons.forEach((foodButton) => {
      if (foodButton !== button) {
        foodButton.classList.add("is-waiting");
      }
    });

    button.classList.add("is-feeding");

    if (monsterCharacter) {
      monsterCharacter.classList.add("is-chomping");
    }

    monsterStatus.textContent =
      `Yum! ${food.label}!`;

    window.setTimeout(() => {
      score += 1;
      updateHud();

      if (monsterCharacter) {
        monsterCharacter.classList.remove(
          "is-chomping"
        );
      }

      clearFoods();

      if (score >= getCurrentLevel().goal) {
        stopMonsterTimer();

        monsterRequestedFood.textContent =
          "LEVEL COMPLETE";

        if (
          currentLevelIndex <
          MONSTER_LEVELS.length - 1
        ) {
          monsterStartButton.hidden = false;
          monsterStartButton.textContent =
            "Level Up";
        } else {
          monsterStartButton.hidden = false;
          monsterStartButton.textContent =
            "Play Again";
        }

        return;
      }

      roundActive = true;

      if (clickGameCore) {
        clickGameCore.reset();
        clickGameCore.resume();
      }

      startFoodRound();
    }, 650);
  }

  function createFoodButton(food, index) {
    const button =
      document.createElement("button");

    button.type = "button";
    button.className = "monster-food";

    button.setAttribute(
      "aria-label",
      food.label
    );

    button.dataset.foodId = food.id;

    button.innerHTML = `
      <span class="monster-food-emoji" aria-hidden="true">
        ${food.emoji}
      </span>
      <span class="monster-food-label">
        ${food.label}
      </span>
    `;

    const level = getCurrentLevel();

    function buildFoodPositions(count) {
      if (count <= 3) {
        return [
          { left: "27%", top: "70%" },
          { left: "50%", top: "72%" },
          { left: "73%", top: "70%" },
        ].slice(0, count);
      }

      if (count <= 5) {
        const lefts = [18, 34, 50, 66, 82];

        return lefts
          .slice(0, count)
          .map((left, positionIndex) => ({
            left: `${left}%`,
            top:
              positionIndex % 2 === 0
                ? "69%"
                : "75%",
          }));
      }

      const columns = Math.min(5, count);
      const rows = Math.ceil(count / columns);
      const positions = [];

      for (let itemIndex = 0; itemIndex < count; itemIndex += 1) {
        const row =
          Math.floor(itemIndex / columns);

        const column =
          itemIndex % columns;

        const itemsInThisRow =
          row === rows - 1
            ? count - row * columns
            : columns;

        const rowColumn =
          column;

        const spacing =
          68 / Math.max(1, itemsInThisRow - 1);

        const left =
          itemsInThisRow === 1
            ? 50
            : 16 + spacing * rowColumn;

        const top =
          rows === 1
            ? 72
            : row === 0
              ? 64
              : 80;

        positions.push({
          left: `${left}%`,
          top: `${top}%`,
        });
      }

      return positions;
    }

    const positions =
      buildFoodPositions(level.choiceCount);

    const position = positions[index];

    button.style.left = position.left;
    button.style.top = position.top;
    button.style.width =
      `${level.foodSize}px`;
    button.style.height =
      `${level.foodSize}px`;
    button.style.setProperty(
      "--food-splat-color",
      food.splatColor
    );

    monsterFoodField.appendChild(button);
    activeFoodButtons.push(button);

    if (clickGameCore) {
      clickGameCore.registerTarget(
        button,
        {
          id: `monster-food-${food.id}`,
          isClickable: () => true,
          onPending: ({ element }) => {
            element.classList.add("is-pending");
          },
          onClick: ({ element }) => {
            if (!roundActive) {
              return;
            }

            if (food.id === currentRequest.id) {
              handleCorrectFood(
                element,
                food
              );
            } else {
              element.classList.remove(
                "is-pending"
              );

              handleWrongFood(
                element,
                food
              );
            }
          },
          onInvalidated: ({ element }) => {
            element.classList.remove(
              "is-pending"
            );

            showClickOnceWarning();

            applyMiss(
              "Too fast! Click once, then wait."
            );
          },
        }
      );

      if (
        level.moving &&
        typeof clickGameCore.startTargetMovement === "function"
      ) {
        clickGameCore.startTargetMovement(
          button,
          {
            speed: level.moveSpeed,
            minX: 12,
            maxX: 88,
            minY: 56,
            maxY: 84,
          }
        );
      }
    }
  }

  function startFoodRound() {
    clearFoods();

    if (!roundActive) {
      return;
    }

    const choices = chooseRoundFoods();

    monsterRequestedFood.textContent =
      currentRequest.label;

    monsterStatus.textContent =
      `Find ${currentRequest.label} and click it once.`;

    choices.forEach(
      (food, index) => {
        createFoodButton(food, index);
      }
    );

    startSnatcherTimer();
  }

  function startCurrentLevel() {
    stopSnatcherTimer();
    resetSnatcherVisual();
    clearFoods();

    score = 0;
    missesRemaining =
      getCurrentLevel().missesAllowed;
    roundActive = true;

    updateHud();

    if (clickGameCore) {
      clickGameCore.reset();
      clickGameCore.resume();
    }

    monsterStartButton.hidden = true;

    startMonsterTimer();
    startFoodRound();
  }

  function handleStartButton() {
    if (
      monsterStartButton.textContent.trim() ===
      "Level Up"
    ) {
      stopMonsterTimer();
      stopSnatcherTimer();
      resetSnatcherVisual();

      currentLevelIndex += 1;

      score = 0;
      missesRemaining =
        getCurrentLevel().missesAllowed;
      roundActive = false;

      updateHud();

      monsterRequestedFood.textContent =
        "READY";

      monsterStartButton.textContent =
        `Start Level ${currentLevelIndex + 1}`;

      return;
    }

    if (
      monsterStartButton.textContent.trim() ===
      "Play Again"
    ) {
      currentLevelIndex = 0;
    }

    startCurrentLevel();
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

  monsterStartButton.addEventListener(
    "click",
    handleStartButton
  );

  updateHud();
})();
