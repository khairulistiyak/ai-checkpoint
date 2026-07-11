#!/usr/bin/env node

/**
 * ai-checkpoint CLI Tool (v5.0)
 * 
 * CLEAN STRUCTURE:
 *   .agents/  → system files (PROGRESS, RULES, scripts)
 *   plan/     → ONLY user's .md plan files (clean!)
 * 
 * Usage:
 *   ./l                     → Dashboard
 *   ./l start <step>        → Initialize step
 *   ./l c <step> "note"     → Complete step
 *   ./l v                   → Validate
 *   ./l h                   → Help
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════
// PATHS — System files in .agents/, plans in plan/
// ═══════════════════════════════════════════════════════════════════════
const AGENTS_DIR = path.join(process.cwd(), '.agents');
const PROGRESS_PATH = path.join(AGENTS_DIR, 'PROGRESS.md');
const PLAN_DIR = path.join(process.cwd(), 'plan');
const DRAFTS_DIR = path.join(PLAN_DIR, 'drafts');

// ═══════════════════════════════════════════════════════════════════════
// ANSI Colors
// ═══════════════════════════════════════════════════════════════════════
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgRed: '\x1b[41m\x1b[37m',
  bgCyan: '\x1b[46m\x1b[30m'
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✔ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.red}✘ ${msg}${colors.reset}`),
  header: (msg) => {
    console.log(`\n${colors.bright}${colors.cyan}┌${'─'.repeat(54)}┐`);
    console.log(`│ ${msg.toUpperCase().padEnd(52)} │`);
    console.log(`└${'─'.repeat(54)}┘${colors.reset}\n`);
  }
};

// ═══════════════════════════════════════════════════════════════════════
// Help
// ═══════════════════════════════════════════════════════════════════════
function showHelp() {
  console.log(`
${colors.bright}${colors.cyan}┌${'─'.repeat(54)}┐
│   Ledger CLI v5.0 — Clean Structure                   │
└${'─'.repeat(54)}┘${colors.reset}

${colors.bright}Structure:${colors.reset}
  ${colors.dim}.agents/${colors.reset}  → System files (PROGRESS.md, RULES.md, scripts)
  ${colors.dim}plan/${colors.reset}     → ${colors.green}শুধু তোমার .md plan files${colors.reset} (clean!)

${colors.bright}Commands:${colors.reset}
  ${colors.green}./l${colors.reset}                      Dashboard
  ${colors.green}./l start <step>${colors.reset}          Step শুরু করো
  ${colors.green}./l c <step> "note"${colors.reset}       Step complete করো
  ${colors.green}./l v${colors.reset}                     Validate sync
  ${colors.green}./l h${colors.reset}                     Help

${colors.bright}Plan File Naming:${colors.reset}
  ${colors.dim}plan/ folder এ যেকোনো নামে .md file:${colors.reset}
  ${colors.green}bugfix-upload.md${colors.reset}         ← meaningful name ✅
  ${colors.green}add-dark-mode.md${colors.reset}         ← descriptive name ✅
  ${colors.green}plan_01.md${colors.reset}               ← generic name (OK too)
`);
}

// ═══════════════════════════════════════════════════════════════════════
// File Checks
// ═══════════════════════════════════════════════════════════════════════
function checkFiles() {
  if (!fs.existsSync(PROGRESS_PATH)) {
    log.error(`PROGRESS.md not found at .agents/PROGRESS.md`);
    log.info(`Run the setup script first: bash /path/to/checkpoint-task-ledger/setup.sh`);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Parse PROGRESS.md (from .agents/)
// ═══════════════════════════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════
function getProgressBar(pct, size = 15) {
  const filled = Math.round((pct / 100) * size);
  return `[${colors.green}${"█".repeat(filled)}${colors.reset}${"░".repeat(size - filled)}]`;
}

function findFileRecursively(dir, fileName) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (['node_modules', 'dist', '.git', '.agents', 'plan'].includes(file)) continue;
      const found = findFileRecursively(fullPath, fileName);
      if (found) return found;
    } else if (file === fileName) return fullPath;
  }
  return null;
}

function verifyTargetFile(stepTitle) {
  const fileMatches = stepTitle.match(/[`(]([^`)]+\.(?:tsx|ts|css|js|json|jsx))[`)]/);
  if (!fileMatches) return { verified: true };

  const targetNameOrPath = fileMatches[1].trim();
  let absolutePath = path.join(process.cwd(), targetNameOrPath);

  if (!fs.existsSync(absolutePath)) {
    const srcDir = path.join(process.cwd(), 'src');
    if (fs.existsSync(srcDir)) {
      const foundPath = findFileRecursively(srcDir, path.basename(targetNameOrPath));
      if (foundPath) absolutePath = foundPath;
      else return { verified: false, error: `❌ target file "${targetNameOrPath}" does not exist.` };
    } else return { verified: false, error: `❌ target file "${targetNameOrPath}" does not exist.` };
  }

  const stats = fs.statSync(absolutePath);
  if (stats.size === 0) return { verified: false, error: `❌ target file "${targetNameOrPath}" is empty.` };
  if (stats.size < 10) return { verified: false, error: `❌ target file "${targetNameOrPath}" has no meaningful content.` };
  return { verified: true, path: absolutePath };
}

// Scan plan/ folder (top-level .md files only, NOT drafts/)
function getPlanFiles() {
  if (!fs.existsSync(PLAN_DIR)) return [];
  return fs.readdirSync(PLAN_DIR).filter(f => {
    const fullPath = path.join(PLAN_DIR, f);
    return f.endsWith('.md') && !f.startsWith('.') && fs.statSync(fullPath).isFile();
  });
}

// Find a specific step across all plan files
function findStepInPlanFiles(stepNum) {
  const planFiles = getPlanFiles();
  for (const pf of planFiles) {
    const pfPath = path.join(PLAN_DIR, pf);
    const pfContent = fs.readFileSync(pfPath, 'utf8');
    const pfLines = pfContent.split(/\r?\n/);
    const hasStep = pfLines.some(line => line.startsWith(`### Step ${stepNum} `) || line.startsWith(`### Step ${stepNum} —`));
    if (hasStep) return { planLines: pfLines, foundFile: pf };
  }
  return { planLines: [], foundFile: null };
}

// ═══════════════════════════════════════════════════════════════════════
// 1. STATUS
// ═══════════════════════════════════════════════════════════════════════
function statusCommand() {
  checkFiles();
  const { phases } = parseProgress();
  
  log.header("Ledger Progress Board");
  
  let totalSteps = 0, doneSteps = 0, activePhase = null;
  
  for (const p of phases) {
    const pDone = p.steps.filter(s => s.status === 'done').length;
    totalSteps += p.steps.length;
    doneSteps += pDone;
    if (pDone < p.steps.length && !activePhase) activePhase = p;
  }
  if (!activePhase && phases.length > 0) activePhase = phases[phases.length - 1];
  
  phases.forEach(p => {
    const pTotal = p.steps.length;
    const pDone = p.steps.filter(s => s.status === 'done').length;
    const pct = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
    const isActive = activePhase && p.number === activePhase.number;
    
    let bullet = "⚪", colorPfx = colors.gray, statusMarker = "PENDING";
    if (pct === 100) { bullet = "🟢"; colorPfx = colors.green; statusMarker = "COMPLETE"; }
    else if (pct > 0) { bullet = "🟡"; colorPfx = colors.yellow; statusMarker = `${pct}% ACTIVE`; }
    
    const barStr = getProgressBar(pct, 12);
    const label = `Phase ${p.number}: ${p.name}`;
    
    if (isActive) {
      console.log(`${colors.bright}┌${'─'.repeat(74)}┐${colors.reset}`);
      console.log(`│ ${bullet} ${colorPfx}${label.padEnd(45)}${colors.reset} ${barStr} ${colorPfx}${statusMarker.padStart(12)}${colors.reset} │`);
      console.log(`${colors.bright}├${'─'.repeat(74)}┤${colors.reset}`);
      p.steps.forEach(s => {
        let ind = `[ ]`, sc = colors.reset, st = s.title;
        if (s.status === 'done') { ind = `[✓]`; sc = colors.green; st = `${colors.dim}${colors.gray}${s.title}${colors.reset}`; }
        else if (s.status === 'running') { ind = `[/]`; sc = colors.yellow; st = `${colors.bright}${colors.yellow}${s.title}${colors.reset}`; }
        else if (s.status === 'blocked') { ind = `[!]`; sc = colors.red; }
        else sc = colors.bright;
        console.log(`│    ${sc}${ind} Step ${s.number.padEnd(4)} — ${st.padEnd(52)}${colors.reset} │`);
      });
      console.log(`${colors.bright}└${'─'.repeat(74)}┘${colors.reset}`);
    } else {
      console.log(` ${bullet} ${colors.dim}${label.padEnd(45)}${colors.reset} ${barStr} ${colorPfx}${statusMarker.padStart(12)}${colors.reset}`);
    }
  });
  
  const overallPct = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;
  let nextStr = "None (Project Complete) 🎉";
  for (const p of phases) { const s = p.steps.find(st => st.status !== 'done'); if (s) { nextStr = `Step ${s.number} — ${s.title}`; break; } }
  
  console.log(`\n┌${'─'.repeat(74)}┐`);
  console.log(`│ ${colors.bright}OVERALL:${colors.reset} ${getProgressBar(overallPct, 20)} ${colors.bright}${overallPct}% (${doneSteps}/${totalSteps})${colors.reset}`.padEnd(95) + `│`);
  console.log(`│ ${colors.dim}👉 NEXT:${colors.reset} ${nextStr.padEnd(63)} │`);
  console.log(`└${'─'.repeat(74)}┘\n`);
}

// ═══════════════════════════════════════════════════════════════════════
// 2. START
// ═══════════════════════════════════════════════════════════════════════
function startCommand(stepNum) {
  checkFiles();
  if (!stepNum) { log.error("Step number দাও (e.g., 2.2)"); process.exit(1); }

  const { lines, phases } = parseProgress();
  let targetStep = null, targetPhase = null;
  for (const p of phases) { const s = p.steps.find(st => st.number === stepNum); if (s) { targetStep = s; targetPhase = p; break; } }
  if (!targetStep) { log.error(`Step ${stepNum} not found!`); process.exit(1); }
  if (targetStep.status === 'done') { log.warn(`Step ${stepNum} already completed.`); process.exit(0); }

  log.info(`Initializing Step ${stepNum}...`);

  // Dynamic: scan plan/ folder
  const { planLines, foundFile } = findStepInPlanFiles(stepNum);
  if (foundFile) log.info(`Found in: plan/${foundFile}`);
  else log.warn(`Step details not found in plan files. Skipping boilerplate.`);

  let fileLine = "", actionLine = "", insideStep = false;
  for (const line of planLines) {
    if (line.startsWith(`### Step ${stepNum} `) || line.startsWith(`### Step ${stepNum} —`)) { insideStep = true; continue; }
    if (insideStep && line.startsWith('### ')) break;
    if (insideStep) {
      if (line.includes('**File**:')) fileLine = line;
      if (line.includes('**Action**:')) actionLine = line;
    }
  }

  if (fileLine) {
    const fileMatches = fileLine.match(/\`([^\`]+)\`/);
    if (fileMatches) {
      const filePath = fileMatches[1].trim();
      const targetAbsPath = path.join(process.cwd(), filePath);
      let action = 'create';
      if (actionLine) { const m = actionLine.match(/\*\*Action\*\*:\s*\[?(.*?)\]?$/i); if (m) action = m[1].trim().toLowerCase(); }
      
      if ((action.includes('modify') || action.includes('update')) && fs.existsSync(targetAbsPath)) {
        log.info(`File exists, action is "${action}". Skipping boilerplate.`);
      } else if (fs.existsSync(targetAbsPath)) {
        log.warn(`File ${filePath} already exists. Skipping.`);
      } else {
        fs.mkdirSync(path.dirname(targetAbsPath), { recursive: true });
        const ext = path.extname(filePath), baseName = path.basename(filePath, ext);
        let bp = `// ${baseName} — Step ${stepNum}\n`;
        if (ext === '.tsx') bp = `import React from 'react';\n\ninterface ${baseName}Props {}\n\nexport const ${baseName}: React.FC<${baseName}Props> = () => {\n  return <div>${baseName}</div>;\n};\n`;
        else if (ext === '.ts') bp = `// ${baseName}\n`;
        else if (ext === '.css') bp = `/* ${baseName} */\n`;
        fs.writeFileSync(targetAbsPath, bp, 'utf8');
        log.success(`Created: ${filePath}`);
      }
    }
  }

  // Mark [~]
  lines[targetStep.lineIndex] = lines[targetStep.lineIndex].replace(/-\s*\[([ x!/~])\]/, '- [~]');
  const ptr = new RegExp(`\\|\\s*Phase\\s+${targetPhase.number}\\s*\\|`);
  for (let i = 0; i < lines.length; i++) { if (ptr.test(lines[i]) && lines[i].includes('🔴 PENDING')) { lines[i] = lines[i].replace('🔴 PENDING', '🟡 IN PROGRESS'); break; } }
  if (lines[targetPhase.headerIndex].includes('🔴 0% PENDING')) lines[targetPhase.headerIndex] = lines[targetPhase.headerIndex].replace('🔴 0% PENDING', '🟡 0% IN PROGRESS');

  fs.writeFileSync(PROGRESS_PATH, lines.join('\n'), 'utf8');
  log.success(`Step ${stepNum} initialized [~]`);
}

// ═══════════════════════════════════════════════════════════════════════
// 3. COMPLETE
// ═══════════════════════════════════════════════════════════════════════
function completeCommand(stepNum, comment) {
  checkFiles();
  if (!stepNum) { log.error("Step number দাও"); process.exit(1); }
  if (!comment) { log.error("Comment দাও"); process.exit(1); }
  
  const { lines, phases } = parseProgress();
  let targetStep = null, targetPhase = null;
  for (const p of phases) { const s = p.steps.find(st => st.number === stepNum); if (s) { targetStep = s; targetPhase = p; break; } }
  if (!targetStep) { log.error(`Step ${stepNum} not found!`); process.exit(1); }
  if (targetStep.status === 'done') { log.warn(`Already completed.`); process.exit(0); }
  
  // Verify
  const v = verifyTargetFile(targetStep.title);
  if (!v.verified) {
    console.log(`\n${colors.red}┌${'─'.repeat(74)}┐`);
    console.log(`│ ❌ VERIFICATION FAILED`.padEnd(75) + "│");
    console.log(`│ ${v.error.padEnd(73)}│`);
    console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
    process.exit(1);
  }
  if (v.path) log.success(`Verified: ${path.relative(process.cwd(), v.path)}`);

  // Mark [x]
  lines[targetStep.lineIndex] = lines[targetStep.lineIndex].replace(/-\s*\[([ x!/~])\]/, '- [x]');
  targetStep.status = 'done';
  
  // Phase %
  const pDone = targetPhase.steps.filter(s => s.status === 'done').length;
  const pTotal = targetPhase.steps.length;
  const pPct = Math.round((pDone / pTotal) * 100);
  lines[targetPhase.headerIndex] = lines[targetPhase.headerIndex].split('—')[0] + '— ' + (pPct === 100 ? "✅ 100% COMPLETE" : `🟡 ${pPct}% IN PROGRESS`);
  
  // Overall
  let totalS = 0, doneS = 0;
  phases.forEach(p => { totalS += p.steps.length; doneS += p.steps.filter(s => s.status === 'done').length; });
  const oPct = Math.round((doneS / totalS) * 100);
  const bar = "█".repeat(Math.round((oPct / 100) * 20)) + "░".repeat(20 - Math.round((oPct / 100) * 20));
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Overall Progress:')) lines[i] = `## 📊 Overall Progress: ${oPct}% (${doneS}/${totalS} steps complete)`;
    if (lines[i].startsWith('[') && (lines[i].endsWith('steps complete)') || lines[i].includes('% ('))) lines[i] = `[${bar}] ${oPct}% (${doneS}/${totalS} steps complete)`;
  }
  
  // Table
  const ptr = new RegExp(`\\|\\s*Phase\\s+${targetPhase.number}\\s*\\|`);
  for (let i = 0; i < lines.length; i++) {
    if (ptr.test(lines[i])) { const p = lines[i].split('|'); p[3] = ` ${pDone}/${pTotal} `; p[4] = ` ${pPct === 100 ? "✅ COMPLETE" : "🟡 IN PROGRESS"} `; lines[i] = p.join('|'); break; }
  }
  
  // NEXT pointer
  let nextStr = "None (Project Complete) ✅", foundNext = false;
  for (const p of phases) { const s = p.steps.find(st => st.status !== 'done'); if (s) { nextStr = `Step ${s.number} — ${s.title}`; foundNext = true; break; } }
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## 👉 NEXT:')) lines[i] = `## 👉 NEXT: ${nextStr}`;
    if (foundNext && lines[i].startsWith('> 📋 Details →')) { const m = nextStr.match(/Step (\d+)\.(\d+)/); if (m) lines[i] = `> 📋 Details → \`plan/\` → Phase ${m[1]} → Step ${m[1]}.${m[2]}`; }
  }
  
  // Log
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

