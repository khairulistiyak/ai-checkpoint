import { Worker } from 'worker_threads';
import { getSettings } from './settings.js';
import { scanCache } from './scanner-cache.js';
import intelligenceHistory from '../../../packages/core/intelligence-history.js';

const { appendHistory, getHistory } = intelligenceHistory;

function runWorkerScan(projectPath, scanType) {
  return new Promise((resolve, reject) => {
    const workerPath = new URL('./scanner-worker.js', import.meta.url);
    const worker = new Worker(workerPath, {
      workerData: { projectPath, scanType }
    });
    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error('Scanner timeout (30s)'));
    }, 30000);
    worker.on('message', (msg) => {
      clearTimeout(timeout);
      if (msg.success) resolve(msg.result);
      else reject(new Error(msg.error));
    });
    worker.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

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
    console.error('Failed to get intelligence report:', error.message);
    res.status(500).json({ error: 'Failed to generate intelligence report' });
  }
}
