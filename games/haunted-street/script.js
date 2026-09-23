(() => {
  "use strict";

  const canvas = document.getElementById("hauntedCanvas");
  const ctx = canvas.getContext("2d");
  const arena = document.getElementById("hauntedArena");
  const startPanel = document.getElementById("hauntedStartPanel");
  const startButton = document.getElementById("hauntedStartButton");
  const statusText = document.getElementById("hauntedStatus");
  const levelText = document.getElementById("hauntedLevel");
  const goalText = document.getElementById("hauntedGoal");
  const livesText = document.getElementById("hauntedLives");
  const scoreText = document.getElementById("hauntedScore");
  const controlText = document.getElementById("hauntedControlMode");
  const throwText = document.getElementById("hauntedThrowMode");
  const instructions = document.getElementById("hauntedInstructions");
  const guideText = document.getElementById("hauntedGuideInstruction");
  const soundButton = document.getElementById("hauntedSoundButton");

  const ghostImage = new Image();
  ghostImage.src = "/images/hghost.png";

  const mummyImage = new Image();
  mummyImage.src = "/images/mummy.png";

  const LEVELS = [
    {
      name: "Bat Night",
      intro: "Line up beneath the bats and protect the street!",
      goal: 7,
      lives: 4,
      spawn: 1550,
      speed: 55,
      maxEnemies: 3,
      witches: 0,
      ghostChance: 0,
      descent: 12,
      mummyMinDelay: 6500,
      mummyDelayRange: 4500,
    },
    {
      name: "Ghostly Streets",
      intro: "Ghosts are drifting into town. Watch how they weave!",
      goal: 10,
      lives: 4,
      spawn: 1280,
      speed: 66,
      maxEnemies: 4,
      witches: 0,
      ghostChance: 1,
      descent: 15,
      mummyMinDelay: 5500,
      mummyDelayRange: 4000,
    },
    {
      name: "Witching Hour",
      intro: "Witches take two hits. Keep moving and keep aiming!",
      goal: 13,
      lives: 4,
      spawn: 1030,
      speed: 79,
      maxEnemies: 4,
      witches: 1,
      ghostChance: 0,
      descent: 18,
      mummyMinDelay: 4500,
      mummyDelayRange: 3500,
    },
    {
      name: "Midnight Mayhem",
      intro: "The creatures are faster and their flight paths are wild!",
      goal: 17,
      lives: 3,
      spawn: 820,
      speed: 94,
      maxEnemies: 5,
      witches: 0.34,
      ghostChance: 0.23,
      descent: 22,
      mummyMinDelay: 3500,
      mummyDelayRange: 3000,
    },
    {
      name: "Haunted Rush",
      intro: "Final level! Survive the fastest night on Haunted Street!",
      goal: 22,
      lives: 3,
      spawn: 640,
      speed: 112,
      maxEnemies: 6,
      witches: 0.38,
      ghostChance: 0.26,
      descent: 27,
      mummyMinDelay: 2700,
      mummyDelayRange: 2500,
    },
  ];

  const MOVE_KEY = "hauntedStreetRequireClickAndDrag";
  const THROW_KEY = "hauntedStreetClickToThrow";
  const SOUND_KEY = "hauntedStreetSoundEnabled";
  const SPEEDS_KEY = "hauntedStreetLevelSpeeds";
  const MAXIMUMS_KEY = "hauntedStreetLevelMaximums";

  let levelIndex = 0;
  let defeated = 0;
  let lives = 4;
  let score = 0;
  let running = false;
  let dragRequired = false;
  let clickToThrow = false;
  let soundEnabled = true;
  let dragging = false;
  let pointerId = null;
  let pressX = 0;
  let pressY = 0;
  let pressTime = 0;
  let playerX = 600;
  let enemies = [];
  let pumpkins = [];
  let effects = [];
  let lastTime = 0;
  let lastSpawn = 0;
  let lastThrow = 0;
  let resultController = null;
  let mummyAppearanceStarted = 0;
  let mummyNextAppearance =
    performance.now() + 500;
  let mummyX = 760;
  let mummyScale = 1;
  const MUMMY_APPEARANCE_DURATION = 8000;
  const DANGER_LINE_Y = 485;

  let hitStreak = 0;
  let feedbackText = "";
  let feedbackColor = "#ffffff";
  let feedbackUntil = 0;

  const guide =
    window.trackpadGuide &&
    window.trackpadGuide.create
      ? window.trackpadGuide.create({
          scene: document.getElementById("hauntedTrackpadScene"),
          leftHand: document.getElementById("hauntedTrackpadLeftHand"),
          rightHand: document.getElementById("hauntedTrackpadRightHand"),
          pressIndicator: document.getElementById(
            "hauntedTrackpadPressIndicator"
          ),
          pointerSpace: "viewport",
          togglePressIndicator: true,
          toggleScenePressedClass: true,
        })
      : null;

  function bool(value, fallback) {
    if (value === null || value === undefined) return fallback;
    if (typeof value === "boolean") return value;
    return String(value) === "true";
  }

  function level() {
    return LEVELS[levelIndex];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function updateHud() {
    levelText.textContent = String(levelIndex + 1);
    goalText.textContent = `${defeated}/${level().goal}`;
    livesText.textContent = String(lives);
    scoreText.textContent = String(score);
    controlText.textContent =
      dragRequired ? "Click + Drag" : "Slide";
    throwText.textContent =
      clickToThrow ? "Click" : "Auto";

    if (dragRequired && clickToThrow) {
      instructions.textContent =
        "Hold and drag to move. Make a quick click to throw.";
      guideText.textContent =
        "Hold and drag to move. Quick click to throw.";
    } else if (dragRequired) {
      instructions.textContent =
        "Hold and drag to move. Pumpkins throw automatically.";
      guideText.textContent =
        "Hold one finger and drag to move.";
    } else if (clickToThrow) {
      instructions.textContent =
        "Slide to move and click to throw.";
      guideText.textContent =
        "Slide to move. Click to throw.";
    } else {
      instructions.textContent =
        "Slide to move. Pumpkins throw automatically.";
      guideText.textContent =
        "Slide one finger to move.";
    }
  }

  function updateSound() {
    soundButton.textContent = soundEnabled ? "🔊" : "🔇";
    soundButton.setAttribute("aria-pressed", String(soundEnabled));
    soundButton.title = soundEnabled ? "Sound on" : "Sound off";
  }

  async function loadSettings() {
    dragRequired = bool(localStorage.getItem(MOVE_KEY), false);
    clickToThrow = bool(localStorage.getItem(THROW_KEY), false);
    soundEnabled = bool(localStorage.getItem(SOUND_KEY), true);

    try {
      const storedSpeeds = JSON.parse(
        localStorage.getItem(SPEEDS_KEY) || "[]"
      );
      const storedMaximums = JSON.parse(
        localStorage.getItem(MAXIMUMS_KEY) || "[]"
      );

      LEVELS.forEach((levelSettings, index) => {
        const speed = Number.parseInt(storedSpeeds[index], 10);
        const maximum = Number.parseInt(storedMaximums[index], 10);

        if (Number.isFinite(speed)) {
          levelSettings.speed = clamp(speed, 20, 300);
        }

        if (Number.isFinite(maximum)) {
          levelSettings.maxEnemies = clamp(maximum, 1, 15);
        }
      });
    } catch {
      // Keep built-in level defaults.
    }

    try {
      const response = await fetch("/api/settings", {
        cache: "no-store",
      });

      if (response.ok) {
        const settings = await response.json();
        dragRequired = bool(
          settings.hauntedStreetRequireClickAndDrag,
          dragRequired
        );
        clickToThrow = bool(
          settings.hauntedStreetClickToThrow,
          clickToThrow
        );
        if (Array.isArray(settings.hauntedStreetLevelSpeeds)) {
          LEVELS.forEach((levelSettings, index) => {
            const value = Number.parseInt(
              settings.hauntedStreetLevelSpeeds[index],
              10
            );

            if (Number.isFinite(value)) {
              levelSettings.speed = clamp(value, 20, 300);
            }
          });
        }

        if (Array.isArray(settings.hauntedStreetLevelMaximums)) {
          LEVELS.forEach((levelSettings, index) => {
            const value = Number.parseInt(
              settings.hauntedStreetLevelMaximums[index],
              10
            );

            if (Number.isFinite(value)) {
              levelSettings.maxEnemies = clamp(value, 1, 15);
            }
          });
        }
        soundEnabled = bool(
          settings.hauntedStreetSoundEnabled,
          soundEnabled
        );
      }
    } catch {
      // Local fallback remains available.
    }

    updateHud();
    updateSound();
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();

    return {
      x:
        (event.clientX - rect.left) *
        (canvas.width / Math.max(rect.width, 1)),
      y:
        (event.clientY - rect.top) *
        (canvas.height / Math.max(rect.height, 1)),
    };
  }

  function movePlayer(event) {
    playerX = clamp(pointerPosition(event).x, 55, 1145);
  }

  function spawnEnemy() {
    const ghostChance =
      level().ghostChance;
    const enemyRoll = Math.random();
    const ghost = enemyRoll < ghostChance;
    const witch =
      !ghost &&
      enemyRoll <
        ghostChance + level().witches;
    const type =
      ghost
        ? "ghost"
        : witch
          ? "witch"
          : "bat";
    const direction =
      Math.random() < 0.5 ? 1 : -1;

    enemies.push({
      type,
      x: direction > 0 ? -60 : 1260,
      y: 85 + Math.random() * 220,
      vx:
        direction *
        level().speed *
        (0.85 + Math.random() * 0.3),
      vy:
        ghost
          ? level().descent * 0.72
          : level().descent,
      radius:
        ghost
          ? 31
          : witch
            ? 36
            : 25,
      health:
        witch
          ? 2
          : ghost && levelIndex >= 3
            ? 2
            : 1,
      phase: Math.random() * 6,
    });
  }

  function nearestEnemy() {
    let target = null;
    let distance = Infinity;

    for (const enemy of enemies) {
      const currentDistance =
        Math.hypot(enemy.x - playerX, enemy.y - 500);

      if (currentDistance < distance) {
        distance = currentDistance;
        target = enemy;
      }
    }

    return target;
  }

  function throwPumpkin(targetX, targetY) {
    if (!running) return;

    const now = performance.now();

    if (now - lastThrow < 380) return;

    lastThrow = now;

    if (!Number.isFinite(targetX)) {
      targetX = playerX;
      targetY = 0;
    }

    const startX = playerX;
    const startY = 565;
    const angle = Math.atan2(
      targetY - startY,
      targetX - startX
    );
    const speed = 520;

    pumpkins.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 15,
      spin: 0,
      fireball: hitStreak >= 3,
    });
  }

  function burst(x, y, color) {
    for (let index = 0; index < 10; index += 1) {
      effects.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 170,
        vy: (Math.random() - 0.5) * 170,
        color,
        life: 0.45,
      });
    }
  }

  function finishSuccess() {
    running = false;
    startPanel.hidden = false;

    if (levelIndex >= LEVELS.length - 1) {
      statusText.textContent =
        "You cleared all five levels of Haunted Street!";
      startButton.textContent = "Play Again";
    } else {
      statusText.textContent =
        level().name + " complete!";
      startButton.textContent =
        "Continue to Level " + (levelIndex + 2);
    }
  }

  function finishFailure() {
    running = false;
    startPanel.hidden = false;
    statusText.textContent =
      "The creatures reached the street. Try again!";
    startButton.textContent = "Try Again";
  }

  function updateMummy(now) {
    if (mummyAppearanceStarted > 0) {
      const elapsed =
        now - mummyAppearanceStarted;

      if (
        elapsed >=
        MUMMY_APPEARANCE_DURATION
      ) {
        mummyAppearanceStarted = 0;
        mummyNextAppearance =
          now +
          level().mummyMinDelay +
          Math.random() *
            level().mummyDelayRange;
      }

      return;
    }

    if (now < mummyNextAppearance) {
      return;
    }

    const positions = [
      155,
      675,
      760,
      850,
      1040,
    ];

    mummyX =
      positions[
        Math.floor(
          Math.random() * positions.length
        )
      ];
    mummyScale =
      0.9 + Math.random() * 0.22;
    mummyAppearanceStarted = now;
  }

  function update(dt, now) {
    if (!running) return;

    updateMummy(now);

    if (
      now - lastSpawn >= level().spawn &&
      enemies.length < level().maxEnemies
    ) {
      lastSpawn = now;
      spawnEnemy();
    }

    if (
      !clickToThrow &&
      now - lastThrow >= 650
    ) {
      throwPumpkin();
    }

    for (const enemy of enemies) {
      enemy.phase += dt * 7;

      if (enemy.type === "bat") {
        enemy.x +=
          enemy.vx * dt +
          Math.sin(enemy.phase * 2.45) *
            185 *
            dt;
        enemy.y +=
          enemy.vy * dt +
          Math.cos(enemy.phase * 1.8) *
            95 *
            dt;

        if (
          Math.sin(enemy.phase * 0.7) >
          0.985
        ) {
          enemy.vx *= -1;
        }
      } else if (enemy.type === "ghost") {
        enemy.x +=
          enemy.vx * dt +
          Math.sin(enemy.phase * 0.72) *
            50 *
            dt;
        enemy.y +=
          enemy.vy * dt +
          Math.cos(enemy.phase * 0.62) *
            22 *
            dt;
      } else {
        enemy.x += enemy.vx * dt;
        enemy.y +=
          enemy.vy * dt +
          (
            levelIndex >= 3
              ? Math.sin(enemy.phase * 0.85) *
                14 *
                dt
              : 0
          );
      }

      if (enemy.x < -75) {
        enemy.x = 1275;
      } else if (enemy.x > 1275) {
        enemy.x = -75;
      }
    }

    for (const pumpkin of pumpkins) {
      pumpkin.x += pumpkin.vx * dt;
      pumpkin.y += pumpkin.vy * dt;
      pumpkin.spin += dt * 8;
    }

    for (const effect of effects) {
      effect.x += effect.vx * dt;
      effect.y += effect.vy * dt;
      effect.life -= dt;
    }

    for (
      let pumpkinIndex = pumpkins.length - 1;
      pumpkinIndex >= 0;
      pumpkinIndex -= 1
    ) {
      const pumpkin = pumpkins[pumpkinIndex];
      let pumpkinRemoved = false;

      for (
        let enemyIndex = enemies.length - 1;
        enemyIndex >= 0;
        enemyIndex -= 1
      ) {
        const enemy = enemies[enemyIndex];
        const distance = Math.hypot(
          pumpkin.x - enemy.x,
          pumpkin.y - enemy.y
        );

        if (
          distance >
          pumpkin.radius + enemy.radius
        ) {
          continue;
        }

        pumpkins.splice(pumpkinIndex, 1);
        pumpkinRemoved = true;
        const pumpkinDamage =
          pumpkin.fireball ? 2 : 1;

        enemy.health -= pumpkinDamage;
        hitStreak += 1;
        burst(
          pumpkin.x,
          pumpkin.y,
          enemy.type === "witch"
            ? "#a855f7"
            : enemy.type === "ghost"
              ? "#dbeafe"
              : "#fb923c"
        );

        if (enemy.health > 0) {
          showFeedback(
            "WITCH HIT — ONE MORE!",
            "#e9b7ff",
            800
          );
        }

        if (enemy.health <= 0) {
          enemies.splice(enemyIndex, 1);
          defeated += 1;

          const basePoints =
            enemy.type === "witch"
              ? 200
              : enemy.type === "ghost"
                ? 150
                : 100;
          const multiplier = Math.min(
            4,
            1 + Math.floor(
              (hitStreak - 1) / 3
            )
          );

          score += basePoints * multiplier;

          if (multiplier >= 2) {
            showFeedback(
              hitStreak +
                " HIT STREAK!  ×" +
                multiplier,
              "#ffd34d",
              1150
            );
          } else {
            showFeedback(
              enemy.type === "witch"
                ? "WITCH DOWN!"
                : enemy.type === "ghost"
                  ? "GHOST BUSTED!"
                  : "GREAT SHOT!",
              "#fef08a"
            );
          }

          updateHud();

          if (defeated >= level().goal) {
            finishSuccess();
          }
        }

        break;
      }

      if (
        !pumpkinRemoved &&
        (
          pumpkin.y < -50 ||
          pumpkin.x < -50 ||
          pumpkin.x > 1250
        )
      ) {
        pumpkins.splice(pumpkinIndex, 1);

        if (hitStreak > 0) {
          hitStreak = 0;
          showFeedback(
            "MISS — STREAK RESET",
            "#ff9a76",
            1000
          );
        }
      }
    }

    for (
      let index = enemies.length - 1;
      index >= 0;
      index -= 1
    ) {
      const enemy = enemies[index];

      const horizontalReach =
        enemy.type === "witch"
          ? 92
          : enemy.radius + 29;
      const verticalReach =
        enemy.type === "witch"
          ? 88
          : enemy.radius + 48;

      const touchesPlayer =
        Math.abs(enemy.x - playerX) <
          horizontalReach &&
        Math.abs(enemy.y - 570) <
          verticalReach;

      if (touchesPlayer) {
        burst(
          enemy.x,
          enemy.y,
          "#ef4444"
        );
        enemies.splice(index, 1);
        lives -= 1;
        hitStreak = 0;

        showFeedback(
          "OUCH! CREATURE HIT YOU!",
          "#ff7777",
          1200
        );

        updateHud();

        if (lives <= 0) {
          finishFailure();
        }

        continue;
      }

      if (enemy.y > canvas.height + 85) {
        enemies.splice(index, 1);
      }
    }

    effects = effects.filter(
      (effect) => effect.life > 0
    );
  }

  function showFeedback(
    text,
    color = "#ffffff",
    duration = 900
  ) {
    feedbackText = text;
    feedbackColor = color;
    feedbackUntil =
      performance.now() + duration;
  }

  function drawGameWarnings(now) {
    const dangerEnemy = enemies.some(
      (enemy) => enemy.y >= DANGER_LINE_Y - 45
    );

    ctx.save();

    if (dangerEnemy) {
      ctx.strokeStyle =
        "rgba(255,75,75,0.95)";
      ctx.lineWidth = 6;
      ctx.setLineDash([18, 12]);
      ctx.shadowColor = "#ff3030";
      ctx.shadowBlur =
        10 + Math.sin(now / 90) * 5;

      ctx.beginPath();
      ctx.moveTo(0, DANGER_LINE_Y);
      ctx.lineTo(canvas.width, DANGER_LINE_Y);
      ctx.stroke();

      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#ff5959";
      ctx.font =
        "bold 18px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(
        "⚠ WATCH OUT!",
        18,
        DANGER_LINE_Y - 8
      );
    }

    if (
      feedbackText &&
      now < feedbackUntil
    ) {
      const remaining =
        feedbackUntil - now;
      const opacity = clamp(
        remaining / 250,
        0,
        1
      );

      ctx.globalAlpha = opacity;
      ctx.fillStyle = feedbackColor;
      ctx.shadowColor = "#10051f";
      ctx.shadowBlur = 8;
      ctx.font =
        "bold 31px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        feedbackText,
        canvas.width / 2,
        78
      );
    }

    ctx.restore();
  }

  function drawMummy(now) {
    if (
      mummyAppearanceStarted <= 0 ||
      !mummyImage.complete ||
      mummyImage.naturalWidth <= 0
    ) {
      return;
    }

    const elapsed =
      now - mummyAppearanceStarted;

    if (
      elapsed < 0 ||
      elapsed >= MUMMY_APPEARANCE_DURATION
    ) {
      return;
    }

    const fadeIn = clamp(
      elapsed / 850,
      0,
      1
    );
    const fadeOut = clamp(
      (
        MUMMY_APPEARANCE_DURATION -
        elapsed
      ) / 1100,
      0,
      1
    );
    const opacity =
      Math.min(fadeIn, fadeOut) * 0.95;
    const sway =
      Math.sin(elapsed / 420) * 4;
    const width = 145 * mummyScale;
    const height = 210 * mummyScale;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(mummyX + sway, 450);
    ctx.filter =
      "invert(1) brightness(1.8) " +
      "contrast(0.85) sepia(0.18) " +
      "saturate(0.55) " +
      "drop-shadow(0 0 18px rgba(235,245,255,1))"

    ctx.drawImage(
      mummyImage,
      -width / 2,
      -height,
      width,
      height
    );

    ctx.restore();
  }

  function drawBackground() {
    const width = canvas.width;
    const height = canvas.height;

    const sky = ctx.createLinearGradient(
      0,
      0,
      0,
      height
    );
    sky.addColorStop(0, "#11052e");
    sky.addColorStop(0.55, "#32105a");
    sky.addColorStop(1, "#70274f");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    const stars = [
      [70, 55, 2],
      [145, 105, 2],
      [235, 48, 3],
      [390, 92, 2],
      [490, 45, 2],
      [605, 108, 3],
      [715, 51, 2],
      [820, 127, 2],
      [1090, 63, 3],
      [1150, 145, 2],
    ];

    for (const star of stars) {
      ctx.beginPath();
      ctx.arc(
        star[0],
        star[1],
        star[2],
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    const moonGlow = ctx.createRadialGradient(
      966,
      105,
      25,
      966,
      105,
      100
    );
    moonGlow.addColorStop(
      0,
      "rgba(255,248,205,0.75)"
    );
    moonGlow.addColorStop(
      1,
      "rgba(255,248,205,0)"
    );

    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(966, 105, 100, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff2bc";
    ctx.beginPath();
    ctx.arc(966, 105, 64, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(150,125,105,0.2)";
    ctx.beginPath();
    ctx.arc(941, 85, 12, 0, Math.PI * 2);
    ctx.arc(984, 125, 17, 0, Math.PI * 2);
    ctx.arc(988, 77, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(29,15,52,0.55)";
    ctx.beginPath();
    ctx.ellipse(760, 152, 105, 22, 0, 0, Math.PI * 2);
    ctx.ellipse(840, 166, 125, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#100b19";
    ctx.lineWidth = 15;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(76, 405);
    ctx.lineTo(79, 238);
    ctx.lineTo(45, 186);
    ctx.moveTo(78, 292);
    ctx.lineTo(126, 239);
    ctx.lineTo(145, 197);
    ctx.moveTo(76, 330);
    ctx.lineTo(35, 287);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(1118, 407);
    ctx.lineTo(1117, 224);
    ctx.lineTo(1081, 174);
    ctx.moveTo(1117, 286);
    ctx.lineTo(1163, 229);
    ctx.lineTo(1178, 184);
    ctx.moveTo(1117, 329);
    ctx.lineTo(1071, 280);
    ctx.stroke();

    ctx.fillStyle = "#100a17";
    ctx.beginPath();
    ctx.moveTo(275, 383);
    ctx.lineTo(275, 205);
    ctx.lineTo(435, 86);
    ctx.lineTo(596, 205);
    ctx.lineTo(596, 383);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#21132d";
    ctx.fillRect(302, 198, 268, 184);

    ctx.fillStyle = "#171020";
    ctx.beginPath();
    ctx.moveTo(252, 212);
    ctx.lineTo(435, 65);
    ctx.lineTo(619, 212);
    ctx.lineTo(585, 217);
    ctx.lineTo(435, 105);
    ctx.lineTo(285, 217);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#21132d";
    ctx.fillRect(358, 133, 154, 82);

    ctx.fillStyle = "#171020";
    ctx.beginPath();
    ctx.moveTo(337, 143);
    ctx.lineTo(435, 75);
    ctx.lineTo(533, 143);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#15101c";
    ctx.fillRect(326, 112, 34, 74);

    ctx.fillStyle = "#0c0911";
    ctx.fillRect(406, 286, 61, 96);

    ctx.strokeStyle = "#6d496f";
    ctx.lineWidth = 5;
    ctx.strokeRect(406, 286, 61, 96);

    ctx.fillStyle = "#d7a839";
    ctx.beginPath();
    ctx.arc(454, 337, 4, 0, Math.PI * 2);
    ctx.fill();

    const houseWindows = [
      [322, 232, 45, 48],
      [502, 232, 45, 48],
      [390, 147, 38, 44],
      [444, 147, 38, 44],
    ];

    for (const windowData of houseWindows) {
      const x = windowData[0];
      const y = windowData[1];
      const windowWidth = windowData[2];
      const windowHeight = windowData[3];

      ctx.fillStyle = "#f4a72f";
      ctx.fillRect(
        x,
        y,
        windowWidth,
        windowHeight
      );

      const glow = ctx.createRadialGradient(
        x + windowWidth / 2,
        y + windowHeight / 2,
        2,
        x + windowWidth / 2,
        y + windowHeight / 2,
        40
      );
      glow.addColorStop(
        0,
        "rgba(255,190,55,0.45)"
      );
      glow.addColorStop(
        1,
        "rgba(255,190,55,0)"
      );

      ctx.fillStyle = glow;
      ctx.fillRect(
        x - 25,
        y - 25,
        windowWidth + 50,
        windowHeight + 50
      );

      ctx.strokeStyle = "#24142d";
      ctx.lineWidth = 5;
      ctx.strokeRect(
        x,
        y,
        windowWidth,
        windowHeight
      );

      ctx.beginPath();
      ctx.moveTo(x + windowWidth / 2, y);
      ctx.lineTo(
        x + windowWidth / 2,
        y + windowHeight
      );
      ctx.moveTo(x, y + windowHeight / 2);
      ctx.lineTo(
        x + windowWidth,
        y + windowHeight / 2
      );
      ctx.stroke();
    }

    ctx.strokeStyle = "#0d0913";
    ctx.lineWidth = 5;

    for (let x = 20; x < width; x += 47) {
      ctx.beginPath();
      ctx.moveTo(x, 350);
      ctx.lineTo(x, 430);
      ctx.stroke();

      ctx.fillStyle = "#0d0913";
      ctx.beginPath();
      ctx.moveTo(x - 7, 355);
      ctx.lineTo(x, 338);
      ctx.lineTo(x + 7, 355);
      ctx.closePath();
      ctx.fill();
    }

    ctx.strokeStyle = "#0d0913";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 371);
    ctx.lineTo(width, 371);
    ctx.moveTo(0, 411);
    ctx.lineTo(width, 411);
    ctx.stroke();

    ctx.fillStyle = "#17121e";
    ctx.fillRect(0, 418, width, 48);

    ctx.fillStyle = "#6b6571";
    ctx.fillRect(0, 443, width, 12);

    ctx.fillStyle = "#302e38";
    ctx.fillRect(0, 455, width, height - 455);

    const road = ctx.createLinearGradient(
      0,
      455,
      0,
      height
    );
    road.addColorStop(0, "#3c3945");
    road.addColorStop(1, "#22212a");
    ctx.fillStyle = road;
    ctx.fillRect(0, 455, width, height - 455);

    ctx.fillStyle = "#e9aa36";
    for (let x = 20; x < width; x += 145) {
      ctx.fillRect(x, 550, 83, 8);
    }

    ctx.font = "29px 'Segoe UI Emoji'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎃", 185, 427);
    ctx.fillText("🎃", 227, 433);
    ctx.fillText("🎃", 655, 430);
    ctx.fillText("🎃", 1030, 431);
    ctx.fillText("🪦", 725, 404);
    ctx.fillText("🪦", 780, 414);
  }

  function drawBat(enemy) {
    const flap = Math.sin(enemy.phase) * 8;

    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    ctx.fillStyle = "#59416f";
    ctx.beginPath();
    ctx.ellipse(
      0,
      2,
      11,
      17,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-7, -4);
    ctx.quadraticCurveTo(
      -29,
      -23 - flap,
      -43,
      2
    );
    ctx.quadraticCurveTo(-29, 1, -20, 18);
    ctx.quadraticCurveTo(-13, 10, -5, 6);

    ctx.moveTo(7, -4);
    ctx.quadraticCurveTo(
      29,
      -23 - flap,
      43,
      2
    );
    ctx.quadraticCurveTo(29, 1, 20, 18);
    ctx.quadraticCurveTo(13, 10, 5, 6);
    ctx.fill();

    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(-4, -3, 2, 0, Math.PI * 2);
    ctx.arc(4, -3, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawGhost(enemy) {
    const bob =
      Math.sin(enemy.phase * 0.8) * 7;
    const sway =
      Math.sin(enemy.phase * 0.45) * 4;
    const width = 90;
    const height = 105;

    ctx.save();
    ctx.translate(
      enemy.x + sway,
      enemy.y + bob
    );

    if (enemy.vx < 0) {
      ctx.scale(-1, 1);
    }

    ctx.globalAlpha = 0.9;

    if (
      ghostImage.complete &&
      ghostImage.naturalWidth > 0
    ) {
      ctx.drawImage(
        ghostImage,
        -width / 2,
        -height / 2,
        width,
        height
      );
    } else {
      ctx.fillStyle =
        "rgba(225,235,255,0.9)";
      ctx.beginPath();
      ctx.arc(0, -10, 25, Math.PI, 0);
      ctx.lineTo(25, 28);
      ctx.quadraticCurveTo(
        14,
        17,
        5,
        29
      );
      ctx.quadraticCurveTo(
        -6,
        17,
        -15,
        29
      );
      ctx.quadraticCurveTo(
        -21,
        16,
        -25,
        28
      );
      ctx.closePath();
      ctx.fill();
    }

    ctx.globalAlpha = 1;
    ctx.restore();
  }

  function drawWitch(enemy) {
    const bob = Math.sin(enemy.phase) * 4;

    ctx.save();
    ctx.translate(enemy.x, enemy.y + bob);

    if (enemy.vx < 0) {
      ctx.scale(-1, 1);
    }

    ctx.strokeStyle = "#9a6338";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-36, 20);
    ctx.lineTo(42, 20);
    ctx.stroke();

    ctx.strokeStyle = "#d6a76d";
    ctx.lineWidth = 2;
    for (let offset = -2; offset <= 2; offset += 1) {
      ctx.beginPath();
      ctx.moveTo(-35, 20);
      ctx.lineTo(-53, 11 + offset * 5);
      ctx.stroke();
    }

    ctx.fillStyle = "#5b247a";
    ctx.beginPath();
    ctx.moveTo(-19, -2);
    ctx.quadraticCurveTo(
      -27,
      18,
      -24,
      34
    );
    ctx.lineTo(24, 34);
    ctx.quadraticCurveTo(26, 14, 16, -3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#91b83f";
    ctx.beginPath();
    ctx.arc(0, -19, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(13, -18);
    ctx.lineTo(29, -13);
    ctx.lineTo(13, -8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#15101c";
    ctx.beginPath();
    ctx.moveTo(-24, -34);
    ctx.lineTo(2, -74);
    ctx.lineTo(17, -34);
    ctx.closePath();
    ctx.fill();

    ctx.fillRect(-31, -36, 59, 7);

    ctx.fillStyle = "#f5f3ff";
    ctx.beginPath();
    ctx.arc(-5, -21, 3, 0, Math.PI * 2);
    ctx.arc(5, -21, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#25152b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      1,
      -12,
      6,
      0.1,
      Math.PI - 0.1
    );
    ctx.stroke();

    ctx.restore();
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(playerX, 570);

    ctx.fillStyle = "#172033";
    ctx.fillRect(-21, 35, 17, 42);
    ctx.fillRect(4, 35, 17, 42);

    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(-27, 72, 24, 9);
    ctx.fillRect(3, 72, 24, 9);

    ctx.fillStyle = "#e26a2c";
    ctx.beginPath();
    ctx.roundRect(-34, -18, 68, 61, 18);
    ctx.fill();

    ctx.fillStyle = "#ef8b43";
    ctx.fillRect(-43, -8, 12, 45);
    ctx.fillRect(31, -8, 12, 45);

    ctx.fillStyle = "#8b4a2d";
    ctx.beginPath();
    ctx.arc(0, -39, 27, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f0b27c";
    ctx.beginPath();
    ctx.arc(0, -34, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6b3829";
    ctx.beginPath();
    ctx.arc(0, -44, 23, Math.PI, Math.PI * 2);
    ctx.lineTo(23, -34);
    ctx.quadraticCurveTo(9, -49, 0, -42);
    ctx.quadraticCurveTo(-9, -49, -23, -34);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ff9d2e";
    ctx.beginPath();
    ctx.arc(0, 11, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#44210c";
    ctx.beginPath();
    ctx.moveTo(-7, 6);
    ctx.lineTo(-2, 11);
    ctx.lineTo(-7, 16);
    ctx.moveTo(7, 6);
    ctx.lineTo(2, 11);
    ctx.lineTo(7, 16);
    ctx.fill();

    ctx.restore();
  }

  function draw(now) {
    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    drawBackground();
    drawMummy(now);
    drawGameWarnings(now);

    for (const enemy of enemies) {
      if (enemy.type === "witch") {
        drawWitch(enemy);
      } else if (enemy.type === "ghost") {
        drawGhost(enemy);
      } else {
        drawBat(enemy);
      }
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (const pumpkin of pumpkins) {
      ctx.save();
      ctx.translate(pumpkin.x, pumpkin.y);

      if (pumpkin.fireball) {
        ctx.shadowColor = "#ff3600";
        ctx.shadowBlur = 34;

        const pumpkinSpeed = Math.max(
          1,
          Math.hypot(
            pumpkin.vx,
            pumpkin.vy
          )
        );
        const tailX =
          (-pumpkin.vx / pumpkinSpeed) * 52;
        const tailY =
          (-pumpkin.vy / pumpkinSpeed) * 52;

        const fireTrail =
          ctx.createLinearGradient(
            0,
            0,
            tailX,
            tailY
          );
        fireTrail.addColorStop(
          0,
          "rgba(255,245,90,1)"
        );
        fireTrail.addColorStop(
          0.35,
          "rgba(255,105,0,0.92)"
        );
        fireTrail.addColorStop(
          1,
          "rgba(255,25,0,0)"
        );

        ctx.strokeStyle = fireTrail;
        ctx.lineCap = "round";
        ctx.lineWidth = 19;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.strokeStyle =
          "rgba(255,235,85,0.92)";
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(
          tailX * 0.72,
          tailY * 0.72
        );
        ctx.stroke();

        const flameGlow =
          ctx.createRadialGradient(
            0,
            0,
            3,
            0,
            0,
            36
          );
        flameGlow.addColorStop(
          0,
          "rgba(255,245,100,0.92)"
        );
        flameGlow.addColorStop(
          0.45,
          "rgba(255,105,15,0.68)"
        );
        flameGlow.addColorStop(
          1,
          "rgba(255,40,0,0)"
        );

        ctx.fillStyle = flameGlow;
        ctx.beginPath();
        ctx.arc(0, 0, 37, 0, Math.PI * 2);

        ctx.fillStyle =
          "rgba(255,245,150,0.95)";
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fill();
      }

      ctx.rotate(pumpkin.spin);
      ctx.font =
        pumpkin.fireball
          ? "40px 'Segoe UI Emoji'"
          : "29px 'Segoe UI Emoji'";
      ctx.fillText("🎃", 0, 0);
      ctx.restore();
    }

    for (const effect of effects) {
      ctx.globalAlpha = clamp(
        effect.life / 0.45,
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
    }

    ctx.globalAlpha = 1;
    drawPlayer();
  }

  function frame(now) {
    if (!lastTime) lastTime = now;
    const dt = Math.min((now - lastTime) / 1000, 0.04);
    lastTime = now;

    update(dt, now);
    draw(now);
    requestAnimationFrame(frame);
  }

  function resetLevel() {
    defeated = 0;
    lives = level().lives;
    enemies = [];
    pumpkins = [];
    effects = [];
    playerX = 600;
    hitStreak = 0;
    feedbackText = "";
    feedbackUntil = 0;
    mummyAppearanceStarted = 0;
    mummyNextAppearance =
      performance.now() + 500;
    running = false;

    startPanel.hidden = false;
    statusText.textContent =
      "Level " +
      (levelIndex + 1) +
      ": " +
      level().name +
      " — " +
      level().intro;
    startButton.textContent =
      "Start Level " +
      (levelIndex + 1) +
      ": " +
      level().name;
    updateHud();
  }

  function startLevel() {
    defeated = 0;
    lives = level().lives;
    enemies = [];
    pumpkins = [];
    effects = [];
    hitStreak = 0;
    feedbackText = "";
    feedbackUntil = 0;
    lastSpawn = performance.now();
    lastThrow = 0;
    running = true;
    startPanel.hidden = true;
    updateHud();
  }

  function nextLevel() {
    levelIndex = Math.min(levelIndex + 1, LEVELS.length - 1);
    resetLevel();
  }

  function retryLevel() {
    resetLevel();
    startLevel();
  }

  function playAgain() {
    levelIndex = 0;
    score = 0;
    resetLevel();
  }

  function pointerDown(event) {
    if (event.pointerType === "touch") return;

    const point = pointerPosition(event);
    pointerId = event.pointerId;
    pressX = point.x;
    pressY = point.y;
    pressTime = performance.now();
    dragging = dragRequired;

    if (!dragRequired) movePlayer(event);

    if (guide) {
      guide.updateFromPointerEvent(event);
      guide.setPressed(true);
    }
  }

  function pointerMove(event) {
    if (event.pointerType === "touch") return;

    if (guide) guide.updateFromPointerEvent(event);
    if (!running) return;

    if (dragRequired && (!dragging || event.pointerId !== pointerId)) {
      return;
    }

    movePlayer(event);
  }

  function pointerEnd(event) {
    if (event.pointerType === "touch") return;
    if (guide) guide.setPressed(false);
    if (pointerId !== null && event.pointerId !== pointerId) return;

    const point = pointerPosition(event);
    const distance = Math.hypot(
      point.x - pressX,
      point.y - pressY
    );
    const duration = performance.now() - pressTime;

    dragging = false;
    pointerId = null;

    if (clickToThrow && distance <= 14 && duration <= 420) {
      throwPumpkin(point.x, point.y);
    }
  }

  canvas.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerup", pointerEnd);
  window.addEventListener("pointercancel", pointerEnd);
  startButton.addEventListener("click", () => {
    const completedCurrentLevel =
      defeated >= level().goal;

    if (!completedCurrentLevel) {
      startLevel();
      return;
    }

    if (levelIndex >= LEVELS.length - 1) {
      playAgain();
      return;
    }

    nextLevel();
  });

  soundButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem(SOUND_KEY, String(soundEnabled));
    updateSound();
  });

  if (window.LevelResultController) {
    resultController = new window.LevelResultController({
      host: arena,
      pauseGame: () => {
        running = false;
      },
      onNextLevel: nextLevel,
      onRetry: retryLevel,
      onPlayAgain: playAgain,
      onHome: () => {
        window.location.href = "../../index.html";
      },
      canPlaySound: () => soundEnabled,
    });
  }

  void loadSettings().then(resetLevel);
  requestAnimationFrame(frame);
})();




