const scene = document.getElementById("scene");
const leftHand = document.getElementById("leftHand");
const rightHand = document.getElementById("rightHand");
const mazeBoard = document.getElementById("mazeBoard");
const mazeStart = document.getElementById("mazeStart");
const mazeFinish = document.getElementById("mazeFinish");
const mazeToken = document.getElementById("mazeToken");
const mazeStatus = document.getElementById("mazeStatus");
const mazeLevelBadge = document.getElementById("mazeLevelBadge");
const mazeStartAudio = document.getElementById("mazeStartAudio");
const mazeHitAudio = document.getElementById("mazeHitAudio");
const mazeFinishAudio = document.getElementById("mazeFinishAudio");
const mazeGhostAudio = document.getElementById("mazeGhostAudio");

const LAYOUT = {
  scene: { width: 626, height: 437 },
  trackpadScale: 0.84,
  // Left hand remains fixed and only animates on click.
  leftStart: { x: -34, y: 178 },
  rightStart: { x: 230, y: 158 },
};

let isPressed = false;
let mazeActive = false;
let mazeCompleted = false;
let hitCount = 0;
let collisionLock = false;
let audioPrimed = false;
let currentLevelIndex = 0;
let mazeGhostLevelsEnabled = [true, true, true, true, true, true];
let mazeGhostLevelsPerLevelCounts = [1, 1, 1, 1, 1, 1];
let mazeGhosts = [];
let tokenX = 0;
let tokenY = 0;
let cursorWasOutsideBoard = false;

const GHOST_LEVEL_ENABLED_KEYS = [
  "mazeGhostLevel1Enabled",
  "mazeGhostLevel2Enabled",
  "mazeGhostLevel3Enabled",
  "mazeGhostLevel4Enabled",
  "mazeGhostLevel5Enabled",
  "mazeGhostLevel6Enabled",
];
const GHOST_LEVEL_COUNT_KEYS = [
  "mazeGhostLevel1Count",
  "mazeGhostLevel2Count",
  "mazeGhostLevel3Count",
  "mazeGhostLevel4Count",
  "mazeGhostLevel5Count",
  "mazeGhostLevel6Count",
];
const GHOST_COLLISION_RADIUS = 16;
const GHOST_IMAGE_PATH = "images/ghost.png";
const SETTINGS_API_PATH = "/api/settings";

const MAZE_LEVELS = [
  {
    name: "Level 1",
    bars: [
      { x: 21, w: 5, gapY: 61, gapH: 28 },
      { x: 40, w: 5, gapY: 14, gapH: 28 },
      { x: 59, w: 5, gapY: 57, gapH: 28 },
    ],
  },
  {
    name: "Level 2",
    bars: [
      { x: 16, w: 5, gapY: 58, gapH: 26 },
      { x: 31, w: 5, gapY: 17, gapH: 26 },
      { x: 46, w: 5, gapY: 58, gapH: 26 },
      { x: 61, w: 5, gapY: 19, gapH: 26 },
      { x: 76, w: 5, gapY: 57, gapH: 26 },
    ],
  },
  {
    name: "Level 3",
    bars: [
      { x: 15, w: 4.5, gapY: 57, gapH: 24 },
      { x: 27, w: 4.5, gapY: 19, gapH: 24 },
      { x: 39, w: 4.5, gapY: 58, gapH: 24 },
      { x: 51, w: 4.5, gapY: 21, gapH: 24 },
      { x: 63, w: 4.5, gapY: 58, gapH: 24 },
      { x: 75, w: 4.5, gapY: 23, gapH: 24 },
    ],
  },
  {
    name: "Level 4",
    bars: [
      { x: 14, w: 4.5, gapY: 56, gapH: 22 },
      { x: 24, w: 4.5, gapY: 21, gapH: 22 },
      { x: 34, w: 4.5, gapY: 56, gapH: 22 },
      { x: 44, w: 4.5, gapY: 21, gapH: 22 },
      { x: 54, w: 4.5, gapY: 56, gapH: 22 },
      { x: 64, w: 4.5, gapY: 21, gapH: 22 },
      { x: 74, w: 4.5, gapY: 56, gapH: 22 },
    ],
  },
  {
    name: "Level 5",
    bars: [
      { x: 12, w: 4, gapY: 54, gapH: 20 },
      { x: 21, w: 4, gapY: 23, gapH: 20 },
      { x: 30, w: 4, gapY: 55, gapH: 20 },
      { x: 39, w: 4, gapY: 23, gapH: 20 },
      { x: 48, w: 4, gapY: 55, gapH: 20 },
      { x: 57, w: 4, gapY: 23, gapH: 20 },
      { x: 66, w: 4, gapY: 55, gapH: 20 },
      { x: 75, w: 4, gapY: 23, gapH: 20 },
    ],
  },
  {
    name: "Level 6",
    bars: [
      { x: 11, w: 3.6, gapY: 52, gapH: 18 },
      { x: 19, w: 3.6, gapY: 24, gapH: 18 },
      { x: 27, w: 3.6, gapY: 52, gapH: 18 },
      { x: 35, w: 3.6, gapY: 24, gapH: 18 },
      { x: 43, w: 3.6, gapY: 52, gapH: 18 },
      { x: 51, w: 3.6, gapY: 24, gapH: 18 },
      { x: 59, w: 3.6, gapY: 52, gapH: 18 },
      { x: 67, w: 3.6, gapY: 24, gapH: 18 },
      { x: 75, w: 3.6, gapY: 52, gapH: 18 },
      { x: 83, w: 3.6, gapY: 24, gapH: 18 },
    ],
  },
];

