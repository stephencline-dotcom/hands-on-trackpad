# Hands-On Trackpad Future Game Template

This template preserves the approved game shell, controls, spacing, responsive behavior, and Trackpad Guide pattern used by current stable games.

## Required Game Structure

Use this exact outer order:

1. Compact header
2. One concise instruction line
3. Compact stat row
4. Large gameplay stage
5. Trackpad Guide directly below gameplay

Keep shared classes:
- shell
- game-shell
- game-header
- game-heading
- game-header-controls
- game-instructions
- game-stats
- game-stats-row
- game-stat
- game-stage
- game-guide
- imported-trackpad-guide
- imported-trackpad-scene
- game-preserve-only

## Final Home Button Standard

Use house icon only with no visible Home text.

Standard markup pattern:

```html
<button class="back-button game-header-button" type="button" aria-label="Home" title="Home">
  <img class="home-btn-icon" src="images/home-icon.svg" alt="" aria-hidden="true" />
</button>
```

Required button presentation:
- width: 42px
- height: 36px
- min-width: 42px
- padding: 0
- border-radius: 10px
- approved dark background and approved border
- centered icon

House image presentation:
- width: 19px
- height: 19px
- filter: brightness(0) invert(1)
- pointer-events: none

Path rule:
- Use the correct relative path based on where the new game file is located.
- If the new game file is at project root, use src="images/home-icon.svg".
- If the new game file is under a nested folder (for example games/some-game/), adjust the path accordingly (for example ../../images/home-icon.svg).
- Do not copy a nested path blindly.

## Final Sound Button Standard

Use icon-only states:
- 🔊 = sound on
- 🔇 = sound off

Do not show text labels such as Sound: On or Sound: Off.

Button presentation:
- same 42x36 dimensions as Home
- same dark background and border
- font-size: 20px
- line-height: 1
- include aria-label, title, and aria-pressed

Example (reference only):

```js
soundButton.textContent = soundOn ? "🔊" : "🔇";
soundButton.setAttribute("aria-label", soundOn ? "Sound on" : "Sound off");
soundButton.title = soundOn ? "Sound on" : "Sound off";
soundButton.setAttribute("aria-pressed", String(soundOn));
```

## Stat Rules

- Show a maximum of 3 visible stat pills.
- Only show values needed while playing.
- Avoid duplicate Status, Score, Timer, and Target when already visible inside gameplay.

If JavaScript needs hidden values:
- Keep the IDs in the DOM.
- Use the preserve-only pattern so they do not consume layout.

Preserve-only pattern already used:
- class: game-preserve-only

## Gameplay Stage Safety

Critical rule:
- The shell controls outer presentation.
- Gameplay controls internal geometry.

Do not force gameplay internals to:
- width: 100%
- height: 100%
- min-height: 0

unless that game was explicitly designed for those values.

Reason:
- Forcing shell sizing onto internals can break pointer mapping, collision, animation coordinates, canvas geometry, object placement, and drag/drop math.

Rule:
- Let the shell adapt around the game.
- Do not distort gameplay internals to make a screen fit.

## Trackpad Guide Standard

- Place Trackpad Guide directly below gameplay.
- Reuse shared trackpad-guide.js behavior.
- Do not create a separate guide implementation for every new game.
- Do not globally modify .scene, .trackpad, or .hand for one game.

When explicit scene width is needed, use:
- width: 300px;
- max-width: 100%;

Do not use:
- width: min(100%, 300px);

if visual testing shows unexpected shrink behavior.

Also:
- Shared guide hand movement is already tuned.
- Do not create new hand sensitivity rules unless the game truly requires it.

## Fullscreen Trackpad Trainer Exception

The Fullscreen Trackpad Trainer is not the model for regular game guide movement.

- Fullscreen trainer uses direct cursor-to-fingertip tracking over the trackpad image.
- Regular games use shared illustrative guide behavior from trackpad-guide.js.

Future games should use the regular shared guide unless the game is explicitly a trackpad-training activity requiring direct fingertip tracking.

Do not copy fullscreen mapping into ordinary games.

## Responsive Height System

A. Normal/tall screens
- Use approved full layout.

B. Chromebook / approximately 1366x768
- Use compact responsive behavior.
- Game should mostly fit without unnecessary scrolling.

C. Very short viewport <=600px
- Prioritize header, instructions, stats, gameplay, then Trackpad Guide.
- Modest vertical scrolling to reach the full Trackpad Guide is acceptable.
- Do not crush gameplay just to fit everything into 551px.

Explicit rule:
- At very short heights, preserve usable gameplay before forcing the full Trackpad Guide into the initial viewport.

Do not use short-screen fixes that alter gameplay geometry.

## CSS Scoping Rules

Future game-specific exceptions must be scoped to that game.

Use scoped selectors such as:
- #futureGameScreen ...
- body.future-game-page ...

Do not modify these globally just to accommodate one new game:
- .game-shell
- .game-header
- .game-stage
- .game-guide
- .scene
- .trackpad
- .hand
- button
- a

Generic/shared CSS should change only when intended for every game.

## Future Game Workflow

Step 1:
Copy game-template.html.

Step 2:
Rename placeholder screen/page classes and IDs.

Step 3:
Add game-specific gameplay inside .game-stage.

Step 4:
Connect existing shared Home/Sound/Trackpad systems.

Step 5:
Add no more than 3 visible stats.

Step 6:
Test gameplay BEFORE adjusting presentation.

Step 7:
Test at:
- tall desktop
- 1366x768
- <=600px viewport height

Step 8:
If something is visually wrong, fix only that game's scoped presentation.

Step 9:
Do not modify already-approved games to make the new game fit.

Step 10:
Freeze the game once approved.

## DO NOT DO THIS

- Do not redesign the shared shell for one game.
- Do not modify existing games to make a new game fit.
- Do not change global CSS when a scoped rule will work.
- Do not duplicate Status/Score/Timer unnecessarily.
- Do not create a unique header layout for each game.
- Do not resize gameplay geometry just to fill the shell.
- Do not replace working IDs after JavaScript is attached.
- Do not assume a CSS change worked just because the code changed.
- Verify the visible browser result.
- Do not claim completion without testing the actual rendered page.

## New Game Checklist

BEFORE GAMEPLAY:

[ ] Uses approved Game Shell
[ ] House icon Home button
[ ] Sound icon button
[ ] Home/Sound inside header
[ ] One concise instruction line
[ ] Maximum 3 visible stats
[ ] Large gameplay stage
[ ] Trackpad Guide directly below stage

GAMEPLAY SAFETY:

[ ] Existing IDs preserved
[ ] Pointer mapping verified
[ ] Collision verified
[ ] Animation geometry verified
[ ] Scoring verified
[ ] Timer verified
[ ] Sound toggle verified
[ ] Trackpad Guide verified

RESPONSIVE TESTING:

[ ] Tall monitor tested
[ ] 1366x768 tested
[ ] <=600px viewport height tested
[ ] No horizontal overflow
[ ] Gameplay remains usable
[ ] Modest short-screen scrolling acceptable
[ ] No unnecessary global CSS changes

FINAL:

[ ] No other game changed
[ ] No shared gameplay logic changed unnecessarily
[ ] Browser result visually verified
[ ] Game frozen after approval
