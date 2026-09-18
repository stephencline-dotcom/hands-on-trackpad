(() => {
  "use strict";

  const arena =
    document.getElementById("senseArena");

  const board =
    document.getElementById("senseBoard");

  const startButton =
    document.getElementById("senseStartButton");

  const feedback =
    document.getElementById("senseFeedback");

  const roundDisplay =
    document.getElementById("senseRound");

  const instructionDisplay =
    document.getElementById("senseInstruction");

  const matchesDisplay =
    document.getElementById("senseMatches");

  const triesDisplay =
    document.getElementById("senseTries");

  const soundButton =
    document.getElementById("senseSoundButton");

  const pieceTray =
    document.getElementById("sensePieceTray");

  const pieces = Array.from(
    document.querySelectorAll(".sense-piece")
  );

  const zones = Array.from(
    document.querySelectorAll(".sense-drop-zone")
  );

  const SENSE_ROUNDS = [
    {
      number: 1,
      instruction:
        "Build the person!",
      pieces: [
        {
          id: "eyes",
          match: "eyes",
          symbol: "👀",
          label: "Eyes",
        },
        {
          id: "left-ear",
          match: "left-ear",
          symbol: "👂",
          label: "Left ear",
          mirrored: true,
        },
        {
          id: "right-ear",
          match: "right-ear",
          symbol: "👂",
          label: "Right ear",
        },
        {
          id: "nose",
          match: "nose",
          symbol: "👃",
          label: "Nose",
        },
        {
          id: "mouth",
          match: "mouth",
          symbol: "👄",
          label: "Mouth",
        },
        {
          id: "left-hand",
          match: "left-hand",
          symbol: "✋",
          label: "Left hand",
          mirrored: true,
        },
        {
          id: "right-hand",
          match: "right-hand",
          symbol: "✋",
          label: "Right hand",
        },
      ],
      targets: {
        eyes: "eyes",
        leftEar: "left-ear",
        rightEar: "right-ear",
        nose: "nose",
        mouth: "mouth",
        leftHand: "left-hand",
        rightHand: "right-hand",
      },
    },
    {
      number: 2,
      instruction:
        "Match!",
      pieces: [
        {
          id: "rainbow",
          match: "sight",
          symbol: "🌈",
          label: "Rainbow",
        },
        {
          id: "music",
          match: "hearing",
          symbol: "🎵",
          label: "Music",
        },
        {
          id: "flower",
          match: "smell",
          symbol: "🌸",
          label: "Flower",
        },
        {
          id: "ice-cream",
          match: "taste",
          symbol: "🍦",
          label: "Ice cream",
        },
        {
          id: "feather",
          match: "touch",
          symbol: "🪶",
          label: "Feather",
        },
      ],
      targets: {
        eyes: "sight",
        leftEar: "hearing",
        rightEar: "hearing",
        nose: "smell",
        mouth: "taste",
        leftHand: "touch",
        rightHand: "touch",
      },
    },
  ];

  if (
    !arena ||
    !board ||
    !startButton ||
    !feedback ||
    !matchesDisplay ||
    !triesDisplay
  ) {
    return;
  }

  const correctSound =
    new Audio("../../sounds/woohoo.mp3");

  const wrongSound =
    new Audio("../../sounds/wrongflower.mp3");

  const pickupSound =
    new Audio("../../sounds/click.mp3");

  correctSound.preload = "auto";
  wrongSound.preload = "auto";
  pickupSound.preload = "auto";

  correctSound.volume = 0.75;
  wrongSound.volume = 0.58;
  pickupSound.volume = 0.45;

  let soundEnabled = true;
  let gameRunning = false;
  let currentRoundIndex = 0;
  let roundGoal =
    SENSE_ROUNDS[0].pieces.length;
  let matchedCount = 0;
  let tryCount = 0;
  let feedbackTimer = 0;
  let activeDropZone = null;
  let resultController = null;
  let trackpadGuide = null;

  const dragState = {
    piece: null,
    pointerId: null,
    offsetX: 0,
    offsetY: 0,
    originParent: null,
    originNextSibling: null,
    originRect: null,
    placeholder: null,
  };

  function playSound(audio) {
    if (!soundEnabled || !audio) {
      return;
    }

    try {
      audio.currentTime = 0;

      const playPromise =
        audio.play();

      if (
        playPromise &&
        typeof playPromise.catch ===
          "function"
      ) {
        playPromise.catch(() => {});
      }
    } catch {
      // Keep the game usable if audio is unavailable.
    }
  }

  function updateSoundButton() {
    if (!soundButton) {
      return;
    }

    soundButton.textContent =
      soundEnabled ? "🔊" : "🔇";

    soundButton.setAttribute(
      "aria-pressed",
      String(!soundEnabled)
    );

    soundButton.setAttribute(
      "aria-label",
      soundEnabled
        ? "Sound on"
        : "Sound off"
    );

    soundButton.title =
      soundEnabled
        ? "Sound on"
        : "Sound off";
  }

  const ROUND_TWO_SEQUENCE = [
    {
      match: "sight",
      prompt: "👀",
    },
    {
      match: "hearing",
      prompt: "👂",
    },
    {
      match: "smell",
      prompt: "👃",
    },
    {
      match: "taste",
      prompt: "👄",
    },
    {
      match: "touch",
      prompt: "✋",
    },
  ];

  let activeSenseMatch = "";

  function showActiveSenseStep(stepIndex = 0) {
    zones.forEach((zone) => {
      zone.classList.remove(
        "is-sense-active"
      );
    });

    activeSenseMatch = "";

    document.body.removeAttribute(
      "data-active-sense"
    );

    if (currentRoundIndex !== 1) {
      return;
    }

    const step =
      ROUND_TWO_SEQUENCE[stepIndex];

    if (!step) {
      return;
    }

    activeSenseMatch =
      step.match;

    document.body.setAttribute(
      "data-active-sense",
      activeSenseMatch
    );

    zones.forEach((zone) => {
      if (
        zone.dataset.match ===
        activeSenseMatch
      ) {
        zone.classList.add(
          "is-sense-active"
        );
      }
    });

    if (instructionDisplay) {
      instructionDisplay.textContent =
        step.prompt;
    }
  }

  function configureCurrentRound() {
    const round =
      SENSE_ROUNDS[currentRoundIndex];

    if (!round) {
      return;
    }

    /*
     * Round 2 uses a separate, face-focused
     * presentation instead of the Round 1
     * build-the-person layout.
     */
    document.body.classList.toggle(
      "sense-round-two",
      currentRoundIndex === 1
    );

    roundGoal =
      round.pieces.length;

    if (roundDisplay) {
      roundDisplay.textContent =
        String(round.number);
    }

    if (instructionDisplay) {
      instructionDisplay.textContent =
        round.instruction;
    }

    const targetElements = {
      eyes:
        document.querySelector(
          ".sense-eyes-zone"
        ),
      leftEar:
        document.querySelector(
          ".sense-left-ear-zone"
        ),
      rightEar:
        document.querySelector(
          ".sense-right-ear-zone"
        ),
      nose:
        document.querySelector(
          ".sense-nose-zone"
        ),
      mouth:
        document.querySelector(
          ".sense-mouth-zone"
        ),
      leftHand:
        document.querySelector(
          ".sense-left-hand-zone"
        ),
      rightHand:
        document.querySelector(
          ".sense-right-hand-zone"
        ),
    };

    Object.entries(
      round.targets
    ).forEach(
      ([targetName, matchName]) => {
        const target =
          targetElements[targetName];

        if (target) {
          target.dataset.match =
            matchName;
        }
      }
    );

    pieces.forEach(
      (piece, index) => {
        /*
         * A completed piece was temporarily
         * moved to document.body during dragging.
         * Return every button to the tray before
         * building the next round.
         */
        if (pieceTray) {
          pieceTray.appendChild(piece);
        }

        piece.classList.remove(
          "is-matched",
          "is-dragging",
          "is-returning"
        );

        piece.style.position = "";
        piece.style.left = "";
        piece.style.top = "";
        piece.style.width = "";
        piece.style.height = "";
        piece.style.margin = "";
        piece.style.transform = "";
        piece.style.opacity = "";

        const definition =
          round.pieces[index];

        if (!definition) {
          piece.hidden = true;
          return;
        }

        piece.hidden = false;

        piece.dataset.piece =
          definition.match;

        piece.dataset.itemId =
          definition.id;

        piece.setAttribute(
          "aria-label",
          definition.label
        );

        const symbol =
          document.createElement(
            "span"
          );

        symbol.textContent =
          definition.symbol;

        symbol.setAttribute(
          "aria-hidden",
          "true"
        );

        if (definition.mirrored) {
          symbol.classList.add(
            "sense-mirrored-picture"
          );
        }

        piece.replaceChildren(
          symbol
        );
      }
    );

    updateStats();

    showActiveSenseStep(0);
  }

  function updateStats() {
    matchesDisplay.textContent =
      `${matchedCount}/${roundGoal}`;

    triesDisplay.textContent =
      String(tryCount);
  }

  function showFeedback(type, message) {
    window.clearTimeout(
      feedbackTimer
    );

    feedback.textContent = message;

    feedback.classList.remove(
      "is-correct",
      "is-wrong",
      "is-visible"
    );

    feedback.classList.add(
      type === "correct"
        ? "is-correct"
        : "is-wrong",
      "is-visible"
    );

    feedbackTimer =
      window.setTimeout(() => {
        feedback.classList.remove(
          "is-visible"
        );
      }, 900);
  }

  function clearReadyZones() {
    if (activeDropZone) {
      activeDropZone.classList.remove(
        "is-ready"
      );
    }

    activeDropZone = null;
  }

  function getPieceSymbol(piece) {
    const symbol =
      piece.querySelector("span");

    return symbol
      ? symbol.textContent
      : "";
  }

  function getZonesForMatch(matchName) {
    return zones.filter(
      (zone) =>
        zone.dataset.match ===
        matchName
    );
  }

  function pointIsInsideZone(
    x,
    y,
    zone,
    padding = 0
  ) {
    const rect =
      zone.getBoundingClientRect();

    return (
      x >= rect.left - padding &&
      x <= rect.right + padding &&
      y >= rect.top - padding &&
      y <= rect.bottom + padding
    );
  }

  function getZoneAtPoint(
    x,
    y,
    pieceMatch = ""
  ) {
    const availableZones =
      zones.filter(
        (zone) =>
          !zone.classList.contains(
            "is-filled"
          )
      );

    /*
     * Give the piece's correct target a large
     * invisible landing area. This lets young
     * students succeed without an exact drop.
     */
    const forgivingCorrectZone =
      availableZones.find(
        (zone) =>
          zone.dataset.match ===
            pieceMatch &&
          pointIsInsideZone(
            x,
            y,
            zone,
            34
          )
      );

    if (forgivingCorrectZone) {
      return forgivingCorrectZone;
    }

    /*
     * A visibly wrong target still counts as
     * a wrong attempt when dropped directly on it.
     */
    return (
      availableZones.find(
        (zone) =>
          pointIsInsideZone(
            x,
            y,
            zone
          )
      ) || null
    );
  }

  function highlightZoneAtPoint() {
    /*
     * Targets remain visible without changing
     * while the student drags. This prevents
     * distracting flashing.
     */
  }

  function positionDraggedPiece(
    piece,
    clientX,
    clientY
  ) {
    const x =
      clientX - dragState.offsetX;

    const y =
      clientY - dragState.offsetY;

    /*
     * Transform movement stays on the browser's
     * compositor and avoids repainting the whole
     * game during every pointer movement.
     */
    piece.style.transform =
      `translate3d(${x}px, ${y}px, 0) scale(0.82)`;
  }

  function restorePieceToTray(piece) {
    if (!piece) {
      return;
    }

    const parent =
      dragState.originParent;

    const placeholder =
      dragState.placeholder;

    if (
      placeholder &&
      placeholder.parentNode
    ) {
      placeholder.replaceWith(piece);
    } else if (parent) {
      parent.appendChild(piece);
    }

    piece.classList.remove(
      "is-dragging",
      "is-returning"
    );

    piece.style.position = "";
    piece.style.left = "";
    piece.style.top = "";
    piece.style.width = "";
    piece.style.height = "";
    piece.style.margin = "";
    piece.style.transform = "";

    document.body.classList.remove(
      "sense-drag-active"
    );
  }

  function returnPiece(piece) {
    if (
      !piece ||
      !dragState.originRect
    ) {
      restorePieceToTray(piece);
      return;
    }

    piece.classList.remove(
      "is-dragging"
    );

    /*
     * Restore immediately. Animating a fixed emoji
     * across the full screen causes visible flashing
     * on some Chromebook graphics hardware.
     */
    restorePieceToTray(piece);
  }

  function placeMatchedPiece(piece) {
    const matchName =
      piece.dataset.piece || "";

    const symbol =
      getPieceSymbol(piece);

    const matchingZones =
      getZonesForMatch(matchName);

    matchingZones.forEach((zone) => {
      /*
       * In Round 2, the object is brought in
       * front of the sense organ, then clears
       * away so the face remains visible.
       */
      if (currentRoundIndex === 1) {
        zone.classList.add(
          "is-sense-complete"
        );

        zone.innerHTML = "";

        window.setTimeout(() => {
          zone.classList.remove(
            "is-sense-complete"
          );
        }, 500);

        return;
      }

      zone.classList.add(
        "is-filled"
      );

      zone.innerHTML = "";

      const placed =
        document.createElement("span");

      placed.className =
        "sense-placed-picture";

      if (
        matchName === "left-ear" ||
        matchName === "left-hand"
      ) {
        placed.classList.add(
          "sense-mirrored-picture"
        );
      }

      placed.textContent = symbol;
      placed.setAttribute(
        "aria-hidden",
        "true"
      );

      zone.appendChild(placed);
    });

    piece.classList.remove(
      "is-dragging"
    );

    piece.classList.add(
      "is-matched"
    );

    document.body.classList.remove(
      "sense-drag-active"
    );

    if (currentRoundIndex === 1) {
      const completedStep =
        ROUND_TWO_SEQUENCE.findIndex(
          (step) =>
            step.match === matchName
        );

      showActiveSenseStep(
        completedStep + 1
      );
    }

    if (dragState.placeholder) {
      dragState.placeholder.classList.add(
        "is-matched-placeholder"
      );
    }

    window.setTimeout(() => {
      piece.hidden = true;
    }, 180);
  }

  function resetDragState() {
    dragState.piece = null;
    dragState.pointerId = null;
    dragState.offsetX = 0;
    dragState.offsetY = 0;
    dragState.originParent = null;
    dragState.originNextSibling = null;
    dragState.originRect = null;
    dragState.placeholder = null;

    clearReadyZones();
  }

  function finishRound() {
    gameRunning = false;

    const hasNextRound =
      currentRoundIndex <
      SENSE_ROUNDS.length - 1;

    showFeedback(
      "correct",
      "⭐ GREAT JOB! ⭐"
    );

    window.setTimeout(() => {
      if (resultController) {
        if (hasNextRound) {
          resultController.showSuccess({
            title: "Round Complete!",
            message:
              "Great matching!",
          });
        } else {
          resultController.showFinal({
            title: "You Did It!",
            message:
              "You matched the five senses!",
          });
        }

        return;
      }

      startButton.textContent =
        hasNextRound
          ? "NEXT ROUND"
          : "PLAY AGAIN";

      startButton.hidden = false;
    }, 700);
  }

  function startNextRound() {
    if (
      currentRoundIndex >=
      SENSE_ROUNDS.length - 1
    ) {
      return;
    }

    currentRoundIndex += 1;
    startRound();
  }

  function playAllRoundsAgain() {
    currentRoundIndex = 0;
    startRound();
  }

  function handlePiecePointerDown(
    event
  ) {
    const piece =
      event.currentTarget;

    if (
      !gameRunning ||
      piece.hidden ||
      piece.classList.contains(
        "is-matched"
      )
    ) {
      return;
    }

    if (
      event.button !== 0 &&
      event.pointerType !== "touch"
    ) {
      return;
    }

    /*
     * Round 2 teaches one sense at a time.
     * Only the picture matching the glowing
     * body part can be moved.
     */
    if (
      currentRoundIndex === 1 &&
      piece.dataset.piece !==
        activeSenseMatch
    ) {
      event.preventDefault();

      showFeedback(
        "wrong",
        "TRY ANOTHER PICTURE"
      );

      piece.classList.remove(
        "is-gentle-shake"
      );

      void piece.offsetWidth;

      piece.classList.add(
        "is-gentle-shake"
      );

      window.setTimeout(() => {
        piece.classList.remove(
          "is-gentle-shake"
        );
      }, 420);

      return;
    }

    event.preventDefault();

    const rect =
      piece.getBoundingClientRect();

    dragState.piece = piece;
    dragState.pointerId =
      event.pointerId;
    dragState.offsetX =
      event.clientX - rect.left;
    dragState.offsetY =
      event.clientY - rect.top;
    dragState.originParent =
      piece.parentNode;
    dragState.originNextSibling =
      piece.nextSibling;
    dragState.originRect = {
      left: rect.left,
      top: rect.top,
    };

    const placeholder =
      document.createElement("div");

    placeholder.className =
      "sense-piece-placeholder";

    placeholder.style.width =
      `${rect.width}px`;

    placeholder.style.height =
      `${rect.height}px`;

    piece.replaceWith(placeholder);

    dragState.placeholder =
      placeholder;

    piece.style.width =
      `${rect.width}px`;

    piece.style.height =
      `${rect.height}px`;

    piece.style.position =
      "fixed";

    piece.style.left = "0";
    piece.style.top = "0";
    piece.style.margin = "0";

    document.body.classList.add(
      "sense-drag-active"
    );

    document.body.appendChild(piece);

    piece.classList.add(
      "is-dragging"
    );

    try {
      piece.setPointerCapture(
        event.pointerId
      );
    } catch {
      // Pointer capture is optional.
    }

    playSound(pickupSound);

    positionDraggedPiece(
      piece,
      event.clientX,
      event.clientY
    );

    highlightZoneAtPoint(
      event.clientX,
      event.clientY
    );
  }

  function handlePiecePointerMove(
    event
  ) {
    const piece =
      dragState.piece;

    if (
      !piece ||
      event.pointerId !==
        dragState.pointerId
    ) {
      return;
    }

    event.preventDefault();

    positionDraggedPiece(
      piece,
      event.clientX,
      event.clientY
    );

    highlightZoneAtPoint(
      event.clientX,
      event.clientY
    );
  }

  function handlePiecePointerEnd(
    event
  ) {
    const piece =
      dragState.piece;

    if (
      !piece ||
      event.pointerId !==
        dragState.pointerId
    ) {
      return;
    }

    const pieceMatch =
      piece.dataset.piece || "";

    const zone =
      getZoneAtPoint(
        event.clientX,
        event.clientY,
        pieceMatch
      );

    const correctMatch =
      zone &&
      zone.dataset.match ===
        pieceMatch;

    try {
      if (
        piece.hasPointerCapture(
          event.pointerId
        )
      ) {
        piece.releasePointerCapture(
          event.pointerId
        );
      }
    } catch {
      // Pointer capture release is optional.
    }

    tryCount += 1;

    if (correctMatch) {
      placeMatchedPiece(piece);

      matchedCount += 1;

      playSound(correctSound);

      showFeedback(
        "correct",
        "⭐ YES! ⭐"
      );

      updateStats();
      resetDragState();

      if (matchedCount >= roundGoal) {
        finishRound();
      }

      return;
    }

    playSound(wrongSound);

    showFeedback(
      "wrong",
      "↩️ TRY AGAIN"
    );

    updateStats();
    clearReadyZones();
    returnPiece(piece);

    resetDragState();
  }

  function resetRound() {
    matchedCount = 0;
    tryCount = 0;
    gameRunning = false;

    window.clearTimeout(
      feedbackTimer
    );

    feedback.textContent = "";

    feedback.classList.remove(
      "is-visible",
      "is-correct",
      "is-wrong"
    );

    zones.forEach((zone) => {
      zone.innerHTML = "";
      zone.classList.remove(
        "is-filled",
        "is-ready"
      );
    });

    document
      .querySelectorAll(
        ".sense-piece-placeholder"
      )
      .forEach((placeholder) => {
        placeholder.remove();
      });

    pieces.forEach((piece) => {
      if (pieceTray) {
        pieceTray.appendChild(piece);
      }

      piece.hidden = false;

      piece.classList.remove(
        "is-matched",
        "is-dragging",
        "is-returning"
      );

      piece.style.position = "";
      piece.style.left = "";
      piece.style.top = "";
      piece.style.width = "";
      piece.style.height = "";
      piece.style.margin = "";
    });

    resetDragState();
    updateStats();
  }

  function startRound() {
    resetRound();
    configureCurrentRound();

    gameRunning = true;
    startButton.hidden = true;

    showFeedback(
      "correct",
      "☝️ DRAG!"
    );
  }

  pieces.forEach((piece) => {
    piece.addEventListener(
      "pointerdown",
      handlePiecePointerDown
    );

    piece.addEventListener(
      "pointermove",
      handlePiecePointerMove
    );

    piece.addEventListener(
      "pointerup",
      handlePiecePointerEnd
    );

    piece.addEventListener(
      "pointercancel",
      handlePiecePointerEnd
    );
  });

  startButton.addEventListener(
    "click",
    startRound
  );

  if (soundButton) {
    soundButton.addEventListener(
      "click",
      () => {
        soundEnabled =
          !soundEnabled;

        updateSoundButton();
      }
    );
  }

  const trackpadScene =
    document.getElementById(
      "senseTrackpadScene"
    );

  const leftHand =
    document.getElementById(
      "senseTrackpadLeftHand"
    );

  const rightHand =
    document.getElementById(
      "senseTrackpadRightHand"
    );

  if (
    window.trackpadGuide &&
    trackpadScene &&
    leftHand &&
    rightHand
  ) {
    trackpadGuide =
      window.trackpadGuide.create({
        scene: trackpadScene,
        leftHand,
        rightHand,
        pointerSpace: "viewport",
      });

    if (
      trackpadGuide &&
      typeof trackpadGuide
        .initialize === "function"
    ) {
      trackpadGuide.initialize();
    }
  }

  /*
   * The guide updates on press and release only.
   * Continuous mouse tracking caused white GPU
   * flashes on Chromebook displays.
   */

  document.addEventListener(
    "pointerdown",
    (event) => {
      if (!trackpadGuide) {
        return;
      }

      trackpadGuide
        .updateFromPointerEvent(event);

      trackpadGuide.setPressed(true);
    }
  );

  document.addEventListener(
    "pointerup",
    (event) => {
      if (!trackpadGuide) {
        return;
      }

      trackpadGuide
        .updateFromPointerEvent(event);

      trackpadGuide.setPressed(false);
    }
  );

  document.addEventListener(
    "pointercancel",
    () => {
      if (trackpadGuide) {
        trackpadGuide.setPressed(false);
      }
    }
  );

  if (
    window.LevelResultController
  ) {
    resultController =
      new window.LevelResultController({
        host: arena,

        pauseGame: () => {
          gameRunning = false;
        },

        onNextLevel:
          startNextRound,

        onRetry: startRound,

        onPlayAgain:
          playAllRoundsAgain,

        onHome: () => {
          window.location.href =
            "../../index.html";
        },
      });
  }

  updateSoundButton();
  resetRound();
  configureCurrentRound();
})();
