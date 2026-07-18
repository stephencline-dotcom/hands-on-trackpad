const task1DurationInput = document.getElementById("task1Duration");
const task1EnabledToggle = document.getElementById("task1EnabledToggle");
const task2ClicksInput = document.getElementById("task2Clicks");
const task2EnabledToggle = document.getElementById("task2EnabledToggle");
const task3DragSecondsInput = document.getElementById("task3DragSeconds");
const task3EnabledToggle = document.getElementById("task3EnabledToggle");
const fullscreenRequireClickAndDragToggle = document.getElementById("fullscreenRequireClickAndDragToggle");
const mazeRequireClickAndDragToggle = document.getElementById("mazeRequireClickAndDragToggle");
const carRequireClickAndDragToggle = document.getElementById("carRequireClickAndDragToggle");
const jackRequireClickAndDragToggle = document.getElementById("jackRequireClickAndDragToggle");
const fullscreenGameActiveToggle = document.getElementById("fullscreenGameActiveToggle");
const mazeGameActiveToggle = document.getElementById("mazeGameActiveToggle");
const carGameActiveToggle = document.getElementById("carGameActiveToggle");
const jackGameActiveToggle = document.getElementById("jackGameActiveToggle");
const lightGameActiveToggle = document.getElementById("lightGameActive");
const streetCarGameActiveToggle = document.getElementById("streetCarGameActive");
const dragonDodgeGameActiveToggle = document.getElementById("dragonDodgeGameActive");
const firefighterRescueGameActiveToggle = document.getElementById("firefighterRescueGameActive");
const martianMadnessGameActiveToggle = document.getElementById("martianMadnessGameActive");
const soundEnabledToggle = document.getElementById("soundEnabledToggle");
const trainingPausedToggle = document.getElementById("trainingPausedToggle");
const jackFlameRainInputs = [4, 5, 6].map((level) => ({
  enabled: document.getElementById(`jackFlameRain${level}EnabledToggle`),
  size: document.getElementById(`jackFlameRain${level}Size`),
  hitRadius: document.getElementById(`jackFlameRain${level}HitRadius`),
  burstMin: document.getElementById(`jackFlameRain${level}BurstMin`),
  burstMax: document.getElementById(`jackFlameRain${level}BurstMax`),
  intervalMin: document.getElementById(`jackFlameRain${level}IntervalMin`),
  intervalMax: document.getElementById(`jackFlameRain${level}IntervalMax`),
  speedMin: document.getElementById(`jackFlameRain${level}SpeedMin`),
  speedMax: document.getElementById(`jackFlameRain${level}SpeedMax`),
}));
const mazeGhostLevelToggles = [1, 2, 3, 4, 5, 6].map((level) =>
  document.getElementById(`mazeGhostLevel${level}Toggle`)
);
const mazeGhostLevelCountInputs = [1, 2, 3, 4, 5, 6].map((level) =>
  document.getElementById(`mazeGhostLevel${level}Count`)
);
const carGameLevelToggles = [1, 2, 3, 4, 5, 6].map((level) =>
  document.getElementById(`carGameLevel${level}Toggle`)
);
const carGameLevelSpeedInputs = [1, 2, 3, 4, 5, 6].map((level) =>
  document.getElementById(`carLevel${level}Speed`)
);
const carGameLevelMaxCarsInputs = [1, 2, 3, 4, 5, 6].map((level) =>
  document.getElementById(`carLevel${level}MaxCars`)
);
const carGameLevelSurvivalInputs = [1, 2, 3, 4, 5, 6].map((level) =>
  document.getElementById(`carLevel${level}Survival`)
);
const carGameLevelGasPumpSpawnInputs = [1, 2, 3, 4, 5, 6].map((level) =>
  document.getElementById(`carLevel${level}GasPumpSpawn`)
);
const carGameLevelFuelDrainInputs = [1, 2, 3, 4, 5, 6].map((level) =>
  document.getElementById(`carLevel${level}FuelDrain`)
);
const lightTapLevelInputs = [1, 2, 3].map((level) => ({
  lives: document.getElementById(`adminLivesL${level}`),
  time: document.getElementById(`adminTimeL${level}`),
  goal: document.getElementById(`adminGoalL${level}`),
}));
const streetCarLevelInputs = [1, 2, 3].map((level) => ({
  spawnInterval: document.getElementById(`adminCarSpawnIntervalL${level}`),
  targetColor: document.getElementById(`adminCarTargetColorL${level}`),
  timeLimit: document.getElementById(`adminCarTimeL${level}`),
  carCount: document.getElementById(`adminCarCountL${level}`),
  missesAllowed: document.getElementById(`adminCarMissesL${level}`),
  goal: document.getElementById(`adminCarGoalL${level}`),
  speedMin: document.getElementById(`adminCarSpeedMinL${level}`),
  speedMax: document.getElementById(`adminCarSpeedMaxL${level}`),
}));
const dragonLevelInputs = [1, 2, 3, 4].map((level) => ({
  dragonCount: document.getElementById(`adminDragonCountL${level}`),
  timeLimit: document.getElementById(`adminDragonTimeL${level}`),
  missesAllowed: document.getElementById(`adminDragonMissesL${level}`),
  goal: document.getElementById(`adminDragonGoalL${level}`),
  fireDurationSeconds: document.getElementById(`adminDragonFireDurationL${level}`),
  speedMin: document.getElementById(`adminDragonSpeedMinL${level}`),
  speedMax: document.getElementById(`adminDragonSpeedMaxL${level}`),
}));
const fireLevelInputs = [1, 2, 3].map((level) => ({
  timeLimit: document.getElementById(`adminFireTimeL${level}`),
  missesAllowed: document.getElementById(`adminFireMissesL${level}`),
  goal: document.getElementById(`adminFireGoalL${level}`),
  spawnIntervalSeconds: document.getElementById(`adminFireSpawnIntervalL${level}`),
  flameDurationSeconds: document.getElementById(`adminFireFlameDurationL${level}`),
}));
const martianLevelInputs = [1, 2, 3].map((level) => ({
  peopleCount: document.getElementById(`adminMartianPeopleCountL${level}`),
  ufoCount: document.getElementById(`adminMartianUfoCountL${level}`),
  ufoSpeed: document.getElementById(`adminMartianUfoSpeedL${level}`),
  liftSpeed: document.getElementById(`adminMartianLiftSpeedL${level}`),
}));
const adminTaskCard = document.querySelector(".admin-task-card");
const taskSummaryPill = document.getElementById("taskSummaryPill");
const carSummaryPill = document.getElementById("carSummaryPill");
const mazeSummaryPill = document.getElementById("mazeSummaryPill");
const tabButtons = Array.from(document.querySelectorAll(".admin-tab-button"));
const tabPanels = Array.from(document.querySelectorAll(".admin-tab-content"));
const applyPresetsBtn = document.getElementById("applyPresetsBtn");
const saveTask1Btn = document.getElementById("saveTask1Btn");
const task1SavedMessage = document.getElementById("task1SavedMessage");

