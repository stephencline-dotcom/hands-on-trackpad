const ADMIN_PASSWORD = 'typing1';
const ADMIN_SETTINGS_STORAGE_KEY = 'moving-sound-admin-settings-v1';
const ADMIN_AUTH_STORAGE_KEY = 'moving-sound-admin-auth-v1';
const ADMIN_AUTH_MAX_AGE_MS = 1000 * 60 * 60 * 8;

const carColorOptions = [
  { value: '#38bdf8', label: 'Blue' },
  { value: '#f97316', label: 'Orange' },
  { value: '#facc15', label: 'Yellow' },
  { value: '#a78bfa', label: 'Purple' },
  { value: '#34d399', label: 'Green' },
  { value: '#fb7185', label: 'Pink' },
];

const DEFAULT_SETTINGS = {
  homeMenuVisibility: {
    showLightGame: true,
    showCarGame: true,
    showDragonGame: true,
    showFireGame: true,
    showMartianGame: true,
  },
  arenaLevels: [
    { lives: 3, time: 30, goal: 10 },
    { lives: 3, time: 25, goal: 12 },
    { lives: 3, time: 20, goal: 15 },
  ],
  carLevels: [
    { spawnInterval: 1.5, targetColor: '#38bdf8', timeLimit: 30, carCount: 4, missesAllowed: 3, goal: 8, speedMin: 70, speedMax: 125 },
    { spawnInterval: 1.2, targetColor: '#f97316', timeLimit: 26, carCount: 5, missesAllowed: 3, goal: 10, speedMin: 135, speedMax: 220 },
    { spawnInterval: 0.95, targetColor: '#34d399', timeLimit: 22, carCount: 6, missesAllowed: 3, goal: 12, speedMin: 240, speedMax: 360 },
  ],
  dragonLevels: [
    { dragonCount: 1, timeLimit: 30, missesAllowed: 3, goal: 6, fireDurationSeconds: 1, speedMin: 100, speedMax: 170 },
    { dragonCount: 2, timeLimit: 27, missesAllowed: 3, goal: 10, fireDurationSeconds: 0.9, speedMin: 125, speedMax: 195 },
    { dragonCount: 3, timeLimit: 24, missesAllowed: 3, goal: 15, fireDurationSeconds: 0.75, speedMin: 150, speedMax: 225 },
    { dragonCount: 4, timeLimit: 22, missesAllowed: 4, goal: 18, fireDurationSeconds: 0.7, speedMin: 170, speedMax: 245 },
  ],
  dragonPrincessEnabledByLevel: [false, false, true, true],
  dragonKnightEnabledByLevel: [false, false, false, true],
  fireLevels: [
    { timeLimit: 30, missesAllowed: 3, goal: 8, spawnIntervalSeconds: 0.85, flameDurationSeconds: 1.58, helpSpawnChance: 0.3 },
    { timeLimit: 26, missesAllowed: 3, goal: 11, spawnIntervalSeconds: 0.72, flameDurationSeconds: 1.35, helpSpawnChance: 0.33 },
    { timeLimit: 22, missesAllowed: 3, goal: 14, spawnIntervalSeconds: 0.62, flameDurationSeconds: 1.15, helpSpawnChance: 0.36 },
  ],
  martianLevels: [
    { timeLimit: 30, missesAllowed: 3, goal: 6, peopleCount: 6, ufoCount: 1, walkerSpeedMin: 42, walkerSpeedMax: 68, ufoSpeed: 72, liftSpeed: 124 },
    { timeLimit: 26, missesAllowed: 3, goal: 9, peopleCount: 7, ufoCount: 2, walkerSpeedMin: 54, walkerSpeedMax: 82, ufoSpeed: 86, liftSpeed: 146 },
    { timeLimit: 22, missesAllowed: 4, goal: 12, peopleCount: 8, ufoCount: 3, walkerSpeedMin: 66, walkerSpeedMax: 96, ufoSpeed: 102, liftSpeed: 168 },
  ],
};

