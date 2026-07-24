const fs = require('fs');
const { PROGRESS_PATH } = require('./paths.js');
const { log, colors } = require('./colors.js');
const { parseProgress } = require('./parse-progress.js');
const { checkFiles } = require('./validate.js');

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
  
  const now = new Date();
  const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const logEntry = `[${ts}] Step ${stepNum} blocked — ${reason} | Agent: ${process.env.GEMINI_MODEL || 'CLI'}`;
  let logIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) { if (lines[i].includes('LOG:')) { logIdx = i + 1; break; } }
  if (logIdx !== -1) {
    if (lines[logIdx] && lines[logIdx].includes('(no entries yet)')) lines[logIdx] = logEntry;
    else { let ai = logIdx; while (ai < lines.length && !lines[ai].includes('-->')) ai++; lines.splice(ai, 0, logEntry); }
  }
  
  fs.writeFileSync(PROGRESS_PATH, lines.join('\n'), 'utf8');
  
  console.log(`\n${colors.red}┌${'─'.repeat(74)}┐`);
  console.log(`│ ❌ STEP ${stepNum} BLOCKED`.padEnd(75) + "│");
  console.log(`│ ${reason.padEnd(73)}│`);
  console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
}

module.exports = { blockCommand };