const TASK1_STORAGE_KEY = "trackpadTask1RequiredSeconds";
const TASK2_STORAGE_KEY = "trackpadTask2RequiredClicks";
const TASK3_STORAGE_KEY = "trackpadTask3RequiredDragSeconds";
const TASK1_ENABLED_KEY = "trackpadTask1Enabled";
const TASK2_ENABLED_KEY = "trackpadTask2Enabled";
const TASK3_ENABLED_KEY = "trackpadTask3Enabled";
const FULLSCREEN_REQUIRE_CLICK_AND_DRAG_KEY = "fullscreenRequireClickAndDrag";
const MAZE_REQUIRE_CLICK_AND_DRAG_KEY = "mazeRequireClickAndDrag";
const CAR_REQUIRE_CLICK_AND_DRAG_KEY = "carRequireClickAndDrag";
const JACK_REQUIRE_CLICK_AND_DRAG_KEY = "jackRequireClickAndDrag";
const FULLSCREEN_GAME_ACTIVE_KEY = "fullscreenGameActive";
const MAZE_GAME_ACTIVE_KEY = "mazeGameActive";
const CAR_GAME_ACTIVE_KEY = "carGameActive";
const JACK_GAME_ACTIVE_KEY = "jackGameActive";
const LIGHT_GAME_ACTIVE_KEY = "lightGameActive";
const STREET_CAR_GAME_ACTIVE_KEY = "streetCarGameActive";
const DRAGON_DODGE_GAME_ACTIVE_KEY = "dragonDodgeGameActive";
const FIREFIGHTER_RESCUE_GAME_ACTIVE_KEY = "firefighterRescueGameActive";
const MARTIAN_MADNESS_GAME_ACTIVE_KEY = "martianMadnessGameActive";
const SOUND_ENABLED_KEY = "trackpadSoundEnabled";
const TRAINING_PAUSED_KEY = "trackpadTrainingPaused";
const MOVING_SOUND_ADMIN_SETTINGS_STORAGE_KEY = "moving-sound-admin-settings-v1";
const JACK_FLAME_RAIN_KEYS = [4, 5, 6].map((level) => ({
  enabled: `jackFlameRain${level}Enabled`,
  size: `jackFlameRain${level}SizePx`,
  hitRadius: `jackFlameRain${level}HitRadiusPx`,
  burstMin: `jackFlameRain${level}BurstMin`,
  burstMax: `jackFlameRain${level}BurstMax`,
  intervalMin: `jackFlameRain${level}IntervalMinMs`,
  intervalMax: `jackFlameRain${level}IntervalMaxMs`,
  speedMin: `jackFlameRain${level}SpeedMin`,
  speedMax: `jackFlameRain${level}SpeedMax`,
}));
const MAZE_GHOST_LEVEL_ENABLED_KEYS = [
  "mazeGhostLevel1Enabled",
  "mazeGhostLevel2Enabled",
  "mazeGhostLevel3Enabled",
  "mazeGhostLevel4Enabled",
  "mazeGhostLevel5Enabled",
  "mazeGhostLevel6Enabled",
];
const MAZE_GHOST_LEVEL_COUNT_KEYS = [
  "mazeGhostLevel1Count",
  "mazeGhostLevel2Count",
  "mazeGhostLevel3Count",
  "mazeGhostLevel4Count",
  "mazeGhostLevel5Count",
  "mazeGhostLevel6Count",
];
const CAR_GAME_LEVEL_ENABLED_KEYS = [
  "carGameLevel1Enabled",
  "carGameLevel2Enabled",
  "carGameLevel3Enabled",
  "carGameLevel4Enabled",
  "carGameLevel5Enabled",
  "carGameLevel6Enabled",
];
const CAR_GAME_LEVEL_SPEED_KEYS = [
  "carGameLevel1Speed",
  "carGameLevel2Speed",
  "carGameLevel3Speed",
  "carGameLevel4Speed",
  "carGameLevel5Speed",
  "carGameLevel6Speed",
];
const CAR_GAME_LEVEL_MAX_CARS_KEYS = [
  "carGameLevel1MaxCars",
  "carGameLevel2MaxCars",
  "carGameLevel3MaxCars",
  "carGameLevel4MaxCars",
  "carGameLevel5MaxCars",
  "carGameLevel6MaxCars",
];
const CAR_GAME_LEVEL_SURVIVAL_KEYS = [
  "carGameLevel1Survival",
  "carGameLevel2Survival",
  "carGameLevel3Survival",
  "carGameLevel4Survival",
  "carGameLevel5Survival",
  "carGameLevel6Survival",
];
const CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS_KEYS = [
  "carGameLevel1GasPumpSpawnSeconds",
  "carGameLevel2GasPumpSpawnSeconds",
  "carGameLevel3GasPumpSpawnSeconds",
  "carGameLevel4GasPumpSpawnSeconds",
  "carGameLevel5GasPumpSpawnSeconds",
  "carGameLevel6GasPumpSpawnSeconds",
];
const CAR_LEVEL_FUEL_DRAIN_KEYS = [
  "carGameLevel1FuelDrain",
  "carGameLevel2FuelDrain",
  "carGameLevel3FuelDrain",
  "carGameLevel4FuelDrain",
  "carGameLevel5FuelDrain",
  "carGameLevel6FuelDrain",
];
const DEFAULT_TASK1_SECONDS = 8;
const DEFAULT_TASK2_CLICKS = 10;
const DEFAULT_TASK3_DRAG_SECONDS = 6;
const DEFAULT_MAZE_GHOST_LEVEL_COUNTS = [1, 2, 3, 4, 5, 6];
const DEFAULT_GHOST_LEVEL_COUNT = DEFAULT_MAZE_GHOST_LEVEL_COUNTS[0];
const DEFAULT_CAR_LEVEL_SPEEDS = [0.16, 0.22, 0.28, 0.34, 0.4, 0.48];
const DEFAULT_CAR_LEVEL_MAX_CARS = [1, 2, 3, 4, 5, 6];
const DEFAULT_CAR_LEVEL_SURVIVAL = [10, 15, 20, 25, 30, 35];
const DEFAULT_CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS = [5.2, 4.8, 4.4, 4.0, 3.6, 3.2];
const DEFAULT_CAR_LEVEL_FUEL_DRAIN = [1.8, 2.4, 3.2, 4.0, 5.0, 6.2];
const DEFAULT_LIGHT_TAP_LEVELS = [
  { lives: 3, time: 30, goal: 10 },
  { lives: 3, time: 25, goal: 12 },
  { lives: 3, time: 20, goal: 15 },
];
const DEFAULT_MOVING_SOUND_CAR_LEVELS = [
  { spawnInterval: 1.5, targetColor: "#38bdf8", timeLimit: 30, carCount: 4, missesAllowed: 3, goal: 8, speedMin: 70, speedMax: 125 },
  { spawnInterval: 1.2, targetColor: "#f97316", timeLimit: 26, carCount: 5, missesAllowed: 3, goal: 10, speedMin: 135, speedMax: 220 },
  { spawnInterval: 0.95, targetColor: "#34d399", timeLimit: 22, carCount: 6, missesAllowed: 3, goal: 12, speedMin: 240, speedMax: 360 },
];
const DEFAULT_MOVING_SOUND_DRAGON_LEVELS = [
  { dragonCount: 1, timeLimit: 30, missesAllowed: 3, goal: 6, fireDurationSeconds: 1, speedMin: 100, speedMax: 170 },
  { dragonCount: 2, timeLimit: 27, missesAllowed: 3, goal: 10, fireDurationSeconds: 0.9, speedMin: 125, speedMax: 195 },
  { dragonCount: 3, timeLimit: 24, missesAllowed: 3, goal: 15, fireDurationSeconds: 0.75, speedMin: 150, speedMax: 225 },
  { dragonCount: 4, timeLimit: 22, missesAllowed: 4, goal: 18, fireDurationSeconds: 0.7, speedMin: 170, speedMax: 245 },
];
const DEFAULT_MOVING_SOUND_FIRE_LEVELS = [
  { timeLimit: 30, missesAllowed: 3, goal: 8, spawnIntervalSeconds: 0.85, flameDurationSeconds: 1.58, helpSpawnChance: 0.3 },
  { timeLimit: 26, missesAllowed: 3, goal: 11, spawnIntervalSeconds: 0.72, flameDurationSeconds: 1.35, helpSpawnChance: 0.33 },
  { timeLimit: 22, missesAllowed: 3, goal: 14, spawnIntervalSeconds: 0.62, flameDurationSeconds: 1.15, helpSpawnChance: 0.36 },
];
const DEFAULT_MOVING_SOUND_MARTIAN_LEVELS = [
  { timeLimit: 30, missesAllowed: 3, goal: 6, peopleCount: 6, ufoCount: 1, walkerSpeedMin: 42, walkerSpeedMax: 68, ufoSpeed: 72, liftSpeed: 124 },
  { timeLimit: 26, missesAllowed: 3, goal: 9, peopleCount: 7, ufoCount: 2, walkerSpeedMin: 54, walkerSpeedMax: 82, ufoSpeed: 86, liftSpeed: 146 },
  { timeLimit: 22, missesAllowed: 4, goal: 12, peopleCount: 8, ufoCount: 3, walkerSpeedMin: 66, walkerSpeedMax: 96, ufoSpeed: 102, liftSpeed: 168 },
];
const DEFAULT_JACK_FLAME_RAIN_BY_LEVEL = [
  {
    enabled: true,
    size: 22,
    hitRadius: 10,
    burstMin: 2,
    burstMax: 3,
    intervalMin: 700,
    intervalMax: 1400,
    speedMin: 180,
    speedMax: 260,
  },
  {
    enabled: true,
    size: 24,
    hitRadius: 12,
    burstMin: 3,
    burstMax: 5,
    intervalMin: 520,
    intervalMax: 1100,
    speedMin: 250,
    speedMax: 370,
  },
  {
    enabled: true,
    size: 26,
    hitRadius: 13,
    burstMin: 5,
    burstMax: 8,
    intervalMin: 340,
    intervalMax: 700,
    speedMin: 340,
    speedMax: 520,
  },
];
const SETTINGS_API_PATH = "/api/settings";
const ACTIVE_TAB_STORAGE_KEY = "adminSettingsActiveTab";

function setDirtyState(isDirty) {
  if (!adminTaskCard) {
    return;
  }

  adminTaskCard.dataset.dirty = isDirty ? "true" : "false";
}

function updateQuickSummary() {
  if (taskSummaryPill) {
    const taskEnabledCount = [task1EnabledToggle, task2EnabledToggle, task3EnabledToggle].filter(
      (toggle) => toggle && toggle.checked
    ).length;
    taskSummaryPill.textContent = `Tasks ${taskEnabledCount} / 3 enabled`;
  }

  if (carSummaryPill) {
    const enabledCars = carGameLevelToggles.filter((toggle) => toggle && toggle.checked).length;
    carSummaryPill.textContent = `Car levels ${enabledCars} / 6 enabled`;
  }

  if (mazeSummaryPill) {
    const counts = mazeGhostLevelCountInputs.map((inputEl) => parseGhostCount(inputEl ? inputEl.value : 0));
    const average = counts.reduce((sum, value) => sum + value, 0) / counts.length;
    mazeSummaryPill.textContent = `Ghost avg ${average.toFixed(1)}`;
  }
}

function setActiveTab(nextTabName) {
  tabButtons.forEach((button) => {
    const isActive = button.dataset.tab === nextTabName;
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.tabIndex = isActive ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    const panelTabName = panel.id.replace("panel", "").toLowerCase();
    panel.setAttribute("aria-hidden", panelTabName === nextTabName ? "false" : "true");
  });

  sessionStorage.setItem(ACTIVE_TAB_STORAGE_KEY, nextTabName);
}

function initTabs() {
  if (!tabButtons.length || !tabPanels.length) {
    return;
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTab(button.dataset.tab || "quick");
    });

    button.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
        return;
      }

      event.preventDefault();
      const currentIndex = tabButtons.indexOf(button);
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const nextIndex = (currentIndex + direction + tabButtons.length) % tabButtons.length;
      const nextButton = tabButtons[nextIndex];
      nextButton.focus();
      setActiveTab(nextButton.dataset.tab || "quick");
    });
  });

  const savedTab = sessionStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  const allowedTabs = new Set(tabButtons.map((button) => button.dataset.tab));
  const initialTab = allowedTabs.has(savedTab) ? savedTab : "quick";
  setActiveTab(initialTab);
}

function parseTask1Seconds(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TASK1_SECONDS;
  }

  return Math.min(120, Math.max(1, parsed));
}

function parseTask2Clicks(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TASK2_CLICKS;
  }

  return Math.min(200, Math.max(1, parsed));
}

function parseTask3Seconds(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TASK3_DRAG_SECONDS;
  }

  return Math.min(120, Math.max(1, parsed));
}

