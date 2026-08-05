const { log, colors } = require('./colors.js');
const { syncPlansToProgress } = require('./plan-sync.js');
const { checkFiles } = require('./validate.js');

function syncCommand() {
  checkFiles();
  log.header('Syncing Plan Files');
  log.info('Scanning plan/*.md...');

  const { added, skipped, errors } = syncPlansToProgress();

  if (added.length > 0) {
    for (const a of added) {
      console.log(`  ${colors.green}✨ NEW${colors.reset} — Phase ${a.phase}: ${a.name} (${a.stepCount} steps)`);
      console.log(`     → Appended to PROGRESS.md`);
    }
  }

  if (skipped.length > 0) {
    for (const s of skipped) {
      console.log(`  ${colors.dim}⏭️  SKIP${colors.reset} — ${s} (already exists)`);
    }
  }

  if (errors.length > 0) {
    for (const e of errors) {
      console.log(`  ${colors.red}❌ ERROR${colors.reset} — ${e}`);
    }
  }

  if (added.length === 0 && errors.length === 0) {
    log.success('Everything is already in sync.');
  } else if (added.length > 0) {
    log.success(`Synced ${added.length} new phase(s) to PROGRESS.md`);
  }
}

module.exports = { syncCommand };
