const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number.parseInt(process.env.PORT || "8000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, "data");
const SETTINGS_FILE = path.join(DATA_DIR, "settings.json");

const DEFAULT_SETTINGS = {
  task1RequiredSeconds: 8,
  task1Enabled: true,
  task2RequiredClicks: 10,
  task2Enabled: true,
  task3RequiredDragSeconds: 6,
  task3Enabled: true,
  fullscreenRequireClickAndDrag: false,
  mazeRequireClickAndDrag: false,
  carRequireClickAndDrag: false,
  jackRequireClickAndDrag: false,
  fullscreenGameActive: true,
  mazeGameActive: true,
  carGameActive: true,
  jackGameActive: true,
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
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
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

  return Math.min(900, Math.max(80, parsed));
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
      task1RequiredSeconds: parseTask1Seconds(data.task1RequiredSeconds),
      task1Enabled: parseTaskEnabled(data.task1Enabled, true),
      task2RequiredClicks: parseTask2Clicks(data.task2RequiredClicks),
      task2Enabled: parseTaskEnabled(data.task2Enabled, true),
      task3RequiredDragSeconds: parseTask3Seconds(data.task3RequiredDragSeconds),
      task3Enabled: parseTaskEnabled(data.task3Enabled, true),
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
    task1RequiredSeconds: parseTask1Seconds(settings.task1RequiredSeconds ?? existing.task1RequiredSeconds),
    task1Enabled: parseTaskEnabled(settings.task1Enabled ?? existing.task1Enabled, true),
    task2RequiredClicks: parseTask2Clicks(settings.task2RequiredClicks ?? existing.task2RequiredClicks),
    task2Enabled: parseTaskEnabled(settings.task2Enabled ?? existing.task2Enabled, true),
    task3RequiredDragSeconds: parseTask3Seconds(settings.task3RequiredDragSeconds ?? existing.task3RequiredDragSeconds),
    task3Enabled: parseTaskEnabled(settings.task3Enabled ?? existing.task3Enabled, true),
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
  };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(normalized, null, 2));
  return normalized;
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

  if (requestUrl.pathname === "/api/settings") {
    if (req.method === "GET") {
      sendJson(res, 200, loadSettings());
      return;
    }

    if (req.method === "PUT") {
      try {
        const body = await readRequestBody(req);
        const parsed = body ? JSON.parse(body) : {};
        const saved = saveSettings(parsed);
        sendJson(res, 200, saved);
      } catch {
        sendJson(res, 400, { error: "Invalid settings payload" });
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
