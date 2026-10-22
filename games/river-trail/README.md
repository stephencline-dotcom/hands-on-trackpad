# River Trail Adventure

An original fictional exploration game inspired by CKLA Kindergarten Domain 6,
Lesson 6, “The Lenape: The People of the Seasons.” The river, route puzzles,
characters and camp encounters are imagined; this is not a map of a real community
or a representation of every Native American people.

## Journeys and controls

1. First Paddle: a 3,600-unit ride with an easy opening and two late rocks.
2. Berry Bend: land, gather berries, and bring them home.
3. Winding River: berries, firewood, logs and woodland visitors.
4. Autumn Journey: add acorns, squirrels and a landmark fork.
5. Find Your Way Home: combine the skills with a larger picture order.

Default: move the pointer to paddle. Click a nearby landing to explore. Click a
supply and the helper approaches and picks it up. Carry it back yourself, then
click the basket nearby to deposit it. Pick up and carry the basket to the canoe
before boarding. Optional drag mode requires holding the canoe/helper to move;
release near the basket or canoe to deposit/board. Wrong drops keep supplies safe.

The eyes button demonstrates the next action and pulses after mistakes or idle
active time. Restart/retry always waits for Start. Freeze, hidden tabs, focus loss
and overlays pause all movement, visitor timers, campfire animation and audio.

## Teacher visitor controls

`riverTrailVisitorLevels` is an array for Levels 3, 4 and 5, each containing:

- `animals`: total animal attempts, 0–12.
- `gatherers`: total gatherer attempts, 0–12.
- `animalInterval`: active gathering seconds between animals, 3–60.
- `gathererInterval`: active gathering seconds between gatherers, 3–60.

Default rows are animals/gatherers 1/1, 2/1 and 3/1; intervals 8/12, 7/10 and 6/9.
Counts apply across the whole journey, including replacement stops. Each group
has independent timing. At most two animals and two gatherers are active at once.
Zero disables the chosen group. Levels 1 and 2 stay free of visitors.

Raccoons seek berries, squirrels seek acorns, and passing gatherers seek wood.
Visitors can take eligible ground supplies or contents of a basket on the ground.
Held supplies, a carried basket, and the item being picked up are protected. Click
approaching or rising visitors to shoo them away. One visitor reserves each ground
item or basket unit, preventing simultaneous duplicate theft.

`riverTrailCampChance` is a percentage, 0–100; default 40. New landings in Levels
3–5 may contain three seated people around an animated fire. When a gatherer
attempt is due and wood is available, a camper rises, walks to the wood or basket,
and returns to sit by the fire with the wood. Camps persist on revisits. Campers
use the same configured gatherer budget, so camps do not add surprise attempts.

## Replacement supplies and route movement

Each missing unit immediately creates a stocked stop farther downstream. The
village moves farther along if needed, while the original fork stays in place.
Visitor attempts are finite, so every round remains completable. The original
picture order is still required at home. Bump-spilled baskets remain recoverable.

Fork collisions slide small movement steps along the island boundary. A wrong
turn gives a landmark cue and lets the child paddle back; it never teleports the
canoe sideways or upstream. Existing trackpad coordinate mapping is preserved.

## Integration

Uses the existing `/api/settings`, shared admin Save Settings, Supabase settings,
Home icon, trackpad guide, input-device guard, Freeze and shared homepage order.
The availability/voice/drag/length keys are unchanged. Voice remains opt-in.
`visitor-settings.js` shares validation between server, game and admin controls.
The server must restart once after installing new settings fields.

No new sound recordings are required for this update. Quiet synthesized sounds
continue following the Sound button and all pause states. The installer validates
reviewed source hashes, stages JavaScript checks, backs up outside the repository
and rolls back on failure. It never edits data/settings.json or commits/pushes.
