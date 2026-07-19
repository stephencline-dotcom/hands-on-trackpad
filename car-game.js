const carBoard = document.getElementById("carBoard");
const carRoad = carBoard ? carBoard.querySelector(".car-road") : null;
const playerCar = document.getElementById("playerCar");
const scene = document.getElementById("scene");
const leftHand = document.getElementById("leftHand");
const rightHand = document.getElementById("rightHand");
const carObstacles = document.getElementById("carObstacles");
const carDodgedBadge = document.getElementById("carDodgedBadge");
const carHitsBadge = document.getElementById("carHitsBadge");
const carLevelBadge = document.getElementById("carLevelBadge");
const carFuelBadge = document.getElementById("carFuelBadge");
const carFuelFill = document.getElementById("carFuelFill");
const carFuelText = document.getElementById("carFuelText");
const carToast = document.getElementById("carToast");
const carStart = document.getElementById("carStart");
const carFinishBanner = document.getElementById("carFinishBanner");
const carPlayAgainBtn = document.getElementById("carPlayAgainBtn");

const OBSTACLE_IMAGES = ["images/pinkcar.png", "images/greencar.png", "images/redcar.png", "images/blackcar.png"];
const BIRD_IMAGE = "images/bird.png";
const AIRPLANE_IMAGE = "images/airplane.png";
const GASPUMP_IMAGE = "images/gaspump.png";
const CAR_LEVEL_BACKGROUNDS = [
  "images/roadbackground.png",
  "images/tent.png",
  "images/living-room.png",
  "images/yar.png",
  "images/beach.png",
  "images/desert.png",
];

const SETTINGS_API_PATH = "/api/settings";
const CAR_LEVEL_ENABLED_KEYS = [
  "carGameLevel1Enabled",
  "carGameLevel2Enabled",
  "carGameLevel3Enabled",
  "carGameLevel4Enabled",
  "carGameLevel5Enabled",
  "carGameLevel6Enabled",
];
const CAR_LEVEL_SPEED_KEYS = [
  "carGameLevel1Speed",
  "carGameLevel2Speed",
  "carGameLevel3Speed",
  "carGameLevel4Speed",
  "carGameLevel5Speed",
  "carGameLevel6Speed",
];
const CAR_LEVEL_MAX_CARS_KEYS = [
  "carGameLevel1MaxCars",
  "carGameLevel2MaxCars",
  "carGameLevel3MaxCars",
  "carGameLevel4MaxCars",
  "carGameLevel5MaxCars",
  "carGameLevel6MaxCars",
];
const CAR_LEVEL_SURVIVAL_KEYS = [
  "carGameLevel1Survival",
  "carGameLevel2Survival",
  "carGameLevel3Survival",
  "carGameLevel4Survival",
  "carGameLevel5Survival",
  "carGameLevel6Survival",
];
const CAR_LEVEL_FUEL_DRAIN_KEYS = [
  "carGameLevel1FuelDrain",
  "carGameLevel2FuelDrain",
  "carGameLevel3FuelDrain",
  "carGameLevel4FuelDrain",
  "carGameLevel5FuelDrain",
  "carGameLevel6FuelDrain",
];
const CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS_KEYS = [
  "carGameLevel1GasPumpSpawnSeconds",
  "carGameLevel2GasPumpSpawnSeconds",
  "carGameLevel3GasPumpSpawnSeconds",
  "carGameLevel4GasPumpSpawnSeconds",
  "carGameLevel5GasPumpSpawnSeconds",
  "carGameLevel6GasPumpSpawnSeconds",
];

const DEFAULT_CAR_LEVEL_SPEEDS = [0.18, 0.21, 0.24, 0.28, 0.33, 0.38];
const DEFAULT_CAR_LEVEL_MAX_CARS = [1, 2, 2, 3, 3, 4];
const DEFAULT_CAR_LEVEL_SURVIVAL = [12, 16, 20, 24, 28, 32];
const DEFAULT_CAR_LEVEL_FUEL_DRAIN = [2.2, 2.8, 3.5, 4.3, 5.2, 6.2];
const DEFAULT_CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS = [4.2, 4.8, 5.4, 6.0, 6.6, 7.2];

const BIRD_PROGRESS_PER_SEC = 0.26;
const BIRD_SPAWN_MIN_MS = 3200;
const BIRD_SPAWN_MAX_MS = 5600;
const AIRPLANE_PROGRESS_PER_SEC = 0.22;
const AIRPLANE_SPAWN_MIN_MS = 5600;
const AIRPLANE_SPAWN_MAX_MS = 9800;
const GASPUMP_SPAWN_MIN_MS = 2000;
const GASPUMP_SPAWN_MAX_MS = 30000;
const GASPUMP_START_PROGRESS = -0.45;
const GASPUMP_END_PROGRESS = 1.28;
const GASPUMP_SPEED_MULTIPLIER = 0.62;
const GASPUMP_PICKUP_MIN_SIZE_RATIO = 0.46;
const GASPUMP_PICKUP_WINDOW_TOP_RATIO = 0.09;
const GASPUMP_PICKUP_WINDOW_BOTTOM_RATIO = 0.25;
const CAR_SETTINGS_REFRESH_INTERVAL_MS = 2000;
const NEXT_LEVEL_DELAY_MS = 1000;

const FUEL_MAX = 100;
const FUEL_REFILL_PER_PICKUP = 48;
const FUEL_REFILL_PER_SEC = 34;
const FUEL_LOW_THRESHOLD = 35;
const FUEL_CRITICAL_THRESHOLD = 18;

const LAYOUT = {
  scene: { width: 626, height: 437 },
  trackpadScale: 0.84,
  leftStart: { x: -34, y: 178 },
  rightStart: { x: 230, y: 158 },
};

const drivingAudio = new Audio("sounds/driving sound.mp3");
const honkAudio = new Audio("sounds/honk.mp3");
const crashAudio = new Audio("sounds/crashsound.mp3");
const wingflapAudio = new Audio("sounds/wingflap.mp3");
const airplaneAudio = new Audio("sounds/airplanesound.mp3");
const gasFillAudio = new Audio("sounds/water fill.wav");
const CRASH_AUDIO_START_OFFSET = 0.12;
const HONK_COOLDOWN_MS = 10000;

drivingAudio.loop = true;
drivingAudio.preload = "auto";
drivingAudio.volume = 0.35;

honkAudio.preload = "auto";
honkAudio.volume = 0.25;

crashAudio.preload = "auto";
crashAudio.volume = 0.7;

wingflapAudio.loop = true;
wingflapAudio.preload = "auto";
wingflapAudio.volume = 0.22;

airplaneAudio.loop = true;
airplaneAudio.preload = "auto";
airplaneAudio.volume = 0.24;