const adminLoginSection = document.getElementById('adminLoginSection');
const adminSettingsSection = document.getElementById('adminSettingsSection');
const adminPageLoginForm = document.getElementById('adminPageLoginForm');
const adminPagePasswordInput = document.getElementById('adminPagePasswordInput');
const adminPageLoginMessage = document.getElementById('adminPageLoginMessage');
const adminPageStatusMessage = document.getElementById('adminPageStatusMessage');
const adminResetDefaultsButton = document.getElementById('adminResetDefaultsButton');
const adminSaveButton = document.getElementById('adminSaveButton');
const lightLevelsGrid = document.getElementById('lightLevelsGrid');
const carLevelsGrid = document.getElementById('carLevelsGrid');
const dragonLevelsGrid = document.getElementById('dragonLevelsGrid');
const fireLevelsGrid = document.getElementById('fireLevelsGrid');
const martianLevelsGrid = document.getElementById('martianLevelsGrid');

let currentSettings = normalizeSettings(DEFAULT_SETTINGS);

function cloneDefaults() {
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

function clampNumber(value, min, max, fallback) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numericValue));
}

function normalizeSettings(rawSettings) {
  const source = rawSettings || {};
  const defaults = cloneDefaults();

  const normalized = {
    homeMenuVisibility: {
      showLightGame: source.homeMenuVisibility?.showLightGame !== false,
      showCarGame: source.homeMenuVisibility?.showCarGame !== false,
      showDragonGame: source.homeMenuVisibility?.showDragonGame !== false,
      showFireGame: source.homeMenuVisibility?.showFireGame !== false,
      showMartianGame: source.homeMenuVisibility?.showMartianGame !== false,
    },
    arenaLevels: defaults.arenaLevels.map((level, index) => {
      const rawLevel = Array.isArray(source.arenaLevels) ? (source.arenaLevels[index] || {}) : {};

      return {
        lives: Math.round(clampNumber(rawLevel.lives, 1, 20, level.lives)),
        time: Math.round(clampNumber(rawLevel.time, 10, 300, level.time)),
        goal: Math.round(clampNumber(rawLevel.goal, 1, 200, level.goal)),
      };
    }),
    carLevels: defaults.carLevels.map((level, index) => {
      const rawLevel = Array.isArray(source.carLevels) ? (source.carLevels[index] || {}) : {};
      const speedMin = Math.round(clampNumber(rawLevel.speedMin, 40, 600, level.speedMin));

      return {
        spawnInterval: clampNumber(rawLevel.spawnInterval, 0.5, 6, level.spawnInterval),
        targetColor: carColorOptions.some((option) => option.value === rawLevel.targetColor)
          ? rawLevel.targetColor
          : level.targetColor,
        timeLimit: Math.round(clampNumber(rawLevel.timeLimit, 10, 300, level.timeLimit)),
        carCount: Math.round(clampNumber(rawLevel.carCount, 1, 20, level.carCount)),
        missesAllowed: Math.round(clampNumber(rawLevel.missesAllowed, 1, 20, level.missesAllowed)),
        goal: Math.round(clampNumber(rawLevel.goal, 1, 200, level.goal)),
        speedMin,
        speedMax: Math.max(speedMin + 10, Math.round(clampNumber(rawLevel.speedMax, 40, 600, level.speedMax))),
      };
    }),
    dragonLevels: defaults.dragonLevels.map((level, index) => {
      const rawLevel = Array.isArray(source.dragonLevels) ? (source.dragonLevels[index] || {}) : {};
      const fireDurationFallback = level.fireDurationSeconds;
      const fireDurationValue = rawLevel.fireDurationSeconds
        ?? ((Number(rawLevel.fireDurationMin) + Number(rawLevel.fireDurationMax)) / 2);
      const speedMin = Math.round(clampNumber(rawLevel.speedMin, 40, 600, level.speedMin));

      return {
        dragonCount: Math.round(clampNumber(rawLevel.dragonCount, 1, 12, level.dragonCount)),
        timeLimit: Math.round(clampNumber(rawLevel.timeLimit, 10, 300, level.timeLimit)),
        missesAllowed: Math.round(clampNumber(rawLevel.missesAllowed, 1, 20, level.missesAllowed)),
        goal: Math.round(clampNumber(rawLevel.goal, 1, 200, level.goal)),
        fireDurationSeconds: clampNumber(fireDurationValue, 0.2, 5, fireDurationFallback),
        speedMin,
        speedMax: Math.max(speedMin + 10, Math.round(clampNumber(rawLevel.speedMax, 40, 600, level.speedMax))),
      };
    }),
    dragonPrincessEnabledByLevel: defaults.dragonPrincessEnabledByLevel.map((value, index) => {
      if (!Array.isArray(source.dragonPrincessEnabledByLevel)) {
        return value;
      }

      return source.dragonPrincessEnabledByLevel[index] === true;
    }),
    dragonKnightEnabledByLevel: defaults.dragonKnightEnabledByLevel.map((value, index) => {
      if (!Array.isArray(source.dragonKnightEnabledByLevel)) {
        return value;
      }

      return source.dragonKnightEnabledByLevel[index] === true;
    }),
    fireLevels: defaults.fireLevels.map((level, index) => {
      const rawLevel = Array.isArray(source.fireLevels) ? (source.fireLevels[index] || {}) : {};

      return {
        timeLimit: Math.round(clampNumber(rawLevel.timeLimit, 10, 300, level.timeLimit)),
        missesAllowed: Math.round(clampNumber(rawLevel.missesAllowed, 1, 20, level.missesAllowed)),
        goal: Math.round(clampNumber(rawLevel.goal, 1, 200, level.goal)),
        spawnIntervalSeconds: clampNumber(
          rawLevel.spawnIntervalSeconds ?? rawLevel.spawnInterval,
          0.2,
          4,
          level.spawnIntervalSeconds,
        ),
        flameDurationSeconds: clampNumber(
          rawLevel.flameDurationSeconds ?? rawLevel.flameDuration,
          0.3,
          6,
          level.flameDurationSeconds,
        ),
        helpSpawnChance: clampNumber(rawLevel.helpSpawnChance, 0.05, 0.95, level.helpSpawnChance),
      };
    }),
    martianLevels: defaults.martianLevels.map((level, index) => {
      const rawLevel = Array.isArray(source.martianLevels) ? (source.martianLevels[index] || {}) : {};
      const walkerSpeedMin = Math.round(clampNumber(rawLevel.walkerSpeedMin, 10, 300, level.walkerSpeedMin));

      return {
        timeLimit: Math.round(clampNumber(rawLevel.timeLimit, 10, 300, level.timeLimit)),
        missesAllowed: Math.round(clampNumber(rawLevel.missesAllowed, 1, 20, level.missesAllowed)),
        goal: Math.round(clampNumber(rawLevel.goal, 1, 200, level.goal)),
        peopleCount: Math.round(clampNumber(rawLevel.peopleCount, 1, 9, level.peopleCount)),
        ufoCount: Math.round(clampNumber(rawLevel.ufoCount, 1, 12, level.ufoCount)),
        walkerSpeedMin,
        walkerSpeedMax: Math.max(walkerSpeedMin + 4, Math.round(clampNumber(rawLevel.walkerSpeedMax, 10, 400, level.walkerSpeedMax))),
        ufoSpeed: Math.round(clampNumber(rawLevel.ufoSpeed, 20, 300, level.ufoSpeed)),
        liftSpeed: Math.round(clampNumber(rawLevel.liftSpeed, 40, 600, level.liftSpeed)),
      };
    }),
  };

  return normalized;
}

