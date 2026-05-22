const scene = document.getElementById("scene");
const leftHand = document.getElementById("leftHand");
const rightHand = document.getElementById("rightHand");
const mazeBoard = document.getElementById("mazeBoard");
const mazeStart = document.getElementById("mazeStart");
const mazeFinish = document.getElementById("mazeFinish");
const mazeToken = document.getElementById("mazeToken");
const mazeStatus = document.getElementById("mazeStatus");
const mazeLevelBadge = document.getElementById("mazeLevelBadge");
const mazeStartAudio = document.getElementById("mazeStartAudio");
const mazeHitAudio = document.getElementById("mazeHitAudio");
const mazeFinishAudio = document.getElementById("mazeFinishAudio");

const LAYOUT = {
  scene: { width: 626, height: 437 },
  trackpadScale: 0.84,
  // Left hand remains fixed and only animates on click.
  leftStart: { x: -34, y: 178 },
  rightStart: { x: 230, y: 158 },
};

let isPressed = false;
let mazeActive = false;
let mazeCompleted = false;
let hitCount = 0;
let collisionLock = false;
let audioPrimed = false;
let currentLevelIndex = 0;

const MAZE_LEVELS = [
  {
    name: "Level 1",
    bars: [
      { x: 21, w: 5, gapY: 61, gapH: 28 },
      { x: 40, w: 5, gapY: 14, gapH: 28 },
      { x: 59, w: 5, gapY: 57, gapH: 28 },
    ],
  },
  {
    name: "Level 2",
    bars: [
      { x: 16, w: 5, gapY: 58, gapH: 26 },
      { x: 31, w: 5, gapY: 17, gapH: 26 },
      { x: 46, w: 5, gapY: 58, gapH: 26 },
      { x: 61, w: 5, gapY: 19, gapH: 26 },
      { x: 76, w: 5, gapY: 57, gapH: 26 },
    ],
  },
  {
    name: "Level 3",
    bars: [
      { x: 15, w: 4.5, gapY: 57, gapH: 24 },
      { x: 27, w: 4.5, gapY: 19, gapH: 24 },
      { x: 39, w: 4.5, gapY: 58, gapH: 24 },
      { x: 51, w: 4.5, gapY: 21, gapH: 24 },
      { x: 63, w: 4.5, gapY: 58, gapH: 24 },
      { x: 75, w: 4.5, gapY: 23, gapH: 24 },
    ],
  },
  {
    name: "Level 4",
    bars: [
      { x: 14, w: 4.5, gapY: 56, gapH: 22 },
      { x: 24, w: 4.5, gapY: 21, gapH: 22 },
      { x: 34, w: 4.5, gapY: 56, gapH: 22 },
      { x: 44, w: 4.5, gapY: 21, gapH: 22 },
      { x: 54, w: 4.5, gapY: 56, gapH: 22 },
      { x: 64, w: 4.5, gapY: 21, gapH: 22 },
      { x: 74, w: 4.5, gapY: 56, gapH: 22 },
    ],
  },
  {
    name: "Level 5",
    bars: [
      { x: 12, w: 4, gapY: 54, gapH: 20 },
      { x: 21, w: 4, gapY: 23, gapH: 20 },
      { x: 30, w: 4, gapY: 55, gapH: 20 },
      { x: 39, w: 4, gapY: 23, gapH: 20 },
      { x: 48, w: 4, gapY: 55, gapH: 20 },
      { x: 57, w: 4, gapY: 23, gapH: 20 },
      { x: 66, w: 4, gapY: 55, gapH: 20 },
      { x: 75, w: 4, gapY: 23, gapH: 20 },
    ],
  },
  {
    name: "Level 6",
    bars: [
      { x: 11, w: 3.6, gapY: 52, gapH: 18 },
      { x: 19, w: 3.6, gapY: 24, gapH: 18 },
      { x: 27, w: 3.6, gapY: 52, gapH: 18 },
      { x: 35, w: 3.6, gapY: 24, gapH: 18 },
      { x: 43, w: 3.6, gapY: 52, gapH: 18 },
      { x: 51, w: 3.6, gapY: 24, gapH: 18 },
      { x: 59, w: 3.6, gapY: 52, gapH: 18 },
      { x: 67, w: 3.6, gapY: 24, gapH: 18 },
      { x: 75, w: 3.6, gapY: 52, gapH: 18 },
      { x: 83, w: 3.6, gapY: 24, gapH: 18 },
    ],
  },
];

function getCurrentLevel() {
  return MAZE_LEVELS[currentLevelIndex];
}

function getCurrentLevelWalls() {
  const walls = [];
  getCurrentLevel().bars.forEach((bar) => {
    const topH = bar.gapY;
    const bottomY = bar.gapY + bar.gapH;
    const bottomH = Math.max(100 - bottomY, 0);

    if (topH > 0) {
      walls.push({ x: bar.x, y: 0, w: bar.w, h: topH });
    }

    if (bottomH > 0) {
      walls.push({ x: bar.x, y: bottomY, w: bar.w, h: bottomH });
    }
  });
  return walls;
}

