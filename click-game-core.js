(() => {
  "use strict";

  /*
    Shared click-game foundation.

    Responsibilities:
    - Register/unregister clickable targets
    - Protect one deliberate click as one action
    - Detect and invalidate rapid repeated clicks
    - Pause/resume interaction
    - Reset transient state
    - Clean up listeners/timers

    This file intentionally does NOT manage:
    scoring, levels, timers, sounds, results, movement,
    game-specific rules, or visuals.
  */

  function create(options = {}) {
    const requestedResponseLockMs = Number(options.responseLockMs);
    const responseLockMs = Math.max(
      0,
      Number.isFinite(requestedResponseLockMs)
        ? requestedResponseLockMs
        : 350
    );

    const onRapidClick =
      typeof options.onRapidClick === "function"
        ? options.onRapidClick
        : null;

    const targets = new Map();
    const movingTargets = new Map();

    let paused = false;
    let destroyed = false;
    let globallyLocked = false;
    let pendingAction = null;
    let responseLockTimer = null;
    let movementAnimationId = 0;
    let movementLastTimestamp = 0;

    function isPaused() {
      return paused;
    }

    function isLocked() {
      return globallyLocked;
    }

    function clearResponseLockTimer() {
      if (responseLockTimer !== null) {
        window.clearTimeout(responseLockTimer);
        responseLockTimer = null;
      }
    }

    function clearPendingAction() {
      pendingAction = null;
    }

    function releaseGlobalLock() {
      clearResponseLockTimer();
      globallyLocked = false;
      clearPendingAction();
    }

    function notifyRapidClick(element, targetState) {
      if (!onRapidClick) {
        return;
      }

      try {
        onRapidClick({
          element,
          id: targetState ? targetState.id : "",
        });
      } catch {
        // Feedback callbacks must never break game interaction.
      }
    }

    function invalidatePendingAction() {
      if (!pendingAction || pendingAction.invalidated) {
        return;
      }

      pendingAction.invalidated = true;

      const {
        element,
        targetState,
      } = pendingAction;

      if (
        targetState &&
        typeof targetState.onInvalidated === "function"
      ) {
        try {
          targetState.onInvalidated({
            element,
            id: targetState.id,
          });
        } catch {
          // Game feedback must never break the shared controller.
        }
      }
    }

    async function completePendingAction(action) {
      if (
        destroyed ||
        action.invalidated ||
        pendingAction !== action
      ) {
        return;
      }

      try {
        if (typeof action.targetState.onClick === "function") {
          await action.targetState.onClick({
            event: action.event,
            element: action.element,
            id: action.targetState.id,
          });
        }
      } catch {
        // Game callbacks are isolated from the shared controller.
      } finally {
        action.targetState.actionLocked = false;

        if (pendingAction === action) {
          clearPendingAction();
        }
      }
    }

    function startPendingAction(
      element,
      targetState,
      event
    ) {
      clearResponseLockTimer();

      targetState.actionLocked = true;
      globallyLocked = true;

      const action = {
        element,
        targetState,
        event,
        invalidated: false,
      };

      pendingAction = action;

      if (typeof targetState.onPending === "function") {
        try {
          targetState.onPending({
            event,
            element,
            id: targetState.id,
          });
        } catch {
          // Immediate game feedback must never break click handling.
        }
      }

      if (responseLockMs <= 0) {
        globallyLocked = false;
        void completePendingAction(action);
        return;
      }

      responseLockTimer = window.setTimeout(() => {
        responseLockTimer = null;
        globallyLocked = false;

        if (action.invalidated) {
          targetState.actionLocked = false;

          if (pendingAction === action) {
            clearPendingAction();
          }

          return;
        }

        void completePendingAction(action);
      }, responseLockMs);
    }

    function stopMovementLoop() {
      if (movementAnimationId) {
        window.cancelAnimationFrame(movementAnimationId);
        movementAnimationId = 0;
      }

      movementLastTimestamp = 0;
    }

    function stepMovement(timestamp) {
      if (destroyed) {
        stopMovementLoop();
        return;
      }

      if (!movementLastTimestamp) {
        movementLastTimestamp = timestamp;
      }

      const deltaSeconds = Math.min(
        0.05,
        Math.max(0, (timestamp - movementLastTimestamp) / 1000)
      );

      movementLastTimestamp = timestamp;

      if (!paused) {
        movingTargets.forEach((motion, element) => {
          if (!targets.has(element) || !element.isConnected) {
            movingTargets.delete(element);
            return;
          }

          motion.x += motion.velocityX * deltaSeconds;
          motion.y += motion.velocityY * deltaSeconds;

          if (motion.x <= motion.minX) {
            motion.x = motion.minX;
            motion.velocityX = Math.abs(motion.velocityX);
          } else if (motion.x >= motion.maxX) {
            motion.x = motion.maxX;
            motion.velocityX = -Math.abs(motion.velocityX);
          }

          if (motion.y <= motion.minY) {
            motion.y = motion.minY;
            motion.velocityY = Math.abs(motion.velocityY);
          } else if (motion.y >= motion.maxY) {
            motion.y = motion.maxY;
            motion.velocityY = -Math.abs(motion.velocityY);
          }

          element.style.left = `${motion.x}%`;
          element.style.top = `${motion.y}%`;
        });
      }

      if (movingTargets.size > 0) {
        movementAnimationId =
          window.requestAnimationFrame(stepMovement);
      } else {
        stopMovementLoop();
      }
    }

    function ensureMovementLoop() {
      if (
        destroyed ||
        movementAnimationId ||
        movingTargets.size === 0
      ) {
        return;
      }

      movementAnimationId =
        window.requestAnimationFrame(stepMovement);
    }

    function startTargetMovement(element, movementOptions = {}) {
      if (
        destroyed ||
        !targets.has(element) ||
        !(element instanceof Element)
      ) {
        return false;
      }

      const parsedLeft =
        Number.parseFloat(element.style.left);
      const parsedTop =
        Number.parseFloat(element.style.top);

      const speed =
        Number.isFinite(Number(movementOptions.speed))
          ? Math.max(0, Number(movementOptions.speed))
          : 7;

      let directionX =
        Number(movementOptions.directionX);
      let directionY =
        Number(movementOptions.directionY);

      if (!Number.isFinite(directionX) || directionX === 0) {
        directionX = Math.random() < 0.5 ? -1 : 1;
      }

      if (!Number.isFinite(directionY) || directionY === 0) {
        directionY = Math.random() < 0.5 ? -0.65 : 0.65;
      }

      const minX =
        Number.isFinite(Number(movementOptions.minX))
          ? Number(movementOptions.minX)
          : 12;

      const maxX =
        Number.isFinite(Number(movementOptions.maxX))
          ? Number(movementOptions.maxX)
          : 88;

      const minY =
        Number.isFinite(Number(movementOptions.minY))
          ? Number(movementOptions.minY)
          : 18;

      const maxY =
        Number.isFinite(Number(movementOptions.maxY))
          ? Number(movementOptions.maxY)
          : 82;

      movingTargets.set(element, {
        x: Number.isFinite(parsedLeft)
          ? parsedLeft
          : (minX + maxX) / 2,
        y: Number.isFinite(parsedTop)
          ? parsedTop
          : (minY + maxY) / 2,
        minX,
        maxX,
        minY,
        maxY,
        velocityX: directionX * speed,
        velocityY: directionY * speed,
      });

      ensureMovementLoop();
      return true;
    }

    function stopTargetMovement(element) {
      const removed = movingTargets.delete(element);

      if (movingTargets.size === 0) {
        stopMovementLoop();
      }

      return removed;
    }

    function createTargetClickHandler(element) {
      return function handleTargetClick(event) {
        if (destroyed || paused) {
          return;
        }

        const targetState = targets.get(element);

        if (!targetState) {
          return;
        }

        if (globallyLocked) {
          invalidatePendingAction();
          notifyRapidClick(element, targetState);
          return;
        }

        if (targetState.actionLocked) {
          notifyRapidClick(element, targetState);
          return;
        }

        if (typeof targetState.isClickable === "function") {
          let clickable = false;

          try {
            clickable = Boolean(
              targetState.isClickable({
                event,
                element,
                id: targetState.id,
              })
            );
          } catch {
            clickable = false;
          }

          if (!clickable) {
            return;
          }
        }

        startPendingAction(
          element,
          targetState,
          event
        );
      };
    }

    function registerTarget(element, targetOptions = {}) {
      if (destroyed) {
        return false;
      }

      if (!(element instanceof Element)) {
        return false;
      }

      if (targets.has(element)) {
        return false;
      }

      const targetState = {
        id:
          typeof targetOptions.id === "string"
            ? targetOptions.id
            : "",
        isClickable:
          typeof targetOptions.isClickable === "function"
            ? targetOptions.isClickable
            : null,
        onPending:
          typeof targetOptions.onPending === "function"
            ? targetOptions.onPending
            : null,
        onClick:
          typeof targetOptions.onClick === "function"
            ? targetOptions.onClick
            : null,
        onInvalidated:
          typeof targetOptions.onInvalidated === "function"
            ? targetOptions.onInvalidated
            : null,
        actionLocked: false,
        clickHandler: null,
      };

      targetState.clickHandler =
        createTargetClickHandler(element);

      targets.set(element, targetState);

      element.addEventListener(
        "click",
        targetState.clickHandler
      );

      return true;
    }

    function unregisterTarget(element) {
      const targetState = targets.get(element);

      if (!targetState) {
        return false;
      }

      if (
        pendingAction &&
        pendingAction.element === element
      ) {
        releaseGlobalLock();
      }

      element.removeEventListener(
        "click",
        targetState.clickHandler
      );

      stopTargetMovement(element);

      targetState.actionLocked = false;
      targets.delete(element);

      return true;
    }

    function pause() {
      if (destroyed) {
        return;
      }

      paused = true;
    }

    function resume() {
      if (destroyed) {
        return;
      }

      paused = false;
    }

    function reset() {
      if (destroyed) {
        return;
      }

      releaseGlobalLock();

      targets.forEach((targetState) => {
        targetState.actionLocked = false;
      });
    }

    function destroy() {
      if (destroyed) {
        return;
      }

      releaseGlobalLock();
      stopMovementLoop();
      movingTargets.clear();

      targets.forEach((targetState, element) => {
        element.removeEventListener(
          "click",
          targetState.clickHandler
        );
      });

      targets.clear();

      paused = true;
      destroyed = true;
    }

    return {
      registerTarget,
      unregisterTarget,
      startTargetMovement,
      stopTargetMovement,
      pause,
      resume,
      reset,
      destroy,
      isPaused,
      isLocked,
    };
  }

  window.ClickGameCore = {
    create,
  };
})();
