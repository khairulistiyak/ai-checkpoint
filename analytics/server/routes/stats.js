/**
 * stats.js — REST & SSE endpoints for live analytics dashboard.
 */

import express from 'express';
import { getStats } from '../lib/aggregator.js';
import { sessionManager } from '../lib/session-manager.js';

const router = express.Router();

router.get('/stats', (req, res) => {
  res.json(getStats());
});

router.get('/live-stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendUpdate = () => {
    const stats = getStats();
    res.write(`data: ${JSON.stringify(stats)}\n\n`);
  };

  sendUpdate();

  const unsubscribe = sessionManager.subscribe(() => {
    sendUpdate();
  });

  req.on('close', () => {
    unsubscribe();
  });
});

export default router;
