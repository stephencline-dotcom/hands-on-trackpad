(() => {
  "use strict";

  const stage =
    document.getElementById(
      "beachStage"
    );

  const winOverlay =
    document.getElementById(
      "winOverlay"
    );

  const playAgainButton =
    document.getElementById(
      "playAgainButton"
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
    !winOverlay ||
    !playAgainButton ||
    !instructionText
  ) {
    return;
  }

  const FOODS = [
    "corn",
    "potato",
    "lobster",
    "clam"
  ];

  const LABELS = {
    corn: "Corn",
    potato: "Potato",
    lobster: "Lobster",
    clam: "Clam"
  };

  /*
   * Five escalating rounds.
   * There is no visible timer.
   * The crabs create the pressure.
   */
  const ROUND_CONFIGS = [
    {
      foods: 1,
      crabs: 1,
      crabDelay: 3900,
      crabSpeed: .115
    },
    {
      foods: 1,
      crabs: 1,
      crabDelay: 3000,
      crabSpeed: .145
    },
    {
      foods: 1,
      crabs: 2,
      crabDelay: 2400,
      crabSpeed: .17
    },
    {
      foods: 2,
      crabs: 2,
      crabDelay: 1900,
      crabSpeed: .195
    },
    {
      foods: 3,
      crabs: 2,
      crabDelay: 1450,
      crabSpeed: .22
    }
  ];

  const FOOD_SLOTS = [
    [34, 64],
    [47, 79],
    [58, 61],
    [69, 80],
    [80, 64],
    [89, 78]
  ];

  const state = {
    active: false,
    round: 0,
    requestQueue: [],
    requestIndex: 0,

    pointerId: null,
    dragging: false,

    carrying: null,
    carriedFoods: [],

    avatarX: 0,
    avatarY: 0,

    crabs: [],
    crabFrame: 0,
    crabStartTimer: 0,
    lastFrame: 0,

    stolenCount: 0
  };

  let gatherLayer = null;
  let foodField = null;
  let crabField = null;

  let helperAvatar = null;
  let carrySlot = null;

  let communityZone = null;

  let requestText = null;
  let requestRow = null;
  let roundText = null;

  let crabAlert = null;
  let celebration = null;

  function soundEnabled() {
    return (
      !soundToggle ||
      soundToggle.getAttribute(
        "aria-pressed"
      ) !== "false"
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

  function speak(message) {
    if (
      !soundEnabled() ||
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

      window.__clambakeGatherAudio =
        window.__clambakeGatherAudio ||
        new Context();

      const context =
        window.__clambakeGatherAudio;

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
      // Audio is optional.
    }
  }

  function successSound() {
    tone(520);

    window.setTimeout(
      () => tone(680),
      85
    );

    window.setTimeout(
      () => tone(
        840,
        .13
      ),
      170
    );
  }

  function wrongSound() {
    tone(
      170,
      .13,
      "square",
      .025
    );
  }

  /* MULTI FOOD CARRY MODE */

  function renderCarryBundle() {
    carrySlot.innerHTML = "";

    state.carriedFoods.forEach(
      (food) => {
        const token =
          document.createElement(
            "span"
          );

        token.className =
          "carried-food-token";

        token.dataset.food =
          food;

        token.appendChild(
          foodArt(food)
        );

        carrySlot.appendChild(
          token
        );
      }
    );

    helperAvatar.classList.toggle(
      "is-carrying",
      state.carriedFoods.length > 0
    );
  }
  function currentFood() {
    return (
      state.requestQueue[
        state.requestIndex
      ] || null
    );
  }

  function foodArt(food) {
    const art =
      document.createElement(
        "span"
      );

    art.className =
      "food-art";

    art.dataset.food =
      food;

    return art;
  }

  function buildLayer() {
    if (gatherLayer) {
      return;
    }

    gatherLayer =
      document.createElement(
        "section"
      );

    gatherLayer.className =
      "gather-layer";

    gatherLayer.hidden =
      true;

    gatherLayer.innerHTML = `
      <div class="rescue-hud">
        <span class="rescue-kicker">
          WAMPANOAG FOOD GATHERING
        </span>

        <p
          id="rescueRequest"
          class="rescue-request"
        >
          Listen for the food to gather.
        </p>

        <div
          id="rescueRequestRow"
          class="rescue-request-row"
        ></div>
      </div>

      <div
        id="rescueRound"
        class="rescue-round"
      >
        ROUND 1 OF 5
      </div>

      <div
        id="crabAlert"
        class="crab-alert"
        hidden
      >
        WATCH OUT FOR THE CRABS!
      </div>

      <div
        id="communityZone"
        class="community-zone"
        aria-label="Wampanoag gathering area"
      >
        <div class="community-person">
          <div class="community-person-head"></div>
          <div class="community-person-body"></div>
        </div>

        <div class="community-basket"></div>

        <span class="community-sign">
          GATHERING BASKET
        </span>
      </div>

      <div
        id="foodField"
        class="food-field"
      ></div>

      <div
        id="crabField"
        class="crab-field"
      ></div>

      <div
        id="helperAvatar"
        class="helper-avatar"
        role="button"
        tabindex="0"
        aria-label="Wampanoag helper. Click, hold, and drag."
      >
        <div class="helper-head"></div>

        <div class="helper-body"></div>

        <span
          class="helper-arm helper-arm-left"
        ></span>

        <span
          class="helper-arm helper-arm-right"
        ></span>

        <span
          class="helper-leg helper-leg-left"
        ></span>

        <span
          class="helper-leg helper-leg-right"
        ></span>

        <div
          id="carrySlot"
          class="carry-slot"
        ></div>

        <span class="helper-name">
          Wampanoag Helper
        </span>
      </div>

      <div class="helper-coach">
        CLICK + HOLD + DRAG THE HELPER
      </div>

      <div
        id="rescueCelebration"
        class="rescue-celebration"
        hidden
      >
        <div class="rescue-celebration-card">
          <span class="overlay-kicker">
            FOOD GATHERED!
          </span>

          <h2>
            Great work!
          </h2>

          <p>
            You gathered the food for the
            Wampanoag clambake before the
            crabs could take it.
          </p>

          <div class="rescue-button-row">
            <button
              id="rescueAgainButton"
              class="primary-button"
              type="button"
            >
              PLAY AGAIN
            </button>

            <button
              id="backToBeachButton"
              class="rescue-secondary-button"
              type="button"
            >
              BEACH CLAM HUNT
            </button>
          </div>
        </div>
      </div>
    `;

    stage.appendChild(
      gatherLayer
    );

    foodField =
      document.getElementById(
        "foodField"
      );

    crabField =
      document.getElementById(
        "crabField"
      );

    helperAvatar =
      document.getElementById(
        "helperAvatar"
      );

    carrySlot =
      document.getElementById(
        "carrySlot"
      );

    communityZone =
      document.getElementById(
        "communityZone"
      );

    requestText =
      document.getElementById(
        "rescueRequest"
      );

    requestRow =
      document.getElementById(
        "rescueRequestRow"
      );

    roundText =
      document.getElementById(
        "rescueRound"
      );

    crabAlert =
      document.getElementById(
        "crabAlert"
      );

    celebration =
      document.getElementById(
        "rescueCelebration"
      );

    helperAvatar.addEventListener(
      "pointerdown",
      startHelperDrag
    );

    helperAvatar.addEventListener(
      "pointermove",
      moveHelper
    );

    helperAvatar.addEventListener(
      "pointerup",
      endHelperDrag
    );

    helperAvatar.addEventListener(
      "pointercancel",
      endHelperDrag
    );

    document
      .getElementById(
        "rescueAgainButton"
      )
      .addEventListener(
        "click",
        startGatherGame
      );

    document
      .getElementById(
        "backToBeachButton"
      )
      .addEventListener(
        "click",
        () => {
          window.location.reload();
        }
      );
  }

  function addContinueButton() {
    if (
      document.getElementById(
        "continueAdventureButton"
      )
    ) {
      return;
    }

    const button =
      document.createElement(
        "button"
      );

    button.id =
      "continueAdventureButton";

    button.type =
      "button";

    button.className =
      "primary-button continue-adventure-button";

    button.textContent =
      "CONTINUE ADVENTURE";

    button.addEventListener(
      "click",
      startGatherGame
    );

    playAgainButton.parentNode
      .insertBefore(
        button,
        playAgainButton
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
          48,
          Math.min(
            rect.width - 48,
            clientX - rect.left
          )
        ),

      y:
        Math.max(
          80,
          Math.min(
            rect.height - 76,
            clientY - rect.top
          )
        )
    };
  }

  function setAvatarPosition(
    x,
    y
  ) {
    state.avatarX = x;
    state.avatarY = y;

    helperAvatar.style.left =
      `${x}px`;

    helperAvatar.style.top =
      `${y}px`;
  }

  function resetAvatar() {
    const rect =
      stage.getBoundingClientRect();

    setAvatarPosition(
      rect.width * .19,
      rect.height * .69
    );

    helperAvatar.classList.remove(
      "is-carrying"
    );

    state.carrying = null;
    state.carriedFoods = [];

    renderCarryBundle();

    communityZone.classList.remove(
      "is-ready"
    );
  }

  function buildRequest() {
    const config =
      ROUND_CONFIGS[state.round];

    const foods =
      shuffle(FOODS);

    state.requestQueue =
      foods.slice(
        0,
        config.foods
      );

    state.requestIndex = 0;
  }

  function renderRequest() {
    requestRow.innerHTML = "";

    state.requestQueue.forEach(
      (food, index) => {
        const token =
          document.createElement(
            "div"
          );

        token.className =
          "rescue-request-food";

        token.dataset.food =
          food;

        if (
          index <
          state.requestIndex
        ) {
          token.classList.add(
            "is-done"
          );
        }

        token.appendChild(
          foodArt(food)
        );

        requestRow.appendChild(
          token
        );
      }
    );

    const food =
      currentFood();

    if (!food) {
      return;
    }

    if (
      state.requestQueue.length === 1
    ) {
      requestText.textContent =
        `Gather the ${LABELS[food]}.`;
    }
    else {
      requestText.textContent =
        `Next: ${LABELS[food]}`;
    }

    instructionText.textContent =
      `Move the helper to the ${LABELS[food].toLowerCase()}, then bring it back to the basket.`;
  }

  function chooseFoodSlots() {
    return shuffle(
      FOOD_SLOTS
    ).slice(
      0,
      FOODS.length
    );
  }

  function renderFoodField() {
    foodField.innerHTML = "";

    const foods =
      shuffle(FOODS);

    const slots =
      chooseFoodSlots();

    foods.forEach(
      (food, index) => {
        const piece =
          document.createElement(
            "div"
          );

        piece.className =
          "food-piece";

        piece.dataset.food =
          food;

        piece.style.left =
          `${slots[index][0]}%`;

        piece.style.top =
          `${slots[index][1]}%`;

        if (
          food === currentFood()
        ) {
          piece.classList.add(
            "is-requested"
          );
        }

        piece.appendChild(
          foodArt(food)
        );

        const label =
          document.createElement(
            "span"
          );

        label.className =
          "food-label";

        label.textContent =
          LABELS[food];

        piece.appendChild(
          label
        );

        foodField.appendChild(
          piece
        );
      }
    );
  }

  function foodElement(
    food
  ) {
    return (
      Array.from(
        foodField.querySelectorAll(
          ".food-piece"
        )
      ).find(
        (piece) =>
          piece.dataset.food ===
          food
      ) || null
    );
  }

  function helperCenter() {
    const rect =
      helperAvatar
        .getBoundingClientRect();

    return {
      x:
        rect.left +
        rect.width / 2,

      y:
        rect.top +
        rect.height / 2
    };
  }

  function elementCenter(
    element
  ) {
    const rect =
      element.getBoundingClientRect();

    return {
      x:
        rect.left +
        rect.width / 2,

      y:
        rect.top +
        rect.height / 2
    };
  }

  function distance(
    a,
    b
  ) {
    return Math.hypot(
      a.x - b.x,
      a.y - b.y
    );
  }

  function checkFoodPickup() {
    if (
      !state.active ||
      !currentFood()
    ) {
      return;
    }

    const helperRect =
      helperAvatar
        .getBoundingClientRect();

    const pieces =
      Array.from(
        foodField.querySelectorAll(
          ".food-piece"
        )
      );

    for (
      const piece of pieces
    ) {
      const pieceRect =
        piece.getBoundingClientRect();

      /*
       * Use forgiving rectangle overlap instead
       * of center-to-center distance.
       *
       * Kindergarteners only need to move the
       * helper onto the food visually.
       */
      const pickupPadding = 18;

      const touching =
        helperRect.right >=
          pieceRect.left -
          pickupPadding &&
        helperRect.left <=
          pieceRect.right +
          pickupPadding &&
        helperRect.bottom >=
          pieceRect.top -
          pickupPadding &&
        helperRect.top <=
          pieceRect.bottom +
          pickupPadding;

      if (!touching) {
        continue;
      }

      const food =
        piece.dataset.food;

      if (
        food !==
        currentFood()
      ) {
        piece.classList.remove(
          "is-wrong"
        );

        void piece.offsetWidth;

        piece.classList.add(
          "is-wrong"
        );

        wrongSound();

        instructionText.textContent =
          `That is ${LABELS[food].toLowerCase()}. Find the ${LABELS[currentFood()].toLowerCase()}.`;

        return;
      }

      pickUpFood(
        food,
        piece
      );

      return;
    }
  }

  function pickUpFood(
    food,
    element
  ) {
    stopCrabTimer();

    const wasEmpty =
      state.carriedFoods.length === 0;

    state.carriedFoods.push(
      food
    );

    state.carrying =
      food;

    element.remove();

    state.requestIndex += 1;

    renderCarryBundle();
    renderRequest();

    successSound();

    /*
     * As soon as the first food is collected,
     * the crabs begin chasing the helper.
     *
     * They keep chasing while the child gathers
     * the remaining foods.
     */
    if (wasEmpty) {
      startCrabsImmediately();
    }

    if (
      state.requestIndex <
      state.requestQueue.length
    ) {
      const next =
        currentFood();

      foodField
        .querySelectorAll(
          ".food-piece"
        )
        .forEach(
          (piece) => {
            piece.classList.toggle(
              "is-requested",
              piece.dataset.food ===
                next
            );
          }
        );

      communityZone.classList.remove(
        "is-ready"
      );

      instructionText.textContent =
        `Great! Keep carrying it. Now get the ${LABELS[next].toLowerCase()}!`;

      speak(
        `Great. Keep carrying the food. Now get the ${LABELS[next].toLowerCase()}. Watch out for the crabs.`
      );

      return;
    }

    /*
     * All requested food is now in the helper's arms.
     * Only now does the gathering area become the goal.
     */
    communityZone.classList.add(
      "is-ready"
    );

    const count =
      state.carriedFoods.length;

    instructionText.textContent =
      count === 1
        ? `You have the ${LABELS[food].toLowerCase()}! Get back to the gathering basket!`
        : `You have all ${count} foods! Get back to the gathering basket without touching a crab!`;

    speak(
      count === 1
        ? `You found the ${LABELS[food].toLowerCase()}. Get back to the gathering basket.`
        : `You have all ${count} foods. Now get back to the gathering basket without touching a crab.`
    );
  }

  function startHelperDrag(
    event
  ) {
    if (
      !state.active
    ) {
      return;
    }

    if (
      event.button !== 0 &&
      event.pointerType !==
        "touch"
    ) {
      return;
    }

    event.preventDefault();

    state.pointerId =
      event.pointerId;

    state.dragging =
      true;

    helperAvatar.classList.add(
      "is-dragging"
    );

    try {
      helperAvatar
        .setPointerCapture(
          event.pointerId
        );
    }
    catch {
    }

    moveHelper(event);
  }

  function moveHelper(
    event
  ) {
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

    setAvatarPosition(
      point.x,
      point.y
    );

    checkFoodPickup();
  }

  function helperInsideCommunity() {
    const helperRect =
      helperAvatar
        .getBoundingClientRect();

    const zoneRect =
      communityZone
        .getBoundingClientRect();

    const x =
      helperRect.left +
      helperRect.width / 2;

    const y =
      helperRect.top +
      helperRect.height / 2;

    return (
      x >= zoneRect.left &&
      x <= zoneRect.right &&
      y >= zoneRect.top &&
      y <= zoneRect.bottom
    );
  }

  function endHelperDrag(
    event
  ) {
    if (
      event.pointerId !==
        state.pointerId
    ) {
      return;
    }

    helperAvatar.classList.remove(
      "is-dragging"
    );

    try {
      if (
        helperAvatar
          .hasPointerCapture(
            event.pointerId
          )
      ) {
        helperAvatar
          .releasePointerCapture(
            event.pointerId
          );
      }
    }
    catch {
    }

    state.dragging =
      false;

    state.pointerId =
      null;

    if (
      state.carriedFoods.length > 0 &&
      state.requestIndex >=
        state.requestQueue.length &&
      helperInsideCommunity()
    ) {
      deliverFood();
    }
  }

  function deliverFood() {
    stopCrabs();

    const deliveredFoods =
      state.carriedFoods.slice();

    state.carriedFoods = [];
    state.carrying = null;

    renderCarryBundle();

    communityZone.classList.remove(
      "is-ready"
    );

    successSound();

    const deliveredNames =
      deliveredFoods
        .map(
          (food) =>
            LABELS[food]
        )
        .join(", ");

    instructionText.textContent =
      `${deliveredNames} delivered! Round complete.`;

    state.round += 1;

    if (
      state.round >=
      ROUND_CONFIGS.length
    ) {
      window.setTimeout(
        finishGatherGame,
        750
      );

      return;
    }

    window.setTimeout(
      beginRound,
      850
    );
  }

  function stopCrabTimer() {
    window.clearTimeout(
      state.crabStartTimer
    );

    state.crabStartTimer =
      0;
  }

  function stopCrabs() {
    stopCrabTimer();

    if (state.crabFrame) {
      window.cancelAnimationFrame(
        state.crabFrame
      );
    }

    state.crabFrame = 0;

    state.crabs = [];

    if (crabField) {
      crabField.innerHTML = "";
    }

    if (crabAlert) {
      crabAlert.hidden = true;
    }
  }

  function makeCrab(
    index
  ) {
    const stageRect =
      stage.getBoundingClientRect();

    const fromRight =
      index % 2 === 0;

    const crab =
      document.createElement(
        "div"
      );

    crab.className =
      "rescue-crab";

    crab.innerHTML = `
      <div class="crab-body"></div>
      <span class="crab-claw crab-claw-left"></span>
      <span class="crab-claw crab-claw-right"></span>
      <span class="crab-leg crab-leg-one"></span>
      <span class="crab-leg crab-leg-two"></span>
      <span class="crab-leg crab-leg-three"></span>
      <span class="crab-leg crab-leg-four"></span>
    `;

    const x =
      fromRight
        ? stageRect.width + 65
        : -65;

    const y =
      stageRect.height *
      (
        .58 +
        Math.random() *
        .3
      );

    crab.style.left =
      `${x}px`;

    crab.style.top =
      `${y}px`;

    crab.style.transform =
      fromRight
        ? "scaleX(-1)"
        : "scaleX(1)";

    crabField.appendChild(
      crab
    );

    return {
      element: crab,
      x,
      y
    };
  }

  function startCrabsImmediately() {
    stopCrabs();

    const config =
      ROUND_CONFIGS[
        Math.min(
          state.round,
          ROUND_CONFIGS.length - 1
        )
      ];

    crabAlert.hidden =
      false;

    window.setTimeout(
      () => {
        if (crabAlert) {
          crabAlert.hidden =
            true;
        }
      },
      900
    );

    state.crabs =
      Array.from(
        {
          length:
            config.crabs
        },
        (_, index) =>
          makeCrab(index)
      );

    state.lastFrame =
      performance.now();

    state.crabFrame =
      window.requestAnimationFrame(
        moveCrabs
      );
  }

  function scheduleCrabs() {
    stopCrabs();

    if (
      !state.active ||
      !currentFood()
    ) {
      return;
    }

    const config =
      ROUND_CONFIGS[state.round];

    state.crabStartTimer =
      window.setTimeout(
        startCrabsImmediately,
        config.crabDelay
      );
  }

  function crabTarget() {
    if (
      state.carriedFoods.length > 0
    ) {
      return helperCenter();
    }

    const target =
      foodElement(
        currentFood()
      );

    if (!target) {
      return null;
    }

    return elementCenter(
      target
    );
  }

  function moveCrabs(now) {
    if (
      !state.active ||
      !state.crabs.length
    ) {
      return;
    }

    const config =
      ROUND_CONFIGS[
        Math.min(
          state.round,
          ROUND_CONFIGS.length - 1
        )
      ];

    const target =
      crabTarget();

    if (!target) {
      stopCrabs();
      return;
    }

    const delta =
      Math.min(
        42,
        now - state.lastFrame
      );

    state.lastFrame =
      now;

    for (
      const crab of state.crabs
    ) {
      const dx =
        target.x -
        crab.x;

      const dy =
        target.y -
        crab.y;

      const distanceToTarget =
        Math.max(
          1,
          Math.hypot(
            dx,
            dy
          )
        );

      const step =
        Math.min(
          distanceToTarget,
          config.crabSpeed *
          delta
        );

      crab.x +=
        (
          dx /
          distanceToTarget
        ) *
        step;

      crab.y +=
        (
          dy /
          distanceToTarget
        ) *
        step;

      crab.element.style.left =
        `${crab.x}px`;

      crab.element.style.top =
        `${crab.y}px`;

      crab.element.style.transform =
        dx < 0
          ? "scaleX(-1)"
          : "scaleX(1)";

      if (
        distanceToTarget <
        (
          state.carrying
            ? 54
            : 42
        )
      ) {
        crabWins(
          crab
        );

        return;
      }
    }

    state.crabFrame =
      window.requestAnimationFrame(
        moveCrabs
      );
  }

  function crabWins(
    crab
  ) {
    if (!state.active) {
      return;
    }

    if (
      state.carriedFoods.length > 0
    ) {
      crabCatchesHelper(
        crab
      );
    }
    else {
      crabStealsFood(
        crab
      );
    }
  }

  function animateCrabExit(
    crab,
    callback
  ) {
    const stageRect =
      stage.getBoundingClientRect();

    const exitX =
      crab.x <
      stageRect.width / 2
        ? -120
        : stageRect.width + 120;

    crab.element.classList.add(
      "has-food"
    );

    crab.element.animate(
      [
        {
          left:
            `${crab.x}px`,
          top:
            `${crab.y}px`
        },
        {
          left:
            `${exitX}px`,
          top:
            `${
              Math.max(
                90,
                crab.y - 45
              )
            }px`
        }
      ],
      {
        duration: 750,
        easing: "ease-in",
        fill: "forwards"
      }
    );

    window.setTimeout(
      callback,
      780
    );
  }

  function crabStealsFood(
    crab
  ) {
    const stolen =
      currentFood();

    const element =
      foodElement(stolen);

    if (element) {
      element.remove();
    }

    state.stolenCount += 1;

    if (state.crabFrame) {
      window.cancelAnimationFrame(
        state.crabFrame
      );
    }

    state.crabFrame = 0;

    wrongSound();

    instructionText.textContent =
      `A crab grabbed the ${LABELS[stolen].toLowerCase()}! Another one is coming.`;

    speak(
      `The crab got the ${LABELS[stolen].toLowerCase()}. Try again.`
    );

    animateCrabExit(
      crab,
      () => {
        stopCrabs();

        renderFoodField();

        scheduleCrabs();
      }
    );
  }

  function crabCatchesHelper(
    crab
  ) {
    const lostFoods =
      state.carriedFoods.slice();

    state.carriedFoods = [];
    state.carrying = null;

    renderCarryBundle();

    helperAvatar.classList.remove(
      "is-carrying"
    );

    communityZone.classList.remove(
      "is-ready"
    );

    state.stolenCount += 1;

    if (state.crabFrame) {
      window.cancelAnimationFrame(
        state.crabFrame
      );
    }

    state.crabFrame = 0;

    wrongSound();

    const count =
      lostFoods.length;

    instructionText.textContent =
      count === 1
        ? "A crab caught you and took the food! Try the round again."
        : `A crab caught you and took all ${count} foods! Try the round again.`;

    speak(
      count === 1
        ? "A crab caught you and took the food. Try the round again."
        : `A crab caught you and took all ${count} foods. Gather them again and stay away from the crabs.`
    );

    animateCrabExit(
      crab,
      () => {
        stopCrabs();

        /*
         * Restart this SAME round from the beginning.
         */
        beginRound();
      }
    );
  }

  function beginRound() {
    stopCrabs();

    if (
      !state.active ||
      state.round >=
        ROUND_CONFIGS.length
    ) {
      finishGatherGame();
      return;
    }

    buildRequest();

    renderRequest();

    renderFoodField();

    resetAvatar();

    roundText.textContent =
      `ROUND ${
        state.round + 1
      } OF ${ROUND_CONFIGS.length}`;

    const food =
      currentFood();

    if (
      state.requestQueue.length === 1
    ) {
      speak(
        `Gather the ${LABELS[food].toLowerCase()}. Move the Wampanoag helper to the food and bring it back to the gathering basket.`
      );
    }
    else {
      const names =
        state.requestQueue
          .map(
            item =>
              LABELS[item]
                .toLowerCase()
          )
          .join(", ");

      speak(
        `Gather these foods: ${names}. Bring them back one at a time before the crabs get them.`
      );
    }

    scheduleCrabs();
  }

  function finishGatherGame() {
    stopCrabs();

    state.active =
      false;

    celebration.hidden =
      false;

    instructionText.textContent =
      "The food is gathered for the clambake!";

    speak(
      "Great work. The food is gathered for the clambake."
    );
  }

  function startGatherGame() {
    buildLayer();

    stopCrabs();

    winOverlay.hidden =
      true;

    stage.classList.add(
      "gather-feast-active"
    );

    gatherLayer.hidden =
      false;

    gatherLayer.removeAttribute(
      "hidden"
    );

    celebration.hidden =
      true;

    state.active = true;
    state.round = 0;
    state.requestIndex = 0;
    state.requestQueue = [];
    state.pointerId = null;
    state.dragging = false;
    state.carrying = null;
    state.carriedFoods = [];
    state.stolenCount = 0;

    if (missionLabel) {
      missionLabel.textContent =
        "GATHER THE FEAST";
    }

    if (clamProgress) {
      clamProgress.style.display =
        "none";
    }

    instructionText.textContent =
      "Move the Wampanoag helper to gather food before the crabs get it.";

    beginRound();
  }

  addContinueButton();

  const observer =
    new MutationObserver(
      () => {
        if (!winOverlay.hidden) {
          addContinueButton();
        }
      }
    );

  observer.observe(
    winOverlay,
    {
      attributes: true,
      attributeFilter: [
        "hidden"
      ]
    }
  );
})();