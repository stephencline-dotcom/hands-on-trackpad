'use strict';

const bugArena = document.getElementById('bugArena');
const bugChooser = document.getElementById('bugChooser');
const bugChoices = Array.from(document.querySelectorAll('.bug-choice'));
const playerBug = document.getElementById('playerBug');
const bugStartButton = document.getElementById('bugStartButton');
const bugStatus = document.getElementById('bugStatus');

const bugLevelDisplay = document.getElementById('bugLevel');
const bugGoal = document.getElementById('bugGoal');
const bugMissesDisplay = document.getElementById('bugMisses');
const bugScoreDisplay = document.getElementById('bugScore');
const bugTimeDisplay = document.getElementById('bugTime');

const meadowPlants = document.getElementById('meadowPlants');
const bugTargetName = document.getElementById('bugTargetName');
const bugTargetPreview = document.getElementById('bugTargetPreview');

const BUG_MEADOW_REQUIRE_CLICK_AND_DRAG_KEY =
  'bugMeadowRequireClickAndDrag';

const BUG_MEADOW_SETTINGS_KEY =
  'moving-sound-admin-settings-v1';

const DEFAULT_BUG_MEADOW_LEVELS = [
  { goal: 5, timeLimit: 35, missesAllowed: 3, birdCount: 0 },
  { goal: 7, timeLimit: 35, missesAllowed: 3, birdCount: 1 },
  { goal: 9, timeLimit: 30, missesAllowed: 3, birdCount: 2 },
  { goal: 12, timeLimit: 30, missesAllowed: 4, birdCount: 3 },
];

const bugIcons = {
  bumblebee: '🐝',
  ladybug: '🐞',
  butterfly: '🦋',
  beetle: '🪲',
};

const PLANTS = [
  {
    id: 'red-tulip',
    name: 'Red Tulip',
    preview: '🌷',
    className: 'plant-red-tulip',
    x: 14,
    y: 88,
  },
  {
    id: 'sunflower',
    name: 'Sunflower',
    preview: '🌻',
    className: 'plant-sunflower',
    x: 31,
    y: 79,
  },
  {
    id: 'daisy',
    name: 'White Daisy',
    preview: '🌼',
    className: 'plant-daisy',
    x: 47,
    y: 91,
  },
  {
    id: 'lavender',
    name: 'Lavender',
    preview: '🪻',
    className: 'plant-lavender',
    x: 63,
    y: 76,
  },
  {
    id: 'pink-flower',
    name: 'Pink Flower',
    preview: '🌸',
    className: 'plant-pink-flower',
    x: 78,
    y: 89,
  },
  {
    id: 'clover',
    name: 'Clover',
    preview: '☘️',
    className: 'plant-clover',
    x: 89,
    y: 72,
  },
];

const bugMovementGate =
  window.trackpadMovementSettings &&
  typeof window.trackpadMovementSettings.createClickAndDragGate === 'function'
    ? window.trackpadMovementSettings.createClickAndDragGate(
        BUG_MEADOW_REQUIRE_CLICK_AND_DRAG_KEY
      )
    : null;

let selectedBug = '';
let currentPlantId = '';

let bugLevels = loadBugMeadowLevels();
let currentLevelIndex = 0;

let bugGameRunning = false;
let bugScore = 0;
let bugMisses = 0;
let bugGoalHits = 0;
let bugTimeLeft = 0;

let collisionLocked = false;
let ignoredWrongPlantIds = new Set();
let timerAnimationId = 0;
let timerLastTimestamp = 0;

let bugLevelResult = null;

function clampInteger(value, min, max, fallback) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
}

function normalizeBugLevel(level, defaults) {
  const source = level && typeof level === 'object' ? level : {};

  return {
    goal: clampInteger(source.goal, 1, 100, defaults.goal),
    timeLimit: clampInteger(
      source.timeLimit,
      10,
      300,
      defaults.timeLimit
    ),
    missesAllowed: clampInteger(
      source.missesAllowed,
      1,
      20,
      defaults.missesAllowed
    ),
    birdCount: clampInteger(
      source.birdCount,
      0,
      8,
      defaults.birdCount
    ),
  };
}

