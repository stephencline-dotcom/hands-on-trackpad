# Moving Sound Mini Game

This project is a classroom mini game site that works on GitHub Pages.

It now includes:
- a nickname or class-number entry system stored in localStorage
- multiple games from one homepage
- a shared teacher dashboard in `teacher.html`
- Firebase Firestore for shared classroom results

Only nicknames or class numbers should be used.
Do not collect emails, passwords, last names, or other sensitive information.

## Files

- `index.html`: homepage and game launcher
- `script.js`: gameplay logic and result saving
- `teacher.html`: teacher dashboard page
- `teacher.js`: teacher dashboard table and summary logic
- `firebase-config.js`: your Firebase project configuration
- `game-results-store.js`: shared result saving/loading helper for Firestore

## Firebase Setup

Follow these steps to connect the dashboard to Firestore.

### 1. Create a Firebase project

1. Go to the Firebase Console.
2. Click `Add project`.
3. Enter a project name for your classroom games.
4. Finish the project setup.

### 2. Create a Web App

1. Inside the Firebase project, click the web icon `</>` to add a web app.
2. Give it a name like `classroom-mini-games`.
3. You do not need Firebase Hosting for this project.
4. Copy the Firebase web config values.

### 3. Turn on Firestore

1. In the Firebase Console, open `Firestore Database`.
2. Click `Create database`.
3. Start in `Production` or `Test` mode.
4. Choose a location near your classroom.

### 4. Add your Firebase config to this project

Open `firebase-config.js` and replace the placeholder values:

```js
const firebaseConfig = {
	apiKey: 'YOUR_API_KEY',
	authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
	projectId: 'YOUR_PROJECT_ID',
	storageBucket: 'YOUR_PROJECT_ID.firebasestorage.app',
	messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
	appId: 'YOUR_APP_ID',
};
```

Paste in the values from your Firebase web app.

### 5. Set Firestore rules for this first classroom version

This first shared version does not use logins yet.
That means the rules must allow the page to read and write results.

Use simple rules like this for now:

```txt
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /gameResults/{document=**} {
			allow read, write: if true;
		}
	}
}
```

Important:
- These rules are only okay for an early classroom prototype.
- Because there is no login yet, anyone with the site can read and write results.
- Only store nicknames or class numbers, never sensitive student information.

### 6. Publish to GitHub Pages

1. Push this project to GitHub.
2. Open the repository settings.
3. Turn on GitHub Pages.
4. Choose the branch and folder you want to publish.
5. Wait for GitHub Pages to build.

The site uses browser JavaScript files loaded from the Firebase CDN, so it stays compatible with GitHub Pages.

### 7. Test the shared dashboard

1. Open the site in one browser tab.
2. Enter a nickname or class number.
3. Play a game and finish it.
4. Open `teacher.html`.
5. Confirm the result appears in the table.
6. Try another device or browser window to make sure results are shared.

## What gets saved for each game result

Each saved result includes:
- game name
- student nickname
- score
- correct clicks
- missed clicks
- total attempts
- time spent playing
- timestamp

## Teacher Dashboard Features

The teacher dashboard shows:
- total plays across all games
- highest score overall
- average score overall
- average time spent
- results grouped by game
- a full results table
- filter by game name
- clear dashboard data button

## Notes for Teachers

- Student nicknames are remembered in the browser with localStorage.
- Shared classroom results are stored in Firestore.
- If Firebase is not configured yet, the site falls back to local browser storage so the games still work.
- This keeps the project easy to test before Firestore is fully set up.