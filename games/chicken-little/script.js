(() => {
  "use strict";

  const canvas =
    document.getElementById("chickenCanvas");
  const ctx = canvas.getContext("2d");
  const arena =
    document.getElementById("chickenArena");
  const startPanel =
    document.getElementById("chickenStartPanel");
  const startButton =
    document.getElementById("chickenStartButton");
  const statusText =
    document.getElementById("chickenStatus");
  const heartsText =
    document.getElementById("chickenHearts");
  const timeText =
    document.getElementById("chickenTime");
  const progressFill =
    document.getElementById("chickenProgressFill");
  const skyFallingAudio =
    document.getElementById("chickenSkyFallingAudio");

  const chickenBackgroundAudio =
    document.getElementById("chickenBackgroundAudio");

  const chickenFoxyAudio =
    document.getElementById("chickenFoxyAudio");

  if (chickenBackgroundAudio) {
    chickenBackgroundAudio.volume = 0.16;
  }

  if (chickenFoxyAudio) {
    chickenFoxyAudio.volume = 1;
  }

  const DEFAULT_LEVEL_TIMES = [45, 45, 45, 45];
  const DEFAULT_LEVEL_SPEEDS = [100, 100, 100, 100];
  const DEFAULT_LEVEL_HITS = [3, 3, 3, 3];

  const CHICKEN_SETTINGS_STORAGE_KEY =
    "chicken-little-level-settings-v1";

  let levelTimes = DEFAULT_LEVEL_TIMES.slice();
  let levelSpeeds = DEFAULT_LEVEL_SPEEDS.slice();
  let levelHits = DEFAULT_LEVEL_HITS.slice();
  let requireClickAndDrag = false;
  let facingDirection = 1;
  const GROUND_Y = 560;

  let running = false;
  let currentLevel = 1;
  let pendingLevel = null;
  let dragging = false;
  let pointerId = null;
  let pointerPressX = 0;
  let pointerPressY = 0;
  let pointerPressTime = 0;
  let pointerMoved = false;
  let pressStartedOnChicken = false;
  let jumpHeight = 0;
  let jumpVelocity = 0;
  let hearts = 3;
  let elapsedMs = 0;
  let worldOffset = 0;
  let previousFrameTime = 0;
  let nextAcornAt = 0;
  let invulnerableUntil = 0;

  let player = {
    x: 275,
    y: 445,
    targetX: 275,
    targetY: 445,
  };

  let acorns = [];
  let effects = [];

  // Level 5: Foxy Loxy boss state
  let activeFlockMembers = [
    "chicken",
    "turkey",
    "ducky",
    "henny",
  ];

  let capturedFlockMembers = [];

  let foxy = {
    x: 930,
    y: 440,
    targetX: 930,
    state: "patrol",
    facing: -1,
    nextChargeAt: 0,
    chargeStartedAt: 0,
    stunnedUntil: 0,
    warningUntil: 0,
    retreatUntil: 0,
    patrolDirection: 1,
    carrying: null,
    health: 100,
    maxHealth: 100,
  };

  let playerAcorns = [];
  let nextAutomaticShotAt = 0;
  let level5AutomaticShooting = false;

  const guide =
    window.trackpadGuide &&
    window.trackpadGuide.create
      ? window.trackpadGuide.create({
          scene: document.getElementById(
            "chickenTrackpadScene"
          ),
          leftHand: document.getElementById(
            "chickenTrackpadLeftHand"
          ),
          rightHand: document.getElementById(
            "chickenTrackpadRightHand"
          ),
          pressIndicator: document.getElementById(
            "chickenTrackpadPressIndicator"
          ),
          pointerSpace: "viewport",
          togglePressIndicator: true,
          toggleScenePressedClass: true,
        })
      : null;

  function clamp(value, minimum, maximum) {
    return Math.max(
      minimum,
      Math.min(maximum, value)
    );
  }

  function currentLevelIndex() {
    return clamp(
      currentLevel - 1,
      0,
      DEFAULT_LEVEL_TIMES.length - 1
    );
  }

  function currentLevelDurationMs() {
    return (
      levelTimes[currentLevelIndex()] *
      1000
    );
  }

  function currentLevelSpeedMultiplier() {
    return (
      levelSpeeds[currentLevelIndex()] /
      100
    );
  }

  function currentLevelHitsAllowed() {
    return levelHits[currentLevelIndex()];
  }

  function normalizeSettingArray(
    values,
    defaults,
    minimum,
    maximum
  ) {
    return defaults.map((fallback, index) => {
      const value = Number.parseInt(
        Array.isArray(values)
          ? values[index]
          : undefined,
        10
      );

      return Number.isFinite(value)
        ? clamp(value, minimum, maximum)
        : fallback;
    });
  }

  function applyChickenSettings(settings) {
    if (!settings || typeof settings !== "object") {
      return;
    }
    requireClickAndDrag =
      settings.chickenLittleRequireClickAndDrag === true;


    levelTimes = normalizeSettingArray(
      settings.chickenLittleLevelTimes,
      DEFAULT_LEVEL_TIMES,
      20,
      120
    );

    levelSpeeds = normalizeSettingArray(
      settings.chickenLittleLevelSpeeds,
      DEFAULT_LEVEL_SPEEDS,
      50,
      200
    );

    levelHits = normalizeSettingArray(
      settings.chickenLittleLevelHits,
      DEFAULT_LEVEL_HITS,
      1,
      10
    );
  }

  function saveChickenSettingsFallback() {
    try {
      localStorage.setItem(
        CHICKEN_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          chickenLittleLevelTimes: levelTimes,
          chickenLittleLevelSpeeds: levelSpeeds,
          chickenLittleLevelHits: levelHits,
        })
      );
    } catch {
      // Local storage is only a fallback.
    }
  }

  function loadChickenSettingsFallback() {
    try {
      const stored = JSON.parse(
        localStorage.getItem(
          CHICKEN_SETTINGS_STORAGE_KEY
        ) || "null"
      );

      applyChickenSettings(stored);
    } catch {
      // Defaults remain active.
    }
  }

  async function loadChickenSettings() {
    loadChickenSettingsFallback();

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

      const settings = await response.json();
      applyChickenSettings(settings);
      saveChickenSettingsFallback();
    } catch (error) {
      console.warn(
        "Could not load Chicken Little settings.",
        error
      );
    }
  }

  function formatTime(milliseconds) {
    const seconds = Math.max(
      0,
      Math.ceil(milliseconds / 1000)
    );
    const minutes = Math.floor(seconds / 60);
    const remainder = String(
      seconds % 60
    ).padStart(2, "0");

    return `${minutes}:${remainder}`;
  }

  function updateHud() {
    const levelDisplay = document.getElementById("chickenLevel");

    if (levelDisplay) {
      levelDisplay.textContent = String(currentLevel);
    }

    heartsText.textContent = String(hearts);
    timeText.textContent = formatTime(
      currentLevelDurationMs() - elapsedMs
    );

    progressFill.style.width =
      `${clamp(
        elapsedMs / currentLevelDurationMs(),
        0,
        1
      ) * 100}%`;
  }

  function canvasPoint(event) {
    const bounds = canvas.getBoundingClientRect();

    return {
      x:
        (event.clientX - bounds.left) *
        (canvas.width / Math.max(bounds.width, 1)),
      y:
        (event.clientY - bounds.top) *
        (canvas.height / Math.max(bounds.height, 1)),
    };
  }

  function setTargetFromPointer(event) {
    const point = canvasPoint(event);

    player.targetX = clamp(point.x, 75, 1125);
    player.targetY = clamp(point.y, 400, 540);
  }

  function shootLevel5Acorn() {
    if (
      !running ||
      currentLevel !== 5 ||
      activeFlockMembers.length === 0
    ) {
      return;
    }

    const startX =
      player.x + 38 * facingDirection;

    const startY =
      player.y - 78;

    const dx =
      foxy.x - startX;

    const dy =
      (foxy.y - 65) - startY;

    const distance =
      Math.max(
        1,
        Math.hypot(dx, dy)
      );

    const speed = 720;

    playerAcorns.push({
      x: startX,
      y: startY,
      vx: (dx / distance) * speed,
      vy: (dy / distance) * speed,
      rotation: 0,
      life: 2.2,
    });
  }
  function startJump() {
    if (
      !running ||
      jumpHeight > 1
    ) {
      return;
    }

    jumpHeight = 1;
    jumpVelocity = 520;
  }

  function spawnAcorn(now) {
    if (acorns.length >= 6) {
      return;
    }

    const progress = clamp(
      elapsedMs / currentLevelDurationMs(),
      0,
      1
    );

    const landingY =
      400 + Math.random() * 140;
    const depthScale =
      0.76 +
      ((landingY - 400) / 140) * 0.24;

    acorns.push({
      x: 110 + Math.random() * 980,
      y: -45,
      landingY,
      depthScale,
      warningMs: 950,
      speed:
        (235 + progress * 145) *
        currentLevelSpeedMultiplier(),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed:
        (Math.random() - 0.5) * 7,
      radius: 18 * depthScale,
    });

    nextAcornAt =
      now + 720 + Math.random() * 780;
  }

  function createImpact(x, y, color) {
    for (let index = 0; index < 12; index += 1) {
      effects.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 180,
        vy: -40 - Math.random() * 150,
        life: 0.65,
        color,
      });
    }
  }

  function hitPlayer(
    now,
    impactX = player.x,
    impactY = player.y
  ) {
    if (now < invulnerableUntil) {
      return;
    }

    hearts -= 1;
    invulnerableUntil = now + 1800;
    createImpact(impactX, impactY, "#ef4444");
    updateHud();

    if (hearts <= 0) {
      finishLevel(false);
    }
  }

  function finishLevel(success) {
    if (chickenBackgroundAudio) {
      chickenBackgroundAudio.pause();
      chickenBackgroundAudio.currentTime = 0;
    }

    running = false;
    dragging = false;
    canvas.classList.remove("is-dragging");
    startPanel.hidden = false;

    if (success) {
      if (currentLevel === 1) {
        statusText.textContent =
          "Chicken Little made it! Turkey Lurky is joining the run!";
        startButton.textContent = "Start Level 2";
        pendingLevel = 2;
      } else if (currentLevel === 2) {
        statusText.textContent =
          "Level 2 complete! Ducky Lucky heard the news and is joining the flock!";
        startButton.textContent = "Start Level 3";
        pendingLevel = 3;
      } else if (currentLevel === 3) {
        statusText.textContent =
          "Level 3 complete! Henny Penny is joining the flock!";
        startButton.textContent = "Start Level 4";
        pendingLevel = 4;
      } else if (currentLevel === 4) {
        statusText.textContent =
          "The flock made it through! But Foxy Loxy is waiting ahead!";
        startButton.textContent = "Face Foxy Loxy";
        pendingLevel = 5;
      } else {
        statusText.textContent =
          "You saved the flock from Foxy Loxy!";
        startButton.textContent = "Play Again";
        pendingLevel = null;
      }
    } else {
      if (currentLevel === 1) {
        statusText.textContent =
          "The falling acorns caught Chicken Little. Try again!";
      } else {
        statusText.textContent =
          `The falling acorns caught the flock. Try Level ${currentLevel} again!`;
      }

      startButton.textContent = "Try Again";
      pendingLevel = null;
    }
  }

  function resetLevel() {
    hearts =
      currentLevel === 5
        ? 4
        : currentLevelHitsAllowed();
    elapsedMs = 0;
    worldOffset = 0;
    acorns = [];
    effects = [];
    invulnerableUntil = 0;
    jumpHeight = 0;
    jumpVelocity = 0;

    if (currentLevel === 5) {
      activeFlockMembers = [
        "chicken",
        "turkey",
        "ducky",
        "henny",
      ];

      capturedFlockMembers = [];
      playerAcorns = [];

      foxy = {
        x: 930,
        y: 440,
        targetX: 930,
        state: "patrol",
        facing: -1,
        nextChargeAt: performance.now() + 1800,
        chargeStartedAt: 0,
        stunnedUntil: 0,
        warningUntil: 0,
        retreatUntil: 0,
        patrolDirection: 1,
        carrying: null,
        health: 100,
        maxHealth: 100,
      };

      nextAutomaticShotAt =
        performance.now() + 900;
    }

    player = {
      x: 275,
      y: 445,
      targetX: 275,
      targetY: 445,
    };

    updateHud();
  }

  function startLevel() {
    if (pendingLevel !== null) {
      currentLevel = pendingLevel;
      pendingLevel = null;
    }

    resetLevel();

    if (chickenBackgroundAudio) {
      chickenBackgroundAudio.currentTime = 0;

      const backgroundPromise =
        chickenBackgroundAudio.play();

      if (
        backgroundPromise &&
        typeof backgroundPromise.catch === "function"
      ) {
        backgroundPromise.catch(() => {});
      }
    }

    if (chickenFoxyAudio) {
      chickenFoxyAudio.pause();
      chickenFoxyAudio.currentTime = 0;
    }

    if (skyFallingAudio) {
      skyFallingAudio.currentTime = 0;

      const playFoxyAfterSky = () => {
        skyFallingAudio.removeEventListener(
          "ended",
          playFoxyAfterSky
        );

        if (
          currentLevel === 5 &&
          chickenFoxyAudio
        ) {
          chickenFoxyAudio.currentTime = 0;

          const foxyPromise =
            chickenFoxyAudio.play();

          if (
            foxyPromise &&
            typeof foxyPromise.catch === "function"
          ) {
            foxyPromise.catch(() => {});
          }
        }
      };

      skyFallingAudio.addEventListener(
        "ended",
        playFoxyAfterSky
      );

      const playPromise =
        skyFallingAudio.play();

      if (
        playPromise &&
        typeof playPromise.catch === "function"
      ) {
        playPromise.catch(() => {});
      }
    }

    running = true;
    previousFrameTime = performance.now();
    nextAcornAt = previousFrameTime + 900;
    startPanel.hidden = true;
  }
  function updateLevel5Boss(
    deltaSeconds,
    now
  ) {
    // The flock has reached Foxy's den.
    // The world no longer scrolls.

    player.x +=
      (player.targetX - player.x) * 0.17;

    player.y +=
      (player.targetY - player.y) * 0.17;

    const horizontalTravel =
      player.targetX - player.x;

    if (
      Math.abs(horizontalTravel) > 2
    ) {
      facingDirection =
        horizontalTravel < 0 ? -1 : 1;
    }

    // Foxy patrols vertically in front of his den.
    if (now >= foxy.stunnedUntil) {
      if (foxy.state === "patrol") {
        const patrolSpeed = 105;

        foxy.y +=
          patrolSpeed *
          foxy.patrolDirection *
          deltaSeconds;

        if (foxy.y <= 350) {
          foxy.y = 350;
          foxy.patrolDirection = 1;
        }

        if (foxy.y >= 510) {
          foxy.y = 510;
          foxy.patrolDirection = -1;
        }

        foxy.x = 930;
        foxy.facing = -1;

        if (now >= foxy.nextChargeAt) {
          foxy.state = "warning";
          foxy.warningUntil = now + 850;
        }
      } else if (foxy.state === "warning") {
        // Brief pause so the student can see
        // that Foxy is about to attack.
        foxy.facing =
          player.x < foxy.x ? -1 : 1;

        if (now >= foxy.warningUntil) {
          foxy.state = "charge";
          foxy.chargeStartedAt = now;
        }
      } else if (foxy.state === "charge") {
        // Foxy commits to a long attack across the clearing.
        const targetX =
          player.x - 90;

        const targetY =
          player.y;

        const dx =
          targetX - foxy.x;

        const dy =
          targetY - foxy.y;

        const distance =
          Math.max(
            1,
            Math.hypot(dx, dy)
          );

        const chargeSpeed = 900;

        foxy.x +=
          (dx / distance) *
          chargeSpeed *
          deltaSeconds;

        foxy.y +=
          (dy / distance) *
          chargeSpeed *
          deltaSeconds;

        foxy.facing =
          dx < 0 ? -1 : 1;

        // Check Foxy against every bird still in the flock,
        // rather than only Chicken Little's control point.
        const flockTargets = [];

        if (
          activeFlockMembers.includes(
            "chicken"
          )
        ) {
          flockTargets.push({
            x: player.x,
            y: player.y - 65,
            radius: 38,
          });
        }

        if (
          activeFlockMembers.includes(
            "turkey"
          )
        ) {
          const turkey =
            getTurkeyPosition();

          flockTargets.push({
            x: turkey.x,
            y: turkey.y - 72,
            radius: 42,
          });
        }

        if (
          activeFlockMembers.includes(
            "ducky"
          )
        ) {
          const duck =
            getDuckyPosition();

          flockTargets.push({
            x: duck.x,
            y: duck.y - 60,
            radius: 36,
          });
        }

        if (
          activeFlockMembers.includes(
            "henny"
          )
        ) {
          const henny =
            getHennyPosition();

          flockTargets.push({
            x: henny.x,
            y: henny.y - 63,
            radius: 38,
          });
        }

        let touchedFlock = false;

        for (const target of flockTargets) {
          const touchDistance =
            Math.hypot(
              foxy.x - target.x,
              (foxy.y - 60) - target.y
            );

          if (
            touchDistance <=
            target.radius + 30
          ) {
            touchedFlock = true;
            break;
          }
        }

        if (touchedFlock) {
          const captured =
            activeFlockMembers.pop();

          if (captured) {
            capturedFlockMembers.push(
              captured
            );

            foxy.carrying =
              captured;

            hearts =
              activeFlockMembers.length;

            createImpact(
              foxy.x,
              foxy.y - 45,
              "#ef7d32"
            );

            updateHud();
          }

          if (
            activeFlockMembers.length === 0
          ) {
            running = false;
            dragging = false;

            canvas.classList.remove(
              "is-dragging"
            );

            statusText.textContent =
              "Foxy Loxy caught the whole flock! Try again!";

            startButton.textContent =
              "Try Foxy Loxy Again";

            pendingLevel = null;
            startPanel.hidden = false;

            return;
          }

          foxy.state = "retreat";
          foxy.retreatUntil =
            now + 2200;
        } else if (
          now - foxy.chargeStartedAt >
          5200
        ) {
          // Foxy made a full lunge but missed.
          foxy.state = "retreat";
          foxy.retreatUntil =
            now + 1500;
        }      } else if (foxy.state === "retreat") {
        const denX = 1010;
        const denY = 420;

        const dx = denX - foxy.x;
        const dy = denY - foxy.y;

        const distance =
          Math.max(
            1,
            Math.hypot(dx, dy)
          );

        const retreatSpeed = 360;

        foxy.x +=
          (dx / distance) *
          retreatSpeed *
          deltaSeconds;

        foxy.y +=
          (dy / distance) *
          retreatSpeed *
          deltaSeconds;

        foxy.facing =
          dx < 0 ? -1 : 1;

        if (
          distance <= 22 ||
          now >= foxy.retreatUntil
        ) {
          foxy.x = 930;
          foxy.y = 420;
          foxy.facing = -1;
          foxy.carrying = null;
          foxy.state = "patrol";

          foxy.nextChargeAt =
            now +
            3000 +
            Math.random() * 2200;
        }
      }
    }
    // Update player-thrown acorns.
    for (const shot of playerAcorns) {
      shot.x +=
        shot.vx * deltaSeconds;

      shot.y +=
        shot.vy * deltaSeconds;

      shot.rotation +=
        8 * deltaSeconds;

      shot.life -=
        deltaSeconds;
    }

    for (
      let index =
        playerAcorns.length - 1;
      index >= 0;
      index -= 1
    ) {
      const shot =
        playerAcorns[index];

      const dx =
        shot.x - foxy.x;

      const dy =
        shot.y - (foxy.y - 65);

      if (
        dx * dx + dy * dy <=
        48 * 48
      ) {
        playerAcorns.splice(
          index,
          1
        );

        createImpact(
          foxy.x,
          foxy.y - 65,
          "#d8a13a"
        );

        foxy.stunnedUntil =
          now + 550;

        foxy.health = Math.max(
          0,
          foxy.health - 5
        );

        if (foxy.health <= 0) {
          running = false;
          dragging = false;

          canvas.classList.remove(
            "is-dragging"
          );

          statusText.textContent =
            "You saved the flock from Foxy Loxy!";

          startButton.textContent =
            "Play Again";

          pendingLevel = null;
          startPanel.hidden = false;
          updateHud();
          return;
        }

        // A good hit interrupts Foxy's attack
        // and knocks him back toward his den.
        foxy.x = Math.min(
          1010,
          foxy.x + 70
        );

        foxy.facing = -1;

        if (
          foxy.state === "warning" ||
          foxy.state === "charge"
        ) {
          foxy.state = "retreat";
          foxy.retreatUntil =
            now + 1100;
        }

        continue;
      }

      if (
        shot.life <= 0 ||
        shot.x < -80 ||
        shot.x > canvas.width + 80 ||
        shot.y < -80 ||
        shot.y > canvas.height + 80
      ) {
        playerAcorns.splice(
          index,
          1
        );
      }
    }

    if (
      level5AutomaticShooting &&
      now >= nextAutomaticShotAt
    ) {
      shootLevel5Acorn();

      nextAutomaticShotAt =
        now + 850;
    }

    for (const effect of effects) {
      effect.x +=
        effect.vx * deltaSeconds;

      effect.y +=
        effect.vy * deltaSeconds;

      effect.vy +=
        310 * deltaSeconds;

      effect.life -=
        deltaSeconds;
    }

    effects = effects.filter(
      (effect) => effect.life > 0
    );

    updateHud();
  }
  function update(deltaSeconds, now) {
    if (!running) {
      return;
    }

    if (currentLevel === 5) {
      elapsedMs += deltaSeconds * 1000;
      updateLevel5Boss(
        deltaSeconds,
        now
      );
      return;
    }

    elapsedMs += deltaSeconds * 1000;
    worldOffset +=
      deltaSeconds *
      (175 + elapsedMs / currentLevelDurationMs() * 60);

    const horizontalTravel =
      player.targetX - player.x;

    if (Math.abs(horizontalTravel) > 2) {
      facingDirection =
        horizontalTravel < 0 ? -1 : 1;
    }

    player.x +=
      horizontalTravel * 0.17;
    player.y +=
      (player.targetY - player.y) * 0.17;

    if (jumpHeight > 0 || jumpVelocity > 0) {
      jumpHeight +=
        jumpVelocity * deltaSeconds;
      jumpVelocity -=
        1250 * deltaSeconds;

      if (jumpHeight <= 0) {
        jumpHeight = 0;
        jumpVelocity = 0;
      }
    }

    if (now >= nextAcornAt) {
      spawnAcorn(now);
    }

    for (const acorn of acorns) {
      if (acorn.warningMs > 0) {
        acorn.warningMs -= deltaSeconds * 1000;
        continue;
      }

      acorn.y += acorn.speed * deltaSeconds;
      acorn.rotation +=
        acorn.rotationSpeed * deltaSeconds;
    }

    for (
      let index = acorns.length - 1;
      index >= 0;
      index -= 1
    ) {
      const acorn = acorns[index];

      if (acorn.warningMs > 0) {
        continue;
      }

      const runners = [
        {
          x: player.x,
          y: player.y - 65 - jumpHeight,
          radiusX: 43,
          radiusY: 52,
        },
      ];

      if (currentLevel >= 2) {
        const turkey = getTurkeyPosition();

        runners.push({
          x: turkey.x,
          y: turkey.y - 72 - jumpHeight,
          radiusX: 48,
          radiusY: 59,
        });
      }

      if (currentLevel >= 3) {
        const duck = getDuckyPosition();

        runners.push({
          x: duck.x,
          y: duck.y - 60 - jumpHeight,
          radiusX: 42,
          radiusY: 50,
        });
      }

      if (currentLevel >= 4) {
        const henny = getHennyPosition();

        runners.push({
          x: henny.x,
          y: henny.y - 63 - jumpHeight,
          radiusX: 42,
          radiusY: 52,
        });
      }

      let struckRunner = null;

      for (const runner of runners) {
        const dx =
          (acorn.x - runner.x) /
          runner.radiusX;
        const dy =
          (acorn.y - runner.y) /
          runner.radiusY;

        if (dx * dx + dy * dy <= 1) {
          struckRunner = runner;
          break;
        }
      }

      if (struckRunner) {
        acorns.splice(index, 1);
        hitPlayer(
          now,
          struckRunner.x,
          struckRunner.y
        );
        continue;
      }

      if (acorn.y >= acorn.landingY) {
        createImpact(
          acorn.x,
          acorn.landingY,
          "#8b5a2b"
        );
        acorns.splice(index, 1);
      }
    }

    for (const effect of effects) {
      effect.x += effect.vx * deltaSeconds;
      effect.y += effect.vy * deltaSeconds;
      effect.vy += 310 * deltaSeconds;
      effect.life -= deltaSeconds;
    }

    effects = effects.filter(
      (effect) => effect.life > 0
    );

    updateHud();

    if (
      currentLevel !== 5 &&
      elapsedMs >= currentLevelDurationMs()
    ) {
      finishLevel(true);
    }
  }

  function drawCloud(x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "rgba(255,255,255,0.88)";

    [
      [-35, 8, 25],
      [-10, -5, 34],
      [20, 5, 27],
      [42, 13, 19],
    ].forEach(([cx, cy, radius]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  function drawLevel2Background() {
    const sky = ctx.createLinearGradient(
      0,
      0,
      0,
      390
    );

    sky.addColorStop(0, "#71c7ef");
    sky.addColorStop(0.62, "#d7f3ff");
    sky.addColorStop(1, "#fff3c4");

    ctx.fillStyle = sky;
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Sun
    const sunGlow = ctx.createRadialGradient(
      975,
      90,
      10,
      975,
      90,
      82
    );

    sunGlow.addColorStop(
      0,
      "rgba(255,245,160,0.95)"
    );
    sunGlow.addColorStop(
      1,
      "rgba(255,245,160,0)"
    );

    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(
      975,
      90,
      82,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#ffe88a";
    ctx.beginPath();
    ctx.arc(
      975,
      90,
      40,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Clouds
    for (
      let index = -1;
      index < 7;
      index += 1
    ) {
      const cloudX =
        (
          (
            index * 285 -
            worldOffset * 0.1
          ) %
            1995 +
          1995
        ) %
          1995 -
        250;

      drawCloud(
        cloudX,
        62 + (index % 3) * 54,
        0.65 + (index % 2) * 0.14
      );
    }

    // Far hills
    ctx.fillStyle = "#8fc374";
    ctx.beginPath();
    ctx.moveTo(0, 310);

    for (
      let x = 0;
      x <= 1200;
      x += 180
    ) {
      ctx.quadraticCurveTo(
        x + 90,
        235 +
          Math.sin(
            (
              x +
              worldOffset * 0.1
            ) /
              180
          ) *
            25,
        x + 180,
        310
      );
    }

    ctx.lineTo(1200, 390);
    ctx.lineTo(0, 390);
    ctx.closePath();
    ctx.fill();

    // Near hills
    ctx.fillStyle = "#67a857";
    ctx.beginPath();
    ctx.moveTo(0, 340);

    for (
      let x = 0;
      x <= 1200;
      x += 150
    ) {
      ctx.quadraticCurveTo(
        x + 75,
        285 +
          Math.sin(
            (
              x +
              worldOffset * 0.22
            ) /
              135
          ) *
            20,
        x + 150,
        340
      );
    }

    ctx.lineTo(1200, 425);
    ctx.lineTo(0, 425);
    ctx.closePath();
    ctx.fill();

    // Meadow
    const meadow = ctx.createLinearGradient(
      0,
      335,
      0,
      600
    );

    meadow.addColorStop(
      0,
      "#7fbd55"
    );
    meadow.addColorStop(
      0.55,
      "#72ad48"
    );
    meadow.addColorStop(
      1,
      "#538936"
    );

    ctx.fillStyle = meadow;
    ctx.fillRect(
      0,
      335,
      1200,
      265
    );

    function drawRoadTree(
      x,
      y,
      scale
    ) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      ctx.fillStyle = "#70502e";
      ctx.fillRect(
        -11,
        -78,
        22,
        82
      );

      ctx.fillStyle = "#3f7f3e";

      [
        [-27, -87, 33],
        [4, -111, 42],
        [34, -83, 31],
        [4, -67, 38],
      ].forEach(
        ([cx, cy, radius]) => {
          ctx.beginPath();
          ctx.arc(
            cx,
            cy,
            radius,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      );

      ctx.fillStyle =
        "rgba(255,255,255,0.16)";
      ctx.beginPath();
      ctx.arc(
        -8,
        -103,
        13,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    }

    function drawCottage(x) {
      ctx.save();
      ctx.translate(x, 0);

      ctx.fillStyle = "#f1d29a";
      ctx.fillRect(
        0,
        245,
        135,
        92
      );

      ctx.fillStyle = "#924d35";
      ctx.beginPath();
      ctx.moveTo(-14, 248);
      ctx.lineTo(68, 192);
      ctx.lineTo(149, 248);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#8f5b37";
      ctx.fillRect(
        53,
        282,
        30,
        55
      );

      ctx.fillStyle = "#bce3f2";
      ctx.fillRect(
        16,
        268,
        25,
        25
      );
      ctx.fillRect(
        96,
        268,
        25,
        25
      );

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        16,
        268,
        25,
        25
      );
      ctx.strokeRect(
        96,
        268,
        25,
        25
      );

      ctx.restore();
    }

    // Distant scenery
    const sceneryCycle = 1550;
    const sceneryOffset =
      -(
        (
          worldOffset * 0.42
        ) %
          sceneryCycle
      );

    for (
      let base =
        sceneryOffset -
        sceneryCycle;
      base < 2300;
      base += sceneryCycle
    ) {
      drawCottage(base + 160);

      drawRoadTree(
        base + 390,
        350,
        0.7
      );

      drawRoadTree(
        base + 610,
        355,
        0.82
      );

      drawRoadTree(
        base + 930,
        350,
        0.68
      );

      drawRoadTree(
        base + 1190,
        355,
        0.88
      );
    }

    // Fence
    const fenceOffset =
      -(
        (
          worldOffset * 0.66
        ) %
          165
      );

    ctx.strokeStyle = "#ead6a5";
    ctx.lineCap = "round";

    ctx.lineWidth = 10;

    for (
      let x =
        fenceOffset - 165;
      x < 1370;
      x += 165
    ) {
      ctx.beginPath();
      ctx.moveTo(x, 335);
      ctx.lineTo(x, 420);
      ctx.stroke();
    }

    ctx.lineWidth = 8;

    ctx.beginPath();
    ctx.moveTo(0, 360);
    ctx.lineTo(1200, 360);
    ctx.moveTo(0, 400);
    ctx.lineTo(1200, 400);
    ctx.stroke();

    // Wildflowers
    const flowerOffset =
      -(
        (
          worldOffset * 0.92
        ) %
          210
      );

    const flowerColors = [
      "#ffffff",
      "#fde68a",
      "#f9a8d4",
      "#bfdbfe",
      "#c4b5fd",
    ];

    for (
      let x =
        flowerOffset - 210;
      x < 1410;
      x += 210
    ) {
      for (
        let index = 0;
        index < 5;
        index += 1
      ) {
        const flowerX =
          x + 35 + index * 30;
        const flowerY =
          440 +
          (index % 3) * 18;

        ctx.strokeStyle =
          "#39733a";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(
          flowerX,
          flowerY + 14
        );
        ctx.lineTo(
          flowerX,
          flowerY
        );
        ctx.stroke();

        ctx.fillStyle =
          flowerColors[index];

        ctx.beginPath();
        ctx.arc(
          flowerX,
          flowerY,
          6,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    // Dirt country road
    const roadGradient =
      ctx.createLinearGradient(
        0,
        470,
        0,
        600
      );

    roadGradient.addColorStop(
      0,
      "#c99b67"
    );
    roadGradient.addColorStop(
      1,
      "#a87445"
    );

    ctx.fillStyle = roadGradient;

    ctx.beginPath();
    ctx.moveTo(0, 487);
    ctx.quadraticCurveTo(
      600,
      455,
      1200,
      490
    );
    ctx.lineTo(1200, 600);
    ctx.lineTo(0, 600);
    ctx.closePath();
    ctx.fill();

    // Moving road marks / stones
    const stoneOffset =
      -(
        (
          worldOffset * 1.3
        ) %
          125
      );

    for (
      let x =
        stoneOffset - 125;
      x < 1325;
      x += 125
    ) {
      ctx.fillStyle =
        "rgba(105,74,45,0.35)";

      ctx.beginPath();
      ctx.ellipse(
        x + 30,
        550,
        18,
        6,
        -0.1,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        x + 82,
        520,
        10,
        4,
        0.15,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Foreground grass edge
    ctx.fillStyle = "#4d7d31";
    ctx.fillRect(
      0,
      590,
      1200,
      10
    );
  }
  function drawLevel3Background() {
    const sky = ctx.createLinearGradient(
      0,
      0,
      0,
      390
    );

    sky.addColorStop(0, "#74b6d8");
    sky.addColorStop(0.65, "#cce8d4");
    sky.addColorStop(1, "#f4e7b5");

    ctx.fillStyle = sky;
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Soft sun through the trees
    const sunGlow = ctx.createRadialGradient(
      995,
      90,
      12,
      995,
      90,
      90
    );

    sunGlow.addColorStop(
      0,
      "rgba(255,240,155,0.9)"
    );

    sunGlow.addColorStop(
      1,
      "rgba(255,240,155,0)"
    );

    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(
      995,
      90,
      90,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Distant hills
    ctx.fillStyle = "#6f9d67";
    ctx.beginPath();
    ctx.moveTo(0, 320);

    for (
      let x = 0;
      x <= 1200;
      x += 170
    ) {
      ctx.quadraticCurveTo(
        x + 85,
        250 +
          Math.sin(
            (x + worldOffset * 0.1) / 150
          ) * 24,
        x + 170,
        320
      );
    }

    ctx.lineTo(1200, 410);
    ctx.lineTo(0, 410);
    ctx.closePath();
    ctx.fill();

    // Forest floor
    const floorGradient =
      ctx.createLinearGradient(
        0,
        330,
        0,
        600
      );

    floorGradient.addColorStop(
      0,
      "#668d4b"
    );
    floorGradient.addColorStop(
      0.6,
      "#496f3d"
    );
    floorGradient.addColorStop(
      1,
      "#355a35"
    );

    ctx.fillStyle = floorGradient;
    ctx.fillRect(
      0,
      330,
      1200,
      270
    );

    function drawForestTree(
      x,
      y,
      scale,
      trunkWidth = 34
    ) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      ctx.fillStyle = "#69482f";
      ctx.fillRect(
        -trunkWidth / 2,
        -165,
        trunkWidth,
        172
      );

      ctx.fillStyle = "#315f3b";

      [
        [-45, -150, 48],
        [0, -190, 57],
        [48, -150, 46],
        [-18, -118, 52],
        [30, -112, 45],
      ].forEach(
        ([cx, cy, radius]) => {
          ctx.beginPath();
          ctx.arc(
            cx,
            cy,
            radius,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      );

      ctx.fillStyle =
        "rgba(142,190,108,0.42)";

      ctx.beginPath();
      ctx.arc(
        -18,
        -177,
        19,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    }

    // Rear forest layer
    const farTreeOffset =
      -((worldOffset * 0.34) % 240);

    for (
      let x = farTreeOffset - 240;
      x < 1450;
      x += 240
    ) {
      drawForestTree(
        x + 70,
        365,
        0.62
      );
    }

    // Winding forest trail
    const trail = ctx.createLinearGradient(
      0,
      430,
      0,
      600
    );

    trail.addColorStop(
      0,
      "#b89564"
    );
    trail.addColorStop(
      1,
      "#8c6748"
    );

    ctx.fillStyle = trail;
    ctx.beginPath();
    ctx.moveTo(0, 470);
    ctx.quadraticCurveTo(
      280,
      430,
      570,
      474
    );
    ctx.quadraticCurveTo(
      880,
      520,
      1200,
      466
    );
    ctx.lineTo(
      1200,
      600
    );
    ctx.lineTo(
      0,
      600
    );
    ctx.closePath();
    ctx.fill();

    // Ferns and bushes
    const bushOffset =
      -((worldOffset * 0.78) % 190);

    for (
      let x = bushOffset - 190;
      x < 1400;
      x += 190
    ) {
      ctx.fillStyle = "#2f6c3c";

      [
        [x + 20, 435, 26],
        [x + 48, 425, 31],
        [x + 75, 438, 24],
      ].forEach(
        ([cx, cy, radius]) => {
          ctx.beginPath();
          ctx.arc(
            cx,
            cy,
            radius,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      );
    }
// Mushrooms / flowers
    const detailOffset =
      -((worldOffset * 1.18) % 250);

    for (
      let x = detailOffset - 250;
      x < 1450;
      x += 250
    ) {
      ctx.fillStyle = "#efe4c8";
      ctx.fillRect(
        x + 140,
        510,
        5,
        18
      );

      ctx.fillStyle = "#d85d4b";
      ctx.beginPath();
      ctx.arc(
        x + 142,
        508,
        11,
        Math.PI,
        Math.PI * 2
      );
      ctx.fill();

      ctx.fillStyle = "#ffffff";

      ctx.beginPath();
      ctx.arc(
        x + 137,
        504,
        2,
        0,
        Math.PI * 2
      );
      ctx.arc(
        x + 146,
        502,
        2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Trail stones
    const stoneOffset =
      -((worldOffset * 1.3) % 115);

    for (
      let x = stoneOffset - 115;
      x < 1320;
      x += 115
    ) {
      ctx.fillStyle =
        "rgba(79,65,53,0.32)";

      ctx.beginPath();
      ctx.ellipse(
        x + 25,
        550,
        17,
        6,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  function drawLevel3Foreground() {
    if (currentLevel !== 3) {
      return;
    }

    function drawForegroundTree(
      x,
      y,
      scale
    ) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      ctx.fillStyle = "#69482f";
      ctx.fillRect(
        -18,
        -150,
        36,
        160
      );

      ctx.fillStyle = "#315f3b";

      [
        [-38, -138, 40],
        [0, -175, 48],
        [40, -138, 39],
        [-15, -108, 43],
        [25, -104, 38],
      ].forEach(
        ([cx, cy, radius]) => {
          ctx.beginPath();
          ctx.arc(
            cx,
            cy,
            radius,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      );

      ctx.restore();
    }

    const edgeDrift =
      (worldOffset * 0.55) % 120;

    drawForegroundTree(
      -25 - edgeDrift,
      520,
      0.92
    );

    drawForegroundTree(
      canvas.width + 30 - edgeDrift,
      520,
      0.92
    );
  }
  function drawLevel4Background() {
    const sky = ctx.createLinearGradient(
      0,
      0,
      0,
      390
    );

    sky.addColorStop(0, "#69b7dc");
    sky.addColorStop(0.62, "#d2edee");
    sky.addColorStop(1, "#f7e6b6");

    ctx.fillStyle = sky;
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Sun
    ctx.fillStyle = "#ffe58a";
    ctx.beginPath();
    ctx.arc(
      1000,
      88,
      39,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Distant hills
    ctx.fillStyle = "#7ca466";
    ctx.beginPath();
    ctx.moveTo(0, 310);

    for (
      let x = 0;
      x <= 1200;
      x += 180
    ) {
      ctx.quadraticCurveTo(
        x + 90,
        255 +
          Math.sin(
            (x + worldOffset * 0.12) / 165
          ) * 25,
        x + 180,
        310
      );
    }

    ctx.lineTo(1200, 395);
    ctx.lineTo(0, 395);
    ctx.closePath();
    ctx.fill();

    // Grass
    const grass = ctx.createLinearGradient(
      0,
      330,
      0,
      600
    );

    grass.addColorStop(0, "#77ad52");
    grass.addColorStop(1, "#4f7b3a");

    ctx.fillStyle = grass;
    ctx.fillRect(
      0,
      330,
      1200,
      270
    );

    function drawVillageHouse(
      x,
      y,
      bodyColor,
      roofColor
    ) {
      ctx.save();
      ctx.translate(x, y);

      ctx.fillStyle = bodyColor;
      ctx.fillRect(
        0,
        -95,
        125,
        95
      );

      ctx.fillStyle = roofColor;
      ctx.beginPath();
      ctx.moveTo(-14, -92);
      ctx.lineTo(62, -150);
      ctx.lineTo(140, -92);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#79533b";
      ctx.fillRect(
        50,
        -53,
        28,
        53
      );

      ctx.fillStyle = "#bfe1ed";

      ctx.fillRect(
        15,
        -70,
        24,
        25
      );

      ctx.fillRect(
        90,
        -70,
        24,
        25
      );

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;

      ctx.strokeRect(
        15,
        -70,
        24,
        25
      );

      ctx.strokeRect(
        90,
        -70,
        24,
        25
      );

      ctx.restore();
    }

    function drawVillageTree(
      x,
      y,
      scale
    ) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      ctx.fillStyle = "#715033";
      ctx.fillRect(
        -10,
        -80,
        20,
        84
      );

      ctx.fillStyle = "#497d42";

      [
        [-25, -86, 31],
        [5, -108, 38],
        [32, -82, 30],
        [2, -67, 35],
      ].forEach(
        ([cx, cy, radius]) => {
          ctx.beginPath();
          ctx.arc(
            cx,
            cy,
            radius,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      );

      ctx.restore();
    }

    // Village scenery
    const villageCycle = 1500;
    const villageOffset =
      -((worldOffset * 0.42) % villageCycle);

    for (
      let base =
        villageOffset - villageCycle;
      base < 2400;
      base += villageCycle
    ) {
      drawVillageHouse(
        base + 100,
        350,
        "#e8c990",
        "#a6503d"
      );

      drawVillageTree(
        base + 310,
        355,
        0.76
      );

      drawVillageHouse(
        base + 520,
        350,
        "#d9dbc7",
        "#6e7181"
      );

      drawVillageTree(
        base + 760,
        355,
        0.86
      );

      drawVillageHouse(
        base + 980,
        350,
        "#e7b692",
        "#824d3d"
      );

      drawVillageTree(
        base + 1210,
        355,
        0.73
      );
    }

    // Hedge along village edge
    const hedgeOffset =
      -((worldOffset * 0.7) % 115);

    for (
      let x = hedgeOffset - 115;
      x < 1350;
      x += 115
    ) {
      ctx.fillStyle = "#386d3d";

      ctx.beginPath();
      ctx.arc(
        x + 30,
        400,
        38,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.arc(
        x + 72,
        397,
        42,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Country lane
    const lane = ctx.createLinearGradient(
      0,
      450,
      0,
      600
    );

    lane.addColorStop(0, "#c8a070");
    lane.addColorStop(1, "#9a724e");

    ctx.fillStyle = lane;
    ctx.beginPath();
    ctx.moveTo(0, 470);
    ctx.quadraticCurveTo(
      600,
      440,
      1200,
      474
    );
    ctx.lineTo(1200, 600);
    ctx.lineTo(0, 600);
    ctx.closePath();
    ctx.fill();

    // Lane stones
    const stoneOffset =
      -((worldOffset * 1.28) % 120);

    for (
      let x = stoneOffset - 120;
      x < 1320;
      x += 120
    ) {
      ctx.fillStyle =
        "rgba(96,72,54,0.28)";

      ctx.beginPath();
      ctx.ellipse(
        x + 30,
        550,
        16,
        5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        x + 78,
        515,
        9,
        4,
        0.1,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }
  function drawLevel5Background() {
    const sky = ctx.createLinearGradient(
      0,
      0,
      0,
      600
    );

    sky.addColorStop(0, "#263952");
    sky.addColorStop(0.55, "#536b69");
    sky.addColorStop(1, "#9a8b62");

    ctx.fillStyle = sky;
    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Moon glow
    const moonGlow = ctx.createRadialGradient(
      1040,
      100,
      12,
      1040,
      100,
      85
    );

    moonGlow.addColorStop(
      0,
      "rgba(250,245,195,0.85)"
    );

    moonGlow.addColorStop(
      1,
      "rgba(250,245,195,0)"
    );

    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(
      1040,
      100,
      85,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#efe9bd";
    ctx.beginPath();
    ctx.arc(
      1040,
      100,
      36,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Distant forest
    ctx.fillStyle = "#294a3a";

    const farTreeOffset =
      -((worldOffset * 0.16) % 170);

    for (
      let x = farTreeOffset - 170;
      x < 1400;
      x += 170
    ) {
      ctx.beginPath();
      ctx.moveTo(x + 60, 145);
      ctx.lineTo(x, 355);
      ctx.lineTo(x + 120, 355);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + 60, 205);
      ctx.lineTo(x + 10, 390);
      ctx.lineTo(x + 110, 390);
      ctx.closePath();
      ctx.fill();
    }

    // Ground
    const ground = ctx.createLinearGradient(
      0,
      340,
      0,
      600
    );

    ground.addColorStop(0, "#4f6841");
    ground.addColorStop(1, "#2f4930");

    ctx.fillStyle = ground;
    ctx.fillRect(
      0,
      340,
      1200,
      260
    );

    // Path toward Foxy's den
    ctx.fillStyle = "#80654b";
    ctx.beginPath();
    ctx.moveTo(0, 485);
    ctx.quadraticCurveTo(
      590,
      435,
      1200,
      490
    );
    ctx.lineTo(1200, 600);
    ctx.lineTo(0, 600);
    ctx.closePath();
    ctx.fill();

    // Den hill
    ctx.fillStyle = "#435338";
    ctx.beginPath();
    ctx.ellipse(
      1060,
      375,
      180,
      135,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Den opening
    const denGradient =
      ctx.createRadialGradient(
        1050,
        415,
        15,
        1050,
        415,
        95
      );

    denGradient.addColorStop(
      0,
      "#111315"
    );

    denGradient.addColorStop(
      1,
      "#302d27"
    );

    ctx.fillStyle = denGradient;
    ctx.beginPath();
    ctx.ellipse(
      1050,
      420,
      92,
      78,
      0,
      Math.PI,
      Math.PI * 2
    );
    ctx.lineTo(
      1142,
      470
    );
    ctx.lineTo(
      958,
      470
    );
    ctx.closePath();
    ctx.fill();

    // Rocks around den
    ctx.fillStyle = "#68645b";

    [
      [950, 445, 37, 24],
      [1150, 448, 42, 27],
      [980, 372, 31, 25],
      [1120, 370, 35, 26],
    ].forEach(
      ([x, y, rx, ry]) => {
        ctx.beginPath();
        ctx.ellipse(
          x,
          y,
          rx,
          ry,
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    );

    // Twisted foreground bushes
    const bushOffset =
      -((worldOffset * 0.48) % 220);

    for (
      let x = bushOffset - 220;
      x < 1450;
      x += 220
    ) {
      ctx.fillStyle = "#243f2d";

      ctx.beginPath();
      ctx.arc(
        x + 25,
        435,
        35,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.beginPath();
      ctx.arc(
        x + 67,
        442,
        29,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Ground stones
    const stoneOffset =
      -((worldOffset * 1.08) % 130);

    for (
      let x = stoneOffset - 130;
      x < 1350;
      x += 130
    ) {
      ctx.fillStyle =
        "rgba(38,34,31,0.38)";

      ctx.beginPath();
      ctx.ellipse(
        x + 35,
        550,
        18,
        6,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    // Den label
    ctx.save();
    ctx.font =
      "bold 20px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#f1d69a";
    ctx.fillText(
      "FOXY'S DEN",
      1050,
      325
    );
    ctx.restore();
  }
  function drawBackground() {
    if (currentLevel >= 5) {
      drawLevel5Background();
      return;
    }

    if (currentLevel >= 4) {
      drawLevel4Background();
      return;
    }
    if (currentLevel >= 3) {
      drawLevel3Background();
      return;
    }

    if (currentLevel >= 2) {
      drawLevel2Background();
      return;
    }
    const sky = ctx.createLinearGradient(
      0,
      0,
      0,
      390
    );

    sky.addColorStop(0, "#63bee9");
    sky.addColorStop(0.66, "#ccefff");
    sky.addColorStop(1, "#fff1bf");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, 390);

    const sunGlow = ctx.createRadialGradient(
      1030,
      92,
      10,
      1030,
      92,
      75
    );

    sunGlow.addColorStop(
      0,
      "rgba(255,248,167,0.95)"
    );
    sunGlow.addColorStop(
      1,
      "rgba(255,248,167,0)"
    );

    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(1030, 92, 75, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff3a6";
    ctx.beginPath();
    ctx.arc(1030, 92, 39, 0, Math.PI * 2);
    ctx.fill();

    for (let index = -1; index < 7; index += 1) {
      const cloudX =
        ((index * 265 - worldOffset * 0.12) %
          1855 +
          1855) %
          1855 -
        230;

      drawCloud(
        cloudX,
        64 + (index % 3) * 58,
        0.68 + (index % 3) * 0.12
      );
    }

    ctx.fillStyle = "#84b85a";
    ctx.beginPath();
    ctx.moveTo(0, 320);

    for (let x = 0; x <= 1200; x += 150) {
      ctx.quadraticCurveTo(
        x + 75,
        260 +
          Math.sin(
            (x + worldOffset * 0.18) / 170
          ) *
            28,
        x + 150,
        320
      );
    }

    ctx.lineTo(1200, 410);
    ctx.lineTo(0, 410);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#6d9e45";
    ctx.beginPath();
    ctx.moveTo(0, 350);

    for (let x = 0; x <= 1200; x += 125) {
      ctx.quadraticCurveTo(
        x + 62,
        310 +
          Math.sin(
            (x + worldOffset * 0.3) / 120
          ) *
            22,
        x + 125,
        350
      );
    }

    ctx.lineTo(1200, 430);
    ctx.lineTo(0, 430);
    ctx.closePath();
    ctx.fill();

    function drawBarn(x) {
      ctx.save();
      ctx.translate(x, 0);

      ctx.fillStyle = "#a83c2f";
      ctx.fillRect(0, 198, 180, 154);

      ctx.fillStyle = "#74291f";
      ctx.beginPath();
      ctx.moveTo(-20, 202);
      ctx.lineTo(90, 125);
      ctx.lineTo(200, 202);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#f2e3bd";
      ctx.fillRect(67, 254, 52, 98);

      ctx.strokeStyle = "#a83c2f";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(70, 258);
      ctx.lineTo(116, 347);
      ctx.moveTo(116, 258);
      ctx.lineTo(70, 347);
      ctx.stroke();

      ctx.fillStyle = "#f6c453";
      ctx.fillRect(18, 231, 34, 31);
      ctx.fillRect(132, 231, 30, 31);

      ctx.strokeStyle = "#fff0c7";
      ctx.lineWidth = 5;
      ctx.strokeRect(18, 231, 34, 31);
      ctx.strokeRect(132, 231, 30, 31);

      ctx.restore();
    }

    function drawSilo(x) {
      ctx.save();
      ctx.translate(x, 0);

      ctx.fillStyle = "#aeb8b4";
      ctx.fillRect(0, 190, 68, 163);

      ctx.fillStyle = "#778985";
      ctx.beginPath();
      ctx.ellipse(
        34,
        190,
        34,
        15,
        0,
        Math.PI,
        Math.PI * 2
      );
      ctx.lineTo(68, 190);
      ctx.lineTo(0, 190);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle =
        "rgba(255,255,255,0.45)";
      ctx.lineWidth = 4;

      for (let y = 218; y < 350; y += 26) {
        ctx.beginPath();
        ctx.moveTo(5, y);
        ctx.lineTo(63, y);
        ctx.stroke();
      }

      ctx.restore();
    }

    function drawWindmill(x) {
      ctx.save();
      ctx.translate(x, 0);

      ctx.strokeStyle = "#745331";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, 350);
      ctx.lineTo(36, 175);
      ctx.lineTo(72, 350);
      ctx.stroke();

      ctx.translate(36, 175);
      ctx.rotate(worldOffset * 0.002);

      ctx.strokeStyle = "#eee2c2";
      ctx.lineWidth = 9;

      for (let index = 0; index < 4; index += 1) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -66);
        ctx.stroke();

        ctx.fillStyle = "#dbc9a0";
        ctx.fillRect(-7, -67, 14, 36);
      }

      ctx.fillStyle = "#805a32";
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawTree(x, y, scale) {
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      ctx.fillStyle = "#75502d";
      ctx.fillRect(-12, -72, 24, 77);

      ctx.fillStyle = "#477d35";

      [
        [-30, -81, 36],
        [0, -108, 43],
        [34, -78, 35],
        [2, -65, 41],
      ].forEach(([cx, cy, radius]) => {
        ctx.beginPath();
        ctx.arc(
          cx,
          cy,
          radius,
          0,
          Math.PI * 2
        );
        ctx.fill();
      });

      ctx.fillStyle = "#d85f3d";

      [
        [-22, -93],
        [18, -112],
        [31, -75],
        [-2, -67],
      ].forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    const sceneryCycle = 1750;
    const sceneryOffset =
      -((worldOffset * 0.48) % sceneryCycle);

    for (
      let base = sceneryOffset - sceneryCycle;
      base < 2400;
      base += sceneryCycle
    ) {
      drawBarn(base + 160);
      drawSilo(base + 365);
      drawWindmill(base + 575);
      drawTree(base + 790, 360, 0.85);
      drawTree(base + 1040, 365, 0.72);
      drawTree(base + 1360, 360, 0.9);
    }

    ctx.fillStyle = "#79ad47";
    ctx.fillRect(0, 350, 1200, 250);

    const fieldGradient = ctx.createLinearGradient(
      0,
      350,
      0,
      600
    );

    fieldGradient.addColorStop(0, "#78aa43");
    fieldGradient.addColorStop(0.55, "#8db94e");
    fieldGradient.addColorStop(1, "#5d8f35");

    ctx.fillStyle = fieldGradient;
    ctx.fillRect(0, 350, 1200, 250);

    ctx.strokeStyle = "rgba(66,112,40,0.45)";
    ctx.lineWidth = 5;

    for (let row = 0; row < 7; row += 1) {
      const y = 382 + row * 35;
      const shift =
        -((worldOffset * (0.7 + row * 0.05)) % 80);

      ctx.beginPath();

      for (
        let x = shift - 80;
        x <= 1280;
        x += 80
      ) {
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(
          x + 35,
          y - 9,
          x + 70,
          y
        );
      }

      ctx.stroke();
    }

    const fenceOffset =
      -((worldOffset * 0.72) % 175);

    ctx.strokeStyle = "#f0d69b";
    ctx.lineWidth = 11;

    for (
      let x = fenceOffset - 175;
      x < 1380;
      x += 175
    ) {
      ctx.beginPath();
      ctx.moveTo(x, 310);
      ctx.lineTo(x, 400);
      ctx.stroke();
    }

    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, 337);
    ctx.lineTo(1200, 337);
    ctx.moveTo(0, 382);
    ctx.lineTo(1200, 382);
    ctx.stroke();

    const detailOffset =
      -((worldOffset * 1.05) % 300);

    for (
      let x = detailOffset - 300;
      x < 1500;
      x += 300
    ) {
      ctx.fillStyle = "#d79b32";
      ctx.beginPath();
      ctx.ellipse(
        x + 110,
        516,
        43,
        25,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.strokeStyle = "#9a681f";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(
        x + 110,
        516,
        43,
        25,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();

      const flowerColors = [
        "#fef08a",
        "#ffffff",
        "#f9a8d4",
        "#bfdbfe",
      ];

      for (let flower = 0; flower < 4; flower += 1) {
        const flowerX =
          x + 195 + flower * 22;
        const flowerY =
          470 + (flower % 2) * 25;

        ctx.strokeStyle = "#3f7d35";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(flowerX, flowerY + 15);
        ctx.lineTo(flowerX, flowerY);
        ctx.stroke();

        ctx.fillStyle =
          flowerColors[flower];
        ctx.beginPath();
        ctx.arc(
          flowerX,
          flowerY,
          6,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
    }

    ctx.fillStyle = "#a9743e";
    ctx.fillRect(0, 558, 1200, 42);

    ctx.strokeStyle = "#82552c";
    ctx.lineWidth = 4;

    for (
      let x = -((worldOffset * 1.35) % 95);
      x < 1300;
      x += 95
    ) {
      ctx.beginPath();
      ctx.moveTo(x, 578);
      ctx.lineTo(x + 55, 578);
      ctx.stroke();
    }
  }

  function drawAcorn(acorn) {
    if (acorn.warningMs > 0) {
      const pulse =
        0.72 +
        Math.sin(acorn.warningMs * 0.025) * 0.16;

      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.fillStyle = "rgba(146, 64, 14, 0.25)";
      ctx.beginPath();
      ctx.ellipse(
        acorn.x,
        acorn.landingY,
        31,
        12,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.strokeStyle = "#9a3412";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(
        acorn.x,
        acorn.landingY,
        25,
        9,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(acorn.x, acorn.y);
    ctx.scale(
      acorn.depthScale,
      acorn.depthScale
    );
    ctx.rotate(acorn.rotation);

    ctx.fillStyle = "#965f2d";
    ctx.beginPath();
    ctx.ellipse(0, 5, 17, 22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#5f3b1f";
    ctx.beginPath();
    ctx.ellipse(0, -9, 19, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#3e2817";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(1, -16);
    ctx.quadraticCurveTo(8, -26, 13, -29);
    ctx.stroke();

    ctx.restore();
  }

  function getHennyPosition() {
    return {
      x: clamp(
        player.x - 355 * facingDirection,
        50,
        canvas.width - 50
      ),
      y: player.y + 10,
    };
  }

  function drawHenny(now) {
    if (
      currentLevel === 5 &&
      !activeFlockMembers.includes("henny")
    ) {
      return;
    }
    if (currentLevel < 4) {
      return;
    }

    const henny = getHennyPosition();

    const runningPhase =
      currentLevel === 5 ? 0 : now * 0.014 + 3.1;

    const stride =
      Math.sin(runningPhase);

    const bob =
      Math.abs(
        Math.sin(runningPhase)
      ) * 4;

    const flashing =
      now < invulnerableUntil &&
      Math.floor(now / 100) % 2 === 0;

    if (flashing) {
      return;
    }

    ctx.save();

    ctx.translate(
      henny.x,
      henny.y - 63 - bob - jumpHeight
    );

    const depthScale =
      0.78 +
      clamp(
        (henny.y - 330) / 190,
        0,
        1
      ) * 0.22;

    ctx.scale(
      depthScale * facingDirection,
      depthScale
    );

    // Shadow
    ctx.fillStyle =
      "rgba(45,48,35,0.24)";

    ctx.beginPath();

    ctx.ellipse(
      0,
      57 + bob + jumpHeight,
      Math.max(
        23,
        38 - jumpHeight * 0.07
      ),
      12,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();

    function drawHennyLeg(
      offsetX,
      phase
    ) {
      const swing =
        Math.sin(
          runningPhase + phase
        ) * 15;

      ctx.save();
      ctx.translate(
        offsetX,
        30
      );

      ctx.rotate(
        (swing * Math.PI) / 180
      );

      ctx.strokeStyle = "#d47a24";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 23);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 23);
      ctx.lineTo(13, 28);
      ctx.stroke();

      ctx.restore();
    }

    drawHennyLeg(-11, 0);
    drawHennyLeg(11, Math.PI);

    // Body
    ctx.fillStyle = "#c8793d";

    ctx.beginPath();

    ctx.ellipse(
      0,
      4,
      39,
      40,
      -0.08,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Wing
    ctx.save();
    ctx.translate(-15, 5);
    ctx.rotate(
      -0.35 + stride * 0.17
    );

    ctx.fillStyle = "#9f582f";

    ctx.beginPath();

    ctx.ellipse(
      0,
      10,
      15,
      27,
      0,
      0,
      Math.PI * 2
    );

    ctx.fill();
    ctx.restore();

    // Head
    ctx.fillStyle = "#d9924c";

    ctx.beginPath();

    ctx.arc(
      17,
      -40,
      28,
      0,
      Math.PI * 2
    );

    ctx.fill();

    // Comb
    ctx.fillStyle = "#d84a40";

    [
      [5, -66],
      [16, -70],
      [27, -65],
    ].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(
        x,
        y,
        7,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });

    // Beak
    ctx.fillStyle = "#ed9b2d";

    ctx.beginPath();
    ctx.moveTo(40, -43);
    ctx.lineTo(68, -34);
    ctx.lineTo(40, -26);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(
      26,
      -49,
      8,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#172033";
    ctx.beginPath();
    ctx.arc(
      29,
      -48,
      3.5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }
  function getDuckyPosition() {
    return {
      x: clamp(
        player.x - 255 * facingDirection,
        52,
        canvas.width - 52
      ),
      y: player.y + 13,
    };
  }

  function drawDucky(now) {
    if (
      currentLevel === 5 &&
      !activeFlockMembers.includes("ducky")
    ) {
      return;
    }
    if (currentLevel < 3) {
      return;
    }

    const duck = getDuckyPosition();
    const runningPhase =
      currentLevel === 5 ? 0 : now * 0.015 + 2.15;
    const stride =
      Math.sin(runningPhase);
    const bob =
      Math.abs(
        Math.sin(runningPhase)
      ) * 4;

    const flashing =
      now < invulnerableUntil &&
      Math.floor(now / 100) % 2 === 0;

    if (flashing) {
      return;
    }

    ctx.save();

    ctx.translate(
      duck.x,
      duck.y - 60 - bob - jumpHeight
    );

    const depthScale =
      0.78 +
      clamp(
        (duck.y - 330) / 190,
        0,
        1
      ) * 0.22;

    ctx.scale(
      depthScale * facingDirection,
      depthScale
    );

    // Shadow
    ctx.fillStyle =
      "rgba(45,48,35,0.24)";
    ctx.beginPath();
    ctx.ellipse(
      0,
      54 + bob + jumpHeight,
      Math.max(
        22,
        36 - jumpHeight * 0.07
      ),
      11,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    function drawDuckLeg(
      offsetX,
      phase
    ) {
      const swing =
        Math.sin(
          runningPhase + phase
        ) * 16;

      ctx.save();
      ctx.translate(
        offsetX,
        28
      );
      ctx.rotate(
        (swing * Math.PI) / 180
      );

      ctx.strokeStyle = "#dd7b20";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 22);
      ctx.stroke();

      ctx.fillStyle = "#e88b21";
      ctx.beginPath();
      ctx.ellipse(
        8,
        24,
        14,
        5,
        -0.1,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    }

    drawDuckLeg(-10, 0);
    drawDuckLeg(10, Math.PI);

    // Body
    ctx.fillStyle = "#b8b5aa";
    ctx.beginPath();
    ctx.ellipse(
      -2,
      4,
      37,
      36,
      -0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Mallard chest
    ctx.fillStyle = "#8a4f32";

    ctx.beginPath();
    ctx.ellipse(
      18,
      5,
      22,
      27,
      -0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Wing
    ctx.save();
    ctx.translate(
      -13,
      4
    );

    ctx.rotate(
      -0.35 + stride * 0.18
    );

    ctx.fillStyle = "#6f6a61";
    ctx.beginPath();
    ctx.ellipse(
      0,
      10,
      14,
      25,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();

    // Neck / head
    ctx.fillStyle = "#17664f";
    ctx.beginPath();
    ctx.arc(
      18,
      -38,
      27,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Wide, flat duck bill
    ctx.fillStyle = "#e8bd32";

    ctx.beginPath();
    ctx.ellipse(
      48,
      -29,
      25,
      10,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.strokeStyle = "#b88a18";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(29, -27);
    ctx.lineTo(66, -27);
    ctx.stroke();
    // Eye
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(
      27,
      -47,
      8,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#182133";
    ctx.beginPath();
    ctx.arc(
      30,
      -46,
      3.5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Small head tuft
    ctx.strokeStyle = "#d1ad2d";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(
      4,
      -63
    );
    ctx.quadraticCurveTo(
      8,
      -76,
      15,
      -70
    );
    ctx.stroke();

    ctx.restore();
  }
  function getTurkeyPosition() {
    return {
      x: clamp(
        player.x - 105 * facingDirection,
        58,
        canvas.width - 58
      ),
      y: player.y + 8,
    };
  }

  function drawTurkey(now) {
    if (
      currentLevel === 5 &&
      !activeFlockMembers.includes("turkey")
    ) {
      return;
    }
    if (currentLevel < 2) {
      return;
    }

    const turkey = getTurkeyPosition();
    const runningPhase = currentLevel === 5 ? 0 : now * 0.013 + 1.2;
    const stride = Math.sin(runningPhase);
    const bob =
      Math.abs(Math.sin(runningPhase)) * 5;
    const flashing =
      now < invulnerableUntil &&
      Math.floor(now / 100) % 2 === 0;

    if (flashing) {
      return;
    }

    ctx.save();
    ctx.translate(
      turkey.x,
      turkey.y - 72 - bob - jumpHeight
    );

    const depthScale =
      0.78 +
      clamp(
        (turkey.y - 330) / 190,
        0,
        1
      ) * 0.22;

    ctx.scale(depthScale * facingDirection, depthScale);

    ctx.fillStyle = "rgba(45, 48, 35, 0.24)";
    ctx.beginPath();
    ctx.ellipse(
      0,
      68 + bob + jumpHeight,
      Math.max(
        28,
        49 - jumpHeight * 0.08
      ),
      14,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    function drawTurkeyLeg(offsetX, phase) {
      const swing =
        Math.sin(runningPhase + phase) * 14;

      ctx.save();
      ctx.translate(offsetX, 39);
      ctx.rotate((swing * Math.PI) / 180);

      ctx.strokeStyle = "#c96c24";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 28);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 28);
      ctx.lineTo(15, 34);
      ctx.stroke();

      ctx.restore();
    }

    drawTurkeyLeg(-15, 0);
    drawTurkeyLeg(15, Math.PI);

    ctx.save();
    ctx.translate(-34, -1);

    const tailColors = [
      "#8b4513",
      "#b9682b",
      "#d99a3d",
      "#8b4513",
      "#b9682b",
    ];

    for (let index = 0; index < 5; index += 1) {
      ctx.save();
      const angle = -0.9 + index * 0.34;
      ctx.rotate(angle);
      ctx.fillStyle = tailColors[index];

      ctx.beginPath();
      ctx.ellipse(
        -5,
        -25,
        18,
        42,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();

    ctx.fillStyle = "#8b4a2b";
    ctx.beginPath();
    ctx.ellipse(
      0,
      8,
      48,
      51,
      -0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#b96834";
    ctx.beginPath();
    ctx.ellipse(
      15,
      12,
      29,
      39,
      -0.25,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.save();
    ctx.translate(-17, 5);
    ctx.rotate(-0.35 + stride * 0.16);

    ctx.fillStyle = "#6f3825";
    ctx.beginPath();
    ctx.ellipse(
      0,
      15,
      18,
      34,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = "#a95435";
    ctx.beginPath();
    ctx.ellipse(
      23,
      -37,
      22,
      35,
      -0.12,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#b96845";
    ctx.beginPath();
    ctx.arc(
      28,
      -65,
      25,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#d94438";
    ctx.beginPath();
    ctx.ellipse(
      36,
      -40,
      9,
      20,
      -0.22,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#e4a11b";
    ctx.beginPath();
    ctx.moveTo(50, -69);
    ctx.lineTo(76, -60);
    ctx.lineTo(50, -53);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(
      36,
      -72,
      8,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#172033";
    ctx.beginPath();
    ctx.arc(
      39,
      -71,
      3.5,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.strokeStyle = "#542b20";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(28, -83);
    ctx.lineTo(43, -86);
    ctx.stroke();

    ctx.restore();
  }
  function drawChicken(now) {
    if (
      currentLevel === 5 &&
      !activeFlockMembers.includes("chicken")
    ) {
      return;
    }
    const runningPhase = currentLevel === 5 ? 0 : now * 0.014;
    const stride = Math.sin(runningPhase);
    const bob = Math.abs(Math.sin(runningPhase)) * 4;
    const flashing =
      now < invulnerableUntil &&
      Math.floor(now / 100) % 2 === 0;

    if (flashing) {
      return;
    }

    ctx.save();
    ctx.translate(
      player.x,
      player.y - 65 - bob - jumpHeight
    );

    const depthScale =
      0.78 +
      clamp(
        (player.y - 330) / 190,
        0,
        1
      ) * 0.22;

    ctx.scale(depthScale * facingDirection, depthScale);

    ctx.fillStyle = "rgba(45, 48, 35, 0.24)";
    ctx.beginPath();
    ctx.ellipse(
      0,
      57 + bob + jumpHeight,
      Math.max(
        24,
        43 - jumpHeight * 0.08
      ),
      13,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    function drawLeg(offsetX, phase) {
      const swing = Math.sin(
        runningPhase + phase
      ) * 15;

      ctx.save();
      ctx.translate(offsetX, 31);
      ctx.rotate((swing * Math.PI) / 180);

      ctx.strokeStyle = "#d97706";
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 28);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 28);
      ctx.lineTo(14, 34);
      ctx.stroke();
      ctx.restore();
    }

    drawLeg(-13, 0);
    drawLeg(13, Math.PI);

    ctx.fillStyle = "#f5c542";
    ctx.beginPath();
    ctx.ellipse(
      0,
      5,
      42,
      48,
      -0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#4d87c7";
    ctx.beginPath();
    ctx.moveTo(-31, -5);
    ctx.quadraticCurveTo(0, 15, 33, -3);
    ctx.lineTo(28, 35);
    ctx.quadraticCurveTo(0, 49, -28, 33);
    ctx.closePath();
    ctx.fill();

    ctx.save();
    ctx.translate(-22, 1);
    ctx.rotate(-0.45 + stride * 0.18);
    ctx.fillStyle = "#eebc32";
    ctx.beginPath();
    ctx.ellipse(
      0,
      13,
      15,
      31,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "#f8d55b";
    ctx.beginPath();
    ctx.arc(12, -48, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ef4444";

    for (let index = 0; index < 3; index += 1) {
      ctx.beginPath();
      ctx.arc(
        -2 + index * 12,
        -79 - Math.abs(index - 1) * 4,
        9,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.moveTo(37, -50);
    ctx.lineTo(68, -40);
    ctx.lineTo(37, -32);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(23, -57, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#172033";
    ctx.beginPath();
    ctx.arc(26, -56, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#7c2d12";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(22, -36, 11, 0.18, 1.25);
    ctx.stroke();

    ctx.restore();
  }

  function drawEffects() {
    for (const effect of effects) {
      ctx.save();
      ctx.globalAlpha = clamp(
        effect.life / 0.65,
        0,
        1
      );
      ctx.fillStyle = effect.color;
      ctx.beginPath();
      ctx.arc(
        effect.x,
        effect.y,
        4,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }
  }

  function drawFoxy(now) {
    if (currentLevel !== 5) {
      return;
    }

    const runningPhase =
      now * 0.012;

    const bob =
      Math.abs(
        Math.sin(runningPhase)
      ) * 4;

    ctx.save();

    ctx.translate(
      foxy.x,
      foxy.y - 60 - bob
    );

    ctx.scale(
      foxy.facing,
      1
    );

    // Shadow
    ctx.fillStyle =
      "rgba(20,20,20,0.28)";

    ctx.beginPath();
    ctx.ellipse(
      0,
      62 + bob,
      54,
      14,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Tail
    ctx.fillStyle = "#c95d27";

    ctx.beginPath();
    ctx.moveTo(-35, 8);
    ctx.quadraticCurveTo(
      -92,
      -22,
      -104,
      24
    );
    ctx.quadraticCurveTo(
      -76,
      50,
      -30,
      28
    );
    ctx.closePath();
    ctx.fill();

    // White tail tip
    ctx.fillStyle = "#f4e5cf";

    ctx.beginPath();
    ctx.ellipse(
      -91,
      20,
      20,
      16,
      -0.3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Body
    ctx.fillStyle = "#c85b28";

    ctx.beginPath();
    ctx.ellipse(
      0,
      5,
      48,
      50,
      -0.08,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Chest
    ctx.fillStyle = "#efd6b6";

    ctx.beginPath();
    ctx.ellipse(
      19,
      13,
      23,
      35,
      -0.2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Legs
    ctx.strokeStyle = "#7d3a20";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(-18, 36);
    ctx.lineTo(-24, 65);
    ctx.moveTo(18, 36);
    ctx.lineTo(25, 65);
    ctx.stroke();

    // Head
    ctx.fillStyle = "#d9672c";

    ctx.beginPath();
    ctx.arc(
      26,
      -45,
      34,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Muzzle
    ctx.fillStyle = "#efcfad";

    ctx.beginPath();
    ctx.ellipse(
      51,
      -34,
      27,
      18,
      -0.06,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Nose
    ctx.fillStyle = "#252020";

    ctx.beginPath();
    ctx.arc(
      73,
      -38,
      8,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Ears
    ctx.fillStyle = "#b94e24";

    ctx.beginPath();
    ctx.moveTo(4, -70);
    ctx.lineTo(10, -106);
    ctx.lineTo(31, -76);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(31, -76);
    ctx.lineTo(50, -101);
    ctx.lineTo(53, -66);
    ctx.closePath();
    ctx.fill();

    // Eye
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(
      40,
      -53,
      8,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = "#172033";
    ctx.beginPath();
    ctx.arc(
      43,
      -52,
      4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Eyebrow
    ctx.strokeStyle = "#4d281d";
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(
      31,
      -66
    );
    ctx.lineTo(
      47,
      -70
    );
    ctx.stroke();

    ctx.restore();
  }
  function drawFoxyHealthBar() {
    if (
      currentLevel !== 5 ||
      !foxy
    ) {
      return;
    }

    const x = 390;
    const y = 24;
    const width = 420;
    const height = 28;

    const healthRatio =
      clamp(
        foxy.health / foxy.maxHealth,
        0,
        1
      );

    ctx.save();

    ctx.font =
      "bold 18px Arial, sans-serif";

    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";

    ctx.fillText(
      "FOXY LOXY",
      x + width / 2,
      y - 7
    );

    ctx.fillStyle =
      "rgba(20,20,20,0.75)";

    ctx.fillRect(
      x - 4,
      y - 4,
      width + 8,
      height + 8
    );

    ctx.fillStyle = "#3a2320";

    ctx.fillRect(
      x,
      y,
      width,
      height
    );

    const healthGradient =
      ctx.createLinearGradient(
        x,
        y,
        x + width,
        y
      );

    healthGradient.addColorStop(
      0,
      "#f59e0b"
    );

    healthGradient.addColorStop(
      1,
      "#ef4444"
    );

    ctx.fillStyle =
      healthGradient;

    ctx.fillRect(
      x,
      y,
      width * healthRatio,
      height
    );

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;

    ctx.strokeRect(
      x,
      y,
      width,
      height
    );

    ctx.fillStyle = "#ffffff";

    ctx.font =
      "bold 15px Arial, sans-serif";

    ctx.fillText(
      `${foxy.health} / ${foxy.maxHealth}`,
      x + width / 2,
      y + 20
    );

    ctx.restore();
  }
  function drawPlayerAcorns() {
    if (currentLevel !== 5) {
      return;
    }

    for (const shot of playerAcorns) {
      ctx.save();

      ctx.translate(
        shot.x,
        shot.y
      );

      ctx.rotate(
        shot.rotation
      );

      ctx.fillStyle = "#9a632e";

      ctx.beginPath();
      ctx.ellipse(
        0,
        3,
        10,
        13,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.fillStyle = "#5c3a20";

      ctx.beginPath();
      ctx.ellipse(
        0,
        -5,
        11,
        5,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    }
  }
  function draw(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    for (const acorn of acorns) {
      drawAcorn(acorn);
    }

    drawEffects();
    drawFoxy(now);
    drawPlayerAcorns();
    drawFoxyHealthBar();
    drawHenny(now);
    drawDucky(now);
    drawTurkey(now);
    drawChicken(now);
    drawLevel3Foreground();
  }

  function frame(now) {
    if (!previousFrameTime) {
      previousFrameTime = now;
    }

    const deltaSeconds = Math.min(
      (now - previousFrameTime) / 1000,
      0.04
    );

    previousFrameTime = now;
    update(deltaSeconds, now);
    draw(now);
    window.requestAnimationFrame(frame);
  }

  function pointerDown(event) {
    if (
      event.pointerType === "touch" ||
      !running
    ) {
      return;
    }


    if (currentLevel === 5) {
      shootLevel5Acorn();

      if (guide) {
        guide.updateFromPointerEvent(event);
        guide.setPressed(true);
      }

      return;
    }

    const point = canvasPoint(event);
    const depthScale =
      0.78 +
      clamp(
        (player.y - 330) / 190,
        0,
        1
      ) * 0.22;

    const chickenCenterY =
      player.y - 65 - jumpHeight - 16;

    const chickenDx =
      (point.x - player.x) /
      (52 * depthScale);
    const chickenDy =
      (point.y - chickenCenterY) /
      (78 * depthScale);

    pointerId = event.pointerId;
    pointerPressX = point.x;
    pointerPressY = point.y;
    pointerPressTime = performance.now();
    pointerMoved = false;

    pressStartedOnChicken =
      chickenDx * chickenDx +
        chickenDy * chickenDy <=
      1;

    if (requireClickAndDrag) {
      dragging = true;
      canvas.classList.add("is-dragging");
      canvas.setPointerCapture(event.pointerId);
      setTargetFromPointer(event);
    }

    if (guide) {
      guide.updateFromPointerEvent(event);
      guide.setPressed(true);
    }
  }

  function pointerMove(event) {
    if (guide) {
      guide.updateFromPointerEvent(event);
    }

    if (!running) {
      return;
    }

    if (!requireClickAndDrag) {
      setTargetFromPointer(event);

      if (
        pointerId !== null &&
        event.pointerId === pointerId
      ) {
        const point = canvasPoint(event);

        if (
          Math.hypot(
            point.x - pointerPressX,
            point.y - pointerPressY
          ) > 14
        ) {
          pointerMoved = true;
        }
      }

      return;
    }

    if (
      !dragging ||
      event.pointerId !== pointerId
    ) {
      return;
    }

    const point = canvasPoint(event);

    if (
      Math.hypot(
        point.x - pointerPressX,
        point.y - pointerPressY
      ) > 14
    ) {
      pointerMoved = true;
    }

    setTargetFromPointer(event);
  }

  function pointerEnd(event) {
    if (
      pointerId !== null &&
      event.pointerId !== pointerId
    ) {
      return;
    }

    const clickDuration =
      performance.now() - pointerPressTime;

    const shouldJump =
      pressStartedOnChicken &&
      !pointerMoved &&
      clickDuration <= 450;

    dragging = false;
    pointerId = null;
    pressStartedOnChicken = false;
    canvas.classList.remove("is-dragging");

    if (shouldJump) {
      startJump();
    }

    if (guide) {
      guide.setPressed(false);
    }
  }

  canvas.addEventListener(
    "pointerdown",
    pointerDown
  );
  canvas.addEventListener(
    "pointermove",
    pointerMove
  );
  canvas.addEventListener(
    "pointerup",
    pointerEnd
  );
  canvas.addEventListener(
    "pointercancel",
    pointerEnd
  );

  startButton.addEventListener(
    "click",
    startLevel
  );

  loadChickenSettings().finally(() => {
    resetLevel();
    window.requestAnimationFrame(frame);
  });
})();

/* ========================================
   CHICKEN LITTLE MASTER SOUND CONTROL
======================================== */

const chickenSoundButton =
  document.getElementById(
    "chickenSoundButton"
  );

let chickenSoundEnabled = true;

function updateChickenSoundButton() {
  if (!chickenSoundButton) {
    return;
  }

  chickenSoundButton.textContent =
    chickenSoundEnabled
      ? "🔊"
      : "🔇";

  chickenSoundButton.setAttribute(
    "aria-pressed",
    String(!chickenSoundEnabled)
  );

  chickenSoundButton.setAttribute(
    "aria-label",
    chickenSoundEnabled
      ? "Sound on"
      : "Sound off"
  );

  chickenSoundButton.title =
    chickenSoundEnabled
      ? "Sound on"
      : "Sound off";

  document
    .querySelectorAll("audio, video")
    .forEach((media) => {
      media.muted =
        !chickenSoundEnabled;
    });
}

if (chickenSoundButton) {
  chickenSoundButton.addEventListener(
    "click",
    () => {
      chickenSoundEnabled =
        !chickenSoundEnabled;

      updateChickenSoundButton();
    }
  );

  updateChickenSoundButton();
}

