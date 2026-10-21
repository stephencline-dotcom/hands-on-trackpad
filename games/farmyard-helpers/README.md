# Farmyard Helpers

Three levels: food and water (6 jobs), matching four animal families (4 jobs), and combined care (17 jobs). Cow and sheep eat hay, hens eat grain, and pigs receive a vegetable basket. Water is needed by all animals. Pigs cool off in mud; fully cared-for families can move into shelter.

Default controls: click a tool then an animal; click a baby then its matching mother. Optional click-and-drag is set in the dedicated teacher settings tab. The farmer walks to jobs, performs them, and leads babies or adults. Jobs are queued and reserved to prevent duplicate work. Incorrect choices never remove progress or harm animals.

The eyes button combines spoken instructions, picture highlighting and a pointer demonstration. A turquoise/yellow reminder appears after an invalid attempt or 15 active seconds without progress; no countdown or penalty. Jobs, motion, audio and reminders pause for Freeze, hidden tabs and loss of focus. Reduced motion disables the eyes animation.

Settings use existing /api/settings storage and shared save: farmyardHelpersGameActive, farmyardHelpersVoiceInstructions, farmyardHelpersRequireClickAndDrag, farmyardHelpersLevelCount. Homepage availability and ordering use existing card attributes. No separate persistence system. Existing teacher logout/Freeze release code is unchanged.

Uses existing farmfootsteps.mp3, wateringcan.mp3, farmambience.mp3 (2.5% ambience volume), and harvestcheer.mp3. Other feedback is synthesized. No new sound downloads are required.

## Level 4: Read the Farmyard

Behavior clues replace always-visible need bubbles. The first randomized pair of animals needs care, then the second pair; evening arrives after those needs are met and all families move into shelter. Need combinations vary but remain finite and solvable. Picture hints appear for ten seconds only after using the eyes button. Existing reminders do not automatically reveal the answer. Teacher game length accepts 1–4; existing saved lengths are preserved, so select 4 and save to enable the challenge.
