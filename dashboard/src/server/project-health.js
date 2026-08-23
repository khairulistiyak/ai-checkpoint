import fs from 'fs';
import path from 'path';
import { getSettings } from './settings.js';
import * as globalStore from './global-store.js';
import { scanCache } from './scanner-cache.js';
import { runWorkerScan } from './worker-runner.js';

function collectIssues(fullHealth, qualityReport) {
  const issues = [];
  (fullHealth?.issues || []).forEach(i => {
    issues.push({
      ...i,
      category: i.type === 'rule0' ? 'rule0' : i.type === 'syntax' ? 'syntax' : i.type === 'broken-import' ? 'imports' : i.type === 'security' ? 'security' : 'general',
      severity: i.severity || (i.type === 'syntax' || i.type === 'rule0' || i.severity === 'critical' ? 'critical' : 'warning')
    });
  });
  (qualityReport?.issues || []).forEach(i => {
    issues.push({
      ...i,
      file: i.file || '',
      line: i.line || 0,
      error: i.message || i.error || i.name || `${i.type} issue`,
      category: i.category || (i.type === 'junk-file' || i.type === 'empty-file' ? 'structure' : i.type === 'debug-log' || i.type === 'todo-comment' ? 'hygiene' : 'complexity'),
      severity: i.type === 'junk-file' ? 'warning' : 'info'
    });
  });
  return issues;
}

export async function handleHealthCheck(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });

    const cwd = project.path;
    const cacheKey = `health:${project.id}`;
    const cached = scanCache.get(cacheKey);
    if (cached) return res.json(cached);

    const checks = [
      { name: 'Project Data Directory', passed: fs.existsSync(globalStore.getProjectDataDir(project.id)) },
      { name: 'PROGRESS.md', passed: fs.existsSync(globalStore.getProgressPath(project.id)) },
      { name: 'RULES.md', passed: fs.existsSync(globalStore.getRulesPath(project.id)) },
      { name: 'AGENTS.md', passed: fs.existsSync(globalStore.getAgentsPath(project.id)) },
      { name: 'Global Engine', passed: fs.existsSync(globalStore.getGlobalEnginePath()) },
      { name: 'plan directory', passed: fs.existsSync(path.join(cwd, 'plan')), optional: true },
      { name: 'git repository', passed: fs.existsSync(path.join(cwd, '.git')), optional: true }
    ];

    let fullHealth = null, qualityReport = null;
    try { fullHealth = await runWorkerScan(cwd, 'health'); } catch (e) { /* ignore */ }
    try { qualityReport = await runWorkerScan(cwd, 'quality'); } catch (e) { /* ignore */ }

    const allChecksPassed = checks.every(c => c.passed);
    const healthScore = fullHealth?.score ?? 100;
    const qualityScore = qualityReport?.score ?? 100;
    const combinedScore = Math.round((healthScore * 0.6) + (qualityScore * 0.4));
    const issues = collectIssues(fullHealth, qualityReport);

    const responseData = {
      score: combinedScore,
      healthScore,
      qualityScore,
      maxScore: 100,
      passed: fullHealth ? (fullHealth.passed && (!qualityReport || qualityReport.passed)) : allChecksPassed,
      filesScanned: fullHealth?.filesScanned || qualityReport?.breakdown?.totalFiles || 0,
      breakdown: {
        syntaxErrors: fullHealth?.breakdown?.syntaxErrors || 0,
        brokenImports: fullHealth?.breakdown?.brokenImports || 0,
        rule0Violations: fullHealth?.breakdown?.rule0Violations || 0,
        criticalSecurity: fullHealth?.breakdown?.criticalSecurity || 0,
        warningSecurity: fullHealth?.breakdown?.warningSecurity || 0,
        hygieneIssues: qualityReport?.breakdown?.hygieneIssues || 0,
        complexityIssues: qualityReport?.breakdown?.complexityIssues || 0,
        structureIssues: qualityReport?.breakdown?.structureIssues || 0,
        namingIssues: qualityReport?.breakdown?.namingIssues || 0,
        dependencyIssues: qualityReport?.breakdown?.dependencyIssues || 0,
        configIssues: qualityReport?.breakdown?.configIssues || 0,
      },
      issues,
      checks,
      allPassed: allChecksPassed
    };

    scanCache.set(cacheKey, responseData);
    res.json(responseData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function handleAutofix(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });

    const cleanJunk = (dir) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.name.startsWith('._') || entry.name === '.DS_Store' || entry.name === 'Thumbs.db') {
          try { fs.unlinkSync(full); } catch (e) { /* ignored */ }
        } else if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
          cleanJunk(full);
        }
      }
    };

    cleanJunk(project.path);
    res.json({ success: true, message: 'Cleaned junk and temporary system files successfully.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
