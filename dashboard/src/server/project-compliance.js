import { createRequire } from 'module';
import { getSettings } from './settings.js';

const require = createRequire(import.meta.url);
const { evaluateRfcCompliance } = require('../../../packages/core/rfc-rules.js');

export function handleGetCompliance(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find((p) => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const compliance = evaluateRfcCompliance(project.path);
    res.json(compliance);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