function updateLevelBadge() {
  if (mazeLevelBadge) {
    mazeLevelBadge.textContent = `Level ${currentLevelIndex + 1}/${MAZE_LEVELS.length}`;
  }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function playSound(audioEl) {
  if (!audioEl) {
    return;
  }

  try {
    audioEl.currentTime = 0;
    const result = audioEl.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {
        // Ignore autoplay-related rejections.
      });
    }
  } catch {
    // Ignore playback errors and keep interaction running.
  }
}

function primeAudio() {
  if (audioPrimed) {
    return;
  }

  audioPrimed = true;
  [mazeStartAudio, mazeHitAudio, mazeFinishAudio].forEach((audioEl) => {
    if (!audioEl) {
      return;
    }

    try {
      audioEl.muted = true;
      const result = audioEl.play();

      if (result && typeof result.then === "function") {
        result
          .then(() => {
            audioEl.pause();
            audioEl.currentTime = 0;
            audioEl.muted = false;
          })
          .catch(() => {
            audioEl.muted = false;
          });
      } else {
        audioEl.pause();
        audioEl.currentTime = 0;
        audioEl.muted = false;
      }
    } catch {
      audioEl.muted = false;
    }
  });
}

function percentRectToPx(rect, bounds) {
  return {
    x: (rect.x / 100) * bounds.width,
    y: (rect.y / 100) * bounds.height,
    w: (rect.w / 100) * bounds.width,
    h: (rect.h / 100) * bounds.height,
  };
}

function buildMazeWalls() {
  const existing = mazeBoard.querySelectorAll(".maze-wall");
  existing.forEach((node) => node.remove());

  getCurrentLevelWalls().forEach((wall) => {
    const node = document.createElement("div");
    node.className = "maze-wall";
    node.style.left = `${wall.x}%`;
    node.style.top = `${wall.y}%`;
    node.style.width = `${wall.w}%`;
    node.style.height = `${wall.h}%`;
    mazeBoard.appendChild(node);
  });
}

function getBlockRectPx(blockEl) {
  const boardRect = mazeBoard.getBoundingClientRect();
  const rect = blockEl.getBoundingClientRect();
  return {
    x: rect.left - boardRect.left,
    y: rect.top - boardRect.top,
    w: rect.width,
    h: rect.height,
  };
}

function setMazeTokenPosition(x, y) {
  mazeToken.style.left = `${x}px`;
  mazeToken.style.top = `${y}px`;
}

function setMazeStatus(text) {
  mazeStatus.textContent = text;
}

function startMaze() {
  const startRect = getBlockRectPx(mazeStart);
  const x = startRect.x + startRect.w / 2;
  const y = startRect.y + startRect.h / 2;
  mazeActive = true;
  mazeCompleted = false;
  hitCount = 0;
  collisionLock = false;
  mazeStart.classList.add("is-lit");
  mazeFinish.classList.remove("is-lit");
  mazeToken.classList.add("active");
  setMazeTokenPosition(x, y);
  setMazeStatus(`${getCurrentLevel().name} started. Hits: 0/3. Reach FINISH.`);
  playSound(mazeStartAudio);
}

function stopMaze(message) {
  mazeActive = false;
  mazeToken.classList.remove("active");
  setMazeStatus(message);
}

function resetMazeAfterThreeHits() {
  mazeActive = false;
  mazeCompleted = false;
  hitCount = 0;
  collisionLock = false;
  mazeStart.classList.remove("is-lit");
  mazeFinish.classList.remove("is-lit");
  mazeToken.classList.remove("active");
  setMazeStatus(`${getCurrentLevel().name}: 3 hits. Click START to retry level.`);
}

function finishMaze() {
  const finishedLevel = getCurrentLevel().name;
  const finishedHits = hitCount;
  mazeActive = false;
  mazeStart.classList.remove("is-lit");
  mazeFinish.classList.add("is-lit");
  playSound(mazeFinishAudio);

  if (currentLevelIndex < MAZE_LEVELS.length - 1) {
    currentLevelIndex += 1;
    updateLevelBadge();
    buildMazeWalls();
    mazeCompleted = false;
    setMazeStatus(`${finishedLevel} complete (${finishedHits} hit${finishedHits === 1 ? "" : "s"}). Click START for ${getCurrentLevel().name}.`);
    mazeFinish.classList.remove("is-lit");
    mazeToken.classList.remove("active");
    return;
  }

  mazeCompleted = true;
  updateLevelBadge();
  setMazeStatus(`All 6 levels complete. Final level hits: ${finishedHits}.`);
}

function circleHitsRect(cx, cy, radius, rect) {
  const nearestX = clamp(cx, rect.x, rect.x + rect.w);
  const nearestY = clamp(cy, rect.y, rect.y + rect.h);
  const dx = cx - nearestX;
  const dy = cy - nearestY;
  return dx * dx + dy * dy <= radius * radius;
}

function checkMazeCollision(x, y) {
  const boardRect = mazeBoard.getBoundingClientRect();
  const radius = 8;
  const wallsPx = getCurrentLevelWalls().map((wall) => percentRectToPx(wall, boardRect));
  return wallsPx.some((wall) => circleHitsRect(x, y, radius, wall));
}

function inRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

function updateMazeFromPointer(event) {
  const boardRect = mazeBoard.getBoundingClientRect();
  const rawX = event.clientX - boardRect.left;
  const rawY = event.clientY - boardRect.top;
  const isInsideBoard = rawX >= 0 && rawX <= boardRect.width && rawY >= 0 && rawY <= boardRect.height;

  if (!isInsideBoard) {
    collisionLock = false;
    return;
  }

  const x = clamp(rawX, 0, boardRect.width);
  const y = clamp(rawY, 0, boardRect.height);

  const startRect = getBlockRectPx(mazeStart);
  const finishRect = getBlockRectPx(mazeFinish);

  if (!mazeActive) {
    return;
  }

  setMazeTokenPosition(x, y);

  const colliding = checkMazeCollision(x, y);
  if (colliding && !collisionLock) {
    collisionLock = true;
    hitCount += 1;
    playSound(mazeHitAudio);
    mazeBoard.classList.add("hit-flash");
    setTimeout(() => mazeBoard.classList.remove("hit-flash"), 140);

    if (hitCount >= 3) {
      resetMazeAfterThreeHits();
      return;
    }

    setMazeStatus(`${getCurrentLevel().name} hit ${hitCount}/3. Keep going.`);
  } else if (!colliding) {
    collisionLock = false;
  }

  if (inRect(x, y, finishRect)) {
    finishMaze();
  }
}

function applyLeftPosition(x, y) {
  leftHand.style.left = `${(x / LAYOUT.scene.width) * 100}%`;
  leftHand.style.top = `${(y / LAYOUT.scene.height) * 100}%`;
}

function applyRightPosition(x, y) {
  rightHand.style.left = `${(x / LAYOUT.scene.width) * 100}%`;
  rightHand.style.top = `${(y / LAYOUT.scene.height) * 100}%`;
}

function getTrackpadArea() {
  const scale = LAYOUT.trackpadScale;
  const width = LAYOUT.scene.width * scale;
  const height = LAYOUT.scene.height * scale;
  return {
    x: (LAYOUT.scene.width - width) / 2,
    y: (LAYOUT.scene.height - height) / 2,
    width,
    height,
  };
}

function getRightHandRange() {
  const area = getTrackpadArea();
  return {
    // Looser lane with more upward travel while staying right of the left hand.
    minX: area.x + area.width * 0.20,
    maxX: area.x + area.width * 0.62,
    minY: area.y + area.height * 0.10,
    maxY: area.y + area.height * 0.80,
  };
}

function mapPointerToRightPosition(pointerX, pointerY) {
  const a = getTrackpadArea();
  const r = getRightHandRange();

  const nx = clamp((pointerX - a.x) / a.width, 0, 1);
  const ny = clamp((pointerY - a.y) / a.height, 0, 1);

  return {
    x: r.minX + nx * (r.maxX - r.minX),
    y: r.minY + ny * (r.maxY - r.minY),
  };
}

function pointerToViewportNormalized(event) {
  const width = Math.max(window.innerWidth || 0, 1);
  const height = Math.max(window.innerHeight || 0, 1);
  return {
    x: clamp(event.clientX / width, 0, 1),
    y: clamp(event.clientY / height, 0, 1),
  };
}

function updateRightFromPointer(event) {
  const p = pointerToViewportNormalized(event);
  const a = getTrackpadArea();
  const scenePos = {
    x: a.x + p.x * a.width,
    y: a.y + p.y * a.height,
  };
  const pos = mapPointerToRightPosition(scenePos.x, scenePos.y);
  applyRightPosition(pos.x, pos.y);
}

function setPressedState(pressed) {
  isPressed = pressed;
  leftHand.classList.toggle("pressed", pressed);
  scene.classList.toggle("is-pressed", pressed);
}

applyLeftPosition(LAYOUT.leftStart.x, LAYOUT.leftStart.y);
applyRightPosition(LAYOUT.rightStart.x, LAYOUT.rightStart.y);
updateLevelBadge();
buildMazeWalls();

document.addEventListener(
  "pointerdown",
  () => {
    primeAudio();
  },
  { once: true }
);

document.addEventListener(
  "keydown",
  () => {
    primeAudio();
  },
  { once: true }
);

document.addEventListener("pointermove", (event) => {
  updateRightFromPointer(event);
  updateMazeFromPointer(event);
});

document.addEventListener("pointerdown", (event) => {
  setPressedState(true);
  updateRightFromPointer(event);
});

document.addEventListener("pointerup", () => {
  setPressedState(false);
});

document.addEventListener("pointercancel", () => {
  setPressedState(false);
});

mazeStart.addEventListener("click", () => {
  primeAudio();
  startMaze();
});

mazeStart.addEventListener("pointerdown", () => {
  primeAudio();
});

mazeStart.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    primeAudio();
    startMaze();
  }
});

window.addEventListener("resize", () => {
  buildMazeWalls();
});
