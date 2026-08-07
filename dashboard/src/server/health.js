import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

function loadHealthModule() {
  const corePath = path.resolve(__dirname, '..', '..', '..', 'packages', 'core', 'health-score.js');
  try { return require(corePath); } catch { return null; }
}

router.get('/projects/:id/health', (req, res) => {
  try {
    const configPath = path.resolve(process.cwd(), '.agents', 'config.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const project = (config.projects || []).find(p => p.id === req.params.id);
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
