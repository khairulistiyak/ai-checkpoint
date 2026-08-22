# 🌍 Phase 84: Standalone Live Analytics System

**Status**: COMPLETED  
**Concept**: সম্পূর্ণ স্বাধীন Standalone Live Analytics API Server (`:4100`) + Embedded Tracker Script (`< 2KB`) + Live Real-Time React/Vite Dashboard (`:4200`)  

---

## 🛠️ Step-by-Step Micro Implementation Plan

---

## Step 84.1 — Create Analytics Server Package & Entry Point

- **File**: `analytics/server/package.json`
- **Action**: CREATE
- **Depends**: None
- **Done-check**: `test -f analytics/server/package.json`

```json
{
  "name": "ai-checkpoint-analytics-server",
  "version": "1.0.0",
  "description": "Standalone Live Analytics API Server for AI Checkpoint ecosystem",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2"
  }
}
```

---

## Step 84.2 — Create Session Manager Module

- **File**: `analytics/server/lib/session-manager.js`
- **Action**: CREATE
- **Depends**: 84.1
- **Done-check**: `test -f analytics/server/lib/session-manager.js`

```js
/**
 * session-manager.js — In-memory live user session tracker.
 */

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.listeners = new Set();
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 15000);
  }

  addOrUpdate(sessionId, metadata = {}) {
    const now = Date.now();
    const existing = this.sessions.get(sessionId) || {};
    const updated = {
      sessionId,
      lastSeen: now,
      startTime: existing.startTime || now,
      country: metadata.country || existing.country || 'Unknown',
      city: metadata.city || existing.city || 'Unknown',
      flag: metadata.flag || existing.flag || '🌐',
      lat: metadata.lat ?? existing.lat ?? 0,
      lon: metadata.lon ?? existing.lon ?? 0,
      device: metadata.device || existing.device || 'Desktop',
      browser: metadata.browser || existing.browser || 'Chrome',
      os: metadata.os || existing.os || 'Linux',
      page: metadata.page || existing.page || '/'
    };

    this.sessions.set(sessionId, updated);
    this.notify();
    return updated;
  }

  cleanupExpired() {
    const cutoff = Date.now() - 60000; // 60 seconds timeout
    let changed = false;
    for (const [id, session] of this.sessions.entries()) {
      if (session.lastSeen < cutoff) {
        this.sessions.delete(id);
        changed = true;
      }
    }
    if (changed) this.notify();
  }

  getActiveSessions() {
    return Array.from(this.sessions.values());
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const data = this.getActiveSessions();
    for (const listener of this.listeners) {
      try { listener(data); } catch {}
    }
  }
}

export const sessionManager = new SessionManager();
```

---

## Step 84.3 — Create Geo Resolver Module

- **File**: `analytics/server/lib/geo-resolver.js`
- **Action**: CREATE
- **Depends**: 84.1
- **Done-check**: `test -f analytics/server/lib/geo-resolver.js`

```js
/**
 * geo-resolver.js — IP to Geo-location lookup with local LRU caching.
 */

const cache = new Map();

export async function resolveGeo(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: 'Localhost', city: 'Dev Machine', flag: '💻', lat: 23.8103, lon: 90.4125 };
  }

  if (cache.has(ip)) return cache.get(ip);

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,city,lat,lon`);
    const data = await res.json();

    if (data && data.status === 'success') {
      const flag = getFlagEmoji(data.countryCode);
      const result = {
        country: data.country || 'Unknown',
        city: data.city || 'Unknown',
        flag,
        lat: data.lat || 0,
        lon: data.lon || 0
      };
      if (cache.size > 1000) cache.clear();
      cache.set(ip, result);
      return result;
    }
  } catch (err) {
    console.warn('GeoIP lookup failed:', err.message);
  }

  return { country: 'Unknown', city: 'Unknown', flag: '🌐', lat: 0, lon: 0 };
}

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
```

---

## Step 84.4 — Create User-Agent Parser Module

- **File**: `analytics/server/lib/ua-parser.js`
- **Action**: CREATE
- **Depends**: 84.1
- **Done-check**: `test -f analytics/server/lib/ua-parser.js`

```js
/**
 * ua-parser.js — Fast zero-dependency User-Agent parser.
 */

