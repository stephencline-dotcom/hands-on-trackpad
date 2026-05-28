const task1DurationInput = document.getElementById("task1Duration");
const task1EnabledToggle = document.getElementById("task1EnabledToggle");
const task2ClicksInput = document.getElementById("task2Clicks");
const task2EnabledToggle = document.getElementById("task2EnabledToggle");
const task3DragSecondsInput = document.getElementById("task3DragSeconds");
const task3EnabledToggle = document.getElementById("task3EnabledToggle");
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
const adminTaskCard = document.querySelector(".admin-task-card");
const taskSummaryPill = document.getElementById("taskSummaryPill");
const carSummaryPill = document.getElementById("carSummaryPill");
const mazeSummaryPill = document.getElementById("mazeSummaryPill");
const tabButtons = Array.from(document.querySelectorAll(".admin-tab-button"));
const tabPanels = Array.from(document.querySelectorAll(".admin-tab-content"));
const saveTask1Btn = document.getElementById("saveTask1Btn");
const task1SavedMessage = document.getElementById("task1SavedMessage");

const TASK1_STORAGE_KEY = "trackpadTask1RequiredSeconds";
const TASK2_STORAGE_KEY = "trackpadTask2RequiredClicks";
const TASK3_STORAGE_KEY = "trackpadTask3RequiredDragSeconds";
const TASK1_ENABLED_KEY = "trackpadTask1Enabled";
const TASK2_ENABLED_KEY = "trackpadTask2Enabled";
const TASK3_ENABLED_KEY = "trackpadTask3Enabled";
const SOUND_ENABLED_KEY = "trackpadSoundEnabled";
const TRAINING_PAUSED_KEY = "trackpadTrainingPaused";
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
const DEFAULT_GHOST_LEVEL_COUNT = 1;
const DEFAULT_CAR_LEVEL_SPEEDS = [0.18, 0.21, 0.24, 0.28, 0.33, 0.38];
const DEFAULT_CAR_LEVEL_MAX_CARS = [1, 2, 2, 3, 3, 4];
const DEFAULT_CAR_LEVEL_SURVIVAL = [12, 16, 20, 24, 28, 32];
const DEFAULT_CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS = [4.2, 4.8, 5.4, 6.0, 6.6, 7.2];
const DEFAULT_CAR_LEVEL_FUEL_DRAIN = [2.2, 2.8, 3.5, 4.3, 5.2, 6.2];
const DEFAULT_JACK_FLAME_RAIN = {
  enabled: true,
  size: 24,
  hitRadius: 12,
  burstMin: 2,
  burstMax: 4,
  intervalMin: 620,
  intervalMax: 1300,
  speedMin: 210,
  speedMax: 320,
};
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

  return [fallback, fallback, fallback, fallback, fallback, fallback];
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

function parseJackFlameRainSize(value, fallback = DEFAULT_JACK_FLAME_RAIN_SIZE) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(64, Math.max(10, parsed));
}

function parseJackFlameRainHitRadius(value, fallback = DEFAULT_JACK_FLAME_RAIN_HIT_RADIUS) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(48, Math.max(4, parsed));
}

function parseJackFlameRainBurstMin(value, fallback = DEFAULT_JACK_FLAME_RAIN_BURST_MIN) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(8, Math.max(1, parsed));
}

function parseJackFlameRainBurstMax(value, burstMin, fallback = DEFAULT_JACK_FLAME_RAIN_BURST_MAX) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(burstMin, fallback);
  }

  return Math.min(10, Math.max(burstMin, parsed));
}

function parseJackFlameRainIntervalMin(value, fallback = DEFAULT_JACK_FLAME_RAIN_INTERVAL_MIN) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(4000, Math.max(160, parsed));
}

function parseJackFlameRainIntervalMax(value, intervalMin, fallback = DEFAULT_JACK_FLAME_RAIN_INTERVAL_MAX) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(intervalMin + 30, fallback);
  }

  return Math.min(5000, Math.max(intervalMin + 30, parsed));
}

function parseJackFlameRainSpeedMin(value, fallback = DEFAULT_JACK_FLAME_RAIN_SPEED_MIN) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(900, Math.max(80, parsed));
}