function loadBugMeadowLevels() {
  try {
    const raw = localStorage.getItem(BUG_MEADOW_SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    const saved = Array.isArray(parsed.bugMeadowLevels)
      ? parsed.bugMeadowLevels
      : [];

    return DEFAULT_BUG_MEADOW_LEVELS.map((defaults, index) =>
      normalizeBugLevel(saved[index], defaults)
    );
  } catch {
    return DEFAULT_BUG_MEADOW_LEVELS.map((level) => ({ ...level }));
  }
}

function getCurrentLevel() {
  return bugLevels[currentLevelIndex] || bugLevels[0];
}

function selectBug(name) {
  if (!bugIcons[name]) {
    return;
  }

  selectedBug = name;
  playerBug.textContent = bugIcons[name];

  bugChoices.forEach((button) => {
    button.classList.toggle(
      'is-selected',
      button.dataset.bug === name
    );
  });

  bugStartButton.disabled = false;
  bugStartButton.textContent = 'Start';
  bugStatus.textContent = `Great choice! ${name} is ready.`;
}

function updateBugStats() {
  const level = getCurrentLevel();

  if (bugLevelDisplay) {
    bugLevelDisplay.textContent =
      `${currentLevelIndex + 1} of ${bugLevels.length}`;
  }

  if (bugGoal) {
    bugGoal.textContent = `${bugGoalHits}/${level.goal}`;
  }

  if (bugMissesDisplay) {
    const missesLeft = Math.max(
      0,
      level.missesAllowed - bugMisses
    );

    bugMissesDisplay.textContent = String(missesLeft);
  }

  if (bugScoreDisplay) {
    bugScoreDisplay.textContent = String(bugScore);
  }

  if (bugTimeDisplay) {
    bugTimeDisplay.textContent = String(
      Math.max(0, Math.ceil(bugTimeLeft))
    );
  }
}

function getArenaPointerPosition(event) {
  const rect = bugArena.getBoundingClientRect();

  return {
    x: Math.max(
      0,
      Math.min(rect.width, event.clientX - rect.left)
    ),
    y: Math.max(
      0,
      Math.min(rect.height, event.clientY - rect.top)
    ),
  };
}

function movePlayerBugTo(x, y) {
  playerBug.style.left = `${x}px`;
  playerBug.style.top = `${y}px`;
}

function resetPlayerBugPosition() {
  const rect = bugArena.getBoundingClientRect();

  movePlayerBugTo(
    rect.width * 0.5,
    rect.height * 0.7
  );
}

function getBugCenter() {
  const arenaRect = bugArena.getBoundingClientRect();
  const bugRect = playerBug.getBoundingClientRect();

  return {
    x:
      bugRect.left -
      arenaRect.left +
      bugRect.width / 2,
    y:
      bugRect.top -
      arenaRect.top +
      bugRect.height / 2,
  };
}

function getPlantCenter(plantElement) {
  const arenaRect = bugArena.getBoundingClientRect();
  const plantRect = plantElement.getBoundingClientRect();

  return {
    x:
      plantRect.left -
      arenaRect.left +
      plantRect.width / 2,
    y:
      plantRect.top -
      arenaRect.top +
      plantRect.height / 2,
    radius: Math.max(
      30,
      Math.min(
        plantRect.width,
        plantRect.height
      ) * 0.42
    ),
  };
}

function stopBugTimer() {
  window.cancelAnimationFrame(timerAnimationId);
  timerAnimationId = 0;
  timerLastTimestamp = 0;
}

function pauseBugGameplay() {
  bugGameRunning = false;
  collisionLocked = true;
  stopBugTimer();
  playerBug.classList.remove('is-dragging');
}

function showBugFailure(message) {
  pauseBugGameplay();

  if (bugLevelResult) {
    bugLevelResult.showFailure({
      title: 'Try Again!',
      message,
    });
    return;
  }

  bugStatus.textContent = message;
  bugStartButton.hidden = false;
  bugStartButton.textContent = 'Try Again';
}

function prepareNextBugLevel() {
  if (currentLevelIndex >= bugLevels.length - 1) {
    return;
  }

  currentLevelIndex += 1;

  const level = getCurrentLevel();

  bugGoalHits = 0;
  bugMisses = 0;
  bugTimeLeft = level.timeLimit;
  collisionLocked = false;
  ignoredWrongPlantIds.clear();
  bugGameRunning = false;

  resetPlayerBugPosition();
  chooseRandomTarget();
  updateBugStats();

  bugStartButton.hidden = false;
  bugStartButton.textContent = 'Start Level';

  bugStatus.textContent =
    `Level ${currentLevelIndex + 1} ready. Press Start.`;
}

function retryCurrentBugLevel() {
  startBugLevel(currentLevelIndex);
}

function playBugMeadowAgain() {
  currentLevelIndex = 0;
  bugScore = 0;
  startBugLevel(0);
}

function showBugLevelSuccess() {
  pauseBugGameplay();

  const completedLevel = currentLevelIndex + 1;
  const hasNextLevel =
    currentLevelIndex < bugLevels.length - 1;

  if (!bugLevelResult) {
    if (hasNextLevel) {
      prepareNextBugLevel();
    } else {
      bugStatus.textContent =
        'You completed all 4 Bug Meadow levels!';
    }
    return;
  }

  if (hasNextLevel) {
    bugLevelResult.showSuccess({
      title: 'Level Complete!',
      message:
        `Great job! Tap Level Up for Level ${completedLevel + 1}.`,
    });
  } else {
    bugLevelResult.showFinal({
      title: 'You Did It!',
      message:
        'You completed all 4 Bug Meadow levels!',
    });
  }
}

function applyBugMiss(message) {
  if (!bugGameRunning) {
    return true;
  }

  const level = getCurrentLevel();

  bugMisses = Math.min(
    level.missesAllowed,
    bugMisses + 1
  );

  updateBugStats();

  if (bugMisses >= level.missesAllowed) {
    showBugFailure(
      `Too many misses on Level ${currentLevelIndex + 1}.`
    );
    return true;
  }

  bugStatus.textContent = message;
  return false;
}

function stepBugTimer(timestamp) {
  if (!bugGameRunning) {
    return;
  }

  if (!timerLastTimestamp) {
    timerLastTimestamp = timestamp;
  }

  const delta =
    Math.min(
      0.1,
      (timestamp - timerLastTimestamp) / 1000
    ) || 0;

  timerLastTimestamp = timestamp;

  bugTimeLeft = Math.max(
    0,
    bugTimeLeft - delta
  );

  updateBugStats();

  if (bugTimeLeft <= 0) {
    showBugFailure(
      `Time ran out on Level ${currentLevelIndex + 1}.`
    );
    return;
  }

  timerAnimationId =
    window.requestAnimationFrame(stepBugTimer);
}

function checkPlantCollision() {
  if (
    !bugGameRunning ||
    collisionLocked ||
    playerBug.hidden
  ) {
    return;
  }

  const bug = getBugCenter();
  const plantElements = Array.from(
    document.querySelectorAll('.meadow-plant')
  );

  for (const plantElement of plantElements) {
    const plant = getPlantCenter(plantElement);

    const dx = bug.x - plant.x;
    const dy = bug.y - plant.y;
    const distance = Math.hypot(dx, dy);

    if (distance > plant.radius) {
      continue;
    }

    const plantId =
      plantElement.dataset.plantId || '';

    // Correct flower.
    if (plantId === currentPlantId) {
      collisionLocked = true;

      bugScore += 1;
      bugGoalHits += 1;

      // A successful match starts a fresh wrong-flower round.
      // Protect the flower the bug is currently sitting on so
      // flying away from it cannot immediately cause a miss.
      ignoredWrongPlantIds.clear();
      ignoredWrongPlantIds.add(plantId);

      updateBugStats();

      if (bugGoalHits >= getCurrentLevel().goal) {
        bugStatus.textContent = 'Level complete!';
        showBugLevelSuccess();
        return;
      }

      bugStatus.textContent = 'Great match!';

      window.setTimeout(() => {
        if (!bugGameRunning) {
          return;
        }

        // Pick the next target but KEEP the bug where it landed.
        chooseRandomTarget();
        collisionLocked = false;
      }, 350);

      return;
    }

    // This wrong flower already charged a miss during the
    // current target round. Do not charge it again.
    if (ignoredWrongPlantIds.has(plantId)) {
      return;
    }

    collisionLocked = true;
    ignoredWrongPlantIds.add(plantId);

    const failed = applyBugMiss(
      'Oops — find the plant shown at the top.'
    );

    if (failed) {
      return;
    }

    window.setTimeout(() => {
      if (!bugGameRunning) {
        return;
      }

      // Keep the bug where it is. The same wrong flower
      // cannot count again until after the next correct match.
      collisionLocked = false;
    }, 350);

    return;
  }
}
function handleBugPointerDown(event) {
  if (!bugGameRunning || !bugMovementGate) {
    return;
  }

  if (!bugMovementGate.begin(event)) {
    return;
  }

  playerBug.classList.add('is-dragging');

  if (
    typeof playerBug.setPointerCapture ===
    'function'
  ) {
    try {
      playerBug.setPointerCapture(
        event.pointerId
      );
    } catch {
      // Pointer capture is optional.
    }
  }

  const pos = getArenaPointerPosition(event);

  movePlayerBugTo(pos.x, pos.y);
  checkPlantCollision();

  event.preventDefault();
}

function handleBugPointerMove(event) {
  if (!bugGameRunning) {
    return;
  }

  if (
    bugMovementGate &&
    !bugMovementGate.shouldMove(event)
  ) {
    return;
  }

  const pos = getArenaPointerPosition(event);

  movePlayerBugTo(pos.x, pos.y);
  checkPlantCollision();
}

function handleBugPointerUp(event) {
  if (!bugMovementGate) {
    return;
  }

  if (bugMovementGate.end(event)) {
    playerBug.classList.remove(
      'is-dragging'
    );
  }
}

function createPlantElement(plant) {
  const wrapper =
    document.createElement('div');

  wrapper.className =
    `meadow-plant ${plant.className}`;

  wrapper.dataset.plantId = plant.id;
  wrapper.style.left = `${plant.x}%`;
  wrapper.style.top = `${plant.y}%`;

  wrapper.setAttribute(
    'aria-label',
    plant.name
  );

  wrapper.innerHTML = `
    <div class="plant-hitbox">
      <span class="plant-stem"></span>
      <span class="plant-leaf plant-leaf-a"></span>
      <span class="plant-leaf plant-leaf-b"></span>
      <span class="plant-bloom"></span>
    </div>
  `;

  return wrapper;
}

function buildMeadowPlants() {
  meadowPlants.innerHTML = '';

  PLANTS.forEach((plant) => {
    meadowPlants.appendChild(
      createPlantElement(plant)
    );
  });
}

function chooseRandomTarget() {
  const choices = PLANTS.filter(
    (plant) => plant.id !== currentPlantId
  );

  const pool =
    choices.length > 0 ? choices : PLANTS;

  const target =
    pool[Math.floor(Math.random() * pool.length)];

  currentPlantId = target.id;

  bugTargetName.textContent = target.name;
  bugTargetPreview.textContent =
    target.preview;

  document
    .querySelectorAll('.meadow-plant')
    .forEach((plantEl) => {
      plantEl.classList.toggle(
        'is-target',
        plantEl.dataset.plantId === target.id
      );
    });

  bugStatus.textContent =
    `Find the ${target.name}.`;
}

function startBugLevel(index) {
  bugLevels = loadBugMeadowLevels();

  currentLevelIndex = Math.max(
    0,
    Math.min(index, bugLevels.length - 1)
  );

  const level = getCurrentLevel();

  bugGoalHits = 0;
  bugMisses = 0;
  bugTimeLeft = level.timeLimit;
  collisionLocked = false;
  ignoredWrongPlantIds.clear();
  timerLastTimestamp = 0;

  bugGameRunning = true;

  playerBug.hidden = false;
  bugStartButton.hidden = true;

  resetPlayerBugPosition();
  chooseRandomTarget();
  updateBugStats();

  stopBugTimer();
  timerAnimationId =
    window.requestAnimationFrame(stepBugTimer);
}

bugChoices.forEach((button) => {
  button.addEventListener('click', () => {
    selectBug(
      button.dataset.bug || ''
    );
  });
});

bugStartButton.addEventListener('click', () => {
  if (!selectedBug) {
    return;
  }

  bugChooser.hidden = true;

  if (currentLevelIndex === 0) {
    bugScore = 0;
  }

  startBugLevel(currentLevelIndex);
});

playerBug.addEventListener(
  'pointerdown',
  handleBugPointerDown
);

bugArena.addEventListener(
  'pointermove',
  handleBugPointerMove
);

window.addEventListener(
  'pointerup',
  handleBugPointerUp
);

window.addEventListener(
  'pointercancel',
  handleBugPointerUp
);

buildMeadowPlants();
chooseRandomTarget();

const trackpadScene =
  document.getElementById('bugTrackpadScene');

const leftHand =
  document.getElementById('bugTrackpadLeftHand');

const rightHand =
  document.getElementById('bugTrackpadRightHand');

if (
  window.trackpadGuide &&
  trackpadScene &&
  leftHand &&
  rightHand
) {
  const guide =
    window.trackpadGuide.create({
      scene: trackpadScene,
      leftHand,
      rightHand,
      pointerSpace: 'viewport',
    });

  if (
    guide &&
    typeof guide.initialize === 'function'
  ) {
    guide.initialize();
  }
}

if (
  window.LevelResultController &&
  bugArena
) {
  bugLevelResult =
    new window.LevelResultController({
      host: bugArena,
      pauseGame: pauseBugGameplay,
      onNextLevel: prepareNextBugLevel,
      onRetry: retryCurrentBugLevel,
      onPlayAgain: playBugMeadowAgain,
      onHome: () => {
        window.location.href =
          '../../index.html';
      },
    });
}
