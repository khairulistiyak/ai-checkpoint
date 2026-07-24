const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH, PLAN_DIR } = require('./paths.js');
const { parseProgressText } = require('../core/parse-progress.js');

function parseProgress() {
  const content = fs.readFileSync(PROGRESS_PATH, 'utf8');
  return parseProgressText(content);
}

function getPlanFiles() {
  if (!fs.existsSync(PLAN_DIR)) return [];
  return fs.readdirSync(PLAN_DIR).filter(f => {
    const fullPath = path.join(PLAN_DIR, f);
    return f.endsWith('.md') && !f.startsWith('.') && fs.statSync(fullPath).isFile();
  });
}

function findStepInPlanFiles(stepNum) {
  const planFiles = getPlanFiles();
  for (const pf of planFiles) {
    const pfPath = path.join(PLAN_DIR, pf);
    const pfContent = fs.readFileSync(pfPath, 'utf8');
    const pfLines = pfContent.split(/\r?\n/);
    const hasStep = pfLines.some(line => /^#{2,3}\s+Step\s+/.test(line) && line.includes(stepNum));
    if (hasStep) return { planLines: pfLines, foundFile: pf };
  }
  return { planLines: [], foundFile: null };
}

module.exports = {
  parseProgress,
  getPlanFiles,
  findStepInPlanFiles
};