function parseJackFlameRainSpeedMax(value, speedMin, fallback = DEFAULT_JACK_FLAME_RAIN_SPEED_MAX) {
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

function showSavedMessage(text) {
  task1SavedMessage.textContent = text;
  task1SavedMessage.hidden = false;

  window.clearTimeout(showSavedMessage.hideTimer);
  showSavedMessage.hideTimer = window.setTimeout(() => {
    task1SavedMessage.hidden = true;
  }, 1700);
}

async function loadTask1Settings() {
  let task1Seconds = parseTask1Seconds(localStorage.getItem(TASK1_STORAGE_KEY));
  let task1Enabled = parseTaskEnabled(localStorage.getItem(TASK1_ENABLED_KEY), true);
  let task2Clicks = parseTask2Clicks(localStorage.getItem(TASK2_STORAGE_KEY));
  let task2Enabled = parseTaskEnabled(localStorage.getItem(TASK2_ENABLED_KEY), true);
  let task3Seconds = parseTask3Seconds(localStorage.getItem(TASK3_STORAGE_KEY));
  let task3Enabled = parseTaskEnabled(localStorage.getItem(TASK3_ENABLED_KEY), true);
  let soundEnabled = parseTaskEnabled(localStorage.getItem(SOUND_ENABLED_KEY), true);
  let trainingPaused = parseTrainingPaused(localStorage.getItem(TRAINING_PAUSED_KEY));
  const jackFlameRainSettings = [4, 5, 6].map((level, idx) => {
    const keys = JACK_FLAME_RAIN_KEYS[idx];
    return {
      enabled: parseTaskEnabled(localStorage.getItem(keys.enabled), DEFAULT_JACK_FLAME_RAIN.enabled),
      size: parseJackFlameRainSize(localStorage.getItem(keys.size)),
      hitRadius: parseJackFlameRainHitRadius(localStorage.getItem(keys.hitRadius)),
      burstMin: parseJackFlameRainBurstMin(localStorage.getItem(keys.burstMin)),
      burstMax: parseJackFlameRainBurstMax(localStorage.getItem(keys.burstMax), DEFAULT_JACK_FLAME_RAIN.burstMin),
      intervalMin: parseJackFlameRainIntervalMin(localStorage.getItem(keys.intervalMin)),
      intervalMax: parseJackFlameRainIntervalMax(localStorage.getItem(keys.intervalMax), DEFAULT_JACK_FLAME_RAIN.intervalMin),
      speedMin: parseJackFlameRainSpeedMin(localStorage.getItem(keys.speedMin)),
      speedMax: parseJackFlameRainSpeedMax(localStorage.getItem(keys.speedMax), DEFAULT_JACK_FLAME_RAIN.speedMin),
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
      soundEnabled = parseTaskEnabled(data.soundEnabled, true);
      trainingPaused = parseTrainingPaused(data.trainingPaused);
      [4, 5, 6].forEach((level, idx) => {
        const keys = JACK_FLAME_RAIN_KEYS[idx];
        const d = data[`jackFlameRain${level}`] || {};
        jackFlameRainSettings[idx] = {
          enabled: parseTaskEnabled(d.enabled, DEFAULT_JACK_FLAME_RAIN.enabled),
          size: parseJackFlameRainSize(d.size),
          hitRadius: parseJackFlameRainHitRadius(d.hitRadius),
          burstMin: parseJackFlameRainBurstMin(d.burstMin),
          burstMax: parseJackFlameRainBurstMax(d.burstMax, DEFAULT_JACK_FLAME_RAIN.burstMin),
          intervalMin: parseJackFlameRainIntervalMin(d.intervalMin),
          intervalMax: parseJackFlameRainIntervalMax(d.intervalMax, DEFAULT_JACK_FLAME_RAIN.intervalMin),
          speedMin: parseJackFlameRainSpeedMin(d.speedMin),
          speedMax: parseJackFlameRainSpeedMax(d.speedMax, DEFAULT_JACK_FLAME_RAIN.speedMin),
        };
      });
      mazeGhostLevelsEnabled = parseGhostLevelEnabled(data.mazeGhostLevelsEnabled, true);
      mazeGhostLevelCounts = parseGhostLevelCounts(data.mazeGhostLevelsPerLevelCounts, DEFAULT_GHOST_LEVEL_COUNT);
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
  const soundEnabled = Boolean(soundEnabledToggle.checked);
  const trainingPaused = Boolean(trainingPausedToggle.checked);
  const jackFlameRainSettingsToSave = [4, 5, 6].map((level, idx) => {
    const inputs = jackFlameRainInputs[idx];
    return {
      enabled: Boolean(inputs.enabled && inputs.enabled.checked),
      size: parseJackFlameRainSize(inputs.size ? inputs.size.value : DEFAULT_JACK_FLAME_RAIN.size),
      hitRadius: parseJackFlameRainHitRadius(inputs.hitRadius ? inputs.hitRadius.value : DEFAULT_JACK_FLAME_RAIN.hitRadius),
      burstMin: parseJackFlameRainBurstMin(inputs.burstMin ? inputs.burstMin.value : DEFAULT_JACK_FLAME_RAIN.burstMin),
      burstMax: parseJackFlameRainBurstMax(inputs.burstMax ? inputs.burstMax.value : DEFAULT_JACK_FLAME_RAIN.burstMax, DEFAULT_JACK_FLAME_RAIN.burstMin),
      intervalMin: parseJackFlameRainIntervalMin(inputs.intervalMin ? inputs.intervalMin.value : DEFAULT_JACK_FLAME_RAIN.intervalMin),
      intervalMax: parseJackFlameRainIntervalMax(inputs.intervalMax ? inputs.intervalMax.value : DEFAULT_JACK_FLAME_RAIN.intervalMax, DEFAULT_JACK_FLAME_RAIN.intervalMin),
      speedMin: parseJackFlameRainSpeedMin(inputs.speedMin ? inputs.speedMin.value : DEFAULT_JACK_FLAME_RAIN.speedMin),
      speedMax: parseJackFlameRainSpeedMax(inputs.speedMax ? inputs.speedMax.value : DEFAULT_JACK_FLAME_RAIN.speedMax, DEFAULT_JACK_FLAME_RAIN.speedMin),
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
  if (jackFlameRainSizeInput) {
    jackFlameRainSizeInput.value = String(jackFlameRainSizePx);
  }
  if (jackFlameRainHitRadiusInput) {
    jackFlameRainHitRadiusInput.value = String(jackFlameRainHitRadiusPx);
  }
  if (jackFlameRainBurstMinInput) {
    jackFlameRainBurstMinInput.value = String(jackFlameRainBurstMin);
  }
  if (jackFlameRainBurstMaxInput) {
    jackFlameRainBurstMaxInput.value = String(jackFlameRainBurstMax);
  }
  if (jackFlameRainIntervalMinInput) {
    jackFlameRainIntervalMinInput.value = String(jackFlameRainIntervalMinMs);
  }
  if (jackFlameRainIntervalMaxInput) {
    jackFlameRainIntervalMaxInput.value = String(jackFlameRainIntervalMaxMs);
  }
  if (jackFlameRainSpeedMinInput) {
    jackFlameRainSpeedMinInput.value = String(jackFlameRainSpeedMin);
  }
  if (jackFlameRainSpeedMaxInput) {
    jackFlameRainSpeedMaxInput.value = String(jackFlameRainSpeedMax);
  }
  if (jackFlameRainEnabledToggle) {
    jackFlameRainEnabledToggle.checked = jackFlameRainEnabled;
  }

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
saveTask1Btn.addEventListener("click", saveTask1Settings);

const allInputs = [
  task1DurationInput,
  task2ClicksInput,
  task3DragSecondsInput,
  ...mazeGhostLevelCountInputs,
  ...carGameLevelSpeedInputs,
  ...carGameLevelMaxCarsInputs,
  ...carGameLevelSurvivalInputs,
  ...carGameLevelGasPumpSpawnInputs,
  ...carGameLevelFuelDrainInputs,
  ...jackFlameRainInputs.flatMap((obj) => Object.values(obj)),
];

const allToggles = [
  task1EnabledToggle,
  task2EnabledToggle,
  task3EnabledToggle,
  soundEnabledToggle,
  trainingPausedToggle,
  jackFlameRainEnabledToggle,
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
