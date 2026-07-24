const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH, PLAN_DIR } = require('./paths.js');

function parseProgress() {
  const content = fs.readFileSync(PROGRESS_PATH, 'utf8');
  const lines = content.split(/\r?\n/);
  
  const phases = [];
  let currentPhase = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const phaseMatch = line.match(/^## 🔷 Phase (\d+):\s*(.*?)\s*—\s*(.*)$/);
    if (phaseMatch) {
      if (currentPhase) phases.push(currentPhase);
      currentPhase = {
        number: parseInt(phaseMatch[1]),
        name: phaseMatch[2].trim(),
        statusText: phaseMatch[3].trim(),
        steps: [],
        headerIndex: i,
        headerLine: line
      };
      continue;
    }
    
    const stepMatch = line.match(/^\s*-\s*\[([ x!/~])\]\s*\*\*Step (\d+\.\d+)\*\*\s*—\s*(.*)$/);
    if (stepMatch && currentPhase) {
      currentPhase.steps.push({
        status: stepMatch[1] === 'x' ? 'done' : (stepMatch[1] === '/' || stepMatch[1] === '~') ? 'running' : stepMatch[1] === '!' ? 'blocked' : 'pending',
        number: stepMatch[2].trim(),
        title: stepMatch[3].trim(),
        lineIndex: i,
        lineContent: line
      });
    }
  }
  if (currentPhase) phases.push(currentPhase);
  
  return { content, lines, phases };
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
