(() => {
  const SETTINGS_API_PATH = "/api/settings";

  function parseEnabled(value, fallback = true) {
    if (typeof value === "boolean") {
      return value;
    }

    if (value === null || typeof value === "undefined") {
      return fallback;
    }

    return String(value) !== "false";
  }

  function getGameActiveKey() {
    const body = document.body;
    if (!body) {
      return null;
    }

    return body.dataset.gameActiveKey || null;
  }

  function blockGameAccess() {
    const destination = "index.html";
    if (window.location.pathname.endsWith(destination)) {
      return;
    }

    window.location.replace(destination);
  }

  async function verifyGameAccess() {
    const gameActiveKey = getGameActiveKey();
    if (!gameActiveKey) {
      return;
    }

    const localEnabled = parseEnabled(localStorage.getItem(gameActiveKey), true);
    if (!localEnabled) {
      blockGameAccess();
      return;
    }

    try {
      const response = await fetch(SETTINGS_API_PATH, { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const settings = await response.json();
      const remoteEnabled = parseEnabled(settings[gameActiveKey], localEnabled);
      localStorage.setItem(gameActiveKey, String(remoteEnabled));

      if (!remoteEnabled) {
        blockGameAccess();
      }
    } catch {
      // Keep local behavior when API is unavailable.
    }
  }

  verifyGameAccess();
})();