export function parseUA(uaString = '') {
  const ua = uaString.toLowerCase();

  let device = 'Desktop';
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) device = 'Mobile';
  else if (/ipad|tablet|playbook|silk/i.test(ua)) device = 'Tablet';

  let browser = 'Chrome';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  let os = 'Linux';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/mac os|macintosh/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';

  return { device, browser, os };
}
```

---

## Step 84.5 — Create Persistent Store Module

- **File**: `analytics/server/lib/store.js`
- **Action**: CREATE
- **Depends**: 84.1
- **Done-check**: `test -f analytics/server/lib/store.js`

```js
/**
 * store.js — JSONL daily persistence for analytics events.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

export function saveEvent(event) {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const file = path.join(DATA_DIR, `events-${dateStr}.jsonl`);
    const line = JSON.stringify({ ...event, timestamp: Date.now() }) + '\n';
    fs.appendFileSync(file, line, 'utf8');
  } catch (err) {
    console.error('Failed to persist analytics event:', err.message);
  }
}

export function getTodayEvents() {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const file = path.join(DATA_DIR, `events-${dateStr}.jsonl`);
    if (!fs.existsSync(file)) return [];
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
    return lines.filter(Boolean).map(l => JSON.parse(l));
  } catch {
    return [];
  }
}
```

---

## Step 84.6 — Create Metrics Aggregator Module

- **File**: `analytics/server/lib/aggregator.js`
- **Action**: CREATE
- **Depends**: 84.2, 84.5
- **Done-check**: `test -f analytics/server/lib/aggregator.js`

```js
/**
 * aggregator.js — Compute stats for analytics dashboard.
 */

import { sessionManager } from './session-manager.js';
import { getTodayEvents } from './store.js';

export function getStats() {
  const activeSessions = sessionManager.getActiveSessions();
  const events = getTodayEvents();

  const countries = {};
  const devices = { Desktop: 0, Mobile: 0, Tablet: 0 };
  const browsers = { Chrome: 0, Firefox: 0, Safari: 0, Edge: 0, Other: 0 };
  const hourly = new Array(24).fill(0);

  events.forEach(e => {
    if (e.country) countries[e.country] = (countries[e.country] || 0) + 1;
    if (e.device && devices[e.device] !== undefined) devices[e.device]++;
    if (e.browser && browsers[e.browser] !== undefined) browsers[e.browser]++;
    else if (e.browser) browsers.Other++;

    const hour = new Date(e.timestamp || Date.now()).getHours();
    hourly[hour]++;
  });

  const countryRanking = Object.entries(countries)
    .sort((a, b) => b[1] - a[1])
    .map(([country, count]) => ({ country, count }));

  return {
    liveCount: activeSessions.length,
    todayTotal: events.length,
    activeSessions,
    countries: countryRanking,
    devices,
    browsers,
    hourlyTrend: hourly,
    recentEvents: events.slice(-20).reverse()
  };
}
```

---

## Step 84.7 — Create Events Route

- **File**: `analytics/server/routes/events.js`
- **Action**: CREATE
- **Depends**: 84.2, 84.3, 84.4, 84.5
- **Done-check**: `test -f analytics/server/routes/events.js`

```js
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
```

---

## Step 84.8 — Create Stats & SSE Route

- **File**: `analytics/server/routes/stats.js`
- **Action**: CREATE
- **Depends**: 84.2, 84.6
- **Done-check**: `test -f analytics/server/routes/stats.js`

```js
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
```

---

## Step 84.9 — Create Embed Script Route & Server Entry

- **File**: `analytics/server/index.js`
- **Action**: CREATE
- **Depends**: 84.7, 84.8
- **Done-check**: `test -f analytics/server/index.js`

```js
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
```

---

## Step 84.10 — Create Standalone Tracker Script Source

- **File**: `analytics/tracker/tracker.js`
- **Action**: CREATE
- **Depends**: None
- **Done-check**: `test -f analytics/tracker/tracker.js`

```js
/**
 * tracker.js — Standalone client tracker (< 2KB)
 */

