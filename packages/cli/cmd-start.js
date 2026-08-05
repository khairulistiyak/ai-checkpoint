const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH } = require('./paths.js');
const { log } = require('./colors.js');
const { parseProgress, findStepInPlanFiles } = require('./parse-progress.js');
const { checkFiles } = require('./validate.js');
const { silentSync } = require('./plan-sync.js');
const { saveIntegritySnapshot } = require('./integrity-guard.js');

function startCommand(stepNum) {
  checkFiles();
  silentSync();
  if (!stepNum) { log.error("Step number দাও (e.g., 2.2)"); process.exit(1); }
  if (!/^\d+\.\d+$/.test(stepNum)) { log.error(`Invalid step format: "${stepNum}". Expected X.Y format (e.g., 2.2)`); process.exit(1); }

  const { lines, phases } = parseProgress();
  let targetStep = null, targetPhase = null;
  for (const p of phases) { const s = p.steps.find(st => st.number === stepNum); if (s) { targetStep = s; targetPhase = p; break; } }
  if (!targetStep) { log.error(`Step ${stepNum} not found!`); process.exit(1); }
  if (targetStep.status === 'done') { log.warn(`Step ${stepNum} already completed.`); process.exit(0); }

  log.info(`Initializing Step ${stepNum}...`);

  const { planLines, foundFile } = findStepInPlanFiles(stepNum);
  if (foundFile) log.info(`Found in: plan/${foundFile}`);
  else log.warn(`Step details not found in plan files. Skipping boilerplate.`);

  let fileLine = "", actionLine = "", insideStep = false;
  for (const line of planLines) {
    if (new RegExp('^#{2,3}\\s+(?:Step\\s+)?' + stepNum.replace(/\./g, '\\.') + '\\b').test(line)) { insideStep = true; continue; }
    if (insideStep && /^#{2,3}\s+(?:Step\s+)?/.test(line)) break;
    if (insideStep) {
      if (/^\s*-\s*\*\*File:?\*\*:?\s+/.test(line)) fileLine = line;
      if (/^\s*-\s*\*\*Action:?\*\*:?\s+/.test(line)) actionLine = line;
    }
  }

  if (fileLine) {
    const fileMatches = fileLine.match(/\`([^\`]+)\`/);
    if (fileMatches) {
      const filePath = fileMatches[1].trim();
      const targetAbsPath = path.join(process.cwd(), filePath);
      let action = 'create';
      if (actionLine) { const m = actionLine.match(/\*\*Action:?\*\*:?\s*\[?(.*?)\]?$/i); if (m) action = m[1].trim().toLowerCase(); }
      
      const isCreate = action === 'create';
      const isSystemPath = filePath.includes('plan/') || filePath.includes('templates/');
      const isPlaceholder = filePath.includes('path/to');

      if (!isCreate) {
        log.info(`Action is "${action}", not CREATE. Skipping boilerplate.`);
      } else if (isSystemPath) {
        log.info(`Path is inside plan/ or templates/. Skipping boilerplate.`);
      } else if (isPlaceholder) {
        log.info(`Path looks like a placeholder. Skipping boilerplate.`);
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

  lines[targetStep.lineIndex] = lines[targetStep.lineIndex].replace(/-\s*\[([ x!/~])\]/, '- [~]');
  if (lines[targetPhase.headerIndex].includes('🔴 0% PENDING')) lines[targetPhase.headerIndex] = lines[targetPhase.headerIndex].replace('🔴 0% PENDING', '🟡 0% IN PROGRESS');

  fs.writeFileSync(PROGRESS_PATH, lines.join('\n'), 'utf8');
  saveIntegritySnapshot(stepNum);
  log.success(`Step ${stepNum} initialized [~]`);
}

module.exports = {
  startCommand
};
