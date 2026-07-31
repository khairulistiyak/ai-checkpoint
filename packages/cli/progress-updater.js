const fs = require('fs');
const { PROGRESS_PATH } = require('./paths.js');

/**
 * Shared progress state updater — used by cmd-complete.js and cmd-block.js.
 * Handles: phase header, overall bar, NEXT pointer, log entry writing.
 */
function updateProgressState(lines, phases, targetPhase) {
  // 1. Update phase header percentage
  const pDone = targetPhase.steps.filter(s => s.status === 'done').length;
  const pTotal = targetPhase.steps.length;
  const pPct = Math.round((pDone / pTotal) * 100);
  lines[targetPhase.headerIndex] = lines[targetPhase.headerIndex].split('—')[0] + '— ' + (pPct === 100 ? "✅ 100% COMPLETE" : `🟡 ${pPct}% IN PROGRESS`);

  // 2. Update overall progress bar
  let totalS = 0, doneS = 0;
  phases.forEach(p => { totalS += p.steps.length; doneS += p.steps.filter(s => s.status === 'done').length; });
  const oPct = Math.round((doneS / totalS) * 100);
  const bar = "█".repeat(Math.round((oPct / 100) * 20)) + "░".repeat(20 - Math.round((oPct / 100) * 20));

  let foundOverall = false, foundBar = false;
  for (let i = 0; i < lines.length; i++) {
    if (!foundOverall && lines[i].includes('Overall Progress')) {
      lines[i] = `## 📊 Overall Progress: ${oPct}% (${doneS}/${totalS} steps complete)`;
      foundOverall = true;
    }
    if (!foundBar && /^\[[█░]+\]/.test(lines[i])) {
      lines[i] = `[${bar}] ${oPct}% (${doneS}/${totalS} steps complete)`;
      foundBar = true;
    }
    if (foundOverall && foundBar) break;
  }

  // 3. Update NEXT pointer
  let nextStr = "None (Project Complete) ✅", foundNext = false;
  for (const p of phases) { const s = p.steps.find(st => st.status !== 'done' && st.status !== 'blocked'); if (s) { nextStr = `Step ${s.number} — ${s.title}`; foundNext = true; break; } }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## 👉 NEXT:')) lines[i] = `## 👉 NEXT: ${nextStr}`;
    if (foundNext && lines[i].startsWith('> 📋 Details →')) { const m = nextStr.match(/Step (\d+)\.(\d+)/); if (m) lines[i] = `> 📋 Details → \`plan/\` → Phase ${m[1]} → Step ${m[1]}.${m[2]}`; }
  }

  return { pPct, oPct, doneS, totalS };
}

/**
 * Append a log entry to the UPDATE LOG section in PROGRESS.md
 */
function appendLogEntry(lines, stepNum, action, message) {
  const now = new Date();
  const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const logEntry = `[${ts}] Step ${stepNum} ${action} — ${message} | Agent: ${process.env.GEMINI_MODEL || 'CLI'}`;
  let logIdx = -1;
  for (let i = lines.length - 1; i >= 0; i--) { if (lines[i].includes('LOG:')) { logIdx = i + 1; break; } }
  if (logIdx !== -1) {
    if (lines[logIdx] && lines[logIdx].includes('(no entries yet)')) lines[logIdx] = logEntry;
    else { let ai = logIdx; while (ai < lines.length && !lines[ai].includes('-->')) ai++; lines.splice(ai, 0, logEntry); }
  }
}

/**
 * Write the updated lines back to PROGRESS.md
 */
function saveProgress(lines) {
  fs.writeFileSync(PROGRESS_PATH, lines.join('\n'), 'utf8');
}

module.exports = { updateProgressState, appendLogEntry, saveProgress };