function parseTrainingPaused(value) {
  if (typeof value === "boolean") {
    return value;
  }

  return String(value) === "true";
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

function parseGhostCount(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_GHOST_LEVEL_COUNT;
  }

  return Math.min(6, Math.max(0, parsed));
}

function parseGhostLevelEnabled(value, fallback = true) {
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

function parseGhostLevelCounts(value, fallback = DEFAULT_GHOST_LEVEL_COUNT) {
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

  if (Number.isFinite(fallback)) {
    return [fallback, fallback, fallback, fallback, fallback, fallback];
  }

  return [...DEFAULT_MAZE_GHOST_LEVEL_COUNTS];
}

function parseCarGameLevelsEnabled(value, fallback = true) {
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

function parseCarLevelSpeed(value, fallback = 0.2) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(1.2, Math.max(0.08, parsed));
}

function parseCarLevelMaxCars(value, fallback = 2) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(12, Math.max(1, parsed));
}

function parseCarLevelSurvival(value, fallback = 20) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(180, Math.max(5, parsed));
}

function parseCarGasPumpSpawnSeconds(value, fallback = 5.8) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(30, Math.max(2, parsed));
}

function parseCarFuelDrain(value, fallback = 3.6) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(12, Math.max(0.5, parsed));
}

function parseJackFlameRainSize(value, fallback = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL[0].size) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(64, Math.max(10, parsed));
}

function parseJackFlameRainHitRadius(value, fallback = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL[0].hitRadius) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(48, Math.max(4, parsed));
}

function parseJackFlameRainBurstMin(value, fallback = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL[0].burstMin) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(8, Math.max(1, parsed));
}

function parseJackFlameRainBurstMax(value, burstMin, fallback = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL[0].burstMax) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(burstMin, fallback);
  }

  return Math.min(10, Math.max(burstMin, parsed));
}

function parseJackFlameRainIntervalMin(value, fallback = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL[0].intervalMin) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(4000, Math.max(160, parsed));
}

function parseJackFlameRainIntervalMax(value, intervalMin, fallback = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL[0].intervalMax) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(intervalMin + 30, fallback);
  }

  return Math.min(5000, Math.max(intervalMin + 30, parsed));
}

function parseJackFlameRainSpeedMin(value, fallback = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL[0].speedMin) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(900, Math.max(80, parsed));
}

function parseJackFlameRainSpeedMax(value, speedMin, fallback = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL[0].speedMax) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return Math.max(speedMin + 1, fallback);
  }

  return Math.min(1200, Math.max(speedMin + 1, parsed));
}

