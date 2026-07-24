const { execSync } = require('child_process');
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
    const out = execSync(`git tag -l "${prefix}*"`, { stdio: 'pipe' }).toString().trim();
    count = out ? out.split('\n').filter(Boolean).length : 0;
  } catch { count = 0; }
  const tag = `${prefix}${count + 1}`;
  try {
    const dirty = execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim();
    if (dirty) execSync(`git commit -am "checkpoint: ${message}"`, { stdio: 'inherit' });
  } catch (e) { log.error('Commit failed'); process.exit(1); }
  try {
    execSync(`git tag -a "${tag}" -m "${message}"`, { stdio: 'inherit' });
  } catch (e) { log.error('Tag failed'); process.exit(1); }
  log.success(`Checkpoint saved: ${tag}`);
}

function checkpointList() {
  let out = '';
  try { out = execSync('git tag -n1 | grep "^aicp/" || true', { stdio: 'pipe' }).toString(); }
  catch { out = ''; }
  if (!out.trim()) { console.log('No checkpoints found'); return; }
  console.log('TAG'.padEnd(20), 'MESSAGE');
  out.trim().split('\n').forEach(line => {
    const [tag, ...msg] = line.trim().split(/\s+/);
    console.log(tag.padEnd(20), msg.join(' '));
  });
}

function checkpointBack(tag, force) {
  let stashId = null;
  try {
    const dirty = execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim();
    if (dirty) {
      const msg = `aicp-rollback-${Math.floor(Date.now() / 1000)}`;
      execSync(`git stash push -u -m "${msg}"`, { stdio: 'inherit' });
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
  if (!force) {
    log.warn(`Rollback to ${tag}? Use --force to confirm.`);
    process.exit(1);
  }
  try {
    execSync(`git rev-parse --verify "refs/tags/${tag}"^{}`, { stdio: 'pipe' });
    execSync(`git checkout "${tag}" -- .`, { stdio: 'inherit' });
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
