import { createRequire } from 'module';
import { getSettings } from './settings.js';

const require = createRequire(import.meta.url);
const { scaffoldCleanArchitecture } = require('../../../packages/core/clean-arch-scaffold.js');
const { scanBoundaryLeaks } = require('../../../packages/core/boundary-scanner.js');

export function handleScaffoldCleanArch(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find((p) => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const result = scaffoldCleanArchitecture(project.path, req.body || {});
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function handleGetBoundaryLeaks(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find((p) => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const report = scanBoundaryLeaks(project.path);
    res.json(report);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
