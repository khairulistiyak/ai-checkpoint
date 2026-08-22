/**
 * index.js — Main Analytics Express Server Entry (Port 4100)
 */

import express from 'express';
import cors from 'cors';
import eventsRouter from './routes/events.js';
import statsRouter from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 4100;

app.use(cors());
app.use(express.json());

app.use('/api', eventsRouter);
app.use('/api', statsRouter);

app.get('/api/embed-script', (req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const protocol = req.protocol || 'http';
  const script = `
(function() {
  const SERVER = '${protocol}://${host}';
  let sessionId = sessionStorage.getItem('__ac_sid');
  if (!sessionId) {
    sessionId = 's_' + Math.random().toString(36).substring(2, 9) + Date.now();
    sessionStorage.setItem('__ac_sid', sessionId);
  }

  function sendEvent() {
    fetch(SERVER + '/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: sessionId,
        page: window.location.pathname,
        referrer: document.referrer
      })
    }).catch(function(){});
  }

  function sendHeartbeat() {
    if (document.visibilityState === 'visible') {
      fetch(SERVER + '/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId })
      }).catch(function(){});
    }
  }

  sendEvent();
  setInterval(sendHeartbeat, 25000);
})();
`;
  res.setHeader('Content-Type', 'application/javascript');
  res.send(script);
});

app.listen(PORT, () => {
  console.log(`🌍 Standalone Analytics API Server running on http://localhost:${PORT}`);
});
