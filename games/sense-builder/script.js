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
    new Audio("../../sounds/sparkle.mp3");

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

  function updateStats() {
    matchesDisplay.textContent =
      `${matchedCount}/${pieces.length}`;

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

    showFeedback(
      "correct",
      "⭐ GREAT JOB! ⭐"
    );

    window.setTimeout(() => {
      if (resultController) {
        resultController.showFinal({
          title: "Great Job!",
          message:
            "You built the five senses!",
        });

        return;
      }

      startButton.textContent =
        "PLAY AGAIN";

      startButton.hidden = false;
    }, 700);
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

      if (matchedCount >= pieces.length) {
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

        onRetry: startRound,
        onPlayAgain: startRound,

        onHome: () => {
          window.location.href =
            "../../index.html";
        },
      });
  }

  updateSoundButton();
  resetRound();
})();
