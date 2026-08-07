const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH, PLAN_DIR } = require('./paths.js');

function parsePlanFileSteps(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const steps = [];
  let phaseName = null;
  let phaseNum = null;

  for (const line of lines) {
    const phaseMatch = line.match(/^##\s+Phase\s+(\d+):\s*(.+)/);
    if (phaseMatch) {
      phaseNum = parseInt(phaseMatch[1]);
      phaseName = phaseMatch[2].replace(/\s*—.*$/, '').trim();
    }
    const stepMatch = line.match(/^###\s+Step\s+(\d+\.\d+)\s+—\s+(.+)/);
    if (stepMatch) {
      if (!phaseNum) {
        const p = stepMatch[1].split('.')[0];
        phaseNum = parseInt(p);
      }
      steps.push({ number: stepMatch[1], title: stepMatch[2].trim() });
    }
  }

  return { phaseNum, phaseName, steps };
}

function getExistingStepNumbers() {
  if (!fs.existsSync(PROGRESS_PATH)) return new Set();
  const content = fs.readFileSync(PROGRESS_PATH, 'utf8');
  const matches = content.match(/\*\*Step (\d+\.\d+)\*\*/g) || [];
  return new Set(matches.map(m => m.match(/(\d+\.\d+)/)[1]));
}

function getExistingPhaseNumbers() {
  if (!fs.existsSync(PROGRESS_PATH)) return new Set();
  const content = fs.readFileSync(PROGRESS_PATH, 'utf8');
  const matches = content.match(/Phase (\d+):/g) || [];
  return new Set(matches.map(m => m.match(/(\d+)/)[1]));
}

function appendPhaseToProgress(phaseNum, phaseName, steps) {
  const content = fs.readFileSync(PROGRESS_PATH, 'utf8');
  const lines = content.split(/\r?\n/);

  const phaseBlock = [
    '',
    '---',
    '',
    `## 🔷 Phase ${phaseNum}: ${phaseName} — 🔴 0% PENDING`,
    ''
  ];
  for (const step of steps) {
    const fileMatch = step.title.match(/\(`([^`]+)`\)/);
    const filePart = fileMatch ? ` (\`${fileMatch[1]}\`)` : '';
    const cleanTitle = step.title.replace(/\s*\(`[^`]+`\)\s*$/, '');
    phaseBlock.push(`- [ ] **Step ${step.number}** — ${cleanTitle}${filePart}`);
  }
  phaseBlock.push('');

  const newLines = [...lines, ...phaseBlock];
  fs.writeFileSync(PROGRESS_PATH, newLines.join('\n'), 'utf8');
}

module.exports = {
  parsePlanFileSteps,
  getExistingStepNumbers,
  getExistingPhaseNumbers,
  appendPhaseToProgress
};