function getCurrentLevel() {
  return MAZE_LEVELS[currentLevelIndex];
}

function getCurrentLevelWalls() {
  const walls = [];
  getCurrentLevel().bars.forEach((bar) => {
    const topH = bar.gapY;
    const bottomY = bar.gapY + bar.gapH;
    const bottomH = Math.max(100 - bottomY, 0);

    if (topH > 0) {
      walls.push({ x: bar.x, y: 0, w: bar.w, h: topH });
    }

    if (bottomH > 0) {
      walls.push({ x: bar.x, y: bottomY, w: bar.w, h: bottomH });
    }
  });
  return walls;
}

function updateLevelBadge() {
  if (mazeLevelBadge) {
    mazeLevelBadge.textContent = `Level ${currentLevelIndex + 1}/${MAZE_LEVELS.length}`;
  }
}

function parseGhostCount(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return 1;
  }

  return Math.min(6, Math.max(0, parsed));
}

function parseTaskEnabled(value, fallback = true) {
  if (value === null || typeof value === "undefined") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value) !== "false";
}

function parseGhostLevelsEnabled(value, fallback = true) {
  if (Array.isArray(value)) {
    const normalized = value.slice(0, 6).map((item) => parseTaskEnabled(item, fallback));
    while (normalized.length < 6) {
      normalized.push(fallback);
    }
    return normalized;
  }

  if (value && typeof value === "object") {
    return [1, 2, 3, 4, 5, 6].map((level) => parseTaskEnabled(value[`level${level}`], fallback));
  }

  return [fallback, fallback, fallback, fallback, fallback, fallback];
}

function parseGhostLevelCounts(value, fallback = 1) {
  if (Array.isArray(value)) {
    const normalized = value.slice(0, 6).map((item) => parseGhostCount(item));
    while (normalized.length < 6) {
      normalized.push(fallback);
    }
    return normalized;
  }

  if (value && typeof value === "object") {
    return [1, 2, 3, 4, 5, 6].map((level) => parseGhostCount(value[`level${level}`]));
  }

  return [fallback, fallback, fallback, fallback, fallback, fallback];
}

function saveGhostSettingsLocally() {
  GHOST_LEVEL_ENABLED_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(mazeGhostLevelsEnabled[index]));
  });
  GHOST_LEVEL_COUNT_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(mazeGhostLevelsPerLevelCounts[index]));
  });
}

