(function () {
  const DEFAULT_LAYOUT = {
    sceneWidth: 626,
    sceneHeight: 437,
    trackpadScale: 0.84,
    leftStart: { x: -34, y: 178 },
    rightStart: { x: 230, y: 158 },
    rightRangeFractions: {
      minX: 0.2,
      maxX: 0.62,
      minY: 0.1,
      maxY: 0.8,
    },
  };

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createTrackpadGuide(options = {}) {
    const scene = options.scene;
    const leftHand = options.leftHand;
    const rightHand = options.rightHand;
    const pressIndicator = options.pressIndicator || null;

    if (!scene || !leftHand || !rightHand) {
      return null;
    }

    const sceneWidth = Number(options.sceneWidth || DEFAULT_LAYOUT.sceneWidth);
    const sceneHeight = Number(options.sceneHeight || DEFAULT_LAYOUT.sceneHeight);
    const trackpadScale = Number(options.trackpadScale || DEFAULT_LAYOUT.trackpadScale);
    const leftStart = options.leftStart || DEFAULT_LAYOUT.leftStart;
    const rightStart = options.rightStart || DEFAULT_LAYOUT.rightStart;
    const rightRangeFractions = options.rightRangeFractions || DEFAULT_LAYOUT.rightRangeFractions;
    const pointerSpace = options.pointerSpace || "viewport";
    const togglePressIndicator = Boolean(options.togglePressIndicator);
    const toggleScenePressedClass = options.toggleScenePressedClass !== false;

    function applyLeftPosition(x, y) {
      leftHand.style.left = `${(x / sceneWidth) * 100}%`;
      leftHand.style.top = `${(y / sceneHeight) * 100}%`;
    }

    function applyRightPosition(x, y) {
      rightHand.style.left = `${(x / sceneWidth) * 100}%`;
      rightHand.style.top = `${(y / sceneHeight) * 100}%`;
    }

    function getTrackpadArea() {
      const width = sceneWidth * trackpadScale;
      const height = sceneHeight * trackpadScale;
      return {
        x: (sceneWidth - width) / 2,
        y: (sceneHeight - height) / 2,
        width,
        height,
      };
    }

    function getRightHandRange() {
      const area = getTrackpadArea();
      return {
        minX: area.x + area.width * rightRangeFractions.minX,
        maxX: area.x + area.width * rightRangeFractions.maxX,
        minY: area.y + area.height * rightRangeFractions.minY,
        maxY: area.y + area.height * rightRangeFractions.maxY,
      };
    }

    function mapPointToRightPosition(pointX, pointY) {
      const area = getTrackpadArea();
      const range = getRightHandRange();
      const nx = clamp((pointX - area.x) / area.width, 0, 1);
      const ny = clamp((pointY - area.y) / area.height, 0, 1);

      return {
        x: range.minX + nx * (range.maxX - range.minX),
        y: range.minY + ny * (range.maxY - range.minY),
      };
    }

    function pointerToScenePoint(event) {
      if (pointerSpace === "scene") {
        const rect = scene.getBoundingClientRect();
        const width = Math.max(rect.width, 1);
        const height = Math.max(rect.height, 1);
        return {
          x: clamp((event.clientX - rect.left) * (sceneWidth / width), 0, sceneWidth),
          y: clamp((event.clientY - rect.top) * (sceneHeight / height), 0, sceneHeight),
        };
      }

      const viewportWidth = Math.max(window.innerWidth || 0, 1);
      const viewportHeight = Math.max(window.innerHeight || 0, 1);
      const normalizedX = clamp(event.clientX / viewportWidth, 0, 1);
      const normalizedY = clamp(event.clientY / viewportHeight, 0, 1);
      const area = getTrackpadArea();

      return {
        x: area.x + normalizedX * area.width,
        y: area.y + normalizedY * area.height,
      };
    }

    function updateFromPointerEvent(event) {
      const point = pointerToScenePoint(event);
      const rightPosition = mapPointToRightPosition(point.x, point.y);
      applyRightPosition(rightPosition.x, rightPosition.y);
    }

    function setPressed(pressed) {
      leftHand.classList.toggle("pressed", pressed);

      if (toggleScenePressedClass) {
        scene.classList.toggle("is-pressed", pressed);
      }

      if (togglePressIndicator && pressIndicator) {
        pressIndicator.hidden = !pressed;
      }
    }

    function initialize() {
      applyLeftPosition(leftStart.x, leftStart.y);
      applyRightPosition(rightStart.x, rightStart.y);
      setPressed(false);
    }

    initialize();

    return {
      initialize,
      applyLeftPosition,
      applyRightPosition,
      getTrackpadArea,
      getRightHandRange,
      mapPointToRightPosition,
      pointerToScenePoint,
      updateFromPointerEvent,
      setPressed,
    };
  }

  window.trackpadGuide = {
    create: createTrackpadGuide,
  };
})();
