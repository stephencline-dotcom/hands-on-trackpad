(() => {
  const NOTICE_ID = 'inputDeviceGuardNotice';
  let noticeTimer = null;

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
})();
