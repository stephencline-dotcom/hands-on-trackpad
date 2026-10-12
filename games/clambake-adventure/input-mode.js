(() => {
  "use strict";

  const state = {
    requireClickAndDrag: false,
    difficulty: "normal",
    activeLevels: [true, true, true, true],
    ready: false
  };

  function parseBoolean(
    value,
    fallback = false
  ) {
    if (
      value === true ||
      value === "true"
    ) {
      return true;
    }

    if (
      value === false ||
      value === "false"
    ) {
      return false;
    }

    return fallback;
  }

  function normalizeClambakeActiveLevels(value) {
    if (!Array.isArray(value) || value.length !== 4) {
      return [true, true, true, true];
    }

    const levels = value.map((enabled) => enabled === true);

    return levels.some(Boolean)
      ? levels
      : [true, true, true, true];
  }

  function nextActiveLevel(afterLevel) {
    for (let level = afterLevel + 1; level <= 4; level += 1) {
      if (state.activeLevels[level - 1]) {
        return level;
      }
    }

    return null;
  }
  const levelPreviews = new Map();

  function registerPreview(level, builder) {
    if (
      Number.isInteger(level) &&
      level >= 2 &&
      level <= 4 &&
      typeof builder === "function"
    ) {
      levelPreviews.set(level, builder);
    }
  }
  const levelStarters = new Map();

  function registerLevel(level, starter) {
    if (
      !Number.isInteger(level) ||
      level < 1 ||
      level > 4 ||
      typeof starter !== "function"
    ) {
      return;
    }

    levelStarters.set(level, starter);
    scheduleClambakeStartup();
    updateClambakeContinueButtons();
  }

  function launchLevel(level) {
    if (!state.ready) {
      return false;
    }

    if (!state.activeLevels[level - 1]) {
      return false;
    }

    const starter = levelStarters.get(level);

    if (!starter) {
      return false;
    }

    // Hide completed Level 1 overlay before switching levels
    if (level > 1) {
      const previousWinOverlay =
        document.getElementById("winOverlay");

      if (previousWinOverlay) {
        previousWinOverlay.hidden = true;
      }
    }

    starter();
    return true;
  }
  window.clambakeInputMode = {
    requiresClickAndDrag() {
      return state.requireClickAndDrag;
    },

    cursorMode() {
      return !state.requireClickAndDrag;
    },

    difficulty() {
      return state.difficulty;
    },

    speedMultiplier() {
      return state.difficulty === "easy" ? 0.65 : 1;
    },

    registerLevel(level, starter) {
      registerLevel(level, starter);
    },

    registerPreview(level, builder) {
      registerPreview(level, builder);
    },

    launchLevel(level) {
      return launchLevel(level);
    },
    activeLevels() {
      return [...state.activeLevels];
    },

    firstActiveLevel() {
      return nextActiveLevel(0);
    },

    nextActiveLevel(level) {
      return nextActiveLevel(level);
    },

    isLevelActive(level) {
      return state.activeLevels[level - 1] === true;
    },
    isReady() {
      return state.ready;
    }
  };

  let startupScheduled = false;
  let startupCompleted = false;

  function startFirstEnabledClambakeLevel() {
    if (!state.ready || startupCompleted) {
      return;
    }

    const firstLevel = nextActiveLevel(0);

    if (firstLevel === null) {
      return;
    }

    // Preserve the original Level 1 start screen.
    if (firstLevel === 1) {
      startupCompleted = true;
      return;
    }

    if (!levelStarters.has(firstLevel)) {
      return;
    }

    // Clambake level-specific welcome screens
    const startOverlay =
      document.getElementById("startOverlay");

    if (startOverlay) {
      startOverlay.hidden = true;
    }

    const welcomeData = {
      2: {
        title: "Gather the Feast",
        description:
          "Collect the food needed for the feast."
      },
      3: {
        title: "Prepare the Cooking Pit",
        description:
          "Bring the materials in the correct order to prepare the cooking pit."
      },
      4: {
        title: "Reveal and Serve the Feast",
        description:
          "Uncover the food and help serve the feast."
      }
    };

    const details = welcomeData[firstLevel];

    if (!details) {
      return;
    }

    const stage =
      document.getElementById("beachStage");

    if (!stage) {
      return;
    }

    const welcome =
      document.createElement("div");

    welcome.id =
      "clambakeLevelWelcome";

    welcome.className =
      "game-overlay";

    welcome.style.zIndex =
      "9999";

    welcome.innerHTML = `
      <div class="overlay-card">
        <span class="overlay-kicker">
          LEVEL ${firstLevel}
        </span>

        <h2>${details.title}</h2>

        <p>${details.description}</p>

        <button
          id="clambakeLevelWelcomeButton"
          class="primary-button"
          type="button"
        >
          START LEVEL ${firstLevel}
        </button>
      </div>
    `;

    // Clambake shared level welcome scenery preview
    const previewClasses = {
      2: {
        layer: ".gather-layer",
        activeClass: "gather-feast-active"
      },
      3: {
        layer: ".pit-layer",
        activeClass: "pit-prep-active"
      },
      4: {
        layer: ".reveal-feast-layer",
        activeClass: "reveal-feast-active"
      }
    };

    const preview = previewClasses[firstLevel];
    const builder = levelPreviews.get(firstLevel);

    if (preview && builder) {
      builder();

      const previewLayer =
        stage.querySelector(preview.layer);

      if (previewLayer) {
        previewLayer.hidden = false;
        previewLayer.style.display = "";
      }

      stage.classList.add(
        preview.activeClass,
        "clambake-welcome-preview"
      );
    }
stage.appendChild(welcome);

    const startButton =
      welcome.querySelector(
        "#clambakeLevelWelcomeButton"
      );

    startButton.addEventListener(
      "click",
      () => {
        welcome.remove();

        // Remove scenery preview restrictions before gameplay
        stage.classList.remove(
          "clambake-welcome-preview"
        );

        launchLevel(firstLevel);
      },
      { once: true }
    );

    startupCompleted = true;
  }

  function scheduleClambakeStartup() {
    if (startupScheduled || startupCompleted) {
      return;
    }

    startupScheduled = true;

    window.setTimeout(() => {
      startupScheduled = false;
      startFirstEnabledClambakeLevel();
    }, 0);
  }
  function updateClambakeContinueButtons() {
    if (!state.ready) {
      return;
    }

    const buttons = [
      ["continueAdventureButton", 1],
      ["continueToPitButton", 2],
      ["continueToFeastButton", 3]
    ];

    buttons.forEach(([id, completedLevel]) => {
      const button = document.getElementById(id);

      if (!button) {
        return;
      }

      const next = nextActiveLevel(completedLevel);

      button.hidden = next === null;
    });
  }

  const continueButtonObserver = new MutationObserver(
    () => {
      updateClambakeContinueButtons();
    }
  );

  continueButtonObserver.observe(
    document.getElementById("beachStage"),
    {
      childList: true,
      subtree: true
    }
  );
  async function load() {
    try {
      const response =
        await fetch(
          "/api/settings",
          {
            cache: "no-store"
          }
        );

      if (response.ok) {
        const settings =
          await response.json();

        state.activeLevels =
          normalizeClambakeActiveLevels(
            settings.clambakeAdventureLevels
          );
        state.difficulty =
          settings.clambakeAdventureDifficulty === "easy"
            ? "easy"
            : "normal";

        state.requireClickAndDrag =
          parseBoolean(
            settings.clambakeAdventureRequireClickAndDrag,
            false
          );
      }
    }
    catch {
      state.difficulty = "normal";
      state.requireClickAndDrag =
        false;
    }

    state.ready =
      true;
    scheduleClambakeStartup();
    updateClambakeContinueButtons();

    document.documentElement
      .classList.toggle(
        "clambake-requires-drag",
        state.requireClickAndDrag
      );

    document.documentElement
      .classList.toggle(
        "clambake-cursor-mode",
        !state.requireClickAndDrag
      );

    window.dispatchEvent(
      new CustomEvent(
        "clambake-input-mode-ready",
        {
          detail: {
            requireClickAndDrag:
              state.requireClickAndDrag,
            difficulty: state.difficulty
          }
        }
      )
    );
  }


  /* =======================================================
     CLAMBAKE TRACKPAD GUIDE CONTROLLER
     Follow the real pointer and show click/press state.
     ======================================================= */

  function setupClambakeTrackpadGuide() {
    const scene =
      document.getElementById(
        "clambakeTrackpadScene"
      );

    const leftHand =
      document.getElementById(
        "clambakeTrackpadLeftHand"
      );

    const rightHand =
      document.getElementById(
        "clambakeTrackpadRightHand"
      );

    const pressIndicator =
      scene
        ? scene.querySelector(
            ".imported-trackpad-press-indicator"
          )
        : null;

    if (
      !window.trackpadGuide ||
      !scene ||
      !leftHand ||
      !rightHand
    ) {
      return;
    }

    const controller =
      window.trackpadGuide.create({
        scene,
        leftHand,
        rightHand,
        pressIndicator,
        togglePressIndicator:
          true,
        pointerSpace:
          "viewport"
      });

    if (!controller) {
      return;
    }

    if (
      typeof controller.initialize ===
        "function"
    ) {
      controller.initialize();
    }

    document.addEventListener(
      "pointermove",
      (event) => {
        if (
          typeof controller
            .updateFromPointerEvent ===
            "function"
        ) {
          controller
            .updateFromPointerEvent(
              event
            );
        }
      }
    );

    document.addEventListener(
      "pointerdown",
      (event) => {
        // Ignore artificial pickup events generated by Clambake.
        // Only real physical presses should animate the guide.
        if (!event.isTrusted) {
          return;
        }
        if (
          typeof controller
            .updateFromPointerEvent ===
            "function"
        ) {
          controller
            .updateFromPointerEvent(
              event
            );
        }

        if (
          typeof controller.setPressed ===
            "function"
        ) {
          controller.setPressed(
            true
          );
        }
      }
    );

    document.addEventListener(
      "pointerup",
      (event) => {
        if (
          typeof controller
            .updateFromPointerEvent ===
            "function"
        ) {
          controller
            .updateFromPointerEvent(
              event
            );
        }

        if (
          typeof controller.setPressed ===
            "function"
        ) {
          controller.setPressed(
            false
          );
        }
      }
    );

    document.addEventListener(
      "pointercancel",
      () => {
        if (
          typeof controller.setPressed ===
            "function"
        ) {
          controller.setPressed(
            false
          );
        }
      }
    );

    window.addEventListener(
      "blur",
      () => {
        if (
          typeof controller.setPressed ===
            "function"
        ) {
          controller.setPressed(
            false
          );
        }
      }
    );
  }
  setupClambakeTrackpadGuide();

  load();
})();