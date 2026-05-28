const jackScene = document.getElementById("jackScene");
const jackPathDots = document.getElementById("jackPathDots");
const jackWrap = document.getElementById("jackWrap");
const jackCharacter = document.getElementById("jackCharacter");
const candleObstacle = document.getElementById("candleObstacle");
const jackGoal = document.getElementById("jackGoal");
const jackStatus = document.getElementById("jackStatus");
const jackLevelBadge = document.getElementById("jackLevelBadge");
const jackLevelOverlay = document.getElementById("jackLevelOverlay");

const BASE_SCENE_WIDTH = 700;
const BASE_SCENE_HEIGHT = 394;
const DOT_COUNT = 72;
const START_RADIUS = 62;
const CANDLE_ZONE_UNLOCK_RADIUS = 120;
const CANDLE_HIT_RADIUS = 24;
const JACK_HIT_RADIUS = 18;
const GOAL_T = 1;
const FOLLOW_LERP = 0.22;
const HEADING_LERP = 0.22;
const MAX_ROTATION_DEG = 26;
const FIRE_SOUND_START_OFFSET = 3.05;
const FIRE_SOUND_LOOP_WINDOW_SECONDS = 1.15;
const RUNNING_FEET_MIN_MOVEMENT_PX = 0.14;
const FLAME_RESET_DELAY_MS = 2750;
const NEXT_LEVEL_DELAY_MS = 1000;
const FALLING_FLAME_LEVEL_START_INDEX = 3;
const FALLING_FLAME_SIZE_PX = 24;
const FALLING_FLAME_HIT_RADIUS = 12;
const FLAME_SETTINGS_REFRESH_INTERVAL_MS = 2200;
const DEFAULT_FLAME_RAIN_SETTINGS = {
  4: {
    enabled: true,
    size: 24,
    hitRadius: 12,
    burstMin: 2,
    burstMax: 4,
    intervalMin: 620,
    intervalMax: 1300,
    speedMin: 210,
    speedMax: 320,
    burstStaggerMax: 360,
    lanePadding: 20,
  },
  5: {
    enabled: true,
    size: 24,
    hitRadius: 12,
    burstMin: 3,
    burstMax: 5,
    intervalMin: 520,
    intervalMax: 1100,
    speedMin: 250,
    speedMax: 370,
    burstStaggerMax: 360,
    lanePadding: 20,
  },
  6: {
    enabled: true,
    size: 24,
    hitRadius: 12,
    burstMin: 4,
    burstMax: 7,
    intervalMin: 400,
    intervalMax: 900,
    speedMin: 320,
    speedMax: 480,
    burstStaggerMax: 360,
    lanePadding: 20,
  },
};
const FALLING_FLAME_LEVEL_PROFILES = {
  3: {
    burstBonus: 0,
    speedBonus: 0,
    intervalScale: 1,
    staggerScale: 1,
  },
  4: {
    burstBonus: 1,
    speedBonus: 30,
    intervalScale: 0.82,
    staggerScale: 0.9,
  },
  5: {
    burstBonus: 2,
    speedBonus: 70,
    intervalScale: 0.62,
    staggerScale: 0.75,
  },
};
const JACK_FLAME_RAIN_ENABLED_KEY = "jackFlameRainEnabled";
const JACK_FLAME_RAIN_SIZE_KEY = "jackFlameRainSizePx";
const JACK_FLAME_RAIN_HIT_RADIUS_KEY = "jackFlameRainHitRadiusPx";
const JACK_FLAME_RAIN_BURST_MIN_KEY = "jackFlameRainBurstMin";
const JACK_FLAME_RAIN_BURST_MAX_KEY = "jackFlameRainBurstMax";
const JACK_FLAME_RAIN_INTERVAL_MIN_KEY = "jackFlameRainIntervalMinMs";
const JACK_FLAME_RAIN_INTERVAL_MAX_KEY = "jackFlameRainIntervalMaxMs";
const JACK_FLAME_RAIN_SPEED_MIN_KEY = "jackFlameRainSpeedMin";
const JACK_FLAME_RAIN_SPEED_MAX_KEY = "jackFlameRainSpeedMax";
const SETTINGS_API_PATH = "/api/settings";

const fireSound = new Audio("sounds/fire2.mp3");
fireSound.preload = "auto";
fireSound.volume = 0.6;
fireSound.loop = false;

const runningFeetSound = new Audio("sounds/running-feet.mp3");
runningFeetSound.preload = "auto";
runningFeetSound.volume = 0.55;
runningFeetSound.loop = true;

