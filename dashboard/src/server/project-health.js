import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { getSettings } from './settings.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function handleHealthCheck(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });

    const cwd = project.path;
    const checks = [
      { name: '.agents directory', passed: fs.existsSync(path.join(cwd, '.agents')) },
      { name: 'PROGRESS.md', passed: fs.existsSync(path.join(cwd, '.agents', 'PROGRESS.md')) },
      { name: 'RULES.md', passed: fs.existsSync(path.join(cwd, '.agents', 'RULES.md')) },
      { name: 'AGENTS.md', passed: fs.existsSync(path.join(cwd, '.agents', 'AGENTS.md')) },
      { name: 'CLI scripts', passed: fs.existsSync(path.join(cwd, '.agents', 'scripts', 'ledger.cjs')) },
      { name: 'plan directory', passed: fs.existsSync(path.join(cwd, 'plan')) },
      { name: 'git repository', passed: fs.existsSync(path.join(cwd, '.git')) }
    ];

    let fullHealth = null;
    let qualityReport = null;

    try {
      const healthPath = path.resolve(__dirname, '..', '..', '..', 'packages', 'core', 'health-score.js');
      if (fs.existsSync(healthPath)) {
        const { calculateHealth } = require(healthPath);
        if (typeof calculateHealth === 'function') {
          fullHealth = calculateHealth(cwd);
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not run calculateHealth in projects router:', e.message);
    }

    try {
      const qualityPath = path.resolve(__dirname, '..', '..', '..', 'packages', 'core', 'quality-report.js');
      if (fs.existsSync(qualityPath)) {
        const { generateQualityReport } = require(qualityPath);
        if (typeof generateQualityReport === 'function') {
          qualityReport = generateQualityReport(cwd);
        }
      }
    } catch (e) {
      console.warn('⚠️ Could not run generateQualityReport in projects router:', e.message);
    }

    const allChecksPassed = checks.every(c => c.passed);
    const healthScore = fullHealth?.score ?? 100;
    const qualityScore = qualityReport?.score ?? 100;
    const combinedScore = Math.round((healthScore * 0.6) + (qualityScore * 0.4));

    // Combine & categorize all issues cleanly
    const issues = [
      ...(fullHealth?.issues || []).map(i => ({
        ...i,
        category: i.type === 'rule0' ? 'rule0' : i.type === 'syntax' ? 'syntax' : i.type === 'broken-import' ? 'imports' : i.type === 'security' ? 'security' : 'general',
        severity: i.severity || (i.type === 'syntax' || i.type === 'rule0' || i.severity === 'critical' ? 'critical' : 'warning')
      })),
      ...(qualityReport?.issues || []).map(i => ({
        ...i,
        file: i.file || '',
        line: i.line || 0,
        error: i.message || i.error || i.name || `${i.type} issue`,
        category: i.category || (i.type === 'junk-file' || i.type === 'empty-file' ? 'structure' : i.type === 'debug-log' || i.type === 'todo-comment' ? 'hygiene' : 'complexity'),
        severity: i.type === 'junk-file' ? 'warning' : 'info'
      }))
    ];

    res.json({
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
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function handleAutofix(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });

    const cwd = project.path;
    // Clean junk files (._*, .DS_Store)
    const cleanJunk = (dir) => {
      if (!fs.existsSync(dir)) return;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.name.startsWith('._') || entry.name === '.DS_Store' || entry.name === 'Thumbs.db') {
          try { fs.unlinkSync(full); } catch (e) { /* junk cleanup error ignored */ }
        } else if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.git') {
          cleanJunk(full);
        }
      }
    };

    cleanJunk(cwd);

    res.json({
      success: true,
      message: 'Cleaned junk and temporary system files successfully.'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
