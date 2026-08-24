import { Router } from 'express';
import { getSettings } from './settings.js';
import { loadHealthModule, loadCoreModule } from './module-loader.js';

const router = Router();

router.get('/projects/:id/health', (req, res) => {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const mod = loadHealthModule();
    if (!mod) return res.status(500).json({ error: 'Health module not available' });

    const healthResult = mod.calculateHealth(project.path);

    let qualityScore = healthResult.score;
    let qualityBreakdown = {};
    let checks = [];

    const qualityMod = loadCoreModule('quality-report.js');
    if (qualityMod && qualityMod.generateQualityReport) {
      const qr = qualityMod.generateQualityReport(project.path);
      qualityScore = qr.score;
      qualityBreakdown = qr.breakdown || {};
      checks = [
        { name: 'Syntax Clean', passed: healthResult.breakdown.syntaxErrors === 0 },
        { name: 'Imports Resolved', passed: healthResult.breakdown.brokenImports === 0 },
        { name: 'Rule 0 Compliant', passed: healthResult.breakdown.rule0Violations === 0 },
        { name: 'No Critical Security', passed: healthResult.breakdown.criticalSecurity === 0 },
        { name: 'No Security Warnings', passed: healthResult.breakdown.warningSecurity === 0, optional: true },
        { name: 'Structure Clean', passed: (qualityBreakdown.structureIssues || 0) === 0, optional: true },
        { name: 'Naming Conventions', passed: (qualityBreakdown.namingIssues || 0) === 0, optional: true },
        { name: 'Code Hygiene', passed: (qualityBreakdown.hygieneIssues || 0) === 0, optional: true },
      ];
    }

    res.json({
      ...healthResult,
      healthScore: healthResult.score,
      qualityScore,
      qualityBreakdown,
      checks,
      breakdown: {
        ...healthResult.breakdown,
        ...qualityBreakdown,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