function parseCarLevelArray(value, parser, fallbackArray) {
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

function parseLightTapLevelValue(value, min, max, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

function normalizeLevelArray(levels, defaultLevels, normalizeLevel) {
  return defaultLevels.map((defaults, index) => {
    const level = Array.isArray(levels) ? (levels[index] || {}) : {};
    return normalizeLevel(level, defaults, index);
  });
}

function loadGameLevelsFromStorage(storageField, defaultLevels, normalizeLevels) {
  try {
    const raw = localStorage.getItem(MOVING_SOUND_ADMIN_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return normalizeLevels(defaultLevels);
    }

    const parsed = JSON.parse(raw);
    return normalizeLevels(parsed && parsed[storageField]);
  } catch {
    return normalizeLevels(defaultLevels);
  }
}

function ensureMovingSoundSettingsShape(existingSettings) {
  const next = existingSettings && typeof existingSettings === "object" ? existingSettings : {};

  if (!next.homeMenuVisibility || typeof next.homeMenuVisibility !== "object") {
    next.homeMenuVisibility = {
      showLightGame: true,
      showCarGame: true,
      showDragonGame: true,
      showFireGame: true,
      showMartianGame: true,
    };
  }

  if (!Array.isArray(next.arenaLevels) || next.arenaLevels.length < 3) {
    next.arenaLevels = JSON.parse(JSON.stringify(DEFAULT_LIGHT_TAP_LEVELS));
  }

  if (!Array.isArray(next.carLevels) || next.carLevels.length < 3) {
    next.carLevels = JSON.parse(JSON.stringify(DEFAULT_MOVING_SOUND_CAR_LEVELS));
  }

  if (!Array.isArray(next.dragonLevels) || next.dragonLevels.length < 4) {
    next.dragonLevels = JSON.parse(JSON.stringify(DEFAULT_MOVING_SOUND_DRAGON_LEVELS));
  }

  if (!Array.isArray(next.fireLevels) || next.fireLevels.length < 3) {
    next.fireLevels = JSON.parse(JSON.stringify(DEFAULT_MOVING_SOUND_FIRE_LEVELS));
  }

  if (!Array.isArray(next.martianLevels) || next.martianLevels.length < 3) {
    next.martianLevels = JSON.parse(JSON.stringify(DEFAULT_MOVING_SOUND_MARTIAN_LEVELS));
  }

  return next;
}

function saveGameLevelsToStorage(storageField, levels, normalizeLevels) {
  const normalized = normalizeLevels(levels);

  try {
    const raw = localStorage.getItem(MOVING_SOUND_ADMIN_SETTINGS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const next = ensureMovingSoundSettingsShape(parsed);
    next[storageField] = normalized;
    localStorage.setItem(MOVING_SOUND_ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    const fallbackSettings = ensureMovingSoundSettingsShape({});
    fallbackSettings[storageField] = normalized;
    localStorage.setItem(MOVING_SOUND_ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(fallbackSettings));
  }

  return normalized;
}

function readGameLevelsFromInputs(levelInputs, fieldMap) {
  return levelInputs.map((inputs) => {
    const level = {};

    Object.entries(fieldMap).forEach(([levelKey, inputKey]) => {
      level[levelKey] = inputs[inputKey] ? inputs[inputKey].value : null;
    });

    return level;
  });
}

function applyGameLevelsToInputs(levels, levelInputs, fieldMap) {
  levelInputs.forEach((inputs, index) => {
    const level = levels[index];
    if (!level) {
      return;
    }

    Object.entries(fieldMap).forEach(([levelKey, inputKey]) => {
      if (inputs[inputKey]) {
        inputs[inputKey].value = String(level[levelKey]);
      }
    });
  });
}

function normalizeLightTapLevels(levels) {
  return normalizeLevelArray(levels, DEFAULT_LIGHT_TAP_LEVELS, (level, defaults) => {
    return {
      lives: parseLightTapLevelValue(level.lives, 1, 20, defaults.lives),
      time: parseLightTapLevelValue(level.time, 10, 300, defaults.time),
      goal: parseLightTapLevelValue(level.goal, 1, 200, defaults.goal),
    };
  });
}

function normalizeStreetCarLevels(levels) {
  return normalizeLevelArray(levels, DEFAULT_MOVING_SOUND_CAR_LEVELS, (level, defaults) => {
    const speedMin = parseLightTapLevelValue(level.speedMin, 40, 600, defaults.speedMin);
    const requestedSpeedMax = parseLightTapLevelValue(level.speedMax, 40, 600, defaults.speedMax);
    const speedMax = Math.max(speedMin + 10, requestedSpeedMax);
    const parsedTargetColor = String(level.targetColor || "");

    return {
      spawnInterval: Math.min(6, Math.max(0.5, Number.parseFloat(String(level.spawnInterval || defaults.spawnInterval)) || defaults.spawnInterval)),
      targetColor: ["#38bdf8", "#f97316", "#facc15", "#a78bfa", "#34d399", "#fb7185"].includes(parsedTargetColor)
        ? parsedTargetColor
        : defaults.targetColor,
      timeLimit: parseLightTapLevelValue(level.timeLimit, 10, 300, defaults.timeLimit),
      carCount: parseLightTapLevelValue(level.carCount, 1, 20, defaults.carCount),
      missesAllowed: parseLightTapLevelValue(level.missesAllowed, 1, 20, defaults.missesAllowed),
      goal: parseLightTapLevelValue(level.goal, 1, 200, defaults.goal),
      speedMin,
      speedMax,
    };
  });
}

function normalizeDragonLevels(levels) {
  return normalizeLevelArray(levels, DEFAULT_MOVING_SOUND_DRAGON_LEVELS, (level, defaults) => {
    const speedMin = parseLightTapLevelValue(level.speedMin, 40, 600, defaults.speedMin);
    const requestedSpeedMax = parseLightTapLevelValue(level.speedMax, 40, 600, defaults.speedMax);
    const speedMax = Math.max(speedMin + 10, requestedSpeedMax);
    const parsedFireDuration = Number.parseFloat(String(level.fireDurationSeconds || ""));

    return {
      dragonCount: parseLightTapLevelValue(level.dragonCount, 1, 12, defaults.dragonCount),
      timeLimit: parseLightTapLevelValue(level.timeLimit, 10, 300, defaults.timeLimit),
      missesAllowed: parseLightTapLevelValue(level.missesAllowed, 1, 20, defaults.missesAllowed),
      goal: parseLightTapLevelValue(level.goal, 1, 200, defaults.goal),
      fireDurationSeconds: Number.isFinite(parsedFireDuration)
        ? Math.min(5, Math.max(0.2, parsedFireDuration))
        : defaults.fireDurationSeconds,
      speedMin,
      speedMax,
    };
  });
}

function normalizeFireLevels(levels) {
  return normalizeLevelArray(levels, DEFAULT_MOVING_SOUND_FIRE_LEVELS, (level, defaults) => {
    const parsedSpawnInterval = Number.parseFloat(String(level.spawnIntervalSeconds || ""));
    const parsedFlameDuration = Number.parseFloat(String(level.flameDurationSeconds || ""));

    return {
      timeLimit: parseLightTapLevelValue(level.timeLimit, 10, 300, defaults.timeLimit),
      missesAllowed: parseLightTapLevelValue(level.missesAllowed, 1, 20, defaults.missesAllowed),
      goal: parseLightTapLevelValue(level.goal, 1, 200, defaults.goal),
      spawnIntervalSeconds: Number.isFinite(parsedSpawnInterval)
        ? Math.min(4, Math.max(0.2, parsedSpawnInterval))
        : defaults.spawnIntervalSeconds,
      flameDurationSeconds: Number.isFinite(parsedFlameDuration)
        ? Math.min(6, Math.max(0.3, parsedFlameDuration))
        : defaults.flameDurationSeconds,
      helpSpawnChance: Number.isFinite(Number(level.helpSpawnChance))
        ? Math.min(0.95, Math.max(0.05, Number(level.helpSpawnChance)))
        : defaults.helpSpawnChance,
    };
  });
}

function normalizeMartianLevels(levels) {
  return normalizeLevelArray(levels, DEFAULT_MOVING_SOUND_MARTIAN_LEVELS, (level, defaults) => {
    return {
      timeLimit: parseLightTapLevelValue(level.timeLimit, 10, 300, defaults.timeLimit),
      missesAllowed: parseLightTapLevelValue(level.missesAllowed, 1, 20, defaults.missesAllowed),
      goal: parseLightTapLevelValue(level.goal, 1, 200, defaults.goal),
      peopleCount: parseLightTapLevelValue(level.peopleCount, 1, 9, defaults.peopleCount),
      ufoCount: parseLightTapLevelValue(level.ufoCount, 1, 12, defaults.ufoCount),
      walkerSpeedMin: parseLightTapLevelValue(level.walkerSpeedMin, 10, 300, defaults.walkerSpeedMin),
      walkerSpeedMax: parseLightTapLevelValue(level.walkerSpeedMax, 10, 400, defaults.walkerSpeedMax),
      ufoSpeed: parseLightTapLevelValue(level.ufoSpeed, 20, 300, defaults.ufoSpeed),
      liftSpeed: parseLightTapLevelValue(level.liftSpeed, 40, 600, defaults.liftSpeed),
    };
  });
}

function loadStoredLightTapLevels() {
  return loadGameLevelsFromStorage("arenaLevels", DEFAULT_LIGHT_TAP_LEVELS, normalizeLightTapLevels);
}

function loadStoredStreetCarLevels() {
  return loadGameLevelsFromStorage("carLevels", DEFAULT_MOVING_SOUND_CAR_LEVELS, normalizeStreetCarLevels);
}

function loadStoredDragonLevels() {
  return loadGameLevelsFromStorage("dragonLevels", DEFAULT_MOVING_SOUND_DRAGON_LEVELS, normalizeDragonLevels);
}

function loadStoredFireLevels() {
  return loadGameLevelsFromStorage("fireLevels", DEFAULT_MOVING_SOUND_FIRE_LEVELS, normalizeFireLevels);
}

function loadStoredMartianLevels() {
  return loadGameLevelsFromStorage("martianLevels", DEFAULT_MOVING_SOUND_MARTIAN_LEVELS, normalizeMartianLevels);
}

function saveStoredLightTapLevels(levels) {
  const normalized = saveGameLevelsToStorage("arenaLevels", levels, normalizeLightTapLevels);
  console.log("[admin-settings] Saving Light Tap settings:", normalized);
  console.log("[admin-settings] Saved under key:", MOVING_SOUND_ADMIN_SETTINGS_STORAGE_KEY);
}

function saveStoredStreetCarLevels(levels) {
  saveGameLevelsToStorage("carLevels", levels, normalizeStreetCarLevels);
}

function saveStoredDragonLevels(levels) {
  saveGameLevelsToStorage("dragonLevels", levels, normalizeDragonLevels);
}

function saveStoredFireLevels(levels) {
  saveGameLevelsToStorage("fireLevels", levels, normalizeFireLevels);
}

function saveStoredMartianLevels(levels) {
  saveGameLevelsToStorage("martianLevels", levels, normalizeMartianLevels);
}

function showSavedMessage(text) {
  task1SavedMessage.textContent = text;
  task1SavedMessage.hidden = false;

  window.clearTimeout(showSavedMessage.hideTimer);
  showSavedMessage.hideTimer = window.setTimeout(() => {
    task1SavedMessage.hidden = true;
  }, 1700);
}

function applyProgressivePresets() {
  task1DurationInput.value = String(DEFAULT_TASK1_SECONDS);
  task1EnabledToggle.checked = true;
  task2ClicksInput.value = String(DEFAULT_TASK2_CLICKS);
  task2EnabledToggle.checked = true;
  task3DragSecondsInput.value = String(DEFAULT_TASK3_DRAG_SECONDS);
  task3EnabledToggle.checked = true;
  if (fullscreenRequireClickAndDragToggle) fullscreenRequireClickAndDragToggle.checked = false;
  if (mazeRequireClickAndDragToggle) mazeRequireClickAndDragToggle.checked = false;
  if (carRequireClickAndDragToggle) carRequireClickAndDragToggle.checked = false;
  if (jackRequireClickAndDragToggle) jackRequireClickAndDragToggle.checked = false;
  if (fullscreenGameActiveToggle) fullscreenGameActiveToggle.checked = true;
  if (mazeGameActiveToggle) mazeGameActiveToggle.checked = true;
  if (carGameActiveToggle) carGameActiveToggle.checked = true;
  if (jackGameActiveToggle) jackGameActiveToggle.checked = true;
  if (lightGameActiveToggle) lightGameActiveToggle.checked = true;
  if (streetCarGameActiveToggle) streetCarGameActiveToggle.checked = true;
  if (dragonDodgeGameActiveToggle) dragonDodgeGameActiveToggle.checked = true;
  if (firefighterRescueGameActiveToggle) firefighterRescueGameActiveToggle.checked = true;
  if (martianMadnessGameActiveToggle) martianMadnessGameActiveToggle.checked = true;
  lightTapLevelInputs.forEach((inputs, index) => {
    const defaults = DEFAULT_LIGHT_TAP_LEVELS[index];
    if (inputs.lives) inputs.lives.value = String(defaults.lives);
    if (inputs.time) inputs.time.value = String(defaults.time);
    if (inputs.goal) inputs.goal.value = String(defaults.goal);
  });
  soundEnabledToggle.checked = true;
  trainingPausedToggle.checked = false;

  mazeGhostLevelToggles.forEach((toggle) => {
    if (toggle) {
      toggle.checked = true;
    }
  });

  mazeGhostLevelCountInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(DEFAULT_MAZE_GHOST_LEVEL_COUNTS[index]);
    }
  });

  carGameLevelToggles.forEach((toggle) => {
    if (toggle) {
      toggle.checked = true;
    }
  });

  carGameLevelSpeedInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(DEFAULT_CAR_LEVEL_SPEEDS[index]);
    }
  });

  carGameLevelMaxCarsInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(DEFAULT_CAR_LEVEL_MAX_CARS[index]);
    }
  });

  carGameLevelSurvivalInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(DEFAULT_CAR_LEVEL_SURVIVAL[index]);
    }
  });

  carGameLevelGasPumpSpawnInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(DEFAULT_CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS[index]);
    }
  });

  carGameLevelFuelDrainInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(DEFAULT_CAR_LEVEL_FUEL_DRAIN[index]);
    }
  });

  jackFlameRainInputs.forEach((inputs, index) => {
    const defaults = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL[index];
    if (!defaults) {
      return;
    }

    if (inputs.enabled) inputs.enabled.checked = defaults.enabled;
    if (inputs.size) inputs.size.value = String(defaults.size);
    if (inputs.hitRadius) inputs.hitRadius.value = String(defaults.hitRadius);
    if (inputs.burstMin) inputs.burstMin.value = String(defaults.burstMin);
    if (inputs.burstMax) inputs.burstMax.value = String(defaults.burstMax);
    if (inputs.intervalMin) inputs.intervalMin.value = String(defaults.intervalMin);
    if (inputs.intervalMax) inputs.intervalMax.value = String(defaults.intervalMax);
    if (inputs.speedMin) inputs.speedMin.value = String(defaults.speedMin);
    if (inputs.speedMax) inputs.speedMax.value = String(defaults.speedMax);
  });

  setDirtyState(true);
  updateQuickSummary();
  showSavedMessage("Progressive presets applied. Click Save Settings to publish.");
}

