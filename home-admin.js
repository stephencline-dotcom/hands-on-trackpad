const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminLoginModal = document.getElementById("adminLoginModal");
const adminLoginPanel = adminLoginModal?.querySelector(".admin-login-panel");
const adminPasswordInput = document.getElementById("adminPasswordInput");
const adminLoginError = document.getElementById("adminLoginError");
const adminCancelBtn = document.getElementById("adminCancelBtn");
const adminSubmitBtn = document.getElementById("adminSubmitBtn");

const ADMIN_PASSWORD = "typing1";

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

adminCancelBtn.addEventListener("click", closeAdminLogin);
adminSubmitBtn.addEventListener("click", submitAdminLogin);

adminLoginBtn.addEventListener("click", (event) => {
  event.stopPropagation();
  if (adminLoginModal.hidden) {
    openAdminLogin();
    return;
  }

  closeAdminLogin();
});

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

adminLoginModal.addEventListener("click", (event) => {
  if (event.target === adminLoginModal) {
    closeAdminLogin();
  }
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
