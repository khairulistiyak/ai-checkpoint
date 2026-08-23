import fs from 'fs';
import { getSettings } from './settings.js';
import { loadCoreModule } from './module-loader.js';

function resolveProjectPath(id) {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === id);
    if (project && fs.existsSync(project.path)) return project.path;
  } catch {}
  return process.cwd();
}

export function handleGetDryAnalysis(req, res) {
  try {
    const projectPath = resolveProjectPath(req.params.id);
    const core = loadCoreModule();
    if (!core || !core.detectDuplicates) return res.status(500).json({ error: 'DRY detector not available' });

    const threshold = req.query.threshold ? parseFloat(req.query.threshold) / 100 : 0.75;
    const result = core.detectDuplicates(projectPath, { threshold });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function handleGetUtilityIndex(req, res) {
  try {
    const projectPath = resolveProjectPath(req.params.id);
    const core = loadCoreModule();
    if (!core || !core.buildUtilityIndex) return res.status(500).json({ error: 'Utility indexer not available' });

    const query = req.query.q || '';
    const index = core.buildUtilityIndex(projectPath);
    const results = core.searchUtility(index, query, { limit: 50 });
    res.json({ total: index.totalUtilities, exported: index.exportedCount, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export function handleGetRefactorProposal(req, res) {
  try {
    const core = loadCoreModule();
    if (!core || !core.generateRefactorProposal) return res.status(500).json({ error: 'Refactor engine not available' });

    const pair = req.body;
    if (!pair || !pair.funcA || !pair.funcB) return res.status(400).json({ error: 'Invalid pair payload' });

    const proposal = core.generateRefactorProposal(pair);
    res.json(proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