async function loadTask1Settings() {
  let task1Seconds = parseTask1Seconds(localStorage.getItem(TASK1_STORAGE_KEY));
  let task1Enabled = parseTaskEnabled(localStorage.getItem(TASK1_ENABLED_KEY), true);
  let task2Clicks = parseTask2Clicks(localStorage.getItem(TASK2_STORAGE_KEY));
  let task2Enabled = parseTaskEnabled(localStorage.getItem(TASK2_ENABLED_KEY), true);
  let task3Seconds = parseTask3Seconds(localStorage.getItem(TASK3_STORAGE_KEY));
  let task3Enabled = parseTaskEnabled(localStorage.getItem(TASK3_ENABLED_KEY), true);
  let fullscreenRequireClickAndDrag = parseTaskEnabled(localStorage.getItem(FULLSCREEN_REQUIRE_CLICK_AND_DRAG_KEY), false);
  let mazeRequireClickAndDrag = parseTaskEnabled(localStorage.getItem(MAZE_REQUIRE_CLICK_AND_DRAG_KEY), false);
  let carRequireClickAndDrag = parseTaskEnabled(localStorage.getItem(CAR_REQUIRE_CLICK_AND_DRAG_KEY), false);
  let jackRequireClickAndDrag = parseTaskEnabled(localStorage.getItem(JACK_REQUIRE_CLICK_AND_DRAG_KEY), false);
  let fullscreenGameActive = parseTaskEnabled(localStorage.getItem(FULLSCREEN_GAME_ACTIVE_KEY), true);
  let mazeGameActive = parseTaskEnabled(localStorage.getItem(MAZE_GAME_ACTIVE_KEY), true);
  let carGameActive = parseTaskEnabled(localStorage.getItem(CAR_GAME_ACTIVE_KEY), true);
  let jackGameActive = parseTaskEnabled(localStorage.getItem(JACK_GAME_ACTIVE_KEY), true);
  let lightGameActive = parseTaskEnabled(localStorage.getItem(LIGHT_GAME_ACTIVE_KEY), true);
  let streetCarGameActive = parseTaskEnabled(localStorage.getItem(STREET_CAR_GAME_ACTIVE_KEY), true);
  let dragonDodgeGameActive = parseTaskEnabled(localStorage.getItem(DRAGON_DODGE_GAME_ACTIVE_KEY), true);
  let firefighterRescueGameActive = parseTaskEnabled(localStorage.getItem(FIREFIGHTER_RESCUE_GAME_ACTIVE_KEY), true);
  let martianMadnessGameActive = parseTaskEnabled(localStorage.getItem(MARTIAN_MADNESS_GAME_ACTIVE_KEY), true);
  let lightTapLevels = loadStoredLightTapLevels();
  let streetCarLevels = loadStoredStreetCarLevels();
  let dragonLevels = loadStoredDragonLevels();
  let fireLevels = loadStoredFireLevels();
  let martianLevels = loadStoredMartianLevels();
  let soundEnabled = parseTaskEnabled(localStorage.getItem(SOUND_ENABLED_KEY), true);
  let trainingPaused = parseTrainingPaused(localStorage.getItem(TRAINING_PAUSED_KEY));
  const jackFlameRainSettings = [4, 5, 6].map((level, idx) => {
    const keys = JACK_FLAME_RAIN_KEYS[idx];
    const defaults = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL[idx];
    return {
      enabled: parseTaskEnabled(localStorage.getItem(keys.enabled), defaults.enabled),
      size: parseJackFlameRainSize(localStorage.getItem(keys.size), defaults.size),
      hitRadius: parseJackFlameRainHitRadius(localStorage.getItem(keys.hitRadius), defaults.hitRadius),
      burstMin: parseJackFlameRainBurstMin(localStorage.getItem(keys.burstMin), defaults.burstMin),
      burstMax: parseJackFlameRainBurstMax(localStorage.getItem(keys.burstMax), defaults.burstMin, defaults.burstMax),
      intervalMin: parseJackFlameRainIntervalMin(localStorage.getItem(keys.intervalMin), defaults.intervalMin),
      intervalMax: parseJackFlameRainIntervalMax(localStorage.getItem(keys.intervalMax), defaults.intervalMin, defaults.intervalMax),
      speedMin: parseJackFlameRainSpeedMin(localStorage.getItem(keys.speedMin), defaults.speedMin),
      speedMax: parseJackFlameRainSpeedMax(localStorage.getItem(keys.speedMax), defaults.speedMin, defaults.speedMax),
    };
  });
  let mazeGhostLevelsEnabled = MAZE_GHOST_LEVEL_ENABLED_KEYS.map((key) =>
    parseTaskEnabled(localStorage.getItem(key), true)
  );
  let mazeGhostLevelCounts = MAZE_GHOST_LEVEL_COUNT_KEYS.map((key) =>
    parseGhostCount(localStorage.getItem(key))
  );
  let carGameLevelsEnabled = CAR_GAME_LEVEL_ENABLED_KEYS.map((key) =>
    parseTaskEnabled(localStorage.getItem(key), true)
  );
  let carGameLevelObstacleSpeeds = CAR_GAME_LEVEL_SPEED_KEYS.map((key, index) =>
    parseCarLevelSpeed(localStorage.getItem(key), DEFAULT_CAR_LEVEL_SPEEDS[index])
  );
  let carGameLevelMaxCars = CAR_GAME_LEVEL_MAX_CARS_KEYS.map((key, index) =>
    parseCarLevelMaxCars(localStorage.getItem(key), DEFAULT_CAR_LEVEL_MAX_CARS[index])
  );
  let carGameLevelSurvivalSeconds = CAR_GAME_LEVEL_SURVIVAL_KEYS.map((key, index) =>
    parseCarLevelSurvival(localStorage.getItem(key), DEFAULT_CAR_LEVEL_SURVIVAL[index])
  );
  let carGameLevelGasPumpSpawnSeconds = CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS_KEYS.map((key, index) =>
    parseCarGasPumpSpawnSeconds(localStorage.getItem(key), DEFAULT_CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS[index])
  );
  let carGameLevelFuelDrainPerSecond = CAR_LEVEL_FUEL_DRAIN_KEYS.map((key, index) =>
    parseCarFuelDrain(localStorage.getItem(key), DEFAULT_CAR_LEVEL_FUEL_DRAIN[index])
  );

  try {
    const response = await fetch(SETTINGS_API_PATH, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      task1Seconds = parseTask1Seconds(data.task1RequiredSeconds);
      task1Enabled = parseTaskEnabled(data.task1Enabled, true);
      task2Clicks = parseTask2Clicks(data.task2RequiredClicks);
      task2Enabled = parseTaskEnabled(data.task2Enabled, true);
      task3Seconds = parseTask3Seconds(data.task3RequiredDragSeconds);
      task3Enabled = parseTaskEnabled(data.task3Enabled, true);
      fullscreenRequireClickAndDrag = parseTaskEnabled(
        data.fullscreenRequireClickAndDrag,
        fullscreenRequireClickAndDrag
      );
      mazeRequireClickAndDrag = parseTaskEnabled(data.mazeRequireClickAndDrag, mazeRequireClickAndDrag);
      carRequireClickAndDrag = parseTaskEnabled(data.carRequireClickAndDrag, carRequireClickAndDrag);
      jackRequireClickAndDrag = parseTaskEnabled(data.jackRequireClickAndDrag, jackRequireClickAndDrag);
      fullscreenGameActive = parseTaskEnabled(data.fullscreenGameActive, fullscreenGameActive);
      mazeGameActive = parseTaskEnabled(data.mazeGameActive, mazeGameActive);
      carGameActive = parseTaskEnabled(data.carGameActive, carGameActive);
      jackGameActive = parseTaskEnabled(data.jackGameActive, jackGameActive);
      lightGameActive = parseTaskEnabled(data.lightGameActive, lightGameActive);
      streetCarGameActive = parseTaskEnabled(data.streetCarGameActive, streetCarGameActive);
      dragonDodgeGameActive = parseTaskEnabled(data.dragonDodgeGameActive, dragonDodgeGameActive);
      firefighterRescueGameActive = parseTaskEnabled(data.firefighterRescueGameActive, firefighterRescueGameActive);
      martianMadnessGameActive = parseTaskEnabled(data.martianMadnessGameActive, martianMadnessGameActive);
      soundEnabled = parseTaskEnabled(data.soundEnabled, true);
      trainingPaused = parseTrainingPaused(data.trainingPaused);
      [4, 5, 6].forEach((level, idx) => {
        const keys = JACK_FLAME_RAIN_KEYS[idx];
        const defaults = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL[idx];
        const d = data[`jackFlameRain${level}`] || {};
        jackFlameRainSettings[idx] = {
          enabled: parseTaskEnabled(d.enabled, defaults.enabled),
          size: parseJackFlameRainSize(d.size, defaults.size),
          hitRadius: parseJackFlameRainHitRadius(d.hitRadius, defaults.hitRadius),
          burstMin: parseJackFlameRainBurstMin(d.burstMin, defaults.burstMin),
          burstMax: parseJackFlameRainBurstMax(d.burstMax, defaults.burstMin, defaults.burstMax),
          intervalMin: parseJackFlameRainIntervalMin(d.intervalMin, defaults.intervalMin),
          intervalMax: parseJackFlameRainIntervalMax(d.intervalMax, defaults.intervalMin, defaults.intervalMax),
          speedMin: parseJackFlameRainSpeedMin(d.speedMin, defaults.speedMin),
          speedMax: parseJackFlameRainSpeedMax(d.speedMax, defaults.speedMin, defaults.speedMax),
        };
      });
      mazeGhostLevelsEnabled = parseGhostLevelEnabled(data.mazeGhostLevelsEnabled, true);
      mazeGhostLevelCounts = parseGhostLevelCounts(data.mazeGhostLevelsPerLevelCounts, Number.NaN);
      carGameLevelsEnabled = parseCarGameLevelsEnabled(data.carGameLevelsEnabled, true);
      carGameLevelObstacleSpeeds = parseCarLevelArray(
        data.carGameLevelObstacleSpeeds,
        parseCarLevelSpeed,
        DEFAULT_CAR_LEVEL_SPEEDS
      );
      carGameLevelMaxCars = parseCarLevelArray(
        data.carGameLevelMaxCars,
        parseCarLevelMaxCars,
        DEFAULT_CAR_LEVEL_MAX_CARS
      );
      carGameLevelSurvivalSeconds = parseCarLevelArray(
        data.carGameLevelSurvivalSeconds,
        parseCarLevelSurvival,
        DEFAULT_CAR_LEVEL_SURVIVAL
      );
      carGameLevelGasPumpSpawnSeconds = parseCarLevelArray(
        data.carGameLevelGasPumpSpawnSeconds,
        parseCarGasPumpSpawnSeconds,
        DEFAULT_CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS
      );
      carGameLevelFuelDrainPerSecond = parseCarLevelArray(
        data.carGameLevelFuelDrainPerSecond,
        parseCarFuelDrain,
        DEFAULT_CAR_LEVEL_FUEL_DRAIN
      );
      localStorage.setItem(TASK1_STORAGE_KEY, String(task1Seconds));
      localStorage.setItem(TASK1_ENABLED_KEY, String(task1Enabled));
      localStorage.setItem(TASK2_STORAGE_KEY, String(task2Clicks));
      localStorage.setItem(TASK2_ENABLED_KEY, String(task2Enabled));
      localStorage.setItem(TASK3_STORAGE_KEY, String(task3Seconds));
      localStorage.setItem(TASK3_ENABLED_KEY, String(task3Enabled));
      localStorage.setItem(FULLSCREEN_REQUIRE_CLICK_AND_DRAG_KEY, String(fullscreenRequireClickAndDrag));
      localStorage.setItem(MAZE_REQUIRE_CLICK_AND_DRAG_KEY, String(mazeRequireClickAndDrag));
      localStorage.setItem(CAR_REQUIRE_CLICK_AND_DRAG_KEY, String(carRequireClickAndDrag));
      localStorage.setItem(JACK_REQUIRE_CLICK_AND_DRAG_KEY, String(jackRequireClickAndDrag));
      localStorage.setItem(FULLSCREEN_GAME_ACTIVE_KEY, String(fullscreenGameActive));
      localStorage.setItem(MAZE_GAME_ACTIVE_KEY, String(mazeGameActive));
      localStorage.setItem(CAR_GAME_ACTIVE_KEY, String(carGameActive));
      localStorage.setItem(JACK_GAME_ACTIVE_KEY, String(jackGameActive));
      localStorage.setItem(LIGHT_GAME_ACTIVE_KEY, String(lightGameActive));
      localStorage.setItem(STREET_CAR_GAME_ACTIVE_KEY, String(streetCarGameActive));
      localStorage.setItem(DRAGON_DODGE_GAME_ACTIVE_KEY, String(dragonDodgeGameActive));
      localStorage.setItem(FIREFIGHTER_RESCUE_GAME_ACTIVE_KEY, String(firefighterRescueGameActive));
      localStorage.setItem(MARTIAN_MADNESS_GAME_ACTIVE_KEY, String(martianMadnessGameActive));
      localStorage.setItem(SOUND_ENABLED_KEY, String(soundEnabled));
      localStorage.setItem(TRAINING_PAUSED_KEY, String(trainingPaused));
      [4, 5, 6].forEach((level, idx) => {
        const keys = JACK_FLAME_RAIN_KEYS[idx];
        const s = jackFlameRainSettings[idx];
        localStorage.setItem(keys.enabled, String(s.enabled));
        localStorage.setItem(keys.size, String(s.size));
        localStorage.setItem(keys.hitRadius, String(s.hitRadius));
        localStorage.setItem(keys.burstMin, String(s.burstMin));
        localStorage.setItem(keys.burstMax, String(s.burstMax));
        localStorage.setItem(keys.intervalMin, String(s.intervalMin));
        localStorage.setItem(keys.intervalMax, String(s.intervalMax));
        localStorage.setItem(keys.speedMin, String(s.speedMin));
        localStorage.setItem(keys.speedMax, String(s.speedMax));
      });
      MAZE_GHOST_LEVEL_ENABLED_KEYS.forEach((key, index) => {
        localStorage.setItem(key, String(mazeGhostLevelsEnabled[index]));
      });
      MAZE_GHOST_LEVEL_COUNT_KEYS.forEach((key, index) => {
        localStorage.setItem(key, String(mazeGhostLevelCounts[index]));
      });
      CAR_GAME_LEVEL_ENABLED_KEYS.forEach((key, index) => {
        localStorage.setItem(key, String(carGameLevelsEnabled[index]));
      });
      CAR_GAME_LEVEL_SPEED_KEYS.forEach((key, index) => {
        localStorage.setItem(key, String(carGameLevelObstacleSpeeds[index]));
      });
      CAR_GAME_LEVEL_MAX_CARS_KEYS.forEach((key, index) => {
        localStorage.setItem(key, String(carGameLevelMaxCars[index]));
      });
      CAR_GAME_LEVEL_SURVIVAL_KEYS.forEach((key, index) => {
        localStorage.setItem(key, String(carGameLevelSurvivalSeconds[index]));
      });
      CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS_KEYS.forEach((key, index) => {
        localStorage.setItem(key, String(carGameLevelGasPumpSpawnSeconds[index]));
      });
      CAR_LEVEL_FUEL_DRAIN_KEYS.forEach((key, index) => {
        localStorage.setItem(key, String(carGameLevelFuelDrainPerSecond[index]));
      });
    }
  } catch {
    // Keep local fallback when API is unavailable.
  }

  task1DurationInput.value = String(task1Seconds);
  task1EnabledToggle.checked = task1Enabled;
  task2ClicksInput.value = String(task2Clicks);
  task2EnabledToggle.checked = task2Enabled;
  task3DragSecondsInput.value = String(task3Seconds);
  task3EnabledToggle.checked = task3Enabled;
  if (fullscreenRequireClickAndDragToggle) fullscreenRequireClickAndDragToggle.checked = fullscreenRequireClickAndDrag;
  if (mazeRequireClickAndDragToggle) mazeRequireClickAndDragToggle.checked = mazeRequireClickAndDrag;
  if (carRequireClickAndDragToggle) carRequireClickAndDragToggle.checked = carRequireClickAndDrag;
  if (jackRequireClickAndDragToggle) jackRequireClickAndDragToggle.checked = jackRequireClickAndDrag;
  if (fullscreenGameActiveToggle) fullscreenGameActiveToggle.checked = fullscreenGameActive;
  if (mazeGameActiveToggle) mazeGameActiveToggle.checked = mazeGameActive;
  if (carGameActiveToggle) carGameActiveToggle.checked = carGameActive;
  if (jackGameActiveToggle) jackGameActiveToggle.checked = jackGameActive;
  if (lightGameActiveToggle) lightGameActiveToggle.checked = lightGameActive;
  if (streetCarGameActiveToggle) streetCarGameActiveToggle.checked = streetCarGameActive;
  if (dragonDodgeGameActiveToggle) dragonDodgeGameActiveToggle.checked = dragonDodgeGameActive;
  if (firefighterRescueGameActiveToggle) firefighterRescueGameActiveToggle.checked = firefighterRescueGameActive;
  if (martianMadnessGameActiveToggle) martianMadnessGameActiveToggle.checked = martianMadnessGameActive;
  applyGameLevelsToInputs(lightTapLevels, lightTapLevelInputs, {
    lives: "lives",
    time: "time",
    goal: "goal",
  });
  applyGameLevelsToInputs(streetCarLevels, streetCarLevelInputs, {
    spawnInterval: "spawnInterval",
    targetColor: "targetColor",
    timeLimit: "timeLimit",
    carCount: "carCount",
    missesAllowed: "missesAllowed",
    goal: "goal",
    speedMin: "speedMin",
    speedMax: "speedMax",
  });
  applyGameLevelsToInputs(dragonLevels, dragonLevelInputs, {
    dragonCount: "dragonCount",
    timeLimit: "timeLimit",
    missesAllowed: "missesAllowed",
    goal: "goal",
    fireDurationSeconds: "fireDurationSeconds",
    speedMin: "speedMin",
    speedMax: "speedMax",
  });
  applyGameLevelsToInputs(fireLevels, fireLevelInputs, {
    timeLimit: "timeLimit",
    missesAllowed: "missesAllowed",
    goal: "goal",
    spawnIntervalSeconds: "spawnIntervalSeconds",
    flameDurationSeconds: "flameDurationSeconds",
  });
  applyGameLevelsToInputs(martianLevels, martianLevelInputs, {
    peopleCount: "peopleCount",
    ufoCount: "ufoCount",
    ufoSpeed: "ufoSpeed",
    liftSpeed: "liftSpeed",
  });
  soundEnabledToggle.checked = soundEnabled;
  trainingPausedToggle.checked = trainingPaused;
  [4, 5, 6].forEach((level, idx) => {
    const s = jackFlameRainSettings[idx];
    const inputs = jackFlameRainInputs[idx];
    if (inputs.enabled) inputs.enabled.checked = s.enabled;
    if (inputs.size) inputs.size.value = String(s.size);
    if (inputs.hitRadius) inputs.hitRadius.value = String(s.hitRadius);
    if (inputs.burstMin) inputs.burstMin.value = String(s.burstMin);
    if (inputs.burstMax) inputs.burstMax.value = String(s.burstMax);
    if (inputs.intervalMin) inputs.intervalMin.value = String(s.intervalMin);
    if (inputs.intervalMax) inputs.intervalMax.value = String(s.intervalMax);
    if (inputs.speedMin) inputs.speedMin.value = String(s.speedMin);
    if (inputs.speedMax) inputs.speedMax.value = String(s.speedMax);
  });
  mazeGhostLevelToggles.forEach((toggle, index) => {
    if (toggle) {
      toggle.checked = mazeGhostLevelsEnabled[index];
    }
  });
  mazeGhostLevelCountInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(mazeGhostLevelCounts[index]);
    }
  });
  carGameLevelToggles.forEach((toggle, index) => {
    if (toggle) {
      toggle.checked = carGameLevelsEnabled[index];
    }
  });
  carGameLevelSpeedInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(carGameLevelObstacleSpeeds[index]);
    }
  });
  carGameLevelMaxCarsInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(carGameLevelMaxCars[index]);
    }
  });
  carGameLevelSurvivalInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(carGameLevelSurvivalSeconds[index]);
    }
  });
  carGameLevelGasPumpSpawnInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(carGameLevelGasPumpSpawnSeconds[index]);
    }
  });
  carGameLevelFuelDrainInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(carGameLevelFuelDrainPerSecond[index]);
    }
  });
}

