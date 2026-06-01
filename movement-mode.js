(() => {
  const DEFAULT_STORAGE_KEY = "requireClickAndDrag";

  // Each game passes its own key so click-and-drag stays isolated per page.
  function isRequireClickAndDragEnabled(storageKey = DEFAULT_STORAGE_KEY) {
    return localStorage.getItem(storageKey) === "true";
  }

  function createClickAndDragGate(storageKey = DEFAULT_STORAGE_KEY) {
    let activePointerId = null;

    return {
      begin(event) {
        if (!isRequireClickAndDragEnabled(storageKey)) {
          return false;
        }

        activePointerId = event.pointerId;
        return true;
      },
      end(event) {
        if (activePointerId === null) {
          return false;
        }

        if (event && typeof event.pointerId === "number" && event.pointerId !== activePointerId) {
          return false;
        }

        activePointerId = null;
        return true;
      },
      shouldMove(event) {
        if (!isRequireClickAndDragEnabled(storageKey)) {
          return true;
        }

        return activePointerId !== null && (!event || typeof event.pointerId !== "number" || event.pointerId === activePointerId);
      },
      isDragging() {
        return activePointerId !== null;
      },
      isRequireClickAndDragEnabled,
    };
  }

  window.trackpadMovementSettings = {
    isRequireClickAndDragEnabled,
    createClickAndDragGate,
  };
})();