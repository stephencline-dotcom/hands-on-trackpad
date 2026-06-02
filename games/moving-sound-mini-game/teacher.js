const gameFilterElement = document.getElementById('gameFilter');
const clearDashboardButton = document.getElementById('clearDashboardButton');
const totalPlaysValue = document.getElementById('totalPlaysValue');
const highestScoreValue = document.getElementById('highestScoreValue');
const averageScoreValue = document.getElementById('averageScoreValue');
const averageTimeValue = document.getElementById('averageTimeValue');
const resultsTableBody = document.getElementById('resultsTableBody');
const emptyDashboardState = document.getElementById('emptyDashboardState');
const dashboardStatusText = document.getElementById('dashboardStatusText');
const groupedResultsGrid = document.getElementById('groupedResultsGrid');
const emptyGroupedState = document.getElementById('emptyGroupedState');

let allResults = [];
let unsubscribeResults = null;

function formatAccuracy(value) {
  return `${(Number(value) || 0).toFixed(1)}%`;
}

function formatLevelsByGame(levelsByGame) {
  if (levelsByGame.length === 0) {
    return 'No completed levels yet';
  }

  return levelsByGame
    .map(({ gameName, levelCompleted }) => `${gameName}: Level ${levelCompleted}`)
    .join(' | ');
}

function renderFilterOptions(results) {
  const currentValue = gameFilterElement.value || 'All Games';
  const uniqueGames = [...new Set(results.map((result) => result.gameName).filter(Boolean))].sort();
  const options = ['All Games', ...uniqueGames];

  gameFilterElement.innerHTML = options
    .map((gameName) => `<option value="${gameName}">${gameName}</option>`)
    .join('');

  gameFilterElement.value = options.includes(currentValue) ? currentValue : 'All Games';
}

function buildStudentSummaries(results) {
  const studentMap = new Map();

  for (const result of results) {
    const studentName = result.studentName || 'Student';
    const gameName = result.gameName || 'Unknown Game';
    const levelCompleted = Math.max(0, Math.round(Number(result.levelCompleted) || 0));
    const correctClicks = Number(result.correctClicks) || 0;
    const missedClicks = Number(result.missedClicks) || 0;
    const totalClicks = Number(result.totalClicks) || 0;
    const summary = studentMap.get(studentName) || {
      studentName,
      gamesPlayed: new Set(),
      levelsByGame: new Map(),
      totalMissedClicks: 0,
      totalCorrectClicks: 0,
      totalClicks: 0,
    };

    summary.gamesPlayed.add(gameName);
    summary.levelsByGame.set(gameName, Math.max(summary.levelsByGame.get(gameName) || 0, levelCompleted));
    summary.totalMissedClicks += missedClicks;
    summary.totalCorrectClicks += correctClicks;
    summary.totalClicks += totalClicks;

    studentMap.set(studentName, summary);
  }

  return [...studentMap.values()]
    .map((summary) => ({
      studentName: summary.studentName,
      gamesPlayed: summary.gamesPlayed.size,
      levelsByGame: [...summary.levelsByGame.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([gameName, levelCompleted]) => ({ gameName, levelCompleted })),
      totalMissedClicks: summary.totalMissedClicks,
      averageClickAccuracy: summary.totalClicks > 0
        ? (summary.totalCorrectClicks / summary.totalClicks) * 100
        : 0,
    }))
    .sort((a, b) => a.studentName.localeCompare(b.studentName));
}

function renderSummary(results, studentSummaries) {
  const uniqueGames = new Set(results.map((result) => result.gameName || 'Unknown Game'));
  const totalCorrectClicks = results.reduce((sum, result) => sum + (Number(result.correctClicks) || 0), 0);
  const totalClicks = results.reduce((sum, result) => sum + (Number(result.totalClicks) || 0), 0);
  const averageAccuracy = totalClicks > 0 ? (totalCorrectClicks / totalClicks) * 100 : 0;

  totalPlaysValue.textContent = String(studentSummaries.length);
  highestScoreValue.textContent = String(uniqueGames.size);
  averageScoreValue.textContent = String(results.length);
  averageTimeValue.textContent = formatAccuracy(averageAccuracy);
}

function renderGroupedResults(results) {
  const groupedMap = new Map();

  for (const result of results) {
    const gameName = result.gameName || 'Unknown Game';
    const group = groupedMap.get(gameName) || [];
    group.push(result);
    groupedMap.set(gameName, group);
  }

  const groups = [...groupedMap.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  groupedResultsGrid.innerHTML = groups
    .map(([gameName, groupResults]) => {
      const uniqueStudents = new Set(groupResults.map((result) => result.studentName || 'Student')).size;
      const highestLevelCompleted = Math.max(...groupResults.map((result) => Number(result.levelCompleted) || 0));
      const totalCorrectClicks = groupResults.reduce((sum, result) => sum + (Number(result.correctClicks) || 0), 0);
      const totalClicks = groupResults.reduce((sum, result) => sum + (Number(result.totalClicks) || 0), 0);
      const averageAccuracy = totalClicks > 0 ? (totalCorrectClicks / totalClicks) * 100 : 0;

      return `
        <div class="group-card">
          <h3>${gameName}</h3>
          <span>Students: ${uniqueStudents}</span>
          <span>Highest level completed: ${highestLevelCompleted}</span>
          <span>Average accuracy: ${formatAccuracy(averageAccuracy)}</span>
        </div>
      `;
    })
    .join('');

  emptyGroupedState.hidden = groups.length > 0;
}

function renderTable(studentSummaries) {
  resultsTableBody.innerHTML = studentSummaries
    .map((student) => `
      <tr>
        <td>${student.studentName}</td>
        <td>${student.gamesPlayed}</td>
        <td>${formatLevelsByGame(student.levelsByGame)}</td>
        <td>${student.totalMissedClicks}</td>
        <td>${formatAccuracy(student.averageClickAccuracy)}</td>
      </tr>
    `)
    .join('');

  emptyDashboardState.hidden = studentSummaries.length > 0;
}

function renderDashboard() {
  renderFilterOptions(allResults);

  const activeFilter = gameFilterElement.value;
  const filteredResults = activeFilter === 'All Games'
    ? allResults
    : allResults.filter((result) => result.gameName === activeFilter);
  const studentSummaries = buildStudentSummaries(filteredResults);

  renderSummary(filteredResults, studentSummaries);
  renderGroupedResults(filteredResults);
  renderTable(studentSummaries);
}

async function clearDashboardData() {
  if (!window.confirm('Clear all saved dashboard data for this classroom dashboard?')) {
    return;
  }

  if (!window.gameResultsStore) {
    return;
  }

  await window.gameResultsStore.clearResults();
}

function startDashboardSubscription() {
  if (!window.gameResultsStore) {
    dashboardStatusText.textContent = 'Shared results store is unavailable.';
    return;
  }

  dashboardStatusText.textContent = window.gameResultsStore.getSetupMessage();

  unsubscribeResults = window.gameResultsStore.subscribe((results) => {
    allResults = results;
    renderDashboard();
  });
}

gameFilterElement.addEventListener('change', renderDashboard);
clearDashboardButton.addEventListener('click', () => {
  void clearDashboardData();
});
window.addEventListener('beforeunload', () => {
  if (typeof unsubscribeResults === 'function') {
    unsubscribeResults();
  }
});

// The teacher dashboard starts listening as soon as the page loads.
startDashboardSubscription();
