(() => {
  "use strict";

  const path = location.pathname.toLowerCase();

  let id = null;

  if (path.includes("/games/three-little-pigs/")) {
    id = "demo";
  } else if (path.includes("/games/tortoise-puzzle/")) {
    id = "demoPuzzle";
  } else if (path.includes("/games/tractor-job-crew/")) {
    id = "hint";
  } else if (path.includes("/games/johnny-appleseed/level3.html") ||
             path.includes("/games/johnny-appleseed/level4.html")) {
    id = "eyes";
  }

  if (!id) return;

  const button = document.getElementById(id);

  if (!button || button.tagName !== "BUTTON") return;

  const artwork = `
    <svg viewBox="0 0 100 60"
         aria-hidden="true"
         focusable="false">
      <g class="eye-blink">
        <ellipse cx="28" cy="30" rx="20" ry="25"
                 fill="#fff" stroke="#354f63" stroke-width="3"/>
        <ellipse cx="72" cy="30" rx="20" ry="25"
                 fill="#fff" stroke="#354f63" stroke-width="3"/>
        <g class="eye-look">
          <ellipse cx="33" cy="32" rx="10" ry="14" fill="#2294a6"/>
          <ellipse cx="67" cy="32" rx="10" ry="14" fill="#2294a6"/>
          <circle cx="35" cy="32" r="5" fill="#18364b"/>
          <circle cx="65" cy="32" r="5" fill="#18364b"/>
          <circle cx="38" cy="27" r="3" fill="#fff"/>
          <circle cx="68" cy="27" r="3" fill="#fff"/>
        </g>
      </g>
    </svg>
  `;

  button.classList.add("trackpad-animated-eyes");
  button.setAttribute("aria-label", "Show me");
  button.setAttribute("title", "Show me");

  const renderEyes = () => {
    if (!button.querySelector("svg")) {
      button.innerHTML = artwork;
    }
  };

  renderEyes();

  // Preserve the appearance if existing game code updates the label.
  const observer = new MutationObserver(() => {
    if (!button.querySelector("svg")) {
      observer.disconnect();
      renderEyes();
      observer.observe(button, { childList: true });
    }
  });

  observer.observe(button, { childList: true });

  window.addEventListener("pagehide", () => {
    observer.disconnect();
  }, { once: true });
})();