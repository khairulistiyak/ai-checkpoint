import fs from 'fs';
import path from 'path';
import { getSettings, saveSettings } from './settings.js';
import { runCommand } from './run-command.js';
import { watcherManager } from './watcher.js';
import * as globalStore from './global-store.js';

export function handleUpdateProject(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find((p) => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { name, notes } = req.body;
    if (name && typeof name === 'string') project.name = name.trim();
    if (notes !== undefined) project.notes = notes;

    saveSettings(settings);
    res.json({ success: true, project });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function handleRelinkBridge(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find((p) => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    watcherManager.generatePointerFiles(project.path);
    res.json({ success: true, message: 'Root AGENTS.md bridge refreshed successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function handleSyncPlans(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find((p) => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const enginePath = globalStore.getGlobalEnginePath();
    if (fs.existsSync(enginePath)) {
      runCommand('node', [enginePath, 'sync'], project.path);
    }
    res.json({ success: true, message: 'Plans synchronized to PROGRESS.md' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function handleExportProject(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find((p) => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const exportData = {
      version: 1,
      projectId: project.id,
      name: project.name,
      timestamp: new Date().toISOString(),
      globalFiles: {},
      planFiles: {}
    };

    // Read global files
    const globalPaths = {
      'PROGRESS.md': globalStore.getProgressPath(project.id),
      'RULES.md': globalStore.getRulesPath(project.id),
      'AGENTS.md': globalStore.getAgentsPath(project.id),
      'SYSTEM_GUIDE.md': globalStore.getSystemGuidePath(project.id),
      'ai-config.json': globalStore.getAiConfigPath(project.id)
    };

    for (const [key, filepath] of Object.entries(globalPaths)) {
      if (fs.existsSync(filepath)) {
        exportData.globalFiles[key] = fs.readFileSync(filepath, 'utf8');
      }
    }

    // Read plan files
    const planDir = path.join(project.path, 'plan');
    if (fs.existsSync(planDir)) {
      const plans = fs.readdirSync(planDir).filter(f => f.endsWith('.md'));
      for (const p of plans) {
        exportData.planFiles[p] = fs.readFileSync(path.join(planDir, p), 'utf8');
      }
    }

    res.setHeader('Content-disposition', `attachment; filename=ai-checkpoint-export-${project.name.replace(/\s+/g, '-')}.json`);
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(exportData, null, 2));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function handleImportProject(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find((p) => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const importData = req.body;
    if (!importData || importData.version !== 1) {
      return res.status(400).json({ error: 'Invalid export file format' });
    }

    globalStore.ensureProjectDataDir(project.id);

    // Restore global files
    const globalPaths = {
      'PROGRESS.md': globalStore.getProgressPath(project.id),
      'RULES.md': globalStore.getRulesPath(project.id),
      'AGENTS.md': globalStore.getAgentsPath(project.id),
      'SYSTEM_GUIDE.md': globalStore.getSystemGuidePath(project.id),
      'ai-config.json': globalStore.getAiConfigPath(project.id)
    };

    if (importData.globalFiles) {
      for (const [key, content] of Object.entries(importData.globalFiles)) {
        if (globalPaths[key]) {
          fs.writeFileSync(globalPaths[key], content, 'utf8');
        }
      }
    }

    // Restore plan files
    if (importData.planFiles) {
      const planDir = path.join(project.path, 'plan');
      if (!fs.existsSync(planDir)) fs.mkdirSync(planDir, { recursive: true });
      for (const [key, content] of Object.entries(importData.planFiles)) {
        fs.writeFileSync(path.join(planDir, key), content, 'utf8');
      }
    }

    res.json({ success: true, message: 'Project data successfully restored from import.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
