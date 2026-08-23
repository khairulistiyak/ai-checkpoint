const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
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

function handleDashboard() {
  const dashPath = path.resolve(__dirname, '..', '..', '..', 'dashboard');
  const altDashPath = path.resolve(__dirname, '..', '..', 'dashboard');
  const finalDash = fs.existsSync(dashPath) ? dashPath : fs.existsSync(altDashPath) ? altDashPath : null;
  if (!finalDash) { log.error('Dashboard not found. Make sure you have the dashboard/ directory.'); process.exit(1); }
  log.info(`Starting dashboard from: ${finalDash}`);
  spawnSync('node', ['server.js'], { cwd: finalDash, stdio: 'inherit' });
}

function handleCheckpoint(args) {
  const sub = args[1];
  if (sub === 'save') return checkpointSave(args[2]);
  if (sub === 'list') return checkpointList();
  if (sub === 'back') {
    const force = args.includes('--force');
    const tag = args.slice(2).find(a => a !== '--force');
    return checkpointBack(tag, force);
  }
  log.error('Usage: ./l cp save|list|back');
  process.exit(1);
}

const COMMAND_MAP = {
  help: () => showHelp(), '--help': () => showHelp(), '-h': () => showHelp(), h: () => showHelp(),
  status: (args) => statusCommand(), s: (args) => statusCommand(),
  projects: (args) => projectsCommand(), p: (args) => projectsCommand(),
  'lint-plan': (args) => lintPlanCommand(args[1]), lp: (args) => lintPlanCommand(args[1]),
  sync: () => syncCommand(),
  watch: () => watchCommand(), w: () => watchCommand(),
  run: (args) => runProjectCommand(args[1], args.slice(2)), r: (args) => runProjectCommand(args[1], args.slice(2)),
  health: (args) => healthCommand(args.slice(1)), hl: (args) => healthCommand(args.slice(1)),
  quality: (args) => qualityCommand(args.slice(1)), q: (args) => qualityCommand(args.slice(1)),
  dry: (args) => dryCommand(args.slice(1)), duplicates: (args) => dryCommand(args.slice(1)), dup: (args) => dryCommand(args.slice(1)),
  utils: (args) => utilsCommand(args.slice(1)), util: (args) => utilsCommand(args.slice(1)), u: (args) => utilsCommand(args.slice(1)),
  start: (args) => startCommand(args[1]),
  complete: (args) => completeCommand(args[1], args[2]), c: (args) => completeCommand(args[1], args[2]),
  block: (args) => blockCommand(args[1], args[2]), b: (args) => blockCommand(args[1], args[2]),
  validate: () => validateCommand(), v: () => validateCommand(),
  doctor: () => doctorCommand(),
  'new-plan': (args) => newPlanCommand(args[1], args.slice(2)), np: (args) => newPlanCommand(args[1], args.slice(2)),
  dashboard: () => handleDashboard(), dash: () => handleDashboard(), ui: () => handleDashboard(),
  checkpoint: (args) => handleCheckpoint(args), cp: (args) => handleCheckpoint(args),
};

function run() {
  const args = process.argv.slice(2);
  const cmd = args[0] ? args[0].toLowerCase() : 'status';
  const handler = COMMAND_MAP[cmd];

  if (!handler) {
    log.error(`Unknown: "${cmd}"`);
    showHelp();
    process.exit(1);
  }
  handler(args);
}

module.exports = { run, showHelp };

if (require.main === module) {
  run();
}
