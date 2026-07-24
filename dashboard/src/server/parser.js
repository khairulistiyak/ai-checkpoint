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
