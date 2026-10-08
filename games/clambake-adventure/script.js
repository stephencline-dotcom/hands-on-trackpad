(() => {
  "use strict";

  const TOTAL_CLAMS = 5;

  const stage =
    document.getElementById("beachStage");

  const stick =
    document.getElementById("diggingStick");

  const clam =
    document.getElementById("foundClam");

  const basket =
    document.getElementById("clamBasket");

  const basketFill =
    document.getElementById("basketFill");

  const patches =
    Array.from(
      document.querySelectorAll(".clam-patch")
    );

  const clamDots =
    Array.from(
      document.querySelectorAll("#clamDots span")
    );

  const clamCount =
    document.getElementById("clamCount");

  const instructionText =
    document.getElementById("instructionText");

  const reactionSpeaker =
    document.getElementById("reactionSpeaker");

  const reactionText =
    document.getElementById("reactionText");

  const predatorGull =
    document.getElementById("predatorGull");

  const gullWarning =
    document.getElementById("gullWarning");

  const startOverlay =
    document.getElementById("startOverlay");

  const winOverlay =
    document.getElementById("winOverlay");

  const startButton =
    document.getElementById("startButton");

  const playAgainButton =
    document.getElementById("playAgainButton");

  const soundToggle =
    document.getElementById("soundToggle");

  const liveStatus =
    document.getElementById("liveStatus");

  const characters =
    Array.from(
      document.querySelectorAll(".story-animal")
    );

  const ATTACK_DELAYS = [
    1200,
    1000,
    850,
    700,
    550
  ];

  const GULL_SPEEDS = [
    0.26,
    0.31,
    0.36,
    0.42,
    0.48
  ];

  const state = {
    running: false,
    phase: "idle",
    collected: 0,
    activePatch: null,
    digProgress: 0,
    pointerId: null,
    dragType: null,
    lastX: 0,
    lastY: 0,
    clamHomeX: 0,
    clamHomeY: 0,
    attackTimer: 0,
    gullFrame: 0,
    gullActive: false,
    gullX: 0,
    gullY: 0,
    lastFrameTime: 0,
    patchBag: [],
    soundOn: true,
    audioContext: null
  };

  const oceanAudio =
    new Audio("../../sounds/ocean.mp3");

  const gullAudio =
    new Audio("../../sounds/seagullfix.mp3");

  const diggingAudio =
    new Audio("../../sounds/digging.mp3");

  const gullYoinkAudio =
    new Audio("../../sounds/crabyoink.mp3");

  oceanAudio.loop = true;
  oceanAudio.volume = 0.22;

  gullAudio.preload = "auto";
  gullAudio.volume = 0.95;

  diggingAudio.volume = 0.55;

  gullYoinkAudio.volume = 0.75;

  function safePlay(audio) {
    if (
      !state.soundOn ||
      !audio
    ) {
      return;
    }

    const playPromise =
      audio.play();

    if (
      playPromise &&
      typeof playPromise.catch === "function"
    ) {
      playPromise.catch(
        () => {}
      );
    }
  }

  function stopAudio(
    audio,
    reset = true
  ) {
    if (!audio) {
      return;
    }

    audio.pause();

    if (reset) {
      try {
        audio.currentTime = 0;
      }
      catch (error) {
        // Audio may not be ready yet.
      }
    }
  }

  function startOceanAudio() {
    if (!state.soundOn) {
      return;
    }

    safePlay(
      oceanAudio
    );
  }

  function stopOceanAudio() {
    stopAudio(
      oceanAudio,
      true
    );
  }

  function playGullAudio() {
    if (!state.soundOn) {
      return;
    }

    try {
      gullAudio.pause();

      gullAudio.currentTime =
        0;

      gullAudio.muted =
        false;

      gullAudio.volume =
        0.95;

      const playPromise =
        gullAudio.play();

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
    catch {
    }
  }

  function playGullYoinkAudio() {
    if (!state.soundOn) {
      return;
    }

    stopAudio(
      gullYoinkAudio,
      true
    );

    safePlay(
      gullYoinkAudio
    );
  }
  function startDiggingAudio() {
    if (
      !state.soundOn ||
      state.phase !== "digging"
    ) {
      return;
    }

    if (!diggingAudio.paused) {
      return;
    }

    try {
      diggingAudio.currentTime = 0;
    }
    catch (error) {
      // Audio may not be ready yet.
    }

    safePlay(
      diggingAudio
    );
  }

  function stopDiggingAudio() {
    stopAudio(
      diggingAudio,
      true
    );
  }

  function stopLevelOneAudio() {
    stopDiggingAudio();
    stopOceanAudio();

    stopAudio(
      gullAudio,
      true
    );

    stopAudio(
      gullYoinkAudio,
      true
    );
  }
  function shuffle(values) {
    const copy = values.slice();

    for (
      let i = copy.length - 1;
      i > 0;
      i -= 1
    ) {
      const j =
        Math.floor(
          Math.random() * (i + 1)
        );

      [
        copy[i],
        copy[j]
      ] = [
        copy[j],
        copy[i]
      ];
    }

    return copy;
  }

  function ensurePatchBag() {
    if (!state.patchBag.length) {
      state.patchBag = shuffle(patches);
    }
  }

  function announce(message) {
    liveStatus.textContent = "";

    window.setTimeout(
      () => {
        liveStatus.textContent = message;
      },
      20
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
      !("speechSynthesis" in window)
    ) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        message
      );

    utterance.rate = 0.95;
    utterance.pitch = 1.04;

    window.speechSynthesis.speak(
      utterance
    );
  }

  function tone(
    frequency,
    duration = 0.08,
    type = "sine",
    volume = 0.035
  ) {
    if (!state.soundOn) {
      return;
    }

    try {
      if (!state.audioContext) {
        state.audioContext =
          new (
            window.AudioContext ||
            window.webkitAudioContext
          )();
      }

      if (
        state.audioContext.state ===
        "suspended"
      ) {
        state.audioContext.resume();
      }

      const oscillator =
        state.audioContext.createOscillator();

      const gain =
        state.audioContext.createGain();

      oscillator.type = type;
      oscillator.frequency.value =
        frequency;

      gain.gain.value = volume;

      oscillator.connect(gain);
      gain.connect(
        state.audioContext.destination
      );

      const now =
        state.audioContext.currentTime;

      gain.gain.setValueAtTime(
        volume,
        now
      );

      gain.gain
        .exponentialRampToValueAtTime(
          0.0001,
          now + duration
        );

      oscillator.start(now);
      oscillator.stop(
        now + duration
      );
    }
    catch {
      // Sound is optional.
    }
  }

  function successSound() {
    tone(
      520,
      0.09,
      "triangle",
      0.05
    );

    window.setTimeout(
      () => {
        tone(
          660,
          0.10,
          "triangle",
          0.05
        );
      },
      90
    );

    window.setTimeout(
      () => {
        tone(
          820,
          0.14,
          "triangle",
          0.05
        );
      },
      180
    );
  }

  function setInstruction(
    message,
    spoken = false
  ) {
    instructionText.textContent =
      message;

    announce(message);

    if (spoken) {
      speak(message);
    }
  }

  function react(
    speaker,
    message,
    celebrate = false
  ) {
    reactionSpeaker.textContent =
      `${speaker}:`;

    reactionText.textContent =
      message;

    if (celebrate) {
      characters.forEach(
        (character) => {
          character.classList.remove(
            "celebrate"
          );

          void character.offsetWidth;

          character.classList.add(
            "celebrate"
          );
        }
      );
    }
  }

  function stagePoint(
    clientX,
    clientY
  ) {
    const rect =
      stage.getBoundingClientRect();

    return {
      x: Math.max(
        0,
        Math.min(
          rect.width,
          clientX - rect.left
        )
      ),

      y: Math.max(
        0,
        Math.min(
          rect.height,
          clientY - rect.top
        )
      )
    };
  }

  function setCenter(
    element,
    x,
    y
  ) {
    element.style.left =
      `${x}px`;

    element.style.top =
      `${y}px`;
  }

  function elementCenter(element) {
    const stageRect =
      stage.getBoundingClientRect();

    const rect =
      element.getBoundingClientRect();

    return {
      x:
        rect.left -
        stageRect.left +
        rect.width / 2,

      y:
        rect.top -
        stageRect.top +
        rect.height / 2
    };
  }

  function pointInRect(
    clientX,
    clientY,
    rect,
    padding = 0
  ) {
    return (
      clientX >= rect.left - padding &&
      clientX <= rect.right + padding &&
      clientY >= rect.top - padding &&
      clientY <= rect.bottom + padding
    );
  }

  function resetStickPosition() {
    stick.style.left = "";
    stick.style.top = "";

    stick.classList.remove(
      "is-dragging"
    );
  }

  function resetClamVisual() {
    clam.hidden = true;

    clam.classList.remove(
      "is-dragging",
      "is-revealed",
      "is-wrong"
    );

    clam.style.left = "";
    clam.style.top = "";
  }

  function updateProgress() {
    clamCount.textContent =
      `${state.collected} / ${TOTAL_CLAMS}`;

    clamDots.forEach(
      (dot, index) => {
        dot.classList.toggle(
          "filled",
          index < state.collected
        );
      }
    );
  }

  function updateBasketFill() {
    basketFill.innerHTML = "";

    const positions = [
      [8, 35, -9],
      [39, 28, 8],
      [70, 37, -5],
      [23, 55, 10],
      [56, 55, -8]
    ];

    for (
      let i = 0;
      i < state.collected;
      i += 1
    ) {
      const mini =
        document.createElement(
          "span"
        );

      mini.className =
        "mini-clam";

      const [
        left,
        top,
        rotate
      ] = positions[i];

      mini.style.left =
        `${left}%`;

      mini.style.top =
        `${top}%`;

      mini.style.rotate =
        `${rotate}deg`;

      basketFill.appendChild(
        mini
      );
    }
  }

  function clearPatchState() {
    patches.forEach(
      (patch) => {
        patch.classList.remove(
          "is-active",
          "is-digging"
        );

        patch.style.setProperty(
          "--dig-progress",
          "0%"
        );
      }
    );
  }

  function nextPatch() {
    ensurePatchBag();

    let next =
      state.patchBag.shift();

    if (
      next === state.activePatch &&
      patches.length > 1
    ) {
      ensurePatchBag();

      const alternate =
        state.patchBag.shift();

      state.patchBag.unshift(next);

      next = alternate;
    }

    return next;
  }

  function startDigRound() {
    if (
      !state.running ||
      state.collected >= TOTAL_CLAMS
    ) {
      return;
    }

    cancelGullAttack();
    clearPatchState();
    resetClamVisual();
    resetStickPosition();

    state.phase = "digging";
    state.digProgress = 0;
    state.activePatch = nextPatch();

    state.activePatch.classList.add(
      "is-active"
    );

    const lines = [
      [
        "Gull",
        "Look! Water is spurting from the wet sand."
      ],
      [
        "Crow",
        "I see another clue in the sand!"
      ],
      [
        "Bear",
        "Use the digging stick right over the spurt."
      ]
    ];

    const line =
      lines[
        state.collected %
        lines.length
      ];

    react(
      line[0],
      line[1]
    );

    setInstruction(
      "Click, hold, and drag the digging stick over the squirting sand.",
      state.collected === 0
    );
  }

  function revealClam() {
    if (
      state.phase !== "digging"
    ) {
      return;
    }

    stopDiggingAudio();

    state.phase = "clam-ready";

    resetStickPosition();

    const patchCenter =
      elementCenter(
        state.activePatch
      );

    state.clamHomeX =
      patchCenter.x;

    state.clamHomeY =
      patchCenter.y + 3;

    setCenter(
      clam,
      state.clamHomeX,
      state.clamHomeY
    );

    clam.hidden = false;

    clam.classList.remove(
      "is-revealed"
    );

    void clam.offsetWidth;

    clam.classList.add(
      "is-revealed"
    );

    state.activePatch.classList.remove(
      "is-digging"
    );

    tone(
      410,
      0.08,
      "triangle",
      0.04
    );

    window.setTimeout(
      () => {
        tone(
          620,
          0.12,
          "triangle",
          0.04
        );
      },
      80
    );

    react(
      "Crow",
      "A clam! Get it to the basket!",
      true
    );

    setInstruction(
      "Quick! Drag the clam to the basket before the sneaky gull gets it!",
      true
    );

    scheduleGullAttack();
  }

  function scheduleGullAttack() {
    window.clearTimeout(
      state.attackTimer
    );

    gullWarning.hidden = false;

    const index =
      Math.min(
        state.collected,
        ATTACK_DELAYS.length - 1
      );

    state.attackTimer =
      window.setTimeout(
        () => {
          gullWarning.hidden = true;
          startGullAttack();
        },
        ATTACK_DELAYS[index]
      );
  }

  function startGullAttack() {
    if (
      !state.running ||
      state.phase !== "clam-ready"
    ) {
      return;
    }

    playGullAudio();

    const stageRect =
      stage.getBoundingClientRect();

    const fromLeft =
      Math.random() < 0.5;

    state.gullX =
      fromLeft
        ? -35
        : stageRect.width + 35;

    state.gullY =
      stageRect.height *
      (
        0.18 +
        Math.random() * 0.14
      );

    state.gullActive = true;

    state.lastFrameTime =
      performance.now();

    predatorGull.hidden = false;

    predatorGull.classList.remove(
      "has-clam"
    );

    setCenter(
      predatorGull,
      state.gullX,
      state.gullY
    );

    react(
      "Gull",
      "Oh no - another gull is coming for the clam!"
    );

    tone(
      220,
      0.16,
      "sawtooth",
      0.035
    );

    state.gullFrame =
      window.requestAnimationFrame(
        moveGull
      );
  }

  function moveGull(now) {
    if (
      !state.gullActive ||
      state.phase !== "clam-ready" ||
      clam.hidden
    ) {
      return;
    }

    const target =
      elementCenter(clam);

    const dx =
      target.x - state.gullX;

    const dy =
      target.y - state.gullY;

    const distance =
      Math.max(
        1,
        Math.hypot(dx, dy)
      );

    const delta =
      Math.min(
        40,
        now - state.lastFrameTime
      );

    state.lastFrameTime = now;

    const speed =
      GULL_SPEEDS[
        Math.min(
          state.collected,
          GULL_SPEEDS.length - 1
        )
      ];

    const step =
      Math.min(
        distance,
        speed *
          (
            window.clambakeInputMode
              ? window.clambakeInputMode.speedMultiplier()
              : 1
          ) *
          delta
      );

    state.gullX +=
      (dx / distance) * step;

    state.gullY +=
      (dy / distance) * step;

    setCenter(
      predatorGull,
      state.gullX,
      state.gullY
    );

    predatorGull.style.transform =
      `scaleX(${dx < 0 ? -1 : 1})`;

    if (distance < 34) {
      gullStealsClam();
      return;
    }

    state.gullFrame =
      window.requestAnimationFrame(
        moveGull
      );
  }

  function cancelGullAttack() {
    window.clearTimeout(
      state.attackTimer
    );

    state.attackTimer = 0;

    if (state.gullFrame) {
      window.cancelAnimationFrame(
        state.gullFrame
      );
    }

    state.gullFrame = 0;
    state.gullActive = false;

    predatorGull
      .getAnimations()
      .forEach(
        (animation) => {
          animation.cancel();
        }
      );

    predatorGull.hidden = true;

    predatorGull.classList.remove(
      "has-clam"
    );

    predatorGull.style.transform = "";

    gullWarning.hidden = true;
  }

  function gullStealsClam() {
    if (
      state.phase !== "clam-ready"
    ) {
      return;
    }

    state.phase = "resetting";
    state.gullActive = false;

    if (state.gullFrame) {
      window.cancelAnimationFrame(
        state.gullFrame
      );

      state.gullFrame = 0;
    }

    if (
      state.dragType === "clam"
    ) {
      try {
        if (
          clam.hasPointerCapture(
            state.pointerId
          )
        ) {
          clam.releasePointerCapture(
            state.pointerId
          );
        }
      }
      catch {
      }

      clam.classList.remove(
        "is-dragging"
      );

      state.pointerId = null;
      state.dragType = null;
    }

    clam.hidden = true;

    predatorGull.classList.add(
      "has-clam"
    );

    tone(
      150,
      0.24,
      "sawtooth",
      0.04
    );

    react(
      "Bear",
      "That gull grabbed it. We can find another one!"
    );

    setInstruction(
      "The gull got that clam. No problem - dig for another one!",
      true
    );

    playGullYoinkAudio();

    const stageRect =
      stage.getBoundingClientRect();

    const exitX =
      state.gullX <
      stageRect.width / 2
        ? -130
        : stageRect.width + 130;

    predatorGull.animate(
      [
        {
          left: `${state.gullX}px`,
          top: `${state.gullY}px`
        },
        {
          left: `${exitX}px`,
          top:
            `${
              Math.max(
                25,
                state.gullY - 160
              )
            }px`
        }
      ],
      {
        duration: 850,
        easing: "ease-in",
        fill: "forwards"
      }
    );

    window.setTimeout(
      () => {
        predatorGull
          .getAnimations()
          .forEach(
            (animation) => {
              animation.cancel();
            }
          );

        predatorGull.hidden = true;

        predatorGull.classList.remove(
          "has-clam"
        );

        startDigRound();
      },
      900
    );
  }

  function collectClam() {
    if (
      state.phase !== "clam-ready"
    ) {
      return;
    }

    cancelGullAttack();

    state.phase = "resetting";
    state.collected += 1;
    clam.hidden = true;

    updateProgress();
    updateBasketFill();

    basket.classList.remove(
      "is-success"
    );

    void basket.offsetWidth;

    basket.classList.add(
      "is-success"
    );

    successSound();

    react(
      "Bear",
      state.collected < TOTAL_CLAMS
        ? "Great save! Find another clam!"
        : "Five clams! We did it!",
      true
    );

    if (
      state.collected >= TOTAL_CLAMS
    ) {
      setInstruction(
        "You collected all 5 clams!",
        true
      );

      window.setTimeout(
        finishGame,
        750
      );

      return;
    }

    setInstruction(
      `${state.collected} down - ${
        TOTAL_CLAMS -
        state.collected
      } more to find!`,
      true
    );

    window.setTimeout(
      startDigRound,
      780
    );
  }

  function finishGame() {
    stopLevelOneAudio();

    state.running = false;
    state.phase = "complete";

    clearPatchState();
    resetStickPosition();

    characters.forEach(
      (character) => {
        character.classList.add(
          "celebrate"
        );
      }
    );

    winOverlay.hidden = false;

    speak(
      "Beach complete! You collected five clams for the clambake adventure."
    );
  }

  function pointerDown(
    event,
    type
  ) {
    if (!state.running) {
      return;
    }

    if (
      type === "stick" &&
      state.phase !== "digging"
    ) {
      return;
    }

    if (
      type === "clam" &&
      state.phase !== "clam-ready"
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

    state.pointerId =
      event.pointerId;

    state.dragType = type;

    state.lastX =
      event.clientX;

    state.lastY =
      event.clientY;

    if (type === "stick") {
      startDiggingAudio();
    }

    const target =
      type === "stick"
        ? stick
        : clam;

    target.classList.add(
      "is-dragging"
    );

    if (!clambakeLevelOneCursorMode()) {
      try {
        target.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is optional.
      }
    }

    moveDragged(event);

    tone(
      type === "stick"
        ? 250
        : 360,
      0.04,
      "square",
      0.02
    );
  }

  function moveDragged(event) {
    if (
      (
        !clambakeLevelOneCursorMode() &&
        event.pointerId !== state.pointerId
      ) ||
      !state.dragType
    ) {
      return;
    }

    event.preventDefault();

    const point =
      clambakeLevelOneCursorMode()
        ? {
            x: event.clientX - stage.getBoundingClientRect().left,
            y: event.clientY - stage.getBoundingClientRect().top
          }
        : stagePoint(
            event.clientX,
            event.clientY
          );

    const target =
      state.dragType === "stick"
        ? stick
        : clam;

    setCenter(
      target,
      point.x,
      point.y
    );

    if (
      state.dragType === "stick"
    ) {
      updateDigging(event);
    }

    state.lastX =
      event.clientX;

    state.lastY =
      event.clientY;
  }

  function updateDigging(event) {
    if (
      state.phase !== "digging" ||
      !state.activePatch
    ) {
      return;
    }

    const patchRect =
      state.activePatch
        .getBoundingClientRect();

    const onPatch =
      pointInRect(
        event.clientX,
        event.clientY,
        patchRect,
        8
      );

    state.activePatch
      .classList.toggle(
        "is-digging",
        onPatch
      );

    if (!onPatch) {
      return;
    }

    const travel =
      Math.hypot(
        event.clientX -
          state.lastX,
        event.clientY -
          state.lastY
      );

    state.digProgress =
      Math.min(
        1,
        state.digProgress +
          travel / 235
      );

    state.activePatch
      .style.setProperty(
        "--dig-progress",
        `${
          Math.round(
            state.digProgress * 100
          )
        }%`
      );

    if (
      travel > 4 &&
      Math.floor(
        state.digProgress * 10
      ) % 3 === 0
    ) {
      tone(
        185 +
          state.digProgress *
          80,
        0.03,
        "square",
        0.012
      );
    }

    if (
      state.digProgress >= 1
    ) {
      releasePointer(
        event,
        false
      );

      revealClam();
    }
  }

  function pointerUp(event) {
    if (state.dragType === "stick") {
      stopDiggingAudio();
    }

    if (
      event.pointerId !==
        state.pointerId ||
      !state.dragType
    ) {
      return;
    }

    const type =
      state.dragType;

    if (
      type === "clam" &&
      state.phase === "clam-ready"
    ) {
      const basketRect =
        basket.getBoundingClientRect();

      if (
        pointInRect(
          event.clientX,
          event.clientY,
          basketRect,
          18
        )
      ) {
        releasePointer(
          event,
          false
        );

        collectClam();
        return;
      }

      clam.classList.remove(
        "is-wrong"
      );

      void clam.offsetWidth;

      clam.classList.add(
        "is-wrong"
      );

      setCenter(
        clam,
        state.clamHomeX,
        state.clamHomeY
      );

      react(
        "Crow",
        "Almost! Release the clam right over the basket."
      );

      setInstruction(
        "Try again - drag the clam into the basket and release."
      );

      tone(
        170,
        0.11,
        "square",
        0.03
      );
    }

    releasePointer(
      event,
      type === "stick"
    );
  }

  function releasePointer(
    event,
    resetStick
  ) {
    const type =
      state.dragType;

    if (type === "stick") {
      startDiggingAudio();
    }

    const target =
      type === "stick"
        ? stick
        : clam;

    if (target) {
      target.classList.remove(
        "is-dragging"
      );

      try {
        if (
          target.hasPointerCapture(
            event.pointerId
          )
        ) {
          target.releasePointerCapture(
            event.pointerId
          );
        }
      }
      catch {
      }
    }

    state.pointerId = null;
    state.dragType = null;

    if (
      resetStick &&
      state.phase === "digging"
    ) {
      resetStickPosition();

      if (state.activePatch) {
        state.activePatch
          .classList.remove(
            "is-digging"
          );
      }
    }
  }

  function resetGame() {
    cancelGullAttack();

    stopLevelOneAudio();
    startOceanAudio();

    state.running = true;
    state.phase = "idle";
    state.collected = 0;
    state.activePatch = null;
    state.patchBag = [];
    state.pointerId = null;
    state.dragType = null;

    updateProgress();
    updateBasketFill();
    clearPatchState();
    resetClamVisual();
    resetStickPosition();

    characters.forEach(
      (character) => {
        character.classList.remove(
          "celebrate"
        );
      }
    );

    stage.dataset.basketSide =
      Math.random() < 0.5
        ? "left"
        : "right";

    stage.dataset.stickSide =
      stage.dataset.basketSide ===
      "left"
        ? "right"
        : "left";

    winOverlay.hidden = true;
    startOverlay.hidden = true;

    react(
      "Gull",
      "Look! Water is spurting from the wet sand."
    );

    startDigRound();
  }

  stick.addEventListener(
    "pointerdown",
    (event) => {
      pointerDown(
        event,
        "stick"
      );
    }
  );

  stick.addEventListener(
    "pointermove",
    moveDragged
  );

  stick.addEventListener(
    "pointerup",
    pointerUp
  );

  stick.addEventListener(
    "pointercancel",
    pointerUp
  );

  clam.addEventListener(
    "pointerdown",
    (event) => {
      pointerDown(
        event,
        "clam"
      );
    }
  );

  clam.addEventListener(
    "pointermove",
    moveDragged
  );

  clam.addEventListener(
    "pointerup",
    pointerUp
  );

  clam.addEventListener(
    "pointercancel",
    pointerUp
  );

  startButton.addEventListener(
    "click",
    resetGame
  );

  playAgainButton.addEventListener(
    "click",
    resetGame
  );

  soundToggle.addEventListener(
    "click",
    () => {
      state.soundOn =
        !state.soundOn;

      soundToggle.setAttribute(
        "aria-pressed",
        String(state.soundOn)
      );

      soundToggle.textContent =
        state.soundOn
          ? "Sound On"
          : "Sound Off";

      /*
       * Sound On/Off controls game audio only.
       * Voice Directions is controlled separately by teacher settings.
       */
    }
  );

  /*
   * CLAMBAKE LEVEL 1 MP3 SOUND TOGGLE
   * Keep environmental/effect audio aligned with
   * the existing Sound On / Sound Off control.
   */
  if (soundToggle) {
    soundToggle.addEventListener(
      "click",
      () => {
        window.setTimeout(
          () => {
            if (!state.soundOn) {
              stopLevelOneAudio();
              return;
            }

            if (
              state.running &&
              state.phase !== "complete"
            ) {
              startOceanAudio();
            }

            if (
              state.dragType === "stick" &&
              state.phase === "digging"
            ) {
              startDiggingAudio();
            }
          },
          0
        );
      }
    );
  }

  updateProgress();
  updateBasketFill();

  /* CLAMBAKE CURSOR MODE - LEVEL 1 */

  function clambakeLevelOneCursorMode() {
    return Boolean(
      window.clambakeInputMode &&
      window.clambakeInputMode.cursorMode()
    );
  }

  function clambakeCursorEvent(
    originalEvent
  ) {
    return {
      pointerId:
        originalEvent.pointerId ?? 1,

      pointerType:
        originalEvent.pointerType ||
        "mouse",

      button: 0,

      clientX:
        originalEvent.clientX,

      clientY:
        originalEvent.clientY,

      preventDefault() {
        if (
          originalEvent.preventDefault
        ) {
          originalEvent.preventDefault();
        }
      }
    };
  }

  function clambakePointInside(
    event,
    element,
    padding = 0
  ) {
    if (!element) {
      return false;
    }

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

  document.addEventListener(
    "pointermove",
    (event) => {
      if (
        !clambakeLevelOneCursorMode() ||
        !state.running ||
        event.pointerType === "touch"
      ) {
        return;
      }

      const cursorEvent =
        clambakeCursorEvent(event);

      /*
       * Nothing attached yet:
       * touching the correct movable object
       * begins the same interaction as a drag.
       */
      if (!state.dragType) {
        if (
          (
            state.phase === "idle" ||
            state.phase === "digging"
          ) &&
          clambakePointInside(
            event,
            stick,
            18
          )
        ) {
          stick.dispatchEvent(
            new PointerEvent(
              "pointerdown",
              {
                pointerId:
                  event.pointerId,
                pointerType:
                  event.pointerType,
                clientX:
                  event.clientX,
                clientY:
                  event.clientY,
                button: 0,
                bubbles: true
              }
            )
          );

          return;
        }

        if (
          state.phase ===
            "clam-ready" &&
          !clam.hidden &&
          clambakePointInside(
            event,
            clam,
            22
          )
        ) {
          clam.dispatchEvent(
            new PointerEvent(
              "pointerdown",
              {
                pointerId:
                  event.pointerId,
                pointerType:
                  event.pointerType,
                clientX:
                  event.clientX,
                clientY:
                  event.clientY,
                button: 0,
                bubbles: true
              }
            )
          );

          return;
        }

        return;
      }

      moveDragged(
        cursorEvent
      );

      /*
       * Cursor mode has no physical release.
       * Deliver the clam automatically when
       * the cursor reaches the basket.
       */
      if (
        state.dragType === "clam" &&
        state.phase ===
          "clam-ready"
      ) {
        const basketRect =
          basket.getBoundingClientRect();

        if (
          pointInRect(
            event.clientX,
            event.clientY,
            basketRect,
            18
          )
        ) {
          pointerUp(
            cursorEvent
          );
        }
      }
    }
  );

})();

