const scene = document.getElementById("scene");
const leftHand = document.getElementById("leftHand");
const rightHand = document.getElementById("rightHand");
const bunnyEars = document.getElementById("bunnyEars");
const bunnyRain = document.getElementById("bunnyRain");
const trackpad = scene.querySelector(".trackpad");
const pageBody = document.body;
const clickHoldAudio = document.getElementById("clickHoldAudio");
const slideAndClickAudio = document.getElementById("slideAndClickAudio");
const justSlideAudio = document.getElementById("justSlideAudio");
const bunnyEarsAudio = document.getElementById("bunnyEarsAudio");
const audioUnlockZone = document.getElementById("audioUnlockZone");
const task1Timer = document.getElementById("task1Timer");
const task1TimerFill = document.getElementById("task1TimerFill");
const task1TimerTime = document.getElementById("task1TimerTime");
const activeTaskPrompt = document.getElementById("activeTaskPrompt");
const task2Counter = document.getElementById("task2Counter");
const task2CounterValue = document.getElementById("task2CounterValue");
const task2CounterFill = document.getElementById("task2CounterFill");
const task3Timer = document.getElementById("task3Timer");
const task3TimerFill = document.getElementById("task3TimerFill");
const task3TimerTime = document.getElementById("task3TimerTime");
const task3Present = document.getElementById("task3Present");
const task1SuccessPopup = document.getElementById("task1SuccessPopup");
const task1BalloonLayer = document.getElementById("task1BalloonLayer");
const trainingPausedOverlay = document.getElementById("trainingPausedOverlay");
let audioUnlocked = false;
let audioUnlockInFlight = false;
// Teacher setting that switches between hover-follow and click-and-drag movement.
const FULLSCREEN_REQUIRE_CLICK_AND_DRAG_KEY = "fullscreenRequireClickAndDrag";
const movementGate = window.trackpadMovementSettings.createClickAndDragGate(FULLSCREEN_REQUIRE_CLICK_AND_DRAG_KEY);

const TASK1_STORAGE_KEY = "trackpadTask1RequiredSeconds";
const TASK2_STORAGE_KEY = "trackpadTask2RequiredClicks";
const TASK3_STORAGE_KEY = "trackpadTask3RequiredDragSeconds";
const TASK1_ENABLED_KEY = "trackpadTask1Enabled";
const TASK2_ENABLED_KEY = "trackpadTask2Enabled";
const TASK3_ENABLED_KEY = "trackpadTask3Enabled";
const TRAINING_PAUSED_KEY = "trackpadTrainingPaused";
const TASK1_DEFAULT_SECONDS = 8;
const TASK2_DEFAULT_CLICKS = 10;
const TASK3_DEFAULT_SECONDS = 6;
const SETTINGS_API_PATH = "/api/settings";
const TAP_MAX_DURATION_MS = 320;
const TAP_MAX_MOVE_PX = 8;
const TASK3_STILL_RESET_MS = 170;
const TASK3_MOVE_THRESHOLD_PX = 1.4;

const LAYOUT = {
  scene: { width: 626, height: 437 },
  trackpadScale: 0.84,
  leftStart: { x: -34, y: 178 },
  rightStart: { x: 230, y: 158 },
  bunnyX: 312,
  bunnyStartY: 218,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
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
    minX: area.x + area.width * 0.2,
    maxX: area.x + area.width * 0.62,
    minY: area.y + area.height * 0.1,
    maxY: area.y + area.height * 0.8,
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

function mapPointerToRightPosition(pointerX, pointerY) {
  const area = getTrackpadArea();
  const range = getRightHandRange();

  const nx = clamp((pointerX - area.x) / area.width, 0, 1);
  const ny = clamp((pointerY - area.y) / area.height, 0, 1);

  return {
    x: range.minX + nx * (range.maxX - range.minX),
    y: range.minY + ny * (range.maxY - range.minY),
  };
}

function updateRightFromPointer(event) {
  const normalized = pointerToViewportNormalized(event);
  const area = getTrackpadArea();
  const scenePos = {
    x: area.x + normalized.x * area.width,
    y: area.y + normalized.y * area.height,
  };
  const pos = mapPointerToRightPosition(scenePos.x, scenePos.y);
  applyRightPosition(pos.x, pos.y);
}

function applyBunnyPosition(y) {
  if (!bunnyEars) {
    return;
  }

  bunnyEars.style.left = `${(LAYOUT.bunnyX / LAYOUT.scene.width) * 100}%`;
  bunnyEars.style.top = `${(y / LAYOUT.scene.height) * 100}%`;
}

function getBunnyRange() {
  const area = getTrackpadArea();
  return {
    minY: area.y + area.height * 0.14,
    maxY: area.y + area.height * 0.84,
  };
}

function setPressedState(pressed) {
  leftHand.classList.toggle("pressed", pressed);
  scene.classList.toggle("is-pressed", pressed);
}

function playHoldAudio() {
  if (trainingPaused) {
    return;
  }

  if (!clickHoldAudio) {
    return;
  }

  try {
    clickHoldAudio.muted = false;
    clickHoldAudio.currentTime = 0;
    const result = clickHoldAudio.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {
        // Ignore playback rejections and keep interaction responsive.
      });
    }
  } catch {
    // Ignore playback errors and keep interaction responsive.
  }
}

