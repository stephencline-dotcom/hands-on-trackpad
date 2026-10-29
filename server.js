const http = require("http");
const fs = require("fs");
const path = require("path");
const { normalize: normalizeHomeCardOrder } = require("./home-card-order-model.js");
const { normalize: normalizeRiverVisitorLevels, normalizeCamp: normalizeRiverCampChance } = require("./games/river-trail/visitor-settings.js");
const { createClient } = require("@supabase/supabase-js");

const PORT = Number.parseInt(process.env.PORT || "8000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const SUPABASE_URL =
  process.env.SUPABASE_URL || "";

const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY || "";

const supabase =
  SUPABASE_URL && SUPABASE_SECRET_KEY
    ? createClient(
        SUPABASE_URL,
        SUPABASE_SECRET_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      )
    : null;

/*
 * Temporary live classroom state.
 * This intentionally resets whenever
 * the server restarts.
 */
let liveClassroomState = {
  freezeScreenFeatureEnabled: false,
  freezeScreenArmed: false,
  freezeScreenImmediate: false,
  freezeTimerEndsAt: null,
  freezeStateRevision: 0,
};
const freezeStateEpoch = require("crypto").randomUUID();
let freezeTimerHandle = null;

function clearFreezeDeadline() {
  if (freezeTimerHandle !== null) clearTimeout(freezeTimerHandle);
  freezeTimerHandle = null;
  liveClassroomState.freezeTimerEndsAt = null;
}

function setLiveFreeze(armed, immediate = false) {
  clearFreezeDeadline();
  liveClassroomState.freezeScreenArmed = Boolean(armed);
  liveClassroomState.freezeScreenImmediate = Boolean(armed && immediate);
  liveClassroomState.freezeStateRevision++;
}

function applyFreezeFeature(enabled) {
  const next = Boolean(enabled);
  const changed = next !== liveClassroomState.freezeScreenFeatureEnabled;
  liveClassroomState.freezeScreenFeatureEnabled = next;
  if (!next && (liveClassroomState.freezeTimerEndsAt !== null || liveClassroomState.freezeScreenArmed)) setLiveFreeze(false);
  else if (changed) liveClassroomState.freezeStateRevision++;
}

function reconcileFreezeDeadline() {
  if (liveClassroomState.freezeTimerEndsAt !== null && Date.now() >= liveClassroomState.freezeTimerEndsAt) {
    setLiveFreeze(liveClassroomState.freezeScreenFeatureEnabled, liveClassroomState.freezeScreenFeatureEnabled);
  }
}

function scheduleFreezeDeadline() {
  const revision = liveClassroomState.freezeStateRevision;
  const deadline = liveClassroomState.freezeTimerEndsAt;
  if (deadline === null) return;
  freezeTimerHandle = setTimeout(() => {
    // A cancelled/replaced timer cannot re-arm the classroom after logout or release.
    if (revision !== liveClassroomState.freezeStateRevision || deadline !== liveClassroomState.freezeTimerEndsAt) return;
    freezeTimerHandle = null;
    reconcileFreezeDeadline();
    if (liveClassroomState.freezeTimerEndsAt !== null) scheduleFreezeDeadline();
  }, Math.max(1, deadline - Date.now()));
  freezeTimerHandle.unref?.();
}

function startFreezeDeadline(seconds) {
  setLiveFreeze(false);
  liveClassroomState.freezeTimerEndsAt = Date.now() + seconds * 1000;
  scheduleFreezeDeadline();
}

function freezeSnapshot() {
  reconcileFreezeDeadline();
  return { ...liveClassroomState, freezeStateEpoch, serverNow: Date.now() };
}

function normalizeTractorLevels(value, defaults) {
  if (!Array.isArray(value) || value.length !== 5) return [...defaults];
  const levels = value.map(v => v === true);
  return levels.some(Boolean) ? levels : [...defaults];
}
function normalizeSenseBuilderLevels(value, defaults) {
  if (!Array.isArray(value) || value.length !== 4) {
    return [...defaults];
  }

  const levels = value.map((enabled) => enabled === true);

  return levels.some(Boolean)
    ? levels
    : [...defaults];
}
function normalizeChickenLittleLevels(value, defaults) {
  if (!Array.isArray(value) || value.length !== 5) {
    return [...defaults];
  }

  const levels = value.map((enabled) => enabled === true);

  return levels.some(Boolean)
    ? levels
    : [...defaults];
}

function normalizeClambakeAdventureLevels(value, defaults) {
  if (!Array.isArray(value) || value.length !== 4) {
    return [...defaults];
  }

  const levels = value.map((enabled) => enabled === true);

  return levels.some(Boolean)
    ? levels
    : [...defaults];
}
function parseSheepRoundupSheepCount(value, fallback) {
  const n = Number(value);
  if (value === undefined || value === null || value === "" || !Number.isFinite(n)) return fallback;
  return Math.min(6, Math.max(1, Math.floor(n)));
}
function parseSheepRoundupExtraSheep(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(5, Math.max(0, Math.floor(n))) : 0;
}
const DEFAULT_SETTINGS = {
  homeCardOrder: [],
  task1RequiredSeconds: 8,
  task1Enabled: true,
  task2RequiredClicks: 10,
  task2Enabled: true,
  task3RequiredDragSeconds: 6,
  task3Enabled: true,
  task4RequiredScrollSeconds: 6,
  task4Enabled: true,
  fullscreenRequireClickAndDrag: false,
  mazeRequireClickAndDrag: false,
  carRequireClickAndDrag: false,
  jackRequireClickAndDrag: false,
  freezeScreenFeatureEnabled: false,
  freezeScreenArmed: false,
  fullscreenGameActive: true,
  mazeGameActive: true,
  carGameActive: true,
  jackGameActive: true,
  lightGameActive: true,
  streetCarGameActive: true,
  dragonDodgeGameActive: true,
  firefighterRescueGameActive: true,
  martianMadnessGameActive: true,
  bugMeadowGameActive: true,
  senseBuilderGameActive: true,
  senseBuilderRequireClickAndDrag: false,
  senseBuilderLevels: [true, true, true, true],
  tractorJobCrewLevels: [true, false, false, false, false],
  tractorJobCrewGameActive: true,
  johnnyAppleseedGameActive: true,
  chickenLittleGameActive: true,
  tortoisePuzzleGameActive: true,
  tortoisePuzzleVoiceInstructions: true,
  tortoisePuzzleAdventureLength: "medium",
  clambakeAdventureGameActive: true,
  clambakeAdventureDifficulty: "normal",
  clambakeAdventureLevels: [true, true, true, true],
  clambakeAdventureVoiceDirections: true,
  clambakeAdventureRequireClickAndDrag: false,
  chickenLittleRequireClickAndDrag: false,
  chickenLittleLevels: [true, true, true, true, true],
  chickenLittleLevelTimes: [45, 45, 45, 45],
  chickenLittleLevelSpeeds: [100, 100, 100, 100],
  chickenLittleLevelHits: [3, 3, 3, 3],
  fireflyForestGameActive: true,
  followBirdClickingEnabled: false,
  monsterLunchGameActive: true,
  deerRunGameActive: true,
  hauntedStreetGameActive: true,
  hauntedStreetRequireClickAndDrag: false,
  hauntedStreetClickToThrow: false,
  hauntedStreetSoundEnabled: true,
  hauntedStreetLevelSpeeds: [55, 66, 79, 94, 112],
  hauntedStreetLevelMaximums: [3, 4, 4, 5, 6],
  hauntedStreetLevelThrowIntervals: [650, 650, 650, 650, 650],
  hauntedStreetLevelPumpkinSpeeds: [520, 520, 520, 520, 520],
  hauntedStreetLevelGoals: [7, 10, 13, 17, 22],
  sheepRoundupLevel1SheepCount: 1,
  sheepRoundupLevel2SheepCount: 3,
  sheepRoundupLevel3SheepCount: 5,
  sheepRoundupLevel4SecondFox: false,
  sheepRoundupLevel4ExtraSheep: 0,
  sheepRoundupLevel5SecondFox: false,
  sheepRoundupLevel5ExtraSheep: 0,
  sheepRoundupLevel6SecondFox: false,
  sheepRoundupLevel6ExtraSheep: 0,
  sheepRoundupRequireClickAndDrag: false,
  tortoisePuzzleRequireClickAndDrag: false,
  riverTrailGameActive: true,
  riverTrailVoiceInstructions: false,
  riverTrailRequireClickAndDrag: false,
  riverTrailLevelCount: 5,
  riverTrailVisitorLevels: normalizeRiverVisitorLevels(),
  riverTrailCampChance: 40,
  farmyardHelpersGameActive: true,
  farmyardHelpersVoiceInstructions: false,
  farmyardHelpersRequireClickAndDrag: false,
  johnnyAppleseedVoiceInstructions: false,
  johnnyAppleseedRequireClickAndDrag: false,
  johnnyAppleseedBlackbirdsEnabled: true,
  johnnyAppleseedBirdDelay: 7,
  farmyardHelpersLevelCount: 4,
  harvestHeroesGameActive: true,
  harvestHeroesVoiceInstructions: true,
  harvestHeroesRequireClickAndDrag: false,
  harvestHeroesLevelCount: 3,
  pumpkinStudioGameActive: true,
  pumpkinStudioVoiceInstructions: true,
  pumpkinStudioRequireClickAndDrag: false,
  pumpkinStudioMenuScrolling: false,
  threeLittlePigsGameActive: true,
  threeLittlePigsVoiceInstructions: true,
  threeLittlePigsRequireClickAndDrag: false,
  sheepRoundupGameActive: true,
  sheepRoundupVoiceInstructions: true,
  sheepRoundupDifficulty: "gentle",
  trackpadGuideEnabled: true,
  soundEnabled: true,
  trainingPaused: false,
  jackFlameRainEnabled: true,
  jackFlameRainSizePx: 24,
  jackFlameRainHitRadiusPx: 12,
  jackFlameRainBurstMin: 2,
  jackFlameRainBurstMax: 4,
  jackFlameRainIntervalMinMs: 620,
  jackFlameRainIntervalMaxMs: 1300,
  jackFlameRainSpeedMin: 210,
  jackFlameRainSpeedMax: 320,
    jackFlameRain4: {
      enabled: true,
      size: 24,
      hitRadius: 12,
      burstMin: 2,
      burstMax: 4,
      intervalMin: 620,
      intervalMax: 1300,
      speedMin: 210,
      speedMax: 320,
    },
    jackFlameRain5: {
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
    jackFlameRain6: {
      enabled: true,
      size: 24,
      hitRadius: 12,
      burstMin: 4,
      burstMax: 7,
      intervalMin: 400,
      intervalMax: 900,
      speedMin: 320,
      speedMax: 480,
    },
    jackFlameRain7: {
      enabled: true,
      size: 24,
      hitRadius: 12,
      burstMin: 2,
      burstMax: 3,
      intervalMin: 800,
      intervalMax: 1500,
      speedMin: 130,
      speedMax: 210,
    },
  jackBonusSurvivalSeconds: 20,
  mazeGhostLevelsEnabled: [true, true, true, true, true, true],
  mazeGhostLevelsPerLevelCounts: [1, 2, 3, 4, 5, 6],
  carGameLevelsEnabled: [true, true, true, true, true, true],
  carGameLevelObstacleSpeeds: [0.16, 0.22, 0.28, 0.34, 0.4, 0.48],
  carGameLevelMaxCars: [1, 2, 3, 4, 5, 6],
  carGameLevelSurvivalSeconds: [10, 15, 20, 25, 30, 35],
  carGameLevelGasPumpSpawnSeconds: [5.2, 4.8, 4.4, 4.0, 3.6, 3.2],
  carGameLevelFuelDrainPerSecond: [1.8, 2.4, 3.2, 4.0, 5.0, 6.2],
};

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
};

function ensureSettingsFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(
      SETTINGS_FILE,
      JSON.stringify(DEFAULT_SETTINGS, null, 2)
    );
  }
}

