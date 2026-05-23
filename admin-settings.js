const task1DurationInput = document.getElementById("task1Duration");
const task2ClicksInput = document.getElementById("task2Clicks");
const task3DragSecondsInput = document.getElementById("task3DragSeconds");
const trainingPausedToggle = document.getElementById("trainingPausedToggle");
const saveTask1Btn = document.getElementById("saveTask1Btn");
const task1SavedMessage = document.getElementById("task1SavedMessage");

const TASK1_STORAGE_KEY = "trackpadTask1RequiredSeconds";
const TASK2_STORAGE_KEY = "trackpadTask2RequiredClicks";
const TASK3_STORAGE_KEY = "trackpadTask3RequiredDragSeconds";
const TRAINING_PAUSED_KEY = "trackpadTrainingPaused";
const DEFAULT_TASK1_SECONDS = 8;
const DEFAULT_TASK2_CLICKS = 10;
const DEFAULT_TASK3_DRAG_SECONDS = 6;
const SETTINGS_API_PATH = "/api/settings";

function parseTask1Seconds(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TASK1_SECONDS;
  }

  return Math.min(120, Math.max(1, parsed));
}

function parseTask2Clicks(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TASK2_CLICKS;
  }

  return Math.min(200, Math.max(1, parsed));
}

function parseTask3Seconds(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_TASK3_DRAG_SECONDS;
  }

  return Math.min(120, Math.max(1, parsed));
}

function parseTrainingPaused(value) {
  if (typeof value === "boolean") {
    return value;
  }

  return String(value) === "true";
}

function showSavedMessage(text) {
  task1SavedMessage.textContent = text;
  task1SavedMessage.hidden = false;

  window.clearTimeout(showSavedMessage.hideTimer);
  showSavedMessage.hideTimer = window.setTimeout(() => {
    task1SavedMessage.hidden = true;
  }, 1700);
}

async function loadTask1Settings() {
  let task1Seconds = parseTask1Seconds(localStorage.getItem(TASK1_STORAGE_KEY));
  let task2Clicks = parseTask2Clicks(localStorage.getItem(TASK2_STORAGE_KEY));
  let task3Seconds = parseTask3Seconds(localStorage.getItem(TASK3_STORAGE_KEY));
  let trainingPaused = parseTrainingPaused(localStorage.getItem(TRAINING_PAUSED_KEY));

  try {
    const response = await fetch(SETTINGS_API_PATH, { cache: "no-store" });
    if (response.ok) {
      const data = await response.json();
      task1Seconds = parseTask1Seconds(data.task1RequiredSeconds);
      task2Clicks = parseTask2Clicks(data.task2RequiredClicks);
      task3Seconds = parseTask3Seconds(data.task3RequiredDragSeconds);
      trainingPaused = parseTrainingPaused(data.trainingPaused);
      localStorage.setItem(TASK1_STORAGE_KEY, String(task1Seconds));
      localStorage.setItem(TASK2_STORAGE_KEY, String(task2Clicks));
      localStorage.setItem(TASK3_STORAGE_KEY, String(task3Seconds));
      localStorage.setItem(TRAINING_PAUSED_KEY, String(trainingPaused));
    }
  } catch {
    // Keep local fallback when API is unavailable.
  }

  task1DurationInput.value = String(task1Seconds);
  task2ClicksInput.value = String(task2Clicks);
  task3DragSecondsInput.value = String(task3Seconds);
  trainingPausedToggle.checked = trainingPaused;
}

async function saveTask1Settings() {
  const safeTask1Seconds = parseTask1Seconds(task1DurationInput.value);
  const safeTask2Clicks = parseTask2Clicks(task2ClicksInput.value);
  const safeTask3Seconds = parseTask3Seconds(task3DragSecondsInput.value);
  const trainingPaused = Boolean(trainingPausedToggle.checked);
  task1DurationInput.value = String(safeTask1Seconds);
  task2ClicksInput.value = String(safeTask2Clicks);
  task3DragSecondsInput.value = String(safeTask3Seconds);
  localStorage.setItem(TASK1_STORAGE_KEY, String(safeTask1Seconds));
  localStorage.setItem(TASK2_STORAGE_KEY, String(safeTask2Clicks));
  localStorage.setItem(TASK3_STORAGE_KEY, String(safeTask3Seconds));
  localStorage.setItem(TRAINING_PAUSED_KEY, String(trainingPaused));

  try {
    const response = await fetch(SETTINGS_API_PATH, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task1RequiredSeconds: safeTask1Seconds,
        task2RequiredClicks: safeTask2Clicks,
        task3RequiredDragSeconds: safeTask3Seconds,
        trainingPaused,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save shared settings.");
    }

    showSavedMessage("Task settings saved for all devices.");
  } catch {
    showSavedMessage("Saved on this device only (server unavailable).");
  }
}

loadTask1Settings();
saveTask1Btn.addEventListener("click", saveTask1Settings);

[task1DurationInput, task2ClicksInput, task3DragSecondsInput].forEach((inputEl) => {
  inputEl.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveTask1Settings();
    }
  });
});