async function saveTask1Settings() {
  const safeTask1Seconds = parseTask1Seconds(task1DurationInput.value);
  const task1Enabled = Boolean(task1EnabledToggle.checked);
  const safeTask2Clicks = parseTask2Clicks(task2ClicksInput.value);
  const task2Enabled = Boolean(task2EnabledToggle.checked);
  const safeTask3Seconds = parseTask3Seconds(task3DragSecondsInput.value);
  const task3Enabled = Boolean(task3EnabledToggle.checked);
  const fullscreenRequireClickAndDrag = Boolean(fullscreenRequireClickAndDragToggle && fullscreenRequireClickAndDragToggle.checked);
  const mazeRequireClickAndDrag = Boolean(mazeRequireClickAndDragToggle && mazeRequireClickAndDragToggle.checked);
  const carRequireClickAndDrag = Boolean(carRequireClickAndDragToggle && carRequireClickAndDragToggle.checked);
  const jackRequireClickAndDrag = Boolean(jackRequireClickAndDragToggle && jackRequireClickAndDragToggle.checked);
  const fullscreenGameActive = Boolean(fullscreenGameActiveToggle && fullscreenGameActiveToggle.checked);
  const mazeGameActive = Boolean(mazeGameActiveToggle && mazeGameActiveToggle.checked);
  const carGameActive = Boolean(carGameActiveToggle && carGameActiveToggle.checked);
  const jackGameActive = Boolean(jackGameActiveToggle && jackGameActiveToggle.checked);
  const lightGameActive = Boolean(lightGameActiveToggle && lightGameActiveToggle.checked);
  const streetCarGameActive = Boolean(streetCarGameActiveToggle && streetCarGameActiveToggle.checked);
  const dragonDodgeGameActive = Boolean(dragonDodgeGameActiveToggle && dragonDodgeGameActiveToggle.checked);
  const firefighterRescueGameActive = Boolean(firefighterRescueGameActiveToggle && firefighterRescueGameActiveToggle.checked);
  const martianMadnessGameActive = Boolean(martianMadnessGameActiveToggle && martianMadnessGameActiveToggle.checked);
  const lightTapLevels = normalizeLightTapLevels(
    readGameLevelsFromInputs(lightTapLevelInputs, {
      lives: "lives",
      time: "time",
      goal: "goal",
    })
  );
  const hasStreetCarInputs = streetCarLevelInputs.some((inputs) =>
    Boolean(inputs.spawnInterval || inputs.targetColor || inputs.timeLimit || inputs.carCount || inputs.missesAllowed || inputs.goal || inputs.speedMin || inputs.speedMax)
  );
  const streetCarLevels = hasStreetCarInputs
    ? normalizeStreetCarLevels(
      readGameLevelsFromInputs(streetCarLevelInputs, {
        spawnInterval: "spawnInterval",
        targetColor: "targetColor",
        timeLimit: "timeLimit",
        carCount: "carCount",
        missesAllowed: "missesAllowed",
        goal: "goal",
        speedMin: "speedMin",
        speedMax: "speedMax",
      })
    )
    : null;
  const hasDragonInputs = dragonLevelInputs.some((inputs) =>
    Boolean(inputs.dragonCount || inputs.timeLimit || inputs.missesAllowed || inputs.goal || inputs.fireDurationSeconds || inputs.speedMin || inputs.speedMax)
  );
  const dragonLevels = hasDragonInputs
    ? normalizeDragonLevels(
      readGameLevelsFromInputs(dragonLevelInputs, {
        dragonCount: "dragonCount",
        timeLimit: "timeLimit",
        missesAllowed: "missesAllowed",
        goal: "goal",
        fireDurationSeconds: "fireDurationSeconds",
        speedMin: "speedMin",
        speedMax: "speedMax",
      })
    )
    : null;
  const hasFireInputs = fireLevelInputs.some((inputs) =>
    Boolean(inputs.timeLimit || inputs.missesAllowed || inputs.goal || inputs.spawnIntervalSeconds || inputs.flameDurationSeconds)
  );
  const fireLevels = hasFireInputs
    ? normalizeFireLevels(
      readGameLevelsFromInputs(fireLevelInputs, {
        timeLimit: "timeLimit",
        missesAllowed: "missesAllowed",
        goal: "goal",
        spawnIntervalSeconds: "spawnIntervalSeconds",
        flameDurationSeconds: "flameDurationSeconds",
      })
    )
    : null;
  const hasMartianInputs = martianLevelInputs.some((inputs) =>
    Boolean(inputs.peopleCount || inputs.ufoCount || inputs.ufoSpeed || inputs.liftSpeed)
  );
  const martianLevels = hasMartianInputs
    ? normalizeMartianLevels(
      readGameLevelsFromInputs(martianLevelInputs, {
        peopleCount: "peopleCount",
        ufoCount: "ufoCount",
        ufoSpeed: "ufoSpeed",
        liftSpeed: "liftSpeed",
      })
    )
    : null;
  const soundEnabled = Boolean(soundEnabledToggle.checked);
  const trainingPaused = Boolean(trainingPausedToggle.checked);
  const jackFlameRainSettingsToSave = [4, 5, 6].map((level, idx) => {
    const inputs = jackFlameRainInputs[idx];
    const defaults = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL[idx];
    return {
      enabled: Boolean(inputs.enabled && inputs.enabled.checked),
      size: parseJackFlameRainSize(inputs.size ? inputs.size.value : defaults.size, defaults.size),
      hitRadius: parseJackFlameRainHitRadius(inputs.hitRadius ? inputs.hitRadius.value : defaults.hitRadius, defaults.hitRadius),
      burstMin: parseJackFlameRainBurstMin(inputs.burstMin ? inputs.burstMin.value : defaults.burstMin, defaults.burstMin),
      burstMax: parseJackFlameRainBurstMax(inputs.burstMax ? inputs.burstMax.value : defaults.burstMax, defaults.burstMin, defaults.burstMax),
      intervalMin: parseJackFlameRainIntervalMin(inputs.intervalMin ? inputs.intervalMin.value : defaults.intervalMin, defaults.intervalMin),
      intervalMax: parseJackFlameRainIntervalMax(inputs.intervalMax ? inputs.intervalMax.value : defaults.intervalMax, defaults.intervalMin, defaults.intervalMax),
      speedMin: parseJackFlameRainSpeedMin(inputs.speedMin ? inputs.speedMin.value : defaults.speedMin, defaults.speedMin),
      speedMax: parseJackFlameRainSpeedMax(inputs.speedMax ? inputs.speedMax.value : defaults.speedMax, defaults.speedMin, defaults.speedMax),
    };
  });
  const mazeGhostLevelsEnabled = mazeGhostLevelToggles.map((toggle) => Boolean(toggle && toggle.checked));
  const mazeGhostLevelsPerLevelCounts = mazeGhostLevelCountInputs.map((inputEl) =>
    parseGhostCount(inputEl ? inputEl.value : DEFAULT_GHOST_LEVEL_COUNT)
  );
  const carGameLevelsEnabled = carGameLevelToggles.map((toggle) => Boolean(toggle && toggle.checked));
  const carGameLevelObstacleSpeeds = carGameLevelSpeedInputs.map((inputEl, index) =>
    parseCarLevelSpeed(inputEl ? inputEl.value : DEFAULT_CAR_LEVEL_SPEEDS[index], DEFAULT_CAR_LEVEL_SPEEDS[index])
  );
  const carGameLevelMaxCars = carGameLevelMaxCarsInputs.map((inputEl, index) =>
    parseCarLevelMaxCars(inputEl ? inputEl.value : DEFAULT_CAR_LEVEL_MAX_CARS[index], DEFAULT_CAR_LEVEL_MAX_CARS[index])
  );
  const carGameLevelSurvivalSeconds = carGameLevelSurvivalInputs.map((inputEl, index) =>
    parseCarLevelSurvival(
      inputEl ? inputEl.value : DEFAULT_CAR_LEVEL_SURVIVAL[index],
      DEFAULT_CAR_LEVEL_SURVIVAL[index]
    )
  );
  const carGameLevelGasPumpSpawnSeconds = carGameLevelGasPumpSpawnInputs.map((inputEl, index) =>
    parseCarGasPumpSpawnSeconds(
      inputEl ? inputEl.value : DEFAULT_CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS[index],
      DEFAULT_CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS[index]
    )
  );
  const carGameLevelFuelDrainPerSecond = carGameLevelFuelDrainInputs.map((inputEl, index) =>
    parseCarFuelDrain(
      inputEl ? inputEl.value : DEFAULT_CAR_LEVEL_FUEL_DRAIN[index],
      DEFAULT_CAR_LEVEL_FUEL_DRAIN[index]
    )
  );
  task1DurationInput.value = String(safeTask1Seconds);
  task2ClicksInput.value = String(safeTask2Clicks);
  task3DragSecondsInput.value = String(safeTask3Seconds);
  mazeGhostLevelCountInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(mazeGhostLevelsPerLevelCounts[index]);
    }
  });
  localStorage.setItem(TASK1_STORAGE_KEY, String(safeTask1Seconds));
  localStorage.setItem(TASK1_ENABLED_KEY, String(task1Enabled));
  localStorage.setItem(TASK2_STORAGE_KEY, String(safeTask2Clicks));
  localStorage.setItem(TASK2_ENABLED_KEY, String(task2Enabled));
  localStorage.setItem(TASK3_STORAGE_KEY, String(safeTask3Seconds));
  localStorage.setItem(TASK3_ENABLED_KEY, String(task3Enabled));
  localStorage.setItem(FULLSCREEN_REQUIRE_CLICK_AND_DRAG_KEY, String(fullscreenRequireClickAndDrag));
  localStorage.setItem(MAZE_REQUIRE_CLICK_AND_DRAG_KEY, String(mazeRequireClickAndDrag));
  localStorage.setItem(CAR_REQUIRE_CLICK_AND_DRAG_KEY, String(carRequireClickAndDrag));
  localStorage.setItem(JACK_REQUIRE_CLICK_AND_DRAG_KEY, String(jackRequireClickAndDrag));
  localStorage.setItem(FULLSCREEN_GAME_ACTIVE_KEY, String(fullscreenGameActive));
  localStorage.setItem(MAZE_GAME_ACTIVE_KEY, String(mazeGameActive));
  localStorage.setItem(CAR_GAME_ACTIVE_KEY, String(carGameActive));
  localStorage.setItem(JACK_GAME_ACTIVE_KEY, String(jackGameActive));
  localStorage.setItem(LIGHT_GAME_ACTIVE_KEY, String(lightGameActive));
  localStorage.setItem(STREET_CAR_GAME_ACTIVE_KEY, String(streetCarGameActive));
  localStorage.setItem(DRAGON_DODGE_GAME_ACTIVE_KEY, String(dragonDodgeGameActive));
  localStorage.setItem(FIREFIGHTER_RESCUE_GAME_ACTIVE_KEY, String(firefighterRescueGameActive));
  localStorage.setItem(MARTIAN_MADNESS_GAME_ACTIVE_KEY, String(martianMadnessGameActive));
  saveStoredLightTapLevels(lightTapLevels);
  if (streetCarLevels) {
    saveStoredStreetCarLevels(streetCarLevels);
  }
  if (dragonLevels) {
    saveStoredDragonLevels(dragonLevels);
  }
  if (fireLevels) {
    saveStoredFireLevels(fireLevels);
  }
  if (martianLevels) {
    saveStoredMartianLevels(martianLevels);
  }
  applyGameLevelsToInputs(lightTapLevels, lightTapLevelInputs, {
    lives: "lives",
    time: "time",
    goal: "goal",
  });
  if (streetCarLevels) {
    applyGameLevelsToInputs(streetCarLevels, streetCarLevelInputs, {
      spawnInterval: "spawnInterval",
      targetColor: "targetColor",
      timeLimit: "timeLimit",
      carCount: "carCount",
      missesAllowed: "missesAllowed",
      goal: "goal",
      speedMin: "speedMin",
      speedMax: "speedMax",
    });
  }
  if (dragonLevels) {
    applyGameLevelsToInputs(dragonLevels, dragonLevelInputs, {
      dragonCount: "dragonCount",
      timeLimit: "timeLimit",
      missesAllowed: "missesAllowed",
      goal: "goal",
      fireDurationSeconds: "fireDurationSeconds",
      speedMin: "speedMin",
      speedMax: "speedMax",
    });
  }
  if (fireLevels) {
    applyGameLevelsToInputs(fireLevels, fireLevelInputs, {
      timeLimit: "timeLimit",
      missesAllowed: "missesAllowed",
      goal: "goal",
      spawnIntervalSeconds: "spawnIntervalSeconds",
      flameDurationSeconds: "flameDurationSeconds",
    });
  }
  if (martianLevels) {
    applyGameLevelsToInputs(martianLevels, martianLevelInputs, {
      peopleCount: "peopleCount",
      ufoCount: "ufoCount",
      ufoSpeed: "ufoSpeed",
      liftSpeed: "liftSpeed",
    });
  }
  localStorage.setItem(SOUND_ENABLED_KEY, String(soundEnabled));
  localStorage.setItem(TRAINING_PAUSED_KEY, String(trainingPaused));
  [4, 5, 6].forEach((level, idx) => {
    const keys = JACK_FLAME_RAIN_KEYS[idx];
    const s = jackFlameRainSettingsToSave[idx];
    localStorage.setItem(keys.enabled, String(s.enabled));
    localStorage.setItem(keys.size, String(s.size));
    localStorage.setItem(keys.hitRadius, String(s.hitRadius));
    localStorage.setItem(keys.burstMin, String(s.burstMin));
    localStorage.setItem(keys.burstMax, String(s.burstMax));
    localStorage.setItem(keys.intervalMin, String(s.intervalMin));
    localStorage.setItem(keys.intervalMax, String(s.intervalMax));
    localStorage.setItem(keys.speedMin, String(s.speedMin));
    localStorage.setItem(keys.speedMax, String(s.speedMax));
  });
  MAZE_GHOST_LEVEL_ENABLED_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(mazeGhostLevelsEnabled[index]));
  });
  MAZE_GHOST_LEVEL_COUNT_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(mazeGhostLevelsPerLevelCounts[index]));
  });
  CAR_GAME_LEVEL_ENABLED_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carGameLevelsEnabled[index]));
  });
  CAR_GAME_LEVEL_SPEED_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carGameLevelObstacleSpeeds[index]));
  });
  CAR_GAME_LEVEL_MAX_CARS_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carGameLevelMaxCars[index]));
  });
  CAR_GAME_LEVEL_SURVIVAL_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carGameLevelSurvivalSeconds[index]));
  });
  CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carGameLevelGasPumpSpawnSeconds[index]));
  });
  CAR_LEVEL_FUEL_DRAIN_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(carGameLevelFuelDrainPerSecond[index]));
  });
  carGameLevelSpeedInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(carGameLevelObstacleSpeeds[index]);
    }
  });
  carGameLevelMaxCarsInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(carGameLevelMaxCars[index]);
    }
  });
  carGameLevelSurvivalInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(carGameLevelSurvivalSeconds[index]);
    }
  });
  carGameLevelGasPumpSpawnInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(carGameLevelGasPumpSpawnSeconds[index]);
    }
  });
  carGameLevelFuelDrainInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(carGameLevelFuelDrainPerSecond[index]);
    }
  });
  try {
    const response = await fetch(SETTINGS_API_PATH, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task1RequiredSeconds: safeTask1Seconds,
        task1Enabled,
        task2RequiredClicks: safeTask2Clicks,
        task2Enabled,
        task3RequiredDragSeconds: safeTask3Seconds,
        task3Enabled,
        fullscreenRequireClickAndDrag,
        mazeRequireClickAndDrag,
        carRequireClickAndDrag,
        jackRequireClickAndDrag,
        fullscreenGameActive,
        mazeGameActive,
        carGameActive,
        jackGameActive,
        lightGameActive,
        streetCarGameActive,
        dragonDodgeGameActive,
        firefighterRescueGameActive,
        martianMadnessGameActive,
        soundEnabled,
        trainingPaused,
        jackFlameRain4: jackFlameRainSettingsToSave[0],
        jackFlameRain5: jackFlameRainSettingsToSave[1],
        jackFlameRain6: jackFlameRainSettingsToSave[2],
        mazeGhostLevelsEnabled,
        mazeGhostLevelsPerLevelCounts,
        carGameLevelsEnabled,
        carGameLevelObstacleSpeeds,
        carGameLevelMaxCars,
        carGameLevelSurvivalSeconds,
        carGameLevelGasPumpSpawnSeconds,
        carGameLevelFuelDrainPerSecond,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save shared settings.");
    }

    showSavedMessage("Task settings saved for all devices.");
  } catch {
    showSavedMessage("Saved on this device only (server unavailable).");
  }

  setDirtyState(false);
  updateQuickSummary();
}

