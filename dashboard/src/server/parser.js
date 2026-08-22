import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import coreParser from '../../../packages/core/parse-progress.js';
import * as globalStore from './global-store.js';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getSyncUtils() {
  try {
    const rootCli = path.resolve(__dirname, '..', '..', '..', 'packages', 'cli');
    return require(path.join(rootCli, 'plan-sync-utils.js'));
  } catch { return null; }
}

export function parsePlanFiles(projectId, projectPath) {
  try {
    const planDir = path.join(projectPath, 'plan');
    if (!fs.existsSync(planDir)) return { totalFiles: 0, totalSteps: 0, fileNames: [], files: [], parsedPhases: [] };
    const files = fs.readdirSync(planDir).filter(f => f.endsWith('.md') && !f.startsWith('.') && fs.statSync(path.join(planDir, f)).isFile());
    let totalSteps = 0;
    const filesData = [], parsedPhases = [];
    const utils = getSyncUtils();

    for (const file of files) {
      const filePath = path.join(planDir, file);
      const createdAt = fs.statSync(filePath).birthtime || fs.statSync(filePath).mtime;
      let stepCount = 0, parsed = null;

      if (utils?.parsePlanFileSteps) {
        parsed = utils.parsePlanFileSteps(filePath);
        stepCount = parsed.steps.length;
        if (parsed.phaseNum && parsed.steps.length > 0) parsedPhases.push(parsed);
      } else {
        const content = fs.readFileSync(filePath, 'utf8');
        for (const line of content.split(/\r?\n/)) {
          if (/(?:##|###|\s*-\s*\[[ x!/~]\])\s*(?:Step\s+)?\d+\.\d+/i.test(line.trim())) stepCount++;
        }
      }
      totalSteps += stepCount;
      filesData.push({ name: file, steps: stepCount, createdAt, phaseNum: parsed?.phaseNum });
    }
    return { totalFiles: files.length, totalSteps, fileNames: filesData, files: filesData, parsedPhases };
  } catch (e) {
    return { totalFiles: 0, totalSteps: 0, fileNames: [], files: [], parsedPhases: [] };
  }
}

export function parseProgress(projectId) {
  try {
    const progressFile = globalStore.getProgressPath(projectId);
    if (!fs.existsSync(progressFile)) return null;
    return coreParser.parseProgressText(fs.readFileSync(progressFile, 'utf8'));
  } catch { return null; }
}

export function parseIntelligence(projectId) {
  try {
    const histFile = globalStore.getIntelligenceHistoryPath(projectId);
    if (!fs.existsSync(histFile)) return null;
    const history = JSON.parse(fs.readFileSync(histFile, 'utf8'));
    return history.length > 0 ? history[history.length - 1] : null;
  } catch { return null; }
}

function mergeUnsyncedPhases(progress, parsedPhases) {
  if (!progress?.phases) return progress;
  const existing = new Set(progress.phases.map(p => String(p.number)));
  const merged = [...progress.phases];

  for (const pp of parsedPhases) {
    if (!existing.has(String(pp.phaseNum))) {
      merged.push({
        number: pp.phaseNum,
        name: pp.phaseName || `Phase ${pp.phaseNum}`,
        statusText: '🔴 0% PENDING',
        steps: pp.steps.map(s => ({
          status: 'pending', number: s.number, title: s.title, lineIndex: -1,
          lineContent: `- [ ] **Step ${s.number}** — ${s.title}`
        })),
        percentage: 0, headerIndex: -1, headerLine: `## 🔷 Phase ${pp.phaseNum}: ${pp.phaseName}`
      });
      existing.add(String(pp.phaseNum));
    }
  }

  let total = 0, completed = 0;
  merged.forEach(p => {
    total += p.steps.length;
    completed += p.steps.filter(s => s.status === 'done').length;
  });

  return {
    ...progress,
    phases: merged,
    overall: { percentage: total > 0 ? Math.round((completed / total) * 100) : 0, completed, total }
  };
}

export function enrichProject(p) {
  try {
    if (!p?.path || !fs.existsSync(p.path)) {
      const fallback = p?.name || path.basename((p?.path || '').replace(/\/+$/, '')) || 'Untitled';
      return { ...p, name: fallback, isInstalled: false, progress: null, hasPlanFiles: false, planStats: { totalFiles: 0, totalSteps: 0, fileNames: [] }, unsyncedSteps: 0 };
    }
    const safeName = p.name || path.basename(p.path.replace(/\/+$/, '')) || 'Untitled';
    const isInstalled = fs.existsSync(globalStore.getProgressPath(p.id));
    let progress = isInstalled ? parseProgress(p.id) : null;
    let hasPlanFiles = false;
    let planStats = { totalFiles: 0, totalSteps: 0, fileNames: [], parsedPhases: [] };

    const planDir = path.join(p.path, 'plan');
    if (fs.existsSync(planDir)) {
      hasPlanFiles = fs.readdirSync(planDir).some(f => f.endsWith('.md') && !f.startsWith('.') && fs.statSync(path.join(planDir, f)).isFile());
      if (hasPlanFiles) planStats = parsePlanFiles(p.id, p.path);
    }

    if (progress && planStats.parsedPhases?.length > 0) {
      progress = mergeUnsyncedPhases(progress, planStats.parsedPhases);
    }

    const intelligence = isInstalled ? parseIntelligence(p.id) : null;

    const progressTotal = progress?.overall?.total || 0;
    const planTotal = planStats?.totalSteps || 0;
    const unsyncedSteps = Math.max(0, planTotal - progressTotal);
    return { ...p, name: safeName, isInstalled, progress, hasPlanFiles, planStats, unsyncedSteps, intelligence };
  } catch (e) {
    const fallback = p?.name || path.basename((p?.path || '').replace(/\/+$/, '')) || 'Untitled';
    return { ...p, name: fallback, isInstalled: false, progress: null, hasPlanFiles: false, planStats: { totalFiles: 0, totalSteps: 0, fileNames: [] }, unsyncedSteps: 0, intelligence: null };
  }
}
