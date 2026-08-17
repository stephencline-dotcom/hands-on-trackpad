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
const freezeScreenFeatureToggle = document.getElementById("freezeScreenFeatureToggle");
const fullscreenGameActiveToggle = document.getElementById("fullscreenGameActiveToggle");
const mazeGameActiveToggle = document.getElementById("mazeGameActiveToggle");
const carGameActiveToggle = document.getElementById("carGameActiveToggle");
const jackGameActiveToggle = document.getElementById("jackGameActiveToggle");
const lightGameActiveToggle = document.getElementById("lightGameActive");
const streetCarGameActiveToggle = document.getElementById("streetCarGameActive");
const dragonDodgeGameActiveToggle = document.getElementById("dragonDodgeGameActive");
const firefighterRescueGameActiveToggle = document.getElementById("firefighterRescueGameActive");
const martianMadnessGameActiveToggle = document.getElementById("martianMadnessGameActive");
const bugMeadowGameActiveToggle = document.getElementById("bugMeadowGameActive");
const deerRunGameActiveToggle = document.getElementById("deerRunGameActive");
const soundEnabledToggle = document.getElementById("soundEnabledToggle");
const trainingPausedToggle = document.getElementById("trainingPausedToggle");
const lightTapRequireClickToggle = document.getElementById("lightTapRequireClickToggle");
const streetCarRequireClickToggle = document.getElementById("streetCarRequireClickToggle");
const dragonRequireClickToggle = document.getElementById("dragonRequireClickToggle");
const fireRequireClickToggle = document.getElementById("fireRequireClickToggle");
const martianRequireClickToggle = document.getElementById("martianRequireClickToggle");
const bugMeadowRequireClickAndDragToggle = document.getElementById("bugMeadowRequireClickAndDragToggle");
const deerRunRequireClickAndDragToggle = document.getElementById("deerRunRequireClickAndDragToggle");
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
  princess: document.getElementById(`adminDragonPrincessL${level}`),
  knight: document.getElementById(`adminDragonKnightL${level}`),
}));
const fireLevelInputs = [1, 2, 3].map((level) => ({
  timeLimit: document.getElementById(`adminFireTimeL${level}`),
  missesAllowed: document.getElementById(`adminFireMissesL${level}`),
  goal: document.getElementById(`adminFireGoalL${level}`),
  spawnIntervalSeconds: document.getElementById(`adminFireSpawnIntervalL${level}`),
  flameDurationSeconds: document.getElementById(`adminFireFlameDurationL${level}`),
}));
const martianLevelInputs = [1, 2, 3].map((level) => ({
  timeLimit: document.getElementById(`adminMartianTimeL${level}`),
  missesAllowed: document.getElementById(`adminMartianMissesL${level}`),
  goal: document.getElementById(`adminMartianGoalL${level}`),
  peopleCount: document.getElementById(`adminMartianPeopleCountL${level}`),
  ufoCount: document.getElementById(`adminMartianUfoCountL${level}`),
  ufoSpeed: document.getElementById(`adminMartianUfoSpeedL${level}`),
  liftSpeed: document.getElementById(`adminMartianLiftSpeedL${level}`),
}));
const bugMeadowLevelInputs = [1, 2, 3, 4].map((level) => ({
  goal: document.getElementById(`adminBugMeadowGoalL${level}`),
  timeLimit: document.getElementById(`adminBugMeadowTimeL${level}`),
  missesAllowed: document.getElementById(`adminBugMeadowMissesL${level}`),
  birdCount: document.getElementById(`adminBugMeadowBirdsL${level}`),
  birdSpeed: document.getElementById(`adminBugMeadowBirdSpeedL${level}`),
}));

const deerRunLevelInputs = [1, 2, 3, 4].map((level) => ({
  goal: document.getElementById(`adminDeerRunGoalL${level}`),
  timeLimit: document.getElementById(`adminDeerRunTimeL${level}`),
  missesAllowed: document.getElementById(`adminDeerRunMissesL${level}`),
  spawnDelayMin: document.getElementById(`adminDeerRunSpawnMinL${level}`),
  spawnDelayMax: document.getElementById(`adminDeerRunSpawnMaxL${level}`),

  rabbitEnabled: document.getElementById(`adminDeerRunRabbitEnabledL${level}`),
  rabbitSpeed: document.getElementById(`adminDeerRunRabbitSpeedL${level}`),

  foxEnabled: document.getElementById(`adminDeerRunFoxEnabledL${level}`),
  foxSpeed: document.getElementById(`adminDeerRunFoxSpeedL${level}`),

  falconEnabled: document.getElementById(`adminDeerRunFalconEnabledL${level}`),
  falconSpeed: document.getElementById(`adminDeerRunFalconSpeedL${level}`),

  owlEnabled: document.getElementById(`adminDeerRunOwlEnabledL${level}`),
  owlSpeed: document.getElementById(`adminDeerRunOwlSpeedL${level}`),
}));
const adminTaskCard = document.querySelector(".admin-task-card");
const adminAvailabilitySection = document.getElementById("adminAvailabilitySection");
const backToAvailabilityBtn = document.getElementById("backToAvailabilityBtn");
const tabButtons = Array.from(document.querySelectorAll(".admin-tab-button"));
const tabPanels = Array.from(document.querySelectorAll(".admin-tab-content"));
const applyPresetsBtn = document.getElementById("applyPresetsBtn");
const resetMazeDefaultsBtn = document.getElementById("resetMazeDefaultsBtn");
const resetCarGameDefaultsBtn = document.getElementById("resetCarGameDefaultsBtn");
const resetStreetCarDefaultsBtn = document.getElementById("resetStreetCarDefaultsBtn");
const resetLightTapDefaultsBtn = document.getElementById("resetLightTapDefaultsBtn");
const resetDragonDefaultsBtn = document.getElementById("resetDragonDefaultsBtn");
const resetFireDefaultsBtn = document.getElementById("resetFireDefaultsBtn");
const resetMartianDefaultsBtn = document.getElementById("resetMartianDefaultsBtn");
const resetBugMeadowDefaultsBtn = document.getElementById("resetBugMeadowDefaultsBtn");
const resetDeerRunDefaultsBtn = document.getElementById("resetDeerRunDefaultsBtn");
const resetJackDefaultsBtn = document.getElementById("resetJackDefaultsBtn");
const resetFullscreenDefaultsBtn = document.getElementById("resetFullscreenDefaultsBtn");
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
const FREEZE_SCREEN_FEATURE_KEY = "freezeScreenFeatureEnabled";
const FULLSCREEN_GAME_ACTIVE_KEY = "fullscreenGameActive";
const MAZE_GAME_ACTIVE_KEY = "mazeGameActive";
const CAR_GAME_ACTIVE_KEY = "carGameActive";
const JACK_GAME_ACTIVE_KEY = "jackGameActive";
const LIGHT_GAME_ACTIVE_KEY = "lightGameActive";
const STREET_CAR_GAME_ACTIVE_KEY = "streetCarGameActive";
const DRAGON_DODGE_GAME_ACTIVE_KEY = "dragonDodgeGameActive";
const FIREFIGHTER_RESCUE_GAME_ACTIVE_KEY = "firefighterRescueGameActive";
const MARTIAN_MADNESS_GAME_ACTIVE_KEY = "martianMadnessGameActive";
const BUG_MEADOW_GAME_ACTIVE_KEY = "bugMeadowGameActive";
const DEER_RUN_GAME_ACTIVE_KEY = "deerRunGameActive";
const SOUND_ENABLED_KEY = "trackpadSoundEnabled";
const TRAINING_PAUSED_KEY = "trackpadTrainingPaused";
const MOVING_SOUND_ADMIN_SETTINGS_STORAGE_KEY = "moving-sound-admin-settings-v1";
const LIGHT_TAP_REQUIRE_CLICK_KEY = "lightTapRequireClick";
const STREET_CAR_REQUIRE_CLICK_KEY = "streetCarRequireClick";
const DRAGON_REQUIRE_CLICK_KEY = "dragonRequireClick";
const FIRE_REQUIRE_CLICK_KEY = "fireRequireClick";
const MARTIAN_REQUIRE_CLICK_KEY = "martianRequireClick";
const BUG_MEADOW_REQUIRE_CLICK_AND_DRAG_KEY = "bugMeadowRequireClickAndDrag";
const DEER_RUN_REQUIRE_CLICK_AND_DRAG_KEY = "deerRunRequireClickAndDrag";
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
const DEFAULT_BUG_MEADOW_LEVELS = [
  { goal: 5, timeLimit: 35, missesAllowed: 3, birdCount: 0, birdSpeed: 1 },
  { goal: 7, timeLimit: 35, missesAllowed: 3, birdCount: 1, birdSpeed: 2 },
  { goal: 9, timeLimit: 30, missesAllowed: 3, birdCount: 2, birdSpeed: 3 },
  { goal: 12, timeLimit: 30, missesAllowed: 4, birdCount: 3, birdSpeed: 4 },
];