function stopHoldAudio() {
  if (!clickHoldAudio) {
    return;
  }

  try {
    clickHoldAudio.pause();
    clickHoldAudio.currentTime = 0;
  } catch {
    // Ignore playback errors and keep interaction responsive.
  }
}

function playSlideAudio() {
  if (trainingPaused) {
    return;
  }

  if (!slideAndClickAudio) {
    return;
  }

  try {
    slideAndClickAudio.muted = false;
    stopHoldAudio();
    slideAndClickAudio.currentTime = 0;
    const result = slideAndClickAudio.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
  } catch {}
}

function stopSlideAudio() {
  if (!slideAndClickAudio) {
    return;
  }

  try {
    slideAndClickAudio.pause();
    slideAndClickAudio.currentTime = 0;
  } catch {}
}

function playJustSlideAudio() {
  if (trainingPaused) {
    return;
  }

  if (!justSlideAudio) {
    return;
  }

  try {
    justSlideAudio.muted = false;
    justSlideAudio.currentTime = 0;
    const result = justSlideAudio.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
  } catch {}
}

function stopJustSlideAudio() {
  if (!justSlideAudio) {
    return;
  }

  try {
    justSlideAudio.pause();
    justSlideAudio.currentTime = 0;
  } catch {}
}

function playBunnyEarsAudio() {
  if (trainingPaused) {
    return;
  }

  if (!bunnyEarsAudio) {
    return;
  }

  try {
    bunnyEarsAudio.muted = false;
    bunnyEarsAudio.currentTime = 0;
    const result = bunnyEarsAudio.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
  } catch {}
}

function stopBunnyEarsAudio() {
  if (!bunnyEarsAudio) {
    return;
  }

  try {
    bunnyEarsAudio.pause();
    bunnyEarsAudio.currentTime = 0;
  } catch {}
}

function unlockAudioFromGesture() {
  if (trainingPaused) {
    return;
  }

  if (audioUnlocked || audioUnlockInFlight) {
    return;
  }

  const audioNodes = [clickHoldAudio, slideAndClickAudio, justSlideAudio, bunnyEarsAudio].filter(Boolean);
  if (!audioNodes.length) {
    audioUnlocked = true;
    return;
  }

  audioUnlockInFlight = true;
  let unlockedCount = 0;

  audioNodes.forEach((audioEl) => {
    try {
      audioEl.muted = true;
      audioEl.currentTime = 0;
      const result = audioEl.play();

      if (result && typeof result.then === "function") {
        result
          .then(() => {
            audioEl.pause();
            audioEl.currentTime = 0;
            audioEl.muted = false;
            unlockedCount += 1;
            if (unlockedCount === audioNodes.length) {
              audioUnlocked = true;
              audioUnlockInFlight = false;
              pageBody.classList.add("audio-enabled");
            }
          })
          .catch(() => {
            audioEl.muted = false;
            audioUnlockInFlight = false;
          });
      } else {
        audioEl.pause();
        audioEl.currentTime = 0;
        audioEl.muted = false;
        unlockedCount += 1;
        if (unlockedCount === audioNodes.length) {
          audioUnlocked = true;
          audioUnlockInFlight = false;
          pageBody.classList.add("audio-enabled");
        }
      }
    } catch {
      audioEl.muted = false;
      audioUnlockInFlight = false;
    }
  });
}

let holdingTrackpad = false;
let holdFlashTimer = null;
let isSliding = false;
let lastPressX = 0;
let lastPressY = 0;
let lastMoveX = 0;
let lastMoveY = 0;
let lastSlideStopX = 0;
let lastSlideStopY = 0;
let slideStopTimeoutId = null;
let isJustSliding = false;
let justSlideStopTimeoutId = null;
let lastHoverX = 0;
let lastHoverY = 0;
let hasHoverPosition = false;
let twoFingerScrollActive = false;
let twoFingerScrollTimeoutId = null;
let bunnyY = LAYOUT.bunnyStartY;
let task1RequiredMs = TASK1_DEFAULT_SECONDS * 1000;
let task1SlideStartAt = 0;
let task1Tracking = false;
let task1SuccessShown = false;
let task1Enabled = true;
let task2RequiredClicks = TASK2_DEFAULT_CLICKS;
let task2ClickCount = 0;
let task2SuccessShown = false;
let task2Enabled = true;
let task3RequiredMs = TASK3_DEFAULT_SECONDS * 1000;
let task3DragElapsedMs = 0;
let task3Dragging = false;
let task3Moving = false;
let task3MoveStartAt = 0;
let task3LastPointerX = 0;
let task3LastPointerY = 0;
let task3StillTimeoutId = null;
let task3SuccessShown = false;
let task3Enabled = true;
let task3PresentX = LAYOUT.scene.width * 0.28;
let task3PresentY = LAYOUT.scene.height * 0.54;
let task1SuccessHideTimeoutId = null;
let pressStartedAt = 0;
let trainingPaused = false;

function parseTask1Seconds(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return TASK1_DEFAULT_SECONDS;
  }

  return Math.min(120, Math.max(1, parsed));
}

function parseTask2Clicks(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return TASK2_DEFAULT_CLICKS;
  }

  return Math.min(200, Math.max(1, parsed));
}

