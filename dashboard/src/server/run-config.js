import express from 'express';
import { getSettings } from './settings.js';
import { detectProjectRunConfig, saveCustomRunConfig } from '../../../packages/core/run-config.js';

const router = express.Router();

router.get('/projects/:id/run-config', (req, res) => {
  try {
    const settings = getSettings();
    const project = (settings.projects || []).find(p => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const config = detectProjectRunConfig(project.path);
    res.json(config);
  } catch (e) {
    console.error(`⚠️ Error fetching run config for ${req.params.id}:`, e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post('/projects/:id/run-config', (req, res) => {
  try {
    const settings = getSettings();
    const project = (settings.projects || []).find(p => p.id === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const ok = saveCustomRunConfig(project.path, req.body);
    if (!ok) {
      return res.status(500).json({ error: 'Failed to save run config' });
    }

    const updated = detectProjectRunConfig(project.path);
    res.json({ success: true, config: updated });
  } catch (e) {
    console.error(`⚠️ Error saving run config for ${req.params.id}:`, e.message);
    res.status(500).json({ error: e.message });
  }
});

export default router;
