import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getSettings } from './settings.js';
import { enrichProject } from './parser.js';
import checkpointsRouter from './checkpoints.js';
import { watcherManager } from './watcher.js';
import { handleHealthCheck, handleAutofix } from './project-health.js';
import { handleCommand } from './project-commands.js';
import { handleGetPlanFile, handleSavePlanFile, handleRestoreProgress } from './project-plans.js';
import { handleWatch, handleGetActivityLog, handleDeleteActivityLog } from './project-activity.js';
import { handleUpdateProject, handleRelinkBridge, handleSyncPlans } from './project-actions.js';
import { handleDetectStack } from './stack-detector.js';
import { handleGetCompliance } from './project-compliance.js';
import { handleScaffoldCleanArch, handleGetBoundaryLeaks } from './clean-arch-routes.js';
import { handleGetDryAnalysis, handleGetUtilityIndex, handleGetRefactorProposal } from './dry-analysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const settings = getSettings();
    res.json(settings.projects.map(enrichProject));
  } catch (e) {
    res.json([]);
  }
});

router.get('/:id', (req, res) => {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(enrichProject(project));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.get('/:id/stack', handleDetectStack);
router.get('/:id/compliance', handleGetCompliance);
router.get('/:id/boundary-leaks', handleGetBoundaryLeaks);
router.post('/:id/scaffold-clean-arch', handleScaffoldCleanArch);
router.get('/:id/dry-analysis', handleGetDryAnalysis);
router.get('/:id/utility-index', handleGetUtilityIndex);
router.post('/:id/refactor-proposal', handleGetRefactorProposal);
router.put('/:id', handleUpdateProject);
router.post('/:id/relink-bridge', handleRelinkBridge);
router.post('/:id/sync-plans', handleSyncPlans);

router.post('/:id/install', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const aiCheckpointRoot = path.resolve(__dirname, '..', '..', '..');
  const templatesDir = path.join(aiCheckpointRoot, 'templates');
  const scriptsDir = path.join(aiCheckpointRoot, 'scripts');
  const projectDir = project.path;

  try {
    fs.mkdirSync(path.join(projectDir, '.agents', 'scripts'), { recursive: true });
    fs.mkdirSync(path.join(projectDir, '.agents', 'packages', 'cli'), { recursive: true });
    fs.mkdirSync(path.join(projectDir, '.agents', 'packages', 'core'), { recursive: true });
    fs.mkdirSync(path.join(projectDir, 'plan', 'drafts'), { recursive: true });

    const ledgerSrc = path.join(scriptsDir, 'ledger.cjs');
    if (fs.existsSync(ledgerSrc)) {
      fs.copyFileSync(ledgerSrc, path.join(projectDir, '.agents', 'scripts', 'ledger.cjs'));
    }

    for (const srcDir of [path.join(aiCheckpointRoot, 'packages', 'cli'), path.join(aiCheckpointRoot, 'packages', 'core')]) {
      if (fs.existsSync(srcDir)) {
        const destDir = path.join(projectDir, '.agents', 'packages', path.basename(srcDir));
        fs.readdirSync(srcDir).filter(f => f.endsWith('.js')).forEach(f => fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f)));
      }
    }

    fs.writeFileSync(path.join(projectDir, 'l'), '#!/bin/bash\nnode .agents/scripts/ledger.cjs "$@"\n', { mode: 0o755 });

    const filesToCopy = [
      { src: 'AGENTS.md', dest: path.join('.agents', 'AGENTS.md') },
      { src: 'PROGRESS.md', dest: path.join('.agents', 'PROGRESS.md') },
      { src: 'RULES.md', dest: path.join('.agents', 'RULES.md') },
      { src: 'SYSTEM_GUIDE.md', dest: path.join('.agents', 'SYSTEM_GUIDE.md') },
      { src: 'drafts-README.md', dest: path.join('plan', 'drafts', 'README.md') },
    ];

    for (const f of filesToCopy) {
      const destPath = path.join(projectDir, f.dest);
      const srcPath = path.join(templatesDir, f.src);
      if (!fs.existsSync(destPath) && fs.existsSync(srcPath)) fs.copyFileSync(srcPath, destPath);
    }

    watcherManager.generatePointerFiles(projectDir);
    watcherManager.getOrCreateWatcher(project.id, projectDir);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to install' });
  }
});

router.get('/:id/health', handleHealthCheck);
router.post('/:id/autofix', handleAutofix);
router.post('/:id/command', handleCommand);
router.use('/', checkpointsRouter);
router.get('/:id/plan-file/:filename', handleGetPlanFile);
router.post('/:id/plan-file/:filename', handleSavePlanFile);
router.get('/:id/watch', handleWatch);
router.post('/:id/restore-progress', handleRestoreProgress);
router.get('/:id/activity-log', handleGetActivityLog);
router.delete('/:id/activity-log', handleDeleteActivityLog);

export default router;