function parseTask3Seconds(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return TASK3_DEFAULT_SECONDS;
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

function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);

  if (soundEnabled) {
    return;
  }

  stopHoldAudio();
  stopSlideAudio();
  stopJustSlideAudio();
  stopBunnyEarsAudio();
}

function getActiveTaskNumber() {
  if (task1Enabled && !task1SuccessShown) {
    return 1;
  }
  if (task2Enabled && !task2SuccessShown) {
    return 2;
  }
  if (task3Enabled && !task3SuccessShown) {
    return 3;
  }

  return null;
}

function isTaskActive(taskNumber) {
  return getActiveTaskNumber() === taskNumber;
}

function updateActiveTaskPrompt() {
  if (!activeTaskPrompt) {
    return;
  }

  if (trainingPaused) {
    activeTaskPrompt.textContent = "Training is paused";
    return;
  }

  if (twoFingerScrollActive) {
    activeTaskPrompt.textContent = "Bunny Ears: scroll with two fingers";
    return;
  }

  const activeTask = getActiveTaskNumber();
  if (activeTask === 1) {
    activeTaskPrompt.textContent = "Task 1: Slide";
    return;
  }
  if (activeTask === 2) {
    activeTaskPrompt.textContent = "Task 2: Click";
    return;
  }
  if (activeTask === 3) {
    activeTaskPrompt.textContent = "Task 3: Press and hold (drag the present)";
    return;
  }

  activeTaskPrompt.textContent = "All enabled tasks complete";
}

function applyTaskFlowState() {
  const activeTask = getActiveTaskNumber();

  if (activeTask !== 1) {
    stopTask1Tracking(true);
  }

  if (activeTask !== 2 && !task2SuccessShown) {
    resetTask2Attempt();
  }

  if (activeTask !== 3 && !task3SuccessShown) {
    finishTask3Drag(false);
    resetTask3Attempt(true);
  }

  if (task3Present) {
    task3Present.hidden = activeTask !== 3 || trainingPaused;
  }

  updateActiveTaskPrompt();
}

async function loadTaskRequirements() {
  let seconds = parseTask1Seconds(localStorage.getItem(TASK1_STORAGE_KEY));
  let task1IsEnabled = parseTaskEnabled(localStorage.getItem(TASK1_ENABLED_KEY), true);
  let clicks = parseTask2Clicks(localStorage.getItem(TASK2_STORAGE_KEY));
  let task2IsEnabled = parseTaskEnabled(localStorage.getItem(TASK2_ENABLED_KEY), true);
  let dragSeconds = parseTask3Seconds(localStorage.getItem(TASK3_STORAGE_KEY));
  let task3IsEnabled = parseTaskEnabled(localStorage.getItem(TASK3_ENABLED_KEY), true);
  let isSoundEnabled = parseTaskEnabled(localStorage.getItem(SOUND_ENABLED_KEY), true);
  let paused = parseTrainingPaused(localStorage.getItem(TRAINING_PAUSED_KEY));

  try {
    const response = await fetch(SETTINGS_API_PATH, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      seconds = parseTask1Seconds(data.task1RequiredSeconds);
      task1IsEnabled = parseTaskEnabled(data.task1Enabled, true);
      clicks = parseTask2Clicks(data.task2RequiredClicks);
      task2IsEnabled = parseTaskEnabled(data.task2Enabled, true);
      dragSeconds = parseTask3Seconds(data.task3RequiredDragSeconds);
      task3IsEnabled = parseTaskEnabled(data.task3Enabled, true);
      const requireClickAndDrag = parseTaskEnabled(
        data.fullscreenRequireClickAndDrag,
        movementGate.isRequireClickAndDragEnabled(FULLSCREEN_REQUIRE_CLICK_AND_DRAG_KEY)
      );
      isSoundEnabled = parseTaskEnabled(data.soundEnabled, true);
      paused = parseTrainingPaused(data.trainingPaused);
      localStorage.setItem(TASK1_STORAGE_KEY, String(seconds));
      localStorage.setItem(TASK1_ENABLED_KEY, String(task1IsEnabled));
      localStorage.setItem(TASK2_STORAGE_KEY, String(clicks));
      localStorage.setItem(TASK2_ENABLED_KEY, String(task2IsEnabled));
      localStorage.setItem(TASK3_STORAGE_KEY, String(dragSeconds));
      localStorage.setItem(TASK3_ENABLED_KEY, String(task3IsEnabled));
      localStorage.setItem(FULLSCREEN_REQUIRE_CLICK_AND_DRAG_KEY, String(requireClickAndDrag));
      localStorage.setItem(SOUND_ENABLED_KEY, String(isSoundEnabled));
      localStorage.setItem(TRAINING_PAUSED_KEY, String(paused));
    }
  } catch {
    // Keep local fallback when API is unavailable.
  }

  task1RequiredMs = seconds * 1000;
  task1Enabled = task1IsEnabled;
  task2RequiredClicks = clicks;
  task2Enabled = task2IsEnabled;
  task3RequiredMs = dragSeconds * 1000;
  task3Enabled = task3IsEnabled;
  setSoundEnabled(isSoundEnabled);
  setTrainingPaused(paused);

  if (!task1Tracking && !task1SuccessShown) {
    if (task1TimerFill) {
      task1TimerFill.style.height = "0%";
    }
    if (task1TimerTime) {
      task1TimerTime.textContent = `${seconds.toFixed(1)}s`;
    }
  }

  if (!task2SuccessShown) {
    updateTask2CounterVisual();
    if (task2ClickCount === 0) {
      hideTask2Counter();
    }
  }

  if (!task3SuccessShown) {
    resetTask3Attempt(false);
  }

  applyTaskFlowState();
}