function loadGhostSettingsFromLocalStorage() {
  mazeGhostLevelsEnabled = GHOST_LEVEL_ENABLED_KEYS.map((key) => parseTaskEnabled(localStorage.getItem(key), true));
  mazeGhostLevelsPerLevelCounts = GHOST_LEVEL_COUNT_KEYS.map((key) => parseGhostCount(localStorage.getItem(key)));
}

function isGhostEnabledForCurrentLevel() {
  const levelCount = mazeGhostLevelsPerLevelCounts[currentLevelIndex] || 0;
  return Boolean(mazeGhostLevelsEnabled[currentLevelIndex]) && levelCount > 0;
}

async function loadGhostSettingsShared() {
  loadGhostSettingsFromLocalStorage();
  let shouldRebuild = false;

  try {
    const response = await fetch(SETTINGS_API_PATH, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      const nextGhostLevelsEnabled = parseGhostLevelsEnabled(data.mazeGhostLevelsEnabled, true);
      const nextGhostLevelCounts = parseGhostLevelCounts(data.mazeGhostLevelsPerLevelCounts, 1);
      const hasLevelsChange = nextGhostLevelsEnabled.some((value, index) => value !== mazeGhostLevelsEnabled[index]);
      const hasCountsChange = nextGhostLevelCounts.some(
        (value, index) => value !== mazeGhostLevelsPerLevelCounts[index]
      );

      if (hasLevelsChange || hasCountsChange) {
        mazeGhostLevelsEnabled = nextGhostLevelsEnabled;
        mazeGhostLevelsPerLevelCounts = nextGhostLevelCounts;
        saveGhostSettingsLocally();
        shouldRebuild = true;
      }
    }
  } catch {
    // Keep local fallback when API is unavailable.
  }

  if (shouldRebuild) {
    buildMazeGhosts();
  }
  updateGhostAudioState();
}

async function refreshGhostSettingsLive() {
  await loadGhostSettingsShared();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function playSound(audioEl) {
  if (!audioEl) {
    return;
  }

  try {
    audioEl.currentTime = 0;
    const result = audioEl.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {
        // Ignore autoplay-related rejections.
      });
    }
  } catch {
    // Ignore playback errors and keep interaction running.
  }
}

function startGhostLoopAudio() {
  if (!mazeGhostAudio) {
    return;
  }

  try {
    mazeGhostAudio.currentTime = 0;
    const result = mazeGhostAudio.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {
        // Ignore autoplay-related rejections.
      });
    }
  } catch {
    // Ignore playback errors and keep interaction running.
  }
}

function stopGhostLoopAudio() {
  if (!mazeGhostAudio) {
    return;
  }

  try {
    mazeGhostAudio.pause();
    mazeGhostAudio.currentTime = 0;
  } catch {
    // Ignore playback errors and keep interaction running.
  }
}

function updateGhostAudioState() {
  const hasActiveGhost = mazeGhosts.some((ghost) => ghost.active);
  const shouldPlay = mazeActive && isGhostEnabledForCurrentLevel() && hasActiveGhost;

  if (shouldPlay) {
    startGhostLoopAudio();
    return;
  }

  stopGhostLoopAudio();
}

function primeAudio() {
  if (audioPrimed) {
    return;
  }

  audioPrimed = true;
  [mazeStartAudio, mazeHitAudio, mazeFinishAudio, mazeGhostAudio].forEach((audioEl) => {
    if (!audioEl) {
      return;
    }

    try {
      audioEl.muted = true;
      const result = audioEl.play();

      if (result && typeof result.then === "function") {
        result
          .then(() => {
            audioEl.pause();
            audioEl.currentTime = 0;
            audioEl.muted = false;
          })
          .catch(() => {
            audioEl.muted = false;
          });
      } else {
        audioEl.pause();
        audioEl.currentTime = 0;
        audioEl.muted = false;
      }
    } catch {
      audioEl.muted = false;
    }
  });
}

function percentRectToPx(rect, bounds) {
  return {
    x: (rect.x / 100) * bounds.width,
    y: (rect.y / 100) * bounds.height,
    w: (rect.w / 100) * bounds.width,
    h: (rect.h / 100) * bounds.height,
  };
}