// ═══════════════════════════════════════════════════════════════════════
// 4. VALIDATE
// ═══════════════════════════════════════════════════════════════════════
function validateCommand() {
  checkFiles();
  const planFiles = getPlanFiles();
  if (planFiles.length === 0) { log.warn(`plan/ folder এ কোনো .md file নেই। Plan add করো।`); return; }
  
  log.header("Validating Ledger Alignment");
  
  const { phases } = parseProgress();
  const progressSteps = {};
  phases.forEach(p => p.steps.forEach(s => { progressSteps[s.number] = s.title; }));
  
  let mismatches = 0;
  
  planFiles.forEach(pf => {
    const content = fs.readFileSync(path.join(PLAN_DIR, pf), 'utf8');
    log.info(`Scanning: plan/${pf}`);
    content.split(/\r?\n/).forEach(line => {
      const m = line.match(/^###\s*Step\s*(\d+\.\d+)\s*—\s*(.*)$/);
      if (m) {
        if (!progressSteps[m[1]]) { log.error(`Step ${m[1]} ("${m[2]}") in plan MISSING in PROGRESS.md!`); mismatches++; }
        else delete progressSteps[m[1]];
      }
    });
  });
  
  Object.keys(progressSteps).forEach(num => { log.error(`Step ${num} in PROGRESS.md MISSING in plan files!`); mismatches++; });
  
  console.log("");
  if (mismatches === 0) {
    console.log(`${colors.green}┌${'─'.repeat(74)}┐`);
    console.log("│                  ✅  PLAN VALIDATION PASSED  ✅                         │");
    console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
  } else {
    console.log(`${colors.red}┌${'─'.repeat(74)}┐`);
    console.log(`│                  ❌  ${mismatches} MISMATCH(ES) FOUND  ❌                          │`);
    console.log(`└${'─'.repeat(74)}┘${colors.reset}\n`);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Main
// ═══════════════════════════════════════════════════════════════════════
const args = process.argv.slice(2);
const cmd = args[0] ? args[0].toLowerCase() : 'status';

switch (cmd) {
  case 'help': case '-h': case 'h': showHelp(); break;
  case 'status': case 's': statusCommand(); break;
  case 'start': startCommand(args[1]); break;
  case 'complete': case 'c': completeCommand(args[1], args[2]); break;
  case 'validate': case 'v': validateCommand(); break;
  default: log.error(`Unknown: "${cmd}"`); showHelp(); process.exit(1);
}
