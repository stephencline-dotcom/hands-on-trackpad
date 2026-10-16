# Harvest Heroes — First Harvest

Three kindergarten farm jobs for Hands-On Trackpad, inspired by CKLA Kindergarten Domain 5: Farms.

1. Your First Carrot Patch: seed three prepared holes, cover, water, pull upward, and deliver.
2. Ready the Field: plow two broad rows, plant corn, cover and water, snap ears sideways, and deliver.
3. A Mixed Harvest: prepare and care for carrot and corn rows, with fewer prompts.

Default controls: click a picture tool, then click its target. The selected tractor follows pointer movement over rows. Click a ripe crop, move up for carrots or sideways for corn, then click inside the wagon. Dragging tools and crops also works. Escape sets things down. Incorrect crop drops safely restore the crop. "Show me" demonstrates the next action without completing it.

Teacher settings: availability, spoken instructions, require click and drag, and chapter length (1–3). These use the existing shared `/api/settings` save flow and server persistence. Global Sound and Trackpad Guide settings apply. The speaker button changes this game's current sound state.

The opening chapter has no countdown, crop losses, or lives. Growth takes about three seconds of active play and pauses during Freeze, hidden tabs, and blur. Other patches remain available to work on. New fields vary their positions; Level 3 also varies the arrangement of crop rows. All generated rounds have the required tools and crop types.

Art and sound: original procedural Canvas illustrations; synthesized planting, soil, watering, tractor, harvesting, and success sounds. No new external media downloads are required. Existing shared Home and Trackpad Guide images are reused.

Open `/games/harvest-heroes/index.html` through the app server. Restart the server after installation so the new settings fields are loaded.

## Challenge update

Level 1 keeps the original guided introduction. Level 2 varies crop growth speed and gives two plants a one-time need for another drink. Level 3 has eight crops, three thirsty plants, and three caterpillars. A plant with a blue water-drop badge needs the watering can; a caterpillar can be clicked to gently remove it. These finite problems pause the affected plant's growth. Crops never disappear, and no countdown has been added. Smaller plants stay in the field until they are mature and sparkling. Show me and Help still work.

The tractor faces its horizontal movement direction while working a row. Its wheels and plow are mirrored together, keeping the plow behind it. Dirt particles follow the trailing side.

## Working farmer update

The farmer follows the cursor through the working area with animated steps. Choosing a tool and a patch queues a visible job: he walks over, plants, rakes, waters, or rescues a caterpillar. Jobs take effect when he performs them. Small gold markers show patches he is on his way to; duplicate requests for the same patch are ignored. Harvested crops are picked up and carried to the wagon by the farmer.

Choosing Plow makes the farmer walk to the parked tractor, climb into its cab, and drive. The driver is visible through the window. Plowing follows the tractor's actual position and direction. Switching tools or finishing the field makes him climb out beside the tractor. In required-drag mode, a movement made while he is boarding is saved so a quick drag is still completed. Movement, queued jobs, boarding, growth, and effects all pause during Freeze, hidden tabs, and loss of focus.

## Meadow visitors and clear parking

The tractor drives onto the side lane and parks at the lower left before the farmer climbs out. Its parking route does not plow new soil, and the tractor and attached plow finish outside the crop beds. Choosing another tool can queue work while the farmer parks.

Level 2 adds a rabbit visit and a deer visit. Level 3 adds three visits, with at most two visitors active at once. Rabbits hop and deer run toward corn. A nibbling visitor pauses that corn's growth and prevents harvesting it until gently cleared. No crops are lost. Click the animal, or use the picture bell labeled Shoo! The farmer walks over, rings the bell, and the visitor runs back to the meadow. Clicking an incoming visitor makes it wait for the farmer. Visits and jobs pause during Freeze, hidden tabs, and blur. The introductory carrot level has no wildlife.

## Crawling caterpillars

Caterpillars emerge from a small opening in the soil, wriggle up the stem, and settle onto a leaf. The clickable target follows the caterpillar through the animation. Clicking a caterpillar immediately clears it and briefly shows it scurrying away. No selected tool, farmer trip, or waiting for another job is required. Other farmer jobs and the selected tool continue. Their movement and exit animations use active game time, so Freeze and hidden or unfocused tabs pause them.
