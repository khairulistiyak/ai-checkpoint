const fs = require('fs');
const path = require('path');
const os = require('os');

function getHistoryPath(projectPath) {
  try {
    const settingsPath = path.join(os.homedir(), '.ai-checkpoint-dashboard', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      const proj = (settings.projects || []).find(p => p.path === projectPath);
      if (proj && proj.id) {
        const globalDir = path.join(os.homedir(), '.ai-checkpoint', 'projects', proj.id);
        return path.join(globalDir, 'intelligence-history.json');
      }
    }
  } catch {}
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
