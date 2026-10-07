(() => {
  "use strict";

  const LEVELS = {
    1: [
      { label: "STICK", icon: "stick" },
      { label: "DIG", icon: "dig" },
      { label: "CLAM", icon: "clam" },
      { label: "BASKET", icon: "basket" }
    ],

    2: [
      { label: "HELPER", icon: "helper" },
      { label: "FOOD", icon: "food" },
      { label: "DODGE", icon: "crab" },
      { label: "BASKET", icon: "basket" }
    ],

    3: [
      { label: "ITEM", icon: "item" },
      { label: "SLOW", icon: "slow" },
      { label: "WOBBLE", icon: "wobble" },
      { label: "PIT", icon: "pit" }
    ]
  };

  let instructionText = null;
  let missionLabel = null;
  let missionCopy = null;
  let directionBar = null;

  let lastLevel = 1;
  let lastActive = 0;
  let lastWatch = -1;

  function normalizedText(element) {
    return element && element.textContent
      ? element.textContent.trim().toLowerCase()
      : "";
  }

  function detectLevel() {
    const labelText = normalizedText(missionLabel);
    const instruction = normalizedText(instructionText);

    const explicitLevel =
      labelText.match(/\blevel\s*([1-4])\b/i);

    if (explicitLevel) {
      const level = Number(explicitLevel[1]);

      if (level >= 1 && level <= 4) {
        lastLevel = level;
        return level;
      }
    }

    if (
      /rockweed|hot stones|cooking pit|stone|wood|wobbl|spark|sequence/.test(
        instruction
      )
    ) {
      lastLevel = 3;
      return 3;
    }

    if (
      /wampanoag helper|helper|gathering basket|crab|gather food/.test(
        instruction
      )
    ) {
      lastLevel = 2;
      return 2;
    }

    if (
      /clam|digging stick|dig|sand patch|seagull/.test(
        instruction
      )
    ) {
      lastLevel = 1;
      return 1;
    }

    return lastLevel;
  }

  function levelOneState(text) {
    if (
      /all .*clams|all five|level complete|ready for.*next|great work.*clam/.test(
        text
      )
    ) {
      return {
        active: 4,
        complete: true,
        watch: -1
      };
    }

    if (
      /(grab|pick up|get|save).*clam/.test(text)
    ) {
      return {
        active: 2,
        complete: false,
        watch: 3
      };
    }

    if (
      /basket/.test(text) &&
      /clam|bring|drag|drop|put/.test(text)
    ) {
      return {
        active: 3,
        complete: false,
        watch: -1
      };
    }

    if (/clam/.test(text)) {
      return {
        active: 2,
        complete: false,
        watch: 3
      };
    }

    if (/dig|sand|patch/.test(text)) {
      return {
        active: 1,
        complete: false,
        watch: -1
      };
    }

    return {
      active: 0,
      complete: false,
      watch: -1
    };
  }

  function levelTwoState(text) {
    if (
      /food is gathered|round complete|delivered/.test(
        text
      )
    ) {
      return {
        active: 4,
        complete: true,
        watch: -1
      };
    }

    if (
      /crab caught|crab grabbed|took the food|try the round again|another one is coming/.test(
        text
      )
    ) {
      return {
        active: 0,
        complete: false,
        watch: 2
      };
    }

    if (
      /move the .*helper|move the wampanoag helper/.test(
        text
      )
    ) {
      return {
        active: 0,
        complete: false,
        watch: 2
      };
    }

    if (
      /get back|back to the .*basket|gathering basket/.test(
        text
      )
    ) {
      return {
        active: 3,
        complete: false,
        watch: 2
      };
    }

    if (
      /watch out for the crabs|without touching a crab|without touching .*crab/.test(
        text
      )
    ) {
      return {
        active: 2,
        complete: false,
        watch: -1
      };
    }

    if (
      /find the|get the|keep carrying/.test(text)
    ) {
      return {
        active: 1,
        complete: false,
        watch: 2
      };
    }

    return {
      active: 0,
      complete: false,
      watch: 2
    };
  }

  function levelThreeState(text) {
    if (
      /pit is covered|steam is rising|level complete/.test(
        text
      )
    ) {
      return {
        active: 4,
        complete: true,
        watch: -1
      };
    }

    if (
      /too wobbly|wobbly|watch.*wobble/.test(text)
    ) {
      return {
        active: 2,
        complete: false,
        watch: -1
      };
    }

    if (
      /spark made you drop|dropped the|does not come next|try that step again/.test(
        text
      )
    ) {
      return {
        active: 0,
        complete: false,
        watch: 2
      };
    }

    if (
      /you have the|move smoothly|slow.*smooth/.test(
        text
      )
    ) {
      return {
        active: 1,
        complete: false,
        watch: 2
      };
    }

    if (
      /release/.test(text) &&
      /pit/.test(text)
    ) {
      return {
        active: 3,
        complete: false,
        watch: 2
      };
    }

    return {
      active: 0,
      complete: false,
      watch: -1
    };
  }

  function getDirectionState(level) {
    const text = normalizedText(instructionText);

    if (level === 1) {
      return levelOneState(text);
    }

    if (level === 2) {
      return levelTwoState(text);
    }

    if (level === 3) {
      return levelThreeState(text);
    }

    return {
      active: 0,
      complete: false,
      watch: -1
    };
  }

  function buildBar(level) {
    if (!missionCopy || !instructionText) {
      return;
    }

    if (directionBar) {
      directionBar.remove();
    }

    directionBar =
      document.createElement("div");

    directionBar.className =
      "visual-directions";

    directionBar.setAttribute(
      "aria-label",
      `Level ${level} action directions`
    );

    LEVELS[level].forEach(
      (step, index) => {
        const stepElement =
          document.createElement("div");

        stepElement.className =
          "visual-direction-step";

        stepElement.dataset.step =
          String(index);

        const icon =
          document.createElement("span");

        icon.className =
          `visual-direction-icon visual-direction-icon--${step.icon}`;

        icon.setAttribute(
          "aria-hidden",
          "true"
        );

        const label =
          document.createElement("span");

        label.className =
          "visual-direction-label";

        label.textContent =
          step.label;

        const check =
          document.createElement("span");

        check.className =
          "visual-direction-check";

        check.setAttribute(
          "aria-hidden",
          "true"
        );

        stepElement.append(
          icon,
          label,
          check
        );

        directionBar.appendChild(
          stepElement
        );

        if (
          index <
          LEVELS[level].length - 1
        ) {
          const connector =
            document.createElement("span");

          connector.className =
            "visual-direction-connector";

          connector.setAttribute(
            "aria-hidden",
            "true"
          );

          directionBar.appendChild(
            connector
          );
        }
      }
    );

    missionCopy.classList.add(
      "has-visual-directions"
    );

    missionCopy.insertBefore(
      directionBar,
      instructionText
    );
  }

  function render() {
    if (
      !instructionText ||
      !missionCopy
    ) {
      return;
    }

    const level =
      detectLevel();

    if (
      level < 1 ||
      level > 3
    ) {
      if (directionBar) {
        directionBar.hidden = true;
      }

      missionCopy.classList.remove(
        "has-visual-directions"
      );

      return;
    }

    missionCopy.classList.add(
      "has-visual-directions"
    );

    if (
      !directionBar ||
      directionBar.dataset.level !==
        String(level)
    ) {
      buildBar(level);

      if (directionBar) {
        directionBar.dataset.level =
          String(level);
      }
    }

    if (!directionBar) {
      return;
    }

    directionBar.hidden = false;

    const state =
      getDirectionState(level);

    lastActive =
      state.active;

    lastWatch =
      state.watch;

    const steps =
      Array.from(
        directionBar.querySelectorAll(
          ".visual-direction-step"
        )
      );

    steps.forEach(
      (step, index) => {
        step.classList.remove(
          "is-done",
          "is-active",
          "is-upcoming",
          "is-watch"
        );

        if (
          state.complete ||
          index < state.active
        ) {
          step.classList.add(
            "is-done"
          );
        }
        else if (
          index === state.active
        ) {
          step.classList.add(
            "is-active"
          );
        }
        else {
          step.classList.add(
            "is-upcoming"
          );
        }

        if (
          !state.complete &&
          index === state.watch &&
          index !== state.active
        ) {
          step.classList.add(
            "is-watch"
          );
        }
      }
    );
  }

  function initialize() {
    instructionText =
      document.getElementById(
        "instructionText"
      );

    missionLabel =
      document.querySelector(
        ".mission-label"
      );

    missionCopy =
      document.querySelector(
        ".mission-copy"
      );

    if (
      !instructionText ||
      !missionCopy
    ) {
      return;
    }

    const observer =
      new MutationObserver(
        render
      );

    observer.observe(
      instructionText,
      {
        childList: true,
        characterData: true,
        subtree: true
      }
    );

    if (missionLabel) {
      observer.observe(
        missionLabel,
        {
          childList: true,
          characterData: true,
          subtree: true
        }
      );
    }

    render();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialize,
      { once: true }
    );
  }
  else {
    initialize();
  }

  window.ClambakeVisualDirections = {
    refresh: render,
    get activeStep() {
      return lastActive;
    },
    get watchStep() {
      return lastWatch;
    }
  };
})();