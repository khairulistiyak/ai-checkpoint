const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH, PLAN_DIR } = require('./paths.js');

function parsePlanFileSteps(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const stepsMap = new Map();
  let phaseName = null;
  let phaseNum = null;

  const baseName = path.basename(filePath);
  const filePhaseMatch = baseName.match(/phase-(\d+)/i);
  if (filePhaseMatch) phaseNum = parseInt(filePhaseMatch[1], 10);

  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;

    if (!phaseName) {
      const h1Match = line.match(/^#\s+(?:Phase\s+(\d+)[:\s—-]*)?(.*)/i);
      if (h1Match && h1Match[2]) {
        if (h1Match[1] && !phaseNum) phaseNum = parseInt(h1Match[1], 10);
        const candidate = h1Match[2].replace(/^[:\s—-]+/, '').trim();
        if (candidate) phaseName = candidate;
      }
    }

    const phaseHeader = line.match(/^#{1,3}\s+(?:\[?Phase\s+(\d+)\]?|Phase\s+(\d+))[:\s—-]*(.*)/i);
    if (phaseHeader) {
      const p = phaseHeader[1] || phaseHeader[2];
      if (p) phaseNum = parseInt(p, 10);
      if (phaseHeader[3] && phaseHeader[3].trim()) {
        phaseName = phaseHeader[3].replace(/\s*—.*$/, '').trim();
      }
    }

    let stepNum = null;
    let stepTitle = null;

    const headMatch = line.match(/^#{2,4}\s+(?:\[?[A-Z]+\]?\s*)?(?:Step\s+)?(\d+\.\d+)\s*(?:—|-|:|\.|\s)\s*(.+)/i);
    const checkMatch = line.match(/^\s*-\s*\[[ x!/~]\]\s*(?:(?:\*\*Step\s+|\*\*|\bStep\s+))?(\d+\.\d+)\*?\*?\s*(?:—|-|:|\.|\s)\s*(.+)/i);
    const tableMatch = line.match(/^\s*\|\s*(?:Step\s+)?(\d+\.\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)/i);

    if (headMatch) {
      stepNum = headMatch[1];
      stepTitle = headMatch[2].trim();
    } else if (checkMatch) {
      stepNum = checkMatch[1];
      stepTitle = checkMatch[2].trim();
    } else if (tableMatch) {
      stepNum = tableMatch[1];
      const col1 = tableMatch[2].trim().replace(/`/g, '');
      const col2 = tableMatch[3].trim();
      stepTitle = col1 ? (col2 ? col2 + ' (`' + col1 + '`)' : col1) : col2;
    }

    if (stepNum && stepTitle) {
      if (!phaseNum) phaseNum = parseInt(stepNum.split('.')[0], 10);
      if (!stepsMap.has(stepNum)) {
        stepsMap.set(stepNum, { number: stepNum, title: stepTitle });
      }
    }
  }

  const steps = Array.from(stepsMap.values()).sort((a, b) => {
    const [pA, sA] = a.number.split('.').map(Number);
    const [pB, sB] = b.number.split('.').map(Number);
    return pA !== pB ? pA - pB : sA - sB;
  });

  if (!phaseName) {
    phaseName = baseName.replace(/\.md$/, '').replace(/^phase-\d+-?/, '').replace(/-/g, ' ');
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