function buildMazeWalls() {
  const existing = mazeBoard.querySelectorAll(".maze-wall");
  existing.forEach((node) => node.remove());

  getCurrentLevelWalls().forEach((wall) => {
    const node = document.createElement("div");
    node.className = "maze-wall";
    node.style.left = `${wall.x}%`;
    node.style.top = `${wall.y}%`;
    node.style.width = `${wall.w}%`;
    node.style.height = `${wall.h}%`;
    mazeBoard.appendChild(node);
  });
}

function clearMazeGhosts() {
  mazeGhosts.forEach((ghost) => ghost.node.remove());
  mazeGhosts = [];
}

function buildGhostPathForLevel() {
  const bars = getCurrentLevel().bars;
  if (!bars.length) {
    return [
      { x: 6, y: 50 },
      { x: 94, y: 50 },
    ];
  }

  const points = [];
  const firstGapCenterY = bars[0].gapY + bars[0].gapH / 2;
  const lastBar = bars[bars.length - 1];
  const lastGapCenterY = lastBar.gapY + lastBar.gapH / 2;

  points.push({ x: 4, y: firstGapCenterY });
  bars.forEach((bar) => {
    points.push({
      x: bar.x + bar.w / 2,
      y: bar.gapY + bar.gapH / 2,
    });
  });
  points.push({ x: 96, y: lastGapCenterY });

  return points;
}

function buildGhostPathMetrics(points) {
  const segments = [];
  let totalLength = 0;

  for (let index = 0; index < points.length - 1; index += 1) {
    const from = points[index];
    const to = points[index + 1];
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.hypot(dx, dy);

    if (length <= 0) {
      continue;
    }

    segments.push({
      from,
      to,
      length,
      startDistance: totalLength,
    });
    totalLength += length;
  }

  return {
    segments,
    totalLength: Math.max(totalLength, 1),
  };
}

function getGhostPointAtProgress(ghost, progress) {
  const clamped = clamp(progress, 0, 1);
  const targetDistance = clamped * ghost.pathLength;

  for (const segment of ghost.pathSegments) {
    const segmentEnd = segment.startDistance + segment.length;
    if (targetDistance > segmentEnd) {
      continue;
    }

    const ratio = (targetDistance - segment.startDistance) / segment.length;
    return {
      x: segment.from.x + (segment.to.x - segment.from.x) * ratio,
      y: segment.from.y + (segment.to.y - segment.from.y) * ratio,
    };
  }

  const lastSegment = ghost.pathSegments[ghost.pathSegments.length - 1];
  if (!lastSegment) {
    return { x: 50, y: 50 };
  }

  return { x: lastSegment.to.x, y: lastSegment.to.y };
}

function buildMazeGhosts() {
  clearMazeGhosts();

  if (!isGhostEnabledForCurrentLevel()) {
    return;
  }

  const pathPoints = buildGhostPathForLevel();
  const pathMetrics = buildGhostPathMetrics(pathPoints);
  const ghostCount = Math.max(0, mazeGhostLevelsPerLevelCounts[currentLevelIndex] || 0);

  for (let index = 0; index < ghostCount; index += 1) {
    const node = document.createElement("img");
    node.className = "maze-ghost";
    node.src = GHOST_IMAGE_PATH;
    node.alt = "";
    node.setAttribute("aria-hidden", "true");
    node.draggable = false;
    mazeBoard.appendChild(node);

    const phaseOffset = ghostCount > 1 ? (index / ghostCount) * 2 : 0;

    mazeGhosts.push({
      node,
      pathSegments: pathMetrics.segments,
      pathLength: pathMetrics.totalLength,
      speed: 0.00016 + Math.random() * 0.00005,
      phase: phaseOffset,
      yPx: 0,
      active: true,
    });
  }

  updateGhostAudioState();
}

function setGhostsVisible(visible) {
  mazeGhosts.forEach((ghost) => {
    if (!ghost.active || !visible) {
      ghost.node.classList.remove("active");
      return;
    }

    ghost.node.classList.add("active");
  });

  updateGhostAudioState();
}

