import fs from 'fs';
import path from 'path';
import coreParser from '../../../packages/core/parse-progress.js';

export function parsePlanFiles(projectPath) {
  try {
    const planDir = path.join(projectPath, 'plan');
    if (!fs.existsSync(planDir)) {
      return { totalFiles: 0, totalSteps: 0, fileNames: [], files: [] };
    }
    const files = fs.readdirSync(planDir).filter(f => f.endsWith('.md') && !f.startsWith('.') && fs.statSync(path.join(planDir, f)).isFile());
    let totalSteps = 0;
    const filesData = [];

    for (const file of files) {
      const filePath = path.join(planDir, file);
      const fileStat = fs.statSync(filePath);
      const createdAt = fileStat.birthtime || fileStat.mtime;
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split(/\r?\n/);
      let stepCount = 0;
      for (const line of lines) {
        if (/^(?:##|###)\s*(?:Step\s+)?\d+\.\d+/i.test(line.trim())) {
          stepCount++;
        }
      }
      totalSteps += stepCount;
      filesData.push({ name: file, steps: stepCount, createdAt });
    }

    return {
      totalFiles: files.length,
      totalSteps,
      fileNames: filesData,
      files: filesData
    };
  } catch (e) {
    console.error(`⚠️ Exception parsing plan files for ${projectPath}:`, e.message);
    return { totalFiles: 0, totalSteps: 0, fileNames: [], files: [] };
  }
}

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
      return { ...p, isInstalled: false, progress: null, hasPlanFiles: false, planStats: { totalFiles: 0, totalSteps: 0, fileNames: [] } };
    }
    const isInstalled = fs.existsSync(path.join(p.path, '.agents', 'PROGRESS.md'));
    let progress = null;
    let hasPlanFiles = false;
    let planStats = { totalFiles: 0, totalSteps: 0, fileNames: [] };
    if (isInstalled) {
      progress = parseProgress(p.path);
    }
    const planDir = path.join(p.path, 'plan');
    if (fs.existsSync(planDir)) {
      hasPlanFiles = fs.readdirSync(planDir).some(f => f.endsWith('.md') && !f.startsWith('.') && fs.statSync(path.join(planDir, f)).isFile());
      if (hasPlanFiles) {
        planStats = parsePlanFiles(p.path);
      }
    }
    return { ...p, isInstalled, progress, hasPlanFiles, planStats };
  } catch (e) {
    console.error(`⚠️ Error enriching project ${p?.path}:`, e.message);
    return { ...p, isInstalled: false, progress: null, hasPlanFiles: false, planStats: { totalFiles: 0, totalSteps: 0, fileNames: [] } };
  }
}
