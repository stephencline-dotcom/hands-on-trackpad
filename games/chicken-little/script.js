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
      } else {
        statusText.textContent =
          "Level 2 complete! Chicken Little and Turkey Lurky made it safely!";
        startButton.textContent = "Play Level 2 Again";
        pendingLevel = null;
      }
    } else {
      statusText.textContent =
        currentLevel === 1
          ? "The falling acorns caught Chicken Little. Try again!"
          : "The falling acorns caught the flock. Try Level 2 again!";
      startButton.textContent = "Try Again";
      pendingLevel = null;
    }
  }

  function resetLevel() {
    hearts = currentLevelHitsAllowed();
    elapsedMs = 0;
    worldOffset = 0;
    acorns = [];
    effects = [];
    invulnerableUntil = 0;
    jumpHeight = 0;
    jumpVelocity = 0;

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
    if (skyFallingAudio) {
      skyFallingAudio.currentTime = 0;

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

  function update(deltaSeconds, now) {
    if (!running) {
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

    if (elapsedMs >= currentLevelDurationMs()) {
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
  function drawBackground() {
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
    if (currentLevel < 2) {
      return;
    }

    const turkey = getTurkeyPosition();
    const runningPhase = now * 0.013 + 1.2;
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
    const runningPhase = now * 0.014;
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

  function draw(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    for (const acorn of acorns) {
      drawAcorn(acorn);
    }

    drawEffects();
    drawTurkey(now);
    drawChicken(now);
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