async function refreshSharedSettingsLive() {
  let seconds = parseTask1Seconds(localStorage.getItem(TASK1_STORAGE_KEY));
  let task1IsEnabled = parseTaskEnabled(localStorage.getItem(TASK1_ENABLED_KEY), true);
  let clicks = parseTask2Clicks(localStorage.getItem(TASK2_STORAGE_KEY));
  let task2IsEnabled = parseTaskEnabled(localStorage.getItem(TASK2_ENABLED_KEY), true);
  let dragSeconds = parseTask3Seconds(localStorage.getItem(TASK3_STORAGE_KEY));
  let task3IsEnabled = parseTaskEnabled(localStorage.getItem(TASK3_ENABLED_KEY), true);
  let isSoundEnabled = parseTaskEnabled(localStorage.getItem(SOUND_ENABLED_KEY), true);
  let paused = parseTrainingPaused(localStorage.getItem(TRAINING_PAUSED_KEY));

  try {
    const response = await fetch(SETTINGS_API_PATH, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      seconds = parseTask1Seconds(data.task1RequiredSeconds);
      task1IsEnabled = parseTaskEnabled(data.task1Enabled, true);
      clicks = parseTask2Clicks(data.task2RequiredClicks);
      task2IsEnabled = parseTaskEnabled(data.task2Enabled, true);
      dragSeconds = parseTask3Seconds(data.task3RequiredDragSeconds);
      task3IsEnabled = parseTaskEnabled(data.task3Enabled, true);
      const requireClickAndDrag = parseTaskEnabled(
        data.fullscreenRequireClickAndDrag,
        movementGate.isRequireClickAndDragEnabled(FULLSCREEN_REQUIRE_CLICK_AND_DRAG_KEY)
      );
      isSoundEnabled = parseTaskEnabled(data.soundEnabled, true);
      paused = parseTrainingPaused(data.trainingPaused);
      localStorage.setItem(TASK1_STORAGE_KEY, String(seconds));
      localStorage.setItem(TASK1_ENABLED_KEY, String(task1IsEnabled));
      localStorage.setItem(TASK2_STORAGE_KEY, String(clicks));
      localStorage.setItem(TASK2_ENABLED_KEY, String(task2IsEnabled));
      localStorage.setItem(TASK3_STORAGE_KEY, String(dragSeconds));
      localStorage.setItem(TASK3_ENABLED_KEY, String(task3IsEnabled));
      localStorage.setItem(FULLSCREEN_REQUIRE_CLICK_AND_DRAG_KEY, String(requireClickAndDrag));
      localStorage.setItem(SOUND_ENABLED_KEY, String(isSoundEnabled));
      localStorage.setItem(TRAINING_PAUSED_KEY, String(paused));
    }
  } catch {
    // Keep local fallback when API is unavailable.
  }

  task1RequiredMs = seconds * 1000;
  task1Enabled = task1IsEnabled;
  task2RequiredClicks = clicks;
  task2Enabled = task2IsEnabled;
  task3RequiredMs = dragSeconds * 1000;
  task3Enabled = task3IsEnabled;
  setSoundEnabled(isSoundEnabled);
  setTrainingPaused(paused);

  applyTaskFlowState();
}

function setTrainingPaused(paused) {
  trainingPaused = Boolean(paused);

  pageBody.classList.toggle("training-paused", trainingPaused);
  if (trainingPausedOverlay) {
    trainingPausedOverlay.hidden = !trainingPaused;
  }

  if (!trainingPaused) {
    applyTaskFlowState();
    return;
  }

  stopHoldAudio();
  stopSlideAudio();
  stopJustSlideAudio();
  stopBunnyEarsAudio();
  endTrackpadPress();
  setJustSlideVisualState(false);
  stopTask1Tracking(true);
  resetTask2Attempt();
  finishTask3Drag(false);
  resetTask3Attempt(true);
  pageBody.classList.remove("flash-tap", "flash-hold", "flash-slide", "flash-just-slide");

  if (task1SuccessPopup) {
    task1SuccessPopup.classList.remove("active");
  }
  if (task1BalloonLayer) {
    task1BalloonLayer.textContent = "";
  }

  clearTimeout(twoFingerScrollTimeoutId);
  if (twoFingerScrollActive) {
    exitTwoFingerScrollMode();
  }

  applyTaskFlowState();
}

function showTask1Timer() {
  if (!task1Timer) {
    return;
  }

  task1Timer.hidden = false;
  task1Timer.classList.add("active");
}

function hideTask1Timer() {
  if (!task1Timer) {
    return;
  }

  task1Timer.classList.remove("active");
  task1Timer.hidden = true;
}

