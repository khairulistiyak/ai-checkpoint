const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH, PLAN_DIR } = require('./paths.js');
const { log } = require('./colors.js');
const { parseProgress, getPlanFiles } = require('./parse-progress.js');

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

function updateOverallBar() {
  const content = fs.readFileSync(PROGRESS_PATH, 'utf8');
  const lines = content.split(/\r?\n/);
  let totalS = 0, doneS = 0;

  for (const line of lines) {
    if (/^\s*-\s*\[[ x~/!]\]\s*\*\*Step/.test(line)) {
      totalS++;
      if (/^\s*-\s*\[x\]/.test(line)) doneS++;
    }
  }

  if (totalS === 0) return;
  const oPct = Math.round((doneS / totalS) * 100);
  const bar = '█'.repeat(Math.round((oPct / 100) * 20)) + '░'.repeat(20 - Math.round((oPct / 100) * 20));

  let foundOverall = false, foundBar = false;
  for (let i = 0; i < lines.length; i++) {
    if (!foundOverall && lines[i].includes('Overall Progress')) {
      lines[i] = `## 📊 Overall Progress: ${oPct}% (${doneS}/${totalS} steps complete)`;
      foundOverall = true;
    }
    if (!foundBar && /^\[([█░]+)\]/.test(lines[i])) {
      lines[i] = `[${bar}] ${oPct}% (${doneS}/${totalS} steps complete)`;
      foundBar = true;
    }
    if (foundOverall && foundBar) break;
  }

  let nextStr = 'None (Project Complete) ✅';
  for (const line of lines) {
    const m = line.match(/^\s*-\s*\[[ ~/!]\]\s*\*\*Step (\d+\.\d+)\*\*\s*—\s*(.+)$/);
    if (m) { nextStr = `Step ${m[1]} — ${m[2].replace(/\s*\(`[^`]+`\)\s*$/, '').trim()}`; break; }
  }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## 👉 NEXT:')) {
      lines[i] = `## 👉 NEXT: ${nextStr}`;
    }
  }

  fs.writeFileSync(PROGRESS_PATH, lines.join('\n'), 'utf8');
}

function syncPlansToProgress() {
  if (!fs.existsSync(PLAN_DIR)) return { added: [], skipped: [], errors: [] };
  if (!fs.existsSync(PROGRESS_PATH)) return { added: [], skipped: [], errors: ['PROGRESS.md not found'] };

  const planFiles = getPlanFiles();
  const existingPhases = getExistingPhaseNumbers();
  const existingSteps = getExistingStepNumbers();
  const added = [];
  const skipped = [];
  const errors = [];

  for (const pf of planFiles) {
    const pfPath = path.join(PLAN_DIR, pf);
    try {
      const { phaseNum, phaseName, steps } = parsePlanFileSteps(pfPath);
      if (!phaseNum || steps.length === 0) { skipped.push(pf); continue; }

      if (existingPhases.has(String(phaseNum))) {
        skipped.push(pf);
        continue;
      }

      const newSteps = steps.filter(s => !existingSteps.has(s.number));
      if (newSteps.length === 0) { skipped.push(pf); continue; }

      appendPhaseToProgress(phaseNum, phaseName || `Plan from ${pf}`, newSteps);
      added.push({ file: pf, phase: phaseNum, name: phaseName, stepCount: newSteps.length });

      for (const s of newSteps) existingSteps.add(s.number);
      existingPhases.add(String(phaseNum));
    } catch (e) {
      errors.push(`${pf}: ${e.message}`);
    }
  }

  if (added.length > 0) updateOverallBar();
  return { added, skipped, errors };
}

function silentSync() {
  try { syncPlansToProgress(); } catch {}
}

module.exports = { syncPlansToProgress, silentSync, parsePlanFileSteps };
