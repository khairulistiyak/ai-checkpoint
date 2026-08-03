const fs = require('fs');
const path = require('path');

function findFileRecursively(dir, fileName, depth = 0) {
  if (depth > 10) return null; // Prevent infinite recursion
  let files;
  try { files = fs.readdirSync(dir); } catch { return null; }
  for (const file of files) {
    const fullPath = path.join(dir, file);
    let stat;
    try { stat = fs.lstatSync(fullPath); } catch { continue; }
    if (stat.isSymbolicLink()) continue; // Skip symlinks
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

function validateProject(phases, planFilesContents, cwd) {
  const progressSteps = new Map();
  phases.forEach(phase => phase.steps.forEach(step => progressSteps.set(step.number, step)));
  const planSteps = new Map();
  const errors = [];

  planFilesContents.forEach(({ planFile, content }) => {
    const lines = content.split(/\r?\n/);
    let currentStep = null;
    lines.forEach(line => {
      const heading = line.match(/^#{2,3}\s+(?:Step\s+)?(\d+\.\d+)\s+—\s+(.+)$/);
      if (heading) {
        currentStep = { number: heading[1], title: heading[2], file: null, planFile };
        if (planSteps.has(currentStep.number)) {
          errors.push(`Duplicate Step ${currentStep.number} in plan/${planFile}`);
        }
        planSteps.set(currentStep.number, currentStep);
        return;
      }
      if (!currentStep) return;
      const file = line.match(/^-\s+\*\*File:?\*\*:?\s+`([^`]+)`/);
      if (file) currentStep.file = file[1];
    });
  });

  planSteps.forEach((step, number) => {
    if (!progressSteps.has(number)) {
      errors.push(`Step ${number} in plan/${step.planFile} missing in PROGRESS.md`);
    }
  });
  progressSteps.forEach((step, number) => {
    const planStep = planSteps.get(number);
    if (!planStep) {
      errors.push(`Step ${number} in PROGRESS.md missing in plan files`);
      return;
    }
    if (!planStep.file) {
      errors.push(`Step ${number} has no declared File`);
      return;
    }
    const target = path.join(cwd, planStep.file);
    if (step.status === 'done' && !fs.existsSync(target)) {
      errors.push(`${planStep.file} missing for completed Step ${number}`);
      return;
    }
    if (step.status !== 'running') return;
    if (!fs.existsSync(target) || planStep.file.startsWith('.agents/') || planStep.file.startsWith('marketing/') || /\.(png|jpe?g|gif|svg|ico|md|txt)$/i.test(planStep.file)) return;
    const effectiveLines = fs.readFileSync(target, 'utf8').split(/\r?\n/)
      .filter(line => line.trim() && !/^\s*(\/\/|#(?!\!)|\/\*|\*|<!--)/.test(line)).length;
    if (effectiveLines > 150) {
      errors.push(`${planStep.file} exceeds 150 lines (${effectiveLines} lines)`);
    }
  });
  
  return errors;
}

module.exports = {
  verifyTargetFileCore,
  validateProject,
  findFileRecursively
};