function updateTask1Timer(now = performance.now()) {
  if (!isTaskActive(1)) {
    return;
  }

  if (!task1Tracking) {
    return;
  }

  const elapsed = now - task1SlideStartAt;
  const progress = clamp(elapsed / task1RequiredMs, 0, 1);
  const remaining = Math.max((task1RequiredMs - elapsed) / 1000, 0);

  if (task1TimerFill) {
    task1TimerFill.style.height = `${progress * 100}%`;
  }

  if (task1TimerTime) {
    task1TimerTime.textContent = `${remaining.toFixed(1)}s`;
  }

  if (!task1SuccessShown && elapsed >= task1RequiredMs) {
    task1SuccessShown = true;
    task1Tracking = false;
    hideTask1Timer();
    triggerSuccessCelebration();
    applyTaskFlowState();
  }
}

function startTask1Tracking() {
  if (!isTaskActive(1)) {
    return;
  }

  if (task1SuccessShown || task1Tracking) {
    return;
  }

  task1Tracking = true;
  task1SlideStartAt = performance.now();
  showTask1Timer();
  updateTask1Timer(task1SlideStartAt);
}

function stopTask1Tracking(reset = false) {
  task1Tracking = false;

  if (reset && !task1SuccessShown) {
    hideTask1Timer();
    if (task1TimerFill) {
      task1TimerFill.style.height = "0%";
    }
    if (task1TimerTime) {
      task1TimerTime.textContent = `${(task1RequiredMs / 1000).toFixed(1)}s`;
    }
  }
}

function showTask2Counter() {
  if (!task2Counter) {
    return;
  }

  task2Counter.hidden = false;
  task2Counter.classList.add("active");
}

function hideTask2Counter() {
  if (!task2Counter) {
    return;
  }

  task2Counter.classList.remove("active");
  task2Counter.hidden = true;
}

function updateTask2CounterVisual() {
  const progress = clamp(task2ClickCount / Math.max(task2RequiredClicks, 1), 0, 1);

  if (task2CounterValue) {
    task2CounterValue.textContent = `${task2ClickCount} / ${task2RequiredClicks}`;
  }

  if (task2CounterFill) {
    task2CounterFill.style.width = `${progress * 100}%`;
  }
}

function pointerToScenePosition(event) {
  const normalized = pointerToViewportNormalized(event);
  return {
    x: clamp(normalized.x * LAYOUT.scene.width, 0, LAYOUT.scene.width),
    y: clamp(normalized.y * LAYOUT.scene.height, 0, LAYOUT.scene.height),
  };
}

function pointerToSceneFromRect(event) {
  if (!scene) {
    return pointerToScenePosition(event);
  }

  const rect = scene.getBoundingClientRect();
  const width = Math.max(rect.width, 1);
  const height = Math.max(rect.height, 1);
  const localX = (event.clientX - rect.left) * (LAYOUT.scene.width / width);
  const localY = (event.clientY - rect.top) * (LAYOUT.scene.height / height);

  return {
    x: clamp(localX, 0, LAYOUT.scene.width),
    y: clamp(localY, 0, LAYOUT.scene.height),
  };
}

function applyTask3PresentPosition(x, y) {
  if (!task3Present) {
    return;
  }

  const paddingX = 42;
  const paddingY = 42;
  task3PresentX = clamp(x, paddingX, LAYOUT.scene.width - paddingX);
  task3PresentY = clamp(y, paddingY, LAYOUT.scene.height - paddingY);
  task3Present.style.left = `${(task3PresentX / LAYOUT.scene.width) * 100}%`;
  task3Present.style.top = `${(task3PresentY / LAYOUT.scene.height) * 100}%`;
}

function showTask3Timer() {
  if (!task3Timer) {
    return;
  }

  task3Timer.hidden = false;
  task3Timer.classList.add("active");
}

function hideTask3Timer() {
  if (!task3Timer) {
    return;
  }

  task3Timer.classList.remove("active");
  task3Timer.hidden = true;
}

function updateTask3TimerVisual() {
  const progress = clamp(task3DragElapsedMs / Math.max(task3RequiredMs, 1), 0, 1);
  const remaining = Math.max((task3RequiredMs - task3DragElapsedMs) / 1000, 0);

  if (task3TimerFill) {
    task3TimerFill.style.height = `${progress * 100}%`;
  }
  if (task3TimerTime) {
    task3TimerTime.textContent = `${remaining.toFixed(1)}s`;
  }
}

function resetTask3Attempt(hideTimer = true) {
  if (task3SuccessShown) {
    return;
  }

  task3DragElapsedMs = 0;
  task3Moving = false;
  task3MoveStartAt = 0;
  clearTimeout(task3StillTimeoutId);
  updateTask3TimerVisual();

  if (hideTimer) {
    hideTask3Timer();
  }
}

function finishTask3Drag(success) {
  if (!task3Dragging) {
    return;
  }

  task3Dragging = false;
  setPressedState(false);
  setSlideVisualState(false);
  stopSlideAudio();
  if (task3Present) {
    task3Present.classList.remove("dragging");
  }

  clearTimeout(task3StillTimeoutId);

  if (!success) {
    resetTask3Attempt(true);
  }
}