const JACK_PATH_LEVELS = [
  [
    { x: 76, y: 322 },
    { x: 150, y: 320 },
    { x: 220, y: 312 },
    { x: 290, y: 296 },
    { x: 350, y: 276 },
    { x: 410, y: 262 },
    { x: 470, y: 272 },
    { x: 535, y: 300 },
    { x: 624, y: 322 },
  ],
  [
    { x: 76, y: 322 },
    { x: 138, y: 324 },
    { x: 198, y: 312 },
    { x: 248, y: 286 },
    { x: 294, y: 252 },
    { x: 334, y: 224 },
    { x: 378, y: 214 },
    { x: 420, y: 228 },
    { x: 452, y: 258 },
    { x: 474, y: 290 },
    { x: 510, y: 314 },
    { x: 560, y: 324 },
    { x: 624, y: 322 },
  ],
  [
    { x: 76, y: 322 },
    { x: 132, y: 326 },
    { x: 186, y: 314 },
    { x: 230, y: 286 },
    { x: 266, y: 250 },
    { x: 300, y: 220 },
    { x: 338, y: 206 },
    { x: 376, y: 214 },
    { x: 408, y: 240 },
    { x: 430, y: 274 },
    { x: 416, y: 302 },
    { x: 446, y: 320 },
    { x: 486, y: 306 },
    { x: 514, y: 274 },
    { x: 500, y: 242 },
    { x: 532, y: 224 },
    { x: 574, y: 252 },
    { x: 602, y: 292 },
    { x: 624, y: 322 },
  ],
  [
    { x: 76, y: 322 },
    { x: 126, y: 330 },
    { x: 172, y: 320 },
    { x: 210, y: 292 },
    { x: 242, y: 254 },
    { x: 274, y: 222 },
    { x: 310, y: 204 },
    { x: 346, y: 210 },
    { x: 374, y: 238 },
    { x: 392, y: 272 },
    { x: 404, y: 306 },
    { x: 432, y: 332 },
    { x: 470, y: 334 },
    { x: 498, y: 310 },
    { x: 500, y: 278 },
    { x: 478, y: 250 },
    { x: 500, y: 224 },
    { x: 540, y: 214 },
    { x: 578, y: 236 },
    { x: 602, y: 274 },
    { x: 624, y: 322 },
  ],
  [
    { x: 76, y: 322 },
    { x: 122, y: 332 },
    { x: 164, y: 324 },
    { x: 200, y: 296 },
    { x: 230, y: 258 },
    { x: 258, y: 220 },
    { x: 292, y: 194 },
    { x: 332, y: 186 },
    { x: 370, y: 202 },
    { x: 398, y: 232 },
    { x: 414, y: 270 },
    { x: 422, y: 308 },
    { x: 448, y: 338 },
    { x: 486, y: 344 },
    { x: 518, y: 324 },
    { x: 528, y: 292 },
    { x: 516, y: 260 },
    { x: 492, y: 236 },
    { x: 508, y: 208 },
    { x: 548, y: 196 },
    { x: 590, y: 216 },
    { x: 616, y: 258 },
    { x: 624, y: 322 },
  ],
  [
    { x: 76, y: 322 },
    { x: 118, y: 334 },
    { x: 156, y: 328 },
    { x: 190, y: 304 },
    { x: 218, y: 268 },
    { x: 242, y: 228 },
    { x: 272, y: 194 },
    { x: 308, y: 174 },
    { x: 350, y: 174 },
    { x: 386, y: 194 },
    { x: 410, y: 228 },
    { x: 420, y: 268 },
    { x: 424, y: 308 },
    { x: 446, y: 340 },
    { x: 482, y: 352 },
    { x: 520, y: 338 },
    { x: 542, y: 306 },
    { x: 542, y: 272 },
    { x: 524, y: 242 },
    { x: 500, y: 218 },
    { x: 510, y: 192 },
    { x: 548, y: 178 },
    { x: 590, y: 194 },
    { x: 620, y: 232 },
    { x: 620, y: 274 },
    { x: 624, y: 322 },
  ],
];

const JACK_LEVELS = [
  {
    pathPoints: JACK_PATH_LEVELS[0],
    candleT: 0.48,
    pathTolerance: 38,
    candleZonePathTolerance: 62,
    candleCollisionWindow: 0.2,
    candlePathWindow: 0.42,
    progressStep: 0.24,
    backgroundImage: "images/bedroom.jpg",
  },
  {
    pathPoints: JACK_PATH_LEVELS[1],
    candleT: 0.46,
    pathTolerance: 34,
    candleZonePathTolerance: 56,
    candleCollisionWindow: 0.18,
    candlePathWindow: 0.38,
    progressStep: 0.2,
    backgroundImage: "images/tent.png",
  },
  {
    pathPoints: JACK_PATH_LEVELS[2],
    candleT: 0.44,
    pathTolerance: 30,
    candleZonePathTolerance: 50,
    candleCollisionWindow: 0.16,
    candlePathWindow: 0.34,
    progressStep: 0.16,
    backgroundImage: "images/living-room.png",
  },
  {
    pathPoints: JACK_PATH_LEVELS[3],
    candleT: 0.45,
    pathTolerance: 26,
    candleZonePathTolerance: 44,
    candleCollisionWindow: 0.14,
    candlePathWindow: 0.3,
    progressStep: 0.12,
    backgroundImage: "images/yar.png",
  },
  {
    pathPoints: JACK_PATH_LEVELS[4],
    candleT: 0.47,
    pathTolerance: 22,
    candleZonePathTolerance: 38,
    candleCollisionWindow: 0.12,
    candlePathWindow: 0.27,
    progressStep: 0.09,
    backgroundImage: "images/beach.png",
  },
  {
    pathPoints: JACK_PATH_LEVELS[5],
    candleT: 0.49,
    pathTolerance: 18,
    candleZonePathTolerance: 32,
    candleCollisionWindow: 0.1,
    candlePathWindow: 0.24,
    progressStep: 0.07,
    backgroundImage: "images/desert.png",
  },
];

