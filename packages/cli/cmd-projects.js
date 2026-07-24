const fs = require('fs');
const path = require('path');
const os = require('os');
const { log, colors } = require('./colors.js');
const { parseProgressText } = require('../core/parse-progress.js');
const { getProgressBar } = require('./cmd-complete.js');

function projectsCommand() {
  const settingsFile = path.join(os.homedir(), '.ai-checkpoint-dashboard', 'settings.json');
  if (!fs.existsSync(settingsFile)) {
    log.error('No dashboard settings found. Run the dashboard first.');
    process.exit(1);
  }

  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
  } catch (e) {
    log.error('Failed to read settings.json: ' + e.message);
    process.exit(1);
  }

  if (!settings.projects || settings.projects.length === 0) {
    log.info('No projects registered in dashboard.');
    process.exit(0);
  }

  console.log(`\n${colors.bright}┌────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.bright}│ REGISTERED PROJECTS                                    │${colors.reset}`);
  console.log(`${colors.bright}└────────────────────────────────────────────────────────┘${colors.reset}\n`);

  settings.projects.forEach((p, idx) => {
    console.log(`${colors.cyan}${idx + 1}. ${p.name}${colors.reset}`);
    console.log(`   ${colors.dim}Path: ${p.path}${colors.reset}`);
    
    const progressPath = path.join(p.path, '.agents', 'PROGRESS.md');
    if (!fs.existsSync(progressPath)) {
      console.log(`   ${colors.yellow}Status: Not installed${colors.reset}\n`);
    } else {
      try {
        const content = fs.readFileSync(progressPath, 'utf8');
        const progress = parseProgressText(content);
        const oPct = progress.overall.percentage || 0;
        const done = progress.overall.completed || 0;
        const total = progress.overall.total || 0;
        console.log(`   ${colors.green}Progress: ${oPct}%${colors.reset} ${getProgressBar(oPct, 20)} (${done}/${total})\n`);
      } catch (e) {
        console.log(`   ${colors.red}Status: Error reading progress${colors.reset}\n`);
      }
    }
  });
}

module.exports = { projectsCommand };
