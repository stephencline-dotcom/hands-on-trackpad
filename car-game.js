const scene = document.getElementById("scene");
const leftHand = document.getElementById("leftHand");
const rightHand = document.getElementById("rightHand");
const carBoard = document.getElementById("carBoard");
const carStart = document.getElementById("carStart");
const playerCar = document.getElementById("playerCar");
const carObstacles = document.getElementById("carObstacles");
const carLevelBadge = document.getElementById("carLevelBadge");
const carHitsBadge = document.getElementById("carHitsBadge");
const carDodgedBadge = document.getElementById("carDodgedBadge");
const carToast = document.getElementById("carToast");

const LAYOUT = {
  scene: { width: 626, height: 437 },
  trackpadScale: 0.84,
  leftStart: { x: -34, y: 178 },
  rightStart: { x: 230, y: 158 },
};

const SETTINGS_API_PATH = "/api/settings";
const CAR_LEVEL_ENABLED_KEYS = [
  "carGameLevel1Enabled",
  "carGameLevel2Enabled",
  "carGameLevel3Enabled",
  "carGameLevel4Enabled",
  "carGameLevel5Enabled",
  "carGameLevel6Enabled",
];

const LEVELS = [
  { spawnMs: 1250, speedPxPerSec: 120, targetDodges: 10 },
  { spawnMs: 1080, speedPxPerSec: 140, targetDodges: 12 },
  { spawnMs: 940, speedPxPerSec: 160, targetDodges: 14 },
  { spawnMs: 820, speedPxPerSec: 180, targetDodges: 16 },
  { spawnMs: 700, speedPxPerSec: 205, targetDodges: 18 },
  { spawnMs: 580, speedPxPerSec: 230, targetDodges: 20 },
];

const MAX_HITS = 3;
const LANE_POSITIONS = [0.26, 0.5, 0.74];

let isPressed = false;
let carLevelsEnabled = [true, true, true, true, true, true];
let currentLevelIndex = 0;
let hits = 0;
let dodged = 0;
let playerLane = 1;
let obstacles = [];
let nextObstacleId = 1;
let active = false;
let spawnTimerMs = 0;
let frameHandle = null;
let previousFrameTime = 0;
let toastTimer = null;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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

function parseCarLevelEnabled(value, fallback = true) {
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

function loadCarLevelSettingsFromLocalStorage() {
  carLevelsEnabled = CAR_LEVEL_ENABLED_KEYS.map((key) => parseTaskEnabled(localStorage.getItem(key), true));
}

function saveCarLevelSettingsLocally() {
  CAR_LEVEL_ENABLED_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carLevelsEnabled[index]));
  });
}

async function loadCarLevelSettingsShared() {
  loadCarLevelSettingsFromLocalStorage();

  try {
    const response = await fetch(SETTINGS_API_PATH, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      const nextEnabled = parseCarLevelEnabled(data.carGameLevelsEnabled, true);
      const hasChange = nextEnabled.some((value, index) => value !== carLevelsEnabled[index]);
      if (hasChange) {
        carLevelsEnabled = nextEnabled;
        saveCarLevelSettingsLocally();
      }
    }
  } catch {
    // Keep local fallback when API is unavailable.
  }

  const firstEnabled = getFirstEnabledLevelIndex();
  if (!active && firstEnabled >= 0) {
    currentLevelIndex = firstEnabled;
    updateLevelBadge();
  }
}

function getFirstEnabledLevelIndex() {
  for (let index = 0; index < carLevelsEnabled.length; index += 1) {
    if (carLevelsEnabled[index]) {
      return index;
    }
  }

  return -1;
}

function getNextEnabledLevelIndex(fromIndex) {
  for (let index = fromIndex + 1; index < carLevelsEnabled.length; index += 1) {
    if (carLevelsEnabled[index]) {
      return index;
    }
  }

  return -1;
}

function hideToast() {
  if (!carToast) {
    return;
  }

  if (toastTimer) {
    window.clearTimeout(toastTimer);
    toastTimer = null;
  }

  carToast.hidden = true;
  carToast.textContent = "";
}

function updateStartButtonVisibility() {
  if (!carStart) {
    return;
  }

  carStart.classList.toggle("hidden", active);
}

function showToast(message, durationMs = 2400) {
  if (!carToast) {
    return;
  }

  if (toastTimer) {
    window.clearTimeout(toastTimer);
    toastTimer = null;
  }

  carToast.textContent = message;
  carToast.hidden = false;

  if (durationMs > 0) {
    toastTimer = window.setTimeout(() => {
      hideToast();
    }, durationMs);
  }
}

function flashBadge(node) {
  if (!node) {
    return;
  }

  node.classList.remove("car-badge-flash");
  void node.offsetWidth;
  node.classList.add("car-badge-flash");
}

function updateLevelBadge() {
  if (!carLevelBadge) {
    return;
  }

  carLevelBadge.textContent = `Level ${currentLevelIndex + 1} of ${LEVELS.length}`;
  flashBadge(carLevelBadge);
}

function updateHitsBadge() {
  if (!carHitsBadge) {
    return;
  }

  carHitsBadge.textContent = `Hits ${hits}/${MAX_HITS}`;
  flashBadge(carHitsBadge);
}

function updateDodgedBadge() {
  if (!carDodgedBadge) {
    return;
  }

  const target = LEVELS[currentLevelIndex].targetDodges;
  carDodgedBadge.textContent = `Dodged ${dodged}/${target}`;
  flashBadge(carDodgedBadge);
}