function setStatusMessage(message) {
  adminPageStatusMessage.textContent = message;
}

function hasValidAdminSession() {
  try {
    const timestamp = Number(sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY));

    if (!Number.isFinite(timestamp)) {
      return false;
    }

    return Date.now() - timestamp < ADMIN_AUTH_MAX_AGE_MS;
  } catch {
    return false;
  }
}

function setAdminSession() {
  try {
    sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, String(Date.now()));
  } catch {
    // Ignore storage restrictions.
  }
}

function fieldNumber(id, label, value, min, max, step = 1) {
  return `
    <label class="admin-field" for="${id}">
      <span>${label}</span>
      <input id="${id}" type="number" min="${min}" max="${max}" step="${step}" value="${value}" />
    </label>
  `;
}

function fieldToggle(id, label, checked) {
  return `
    <label class="admin-toggle-field" for="${id}">
      <span>${label}</span>
      <input id="${id}" type="checkbox" ${checked ? 'checked' : ''} />
    </label>
  `;
}

function fieldSelect(id, label, value, options) {
  const optionMarkup = options
    .map((option) => `<option value="${option.value}" ${option.value === value ? 'selected' : ''}>${option.label}</option>`)
    .join('');

  return `
    <label class="admin-field" for="${id}">
      <span>${label}</span>
      <select id="${id}">${optionMarkup}</select>
    </label>
  `;
}

