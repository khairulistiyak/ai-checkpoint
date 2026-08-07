const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH, PLAN_DIR } = require('./paths.js');
const { parseProgressText } = require('../core/parse-progress.js');

function parseProgress() {
  const content = fs.readFileSync(PROGRESS_PATH, 'utf8');
  return parseProgressText(content);
}

function getPlanFiles() {
  const dirs = [PLAN_DIR, path.join(process.cwd(), '_archive', 'plans-completed')];
  const fileSet = new Set();
  const result = [];
  dirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach(f => {
        const fullPath = path.join(dir, f);
        if (f.endsWith('.md') && !f.startsWith('.') && fs.statSync(fullPath).isFile()) {
          if (!fileSet.has(f)) {
            fileSet.add(f);
            result.push(f);
          }
        }
      });
    }
  });
  return result;
}

function getPlanFilePath(pf) {
  const activePath = path.join(PLAN_DIR, pf);
  if (fs.existsSync(activePath)) return activePath;
  const archivePath = path.join(process.cwd(), '_archive', 'plans-completed', pf);
  if (fs.existsSync(archivePath)) return archivePath;
  return activePath;
}

function findStepInPlanFiles(stepNum) {
  const planFiles = getPlanFiles();
  for (const pf of planFiles) {
    const pfPath = getPlanFilePath(pf);
    if (!fs.existsSync(pfPath)) continue;
    const pfContent = fs.readFileSync(pfPath, 'utf8');
    const pfLines = pfContent.split(/\r?\n/);
    const stepRegex = new RegExp(`^#{2,3}\\s+(?:Step\\s+)?${stepNum.replace(/\./g, '\\.')}\\b`);
    const hasStep = pfLines.some(line => stepRegex.test(line));
    if (hasStep) return { planLines: pfLines, foundFile: pf };
  }
  return { planLines: [], foundFile: null };
}

module.exports = {
  parseProgress,
  getPlanFiles,
  getPlanFilePath,
  findStepInPlanFiles
};