gasFillAudio.preload = "auto";
gasFillAudio.volume = 0.45;

let carX = 0;
let targetX = 0;
let animationFrameId = null;
let lastTimestamp = 0;

let gameActive = false;
let currentLevelIndex = 0;
let crashCount = 0;
let levelElapsedMs = 0;
let score = 0;
let toastTimer = null;
let gasFillStopTimer = null;
let levelAdvanceTimer = null;
let levelAdvanceDueAtMs = 0;
let waitingNextLevel = false;
let isPressed = false;
let carLevelGasPumpSpawnSeconds = [...DEFAULT_CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS];

let spawnTimerMs = 0;
let birdSpawnTimerMs = 0;
let nextBirdSpawnMs = randomBirdSpawnMs();
let airplaneSpawnTimerMs = 0;
let nextAirplaneSpawnMs = randomAirplaneSpawnMs();
let gasPumpSpawnTimerMs = 0;
let nextGasPumpSpawnMs = GASPUMP_SPAWN_MIN_MS;
let nextObstacleId = 1;
let obstacles = [];
let fuelLevel = FUEL_MAX;
let pendingFuelRefill = 0;
let lastHonkAtMs = -Infinity;

let audioEnabled = false;
let volumeOn = true;
let carObstaclesTop = null;
let carLevelOverlay = null;

let carLevelsEnabled = [true, true, true, true, true, true];
let carLevelObstacleSpeeds = [...DEFAULT_CAR_LEVEL_SPEEDS];
let carLevelMaxCars = [...DEFAULT_CAR_LEVEL_MAX_CARS];
let carLevelSurvivalSeconds = [...DEFAULT_CAR_LEVEL_SURVIVAL];
let carLevelFuelDrainPerSec = [...DEFAULT_CAR_LEVEL_FUEL_DRAIN];
// Read the teacher-controlled movement mode once and reuse it everywhere on this page.
const CAR_REQUIRE_CLICK_AND_DRAG_KEY = "carRequireClickAndDrag";
const carMovementGate = window.trackpadMovementSettings.createClickAndDragGate(CAR_REQUIRE_CLICK_AND_DRAG_KEY);
const trackpadGuideController = window.trackpadGuide.create({
  scene,
  leftHand,
  rightHand,
  sceneWidth: LAYOUT.scene.width,
  sceneHeight: LAYOUT.scene.height,
  trackpadScale: LAYOUT.trackpadScale,
  leftStart: LAYOUT.leftStart,
  rightStart: LAYOUT.rightStart,
  pointerSpace: "viewport",
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
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

function parseCarLevelSpeed(value, fallback = 0.2) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return clamp(parsed, 0.08, 1.2);
}

function parseCarLevelMaxCars(value, fallback = 2) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return clamp(parsed, 1, 12);
}

function parseCarLevelSurvival(value, fallback = 20) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return clamp(parsed, 5, 180);
}

function parseCarFuelDrain(value, fallback = 3.6) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return clamp(parsed, 0.5, 12);
}

function parseCarGasPumpSpawnSeconds(value, fallback = 5.8) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return clamp(parsed, 2, 30);
}

function parseBooleanLevelArray(value, fallback = true) {
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

function parseNumberLevelArray(value, parser, fallbackArray) {
  if (Array.isArray(value)) {
    const normalized = value.slice(0, 6).map((item, index) => parser(item, fallbackArray[index]));
    while (normalized.length < 6) {
      normalized.push(fallbackArray[normalized.length]);
    }
    return normalized;
  }

  if (value && typeof value === "object") {
    return [1, 2, 3, 4, 5, 6].map((level, index) => parser(value[`level${level}`], fallbackArray[index]));
  }

  return [...fallbackArray];
}

function loadCarSettingsFromLocalStorage() {
  carLevelsEnabled = CAR_LEVEL_ENABLED_KEYS.map((key) => parseTaskEnabled(localStorage.getItem(key), true));
  carLevelObstacleSpeeds = CAR_LEVEL_SPEED_KEYS.map((key, index) =>
    parseCarLevelSpeed(localStorage.getItem(key), DEFAULT_CAR_LEVEL_SPEEDS[index])
  );
  carLevelMaxCars = CAR_LEVEL_MAX_CARS_KEYS.map((key, index) =>
    parseCarLevelMaxCars(localStorage.getItem(key), DEFAULT_CAR_LEVEL_MAX_CARS[index])
  );
  carLevelSurvivalSeconds = CAR_LEVEL_SURVIVAL_KEYS.map((key, index) =>
    parseCarLevelSurvival(localStorage.getItem(key), DEFAULT_CAR_LEVEL_SURVIVAL[index])
  );
  carLevelFuelDrainPerSec = CAR_LEVEL_FUEL_DRAIN_KEYS.map((key, index) =>
    parseCarFuelDrain(localStorage.getItem(key), DEFAULT_CAR_LEVEL_FUEL_DRAIN[index])
  );
  carLevelGasPumpSpawnSeconds = CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS_KEYS.map((key, index) =>
    parseCarGasPumpSpawnSeconds(localStorage.getItem(key), DEFAULT_CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS[index])
  );
}

function saveCarSettingsLocally() {
  CAR_LEVEL_ENABLED_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carLevelsEnabled[index]));
  });
  CAR_LEVEL_SPEED_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carLevelObstacleSpeeds[index]));
  });
  CAR_LEVEL_MAX_CARS_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carLevelMaxCars[index]));
  });
  CAR_LEVEL_SURVIVAL_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carLevelSurvivalSeconds[index]));
  });
  CAR_LEVEL_FUEL_DRAIN_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carLevelFuelDrainPerSec[index]));
  });
  CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carLevelGasPumpSpawnSeconds[index]));
  });
}