function renderLevelCards() {
  lightLevelsGrid.innerHTML = currentSettings.arenaLevels
    .map((level, index) => `
      <div class="admin-level-group">
        <h3>Level ${index + 1}</h3>
        ${fieldNumber(`light-lives-${index}`, 'Lives', level.lives, 1, 20, 1)}
        ${fieldNumber(`light-time-${index}`, 'Time (seconds)', level.time, 10, 300, 1)}
        ${fieldNumber(`light-goal-${index}`, 'Goal (lights)', level.goal, 1, 200, 1)}
      </div>
    `)
    .join('');

  carLevelsGrid.innerHTML = currentSettings.carLevels
    .map((level, index) => `
      <div class="admin-level-group">
        <h3>Level ${index + 1}</h3>
        ${fieldNumber(`car-spawn-${index}`, 'Spawn interval (seconds)', level.spawnInterval, 0.5, 6, 0.1)}
        ${fieldSelect(`car-color-${index}`, 'Target color', level.targetColor, carColorOptions)}
        ${fieldNumber(`car-time-${index}`, 'Time (seconds)', level.timeLimit, 10, 300, 1)}
        ${fieldNumber(`car-count-${index}`, 'Cars on screen', level.carCount, 1, 20, 1)}
        ${fieldNumber(`car-misses-${index}`, 'Misses allowed', level.missesAllowed, 1, 20, 1)}
        ${fieldNumber(`car-goal-${index}`, 'Goal (cars)', level.goal, 1, 200, 1)}
        ${fieldNumber(`car-speed-min-${index}`, 'Speed min', level.speedMin, 40, 600, 5)}
        ${fieldNumber(`car-speed-max-${index}`, 'Speed max', level.speedMax, 40, 600, 5)}
      </div>
    `)
    .join('');

  dragonLevelsGrid.innerHTML = currentSettings.dragonLevels
    .map((level, index) => `
      <div class="admin-level-group">
        <h3>Level ${index + 1}</h3>
        ${fieldNumber(`dragon-count-${index}`, 'Dragons on screen', level.dragonCount, 1, 12, 1)}
        ${fieldNumber(`dragon-time-${index}`, 'Time (seconds)', level.timeLimit, 10, 300, 1)}
        ${fieldNumber(`dragon-misses-${index}`, 'Misses allowed', level.missesAllowed, 1, 20, 1)}
        ${fieldNumber(`dragon-goal-${index}`, 'Goal (saves)', level.goal, 1, 200, 1)}
        ${fieldNumber(`dragon-fire-${index}`, 'Fire duration (seconds)', level.fireDurationSeconds, 0.2, 5, 0.05)}
        ${fieldNumber(`dragon-speed-min-${index}`, 'Speed min', level.speedMin, 40, 600, 5)}
        ${fieldNumber(`dragon-speed-max-${index}`, 'Speed max', level.speedMax, 40, 600, 5)}
        ${fieldToggle(`dragon-princess-${index}`, 'Show Princess', currentSettings.dragonPrincessEnabledByLevel[index] === true)}
        ${fieldToggle(`dragon-knight-${index}`, 'Show Knight', currentSettings.dragonKnightEnabledByLevel[index] === true)}
      </div>
    `)
    .join('');

  fireLevelsGrid.innerHTML = currentSettings.fireLevels
    .map((level, index) => `
      <div class="admin-level-group">
        <h3>Level ${index + 1}</h3>
        ${fieldNumber(`fire-time-${index}`, 'Time (seconds)', level.timeLimit, 10, 300, 1)}
        ${fieldNumber(`fire-misses-${index}`, 'Misses allowed', level.missesAllowed, 1, 20, 1)}
        ${fieldNumber(`fire-goal-${index}`, 'Goal (flames)', level.goal, 1, 200, 1)}
        ${fieldNumber(`fire-spawn-${index}`, 'Spawn interval (seconds)', level.spawnIntervalSeconds, 0.2, 4, 0.05)}
        ${fieldNumber(`fire-duration-${index}`, 'Flame duration (seconds)', level.flameDurationSeconds, 0.3, 6, 0.05)}
        ${fieldNumber(`fire-help-${index}`, 'Help spawn chance', level.helpSpawnChance, 0.05, 0.95, 0.01)}
      </div>
    `)
    .join('');

  martianLevelsGrid.innerHTML = currentSettings.martianLevels
    .map((level, index) => `
      <div class="admin-level-group">
        <h3>Level ${index + 1}</h3>
        ${fieldNumber(`martian-time-${index}`, 'Time (seconds)', level.timeLimit, 10, 300, 1)}
        ${fieldNumber(`martian-misses-${index}`, 'Misses allowed', level.missesAllowed, 1, 20, 1)}
        ${fieldNumber(`martian-goal-${index}`, 'Goal (saves)', level.goal, 1, 200, 1)}
        ${fieldNumber(`martian-people-${index}`, 'People on screen', level.peopleCount, 1, 9, 1)}
        ${fieldNumber(`martian-ufo-count-${index}`, 'UFOs on screen', level.ufoCount, 1, 12, 1)}
        ${fieldNumber(`martian-walker-min-${index}`, 'Walker speed min', level.walkerSpeedMin, 10, 300, 1)}
        ${fieldNumber(`martian-walker-max-${index}`, 'Walker speed max', level.walkerSpeedMax, 10, 400, 1)}
        ${fieldNumber(`martian-ufo-speed-${index}`, 'UFO speed', level.ufoSpeed, 20, 300, 1)}
        ${fieldNumber(`martian-lift-${index}`, 'Beam lift speed', level.liftSpeed, 40, 600, 1)}
      </div>
    `)
    .join('');
}