const DEFAULT_DEER_RUN_LEVELS = [
  {
    goal: 5,
    timeLimit: 35,
    missesAllowed: 3,
    spawnDelayMin: 3.0,
    spawnDelayMax: 4.0,
    rabbitEnabled: true,
    rabbitSpeed: 115,
    foxEnabled: false,
    foxSpeed: 130,
    falconEnabled: false,
    falconSpeed: 145,
    owlEnabled: false,
    owlSpeed: 135,
  },
  {
    goal: 7,
    timeLimit: 35,
    missesAllowed: 3,
    spawnDelayMin: 2.8,
    spawnDelayMax: 3.6,
    rabbitEnabled: true,
    rabbitSpeed: 120,
    foxEnabled: true,
    foxSpeed: 130,
    falconEnabled: false,
    falconSpeed: 145,
    owlEnabled: false,
    owlSpeed: 135,
  },
  {
    goal: 9,
    timeLimit: 30,
    missesAllowed: 3,
    spawnDelayMin: 2.4,
    spawnDelayMax: 3.2,
    rabbitEnabled: true,
    rabbitSpeed: 125,
    foxEnabled: true,
    foxSpeed: 140,
    falconEnabled: true,
    falconSpeed: 150,
    owlEnabled: false,
    owlSpeed: 140,
  },
  {
    goal: 12,
    timeLimit: 30,
    missesAllowed: 4,
    spawnDelayMin: 2.0,
    spawnDelayMax: 2.8,
    rabbitEnabled: true,
    rabbitSpeed: 135,
    foxEnabled: true,
    foxSpeed: 150,
    falconEnabled: true,
    falconSpeed: 165,
    owlEnabled: true,
    owlSpeed: 150,
  },
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

function setDirtyState(isDirty) {
  if (!adminTaskCard) {
    return;
  }

  adminTaskCard.dataset.dirty = isDirty ? "true" : "false";
}

function updateQuickSummary() {
  // Summary pills were removed from the admin UI.
}

function setActiveTab(nextTabName) {
  const normalizedTabName = typeof nextTabName === "string" ? nextTabName : "";
  const hasActiveTab = normalizedTabName.length > 0;

  tabButtons.forEach((button) => {
    const isActive = normalizedTabName.length > 0 && button.dataset.tab === normalizedTabName;
    button.setAttribute("aria-selected", isActive ? "true" : "false");
    button.tabIndex = isActive ? 0 : -1;
  });

  tabPanels.forEach((panel) => {
    const panelTabName = panel.id.replace("panel", "").toLowerCase();
    panel.setAttribute("aria-hidden", hasActiveTab && panelTabName === normalizedTabName ? "false" : "true");
  });

  if (adminAvailabilitySection) {
    adminAvailabilitySection.hidden = hasActiveTab;
  }
  if (backToAvailabilityBtn) {
    backToAvailabilityBtn.hidden = !hasActiveTab;
  }
}

function initTabs() {
  if (!tabButtons.length || !tabPanels.length) {
    return;
  }

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setActiveTab(button.dataset.tab || "");
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
      setActiveTab(nextButton.dataset.tab || "");
    });
  });

  setActiveTab("");

  if (backToAvailabilityBtn) {
    backToAvailabilityBtn.addEventListener("click", () => {
      setActiveTab("");
    });
  }
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

  if (!Array.isArray(next.dragonPrincessEnabledByLevel) || next.dragonPrincessEnabledByLevel.length < 4) {
    next.dragonPrincessEnabledByLevel = [false, false, true, true];
  }

  if (!Array.isArray(next.dragonKnightEnabledByLevel) || next.dragonKnightEnabledByLevel.length < 4) {
    next.dragonKnightEnabledByLevel = [false, false, false, true];
  }

  if (!Array.isArray(next.fireLevels) || next.fireLevels.length < 3) {
    next.fireLevels = JSON.parse(JSON.stringify(DEFAULT_MOVING_SOUND_FIRE_LEVELS));
  }

  if (!Array.isArray(next.martianLevels) || next.martianLevels.length < 3) {
    next.martianLevels = JSON.parse(JSON.stringify(DEFAULT_MOVING_SOUND_MARTIAN_LEVELS));
  }

  return next;
}

