import express from 'express';
import fs from 'fs';
import path from 'path';
import { getSettings } from './settings.js';

const router = express.Router();

router.get('/projects/:id/config', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const rulesPath = path.join(project.path, '.agents', 'RULES.md');
  const agentsPath = path.join(project.path, '.agents', 'AGENTS.md');

  const rules = fs.existsSync(rulesPath) ? fs.readFileSync(rulesPath, 'utf8') : '';
  const agents = fs.existsSync(agentsPath) ? fs.readFileSync(agentsPath, 'utf8') : '';

  res.json({ rules, agents });
});

router.post('/projects/:id/config', (req, res) => {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const { rules, agents } = req.body;
  const MAX_SIZE = 50 * 1024;
  if (rules !== undefined && rules.length > MAX_SIZE) return res.status(400).json({ error: 'Rules content too large (max 50KB)' });
  if (agents !== undefined && agents.length > MAX_SIZE) return res.status(400).json({ error: 'Agents content too large (max 50KB)' });

  const rulesPath = path.join(project.path, '.agents', 'RULES.md');
  const agentsPath = path.join(project.path, '.agents', 'AGENTS.md');

  try {
    if (rules !== undefined) fs.writeFileSync(rulesPath, rules);
    if (agents !== undefined) fs.writeFileSync(agentsPath, agents);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
