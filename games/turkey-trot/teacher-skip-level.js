(() => {
  "use strict";
  const pages = ["index.html", "woodland.html", "creek-hop.html", "finale.html"];
  const current = pages.indexOf(location.pathname.split("/").pop() || "index.html");
  if (current < 0 || current === pages.length - 1) return;

  const headerActions = document.querySelector("main > header > div");
  if (!headerActions) return;
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "⏭ Skip Level";
  button.setAttribute("aria-label", "Teacher: skip to next enabled level");
  button.style.cssText = "background:#ffe18a;color:#4b3018;border:2px solid #98652e;border-radius:18px;padding:7px 12px;font:bold 13px Arial,sans-serif;box-shadow:0 2px 3px #0002;cursor:pointer;white-space:nowrap;";
  button.hidden = true;
  headerActions.prepend(button);

  let allowed = false;
  let checking = false;
  async function checkAccess() {
    if (checking) return;
    checking = true;
    try {
      const [session, settings] = await Promise.all([
        fetch("/api/teacher-session", { credentials: "same-origin", cache: "no-store" }),
        fetch("/api/settings", { cache: "no-store" })
      ]);
      const status = session.ok ? await session.json() : null;
      const options = settings.ok ? await settings.json() : null;
      allowed = status?.authenticated === true && options?.teacherSkipLevelEnabled !== false;
    } catch { allowed = false; }
    button.hidden = !allowed;
    checking = false;
  }
  button.addEventListener("click", async () => {
    if (!allowed || button.disabled) return;
    button.disabled = true;
    try {
      const session = await fetch("/api/teacher-session", { credentials: "same-origin", cache: "no-store" });
      if (!session.ok || (await session.json()).authenticated !== true) throw Error("Teacher login required");
      const response = await fetch("/api/settings", { cache: "no-store" });
      if (!response.ok) throw Error("Settings unavailable");
      const settings = await response.json();
      if (settings.teacherSkipLevelEnabled === false) throw Error("Teacher skip disabled");
      for (let i = current + 1; i < pages.length; i++) {
        if (settings[`turkeyTrotLevel${i + 1}Enabled`] !== false) {
          location.assign(pages[i]);
          return;
        }
      }
      button.textContent = "No next level";
    } catch (error) {
      allowed = false;
      button.hidden = true;
      console.warn("Teacher Skip Level unavailable:", error.message);
    } finally { button.disabled = false; }
  });
  checkAccess();
  const interval = setInterval(checkAccess, 10000);
  window.addEventListener("pagehide", () => clearInterval(interval), { once: true });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) checkAccess(); });
})();
