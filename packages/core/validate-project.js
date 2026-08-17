const fs = require('fs');
const path = require('path');

function findFileRecursively(dir, fileName, depth = 0) {
  if (depth > 10) return null;
  let files;
  try { files = fs.readdirSync(dir); } catch { return null; }
  for (const file of files) {
    const fullPath = path.join(dir, file);
    let stat;
    try { stat = fs.lstatSync(fullPath); } catch { continue; }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) {
      if (['node_modules', 'dist', '.git', '.agents', 'plan'].includes(file)) continue;
      const found = findFileRecursively(fullPath, fileName, depth + 1);
      if (found) return found;
    } else if (file === fileName) return fullPath;
  }
  return null;
}

function verifyTargetFileCore(stepTitle, cwd) {
  const fileMatches = stepTitle.match(/[`(]([^`)]+\.(?:tsx|ts|css|js|json|jsx|md|sh|yml|cjs))[`)]/);
  if (!fileMatches) return { verified: true };
  const targetNameOrPath = fileMatches[1].trim();
  let absolutePath = path.join(cwd, targetNameOrPath);
  if (!fs.existsSync(absolutePath)) {
    const srcDir = path.join(cwd, 'src');
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

function extractFileFromTitle(title) {
  const m = title.match(/[`(]([^`)]+\.[a-zA-Z0-9]+)[`)]/);
  return m ? m[1].replace(/^\.\//, '').trim() : null;
}

function parseStepsFromPlanContent(content, planFile) {
  const lines = content.split(/\r?\n/);
  const steps = new Map();
  let currentStep = null;
  let inFence = false;
  let activePhaseInFile = null;

  const filePhaseMatch = planFile.match(/phase-(\d+)/i);
  if (filePhaseMatch) activePhaseInFile = parseInt(filePhaseMatch[1], 10);

  for (const line of lines) {
    if (/^```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;

    const phaseHeader = line.match(/^#{1,3}\s+(?:\[?Phase\s+(\d+)\]?|Phase\s+(\d+))[:\s—-]*(.*)/i);
    if (phaseHeader) {
      const p = phaseHeader[1] || phaseHeader[2];
      if (p) activePhaseInFile = parseInt(p, 10);
    }

    const headMatch = line.match(/^#{2,4}\s+(?:\[?[A-Z]+\]?\s*)?(?:Step\s+)?(\d+\.\d+)\s*(?:—|-|:)\s*(.+)/i);
    const checkMatch = line.match(/^\s*-\s*\[[ x!/~]\]\s*(?:\*\*Step\s+|\*\*|\bStep\s+)?(\d+\.\d+)\*?\*?\s*(?:—|-|:|\s)\s*(.+)/i);
    const tableMatch = line.match(/^\s*\|\s*(?:Step\s+)?(\d+\.\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)/i);

    let num = null, title = null, declaredFile = null;
    if (headMatch) {
      num = headMatch[1]; title = headMatch[2].trim();
      declaredFile = extractFileFromTitle(title);
    } else if (checkMatch) {
      num = checkMatch[1]; title = checkMatch[2].trim();
      declaredFile = extractFileFromTitle(title);
    } else if (tableMatch) {
      num = tableMatch[1];
      const col1 = tableMatch[2].trim().replace(/`/g, '');
      const col2 = tableMatch[3].trim();
      declaredFile = col1.includes('.') ? col1 : extractFileFromTitle(col2);
      title = col2;
    }

    if (num && title) {
      const stepPhase = parseInt(num.split('.')[0], 10);
      if (activePhaseInFile && stepPhase !== activePhaseInFile && !headMatch) {
        continue;
      }

      if (!steps.has(num)) {
        currentStep = { number: num, title, file: declaredFile || '.agents/PROGRESS.md', planFile, action: 'EDIT' };
        steps.set(num, currentStep);
      } else {
        currentStep = steps.get(num);
        if (declaredFile && currentStep.file === '.agents/PROGRESS.md') {
          currentStep.file = declaredFile;
        }
      }
      continue;
    }

    if (currentStep) {
      const fileMatch = line.match(/^-\s+\*\*File:?\*\*:?\s+`([^`]+)`/i);
      if (fileMatch) currentStep.file = fileMatch[1].trim();
      const actionMatch = line.match(/^-\s+\*\*Action:?\*\*:?\s+([A-Za-z_]+)/i);
      if (actionMatch) currentStep.action = actionMatch[1].toUpperCase();
    }
  }
  return steps;
}

function validateProject(phases, planFilesContents, cwd) {
  const progressSteps = new Map();
  phases.forEach(phase => phase.steps.forEach(step => {
    const fileFromProgress = extractFileFromTitle(step.title);
    progressSteps.set(step.number, { ...step, file: fileFromProgress });
  }));
  const planSteps = new Map();
  const errors = [];

  planFilesContents.forEach(({ planFile, content }) => {
    const fileSteps = parseStepsFromPlanContent(content, planFile);
    fileSteps.forEach((step, number) => {
      planSteps.set(number, step);
    });
  });

  planSteps.forEach((step, number) => {
    if (!progressSteps.has(number)) errors.push(`Step ${number} in plan/${step.planFile} missing in PROGRESS.md`);
  });

  progressSteps.forEach((step, number) => {
    const planStep = planSteps.get(number);
    if (!planStep) {
      errors.push(`Step ${number} in PROGRESS.md missing in plan files`);
      return;
    }
    let resolvedFile = planStep.file !== '.agents/PROGRESS.md' ? planStep.file : (step.file || planStep.file);
    if (!resolvedFile) {
      errors.push(`Step ${number} has no declared File`);
      return;
    }
    if (resolvedFile === 'PROGRESS.md') resolvedFile = '.agents/PROGRESS.md';

    let target = path.join(cwd, resolvedFile);
    const isBuildArtifact = /^(release\/|dist\/|dashboard\/dist\/)/i.test(resolvedFile);
    if (step.status === 'done' && planStep.action !== 'DELETE' && !isBuildArtifact && !fs.existsSync(target)) {
      if (fs.existsSync(path.join(cwd, '.agents', resolvedFile))) {
        target = path.join(cwd, '.agents', resolvedFile);
      } else {
        const inArchive = fs.existsSync(path.join(cwd, '_archive', resolvedFile)) ||
          (fs.existsSync(path.join(cwd, '_archive')) && findFileRecursively(path.join(cwd, '_archive'), path.basename(resolvedFile)));
        if (!inArchive) errors.push(`${resolvedFile} missing for completed Step ${number}`);
        return;
      }
    }
    if (step.status !== 'running') return;
    if (!fs.existsSync(target) || fs.statSync(target).isDirectory() || resolvedFile.startsWith('.agents/') || resolvedFile.startsWith('marketing/') || resolvedFile.startsWith('_archive/') || /\.(png|jpe?g|gif|svg|ico|md|txt)$/i.test(resolvedFile)) return;
    const effectiveLines = fs.readFileSync(target, 'utf8').split(/\r?\n/)
      .filter(line => line.trim() && !/^\s*(\/\/|#(?!\!)|\/\*|\*|<!--)/.test(line)).length;
    if (effectiveLines > 150) errors.push(`${resolvedFile} exceeds 150 lines (${effectiveLines} lines)`);
  });

  return errors;
}

module.exports = { verifyTargetFileCore, validateProject, findFileRecursively };
