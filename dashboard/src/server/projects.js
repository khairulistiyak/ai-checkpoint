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
import { handleUpdateProject, handleRelinkBridge, handleSyncPlans, handleExportProject, handleImportProject } from './project-actions.js';
import { handleDetectStack } from './stack-detector.js';
import aiScaffolder from '../../../packages/core/ai-scaffolder.js';
const { scaffoldStrictRules } = aiScaffolder;
import { handleGetCompliance } from './project-compliance.js';
import { handleScaffoldCleanArch, handleGetBoundaryLeaks } from './clean-arch-routes.js';
import { handleGetDryAnalysis, handleGetUtilityIndex, handleGetRefactorProposal } from './dry-analysis.js';
import { handleGetIntelligence } from './intelligence.js';
import * as globalStore from './global-store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const settings = getSettings();
    const projects = settings.projects.map(p => {
      let enriched = enrichProject(p);
      if (!enriched.isInstalled && enriched.hasPlanFiles) {
        globalStore.recoverProgressFromPlans(p.id, p.path);
        enriched = enrichProject(p); // Re-enrich after recovery
      }
      return enriched;
    });
    res.json(projects);
  } catch (e) {
    res.json([]);
  }
});

router.get('/:id', (req, res) => {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    
    let enriched = enrichProject(project);
    if (!enriched.isInstalled && enriched.hasPlanFiles) {
      globalStore.recoverProgressFromPlans(project.id, project.path);
      enriched = enrichProject(project); // Re-enrich after recovery
    }
    
    res.json(enriched);
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
router.get('/:id/intelligence', handleGetIntelligence);
router.put('/:id', handleUpdateProject);
router.post('/:id/relink-bridge', handleRelinkBridge);
router.post('/:id/sync-plans', handleSyncPlans);
router.get('/:id/export', handleExportProject);
router.post('/:id/import', handleImportProject);

router.post('/:id/install', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const aiCheckpointRoot = path.resolve(__dirname, '..', '..', '..');
  const templatesDir = path.join(aiCheckpointRoot, 'templates');
  const scriptsDir = path.join(aiCheckpointRoot, 'scripts');
  const projectDir = project.path;

  try {
    const projectDataDir = globalStore.ensureProjectDataDir(project.id);
    fs.mkdirSync(path.join(projectDir, '.agents'), { recursive: true });
    fs.mkdirSync(path.join(projectDir, 'plan', 'drafts'), { recursive: true });

    const globalFilesToCopy = [
      { src: 'AGENTS.md', dest: globalStore.getAgentsPath(project.id) },
      { src: 'PROGRESS.md', dest: globalStore.getProgressPath(project.id) },
      { src: 'RULES.md', dest: globalStore.getRulesPath(project.id) },
      { src: 'SYSTEM_GUIDE.md', dest: globalStore.getSystemGuidePath(project.id) },
    ];

    for (const f of globalFilesToCopy) {
      const srcPath = path.join(templatesDir, f.src);
      if (!fs.existsSync(f.dest) && fs.existsSync(srcPath)) fs.copyFileSync(srcPath, f.dest);
    }

    const localFilesToCopy = [
      { src: 'AGENTS.md', dest: path.join(projectDir, 'AGENTS.md') },
      { src: 'RULES.md', dest: path.join(projectDir, '.agents', 'RULES.md') },
      { src: 'SYSTEM_GUIDE.md', dest: path.join(projectDir, '.agents', 'SYSTEM_GUIDE.md') },
      { src: 'drafts-README.md', dest: path.join(projectDir, 'plan', 'drafts', 'README.md') },
    ];

    for (const f of localFilesToCopy) {
      const srcPath = path.join(templatesDir, f.src);
      if (!fs.existsSync(f.dest) && fs.existsSync(srcPath)) fs.copyFileSync(srcPath, f.dest);
    }

    scaffoldStrictRules(projectDir);

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
