import { getSettings } from './settings.js';
import { scanCache } from './scanner-cache.js';
import { runWorkerScan } from './worker-runner.js';
import intelligenceHistory from '../../../packages/core/intelligence-history.js';

const { appendHistory } = intelligenceHistory;

export async function handleGetIntelligence(req, res) {
  try {
    const settings = getSettings();
    const project = settings.projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const cacheKey = `intelligence:${project.id}`;
    const cached = scanCache.get(cacheKey);
    if (cached) return res.json(cached);

    const report = await runWorkerScan(project.path, 'intelligence');
    const history = appendHistory(project.path, report);

    const responseData = { success: true, report, history };
    scanCache.set(cacheKey, responseData);
    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate intelligence report' });
  }
}
