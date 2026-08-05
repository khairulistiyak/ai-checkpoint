const fs = require('fs');
const path = require('path');
const { log, colors, getProgressBar } = require('./colors.js');
const { parseProgress } = require('./parse-progress.js');
const { checkFiles, validateCommand, verifyTargetFile } = require('./validate.js');
const { updateProgressState, appendLogEntry, saveProgress } = require('./progress-updater.js');
const { silentSync } = require('./plan-sync.js');
const { syntaxCheck } = require('./syntax-checker.js');
const { checkIntegrity } = require('./integrity-guard.js');

function completeCommand(stepNum, comment) {
  checkFiles();
  silentSync();
  if (!stepNum) { log.error("Step number দাও"); process.exit(1); }
  if (!comment) { log.error("Comment দাও"); process.exit(1); }
  
  const { lines, phases } = parseProgress();
  let targetStep = null, targetPhase = null;
  for (const p of phases) { const s = p.steps.find(st => st.number === stepNum); if (s) { targetStep = s; targetPhase = p; break; } }
  if (!targetStep) { log.error(`Step ${stepNum} not found!`); process.exit(1); }
  if (targetStep.status === 'done') { log.warn(`Already completed.`); process.exit(0); }

  validateCommand();

  const v = verifyTargetFile(targetStep.title);
  if (!v.verified) {
    console.log(`\n${colors.red}┌${'─'.repeat(74)}┐`);
    console.log(`│ ❌ VERIFICATION FAILED`.padEnd(75) + "│");
    console.log(`│ ${v.error.padEnd(73)}│`);
    console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
    process.exit(1);
  }
  if (v.path) {
    log.success(`Verified: ${path.relative(process.cwd(), v.path)}`);
    const res = syntaxCheck(v.path);
    if (!res.ok) {
      console.log(`\n${colors.red}┌${'─'.repeat(74)}┐`);
      console.log(`│ ❌ SYNTAX ERROR IN TARGET FILE`.padEnd(75) + "│");
      console.log(`│ ${(res.error || 'Syntax error').slice(0, 72).padEnd(73)}│`);
      console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
      process.exit(1);
    }
    if (res.warnings && res.warnings.length > 0) {
      res.warnings.forEach(w => log.warn(w));
    }
    const integ = checkIntegrity(stepNum, v.path);
    if (integ.warnings && integ.warnings.length > 0) {
      integ.warnings.forEach(w => log.warn(w));
    }
  }

  lines[targetStep.lineIndex] = lines[targetStep.lineIndex].replace(/-\s*\[([ x!/~])\]/, '- [x]');
  targetStep.status = 'done';
  
  const { pPct, oPct, doneS, totalS } = updateProgressState(lines, phases, targetPhase);
  appendLogEntry(lines, stepNum, 'completed', comment);
  saveProgress(lines);
  
  console.log(`\n${colors.green}┌${'─'.repeat(74)}┐`);
  console.log(`│ 🎉  STEP ${stepNum} COMPLETED!`.padEnd(75) + "│");
  console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
  
  if (pPct === 100) { console.log(`${colors.bgCyan} 🏆 PHASE ${targetPhase.number} COMPLETE: ${targetPhase.name.toUpperCase()} ${colors.reset}\n`); }
  console.log(`${colors.bright}Overall: ${colors.green}${oPct}%${colors.reset} ${getProgressBar(oPct, 20)} (${doneS}/${totalS})`);
}

module.exports = {
  completeCommand
};