let scenePathPoints = [];
let pathSegments = [];
let totalPathLength = 0;
let dotEls = [];
let started = false;
let gameOver = false;
let flameResetTimer = null;
let levelAdvanceTimer = null;
let levelAdvanceDueAtMs = 0;
let currentLevelIndex = 0;
let waitingNextLevel = false;
let fireAudioPrimed = false;
let runningFeetAudioPrimed = false;
let animationFrameId = null;
let previousTickAtMs = 0;
let fallingFlameSpawnCountdownMs = 0;
let activeFallingFlames = [];
let pendingFallingFlameSpawns = [];
let fireLoopFrameId = null;
let flameSettingsRefreshTimerId = null;
let flameRainSettings = { ...DEFAULT_FLAME_RAIN_SETTINGS };

let jackPos = { x: 0, y: 0 };
let previousPos = { x: 0, y: 0 };
let targetPos = { x: 0, y: 0 };
let maxProgressT = 0;
let candlePoint = { x: 0, y: 0 };
let candleCollisionPoint = { x: 0, y: 0 };
let goalPoint = { x: 0, y: 0 };
let headingDeg = 0;
let facingScaleX = 1;
let movementPxPerFrame = 0;

function getFallingFlameLevelOffset() {
  return Math.max(0, currentLevelIndex - FALLING_FLAME_LEVEL_START_INDEX);
}

function parseBool(value, fallback = true) {
  if (value === null || typeof value === "undefined") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value) !== "false";
}