function updateGhostAnimation(timeMs) {
  const boardRect = mazeBoard.getBoundingClientRect();
  const shouldShow = mazeActive && isGhostEnabledForCurrentLevel();

  mazeGhosts.forEach((ghost) => {
    if (!ghost.active || !shouldShow) {
      ghost.node.classList.remove("active");
      return;
    }

    const cycle = (timeMs * ghost.speed + ghost.phase) % 2;
    const pathProgress = cycle <= 1 ? cycle : 2 - cycle;
    const point = getGhostPointAtProgress(ghost, pathProgress);
    const xPx = (point.x / 100) * boardRect.width;
    const yPx = (point.y / 100) * boardRect.height;

    ghost.yPx = yPx;
    ghost.node.style.left = `${xPx}px`;
    ghost.node.style.top = `${yPx}px`;
    ghost.node.classList.add("active");
  });

  window.requestAnimationFrame(updateGhostAnimation);
}

function getBlockRectPx(blockEl) {
  const boardRect = mazeBoard.getBoundingClientRect();
  const rect = blockEl.getBoundingClientRect();
  return {
    x: rect.left - boardRect.left,
    y: rect.top - boardRect.top,
    w: rect.width,
    h: rect.height,
  };
}

function setMazeTokenPosition(x, y) {
  tokenX = x;
  tokenY = y;
  mazeToken.style.left = `${x}px`;
  mazeToken.style.top = `${y}px`;
}

function moveTokenToward(targetX, targetY, boardRect, preferCollisionLock = false) {
  const startX = tokenX;
  const startY = tokenY;
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.hypot(dx, dy);

  if (distance <= 0.001) {
    return { x: tokenX, y: tokenY, blockedByWall: false };
  }

  const stepSize = 3;
  const steps = Math.max(1, Math.ceil(distance / stepSize));

  for (let stepIndex = 1; stepIndex <= steps; stepIndex += 1) {
    const t = stepIndex / steps;
    const sampleX = startX + dx * t;
    const sampleY = startY + dy * t;

    if (checkMazeCollision(sampleX, sampleY)) {
      if (!collisionLock || preferCollisionLock) {
        collisionLock = true;
        registerMazeHit("hit");
      }

      setMazeTokenPosition(startX + dx * ((stepIndex - 1) / steps), startY + dy * ((stepIndex - 1) / steps));
      return { x: tokenX, y: tokenY, blockedByWall: true };
    }
  }

  collisionLock = false;
  setMazeTokenPosition(clamp(targetX, 0, boardRect.width), clamp(targetY, 0, boardRect.height));
  return { x: tokenX, y: tokenY, blockedByWall: false };
}

function setMazeStatus(text) {
  mazeStatus.textContent = text;
}

function startMaze() {
  const startRect = getBlockRectPx(mazeStart);
  const x = startRect.x + startRect.w / 2;
  const y = startRect.y + startRect.h / 2;
  mazeActive = true;
  mazeCompleted = false;
  hitCount = 0;
  collisionLock = false;
  cursorWasOutsideBoard = false;
  mazeStart.classList.add("is-lit");
  mazeFinish.classList.remove("is-lit");
  mazeToken.classList.add("active");
  setMazeTokenPosition(x, y);
  mazeGhosts.forEach((ghost) => {
    ghost.active = true;
  });
  setGhostsVisible(true);
  updateGhostAudioState();
  setMazeStatus(`${getCurrentLevel().name} started. Hits: 0/3. Reach FINISH.`);
  playSound(mazeStartAudio);
}

function stopMaze(message) {
  mazeActive = false;
  mazeToken.classList.remove("active");
  updateGhostAudioState();
  setMazeStatus(message);
}

