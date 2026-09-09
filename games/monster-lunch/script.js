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

  const monsterSoundButton =
    document.getElementById("monsterSoundButton");

  const monsterSplatSound =
    new Audio("../../sounds/splat.mp3");

  const monsterCrunchSound =
    new Audio("../../sounds/crunch.mp3");

  const monsterYoinkSound =
    new Audio("../../sounds/yoink.mp3");

  monsterSplatSound.preload = "auto";
  monsterCrunchSound.preload = "auto";
  monsterYoinkSound.preload = "auto";

  let monsterSoundEnabled = true;

  function updateMonsterSoundButton() {
    if (!monsterSoundButton) {
      return;
    }

    monsterSoundButton.textContent =
      monsterSoundEnabled ? "🔊" : "🔇";

    monsterSoundButton.setAttribute(
      "aria-pressed",
      String(!monsterSoundEnabled)
    );

    monsterSoundButton.setAttribute(
      "aria-label",
      monsterSoundEnabled
        ? "Sound on"
        : "Sound off"
    );

    monsterSoundButton.title =
      monsterSoundEnabled
        ? "Sound on"
        : "Sound off";
  }

  function playMonsterSound(audio) {
    if (!audio || !monsterSoundEnabled) {
      return;
    }

    try {
      audio.currentTime = 0;

      const playPromise = audio.play();

      if (
        playPromise &&
        typeof playPromise.catch === "function"
      ) {
        playPromise.catch(() => {});
      }
    } catch {
      // Ignore audio playback failures.
    }
  }

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

  const MONSTER_SETTINGS_KEY =
    "moving-sound-admin-settings-v1";

  const DEFAULT_MONSTER_LEVELS = [
    {
      goal: 5,
      missesAllowed: 3,
      choiceCount: 3,
      foodSize: 118,
      moving: false,
      moveSpeed: 0,
      timeLimitEnabled: false,
      timeLimit: 35,
      snatcherDelaySeconds: 0,
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
      snatcherDelaySeconds: 0,
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

  function clampMonsterNumber(
    value,
    min,
    max,
    fallback
  ) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return Math.min(
      max,
      Math.max(min, parsed)
    );
  }

  function normalizeMonsterLevel(
    level,
    defaults,
    index
  ) {
    const source =
      level && typeof level === "object"
        ? level
        : {};

    return {
      goal: Math.round(
        clampMonsterNumber(
          source.goal,
          1,
          100,
          defaults.goal
        )
      ),

      missesAllowed: Math.round(
        clampMonsterNumber(
          source.missesAllowed,
          1,
          20,
          defaults.missesAllowed
        )
      ),

      choiceCount: Math.round(
        clampMonsterNumber(
          source.choiceCount,
          3,
          10,
          defaults.choiceCount
        )
      ),

      foodSize: Math.round(
        clampMonsterNumber(
          source.foodSize,
          60,
          140,
          defaults.foodSize
        )
      ),

      moving: index >= 2,

      moveSpeed:
        index >= 2
          ? clampMonsterNumber(
              source.moveSpeed,
              1,
              10,
              defaults.moveSpeed
            )
          : 0,

      timeLimitEnabled:
        source.timeLimitEnabled === true ||
        source.timeLimitEnabled === "true",

      timeLimit: Math.round(
        clampMonsterNumber(
          source.timeLimit,
          10,
          300,
          defaults.timeLimit
        )
      ),

      snatcherDelaySeconds:
        index >= 2
          ? clampMonsterNumber(
              source.snatcherDelaySeconds,
              1,
              15,
              defaults.snatcherDelaySeconds
            )
          : 0,
    };
  }

  function normalizeMonsterLevels(levels) {
    return DEFAULT_MONSTER_LEVELS.map(
      (defaults, index) =>
        normalizeMonsterLevel(
          Array.isArray(levels)
            ? levels[index]
            : null,
          defaults,
          index
        )
    );
  }

  function loadLocalMonsterLevels() {
    try {
      const raw =
        localStorage.getItem(
          MONSTER_SETTINGS_KEY
        );

      const parsed =
        raw ? JSON.parse(raw) : {};

      return normalizeMonsterLevels(
        parsed.monsterLunchLevels
      );
    } catch {
      return normalizeMonsterLevels(
        DEFAULT_MONSTER_LEVELS
      );
    }
  }

  let MONSTER_LEVELS =
    loadLocalMonsterLevels();

  function cacheMonsterLevels(levels) {
    try {
      const raw =
        localStorage.getItem(
          MONSTER_SETTINGS_KEY
        );

      const parsed =
        raw ? JSON.parse(raw) : {};

      parsed.monsterLunchLevels =
        levels;

      localStorage.setItem(
        MONSTER_SETTINGS_KEY,
        JSON.stringify(parsed)
      );
    } catch {
      // Game can continue with remote/default settings.
    }
  }

  async function loadRemoteMonsterLevels() {
    try {
      const response = await fetch(
        "/api/settings",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return;
      }

      const settings =
        await response.json();

      const remoteLevels =
        Array.isArray(
          settings.monsterLunchLevels
        )
          ? settings.monsterLunchLevels
          : settings.movingSoundSettings &&
              Array.isArray(
                settings.movingSoundSettings
                  .monsterLunchLevels
              )
            ? settings.movingSoundSettings
                .monsterLunchLevels
            : null;

      if (!remoteLevels) {
        return;
      }

      MONSTER_LEVELS =
        normalizeMonsterLevels(
          remoteLevels
        );

      cacheMonsterLevels(
        MONSTER_LEVELS
      );

      updateHud();
    } catch {
      // Keep local/default settings if API is unavailable.
    }
  }

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
  let monsterLevelResult = null;

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

  function pauseMonsterGameplay() {
    roundActive = false;

    stopMonsterTimer();
    stopSnatcherTimer();

    if (clickGameCore) {
      clickGameCore.pause();
    }
  }

  function handleMonsterTimeExpired() {
    pauseMonsterGameplay();
    clearFoods();

    monsterRequestedFood.textContent =
      "TIME UP";

    updateMonsterTimeDisplay();

    if (monsterLevelResult) {
      monsterLevelResult.showFailure({
        title: "Try Again!",
        message:
          "Time is up. Try the level again.",
        primaryLabel: "Try Again",
      });
    }
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
      playMonsterSound(
        monsterYoinkSound
      );

      targetButton.classList.add(
        "is-stolen"
      );
    }, 450);

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
      pauseMonsterGameplay();
      clearFoods();

      monsterRequestedFood.textContent =
        "TRY AGAIN";

      if (monsterLevelResult) {
        monsterLevelResult.showFailure({
          title: "Try Again!",
          message:
            "No misses left. Try the level again.",
          primaryLabel: "Try Again",
        });
      }
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

      playMonsterSound(
        monsterSplatSound
      );
    }, 170);

    window.setTimeout(() => {
      /*
       * The food animation temporarily pauses the
       * round. Re-enable the round just long enough
       * for applyMiss() to record the miss.
       */
      roundActive = true;

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
      playMonsterSound(
        monsterCrunchSound
      );
    }, 360);

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
        pauseMonsterGameplay();

        monsterRequestedFood.textContent =
          "LEVEL COMPLETE";

        const completedLevel =
          currentLevelIndex + 1;

        const isFinalLevel =
          currentLevelIndex >=
          MONSTER_LEVELS.length - 1;

        if (monsterLevelResult) {
          if (isFinalLevel) {
            monsterLevelResult.showFinal({
              title: "You Did It!",
              message:
                "You completed all 4 Monster Lunch levels!",
              primaryLabel: "Play Again",
            });
          } else {
            monsterLevelResult.showSuccess({
              title: "Level Complete!",
              message:
                `Great job! Click Level Up for Level ${completedLevel + 1}.`,
              primaryLabel: "Level Up",
            });
          }
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

    /*
     * Always start the requested food in one of the
     * lowest food positions so students can clearly
     * see the food they are being asked to find.
     */
    let requestedStartIndex;

    if (choices.length <= 3) {
      requestedStartIndex = Math.min(
        1,
        choices.length - 1
      );
    } else if (choices.length <= 5) {
      requestedStartIndex = Math.min(
        3,
        choices.length - 1
      );
    } else {
      requestedStartIndex =
        choices.length - 1;
    }

    const requestedIndex =
      choices.findIndex(
        (food) =>
          food.id === currentRequest.id
      );

    if (
      requestedIndex >= 0 &&
      requestedIndex !== requestedStartIndex
    ) {
      [
        choices[requestedIndex],
        choices[requestedStartIndex],
      ] = [
        choices[requestedStartIndex],
        choices[requestedIndex],
      ];
    }

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

    if (monsterLevelResult) {
      monsterLevelResult.hide();
    }

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

  function prepareNextMonsterLevel() {
    if (
      currentLevelIndex >=
      MONSTER_LEVELS.length - 1
    ) {
      return;
    }

    currentLevelIndex += 1;

    if (monsterLevelResult) {
      monsterLevelResult.hide();
    }

    score = 0;
    missesRemaining =
      getCurrentLevel().missesAllowed;
    roundActive = false;

    updateHud();

    monsterRequestedFood.textContent =
      "READY";

    monsterStartButton.hidden = false;
    monsterStartButton.textContent =
      `Start Level ${currentLevelIndex + 1}`;
  }

  function retryMonsterLevel() {
    if (monsterLevelResult) {
      monsterLevelResult.hide();
    }

    startCurrentLevel();
  }

  function playMonsterAgain() {
    currentLevelIndex = 0;

    if (monsterLevelResult) {
      monsterLevelResult.hide();
    }

    startCurrentLevel();
  }

  function handleStartButton() {
    startCurrentLevel();
  }

  if (
    window.LevelResultController &&
    monsterArena
  ) {
    monsterLevelResult =
      new window.LevelResultController({
        host: monsterArena,
        pauseGame: pauseMonsterGameplay,
        onNextLevel:
          prepareNextMonsterLevel,
        onRetry:
          retryMonsterLevel,
        onPlayAgain:
          playMonsterAgain,
        onHome: () => {
          window.location.href =
            "../../index.html";
        },
        canPlaySound: () =>
          monsterSoundEnabled,
      });
  }

  if (monsterSoundButton) {
    monsterSoundButton.addEventListener(
      "click",
      () => {
        monsterSoundEnabled =
          !monsterSoundEnabled;

        if (!monsterSoundEnabled) {
          [
            monsterSplatSound,
            monsterCrunchSound,
            monsterYoinkSound,
          ].forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
          });
        }

        updateMonsterSoundButton();
      }
    );
  }

  updateMonsterSoundButton();

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

  loadRemoteMonsterLevels();
})();
