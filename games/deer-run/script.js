'use strict';

const deerArena =
  document.getElementById('deerArena');

const playerDeer =
  document.getElementById('playerDeer');

const deerStartButton =
  document.getElementById('deerStartButton');

const deerSoundButton =
  document.getElementById('deerSoundButton');

const deerStatus =
  document.getElementById('deerStatus');

const forestTreesBack =
  document.querySelector('.forest-trees-back');

const forestTreesFront =
  document.querySelector('.forest-trees-front');

const forestDetails =
  document.querySelector('.forest-details');

const deerLevelDisplay =
  document.getElementById('deerLevel');

const deerGoalDisplay =
  document.getElementById('deerGoal');

const deerMissesDisplay =
  document.getElementById('deerMisses');

const deerScoreDisplay =
  document.getElementById('deerScore');

const deerTimeDisplay =
  document.getElementById('deerTime');

const DEER_RUN_REQUIRE_CLICK_AND_DRAG_KEY =
  'deerRunRequireClickAndDrag';

const DEER_RUN_ADMIN_SETTINGS_KEY =
  'moving-sound-admin-settings-v1';

const deerMovementGate =
  window.trackpadMovementSettings &&
  typeof window.trackpadMovementSettings.createClickAndDragGate ===
    'function'
    ? window.trackpadMovementSettings.createClickAndDragGate(
        DEER_RUN_REQUIRE_CLICK_AND_DRAG_KEY
      )
    : null;