function resetMazeAfterThreeHits() {
  mazeActive = false;
  mazeCompleted = false;
  hitCount = 0;
  collisionLock = false;
  cursorWasOutsideBoard = false;
  mazeStart.classList.remove("is-lit");
  mazeFinish.classList.remove("is-lit");
  mazeToken.classList.remove("active");
  setGhostsVisible(false);
  updateGhostAudioState();
  setMazeStatus(`${getCurrentLevel().name}: 3 hits. Click START to retry level.`);
}

function finishMaze() {
  const finishedLevel = getCurrentLevel().name;
  const finishedHits = hitCount;
  mazeActive = false;
  mazeStart.classList.remove("is-lit");
  mazeFinish.classList.add("is-lit");
  playSound(mazeFinishAudio);
  updateGhostAudioState();

  if (currentLevelIndex < MAZE_LEVELS.length - 1) {
    currentLevelIndex += 1;
    updateLevelBadge();
    buildMazeWalls();
    buildMazeGhosts();
    mazeCompleted = false;
    setMazeStatus(`${finishedLevel} complete (${finishedHits} hit${finishedHits === 1 ? "" : "s"}). Click START for ${getCurrentLevel().name}.`);
    mazeFinish.classList.remove("is-lit");
    mazeToken.classList.remove("active");
    setGhostsVisible(false);
    updateGhostAudioState();
    return;
  }

  mazeCompleted = true;
  updateLevelBadge();
  updateGhostAudioState();
  setMazeStatus(`All 6 levels complete. Final level hits: ${finishedHits}.`);
}

function circleHitsRect(cx, cy, radius, rect) {
  const nearestX = clamp(cx, rect.x, rect.x + rect.w);
  const nearestY = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy <= radius * radius;
}

function checkMazeCollision(x, y) {
  const boardRect = mazeBoard.getBoundingClientRect();
  const radius = 8;
  const wallsPx = getCurrentLevelWalls().map((wall) => percentRectToPx(wall, boardRect));
  return wallsPx.some((wall) => circleHitsRect(x, y, radius, wall));
}

function checkGhostCollision(x, y) {
  if (!mazeActive || !isGhostEnabledForCurrentLevel()) {
    return false;
  }

  const hitRadiusSq = GHOST_COLLISION_RADIUS * GHOST_COLLISION_RADIUS;

  for (const ghost of mazeGhosts) {
    if (!ghost.active) {
      continue;
    }

    const ghostX = Number.parseFloat(ghost.node.style.left);
    if (!Number.isFinite(ghostX)) {
      continue;
    }

    const dx = x - ghostX;
    const dy = y - ghost.yPx;
    if (dx * dx + dy * dy <= hitRadiusSq) {
      ghost.active = false;
      ghost.node.classList.remove("active");
      updateGhostAudioState();
      return true;
    }
  }

  return false;
}

function registerMazeHit(message) {
  hitCount += 1;
  playSound(mazeHitAudio);
  mazeBoard.classList.add("hit-flash");
  setTimeout(() => mazeBoard.classList.remove("hit-flash"), 140);

  if (hitCount >= 3) {
    resetMazeAfterThreeHits();
    return true;
  }

  setMazeStatus(`${getCurrentLevel().name} ${message} ${hitCount}/3. Keep going.`);
  return false;
}

function inRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function updateMazeFromPointer(event) {
  const boardRect = mazeBoard.getBoundingClientRect();
  const rawX = event.clientX - boardRect.left;
  const rawY = event.clientY - boardRect.top;
  const isInsideBoard = rawX >= 0 && rawX <= boardRect.width && rawY >= 0 && rawY <= boardRect.height;

  if (!isInsideBoard) {
    cursorWasOutsideBoard = mazeActive ? true : cursorWasOutsideBoard;
    return;
  }

  const x = clamp(rawX, 0, boardRect.width);
  const y = clamp(rawY, 0, boardRect.height);

  const startRect = getBlockRectPx(mazeStart);
  const finishRect = getBlockRectPx(mazeFinish);

  if (!mazeActive) {
    return;
  }

  const movement = moveTokenToward(x, y, boardRect, cursorWasOutsideBoard);
  cursorWasOutsideBoard = false;

  if (!mazeActive) {
    return;
  }

  if (checkGhostCollision(tokenX, tokenY)) {
    if (registerMazeHit("ghost hit")) {
      return;
    }
  }

  if (!movement.blockedByWall && inRect(tokenX, tokenY, finishRect)) {
    finishMaze();
  }
}

