const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH } = require('./paths.js');
const { log } = require('./colors.js');
const { parseProgress, findStepInPlanFiles } = require('./parse-progress.js');
const { checkFiles } = require('./validate.js');
const { silentSync } = require('./plan-sync.js');
const { saveIntegritySnapshot } = require('./integrity-guard.js');

function extractStepMeta(planLines, stepNum) {
  let fileLine = '', actionLine = '', insideStep = false;
  for (const line of planLines) {
    if (new RegExp('^#{2,3}\\s+(?:Step\\s+)?' + stepNum.replace(/\./g, '\\.') + '\\b').test(line)) {
      insideStep = true;
      continue;
    }
    if (insideStep && /^#{2,3}\s+(?:Step\s+)?/.test(line)) break;
    if (insideStep) {
      if (/^\s*-\s*\*\*File:?\*\*:?\s+/.test(line)) fileLine = line;
      if (/^\s*-\s*\*\*Action:?\*\*:?\s+/.test(line)) actionLine = line;
    }
  }
  const fileMatch = fileLine.match(/\`([^\`]+)\`/);
  const filePath = fileMatch ? fileMatch[1].trim() : '';
  const actionMatch = actionLine.match(/\*\*Action:?\*\*:?\s*\[?(.*?)\]?$/i);
  const action = actionMatch ? actionMatch[1].trim().toLowerCase() : 'create';
  return { filePath, action };
}

function generateBoilerplate(filePath, stepNum) {
  const ext = path.extname(filePath), baseName = path.basename(filePath, ext);
  if (ext === '.tsx') return `import React from 'react';\n\ninterface ${baseName}Props {}\n\nexport const ${baseName}: React.FC<${baseName}Props> = () => {\n  return <div>${baseName}</div>;\n};\n`;
  if (ext === '.ts') return `// ${baseName}\n`;
  if (ext === '.css') return `/* ${baseName} */\n`;
  return `// ${baseName} — Step ${stepNum}\n`;
}

function handleStepBoilerplate(filePath, action, stepNum) {
  if (!filePath) return;
  const targetAbsPath = path.join(process.cwd(), filePath);
  if (action !== 'create') return log.info(`Action is "${action}", not CREATE. Skipping boilerplate.`);
  if (filePath.includes('plan/') || filePath.includes('templates/')) return log.info(`Path is inside plan/ or templates/. Skipping boilerplate.`);
  if (filePath.includes('path/to')) return log.info(`Path looks like a placeholder. Skipping boilerplate.`);
  if (fs.existsSync(targetAbsPath)) return log.warn(`File ${filePath} already exists. Skipping.`);

  fs.mkdirSync(path.dirname(targetAbsPath), { recursive: true });
  fs.writeFileSync(targetAbsPath, generateBoilerplate(filePath, stepNum), 'utf8');
  log.success(`Created: ${filePath}`);
}

function startCommand(stepNum) {
  checkFiles();
  silentSync();
  if (!stepNum || !/^\d+\.\d+$/.test(stepNum)) {
    log.error(!stepNum ? 'Step number required (e.g., 2.2)' : `Invalid step format: "${stepNum}". Expected X.Y format (e.g., 2.2)`);
    process.exit(1);
  }

  const { lines, phases } = parseProgress();
  let targetStep = null, targetPhase = null;
  for (const p of phases) {
    const s = p.steps.find(st => st.number === stepNum);
    if (s) { targetStep = s; targetPhase = p; break; }
  }
  if (!targetStep) { log.error(`Step ${stepNum} not found!`); process.exit(1); }
  if (targetStep.status === 'done') { log.warn(`Step ${stepNum} already completed.`); process.exit(0); }

  log.info(`Initializing Step ${stepNum}...`);
  const { planLines, foundFile } = findStepInPlanFiles(stepNum);
  if (foundFile) log.info(`Found in: plan/${foundFile}`);
  else log.warn('Step details not found in plan files. Skipping boilerplate.');

  const { filePath, action } = extractStepMeta(planLines, stepNum);
  handleStepBoilerplate(filePath, action, stepNum);

  lines[targetStep.lineIndex] = lines[targetStep.lineIndex].replace(/-\s*\[([ x!/~])\]/, '- [~]');
  if (lines[targetPhase.headerIndex].includes('🔴 0% PENDING')) {
    lines[targetPhase.headerIndex] = lines[targetPhase.headerIndex].replace('🔴 0% PENDING', '🟡 0% IN PROGRESS');
  }

  fs.writeFileSync(PROGRESS_PATH, lines.join('\n'), 'utf8');

  // Persist active step for dashboard live detection
  const activeStepFile = path.join(path.dirname(PROGRESS_PATH), '.active-step');
  const activeData = { step: stepNum, title: targetStep.title, phase: targetPhase.number, phaseName: targetPhase.name, startedAt: new Date().toISOString() };
  fs.writeFileSync(activeStepFile, JSON.stringify(activeData, null, 2), 'utf8');

  saveIntegritySnapshot(stepNum);
  log.success(`Step ${stepNum} initialized [~]`);
}

module.exports = { startCommand };
