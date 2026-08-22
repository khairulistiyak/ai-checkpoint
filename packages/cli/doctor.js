const fs = require('fs');
const path = require('path');
const os = require('os');
const { AGENTS_DIR, PROGRESS_PATH, PLAN_DIR } = require('./paths.js');

function doctorCommand() {
  const required = [
    ['Project Data Directory', AGENTS_DIR, 'directory'],
    ['PROGRESS.md', PROGRESS_PATH, 'file'],
    ['RULES.md', path.join(AGENTS_DIR, 'RULES.md'), 'file'],
    ['AGENTS.md', path.join(AGENTS_DIR, 'AGENTS.md'), 'file'],
    ['Global Engine', path.join(os.homedir(), '.ai-checkpoint', 'engine.bin.js'), 'file'],
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
    if (!/^#\s+.+/m.test(progress) || !/^##\s+Project/m.test(progress)) errors.push('❌ Invalid PROGRESS.md');
  }
  const isJson = process.argv.includes('--json');
  if (isJson) {
    console.log(JSON.stringify({ ok: errors.length === 0, errors }, null, 2));
    process.exit(errors.length ? 1 : 0);
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
