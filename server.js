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
  soundEnabled: true,
  trainingPaused: false,
  mazeGhostLevelsEnabled: [true, true, true, true, true, true],
  mazeGhostLevelsPerLevelCounts: [1, 1, 1, 1, 1, 1],
  carGameLevelsEnabled: [true, true, true, true, true, true],
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
    return DEFAULT_SETTINGS.mazeGhostsPerLevel;
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

function loadSettings() {
  ensureSettingsFile();

  try {
    const raw = fs.readFileSync(SETTINGS_FILE, "utf8");
    const data = JSON.parse(raw);
    const fallbackGhostCount = parseGhostCount(data.mazeGhostsPerLevel);
    return {
      task1RequiredSeconds: parseTask1Seconds(data.task1RequiredSeconds),
      task1Enabled: parseTaskEnabled(data.task1Enabled, true),
      task2RequiredClicks: parseTask2Clicks(data.task2RequiredClicks),
      task2Enabled: parseTaskEnabled(data.task2Enabled, true),
      task3RequiredDragSeconds: parseTask3Seconds(data.task3RequiredDragSeconds),
      task3Enabled: parseTaskEnabled(data.task3Enabled, true),
      soundEnabled: parseTaskEnabled(data.soundEnabled, true),
      trainingPaused: parseTrainingPaused(data.trainingPaused),
      mazeGhostLevelsEnabled: parseGhostLevelsEnabled(data.mazeGhostLevelsEnabled, true),
      mazeGhostLevelsPerLevelCounts: parseGhostLevelCounts(
        data.mazeGhostLevelsPerLevelCounts,
        fallbackGhostCount
      ),
      carGameLevelsEnabled: parseCarGameLevelsEnabled(data.carGameLevelsEnabled, true),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

function saveSettings(settings) {
  ensureSettingsFile();
  const existing = loadSettings();
  const normalized = {
    task1RequiredSeconds: parseTask1Seconds(settings.task1RequiredSeconds ?? existing.task1RequiredSeconds),
    task1Enabled: parseTaskEnabled(settings.task1Enabled ?? existing.task1Enabled, true),
    task2RequiredClicks: parseTask2Clicks(settings.task2RequiredClicks ?? existing.task2RequiredClicks),
    task2Enabled: parseTaskEnabled(settings.task2Enabled ?? existing.task2Enabled, true),
    task3RequiredDragSeconds: parseTask3Seconds(settings.task3RequiredDragSeconds ?? existing.task3RequiredDragSeconds),
    task3Enabled: parseTaskEnabled(settings.task3Enabled ?? existing.task3Enabled, true),
    soundEnabled: parseTaskEnabled(settings.soundEnabled ?? existing.soundEnabled, true),
    trainingPaused: parseTrainingPaused(settings.trainingPaused ?? existing.trainingPaused),
    mazeGhostLevelsEnabled: parseGhostLevelsEnabled(settings.mazeGhostLevelsEnabled ?? existing.mazeGhostLevelsEnabled, true),
    mazeGhostLevelsPerLevelCounts: parseGhostLevelCounts(
      settings.mazeGhostLevelsPerLevelCounts ?? existing.mazeGhostLevelsPerLevelCounts,
      1
    ),
    carGameLevelsEnabled: parseCarGameLevelsEnabled(
      settings.carGameLevelsEnabled ?? existing.carGameLevelsEnabled,
      true
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
