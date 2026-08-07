const fs = require('fs');
const { statusCommand } = require('./cmd-status.js');
const { PROGRESS_PATH } = require('./paths.js');

let calculateHealth;
try { calculateHealth = require('../core/health-score.js').calculateHealth; } catch { calculateHealth = null; }

function watchCommand() {
  console.clear();
  statusCommand();

  if (calculateHealth) {
    const health = calculateHealth(process.cwd());
    const status = health.passed ? '✅ HEALTHY' : `⚠️ Score: ${health.score}/100`;
    console.log(`\n  🛡️ Health: ${status}\n`);
  }

  let debounceTimer = null;
  const watcher = fs.watch(PROGRESS_PATH, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.clear();
      statusCommand();
      if (calculateHealth) {
        const health = calculateHealth(process.cwd());
        const status = health.passed ? '✅ HEALTHY' : `⚠️ Score: ${health.score}/100`;
        console.log(`\n  🛡️ Health: ${status}\n`);
      }
    }, 100);
  });

  process.on('SIGINT', () => {
    watcher.close();
    process.exit(0);
  });
}

module.exports = { watchCommand };
