# Pumpkin Patch Studio

An original creative activity for Hands-On Trackpad, with its own homepage card. Separate from Three Little Pigs; no files inside the pigs game are changed.

Choose six pumpkin colors and four shapes; eight eye styles, six noses, eight mouths, six glasses, six hats, seven decorative extras, and three scenes. Pick a picture to add a piece. Default moving uses click, move, click; optional teacher-required dragging uses press, move, release. Resize, rotate, remove, undo, change the scene, light up the pumpkin, or save a clean 1000 × 600 PNG picture. New pumpkin is undoable. The same browser tab remembers its design; new sessions start fresh according to browser session-storage behavior.

Teacher settings: pumpkinStudioGameActive (true), pumpkinStudioVoiceInstructions (true), pumpkinStudioRequireClickAndDrag (false). The existing shared trackpadGuideEnabled and soundEnabled settings are respected. Teacher-disabled narration cannot be turned back on by students. Sounds are synthesized; no new MP3 files are needed.

The shared Freeze Screen capture listeners run first. Frozen and hidden pages stop game time, narration and sound, cancel an unfinished move, and release the guide's pressed state. Guide assets and appearance are reused from the existing app. The guide's column disappears when disabled.

The installer adds this game directory and makes checked changes to the homepage, teacher settings page, admin save payload, and server normalization. Existing settings data and other games are preserved. Restart the Node server after installation and Ctrl+F5 on the homepage, teacher settings, and game.

Three Little Pigs checkpoint: six levels (straw and sticks), picture action buttons, automatically closing doors, pigs visible in windows, and the separate gate-path updater that sends the pigs through the gate one at a time. The brick chapter is next. Pumpkin Studio does not change these files or that checkpoint.

Artwork and UI are original, inspired by the general pumpkin-maker idea requested by the user. The referenced ABCya page's interactive activity could not be inspected here; this is not a reproduction of its exact controls or art.

Validation: all design styles and stored-design bounds; simulated input in both movement modes; resize/rotate/undo/reset; teacher narration lock and disabled game; Freeze and hidden-tab pause; PNG export compared with a clean canvas render. Art scenes and options were rendered for visual inspection. A full browser layout test remains necessary because this environment has no available browser executable.
