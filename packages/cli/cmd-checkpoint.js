const { execFileSync } = require('child_process');
const { log } = require('./colors.js');
const { parseProgress } = require('./parse-progress.js');
const { validateCommand } = require('./validate.js');

function getCurrentStep() {
  const { phases } = parseProgress();
  for (const p of phases) {
    for (const s of p.steps) {
      if (s.status !== 'done') return s.number;
    }
  }
  const all = phases.flatMap(p => p.steps);
  return all.length ? all[all.length - 1].number : '0.0';
}

function checkpointSave(message) {
  if (!message) { log.error('Message required: ./l cp save "message"'); process.exit(1); }
  validateCommand();
  const step = getCurrentStep();
  const prefix = `aicp/${step}-`;
  let count = 0;
  try {
    const out = execFileSync('git', ['tag', '-l', `${prefix}*`], { stdio: 'pipe', encoding: 'utf8' }).trim();
    count = out ? out.split('\n').filter(Boolean).length : 0;
  } catch { count = 0; }
  const tag = `${prefix}${count + 1}`;
  try {
    const dirty = execFileSync('git', ['status', '--porcelain'], { stdio: 'pipe', encoding: 'utf8' }).trim();
    if (dirty) execFileSync('git', ['commit', '-am', `checkpoint: ${message}`], { stdio: 'inherit' });
  } catch (e) { log.error('Commit failed'); process.exit(1); }
  try {
    execFileSync('git', ['tag', '-a', tag, '-m', message], { stdio: 'inherit' });
  } catch (e) { log.error('Tag failed'); process.exit(1); }
  log.success(`Checkpoint saved: ${tag}`);
}

function checkpointList() {
  let tags = '';
  try {
    tags = execFileSync('git', ['tag', '-n1'], { stdio: 'pipe', encoding: 'utf8' });
  } catch { tags = ''; }
  const lines = tags.trim().split('\n').filter(line => line.startsWith('aicp/'));
  if (lines.length === 0) { console.log('No checkpoints found'); return; }
  console.log('TAG'.padEnd(20), 'MESSAGE');
  lines.forEach(line => {
    const [tag, ...msg] = line.trim().split(/\s+/);
    console.log(tag.padEnd(20), msg.join(' '));
  });
}

function checkpointBack(tag, force) {
  let stashId = null;
  try {
    const dirty = execFileSync('git', ['status', '--porcelain'], { stdio: 'pipe', encoding: 'utf8' }).trim();
    if (dirty) {
      const msg = `aicp-rollback-${Math.floor(Date.now() / 1000)}`;
      execFileSync('git', ['stash', 'push', '-u', '-m', msg], { stdio: 'inherit' });
      stashId = msg;
    }
  } catch (e) {
    log.error('Stash failed');
    process.exit(1);
  }
  if (!tag) {
    checkpointList();
    log.info('Specify tag: ./l cp back <tag>');
    if (stashId) log.info(`Stashed changes: ${stashId}`);
    process.exit(0);
  }
  // Validate tag format to prevent injection
  if (!/^aicp\/[\w.-]+$/.test(tag)) {
    log.error('Invalid tag format. Must start with aicp/');
    process.exit(1);
  }
  if (!force) {
    log.warn(`Rollback to ${tag}? Use --force to confirm.`);
    process.exit(1);
  }
  try {
    execFileSync('git', ['rev-parse', '--verify', `refs/tags/${tag}^{}`], { stdio: 'pipe' });
    execFileSync('git', ['checkout', tag, '--', '.'], { stdio: 'inherit' });
  } catch (e) {
    log.error(`Checkout failed: ${tag}`);
    process.exit(1);
  }
  log.success(`Rolled back to ${tag}`);
  if (stashId) log.info(`Stashed changes: ${stashId} (use git stash pop to restore)`);
}

module.exports = {
  getCurrentStep,
  checkpointSave,
  checkpointList,
  checkpointBack
};
