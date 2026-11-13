(() => {
  "use strict";
  const actions = document.querySelector(".game-header-controls");
  if (!actions) return;
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "⏭ Skip Level";
  button.setAttribute("aria-label", "Teacher: skip to next level");
  button.style.cssText = "background:#ffe18a;color:#4b3018;border:2px solid #98652e;border-radius:18px;padding:7px 12px;font:bold 13px Arial,sans-serif;box-shadow:0 2px 3px #0002;cursor:pointer;white-space:nowrap;";
  button.hidden = true;
  actions.prepend(button);
  let allowed = false;
  let checking = false;
  async function access() {
    try {
      const [s, o] = await Promise.all([
        fetch('/api/teacher-session', {credentials:'same-origin',cache:'no-store'}),
        fetch('/api/settings', {cache:'no-store'})
      ]);
      const session = s.ok ? await s.json() : null;
      const settings = o.ok ? await o.json() : null;
      return session?.authenticated === true && settings?.teacherSkipLevelEnabled === true;
    } catch { return false; }
  }
  async function refresh() {
    if (checking || document.hidden) return;
    checking = true;
    allowed = await access();
    button.hidden = !allowed;
    checking = false;
  }
  button.addEventListener('click', async () => {
    if (!allowed || button.disabled) return;
    button.disabled = true;
    try {
      if (!(await access())) throw new Error('Teacher access unavailable');
      const adapter = window.trackpadTeacherSkipAdapter;
      if (!adapter || typeof adapter.advance !== 'function') throw new Error('Game adapter unavailable');
      if (adapter.advance() === false) {
        button.textContent = 'Final Level';
        button.hidden = true;
      }
    } catch (e) {
      allowed = false;
      button.hidden = true;
      console.warn('Teacher Skip Level:', e.message);
    } finally { button.disabled = false; }
  });
  refresh();
  const interval = setInterval(refresh, 10000);
  window.addEventListener('pagehide', () => clearInterval(interval), {once:true});
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
