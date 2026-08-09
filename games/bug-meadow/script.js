'use strict';

const bugArena = document.getElementById('bugArena');
const bugChooser = document.getElementById('bugChooser');
const bugChoices = Array.from(document.querySelectorAll('.bug-choice'));
const playerBug = document.getElementById('playerBug');
const bugStartButton = document.getElementById('bugStartButton');
const bugStatus = document.getElementById('bugStatus');
const bugGoal = document.getElementById('bugGoal');
const bugMissesDisplay = document.getElementById('bugMisses');
const bugScoreDisplay = document.getElementById('bugScore');

const meadowPlants = document.getElementById('meadowPlants');
const bugTargetName = document.getElementById('bugTargetName');
const bugTargetPreview = document.getElementById('bugTargetPreview');

const bugIcons = {
  bumblebee: '🐝',
  ladybug: '🐞',
  butterfly: '🦋',
  wasp: '🐝',
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

let selectedBug = '';
let currentPlantId = '';

const BUG_MEADOW_REQUIRE_CLICK_AND_DRAG_KEY = 'bugMeadowRequireClickAndDrag';

const bugMovementGate =
  window.trackpadMovementSettings &&
  typeof window.trackpadMovementSettings.createClickAndDragGate === 'function'
    ? window.trackpadMovementSettings.createClickAndDragGate(
        BUG_MEADOW_REQUIRE_CLICK_AND_DRAG_KEY
      )
    : null;

let bugGameRunning = false;
let bugScore = 0;
let bugMisses = 0;
let bugGoalHits = 0;
let collisionLocked = false;

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
  if (bugGoal) {
    bugGoal.textContent = `${bugGoalHits}/6`;
  }

  if (bugMissesDisplay) {
    bugMissesDisplay.textContent = `${bugMisses}/3`;
  }

  if (bugScoreDisplay) {
    bugScoreDisplay.textContent = String(bugScore);
  }
}

function getArenaPointerPosition(event) {
  const rect = bugArena.getBoundingClientRect();

  return {
    x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
    y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
  };
}

function movePlayerBugTo(x, y) {
  playerBug.style.left = `${x}px`;
  playerBug.style.top = `${y}px`;
}

function getBugCenter() {
  const arenaRect = bugArena.getBoundingClientRect();
  const bugRect = playerBug.getBoundingClientRect();

  return {
    x: bugRect.left - arenaRect.left + bugRect.width / 2,
    y: bugRect.top - arenaRect.top + bugRect.height / 2,
  };
}

function getPlantCenter(plantElement) {
  const arenaRect = bugArena.getBoundingClientRect();
  const plantRect = plantElement.getBoundingClientRect();

  return {
    x: plantRect.left - arenaRect.left + plantRect.width / 2,
    y: plantRect.top - arenaRect.top + plantRect.height / 2,
    radius: Math.max(
      30,
      Math.min(plantRect.width, plantRect.height) * 0.42
    ),
  };
}

function checkPlantCollision() {
  if (!bugGameRunning || collisionLocked || playerBug.hidden) {
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

    collisionLocked = true;

    const plantId = plantElement.dataset.plantId || '';

    if (plantId === currentPlantId) {
      bugScore += 1;
      bugGoalHits += 1;
      bugStatus.textContent = 'Great match!';

      updateBugStats();

      window.setTimeout(() => {
        chooseRandomTarget();
        collisionLocked = false;
      }, 450);

      return;
    }

    bugMisses += 1;
    bugStatus.textContent =
      'Oops — find the plant shown at the top.';

    updateBugStats();

    window.setTimeout(() => {
      collisionLocked = false;
    }, 450);

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

  if (typeof playerBug.setPointerCapture === 'function') {
    try {
      playerBug.setPointerCapture(event.pointerId);
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

  if (bugMovementGate && !bugMovementGate.shouldMove(event)) {
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
    playerBug.classList.remove('is-dragging');
  }
}

function createPlantElement(plant) {
  const wrapper = document.createElement('div');
  wrapper.className = `meadow-plant ${plant.className}`;
  wrapper.dataset.plantId = plant.id;
  wrapper.style.left = `${plant.x}%`;
  wrapper.style.top = `${plant.y}%`;
  wrapper.setAttribute('aria-label', plant.name);

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
    meadowPlants.appendChild(createPlantElement(plant));
  });
}

function chooseRandomTarget() {
  const choices = PLANTS.filter((plant) => plant.id !== currentPlantId);
  const pool = choices.length > 0 ? choices : PLANTS;
  const target = pool[Math.floor(Math.random() * pool.length)];

  currentPlantId = target.id;

  bugTargetName.textContent = target.name;
  bugTargetPreview.textContent = target.preview;

  document.querySelectorAll('.meadow-plant').forEach((plantEl) => {
    plantEl.classList.toggle(
      'is-target',
      plantEl.dataset.plantId === target.id
    );
  });

  bugStatus.textContent = `Find the ${target.name}.`;
}

bugChoices.forEach((button) => {
  button.addEventListener('click', () => {
    selectBug(button.dataset.bug || '');
  });
});

bugStartButton.addEventListener('click', () => {
  if (!selectedBug) {
    return;
  }

  bugChooser.hidden = true;
  playerBug.hidden = false;

  const rect = bugArena.getBoundingClientRect();

  movePlayerBugTo(rect.width * 0.5, rect.height * 0.72);

  bugScore = 0;
  bugMisses = 0;
  bugGoalHits = 0;
  collisionLocked = false;
  bugGameRunning = true;

  updateBugStats();

  bugStartButton.hidden = true;

  chooseRandomTarget();
});

playerBug.addEventListener('pointerdown', handleBugPointerDown);
bugArena.addEventListener('pointermove', handleBugPointerMove);
window.addEventListener('pointerup', handleBugPointerUp);
window.addEventListener('pointercancel', handleBugPointerUp);

buildMeadowPlants();
chooseRandomTarget();

const trackpadScene = document.getElementById('bugTrackpadScene');
const leftHand = document.getElementById('bugTrackpadLeftHand');
const rightHand = document.getElementById('bugTrackpadRightHand');

if (window.trackpadGuide && trackpadScene && leftHand && rightHand) {
  const guide = window.trackpadGuide.create({
    scene: trackpadScene,
    leftHand,
    rightHand,
    pointerSpace: 'viewport',
  });

  if (guide && typeof guide.initialize === 'function') {
    guide.initialize();
  }
}
