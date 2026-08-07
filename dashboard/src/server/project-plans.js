import fs from 'fs';
import path from 'path';
import { getSettings } from './settings.js';
import { watcherManager } from './watcher.js';

export function handleGetPlanFile(req, res) {
  const project = getSettings().projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const filename = req.params.filename;
  if (!/^[a-zA-Z0-9_.-]+\.md$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  const filePath = path.join(project.path, 'plan', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Plan file not found' });
  }
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    res.json({ content, filename });
  } catch (e) {
    res.status(500).json({ error: 'Failed to read file' });
  }
}

export function handleSavePlanFile(req, res) {
  const project = getSettings().projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const filename = req.params.filename;
  if (!/^[a-zA-Z0-9_.-]+\.md$/.test(filename)) {
    return res.status(400).json({ error: 'Invalid filename' });
  }
  const filePath = path.join(project.path, 'plan', filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Plan file not found' });
  }
  const { content } = req.body;
  if (typeof content !== 'string') {
    return res.status(400).json({ error: 'Content must be a string' });
  }
  try {
    fs.writeFileSync(filePath, content, 'utf8');
    res.json({ success: true, filename });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save plan file' });
  }
}

export function handleRestoreProgress(req, res) {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const success = watcherManager.restoreProgressFromTemplate(project.id);
  if (success) {
    res.json({ success: true, message: 'PROGRESS.md restored from template' });
  } else {
    res.status(500).json({ error: 'Failed to restore PROGRESS.md' });
  }
}