function registerTask3Movement(now) {
  if (task3SuccessShown || !task3Dragging) {
    return;
  }

  if (!task3Moving) {
    task3Moving = true;
    task3MoveStartAt = now;
    task3DragElapsedMs = 0;
  } else {
    task3DragElapsedMs = now - task3MoveStartAt;
  }

  updateTask3TimerVisual();
  if (task3DragElapsedMs >= task3RequiredMs) {
    task3SuccessShown = true;
    finishTask3Drag(true);
    hideTask3Timer();
    triggerSuccessCelebration();
    applyTaskFlowState();
    return;
  }

  clearTimeout(task3StillTimeoutId);
  task3StillTimeoutId = setTimeout(() => {
    if (task3Dragging && !task3SuccessShown) {
      task3Moving = false;
      task3MoveStartAt = 0;
      task3DragElapsedMs = 0;
      updateTask3TimerVisual();
    }
  }, TASK3_STILL_RESET_MS);
}

function beginTask3Drag(event) {
  if (trainingPaused || !isTaskActive(3) || task3SuccessShown || !task3Present) {
    return;
  }

  const point = pointerToSceneFromRect(event);
  applyTask3PresentPosition(point.x, point.y);
  task3Dragging = true;
  setPressedState(true);
  setSlideVisualState(true);
  playSlideAudio();
  task3Moving = false;
  task3MoveStartAt = 0;
  task3DragElapsedMs = 0;
  task3LastPointerX = point.x;
  task3LastPointerY = point.y;

  if (typeof task3Present.setPointerCapture === "function") {
    try {
      task3Present.setPointerCapture(event.pointerId);
    } catch {
      // Ignore capture failures and keep drag interaction running.
    }
  }

  showTask3Timer();
  updateTask3TimerVisual();
  task3Present.classList.add("dragging");
}

function handleTask3DragMove(event) {
  if (!task3Dragging || task3SuccessShown) {
    return;
  }

  const point = pointerToSceneFromRect(event);
  applyTask3PresentPosition(point.x, point.y);

  const dx = point.x - task3LastPointerX;
  const dy = point.y - task3LastPointerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  task3LastPointerX = point.x;
  task3LastPointerY = point.y;

  if (distance >= TASK3_MOVE_THRESHOLD_PX) {
    registerTask3Movement(performance.now());
  }
}

function resetTask2Attempt() {
  if (task2SuccessShown) {
    return;
  }

  task2ClickCount = 0;
  updateTask2CounterVisual();
  hideTask2Counter();
}

function registerTask2Click() {
  if (!isTaskActive(2)) {
    return;
  }

  if (task2SuccessShown) {
    return;
  }

  showTask2Counter();
  task2ClickCount += 1;
  updateTask2CounterVisual();

  if (task2ClickCount >= task2RequiredClicks) {
    task2SuccessShown = true;
    hideTask2Counter();
    triggerSuccessCelebration();
    applyTaskFlowState();
  }
}

function triggerSuccessCelebration() {
  if (trainingPaused) {
    return;
  }

  if (!task1SuccessPopup) {
    return;
  }

  task1SuccessPopup.classList.add("active");
  launchTask1Balloons();
  window.clearTimeout(task1SuccessHideTimeoutId);
  task1SuccessHideTimeoutId = window.setTimeout(() => {
    task1SuccessPopup.classList.remove("active");
  }, 1700);
}

function launchTask1Balloons() {
  if (!task1BalloonLayer) {
    return;
  }

  task1BalloonLayer.textContent = "";

  const balloonCount = 18;
  for (let i = 0; i < balloonCount; i += 1) {
    const balloon = document.createElement("span");
    balloon.className = "task1-balloon";
    balloon.style.setProperty("--x", `${4 + Math.random() * 92}%`);
    balloon.style.setProperty("--size", `${36 + Math.random() * 42}px`);
    balloon.style.setProperty("--hue", `${Math.floor(Math.random() * 360)}`);
    balloon.style.setProperty("--dur", `${2.8 + Math.random() * 1.9}s`);
    balloon.style.setProperty("--delay", `${Math.random() * 0.45}s`);
    balloon.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
    balloon.style.setProperty("--string", `${42 + Math.random() * 44}px`);
    balloon.addEventListener("animationend", () => {
      balloon.remove();
    });
    task1BalloonLayer.appendChild(balloon);
  }
}

function buildBunnyRain() {
  if (!bunnyRain || bunnyRain.childElementCount > 0) {
    return;
  }

  const dropCount = 18;
  for (let i = 0; i < dropCount; i += 1) {
    const drop = document.createElement("img");
    drop.className = "bunny-drop";
    drop.src = "images/bunny-drops.png";
    drop.alt = "";
    drop.setAttribute("aria-hidden", "true");
    drop.draggable = false;
    drop.style.setProperty("--x", `${Math.random() * 100}%`);
    drop.style.setProperty("--size", `${30 + Math.random() * 34}px`);
    drop.style.setProperty("--dur", `${2 + Math.random() * 2.2}s`);
    drop.style.setProperty("--delay", `${-Math.random() * 3.2}s`);
    drop.style.setProperty("--drift", `${-40 + Math.random() * 80}px`);
    bunnyRain.appendChild(drop);
  }
}

function triggerTapFlash() {
  pageBody.classList.remove("flash-tap");
  // Force reflow so rapid taps can retrigger the same animation.
  void pageBody.offsetWidth;
  pageBody.classList.add("flash-tap");
}

function setSlideVisualState(sliding) {
  if (sliding) {
    pageBody.classList.remove("flash-just-slide");
    pageBody.classList.remove("flash-hold");
    pageBody.classList.add("flash-slide");
    return;
  }

  pageBody.classList.remove("flash-slide");
  if (holdingTrackpad) {
    pageBody.classList.add("flash-hold");
  }
}

