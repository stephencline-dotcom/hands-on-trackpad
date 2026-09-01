(() => {
  const NOTICE_ID = 'inputDeviceGuardNotice';
  const CLASSROOM_WARNING_ID = 'inputDeviceGuardClassroomWarning';

  let noticeTimer = null;
  let classroomWarningTimer = null;

  function showNotice() {
    let notice = document.getElementById(NOTICE_ID);

    if (!notice) {
      notice = document.createElement('div');
      notice.id = NOTICE_ID;
      notice.textContent = 'Please use a mouse or trackpad for this activity.';
      notice.setAttribute('role', 'status');
      notice.setAttribute('aria-live', 'polite');

      Object.assign(notice.style, {
        position: 'fixed',
        left: '50%',
        bottom: '24px',
        transform: 'translateX(-50%)',
        zIndex: '999999',
        padding: '12px 18px',
        borderRadius: '12px',
        background: 'rgba(15, 23, 42, 0.94)',
        color: '#ffffff',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        fontWeight: '700',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.28)',
        pointerEvents: 'none',
        opacity: '0',
        transition: 'opacity 120ms ease',
      });

      document.body.appendChild(notice);
    }

    notice.style.opacity = '1';

    window.clearTimeout(noticeTimer);
    noticeTimer = window.setTimeout(() => {
      notice.style.opacity = '0';
    }, 1800);
  }


  function isFreezeScreenBlocking() {
    const overlay = document.getElementById('studentFreezeOverlay');

    return (
      document.body.classList.contains('student-screen-frozen') ||
      Boolean(overlay && !overlay.hidden)
    );
  }

  function allowsRightClick() {
    return (
      document.body.dataset.allowRightClick === 'true' ||
      document.documentElement.dataset.allowRightClick === 'true'
    );
  }

  function getClassroomWarning() {
    let warning = document.getElementById(CLASSROOM_WARNING_ID);

    if (warning) {
      return warning;
    }

    warning = document.createElement('div');
    warning.id = CLASSROOM_WARNING_ID;
    warning.setAttribute('role', 'status');
    warning.setAttribute('aria-live', 'assertive');

    Object.assign(warning.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '999998',
      display: 'grid',
      placeItems: 'center',
      padding: '24px',
      background: 'rgba(8, 15, 24, 0.2)',
      pointerEvents: 'none',
      opacity: '0',
      transition: 'opacity 120ms ease',
    });

    const card = document.createElement('div');

    Object.assign(card.style, {
      width: 'min(88vw, 560px)',
      padding: '30px 34px',
      borderRadius: '24px',
      border: '4px solid rgba(255, 255, 255, 0.92)',
      background: 'linear-gradient(160deg, #17324a, #0c1b29)',
      color: '#ffffff',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
      boxShadow: '0 24px 60px rgba(0, 0, 0, 0.42)',
    });

    const icon = document.createElement('div');
    icon.dataset.warningPart = 'icon';

    Object.assign(icon.style, {
      fontSize: '72px',
      lineHeight: '1',
      marginBottom: '12px',
    });

    const title = document.createElement('div');
    title.dataset.warningPart = 'title';

    Object.assign(title.style, {
      fontSize: 'clamp(30px, 5vw, 52px)',
      lineHeight: '1',
      fontWeight: '900',
      letterSpacing: '0.02em',
    });

    const message = document.createElement('div');
    message.dataset.warningPart = 'message';

    Object.assign(message.style, {
      marginTop: '14px',
      fontSize: 'clamp(18px, 2.4vw, 27px)',
      lineHeight: '1.25',
      fontWeight: '750',
    });

    card.append(icon, title, message);
    warning.appendChild(card);
    document.body.appendChild(warning);

    return warning;
  }

  function showClassroomWarning({ icon, title, message }) {
    if (isFreezeScreenBlocking()) {
      return;
    }

    const warning = getClassroomWarning();

    warning.querySelector('[data-warning-part="icon"]').textContent = icon;
    warning.querySelector('[data-warning-part="title"]').textContent = title;
    warning.querySelector('[data-warning-part="message"]').textContent = message;

    warning.style.opacity = '1';

    window.clearTimeout(classroomWarningTimer);
    classroomWarningTimer = window.setTimeout(() => {
      warning.style.opacity = '0';
    }, 1600);
  }

  function showOneFingerWarning() {
    showClassroomWarning({
      icon: '☝️',
      title: 'ONE FINGER ONLY!',
      message: 'Use your pointer finger to click.',
    });
  }

  function showClickOnceWarning() {
    showClassroomWarning({
      icon: '☝️',
      title: 'CLICK ONCE!',
      message: 'Now wait and see what happens.',
    });
  }

  function handleContextMenu(event) {
    if (allowsRightClick()) {
      return;
    }

    event.preventDefault();

    if (isFreezeScreenBlocking()) {
      return;
    }

    event.stopPropagation();
    event.stopImmediatePropagation();
    showOneFingerWarning();
  }

  function blockTouchPointer(event) {
    if (event.pointerType !== 'touch') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    showNotice();
  }

  function blockTouchEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    showNotice();
  }

  document.addEventListener('contextmenu', handleContextMenu, true);

  document.addEventListener('pointerdown', blockTouchPointer, true);
  document.addEventListener('pointermove', blockTouchPointer, true);
  document.addEventListener('pointerup', blockTouchPointer, true);
  document.addEventListener('pointercancel', blockTouchPointer, true);

  document.addEventListener('touchstart', blockTouchEvent, {
    capture: true,
    passive: false,
  });

  document.addEventListener('touchmove', blockTouchEvent, {
    capture: true,
    passive: false,
  });

  document.addEventListener('touchend', blockTouchEvent, {
    capture: true,
    passive: false,
  });

  document.addEventListener('touchcancel', blockTouchEvent, {
    capture: true,
    passive: false,
  });
  const rapidClickTimes = new Map();

  function shouldBlockRapidClick(
    scope,
    event,
    options = {}
  ) {
    /*
     * Freeze Screen always has priority over classroom
     * input warnings and game interactions.
     */
    if (isFreezeScreenBlocking()) {
      return true;
    }

    /*
     * Prevent a non-primary mouse button from activating
     * the game. The contextmenu handler displays the
     * ONE FINGER ONLY warning.
     */
    if (
      event &&
      event.pointerType !== 'touch' &&
      Number.isFinite(event.button) &&
      event.button !== 0
    ) {
      return true;
    }

    const key = String(scope || 'default');
    const enabled = options.enabled !== false;

    if (!enabled) {
      rapidClickTimes.delete(key);
      return false;
    }

    const requestedCooldown =
      Number(options.cooldownMs);

    const cooldownMs =
      Number.isFinite(requestedCooldown)
        ? Math.min(
            3000,
            Math.max(120, requestedCooldown)
          )
        : 450;

    const now =
      typeof performance !== 'undefined'
        ? performance.now()
        : Date.now();

    const previous =
      rapidClickTimes.get(key) ?? -Infinity;

    rapidClickTimes.set(key, now);

    if (now - previous >= cooldownMs) {
      return false;
    }

    showClickOnceWarning();
    return true;
  }

  function resetRapidClick(scope) {
    rapidClickTimes.delete(
      String(scope || 'default')
    );
  }

  window.InputDeviceGuard = Object.freeze({
    showClickOnceWarning,
    showOneFingerWarning,
    isFreezeScreenBlocking,
    shouldBlockRapidClick,
    resetRapidClick,
  });
})();