initTabs();
if (applyPresetsBtn) {
  applyPresetsBtn.addEventListener("click", applyProgressivePresets);
}
saveTask1Btn.addEventListener("click", saveTask1Settings);

const allInputs = [
  task1DurationInput,
  task2ClicksInput,
  task3DragSecondsInput,
  ...lightTapLevelInputs.flatMap((inputs) => [inputs.lives, inputs.time, inputs.goal]),
  ...fireLevelInputs.flatMap((inputs) => [
    inputs.timeLimit,
    inputs.missesAllowed,
    inputs.goal,
    inputs.spawnIntervalSeconds,
    inputs.flameDurationSeconds,
  ]),
  ...martianLevelInputs.flatMap((inputs) => [
    inputs.peopleCount,
    inputs.ufoCount,
    inputs.ufoSpeed,
    inputs.liftSpeed,
  ]),
  ...dragonLevelInputs.flatMap((inputs) => [
    inputs.dragonCount,
    inputs.timeLimit,
    inputs.missesAllowed,
    inputs.goal,
    inputs.fireDurationSeconds,
    inputs.speedMin,
    inputs.speedMax,
  ]),
  ...mazeGhostLevelCountInputs,
  ...carGameLevelSpeedInputs,
  ...carGameLevelMaxCarsInputs,
  ...carGameLevelSurvivalInputs,
  ...carGameLevelGasPumpSpawnInputs,
  ...carGameLevelFuelDrainInputs,
  ...jackFlameRainInputs.flatMap((obj) => Object.values(obj)),
];

