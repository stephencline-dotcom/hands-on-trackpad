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
    {
      number: 3,
      instruction:
        "Match!",
      pieces: [
        {
          id: "telescope",
          match: "sight",
          symbol: "🔭",
          label: "Telescope",
        },
        {
          id: "trumpet",
          match: "hearing",
          symbol: "🎺",
          label: "Trumpet",
        },
        {
          id: "coffee",
          match: "smell",
          symbol: "☕",
          label: "Coffee",
        },
        {
          id: "strawberry",
          match: "taste",
          symbol: "🍓",
          label: "Strawberry",
        },
        {
          id: "teddy-bear",
          match: "touch",
          symbol: "🧸",
          label: "Teddy bear",
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
    }
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
    new Audio("../../sounds/good.mp3");

  const wrongSound =
    new Audio("../../sounds/wrongflower.mp3");

  const pickupSound =
    new Audio("../../sounds/click.mp3");

  const monsterRoarSound =
    new Audio("../../sounds/roar.mp3");

  correctSound.preload = "auto";
  wrongSound.preload = "auto";
  pickupSound.preload = "auto";
  monsterRoarSound.preload = "auto";

  correctSound.volume = 0.75;
  wrongSound.volume = 0.58;
  pickupSound.volume = 0.45;
  monsterRoarSound.volume = 0.72;

  let soundEnabled = true;
  let gameRunning = false;
  let currentRoundIndex = 0;

  const ROUND_ONE_CHARACTERS = [
    "boy",
    "girl",
    "monster",
  ];

  let roundOneCharacter = "boy";
  let roundOneCharacterChosen = false;

  let currentMonsterIndex = 0;
  let currentMonsterFedCount = 0;

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

  const MONSTER_CHALLENGES = [
    {
      match: "sight",
      monsterClass: "sense-eye-monster",
      prompt: "👁️",
      choices: [
        {
          id: "rainbow",
          match: "sight",
          symbol: "🌈",
          label: "Rainbow",
        },
        {
          id: "telescope",
          match: "sight",
          symbol: "🔭",
          label: "Telescope",
        },
        {
          id: "trumpet-decoy",
          match: "hearing",
          symbol: "🎺",
          label: "Trumpet",
        },
        {
          id: "pizza-decoy",
          match: "taste",
          symbol: "🍕",
          label: "Pizza",
        },
      ],
    },
    {
      match: "hearing",
      monsterClass: "sense-ear-monster",
      prompt: "👂",
      choices: [
        {
          id: "singing-bird",
          match: "hearing",
          symbol: "🐦🎵",
          label: "Singing bird",
        },
        {
          id: "trumpet",
          match: "hearing",
          symbol: "🎺",
          label: "Trumpet",
        },
        {
          id: "rainbow-decoy",
          match: "sight",
          symbol: "🌈",
          label: "Rainbow",
        },
        {
          id: "strawberry-decoy",
          match: "taste",
          symbol: "🍓",
          label: "Strawberry",
        },
      ],
    },
    {
      match: "smell",
      monsterClass: "sense-nose-monster",
      prompt: "👃",
      choices: [
        {
          id: "flower",
          match: "smell",
          symbol: "🌸",
          label: "Flower",
        },
        {
          id: "coffee",
          match: "smell",
          symbol: "☕",
          label: "Coffee",
        },
        {
          id: "teddy-decoy",
          match: "touch",
          symbol: "🧸",
          label: "Teddy bear",
        },
        {
          id: "trumpet-smell-decoy",
          match: "hearing",
          symbol: "🎺",
          label: "Trumpet",
        },
      ],
    },
    {
      match: "taste",
      monsterClass: "sense-mouth-monster",
      prompt: "👄",
      choices: [
        {
          id: "strawberry",
          match: "taste",
          symbol: "🍓",
          label: "Strawberry",
        },
        {
          id: "pizza",
          match: "taste",
          symbol: "🍕",
          label: "Pizza",
        },
        {
          id: "flower-taste-decoy",
          match: "smell",
          symbol: "🌸",
          label: "Flower",
        },
        {
          id: "telescope-decoy",
          match: "sight",
          symbol: "🔭",
          label: "Telescope",
        },
      ],
    },
    {
      match: "touch",
      monsterClass: "sense-hand-monster",
      prompt: "✋",
      choices: [
        {
          id: "feather",
          match: "touch",
          symbol: "🪶",
          label: "Feather",
        },
        {
          id: "teddy-bear",
          match: "touch",
          symbol: "🧸",
          label: "Teddy bear",
        },
        {
          id: "coffee-touch-decoy",
          match: "smell",
          symbol: "☕",
          label: "Coffee",
        },
        {
          id: "bird-touch-decoy",
          match: "hearing",
          symbol: "🐦🎵",
          label: "Singing bird",
        },
      ],
    },
  ];

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

  function shuffleVisiblePieces() {
    if (!pieceTray) {
      return;
    }

    const visiblePieces =
      Array.from(pieces).filter(
        (piece) => !piece.hidden
      );

    for (
      let index =
        visiblePieces.length - 1;
      index > 0;
      index -= 1
    ) {
      const randomIndex =
        Math.floor(
          Math.random() *
          (index + 1)
        );

      [
        visiblePieces[index],
        visiblePieces[randomIndex],
      ] = [
        visiblePieces[randomIndex],
        visiblePieces[index],
      ];
    }

    visiblePieces.forEach((piece) => {
      pieceTray.appendChild(piece);
    });
  }

  function configureMonsterChallenge(
    monsterIndex
  ) {
    const challenge =
      MONSTER_CHALLENGES[
        monsterIndex
      ];

    if (!challenge) {
      return;
    }

    /*
     * Remove the empty tray spaces left by
     * the previous monster's eaten items.
     */
    document
      .querySelectorAll(
        ".sense-piece-placeholder"
      )
      .forEach((placeholder) => {
        placeholder.remove();
      });

    currentMonsterIndex =
      monsterIndex;

    currentMonsterFedCount = 0;
    roundGoal = 10;

    document
      .querySelectorAll(
        ".sense-monster-card"
      )
      .forEach((monster) => {
        monster.classList.remove(
          "is-current-monster",
          "is-fed",
          "has-snack",
          "is-celebrating"
        );

        restoreMonsterCard(monster);
      });

    const activeMonster =
      document.querySelector(
        `.${challenge.monsterClass}`
      );

    if (activeMonster) {
      activeMonster.classList.add(
        "is-current-monster"
      );

      playSound(
        monsterRoarSound
      );
    }

    if (instructionDisplay) {
      instructionDisplay.textContent =
        challenge.prompt;
    }

    pieces.forEach(
      (piece, index) => {
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

        const choice =
          challenge.choices[index];

        if (!choice) {
          piece.hidden = true;
          return;
        }

        piece.hidden = false;

        piece.dataset.piece =
          choice.match;

        piece.dataset.itemId =
          choice.id;

        piece.setAttribute(
          "aria-label",
          choice.label
        );

        const picture =
          document.createElement(
            "span"
          );

        picture.textContent =
          choice.symbol;

        picture.setAttribute(
          "aria-hidden",
          "true"
        );

        piece.replaceChildren(
          picture
        );
      }
    );

    shuffleVisiblePieces();
    updateStats();
  }

  function applyRoundOneCharacter() {
    const person =
      document.getElementById(
        "sensePerson"
      );

    if (!person) {
      return;
    }

    person.classList.remove(
      "character-boy",
      "character-girl",
      "character-monster"
    );

    /*
     * Keep the student's selected character
     * for both Round 1 and Round 2.
     * Round 3 uses the Sense Monsters.
     */
    const character =
      currentRoundIndex <= 1
        ? roundOneCharacter
        : "boy";

    person.classList.add(
      `character-${character}`
    );

    person.dataset.character =
      character;
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

    document.body.classList.toggle(
      "sense-round-three",
      currentRoundIndex === 2
    );

    applyRoundOneCharacter();

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

        if (
          currentRoundIndex === 0 &&
          roundOneCharacter === "monster"
        ) {
          symbol.classList.add(
            "sense-monster-part",
            `sense-monster-part-${definition.match}`
          );

          if (
            definition.match === "eyes"
          ) {
            symbol.textContent =
              "👁️ 👁️ 👁️";
          } else if (
            definition.match ===
              "mouth"
          ) {
            symbol.textContent =
              "👄";
          } else if (
            definition.match ===
              "left-hand" ||
            definition.match ===
              "right-hand"
          ) {
            symbol.textContent =
              "🤚";
          }
        }

        piece.replaceChildren(
          symbol
        );
      }
    );

    if (currentRoundIndex === 2) {
      configureMonsterChallenge(0);
    } else {
      shuffleVisiblePieces();
      showActiveSenseStep(0);
      updateStats();
    }
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
      if (
        currentRoundIndex === 2 &&
        zone.classList.contains(
          "sense-monster-card"
        )
      ) {
        zone.classList.add(
          "has-snack"
        );

        const foodSlot =
          zone.querySelector(
            ".sense-monster-food-slot"
          );

        if (foodSlot) {
          foodSlot.innerHTML = "";

          const monsterFood =
            document.createElement(
              "span"
            );

          monsterFood.className =
            "sense-placed-picture";

          monsterFood.textContent =
            symbol;

          monsterFood.setAttribute(
            "aria-hidden",
            "true"
          );

          foodSlot.appendChild(
            monsterFood
          );
        }


        currentMonsterFedCount += 1;

        if (
          currentMonsterFedCount >= 2
        ) {
          zone.classList.add(
            "is-celebrating"
          );

          const nextMonsterIndex =
            currentMonsterIndex + 1;

          if (
            nextMonsterIndex <
            MONSTER_CHALLENGES.length
          ) {
            window.setTimeout(() => {
              configureMonsterChallenge(
                nextMonsterIndex
              );
            }, 850);
          }
        }

        return;
      }

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
        currentRoundIndex === 0 &&
        roundOneCharacter === "monster"
      ) {
        placed.classList.add(
          "sense-monster-placed-part",
          `sense-monster-placed-${matchName}`
        );
      }

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

    const completedPerson =
      document.getElementById(
        "sensePerson"
      );

    if (
      currentRoundIndex === 0 &&
      completedPerson
    ) {
      completedPerson.classList.remove(
        "is-character-celebrating"
      );

      void completedPerson.offsetWidth;

      completedPerson.classList.add(
        "is-character-celebrating"
      );
    };

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
    roundOneCharacterChosen = false;

    resetRound();
    configureCurrentRound();

    window.setTimeout(
      showCharacterChooser,
      80
    );
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

    /*
     * Keep the guide's sliding hand following
     * the pointer only during an active drag.
     * Idle pointer movement remains disabled
     * to avoid Chromebook display flashing.
     */
    if (
      trackpadGuide &&
      typeof trackpadGuide
        .updateFromPointerEvent === "function"
    ) {
      trackpadGuide
        .updateFromPointerEvent(event);
    }

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

  function restoreMonsterCard(zone) {
    let feature = "";

    if (
      zone.classList.contains(
        "sense-eye-monster"
      )
    ) {
      feature = "👁️";
    } else if (
      zone.classList.contains(
        "sense-ear-monster"
      )
    ) {
      feature = "👂";
    } else if (
      zone.classList.contains(
        "sense-nose-monster"
      )
    ) {
      feature = "👃";
    } else if (
      zone.classList.contains(
        "sense-mouth-monster"
      )
    ) {
      feature = "👄";
    } else if (
      zone.classList.contains(
        "sense-hand-monster"
      )
    ) {
      feature = "✋";
    }

    zone.innerHTML = `
      <span class="monster-antenna monster-antenna-left"></span>
      <span class="monster-antenna monster-antenna-right"></span>

      <span class="monster-googly-eyes">
        ● ●
      </span>

      <span class="monster-big-feature">
        ${feature}
      </span>

      <span class="monster-grin">
        ◡
      </span>

      <span class="monster-arm monster-arm-left"></span>
      <span class="monster-arm monster-arm-right"></span>

      <span class="monster-leg monster-leg-left"></span>
      <span class="monster-leg monster-leg-right"></span>

      <span class="sense-monster-food-slot"></span>
    `;
  }

  function resetRound() {
    const completedPerson =
      document.getElementById(
        "sensePerson"
      );

    if (completedPerson) {
      completedPerson.classList.remove(
        "is-character-celebrating"
      );
    }

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
      if (
        zone.classList.contains(
          "sense-monster-card"
        )
      ) {
        restoreMonsterCard(zone);
      } else {
        zone.innerHTML = "";
      }

      zone.classList.remove(
        "is-filled",
        "is-ready",
        "is-fed",
        "has-snack",
        "is-current-monster",
        "is-celebrating"
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

  function getCharacterChooser() {
    let chooser =
      document.getElementById(
        "senseCharacterChooser"
      );

    if (chooser) {
      return chooser;
    }

    chooser =
      document.createElement(
        "section"
      );

    chooser.id =
      "senseCharacterChooser";

    chooser.className =
      "sense-character-chooser";

    chooser.hidden = true;

    chooser.innerHTML = `
      <div class="sense-character-card">
        <div class="sense-character-title">
          PICK!
        </div>

        <div class="sense-character-options">
          <button
            class="sense-character-choice sense-character-choice-boy"
            type="button"
            data-character="boy"
            aria-label="Choose boy"
          >
            <span aria-hidden="true">👦</span>
          </button>

          <button
            class="sense-character-choice sense-character-choice-girl"
            type="button"
            data-character="girl"
            aria-label="Choose girl"
          >
            <span aria-hidden="true">👧</span>
          </button>

          <button
            class="sense-character-choice sense-character-choice-monster"
            type="button"
            data-character="monster"
            aria-label="Choose monster"
          >
            <span aria-hidden="true">👾</span>
          </button>
        </div>
      </div>
    `;

    arena.appendChild(
      chooser
    );

    chooser
      .querySelectorAll(
        ".sense-character-choice"
      )
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const character =
              button.dataset.character;

            if (
              !ROUND_ONE_CHARACTERS.includes(
                character
              )
            ) {
              return;
            }

            roundOneCharacter =
              character;

            roundOneCharacterChosen =
              true;

            chooser.hidden = true;

            applyRoundOneCharacter();
            startRound();
          }
        );
      });

    return chooser;
  }

  function showCharacterChooser() {
    const chooser =
      getCharacterChooser();

    gameRunning = false;
    startButton.hidden = true;
    chooser.hidden = false;
  }

  function handleStartButton() {
    if (
      currentRoundIndex === 0 &&
      !roundOneCharacterChosen
    ) {
      showCharacterChooser();
      return;
    }

    startRound();
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
    handleStartButton
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

  /* ========================================
     FIVE SENSES RESCUE - PREVIEW MODE
     Temporary visual test using:
     ?rescueTest=1
  ======================================== */

  const rescuePreviewParams =
    new URLSearchParams(
      window.location.search
    );

  if (
    rescuePreviewParams.get(
      "rescueTest"
    ) === "1"
  ) {
    const rescueArena =
      document.getElementById(
        "senseRescueArena"
      );

    const rescueTransition =
      document.getElementById(
        "senseRescueTransition"
      );

    const rescueHero =
      document.getElementById(
        "senseRescueHero"
      );

    const previewCharacter =
      rescuePreviewParams.get(
        "character"
      );

    if (
      rescueHero &&
      ROUND_ONE_CHARACTERS.includes(
        previewCharacter
      )
    ) {
      rescueHero.dataset.character =
        previewCharacter;
    }

    document.body.classList.add(
      "sense-rescue-mode"
    );

    if (rescueArena) {
      rescueArena.hidden = false;
    }

    if (rescueTransition) {
      rescueTransition.hidden = false;
    }
  }

  const rescueStartButton =
    document.getElementById(
      "senseRescueStartButton"
    );

  if (rescueStartButton) {
    rescueStartButton.addEventListener(
      "click",
      () => {
        const rescueTransition =
          document.getElementById(
            "senseRescueTransition"
          );

        const rescueHero =
          document.getElementById(
            "senseRescueHero"
          );

        const rescueTargetIcon =
          document.getElementById(
            "senseRescueTargetIcon"
          );

        const rescueTargetLabel =
          document.getElementById(
            "senseRescueTargetLabel"
          );

        if (rescueTransition) {
          rescueTransition.hidden = true;
        }

        if (rescueHero) {
          rescueHero.dataset.character =
            roundOneCharacter;

          rescueHero.classList.add(
            "is-rescue-ready"
          );
        }

        if (rescueTargetIcon) {
          rescueTargetIcon.textContent =
            "👀";
        }

        if (rescueTargetLabel) {
          rescueTargetLabel.textContent =
            "SIGHT";
        }
      }
    );
  }

  /* ========================================
     FIVE SENSES RESCUE - HERO MOVEMENT
  ======================================== */

  const rescuePlayfield =
    document.getElementById(
      "senseRescuePlayfield"
    );

  const rescueHeroForMovement =
    document.getElementById(
      "senseRescueHero"
    );

  let rescueTargetX = 0.5;
  let rescueCurrentX = 0.5;
  let rescueMovementFrame = 0;

  function updateRescueHeroPosition() {
    if (
      !document.body.classList.contains(
        "sense-rescue-mode"
      ) ||
      !rescueHeroForMovement ||
      !rescuePlayfield
    ) {
      rescueMovementFrame = 0;
      return;
    }

    const rescueMovementDifference =
      rescueTargetX - rescueCurrentX;

    rescueCurrentX +=
      rescueMovementDifference *
      0.22;

    const moving =
      Math.abs(
        rescueMovementDifference
      ) > 0.006;

    rescueHeroForMovement
      .classList.toggle(
        "is-moving",
        moving
      );

    rescueHeroForMovement
      .classList.toggle(
        "is-moving-left",
        moving &&
        rescueMovementDifference < 0
      );

    rescueHeroForMovement
      .classList.toggle(
        "is-moving-right",
        moving &&
        rescueMovementDifference > 0
      );

    const playfieldWidth =
      rescuePlayfield.clientWidth;

    const heroWidth =
      rescueHeroForMovement.offsetWidth;

    const safePadding =
      Math.max(16, heroWidth * 0.42);

    const playfieldRect =
      rescuePlayfield
        .getBoundingClientRect();

    const rescueGuideElement =
      document.querySelector(
        ".imported-trackpad-guide"
      );

    let rescueLeftBoundary =
      safePadding;

    if (rescueGuideElement) {
      const rescueGuideRect =
        rescueGuideElement
          .getBoundingClientRect();

      rescueLeftBoundary =
        Math.max(
          safePadding,
          rescueGuideRect.right -
            playfieldRect.left +
            heroWidth * 0.5 +
            18
        );
    }

    const rescueRightBoundary =
      playfieldWidth -
      safePadding;

    const rescueMovementWidth =
      Math.max(
        1,
        rescueRightBoundary -
          rescueLeftBoundary
      );

    const heroCenterX =
      rescueLeftBoundary +
      rescueMovementWidth *
        rescueCurrentX;

    rescueHeroForMovement.style.left =
      `${heroCenterX}px`;

    rescueMovementFrame =
      window.requestAnimationFrame(
        updateRescueHeroPosition
      );
  }

  function startRescueHeroMovement() {
    if (rescueMovementFrame) {
      return;
    }

    rescueMovementFrame =
      window.requestAnimationFrame(
        updateRescueHeroPosition
      );
  }

  if (rescuePlayfield) {
    rescuePlayfield.addEventListener(
      "pointermove",
      (event) => {
        if (
          !document.body.classList.contains(
            "sense-rescue-mode"
          )
        ) {
          return;
        }

        const rect =
          rescuePlayfield
            .getBoundingClientRect();

        if (!rect.width) {
          return;
        }

        /* Rescue trackpad guide movement */
        if (
          trackpadGuide &&
          typeof trackpadGuide
            .updateFromPointerEvent ===
              "function"
        ) {
          trackpadGuide
            .updateFromPointerEvent(event);
        }

        rescueTargetX =
          Math.max(
            0,
            Math.min(
              1,
              (event.clientX - rect.left) /
                rect.width
            )
          );

        startRescueHeroMovement();
      }
    );
  }

  startRescueHeroMovement();

  updateSoundButton();
  resetRound();
  configureCurrentRound();
})();