function parseNumber(value, fallback, min, max) {
  const parsed = Number.parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

function parseIntNumber(value, fallback, min, max) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

function normalizeFlameRainSettings(raw = {}, level) {
  const def = DEFAULT_FLAME_RAIN_SETTINGS[level] || DEFAULT_FLAME_RAIN_SETTINGS[4];
  return {
    enabled: parseBool(raw.enabled, def.enabled),
    size: parseIntNumber(raw.size, def.size, 10, 64),
    hitRadius: parseIntNumber(raw.hitRadius, def.hitRadius, 4, 48),
    burstMin: parseIntNumber(raw.burstMin, def.burstMin, 1, 8),
    burstMax: Math.max(
      parseIntNumber(raw.burstMax, def.burstMax, 1, 10),
      parseIntNumber(raw.burstMin, def.burstMin, 1, 8)
    ),
    intervalMin: parseIntNumber(raw.intervalMin, def.intervalMin, 160, 4000),
    intervalMax: Math.max(
      parseIntNumber(raw.intervalMax, def.intervalMax, 200, 5000),
      parseIntNumber(raw.intervalMin, def.intervalMin, 160, 4000) + 30
    ),
    speedMin: parseNumber(raw.speedMin, def.speedMin, 80, 900),
    speedMax: Math.max(
      parseNumber(raw.speedMax, def.speedMax, 100, 1200),
      parseNumber(raw.speedMin, def.speedMin, 80, 900) + 1
    ),
    burstStaggerMax: def.burstStaggerMax,
    lanePadding: def.lanePadding,
  };
}

function persistFlameRainSettingsToLocalStorage(settings) {
  localStorage.setItem(JACK_FLAME_RAIN_ENABLED_KEY, String(settings.enabled));
  localStorage.setItem(JACK_FLAME_RAIN_SIZE_KEY, String(settings.sizePx));
  localStorage.setItem(JACK_FLAME_RAIN_HIT_RADIUS_KEY, String(settings.hitRadius));
  localStorage.setItem(JACK_FLAME_RAIN_BURST_MIN_KEY, String(settings.burstMin));
  localStorage.setItem(JACK_FLAME_RAIN_BURST_MAX_KEY, String(settings.burstMax));
  localStorage.setItem(JACK_FLAME_RAIN_INTERVAL_MIN_KEY, String(settings.intervalMinMs));
  localStorage.setItem(JACK_FLAME_RAIN_INTERVAL_MAX_KEY, String(settings.intervalMaxMs));
  localStorage.setItem(JACK_FLAME_RAIN_SPEED_MIN_KEY, String(settings.speedMin));
  localStorage.setItem(JACK_FLAME_RAIN_SPEED_MAX_KEY, String(settings.speedMax));
}

function loadFlameRainSettingsFromLocalStorage() {
  for (const level of [4, 5, 6]) {
    const prefix = `jackFlameRain${level}`;
    const raw = {
      enabled: localStorage.getItem(`${prefix}Enabled`),
      size: localStorage.getItem(`${prefix}SizePx`),
      hitRadius: localStorage.getItem(`${prefix}HitRadiusPx`),
      burstMin: localStorage.getItem(`${prefix}BurstMin`),
      burstMax: localStorage.getItem(`${prefix}BurstMax`),
      intervalMin: localStorage.getItem(`${prefix}IntervalMinMs`),
      intervalMax: localStorage.getItem(`${prefix}IntervalMaxMs`),
      speedMin: localStorage.getItem(`${prefix}SpeedMin`),
      speedMax: localStorage.getItem(`${prefix}SpeedMax`),
    };
    flameRainSettings[level] = normalizeFlameRainSettings(raw, level);
  }
}

async function refreshFlameRainSettingsFromApi() {
  try {
    const response = await fetch(SETTINGS_API_PATH, { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const data = await response.json();
    for (const level of [4, 5, 6]) {
      flameRainSettings[level] = normalizeFlameRainSettings(data[`jackFlameRain${level}`] || {}, level);
    }
    // Optionally persist to localStorage for offline use
    for (const level of [4, 5, 6]) {
      const s = flameRainSettings[level];
      const prefix = `jackFlameRain${level}`;
      localStorage.setItem(`${prefix}Enabled`, String(s.enabled));
      localStorage.setItem(`${prefix}SizePx`, String(s.size));
      localStorage.setItem(`${prefix}HitRadiusPx`, String(s.hitRadius));
      localStorage.setItem(`${prefix}BurstMin`, String(s.burstMin));
      localStorage.setItem(`${prefix}BurstMax`, String(s.burstMax));
      localStorage.setItem(`${prefix}IntervalMinMs`, String(s.intervalMin));
      localStorage.setItem(`${prefix}IntervalMaxMs`, String(s.intervalMax));
      localStorage.setItem(`${prefix}SpeedMin`, String(s.speedMin));
      localStorage.setItem(`${prefix}SpeedMax`, String(s.speedMax));
    }
  } catch {
    // Keep current settings when API is unavailable.
  }
}

function isFallingFlameLevel() {
  return [4, 5, 6].includes(currentLevelIndex + 1) && flameRainSettings[currentLevelIndex + 1]?.enabled;
}

function getFlameRainSettingsForLevel() {
  return flameRainSettings[currentLevelIndex + 1] || flameRainSettings[4];
}

function getRandomFallingFlameSpawnDelayMs() {
  const s = getFlameRainSettingsForLevel();
  const minMs = Math.max(100, s.intervalMin);
  const maxMs = Math.max(minMs + 30, s.intervalMax);
  return minMs + Math.random() * (maxMs - minMs);
}

function getRandomFallingFlameSpeedPxPerSec() {
  const s = getFlameRainSettingsForLevel();
  const minSpeed = s.speedMin;
  const maxSpeed = s.speedMax;
  return minSpeed + Math.random() * (maxSpeed - minSpeed);
}

function getRandomBurstCount() {
  const s = getFlameRainSettingsForLevel();
  const min = Math.max(1, s.burstMin);
  const max = Math.max(min, s.burstMax);
  return Math.floor(min + Math.random() * (max - min + 1));
}

function isFlameTouchingJack(flame) {
  const s = getFlameRainSettingsForLevel();
  const flameHalf = (flame.size || s.size) * 0.5;
  const flameInset = Math.max(2, (flame.size || s.size) * 0.28);
  const flameLeft = flame.x - flameHalf + flameInset;
  const flameRight = flame.x + flameHalf - flameInset;
  const flameTop = flame.y - flameHalf + flameInset;
  const flameBottom = flame.y + flameHalf - flameInset;

  // Character visuals are not centered exactly on jackPos, so this tuned hitbox
  // tracks the rendered body to avoid near-touch misses.
  const jackBox = {
    left: jackPos.x - 46,
    right: jackPos.x + 46,
    top: jackPos.y - 102,
    bottom: jackPos.y + 58,
  };

  const overlapX = flameLeft <= jackBox.right && flameRight >= jackBox.left;
  const overlapY = flameTop <= jackBox.bottom && flameBottom >= jackBox.top;
  if (overlapX && overlapY) {
    return true;
  }

  // Fallback radial check for edge contacts while Jack is moving quickly.
  const nearestX = Math.max(jackBox.left, Math.min(flame.x, jackBox.right));
  const nearestY = Math.max(jackBox.top, Math.min(flame.y, jackBox.bottom));
  const dx = flame.x - nearestX;
  const dy = flame.y - nearestY;
  return Math.hypot(dx, dy) <= (flame.hitRadius || s.hitRadius) * 0.22;
}

function buildSpacedFlameXPositions(count, sceneWidth) {
  const s = getFlameRainSettingsForLevel();
  const padding = s.lanePadding || 20;
  const maxLanes = Math.max(count, Math.floor((sceneWidth - padding * 2) / (s.size + 6)));
  const laneCount = Math.max(count, Math.min(12, maxLanes));
  const laneWidth = (sceneWidth - padding * 2) / laneCount;
  const lanes = [];
  for (let lane = 0; lane < laneCount; lane += 1) {
    lanes.push(lane);
  }
  for (let i = lanes.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = lanes[i];
    lanes[i] = lanes[j];
    lanes[j] = temp;
  }
  return lanes.slice(0, count).map((lane) => {
    const laneStart = padding + lane * laneWidth;
    const jitter = (Math.random() - 0.5) * Math.min(22, laneWidth * 0.3);
    return laneStart + laneWidth * 0.5 + jitter;
  });
}

function clearFallingFlames() {
  activeFallingFlames.forEach((flame) => {
    flame.el.remove();
  });
  activeFallingFlames = [];
  pendingFallingFlameSpawns = [];
  fallingFlameSpawnCountdownMs = getRandomFallingFlameSpawnDelayMs();
}

function spawnFallingFlame(x, speedY) {
  if (!jackScene) {
    return;
  }
  const s = getFlameRainSettingsForLevel();
  const y = -s.size;
  const el = document.createElement("img");
  el.className = "jack-falling-flame";
  el.src = "images/flame2.png";
  el.alt = "";
  el.setAttribute("aria-hidden", "true");
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.style.width = `${s.size}px`;
  el.style.height = `${s.size}px`;
  jackScene.appendChild(el);
  activeFallingFlames.push({
    el,
    x,
    y,
    speedY,
    size: s.size,
    hitRadius: s.hitRadius,
  });
}

function queueFallingFlameBurst() {
  const s = getFlameRainSettingsForLevel();
  const sceneWidth = jackScene.clientWidth || BASE_SCENE_WIDTH;
  const burstCount = getRandomBurstCount();
  const spawnXs = buildSpacedFlameXPositions(burstCount, sceneWidth);
  spawnXs.forEach((x, index) => {
    pendingFallingFlameSpawns.push({
      delayMs: Math.max(0, Math.random() * (s.burstStaggerMax || 360) + index * 26),
      x,
      speedY: getRandomFallingFlameSpeedPxPerSec(),
    });
  });
}

function updateFallingFlames(deltaMs) {
  if (!isFallingFlameLevel() || !started || gameOver || waitingNextLevel) {
    if (activeFallingFlames.length > 0 || pendingFallingFlameSpawns.length > 0) {
      clearFallingFlames();
    }
    return;
  }

  fallingFlameSpawnCountdownMs -= deltaMs;
  if (fallingFlameSpawnCountdownMs <= 0) {
    queueFallingFlameBurst();
    fallingFlameSpawnCountdownMs = getRandomFallingFlameSpawnDelayMs();
  }

  const stillPending = [];
  pendingFallingFlameSpawns.forEach((pending) => {
    pending.delayMs -= deltaMs;
    if (pending.delayMs <= 0) {
      spawnFallingFlame(pending.x, pending.speedY);
      return;
    }

    stillPending.push(pending);
  });
  pendingFallingFlameSpawns = stillPending;

  const sceneHeight = jackScene.clientHeight || BASE_SCENE_HEIGHT;
  const active = [];
  for (let i = 0; i < activeFallingFlames.length; i += 1) {
    const flame = activeFallingFlames[i];
    flame.y += flame.speedY * (deltaMs / 1000);
    flame.el.style.top = `${flame.y}px`;

    const collidedWithJack = isFlameTouchingJack(flame);

    if (collidedWithJack) {
      clearFallingFlames();
      triggerFlameFailure();
      return;
    }

    if (flame.y <= sceneHeight + flameRainSettings.sizePx) {
      active.push(flame);
      continue;
    }

    flame.el.remove();
  }

  activeFallingFlames = active;
}

function getCurrentLevel() {
  return JACK_LEVELS[currentLevelIndex] || JACK_LEVELS[0];
}

function updateLevelBadge() {
  if (!jackLevelBadge) {
    return;
  }

  jackLevelBadge.textContent = `Level ${currentLevelIndex + 1} of ${JACK_LEVELS.length}`;
}

function applyLevelBackground() {
  if (!jackScene) {
    return;
  }

  const backgroundImage = getCurrentLevel().backgroundImage;
  jackScene.style.backgroundImage = `linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.12)), url("${backgroundImage}")`;
}

function clearLevelAdvanceTimer() {
  if (levelAdvanceTimer) {
    window.clearTimeout(levelAdvanceTimer);
    levelAdvanceTimer = null;
  }

  levelAdvanceDueAtMs = 0;
}

function showLevelOverlay(message) {
  if (!jackLevelOverlay) {
    return;
  }

  jackLevelOverlay.textContent = message;
  jackLevelOverlay.hidden = false;
}

function hideLevelOverlay() {
  if (!jackLevelOverlay) {
    return;
  }

  jackLevelOverlay.hidden = true;
  jackLevelOverlay.textContent = "";
}

function primeFireSound() {
  if (fireAudioPrimed && runningFeetAudioPrimed) {
    return;
  }

  if (!fireAudioPrimed) {
    fireAudioPrimed = true;
    fireSound.muted = true;
    seekFireSoundStart();
    fireSound
      .play()
      .then(() => {
        fireSound.pause();
        seekFireSoundStart();
        fireSound.muted = false;
      })
      .catch(() => {
        fireSound.muted = false;
      });
  }

  if (!runningFeetAudioPrimed) {
    runningFeetAudioPrimed = true;
    runningFeetSound.muted = true;
    runningFeetSound.currentTime = 0;
    runningFeetSound
      .play()
      .then(() => {
        runningFeetSound.pause();
        runningFeetSound.currentTime = 0;
        runningFeetSound.muted = false;
      })
      .catch(() => {
        runningFeetSound.muted = false;
      });
  }
}

function seekFireSoundStart() {
  if (Number.isFinite(fireSound.duration) && fireSound.duration > FIRE_SOUND_START_OFFSET + 0.05) {
    fireSound.currentTime = FIRE_SOUND_START_OFFSET;
    return;
  }

  fireSound.currentTime = 0;
}

function stopFireLoopGuard() {
  if (!fireLoopFrameId) {
    return;
  }

  window.cancelAnimationFrame(fireLoopFrameId);
  fireLoopFrameId = null;
}

function runFireLoopGuard() {
  if (fireSound.paused) {
    fireLoopFrameId = null;
    return;
  }

  const loopEnd = FIRE_SOUND_START_OFFSET + FIRE_SOUND_LOOP_WINDOW_SECONDS;
  if (Number.isFinite(fireSound.currentTime) && fireSound.currentTime >= loopEnd) {
    seekFireSoundStart();
  }

  fireLoopFrameId = window.requestAnimationFrame(runFireLoopGuard);
}

function startFireLoopGuard() {
  stopFireLoopGuard();
  fireLoopFrameId = window.requestAnimationFrame(runFireLoopGuard);
}

function playFireSound() {
  try {
    stopFireLoopGuard();
    fireSound.pause();
    seekFireSoundStart();
    fireSound.play().catch(() => {
      // Ignore autoplay-blocking errors.
    });
    startFireLoopGuard();
  } catch {
    // Ignore media errors and keep gameplay responsive.
  }
}

function syncRunningFeetSound() {
  const shouldPlay = started && !gameOver && !waitingNextLevel && movementPxPerFrame > RUNNING_FEET_MIN_MOVEMENT_PX;

  if (shouldPlay) {
    runningFeetSound.play().catch(() => {
      // Ignore autoplay-blocking errors.
    });
    return;
  }

  runningFeetSound.pause();
  runningFeetSound.currentTime = 0;
}

function setStatus(message, type = "neutral") {
  jackStatus.textContent = message;
  jackStatus.dataset.state = type;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function buildPathCache() {
  const sceneWidth = jackScene.clientWidth || BASE_SCENE_WIDTH;
  const sceneHeight = jackScene.clientHeight || BASE_SCENE_HEIGHT;
  const scaleX = sceneWidth / BASE_SCENE_WIDTH;
  const scaleY = sceneHeight / BASE_SCENE_HEIGHT;
  const levelPathPoints = getCurrentLevel().pathPoints || JACK_PATH_LEVELS[0];

  scenePathPoints = levelPathPoints.map((point) => ({
    x: point.x * scaleX,
    y: point.y * scaleY,
  }));

  pathSegments = [];
  totalPathLength = 0;

  for (let i = 0; i < scenePathPoints.length - 1; i += 1) {
    const a = scenePathPoints[i];
    const b = scenePathPoints[i + 1];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    pathSegments.push({
      a,
      b,
      dx,
      dy,
      length,
      startLength: totalPathLength,
      endLength: totalPathLength + length,
    });
    totalPathLength += length;
  }
}

function getPointAtT(t) {
  const clampedT = Math.max(0, Math.min(1, t));
  const targetDistance = clampedT * totalPathLength;
  const segment =
    pathSegments.find((item) => targetDistance >= item.startLength && targetDistance <= item.endLength) ||
    pathSegments[pathSegments.length - 1];

  if (!segment || segment.length <= 0) {
    const fallback = scenePathPoints[0] || { x: 0, y: 0 };
    return { x: fallback.x, y: fallback.y };
  }

  const localDistance = Math.max(0, Math.min(segment.length, targetDistance - segment.startLength));
  const ratio = localDistance / segment.length;

  return {
    x: segment.a.x + segment.dx * ratio,
    y: segment.a.y + segment.dy * ratio,
  };
}

function pointToSegmentDistance(px, py, segment) {
  const segmentLengthSquared = segment.dx * segment.dx + segment.dy * segment.dy;
  if (segmentLengthSquared <= 0) {
    return {
      distance: Math.hypot(px - segment.a.x, py - segment.a.y),
      ratio: 0,
    };
  }

  const projection =
    ((px - segment.a.x) * segment.dx + (py - segment.a.y) * segment.dy) / segmentLengthSquared;
  const ratio = Math.max(0, Math.min(1, projection));
  const sx = segment.a.x + segment.dx * ratio;
  const sy = segment.a.y + segment.dy * ratio;

  return {
    distance: Math.hypot(px - sx, py - sy),
    ratio,
  };
}

function getPathMetricsForPoint(point) {
  let bestDistance = Number.POSITIVE_INFINITY;
  let bestT = 0;

  pathSegments.forEach((segment) => {
    const projected = pointToSegmentDistance(point.x, point.y, segment);
    if (projected.distance < bestDistance) {
      bestDistance = projected.distance;
      const absoluteLength = segment.startLength + segment.length * projected.ratio;
      bestT = totalPathLength > 0 ? absoluteLength / totalPathLength : 0;
    }
  });

  return {
    nearestDistance: bestDistance,
    nearestT: bestT,
  };
}

function getScenePointFromEvent(event) {
  const rect = jackScene.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * jackScene.clientWidth,
    y: ((event.clientY - rect.top) / rect.height) * jackScene.clientHeight,
  };
}

function getHeadingDegrees() {
  const dx = jackPos.x - previousPos.x;
  const dy = jackPos.y - previousPos.y;

  if (Math.abs(dx) > 0.3) {
    facingScaleX = dx < 0 ? -1 : 1;
  }

  if (Math.hypot(dx, dy) < 0.2) {
    return headingDeg;
  }

  const raw = Math.atan2(dy, Math.abs(dx)) * (180 / Math.PI);
  const clamped = Math.max(-MAX_ROTATION_DEG, Math.min(MAX_ROTATION_DEG, raw));
  headingDeg = headingDeg + (clamped - headingDeg) * HEADING_LERP;
  return headingDeg;
}

function updateCharacterVisual() {
  const prevX = jackPos.x;
  const prevY = jackPos.y;
  const dx = targetPos.x - jackPos.x;
  const dy = targetPos.y - jackPos.y;
  jackPos.x += dx * FOLLOW_LERP;
  jackPos.y += dy * FOLLOW_LERP;
  movementPxPerFrame = Math.hypot(jackPos.x - prevX, jackPos.y - prevY);

  jackWrap.style.left = `${jackPos.x}px`;
  jackWrap.style.top = `${jackPos.y}px`;
  jackWrap.style.setProperty("--jack-rotation", `${getHeadingDegrees()}deg`);
  jackWrap.style.setProperty("--jack-flip", String(facingScaleX));
}

function createDots() {
  jackPathDots.innerHTML = "";
  dotEls = [];

  for (let i = 0; i < DOT_COUNT; i += 1) {
    const t = i / (DOT_COUNT - 1);
    const point = getPointAtT(t);
    const dot = document.createElement("span");
    dot.className = "jack-dot";
    dot.style.left = `${point.x}px`;
    dot.style.top = `${point.y}px`;
    dot.dataset.t = String(t);
    jackPathDots.appendChild(dot);
    dotEls.push(dot);
  }
}

function updateDots() {
  dotEls.forEach((dot) => {
    const t = Number.parseFloat(dot.dataset.t || "0");
    dot.hidden = t <= maxProgressT;
  });
}

function updatePathProgress(metrics) {
  if (!started || gameOver || waitingNextLevel) {
    return;
  }

  const level = getCurrentLevel();
  const inCandlePathWindow = Math.abs(metrics.nearestT - level.candleT) <= level.candlePathWindow;
  const nearCandleZone = distance(jackPos, candleCollisionPoint) <= CANDLE_ZONE_UNLOCK_RADIUS;
  const allowedPathTolerance =
    inCandlePathWindow || nearCandleZone ? level.candleZonePathTolerance : level.pathTolerance;

  if (metrics.nearestDistance > allowedPathTolerance) {
    return;
  }

  const maxAllowedJump = level.progressStep || 0.09;
  const nextT = metrics.nearestT;
  if (nextT > maxProgressT && nextT <= maxProgressT + maxAllowedJump) {
    maxProgressT = nextT;
    updateDots();
  }
}

function resetToStart(message, state = "neutral") {
  const startPoint = scenePathPoints[0];
  if (!startPoint) {
    return;
  }

  started = false;
  gameOver = false;
  waitingNextLevel = false;
  maxProgressT = 0;
  previousPos = { ...startPoint };
  jackPos = { ...startPoint };
  targetPos = { ...startPoint };
  headingDeg = 0;
  facingScaleX = 1;
  jackCharacter.src = "images/jack.png";
  jackWrap.classList.remove("is-running", "is-failed", "is-success");
  jackGoal.classList.remove("is-success");
  fireSound.pause();
  stopFireLoopGuard();
  seekFireSoundStart();
  runningFeetSound.pause();
  runningFeetSound.currentTime = 0;
  clearFallingFlames();
  previousTickAtMs = 0;
  hideLevelOverlay();
  updateDots();
  updateCharacterVisual();
  setStatus(message, state);
}

function triggerFlameFailure() {
  if (gameOver) {
    return;
  }

  gameOver = true;
  jackWrap.classList.remove("is-running", "is-success");
  jackWrap.classList.add("is-failed");
  jackCharacter.src = "images/jack-flame.png";
  runningFeetSound.pause();
  runningFeetSound.currentTime = 0;
  clearFallingFlames();
  playFireSound();
  setStatus("Jack touched the candle and burned. Returning to start...", "failed");

  window.clearTimeout(flameResetTimer);
  flameResetTimer = window.setTimeout(() => {
    resetToStart("Try again: keep Jack high over the candle loop.", "warning");
  }, FLAME_RESET_DELAY_MS);
}

function triggerSuccess() {
  if (gameOver) {
    return;
  }

  gameOver = true;
  runningFeetSound.pause();
  runningFeetSound.currentTime = 0;
  clearFallingFlames();
  jackWrap.classList.remove("is-running", "is-failed");
  jackWrap.classList.add("is-success");
  jackGoal.classList.add("is-success");

  const completedLevel = currentLevelIndex + 1;
  const hasNextLevel = currentLevelIndex < JACK_LEVELS.length - 1;

  if (!hasNextLevel) {
    setStatus("Level complete! You finished all Jack Jump levels.", "success");
    showLevelOverlay("All Levels Complete!");
    return;
  }

  waitingNextLevel = true;
  setStatus(`Level ${completedLevel} complete! Next level starting...`, "success");
  showLevelOverlay("Way to go! On to the next level...");

  clearLevelAdvanceTimer();
  levelAdvanceDueAtMs = Date.now() + NEXT_LEVEL_DELAY_MS;
  levelAdvanceTimer = window.setTimeout(() => {
    levelAdvanceTimer = null;
    levelAdvanceDueAtMs = 0;

    currentLevelIndex += 1;
    updateLevelBadge();
    applyLevelBackground();
    rebuildLayoutAndReset(`Level ${currentLevelIndex + 1}: follow the path and clear the candle.`, "neutral");
  }, NEXT_LEVEL_DELAY_MS);
}

function checkGameRules(metrics) {
  if (!started || gameOver) {
    return;
  }

  const level = getCurrentLevel();

  const inCandlePathWindow = Math.abs(metrics.nearestT - level.candleT) <= level.candlePathWindow;
  const nearCandleZone = distance(jackPos, candleCollisionPoint) <= CANDLE_ZONE_UNLOCK_RADIUS;
  const allowedPathTolerance =
    inCandlePathWindow || nearCandleZone ? level.candleZonePathTolerance : level.pathTolerance;

  if (metrics.nearestDistance > allowedPathTolerance) {
    resetToStart("You strayed off path and got pulled back to start.", "warning");
    return;
  }

  const inCandleProgressWindow = Math.abs(metrics.nearestT - level.candleT) <= level.candleCollisionWindow;
  const nearCandleFlame = distance(jackPos, candleCollisionPoint) <= JACK_HIT_RADIUS + CANDLE_HIT_RADIUS;
  if (inCandleProgressWindow && nearCandleFlame) {
    triggerFlameFailure();
    return;
  }

  const onGoalAfterCandle =
    metrics.nearestT >= 0.985 &&
    maxProgressT >= level.candleT &&
    distance(jackPos, goalPoint) < 58;

  if (onGoalAfterCandle) {
    triggerSuccess();
  }
}

function onScenePointerMove(event) {
  if (waitingNextLevel) {
    return;
  }

  const pointer = getScenePointFromEvent(event);
  const startPoint = scenePathPoints[0];

  if (!started) {
    if (distance(pointer, startPoint) <= START_RADIUS) {
      started = true;
      setStatus("Follow the loop and avoid the candle.", "neutral");
    } else {
      return;
    }
  }

  if (gameOver) {
    return;
  }

  previousPos = { ...jackPos };
  targetPos = { ...pointer };

  jackWrap.classList.add("is-running");
}

function onScenePointerLeave() {
  jackWrap.classList.remove("is-running");
}

function placeSceneObjects() {
  const level = getCurrentLevel();
  candlePoint = getPointAtT(level.candleT);
  goalPoint = getPointAtT(GOAL_T);

  const candleLeft = candlePoint.x - 24;
  const candleTop = candlePoint.y + 66;
  candleObstacle.style.left = `${candleLeft}px`;
  candleObstacle.style.top = `${candleTop}px`;

  // Collision focuses near the flame head, not the dotted path center.
  candleCollisionPoint = {
    x: candleLeft + 23,
    y: candleTop + 12,
  };

  jackGoal.style.left = `${goalPoint.x - 48}px`;
  jackGoal.style.top = `${goalPoint.y - 2}px`;
}

function tick(nowMs = 0) {
  const deltaMs = previousTickAtMs > 0 ? Math.min(50, nowMs - previousTickAtMs) : 16;
  previousTickAtMs = nowMs;

  updateCharacterVisual();
  updateFallingFlames(deltaMs);
  syncRunningFeetSound();

  if (started && !gameOver && !waitingNextLevel) {
    const jackMetrics = getPathMetricsForPoint(jackPos);
    updatePathProgress(jackMetrics);
    checkGameRules(jackMetrics);
  }

  if (waitingNextLevel && levelAdvanceDueAtMs > 0 && Date.now() >= levelAdvanceDueAtMs) {
    clearLevelAdvanceTimer();
    currentLevelIndex = Math.min(currentLevelIndex + 1, JACK_LEVELS.length - 1);
    updateLevelBadge();
    applyLevelBackground();
    rebuildLayoutAndReset(`Level ${currentLevelIndex + 1}: follow the path and clear the candle.`, "neutral");
  }

  animationFrameId = window.requestAnimationFrame(tick);
}

function rebuildLayoutAndReset(message = "Move your cursor to Jack's start point.", state = "neutral") {
  buildPathCache();
  createDots();
  placeSceneObjects();
  resetToStart(message, state);
}

function initialize() {
  fireSound.load();
  runningFeetSound.load();
  loadFlameRainSettingsFromLocalStorage();
  refreshFlameRainSettingsFromApi();
  flameSettingsRefreshTimerId = window.setInterval(() => {
    refreshFlameRainSettingsFromApi();
  }, FLAME_SETTINGS_REFRESH_INTERVAL_MS);
  updateLevelBadge();
  applyLevelBackground();
  rebuildLayoutAndReset();

  jackScene.addEventListener("pointermove", onScenePointerMove);
  jackScene.addEventListener("pointerdown", primeFireSound, { once: true });
  jackScene.addEventListener("pointermove", primeFireSound, { once: true });
  jackScene.addEventListener("touchstart", primeFireSound, { once: true });
  jackScene.addEventListener("pointerleave", onScenePointerLeave);
  window.addEventListener("resize", () => {
    rebuildLayoutAndReset("Layout adjusted. Start again from the beginning.", "neutral");
  });

  animationFrameId = window.requestAnimationFrame(tick);
}

initialize();

window.addEventListener("beforeunload", () => {
  clearLevelAdvanceTimer();
  window.clearTimeout(flameResetTimer);
  fireSound.pause();
  stopFireLoopGuard();
  runningFeetSound.pause();
  window.clearInterval(flameSettingsRefreshTimerId);

  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId);
  }
});