function setJustSlideVisualState(active) {
  if (active) {
    pageBody.classList.remove("flash-slide");
    pageBody.classList.remove("flash-hold");
    pageBody.classList.add("flash-just-slide");
    return;
  }

  pageBody.classList.remove("flash-just-slide");
}

function enterTwoFingerScrollMode() {
  if (twoFingerScrollActive) {
    return;
  }

  twoFingerScrollActive = true;
  setPressedState(false);
  leftHand.classList.add("is-hidden");
  rightHand.classList.add("is-hidden");
  if (bunnyEars) {
    bunnyEars.classList.add("active");
  }
  if (bunnyRain) {
    bunnyRain.classList.add("active");
  }
  playBunnyEarsAudio();
  updateActiveTaskPrompt();
}

function exitTwoFingerScrollMode() {
  twoFingerScrollActive = false;
  leftHand.classList.remove("is-hidden");
  rightHand.classList.remove("is-hidden");
  if (bunnyEars) {
    bunnyEars.classList.remove("active");
  }
  if (bunnyRain) {
    bunnyRain.classList.remove("active");
  }
  stopBunnyEarsAudio();
  updateActiveTaskPrompt();
}

function beginTrackpadPress(event) {
  if (trainingPaused) {
    return;
  }

  if (twoFingerScrollActive) {
    clearTimeout(twoFingerScrollTimeoutId);
    exitTwoFingerScrollMode();
  }

  stopJustSlideAudio();
  setJustSlideVisualState(false);
  stopTask1Tracking(true);
  isJustSliding = false;
  hasHoverPosition = false;
  clearTimeout(justSlideStopTimeoutId);

  holdingTrackpad = true;
  isSliding = false;
  lastPressX = event.clientX;
  lastPressY = event.clientY;
  lastMoveX = event.clientX;
  lastMoveY = event.clientY;
  lastSlideStopX = event.clientX;
  lastSlideStopY = event.clientY;
  pressStartedAt = performance.now();
  
  setPressedState(true);
  triggerTapFlash();
  playHoldAudio();

  clearTimeout(holdFlashTimer);
  clearTimeout(slideStopTimeoutId);
  
  holdFlashTimer = setTimeout(() => {
    if (holdingTrackpad && !isSliding) {
      pageBody.classList.add("flash-hold");
    }
  }, 140);
}

function endTrackpadPress() {
  holdingTrackpad = false;
  isSliding = false;
  setPressedState(false);
  clearTimeout(holdFlashTimer);
  clearTimeout(slideStopTimeoutId);
  slideStopTimeoutId = null;
  pageBody.classList.remove("flash-hold");
  pageBody.classList.remove("flash-slide");
  stopTask1Tracking(true);
  stopHoldAudio();
  stopSlideAudio();
}

loadTaskRequirements();
applyLeftPosition(LAYOUT.leftStart.x, LAYOUT.leftStart.y);
applyRightPosition(LAYOUT.rightStart.x, LAYOUT.rightStart.y);
applyBunnyPosition(bunnyY);
applyTask3PresentPosition(task3PresentX, task3PresentY);
buildBunnyRain();
if (task1TimerTime) {
  task1TimerTime.textContent = `${(task1RequiredMs / 1000).toFixed(1)}s`;
}
updateTask3TimerVisual();

window.setInterval(() => {
  if (!task1Tracking && !task1SuccessShown && !holdingTrackpad && task2ClickCount === 0 && !task2SuccessShown && !task3Dragging && !task3SuccessShown) {
    loadTaskRequirements();
  }
}, 5000);

window.setInterval(() => {
  refreshSharedSettingsLive();
}, 1200);

