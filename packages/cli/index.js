const { colors, log } = require('./colors.js');
const { statusCommand } = require('./cmd-status.js');
const { startCommand } = require('./cmd-start.js');
const { completeCommand } = require('./cmd-complete.js');
const { validateCommand } = require('./validate.js');
const { doctorCommand } = require('./doctor.js');
const { newPlanCommand } = require('./cmd-new-plan.js');
const { checkpointSave, checkpointList, checkpointBack } = require('./cmd-checkpoint.js');
const { watchCommand } = require('./cmd-watch.js');
const { blockCommand } = require('./cmd-block.js');
const { projectsCommand } = require('./cmd-projects.js');
const { lintPlanCommand } = require('./cmd-lint-plan.js');
const { syncCommand } = require('./cmd-sync.js');
const { runProjectCommand } = require('./cmd-run.js');
const { healthCommand } = require('./cmd-health.js');
const { qualityCommand } = require('./cmd-quality.js');
const { dryCommand, utilsCommand } = require('./cmd-dry.js');

function showHelp() {
  console.log(`
${colors.bright}${colors.cyan}┌${'─'.repeat(54)}┐
│   Ledger CLI v5.0 — Clean Structure                   │
└${'─'.repeat(54)}┘${colors.reset}

${colors.bright}Commands:${colors.reset}
  ${colors.green}./l${colors.reset}                      Status & active step progress
  ${colors.green}./l dash${colors.reset}                 Launch web dashboard
  ${colors.green}./l projects${colors.reset}             List registered projects
  ${colors.green}./l start <step>${colors.reset}          Start a step
  ${colors.green}./l c <step> "note"${colors.reset}       Complete a step (with syntax check ✅)
  ${colors.green}./l v${colors.reset}                     Validate (sync + files + 150-line)
  ${colors.green}./l doctor${colors.reset}                Health check
  ${colors.green}./l new-plan <name>${colors.reset}       Create plan from template
  ${colors.green}./l run [name]${colors.reset}            Project run commands (dev, test, etc.)
  ${colors.green}./l cp save|list|back${colors.reset}     Checkpoints
  ${colors.green}./l sync${colors.reset}                  Sync plan files → PROGRESS.md
  ${colors.green}./l health${colors.reset}                Project health scan
  ${colors.green}./l quality${colors.reset}               Code quality report
  ${colors.green}./l dry [--diff]${colors.reset}          DRY code redundancy audit & diffs
  ${colors.green}./l utils [query]${colors.reset}         Search reusable utility functions
  ${colors.green}./l h${colors.reset}                     Help
`);
}

function run() {
  const args = process.argv.slice(2);
  const cmd = args[0] ? args[0].toLowerCase() : 'status';

  switch (cmd) {
    case 'help': case '--help': case '-h': case 'h': showHelp(); break;
    case 'status': case 's': statusCommand(); break;
    case 'projects': case 'p': projectsCommand(); break;
    case 'lint-plan': case 'lp': lintPlanCommand(args[1]); break;
    case 'sync': syncCommand(); break;
    case 'watch': case 'w': watchCommand(); break;
    case 'run': case 'r': runProjectCommand(args[1], args.slice(2)); break;
    case 'health': case 'hl': healthCommand(args.slice(1)); break;
    case 'quality': case 'q': qualityCommand(args.slice(1)); break;
    case 'dry': case 'duplicates': case 'dup': dryCommand(args.slice(1)); break;
    case 'utils': case 'util': case 'u': utilsCommand(args.slice(1)); break;
    case 'start': startCommand(args[1]); break;
    case 'complete': case 'c': completeCommand(args[1], args[2]); break;
    case 'block': case 'b': blockCommand(args[1], args[2]); break;
    case 'validate': case 'v': validateCommand(); break;
    case 'doctor': doctorCommand(); break;
    case 'new-plan': case 'np': newPlanCommand(args[1], args.slice(2)); break;
    case 'dashboard': case 'dash': case 'ui': {
      const dashPath = require('path').resolve(__dirname, '..', '..', '..', 'dashboard');
      const altDashPath = require('path').resolve(__dirname, '..', '..', 'dashboard');
      const finalDash = require('fs').existsSync(dashPath) ? dashPath : require('fs').existsSync(altDashPath) ? altDashPath : null;
      if (!finalDash) { log.error('Dashboard not found. Make sure you have the dashboard/ directory.'); process.exit(1); }
      log.info(`Starting dashboard from: ${finalDash}`);
      const { spawnSync } = require('child_process');
      spawnSync('node', ['server.js'], { cwd: finalDash, stdio: 'inherit' });
      break;
    }
    case 'checkpoint': case 'cp': {
      const sub = args[1];
      if (sub === 'save') checkpointSave(args[2]);
      else if (sub === 'list') checkpointList();
      else if (sub === 'back') {
        const force = args.includes('--force');
        const tag = args.slice(2).find(a => a !== '--force');
        checkpointBack(tag, force);
      }
      else { log.error('Usage: ./l cp save|list|back'); process.exit(1); }
      break;
    }
    default: log.error(`Unknown: "${cmd}"`); showHelp(); process.exit(1);
  }
}

module.exports = { run, showHelp };

if (require.main === module) {
  run();
}
