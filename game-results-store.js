const LEGACY_RESULTS_STORAGE_KEY = 'moving-sound-game-results-v1';
const FIRESTORE_RESULTS_COLLECTION = 'gameResults';

function normalizeSavedResult(result) {
  const correctClicks = Number(result.correctClicks) || 0;
  const missedClicks = Number(result.missedClicks) || 0;
  const totalClicks = Number(result.totalClicks ?? result.totalAttempts) || 0;

  return {
    id: result.id || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    gameName: result.gameName || 'Unknown Game',
    studentName: result.studentName || 'Student',
    levelCompleted: Math.max(0, Math.round(Number(result.levelCompleted) || 0)),
    correctClicks,
    missedClicks,
    totalClicks,
    clickAccuracy: totalClicks > 0
      ? (correctClicks / totalClicks) * 100
      : (Number(result.clickAccuracy) || 0),
    playedAtMs: Number(result.playedAtMs) || Date.now(),
  };
}

function loadLegacyResults() {
  try {
    const stored = localStorage.getItem(LEGACY_RESULTS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeSavedResult) : [];
  } catch {
    return [];
  }
}

function saveLegacyResults(results) {
  try {
    localStorage.setItem(LEGACY_RESULTS_STORAGE_KEY, JSON.stringify(results.map(normalizeSavedResult)));
  } catch {
    // Ignore local fallback save failures.
  }
}

async function saveResultToFirestore(result) {
  const normalized = normalizeSavedResult(result);

  await window.sharedFirestoreDb.collection(FIRESTORE_RESULTS_COLLECTION).add({
    studentName: normalized.studentName,
    gameName: normalized.gameName,
    levelCompleted: normalized.levelCompleted,
    missedClicks: normalized.missedClicks,
    totalClicks: normalized.totalClicks,
    correctClicks: normalized.correctClicks,
    clickAccuracy: normalized.clickAccuracy,
    playedAtMs: normalized.playedAtMs,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  return normalized;
}

async function loadResultsFromFirestore() {
  const snapshot = await window.sharedFirestoreDb
    .collection(FIRESTORE_RESULTS_COLLECTION)
    .orderBy('playedAtMs', 'desc')
    .get();

  return snapshot.docs.map((doc) => normalizeSavedResult({ id: doc.id, ...doc.data() }));
}

async function clearResultsFromFirestore() {
  const snapshot = await window.sharedFirestoreDb.collection(FIRESTORE_RESULTS_COLLECTION).get();

  if (snapshot.empty) {
    return;
  }

  const batch = window.sharedFirestoreDb.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

window.gameResultsStore = {
  // Games call this helper when a student finishes a level.
  async saveResult(result) {
    const normalized = normalizeSavedResult(result);

    if (window.firebaseAppReady && window.sharedFirestoreDb) {
      return saveResultToFirestore(normalized);
    }

    const results = loadLegacyResults();
    results.push(normalized);
    saveLegacyResults(results);
    return normalized;
  },

  // The teacher dashboard uses this to load the shared classroom results.
  async loadResults() {
    if (window.firebaseAppReady && window.sharedFirestoreDb) {
      return loadResultsFromFirestore();
    }

    return loadLegacyResults().sort((a, b) => b.playedAtMs - a.playedAtMs);
  },

  async clearResults() {
    if (window.firebaseAppReady && window.sharedFirestoreDb) {
      await clearResultsFromFirestore();
      return;
    }

    saveLegacyResults([]);
  },

  // Real-time updates help the teacher dashboard refresh automatically.
  subscribe(callback) {
    if (window.firebaseAppReady && window.sharedFirestoreDb) {
      return window.sharedFirestoreDb
        .collection(FIRESTORE_RESULTS_COLLECTION)
        .orderBy('playedAtMs', 'desc')
        .onSnapshot((snapshot) => {
          const results = snapshot.docs.map((doc) => normalizeSavedResult({ id: doc.id, ...doc.data() }));
          callback(results);
        }, (error) => {
          console.error('Firestore subscription failed:', error);
          callback([]);
        });
    }

    const handleStorage = (event) => {
      if (event.key === LEGACY_RESULTS_STORAGE_KEY) {
        callback(loadLegacyResults().sort((a, b) => b.playedAtMs - a.playedAtMs));
      }
    };

    window.addEventListener('storage', handleStorage);
    callback(loadLegacyResults().sort((a, b) => b.playedAtMs - a.playedAtMs));

    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  },

  getModeLabel() {
    return window.firebaseAppReady ? 'Shared Firestore mode' : 'Local fallback mode';
  },

  getSetupMessage() {
    return window.firebaseSetupMessage || 'Firebase status unavailable.';
  },
};
