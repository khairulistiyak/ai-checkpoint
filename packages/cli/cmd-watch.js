const fs = require('fs');
const { statusCommand } = require('./cmd-status.js');
const { PROGRESS_PATH } = require('./paths.js');

function watchCommand() {
  console.clear();
  statusCommand();
  
  let lastMtime = fs.statSync(PROGRESS_PATH).mtimeMs;
  
  setInterval(() => {
    try {
      const currentMtime = fs.statSync(PROGRESS_PATH).mtimeMs;
      if (currentMtime !== lastMtime) {
        lastMtime = currentMtime;
        console.clear();
        statusCommand();
      }
    } catch (e) {
      // ignore
    }
  }, 2000);
}

module.exports = { watchCommand };
