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

  const LEVEL_DURATION_MS = 120000;
  const GROUND_Y = 560;

  let running = false;
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
      LEVEL_DURATION_MS - elapsedMs
    );

    progressFill.style.width =
      `${clamp(
        elapsedMs / LEVEL_DURATION_MS,
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
      elapsedMs / LEVEL_DURATION_MS,
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
      speed: 235 + progress * 145,
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

  function hitPlayer(now) {
    if (now < invulnerableUntil) {
      return;
    }

    hearts -= 1;
    invulnerableUntil = now + 1800;
    createImpact(player.x, player.y, "#ef4444");
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
      statusText.textContent =
        "Farmyard Dash complete! Chicken Little made it safely!";
      startButton.textContent = "Play Level 1 Again";
    } else {
      statusText.textContent =
        "The falling acorns caught Chicken Little. Try again!";
      startButton.textContent = "Try Again";
    }
  }

  function resetLevel() {
    hearts = 3;
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
    resetLevel();
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
      (175 + elapsedMs / LEVEL_DURATION_MS * 60);

    player.x +=
      (player.targetX - player.x) * 0.17;
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

      const dx =
        (acorn.x - player.x) / 43;
      const dy =
        (
          acorn.y -
          (player.y - 65 - jumpHeight)
        ) / 52;

      if (dx * dx + dy * dy <= 1) {
        acorns.splice(index, 1);
        hitPlayer(now);
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

    if (elapsedMs >= LEVEL_DURATION_MS) {
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

  function drawBackground() {
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

    ctx.scale(depthScale, depthScale);

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

    dragging = true;
    pointerId = event.pointerId;
    pointerPressX = point.x;
    pointerPressY = point.y;
    pointerPressTime = performance.now();
    pointerMoved = false;
    pressStartedOnChicken =
      chickenDx * chickenDx +
        chickenDy * chickenDy <=
      1;

    canvas.classList.add("is-dragging");
    canvas.setPointerCapture(event.pointerId);
    setTargetFromPointer(event);

    if (guide) {
      guide.updateFromPointerEvent(event);
      guide.setPressed(true);
    }
  }

  function pointerMove(event) {
    if (guide) {
      guide.updateFromPointerEvent(event);
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

  resetLevel();
  window.requestAnimationFrame(frame);
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

