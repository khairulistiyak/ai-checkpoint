const fs = require('fs');
const path = require('path');
const { log, colors } = require('./colors.js');
const { getPlanFiles, getPlanFilePath } = require('./parse-progress.js');
const { PLAN_DIR } = require('./paths.js');

function stripCodeBlocks(text) {
  return text.replace(/```[\s\S]*?```/g, '');
}

function getActivePlanFiles() {
  if (!fs.existsSync(PLAN_DIR)) return [];
  return fs.readdirSync(PLAN_DIR)
    .filter(f => f.endsWith('.md') && !f.startsWith('.') && fs.statSync(path.join(PLAN_DIR, f)).isFile());
}

function lintPlanCommand(targetArg) {
  let planFiles = [];
  if (targetArg && targetArg !== '--all') {
    const rawName = path.basename(targetArg);
    const resolvedPath = getPlanFilePath(rawName);
    if (fs.existsSync(resolvedPath)) {
      planFiles = [rawName];
    } else {
      log.error(`Plan file not found: ${targetArg}`);
      process.exit(1);
    }
  } else if (targetArg === '--all') {
    planFiles = getPlanFiles();
  } else {
    planFiles = getActivePlanFiles();
  }

  if (planFiles.length === 0) {
    log.info('No active plan files to lint.');
    return;
  }

  let errors = 0;

  planFiles.forEach(pf => {
    const content = fs.readFileSync(getPlanFilePath(pf), 'utf8');
    const steps = content.split(/^(?=#{2,3}\s+(?:Step\s+)?\d+\.\d+)/m);
    
    steps.forEach(stepBlock => {
      const titleMatch = stepBlock.match(/^#{2,3}\s+(?:Step\s+)?(\d+\.\d+)/);
      if (!titleMatch) return;
      const stepNum = titleMatch[1];
      
      const cleanBlock = stripCodeBlocks(stepBlock);
      const fileCount = (cleanBlock.match(/-\s+\*\*File:?\*\*/g) || []).length;
      if (fileCount > 1) {
        log.error(`[${pf}] Step ${stepNum} modifies multiple files.`);
        errors++;
      } else if (fileCount === 0) {
        log.error(`[${pf}] Step ${stepNum} is missing a **File:** declaration.`);
        errors++;
      }

      if (!/-\s+\*\*Done-check:?\*\*/i.test(cleanBlock)) {
        log.error(`[${pf}] Step ${stepNum} is missing **Done-check:**`);
        errors++;
      }
      
      if (!/-\s+\*\*Depends:?\*\*/i.test(cleanBlock)) {
        log.error(`[${pf}] Step ${stepNum} is missing **Depends:**`);
        errors++;
      }
    });
  });

  if (errors > 0) {
    log.error(`Plan linting failed with ${errors} error(s).`);
    process.exit(1);
  } else {
    log.success('Plan linting passed.');
  }
}

module.exports = { lintPlanCommand, stripCodeBlocks };