async function loadCarSettingsShared() {
  loadCarSettingsFromLocalStorage();
  let hasChange = false;

  try {
    const response = await fetch(SETTINGS_API_PATH, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      const nextEnabled = parseBooleanLevelArray(data.carGameLevelsEnabled, true);
      const nextSpeeds = parseNumberLevelArray(
        data.carGameLevelObstacleSpeeds,
        parseCarLevelSpeed,
        DEFAULT_CAR_LEVEL_SPEEDS
      );
      const nextMaxCars = parseNumberLevelArray(
        data.carGameLevelMaxCars,
        parseCarLevelMaxCars,
        DEFAULT_CAR_LEVEL_MAX_CARS
      );
      const nextSurvival = parseNumberLevelArray(
        data.carGameLevelSurvivalSeconds,
        parseCarLevelSurvival,
        DEFAULT_CAR_LEVEL_SURVIVAL
      );
      const nextFuelDrain = parseNumberLevelArray(
        data.carGameLevelFuelDrainPerSecond,
        parseCarFuelDrain,
        DEFAULT_CAR_LEVEL_FUEL_DRAIN
      );
      const nextGasPumpSeconds = parseNumberLevelArray(
        data.carGameLevelGasPumpSpawnSeconds,
        parseCarGasPumpSpawnSeconds,
        DEFAULT_CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS
      );

      hasChange =
        nextEnabled.some((value, index) => value !== carLevelsEnabled[index]) ||
        nextSpeeds.some((value, index) => value !== carLevelObstacleSpeeds[index]) ||
        nextMaxCars.some((value, index) => value !== carLevelMaxCars[index]) ||
        nextSurvival.some((value, index) => value !== carLevelSurvivalSeconds[index]) ||
        nextFuelDrain.some((value, index) => value !== carLevelFuelDrainPerSec[index]) ||
        nextGasPumpSeconds.some((value, index) => value !== carLevelGasPumpSpawnSeconds[index]);

      if (hasChange) {
        carLevelsEnabled = nextEnabled;
        carLevelObstacleSpeeds = nextSpeeds;
        carLevelMaxCars = nextMaxCars;
        carLevelSurvivalSeconds = nextSurvival;
        carLevelFuelDrainPerSec = nextFuelDrain;
        carLevelGasPumpSpawnSeconds = nextGasPumpSeconds;
        saveCarSettingsLocally();
      }
    }
  } catch {
    // Keep local fallback when API is unavailable.
  }

  if (!carLevelsEnabled[currentLevelIndex]) {
    const firstEnabled = getFirstEnabledLevelIndex();
    if (firstEnabled >= 0) {
      currentLevelIndex = firstEnabled;
    }
  }

  updateLevelBadge();
  updateTimeBadge();

  return hasChange;
}

