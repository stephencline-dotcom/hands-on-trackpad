'use strict';

const deerArena =
  document.getElementById('deerArena');

const playerDeer =
  document.getElementById('playerDeer');

const deerStartButton =
  document.getElementById('deerStartButton');

const deerSoundButton =
  document.getElementById('deerSoundButton');

const deerStatus =
  document.getElementById('deerStatus');

const deerLevelDisplay =
  document.getElementById('deerLevel');

const deerGoalDisplay =
  document.getElementById('deerGoal');

const deerMissesDisplay =
  document.getElementById('deerMisses');

const deerScoreDisplay =
  document.getElementById('deerScore');

const deerTimeDisplay =
  document.getElementById('deerTime');

const trackpadScene =
  document.getElementById('deerTrackpadScene');

const leftHand =
  document.getElementById('deerTrackpadLeftHand');

const rightHand =
  document.getElementById('deerTrackpadRightHand');

if (
  window.trackpadGuide &&
  trackpadScene &&
  leftHand &&
  rightHand
) {
  const guide =
    window.trackpadGuide.create({
      scene: trackpadScene,
      leftHand,
      rightHand,
      pointerSpace: 'viewport',
    });

  if (
    guide &&
    typeof guide.initialize === 'function'
  ) {
    guide.initialize();
  }
}
