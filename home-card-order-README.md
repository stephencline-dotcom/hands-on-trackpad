# Homepage arrangement and new-game admin panels

In Admin, choose Arrange homepage cards. This opens the homepage in teacher edit mode. Drag a card or use its arrow buttons; the drag handle also supports keyboard arrows. Disabled cards can be arranged without enabling them. Save order applies the order through the existing shared settings API. Cancel discards the draft. Restore default order changes the draft only until Save order is chosen.

Game cards can be freely reordered within the game grid. The two training tools can be reordered within their separate top row. Save order applies to both groups. New games missing from a saved order are appended after existing games. Removed cards do not break the saved order. Cards are identified by their existing data-game-active-key, so changing a title or thumbnail does not change their saved position.

Students receive the order on page load and about every 10 seconds while their homepage is visible. The order is cached locally for a temporary connection outage, but teachers must load shared settings before editing. Editing controls are shown only for the existing teacher browser session. The established game availability checks and teacher login/logout behavior are unchanged.

The setting homeCardOrder is saved with existing settings (including Supabase on the deployed app). The server preserves it when ordinary admin settings are saved. The editor submits only this setting, verifies the response, and retains a draft if saving is not confirmed. It checks for a newer order from another window before submitting.

Pumpkin Patch Studio and Three Little Pigs now have standard game-settings tabs. Their existing active switches have moved into Activity Availability, with the same IDs and stored values. Voice and drag settings remain in their game panels. The existing tab-switching and settings snapshot code is reused.

Installation updates index.html, admin-settings.html and server.js, and adds home-card-order-model.js, home-card-order.js, home-card-order.css, and this guide. It does not edit game files, shared guides, Freeze Screen code, home-admin.js, admin-settings.js, or data/settings.json. Backups are created before writing. Source hashes are checked before installation, and JavaScript files are validated with node --check. Restart the Node server and Ctrl+F5 on the homepage and admin page afterward.

Verification: pure ordering/sanitizing rules; simulated student/admin DOM interactions, pointer drag/drop, arrow controls, disabled cards, training tools, Cancel/default restore, failed saves and concurrent-change guard; actual HTTP GET/PUT through the server with local storage and mocked Supabase persistence; retained order after ordinary settings saves and server restart; unchanged live Freeze reset behavior; parsed admin markup and every old/new tab tested through the existing tab-switching function. Installer checks cover first/repeat installation, backups, source guards and settings/game preservation. Full browser layout and real trackpad dragging still require a local browser test.

Compatibility revision: rebuilt against the current files uploaded after the first installer safely refused a source mismatch. Preserves pumpkinStudioMenuScrolling, its admin control, the updated no-click movement instructions, and the pumpkin admin.js?v=2 reference.
