import fs from 'fs';
import path from 'path';
import { getSettings } from './settings.js';
import { watcherManager } from './watcher.js';
import { ActivityLogger } from './activity-logger.js';

export function handleWatch(req, res) {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.flushHeaders();

  // Send initial connection event
  res.write(`event: connected\ndata: ${JSON.stringify({ projectId: project.id })}\n\n`);

  // Ensure watcher is running and register this SSE client
  if (fs.existsSync(project.path) && fs.existsSync(path.join(project.path, '.agents'))) {
    watcherManager.getOrCreateWatcher(project.id, project.path);
  }
  watcherManager.sseManager.addClient(project.id, res);

  // Heartbeat every 30s to keep connection alive
  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch (e) { clearInterval(heartbeat); }
  }, 30000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(heartbeat);
    watcherManager.sseManager.removeClient(project.id, res);
  });
}

export function handleGetActivityLog(req, res) {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const limit = Math.min(parseInt(req.query.limit) || 100, 500);
  const offset = parseInt(req.query.offset) || 0;

  try {
    let logger;
    const watcher = watcherManager.watchers.get(project.id);
    if (watcher && watcher.logger) {
      logger = watcher.logger;
    } else {
      logger = new ActivityLogger(project.path);
    }
    const result = logger.read(limit, offset);
    res.json({
      entries: result.entries,
      total: result.total,
      hasMore: (offset + limit) < result.total,
    });
  } catch (e) {
    res.json({ entries: [], total: 0, hasMore: false });
  }
}

export function handleDeleteActivityLog(req, res) {
  const settings = getSettings();
  const project = settings.projects.find(p => p.id === req.params.id);
  if (!project) return res.status(404).json({ error: 'Not found' });

  const range = req.query.range || req.body?.range || 'all';

  try {
    let logger;
    const watcher = watcherManager.watchers.get(project.id);
    if (watcher && watcher.logger) {
      logger = watcher.logger;
    } else {
      logger = new ActivityLogger(project.path);
    }

    const result = logger.clear(range);

    if (watcherManager.sseManager) {
      watcherManager.sseManager.broadcast(project.id, 'activity-log-cleared', {
        range,
        deletedCount: result.deletedCount,
        remainingCount: result.remainingCount,
      });
    }

    res.json({
      success: true,
      range,
      deletedCount: result.deletedCount,
      remainingCount: result.remainingCount,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
