import fs from 'fs';
import path from 'path';
import coreParser from '../../../packages/core/parse-progress.js';

export function parseProgress(projectPath) {
  try {
    const progressFile = path.join(projectPath, '.agents', 'PROGRESS.md');
    if (!fs.existsSync(progressFile)) return null;

    const content = fs.readFileSync(progressFile, 'utf8');
    return coreParser.parseProgressText(content);
  } catch (e) {
    console.error(`⚠️ Exception parsing PROGRESS.md for ${projectPath}:`, e.message);
    return null;
  }
}

export function enrichProject(p) {
  try {
    if (!p || !p.path || !fs.existsSync(p.path)) {
      return { ...p, isInstalled: false, progress: null, hasPlanFiles: false };
    }
    const isInstalled = fs.existsSync(path.join(p.path, '.agents', 'PROGRESS.md'));
    let progress = null;
    let hasPlanFiles = false;
    if (isInstalled) {
      progress = parseProgress(p.path);
      const planDir = path.join(p.path, 'plan');
      if (fs.existsSync(planDir)) {
        hasPlanFiles = fs.readdirSync(planDir).some(f => f.endsWith('.md') && !f.startsWith('.') && fs.statSync(path.join(planDir, f)).isFile());
      }
    }
    return { ...p, isInstalled, progress, hasPlanFiles };
  } catch (e) {
    console.error(`⚠️ Error enriching project ${p?.path}:`, e.message);
    return { ...p, isInstalled: false, progress: null, hasPlanFiles: false };
  }
}