function parseTask1Seconds(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_SETTINGS.task1RequiredSeconds;
  }

  return Math.min(120, Math.max(1, parsed));
}

function parseTask2Clicks(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_SETTINGS.task2RequiredClicks;
  }

  return Math.min(200, Math.max(1, parsed));
}

function parseTask3Seconds(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_SETTINGS.task3RequiredDragSeconds;
  }

  return Math.min(120, Math.max(1, parsed));
}

function parseTrainingPaused(value) {
  if (typeof value === "boolean") {
    return value;
  }

  return String(value) === "true";
}

function normalizeTortoiseAdventureLength(value) {
  return ["short", "medium", "long"].includes(value) ? value : "medium";
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
    return DEFAULT_SETTINGS.mazeGhostLevelsPerLevelCounts[0];
  }

  return Math.min(6, Math.max(0, parsed));
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

  return [...DEFAULT_SETTINGS.mazeGhostLevelsEnabled];
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

  return [...DEFAULT_SETTINGS.carGameLevelsEnabled];
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

function parseCarLevelSurvivalSeconds(value, fallback = 20) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(180, Math.max(5, parsed));
}

function parseCarGameGasPumpSpawnSeconds(value, fallback = 5.8) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(30, Math.max(2, parsed));
}

function parseCarGameFuelDrainPerSecond(value, fallback = 3.6) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(12, Math.max(0.5, parsed));
}

function parseJackFlameRainSize(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_SETTINGS.jackFlameRainSizePx;
  }

  return Math.min(64, Math.max(10, parsed));
}

function parseJackFlameRainHitRadius(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_SETTINGS.jackFlameRainHitRadiusPx;
  }

  return Math.min(48, Math.max(4, parsed));
}

function parseJackFlameRainBurstMin(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_SETTINGS.jackFlameRainBurstMin;
  }

  return Math.min(8, Math.max(1, parsed));
}

function parseJackFlameRainBurstMax(value, burstMin) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(burstMin, DEFAULT_SETTINGS.jackFlameRainBurstMax);
  }

  return Math.min(10, Math.max(burstMin, parsed));
}

function parseJackFlameRainIntervalMin(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_SETTINGS.jackFlameRainIntervalMinMs;
  }

  return Math.min(4000, Math.max(160, parsed));
}

function parseJackFlameRainIntervalMax(value, intervalMin) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(intervalMin + 30, DEFAULT_SETTINGS.jackFlameRainIntervalMaxMs);
  }

  return Math.min(5000, Math.max(intervalMin + 30, parsed));
}

function parseJackFlameRainSpeedMin(value) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return DEFAULT_SETTINGS.jackFlameRainSpeedMin;
  }

  return Math.min(900, Math.max(20, parsed));
}

function parseJackFlameRainSpeedMax(value, speedMin) {
  const parsed = Number.parseFloat(String(value || ""));
  if (!Number.isFinite(parsed)) {
    return Math.max(speedMin + 1, DEFAULT_SETTINGS.jackFlameRainSpeedMax);
  }

  return Math.min(1200, Math.max(speedMin + 1, parsed));
}

function parseFlameRainLevel(value, fallback) {
  const source = value && typeof value === "object" ? value : fallback;
  const burstMin = parseJackFlameRainBurstMin(source.burstMin);
  const intervalMin = parseJackFlameRainIntervalMin(source.intervalMin);
  const speedMin = parseJackFlameRainSpeedMin(source.speedMin);

  return {
    enabled: parseTaskEnabled(source.enabled, fallback.enabled),
    size: parseJackFlameRainSize(source.size),
    hitRadius: parseJackFlameRainHitRadius(source.hitRadius),
    burstMin,
    burstMax: parseJackFlameRainBurstMax(source.burstMax, burstMin),
    intervalMin,
    intervalMax: parseJackFlameRainIntervalMax(source.intervalMax, intervalMin),
    speedMin,
    speedMax: parseJackFlameRainSpeedMax(source.speedMax, speedMin),
  };
}