const allToggles = [
  fullscreenRequireClickAndDragToggle,
  mazeRequireClickAndDragToggle,
  carRequireClickAndDragToggle,
  jackRequireClickAndDragToggle,
  fullscreenGameActiveToggle,
  mazeGameActiveToggle,
  carGameActiveToggle,
  jackGameActiveToggle,
  lightGameActiveToggle,
  streetCarGameActiveToggle,
  dragonDodgeGameActiveToggle,
  firefighterRescueGameActiveToggle,
  martianMadnessGameActiveToggle,
  task1EnabledToggle,
  task2EnabledToggle,
  task3EnabledToggle,
  soundEnabledToggle,
  trainingPausedToggle,
  ...mazeGhostLevelToggles,
  ...carGameLevelToggles,
];

allInputs.forEach((inputEl) => {
  if (!inputEl) {
    return;
  }

  inputEl.addEventListener("input", () => {
    setDirtyState(true);
    updateQuickSummary();
  });
});

allToggles.forEach((toggleEl) => {
  if (!toggleEl) {
    return;
  }

  toggleEl.addEventListener("change", () => {
    setDirtyState(true);
    updateQuickSummary();
  });
});

[
  [fullscreenRequireClickAndDragToggle, FULLSCREEN_REQUIRE_CLICK_AND_DRAG_KEY],
  [mazeRequireClickAndDragToggle, MAZE_REQUIRE_CLICK_AND_DRAG_KEY],
  [carRequireClickAndDragToggle, CAR_REQUIRE_CLICK_AND_DRAG_KEY],
  [jackRequireClickAndDragToggle, JACK_REQUIRE_CLICK_AND_DRAG_KEY],
].forEach(([toggleEl, storageKey]) => {
  if (!toggleEl) {
    return;
  }

  toggleEl.addEventListener("change", () => {
    localStorage.setItem(storageKey, String(toggleEl.checked));
  });
});

allInputs.forEach((inputEl) => {
  if (!inputEl) {
    return;
  }

  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveTask1Settings();
    }
  });
});

loadTask1Settings().then(() => {
  updateQuickSummary();
  setDirtyState(false);
});
