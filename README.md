# hands-on-trackpad

Interactive prototype for teaching trackpad finger movement.

## Run locally

1. Start the app server in this folder.
2. Open the app URL in your browser.

Example:

```bash
cd /workspaces/hands-on-trackpad
npm start
```

Then visit `http://localhost:8000`.

## Shared admin settings across computers

Admin Task 1, Task 2, and Task 3 settings, plus shared training pause and sound toggle, are stored on the server at `data/settings.json` through `GET/PUT /api/settings`.

For shared settings across multiple computers:

1. Run this app on one host machine or deployed server.
2. Have all computers open that same app URL (same origin/server).

When Admin saves a setting, all connected clients pull the shared value from the server (with a short refresh interval on the fullscreen page).