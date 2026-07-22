import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './src/server/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 20226;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

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

app.listen(PORT, () => {
  console.log(`🤖 AI-Checkpoint Dashboard backend running on http://localhost:${PORT}`);
});
