const fs = require('fs');
const path = require('path');

function getHistoryPath(projectPath) {
  return path.join(projectPath, '.agents', 'intelligence-history.json');
}

function appendHistory(projectPath, report) {
  const historyPath = getHistoryPath(projectPath);
  let history = [];
  
  if (fs.existsSync(historyPath)) {
    try {
      history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
    } catch (e) {
      history = [];
    }
  }

  // Only keep the essential data for the trend chart
  const entry = {
    timestamp: report.timestamp || Date.now(),
    grade: report.grade,
    averageScore: report.averageScore,
    scores: report.scores
  };

  history.push(entry);

  // Keep last 30 scans
  if (history.length > 30) {
    history = history.slice(history.length - 30);
  }

  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
  
  return history;
}

function getHistory(projectPath) {
  const historyPath = getHistoryPath(projectPath);
  if (!fs.existsSync(historyPath)) return [];
  try {
    return JSON.parse(fs.readFileSync(historyPath, 'utf8'));
  } catch (e) {
    return [];
  }
}

module.exports = {
  appendHistory,
  getHistory
};
