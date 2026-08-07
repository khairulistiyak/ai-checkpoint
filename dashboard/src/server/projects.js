import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { getSettings } from './settings.js';
import { enrichProject } from './parser.js';
import { runCommand } from './run-command.js';
import checkpointsRouter from './checkpoints.js';
import { watcherManager } from './watcher.js';
import { handleHealthCheck, handleAutofix } from './project-health.js';
import { handleCommand } from './project-commands.js';
import { handleGetPlanFile, handleSavePlanFile, handleRestoreProgress } from './project-plans.js';
import { handleWatch, handleGetActivityLog, handleDeleteActivityLog } from './project-activity.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const settings = getSettings();
    res.json(settings.projects.map(enrichProject));
  } catch (e) {
    console.error('⚠️ Error fetching projects list:', e.message);
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
    console.error(`⚠️ Error fetching project ${req.params.id}:`, e.message);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

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

    // Copy CLI and Core packages
    const cliSrcDir = path.join(aiCheckpointRoot, 'packages', 'cli');
    const coreSrcDir = path.join(aiCheckpointRoot, 'packages', 'core');
    for (const srcDir of [cliSrcDir, coreSrcDir]) {
      if (fs.existsSync(srcDir)) {
        const destDir = path.join(projectDir, '.agents', 'packages', path.basename(srcDir));
        const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));
        for (const f of files) {
          fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
        }
      }
    }

    const lScript = '#!/bin/bash\nnode .agents/scripts/ledger.cjs "$@"\n';
    fs.writeFileSync(path.join(projectDir, 'l'), lScript, { mode: 0o755 });

    const filesToCopy = [
      { src: 'AGENTS.md',       dest: path.join('.agents', 'AGENTS.md') },
      { src: 'PROGRESS.md',     dest: path.join('.agents', 'PROGRESS.md') },
      { src: 'RULES.md',        dest: path.join('.agents', 'RULES.md') },
      { src: 'SYSTEM_GUIDE.md', dest: path.join('.agents', 'SYSTEM_GUIDE.md') },
      { src: 'drafts-README.md', dest: path.join('plan', 'drafts', 'README.md') },
    ];

    for (const f of filesToCopy) {
      const destPath = path.join(projectDir, f.dest);
      const srcPath = path.join(templatesDir, f.src);
      if (!fs.existsSync(destPath) && fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    // Generate AI tool pointer files (CLAUDE.md, .cursorrules, etc.)
    watcherManager.generatePointerFiles(projectDir);

    // Start watching this project
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

// ──────────────────────────────────────────────
// SSE: Real-time file watching endpoint
// ──────────────────────────────────────────────
router.get('/:id/watch', handleWatch);

// ──────────────────────────────────────────────
// Restore PROGRESS.md (user accepted warning)
// ──────────────────────────────────────────────
router.post('/:id/restore-progress', handleRestoreProgress);

// ──────────────────────────────────────────────
// Activity Log — read file change history
// ──────────────────────────────────────────────
router.get('/:id/activity-log', handleGetActivityLog);
router.delete('/:id/activity-log', handleDeleteActivityLog);

export default router;
