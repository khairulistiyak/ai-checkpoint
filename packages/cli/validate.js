const fs = require('fs');
const path = require('path');
const { PROGRESS_PATH, PLAN_DIR } = require('./paths.js');
const { log } = require('./colors.js');
const { parseProgress, getPlanFiles } = require('./parse-progress.js');
const { verifyTargetFileCore, validateProject } = require('../core/validate-project.js');

function checkFiles() {
  if (!fs.existsSync(PROGRESS_PATH)) {
    log.error(`PROGRESS.md not found at .agents/PROGRESS.md`);
    log.info(`Run the setup script first: bash /path/to/checkpoint-task-ledger/setup.sh`);
    process.exit(1);
  }
}

function verifyTargetFile(stepTitle) {
  return verifyTargetFileCore(stepTitle, process.cwd());
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
  
  const planFilesContents = planFiles.map(planFile => ({
    planFile,
    content: fs.readFileSync(path.join(PLAN_DIR, planFile), 'utf8')
  }));

  const errors = validateProject(phases, planFilesContents, process.cwd());

  if (errors.length > 0) {
    errors.forEach(err => log.error(err));
    log.error(`Validation failed with ${errors.length} error(s)`);
    process.exit(1);
  }
  log.success('Validation passed');
}

module.exports = {
  checkFiles,
  verifyTargetFile,
  validateCommand
};