function parseCarLevelNumberArray(value, parser, fallbackArray) {
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

function parseHauntedStreetLevelNumbers(
  value,
  defaults,
  minimum,
  maximum
) {
  const source = Array.isArray(value)
    ? value
    : defaults;

  return defaults.map((fallback, index) => {
    const parsed = Number.parseInt(
      source[index],
      10
    );

    if (!Number.isFinite(parsed)) {
      return fallback;
    }

    return Math.min(
      maximum,
      Math.max(minimum, parsed)
    );
  });
}

function loadSettings() {
  ensureSettingsFile();

  try {
    const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
    const data = JSON.parse(raw);
    const fallbackGhostCount = parseGhostCount(
      data.mazeGhostsPerLevel ?? DEFAULT_SETTINGS.mazeGhostLevelsPerLevelCounts[0]
    );
    const flameBurstMin = parseJackFlameRainBurstMin(data.jackFlameRainBurstMin);
    const flameIntervalMin = parseJackFlameRainIntervalMin(data.jackFlameRainIntervalMinMs);
    const flameSpeedMin = parseJackFlameRainSpeedMin(data.jackFlameRainSpeedMin);
    return {
      homeCardOrder: normalizeHomeCardOrder(data.homeCardOrder),
      task1RequiredSeconds: parseTask1Seconds(data.task1RequiredSeconds),
      task1Enabled: parseTaskEnabled(data.task1Enabled, true),
      task2RequiredClicks: parseTask2Clicks(data.task2RequiredClicks),
      task2Enabled: parseTaskEnabled(data.task2Enabled, true),
      task3RequiredDragSeconds: parseTask3Seconds(data.task3RequiredDragSeconds),
      task3Enabled: parseTaskEnabled(data.task3Enabled, true),
      task4RequiredScrollSeconds: parseTask3Seconds(
        data.task4RequiredScrollSeconds
      ),
      task4Enabled: parseTaskEnabled(
        data.task4Enabled,
        true
      ),
      fullscreenRequireClickAndDrag: parseTaskEnabled(
        data.fullscreenRequireClickAndDrag,
        DEFAULT_SETTINGS.fullscreenRequireClickAndDrag
      ),
      mazeRequireClickAndDrag: parseTaskEnabled(
        data.mazeRequireClickAndDrag,
        DEFAULT_SETTINGS.mazeRequireClickAndDrag
      ),
      carRequireClickAndDrag: parseTaskEnabled(
        data.carRequireClickAndDrag,
        DEFAULT_SETTINGS.carRequireClickAndDrag
      ),
      jackRequireClickAndDrag: parseTaskEnabled(
        data.jackRequireClickAndDrag,
        DEFAULT_SETTINGS.jackRequireClickAndDrag
      ),
      freezeScreenFeatureEnabled: parseTaskEnabled(
        data.freezeScreenFeatureEnabled,
        DEFAULT_SETTINGS.freezeScreenFeatureEnabled
      ),
      freezeScreenArmed: parseTaskEnabled(
        data.freezeScreenArmed,
        DEFAULT_SETTINGS.freezeScreenArmed
      ),
      fullscreenGameActive: parseTaskEnabled(
        data.fullscreenGameActive,
        DEFAULT_SETTINGS.fullscreenGameActive
      ),
      mazeGameActive: parseTaskEnabled(
        data.mazeGameActive,
        DEFAULT_SETTINGS.mazeGameActive
      ),
      carGameActive: parseTaskEnabled(
        data.carGameActive,
        DEFAULT_SETTINGS.carGameActive
      ),
      jackGameActive: parseTaskEnabled(
        data.jackGameActive,
        DEFAULT_SETTINGS.jackGameActive
      ),
      lightGameActive: parseTaskEnabled(
        data.lightGameActive,
        DEFAULT_SETTINGS.lightGameActive
      ),
      streetCarGameActive: parseTaskEnabled(
        data.streetCarGameActive,
        DEFAULT_SETTINGS.streetCarGameActive
      ),
      dragonDodgeGameActive: parseTaskEnabled(
        data.dragonDodgeGameActive,
        DEFAULT_SETTINGS.dragonDodgeGameActive
      ),
      firefighterRescueGameActive: parseTaskEnabled(
        data.firefighterRescueGameActive,
        DEFAULT_SETTINGS.firefighterRescueGameActive
      ),
      martianMadnessGameActive: parseTaskEnabled(
        data.martianMadnessGameActive,
        DEFAULT_SETTINGS.martianMadnessGameActive
      ),
      bugMeadowGameActive: parseTaskEnabled(
        data.bugMeadowGameActive,
        DEFAULT_SETTINGS.bugMeadowGameActive
      ),
      senseBuilderGameActive: parseTaskEnabled(
        data.senseBuilderGameActive,
        DEFAULT_SETTINGS.senseBuilderGameActive
      ),
      senseBuilderRequireClickAndDrag: parseTaskEnabled(
        data.senseBuilderRequireClickAndDrag,
        DEFAULT_SETTINGS.senseBuilderRequireClickAndDrag
      ),
      senseBuilderLevels: normalizeSenseBuilderLevels(
        data.senseBuilderLevels,
        DEFAULT_SETTINGS.senseBuilderLevels
      ),
      tractorJobCrewLevels: normalizeTractorLevels(data.tractorJobCrewLevels, DEFAULT_SETTINGS.tractorJobCrewLevels),
      tractorJobCrewGameActive: parseTaskEnabled(data.tractorJobCrewGameActive, true),
      johnnyAppleseedGameActive: parseTaskEnabled(data.johnnyAppleseedGameActive, true),
      chickenLittleGameActive: parseTaskEnabled(
        data.chickenLittleGameActive,
        DEFAULT_SETTINGS.chickenLittleGameActive
      ),
      tortoisePuzzleAdventureLength: normalizeTortoiseAdventureLength(data.tortoisePuzzleAdventureLength),
      tortoisePuzzleVoiceInstructions: parseTaskEnabled(data.tortoisePuzzleVoiceInstructions, true),
      tortoisePuzzleGameActive: parseTaskEnabled(
        data.tortoisePuzzleGameActive,
        DEFAULT_SETTINGS.tortoisePuzzleGameActive
      ),
      clambakeAdventureGameActive: parseTaskEnabled(
        data.clambakeAdventureGameActive,
        DEFAULT_SETTINGS.clambakeAdventureGameActive
      ),
      clambakeAdventureDifficulty:
        data.clambakeAdventureDifficulty === "easy"
          ? "easy"
          : "normal",
      clambakeAdventureLevels: normalizeClambakeAdventureLevels(
        data.clambakeAdventureLevels,
        DEFAULT_SETTINGS.clambakeAdventureLevels
      ),
      clambakeAdventureVoiceDirections: parseTaskEnabled(
        data.clambakeAdventureVoiceDirections,
        DEFAULT_SETTINGS.clambakeAdventureVoiceDirections
      ),
      clambakeAdventureRequireClickAndDrag: parseTaskEnabled(
        data.clambakeAdventureRequireClickAndDrag,
        DEFAULT_SETTINGS.clambakeAdventureRequireClickAndDrag
      ),
      chickenLittleRequireClickAndDrag: parseTaskEnabled(
        data.chickenLittleRequireClickAndDrag,
        DEFAULT_SETTINGS.chickenLittleRequireClickAndDrag
      ),
      chickenLittleLevels: normalizeChickenLittleLevels(
        data.chickenLittleLevels,
        DEFAULT_SETTINGS.chickenLittleLevels
      ),
      chickenLittleLevelTimes:
        parseHauntedStreetLevelNumbers(
          data.chickenLittleLevelTimes,
          DEFAULT_SETTINGS.chickenLittleLevelTimes,
          20,
          120
        ),
      chickenLittleLevelSpeeds:
        parseHauntedStreetLevelNumbers(
          data.chickenLittleLevelSpeeds,
          DEFAULT_SETTINGS.chickenLittleLevelSpeeds,
          50,
          200
        ),
      chickenLittleLevelHits:
        parseHauntedStreetLevelNumbers(
          data.chickenLittleLevelHits,
          DEFAULT_SETTINGS.chickenLittleLevelHits,
          1,
          10
        ),
      fireflyForestGameActive: parseTaskEnabled(
        data.fireflyForestGameActive,
        DEFAULT_SETTINGS.fireflyForestGameActive
      ),
      followBirdClickingEnabled: parseTaskEnabled(
        data.followBirdClickingEnabled,
        DEFAULT_SETTINGS.followBirdClickingEnabled
      ),
      monsterLunchGameActive: parseTaskEnabled(
        data.monsterLunchGameActive,
        DEFAULT_SETTINGS.monsterLunchGameActive
      ),
      deerRunGameActive: parseTaskEnabled(
        data.deerRunGameActive,
        DEFAULT_SETTINGS.deerRunGameActive
      ),
      hauntedStreetGameActive: parseTaskEnabled(
        data.hauntedStreetGameActive,
        DEFAULT_SETTINGS.hauntedStreetGameActive
      ),
      hauntedStreetRequireClickAndDrag: parseTaskEnabled(
        data.hauntedStreetRequireClickAndDrag,
        DEFAULT_SETTINGS.hauntedStreetRequireClickAndDrag
      ),
      hauntedStreetClickToThrow: parseTaskEnabled(
        data.hauntedStreetClickToThrow,
        DEFAULT_SETTINGS.hauntedStreetClickToThrow
      ),
      hauntedStreetSoundEnabled: parseTaskEnabled(
        data.hauntedStreetSoundEnabled,
        DEFAULT_SETTINGS.hauntedStreetSoundEnabled
      ),
      hauntedStreetLevelSpeeds:
        parseHauntedStreetLevelNumbers(
          data.hauntedStreetLevelSpeeds,
          DEFAULT_SETTINGS.hauntedStreetLevelSpeeds,
          20,
          300
        ),
      hauntedStreetLevelMaximums:
        parseHauntedStreetLevelNumbers(
          data.hauntedStreetLevelMaximums,
          DEFAULT_SETTINGS.hauntedStreetLevelMaximums,
          1,
          15
        ),
      hauntedStreetLevelThrowIntervals:
        parseHauntedStreetLevelNumbers(
          data.hauntedStreetLevelThrowIntervals,
          DEFAULT_SETTINGS.hauntedStreetLevelThrowIntervals,
          150,
          3000
        ),
      hauntedStreetLevelPumpkinSpeeds:
        parseHauntedStreetLevelNumbers(
          data.hauntedStreetLevelPumpkinSpeeds,
          DEFAULT_SETTINGS.hauntedStreetLevelPumpkinSpeeds,
          150,
          1200
        ),
      hauntedStreetLevelGoals:
        parseHauntedStreetLevelNumbers(
          data.hauntedStreetLevelGoals,
          DEFAULT_SETTINGS.hauntedStreetLevelGoals,
          1,
          100
        ),
      sheepRoundupLevel1SheepCount: parseSheepRoundupSheepCount(data.sheepRoundupLevel1SheepCount, 1),
      sheepRoundupLevel2SheepCount: parseSheepRoundupSheepCount(data.sheepRoundupLevel2SheepCount, 3),
      sheepRoundupLevel3SheepCount: parseSheepRoundupSheepCount(data.sheepRoundupLevel3SheepCount, 5),
      sheepRoundupLevel4SecondFox: parseTaskEnabled(data.sheepRoundupLevel4SecondFox, false),
      sheepRoundupLevel4ExtraSheep: parseSheepRoundupExtraSheep(data.sheepRoundupLevel4ExtraSheep),
      sheepRoundupLevel5SecondFox: parseTaskEnabled(data.sheepRoundupLevel5SecondFox, false),
      sheepRoundupLevel5ExtraSheep: parseSheepRoundupExtraSheep(data.sheepRoundupLevel5ExtraSheep),
      sheepRoundupLevel6SecondFox: parseTaskEnabled(data.sheepRoundupLevel6SecondFox, false),
      sheepRoundupLevel6ExtraSheep: parseSheepRoundupExtraSheep(data.sheepRoundupLevel6ExtraSheep),
      sheepRoundupRequireClickAndDrag: parseTaskEnabled(data.sheepRoundupRequireClickAndDrag, false),
      tortoisePuzzleRequireClickAndDrag: parseTaskEnabled(data.tortoisePuzzleRequireClickAndDrag, false),
      riverTrailGameActive: parseTaskEnabled(data.riverTrailGameActive, true),
      riverTrailVoiceInstructions: parseTaskEnabled(data.riverTrailVoiceInstructions, false),
      riverTrailRequireClickAndDrag: parseTaskEnabled(data.riverTrailRequireClickAndDrag, false),
      riverTrailLevelCount: [1, 2, 3, 4, 5].includes(Number(data.riverTrailLevelCount)) ? Number(data.riverTrailLevelCount) : 5,
      riverTrailVisitorLevels: normalizeRiverVisitorLevels(data.riverTrailVisitorLevels),
      riverTrailCampChance: normalizeRiverCampChance(data.riverTrailCampChance),
      farmyardHelpersGameActive: parseTaskEnabled(data.farmyardHelpersGameActive, true),
      farmyardHelpersVoiceInstructions: parseTaskEnabled(data.farmyardHelpersVoiceInstructions, false),
      farmyardHelpersRequireClickAndDrag: parseTaskEnabled(data.farmyardHelpersRequireClickAndDrag, false),
      johnnyAppleseedVoiceInstructions: parseTaskEnabled(data.johnnyAppleseedVoiceInstructions, false),
      johnnyAppleseedRequireClickAndDrag: parseTaskEnabled(data.johnnyAppleseedRequireClickAndDrag, false),
      johnnyAppleseedBlackbirdsEnabled: parseTaskEnabled(data.johnnyAppleseedBlackbirdsEnabled, true),
      johnnyAppleseedBirdDelay: [5,7,12].includes(Number(data.johnnyAppleseedBirdDelay)) ? Number(data.johnnyAppleseedBirdDelay) : 7,
      farmyardHelpersLevelCount: [1, 2, 3, 4].includes(Number(data.farmyardHelpersLevelCount)) ? Number(data.farmyardHelpersLevelCount) : 4,
      harvestHeroesGameActive: parseTaskEnabled(data.harvestHeroesGameActive, true),
      harvestHeroesVoiceInstructions: parseTaskEnabled(data.harvestHeroesVoiceInstructions, true),
      harvestHeroesRequireClickAndDrag: parseTaskEnabled(data.harvestHeroesRequireClickAndDrag, false),
      harvestHeroesLevelCount: [1, 2, 3].includes(Number(data.harvestHeroesLevelCount)) ? Number(data.harvestHeroesLevelCount) : 3,
      pumpkinStudioGameActive: parseTaskEnabled(data.pumpkinStudioGameActive, true),
      pumpkinStudioVoiceInstructions: parseTaskEnabled(data.pumpkinStudioVoiceInstructions, true),
      pumpkinStudioRequireClickAndDrag: parseTaskEnabled(data.pumpkinStudioRequireClickAndDrag, false),
      pumpkinStudioMenuScrolling: parseTaskEnabled(data.pumpkinStudioMenuScrolling, false),
      threeLittlePigsGameActive: parseTaskEnabled(data.threeLittlePigsGameActive, true),
      threeLittlePigsVoiceInstructions: parseTaskEnabled(data.threeLittlePigsVoiceInstructions, true),
      threeLittlePigsRequireClickAndDrag: parseTaskEnabled(data.threeLittlePigsRequireClickAndDrag, false),
      sheepRoundupGameActive: parseTaskEnabled(data.sheepRoundupGameActive, true),
      sheepRoundupVoiceInstructions: parseTaskEnabled(data.sheepRoundupVoiceInstructions, true),
      sheepRoundupDifficulty: data.sheepRoundupDifficulty === "normal" ? "normal" : "gentle",
      trackpadGuideEnabled: parseTaskEnabled(
        data.trackpadGuideEnabled,
        DEFAULT_SETTINGS.trackpadGuideEnabled
      ),
      soundEnabled: parseTaskEnabled(data.soundEnabled, true),
      trainingPaused: parseTrainingPaused(data.trainingPaused),
      jackFlameRainEnabled: parseTaskEnabled(data.jackFlameRainEnabled, DEFAULT_SETTINGS.jackFlameRainEnabled),
      jackFlameRainSizePx: parseJackFlameRainSize(data.jackFlameRainSizePx),
      jackFlameRainHitRadiusPx: parseJackFlameRainHitRadius(data.jackFlameRainHitRadiusPx),
      jackFlameRainBurstMin: flameBurstMin,
      jackFlameRainBurstMax: parseJackFlameRainBurstMax(data.jackFlameRainBurstMax, flameBurstMin),
      jackFlameRainIntervalMinMs: flameIntervalMin,
      jackFlameRainIntervalMaxMs: parseJackFlameRainIntervalMax(data.jackFlameRainIntervalMaxMs, flameIntervalMin),
      jackFlameRainSpeedMin: flameSpeedMin,
      jackFlameRainSpeedMax: parseJackFlameRainSpeedMax(data.jackFlameRainSpeedMax, flameSpeedMin),
      jackFlameRain4: parseFlameRainLevel(data.jackFlameRain4, DEFAULT_SETTINGS.jackFlameRain4),
      jackFlameRain5: parseFlameRainLevel(data.jackFlameRain5, DEFAULT_SETTINGS.jackFlameRain5),
      jackFlameRain6: parseFlameRainLevel(data.jackFlameRain6, DEFAULT_SETTINGS.jackFlameRain6),
      jackFlameRain7: parseFlameRainLevel(data.jackFlameRain7, DEFAULT_SETTINGS.jackFlameRain7),
      jackBonusSurvivalSeconds: Math.min(
        120,
        Math.max(
          5,
          Number.parseInt(data.jackBonusSurvivalSeconds, 10) ||
            DEFAULT_SETTINGS.jackBonusSurvivalSeconds
        )
      ),
      mazeGhostLevelsEnabled: parseGhostLevelsEnabled(data.mazeGhostLevelsEnabled, true),
      mazeGhostLevelsPerLevelCounts: parseGhostLevelCounts(
        data.mazeGhostLevelsPerLevelCounts,
        fallbackGhostCount
      ),
      carGameLevelsEnabled: parseCarGameLevelsEnabled(data.carGameLevelsEnabled, true),
      carGameLevelObstacleSpeeds: parseCarLevelNumberArray(
        data.carGameLevelObstacleSpeeds,
        parseCarLevelSpeed,
        DEFAULT_SETTINGS.carGameLevelObstacleSpeeds
      ),
      carGameLevelMaxCars: parseCarLevelNumberArray(
        data.carGameLevelMaxCars,
        parseCarLevelMaxCars,
        DEFAULT_SETTINGS.carGameLevelMaxCars
      ),
      carGameLevelSurvivalSeconds: parseCarLevelNumberArray(
        data.carGameLevelSurvivalSeconds,
        parseCarLevelSurvivalSeconds,
        DEFAULT_SETTINGS.carGameLevelSurvivalSeconds
      ),
      carGameLevelGasPumpSpawnSeconds: parseCarLevelNumberArray(
        data.carGameLevelGasPumpSpawnSeconds,
        parseCarGameGasPumpSpawnSeconds,
        DEFAULT_SETTINGS.carGameLevelGasPumpSpawnSeconds
      ),
      carGameLevelFuelDrainPerSecond: parseCarLevelNumberArray(
        data.carGameLevelFuelDrainPerSecond,
        parseCarGameFuelDrainPerSecond,
        DEFAULT_SETTINGS.carGameLevelFuelDrainPerSecond
      ),
      movingSoundSettings:
        data.movingSoundSettings &&
        typeof data.movingSoundSettings === "object"
          ? data.movingSoundSettings
          : {},
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  ensureSettingsFile();
  const existing = loadSettings();
  const jackFlameRainBurstMin = parseJackFlameRainBurstMin(
    settings.jackFlameRainBurstMin ?? existing.jackFlameRainBurstMin
  );
  const jackFlameRainIntervalMinMs = parseJackFlameRainIntervalMin(
    settings.jackFlameRainIntervalMinMs ?? existing.jackFlameRainIntervalMinMs
  );
  const jackFlameRainSpeedMin = parseJackFlameRainSpeedMin(
    settings.jackFlameRainSpeedMin ?? existing.jackFlameRainSpeedMin
  );
  const normalized = {
    homeCardOrder: normalizeHomeCardOrder(settings.homeCardOrder ?? existing.homeCardOrder),
    task1RequiredSeconds: parseTask1Seconds(settings.task1RequiredSeconds ?? existing.task1RequiredSeconds),
    task1Enabled: parseTaskEnabled(settings.task1Enabled ?? existing.task1Enabled, true),
    task2RequiredClicks: parseTask2Clicks(settings.task2RequiredClicks ?? existing.task2RequiredClicks),
    task2Enabled: parseTaskEnabled(settings.task2Enabled ?? existing.task2Enabled, true),
    task3RequiredDragSeconds: parseTask3Seconds(settings.task3RequiredDragSeconds ?? existing.task3RequiredDragSeconds),
    task3Enabled: parseTaskEnabled(settings.task3Enabled ?? existing.task3Enabled, true),
    task4RequiredScrollSeconds: parseTask3Seconds(
      settings.task4RequiredScrollSeconds ??
        existing.task4RequiredScrollSeconds
    ),
    task4Enabled: parseTaskEnabled(
      settings.task4Enabled ??
        existing.task4Enabled,
      true
    ),
    fullscreenRequireClickAndDrag: parseTaskEnabled(
      settings.fullscreenRequireClickAndDrag ?? existing.fullscreenRequireClickAndDrag,
      DEFAULT_SETTINGS.fullscreenRequireClickAndDrag
    ),
    mazeRequireClickAndDrag: parseTaskEnabled(
      settings.mazeRequireClickAndDrag ?? existing.mazeRequireClickAndDrag,
      DEFAULT_SETTINGS.mazeRequireClickAndDrag
    ),
    carRequireClickAndDrag: parseTaskEnabled(
      settings.carRequireClickAndDrag ?? existing.carRequireClickAndDrag,
      DEFAULT_SETTINGS.carRequireClickAndDrag
    ),
    jackRequireClickAndDrag: parseTaskEnabled(
      settings.jackRequireClickAndDrag ?? existing.jackRequireClickAndDrag,
      DEFAULT_SETTINGS.jackRequireClickAndDrag
    ),
    freezeScreenFeatureEnabled: parseTaskEnabled(
      settings.freezeScreenFeatureEnabled ??
        existing.freezeScreenFeatureEnabled,
      DEFAULT_SETTINGS.freezeScreenFeatureEnabled
    ),
    freezeScreenArmed: parseTaskEnabled(
      settings.freezeScreenArmed ??
        existing.freezeScreenArmed,
      DEFAULT_SETTINGS.freezeScreenArmed
    ),
    fullscreenGameActive: parseTaskEnabled(
      settings.fullscreenGameActive ?? existing.fullscreenGameActive,
      DEFAULT_SETTINGS.fullscreenGameActive
    ),
    mazeGameActive: parseTaskEnabled(
      settings.mazeGameActive ?? existing.mazeGameActive,
      DEFAULT_SETTINGS.mazeGameActive
    ),
    carGameActive: parseTaskEnabled(
      settings.carGameActive ?? existing.carGameActive,
      DEFAULT_SETTINGS.carGameActive
    ),
    jackGameActive: parseTaskEnabled(
      settings.jackGameActive ?? existing.jackGameActive,
      DEFAULT_SETTINGS.jackGameActive
    ),
    lightGameActive: parseTaskEnabled(
      settings.lightGameActive ?? existing.lightGameActive,
      DEFAULT_SETTINGS.lightGameActive
    ),
    streetCarGameActive: parseTaskEnabled(
      settings.streetCarGameActive ?? existing.streetCarGameActive,
      DEFAULT_SETTINGS.streetCarGameActive
    ),
    dragonDodgeGameActive: parseTaskEnabled(
      settings.dragonDodgeGameActive ?? existing.dragonDodgeGameActive,
      DEFAULT_SETTINGS.dragonDodgeGameActive
    ),
    firefighterRescueGameActive: parseTaskEnabled(
      settings.firefighterRescueGameActive ?? existing.firefighterRescueGameActive,
      DEFAULT_SETTINGS.firefighterRescueGameActive
    ),
    martianMadnessGameActive: parseTaskEnabled(
      settings.martianMadnessGameActive ?? existing.martianMadnessGameActive,
      DEFAULT_SETTINGS.martianMadnessGameActive
    ),
    hauntedStreetGameActive: parseTaskEnabled(
      settings.hauntedStreetGameActive ??
        existing.hauntedStreetGameActive,
      DEFAULT_SETTINGS.hauntedStreetGameActive
    ),
    hauntedStreetRequireClickAndDrag: parseTaskEnabled(
      settings.hauntedStreetRequireClickAndDrag ??
        existing.hauntedStreetRequireClickAndDrag,
      DEFAULT_SETTINGS.hauntedStreetRequireClickAndDrag
    ),
    hauntedStreetClickToThrow: parseTaskEnabled(
      settings.hauntedStreetClickToThrow ??
        existing.hauntedStreetClickToThrow,
      DEFAULT_SETTINGS.hauntedStreetClickToThrow
    ),
    hauntedStreetSoundEnabled: parseTaskEnabled(
      settings.hauntedStreetSoundEnabled ??
        existing.hauntedStreetSoundEnabled,
      DEFAULT_SETTINGS.hauntedStreetSoundEnabled
    ),
    hauntedStreetLevelSpeeds:
      parseHauntedStreetLevelNumbers(
        settings.hauntedStreetLevelSpeeds ??
          existing.hauntedStreetLevelSpeeds,
        DEFAULT_SETTINGS.hauntedStreetLevelSpeeds,
        20,
        300
      ),
    hauntedStreetLevelMaximums:
      parseHauntedStreetLevelNumbers(
        settings.hauntedStreetLevelMaximums ??
          existing.hauntedStreetLevelMaximums,
        DEFAULT_SETTINGS.hauntedStreetLevelMaximums,
        1,
        15
      ),
    hauntedStreetLevelThrowIntervals:
      parseHauntedStreetLevelNumbers(
        settings.hauntedStreetLevelThrowIntervals ??
          existing.hauntedStreetLevelThrowIntervals,
        DEFAULT_SETTINGS.hauntedStreetLevelThrowIntervals,
        150,
        3000
      ),
    hauntedStreetLevelPumpkinSpeeds:
      parseHauntedStreetLevelNumbers(
        settings.hauntedStreetLevelPumpkinSpeeds ??
          existing.hauntedStreetLevelPumpkinSpeeds,
        DEFAULT_SETTINGS.hauntedStreetLevelPumpkinSpeeds,
        150,
        1200
      ),

    hauntedStreetLevelGoals:
      parseHauntedStreetLevelNumbers(
        settings.hauntedStreetLevelGoals ??
          existing.hauntedStreetLevelGoals,
        DEFAULT_SETTINGS.hauntedStreetLevelGoals,
        1,
        100
      ),

    bugMeadowGameActive: parseTaskEnabled(
      settings.bugMeadowGameActive ??
        existing.bugMeadowGameActive,
      DEFAULT_SETTINGS.bugMeadowGameActive
    ),
    senseBuilderGameActive: parseTaskEnabled(
      settings.senseBuilderGameActive ??
        existing.senseBuilderGameActive,
      DEFAULT_SETTINGS.senseBuilderGameActive
    ),
    senseBuilderRequireClickAndDrag: parseTaskEnabled(
      settings.senseBuilderRequireClickAndDrag ??
        existing.senseBuilderRequireClickAndDrag,
      DEFAULT_SETTINGS.senseBuilderRequireClickAndDrag
    ),
    senseBuilderLevels: normalizeSenseBuilderLevels(
      settings.senseBuilderLevels ??
        existing.senseBuilderLevels,
      DEFAULT_SETTINGS.senseBuilderLevels
    ),
    tractorJobCrewLevels: normalizeTractorLevels(settings.tractorJobCrewLevels ?? existing.tractorJobCrewLevels, DEFAULT_SETTINGS.tractorJobCrewLevels),
    tractorJobCrewGameActive: parseTaskEnabled(settings.tractorJobCrewGameActive ?? existing.tractorJobCrewGameActive, true),
    johnnyAppleseedGameActive: parseTaskEnabled(settings.johnnyAppleseedGameActive ?? existing.johnnyAppleseedGameActive, true),
    chickenLittleGameActive: parseTaskEnabled(
      settings.chickenLittleGameActive ??
        existing.chickenLittleGameActive,
      DEFAULT_SETTINGS.chickenLittleGameActive
    ),
    tortoisePuzzleAdventureLength: normalizeTortoiseAdventureLength(settings.tortoisePuzzleAdventureLength ?? existing.tortoisePuzzleAdventureLength),
    tortoisePuzzleVoiceInstructions: parseTaskEnabled(settings.tortoisePuzzleVoiceInstructions ?? existing.tortoisePuzzleVoiceInstructions, true),
    tortoisePuzzleGameActive: parseTaskEnabled(
      settings.tortoisePuzzleGameActive ??
        existing.tortoisePuzzleGameActive,
      DEFAULT_SETTINGS.tortoisePuzzleGameActive
    ),
    clambakeAdventureGameActive: parseTaskEnabled(
      settings.clambakeAdventureGameActive ??
        existing.clambakeAdventureGameActive,
      DEFAULT_SETTINGS.clambakeAdventureGameActive
    ),
    clambakeAdventureDifficulty:
      (settings.clambakeAdventureDifficulty ??
        existing.clambakeAdventureDifficulty) === "easy"
        ? "easy"
        : "normal",
    clambakeAdventureLevels: normalizeClambakeAdventureLevels(
      settings.clambakeAdventureLevels ??
        existing.clambakeAdventureLevels,
      DEFAULT_SETTINGS.clambakeAdventureLevels
    ),
    clambakeAdventureVoiceDirections: parseTaskEnabled(
      settings.clambakeAdventureVoiceDirections ??
        existing.clambakeAdventureVoiceDirections,
      DEFAULT_SETTINGS.clambakeAdventureVoiceDirections
    ),
    clambakeAdventureRequireClickAndDrag: parseTaskEnabled(
      settings.clambakeAdventureRequireClickAndDrag ??
        existing.clambakeAdventureRequireClickAndDrag,
      DEFAULT_SETTINGS.clambakeAdventureRequireClickAndDrag
    ),
    chickenLittleRequireClickAndDrag: parseTaskEnabled(
      settings.chickenLittleRequireClickAndDrag ??
        existing.chickenLittleRequireClickAndDrag,
      DEFAULT_SETTINGS.chickenLittleRequireClickAndDrag
    ),
    chickenLittleLevels: normalizeChickenLittleLevels(
      settings.chickenLittleLevels ??
        existing.chickenLittleLevels,
      DEFAULT_SETTINGS.chickenLittleLevels
    ),
    chickenLittleLevelTimes:
      parseHauntedStreetLevelNumbers(
        settings.chickenLittleLevelTimes ??
          existing.chickenLittleLevelTimes,
        DEFAULT_SETTINGS.chickenLittleLevelTimes,
        20,
        120
      ),
    chickenLittleLevelSpeeds:
      parseHauntedStreetLevelNumbers(
        settings.chickenLittleLevelSpeeds ??
          existing.chickenLittleLevelSpeeds,
        DEFAULT_SETTINGS.chickenLittleLevelSpeeds,
        50,
        200
      ),
    chickenLittleLevelHits:
      parseHauntedStreetLevelNumbers(
        settings.chickenLittleLevelHits ??
          existing.chickenLittleLevelHits,
        DEFAULT_SETTINGS.chickenLittleLevelHits,
        1,
        10
      ),
    fireflyForestGameActive: parseTaskEnabled(
      settings.fireflyForestGameActive ??
        existing.fireflyForestGameActive,
      DEFAULT_SETTINGS.fireflyForestGameActive
    ),
    followBirdClickingEnabled: parseTaskEnabled(
      settings.followBirdClickingEnabled ??
        existing.followBirdClickingEnabled,
      DEFAULT_SETTINGS.followBirdClickingEnabled
    ),
    monsterLunchGameActive: parseTaskEnabled(
      settings.monsterLunchGameActive ??
        existing.monsterLunchGameActive,
      DEFAULT_SETTINGS.monsterLunchGameActive
    ),
    deerRunGameActive: parseTaskEnabled(
      settings.deerRunGameActive ??
        existing.deerRunGameActive,
      DEFAULT_SETTINGS.deerRunGameActive
    ),

    monsterLunchLevels:
      Array.isArray(settings.monsterLunchLevels)
        ? settings.monsterLunchLevels
        : Array.isArray(existing.monsterLunchLevels)
          ? existing.monsterLunchLevels
          : [],

    sheepRoundupLevel1SheepCount: parseSheepRoundupSheepCount(settings.sheepRoundupLevel1SheepCount ?? existing.sheepRoundupLevel1SheepCount, 1),

    sheepRoundupLevel2SheepCount: parseSheepRoundupSheepCount(settings.sheepRoundupLevel2SheepCount ?? existing.sheepRoundupLevel2SheepCount, 3),

    sheepRoundupLevel3SheepCount: parseSheepRoundupSheepCount(settings.sheepRoundupLevel3SheepCount ?? existing.sheepRoundupLevel3SheepCount, 5),

    sheepRoundupLevel4SecondFox: parseTaskEnabled(settings.sheepRoundupLevel4SecondFox ?? existing.sheepRoundupLevel4SecondFox, false),

    sheepRoundupLevel4ExtraSheep: parseSheepRoundupExtraSheep(settings.sheepRoundupLevel4ExtraSheep ?? existing.sheepRoundupLevel4ExtraSheep),

    sheepRoundupLevel5SecondFox: parseTaskEnabled(settings.sheepRoundupLevel5SecondFox ?? existing.sheepRoundupLevel5SecondFox, false),

    sheepRoundupLevel5ExtraSheep: parseSheepRoundupExtraSheep(settings.sheepRoundupLevel5ExtraSheep ?? existing.sheepRoundupLevel5ExtraSheep),

    sheepRoundupLevel6SecondFox: parseTaskEnabled(settings.sheepRoundupLevel6SecondFox ?? existing.sheepRoundupLevel6SecondFox, false),

    sheepRoundupLevel6ExtraSheep: parseSheepRoundupExtraSheep(settings.sheepRoundupLevel6ExtraSheep ?? existing.sheepRoundupLevel6ExtraSheep),

    sheepRoundupRequireClickAndDrag: parseTaskEnabled(settings.sheepRoundupRequireClickAndDrag ?? existing.sheepRoundupRequireClickAndDrag, false),

    tortoisePuzzleRequireClickAndDrag: parseTaskEnabled(settings.tortoisePuzzleRequireClickAndDrag ?? existing.tortoisePuzzleRequireClickAndDrag, false),

    riverTrailGameActive: parseTaskEnabled(settings.riverTrailGameActive ?? existing.riverTrailGameActive, true),
    riverTrailVoiceInstructions: parseTaskEnabled(settings.riverTrailVoiceInstructions ?? existing.riverTrailVoiceInstructions, false),
    riverTrailRequireClickAndDrag: parseTaskEnabled(settings.riverTrailRequireClickAndDrag ?? existing.riverTrailRequireClickAndDrag, false),
    riverTrailLevelCount: [1, 2, 3, 4, 5].includes(Number(settings.riverTrailLevelCount ?? existing.riverTrailLevelCount)) ? Number(settings.riverTrailLevelCount ?? existing.riverTrailLevelCount) : 5,
    riverTrailVisitorLevels: normalizeRiverVisitorLevels(settings.riverTrailVisitorLevels ?? existing.riverTrailVisitorLevels),
    riverTrailCampChance: normalizeRiverCampChance(settings.riverTrailCampChance ?? existing.riverTrailCampChance),
    farmyardHelpersGameActive: parseTaskEnabled(settings.farmyardHelpersGameActive ?? existing.farmyardHelpersGameActive, true),
    farmyardHelpersVoiceInstructions: parseTaskEnabled(settings.farmyardHelpersVoiceInstructions ?? existing.farmyardHelpersVoiceInstructions, false),
    farmyardHelpersRequireClickAndDrag: parseTaskEnabled(settings.farmyardHelpersRequireClickAndDrag ?? existing.farmyardHelpersRequireClickAndDrag, false),
    johnnyAppleseedVoiceInstructions: parseTaskEnabled(settings.johnnyAppleseedVoiceInstructions ?? existing.johnnyAppleseedVoiceInstructions, false),
    johnnyAppleseedRequireClickAndDrag: parseTaskEnabled(settings.johnnyAppleseedRequireClickAndDrag ?? existing.johnnyAppleseedRequireClickAndDrag, false),
    johnnyAppleseedBlackbirdsEnabled: parseTaskEnabled(settings.johnnyAppleseedBlackbirdsEnabled ?? existing.johnnyAppleseedBlackbirdsEnabled, true),
    johnnyAppleseedBirdDelay: [5,7,12].includes(Number(settings.johnnyAppleseedBirdDelay ?? existing.johnnyAppleseedBirdDelay)) ? Number(settings.johnnyAppleseedBirdDelay ?? existing.johnnyAppleseedBirdDelay) : 7,
    farmyardHelpersLevelCount: [1, 2, 3, 4].includes(Number(settings.farmyardHelpersLevelCount ?? existing.farmyardHelpersLevelCount)) ? Number(settings.farmyardHelpersLevelCount ?? existing.farmyardHelpersLevelCount) : 4,
    harvestHeroesGameActive: parseTaskEnabled(settings.harvestHeroesGameActive ?? existing.harvestHeroesGameActive, true),
    harvestHeroesVoiceInstructions: parseTaskEnabled(settings.harvestHeroesVoiceInstructions ?? existing.harvestHeroesVoiceInstructions, true),
    harvestHeroesRequireClickAndDrag: parseTaskEnabled(settings.harvestHeroesRequireClickAndDrag ?? existing.harvestHeroesRequireClickAndDrag, false),
    harvestHeroesLevelCount: [1, 2, 3].includes(Number(settings.harvestHeroesLevelCount ?? existing.harvestHeroesLevelCount)) ? Number(settings.harvestHeroesLevelCount ?? existing.harvestHeroesLevelCount) : 3,
    pumpkinStudioGameActive: parseTaskEnabled(settings.pumpkinStudioGameActive ?? existing.pumpkinStudioGameActive, true),
    pumpkinStudioVoiceInstructions: parseTaskEnabled(settings.pumpkinStudioVoiceInstructions ?? existing.pumpkinStudioVoiceInstructions, true),
    pumpkinStudioRequireClickAndDrag: parseTaskEnabled(settings.pumpkinStudioRequireClickAndDrag ?? existing.pumpkinStudioRequireClickAndDrag, false),
    pumpkinStudioMenuScrolling: parseTaskEnabled(settings.pumpkinStudioMenuScrolling ?? existing.pumpkinStudioMenuScrolling, false),
    threeLittlePigsGameActive: parseTaskEnabled(settings.threeLittlePigsGameActive ?? existing.threeLittlePigsGameActive, true),
    threeLittlePigsVoiceInstructions: parseTaskEnabled(settings.threeLittlePigsVoiceInstructions ?? existing.threeLittlePigsVoiceInstructions, true),
    threeLittlePigsRequireClickAndDrag: parseTaskEnabled(settings.threeLittlePigsRequireClickAndDrag ?? existing.threeLittlePigsRequireClickAndDrag, false),
    sheepRoundupGameActive: parseTaskEnabled(settings.sheepRoundupGameActive ?? existing.sheepRoundupGameActive, true),

    sheepRoundupVoiceInstructions: parseTaskEnabled(settings.sheepRoundupVoiceInstructions ?? existing.sheepRoundupVoiceInstructions, true),

    sheepRoundupDifficulty: (settings.sheepRoundupDifficulty ?? existing.sheepRoundupDifficulty) === "normal" ? "normal" : "gentle",

    trackpadGuideEnabled: parseTaskEnabled(

      settings.trackpadGuideEnabled ??
        existing.trackpadGuideEnabled,
      DEFAULT_SETTINGS.trackpadGuideEnabled
    ),
    soundEnabled: parseTaskEnabled(settings.soundEnabled ?? existing.soundEnabled, true),
    trainingPaused: parseTrainingPaused(settings.trainingPaused ?? existing.trainingPaused),
    jackFlameRainEnabled: parseTaskEnabled(
      settings.jackFlameRainEnabled ?? existing.jackFlameRainEnabled,
      DEFAULT_SETTINGS.jackFlameRainEnabled
    ),
    jackFlameRainSizePx: parseJackFlameRainSize(settings.jackFlameRainSizePx ?? existing.jackFlameRainSizePx),
    jackFlameRainHitRadiusPx: parseJackFlameRainHitRadius(
      settings.jackFlameRainHitRadiusPx ?? existing.jackFlameRainHitRadiusPx
    ),
    jackFlameRainBurstMin,
    jackFlameRainBurstMax: parseJackFlameRainBurstMax(
      settings.jackFlameRainBurstMax ?? existing.jackFlameRainBurstMax,
      jackFlameRainBurstMin
    ),
    jackFlameRainIntervalMinMs,
    jackFlameRainIntervalMaxMs: parseJackFlameRainIntervalMax(
      settings.jackFlameRainIntervalMaxMs ?? existing.jackFlameRainIntervalMaxMs,
      jackFlameRainIntervalMinMs
    ),
    jackFlameRainSpeedMin,
    jackFlameRainSpeedMax: parseJackFlameRainSpeedMax(
      settings.jackFlameRainSpeedMax ?? existing.jackFlameRainSpeedMax,
      jackFlameRainSpeedMin
    ),
    jackFlameRain4: parseFlameRainLevel(settings.jackFlameRain4, existing.jackFlameRain4),
    jackFlameRain5: parseFlameRainLevel(settings.jackFlameRain5, existing.jackFlameRain5),
    jackFlameRain6: parseFlameRainLevel(settings.jackFlameRain6, existing.jackFlameRain6),
    jackFlameRain7: parseFlameRainLevel(
      settings.jackFlameRain7,
      existing.jackFlameRain7
    ),
    jackBonusSurvivalSeconds: Math.min(
      120,
      Math.max(
        5,
        Number.parseInt(
          settings.jackBonusSurvivalSeconds ??
            existing.jackBonusSurvivalSeconds ??
            20,
          10
        ) || 20
      )
    ),
    mazeGhostLevelsEnabled: parseGhostLevelsEnabled(settings.mazeGhostLevelsEnabled ?? existing.mazeGhostLevelsEnabled, true),
    mazeGhostLevelsPerLevelCounts: parseGhostLevelCounts(
      settings.mazeGhostLevelsPerLevelCounts ?? existing.mazeGhostLevelsPerLevelCounts,
      1
    ),
    carGameLevelsEnabled: parseCarGameLevelsEnabled(
      settings.carGameLevelsEnabled ?? existing.carGameLevelsEnabled,
      true
    ),
    carGameLevelObstacleSpeeds: parseCarLevelNumberArray(
      settings.carGameLevelObstacleSpeeds ?? existing.carGameLevelObstacleSpeeds,
      parseCarLevelSpeed,
      DEFAULT_SETTINGS.carGameLevelObstacleSpeeds
    ),
    carGameLevelMaxCars: parseCarLevelNumberArray(
      settings.carGameLevelMaxCars ?? existing.carGameLevelMaxCars,
      parseCarLevelMaxCars,
      DEFAULT_SETTINGS.carGameLevelMaxCars
    ),
    carGameLevelSurvivalSeconds: parseCarLevelNumberArray(
      settings.carGameLevelSurvivalSeconds ?? existing.carGameLevelSurvivalSeconds,
      parseCarLevelSurvivalSeconds,
      DEFAULT_SETTINGS.carGameLevelSurvivalSeconds
    ),
    carGameLevelGasPumpSpawnSeconds: parseCarLevelNumberArray(
      settings.carGameLevelGasPumpSpawnSeconds ?? existing.carGameLevelGasPumpSpawnSeconds,
      parseCarGameGasPumpSpawnSeconds,
      DEFAULT_SETTINGS.carGameLevelGasPumpSpawnSeconds
    ),
    carGameLevelFuelDrainPerSecond: parseCarLevelNumberArray(
      settings.carGameLevelFuelDrainPerSecond ?? existing.carGameLevelFuelDrainPerSecond,
      parseCarGameFuelDrainPerSecond,
      DEFAULT_SETTINGS.carGameLevelFuelDrainPerSecond
    ),
    movingSoundSettings:
      settings.movingSoundSettings &&
      typeof settings.movingSoundSettings === "object"
        ? settings.movingSoundSettings
        : (
            existing.movingSoundSettings &&
            typeof existing.movingSoundSettings === "object"
              ? existing.movingSoundSettings
              : {}
          ),
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(normalized, null, 2));
  return normalized;
}

async function loadSettingsFromSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured"
    );
  }

  const {
    data,
    error,
  } = await supabase
    .from("app_settings")
    .select("settings")
    .eq(
      "id",
      "hands-on-trackpad"
    )
    .single();

  if (error) {
    throw error;
  }

  if (
    !data ||
    !data.settings ||
    typeof data.settings !== "object"
  ) {
    return {};
  }

  return data.settings;
}

