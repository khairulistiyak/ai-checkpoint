import { Router } from 'express';
import { getSettings } from './settings.js';
import { loadHealthModule } from './module-loader.js';

const router = Router();

router.get('/projects/:id/health', (req, res) => {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const mod = loadHealthModule();
    if (!mod) return res.status(500).json({ error: 'Health module not available' });

    const result = mod.calculateHealth(project.path);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
