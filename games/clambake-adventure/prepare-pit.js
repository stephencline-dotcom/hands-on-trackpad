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

  /*
   * Historical construction order remains fixed.
   *
   * Later steps become memory challenges and,
   * once the fire is burning, moving sparks create
   * the action challenge.
   */
  const STEPS = [
    {
      type: "stone",
      label: "Stone",
      spoken:
        "First, bring a stone to the cooking pit.",
      memory: false,
      sparks: 0
    },
    {
      type: "wood",
      label: "Wood",
      spoken:
        "Next, bring wood to the cooking pit.",
      memory: false,
      sparks: 0
    },
    {
      type: "rockweed",
      label: "Rockweed",
      spoken:
        "Remember this one. Bring rockweed to the hot stones.",
      memory: true,
      sparks: 2
    },
    {
      type: "food",
      label: "Food",
      spoken:
        "Now bring the food to the cooking pit.",
      memory: true,
      sparks: 3
    },
    {
      type: "rockweed",
      label: "Rockweed Cover",
      spoken:
        "Last step. Bring the final rockweed covering.",
      memory: true,
      sparks: 4,
      final: true
    }
  ];

  const MATERIAL_TYPES = [
    "stone",
    "wood",
    "rockweed",
    "food"
  ];

  const LABELS = {
    stone: "Stone",
    wood: "Wood",
    rockweed: "Rockweed",
    food: "Food"
  };

  const MATERIAL_SLOTS = [
    [20, 59],
    [29, 81],
    [42, 67],
    [49, 83],
    [83, 59],
    [90, 79]
  ];

  const state = {
    active: false,

    step: 0,

    pointerId: null,
    dragging: false,

    carrying: null,

    helperX: 0,
    helperY: 0,

    sparkFrame: 0,
    sparks: [],

    memoryTimer: 0,

    wrongCooldown: false
  };

  let layer = null;

  let helper = null;
  let carrySlot = null;

  let materialField = null;

  let pit = null;
  let pitDropZone = null;

  let memoryRow = null;
  let requestText = null;
  let roundText = null;

  let sparkField = null;
  let sparkWarning = null;

  let completeOverlay = null;

  const fireCrackleAudio =
    new Audio("../../sounds/crackle.mp3");

  fireCrackleAudio.loop =
    true;

  fireCrackleAudio.volume =
    0.38;

  let pickupWatchFrame =
    0;

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
  function stopFireCrackle(
    reset = true
  ) {
    fireCrackleAudio.pause();

    if (reset) {
      try {
        fireCrackleAudio.currentTime =
          0;
      }
      catch {
      }
    }
  }

  function startFireCrackle() {
    if (
      !soundEnabled() ||
      !state.active ||
      !pit ||
      !pit.classList.contains(
        "has-fire"
      )
    ) {
      return;
    }

    if (
      !fireCrackleAudio.paused
    ) {
      return;
    }

    const playPromise =
      fireCrackleAudio.play();

    if (
      playPromise &&
      typeof playPromise.catch ===
        "function"
    ) {
      playPromise.catch(
        () => {}
      );
    }
  }

  function syncFireCrackle() {
    if (
      soundEnabled() &&
      state.active &&
      pit &&
      pit.classList.contains(
        "has-fire"
      )
    ) {
      startFireCrackle();
      return;
    }

    stopFireCrackle(false);
  }

  if (soundToggle) {
    const fireSoundObserver =
      new MutationObserver(
        () => {
          syncFireCrackle();
        }
      );

    fireSoundObserver.observe(
      soundToggle,
      {
        attributes: true,
        attributeFilter: [
          "aria-pressed"
        ]
      }
    );
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

  function tone(
    frequency,
    duration = .09,
    type = "triangle",
    volume = .035
  ) {
    if (!soundEnabled()) {
      return;
    }

    try {
      const Context =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!Context) {
        return;
      }

      window.__pitAudio =
        window.__pitAudio ||
        new Context();

      const context =
        window.__pitAudio;

      if (
        context.state ===
        "suspended"
      ) {
        context.resume();
      }

      const oscillator =
        context.createOscillator();

      const gain =
        context.createGain();

      oscillator.type = type;

      oscillator.frequency.value =
        frequency;

      gain.gain.value =
        volume;

      oscillator.connect(gain);

      gain.connect(
        context.destination
      );

      const now =
        context.currentTime;

      gain.gain.setValueAtTime(
        volume,
        now
      );

      gain.gain
        .exponentialRampToValueAtTime(
          .0001,
          now + duration
        );

      oscillator.start(now);

      oscillator.stop(
        now + duration
      );
    }
    catch {
    }
  }

  function successSound() {
    tone(520);

    window.setTimeout(
      () => tone(670),
      85
    );

    window.setTimeout(
      () => tone(
        830,
        .13
      ),
      170
    );
  }

  function wrongSound() {
    tone(
      165,
      .13,
      "square",
      .025
    );
  }

  function shuffle(values) {
    const copy =
      values.slice();

    for (
      let index =
        copy.length - 1;
      index > 0;
      index -= 1
    ) {
      const other =
        Math.floor(
          Math.random() *
          (index + 1)
        );

      [
        copy[index],
        copy[other]
      ] = [
        copy[other],
        copy[index]
      ];
    }

    return copy;
  }

  function buildLayer() {
    if (layer) {
      return;
    }

    layer =
      document.createElement(
        "section"
      );

    layer.className =
      "pit-layer";

    layer.hidden =
      true;

    layer.innerHTML = `
      <div class="pit-hud">
        <span class="pit-kicker">
          PREPARE THE COOKING PIT
        </span>

        <p
          id="pitRequestText"
          class="pit-request"
        >
          Listen for what comes next.
        </p>

        <div
          id="pitMemoryRow"
          class="pit-memory-row"
        ></div>
      </div>

      <div
        id="pitRoundText"
        class="pit-round"
      >
        STEP 1 OF 5
      </div>

      <div
        id="sparkWarning"
        class="spark-warning"
        hidden
      >
        WATCH THE SPARKS!
      </div>

      <div
        id="pitMaterialField"
        class="pit-material-field"
      ></div>

      <div
        id="cookingPit"
        class="cooking-pit"
      >
        <div
          id="pitDropZone"
          class="pit-drop-zone"
        ></div>

        <div class="pit-hole"></div>

        <div class="built-stones">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div class="built-wood"></div>

        <div class="pit-fire"></div>

        <div class="pit-rockweed"></div>

        <div class="pit-food"></div>

        <div class="pit-cover"></div>

        <div class="pit-steam"></div>
      </div>

      <div
        id="sparkField"
        class="spark-field"
      ></div>

      <div
        id="pitHelper"
        class="pit-helper"
        role="button"
        tabindex="0"
        aria-label="Wampanoag helper. Click, hold, and drag."
      >
        <div class="pit-helper-head"></div>

        <div class="pit-helper-body"></div>

        <span class="pit-helper-arm left"></span>
        <span class="pit-helper-arm right"></span>

        <span class="pit-helper-leg left"></span>
        <span class="pit-helper-leg right"></span>

        <div
          id="pitCarry"
          class="pit-carry"
        ></div>
      </div>

      <div
        id="pitComplete"
        class="pit-complete"
        hidden
      >
        <div class="pit-complete-card">
          <span class="overlay-kicker">
            COOKING PIT READY!
          </span>

          <h2>
            Steam is rising!
          </h2>

          <p>
            You built the cooking pit in
            the correct order and prepared
            it for the clambake.
          </p>

          <button
            id="pitAgainButton"
            class="primary-button"
            type="button"
          >
            PLAY PIT AGAIN
          </button>
        </div>
      </div>
    `;

    stage.appendChild(
      layer
    );

    helper =
      document.getElementById(
        "pitHelper"
      );

    carrySlot =
      document.getElementById(
        "pitCarry"
      );

    materialField =
      document.getElementById(
        "pitMaterialField"
      );

    pit =
      document.getElementById(
        "cookingPit"
      );

    pitDropZone =
      document.getElementById(
        "pitDropZone"
      );

    memoryRow =
      document.getElementById(
        "pitMemoryRow"
      );

    requestText =
      document.getElementById(
        "pitRequestText"
      );

    roundText =
      document.getElementById(
        "pitRoundText"
      );

    sparkField =
      document.getElementById(
        "sparkField"
      );

    sparkWarning =
      document.getElementById(
        "sparkWarning"
      );

    completeOverlay =
      document.getElementById(
        "pitComplete"
      );

    helper.addEventListener(
      "pointerdown",
      startDrag
    );

    helper.addEventListener(
      "pointermove",
      moveHelper
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
        "pitAgainButton"
      )
      .addEventListener(
        "click",
        startPitGame
      );
  }

  function ensureContinueButton() {
    const celebration =
      document.getElementById(
        "rescueCelebration"
      );

    if (!celebration) {
      return;
    }

    if (
      document.getElementById(
        "continueToPitButton"
      )
    ) {
      return;
    }

    const buttonRow =
      celebration.querySelector(
        ".rescue-button-row"
      );

    if (!buttonRow) {
      return;
    }

    const button =
      document.createElement(
        "button"
      );

    button.id =
      "continueToPitButton";

    button.type =
      "button";

    button.className =
      "primary-button";

    button.textContent =
      "PREPARE COOKING PIT";

    button.addEventListener(
      "click",
      startPitGame
    );

    buttonRow.prepend(
      button
    );
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
          45,
          Math.min(
            rect.width - 45,
            clientX - rect.left
          )
        ),

      y:
        Math.max(
          82,
          Math.min(
            rect.height - 72,
            clientY - rect.top
          )
        )
    };
  }

  function setHelperPosition(
    x,
    y
  ) {
    state.helperX = x;
    state.helperY = y;

    helper.style.left =
      `${x}px`;

    helper.style.top =
      `${y}px`;
  }

  function resetHelper() {
    const rect =
      stage.getBoundingClientRect();

    setHelperPosition(
      rect.width * .14,
      rect.height * .72
    );

    state.carrying =
      null;

    carrySlot.innerHTML =
      "";

    helper.classList.remove(
      "is-carrying"
    );

    pit.classList.remove(
      "is-ready"
    );

    resetBalanceChallenge();
  }

  function materialArt(
    type
  ) {
    const art =
      document.createElement(
        "span"
      );

    art.className =
      `material-art ${type}`;

    return art;
  }

  function renderMaterials() {
    materialField.innerHTML =
      "";

    const requested =
      STEPS[state.step].type;

    const decoys =
      shuffle(
        MATERIAL_TYPES.filter(
          type =>
            type !== requested
        )
      ).slice(
        0,
        2
      );

    const types =
      shuffle(
        [
          requested,
          ...decoys
        ]
      );

    /* LEVEL 3 SAFE SPARK SPAWNS */

    /*
     * Once the fire is active, all choices stay
     * safely to the left of the spark orbit.
     *
     * The challenge is crossing TO the pit,
     * not surviving an unfair pickup.
     */
    const sparkSafeSlots = [
      [29, 66],
      [40, 81],
      [52, 65],
      [33, 84],
      [54, 82]
    ];

    const slotPool =
      STEPS[state.step].sparks > 0
        ? sparkSafeSlots
        : MATERIAL_SLOTS;

    const slots =
      shuffle(
        slotPool
      ).slice(
        0,
        types.length
      );

    types.forEach(
      (type, index) => {
        const item =
          document.createElement(
            "div"
          );

        item.className =
          "pit-material";

        item.dataset.type =
          type;

        item.style.left =
          `${slots[index][0]}%`;

        item.style.top =
          `${slots[index][1]}%`;

        if (
          type === requested
        ) {
          item.classList.add(
            "is-correct"
          );
        }

        item.appendChild(
          materialArt(type)
        );

        const label =
          document.createElement(
            "span"
          );

        label.className =
          "material-label";

        label.textContent =
          LABELS[type];

        item.appendChild(
          label
        );

        materialField.appendChild(
          item
        );
      }
    );
  }

  function renderMemory() {
    memoryRow.innerHTML =
      "";

    const step =
      STEPS[state.step];

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "pit-memory-card pit-memory-picture-card";

    const artHolder =
      document.createElement(
        "div"
      );

    artHolder.className =
      "pit-memory-art";

    artHolder.appendChild(
      materialArt(
        step.type
      )
    );

    const label =
      document.createElement(
        "span"
      );

    label.className =
      "pit-memory-label";

    label.textContent =
      step.final
        ? "Cover with Rockweed"
        : step.label;

    card.appendChild(
      artHolder
    );

    card.appendChild(
      label
    );

    memoryRow.appendChild(
      card
    );

    memoryRow.classList.remove(
      "is-hidden"
    );

    window.clearTimeout(
      state.memoryTimer
    );

    if (step.memory) {
      state.memoryTimer =
        window.setTimeout(
          () => {
            memoryRow.classList.add(
              "is-hidden"
            );
          },
          2800
        );
    }
  }

  function ensurePitVisualGuide() {
    if (
      document.getElementById(
        "pitVisualGuide"
      )
    ) {
      return;
    }

    const guide =
      document.createElement(
        "div"
      );

    guide.id =
      "pitVisualGuide";

    guide.className =
      "pit-visual-guide";

    guide.innerHTML = `
      <div class="pit-guide-flow">

        <div class="pit-guide-action">
          <div
            id="pitGuideMaterial"
            class="pit-guide-material"
          ></div>

          <span>
            1. FIND
          </span>
        </div>

        <div class="pit-guide-arrow">
          →
        </div>

        <div class="pit-guide-action">
          <div class="pit-guide-helper-icon">
            <span class="guide-head"></span>
            <span class="guide-body"></span>
          </div>

          <span>
            2. CARRY
          </span>
        </div>

        <div class="pit-guide-arrow">
          →
        </div>

        <div class="pit-guide-action">
          <div class="pit-guide-pit-icon">
            <span></span>
          </div>

          <span>
            3. PIT
          </span>
        </div>

      </div>

      <div
        id="pitSequenceStrip"
        class="pit-sequence-strip"
      ></div>
    `;

    layer.appendChild(
      guide
    );
  }

  function updatePitVisualGuide() {
    ensurePitVisualGuide();

    const step =
      STEPS[state.step];

    const materialTarget =
      document.getElementById(
        "pitGuideMaterial"
      );

    const sequenceStrip =
      document.getElementById(
        "pitSequenceStrip"
      );

    if (
      materialTarget
    ) {
      materialTarget.innerHTML =
        "";

      materialTarget.appendChild(
        materialArt(
          step.type
        )
      );
    }

    if (
      !sequenceStrip
    ) {
      return;
    }

    sequenceStrip.innerHTML =
      "";

    STEPS.forEach(
      (sequenceStep, index) => {
        const cell =
          document.createElement(
            "div"
          );

        cell.className =
          "pit-sequence-cell";

        if (
          index <
          state.step
        ) {
          cell.classList.add(
            "is-complete"
          );
        }

        if (
          index ===
          state.step
        ) {
          cell.classList.add(
            "is-current"
          );
        }

        if (
          index >
          state.step
        ) {
          cell.classList.add(
            "is-future"
          );
        }

        const number =
          document.createElement(
            "span"
          );

        number.className =
          "pit-sequence-number";

        number.textContent =
          String(
            index + 1
          );

        cell.appendChild(
          number
        );

        /*
         * Completed steps stay visible.
         * The current memory step becomes a
         * question mark after the memory card
         * disappears.
         */
        if (
          index <
          state.step
        ) {
          cell.appendChild(
            materialArt(
              sequenceStep.type
            )
          );
        }
        else if (
          index ===
          state.step &&
          !sequenceStep.memory
        ) {
          cell.appendChild(
            materialArt(
              sequenceStep.type
            )
          );
        }
        else {
          const hidden =
            document.createElement(
              "span"
            );

          hidden.className =
            "pit-sequence-hidden";

          hidden.textContent =
            "?";

          cell.appendChild(
            hidden
          );
        }

        sequenceStrip.appendChild(
          cell
        );
      }
    );
  }

  function helperRect() {
    return helper
      .getBoundingClientRect();
  }

  function overlaps(
    a,
    b,
    padding = 0
  ) {
    return (
      a.right >=
        b.left - padding &&
      a.left <=
        b.right + padding &&
      a.bottom >=
        b.top - padding &&
      a.top <=
        b.bottom + padding
    );
  }

  /* =======================================================
     LEVEL 3 BALANCE CHALLENGE
     Steps 4 and 5 require smooth, controlled movement.
     ======================================================= */

  function ensureBalanceMeter() {
    if (
      document.getElementById(
        "pitBalanceMeter"
      )
    ) {
      return;
    }

    const meter =
      document.createElement(
        "div"
      );

    meter.id =
      "pitBalanceMeter";

    meter.className =
      "pit-balance-meter";

    meter.hidden =
      true;

    meter.innerHTML = `
      <div class="pit-balance-title">
        <span class="pit-balance-hands">
          STEADY HANDS
        </span>

        <span
          id="pitBalanceMessage"
          class="pit-balance-message"
        >
          MOVE SMOOTHLY
        </span>
      </div>

      <div class="pit-balance-track">
        <div
          id="pitBalanceFill"
          class="pit-balance-fill"
        ></div>

        <div class="pit-balance-safe">
          STEADY
        </div>

        <div class="pit-balance-danger">
          WOBBLE
        </div>
      </div>
    `;

    layer.appendChild(
      meter
    );
  }

  function renderBalanceMeter() {
    ensureBalanceMeter();

    const meter =
      document.getElementById(
        "pitBalanceMeter"
      );

    const fill =
      document.getElementById(
        "pitBalanceFill"
      );

    const message =
      document.getElementById(
        "pitBalanceMessage"
      );

    if (
      !meter ||
      !fill ||
      !message
    ) {
      return;
    }

    const amount =
      Math.max(
        0,
        Math.min(
          100,
          state.balance || 0
        )
      );

    fill.style.width =
      `${amount}%`;

    meter.classList.toggle(
      "is-warning",
      amount >= 45 &&
      amount < 72
    );

    meter.classList.toggle(
      "is-danger",
      amount >= 72
    );

    helper.classList.toggle(
      "balance-wobble",
      amount >= 45
    );

    helper.classList.toggle(
      "balance-danger",
      amount >= 72
    );

    if (amount < 30) {
      message.textContent =
        "NICE AND STEADY";
    }
    else if (amount < 45) {
      message.textContent =
        "KEEP IT SMOOTH";
    }
    else if (amount < 72) {
      message.textContent =
        "CAREFUL - WOBBLING!";
    }
    else {
      message.textContent =
        "SLOW DOWN!";
    }
  }

  function resetBalanceChallenge() {
    state.balance =
      0;

    state.balanceActive =
      false;

    state.balanceLastX =
      null;

    state.balanceLastY =
      null;

    state.balanceLastTime =
      0;

    state.balanceGraceUntil =
      0;

    helper.classList.remove(
      "balance-wobble",
      "balance-danger"
    );

    const meter =
      document.getElementById(
        "pitBalanceMeter"
      );

    if (meter) {
      meter.hidden =
        true;

      meter.classList.remove(
        "is-warning",
        "is-danger"
      );
    }
  }

  function startBalanceChallenge() {
    ensureBalanceMeter();

    /*
     * Only the final two steps use balance.
     * Earlier steps stay simpler.
     */
    if (state.step < 3) {
      resetBalanceChallenge();
      return;
    }

    state.balance =
      0;

    state.balanceActive =
      true;

    state.balanceLastX =
      state.helperX;

    state.balanceLastY =
      state.helperY;

    state.balanceLastTime =
      performance.now();

    /*
     * Brief grace period after pickup.
     */
    state.balanceGraceUntil =
      performance.now() +
      300;

    const meter =
      document.getElementById(
        "pitBalanceMeter"
      );

    if (meter) {
      meter.hidden =
        false;
    }

    renderBalanceMeter();

    instructionText.textContent +=
      " Move smoothly so you do not drop it!";
  }

  function balanceDrop() {
    const dropped =
      state.carrying;

    stopSparks();

    wrongSound();

    state.carrying =
      null;

    carrySlot.innerHTML =
      "";

    helper.classList.remove(
      "is-carrying",
      "is-dragging",
      "balance-wobble",
      "balance-danger"
    );

    pit.classList.remove(
      "is-ready"
    );

    state.dragging =
      false;

    state.pointerId =
      null;

    resetBalanceChallenge();

    instructionText.textContent =
      `Too wobbly! You dropped the ${LABELS[dropped].toLowerCase()}. Try again with slow, smooth movement.`;

    speak(
      `Oops. The ${LABELS[dropped].toLowerCase()} fell. Try again and move slowly and smoothly.`
    );

    resetHelper();

    window.setTimeout(
      () => {
        renderMaterials();
      },
      500
    );
  }

  function updateBalance(
    nextX,
    nextY
  ) {
    if (
      !state.balanceActive ||
      !state.carrying ||
      state.step < 3
    ) {
      return true;
    }

    const now =
      performance.now();

    if (
      state.balanceLastX === null ||
      state.balanceLastY === null
    ) {
      state.balanceLastX =
        nextX;

      state.balanceLastY =
        nextY;

      state.balanceLastTime =
        now;

      return true;
    }

    const dx =
      nextX -
      state.balanceLastX;

    const dy =
      nextY -
      state.balanceLastY;

    const travel =
      Math.hypot(
        dx,
        dy
      );

    const elapsed =
      Math.max(
        8,
        Math.min(
          80,
          now -
          state.balanceLastTime
        )
      );

    state.balanceLastX =
      nextX;

    state.balanceLastY =
      nextY;

    state.balanceLastTime =
      now;

    /*
     * Do not punish the movement that actually
     * picked up the item.
     */
    if (
      now <
      state.balanceGraceUntil
    ) {
      return true;
    }

    const speed =
      travel /
      elapsed;

    /*
     * Smooth movement lowers wobble.
     * Fast jumps raise it.
     *
     * The threshold is intentionally forgiving
     * for kindergarten trackpad movement.
     */
    /*
     * Smooth movement is safe, but quick or jerky
     * movement now builds wobble much sooner.
     */
    if (speed > 1.6) {
      state.balance +=
        (
          speed -
          1.6
        ) *
        10 +
        .8;
    }
    else {
      state.balance -=
        .7;
    }

    state.balance =
      Math.max(
        0,
        Math.min(
          100,
          state.balance
        )
      );

    renderBalanceMeter();

    if (
      state.balance >= 100
    ) {
      balanceDrop();

      return false;
    }

    return true;
  }
  function checkMaterialPickup() {
    if (
      !state.active ||
      state.carrying ||
      state.wrongCooldown
    ) {
      return;
    }

    const hRect =
      helperRect();

    const items =
      Array.from(
        materialField.querySelectorAll(
          ".pit-material"
        )
      );

    for (
      const item of items
    ) {
      const itemRect =
        item.getBoundingClientRect();

      if (
        !overlaps(
          hRect,
          itemRect,
          24
        )
      ) {
        continue;
      }

      const type =
        item.dataset.type;

      const needed =
        STEPS[state.step].type;

      if (
        type !== needed
      ) {
        state.wrongCooldown =
          true;

        item.classList.remove(
          "is-wrong"
        );

        void item.offsetWidth;

        item.classList.add(
          "is-wrong"
        );

        wrongSound();

        instructionText.textContent =
          "That does not come next. Remember the sequence!";

        window.setTimeout(
          () => {
            state.wrongCooldown =
              false;
          },
          550
        );

        return;
      }

      pickUpMaterial(
        type,
        item
      );

      return;
    }
  }

  function pickUpMaterial(
    type,
    item
  ) {
    state.carrying =
      type;

    item.remove();

    carrySlot.innerHTML =
      "";

    carrySlot.appendChild(
      materialArt(type)
    );

    helper.classList.add(
      "is-carrying"
    );

    pit.classList.add(
      "is-ready"
    );

    successSound();

    instructionText.textContent =
      `You have the ${LABELS[type].toLowerCase()}. Bring it to the cooking pit and release.`;

    startBalanceChallenge();

    if (
      STEPS[state.step].sparks > 0
    ) {
      startSparks(
        STEPS[state.step].sparks
      );
    }
  }

  function stopPickupWatch() {
    if (
      pickupWatchFrame
    ) {
      window.cancelAnimationFrame(
        pickupWatchFrame
      );
    }

    pickupWatchFrame =
      0;
  }

  function runPickupWatch() {
    if (
      !state.active ||
      !state.dragging
    ) {
      pickupWatchFrame =
        0;

      return;
    }

    checkMaterialPickup();

    pickupWatchFrame =
      window.requestAnimationFrame(
        runPickupWatch
      );
  }

  function startPickupWatch() {
    stopPickupWatch();

    pickupWatchFrame =
      window.requestAnimationFrame(
        runPickupWatch
      );
  }

  function startDrag(event) {
    if (
      !state.active ||
      (
        event.button !== 0 &&
        event.pointerType !==
          "touch"
      )
    ) {
      return;
    }

    event.preventDefault();

    state.pointerId =
      event.pointerId;

    state.dragging =
      true;

    startPickupWatch();

    if (
      state.balanceActive &&
      state.carrying
    ) {
      state.balanceLastX =
        state.helperX;

      state.balanceLastY =
        state.helperY;

      state.balanceLastTime =
        performance.now();

      state.balanceGraceUntil =
        performance.now() +
        180;
    }

    helper.classList.add(
      "is-dragging"
    );

    try {
      helper.setPointerCapture(
        event.pointerId
      );
    }
    catch {
    }

    moveHelper(event);
  }

  function moveHelper(event) {
    if (
      !state.dragging ||
      event.pointerId !==
        state.pointerId
    ) {
      return;
    }

    event.preventDefault();

    const point =
      stagePoint(
        event.clientX,
        event.clientY
      );

    if (
      !updateBalance(
        point.x,
        point.y
      )
    ) {
      return;
    }

    setHelperPosition(
      point.x,
      point.y
    );

    checkMaterialPickup();
  }

  function helperInsidePit() {
    return overlaps(
      helperRect(),
      pitDropZone
        .getBoundingClientRect(),
      -10
    );
  }

  function endDrag(event) {
    if (
      event.pointerId !==
        state.pointerId
    ) {
      return;
    }

    helper.classList.remove(
      "is-dragging"
    );

    try {
      if (
        helper.hasPointerCapture(
          event.pointerId
        )
      ) {
        helper.releasePointerCapture(
          event.pointerId
        );
      }
    }
    catch {
    }

    state.dragging =
      false;

    stopPickupWatch();

    state.pointerId =
      null;

    if (
      state.carrying &&
      helperInsidePit()
    ) {
      deliverMaterial();
    }
  }

  function applyBuildState(
    type,
    final = false
  ) {
    if (
      type === "stone"
    ) {
      pit.classList.add(
        "has-stones"
      );
    }

    if (
      type === "wood"
    ) {
      pit.classList.add(
        "has-wood",
        "has-fire"
      );

      startFireCrackle();
    }

    if (
      type === "rockweed" &&
      !final
    ) {
      pit.classList.add(
        "has-rockweed"
      );
    }

    if (
      type === "food"
    ) {
      pit.classList.add(
        "has-food"
      );
    }

    if (final) {
      pit.classList.add(
        "is-covered"
      );
    }
  }

  function deliverMaterial() {
    stopSparks();

    resetBalanceChallenge();

    const step =
      STEPS[state.step];

    applyBuildState(
      state.carrying,
      Boolean(step.final)
    );

    state.carrying =
      null;

    carrySlot.innerHTML =
      "";

    helper.classList.remove(
      "is-carrying"
    );

    pit.classList.remove(
      "is-ready"
    );

    successSound();

    state.step += 1;

    if (
      state.step >=
      STEPS.length
    ) {
      finishPit();
      return;
    }

    window.setTimeout(
      beginStep,
      650
    );
  }

  function startSparks(count) {
    stopSparks();

    sparkWarning.hidden =
      false;

    window.setTimeout(
      () => {
        sparkWarning.hidden =
          true;
      },
      950
    );

    const rect =
      stage.getBoundingClientRect();

    const pitCenter =
      {
        x:
          rect.width * .69,

        y:
          rect.height * .67
      };

    state.sparks =
      Array.from(
        {
          length: count
        },
        (_, index) => {
          const element =
            document.createElement(
              "div"
            );

          element.className =
            "pit-spark";

          sparkField.appendChild(
            element
          );

          return {
            element,

            angle:
              (
                Math.PI * 2 *
                index
              ) /
              count,

            radius:
              120 +
              index * 24,

            speed:
              .0016 +
              index * .00025,

            cx:
              pitCenter.x,

            cy:
              pitCenter.y,

            /*
             * Give the child a moment to leave
             * the pickup spot before collisions
             * become active.
             */
            activeAt:
              performance.now() +
              900
          };
        }
      );

    state.sparkFrame =
      window.requestAnimationFrame(
        moveSparks
      );
  }

  function moveSparks(now) {
    if (
      !state.active ||
      !state.sparks.length
    ) {
      return;
    }

    const hRect =
      helperRect();

    for (
      const spark of
      state.sparks
    ) {
      const angle =
        spark.angle +
        now *
        spark.speed;

      const x =
        spark.cx +
        Math.cos(angle) *
        spark.radius;

      const y =
        spark.cy +
        Math.sin(angle) *
        spark.radius *
        .55;

      spark.element.style.left =
        `${x}px`;

      spark.element.style.top =
        `${y}px`;

      const sparkRect =
        spark.element
          .getBoundingClientRect();

      if (
        now >=
          spark.activeAt &&
        state.carrying &&
        overlaps(
          hRect,
          sparkRect,
          4
        )
      ) {
        sparkHit();
        return;
      }
    }

    state.sparkFrame =
      window.requestAnimationFrame(
        moveSparks
      );
  }

  function stopSparks() {
    if (state.sparkFrame) {
      window.cancelAnimationFrame(
        state.sparkFrame
      );
    }

    state.sparkFrame = 0;

    state.sparks = [];

    if (sparkField) {
      sparkField.innerHTML =
        "";
    }

    if (sparkWarning) {
      sparkWarning.hidden =
        true;
    }
  }

  function sparkHit() {
    stopSparks();

    wrongSound();

    state.carrying =
      null;

    carrySlot.innerHTML =
      "";

    helper.classList.remove(
      "is-carrying"
    );

    pit.classList.remove(
      "is-ready"
    );

    instructionText.textContent =
      "A spark made you drop it! Try that step again.";

    speak(
      "A spark made you drop it. Try that step again."
    );

    resetHelper();

    window.setTimeout(
      () => {
        renderMaterials();

        if (
          STEPS[state.step].sparks >
          0
        ) {
          sparkWarning.hidden =
            false;

          window.setTimeout(
            () => {
              sparkWarning.hidden =
                true;
            },
            700
          );
        }
      },
      550
    );
  }

  function beginStep() {
    stopSparks();

    resetHelper();

    renderMaterials();

    ensurePitVisualGuide();

    updatePitVisualGuide();

    renderMemory();

    const step =
      STEPS[state.step];

    requestText.textContent =
      step.memory
        ? "Watch, remember, then go!"
        : `Bring the ${step.label}.`;

    roundText.textContent =
      `STEP ${
        state.step + 1
      } OF ${STEPS.length}`;

    instructionText.textContent =
      step.spoken;

    speak(
      step.spoken
    );
  }

  function finishPit() {
    stopSparks();

    stopPickupWatch();

    stopFireCrackle(
      true
    );

    resetBalanceChallenge();

    state.active =
      false;

    instructionText.textContent =
      "The cooking pit is covered. Steam is rising!";

    completeOverlay.hidden =
      false;

    speak(
      "Great job. The cooking pit is prepared and steam is rising."
    );
  }

  function resetPitVisual() {
    stopPickupWatch();

    stopFireCrackle(
      true
    );

    pit.classList.remove(
      "has-stones",
      "has-wood",
      "has-fire",
      "has-rockweed",
      "has-food",
      "is-covered",
      "is-ready"
    );
  }

  function startPitGame() {
    buildLayer();

    const gatherLayer =
      document.getElementById(
        "gatherLayer"
      );

    const rescueCelebration =
      document.getElementById(
        "rescueCelebration"
      );

    if (rescueCelebration) {
      rescueCelebration.hidden =
        true;
    }

    if (gatherLayer) {
      gatherLayer.hidden =
        true;

      gatherLayer.style.display =
        "none";
    }

    stage.classList.remove(
      "gather-feast-active"
    );

    stage.classList.add(
      "pit-prep-active"
    );

    layer.hidden =
      false;

    completeOverlay.hidden =
      true;

    state.active =
      true;

    state.step = 0;

    state.pointerId =
      null;

    state.dragging =
      false;

    state.carrying =
      null;

    state.wrongCooldown =
      false;

    resetPitVisual();

    if (missionLabel) {
      missionLabel.textContent =
        "PREPARE THE PIT";
    }

    if (clamProgress) {
      clamProgress.style.display =
        "none";
    }

    beginStep();
  }

  /*
   * Level 2 creates its completion panel dynamically,
   * so watch for it and add our Level 3 button.
   */
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

  /* CLAMBAKE CURSOR MODE - LEVEL 3 */

  function clambakeLevelThreeCursorMode() {
    return Boolean(
      window.clambakeInputMode &&
      window.clambakeInputMode.cursorMode()
    );
  }

  function clambakeLevelThreeInside(
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
        !clambakeLevelThreeCursorMode() ||
        !state.active ||
        event.pointerType === "touch"
      ) {
        return;
      }

      if (!state.dragging) {
        if (
          !clambakeLevelThreeInside(
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

        startPickupWatch();

        if (
          state.balanceActive &&
          state.carrying
        ) {
          state.balanceLastX =
            state.helperX;

          state.balanceLastY =
            state.helperY;

          state.balanceLastTime =
            performance.now();

          state.balanceGraceUntil =
            performance.now() +
            180;
        }

        helper.classList.add(
          "is-dragging"
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

      /*
       * Important:
       * keep the existing wobble calculation.
       */
      if (
        !updateBalance(
          point.x,
          point.y
        )
      ) {
        return;
      }

      setHelperPosition(
        point.x,
        point.y
      );

      checkMaterialPickup();

      /*
       * Cursor mode has no pointer-up event,
       * so carrying an item into the pit
       * completes the drop automatically.
       */
      if (
        state.carrying &&
        helperInsidePit()
      ) {
        state.dragging =
          false;

        state.pointerId =
          null;

        helper.classList.remove(
          "is-dragging"
        );

        stopPickupWatch();

        deliverMaterial();
      }
    }
  );

})();