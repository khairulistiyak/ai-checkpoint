import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './src/server/api.js';
import aiTierRouter from './src/server/ai-tier.js';
import runConfigRouter from './src/server/run-config.js';
import healthRouter from './src/server/health.js';
import { watcherManager } from './src/server/watcher.js';
import { watchPlanDirectory, stopWatching } from './src/server/plan-watcher.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 20226;

// CORS: permissive in dev/electron, same-origin in web production
const isElectron = process.env.ELECTRON === '1';
const corsOptions = (process.env.NODE_ENV === 'production' && !isElectron)
  ? { origin: false }
  : { origin: true };
app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use('/api', apiRouter);
app.use('/api', aiTierRouter);
app.use('/api', runConfigRouter);
app.use('/api', healthRouter);

// API 404 — unknown API paths return JSON, not HTML
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve static React files in production
if (process.env.NODE_ENV === 'production' || fs.existsSync(path.join(__dirname, 'dist'))) {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Global Express Error Handler
app.use((err, req, res, next) => {
  console.error('⚠️ Dashboard Backend Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ Unhandled Rejection in Server:', reason);
});

export function startServer(customPort = PORT) {
  const server = app.listen(customPort, () => {
    const activePort = server.address().port;
    console.log(`🤖 AI-Checkpoint Dashboard backend running on http://localhost:${activePort}`);
    // Start file watchers for all registered projects
    watcherManager.initializeAll();
    // Watch plan directory of first project for changes
    try {
      const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.agents', 'config.json'), 'utf8'));
      const firstProject = (config.projects || [])[0];
      if (firstProject && firstProject.path) {
        watchPlanDirectory(firstProject.path, ({ filename }) => {
          // Plan file change detected — handled by watcher
        });
      }
    } catch {}
  });

  return server;
}

// Standalone mode execution (when not running in Electron or imported as module)
if (process.env.ELECTRON !== '1' && process.env.NODE_ENV !== 'test') {
  startServer(PORT);
}

// Graceful shutdown — stop all watchers
process.on('SIGTERM', () => { watcherManager.stopAll(); process.exit(0); });
process.on('SIGINT', () => { watcherManager.stopAll(); process.exit(0); });

export default app;