async function saveSettingsToSupabase(
  settings
) {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured"
    );
  }

  const {
    error,
  } = await supabase
    .from("app_settings")
    .upsert(
      {
        id: "hands-on-trackpad",
        settings,
        updated_at:
          new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

  if (error) {
    throw error;
  }

  return settings;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function serveFile(reqPath, res) {
  const safePath = reqPath === "/" ? "/index.html" : reqPath;
  const decodedPath = decodeURIComponent(safePath);
  const normalizedPath = path.normalize(decodedPath).replace(/^\.+/, "");
  const filePath = path.join(ROOT_DIR, normalizedPath);

  if (!filePath.startsWith(ROOT_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statErr, stats) => {
    if (statErr || !stats.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

ensureSettingsFile();

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/api/freeze-timer") {
    if (req.method !== "PUT") {
      sendJson(res, 405, { error: "Method not allowed" });
      return;
    }
    try {
      const command = JSON.parse((await readRequestBody(req)) || "{}");
      if (command && command.action === "cancel") {
        setLiveFreeze(false);
        sendJson(res, 200, freezeSnapshot());
      } else if (!command || !Number.isInteger(command.durationSeconds) || command.durationSeconds < 1 || command.durationSeconds > 86400) {
        sendJson(res, 400, { error: "Choose a timer duration between one second and 24 hours." });
      } else if (!liveClassroomState.freezeScreenFeatureEnabled) {
        sendJson(res, 409, { error: "Enable Freeze Screen in Teacher Settings first." });
      } else {
        startFreezeDeadline(command.durationSeconds);
        sendJson(res, 200, freezeSnapshot());
      }
    } catch {
      sendJson(res, 400, { error: "Could not read the Freeze timer command." });
    }
    return;
  }

  if (
    requestUrl.pathname ===
    "/api/classroom-state"
  ) {
    if (req.method !== "GET") {
      sendJson(
        res,
        405,
        {
          error: "Method not allowed",
        }
      );

      return;
    }

    sendJson(
      res,
      200,
      freezeSnapshot()
    );

    return;
  }

  if (requestUrl.pathname === "/api/settings") {
    if (req.method === "GET") {
      try {
        /*
         * Use Supabase as permanent storage when
         * it is configured, such as on Render.
         * Keep the local settings file as the
         * fallback/default settings source.
         */
        const localSettings =
          loadSettings();

        const remoteSettings =
          supabase
            ? await loadSettingsFromSupabase()
            : null;

        const normalized =
          remoteSettings
            ? {
                ...localSettings,
                ...remoteSettings,
              }
            : localSettings;

        applyFreezeFeature(normalized.freezeScreenFeatureEnabled);

        /*
         * Never restore yesterday's
         * armed Freeze Screen state.
         */
        normalized.freezeScreenArmed =
          liveClassroomState
            .freezeScreenArmed;

        sendJson(
          res,
          200,
          { ...normalized, ...freezeSnapshot() }
        );
      } catch (error) {
        console.error(
          "Supabase settings load failed:",
          error
        );

        /*
         * Safe fallback while we are
         * transitioning to persistent
         * storage.
         */
        const fallbackSettings =
          loadSettings();

        applyFreezeFeature(fallbackSettings.freezeScreenFeatureEnabled);

        fallbackSettings.freezeScreenArmed =
          liveClassroomState
            .freezeScreenArmed;

        sendJson(
          res,
          200,
          { ...fallbackSettings, ...freezeSnapshot() }
        );
      }

      return;
    }

    if (req.method === "PUT") {
      try {
        const body =
          await readRequestBody(req);

        const parsed =
          body
            ? JSON.parse(body)
            : {};

        const parsedKeys =
          Object.keys(parsed);

        const isFreezeOnlyRequest =
          parsedKeys.length === 1 &&
          parsedKeys[0] ===
            "freezeScreenArmed" &&
          typeof parsed.freezeScreenArmed ===
            "boolean";

        /*
         * Freeze is temporary live classroom
         * state. Update it immediately without
         * waiting for permanent Supabase storage.
         */
        if (isFreezeOnlyRequest) {
          setLiveFreeze(parsed.freezeScreenArmed);

          const currentSettings =
            loadSettings();

          currentSettings.freezeScreenArmed =
            liveClassroomState
              .freezeScreenArmed;

          sendJson(
            res,
            200,
            { ...currentSettings, ...freezeSnapshot() }
          );

          return;
        }

        /*
         * Start with the latest persistent settings before
         * applying this request. Many admin controls send
         * only part of the settings object. Merging first
         * prevents unrelated settings from being replaced
         * by stale values from Render's local file.
         */
        const currentPersistentSettings =
          supabase
            ? await loadSettingsFromSupabase()
            : loadSettings();

        const normalized =
          saveSettings({
            ...currentPersistentSettings,
            ...parsed,
          });

        applyFreezeFeature(normalized.freezeScreenFeatureEnabled);

        if (
          typeof parsed.freezeScreenArmed ===
          "boolean"
        ) {
          setLiveFreeze(parsed.freezeScreenArmed);
        }

        /*
         * Keep live classroom state out
         * of permanent Supabase storage.
         */
        const persistentSettings = {
          ...normalized,
        };

        delete persistentSettings
          .freezeScreenArmed;

        if (supabase) {
          await saveSettingsToSupabase(
            persistentSettings
          );
        }

        normalized.freezeScreenArmed =
          liveClassroomState
            .freezeScreenArmed;

        sendJson(
          res,
          200,
          { ...normalized, ...freezeSnapshot() }
        );
      } catch (error) {
        console.error(
          "Supabase settings save failed:",
          error
        );

        sendJson(
          res,
          500,
          {
            error:
              "Could not save settings",
          }
        );
      }

      return;
    }

    res.writeHead(405, { Allow: "GET, PUT" });
    res.end("Method not allowed");
    return;
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end("Method not allowed");
    return;
  }

  serveFile(requestUrl.pathname, res);
});

server.listen(PORT, HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`hands-on-trackpad running at http://${HOST}:${PORT}`);
});

