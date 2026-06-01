const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminLoginModal = document.getElementById("adminLoginModal");
const adminLoginPanel = adminLoginModal?.querySelector(".admin-login-panel");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const adminLoginError = document.getElementById("adminLoginError");
const adminCancelBtn = document.getElementById("adminCancelBtn");
const adminSubmitBtn = document.getElementById("adminSubmitBtn");
const activityLinks = Array.from(document.querySelectorAll("[data-game-active-key]"));

const ADMIN_PASSWORD = "typing1";
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

function setActivityLinkState(link, isActive) {
  link.classList.toggle("activity-disabled", !isActive);
  link.setAttribute("aria-disabled", isActive ? "false" : "true");
  link.dataset.activityActive = isActive ? "true" : "false";
  link.tabIndex = isActive ? 0 : -1;
}

function applyActivityAvailability(settings = {}) {
  activityLinks.forEach((link) => {
    const key = link.dataset.gameActiveKey;
    if (!key) {
      return;
    }

    const active = parseEnabled(settings[key], parseEnabled(localStorage.getItem(key), true));
    localStorage.setItem(key, String(active));
    setActivityLinkState(link, active);
  });
}

async function syncActivityAvailability() {
  if (!activityLinks.length) {
    return;
  }

  applyActivityAvailability();

  try {
    const response = await fetch(SETTINGS_API_PATH, { cache: "no-store" });
    if (!response.ok) {
      return;
    }

    const settings = await response.json();
    applyActivityAvailability(settings);
  } catch {
    // Keep local availability when API is unavailable.
  }
}

function openAdminLogin() {
  adminLoginModal.hidden = false;
  adminLoginError.hidden = true;
  adminPasswordInput.value = "";
  adminPasswordInput.focus();
}

function closeAdminLogin() {
  adminLoginModal.hidden = true;
}

function submitAdminLogin() {
  if (adminPasswordInput.value === ADMIN_PASSWORD) {
    window.location.href = "admin-settings.html";
    return;
  }

  adminLoginError.hidden = false;
  adminPasswordInput.select();
}

if (adminCancelBtn) {
  adminCancelBtn.addEventListener("click", closeAdminLogin);
}
if (adminSubmitBtn) {
  adminSubmitBtn.addEventListener("click", submitAdminLogin);
}

if (adminLoginBtn) {
  adminLoginBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (adminLoginModal.hidden) {
      openAdminLogin();
      return;
    }

    closeAdminLogin();
  });
}

if (adminPasswordInput) {
  adminPasswordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitAdminLogin();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeAdminLogin();
    }
  });
}

if (adminLoginModal) {
  adminLoginModal.addEventListener("click", (event) => {
    if (event.target === adminLoginModal) {
      closeAdminLogin();
    }
  });
}

document.addEventListener("click", (event) => {
  const disabledLink = event.target instanceof Element ? event.target.closest(".activity-disabled") : null;
  if (!disabledLink) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();
});

document.addEventListener("pointerdown", (event) => {
  if (adminLoginModal.hidden) {
    return;
  }

  if (event.target === adminLoginBtn || adminLoginBtn.contains(event.target)) {
    return;
  }

  if (adminLoginPanel && adminLoginPanel.contains(event.target)) {
    return;
  }

  closeAdminLogin();
});

syncActivityAvailability();
