/**
 * events.js — Process incoming visits & heartbeats.
 */

import express from 'express';
import { resolveGeo } from '../lib/geo-resolver.js';
import { parseUA } from '../lib/ua-parser.js';
import { sessionManager } from '../lib/session-manager.js';
import { saveEvent } from '../lib/store.js';

const router = express.Router();

router.post('/event', async (req, res) => {
  try {
    const { sessionId, page, referrer } = req.body || {};
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress;
    const geo = await resolveGeo(clientIp);
    const ua = parseUA(req.headers['user-agent']);

    const session = sessionManager.addOrUpdate(sessionId, {
      ...geo,
      ...ua,
      page
    });

    saveEvent({
      sessionId,
      page,
      referrer,
      ...geo,
      ...ua
    });

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/heartbeat', (req, res) => {
  const { sessionId } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

  sessionManager.addOrUpdate(sessionId);
  res.json({ success: true });
});

export default router;
