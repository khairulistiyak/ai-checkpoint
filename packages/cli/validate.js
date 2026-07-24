const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH, PLAN_DIR } = require('./paths.js');
const { log } = require('./colors.js');
const { parseProgress, getPlanFiles } = require('./parse-progress.js');

function checkFiles() {
  if (!fs.existsSync(PROGRESS_PATH)) {
    log.error(`PROGRESS.md not found at .agents/PROGRESS.md`);
    log.info(`Run the setup script first: bash /path/to/checkpoint-task-ledger/setup.sh`);
    process.exit(1);
  }
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
  const fileMatches = stepTitle.match(/[`(]([^`)]+\.(?:tsx|ts|css|js|json|jsx|md|sh|yml|cjs))[`)]/);
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

function validateCommand() {
  checkFiles();
  const planFiles = getPlanFiles();
  if (planFiles.length === 0) {
    log.error('No plan/*.md files found.');
    process.exit(1);
  }

  log.header('Validating Project');
  const { phases } = parseProgress();
  const progressSteps = new Map();
  phases.forEach(phase => phase.steps.forEach(step => progressSteps.set(step.number, step)));
  const planSteps = new Map();
  let failures = 0;

  planFiles.forEach(planFile => {
    const lines = fs.readFileSync(path.join(PLAN_DIR, planFile), 'utf8').split(/\r?\n/);
    let currentStep = null;
    lines.forEach(line => {
      const heading = line.match(/^#{2,3}\s+Step\s+(\d+\.\d+)\s+—\s+(.+)$/);
      if (heading) {
        currentStep = { number: heading[1], title: heading[2], file: null, planFile };
        if (planSteps.has(currentStep.number)) {
          log.error(`Duplicate Step ${currentStep.number} in plan/${planFile}`);
          failures++;
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
      log.error(`Step ${number} in plan/${step.planFile} missing in PROGRESS.md`);
      failures++;
    }
  });
  progressSteps.forEach((step, number) => {
    const planStep = planSteps.get(number);
    if (!planStep) {
      log.error(`Step ${number} in PROGRESS.md missing in plan files`);
      failures++;
      return;
    }
    if (!planStep.file) {
      log.error(`Step ${number} has no declared File`);
      failures++;
      return;
    }
    const target = path.join(process.cwd(), planStep.file);
    if (step.status === 'done' && !fs.existsSync(target)) {
      log.error(`${planStep.file} missing for completed Step ${number}`);
      failures++;
      return;
    }
    if (step.status === 'pending') return;
    if (!fs.existsSync(target) || planStep.file.startsWith('.agents/') || /\.(png|jpe?g|gif|svg|ico)$/i.test(planStep.file)) return;
    const effectiveLines = fs.readFileSync(target, 'utf8').split(/\r?\n/)
      .filter(line => line.trim() && !/^\s*(\/\/|#(?!\!)|\/\*|\*|<!--)/.test(line)).length;
    if (effectiveLines > 150) {
      log.error(`${planStep.file} exceeds 150 lines (${effectiveLines} lines)`);
      failures++;
    }
  });

  if (failures) {
    log.error(`Validation failed with ${failures} error(s)`);
    process.exit(1);
  }
  log.success('Validation passed');
}

module.exports = {
  checkFiles,
  findFileRecursively,
  verifyTargetFile,
  validateCommand
};