async function refreshCarSettingsLive() {
  const hasChange = await loadCarSettingsShared();
  if (!hasChange) {
    return;
  }

  if (gameActive) {
    // Recompute future spawn timing so new admin values take effect immediately.
    nextGasPumpSpawnMs = randomGasPumpSpawnMs();
    gasPumpSpawnTimerMs = Math.min(gasPumpSpawnTimerMs, nextGasPumpSpawnMs);
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

function getCurrentLevelConfig() {
  return {
    speed: carLevelObstacleSpeeds[currentLevelIndex],
    maxCars: carLevelMaxCars[currentLevelIndex],
    survivalSeconds: carLevelSurvivalSeconds[currentLevelIndex],
    fuelDrainPerSec: carLevelFuelDrainPerSec[currentLevelIndex],
    gasPumpSpawnSeconds: carLevelGasPumpSpawnSeconds[currentLevelIndex],
  };
}

function updateLevelBadge() {
  if (!carLevelBadge) {
    return;
  }

  carLevelBadge.textContent = `Level ${currentLevelIndex + 1} of 6`;
  applyLevelBackground();
}

function applyLevelBackground() {
  if (!carBoard) {
    return;
  }

  const backgroundImage = CAR_LEVEL_BACKGROUNDS[currentLevelIndex] || CAR_LEVEL_BACKGROUNDS[0];
  carBoard.style.background = `url("${backgroundImage}") center bottom / 100% 100% no-repeat`;
}

function updateCrashBadge() {
  if (!carHitsBadge) {
    return;
  }

  carHitsBadge.textContent = `Crashes ${crashCount}`;
}

function updateTimeBadge() {
  if (!carDodgedBadge) {
    return;
  }

  const config = getCurrentLevelConfig();
  const elapsedSeconds = Math.min(config.survivalSeconds, levelElapsedMs / 1000);
  carDodgedBadge.textContent = `Survive ${elapsedSeconds.toFixed(1)}/${config.survivalSeconds}s`;
}

function updateFuelMeter() {
  const clampedFuel = clamp(fuelLevel, 0, FUEL_MAX);
  const fuelPercent = Math.round((clampedFuel / FUEL_MAX) * 100);

  if (carFuelFill) {
    carFuelFill.style.width = `${fuelPercent}%`;
  }

  if (carFuelText) {
    carFuelText.textContent = `${fuelPercent}%`;
  }

  if (carFuelBadge) {
    carFuelBadge.classList.toggle("low", clampedFuel <= FUEL_LOW_THRESHOLD && clampedFuel > FUEL_CRITICAL_THRESHOLD);
    carFuelBadge.classList.toggle("critical", clampedFuel <= FUEL_CRITICAL_THRESHOLD);
  }
}

function setFuelLevel(nextLevel) {
  fuelLevel = clamp(nextLevel, 0, FUEL_MAX);
  updateFuelMeter();
}

function hideFinalBanner() {
  if (!carFinishBanner) {
    return;
  }

  carFinishBanner.hidden = true;
}

function showFinalBanner() {
  if (!carFinishBanner) {
    return;
  }

  carFinishBanner.hidden = false;
}

function updateStartButtonVisibility() {
  if (!carStart) {
    return;
  }

  const showStart = !gameActive && !waitingNextLevel && (!carFinishBanner || carFinishBanner.hidden);
  carStart.classList.toggle("hidden", !showStart);
  carStart.classList.toggle("pulse-cue", showStart);
}

function clearLevelAdvanceTimer() {
  if (levelAdvanceTimer) {
    window.clearTimeout(levelAdvanceTimer);
    levelAdvanceTimer = null;
  }

  levelAdvanceDueAtMs = 0;
}

function hideLevelOverlay() {
  if (!carLevelOverlay) {
    return;
  }

  carLevelOverlay.hidden = true;
  carLevelOverlay.textContent = "";
}

function showLevelOverlay(message) {
  if (!carLevelOverlay) {
    return;
  }

  carLevelOverlay.textContent = message;
  carLevelOverlay.hidden = false;
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

function showToast(message, durationMs = 2200) {
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

function randomBirdSpawnMs() {
  return BIRD_SPAWN_MIN_MS + Math.random() * (BIRD_SPAWN_MAX_MS - BIRD_SPAWN_MIN_MS);
}

function randomAirplaneSpawnMs() {
  return AIRPLANE_SPAWN_MIN_MS + Math.random() * (AIRPLANE_SPAWN_MAX_MS - AIRPLANE_SPAWN_MIN_MS);
}

function randomGasPumpSpawnMs() {
  const baseMs = getCurrentLevelConfig().gasPumpSpawnSeconds * 1000;
  const minMs = clamp(baseMs * 0.72, GASPUMP_SPAWN_MIN_MS, GASPUMP_SPAWN_MAX_MS - 250);
  const maxMs = clamp(baseMs * 1.28, minMs + 250, GASPUMP_SPAWN_MAX_MS);
  return minMs + Math.random() * (maxMs - minMs);
}

function hasBirdOnScreen() {
  return obstacles.some((item) => item.type === "bird");
}

function hasAirplaneOnScreen() {
  return obstacles.some((item) => item.type === "airplane");
}

function tryPlay(audio) {
  audio.play().catch(() => {
    // Ignore autoplay-block errors until user interaction unlocks audio.
  });
}

function startDrivingAudio() {
  if (!audioEnabled || !gameActive) {
    return;
  }

  tryPlay(drivingAudio);
}

function stopDrivingAudio() {
  drivingAudio.pause();
  drivingAudio.currentTime = 0;
}

function playHonk() {
  if (!audioEnabled || !gameActive) {
    return;
  }

  const now = performance.now();
  if (now - lastHonkAtMs < HONK_COOLDOWN_MS) {
    return;
  }

  lastHonkAtMs = now;
  honkAudio.currentTime = 0;
  tryPlay(honkAudio);
}

function playCrash() {
  if (!audioEnabled) {
    return;
  }

  crashAudio.pause();
  crashAudio.currentTime = CRASH_AUDIO_START_OFFSET;
  tryPlay(crashAudio);
}

function stopGasFillAudio() {
  if (gasFillStopTimer) {
    window.clearTimeout(gasFillStopTimer);
    gasFillStopTimer = null;
  }

  gasFillAudio.pause();
  gasFillAudio.currentTime = 0;
}

function startGasFillAudio() {
  if (!audioEnabled) {
    return;
  }

  stopGasFillAudio();
  gasFillAudio.currentTime = 0;
  tryPlay(gasFillAudio);
}

function syncGasFillAudio() {
  if (!audioEnabled || !gameActive || pendingFuelRefill <= 0) {
    stopGasFillAudio();
    return;
  }

  if (gasFillAudio.paused) {
    startGasFillAudio();
  }
}

function syncBirdAudio() {
  if (!audioEnabled || !gameActive) {
    wingflapAudio.pause();
    wingflapAudio.currentTime = 0;
    return;
  }

  if (hasBirdOnScreen()) {
    tryPlay(wingflapAudio);
  } else {
    wingflapAudio.pause();
    wingflapAudio.currentTime = 0;
  }
}

function syncAirplaneAudio() {
  if (!audioEnabled || !gameActive) {
    airplaneAudio.pause();
    airplaneAudio.currentTime = 0;
    return;
  }

  if (hasAirplaneOnScreen()) {
    tryPlay(airplaneAudio);
  } else {
    airplaneAudio.pause();
    airplaneAudio.currentTime = 0;
  }
}

function enableAudio() {
  if (audioEnabled) {
    return;
  }

  audioEnabled = true;

  // Prime short effects so first real trigger has less startup latency.
  [honkAudio, crashAudio, gasFillAudio].forEach((audio) => {
    audio.muted = true;
    audio.currentTime = 0;
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    }).catch(() => {
      audio.muted = false;
    });
  });

  startDrivingAudio();
  syncBirdAudio();
  syncAirplaneAudio();
  syncGasFillAudio();
}

function applyVolumeState() {
  const muted = !volumeOn;
  [drivingAudio, honkAudio, crashAudio, wingflapAudio, airplaneAudio, gasFillAudio].forEach((a) => {
    a.muted = muted;
  });
  const btn = document.getElementById("carVolumeToggle");
  if (btn) {
    btn.textContent = volumeOn ? "\uD83D\uDD0A" : "\uD83D\uDD07";
    btn.setAttribute("aria-label", volumeOn ? "Mute sound" : "Unmute sound");
  }
}

function toggleVolume() {
  volumeOn = !volumeOn;
  applyVolumeState();
}

function getRoadGeometry() {
  if (!carBoard || !carRoad || !playerCar) {
    return null;
  }

  const boardRect = carBoard.getBoundingClientRect();
  const roadRect = carRoad.getBoundingClientRect();

  const roadLeft = roadRect.left - boardRect.left;
  const roadTop = roadRect.top - boardRect.top;
  const roadWidth = roadRect.width;
  const roadHeight = roadRect.height;

  return {
    centerX: roadLeft + roadWidth / 2,
    topRoadY: roadTop + roadHeight * 0.18,
    bottomRoadY: carBoard.clientHeight - playerCar.offsetHeight * 0.42,
    topLaneOffset: roadWidth * 0.035,
    bottomLaneOffset: roadWidth * 0.215,
  };
}

function getRoadBoundsAtBottom() {
  if (!carBoard || !carRoad) {
    return { left: 0, right: 0 };
  }

  const boardRect = carBoard.getBoundingClientRect();
  const roadRect = carRoad.getBoundingClientRect();
  const carWidth = playerCar ? playerCar.offsetWidth : 0;

  const roadLeft = roadRect.left - boardRect.left;
  const roadWidth = roadRect.width;
  const roadCenter = roadLeft + roadWidth / 2;
  const innerRoadHalfWidth = roadWidth * 0.22;
  const padding = Math.max(carWidth * 0.4, 8);

  return {
    left: roadCenter - innerRoadHalfWidth + padding,
    right: roadCenter + innerRoadHalfWidth - padding,
  };
}

function updateTargetFromPointer(event) {
  if (!carBoard) {
    return;
  }

  const boardRect = carBoard.getBoundingClientRect();
  targetX = clamp(event.clientX - boardRect.left, 0, boardRect.width);
}

function updateCarPosition(dtMs) {
  if (!carBoard || !playerCar) {
    return;
  }

  const bounds = getRoadBoundsAtBottom();
  const safeTargetX = clamp(targetX, bounds.left, bounds.right);

  // Cursor steering stays exactly the same: glide to pointer position.
  const smoothAmount = clamp(dtMs * 0.008, 0.06, 0.22);
  carX = lerp(carX, safeTargetX, smoothAmount);

  carX = clamp(carX, bounds.left, bounds.right);
  playerCar.style.left = `${carX}px`;
}

function updateRightFromPointer(event) {
  if (!trackpadGuideController) {
    return;
  }

  trackpadGuideController.updateFromPointerEvent(event);
}

function setPressedState(pressed) {
  isPressed = pressed;

  if (trackpadGuideController) {
    trackpadGuideController.setPressed(pressed);
  }
}

function clearObstacles() {
  obstacles.forEach((item) => item.node.remove());
  obstacles = [];
  syncBirdAudio();
  syncAirplaneAudio();
  syncGasFillAudio();
}

function spawnCarObstacle() {
  if (!carObstacles || !gameActive) {
    return;
  }

  const node = document.createElement("img");
  node.className = "car-obstacle";
  node.alt = "";
  node.setAttribute("aria-hidden", "true");
  node.src = OBSTACLE_IMAGES[Math.floor(Math.random() * OBSTACLE_IMAGES.length)];

  const lane = Math.random() < 0.5 ? "left" : "right";

  carObstacles.appendChild(node);
  obstacles.push({ id: nextObstacleId, node, type: "car", lane, progress: 0 });
  nextObstacleId += 1;
}

function spawnBird() {
  if (!carObstacles || !carBoard || !gameActive) {
    return;
  }

  const node = document.createElement("img");
  node.className = "car-obstacle car-bird";
  node.alt = "";
  node.setAttribute("aria-hidden", "true");
  node.src = BIRD_IMAGE;

  const direction = Math.random() < 0.5 ? "ltr" : "rtl";
  node.style.setProperty("--bird-flip", direction === "rtl" ? "-1" : "1");

  const birdDepth = 0.2 + Math.random() * 0.7;
  const birdWavePhase = Math.random() * Math.PI * 2;

  carObstacles.appendChild(node);
  obstacles.push({ id: nextObstacleId, node, type: "bird", direction, progress: 0, birdDepth, birdWavePhase });
  nextObstacleId += 1;
  syncBirdAudio();
}

function spawnAirplane() {
  if (!carObstacles || !carBoard || !gameActive) {
    return;
  }

  const node = document.createElement("img");
  node.className = "car-obstacle car-airplane";
  node.alt = "";
  node.setAttribute("aria-hidden", "true");
  node.src = AIRPLANE_IMAGE;

  const direction = Math.random() < 0.5 ? "ltr" : "rtl";
  node.style.setProperty("--airplane-flip", direction === "rtl" ? "1" : "-1");

  const airplaneDepth = 0.12 + Math.random() * 0.76;
  const flightMode = Math.random() < 0.28 ? "loop" : "straight";
  const flightPhase = Math.random() * Math.PI * 2;

  carObstacles.appendChild(node);
  obstacles.push({
    id: nextObstacleId,
    node,
    type: "airplane",
    direction,
    progress: 0,
    airplaneDepth,
    flightMode,
    flightPhase,
    prevX: null,
  });
  nextObstacleId += 1;
  syncAirplaneAudio();
}

function spawnGasPump() {
  if (!carObstacles || !gameActive) {
    return;
  }

  const node = document.createElement("img");
  node.className = "car-obstacle car-gaspump";
  node.alt = "";
  node.setAttribute("aria-hidden", "true");
  node.src = GASPUMP_IMAGE;

  const lane = Math.random() < 0.5 ? "left" : "right";

  carObstacles.appendChild(node);
  obstacles.push({ id: nextObstacleId, node, type: "gaspump", lane, progress: GASPUMP_START_PROGRESS });
  nextObstacleId += 1;
}

function getObstacleScreenState(obstacle) {
  const road = getRoadGeometry();
  if (!road) {
    return null;
  }

  const rawProgress = obstacle.progress;
  const progress = clamp(rawProgress, 0, 1);
  const curvedProgress = Math.pow(progress, 1.15);

  const laneOffset = lerp(road.topLaneOffset, road.bottomLaneOffset, curvedProgress);

  let x;
  let y;
  if (obstacle.type === "bird") {
    const boardWidth = carBoard ? carBoard.clientWidth : 0;
    const birdDepth = clamp(obstacle.birdDepth ?? 0.22, 0, 1);
    const startX = obstacle.direction === "ltr" ? -60 : boardWidth + 60;
    const endX = obstacle.direction === "ltr" ? boardWidth + 60 : -60;

    x = lerp(startX, endX, rawProgress);

    const boardHeight = carBoard ? carBoard.clientHeight : 0;
    const skyTopY = boardHeight * 0.06;
    const skyBottomY = boardHeight * 0.3;
    const baseY = lerp(skyTopY, skyBottomY, birdDepth);
    const waveY = Math.sin(rawProgress * 10 + (obstacle.birdWavePhase ?? 0)) * 6;
    y = baseY + waveY;
  } else if (obstacle.type === "airplane") {
    const boardWidth = carBoard ? carBoard.clientWidth : 0;
    const airplaneDepth = clamp(obstacle.airplaneDepth ?? 0.35, 0, 1);
    const startX = obstacle.direction === "ltr" ? -120 : boardWidth + 120;
    const endX = obstacle.direction === "ltr" ? boardWidth + 120 : -120;

    const boardHeight = carBoard ? carBoard.clientHeight : 0;
    const skyTopY = boardHeight * 0.03;
    const skyBottomY = boardHeight * 0.24;
    const baseY = lerp(skyTopY, skyBottomY, airplaneDepth);

    if (obstacle.flightMode === "loop") {
      const centerX = lerp(startX, endX, rawProgress);
      const loopX = Math.sin(rawProgress * Math.PI * 2 + (obstacle.flightPhase ?? 0)) * 70;
      x = centerX + loopX;
      y = baseY + Math.cos(rawProgress * Math.PI * 2 + (obstacle.flightPhase ?? 0)) * 38;
    } else {
      x = lerp(startX, endX, rawProgress);
      y = baseY + Math.sin(rawProgress * 8 + (obstacle.flightPhase ?? 0)) * 10;
    }

    if (obstacle.prevX !== null) {
      const movingRight = x >= obstacle.prevX;
      obstacle.node.style.setProperty("--airplane-flip", movingRight ? "-1" : "1");
    }
    obstacle.prevX = x;
  } else {
    x = obstacle.lane === "left" ? road.centerX - laneOffset : road.centerX + laneOffset;
    if (obstacle.type === "gaspump") {
      const pumpProgress = clamp(
        (rawProgress - GASPUMP_START_PROGRESS) / (GASPUMP_END_PROGRESS - GASPUMP_START_PROGRESS),
        0,
        1
      );
      const pumpTravel = Math.pow(pumpProgress, 1.08);
      const boardBottom = carBoard ? carBoard.clientHeight : road.bottomRoadY;
      const overshootBottom = boardBottom + (playerCar ? playerCar.offsetHeight * 0.6 : 36);
      y = lerp(road.topRoadY, overshootBottom, pumpTravel);
    } else {
      y = lerp(road.topRoadY, road.bottomRoadY, curvedProgress);
    }
  }

  const playerWidth = playerCar ? playerCar.offsetWidth : 44;
  const playerHeight = playerCar ? playerCar.offsetHeight : 66;
  const birdSizeProgress =
    obstacle.type === "bird" ? clamp((obstacle.birdDepth ?? 0.22) * 0.78 + progress * 0.22, 0, 1) : curvedProgress;
  const airplaneSizeProgress =
    obstacle.type === "airplane"
      ? clamp((obstacle.airplaneDepth ?? 0.35) * 0.78 + progress * 0.22, 0, 1)
      : curvedProgress;
  const width =
    obstacle.type === "bird"
      ? lerp(26, playerWidth * 2.2, birdSizeProgress)
      : obstacle.type === "airplane"
        ? lerp(24, playerWidth * 3.2, airplaneSizeProgress)
        : obstacle.type === "gaspump"
          ? lerp(
              14,
              playerWidth * 1.55,
              clamp((rawProgress - GASPUMP_START_PROGRESS) / (1 - GASPUMP_START_PROGRESS), 0, 1)
            )
          : lerp(10, playerWidth * 1.32, curvedProgress);
  const height =
    obstacle.type === "bird"
      ? lerp(18, playerHeight * 1.55, birdSizeProgress)
      : obstacle.type === "airplane"
        ? lerp(14, playerHeight * 1.75, airplaneSizeProgress)
        : obstacle.type === "gaspump"
          ? lerp(
              20,
              playerHeight * 1.65,
              clamp((rawProgress - GASPUMP_START_PROGRESS) / (1 - GASPUMP_START_PROGRESS), 0, 1)
            )
          : lerp(16, playerHeight * 1.32, curvedProgress);

  return { x, y, width, height };
}

function removeObstacle(id) {
  obstacles = obstacles.filter((item) => {
    if (item.id !== id) {
      return true;
    }

    item.node.remove();
    return false;
  });

  syncBirdAudio();
  syncAirplaneAudio();
}

function isCollidingWithPlayer(obstacle, obstacleState) {
  if (!carBoard || !playerCar) {
    return false;
  }

  if (obstacle.type !== "car") {
    return false;
  }

  const carWidth = playerCar.offsetWidth;
  const carHeight = playerCar.offsetHeight;
  const carCenterY = carBoard.clientHeight - 2 - carHeight / 2;

  const minCrashWidth = carWidth * 0.55;
  const minCrashHeight = carHeight * 0.55;
  const isCrashEligible = obstacleState.width >= minCrashWidth || obstacleState.height >= minCrashHeight;
  if (!isCrashEligible) {
    return false;
  }

  const passedPlayerDepth = hasPassedPlayerDepth(obstacleState);
  if (passedPlayerDepth) {
    return false;
  }

  // Smaller hitboxes keep near-miss visuals from counting as crashes.
  const carHitboxWidth = carWidth * 0.6;
  const carHitboxHeight = carHeight * 0.7;
  const obstacleHitboxWidth = obstacleState.width * 0.6;
  const obstacleHitboxHeight = obstacleState.height * 0.7;

  const carRect = {
    left: carX - carHitboxWidth / 2,
    right: carX + carHitboxWidth / 2,
    top: carCenterY - carHitboxHeight / 2,
    bottom: carCenterY + carHitboxHeight / 2,
  };

  const obstacleRect = {
    left: obstacleState.x - obstacleHitboxWidth / 2,
    right: obstacleState.x + obstacleHitboxWidth / 2,
    top: obstacleState.y - obstacleHitboxHeight / 2,
    bottom: obstacleState.y + obstacleHitboxHeight / 2,
  };

  return (
    obstacleRect.left < carRect.right &&
    obstacleRect.right > carRect.left &&
    obstacleRect.top < carRect.bottom &&
    obstacleRect.bottom > carRect.top
  );
}

function isCollectingGasPump(obstacle, obstacleState) {
  if (!carBoard || !playerCar || obstacle.type !== "gaspump") {
    return false;
  }

  const carWidth = playerCar.offsetWidth;
  const carHeight = playerCar.offsetHeight;
  const carCenterY = carBoard.clientHeight - 2 - carHeight / 2;

  const minPickupWidth = carWidth * GASPUMP_PICKUP_MIN_SIZE_RATIO;
  const minPickupHeight = carHeight * GASPUMP_PICKUP_MIN_SIZE_RATIO;
  const isSizeEligible = obstacleState.width >= minPickupWidth || obstacleState.height >= minPickupHeight;
  if (!isSizeEligible) {
    return false;
  }

  const carHitboxWidth = carWidth * 0.6;
  const carHitboxHeight = carHeight * 0.7;
  const obstacleHitboxWidth = obstacleState.width * 0.6;
  const obstacleHitboxHeight = obstacleState.height * 0.7;

  const carRect = {
    left: carX - carHitboxWidth / 2,
    right: carX + carHitboxWidth / 2,
    top: carCenterY - carHitboxHeight / 2,
    bottom: carCenterY + carHitboxHeight / 2,
  };

  const pumpRect = {
    left: obstacleState.x - obstacleHitboxWidth / 2,
    right: obstacleState.x + obstacleHitboxWidth / 2,
    top: obstacleState.y - obstacleHitboxHeight / 2,
    bottom: obstacleState.y + obstacleHitboxHeight / 2,
  };

  // Three-phase pickup window:
  // too early (not collectible) -> passing through car depth (collectible) -> too late (not collectible).
  const pickupStartY = carRect.top + carHitboxHeight * GASPUMP_PICKUP_WINDOW_TOP_RATIO;
  const pickupEndY = carRect.bottom - carHitboxHeight * GASPUMP_PICKUP_WINDOW_BOTTOM_RATIO;
  if (obstacleState.y < pickupStartY || obstacleState.y > pickupEndY) {
    return false;
  }

  return (
    pumpRect.left < carRect.right &&
    pumpRect.right > carRect.left &&
    pumpRect.top < carRect.bottom &&
    pumpRect.bottom > carRect.top
  );
}

function hasPassedPlayerDepth(obstacleState) {
  if (!carBoard || !playerCar) {
    return false;
  }

  const carHeight = playerCar.offsetHeight;
  const carCenterY = carBoard.clientHeight - 2 - carHeight / 2;
  const carHitboxHeight = carHeight * 0.7;
  return obstacleState.y > carCenterY + carHitboxHeight * 0.08;
}

function getCarSpawnIntervalMs() {
  const { speed } = getCurrentLevelConfig();
  // Faster levels spawn cars more often.
  return clamp(1350 - speed * 1700, 280, 1200);
}

function handleCrash() {
  clearLevelAdvanceTimer();
  waitingNextLevel = false;
  hideLevelOverlay();
  hideFinalBanner();
  gameActive = false;
  crashCount += 1;
  updateCrashBadge();

  playCrash();
  stopGasFillAudio();
  stopDrivingAudio();
  syncBirdAudio();
  syncAirplaneAudio();

  if (carBoard) {
    carBoard.classList.add("car-hit-flash");
  }

  if (carStart) {
    carStart.textContent = "PLAY AGAIN";
  }

  showToast("Crash! Click START to retry this level.", 0);
  updateStartButtonVisibility();
}

function handleOutOfGas() {
  clearLevelAdvanceTimer();
  waitingNextLevel = false;
  hideLevelOverlay();
  hideFinalBanner();
  gameActive = false;

  stopGasFillAudio();
  stopDrivingAudio();
  syncBirdAudio();
  syncAirplaneAudio();

  if (carStart) {
    carStart.textContent = "PLAY AGAIN";
  }

  showToast("Out of gas! Grab gas pumps and click START to retry.", 0);
  updateStartButtonVisibility();
}

function handleLevelComplete() {
  clearLevelAdvanceTimer();
  gameActive = false;
  stopGasFillAudio();
  stopDrivingAudio();
  syncBirdAudio();
  clearObstacles();

  const completedLevel = currentLevelIndex + 1;
  const nextLevel = getNextEnabledLevelIndex(currentLevelIndex);
  if (nextLevel >= 0) {
    currentLevelIndex = nextLevel;
    levelElapsedMs = 0;
    waitingNextLevel = true;
    updateLevelBadge();
    updateTimeBadge();
    showToast(`Level ${completedLevel} complete! Next level starting...`, NEXT_LEVEL_DELAY_MS);
    showLevelOverlay("Way to go! On to the next level...");
    updateStartButtonVisibility();

    levelAdvanceDueAtMs = Date.now() + NEXT_LEVEL_DELAY_MS;
    levelAdvanceTimer = window.setTimeout(() => {
      levelAdvanceTimer = null;
      levelAdvanceDueAtMs = 0;
      waitingNextLevel = false;
      hideLevelOverlay();
      startLevel();
    }, NEXT_LEVEL_DELAY_MS);
    return;
  } else {
    waitingNextLevel = false;
    hideLevelOverlay();
    showToast(`Level ${completedLevel} complete! You finished all enabled levels.`, 3500);
    showFinalBanner();
  }

  updateStartButtonVisibility();
}

function updateObstacles(dtMs) {
  if (!gameActive || !carObstacles) {
    return;
  }

  const levelConfig = getCurrentLevelConfig();
  const carSpawnIntervalMs = getCarSpawnIntervalMs();

  spawnTimerMs += dtMs;
  while (spawnTimerMs >= carSpawnIntervalMs) {
    spawnTimerMs -= carSpawnIntervalMs;
    const activeCarCount = obstacles.filter((item) => item.type === "car").length;
    if (activeCarCount < levelConfig.maxCars) {
      spawnCarObstacle();
    }
  }

  birdSpawnTimerMs += dtMs;
  if (birdSpawnTimerMs >= nextBirdSpawnMs) {
    spawnBird();
    birdSpawnTimerMs = 0;
    nextBirdSpawnMs = randomBirdSpawnMs();
  }

  airplaneSpawnTimerMs += dtMs;
  if (airplaneSpawnTimerMs >= nextAirplaneSpawnMs) {
    spawnAirplane();
    airplaneSpawnTimerMs = 0;
    nextAirplaneSpawnMs = randomAirplaneSpawnMs();
  }

  gasPumpSpawnTimerMs += dtMs;
  const activeGasPumpCount = obstacles.filter((item) => item.type === "gaspump").length;
  if (activeGasPumpCount < 1 && gasPumpSpawnTimerMs >= nextGasPumpSpawnMs) {
    spawnGasPump();
    gasPumpSpawnTimerMs = 0;
    nextGasPumpSpawnMs = randomGasPumpSpawnMs();
  }

  const dtSec = dtMs / 1000;
  obstacles.forEach((obstacle) => {
    obstacle.progress +=
      (obstacle.type === "bird"
        ? BIRD_PROGRESS_PER_SEC
        : obstacle.type === "airplane"
          ? AIRPLANE_PROGRESS_PER_SEC
          : obstacle.type === "gaspump"
            ? levelConfig.speed * GASPUMP_SPEED_MULTIPLIER
          : levelConfig.speed) * dtSec;

    const state = getObstacleScreenState(obstacle);
    if (!state) {
      return;
    }

    obstacle.node.style.left = `${state.x}px`;
    obstacle.node.style.top = `${state.y}px`;
    obstacle.node.style.width = `${state.width}px`;
    obstacle.node.style.height = `${state.height}px`;

    if (obstacle.type === "car") {
      const passedPlayerDepth = hasPassedPlayerDepth(state);
      if (passedPlayerDepth && !obstacle.isPast && carObstaclesTop) {
        obstacle.isPast = true;
        carObstaclesTop.appendChild(obstacle.node);
      }
    }

    if (obstacle.type === "gaspump") {
      const passedPlayerDepth = hasPassedPlayerDepth(state);
      if (passedPlayerDepth && !obstacle.isPast && carObstaclesTop) {
        obstacle.isPast = true;
        carObstaclesTop.appendChild(obstacle.node);
      }
    }

    if (isCollidingWithPlayer(obstacle, state)) {
      handleCrash();
      return;
    }

    if (isCollectingGasPump(obstacle, state)) {
      const fuelSpace = FUEL_MAX - (fuelLevel + pendingFuelRefill);
      const fuelToQueue = clamp(Math.min(FUEL_REFILL_PER_PICKUP, fuelSpace), 0, FUEL_REFILL_PER_PICKUP);
      if (fuelToQueue > 0) {
        pendingFuelRefill += fuelToQueue;
        syncGasFillAudio();
      }
      showToast("Fuel up!", 850);
      removeObstacle(obstacle.id);
      return;
    }

    if (obstacle.type === "bird") {
      if (obstacle.progress > 1.06) {
        removeObstacle(obstacle.id);
      }
      return;
    }

    if (obstacle.type === "airplane") {
      if (obstacle.progress > 1.08) {
        removeObstacle(obstacle.id);
      }
      return;
    }

    if (obstacle.type === "gaspump") {
      if (obstacle.progress > GASPUMP_END_PROGRESS) {
        removeObstacle(obstacle.id);
      }
      return;
    }

    if (obstacle.progress > 1.03) {
      score += 1;
      playHonk();
      removeObstacle(obstacle.id);
    }
  });

  syncBirdAudio();
  syncAirplaneAudio();
  syncGasFillAudio();
}

function updateGame(dtMs) {
  if (!gameActive) {
    return;
  }

  const { fuelDrainPerSec } = getCurrentLevelConfig();
  setFuelLevel(fuelLevel - fuelDrainPerSec * (dtMs / 1000));

  if (pendingFuelRefill > 0) {
    const refillAmount = Math.min(pendingFuelRefill, FUEL_REFILL_PER_SEC * (dtMs / 1000));
    pendingFuelRefill = Math.max(0, pendingFuelRefill - refillAmount);
    setFuelLevel(fuelLevel + refillAmount);
  }

  syncGasFillAudio();

  if (fuelLevel <= 0) {
    handleOutOfGas();
    return;
  }

  levelElapsedMs += dtMs;
  updateTimeBadge();

  updateObstacles(dtMs);

  const { survivalSeconds } = getCurrentLevelConfig();
  if (levelElapsedMs >= survivalSeconds * 1000) {
    handleLevelComplete();
  }
}

function startLevel() {
  clearLevelAdvanceTimer();
  waitingNextLevel = false;
  hideLevelOverlay();
  hideFinalBanner();

  const firstEnabled = getFirstEnabledLevelIndex();
  if (firstEnabled < 0) {
    showToast("Enable at least one Car Game level in Admin settings.", 5000);
    return;
  }

  if (!carLevelsEnabled[currentLevelIndex]) {
    currentLevelIndex = firstEnabled;
  }

  gameActive = true;
  lastHonkAtMs = -Infinity;
  updateStartButtonVisibility();
  score = 0;
  levelElapsedMs = 0;
  spawnTimerMs = 0;
  birdSpawnTimerMs = 0;
  nextBirdSpawnMs = randomBirdSpawnMs();
  airplaneSpawnTimerMs = 0;
  nextAirplaneSpawnMs = randomAirplaneSpawnMs();
  gasPumpSpawnTimerMs = 0;
  nextGasPumpSpawnMs = randomGasPumpSpawnMs();
  pendingFuelRefill = 0;
  stopGasFillAudio();
  setFuelLevel(FUEL_MAX);

  clearObstacles();
  hideToast();
  if (carBoard) {
    carBoard.classList.remove("car-hit-flash");
  }

  if (carStart) {
    carStart.textContent = "START";
  }

  updateLevelBadge();
  updateTimeBadge();
  updateStartButtonVisibility();
  startDrivingAudio();
  syncBirdAudio();
  syncAirplaneAudio();
}

function gameLoop(timestamp) {
  if (!lastTimestamp) {
    lastTimestamp = timestamp;
  }

  const dtMs = clamp(timestamp - lastTimestamp, 0, 48);
  lastTimestamp = timestamp;

  updateCarPosition(dtMs);
  updateGame(dtMs);

  // Failsafe: ensure the next level starts even if a timeout callback is dropped.
  if (waitingNextLevel && levelAdvanceDueAtMs > 0 && Date.now() >= levelAdvanceDueAtMs) {
    clearLevelAdvanceTimer();
    waitingNextLevel = false;
    hideLevelOverlay();
    startLevel();
  }

  animationFrameId = window.requestAnimationFrame(gameLoop);
}

function initializeCar() {
  if (!carBoard || !playerCar) {
    return;
  }

  carObstaclesTop = document.createElement("div");
  carObstaclesTop.className = "car-obstacles car-obstacles-top";
  carObstaclesTop.setAttribute("aria-hidden", "true");
  carBoard.appendChild(carObstaclesTop);

  carLevelOverlay = document.createElement("div");
  carLevelOverlay.className = "car-level-overlay";
  carLevelOverlay.hidden = true;
  carLevelOverlay.setAttribute("role", "status");
  carLevelOverlay.setAttribute("aria-live", "polite");
  carBoard.appendChild(carLevelOverlay);

  if (trackpadGuideController) {
    trackpadGuideController.initialize();
  }

  const bounds = getRoadBoundsAtBottom();
  carX = (bounds.left + bounds.right) / 2;
  targetX = carX;
  playerCar.style.left = `${carX}px`;

  loadCarSettingsFromLocalStorage();
  const firstEnabled = getFirstEnabledLevelIndex();
  if (firstEnabled >= 0) {
    currentLevelIndex = firstEnabled;
  }

  updateLevelBadge();
  updateCrashBadge();
  updateTimeBadge();
  updateFuelMeter();
  updateStartButtonVisibility();

  loadCarSettingsShared();
  window.setInterval(() => {
    refreshCarSettingsLive().catch(() => {
      // Ignore transient refresh failures and keep current settings.
    });
  }, CAR_SETTINGS_REFRESH_INTERVAL_MS);

  carBoard.addEventListener("pointermove", (event) => {
    if (carMovementGate.shouldMove(event)) {
      updateTargetFromPointer(event);
    }
  });
  carBoard.addEventListener("pointerenter", (event) => {
    if (!carMovementGate.isRequireClickAndDragEnabled()) {
      updateTargetFromPointer(event);
    }
  });

  carBoard.addEventListener("pointerdown", (event) => {
    carMovementGate.begin(event);
    updateTargetFromPointer(event);
  });
  document.addEventListener("pointerup", (event) => {
    carMovementGate.end(event);
  });
  document.addEventListener("pointercancel", (event) => {
    carMovementGate.end(event);
  });

  carBoard.addEventListener("pointerdown", enableAudio, { once: true });
  carBoard.addEventListener("pointermove", enableAudio, { once: true });
  carBoard.addEventListener("pointerenter", enableAudio, { once: true });

  const carVolumeToggle = document.getElementById("carVolumeToggle");
  if (carVolumeToggle) {
    carVolumeToggle.addEventListener("click", toggleVolume);
  }

  if (carStart) {
    carStart.addEventListener("click", () => {
      enableAudio();
      startLevel();
    });
  }

  if (carPlayAgainBtn) {
    carPlayAgainBtn.addEventListener("click", () => {
      const firstEnabled = getFirstEnabledLevelIndex();
      if (firstEnabled >= 0) {
        currentLevelIndex = firstEnabled;
      }
      enableAudio();
      startLevel();
    });
  }

  window.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && !gameActive) {
      event.preventDefault();
      enableAudio();
      startLevel();
    }
  });

  window.addEventListener("resize", () => {
    const nextBounds = getRoadBoundsAtBottom();
    carX = clamp(carX, nextBounds.left, nextBounds.right);
    targetX = clamp(targetX, nextBounds.left, nextBounds.right);
  });

  document.addEventListener("pointermove", (event) => {
    if (carMovementGate.shouldMove(event)) {
      updateRightFromPointer(event);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    carMovementGate.begin(event);
    setPressedState(true);
    updateRightFromPointer(event);
  });

  document.addEventListener("pointerup", (event) => {
    carMovementGate.end(event);
    setPressedState(false);
  });

  document.addEventListener("pointercancel", (event) => {
    carMovementGate.end(event);
    setPressedState(false);
  });

  animationFrameId = window.requestAnimationFrame(gameLoop);
}

initializeCar();

window.addEventListener("beforeunload", () => {
  clearLevelAdvanceTimer();

  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId);
  }

  stopDrivingAudio();
  wingflapAudio.pause();
  airplaneAudio.pause();
  stopGasFillAudio();
});
