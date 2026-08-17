(() => {
  "use strict";

  const SETTINGS_API_PATH = "/api/settings";

  const TEACHER_SESSION_KEY =
    "handsOnTrackpadTeacherSession";

  const FREEZE_FEATURE_KEY =
    "freezeScreenFeatureEnabled";

  const FREEZE_ARMED_KEY =
    "freezeScreenArmed";

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

      button.textContent =
        armed
          ? "🟢 Freeze Armed"
          : "🔴 Freeze Off";
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

  async function initializeFreezeScreen() {
    /*
     * Students never receive the teacher
     * control, even though they load this
     * same shared file.
     */
    if (!isTeacherSession()) {
      return;
    }

    let featureEnabled =
      parseEnabled(
        localStorage.getItem(
          FREEZE_FEATURE_KEY
        ),
        false
      );

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

        const sharedArmed =
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
      return;
    }

    createTeacherFreezeButton();
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
