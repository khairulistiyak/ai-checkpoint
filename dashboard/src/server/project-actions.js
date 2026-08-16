import fs from 'fs';
import path from 'path';
import { getSettings, saveSettings } from './settings.js';
import { runCommand } from './run-command.js';
import { watcherManager } from './watcher.js';

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

    const ledgerScript = path.join(project.path, '.agents', 'scripts', 'ledger.cjs');
    if (fs.existsSync(ledgerScript)) {
      runCommand('node', [ledgerScript, 'sync'], project.path);
    }
    res.json({ success: true, message: 'Plans synchronized to PROGRESS.md' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