const DEFAULT_DEER_RUN_LEVELS = [
  {
    goal: 5,
    timeLimit: 35,
    missesAllowed: 3,

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

function clampDeerLevelNumber(
  value,
  min,
  max,
  fallback
) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(
    max,
    Math.max(min, parsed)
  );
}

function normalizeDeerRunLevel(
  level,
  defaults
) {
  const source =
    level &&
    typeof level === 'object'
      ? level
      : {};

  return {
    goal: Math.round(
      clampDeerLevelNumber(
        source.goal,
        1,
        100,
        defaults.goal
      )
    ),

    timeLimit: Math.round(
      clampDeerLevelNumber(
        source.timeLimit,
        10,
        300,
        defaults.timeLimit
      )
    ),

    missesAllowed: Math.round(
      clampDeerLevelNumber(
        source.missesAllowed,
        1,
        20,
        defaults.missesAllowed
      )
    ),

    spawnDelayMin:
      clampDeerLevelNumber(
        source.spawnDelayMin,
        0.5,
        10,
        defaults.spawnDelayMin
      ),

    spawnDelayMax:
      clampDeerLevelNumber(
        source.spawnDelayMax,
        0.5,
        10,
        defaults.spawnDelayMax
      ),

    rabbitEnabled:
      typeof source.rabbitEnabled ===
      'boolean'
        ? source.rabbitEnabled
        : defaults.rabbitEnabled,

    rabbitSpeed:
      clampDeerLevelNumber(
        source.rabbitSpeed,
        40,
        400,
        defaults.rabbitSpeed
      ),

    foxEnabled:
      typeof source.foxEnabled ===
      'boolean'
        ? source.foxEnabled
        : defaults.foxEnabled,

    foxSpeed:
      clampDeerLevelNumber(
        source.foxSpeed,
        40,
        400,
        defaults.foxSpeed
      ),

    falconEnabled:
      typeof source.falconEnabled ===
      'boolean'
        ? source.falconEnabled
        : defaults.falconEnabled,

    falconSpeed:
      clampDeerLevelNumber(
        source.falconSpeed,
        40,
        400,
        defaults.falconSpeed
      ),

    owlEnabled:
      typeof source.owlEnabled ===
      'boolean'
        ? source.owlEnabled
        : defaults.owlEnabled,

    owlSpeed:
      clampDeerLevelNumber(
        source.owlSpeed,
        40,
        400,
        defaults.owlSpeed
      ),
  };
}

function loadDeerRunLevels() {
  try {
    const raw =
      localStorage.getItem(
        DEER_RUN_ADMIN_SETTINGS_KEY
      );

    const parsed =
      raw ? JSON.parse(raw) : {};

    const saved =
      Array.isArray(parsed.deerRunLevels)
        ? parsed.deerRunLevels
        : [];

    return DEFAULT_DEER_RUN_LEVELS.map(
      (defaults, index) =>
        normalizeDeerRunLevel(
          saved[index],
          defaults
        )
    );
  } catch {
    return DEFAULT_DEER_RUN_LEVELS.map(
      (level) => ({ ...level })
    );
  }
}

let deerLevels =
  loadDeerRunLevels();

let currentLevelIndex = 0;

function getDeerRunStudentName() {
  const possibleKeys = [
    'studentName',
    'movingSoundStudentName',
    'bugMeadowStudentName',
  ];

  try {
    for (const key of possibleKeys) {
      const saved =
        localStorage.getItem(key) || '';

      const cleaned =
        saved.trim().slice(0, 60);

      if (cleaned) {
        return cleaned;
      }
    }
  } catch {
    // Fall through to default.
  }

  return 'Student';
}

function saveDeerRunLevelResult() {
  const levelCompleted =
    currentLevelIndex + 1;

  if (
    savedDeerResultLevels.has(
      levelCompleted
    ) ||
    !window.gameResultsStore
  ) {
    return;
  }

  const correctClicks =
    Math.max(
      0,
      deerGoalHits
    );

  const missedClicks =
    Math.max(
      0,
      deerMisses
    );

  const totalClicks =
    correctClicks +
    missedClicks;

  const clickAccuracy =
    totalClicks > 0
      ? (
          correctClicks /
          totalClicks
        ) * 100
      : 0;

  savedDeerResultLevels.add(
    levelCompleted
  );

  void window.gameResultsStore.saveResult({
    id:
      `${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`,

    gameName: 'Deer Run',

    studentName:
      getDeerRunStudentName(),

    levelCompleted,
    missedClicks,
    totalClicks,
    correctClicks,
    clickAccuracy,
    playedAtMs: Date.now(),
  });
}

function getCurrentDeerLevel() {
  return (
    deerLevels[currentLevelIndex] ||
    deerLevels[0]
  );
}

let deerGameRunning = false;
let deerLevelResult = null;
let savedDeerResultLevels = new Set();

let deerJumpY = 0;
let deerJumpVelocity = 0;
let deerJumpAnimationId = 0;
let deerJumpLastTimestamp = 0;
let deerPointerTouching = false;

const DEER_JUMP_GRAVITY = 430;
const DEER_JUMP_IMPULSE = -360;

let deerScore = 0;
let deerMisses = 0;
let deerGoalHits = 0;
let deerTimeLeft = 0;

let deerTimerAnimationId = 0;
let deerTimerLastTimestamp = 0;

function createDeerCrossfadeLoop(
  src,
  overlapSeconds = 0.35
) {
  const tracks = [
    new Audio(src),
    new Audio(src),
  ];

  tracks.forEach((track) => {
    track.preload = 'auto';
    track.loop = false;
  });

  let activeIndex = 0;
  let running = false;
  let crossfading = false;
  let fadeAnimationId = 0;

  function cancelFade() {
    window.cancelAnimationFrame(
      fadeAnimationId
    );

    fadeAnimationId = 0;
    crossfading = false;
  }

  function stop() {
    running = false;
    cancelFade();

    tracks.forEach((track) => {
      track.pause();
      track.currentTime = 0;
      track.volume = 1;
    });

    activeIndex = 0;
  }

  function beginCrossfade() {
    if (!running || crossfading) {
      return;
    }

    const current =
      tracks[activeIndex];

    const nextIndex =
      activeIndex === 0 ? 1 : 0;

    const next =
      tracks[nextIndex];

    crossfading = true;

    next.pause();
    next.currentTime = 0;
    next.volume = 0;

    next.play().catch(() => {
      crossfading = false;
    });

    const fadeStart =
      performance.now();

    const fadeDuration =
      overlapSeconds * 1000;

    function stepFade(now) {
      if (!running) {
        return;
      }

      const progress =
        Math.min(
          1,
          (now - fadeStart) /
            fadeDuration
        );

      current.volume =
        1 - progress;

      next.volume =
        progress;

      if (progress < 1) {
        fadeAnimationId =
          window.requestAnimationFrame(
            stepFade
          );

        return;
      }

      current.pause();
      current.currentTime = 0;
      current.volume = 1;

      next.volume = 1;

      activeIndex = nextIndex;
      crossfading = false;
      fadeAnimationId = 0;
    }

    fadeAnimationId =
      window.requestAnimationFrame(
        stepFade
      );
  }

  function monitorTrack(track) {
    track.addEventListener(
      'timeupdate',
      () => {
        if (
          !running ||
          crossfading ||
          track !== tracks[activeIndex] ||
          !Number.isFinite(
            track.duration
          ) ||
          track.duration <=
            overlapSeconds
        ) {
          return;
        }

        const timeRemaining =
          track.duration -
          track.currentTime;

        if (
          timeRemaining <=
          overlapSeconds
        ) {
          beginCrossfade();
        }
      }
    );

    track.addEventListener(
      'ended',
      () => {
        if (
          running &&
          !crossfading &&
          track === tracks[activeIndex]
        ) {
          beginCrossfade();
        }
      }
    );
  }

  tracks.forEach(monitorTrack);

  function start() {
    if (running) {
      return;
    }

    stop();

    running = true;

    const track =
      tracks[activeIndex];

    track.currentTime = 0;
    track.volume = 1;

    track.play().catch(() => {
      running = false;
    });
  }

  return {
    start,
    stop,
  };
}

const forestAmbientSound =
  createDeerCrossfadeLoop(
    '/games/moving-sound-mini-game/sounds/forestnoise.mp3',
    0.5
  );

const falconFlightSound =
  createDeerCrossfadeLoop(
    '/games/moving-sound-mini-game/sounds/falconsound.mp3',
    0.35
  );

const owlFlightSound =
  createDeerCrossfadeLoop(
    '/games/moving-sound-mini-game/sounds/owlhoot.mp3',
    0.35
  );

const deerMoveSound =
  createDeerCrossfadeLoop(
    '/games/moving-sound-mini-game/sounds/deermove.mp3',
    0.3
  );

let deerMoveSoundStopTimer = 0;
let falconSoundPlaying = false;
let owlSoundPlaying = false;

function stopAllDeerSounds() {
  window.clearTimeout(
    deerMoveSoundStopTimer
  );

  deerMoveSoundStopTimer = 0;

  forestAmbientSound.stop();
  falconFlightSound.stop();
  owlFlightSound.stop();
  deerMoveSound.stop();

  falconSoundPlaying = false;
  owlSoundPlaying = false;
}

function updateForestAnimalSounds() {
  if (!deerGameRunning) {
    falconFlightSound.stop();
    owlFlightSound.stop();

    falconSoundPlaying = false;
    owlSoundPlaying = false;

    return;
  }

  const hasFalcon =
    activeForestObstacles.some(
      (obstacle) =>
        obstacle.type === 'falcon'
    );

  const hasOwl =
    activeForestObstacles.some(
      (obstacle) =>
        obstacle.type === 'owl'
    );

  if (
    hasFalcon &&
    !falconSoundPlaying
  ) {
    falconFlightSound.start();
    falconSoundPlaying = true;
  }

  if (
    !hasFalcon &&
    falconSoundPlaying
  ) {
    falconFlightSound.stop();
    falconSoundPlaying = false;
  }

  if (
    hasOwl &&
    !owlSoundPlaying
  ) {
    owlFlightSound.start();
    owlSoundPlaying = true;
  }

  if (
    !hasOwl &&
    owlSoundPlaying
  ) {
    owlFlightSound.stop();
    owlSoundPlaying = false;
  }
}

function playDeerMovementSound() {
  if (!deerGameRunning) {
    return;
  }

  deerMoveSound.start();

  window.clearTimeout(
    deerMoveSoundStopTimer
  );

  deerMoveSoundStopTimer =
    window.setTimeout(
      () => {
        deerMoveSound.stop();
        deerMoveSoundStopTimer = 0;
      },
      180
    );
}

let activeForestObstacles = [];
let forestObstacleTypeBag = [];
let forestObstacleAnimationId = 0;
let forestObstacleLastTimestamp = 0;
let nextForestObstacleSpawnAt = 0;

function getNextForestObstacleDelay() {
  const level =
    getCurrentDeerLevel();

  const minSeconds =
    Math.min(
      level.spawnDelayMin,
      level.spawnDelayMax
    );

  const maxSeconds =
    Math.max(
      level.spawnDelayMin,
      level.spawnDelayMax
    );

  const seconds =
    minSeconds +
    Math.random() *
      (maxSeconds - minSeconds);

  return seconds * 1000;
}

function clearForestObstacles() {
  activeForestObstacles.forEach((obstacle) => {
    obstacle.element.remove();
  });

  activeForestObstacles = [];

  updateForestAnimalSounds();
}

function getEnabledForestObstacleTypes() {
  const level =
    getCurrentDeerLevel();

  const enabled = [];

  if (level.rabbitEnabled) {
    enabled.push('rabbit');
  }

  if (level.foxEnabled) {
    enabled.push('fox');
  }

  if (level.falconEnabled) {
    enabled.push('falcon');
  }

  if (level.owlEnabled) {
    enabled.push('owl');
  }

  return enabled;
}

function getNextForestObstacleType() {
  if (forestObstacleTypeBag.length === 0) {
    forestObstacleTypeBag =
      getEnabledForestObstacleTypes();

    for (
      let index =
        forestObstacleTypeBag.length - 1;
      index > 0;
      index -= 1
    ) {
      const swapIndex =
        Math.floor(
          Math.random() * (index + 1)
        );

      [
        forestObstacleTypeBag[index],
        forestObstacleTypeBag[swapIndex],
      ] = [
        forestObstacleTypeBag[swapIndex],
        forestObstacleTypeBag[index],
      ];
    }
  }

  return (
    forestObstacleTypeBag.pop() ||
    null
  );
}

function createForestObstacle() {
  const arenaRect =
    deerArena.getBoundingClientRect();

  const type =
    getNextForestObstacleType();

  if (!type) {
    return null;
  }

  const level =
    getCurrentDeerLevel();

  const element =
    document.createElement('div');

  element.className =
    `forest-obstacle forest-obstacle-${type}`;

  const image =
    document.createElement('img');

  image.className =
    'forest-obstacle-image';

  let lane = 'ground';
  let speed = level.rabbitSpeed;
  let y = arenaRect.height * 0.72;
  let label = 'Forest obstacle';

  if (type === 'rabbit') {
    image.src =
      '../../images/bunny.png';

    label = 'Rabbit obstacle';
  }

  if (type === 'fox') {
    image.src =
      '../../images/foxedit.png';

    label = 'Fox obstacle';
    speed = level.foxSpeed;
  }

  if (type === 'falcon') {
    image.src =
      '../../images/falconedit.png';

    label = 'Falcon obstacle';
    lane = 'air';
    speed = level.falconSpeed;
    y = arenaRect.height * 0.40;
  }

  if (type === 'owl') {
    image.src =
      '../../images/owledit.png';

    label = 'Owl obstacle';
    lane = 'air';
    speed = level.owlSpeed;
    y = arenaRect.height * 0.40;
  }

  image.alt = '';
  image.draggable = false;

  element.appendChild(image);

  element.setAttribute(
    'aria-label',
    label
  );

  const startX =
    arenaRect.width + 70;

  const obstacle = {
    element,
    type,
    lane,
    x: startX,
    startX,
    y,
    vx: -speed,
    resolved: false,
    perspective:
      type === 'owl',
  };

  element.style.left =
    `${obstacle.x}px`;

  element.style.top =
    `${obstacle.y}px`;

  deerArena.appendChild(element);

  activeForestObstacles.push(
    obstacle
  );

  if (obstacle.perspective) {
    updateOwlPerspective(
      obstacle,
      arenaRect
    );
  }

  return obstacle;
}

function updateOwlPerspective(
  obstacle,
  arenaRect
) {
  if (!obstacle.perspective) {
    return;
  }

  const deerX =
    arenaRect.width * 0.24;

  const travelDistance =
    Math.max(
      1,
      obstacle.startX - deerX
    );

  const progress =
    Math.max(
      0,
      Math.min(
        1,
        (
          obstacle.startX -
          obstacle.x
        ) / travelDistance
      )
    );

  const minSize = 28;
  const maxSize = 96;

  const size =
    minSize +
    (
      maxSize - minSize
    ) * progress;

  obstacle.element.style.width =
    `${size}px`;

  obstacle.element.style.height =
    `${size}px`;
}

function updateDeerStats() {
  const level =
    getCurrentDeerLevel();

  if (deerLevelDisplay) {
    deerLevelDisplay.textContent =
      `${currentLevelIndex + 1} of ${deerLevels.length}`;
  }

  if (deerGoalDisplay) {
    deerGoalDisplay.textContent =
      `${deerGoalHits}/${level.goal}`;
  }

  if (deerMissesDisplay) {
    deerMissesDisplay.textContent =
      String(
        Math.max(
          0,
          level.missesAllowed - deerMisses
        )
      );
  }

  if (deerScoreDisplay) {
    deerScoreDisplay.textContent =
      String(deerScore);
  }

  if (deerTimeDisplay) {
    deerTimeDisplay.textContent =
      String(
        Math.max(
          0,
          Math.ceil(deerTimeLeft)
        )
      );
  }
}

function stopDeerTimer() {
  window.cancelAnimationFrame(
    deerTimerAnimationId
  );

  deerTimerAnimationId = 0;
  deerTimerLastTimestamp = 0;
}

function showDeerFailure(message) {
  pauseDeerGameplay();

  if (deerLevelResult) {
    deerLevelResult.showFailure({
      title: 'Try Again!',
      message,
    });
    return;
  }

  deerStatus.textContent = message;
  deerStartButton.hidden = false;
  deerStartButton.textContent =
    'Try Again';
}

function stepDeerTimer(timestamp) {
  if (!deerGameRunning) {
    return;
  }

  if (!deerTimerLastTimestamp) {
    deerTimerLastTimestamp =
      timestamp;
  }

  const delta =
    Math.min(
      0.1,
      (
        timestamp -
        deerTimerLastTimestamp
      ) / 1000
    ) || 0;

  deerTimerLastTimestamp =
    timestamp;

  deerTimeLeft =
    Math.max(
      0,
      deerTimeLeft - delta
    );

  updateDeerStats();

  if (deerTimeLeft <= 0) {
    showDeerFailure(
      `Time ran out on Level ${currentLevelIndex + 1}.`
    );
    return;
  }

  deerTimerAnimationId =
    window.requestAnimationFrame(
      stepDeerTimer
    );
}

function pauseDeerGameplay() {
  deerGameRunning = false;

  stopAllDeerSounds();

  stopForestObstacleAnimation();
  stopDeerTimer();
  stopDeerJumpAnimation();

  if (forestTreesBack) {
    forestTreesBack.classList.remove(
      'is-running'
    );
  }

  if (forestTreesFront) {
    forestTreesFront.classList.remove(
      'is-running'
    );
  }

  if (forestDetails) {
    forestDetails.classList.remove(
      'is-running'
    );
  }

  playerDeer.classList.remove(
    'is-dragging'
  );
}

function prepareNextDeerLevel() {
  if (
    currentLevelIndex >=
    deerLevels.length - 1
  ) {
    return;
  }

  currentLevelIndex += 1;

  deerGoalHits = 0;
  deerMisses = 0;
  deerTimeLeft =
    getCurrentDeerLevel().timeLimit;

  forestObstacleTypeBag = [];

  clearForestObstacles();
  resetDeerPosition();
  updateDeerStats();

  deerStartButton.hidden = false;
  deerStartButton.textContent =
    'Start Level';

  deerStatus.textContent =
    `Level ${currentLevelIndex + 1} ready. Press Start.`;
}

function retryCurrentDeerLevel() {
  startDeerLevel(currentLevelIndex);
}

function playDeerRunAgain() {
  currentLevelIndex = 0;
  deerScore = 0;

  savedDeerResultLevels.clear();

  startDeerLevel(0);
}

function showDeerLevelSuccess() {
  pauseDeerGameplay();

  saveDeerRunLevelResult();

  const completedLevel =
    currentLevelIndex + 1;

  const hasNextLevel =
    currentLevelIndex <
    deerLevels.length - 1;

  if (!deerLevelResult) {
    if (hasNextLevel) {
      prepareNextDeerLevel();
    } else {
      deerStatus.textContent =
        'You completed all 4 Deer Run levels!';
    }

    return;
  }

  if (hasNextLevel) {
    deerLevelResult.showSuccess({
      title: 'Level Complete!',
      message:
        `Great run! Tap Level Up for Level ${completedLevel + 1}.`,
    });
  } else {
    deerLevelResult.showFinal({
      title: 'You Did It!',
      message:
        'You completed all 4 Deer Run levels!',
    });
  }
}

function checkForestObstacleResult(obstacle) {
  if (obstacle.resolved) {
    return;
  }

  const deerRect =
    playerDeer.getBoundingClientRect();

  const rawObstacleRect =
    obstacle.element.getBoundingClientRect();

  const obstacleRect = {
    left: rawObstacleRect.left,
    right: rawObstacleRect.right,
    top: rawObstacleRect.top,
    bottom: rawObstacleRect.bottom,
  };

  if (obstacle.lane === 'ground') {
    const horizontalInset =
      rawObstacleRect.width * 0.30;

    const verticalInset =
      rawObstacleRect.height * 0.25;

    obstacleRect.left +=
      horizontalInset;

    obstacleRect.right -=
      horizontalInset;

    obstacleRect.top +=
      verticalInset;
  }

  const horizontalOverlap =
    deerRect.left < obstacleRect.right &&
    deerRect.right > obstacleRect.left;

  const verticalOverlap =
    deerRect.top < obstacleRect.bottom &&
    deerRect.bottom > obstacleRect.top;

  if (
    horizontalOverlap &&
    verticalOverlap
  ) {
    obstacle.resolved = true;

    deerMisses += 1;

    deerStatus.textContent =
      obstacle.lane === 'air'
        ? 'Oops! Stay under the flying animal.'
        : 'Oops! Jump over the animal.';

    updateDeerStats();

    if (
      deerMisses >=
      getCurrentDeerLevel().missesAllowed
    ) {
      showDeerFailure(
        `Too many misses on Level ${currentLevelIndex + 1}.`
      );
    }

    return;
  }

  if (
    obstacleRect.right <
    deerRect.left
  ) {
    obstacle.resolved = true;

    deerGoalHits += 1;
    deerScore += 1;

    deerStatus.textContent =
      obstacle.lane === 'air'
        ? 'Nice duck!'
        : 'Great jump!';

    updateDeerStats();

    if (
      deerGoalHits >=
      getCurrentDeerLevel().goal
    ) {
      deerStatus.textContent =
        'Level complete!';

      showDeerLevelSuccess();
    }
  }
}

function stopForestObstacleAnimation() {
  window.cancelAnimationFrame(
    forestObstacleAnimationId
  );

  forestObstacleAnimationId = 0;
  forestObstacleLastTimestamp = 0;
}

function stepForestObstacles(timestamp) {
  if (!deerGameRunning) {
    return;
  }

  if (!forestObstacleLastTimestamp) {
    forestObstacleLastTimestamp =
      timestamp;
  }

  const delta =
    Math.min(
      0.05,
      (
        timestamp -
        forestObstacleLastTimestamp
      ) / 1000
    ) || 0;

  forestObstacleLastTimestamp =
    timestamp;

  if (
    nextForestObstacleSpawnAt > 0 &&
    timestamp >= nextForestObstacleSpawnAt
  ) {
    createForestObstacle();

    nextForestObstacleSpawnAt =
      timestamp +
      getNextForestObstacleDelay();
  }

  activeForestObstacles =
    activeForestObstacles.filter(
      (obstacle) => {
        obstacle.x +=
          obstacle.vx * delta;

        obstacle.element.style.left =
          `${obstacle.x}px`;

        if (obstacle.perspective) {
          const arenaRect =
            deerArena.getBoundingClientRect();

          updateOwlPerspective(
            obstacle,
            arenaRect
          );
        }

        checkForestObstacleResult(
          obstacle
        );

        if (obstacle.x < -70) {
          obstacle.element.remove();
          return false;
        }

        return true;
      }
    );

  updateForestAnimalSounds();

  forestObstacleAnimationId =
    window.requestAnimationFrame(
      stepForestObstacles
    );
}

function getArenaPointerPosition(event) {
  const rect =
    deerArena.getBoundingClientRect();

  return {
    x: Math.max(
      0,
      Math.min(
        rect.width,
        event.clientX - rect.left
      )
    ),
    y: Math.max(
      0,
      Math.min(
        rect.height,
        event.clientY - rect.top
      )
    ),
  };
}

function getDeerGroundY() {
  const rect =
    deerArena.getBoundingClientRect();

  return rect.height * 0.66;
}

function applyDeerJumpPosition() {
  playerDeer.style.top =
    `${deerJumpY}px`;

  playerDeer.style.bottom =
    'auto';
}

function resetDeerPosition() {
  deerPointerTouching = false;

  deerJumpY =
    getDeerGroundY();

  deerJumpVelocity = 0;

  applyDeerJumpPosition();
}

function stopDeerJumpAnimation() {
  window.cancelAnimationFrame(
    deerJumpAnimationId
  );

  deerJumpAnimationId = 0;
  deerJumpLastTimestamp = 0;
}

function stepDeerJump(timestamp) {
  if (!deerGameRunning) {
    deerJumpAnimationId = 0;
    deerJumpLastTimestamp = 0;
    return;
  }

  if (!deerJumpLastTimestamp) {
    deerJumpLastTimestamp = timestamp;
  }

  const delta =
    Math.min(
      0.05,
      (
        timestamp -
        deerJumpLastTimestamp
      ) / 1000
    ) || 0;

  deerJumpLastTimestamp = timestamp;

  const groundY =
    getDeerGroundY();

  deerJumpVelocity +=
    DEER_JUMP_GRAVITY * delta;

  deerJumpY +=
    deerJumpVelocity * delta;

  if (deerJumpY >= groundY) {
    deerJumpY = groundY;
    deerJumpVelocity = 0;
  }

  applyDeerJumpPosition();

  deerJumpAnimationId =
    window.requestAnimationFrame(
      stepDeerJump
    );
}

function triggerDeerJump() {
  if (!deerGameRunning) {
    return;
  }

  const groundY =
    getDeerGroundY();

  /*
   * Allow a new jump only when the deer is
   * basically back on the ground.
   */
  if (
    Math.abs(
      deerJumpY - groundY
    ) > 8
  ) {
    return;
  }

  deerJumpVelocity =
    DEER_JUMP_IMPULSE;

  playDeerMovementSound();
}

function isPointerTouchingDeer(event) {
  const rect =
    playerDeer.getBoundingClientRect();

  return (
    event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom
  );
}

function handleDeerPointerDown(event) {
  if (
    !deerGameRunning ||
    !deerMovementGate
  ) {
    return;
  }

  if (!deerMovementGate.begin(event)) {
    return;
  }

  playerDeer.classList.add(
    'is-dragging'
  );

  if (
    typeof playerDeer.setPointerCapture ===
    'function'
  ) {
    try {
      playerDeer.setPointerCapture(
        event.pointerId
      );
    } catch {
      // Pointer capture is optional.
    }
  }

  triggerDeerJump();

  event.preventDefault();
}

function handleDeerPointerMove(event) {
  if (!deerGameRunning) {
    return;
  }

  const touchingDeer =
    isPointerTouchingDeer(event);

  if (!touchingDeer) {
    deerPointerTouching = false;
    return;
  }

  if (deerPointerTouching) {
    return;
  }

  if (
    deerMovementGate &&
    !deerMovementGate.shouldMove(event)
  ) {
    return;
  }

  deerPointerTouching = true;

  triggerDeerJump();
}

function handleDeerPointerUp(event) {
  deerPointerTouching = false;

  if (!deerMovementGate) {
    return;
  }

  if (deerMovementGate.end(event)) {
    playerDeer.classList.remove(
      'is-dragging'
    );
  }
}

function startDeerLevel(index) {
  currentLevelIndex =
    Math.max(
      0,
      Math.min(
        index,
        deerLevels.length - 1
      )
    );

  deerGoalHits = 0;
  deerMisses = 0;
  deerTimeLeft =
    getCurrentDeerLevel().timeLimit;

  if (currentLevelIndex === 0) {
    deerScore = 0;
  }

  deerGameRunning = true;

  stopAllDeerSounds();
  forestAmbientSound.start();

  forestObstacleTypeBag = [];

  updateDeerStats();

  deerStartButton.hidden = true;

  resetDeerPosition();

  stopDeerJumpAnimation();

  deerJumpAnimationId =
    window.requestAnimationFrame(
      stepDeerJump
    );

  clearForestObstacles();
  createForestObstacle();

  stopForestObstacleAnimation();

  nextForestObstacleSpawnAt =
    performance.now() +
    getNextForestObstacleDelay();

  forestObstacleAnimationId =
    window.requestAnimationFrame(
      stepForestObstacles
    );

  stopDeerTimer();

  deerTimerAnimationId =
    window.requestAnimationFrame(
      stepDeerTimer
    );

  if (forestTreesBack) {
    forestTreesBack.classList.add(
      'is-running'
    );
  }

  if (forestTreesFront) {
    forestTreesFront.classList.add(
      'is-running'
    );
  }

  if (forestDetails) {
    forestDetails.classList.add(
      'is-running'
    );
  }

  deerStatus.textContent =
    'Watch the trail and avoid the animals.';
}

deerStartButton.addEventListener(
  'click',
  () => {
    startDeerLevel(
      currentLevelIndex
    );
  }
);

playerDeer.addEventListener(
  'pointerdown',
  handleDeerPointerDown
);

deerArena.addEventListener(
  'pointermove',
  handleDeerPointerMove
);

window.addEventListener(
  'pointerup',
  handleDeerPointerUp
);

window.addEventListener(
  'pointercancel',
  handleDeerPointerUp
);

/* Shared Trackpad Guide */

const trackpadScene =
  document.getElementById(
    'deerTrackpadScene'
  );

const leftHand =
  document.getElementById(
    'deerTrackpadLeftHand'
  );

const rightHand =
  document.getElementById(
    'deerTrackpadRightHand'
  );

let deerTrackpadGuide = null;

if (
  window.trackpadGuide &&
  trackpadScene &&
  leftHand &&
  rightHand
) {
  deerTrackpadGuide =
    window.trackpadGuide.create({
      scene: trackpadScene,
      leftHand,
      rightHand,
      pointerSpace: 'viewport',
    });

  if (
    deerTrackpadGuide &&
    typeof deerTrackpadGuide.initialize ===
      'function'
  ) {
    deerTrackpadGuide.initialize();
  }
}

document.addEventListener(
  'pointermove',
  (event) => {
    if (!deerTrackpadGuide) {
      return;
    }

    deerTrackpadGuide
      .updateFromPointerEvent(event);
  }
);

document.addEventListener(
  'pointerdown',
  (event) => {
    if (!deerTrackpadGuide) {
      return;
    }

    deerTrackpadGuide
      .updateFromPointerEvent(event);

    deerTrackpadGuide.setPressed(true);
  }
);

document.addEventListener(
  'pointerup',
  (event) => {
    if (!deerTrackpadGuide) {
      return;
    }

    deerTrackpadGuide
      .updateFromPointerEvent(event);

    deerTrackpadGuide.setPressed(false);
  }
);

document.addEventListener(
  'pointercancel',
  () => {
    if (!deerTrackpadGuide) {
      return;
    }

    deerTrackpadGuide.setPressed(false);
  }
);


if (
  window.LevelResultController &&
  deerArena
) {
  deerLevelResult =
    new window.LevelResultController({
      host: deerArena,
      pauseGame: pauseDeerGameplay,
      onNextLevel: prepareNextDeerLevel,
      onRetry: retryCurrentDeerLevel,
      onPlayAgain: playDeerRunAgain,
      onHome: () => {
        window.location.href =
          '../../index.html';
      },
    });
}