function renderFormValues() {
  document.getElementById('showLightGame').checked = currentSettings.homeMenuVisibility.showLightGame;
  document.getElementById('showCarGame').checked = currentSettings.homeMenuVisibility.showCarGame;
  document.getElementById('showDragonGame').checked = currentSettings.homeMenuVisibility.showDragonGame;
  document.getElementById('showFireGame').checked = currentSettings.homeMenuVisibility.showFireGame;
  document.getElementById('showMartianGame').checked = currentSettings.homeMenuVisibility.showMartianGame;

  renderLevelCards();
}

function readCheckbox(id) {
  return document.getElementById(id).checked;
}

function readNumber(id, min, max, fallback, shouldRound = false) {
  const input = document.getElementById(id);
  const value = clampNumber(input.value, min, max, fallback);
  const normalizedValue = shouldRound ? Math.round(value) : value;
  input.value = String(normalizedValue);
  return normalizedValue;
}

function collectFormValues() {
  const snapshot = {
    homeMenuVisibility: {
      showLightGame: readCheckbox('showLightGame'),
      showCarGame: readCheckbox('showCarGame'),
      showDragonGame: readCheckbox('showDragonGame'),
      showFireGame: readCheckbox('showFireGame'),
      showMartianGame: readCheckbox('showMartianGame'),
    },
    arenaLevels: currentSettings.arenaLevels.map((level, index) => ({
      lives: readNumber(`light-lives-${index}`, 1, 20, level.lives, true),
      time: readNumber(`light-time-${index}`, 10, 300, level.time, true),
      goal: readNumber(`light-goal-${index}`, 1, 200, level.goal, true),
    })),
    carLevels: currentSettings.carLevels.map((level, index) => {
      const speedMin = readNumber(`car-speed-min-${index}`, 40, 600, level.speedMin, true);
      const speedMax = Math.max(speedMin + 10, readNumber(`car-speed-max-${index}`, 40, 600, level.speedMax, true));
      document.getElementById(`car-speed-max-${index}`).value = String(speedMax);

      return {
        spawnInterval: readNumber(`car-spawn-${index}`, 0.5, 6, level.spawnInterval, false),
        targetColor: document.getElementById(`car-color-${index}`).value,
        timeLimit: readNumber(`car-time-${index}`, 10, 300, level.timeLimit, true),
        carCount: readNumber(`car-count-${index}`, 1, 20, level.carCount, true),
        missesAllowed: readNumber(`car-misses-${index}`, 1, 20, level.missesAllowed, true),
        goal: readNumber(`car-goal-${index}`, 1, 200, level.goal, true),
        speedMin,
        speedMax,
      };
    }),
    dragonLevels: currentSettings.dragonLevels.map((level, index) => {
      const speedMin = readNumber(`dragon-speed-min-${index}`, 40, 600, level.speedMin, true);
      const speedMax = Math.max(speedMin + 10, readNumber(`dragon-speed-max-${index}`, 40, 600, level.speedMax, true));
      document.getElementById(`dragon-speed-max-${index}`).value = String(speedMax);

      return {
        dragonCount: readNumber(`dragon-count-${index}`, 1, 12, level.dragonCount, true),
        timeLimit: readNumber(`dragon-time-${index}`, 10, 300, level.timeLimit, true),
        missesAllowed: readNumber(`dragon-misses-${index}`, 1, 20, level.missesAllowed, true),
        goal: readNumber(`dragon-goal-${index}`, 1, 200, level.goal, true),
        fireDurationSeconds: readNumber(`dragon-fire-${index}`, 0.2, 5, level.fireDurationSeconds, false),
        speedMin,
        speedMax,
      };
    }),
    dragonPrincessEnabledByLevel: currentSettings.dragonLevels.map((_, index) => readCheckbox(`dragon-princess-${index}`)),
    dragonKnightEnabledByLevel: currentSettings.dragonLevels.map((_, index) => readCheckbox(`dragon-knight-${index}`)),
    fireLevels: currentSettings.fireLevels.map((level, index) => ({
      timeLimit: readNumber(`fire-time-${index}`, 10, 300, level.timeLimit, true),
      missesAllowed: readNumber(`fire-misses-${index}`, 1, 20, level.missesAllowed, true),
      goal: readNumber(`fire-goal-${index}`, 1, 200, level.goal, true),
      spawnIntervalSeconds: readNumber(`fire-spawn-${index}`, 0.2, 4, level.spawnIntervalSeconds, false),
      flameDurationSeconds: readNumber(`fire-duration-${index}`, 0.3, 6, level.flameDurationSeconds, false),
      helpSpawnChance: readNumber(`fire-help-${index}`, 0.05, 0.95, level.helpSpawnChance, false),
    })),
    martianLevels: currentSettings.martianLevels.map((level, index) => {
      const walkerSpeedMin = readNumber(`martian-walker-min-${index}`, 10, 300, level.walkerSpeedMin, true);
      const walkerSpeedMax = Math.max(walkerSpeedMin + 4, readNumber(`martian-walker-max-${index}`, 10, 400, level.walkerSpeedMax, true));
      document.getElementById(`martian-walker-max-${index}`).value = String(walkerSpeedMax);

      return {
        timeLimit: readNumber(`martian-time-${index}`, 10, 300, level.timeLimit, true),
        missesAllowed: readNumber(`martian-misses-${index}`, 1, 20, level.missesAllowed, true),
        goal: readNumber(`martian-goal-${index}`, 1, 200, level.goal, true),
        peopleCount: readNumber(`martian-people-${index}`, 1, 9, level.peopleCount, true),
        ufoCount: readNumber(`martian-ufo-count-${index}`, 1, 12, level.ufoCount, true),
        walkerSpeedMin,
        walkerSpeedMax,
        ufoSpeed: readNumber(`martian-ufo-speed-${index}`, 20, 300, level.ufoSpeed, true),
        liftSpeed: readNumber(`martian-lift-${index}`, 40, 600, level.liftSpeed, true),
      };
    }),
  };

  return normalizeSettings(snapshot);
}

