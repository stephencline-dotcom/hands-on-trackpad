(() => {
  "use strict";

  const SETTINGS_API_PATH = "/api/settings";

  const TEACHER_SESSION_KEY =
    "handsOnTrackpadTeacherSession";

  const FREEZE_FEATURE_KEY =
    "freezeScreenFeatureEnabled";

  const FREEZE_ARMED_KEY =
    "freezeScreenArmed";

  const STUDENT_FREEZE_GRACE_MS = 650;

  let studentFreezeArmed = false;
  let studentLocked = false;
  let studentFreezeArmedAt = 0;
  let studentPollingStarted = false;

  function parseEnabled(
    value,
    fallback = false
  ) {
    if (typeof value === "boolean") {
      return value;
    }

    if (
      value === null ||
      typeof value === "undefined"
    ) {
      return fallback;
    }

    return String(value) === "true";
  }

  function isTeacherSession() {
    return (
      sessionStorage.getItem(
        TEACHER_SESSION_KEY
      ) === "true"
    );
  }

  function createTeacherFreezeButton() {
    if (
      document.getElementById(
        "teacherFreezeButton"
      )
    ) {
      return;
    }

    const button =
      document.createElement("button");

    button.id =
      "teacherFreezeButton";

    button.type =
      "button";

    button.className =
      "teacher-freeze-button";

    button.setAttribute(
      "aria-pressed",
      "false"
    );

    document.body.appendChild(
      button
    );

    function renderButton() {
      const armed =
        parseEnabled(
          sessionStorage.getItem(
            FREEZE_ARMED_KEY
          ),
          false
        );

      button.classList.toggle(
        "is-armed",
        armed
      );

      button.classList.toggle(
        "is-off",
        !armed
      );

      button.setAttribute(
        "aria-pressed",
        String(armed)
      );

      button.textContent = "";

      button.setAttribute(
        "aria-label",
        armed
          ? "Freeze screens armed"
          : "Freeze screens off"
      );

      button.title =
        armed
          ? "Freeze screens armed"
          : "Freeze screens off";
    }

    button.addEventListener(
      "click",
      async () => {
        const currentlyArmed =
          parseEnabled(
            sessionStorage.getItem(
              FREEZE_ARMED_KEY
            ),
            false
          );

        const nextArmed =
          !currentlyArmed;

        sessionStorage.setItem(
          FREEZE_ARMED_KEY,
          String(nextArmed)
        );

        renderButton();

        try {
          const response =
            await fetch(
              SETTINGS_API_PATH,
              {
                method: "PUT",
                headers: {
                  "Content-Type":
                    "application/json",
                },
                body: JSON.stringify({
                  freezeScreenArmed:
                    nextArmed,
                }),
              }
            );

          if (!response.ok) {
            throw new Error(
              "Freeze state save failed"
            );
          }
        } catch {
          sessionStorage.setItem(
            FREEZE_ARMED_KEY,
            String(currentlyArmed)
          );

          renderButton();
        }
      }
    );

    renderButton();
  }

  function createStudentFreezeOverlay() {
    let overlay =
      document.getElementById(
        "studentFreezeOverlay"
      );

    if (overlay) {
      return overlay;
    }

    overlay =
      document.createElement("div");

    overlay.id =
      "studentFreezeOverlay";

    overlay.className =
      "student-freeze-overlay";

    overlay.hidden = true;

    overlay.innerHTML = `
      <div class="student-freeze-message">
        <div class="student-freeze-eyes">
          👀
        </div>

        <h2>EYES UP FRONT</h2>

        <p>
          Hands off your trackpad.
        </p>
      </div>
    `;

    document.body.appendChild(
      overlay
    );

    return overlay;
  }

  function lockStudentScreen() {
    if (studentLocked) {
      return;
    }

    studentLocked = true;

    const overlay =
      createStudentFreezeOverlay();

    overlay.hidden = false;

    document.body.classList.add(
      "student-screen-frozen"
    );
  }

  function unlockStudentScreen() {
    studentLocked = false;

    const overlay =
      document.getElementById(
        "studentFreezeOverlay"
      );

    if (overlay) {
      overlay.hidden = true;
    }

    document.body.classList.remove(
      "student-screen-frozen"
    );
  }

  function applyStudentFreezeState(
    armed
  ) {
    const nextArmed =
      Boolean(armed);

    if (
      nextArmed &&
      !studentFreezeArmed
    ) {
      studentFreezeArmedAt =
        performance.now();
    }

    studentFreezeArmed =
      nextArmed;

    if (!studentFreezeArmed) {
      unlockStudentScreen();
    }
  }

  function handleStudentTrackpadActivity(
    event
  ) {
    if (
      !studentFreezeArmed ||
      studentLocked
    ) {
      return;
    }

    /*
     * Ignore direct touchscreen pointer
     * events. Trackpad/mouse input reports
     * as pointerType "mouse".
     */
    if (
      event.pointerType &&
      event.pointerType === "touch"
    ) {
      return;
    }

    if (
      performance.now() -
        studentFreezeArmedAt <
      STUDENT_FREEZE_GRACE_MS
    ) {
      return;
    }

    lockStudentScreen();
  }

  async function pollStudentFreezeState() {
    try {
      const response =
        await fetch(
          SETTINGS_API_PATH,
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        return;
      }

      const settings =
        await response.json();

      const featureEnabled =
        parseEnabled(
          settings[
            FREEZE_FEATURE_KEY
          ],
          false
        );

      if (!featureEnabled) {
        applyStudentFreezeState(
          false
        );

        return;
      }

      applyStudentFreezeState(
        parseEnabled(
          settings.freezeScreenArmed,
          false
        )
      );
    } catch {
      /*
       * Keep the student's current state
       * if the server is temporarily
       * unavailable.
       */
    }
  }

  function startStudentFreezeSystem(
    initialArmed
  ) {
    if (studentPollingStarted) {
      return;
    }

    studentPollingStarted = true;

    createStudentFreezeOverlay();

    applyStudentFreezeState(
      initialArmed
    );

    document.addEventListener(
      "pointermove",
      handleStudentTrackpadActivity,
      true
    );

    document.addEventListener(
      "pointerdown",
      handleStudentTrackpadActivity,
      true
    );

    window.setInterval(
      pollStudentFreezeState,
      100
    );
  }

  async function initializeFreezeScreen() {
    const teacherSession =
      isTeacherSession();

    let featureEnabled =
      parseEnabled(
        localStorage.getItem(
          FREEZE_FEATURE_KEY
        ),
        false
      );

    let sharedArmed = false;

    try {
      const response =
        await fetch(
          SETTINGS_API_PATH,
          {
            cache: "no-store",
          }
        );

      if (response.ok) {
        const settings =
          await response.json();

        featureEnabled =
          parseEnabled(
            settings[
              FREEZE_FEATURE_KEY
            ],
            featureEnabled
          );

        sharedArmed =
          parseEnabled(
            settings.freezeScreenArmed,
            false
          );

        sessionStorage.setItem(
          FREEZE_ARMED_KEY,
          String(sharedArmed)
        );

        localStorage.setItem(
          FREEZE_FEATURE_KEY,
          String(featureEnabled)
        );
      }
    } catch {
      /*
       * Fall back to the most recently
       * cached setting if the API is
       * temporarily unavailable.
       */
    }

    if (!featureEnabled) {
      if (!teacherSession) {
        unlockStudentScreen();
      }

      return;
    }

    if (teacherSession) {
      createTeacherFreezeButton();
      return;
    }

    startStudentFreezeSystem(
      sharedArmed
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initializeFreezeScreen,
      { once: true }
    );
  } else {
    initializeFreezeScreen();
  }
})();
