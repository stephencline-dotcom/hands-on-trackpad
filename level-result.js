/*
  Reusable Level Result adapter contract.

  Supported callbacks in constructor options:
  - pauseGame
  - onNextLevel
  - onRetry
  - onPlayAgain
  - onHome
  - canPlaySound

  Public methods:
  - showSuccess
  - showFailure
  - showFinal
  - hide
  - destroy
*/

(function attachLevelResultController(global) {
  'use strict';

  const DEFAULT_TITLES = {
    success: 'Level Complete!',
    failure: 'Try Again!',
    final: 'You Did It!',
  };

  const DEFAULT_BUTTONS = {
    success: 'Level Up',
    failure: 'Try Again',
    playAgain: 'Play Again',
  };

  function safeCall(fn) {
    if (typeof fn !== 'function') {
      return;
    }

    try {
      fn();
    } catch {
      // Never break game flow due to callback errors.
    }
  }

  class LevelResultController {
    constructor(options) {
      const config = options || {};

      if (!config.host || !(config.host instanceof Element)) {
        throw new Error('LevelResultController requires a valid host Element.');
      }

      this.host = config.host;
      this.callbacks = {
        pauseGame: config.pauseGame,
        onNextLevel: config.onNextLevel,
        onRetry: config.onRetry,
        onPlayAgain: config.onPlayAgain,
        onHome: config.onHome,
        canPlaySound: config.canPlaySound,
      };

      this.mode = null;
      this.isVisible = false;
      this.primaryActionLocked = false;
      this.secondaryActionLocked = false;

      this.cheerAudio = new Audio('/sounds/cheer.mp3');
      this.failAudio = new Audio('/sounds/fail.mp3');
      this.cheerAudio.preload = 'auto';
      this.failAudio.preload = 'auto';
      this.cheerAudio.loop = false;
      this.failAudio.loop = false;
      this.cheerAudio.volume = 0.9;
      this.failAudio.volume = 0.9;

      this._onOverlayPointerDown = this._onOverlayPointerDown.bind(this);
      this._onPrimaryAction = this._onPrimaryAction.bind(this);
      this._onSecondaryAction = this._onSecondaryAction.bind(this);

      this.overlay = null;
      this.panel = null;
      this.titleElement = null;
      this.messageElement = null;
      this.actionsElement = null;
      this.primaryButton = null;
      this.secondaryButton = null;
      this.balloonsElement = null;

      this._ensureHostPositioning();
      this._buildOverlay();
    }

    showSuccess(options) {
      const config = options || {};
      this._show({
        mode: 'success',
        title: config.title || DEFAULT_TITLES.success,
        message: config.message || '',
        primaryLabel: config.primaryLabel || DEFAULT_BUTTONS.success,
        primaryAction: this.callbacks.onNextLevel,
        playSound: 'cheer',
      });
    }

    showFailure(options) {
      const config = options || {};
      this._show({
        mode: 'failure',
        title: config.title || DEFAULT_TITLES.failure,
        message: config.message || '',
        primaryLabel: config.primaryLabel || DEFAULT_BUTTONS.failure,
        primaryAction: this.callbacks.onRetry,
        playSound: 'fail',
      });
    }

    showFinal(options) {
      const config = options || {};
      this._show({
        mode: 'final',
        title: config.title || DEFAULT_TITLES.final,
        message: config.message || '',
        primaryLabel: config.primaryLabel || DEFAULT_BUTTONS.playAgain,
        primaryAction: this.callbacks.onPlayAgain,
        secondaryAction: this.callbacks.onHome,
        playSound: 'cheer',
      });
    }

    hide() {
      if (!this.overlay) {
        return;
      }

      this.mode = null;
      this.isVisible = false;
      this.primaryActionLocked = false;
      this.secondaryActionLocked = false;

      this.overlay.classList.remove('is-visible');
      this.overlay.setAttribute('aria-hidden', 'true');
      this.overlay.removeAttribute('data-mode');

      if (this.primaryButton) {
        this.primaryButton.disabled = false;
      }

      if (this.secondaryButton) {
        this.secondaryButton.disabled = false;
      }

      this._stopAudio();
    }

    destroy() {
      this.hide();

      if (this.overlay) {
        this.overlay.removeEventListener('pointerdown', this._onOverlayPointerDown);
      }

      if (this.primaryButton) {
        this.primaryButton.removeEventListener('click', this._onPrimaryAction);
      }

      if (this.secondaryButton) {
        this.secondaryButton.removeEventListener('click', this._onSecondaryAction);
      }

      if (this.overlay && this.overlay.parentNode) {
        this.overlay.parentNode.removeChild(this.overlay);
      }

      this.overlay = null;
      this.panel = null;
      this.titleElement = null;
      this.messageElement = null;
      this.actionsElement = null;
      this.primaryButton = null;
      this.secondaryButton = null;
      this.balloonsElement = null;
      this.callbacks = null;
    }

    _show(config) {
      this._ensureOverlayAttached();

      safeCall(this.callbacks.pauseGame);

      this.mode = config.mode;
      this.isVisible = true;
      this.primaryActionLocked = false;
      this.secondaryActionLocked = false;

      this.overlay.dataset.mode = config.mode;
      this.overlay.setAttribute('aria-hidden', 'false');
      this.overlay.classList.add('is-visible');

      this.titleElement.textContent = config.title;
      this.messageElement.textContent = config.message;
      this.messageElement.hidden = !config.message;

      this.primaryButton.textContent = config.primaryLabel;
      this.primaryButton.disabled = false;
      this.primaryButton.hidden = false;
      this.primaryButton.dataset.action = 'primary';
      this.primaryButtonAction = config.primaryAction;

      const showSecondary = config.mode === 'final';
      this.secondaryButton.hidden = !showSecondary;
      this.secondaryButton.disabled = false;
      this.secondaryButtonAction = showSecondary ? config.secondaryAction : null;

      this._renderBalloons(config.mode === 'final');
      this._playModeSound(config.playSound);

      this.primaryButton.focus({ preventScroll: true });
    }

    _ensureHostPositioning() {
      const computed = global.getComputedStyle(this.host);
      if (computed.position === 'static') {
        this.host.style.position = 'relative';
      }
    }

    _buildOverlay() {
      const overlay = document.createElement('div');
      overlay.className = 'level-result-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-hidden', 'true');

      const panel = document.createElement('section');
      panel.className = 'level-result-panel';

      const headingId = `level-result-title-${Math.random().toString(36).slice(2, 10)}`;
      const title = document.createElement('h2');
      title.className = 'level-result-title';
      title.id = headingId;
      overlay.setAttribute('aria-labelledby', headingId);

      const message = document.createElement('p');
      message.className = 'level-result-message';
      message.hidden = true;

      const balloons = document.createElement('div');
      balloons.className = 'level-result-balloons';
      balloons.setAttribute('aria-hidden', 'true');
      balloons.hidden = true;

      const actions = document.createElement('div');
      actions.className = 'level-result-actions';

      const primaryButton = document.createElement('button');
      primaryButton.type = 'button';
      primaryButton.className = 'level-result-button';

      const secondaryButton = document.createElement('button');
      secondaryButton.type = 'button';
      secondaryButton.className = 'level-result-home';
      secondaryButton.setAttribute('aria-label', 'Home');
      secondaryButton.setAttribute('title', 'Home');
      secondaryButton.hidden = true;

      const homeIcon = document.createElement('img');
      homeIcon.className = 'level-result-home-icon';
      homeIcon.src = '/images/home-icon.svg';
      homeIcon.alt = '';
      homeIcon.setAttribute('aria-hidden', 'true');
      secondaryButton.appendChild(homeIcon);

      actions.appendChild(primaryButton);
      actions.appendChild(secondaryButton);

      panel.appendChild(title);
      panel.appendChild(message);
      panel.appendChild(actions);
      panel.appendChild(balloons);
      overlay.appendChild(panel);

      overlay.addEventListener('pointerdown', this._onOverlayPointerDown);
      primaryButton.addEventListener('click', this._onPrimaryAction);
      secondaryButton.addEventListener('click', this._onSecondaryAction);

      this.overlay = overlay;
      this.panel = panel;
      this.titleElement = title;
      this.messageElement = message;
      this.actionsElement = actions;
      this.primaryButton = primaryButton;
      this.secondaryButton = secondaryButton;
      this.balloonsElement = balloons;

      this.host.appendChild(overlay);
    }

    _ensureOverlayAttached() {
      if (this.overlay && this.overlay.parentNode === this.host) {
        return;
      }

      if (!this.overlay) {
        this._buildOverlay();
        return;
      }

      this.host.appendChild(this.overlay);
    }

    _onOverlayPointerDown(event) {
      if (event.target !== this.overlay) {
        return;
      }

      // Click outside panel should not close or advance.
      event.preventDefault();
    }

    _onPrimaryAction() {
      if (this.primaryActionLocked || !this.isVisible) {
        return;
      }

      this.primaryActionLocked = true;
      this.primaryButton.disabled = true;
      const action = this.primaryButtonAction;
      this.hide();
      safeCall(action);
    }

    _onSecondaryAction() {
      if (this.secondaryActionLocked || !this.isVisible) {
        return;
      }

      this.secondaryActionLocked = true;
      this.secondaryButton.disabled = true;
      const action = this.secondaryButtonAction;
      this.hide();
      safeCall(action);
    }

    _renderBalloons(enabled) {
      if (!this.balloonsElement) {
        return;
      }

      if (!enabled) {
        this.balloonsElement.hidden = true;
        this.balloonsElement.textContent = '';
        return;
      }

      this.balloonsElement.hidden = false;
      this.balloonsElement.textContent = '';

      const count = 14;
      const spread = [5, 15, 27, 40, 52, 64, 76, 88, 96, 10, 22, 34, 58, 82];
      for (let index = 0; index < count; index += 1) {
        const balloon = document.createElement('span');
        balloon.className = 'level-result-balloon';
        balloon.style.setProperty('--balloon-hue', String(Math.floor(170 + Math.random() * 190) % 360));
        balloon.style.setProperty('--balloon-size', `${28 + Math.random() * 22}px`);
        balloon.style.setProperty('--balloon-left', `${spread[index % spread.length]}%`);
        balloon.style.setProperty('--balloon-drift', `${-34 + Math.random() * 68}px`);
        balloon.style.setProperty('--balloon-dur', `${4.6 + Math.random() * 2.8}s`);
        balloon.style.setProperty('--balloon-delay', `${Math.random() * 2.4}s`);
        this.balloonsElement.appendChild(balloon);
      }
    }

    _canPlaySound() {
      const fn = this.callbacks.canPlaySound;
      if (typeof fn !== 'function') {
        return true;
      }

      try {
        return Boolean(fn());
      } catch {
        return false;
      }
    }

    _playModeSound(kind) {
      if (!this._canPlaySound()) {
        return;
      }

      const audio = kind === 'fail' ? this.failAudio : this.cheerAudio;
      if (!audio) {
        return;
      }

      try {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
        audio.volume = Math.max(0, Math.min(1, audio.volume || 0.9));
        const playback = audio.play();
        if (playback && typeof playback.catch === 'function') {
          playback.catch(() => {
            // Ignore autoplay and media failures.
          });
        }
      } catch {
        // Ignore media failures.
      }
    }

    _stopAudio() {
      const sounds = [this.cheerAudio, this.failAudio];
      for (const sound of sounds) {
        if (!sound) {
          continue;
        }

        try {
          sound.pause();
          sound.currentTime = 0;
        } catch {
          // Ignore media failures.
        }
      }
    }
  }

  global.LevelResultController = LevelResultController;
})(window);
