const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH, PLAN_DIR } = require('./paths.js');
const { log } = require('./colors.js');
const { parseProgress, getPlanFiles, getPlanFilePath } = require('./parse-progress.js');
const { parsePlanFileSteps, getExistingStepNumbers, getExistingPhaseNumbers, appendPhaseToProgress } = require('./plan-sync-utils.js');

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
  const added = [], skipped = [], errors = [];

  for (const pf of planFiles) {
    const pfPath = getPlanFilePath(pf);
    try {
      const { phaseNum, phaseName, steps } = parsePlanFileSteps(pfPath);
      if (!phaseNum || steps.length === 0) { skipped.push(pf); continue; }
      if (existingPhases.has(String(phaseNum))) { skipped.push(pf); continue; }

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
