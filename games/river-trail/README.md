# River Trail Adventure

An original exploration game for Hands-On Trackpad, inspired by CKLA Kindergarten
Domain 6, Lesson 6, “The Lenape: The People of the Seasons.” The anthology describes
Lenape canoe travel, gathering berries and firewood, and gathering nuts and other
foods in autumn. The journeys, river, characters and route puzzles are fictional.
This game depicts one imagined historical setting; it does not represent every
Native American people or suggest that Lenape people exist only in the past.

## Five journeys

1. First Paddle: steer home around rocks.
2. Berry Bend: land and gather two bunches of berries.
3. Winding River: explore two landings for berries and fallen firewood; avoid logs.
4. Autumn Journey: gather berries, nuts and wood; follow the pictured landmark.
5. Find Your Way Home: a larger picture order, mixed landings and a longer route.

Layouts vary: landing sides, supply locations, rocks, log movement and landmarks.
Each round contains exactly enough supplies. Bumps may spill one basket, which
stays nearby until recovered. Supplies never disappear. There is no countdown,
health bar or game-over penalty. Returns to previous landings are always allowed.

## Controls

Default: move the pointer over the river to steer. Move out of the board to stop.
Click a nearby landing to explore. On shore, click a supply to approach and pick it up. Carry it back to the basket yourself,
then click the basket to put it in. Pick up the basket and carry it to the canoe.
Click a floating basket when close enough to scoop it up.

Optional click-and-drag: hold the canoe to steer; release to stop. On shore, click a supply to pick it up, then hold the helper and move to carry it.
Release near the basket to deposit it. Pick up and carry the basket before boarding. Landings,
reboarding and floating-basket recovery use single clicks in both modes.

The eyes button demonstrates the next action. Its reminder pulses after a mistake
or 15 active seconds without progress. Start/retry always waits for an explicit
Start click. A fresh pointer movement is required before the canoe starts moving.

## Classroom integration

Uses existing `/api/settings` and the existing admin Save Settings request:
`riverTrailGameActive` (true), `riverTrailVoiceInstructions` (false),
`riverTrailRequireClickAndDrag` (false), `riverTrailLevelCount` (5).
New homepage card participates in the existing shared `homeCardOrder`.
No new persistence system or changes to teacher logout/Freeze release.

Existing shared Home icon, trackpad guide, input-device guard and Freeze scripts
are reused. All game time, hints, movement and audio pause during Freeze, hidden
tabs, loss of focus and overlays. Synthesized river/paddle/footstep/reward sounds
require no new recordings. The classroom Sound setting is respected at load.

## Source files

model.js: pure, independently testable state and interactions.
art.js: original Canvas scenery, canoe, helper, supplies and animations.
game.js: input, UI, settings, pause handling and progression.
audio.js: quiet synthesized audio, started by a user gesture.
admin.js: existing shared settings form integration.

The installer verifies reviewed source hashes before writing, stages and checks
JavaScript, backs up outside the repository, and rolls back on failure. It never
edits data/settings.json and never commits or pushes.

## Manual carrying update

First Paddle is now 3,600 river units long, with a clear opening and two rocks at
72% and 84% of the route. The paddler has a seated overhead body, face and arms.

On shore, click a supply to have the helper approach and pick it up. Picking up
does not return the helper to the basket. Follow the pulsing arrows while moving
the pointer (default) or holding the helper (drag mode). Click the basket when
nearby, or release there in drag mode, to deposit the supply.

The basket stays on the ground until picked up. Carry it to the canoe and click
the canoe, or release there in drag mode, to board. Boarding without the basket
is blocked; moving near it never picks it up automatically. Cargo appears only
in the basket while on shore and moves into the canoe when boarding.