function applyLeftPosition(x, y) {
  leftHand.style.left = `${(x / LAYOUT.scene.width) * 100}%`;
  leftHand.style.top = `${(y / LAYOUT.scene.height) * 100}%`;
}

function applyRightPosition(x, y) {
  rightHand.style.left = `${(x / LAYOUT.scene.width) * 100}%`;
  rightHand.style.top = `${(y / LAYOUT.scene.height) * 100}%`;
}

function getTrackpadArea() {
  const scale = LAYOUT.trackpadScale;
  const width = LAYOUT.scene.width * scale;
  const height = LAYOUT.scene.height * scale;
  return {
    x: (LAYOUT.scene.width - width) / 2,
    y: (LAYOUT.scene.height - height) / 2,
    width,
    height,
  };
}

function getRightHandRange() {
  const area = getTrackpadArea();
  return {
    // Looser lane with more upward travel while staying right of the left hand.
    minX: area.x + area.width * 0.20,
    maxX: area.x + area.width * 0.62,
    minY: area.y + area.height * 0.10,
    maxY: area.y + area.height * 0.80,
  };
}

function mapPointerToRightPosition(pointerX, pointerY) {
  const a = getTrackpadArea();
  const r = getRightHandRange();

  const nx = clamp((pointerX - a.x) / a.width, 0, 1);
  const ny = clamp((pointerY - a.y) / a.height, 0, 1);

  return {
    x: r.minX + nx * (r.maxX - r.minX),
    y: r.minY + ny * (r.maxY - r.minY),
  };
}

function pointerToViewportNormalized(event) {
  const width = Math.max(window.innerWidth || 0, 1);
  const height = Math.max(window.innerHeight || 0, 1);
  return {
    x: clamp(event.clientX / width, 0, 1),
    y: clamp(event.clientY / height, 0, 1),
  };
}

function updateRightFromPointer(event) {
  const p = pointerToViewportNormalized(event);
  const a = getTrackpadArea();
  const scenePos = {
    x: a.x + p.x * a.width,
    y: a.y + p.y * a.height,
  };
  const pos = mapPointerToRightPosition(scenePos.x, scenePos.y);
  applyRightPosition(pos.x, pos.y);
}

function setPressedState(pressed) {
  isPressed = pressed;
  leftHand.classList.toggle("pressed", pressed);
  scene.classList.toggle("is-pressed", pressed);
}

applyLeftPosition(LAYOUT.leftStart.x, LAYOUT.leftStart.y);
applyRightPosition(LAYOUT.rightStart.x, LAYOUT.rightStart.y);
updateLevelBadge();
buildMazeWalls();
loadGhostSettingsFromLocalStorage();
buildMazeGhosts();
loadGhostSettingsShared();
window.requestAnimationFrame(updateGhostAnimation);
window.setInterval(() => {
  refreshGhostSettingsLive();
}, 1500);

document.addEventListener(
  "pointerdown",
  () => {
    primeAudio();
  },
  { once: true }
);

document.addEventListener(
  "keydown",
  () => {
    primeAudio();
  },
  { once: true }
);

document.addEventListener("pointermove", (event) => {
  updateRightFromPointer(event);
  updateMazeFromPointer(event);
});

document.addEventListener("pointerdown", (event) => {
  setPressedState(true);
  updateRightFromPointer(event);
});

document.addEventListener("pointerup", () => {
  setPressedState(false);
});

document.addEventListener("pointercancel", () => {
  setPressedState(false);
});

mazeStart.addEventListener("click", () => {
  primeAudio();
  startMaze();
});

mazeStart.addEventListener("pointerdown", () => {
  primeAudio();
});

mazeStart.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    primeAudio();
    startMaze();
  }
});

window.addEventListener("resize", () => {
  buildMazeWalls();
  buildMazeGhosts();
});
