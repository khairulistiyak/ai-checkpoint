const { colors, log } = require('./colors.js');
const { statusCommand } = require('./cmd-status.js');
const { startCommand } = require('./cmd-start.js');
const { completeCommand } = require('./cmd-complete.js');
const { validateCommand } = require('./validate.js');
const { doctorCommand } = require('./doctor.js');
const { newPlanCommand } = require('./cmd-new-plan.js');
const { checkpointSave, checkpointList, checkpointBack } = require('./cmd-checkpoint.js');

function showHelp() {
  console.log(`
${colors.bright}${colors.cyan}┌${'─'.repeat(54)}┐
│   Ledger CLI v5.0 — Clean Structure                   │
└${'─'.repeat(54)}┘${colors.reset}

${colors.bright}Structure:${colors.reset}
  ${colors.dim}.agents/${colors.reset}  → System files (PROGRESS.md, RULES.md, scripts)
  ${colors.dim}plan/${colors.reset}     → ${colors.green}শুধু তোমার .md plan files${colors.reset} (clean!)

${colors.bright}Commands:${colors.reset}
  ${colors.green}./l${colors.reset}                      Dashboard
  ${colors.green}./l start <step>${colors.reset}          Step শুরু করো
  ${colors.green}./l c <step> "note"${colors.reset}       Step complete করো
  ${colors.green}./l v${colors.reset}                     Validate (sync + files + 150-line)
  ${colors.green}./l doctor${colors.reset}                Health check
  ${colors.green}./l new-plan <name>${colors.reset}       Create plan from template
  ${colors.green}./l cp save|list|back${colors.reset}     Checkpoints
  ${colors.green}./l h${colors.reset}                     Help

${colors.bright}Plan File Naming:${colors.reset}
  ${colors.dim}plan/ folder এ যেকোনো নামে .md file:${colors.reset}
  ${colors.green}bugfix-upload.md${colors.reset}         ← meaningful name ✅
  ${colors.green}add-dark-mode.md${colors.reset}         ← descriptive name ✅
  ${colors.green}plan_01.md${colors.reset}               ← generic name (OK too)
`);
}

function run() {
  const args = process.argv.slice(2);
  const cmd = args[0] ? args[0].toLowerCase() : 'status';

  switch (cmd) {
    case 'help': case '--help': case '-h': case 'h': showHelp(); break;
    case 'status': case 's': statusCommand(); break;
    case 'start': startCommand(args[1]); break;
    case 'complete': case 'c': completeCommand(args[1], args[2]); break;
    case 'validate': case 'v': validateCommand(); break;
    case 'doctor': doctorCommand(); break;
    case 'new-plan': case 'np': newPlanCommand(args[1]); break;
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
