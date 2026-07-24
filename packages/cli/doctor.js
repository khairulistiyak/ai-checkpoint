const fs = require('fs');
const path = require('path');
const { AGENTS_DIR, PROGRESS_PATH, PLAN_DIR } = require('./paths.js');

function doctorCommand() {
  const required = [
    ['.agents/', AGENTS_DIR, 'directory'],
    ['.agents/PROGRESS.md', PROGRESS_PATH, 'file'],
    ['.agents/RULES.md', path.join(AGENTS_DIR, 'RULES.md'), 'file'],
    ['.agents/AGENTS.md', path.join(AGENTS_DIR, 'AGENTS.md'), 'file'],
    ['plan/', PLAN_DIR, 'directory'],
    ['.git/', path.join(process.cwd(), '.git'), 'directory']
  ];
  const errors = required.flatMap(([label, target, type]) => {
    if (!fs.existsSync(target)) return [`❌ Missing ${label}`];
    const validType = type === 'directory' ? fs.statSync(target).isDirectory() : fs.statSync(target).isFile();
    return validType ? [] : [`❌ Invalid ${label}`];
  });
  if (fs.existsSync(PROGRESS_PATH)) {
    const progress = fs.readFileSync(PROGRESS_PATH, 'utf8');
    if (!/^#\s+.+/m.test(progress) || !/^##\s+Project/m.test(progress)) errors.push('❌ Invalid .agents/PROGRESS.md');
  }
  if (errors.length) {
    errors.forEach(error => console.error(error));
    process.exit(1);
  }
  console.log('✅ All checks passed');
}

module.exports = {
  doctorCommand
};
