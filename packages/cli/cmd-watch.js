const fs = require('fs');
const { statusCommand } = require('./cmd-status.js');
const { PROGRESS_PATH } = require('./paths.js');

function watchCommand() {
  console.clear();
  statusCommand();
  
  let debounceTimer = null;
  const watcher = fs.watch(PROGRESS_PATH, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.clear();
      statusCommand();
    }, 100);
  });

  process.on('SIGINT', () => {
    watcher.close();
    process.exit(0);
  });
}

module.exports = { watchCommand };
