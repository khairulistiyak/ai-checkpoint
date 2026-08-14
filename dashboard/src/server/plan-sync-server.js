import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);

export function getNextPhaseNum(projectPath) {
  const progressPath = path.join(projectPath, '.agents', 'PROGRESS.md');
  if (!fs.existsSync(progressPath)) return 1;
  const content = fs.readFileSync(progressPath, 'utf8');
  const matches = content.match(/Phase (\d+)/g) || [];
  let max = 0;
  for (const m of matches) {
    const n = parseInt(m.replace('Phase ', ''), 10);
    if (n > max) max = n;
  }
  return max + 1;
}

export function syncPlanToProgress(projectPath) {
  try {
    const cliDir = path.resolve(projectPath, '.agents', 'packages', 'cli');
    if (!fs.existsSync(path.join(cliDir, 'plan-sync.js'))) {
      const srcDir = path.resolve(
        path.dirname(new URL(import.meta.url).pathname),
        '..', '..', '..', 'packages', 'cli'
      );
      if (!fs.existsSync(path.join(srcDir, 'plan-sync.js'))) return null;
      const { syncPlansToProgress } = require(path.join(srcDir, 'plan-sync.js'));
      const origCwd = process.cwd();
      process.chdir(projectPath);
      try { return syncPlansToProgress(); } finally { process.chdir(origCwd); }
    }
    const { syncPlansToProgress } = require(path.join(cliDir, 'plan-sync.js'));
    const origCwd = process.cwd();
    process.chdir(projectPath);
    try { return syncPlansToProgress(); } finally { process.chdir(origCwd); }
  } catch (e) {
    console.error('Plan sync error:', e.message);
    return null;
  }
}
