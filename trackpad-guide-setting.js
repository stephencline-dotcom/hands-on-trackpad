"use strict";

/*
 * Shared Trackpad Guide setting
 *
 * Reads:
 *   trackpadGuideEnabled
 *
 * Provides:
 *   body.trackpad-guide-off
 *
 * Games can use that body class to resize
 * themselves when the guide is disabled.
 */

(() => {
  const SETTINGS_API_PATH =
    "/api/settings";

  const STYLE_ID =
    "trackpad-guide-setting-style";

  function ensureSharedStyle() {
    if (
      document.getElementById(
        STYLE_ID
      )
    ) {
      return;
    }

    const style =
      document.createElement(
        "style"
      );

    style.id = STYLE_ID;

    style.textContent = `
      body.trackpad-guide-off
      .imported-trackpad-guide {
        display: none !important;
      }
    `;

    document.head.appendChild(
      style
    );
  }

  function applySetting(enabled) {
    const guideEnabled =
      enabled !== false;

    document.body.classList.toggle(
      "trackpad-guide-off",
      !guideEnabled
    );

    document.body.dataset
      .trackpadGuideEnabled =
        String(guideEnabled);

    window.dispatchEvent(
      new CustomEvent(
        "trackpadGuideSettingChanged",
        {
          detail: {
            enabled:
              guideEnabled,
          },
        }
      )
    );
  }

  async function refreshSetting() {
    let guideEnabled = true;

    try {
      const response =
        await fetch(
          SETTINGS_API_PATH,
          {
            cache: "no-store",
          }
        );

      if (!response.ok) {
        throw new Error(
          "Could not load Trackpad Guide setting."
        );
      }

      const settings =
        await response.json();

      guideEnabled =
        settings
          .trackpadGuideEnabled !==
        false;
    } catch {
      /*
       * Safe default:
       * show the Trackpad Guide.
       */
      guideEnabled = true;
    }

    applySetting(
      guideEnabled
    );

    return guideEnabled;
  }

  ensureSharedStyle();

  window.trackpadGuideSetting = {
    apply: applySetting,
    refresh: refreshSetting,
  };

  refreshSetting();
})();
