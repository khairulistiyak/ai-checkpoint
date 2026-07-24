const fs = require('fs');
const path = require('path');
const { log, colors } = require('./colors.js');
const { getPlanFiles } = require('./parse-progress.js');
const { PLAN_DIR } = require('./paths.js');

function lintPlanCommand() {
  const planFiles = getPlanFiles();
  let errors = 0;

  planFiles.forEach(pf => {
    const content = fs.readFileSync(path.join(PLAN_DIR, pf), 'utf8');
    const steps = content.split(/^(?=#{2,3}\s+Step)/m);
    
    steps.forEach(stepBlock => {
      const titleMatch = stepBlock.match(/^#{2,3}\s+Step\s+(\d+\.\d+)/);
      if (!titleMatch) return;
      const stepNum = titleMatch[1];
      
      const fileCount = (stepBlock.match(/-\s+\*\*File:?\*\*/g) || []).length;
      if (fileCount > 1) {
        log.error(`[${pf}] Step ${stepNum} modifies multiple files.`);
        errors++;
      } else if (fileCount === 0) {
        log.error(`[${pf}] Step ${stepNum} is missing a **File:** declaration.`);
        errors++;
      }

      if (!/-\s+\*\*Done-check:?\*\*/i.test(stepBlock)) {
        log.error(`[${pf}] Step ${stepNum} is missing **Done-check:**`);
        errors++;
      }
      
      if (!/-\s+\*\*Depends:?\*\*/i.test(stepBlock)) {
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

module.exports = { lintPlanCommand };
