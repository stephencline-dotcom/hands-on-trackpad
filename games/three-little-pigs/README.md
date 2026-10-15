# Three Little Pigs — Straw and Sticks

Two playable chapters for classroom testing, with six levels:

1. Build the three wall sections with visible guidance.
2. Add the two roof halves and door, then invite Pig inside.
3. Build the whole straw house independently, shelter Pig, invite the wolf, and open the escape gate after the house falls.
4. Meet Big Brother at his woodland workshop: stand three posts and fit a long beam.
5. Fit stick wall panels, roof halves and door; invite both pigs inside.
6. Build the whole stick house independently; shelter both pigs, withstand three puffs, then open the escape gate so both can reach the brick-building brother.

Straw always blows down in the story. Escaping is a successful action, not a timed penalty. The sticks chapter is now playable. Bricks remain the next chapter.

Default input: slide onto a supply to carry it; move into a matching house space to place it. Move outside the canvas or press Escape to return a carried piece. Roof halves match their orientation. Required click-and-drag is an independent teacher setting; ordinary clicks still operate the gate. Arrow keys select supplies when the canvas is focused, Enter picks up, arrows move, Enter places, Escape returns. Tab leaves the canvas normally. The pulsing picture button inside the scene can also open the gate.

Retry keeps the layout. New build cycles through six supply arrangements; Retry keeps the same arrangement. Session progress remembers the current level in the same tab and migrates the original straw chapter progress. The optional URL ?chapter=sticks jumps forward to Level 4 without erasing later saved progress. Start over returns to Level 1. Show me demonstrates one piece without changing the student's building progress.

Teacher settings: threeLittlePigsGameActive (true), threeLittlePigsVoiceInstructions (true), threeLittlePigsRequireClickAndDrag (false). Existing trackpadGuideEnabled and soundEnabled settings are respected. Students cannot re-enable teacher-disabled narration. Sound effects are synthesized; no new MP3s are required.

The shared Freeze Screen capture listeners run before game pointer handlers. A frozen or hidden page stops game time, narration and sound, releases carried pieces and hand presses. The shared trackpad guide's appearance and API are reused unchanged.

This chapter update changes homepage and teacher description text plus files inside this game directory. It preserves the picture buttons, closing door and visible window faces. The stick chapter has two visually distinct pigs and one window for each. No server.js, admin-settings.js or data/settings.json changes. Ctrl+F5 after this chapter update; no server restart needed. Commit and push only when requested; exclude installer backups and local settings data.

Validation: JavaScript syntax and pure state rules; simulated pointer playthroughs in both input modes with the actual game script and canvas renderer; teacher narration lock; frozen/hidden game time; unsupported roof placement; demo, retry, replay and new build; installer hash guards, backups and repeat install. Original canvas artwork rendered and visually inspected. A full browser layout test could not run because Chromium is unavailable and its download is blocked. Test the page fit, shared image assets, audio and real trackpad locally before classroom use.
