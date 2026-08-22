import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as globalStore from './global-store.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getNextPhaseNum(projectId) {
  const progressPath = globalStore.getProgressPath(projectId);
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

export function syncPlanToProgress(projectId, projectPath) {
  if (!projectPath || !fs.existsSync(projectPath)) return null;

  try {
    const enginePath = globalStore.getGlobalEnginePath();
    if (fs.existsSync(enginePath)) {
      const { execSync } = require('child_process');
      execSync(`node "${enginePath}" sync`, { cwd: projectPath, stdio: 'ignore' });
      return true;
    }
  } catch (e) {
    console.error('Plan sync error:', e.message);
    return null;
  }
}
