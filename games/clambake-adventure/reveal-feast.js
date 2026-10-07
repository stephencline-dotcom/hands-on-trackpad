(() => {
  "use strict";

  const stage =
    document.getElementById(
      "beachStage"
    );

  const instructionText =
    document.getElementById(
      "instructionText"
    );

  const missionLabel =
    document.querySelector(
      ".mission-label"
    );

  const clamProgress =
    document.querySelector(
      ".clam-progress"
    );

  const soundToggle =
    document.getElementById(
      "soundToggle"
    );

  if (
    !stage ||
    !instructionText
  ) {
    return;
  }

  const ROUNDS = [
    {
      food: "clam",
      label: "Clams",
      waitMin: 1100,
      waitMax: 1700,
      previewTime: 1200,
      safeTime: 2100
    },
    {
      food: "corn",
      label: "Corn",
      waitMin: 950,
      waitMax: 1500,
      previewTime: 1000,
      safeTime: 1750
    },
    {
      food: "lobster",
      label: "Lobster",
      waitMin: 800,
      waitMax: 1300,
      previewTime: 800,
      safeTime: 1450
    },
    {
      food: "potato",
      label: "Potato",
      waitMin: 650,
      waitMax: 1100,
      previewTime: 650,
      safeTime: 1200
    }
  ];
  const state = {
    active: false,
    round: 0,
    dragging: false,
    pointerId: null,
    helperX: 15,
    helperY: 76,
    targetIndex: -1,
    safe: false,
    waiting: false,
    cueTimer: 0,
    closeTimer: 0,
    revealed: []
  };

  let layer = null;
  let helper = null;
  let readyMessage = null;
  let roundText = null;
  let progress = null;
  let completeOverlay = null;
  let steam = null;
  let covers = [];

  function soundEnabled() {
    return (
      !soundToggle ||
      soundToggle.getAttribute(
        "aria-pressed"
      ) !== "false"
    );
  }

  /*
   * CLAMBAKE VOICE DIRECTIONS
   * Loaded from the shared Hands-On Trackpad settings API.
   * This is intentionally separate from the game's Sound On/Off control.
   */
  if (!window.clambakeAdventureVoiceSettingsReady) {
    window.clambakeAdventureVoiceSettingsLoaded = false;
    window.clambakeAdventureVoiceDirections = true;

    window.clambakeAdventureVoiceSettingsReady =
      fetch("/api/settings", {
        cache: "no-store"
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Unable to load Clambake voice settings.");
          }

          return response.json();
        })
        .then((settings) => {
          window.clambakeAdventureVoiceDirections =
            settings.clambakeAdventureVoiceDirections !== false;

          window.clambakeAdventureVoiceSettingsLoaded = true;

          if (
            !window.clambakeAdventureVoiceDirections &&
            "speechSynthesis" in window
          ) {
            window.speechSynthesis.cancel();
          }
        })
        .catch(() => {
          window.clambakeAdventureVoiceDirections = true;
          window.clambakeAdventureVoiceSettingsLoaded = true;
        });
  }
  function speak(message) {
    if (
      !window.clambakeAdventureVoiceSettingsLoaded &&
      window.clambakeAdventureVoiceSettingsReady
    ) {
      window.clambakeAdventureVoiceSettingsReady.then(() => {
        speak(message);
      });
      return;
    }

    if (
      window.clambakeAdventureVoiceDirections === false ||
      !(
        "speechSynthesis" in window
      )
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        message
      );

    utterance.rate = .94;
    utterance.pitch = 1.03;

    window.speechSynthesis.speak(
      utterance
    );
  }

  function successTone() {
    if (!soundEnabled()) {
      return;
    }

    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      const context =
        new AudioContext();

      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      oscillator.type =
        "sine";

      oscillator.frequency.setValueAtTime(
        510,
        context.currentTime
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        760,
        context.currentTime + .16
      );

      gain.gain.setValueAtTime(
        .0001,
        context.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        .11,
        context.currentTime + .025
      );

      gain.gain.exponentialRampToValueAtTime(
        .0001,
        context.currentTime + .25
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(
        context.currentTime + .28
      );
    } catch (error) {
      // Sound is optional.
    }
  }

  function steamTone() {
    if (!soundEnabled()) {
      return;
    }

    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      const context =
        new AudioContext();

      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      oscillator.type =
        "triangle";

      oscillator.frequency.setValueAtTime(
        180,
        context.currentTime
      );

      oscillator.frequency.exponentialRampToValueAtTime(
        95,
        context.currentTime + .22
      );

      gain.gain.setValueAtTime(
        .08,
        context.currentTime
      );

      gain.gain.exponentialRampToValueAtTime(
        .0001,
        context.currentTime + .28
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(
        context.currentTime + .3
      );
    } catch (error) {
      // Sound is optional.
    }
  }

  function buildLayer() {
    if (layer) {
      return;
    }

    layer =
      document.createElement(
        "div"
      );

    layer.id =
      "revealFeastLayer";

    layer.className =
      "reveal-feast-layer";

    layer.hidden =
      true;

    layer.innerHTML = `
      <div class="feast-top-card">
        <span class="feast-level-label">
          LEVEL 4 - REVEAL THE FEAST
        </span>

        <strong>
          Watch the steam. Move when it says NOW!
        </strong>

        <span>
          Click, hold, and drag the helper to the safe opening.
        </span>
      </div>

      <div
        id="feastRound"
        class="feast-round"
      >
        REVEAL 1 OF 4
      </div>

      <div
        id="feastReadyMessage"
        class="feast-ready-message"
      >
        WATCH...
      </div>

      <div
        id="feastProgress"
        class="feast-progress"
        aria-label="Feast reveal progress"
      >
        <i></i>
        <i></i>
        <i></i>
        <i></i>
      </div>

      <div class="feast-scene">

        <div
          id="feastPit"
          class="feast-pit"
        >
          <span class="feast-stone s1"></span>
          <span class="feast-stone s2"></span>
          <span class="feast-stone s3"></span>
          <span class="feast-stone s4"></span>
          <span class="feast-stone s5"></span>
          <span class="feast-stone s6"></span>
          <span class="feast-stone s7"></span>
          <span class="feast-stone s8"></span>

          <div class="feast-center">
            <div
              class="feast-food-reveal clam"
              data-food="clam"
            ></div>

            <div
              class="feast-food-reveal corn"
              data-food="corn"
            ></div>

            <div
              class="feast-food-reveal lobster"
              data-food="lobster"
            ></div>

            <div
              class="feast-food-reveal potato"
              data-food="potato"
            ></div>
          </div>

          <div
            class="feast-cover c1"
            data-index="0"
          ></div>

          <div
            class="feast-cover c2"
            data-index="1"
          ></div>

          <div
            class="feast-cover c3"
            data-index="2"
          ></div>

          <div
            class="feast-cover c4"
            data-index="3"
          ></div>

          <div
            id="feastSteam"
            class="feast-steam"
          ></div>
        </div>

        <div
          id="feastHelper"
          class="feast-helper"
          role="button"
          tabindex="0"
          aria-label="Wampanoag helper. Click, hold, and drag."
        >
          <div class="feast-helper-head"></div>
          <div class="feast-helper-body"></div>
          <span class="feast-helper-arm left"></span>
          <span class="feast-helper-arm right"></span>
          <span class="feast-helper-leg left"></span>
          <span class="feast-helper-leg right"></span>
        </div>

      </div>

      <div class="feast-pointer-hint">
        CLICK + HOLD + DRAG<br>
        Reach the glowing cover while it says NOW!
      </div>

      <div
        id="feastComplete"
        class="feast-complete"
        hidden
      >
        <div class="feast-complete-card">

          <span class="overlay-kicker">
            THE FEAST IS READY!
          </span>

          <h2>
            Clambake Celebration
          </h2>

          <p>
            You carefully uncovered the cooked food.
            The community can gather and share the feast.
          </p>

          <div
            class="feast-community"
            aria-hidden="true"
          >
            <div class="feast-person">
              <div class="head"></div>
              <div class="body"></div>
              <span class="arm left"></span>
              <span class="arm right"></span>
              <span class="leg left"></span>
              <span class="leg right"></span>
            </div>

            <div class="feast-person">
              <div class="head"></div>
              <div class="body"></div>
              <span class="arm left"></span>
              <span class="arm right"></span>
              <span class="leg left"></span>
              <span class="leg right"></span>
            </div>

            <div class="feast-person">
              <div class="head"></div>
              <div class="body"></div>
              <span class="arm left"></span>
              <span class="arm right"></span>
              <span class="leg left"></span>
              <span class="leg right"></span>
            </div>

            <div class="feast-person">
              <div class="head"></div>
              <div class="body"></div>
              <span class="arm left"></span>
              <span class="arm right"></span>
              <span class="leg left"></span>
              <span class="leg right"></span>
            </div>

            <div class="feast-person">
              <div class="head"></div>
              <div class="body"></div>
              <span class="arm left"></span>
              <span class="arm right"></span>
              <span class="leg left"></span>
              <span class="leg right"></span>
            </div>
          </div>

          <div class="feast-final-foods">
            <span>CLAMS</span>
            <span>CORN</span>
            <span>LOBSTER</span>
            <span>POTATOES</span>
          </div>

          <div class="feast-button-row">
            <button
              id="feastAgainButton"
              class="primary-button"
              type="button"
            >
              PLAY LEVEL AGAIN
            </button>
          </div>

        </div>
      </div>
    `;

    stage.appendChild(
      layer
    );

    helper =
      document.getElementById(
        "feastHelper"
      );

    readyMessage =
      document.getElementById(
        "feastReadyMessage"
      );

    roundText =
      document.getElementById(
        "feastRound"
      );

    progress =
      document.getElementById(
        "feastProgress"
      );

    completeOverlay =
      document.getElementById(
        "feastComplete"
      );

    steam =
      document.getElementById(
        "feastSteam"
      );

    covers =
      Array.from(
        layer.querySelectorAll(
          ".feast-cover"
        )
      );

    helper.addEventListener(
      "pointerdown",
      startDrag
    );

    helper.addEventListener(
      "pointermove",
      moveDrag
    );

    helper.addEventListener(
      "pointerup",
      endDrag
    );

    helper.addEventListener(
      "pointercancel",
      endDrag
    );

    document
      .getElementById(
        "feastAgainButton"
      )
      .addEventListener(
        "click",
        startFeastGame
      );
  }

  function ensureContinueButton() {
    const pitComplete =
      document.getElementById(
        "pitComplete"
      );

    if (!pitComplete) {
      return;
    }

    if (
      document.getElementById(
        "continueToFeastButton"
      )
    ) {
      return;
    }

    const card =
      pitComplete.querySelector(
        ".pit-complete-card"
      );

    if (!card) {
      return;
    }

    const oldButton =
      document.getElementById(
        "pitAgainButton"
      );

    const row =
      document.createElement(
        "div"
      );

    row.className =
      "feast-button-row";

    if (
      oldButton &&
      oldButton.parentElement === card
    ) {
      card.insertBefore(
        row,
        oldButton
      );

      row.appendChild(
        oldButton
      );
    } else {
      card.appendChild(
        row
      );
    }

    const button =
      document.createElement(
        "button"
      );

    button.id =
      "continueToFeastButton";

    button.type =
      "button";

    button.className =
      "primary-button";

    button.textContent =
      "REVEAL THE FEAST";

    button.addEventListener(
      "click",
      startFeastGame
    );

    row.insertBefore(
      button,
      row.firstChild
    );
  }

  function clearTimers() {
    if (state.cueTimer) {
      window.clearTimeout(
        state.cueTimer
      );
    }

    if (state.closeTimer) {
      window.clearTimeout(
        state.closeTimer
      );
    }

    state.cueTimer = 0;
    state.closeTimer = 0;
  }

  function randomBetween(
    min,
    max
  ) {
    return (
      min +
      Math.random() *
        (max - min)
    );
  }

  function updateHelper() {
    if (!helper) {
      return;
    }

    helper.style.setProperty(
      "--helper-x",
      `${state.helperX}%`
    );

    helper.style.setProperty(
      "--helper-y",
      `${state.helperY}%`
    );
  }

  function resetHelper() {
    state.helperX = 14;
    state.helperY = 78;

    updateHelper();
  }

  function stagePoint(
    clientX,
    clientY
  ) {
    const rect =
      stage.getBoundingClientRect();

    return {
      x:
        Math.max(
          5,
          Math.min(
            95,
            (
              (
                clientX -
                rect.left
              ) /
              rect.width
            ) * 100
          )
        ),

      y:
        Math.max(
          15,
          Math.min(
            94,
            (
              (
                clientY -
                rect.top
              ) /
              rect.height
            ) * 100
          )
        )
    };
  }

  function startDrag(event) {
    if (
      !state.active ||
      state.pointerId !== null
    ) {
      return;
    }

    state.pointerId =
      event.pointerId;

    state.dragging =
      true;

    helper.classList.add(
      "dragging"
    );

    try {
      helper.setPointerCapture(
        event.pointerId
      );
    } catch (error) {
      // Pointer capture is optional.
    }

    moveDrag(event);
  }

  function moveDrag(event) {
    if (
      !state.dragging ||
      event.pointerId !==
        state.pointerId
    ) {
      return;
    }

    const point =
      stagePoint(
        event.clientX,
        event.clientY
      );

    state.helperX =
      point.x;

    state.helperY =
      point.y;

    updateHelper();

    if (state.safe) {
      checkTargetCollision();
    }

    if (serveState.active) {
      checkServeCollisions();
    }
  }

  function endDrag(event) {
    if (
      event.pointerId !==
      state.pointerId
    ) {
      return;
    }

    state.dragging =
      false;

    state.pointerId =
      null;

    helper.classList.remove(
      "dragging"
    );
  }

  function rectanglesTouch(
    a,
    b,
    padding
  ) {
    return (
      a.left <=
        b.right + padding &&
      a.right >=
        b.left - padding &&
      a.top <=
        b.bottom + padding &&
      a.bottom >=
        b.top - padding
    );
  }

  function checkTargetCollision() {
    if (
      !state.safe ||
      state.targetIndex < 0
    ) {
      return;
    }

    const target =
      covers[
        state.targetIndex
      ];

    if (
      !target ||
      target.classList.contains(
        "revealed"
      )
    ) {
      return;
    }

    const helperRect =
      helper.getBoundingClientRect();

    const targetRect =
      target.getBoundingClientRect();

    if (
      rectanglesTouch(
        helperRect,
        targetRect,
        -4
      )
    ) {
      revealTarget();
    }
  }

  function positionSteam(index) {
    if (!steam) {
      return;
    }

    const positions = [
      [26, 14],
      [64, 14],
      [28, 57],
      [64, 57]
    ];

    const position =
      positions[index];

    steam.style.left =
      `${position[0]}%`;

    steam.style.top =
      `${position[1]}%`;
  }

  function setReadyMessage(
    text,
    mode
  ) {
    readyMessage.textContent =
      text;

    readyMessage.classList.remove(
      "show",
      "hot"
    );

    if (mode === "show") {
      readyMessage.classList.add(
        "show"
      );
    }

    if (mode === "hot") {
      readyMessage.classList.add(
        "show",
        "hot"
      );
    }
  }

  function availableCoverIndexes() {
    return covers
      .map(
        (cover, index) => ({
          cover,
          index
        })
      )
      .filter(
        (item) =>
          !item.cover.classList.contains(
            "revealed"
          )
      )
      .map(
        (item) =>
          item.index
      );
  }

  function scheduleOpening() {
    if (
      !state.active ||
      state.round >=
        ROUNDS.length
    ) {
      return;
    }

    clearTimers();

    state.safe =
      false;

    state.waiting =
      true;

    state.targetIndex =
      -1;

    covers.forEach(
      (cover) => {
        cover.classList.remove(
          "active"
        );
      }
    );

    setReadyMessage(
      "WATCH...",
      "show"
    );

    instructionText.textContent =
      "Watch the steam. Wait for the safe opening.";

    const round =
      ROUNDS[state.round];

    const wait =
      randomBetween(
        round.waitMin,
        round.waitMax
      );

    state.cueTimer =
      window.setTimeout(
        openSafeWindow,
        wait
      );
  }

  function openSafeWindow() {
    if (!state.active) {
      return;
    }

    const choices =
      availableCoverIndexes();

    if (!choices.length) {
      finishFeast();
      return;
    }

    const index =
      choices[
        Math.floor(
          Math.random() *
          choices.length
        )
      ];

    state.targetIndex =
      index;

    state.safe =
      false;

    state.waiting =
      true;

    const round =
      ROUNDS[state.round];

    covers[index].classList.add(
      "active"
    );

    positionSteam(index);

    setReadyMessage(
      "REMEMBER!",
      "show"
    );

    instructionText.textContent =
      "Remember the glowing cover!";

    speak(
      "Remember this cover."
    );

    state.cueTimer =
      window.setTimeout(
        () => {
          if (!state.active) {
            return;
          }

          covers[index].classList.remove(
            "active"
          );

          setReadyMessage(
            "WAIT...",
            "show"
          );

          instructionText.textContent =
            "The clue is hidden. Wait for NOW!";

          state.cueTimer =
            window.setTimeout(
              () => {
                if (!state.active) {
                  return;
                }

                state.safe =
                  true;

                state.waiting =
                  false;

                steam.classList.add(
                  "safe"
                );

                setReadyMessage(
                  "NOW!",
                  "show"
                );

                instructionText.textContent =
                  "Now! Go to the cover you remembered!";

                speak(
                  "Now! Go to the cover you remembered."
                );

                state.closeTimer =
                  window.setTimeout(
                    missOpening,
                    round.safeTime
                  );
              },
              500
            );
        },
        round.previewTime
      );
  }
  function missOpening() {
    if (
      !state.active ||
      !state.safe
    ) {
      return;
    }

    state.safe =
      false;

    const target =
      covers[
        state.targetIndex
      ];

    if (target) {
      target.classList.remove(
        "active"
      );
    }

    steam.classList.remove(
      "safe"
    );

    steam.classList.remove(
      "burst"
    );

    void steam.offsetWidth;

    steam.classList.add(
      "burst"
    );

    setReadyMessage(
      "STEAM BURST!",
      "hot"
    );

    helper.classList.remove(
      "recoil"
    );

    void helper.offsetWidth;

    helper.classList.add(
      "recoil"
    );

    steamTone();

    instructionText.textContent =
      "The steam came back! Try again.";

    speak(
      "The steam came back. Try again."
    );

    resetHelper();

    window.setTimeout(
      () => {
        if (state.active) {
          scheduleOpening();
        }
      },
      900
    );
  }

  function revealTarget() {
    if (
      !state.active ||
      !state.safe
    ) {
      return;
    }

    clearTimers();

    state.safe =
      false;

    const target =
      covers[
        state.targetIndex
      ];

    target.classList.remove(
      "active"
    );

    target.classList.add(
      "revealed"
    );

    steam.classList.remove(
      "safe"
    );

    const round =
      ROUNDS[state.round];

    const food =
      layer.querySelector(
        `[data-food="${round.food}"]`
      );

    if (food) {
      food.classList.add(
        "visible"
      );
    }

    state.revealed.push(
      round.food
    );

    const dots =
      progress.querySelectorAll(
        "i"
      );

    if (dots[state.round]) {
      dots[
        state.round
      ].classList.add(
        "done"
      );
    }

    setReadyMessage(
      `${round.label.toUpperCase()}!`,
      "show"
    );

    instructionText.textContent =
      `${round.label} revealed! Great timing.`;

    successTone();

    speak(
      `${round.label} revealed. Great timing!`
    );

    state.round += 1;

    if (
      state.round >=
      ROUNDS.length
    ) {
      window.setTimeout(
        startServeFinale,
        950
      );

      return;
    }

    updateRoundText();

    window.setTimeout(
      () => {
        if (state.active) {
          resetHelper();
          scheduleOpening();
        }
      },
      900
    );
  }

  function updateRoundText() {
    roundText.textContent =
      `REVEAL ${Math.min(
        state.round + 1,
        ROUNDS.length
      )} OF ${ROUNDS.length}`;
  }

  function resetFeast() {
    clearTimers();

    state.active =
      true;

    state.round =
      0;

    state.dragging =
      false;

    state.pointerId =
      null;

    state.targetIndex =
      -1;

    state.safe =
      false;

    state.waiting =
      false;

    state.revealed =
      [];

    covers.forEach(
      (cover) => {
        cover.classList.remove(
          "active",
          "revealed"
        );
      }
    );

    layer
      .querySelectorAll(
        ".feast-food-reveal"
      )
      .forEach(
        (food) => {
          food.classList.remove(
            "visible"
          );
        }
      );

    progress
      .querySelectorAll(
        "i"
      )
      .forEach(
        (dot) => {
          dot.classList.remove(
            "done"
          );
        }
      );

    completeOverlay.hidden =
      true;

    steam.classList.remove(
      "safe",
      "burst"
    );

    resetHelper();

    updateRoundText();
  }

  const SERVE_FOODS = [
    "clam",
    "corn",
    "lobster",
    "potato"
  ];

  const SERVE_LABELS = {
    clam: "CLAMS",
    corn: "CORN",
    lobster: "LOBSTER",
    potato: "POTATO"
  };

  const serveState = {
    active: false,
    delivery: 0,
    total: 3,
    requested: "",
    carrying: false,
    requestOrder: [],
    hazardFrame: 0,
    lastHazardTime: 0,
    hazards: [],
    patternIndex: 0,
    patternPhase: "warning",
    nextPatternTime: 0,
    safeWindow: false,
    steamHitCooldownUntil: 0
  };

  let serveLayer = null;
  let serveRequest = null;
  let serveProgress = null;
  let serveCommunity = null;
  let serveHazardField = null;
  let serveSteamStatus = null;

  function shuffledServeFoods() {
    const values =
      SERVE_FOODS.slice();

    for (
      let i = values.length - 1;
      i > 0;
      i--
    ) {
      const j =
        Math.floor(
          Math.random() *
          (i + 1)
        );

      const temp =
        values[i];

      values[i] =
        values[j];

      values[j] =
        temp;
    }

    return values;
  }

  function buildServeFinale() {
    if (serveLayer) {
      return;
    }

    serveLayer =
      document.createElement(
        "div"
      );

    serveLayer.className =
      "feast-serve-finale";

    serveLayer.hidden =
      true;

    serveLayer.innerHTML = `
      <div class="serve-topbar">
        <div
          class="serve-title"
        >
          FEAST FINALE!
        </div>

        <div
          class="serve-progress"
        >
          DELIVERY 1 OF 3
        </div>
      </div>

      <div
        class="serve-request-card"
      >
        <span>
          BRING
        </span>

        <strong
          class="serve-request-food"
        >
          CORN
        </strong>
      </div>

      <div
        class="serve-community-zone"
      >
        <div
          class="serve-community-person"
        >
          <div class="serve-head"></div>
          <div class="serve-body"></div>
          <span class="serve-arm left"></span>
          <span class="serve-arm right"></span>
          <span class="serve-leg left"></span>
          <span class="serve-leg right"></span>
        </div>

        <strong>
          SERVE HERE
        </strong>
      </div>

      <div
        class="serve-hazard-field"
      ></div>

      <div
        class="serve-steam-status"
        data-mode="watch"
        aria-live="polite"
      >
        WATCH THE STEAM
      </div>
    `;

    layer.appendChild(
      serveLayer
    );

    serveRequest =
      serveLayer.querySelector(
        ".serve-request-food"
      );

    serveProgress =
      serveLayer.querySelector(
        ".serve-progress"
      );

    serveCommunity =
      serveLayer.querySelector(
        ".serve-community-zone"
      );

    serveHazardField =
      serveLayer.querySelector(
        ".serve-hazard-field"
      );
  }

  function renderServeFoods() {
    /*
     * Reuse the ORIGINAL foods revealed during
     * Phase 1 instead of drawing duplicate food.
     */
    layer
      .querySelectorAll(
        ".feast-food-reveal"
      )
      .forEach(
        (food) => {
          food.classList.remove(
            "serve-requested",
            "serve-collected"
          );

          if (
            food.dataset.food ===
            serveState.requested
          ) {
            food.classList.add(
              "serve-requested"
            );
          }
        }
      );
  }

  function stopServeHazards() {
    if (
      serveState.hazardFrame
    ) {
      window.cancelAnimationFrame(
        serveState.hazardFrame
      );
    }

    serveState.hazardFrame =
      0;

    serveState.hazards =
      [];

    serveState.safeWindow =
      false;

    serveState.steamHitCooldownUntil =
      0;

    if (serveHazardField) {
      serveHazardField.innerHTML =
        "";
    }

    if (serveCommunity) {
      serveCommunity.classList.remove(
        "is-target"
      );
    }

    layer.classList.remove(
      "serve-steam-warning",
      "serve-steam-burst",
      "serve-steam-safe"
    );

    if (serveSteamStatus) {
      serveSteamStatus.dataset.mode =
        "watch";

      serveSteamStatus.textContent =
        "WATCH THE STEAM";
    }
  }


  function getServeSteamTiming() {
    const difficulty =
      Math.min(
        serveState.delivery,
        2
      );

    const timings = [
      {
        warning: 700,
        burst: 780,
        gap: 360,
        safe: 2350
      },
      {
        warning: 580,
        burst: 710,
        gap: 300,
        safe: 1950
      },
      {
        warning: 480,
        burst: 650,
        gap: 250,
        safe: 1650
      }
    ];

    return timings[difficulty];
  }


  function setServeSteamMode(
    mode,
    message
  ) {
    layer.classList.remove(
      "serve-steam-warning",
      "serve-steam-burst",
      "serve-steam-safe"
    );

    if (
      mode === "warning"
    ) {
      layer.classList.add(
        "serve-steam-warning"
      );
    }

    if (
      mode === "burst"
    ) {
      layer.classList.add(
        "serve-steam-burst"
      );
    }

    if (
      mode === "safe"
    ) {
      layer.classList.add(
        "serve-steam-safe"
      );
    }

    if (serveSteamStatus) {
      serveSteamStatus.dataset.mode =
        mode;

      serveSteamStatus.textContent =
        message;
    }
  }


  function clearSteamBurst() {
    serveState.hazards.forEach(
      (hazard) => {
        hazard.active =
          false;

        hazard.element.classList.remove(
          "warning",
          "erupting"
        );
      }
    );
  }


  function markServeSteamWarning(
    index
  ) {
    clearSteamBurst();

    serveState.safeWindow =
      false;

    const hazard =
      serveState.hazards[index];

    if (!hazard) {
      return;
    }

    hazard.element.classList.add(
      "warning"
    );

    const sideNames = [
      "LEFT",
      "CENTER",
      "RIGHT"
    ];

    setServeSteamMode(
      "warning",
      `WAIT - ${sideNames[index]}`
    );
  }


  function spawnServeHazards() {
    stopServeHazards();

    const positions = [
      {
        x: 44,
        y: 56,
        side: "left"
      },
      {
        x: 50,
        y: 55,
        side: "center"
      },
      {
        x: 56,
        y: 56,
        side: "right"
      }
    ];

    positions.forEach(
      (position) => {
        const element =
          document.createElement(
            "div"
          );

        element.className =
          "serve-steam-hazard";

        element.dataset.side =
          position.side;

        element.style.left =
          `${position.x}%`;

        element.style.top =
          `${position.y}%`;

        serveHazardField.appendChild(
          element
        );

        serveState.hazards.push({
          element,
          active: false
        });
      }
    );

    serveState.patternIndex =
      0;

    serveState.patternPhase =
      "warning";

    serveState.safeWindow =
      false;

    const timing =
      getServeSteamTiming();

    markServeSteamWarning(
      0
    );

    serveState.nextPatternTime =
      performance.now() +
      timing.warning;

    serveState.hazardFrame =
      window.requestAnimationFrame(
        moveServeHazards
      );
  }


  function moveServeHazards(
    now
  ) {
    if (
      !serveState.active
    ) {
      return;
    }

    const timing =
      getServeSteamTiming();

    if (
      now >=
      serveState.nextPatternTime
    ) {
      if (
        serveState.patternPhase ===
        "warning"
      ) {
        clearSteamBurst();

        const hazard =
          serveState.hazards[
            serveState.patternIndex
          ];

        if (hazard) {
          hazard.active =
            true;

          hazard.element.classList.add(
            "erupting"
          );
        }

        serveState.safeWindow =
          false;

        setServeSteamMode(
          "burst",
          "WAIT!"
        );

        serveState.patternPhase =
          "burst";

        serveState.nextPatternTime =
          now +
          timing.burst;
      }
      else if (
        serveState.patternPhase ===
        "burst"
      ) {
        clearSteamBurst();

        serveState.patternIndex +=
          1;

        if (
          serveState.patternIndex >=
          serveState.hazards.length
        ) {
          serveState.patternIndex =
            0;

          serveState.patternPhase =
            "safe";

          serveState.safeWindow =
            true;

          setServeSteamMode(
            "safe",
            "GO!"
          );

          serveState.nextPatternTime =
            now +
            timing.safe;
        }
        else {
          serveState.patternPhase =
            "gap";

          setServeSteamMode(
            "watch",
            "WAIT!"
          );

          serveState.nextPatternTime =
            now +
            timing.gap;
        }
      }
      else if (
        serveState.patternPhase ===
        "gap"
      ) {
        serveState.patternPhase =
          "warning";

        markServeSteamWarning(
          serveState.patternIndex
        );

        serveState.nextPatternTime =
          now +
          timing.warning;
      }
      else if (
        serveState.patternPhase ===
        "safe"
      ) {
        serveState.safeWindow =
          false;

        serveState.patternIndex =
          0;

        serveState.patternPhase =
          "warning";

        markServeSteamWarning(
          0
        );

        serveState.nextPatternTime =
          now +
          timing.warning;
      }
    }

    checkServeSteamCollision();

    serveState.hazardFrame =
      window.requestAnimationFrame(
        moveServeHazards
      );
  }

  function helperTouches(
    element,
    padding = 0
  ) {
    if (!element) {
      return false;
    }

    return rectanglesTouch(
      helper.getBoundingClientRect(),
      element.getBoundingClientRect(),
      padding
    );
  }

  function helperInsideCookingPit() {
    const pit =
      layer.querySelector(
        ".feast-pit"
      );

    if (!pit) {
      return false;
    }

    const helperRect =
      helper.getBoundingClientRect();

    const pitRect =
      pit.getBoundingClientRect();

    const helperCenterX =
      helperRect.left +
      helperRect.width / 2;

    const helperCenterY =
      helperRect.top +
      helperRect.height / 2;

    /*
     * Use a slightly smaller inner pit zone.
     *
     * This means walking around the outer stones
     * is safe. Steam only hurts once the helper
     * actually enters the hot cooking area.
     */
    const insetX =
      pitRect.width * 0.13;

    const insetY =
      pitRect.height * 0.12;

    return (
      helperCenterX >=
        pitRect.left + insetX &&
      helperCenterX <=
        pitRect.right - insetX &&
      helperCenterY >=
        pitRect.top + insetY &&
      helperCenterY <=
        pitRect.bottom - insetY
    );
  }


  function checkServeSteamCollision() {
    if (
      !serveState.active
    ) {
      return;
    }

    if (
      !helperInsideCookingPit()
    ) {
      return;
    }

    const hit =
      serveState.hazards.some(
        (hazard) =>
          hazard.active &&
          helperTouches(
            hazard.element,
            -18
          )
      );

    if (!hit) {
      return;
    }

    const now =
      performance.now();

    if (
      now <
      serveState.steamHitCooldownUntil
    ) {
      return;
    }

    serveState.steamHitCooldownUntil =
      now + 750;

    helper.classList.remove(
      "recoil"
    );

    void helper.offsetWidth;

    helper.classList.add(
      "recoil"
    );

    window.setTimeout(
      () => {
        helper.classList.remove(
          "recoil"
        );
      },
      430
    );

    if (
      !serveState.carrying
    ) {
      setReadyMessage(
        "TOO HOT!",
        "show"
      );

      instructionText.textContent =
        "Too hot! Watch the steam and wait for SAFE - GO!";

      return;
    }

    serveState.carrying =
      false;

    helper.classList.remove(
      "serve-carrying"
    );

    if (serveCommunity) {
      serveCommunity.classList.remove(
        "is-target"
      );
    }

    setReadyMessage(
      "STEAM!",
      "show"
    );

    instructionText.textContent =
      "Oops! The steam made you drop the food. Wait for SAFE - GO! and get it again.";

    speak(
      "The steam made you drop the food. Wait for the safe opening and get it again."
    );

    const droppedFood =
      layer.querySelector(
        `.feast-food-reveal[data-food="${serveState.requested}"]`
      );

    if (droppedFood) {
      droppedFood.classList.remove(
        "serve-collected"
      );

      droppedFood.classList.add(
        "serve-requested"
      );
    }
  }


  function checkServeCollisions() {
    if (
      !serveState.active
    ) {
      return;
    }

    if (
      !serveState.carrying
    ) {
      const requested =
        layer.querySelector(
          `.feast-food-reveal[data-food="${serveState.requested}"]`
        );

      if (
        requested &&
        helperTouches(
          requested,
          -5
        )
      ) {
        if (
          !serveState.safeWindow
        ) {
          setReadyMessage(
            "WAIT!",
            "show"
          );

          instructionText.textContent =
            "Wait for SAFE - GO! before taking the food from the hot pit.";

          return;
        }

        serveState.carrying =
          true;

        helper.classList.add(
          "serve-carrying"
        );

        requested.classList.add(
          "serve-collected"
        );

        if (serveCommunity) {
          serveCommunity.classList.add(
            "is-target"
          );
        }

        instructionText.textContent =
          `You have the ${SERVE_LABELS[
            serveState.requested
          ].toLowerCase()}! Get out of the pit and bring it to the community member!`;

        speak(
          `Great. Bring the ${SERVE_LABELS[
            serveState.requested
          ].toLowerCase()} to the community member.`
        );
      }

      return;
    }

    if (
      helperTouches(
        serveCommunity,
        -4
      )
    ) {
      completeServeDelivery();
    }
  }


  function beginServeDelivery() {
    serveState.carrying =
      false;

    helper.classList.remove(
      "serve-carrying"
    );

    if (serveCommunity) {
      serveCommunity.classList.remove(
        "is-target"
      );
    }

    serveState.requested =
      serveState.requestOrder[
        serveState.delivery
      ];

    serveRequest.textContent =
      SERVE_LABELS[
        serveState.requested
      ];

    serveProgress.textContent =
      `DELIVERY ${
        serveState.delivery + 1
      } OF ${serveState.total}`;

    renderServeFoods();

    /*
     * The helper stays wherever the previous
     * delivery ended. No teleporting.
     */
    spawnServeHazards();

    setReadyMessage(
      "WATCH!",
      "show"
    );

    instructionText.textContent =
      `Watch LEFT, CENTER, RIGHT. When it says SAFE - GO!, get the ${SERVE_LABELS[
        serveState.requested
      ].toLowerCase()} and carry it to the community member!`;

    speak(
      `Watch the steam. When it is safe, get the ${SERVE_LABELS[
        serveState.requested
      ].toLowerCase()} and bring it to the community member.`
    );
  }

  function completeServeDelivery() {
    stopServeHazards();

    serveState.carrying =
      false;

    helper.classList.remove(
      "serve-carrying"
    );

    successTone();

    serveState.delivery +=
      1;

    if (
      serveState.delivery >=
      serveState.total
    ) {
      serveState.active =
        false;

      serveLayer.hidden =
        true;

      setReadyMessage(
        "FEAST READY!",
        "show"
      );

      instructionText.textContent =
        "You served the feast!";

      speak(
        "You served the feast. Wonderful work!"
      );

      window.setTimeout(
        finishFeast,
        700
      );

      return;
    }

    setReadyMessage(
      "GREAT!",
      "show"
    );

    instructionText.textContent =
      "Great delivery! Get ready for the next one.";

    window.setTimeout(
      beginServeDelivery,
      700
    );
  }

  function startServeFinale() {
    clearTimers();

    state.safe =
      false;

    state.targetIndex =
      -1;

    buildServeFinale();

    serveState.active =
      true;

    serveState.delivery =
      0;

    serveState.carrying =
      false;

    serveState.requestOrder =
      shuffledServeFoods()
        .slice(
          0,
          serveState.total
        );

    serveLayer.hidden =
      false;

    setReadyMessage(
      "FEAST FINALE!",
      "show"
    );

    instructionText.textContent =
      "The feast is uncovered! Now help serve the food.";

    speak(
      "Feast finale! Help serve the food to the community."
    );

    window.setTimeout(
      beginServeDelivery,
      900
    );
  }
  function finishFeast() {
    clearTimers();

    stopServeHazards();

    serveState.active =
      false;

    if (serveLayer) {
      serveLayer.hidden =
        true;
    }

    state.active =
      false;

    state.safe =
      false;

    setReadyMessage(
      "FEAST READY!",
      "show"
    );

    instructionText.textContent =
      "The feast is uncovered and the community is ready to gather!";

    completeOverlay.hidden =
      false;

    speak(
      "Wonderful work. The feast is ready. The community can gather and share the meal."
    );

    successTone();
  }

  function startFeastGame() {
    buildLayer();

    const pitComplete =
      document.getElementById(
        "pitComplete"
      );

    const previousLayer =
      pitComplete
        ? pitComplete.parentElement
        : null;

    if (pitComplete) {
      pitComplete.hidden =
        true;
    }

    if (
      previousLayer &&
      previousLayer !== layer
    ) {
      previousLayer.hidden =
        true;

      previousLayer.style.display =
        "none";
    }

    const gatherLayer =
      document.getElementById(
        "gatherLayer"
      );

    if (gatherLayer) {
      gatherLayer.hidden =
        true;

      gatherLayer.style.display =
        "none";
    }

    stage.classList.remove(
      "gather-feast-active",
      "pit-prep-active"
    );

    stage.classList.add(
      "reveal-feast-active"
    );

    layer.hidden =
      false;

    layer.style.display =
      "";

    if (missionLabel) {
      missionLabel.textContent =
        "REVEAL THE FEAST";
    }

    if (clamProgress) {
      clamProgress.style.display =
        "none";
    }

    resetFeast();

    instructionText.textContent =
      "Watch the steam. When it says NOW, drag the helper to the glowing cover.";

    speak(
      "Watch the steam. When it says now, click, hold, and drag the helper to the glowing cover."
    );

    window.setTimeout(
      scheduleOpening,
      700
    );
  }

  const observer =
    new MutationObserver(
      () => {
        ensureContinueButton();
      }
    );

  observer.observe(
    stage,
    {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "hidden"
      ]
    }
  );

  ensureContinueButton();

  /* CLAMBAKE CURSOR MODE - LEVEL 4 */

  function clambakeLevelFourCursorMode() {
    return Boolean(
      window.clambakeInputMode &&
      window.clambakeInputMode.cursorMode()
    );
  }

  function clambakeLevelFourInside(
    event,
    element,
    padding = 0
  ) {
    const rect =
      element.getBoundingClientRect();

    return (
      event.clientX >=
        rect.left - padding &&
      event.clientX <=
        rect.right + padding &&
      event.clientY >=
        rect.top - padding &&
      event.clientY <=
        rect.bottom + padding
    );
  }

  stage.addEventListener(
    "pointermove",
    (event) => {
      if (
        !clambakeLevelFourCursorMode() ||
        !state.active ||
        event.pointerType === "touch"
      ) {
        return;
      }

      if (!state.dragging) {
        if (
          !clambakeLevelFourInside(
            event,
            helper,
            24
          )
        ) {
          return;
        }

        state.pointerId =
          event.pointerId;

        state.dragging =
          true;

        helper.classList.add(
          "dragging"
        );
      }

      state.pointerId =
        event.pointerId;

      event.preventDefault();

      const point =
        stagePoint(
          event.clientX,
          event.clientY
        );

      setHelperPosition(
        point.x,
        point.y
      );

      if (serveState.active) {
        checkServeCollisions();
      }
    }
  );

})();








