const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH } = require('./paths.js');
const { log, colors, getProgressBar } = require('./colors.js');
const { parseProgress } = require('./parse-progress.js');
const { checkFiles, validateCommand, verifyTargetFile } = require('./validate.js');

function completeCommand(stepNum, comment) {
  checkFiles();
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
  if (v.path) log.success(`Verified: ${path.relative(process.cwd(), v.path)}`);

  lines[targetStep.lineIndex] = lines[targetStep.lineIndex].replace(/-\s*\[([ x!/~])\]/, '- [x]');
  targetStep.status = 'done';
  
  const pDone = targetPhase.steps.filter(s => s.status === 'done').length;
  const pTotal = targetPhase.steps.length;
  const pPct = Math.round((pDone / pTotal) * 100);
  lines[targetPhase.headerIndex] = lines[targetPhase.headerIndex].split('—')[0] + '— ' + (pPct === 100 ? "✅ 100% COMPLETE" : `🟡 ${pPct}% IN PROGRESS`);
  
  let totalS = 0, doneS = 0;
  phases.forEach(p => { totalS += p.steps.length; doneS += p.steps.filter(s => s.status === 'done').length; });
  const oPct = Math.round((doneS / totalS) * 100);
  const bar = "█".repeat(Math.round((oPct / 100) * 20)) + "░".repeat(20 - Math.round((oPct / 100) * 20));
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Overall Progress:')) lines[i] = `## 📊 Overall Progress: ${oPct}% (${doneS}/${totalS} steps complete)`;
    if (/^\[[█░]+\]/.test(lines[i])) lines[i] = `[${bar}] ${oPct}% (${doneS}/${totalS} steps complete)`;
  }
  

  
  let nextStr = "None (Project Complete) ✅", foundNext = false;
  for (const p of phases) { const s = p.steps.find(st => st.status !== 'done' && st.status !== 'blocked'); if (s) { nextStr = `Step ${s.number} — ${s.title}`; foundNext = true; break; } }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## 👉 NEXT:')) lines[i] = `## 👉 NEXT: ${nextStr}`;
    if (foundNext && lines[i].startsWith('> 📋 Details →')) { const m = nextStr.match(/Step (\d+)\.(\d+)/); if (m) lines[i] = `> 📋 Details → \`plan/\` → Phase ${m[1]} → Step ${m[1]}.${m[2]}`; }
  }
  
  const now = new Date();
  const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const logEntry = `[${ts}] Step ${stepNum} completed — ${comment} | Agent: ${process.env.GEMINI_MODEL || 'CLI'}`;
  let logIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) { if (lines[i].includes('LOG:')) { logIdx = i + 1; break; } }
  if (logIdx !== -1) {
    if (lines[logIdx] && lines[logIdx].includes('(no entries yet)')) lines[logIdx] = logEntry;
    else { let ai = logIdx; while (ai < lines.length && !lines[ai].includes('-->')) ai++; lines.splice(ai, 0, logEntry); }
  }
  
  fs.writeFileSync(PROGRESS_PATH, lines.join('\n'), 'utf8');
  
  console.log(`\n${colors.green}┌${'─'.repeat(74)}┐`);
  console.log(`│ 🎉  STEP ${stepNum} COMPLETED!`.padEnd(75) + "│");
  console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
  
  if (pPct === 100) { console.log(`${colors.bgCyan} 🏆 PHASE ${targetPhase.number} COMPLETE: ${targetPhase.name.toUpperCase()} ${colors.reset}\n`); }
  console.log(`${colors.bright}Overall: ${colors.green}${oPct}%${colors.reset} ${getProgressBar(oPct, 20)} (${doneS}/${totalS})`);
}

module.exports = {
  completeCommand
};
