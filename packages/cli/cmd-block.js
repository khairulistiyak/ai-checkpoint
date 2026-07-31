const { log, colors } = require('./colors.js');
const { parseProgress } = require('./parse-progress.js');
const { checkFiles } = require('./validate.js');
const { updateProgressState, appendLogEntry, saveProgress } = require('./progress-updater.js');

function blockCommand(stepNum, reason) {
  checkFiles();
  if (!stepNum) { log.error("Step number দাও"); process.exit(1); }
  if (!reason) { log.error("Reason দাও"); process.exit(1); }
  
  const { lines, phases } = parseProgress();
  let targetStep = null, targetPhase = null;
  for (const p of phases) { const s = p.steps.find(st => st.number === stepNum); if (s) { targetStep = s; targetPhase = p; break; } }
  if (!targetStep) { log.error(`Step ${stepNum} not found!`); process.exit(1); }
  if (targetStep.status === 'blocked') { log.warn(`Already blocked.`); process.exit(0); }

  lines[targetStep.lineIndex] = lines[targetStep.lineIndex].replace(/-\s*\[([ x!/~])\]/, '- [!]');
  targetStep.status = 'blocked';

  updateProgressState(lines, phases, targetPhase);
  appendLogEntry(lines, stepNum, 'blocked', reason);
  saveProgress(lines);
  
  console.log(`\n${colors.red}┌${'─'.repeat(74)}┐`);
  console.log(`│ ❌ STEP ${stepNum} BLOCKED`.padEnd(75) + "│");
  console.log(`│ ${reason.padEnd(73)}│`);
  console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
}

module.exports = { blockCommand };