function persistSettings() {
  currentSettings = collectFormValues();

  try {
    localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(currentSettings));
    setStatusMessage('Settings saved. The game and dashboard will use these values.');
  } catch {
    setStatusMessage('Could not save settings in this browser session.');
  }
}

function loadSettings() {
  try {
    const storedSettings = localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);

    if (!storedSettings) {
      currentSettings = normalizeSettings(DEFAULT_SETTINGS);
      return;
    }

    currentSettings = normalizeSettings(JSON.parse(storedSettings));
  } catch {
    currentSettings = normalizeSettings(DEFAULT_SETTINGS);
  }
}

function resetDefaults() {
  currentSettings = normalizeSettings(DEFAULT_SETTINGS);
  renderFormValues();
  setStatusMessage('Defaults restored on this page. Click Save Settings to publish them.');
}

function showAdminPage() {
  adminLoginSection.hidden = true;
  adminSettingsSection.hidden = false;
  loadSettings();
  renderFormValues();
  setStatusMessage('Ready. Update values and click Save Settings.');
}

function showLogin() {
  adminSettingsSection.hidden = true;
  adminLoginSection.hidden = false;
  adminPagePasswordInput.focus();
}

adminPageLoginForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (adminPagePasswordInput.value !== ADMIN_PASSWORD) {
    adminPageLoginMessage.textContent = 'Incorrect password.';
    adminPagePasswordInput.select();
    return;
  }

  adminPagePasswordInput.value = '';
  adminPageLoginMessage.textContent = '';
  setAdminSession();
  showAdminPage();
});

adminSaveButton.addEventListener('click', () => {
  setAdminSession();
  persistSettings();
});

adminResetDefaultsButton.addEventListener('click', resetDefaults);

if (hasValidAdminSession()) {
  showAdminPage();
} else {
  showLogin();
}
