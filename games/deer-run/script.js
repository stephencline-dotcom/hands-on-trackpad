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

const deerMovementGate =
  window.trackpadMovementSettings &&
  typeof window.trackpadMovementSettings.createClickAndDragGate ===
    'function'
    ? window.trackpadMovementSettings.createClickAndDragGate(
        DEER_RUN_REQUIRE_CLICK_AND_DRAG_KEY
      )
    : null;

let deerGameRunning = false;

let deerScore = 0;
let deerMisses = 0;
let deerGoalHits = 0;

let activeForestObstacles = [];
let forestObstacleAnimationId = 0;
let forestObstacleLastTimestamp = 0;
let nextForestObstacleSpawnAt = 0;

function getNextForestObstacleDelay() {
  return 3000 + Math.random() * 1000;
}

function clearForestObstacles() {
  activeForestObstacles.forEach((obstacle) => {
    obstacle.element.remove();
  });

  activeForestObstacles = [];
}

function createForestObstacle() {
  const arenaRect =
    deerArena.getBoundingClientRect();

  const type =
    Math.random() < 0.5
      ? 'rabbit'
      : 'falcon';

  const element =
    document.createElement('div');

  element.className =
    `forest-obstacle forest-obstacle-${type}`;

  const image =
    document.createElement('img');

  image.className =
    'forest-obstacle-image';

  if (type === 'rabbit') {
    image.src =
      '../../images/bunny.png';

    element.setAttribute(
      'aria-label',
      'Rabbit obstacle'
    );
  } else {
    image.src =
      '../../images/falconedit.png';

    element.setAttribute(
      'aria-label',
      'Falcon obstacle'
    );
  }

  image.alt = '';
  image.draggable = false;

  element.appendChild(image);

  const obstacle = {
    element,
    type,
    x: arenaRect.width + 70,
    y:
      type === 'rabbit'
        ? arenaRect.height * 0.72
        : arenaRect.height * 0.40,
    vx:
      type === 'rabbit'
        ? -115
        : -145,
    resolved: false,
  };

  element.style.left =
    `${obstacle.x}px`;

  element.style.top =
    `${obstacle.y}px`;

  deerArena.appendChild(element);

  activeForestObstacles.push(
    obstacle
  );

  return obstacle;
}

function updateDeerStats() {
  if (deerGoalDisplay) {
    deerGoalDisplay.textContent =
      `${deerGoalHits}/5`;
  }

  if (deerMissesDisplay) {
    deerMissesDisplay.textContent =
      String(Math.max(0, 3 - deerMisses));
  }

  if (deerScoreDisplay) {
    deerScoreDisplay.textContent =
      String(deerScore);
  }
}

function checkForestObstacleResult(obstacle) {
  if (obstacle.resolved) {
    return;
  }

  const deerRect =
    playerDeer.getBoundingClientRect();

  const obstacleRect =
    obstacle.element.getBoundingClientRect();

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
      obstacle.type === 'falcon'
        ? 'Oops! Stay under the falcon.'
        : 'Oops! Jump over the bunny.';

    updateDeerStats();
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
      obstacle.type === 'falcon'
        ? 'Nice duck!'
        : 'Great jump!';

    updateDeerStats();
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

function moveDeerVertically(y) {
  const rect =
    deerArena.getBoundingClientRect();

  /*
   * The deer remains horizontally fixed.
   *
   * Top limit:
   * keep the deer fully inside the arena.
   *
   * Bottom limit:
   * keep its feet near the forest floor instead
   * of allowing it to move below the ground.
   */
  const minY =
    rect.height * 0.12;

  const maxY =
    rect.height * 0.66;

  const safeY =
    Math.max(
      minY,
      Math.min(maxY, y)
    );

  playerDeer.style.top =
    `${safeY}px`;

  playerDeer.style.bottom =
    'auto';
}

function resetDeerPosition() {
  const rect =
    deerArena.getBoundingClientRect();

  moveDeerVertically(
    rect.height * 0.66
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

  const pos =
    getArenaPointerPosition(event);

  moveDeerVertically(pos.y);

  event.preventDefault();
}

function handleDeerPointerMove(event) {
  if (!deerGameRunning) {
    return;
  }

  if (
    deerMovementGate &&
    !deerMovementGate.shouldMove(event)
  ) {
    return;
  }

  const pos =
    getArenaPointerPosition(event);

  moveDeerVertically(pos.y);
}

function handleDeerPointerUp(event) {
  if (!deerMovementGate) {
    return;
  }

  if (deerMovementGate.end(event)) {
    playerDeer.classList.remove(
      'is-dragging'
    );
  }
}

deerStartButton.addEventListener(
  'click',
  () => {
    deerGameRunning = true;

    deerScore = 0;
    deerMisses = 0;
    deerGoalHits = 0;

    updateDeerStats();

    deerStartButton.hidden = true;

    resetDeerPosition();

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

    deerStatus.textContent =
      'Move up and down to practice jumping.';
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