function setPressedState(pressed) {
  isPressed = pressed;
  leftHand.classList.toggle("pressed", pressed);
  scene.classList.toggle("is-pressed", pressed);
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
    minX: area.x + area.width * 0.2,
    maxX: area.x + area.width * 0.62,
    minY: area.y + area.height * 0.1,
    maxY: area.y + area.height * 0.8,
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

function renderPlayerLane() {
  const laneCenter = LANE_POSITIONS[playerLane] * 100;
  playerCar.style.left = `${laneCenter}%`;
}

function spawnObstacle() {
  const obstacle = document.createElement("div");
  obstacle.className = "car-obstacle";

  const lane = Math.floor(Math.random() * LANE_POSITIONS.length);
  const id = nextObstacleId;
  nextObstacleId += 1;

  obstacle.style.left = `${LANE_POSITIONS[lane] * 100}%`;
  obstacle.style.top = "-40px";

  carObstacles.appendChild(obstacle);
  obstacles.push({ id, node: obstacle, lane, y: -40, collided: false, passed: false });
}

function removeObstacleById(id) {
  obstacles = obstacles.filter((item) => {
    if (item.id !== id) {
      return true;
    }

    item.node.remove();
    return false;
  });
}

function clearObstacles() {
  obstacles.forEach((item) => item.node.remove());
  obstacles = [];
}

function handleHit() {
  hits += 1;
  updateHitsBadge();
  carBoard.classList.add("car-hit-flash");
  window.setTimeout(() => carBoard.classList.remove("car-hit-flash"), 140);

  if (hits >= MAX_HITS) {
    active = false;
    carStart.classList.add("pulse-cue");
    updateStartButtonVisibility();
    showToast(`Too many hits. Click START to retry Level ${currentLevelIndex + 1}.`, 5000);
    return;
  }

  showToast(`Watch out! Hits ${hits}/${MAX_HITS}.`, 1400);
}

function handleLevelComplete() {
  active = false;
  carStart.classList.add("pulse-cue");
  updateStartButtonVisibility();

  const nextLevel = getNextEnabledLevelIndex(currentLevelIndex);
  if (nextLevel >= 0) {
    currentLevelIndex = nextLevel;
    updateLevelBadge();
    showToast("Way to go! Click START for the next level.", 5000);
    return;
  }

  showToast("You cleared all enabled levels! Great driving!", 5000);
}

function updateGame(dtMs) {
  if (!active) {
    return;
  }

  const level = LEVELS[currentLevelIndex];
  spawnTimerMs += dtMs;
  while (spawnTimerMs >= level.spawnMs) {
    spawnTimerMs -= level.spawnMs;
    spawnObstacle();
  }

  const boardHeight = carBoard.clientHeight;
  const playerY = boardHeight * 0.83;
  const collisionWindow = 34;

  obstacles.forEach((item) => {
    if (item.collided || item.passed) {
      return;
    }

    item.y += (level.speedPxPerSec * dtMs) / 1000;
    item.node.style.top = `${item.y}px`;

    if (item.lane === playerLane && Math.abs(item.y - playerY) <= collisionWindow) {
      item.collided = true;
      removeObstacleById(item.id);
      handleHit();
      return;
    }

    if (item.y > boardHeight + 30) {
      item.passed = true;
      removeObstacleById(item.id);
      dodged += 1;
      updateDodgedBadge();

      if (dodged >= level.targetDodges) {
        handleLevelComplete();
      }
    }
  });
}

function gameLoop(timestampMs) {
  if (!previousFrameTime) {
    previousFrameTime = timestampMs;
  }

  const delta = clamp(timestampMs - previousFrameTime, 0, 100);
  previousFrameTime = timestampMs;
  updateGame(delta);
  frameHandle = window.requestAnimationFrame(gameLoop);
}

function startLevel() {
  hideToast();

  if (!carLevelsEnabled[currentLevelIndex]) {
    const first = getFirstEnabledLevelIndex();
    if (first < 0) {
      showToast("Enable at least one car level in Admin settings.", 5000);
      return;
    }
    currentLevelIndex = first;
    updateLevelBadge();
  }

  active = true;
  hits = 0;
  dodged = 0;
  spawnTimerMs = 0;
  previousFrameTime = 0;
  playerLane = 1;
  renderPlayerLane();
  clearObstacles();
  updateHitsBadge();
  updateDodgedBadge();
  carStart.classList.remove("pulse-cue");
  updateStartButtonVisibility();
  carBoard.focus({ preventScroll: true });
}

function shiftLane(dir) {
  if (!active) {
    return;
  }

  playerLane = clamp(playerLane + dir, 0, LANE_POSITIONS.length - 1);
  renderPlayerLane();
  playerCar.classList.remove("car-player-shift");
  void playerCar.offsetWidth;
  playerCar.classList.add("car-player-shift");
}

applyLeftPosition(LAYOUT.leftStart.x, LAYOUT.leftStart.y);
applyRightPosition(LAYOUT.rightStart.x, LAYOUT.rightStart.y);
renderPlayerLane();
loadCarLevelSettingsFromLocalStorage();
const initialEnabledLevel = getFirstEnabledLevelIndex();
if (initialEnabledLevel >= 0) {
  currentLevelIndex = initialEnabledLevel;
}
updateLevelBadge();
updateHitsBadge();
updateDodgedBadge();
carStart.classList.add("pulse-cue");
updateStartButtonVisibility();
loadCarLevelSettingsShared();
frameHandle = window.requestAnimationFrame(gameLoop);

document.addEventListener("pointermove", (event) => {
  updateRightFromPointer(event);
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

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    shiftLane(-1);
    return;
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    shiftLane(1);
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    if (!active) {
      event.preventDefault();
      startLevel();
    }
  }
});

carStart.addEventListener("click", () => {
  startLevel();
});

window.addEventListener("beforeunload", () => {
  if (frameHandle) {
    window.cancelAnimationFrame(frameHandle);
  }
});