(function (window, document) {
  'use strict';
  var script = document.currentScript;
  var serverUrl = (script && script.src) ? script.src.replace(/\/api\/embed-script.*$/, '') : '';

  var sessionId = sessionStorage.getItem('__ac_analytics_sid');
  if (!sessionId) {
    sessionId = 'sid_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('__ac_analytics_sid', sessionId);
  }

  function post(endpoint, data) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', serverUrl + endpoint, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    } catch (e) {}
  }

  function trackVisit() {
    post('/api/event', {
      sessionId: sessionId,
      page: window.location.pathname,
      referrer: document.referrer
    });
  }

  function heartbeat() {
    if (document.visibilityState === 'visible') {
      post('/api/heartbeat', { sessionId: sessionId });
    }
  }

  trackVisit();
  setInterval(heartbeat, 25000);
})(window, document);
```

---

## Step 84.11 — Minify Tracker Script

- **File**: `analytics/tracker/tracker.min.js`
- **Action**: CREATE
- **Depends**: 84.10
- **Done-check**: `test -f analytics/tracker/tracker.min.js`

```js
(function(w,d){'use strict';var s=d.currentScript,u=s&&s.src?s.src.replace(/\/api\/embed-script.*$/,''):'',id=sessionStorage.getItem('__ac_sid');if(!id){id='sid_'+Math.random().toString(36).slice(2)+Date.now().toString(36);sessionStorage.setItem('__ac_sid',id)}function p(e,b){try{var x=new XMLHttpRequest();x.open('POST',u+e,!0);x.setRequestHeader('Content-Type','application/json');x.send(JSON.stringify(b))}catch(err){}}p('/api/event',{sessionId:id,page:w.location.pathname,referrer:d.referrer});setInterval(function(){if(d.visibilityState==='visible')p('/api/heartbeat',{sessionId:id})},25000)})(window,document);
```

---

## Step 84.12 — Scaffold Analytics Dashboard (Vite + React)

- **File**: `analytics/dashboard/package.json`
- **Action**: CREATE
- **Depends**: None
- **Done-check**: `test -f analytics/dashboard/package.json`

```json
{
  "name": "ai-checkpoint-analytics-dashboard",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 4200",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.344.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.4"
  }
}
```

---

## Step 84.13 — Create SSE Hook (`useLiveStream.js`)

- **File**: `analytics/dashboard/src/hooks/useLiveStream.js`
- **Action**: CREATE
- **Depends**: 84.12
- **Done-check**: `test -f analytics/dashboard/src/hooks/useLiveStream.js`

```js
import { useState, useEffect } from 'react';

export function useLiveStream(serverUrl = 'http://localhost:4100') {
  const [data, setData] = useState({
    liveCount: 0,
    todayTotal: 0,
    activeSessions: [],
    countries: [],
    devices: { Desktop: 0, Mobile: 0, Tablet: 0 },
    browsers: { Chrome: 0, Firefox: 0, Safari: 0, Edge: 0, Other: 0 },
    hourlyTrend: new Array(24).fill(0),
    recentEvents: []
  });
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource(`${serverUrl}/api/live-stream`);

    es.onopen = () => setConnected(true);
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setData(parsed);
      } catch {}
    };
    es.onerror = () => {
      setConnected(false);
    };

    return () => es.close();
  }, [serverUrl]);

  return { ...data, connected };
}
```

---

## Step 84.14 — Create World Map Component (`WorldMapSvg.jsx`)

- **File**: `analytics/dashboard/src/components/WorldMapSvg.jsx`
- **Action**: CREATE
- **Depends**: 84.12
- **Done-check**: `test -f analytics/dashboard/src/components/WorldMapSvg.jsx`

```jsx
import React from 'react';