function loadDragonCharacterSettings() {
  const defaults = {
    princess: [false, false, true, true],
    knight: [false, false, false, true],
  };

  try {
    const raw = localStorage.getItem(MOVING_SOUND_ADMIN_SETTINGS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const settings = ensureMovingSoundSettingsShape(parsed);

    return {
      princess: [...settings.dragonPrincessEnabledByLevel],
      knight: [...settings.dragonKnightEnabledByLevel],
    };
  } catch {
    return defaults;
  }
}

function saveDragonCharacterSettings(princessByLevel, knightByLevel) {
  try {
    const raw = localStorage.getItem(MOVING_SOUND_ADMIN_SETTINGS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const next = ensureMovingSoundSettingsShape(parsed);

    next.dragonPrincessEnabledByLevel = princessByLevel.map((value) => value === true);
    next.dragonKnightEnabledByLevel = knightByLevel.map((value) => value === true);

    localStorage.setItem(
      MOVING_SOUND_ADMIN_SETTINGS_STORAGE_KEY,
      JSON.stringify(next)
    );
  } catch {
    const fallback = ensureMovingSoundSettingsShape({});
    fallback.dragonPrincessEnabledByLevel = princessByLevel.map((value) => value === true);
    fallback.dragonKnightEnabledByLevel = knightByLevel.map((value) => value === true);

    localStorage.setItem(
      MOVING_SOUND_ADMIN_SETTINGS_STORAGE_KEY,
      JSON.stringify(fallback)
    );
  }
}

function applyDragonCharacterSettingsToInputs(settings) {
  dragonLevelInputs.forEach((inputs, index) => {
    if (inputs.princess) {
      inputs.princess.checked = settings.princess[index] === true;
    }

    if (inputs.knight) {
      inputs.knight.checked = settings.knight[index] === true;
    }
  });
}

function readDragonCharacterSettingsFromInputs() {
  return {
    princess: dragonLevelInputs.map((inputs) => Boolean(inputs.princess && inputs.princess.checked)),
    knight: dragonLevelInputs.map((inputs) => Boolean(inputs.knight && inputs.knight.checked)),
  };
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

function normalizeBugMeadowLevels(levels) {
  return normalizeLevelArray(levels, DEFAULT_BUG_MEADOW_LEVELS, (level, defaults) => {
    return {
      goal: parseLightTapLevelValue(level.goal, 1, 100, defaults.goal),
      timeLimit: parseLightTapLevelValue(level.timeLimit, 10, 300, defaults.timeLimit),
      missesAllowed: parseLightTapLevelValue(level.missesAllowed, 1, 20, defaults.missesAllowed),
      birdCount: parseLightTapLevelValue(level.birdCount, 0, 8, defaults.birdCount),
      birdSpeed: parseLightTapLevelValue(level.birdSpeed, 1, 5, defaults.birdSpeed),
    };
  });
}

function normalizeDeerRunLevels(levels) {
  return normalizeLevelArray(
    levels,
    DEFAULT_DEER_RUN_LEVELS,
    (level, defaults) => ({
      goal: parseLightTapLevelValue(
        level.goal,
        1,
        100,
        defaults.goal
      ),
      timeLimit: parseLightTapLevelValue(
        level.timeLimit,
        10,
        300,
        defaults.timeLimit
      ),
      missesAllowed: parseLightTapLevelValue(
        level.missesAllowed,
        1,
        20,
        defaults.missesAllowed
      ),

      spawnDelayMin: parseLightTapLevelValue(
        level.spawnDelayMin,
        0.5,
        10,
        defaults.spawnDelayMin
      ),

      spawnDelayMax: parseLightTapLevelValue(
        level.spawnDelayMax,
        0.5,
        10,
        defaults.spawnDelayMax
      ),

      rabbitEnabled:
        typeof level.rabbitEnabled === "boolean"
          ? level.rabbitEnabled
          : defaults.rabbitEnabled,
      rabbitSpeed: parseLightTapLevelValue(
        level.rabbitSpeed,
        40,
        400,
        defaults.rabbitSpeed
      ),

      foxEnabled:
        typeof level.foxEnabled === "boolean"
          ? level.foxEnabled
          : defaults.foxEnabled,
      foxSpeed: parseLightTapLevelValue(
        level.foxSpeed,
        40,
        400,
        defaults.foxSpeed
      ),

      falconEnabled:
        typeof level.falconEnabled === "boolean"
          ? level.falconEnabled
          : defaults.falconEnabled,
      falconSpeed: parseLightTapLevelValue(
        level.falconSpeed,
        40,
        400,
        defaults.falconSpeed
      ),

      owlEnabled:
        typeof level.owlEnabled === "boolean"
          ? level.owlEnabled
          : defaults.owlEnabled,
      owlSpeed: parseLightTapLevelValue(
        level.owlSpeed,
        40,
        400,
        defaults.owlSpeed
      ),
    })
  );
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

function loadStoredBugMeadowLevels() {
  return loadGameLevelsFromStorage(
    "bugMeadowLevels",
    DEFAULT_BUG_MEADOW_LEVELS,
    normalizeBugMeadowLevels
  );
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

function loadStoredDeerRunLevels() {
  return loadGameLevelsFromStorage(
    "deerRunLevels",
    DEFAULT_DEER_RUN_LEVELS,
    normalizeDeerRunLevels
  );
}

function saveStoredBugMeadowLevels(levels) {
  saveGameLevelsToStorage(
    "bugMeadowLevels",
    levels,
    normalizeBugMeadowLevels
  );
}

function saveStoredDeerRunLevels(levels) {
  saveGameLevelsToStorage(
    "deerRunLevels",
    levels,
    normalizeDeerRunLevels
  );
}


function applyDeerRunLevelsToInputs(levels) {
  deerRunLevelInputs.forEach((inputs, index) => {
    const level =
      levels[index] ||
      DEFAULT_DEER_RUN_LEVELS[index];

    if (inputs.goal) {
      inputs.goal.value = String(level.goal);
    }

    if (inputs.timeLimit) {
      inputs.timeLimit.value =
        String(level.timeLimit);
    }

    if (inputs.missesAllowed) {
      inputs.missesAllowed.value =
        String(level.missesAllowed);
    }

    if (inputs.spawnDelayMin) {
      inputs.spawnDelayMin.value =
        String(level.spawnDelayMin);
    }

    if (inputs.spawnDelayMax) {
      inputs.spawnDelayMax.value =
        String(level.spawnDelayMax);
    }

    for (const animal of [
      "rabbit",
      "fox",
      "falcon",
      "owl",
    ]) {
      const enabled =
        inputs[`${animal}Enabled`];

      const speed =
        inputs[`${animal}Speed`];

      if (enabled) {
        enabled.checked =
          Boolean(level[`${animal}Enabled`]);
      }

      if (speed) {
        speed.value =
          String(level[`${animal}Speed`]);
      }
    }
  });
}

function readDeerRunLevelsFromInputs() {
  const rawLevels =
    deerRunLevelInputs.map(
      (inputs, index) => {
        const defaults =
          DEFAULT_DEER_RUN_LEVELS[index];

        return {
          goal:
            inputs.goal
              ? inputs.goal.value
              : defaults.goal,

          timeLimit:
            inputs.timeLimit
              ? inputs.timeLimit.value
              : defaults.timeLimit,

          missesAllowed:
            inputs.missesAllowed
              ? inputs.missesAllowed.value
              : defaults.missesAllowed,

          spawnDelayMin:
            inputs.spawnDelayMin
              ? inputs.spawnDelayMin.value
              : defaults.spawnDelayMin,

          spawnDelayMax:
            inputs.spawnDelayMax
              ? inputs.spawnDelayMax.value
              : defaults.spawnDelayMax,

          rabbitEnabled:
            Boolean(
              inputs.rabbitEnabled &&
              inputs.rabbitEnabled.checked
            ),
          rabbitSpeed:
            inputs.rabbitSpeed
              ? inputs.rabbitSpeed.value
              : defaults.rabbitSpeed,

          foxEnabled:
            Boolean(
              inputs.foxEnabled &&
              inputs.foxEnabled.checked
            ),
          foxSpeed:
            inputs.foxSpeed
              ? inputs.foxSpeed.value
              : defaults.foxSpeed,

          falconEnabled:
            Boolean(
              inputs.falconEnabled &&
              inputs.falconEnabled.checked
            ),
          falconSpeed:
            inputs.falconSpeed
              ? inputs.falconSpeed.value
              : defaults.falconSpeed,

          owlEnabled:
            Boolean(
              inputs.owlEnabled &&
              inputs.owlEnabled.checked
            ),
          owlSpeed:
            inputs.owlSpeed
              ? inputs.owlSpeed.value
              : defaults.owlSpeed,
        };
      }
    );

  return normalizeDeerRunLevels(
    rawLevels
  );
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

function resetLightTapToDefaults() {
  const confirmed = window.confirm("Reset Light Tap to default values? This only affects Light Tap settings.");
  if (!confirmed) {
    return;
  }

  const defaultLightTapLevels = normalizeLightTapLevels(DEFAULT_LIGHT_TAP_LEVELS);
  saveStoredLightTapLevels(defaultLightTapLevels);
  applyGameLevelsToInputs(defaultLightTapLevels, lightTapLevelInputs, {
    lives: "lives",
    time: "time",
    goal: "goal",
  });

  setDirtyState(false);
  updateQuickSummary();
  showSavedMessage("Light Tap reset to defaults.");
}

function resetStreetCarToDefaults() {
  const confirmed = window.confirm("Reset Street Car to default values? This only affects Street Car settings.");
  if (!confirmed) {
    return;
  }

  const defaultStreetCarLevels = normalizeStreetCarLevels(DEFAULT_MOVING_SOUND_CAR_LEVELS);
  saveStoredStreetCarLevels(defaultStreetCarLevels);
  applyGameLevelsToInputs(defaultStreetCarLevels, streetCarLevelInputs, {
    spawnInterval: "spawnInterval",
    targetColor: "targetColor",
    timeLimit: "timeLimit",
    carCount: "carCount",
    missesAllowed: "missesAllowed",
    goal: "goal",
    speedMin: "speedMin",
    speedMax: "speedMax",
  });

  setDirtyState(false);
  updateQuickSummary();
  showSavedMessage("Street Car reset to defaults.");
}

async function resetCarGameToDefaults() {
  const confirmed = window.confirm("Reset Car Game to default values? This only affects Car Game settings.");
  if (!confirmed) {
    return;
  }

  const carRequireClickAndDrag = false;
  const carGameLevelsEnabled = [true, true, true, true, true, true];
  const carGameLevelObstacleSpeeds = [...DEFAULT_CAR_LEVEL_SPEEDS];
  const carGameLevelMaxCars = [...DEFAULT_CAR_LEVEL_MAX_CARS];
  const carGameLevelSurvivalSeconds = [...DEFAULT_CAR_LEVEL_SURVIVAL];
  const carGameLevelGasPumpSpawnSeconds = [...DEFAULT_CAR_LEVEL_GAS_PUMP_SPAWN_SECONDS];
  const carGameLevelFuelDrainPerSecond = [...DEFAULT_CAR_LEVEL_FUEL_DRAIN];

  if (carRequireClickAndDragToggle) {
    carRequireClickAndDragToggle.checked = carRequireClickAndDrag;
  }

  carGameLevelToggles.forEach((toggleEl, index) => {
    if (toggleEl) {
      toggleEl.checked = carGameLevelsEnabled[index];
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

  localStorage.setItem(CAR_REQUIRE_CLICK_AND_DRAG_KEY, String(carRequireClickAndDrag));
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

  try {
    const response = await fetch(SETTINGS_API_PATH, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        carRequireClickAndDrag,
        carGameLevelsEnabled,
        carGameLevelObstacleSpeeds,
        carGameLevelMaxCars,
        carGameLevelSurvivalSeconds,
        carGameLevelGasPumpSpawnSeconds,
        carGameLevelFuelDrainPerSecond,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save Car Game settings.");
    }

    showSavedMessage("Car Game reset to defaults.");
  } catch {
    showSavedMessage("Car Game reset on this device only (server unavailable).");
  }

  setDirtyState(false);
  updateQuickSummary();
}

async function resetMazeToDefaults() {
  const confirmed = window.confirm("Reset Maze to default values? This only affects Maze settings.");
  if (!confirmed) {
    return;
  }

  const mazeRequireClickAndDrag = false;
  const mazeGhostLevelsEnabled = [true, true, true, true, true, true];
  const mazeGhostLevelsPerLevelCounts = [...DEFAULT_MAZE_GHOST_LEVEL_COUNTS];

  if (mazeRequireClickAndDragToggle) {
    mazeRequireClickAndDragToggle.checked = mazeRequireClickAndDrag;
  }

  mazeGhostLevelToggles.forEach((toggleEl, index) => {
    if (toggleEl) {
      toggleEl.checked = mazeGhostLevelsEnabled[index];
    }
  });

  mazeGhostLevelCountInputs.forEach((inputEl, index) => {
    if (inputEl) {
      inputEl.value = String(mazeGhostLevelsPerLevelCounts[index]);
    }
  });

  localStorage.setItem(MAZE_REQUIRE_CLICK_AND_DRAG_KEY, String(mazeRequireClickAndDrag));
  MAZE_GHOST_LEVEL_ENABLED_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(mazeGhostLevelsEnabled[index]));
  });
  MAZE_GHOST_LEVEL_COUNT_KEYS.forEach((key, index) => {
    localStorage.setItem(key, String(mazeGhostLevelsPerLevelCounts[index]));
  });

  try {
    const response = await fetch(SETTINGS_API_PATH, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mazeRequireClickAndDrag,
        mazeGhostLevelsEnabled,
        mazeGhostLevelsPerLevelCounts,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save Maze settings.");
    }

    showSavedMessage("Maze reset to defaults.");
  } catch {
    showSavedMessage("Maze reset on this device only (server unavailable).");
  }

  setDirtyState(false);
  updateQuickSummary();
}

async function resetFullscreenToDefaults() {
  const confirmed = window.confirm("Reset Fullscreen Trackpad to default values? This only affects Fullscreen Trackpad settings.");
  if (!confirmed) {
    return;
  }

  const task1RequiredSeconds = DEFAULT_TASK1_SECONDS;
  const task1Enabled = true;
  const task2RequiredClicks = DEFAULT_TASK2_CLICKS;
  const task2Enabled = true;
  const task3RequiredDragSeconds = DEFAULT_TASK3_DRAG_SECONDS;
  const task3Enabled = true;
  const fullscreenRequireClickAndDrag = false;
  const fullscreenGameActive = true;
  const soundEnabled = true;
  const trainingPaused = false;

  task1DurationInput.value = String(task1RequiredSeconds);
  task1EnabledToggle.checked = task1Enabled;
  task2ClicksInput.value = String(task2RequiredClicks);
  task2EnabledToggle.checked = task2Enabled;
  task3DragSecondsInput.value = String(task3RequiredDragSeconds);
  task3EnabledToggle.checked = task3Enabled;
  if (fullscreenRequireClickAndDragToggle) {
    fullscreenRequireClickAndDragToggle.checked = fullscreenRequireClickAndDrag;
  }
  if (freezeScreenFeatureToggle) {
    freezeScreenFeatureToggle.checked =
      freezeScreenFeatureEnabled;
  }

  if (fullscreenGameActiveToggle) {
    fullscreenGameActiveToggle.checked = fullscreenGameActive;
  }
  if (soundEnabledToggle) {
    soundEnabledToggle.checked = soundEnabled;
  }
  if (trainingPausedToggle) {
    trainingPausedToggle.checked = trainingPaused;
  lightTapRequireClickToggle.checked = lightTapRequireClick;
  streetCarRequireClickToggle.checked = streetCarRequireClick;
  dragonRequireClickToggle.checked = dragonRequireClick;
  fireRequireClickToggle.checked = fireRequireClick;
  martianRequireClickToggle.checked = martianRequireClick;
  }

  localStorage.setItem(TASK1_STORAGE_KEY, String(task1RequiredSeconds));
  localStorage.setItem(TASK1_ENABLED_KEY, String(task1Enabled));
  localStorage.setItem(TASK2_STORAGE_KEY, String(task2RequiredClicks));
  localStorage.setItem(TASK2_ENABLED_KEY, String(task2Enabled));
  localStorage.setItem(TASK3_STORAGE_KEY, String(task3RequiredDragSeconds));
  localStorage.setItem(TASK3_ENABLED_KEY, String(task3Enabled));
  localStorage.setItem(FULLSCREEN_REQUIRE_CLICK_AND_DRAG_KEY, String(fullscreenRequireClickAndDrag));
  localStorage.setItem(
    FREEZE_SCREEN_FEATURE_KEY,
    String(freezeScreenFeatureEnabled)
  );
  localStorage.setItem(FULLSCREEN_GAME_ACTIVE_KEY, String(fullscreenGameActive));
  localStorage.setItem(BUG_MEADOW_GAME_ACTIVE_KEY, String(bugMeadowGameActive));
  localStorage.setItem(
    BUG_MEADOW_REQUIRE_CLICK_AND_DRAG_KEY,
    String(bugMeadowRequireClickAndDrag)
  );
  localStorage.setItem(
    DEER_RUN_GAME_ACTIVE_KEY,
    String(deerRunGameActive)
  );

  localStorage.setItem(
    DEER_RUN_REQUIRE_CLICK_AND_DRAG_KEY,
    String(deerRunRequireClickAndDrag)
  );

  localStorage.setItem(SOUND_ENABLED_KEY, String(soundEnabled));
  localStorage.setItem(TRAINING_PAUSED_KEY, String(trainingPaused));
  localStorage.setItem(LIGHT_TAP_REQUIRE_CLICK_KEY, String(lightTapRequireClick));
      localStorage.setItem(STREET_CAR_REQUIRE_CLICK_KEY, String(streetCarRequireClick));
      localStorage.setItem(DRAGON_REQUIRE_CLICK_KEY, String(dragonRequireClick));
      localStorage.setItem(FIRE_REQUIRE_CLICK_KEY, String(fireRequireClick));
      localStorage.setItem(MARTIAN_REQUIRE_CLICK_KEY, String(martianRequireClick));

  try {
    const response = await fetch(SETTINGS_API_PATH, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task1RequiredSeconds,
        task1Enabled,
        task2RequiredClicks,
        task2Enabled,
        task3RequiredDragSeconds,
        task3Enabled,
        fullscreenRequireClickAndDrag,
        fullscreenGameActive,
        soundEnabled,
        trainingPaused,
        lightTapRequireClick,
        streetCarRequireClick,
        dragonRequireClick,
        fireRequireClick,
        martianRequireClick,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save Fullscreen Trackpad settings.");
    }

    showSavedMessage("Fullscreen Trackpad reset to defaults.");
  } catch {
    showSavedMessage("Fullscreen Trackpad reset on this device only (server unavailable).");
  }

  setDirtyState(false);
  updateQuickSummary();
}

async function resetJackToDefaults() {
  const confirmed = window.confirm("Reset Jumping Jack to default values? This only affects Jumping Jack settings.");
  if (!confirmed) {
    return;
  }

  const jackRequireClickAndDrag = false;
  const jackFlameRainDefaults = DEFAULT_JACK_FLAME_RAIN_BY_LEVEL.map((defaults) => ({ ...defaults }));

  if (jackRequireClickAndDragToggle) {
    jackRequireClickAndDragToggle.checked = jackRequireClickAndDrag;
  }

  jackFlameRainInputs.forEach((inputs, index) => {
    const defaults = jackFlameRainDefaults[index];
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

  localStorage.setItem(JACK_REQUIRE_CLICK_AND_DRAG_KEY, String(jackRequireClickAndDrag));
  [4, 5, 6].forEach((level, idx) => {
    const keys = JACK_FLAME_RAIN_KEYS[idx];
    const defaults = jackFlameRainDefaults[idx];
    localStorage.setItem(keys.enabled, String(defaults.enabled));
    localStorage.setItem(keys.size, String(defaults.size));
    localStorage.setItem(keys.hitRadius, String(defaults.hitRadius));
    localStorage.setItem(keys.burstMin, String(defaults.burstMin));
    localStorage.setItem(keys.burstMax, String(defaults.burstMax));
    localStorage.setItem(keys.intervalMin, String(defaults.intervalMin));
    localStorage.setItem(keys.intervalMax, String(defaults.intervalMax));
    localStorage.setItem(keys.speedMin, String(defaults.speedMin));
    localStorage.setItem(keys.speedMax, String(defaults.speedMax));
  });

  try {
    const response = await fetch(SETTINGS_API_PATH, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jackRequireClickAndDrag,
        jackFlameRain4: jackFlameRainDefaults[0],
        jackFlameRain5: jackFlameRainDefaults[1],
        jackFlameRain6: jackFlameRainDefaults[2],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save Jumping Jack settings.");
    }

    showSavedMessage("Jumping Jack reset to defaults.");
  } catch {
    showSavedMessage("Jumping Jack reset on this device only (server unavailable).");
  }

  setDirtyState(false);
  updateQuickSummary();
}

function resetDragonToDefaults() {
  const confirmed = window.confirm("Reset Dragon Dodge to default values? This only affects Dragon Dodge settings.");
  if (!confirmed) {
    return;
  }

  const defaultDragonLevels = normalizeDragonLevels(DEFAULT_MOVING_SOUND_DRAGON_LEVELS);
  saveStoredDragonLevels(defaultDragonLevels);

  dragonCharacterSettings = {
    princess: [false, false, true, true],
    knight: [false, false, false, true],
  };

  saveDragonCharacterSettings(
    dragonCharacterSettings.princess,
    dragonCharacterSettings.knight
  );

  applyDragonCharacterSettingsToInputs(dragonCharacterSettings);
  applyGameLevelsToInputs(defaultDragonLevels, dragonLevelInputs, {
    dragonCount: "dragonCount",
    timeLimit: "timeLimit",
    missesAllowed: "missesAllowed",
    goal: "goal",
    fireDurationSeconds: "fireDurationSeconds",
    speedMin: "speedMin",
    speedMax: "speedMax",
  });

  setDirtyState(false);
  updateQuickSummary();
  showSavedMessage("Dragon Dodge reset to defaults.");
}

function resetFireToDefaults() {
  const confirmed = window.confirm("Reset Firefighter Rescue to default values? This only affects Firefighter Rescue settings.");
  if (!confirmed) {
    return;
  }

  const defaultFireLevels = normalizeFireLevels(DEFAULT_MOVING_SOUND_FIRE_LEVELS);
  saveStoredFireLevels(defaultFireLevels);
  applyGameLevelsToInputs(defaultFireLevels, fireLevelInputs, {
    timeLimit: "timeLimit",
    missesAllowed: "missesAllowed",
    goal: "goal",
    spawnIntervalSeconds: "spawnIntervalSeconds",
    flameDurationSeconds: "flameDurationSeconds",
  });

  setDirtyState(false);
  updateQuickSummary();
  showSavedMessage("Firefighter Rescue reset to defaults.");
}

function resetMartianToDefaults() {
  const confirmed = window.confirm("Reset Martian Madness to default values? This only affects Martian Madness settings.");
  if (!confirmed) {
    return;
  }

  const defaultMartianLevels = normalizeMartianLevels(DEFAULT_MOVING_SOUND_MARTIAN_LEVELS);
  saveStoredMartianLevels(defaultMartianLevels);
  applyGameLevelsToInputs(defaultMartianLevels, martianLevelInputs, {
    timeLimit: "timeLimit",
    missesAllowed: "missesAllowed",
    goal: "goal",
    peopleCount: "peopleCount",
    ufoCount: "ufoCount",
    ufoSpeed: "ufoSpeed",
    liftSpeed: "liftSpeed",
  });

  setDirtyState(false);
  updateQuickSummary();
  showSavedMessage("Martian Madness reset to defaults.");
}

function resetBugMeadowToDefaults() {
  const confirmed = window.confirm(
    "Reset Bug Meadow to default values? This only affects Bug Meadow settings."
  );

  if (!confirmed) {
    return;
  }

  const defaultLevels = normalizeBugMeadowLevels(DEFAULT_BUG_MEADOW_LEVELS);
  saveStoredBugMeadowLevels(defaultLevels);

  applyGameLevelsToInputs(defaultLevels, bugMeadowLevelInputs, {
    goal: "goal",
    timeLimit: "timeLimit",
    missesAllowed: "missesAllowed",
    birdCount: "birdCount",
    birdSpeed: "birdSpeed",
  });

  if (bugMeadowRequireClickAndDragToggle) {
    bugMeadowRequireClickAndDragToggle.checked = false;
    localStorage.setItem(BUG_MEADOW_REQUIRE_CLICK_AND_DRAG_KEY, "false");
  }

  setDirtyState(false);
  updateQuickSummary();
  showSavedMessage("Bug Meadow reset to defaults.");
}

function resetDeerRunToDefaults() {
  const confirmed = window.confirm(
    "Reset Deer Run to default values? This only affects Deer Run settings."
  );

  if (!confirmed) {
    return;
  }

  const defaultLevels =
    normalizeDeerRunLevels(
      DEFAULT_DEER_RUN_LEVELS
    );

  saveStoredDeerRunLevels(
    defaultLevels
  );

  applyDeerRunLevelsToInputs(
    defaultLevels
  );

  if (deerRunRequireClickAndDragToggle) {
    deerRunRequireClickAndDragToggle.checked =
      false;

    localStorage.setItem(
      DEER_RUN_REQUIRE_CLICK_AND_DRAG_KEY,
      "false"
    );
  }

  setDirtyState(false);
  updateQuickSummary();

  showSavedMessage(
    "Deer Run reset to defaults."
  );
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
  let freezeScreenFeatureEnabled = parseTaskEnabled(
    localStorage.getItem(FREEZE_SCREEN_FEATURE_KEY),
    false
  );
  let fullscreenGameActive = parseTaskEnabled(localStorage.getItem(FULLSCREEN_GAME_ACTIVE_KEY), true);
  let mazeGameActive = parseTaskEnabled(localStorage.getItem(MAZE_GAME_ACTIVE_KEY), true);
  let carGameActive = parseTaskEnabled(localStorage.getItem(CAR_GAME_ACTIVE_KEY), true);
  let jackGameActive = parseTaskEnabled(localStorage.getItem(JACK_GAME_ACTIVE_KEY), true);
  let lightGameActive = parseTaskEnabled(localStorage.getItem(LIGHT_GAME_ACTIVE_KEY), true);
  let streetCarGameActive = parseTaskEnabled(localStorage.getItem(STREET_CAR_GAME_ACTIVE_KEY), true);
  let dragonDodgeGameActive = parseTaskEnabled(localStorage.getItem(DRAGON_DODGE_GAME_ACTIVE_KEY), true);
  let firefighterRescueGameActive = parseTaskEnabled(localStorage.getItem(FIREFIGHTER_RESCUE_GAME_ACTIVE_KEY), true);
  let martianMadnessGameActive = parseTaskEnabled(localStorage.getItem(MARTIAN_MADNESS_GAME_ACTIVE_KEY), true);
  let bugMeadowGameActive = parseTaskEnabled(
    localStorage.getItem(BUG_MEADOW_GAME_ACTIVE_KEY),
    true
  );

  let deerRunGameActive = parseTaskEnabled(
    localStorage.getItem(DEER_RUN_GAME_ACTIVE_KEY),
    true
  );

  let lightTapLevels = loadStoredLightTapLevels();
  let streetCarLevels = loadStoredStreetCarLevels();
  let dragonLevels = loadStoredDragonLevels();
  let dragonCharacterSettings = loadDragonCharacterSettings();
  let fireLevels = loadStoredFireLevels();
  let martianLevels = loadStoredMartianLevels();
  let bugMeadowLevels = loadStoredBugMeadowLevels();
  let deerRunLevels = loadStoredDeerRunLevels();

  let soundEnabled = parseTaskEnabled(localStorage.getItem(SOUND_ENABLED_KEY), true);
  let trainingPaused = parseTrainingPaused(localStorage.getItem(TRAINING_PAUSED_KEY));
  let lightTapRequireClick = parseTaskEnabled(
    localStorage.getItem(LIGHT_TAP_REQUIRE_CLICK_KEY),
    true
  );
  let streetCarRequireClick = parseTaskEnabled(
    localStorage.getItem(STREET_CAR_REQUIRE_CLICK_KEY),
    true
  );
  let dragonRequireClick = parseTaskEnabled(
    localStorage.getItem(DRAGON_REQUIRE_CLICK_KEY),
    true
  );
  let fireRequireClick = parseTaskEnabled(
    localStorage.getItem(FIRE_REQUIRE_CLICK_KEY),
    true
  );
  let martianRequireClick = parseTaskEnabled(
    localStorage.getItem(MARTIAN_REQUIRE_CLICK_KEY),
    true
  );
  let bugMeadowRequireClickAndDrag = parseTaskEnabled(
    localStorage.getItem(BUG_MEADOW_REQUIRE_CLICK_AND_DRAG_KEY),
    false
  );

  let deerRunRequireClickAndDrag = parseTaskEnabled(
    localStorage.getItem(DEER_RUN_REQUIRE_CLICK_AND_DRAG_KEY),
    false
  );
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
      freezeScreenFeatureEnabled = parseTaskEnabled(
        data.freezeScreenFeatureEnabled,
        freezeScreenFeatureEnabled
      );
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
      lightTapRequireClick = parseTaskEnabled(
        data.lightTapRequireClick,
        lightTapRequireClick
      );
      streetCarRequireClick = parseTaskEnabled(
        data.streetCarRequireClick,
        streetCarRequireClick
      );
      dragonRequireClick = parseTaskEnabled(
        data.dragonRequireClick,
        dragonRequireClick
      );
      fireRequireClick = parseTaskEnabled(
        data.fireRequireClick,
        fireRequireClick
      );
      martianRequireClick = parseTaskEnabled(
        data.martianRequireClick,
        martianRequireClick
      );
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
      localStorage.setItem(
        FREEZE_SCREEN_FEATURE_KEY,
        String(freezeScreenFeatureEnabled)
      );
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
      localStorage.setItem(LIGHT_TAP_REQUIRE_CLICK_KEY, String(lightTapRequireClick));
  localStorage.setItem(STREET_CAR_REQUIRE_CLICK_KEY, String(streetCarRequireClick));
  localStorage.setItem(DRAGON_REQUIRE_CLICK_KEY, String(dragonRequireClick));
  localStorage.setItem(FIRE_REQUIRE_CLICK_KEY, String(fireRequireClick));
  localStorage.setItem(MARTIAN_REQUIRE_CLICK_KEY, String(martianRequireClick));
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
  if (bugMeadowGameActiveToggle) {
    bugMeadowGameActiveToggle.checked = bugMeadowGameActive;
  }
  if (bugMeadowRequireClickAndDragToggle) {
    bugMeadowRequireClickAndDragToggle.checked = bugMeadowRequireClickAndDrag;
  }

  if (deerRunGameActiveToggle) {
    deerRunGameActiveToggle.checked =
      deerRunGameActive;
  }

  if (deerRunRequireClickAndDragToggle) {
    deerRunRequireClickAndDragToggle.checked =
      deerRunRequireClickAndDrag;
  }

  applyDeerRunLevelsToInputs(
    deerRunLevels
  );

  applyGameLevelsToInputs(bugMeadowLevels, bugMeadowLevelInputs, {
    goal: "goal",
    timeLimit: "timeLimit",
    missesAllowed: "missesAllowed",
    birdCount: "birdCount",
    birdSpeed: "birdSpeed",
  });
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
  applyDragonCharacterSettingsToInputs(dragonCharacterSettings);
  applyGameLevelsToInputs(fireLevels, fireLevelInputs, {
    timeLimit: "timeLimit",
    missesAllowed: "missesAllowed",
    goal: "goal",
    spawnIntervalSeconds: "spawnIntervalSeconds",
    flameDurationSeconds: "flameDurationSeconds",
  });
  applyGameLevelsToInputs(martianLevels, martianLevelInputs, {
    timeLimit: "timeLimit",
    missesAllowed: "missesAllowed",
    goal: "goal",
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
  const freezeScreenFeatureEnabled = Boolean(
    freezeScreenFeatureToggle &&
    freezeScreenFeatureToggle.checked
  );
  const fullscreenGameActive = Boolean(fullscreenGameActiveToggle && fullscreenGameActiveToggle.checked);
  const mazeGameActive = Boolean(mazeGameActiveToggle && mazeGameActiveToggle.checked);
  const carGameActive = Boolean(carGameActiveToggle && carGameActiveToggle.checked);
  const jackGameActive = Boolean(jackGameActiveToggle && jackGameActiveToggle.checked);
  const lightGameActive = Boolean(lightGameActiveToggle && lightGameActiveToggle.checked);
  const streetCarGameActive = Boolean(streetCarGameActiveToggle && streetCarGameActiveToggle.checked);
  const dragonDodgeGameActive = Boolean(dragonDodgeGameActiveToggle && dragonDodgeGameActiveToggle.checked);
  const firefighterRescueGameActive = Boolean(firefighterRescueGameActiveToggle && firefighterRescueGameActiveToggle.checked);
  const martianMadnessGameActive = Boolean(martianMadnessGameActiveToggle && martianMadnessGameActiveToggle.checked);
  const bugMeadowGameActive = Boolean(
    bugMeadowGameActiveToggle && bugMeadowGameActiveToggle.checked
  );

  const deerRunGameActive = Boolean(
    deerRunGameActiveToggle &&
    deerRunGameActiveToggle.checked
  );

  const deerRunLevels =
    readDeerRunLevelsFromInputs();

  const bugMeadowLevels = normalizeBugMeadowLevels(
    readGameLevelsFromInputs(bugMeadowLevelInputs, {
      goal: "goal",
      timeLimit: "timeLimit",
      missesAllowed: "missesAllowed",
      birdCount: "birdCount",
    birdSpeed: "birdSpeed",
    })
  );

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
  const dragonCharacterSettingsToSave = readDragonCharacterSettingsFromInputs();

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
    Boolean(inputs.timeLimit || inputs.missesAllowed || inputs.goal || inputs.peopleCount || inputs.ufoCount || inputs.ufoSpeed || inputs.liftSpeed)
  );
  const martianLevels = hasMartianInputs
    ? normalizeMartianLevels(
      readGameLevelsFromInputs(martianLevelInputs, {
        timeLimit: "timeLimit",
        missesAllowed: "missesAllowed",
        goal: "goal",
        peopleCount: "peopleCount",
        ufoCount: "ufoCount",
        ufoSpeed: "ufoSpeed",
        liftSpeed: "liftSpeed",
      })
    )
    : null;
  const soundEnabled = Boolean(soundEnabledToggle.checked);
  const trainingPaused = Boolean(trainingPausedToggle.checked);
  const lightTapRequireClick = Boolean(
    lightTapRequireClickToggle && lightTapRequireClickToggle.checked
  );
  const streetCarRequireClick = Boolean(
    streetCarRequireClickToggle && streetCarRequireClickToggle.checked
  );
  const dragonRequireClick = Boolean(
    dragonRequireClickToggle && dragonRequireClickToggle.checked
  );
  const fireRequireClick = Boolean(
    fireRequireClickToggle && fireRequireClickToggle.checked
  );
  const martianRequireClick = Boolean(
    martianRequireClickToggle && martianRequireClickToggle.checked
  );
  const bugMeadowRequireClickAndDrag = Boolean(
    bugMeadowRequireClickAndDragToggle &&
    bugMeadowRequireClickAndDragToggle.checked
  );

  const deerRunRequireClickAndDrag = Boolean(
    deerRunRequireClickAndDragToggle &&
    deerRunRequireClickAndDragToggle.checked
  );
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

  saveDragonCharacterSettings(
    dragonCharacterSettingsToSave.princess,
    dragonCharacterSettingsToSave.knight
  );

  dragonCharacterSettings = {
    princess: [...dragonCharacterSettingsToSave.princess],
    knight: [...dragonCharacterSettingsToSave.knight],
  };
  if (fireLevels) {
    saveStoredFireLevels(fireLevels);
  }
  if (martianLevels) {
    saveStoredMartianLevels(martianLevels);
  }
  saveStoredBugMeadowLevels(bugMeadowLevels);
  saveStoredDeerRunLevels(deerRunLevels);

  applyDeerRunLevelsToInputs(
    deerRunLevels
  );

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
      timeLimit: "timeLimit",
      missesAllowed: "missesAllowed",
      goal: "goal",
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
        freezeScreenFeatureEnabled,
        fullscreenGameActive,
        mazeGameActive,
        carGameActive,
        jackGameActive,
        lightGameActive,
        streetCarGameActive,
        dragonDodgeGameActive,
        firefighterRescueGameActive,
        martianMadnessGameActive,
        bugMeadowGameActive,
        bugMeadowRequireClickAndDrag,
        bugMeadowLevels,
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
if (resetMazeDefaultsBtn) {
  resetMazeDefaultsBtn.addEventListener("click", resetMazeToDefaults);
}
if (resetCarGameDefaultsBtn) {
  resetCarGameDefaultsBtn.addEventListener("click", resetCarGameToDefaults);
}
if (resetStreetCarDefaultsBtn) {
  resetStreetCarDefaultsBtn.addEventListener("click", resetStreetCarToDefaults);
}
if (resetLightTapDefaultsBtn) {
  resetLightTapDefaultsBtn.addEventListener("click", resetLightTapToDefaults);
}
if (resetDragonDefaultsBtn) {
  resetDragonDefaultsBtn.addEventListener("click", resetDragonToDefaults);
}
if (resetFireDefaultsBtn) {
  resetFireDefaultsBtn.addEventListener("click", resetFireToDefaults);
}
if (resetMartianDefaultsBtn) {
  resetMartianDefaultsBtn.addEventListener("click", resetMartianToDefaults);
}
if (resetBugMeadowDefaultsBtn) {
  resetBugMeadowDefaultsBtn.addEventListener(
    "click",
    resetBugMeadowToDefaults
  );
}
if (resetDeerRunDefaultsBtn) {
  resetDeerRunDefaultsBtn.addEventListener(
    "click",
    resetDeerRunToDefaults
  );
}
if (resetJackDefaultsBtn) {
  resetJackDefaultsBtn.addEventListener("click", resetJackToDefaults);
}
if (resetFullscreenDefaultsBtn) {
  resetFullscreenDefaultsBtn.addEventListener("click", resetFullscreenToDefaults);
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
  ...bugMeadowLevelInputs.flatMap((inputs) => [
    inputs.goal,
    inputs.timeLimit,
    inputs.missesAllowed,
    inputs.birdCount,
    inputs.birdSpeed,
  ]),
  ...deerRunLevelInputs.flatMap((inputs) => [
    inputs.goal,
    inputs.timeLimit,
    inputs.missesAllowed,
    inputs.spawnDelayMin,
    inputs.spawnDelayMax,
    inputs.rabbitSpeed,
    inputs.foxSpeed,
    inputs.falconSpeed,
    inputs.owlSpeed,
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
  bugMeadowGameActiveToggle,
  deerRunGameActiveToggle,
  task1EnabledToggle,
  task2EnabledToggle,
  task3EnabledToggle,
  soundEnabledToggle,
  trainingPausedToggle,
  lightTapRequireClickToggle,
  streetCarRequireClickToggle,
  dragonRequireClickToggle,
  fireRequireClickToggle,
  martianRequireClickToggle,
  bugMeadowRequireClickAndDragToggle,
  deerRunRequireClickAndDragToggle,
  ...deerRunLevelInputs.flatMap((inputs) => [
    inputs.rabbitEnabled,
    inputs.foxEnabled,
    inputs.falconEnabled,
    inputs.owlEnabled,
  ]),
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
  [lightTapRequireClickToggle, LIGHT_TAP_REQUIRE_CLICK_KEY],
  [streetCarRequireClickToggle, STREET_CAR_REQUIRE_CLICK_KEY],
  [dragonRequireClickToggle, DRAGON_REQUIRE_CLICK_KEY],
  [fireRequireClickToggle, FIRE_REQUIRE_CLICK_KEY],
  [martianRequireClickToggle, MARTIAN_REQUIRE_CLICK_KEY],
  [bugMeadowRequireClickAndDragToggle, BUG_MEADOW_REQUIRE_CLICK_AND_DRAG_KEY],
  [deerRunRequireClickAndDragToggle, DEER_RUN_REQUIRE_CLICK_AND_DRAG_KEY],
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
