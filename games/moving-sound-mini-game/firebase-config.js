// Firebase setup for a simple GitHub Pages classroom project.
// Replace the placeholder values below with the web app config from your Firebase project.
(function initializeFirebaseForClassroomDashboard() {
  const firebaseConfig = {
  apiKey: "AIzaSyCml4sPXJCkNqGPeZBJRob_vKcxsb6MrrE",
  authDomain: "moving-sound-mini-games.firebaseapp.com",
  projectId: "moving-sound-mini-games",
  storageBucket: "moving-sound-mini-games.firebasestorage.app",
  messagingSenderId: "539904636706",
  appId: "1:539904636706:web:4241edac4c82604dd2977b",
  measurementId: "G-JEXT8REN06"
};

  const placeholderValues = Object.values(firebaseConfig).some((value) => String(value).includes('YOUR_'));

  window.firebaseAppReady = false;
  window.firebaseSetupMessage = 'Firebase is not configured yet. Add your project values in firebase-config.js.';
  window.sharedFirestoreDb = null;

  if (!window.firebase) {
    console.warn('Firebase SDK failed to load. The dashboard will stay in local-only fallback mode.');
    return;
  }

  if (placeholderValues) {
    console.warn('Firebase config still has placeholder values. Update firebase-config.js to enable the shared dashboard.');
    return;
  }

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    window.sharedFirestoreDb = firebase.firestore();
    window.firebaseAppReady = true;
    window.firebaseSetupMessage = 'Connected to the shared Firestore classroom dashboard.';
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    window.firebaseSetupMessage = 'Firebase could not connect. Check the configuration values in firebase-config.js.';
  }
})();