document.addEventListener("pointermove", (event) => {
  if (trainingPaused) {
    return;
  }

  if (task3Dragging) {
    updateRightFromPointer(event);
    handleTask3DragMove(event);
    return;
  }

  if (isTaskActive(1)) {
    updateTask1Timer();
  }
  if (movementGate.shouldMove(event)) {
    updateRightFromPointer(event);
  }
  
  if (!holdingTrackpad) {
    if (!hasHoverPosition) {
      lastHoverX = event.clientX;
      lastHoverY = event.clientY;
      hasHoverPosition = true;
      return;
    }

    const dxHover = event.clientX - lastHoverX;
    const dyHover = event.clientY - lastHoverY;
    const hoverDistance = Math.sqrt(dxHover * dxHover + dyHover * dyHover);
    lastHoverX = event.clientX;
    lastHoverY = event.clientY;

    if (hoverDistance > 1.5) {
      if (!isJustSliding) {
        isJustSliding = true;
        setJustSlideVisualState(true);
        startTask1Tracking();
        playJustSlideAudio();
        if (task2ClickCount > 0 && !task2SuccessShown) {
          resetTask2Attempt();
        }
      }

      clearTimeout(justSlideStopTimeoutId);
      justSlideStopTimeoutId = setTimeout(() => {
        if (!holdingTrackpad && isJustSliding) {
          isJustSliding = false;
          setJustSlideVisualState(false);
          stopTask1Tracking(true);
          stopJustSlideAudio();
        }
      }, 150);
    }

    return;
  }

  lastMoveX = event.clientX;
  lastMoveY = event.clientY;
  
  const dxFromPress = event.clientX - lastPressX;
  const dyFromPress = event.clientY - lastPressY;
  const distanceFromPress = Math.sqrt(dxFromPress * dxFromPress + dyFromPress * dyFromPress);

  if (!isSliding && distanceFromPress > 8) {
    isSliding = true;
    lastSlideStopX = event.clientX;
    lastSlideStopY = event.clientY;
    setSlideVisualState(true);
    startTask1Tracking();
    playSlideAudio();
    if (task2ClickCount > 0 && !task2SuccessShown) {
      resetTask2Attempt();
    }
  }

  if (isSliding) {
    clearTimeout(slideStopTimeoutId);
    slideStopTimeoutId = setTimeout(() => {
      if (holdingTrackpad && isSliding) {
        isSliding = false;
        lastSlideStopX = lastMoveX;
        lastSlideStopY = lastMoveY;
        setSlideVisualState(false);
        stopTask1Tracking(true);
        stopSlideAudio();
        playHoldAudio();
      }
    }, 150);
  } else if (!isSliding && lastSlideStopX !== 0) {
    const dxFromStop = event.clientX - lastSlideStopX;
    const dyFromStop = event.clientY - lastSlideStopY;
    const distanceFromStop = Math.sqrt(dxFromStop * dxFromStop + dyFromStop * dyFromStop);
    
    if (distanceFromStop > 8) {
      isSliding = true;
      lastSlideStopX = event.clientX;
      lastSlideStopY = event.clientY;
      setSlideVisualState(true);
      startTask1Tracking();
      playSlideAudio();
      if (task2ClickCount > 0 && !task2SuccessShown) {
        resetTask2Attempt();
      }
    }
  }
});

document.addEventListener(
  "wheel",
  (event) => {
    if (trainingPaused) {
      event.preventDefault();
      return;
    }

    unlockAudioFromGesture();
    event.preventDefault();

    if (holdingTrackpad) {
      endTrackpadPress();
    }

    if (task2ClickCount > 0 && !task2SuccessShown) {
      resetTask2Attempt();
    }

    enterTwoFingerScrollMode();

    const range = getBunnyRange();
    bunnyY = clamp(bunnyY + event.deltaY * 0.26, range.minY, range.maxY);
    applyBunnyPosition(bunnyY);

    clearTimeout(twoFingerScrollTimeoutId);
    twoFingerScrollTimeoutId = setTimeout(() => {
      exitTwoFingerScrollMode();
    }, 220);
  },
  { passive: false }
);

document.addEventListener("pointerdown", (event) => {
  if (trainingPaused) {
    return;
  }

  if (event.target === task3Present && !task3SuccessShown) {
    beginTask3Drag(event);
    return;
  }

  if (!isTaskActive(1) && !isTaskActive(2)) {
    return;
  }

  movementGate.begin(event);
  updateRightFromPointer(event);
  beginTrackpadPress(event);
});

if (audioUnlockZone) {
  audioUnlockZone.addEventListener("pointerdown", () => {
    if (trainingPaused) {
      return;
    }

    unlockAudioFromGesture();
  });

  audioUnlockZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (trainingPaused) {
        return;
      }
      unlockAudioFromGesture();
    }
  });
}

document.addEventListener("keydown", () => {
  if (trainingPaused) {
    return;
  }

  unlockAudioFromGesture();
});

document.addEventListener("pointerup", (event) => {
  if (trainingPaused) {
    return;
  }

  movementGate.end(event);

  if (task3Dragging) {
    finishTask3Drag(task3SuccessShown);
    return;
  }

  const wasHolding = holdingTrackpad;

  if (!wasHolding) {
    return;
  }

  if (!isTaskActive(1) && !isTaskActive(2)) {
    endTrackpadPress();
    return;
  }

  const elapsed = performance.now() - pressStartedAt;
  const dx = lastMoveX - lastPressX;
  const dy = lastMoveY - lastPressY;
  const moveDistance = Math.sqrt(dx * dx + dy * dy);
  const isValidTap = !isSliding && elapsed <= TAP_MAX_DURATION_MS && moveDistance <= TAP_MAX_MOVE_PX;

  if (isValidTap && isTaskActive(2)) {
    registerTask2Click();
  } else if (task2ClickCount > 0 && !task2SuccessShown) {
    resetTask2Attempt();
  }

  endTrackpadPress();
});

document.addEventListener("pointercancel", (event) => {
  if (trainingPaused) {
    return;
  }

  movementGate.end(event);

  if (task3Dragging) {
    finishTask3Drag(false);
  }

  endTrackpadPress();
  if (isJustSliding) {
    isJustSliding = false;
    setJustSlideVisualState(false);
    stopTask1Tracking(true);
    stopJustSlideAudio();
  }
  if (task2ClickCount > 0 && !task2SuccessShown) {
    resetTask2Attempt();
  }
});

window.addEventListener("resize", () => {
  const range = getBunnyRange();
  bunnyY = clamp(bunnyY, range.minY, range.maxY);
  applyBunnyPosition(bunnyY);
});

pageBody.addEventListener("animationend", (event) => {
  if (event.animationName === "rainbowTap") {
    pageBody.classList.remove("flash-tap");
  }
});
