import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  if (!projectPath || !fs.existsSync(projectPath)) return null;

  try {
    const rootCliDir = path.resolve(__dirname, '..', '..', '..', 'packages', 'cli');
    const syncModulePath = fs.existsSync(path.join(rootCliDir, 'plan-sync.js'))
      ? path.join(rootCliDir, 'plan-sync.js')
      : path.join(projectPath, '.agents', 'packages', 'cli', 'plan-sync.js');

    if (!fs.existsSync(syncModulePath)) return null;

    const { syncPlansToProgress } = require(syncModulePath);
    const origCwd = process.cwd();
    process.chdir(projectPath);
    try {
      return syncPlansToProgress();
    } finally {
      process.chdir(origCwd);
    }
  } catch (e) {
    console.error('Plan sync error:', e.message);
    return null;
  }
}