export function WorldMapSvg({ sessions = [] }) {
  // Convert lat/lon to Mercator SVG coordinates (Width 800, Height 400)
  const getCoords = (lat, lon) => {
    const x = ((lon + 180) / 360) * 800;
    const y = ((90 - lat) / 180) * 400;
    return { x: Math.max(10, Math.min(790, x)), y: Math.max(10, Math.min(390, y)) };
  };

  return (
    <div style={{ background: '#09090b', border: '1px solid #27272a', borderRadius: '12px', padding: '16px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ color: '#f4f4f5', margin: 0, fontSize: '14px', fontWeight: 600 }}>🗺️ Live Global User Map</h3>
        <span style={{ color: '#22c55e', fontSize: '12px' }}>● {sessions.length} Active Nodes</span>
      </div>

      <svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto', background: '#18181b', borderRadius: '8px' }}>
        {/* World Grid lines */}
        <line x1="0" y1="200" x2="800" y2="200" stroke="#27272a" strokeDasharray="4 4" />
        <line x1="400" y1="0" x2="400" y2="400" stroke="#27272a" strokeDasharray="4 4" />

        {/* User dots */}
        {sessions.map((s, idx) => {
          const { x, y } = getCoords(s.lat || 0, s.lon || 0);
          return (
            <g key={s.sessionId || idx}>
              <circle cx={x} cy={y} r="12" fill="#22c55e" opacity="0.2">
                <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx={x} cy={y} r="5" fill="#22c55e" />
              <title>{`${s.flag} ${s.city}, ${s.country} (${s.device} - ${s.browser})`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
```

---

## Step 84.15 — Create Dashboard Shell (`App.jsx`)

- **File**: `analytics/dashboard/src/App.jsx`
- **Action**: CREATE
- **Depends**: 84.13, 84.14
- **Done-check**: `test -f analytics/dashboard/src/App.jsx`

```jsx
import React from 'react';
import { useLiveStream } from './hooks/useLiveStream';
import { WorldMapSvg } from './components/WorldMapSvg';

export default function App() {
  const { liveCount, todayTotal, activeSessions, connected, countries } = useLiveStream();

  return (
    <div style={{ background: '#09090b', color: '#f4f4f5', minHeight: '100vh', fontFamily: 'sans-serif', padding: '24px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #27272a', pb: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', margin: 0, fontWeight: 700 }}>🌍 AI Checkpoint Live Analytics</h1>
          <p style={{ color: '#a1a1aa', fontSize: '13px', margin: '4px 0 0' }}>Real-time telemetry stream & traffic monitor</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#18181b', padding: '6px 12px', borderRadius: '20px', border: '1px solid #27272a' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#22c55e' : '#ef4444' }}></span>
          <span style={{ fontSize: '12px', color: '#e4e4e7' }}>{connected ? 'LIVE' : 'DISCONNECTED'}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#18181b', padding: '16px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ color: '#a1a1aa', fontSize: '12px' }}>Live Users Online</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#22c55e', marginTop: '4px' }}>{liveCount}</div>
        </div>
        <div style={{ background: '#18181b', padding: '16px', borderRadius: '12px', border: '1px solid #27272a' }}>
          <div style={{ color: '#a1a1aa', fontSize: '12px' }}>Total Visitors Today</div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>{todayTotal}</div>
        </div>
      </div>

      <WorldMapSvg sessions={activeSessions} />
    </div>
  );
}
```

---

## Step 84.16 — Create Main HTML & Entry Point

- **File**: `analytics/dashboard/src/main.jsx`
- **Action**: CREATE
- **Depends**: 84.15
- **Done-check**: `test -f analytics/dashboard/src/main.jsx`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## Step 84.17 — Full Verification Suite

- **File**: None
- **Action**: RUN
- **Depends**: 84.1 to 84.16
- **Done-check**: `test -f analytics/server/index.js && test -f analytics/dashboard/src/App.jsx`

---
