(() => {
  "use strict";

  const stage =
    document.getElementById("beachStage");

  const patches =
    Array.from(
      document.querySelectorAll(
        ".clam-patch"
      )
    );

  const diggingStick =
    document.getElementById(
      "diggingStick"
    );

  const clam =
    document.getElementById("clam");

  const basket =
    document.getElementById("basket");

  const basketClam =
    document.getElementById(
      "basketClam"
    );

  const digProgress =
    document.getElementById(
      "digProgress"
    );

  const digProgressFill =
    document.getElementById(
      "digProgressFill"
    );

  const instructionText =
    document.getElementById(
      "instructionText"
    );

  const instructionIcon =
    document.getElementById(
      "instructionIcon"
    );

  const reactionBubble =
    document.getElementById(
      "reactionBubble"
    );

  const animalElements =
    Array.from(
      document.querySelectorAll(
        ".story-animal"
      )
    );

  const sandPuffs =
    document.getElementById(
      "sandPuffs"
    );

  const demoHand =
    document.getElementById(
      "demoHand"
    );

  const demoLabel =
    document.getElementById(
      "demoLabel"
    );

  const startOverlay =
    document.getElementById(
      "startOverlay"
    );

  const completeOverlay =
    document.getElementById(
      "completeOverlay"
    );

  const startButton =
    document.getElementById(
      "startButton"
    );

  const playAgainButton =
    document.getElementById(
      "playAgainButton"
    );

  const soundButton =
    document.getElementById(
      "soundButton"
    );

  const gameLive =
    document.getElementById(
      "gameLive"
    );

  const DIG_TARGET = 135;

  const layouts = [
    {
      patchIndex: 0,
      basketSide: "right",
      stickSide: "left",
    },
    {
      patchIndex: 1,
      basketSide: "right",
      stickSide: "left",
    },
    {
      patchIndex: 2,
      basketSide: "left",
      stickSide: "right",
    },
    {
      patchIndex: 1,
      basketSide: "left",
      stickSide: "right",
    },
  ];

  const digReactions = [
    "Gull: I saw water spurt there!",
    "Crow: Something is under the sand!",
    "Bear: Keep digging!",
  ];

  const successReactions = [
    "Bear: A clam!",
    "Gull: You found it!",
    "Crow: Into the basket it goes!",
  ];

  let soundEnabled = true;
  let gameStarted = false;
  let completed = false;

  let activePatch = null;
  let lastLayoutIndex = -1;

  let dragState = null;

  let digAmount = 0;
  let lastDigPoint = null;
  let clamHome = null;

  let demoAnimation = null;
  let demoTimer = 0;

  let audioContext = null;

  function randomItem(items) {
    return items[
      Math.floor(
        Math.random() * items.length
      )
    ];
  }

  function chooseLayout() {
    let index =
      Math.floor(
        Math.random() *
          layouts.length
      );

    if (
      layouts.length > 1 &&
      index === lastLayoutIndex
    ) {
      index =
        (index + 1) %
        layouts.length;
    }

    lastLayoutIndex = index;

    return layouts[index];
  }

  function setInstruction(
    text,
    icon = "☝️"
  ) {
    instructionText.textContent = text;
    instructionIcon.textContent = icon;
    gameLive.textContent = text;
  }

  function setReaction(text) {
    reactionBubble.textContent = text;

    reactionBubble.classList.remove(
      "is-pop"
    );

    void reactionBubble.offsetWidth;

    reactionBubble.classList.add(
      "is-pop"
    );
  }

  function getAudioContext() {
    if (!soundEnabled) {
      return null;
    }

    if (!audioContext) {
      const Context =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!Context) {
        return null;
      }

      audioContext =
        new Context();
    }

    if (
      audioContext.state === "suspended"
    ) {
      audioContext.resume();
    }

    return audioContext;
  }

  function playTone(
    frequency = 440,
    duration = 0.08,
    type = "sine",
    volume = 0.05
  ) {
    const context =
      getAudioContext();

    if (!context) {
      return;
    }

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    oscillator.type = type;
    oscillator.frequency.value =
      frequency;

    gain.gain.value = volume;

    oscillator.connect(gain);
    gain.connect(
      context.destination
    );

    oscillator.start();

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      context.currentTime +
        duration
    );

    oscillator.stop(
      context.currentTime +
        duration
    );
  }

  function playPickupSound() {
    playTone(390, 0.07, "triangle", 0.045);

    window.setTimeout(() => {
      playTone(
        510,
        0.07,
        "triangle",
        0.04
      );
    }, 55);
  }

  function playDigSound() {
    playTone(
      145 + Math.random() * 30,
      0.04,
      "square",
      0.012
    );
  }

  function playRevealSound() {
    playTone(430, 0.1, "sine", 0.045);

    window.setTimeout(() => {
      playTone(
        620,
        0.11,
        "sine",
        0.05
      );
    }, 85);

    window.setTimeout(() => {
      playTone(
        810,
        0.16,
        "sine",
        0.055
      );
    }, 170);
  }

  function playSuccessSound() {
    [
      523,
      659,
      784,
    ].forEach(
      (frequency, index) => {
        window.setTimeout(() => {
          playTone(
            frequency,
            0.18,
            "triangle",
            0.055
          );
        }, index * 105);
      }
    );
  }

  function speak(text) {
    if (
      !soundEnabled ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        text
      );

    utterance.rate = 0.9;
    utterance.pitch = 1.04;
    utterance.volume = 0.95;

    window.speechSynthesis.speak(
      utterance
    );
  }

  function stagePoint(
    clientX,
    clientY
  ) {
    const rect =
      stage.getBoundingClientRect();

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function setDraggedPosition(
    element,
    clientX,
    clientY
  ) {
    const point =
      stagePoint(
        clientX,
        clientY
      );

    const x =
      Math.max(
        24,
        Math.min(
          stage.clientWidth - 24,
          point.x
        )
      );

    const y =
      Math.max(
        24,
        Math.min(
          stage.clientHeight - 24,
          point.y
        )
      );

    element.style.left =
      `${x}px`;

    element.style.right =
      "auto";

    element.style.top =
      `${y}px`;

    element.style.bottom =
      "auto";
  }

  function clearDraggedPosition(
    element
  ) {
    element.style.left = "";
    element.style.right = "";
    element.style.top = "";
    element.style.bottom = "";
  }

  function expandedContains(
    rect,
    x,
    y,
    padding = 45
  ) {
    return (
      x >= rect.left - padding &&
      x <= rect.right + padding &&
      y >= rect.top - padding &&
      y <= rect.bottom + padding
    );
  }

  function isPointInPatch(
    clientX,
    clientY
  ) {
    if (!activePatch) {
      return false;
    }

    const rect =
      activePatch
        .getBoundingClientRect();

    return expandedContains(
      rect,
      clientX,
      clientY,
      22
    );
  }

  function positionDigMeter() {
    if (!activePatch) {
      return;
    }

    const stageRect =
      stage.getBoundingClientRect();

    const patchRect =
      activePatch
        .getBoundingClientRect();

    digProgress.style.left =
      `${
        patchRect.left -
        stageRect.left +
        patchRect.width / 2 -
        56
      }px`;

    digProgress.style.top =
      `${
        patchRect.top -
        stageRect.top -
        22
      }px`;
  }

  function updateDigMeter() {
    const percent =
      Math.max(
        0,
        Math.min(
          100,
          (digAmount /
            DIG_TARGET) *
            100
        )
      );

    digProgressFill.style.width =
      `${percent}%`;
  }

  function createSandPuff(
    clientX,
    clientY
  ) {
    const point =
      stagePoint(
        clientX,
        clientY
      );

    const puff =
      document.createElement(
        "span"
      );

    puff.className =
      "sand-puff";

    puff.style.left =
      `${point.x - 8}px`;

    puff.style.top =
      `${point.y - 8}px`;

    sandPuffs.appendChild(
      puff
    );

    window.setTimeout(() => {
      puff.remove();
    }, 520);
  }

  function cancelDemo() {
    window.clearTimeout(
      demoTimer
    );

    if (demoAnimation) {
      demoAnimation.cancel();
      demoAnimation = null;
    }

    demoHand.classList.remove(
      "is-visible",
      "is-pressing"
    );

    demoLabel.classList.remove(
      "is-visible"
    );
  }

  function runDragDemo() {
    cancelDemo();

    if (
      !gameStarted ||
      completed ||
      !activePatch
    ) {
      return;
    }

    const stageRect =
      stage.getBoundingClientRect();

    const stickRect =
      diggingStick
        .getBoundingClientRect();

    const patchRect =
      activePatch
        .getBoundingClientRect();

    const startX =
      stickRect.left -
      stageRect.left +
      stickRect.width / 2;

    const startY =
      stickRect.top -
      stageRect.top +
      stickRect.height * 0.28;

    const targetX =
      patchRect.left -
      stageRect.left +
      patchRect.width / 2;

    const targetY =
      patchRect.top -
      stageRect.top +
      patchRect.height / 2;

    demoHand.style.left =
      `${startX}px`;

    demoHand.style.top =
      `${startY}px`;

    demoHand.classList.add(
      "is-visible",
      "is-pressing"
    );

    demoLabel.classList.add(
      "is-visible"
    );

    demoAnimation =
      demoHand.animate(
        [
          {
            left: `${startX}px`,
            top: `${startY}px`,
            opacity: 0,
          },
          {
            left: `${startX}px`,
            top: `${startY}px`,
            opacity: 1,
            offset: 0.18,
          },
          {
            left:
              `${
                startX +
                (targetX - startX) *
                  0.46
              }px`,
            top:
              `${
                startY +
                (targetY - startY) *
                  0.46
              }px`,
            opacity: 1,
            offset: 0.55,
          },
          {
            left: `${targetX}px`,
            top: `${targetY}px`,
            opacity: 1,
            offset: 0.82,
          },
          {
            left: `${targetX}px`,
            top: `${targetY}px`,
            opacity: 0,
          },
        ],
        {
          duration: 2600,
          easing: "ease-in-out",
        }
      );

    demoAnimation.onfinish =
      () => {
        demoHand.classList.remove(
          "is-visible",
          "is-pressing"
        );

        demoLabel.classList.remove(
          "is-visible"
        );

        demoAnimation = null;
      };
  }

  function positionClamAtPatch() {
    if (!activePatch) {
      return;
    }

    const stageRect =
      stage.getBoundingClientRect();

    const patchRect =
      activePatch
        .getBoundingClientRect();

    clamHome = {
      x:
        patchRect.left -
        stageRect.left +
        patchRect.width / 2,
      y:
        patchRect.top -
        stageRect.top +
        patchRect.height / 2,
    };

    clam.style.left =
      `${clamHome.x}px`;

    clam.style.top =
      `${clamHome.y}px`;

    clam.style.right = "auto";
    clam.style.bottom = "auto";
    clam.style.transform =
      "translate(-50%, -50%)";
  }

  function revealClam() {
    if (
      clam.hidden === false ||
      completed
    ) {
      return;
    }

    digAmount = DIG_TARGET;

    updateDigMeter();

    activePatch.classList.remove(
      "is-digging"
    );

    activePatch.classList.add(
      "is-found"
    );

    diggingStick.classList.remove(
      "is-dragging"
    );

    clearDraggedPosition(
      diggingStick
    );

    dragState = null;
    lastDigPoint = null;

    positionClamAtPatch();

    clam.hidden = false;

    clam.classList.add(
      "is-revealed"
    );

    digProgress.classList.remove(
      "is-visible"
    );

    setInstruction(
      "Drag the clam into the basket.",
      "🐚"
    );

    setReaction(
      randomItem(
        successReactions
      )
    );

    playRevealSound();

    speak(
      "You found a clam! Click and hold the clam. Drag it into the basket, then release."
    );
  }

  function doDig(
    clientX,
    clientY
  ) {
    if (
      dragState?.kind !==
        "stick" ||
      clam.hidden === false
    ) {
      return;
    }

    const inside =
      isPointInPatch(
        clientX,
        clientY
      );

    activePatch.classList.toggle(
      "is-digging",
      inside
    );

    if (!inside) {
      lastDigPoint = null;
      return;
    }

    if (!lastDigPoint) {
      lastDigPoint = {
        x: clientX,
        y: clientY,
      };

      return;
    }

    const distance =
      Math.hypot(
        clientX -
          lastDigPoint.x,
        clientY -
          lastDigPoint.y
      );

    lastDigPoint = {
      x: clientX,
      y: clientY,
    };

    if (distance < 2) {
      return;
    }

    digAmount +=
      Math.min(
        13,
        distance * 0.85
      );

    digProgress.classList.add(
      "is-visible"
    );

    updateDigMeter();

    if (
      Math.random() < 0.54
    ) {
      createSandPuff(
        clientX,
        clientY
      );

      playDigSound();
    }

    if (
      digAmount >
        DIG_TARGET * 0.42 &&
      digAmount <
        DIG_TARGET * 0.49
    ) {
      setReaction(
        randomItem(
          digReactions
        )
      );
    }

    if (
      digAmount >=
      DIG_TARGET
    ) {
      revealClam();
    }
  }

  function startDrag(
    event,
    kind,
    element
  ) {
    if (
      !gameStarted ||
      completed ||
      dragState
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

    if (
      kind === "clam" &&
      clam.hidden
    ) {
      return;
    }

    cancelDemo();

    event.preventDefault();

    dragState = {
      kind,
      element,
      pointerId:
        event.pointerId,
    };

    element.classList.add(
      "is-dragging"
    );

    try {
      element.setPointerCapture(
        event.pointerId
      );
    } catch {
      // Optional.
    }

    playPickupSound();

    setDraggedPosition(
      element,
      event.clientX,
      event.clientY
    );

    if (kind === "stick") {
      positionDigMeter();

      setInstruction(
        "Keep dragging over the squirting sand.",
        "↔️"
      );

      doDig(
        event.clientX,
        event.clientY
      );
    }
  }

  function moveDrag(event) {
    if (
      !dragState ||
      event.pointerId !==
        dragState.pointerId
    ) {
      return;
    }

    event.preventDefault();

    setDraggedPosition(
      dragState.element,
      event.clientX,
      event.clientY
    );

    if (
      dragState.kind ===
      "stick"
    ) {
      doDig(
        event.clientX,
        event.clientY
      );
    }
  }

  function returnClamHome() {
    if (!clamHome) {
      return;
    }

    clam.classList.remove(
      "is-dragging"
    );

    clam.style.left =
      `${clamHome.x}px`;

    clam.style.top =
      `${clamHome.y}px`;

    clam.style.transform =
      "translate(-50%, -50%)";

    clam.classList.remove(
      "is-wrong"
    );

    void clam.offsetWidth;

    clam.classList.add(
      "is-wrong"
    );

    window.setTimeout(() => {
      clam.classList.remove(
        "is-wrong"
      );
    }, 480);
  }

  function celebrateAnimals() {
    animalElements.forEach(
      (animal, index) => {
        window.setTimeout(() => {
          animal.classList.add(
            "celebrate"
          );

          window.setTimeout(() => {
            animal.classList.remove(
              "celebrate"
            );
          }, 1250);
        }, index * 100);
      }
    );
  }

  function completeLevel() {
    if (completed) {
      return;
    }

    completed = true;

    clam.hidden = true;
    basketClam.hidden = false;

    basket.classList.add(
      "is-success"
    );

    setInstruction(
      "Great job! The clam is in the basket!",
      "⭐"
    );

    setReaction(
      "Gull: The clam is ready for the clambake!"
    );

    celebrateAnimals();

    playSuccessSound();

    speak(
      "Great job! You found a clam and dragged it into the basket."
    );

    window.setTimeout(() => {
      completeOverlay.hidden =
        false;
    }, 1150);
  }

  function endDrag(event) {
    if (
      !dragState ||
      event.pointerId !==
        dragState.pointerId
    ) {
      return;
    }

    const {
      kind,
      element,
    } = dragState;

    try {
      if (
        element.hasPointerCapture(
          event.pointerId
        )
      ) {
        element.releasePointerCapture(
          event.pointerId
        );
      }
    } catch {
      // Optional.
    }

    element.classList.remove(
      "is-dragging"
    );

    if (kind === "stick") {
      activePatch.classList.remove(
        "is-digging"
      );

      clearDraggedPosition(
        diggingStick
      );

      lastDigPoint = null;

      dragState = null;

      if (
        clam.hidden &&
        !completed
      ) {
        setInstruction(
          "Drag the digging stick over the squirting sand.",
          "☝️"
        );
      }

      return;
    }

    if (kind === "clam") {
      const basketRect =
        basket
          .getBoundingClientRect();

      const success =
        expandedContains(
          basketRect,
          event.clientX,
          event.clientY,
          58
        );

      dragState = null;

      if (success) {
        completeLevel();
        return;
      }

      returnClamHome();

      setInstruction(
        "Almost! Drag the clam into the basket.",
        "🐚"
      );

      setReaction(
        "Bear: Try the basket!"
      );

      playTone(
        210,
        0.14,
        "triangle",
        0.03
      );

      speak(
        "Almost. Try again. Drag the clam into the basket."
      );
    }
  }

  function resetRound() {
    cancelDemo();

    completed = false;
    gameStarted = false;

    dragState = null;
    digAmount = 0;
    lastDigPoint = null;
    clamHome = null;

    basketClam.hidden = true;

    basket.classList.remove(
      "is-success"
    );

    clam.hidden = true;

    clam.classList.remove(
      "is-revealed",
      "is-dragging",
      "is-wrong"
    );

    clearDraggedPosition(
      diggingStick
    );

    diggingStick.classList.remove(
      "is-dragging"
    );

    digProgress.classList.remove(
      "is-visible"
    );

    digProgressFill.style.width =
      "0%";

    patches.forEach((patch) => {
      patch.classList.remove(
        "is-active",
        "is-digging",
        "is-found"
      );
    });

    const layout =
      chooseLayout();

    stage.dataset.basketSide =
      layout.basketSide;

    stage.dataset.stickSide =
      layout.stickSide;

    activePatch =
      patches[
        layout.patchIndex
      ];

    activePatch.classList.add(
      "is-active"
    );

    positionDigMeter();

    setInstruction(
      "Click Start Adventure!",
      "☝️"
    );

    setReaction(
      "What are they looking for?"
    );
  }

  function startRound() {
    startOverlay.hidden = true;
    completeOverlay.hidden = true;

    gameStarted = true;

    setInstruction(
      "Drag the digging stick over the squirting sand.",
      "☝️"
    );

    setReaction(
      "Gull: Look! Water is spurting from the wet sand."
    );

    playTone(
      440,
      0.08,
      "triangle",
      0.04
    );

    speak(
      "At low tide, little holes in the wet sand can show where clams are hiding. Click and hold the digging stick. Drag it over the sand where the water squirts."
    );

    demoTimer =
      window.setTimeout(
        runDragDemo,
        900
      );
  }

  diggingStick.addEventListener(
    "pointerdown",
    (event) => {
      startDrag(
        event,
        "stick",
        diggingStick
      );
    }
  );

  clam.addEventListener(
    "pointerdown",
    (event) => {
      startDrag(
        event,
        "clam",
        clam
      );
    }
  );

  document.addEventListener(
    "pointermove",
    moveDrag,
    {
      passive: false,
    }
  );

  document.addEventListener(
    "pointerup",
    endDrag
  );

  document.addEventListener(
    "pointercancel",
    endDrag
  );

  startButton.addEventListener(
    "click",
    () => {
      getAudioContext();
      startRound();
    }
  );

  playAgainButton.addEventListener(
    "click",
    () => {
      completeOverlay.hidden =
        true;

      resetRound();

      gameStarted = true;

      setInstruction(
        "Drag the digging stick over the squirting sand.",
        "☝️"
      );

      setReaction(
        "Gull: I see another place to look!"
      );

      speak(
        "Let's explore again. Find the squirting sand and drag the digging stick over it."
      );

      demoTimer =
        window.setTimeout(
          runDragDemo,
          800
        );
    }
  );

  soundButton.addEventListener(
    "click",
    () => {
      soundEnabled =
        !soundEnabled;

      soundButton.textContent =
        soundEnabled
          ? "🔊"
          : "🔇";

      soundButton.setAttribute(
        "aria-label",
        soundEnabled
          ? "Turn spoken directions off"
          : "Turn spoken directions on"
      );

      if (
        !soundEnabled &&
        "speechSynthesis" in window
      ) {
        window
          .speechSynthesis
          .cancel();
      } else if (
        soundEnabled &&
        gameStarted &&
        !completed
      ) {
        speak(
          instructionText.textContent
        );
      }
    }
  );

  window.addEventListener(
    "resize",
    () => {
      positionDigMeter();

      if (
        !clam.hidden &&
        !dragState
      ) {
        positionClamAtPatch();
      }
    }
  );

  resetRound();
})();
