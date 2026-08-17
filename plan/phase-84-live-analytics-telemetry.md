# 🌍 Phase 84: Standalone Live Analytics System

> **সম্পূর্ণ আলাদা একটি Analytics API + Dashboard — ai-checkpoint-এর ভেতরে না।**
> User-রা তাদের app/website-এ tracking script বসাবে, আমরা আলাদা dashboard থেকে সব LIVE দেখবো।

---

## 🎯 Key Concept: এটা আলাদা Product

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│   ai-checkpoint (main software)     ← এটা USER ব্যবহার করে  │
│                                                              │
│   analytics-server (আলাদা API)     ← এটা DATA collect করে   │
│                                                              │
│   analytics-dashboard (আলাদা UI)   ← এটা আমরা দেখি          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### তিনটি আলাদা জিনিস:

| # | Component | কে ব্যবহার করে | Port |
|:---|:---|:---|:---|
| 1 | **Tracking Script** (`<script>`) | User-এর app/website visitor | — |
| 2 | **Analytics API Server** | Script data receive করে | `:4100` |
| 3 | **Analytics Dashboard** | আমরা (developer/admin) দেখি | `:4200` |

> ai-checkpoint (`:3457`) এর সাথে কোনো সম্পর্ক নেই। সম্পূর্ণ independent।

---

## 🏗️ Architecture

```
   User-এর Website/App (যেকোনো site)
   ┌──────────────────────────────────┐
   │  <script src="analytics.js">    │
   │                                  │
   │  Visitor browses the site        │
   │  Script sends events silently    │
   └────────────┬─────────────────────┘
                │
                │ POST :4100/api/event
                │ POST :4100/api/heartbeat
                ▼
   ┌──────────────────────────────────┐
   │  📡 Analytics API Server        │  ← Port 4100
   │  (Standalone Node.js server)    │
   │                                  │
   │  • Receive events               │
   │  • GeoIP → Country/City         │
   │  • User-Agent → Device/Browser  │
   │  • Store sessions (in-memory)   │
   │  • Persist to JSON files        │
   │  • SSE stream for dashboard     │
   └────────────┬─────────────────────┘
                │
                │ SSE :4100/api/live-stream
                │ GET :4100/api/stats
                ▼
   ┌──────────────────────────────────┐
   │  📊 Analytics Dashboard         │  ← Port 4200
   │  (Standalone React/Vite app)    │
   │                                  │
   │  • Live user count              │
   │  • Custom SVG world map           │
   │  • Country/Device charts        │
   │  • Activity feed                │
   │  • Trend graphs                 │
   │  • Admin login (optional)       │
   └──────────────────────────────────┘
```

---

## 📂 Project Structure (আলাদা folder)

```
ai-checkpoint/
├── packages/          ← existing
├── dashboard/         ← existing (main product)
├── electron/          ← existing
│
└── analytics/         ← ✨ NEW — সম্পূর্ণ আলাদা
    │
    ├── server/                    ← Analytics API Server
    │   ├── index.js               ← Entry point (port 4100)
    │   ├── routes/
    │   │   ├── events.js          ← POST /api/event, /api/heartbeat
    │   │   ├── stats.js           ← GET /api/stats, /api/live-stream (SSE)
    │   │   └── embed.js           ← GET /api/embed-script
    │   ├── lib/
    │   │   ├── session-manager.js ← In-memory live session tracking
    │   │   ├── geo-resolver.js    ← IP → Country/City lookup
    │   │   ├── ua-parser.js       ← User-Agent → Device/Browser/OS
    │   │   ├── store.js           ← JSON file persistence
    │   │   └── aggregator.js      ← Metrics computation
    │   ├── data/                  ← Auto-created at runtime
    │   │   ├── events/            ← Daily JSONL files
    │   │   └── aggregates/        ← Summary JSONs
    │   └── package.json
    │
    ├── dashboard/                 ← Analytics Dashboard (Vite + React)
    │   ├── src/
    │   │   ├── App.jsx
    │   │   ├── main.jsx
    │   │   ├── index.css
    │   │   ├── components/
    │   │   │   ├── LiveCounter.jsx       ← Big animated counter
    │   │   │   ├── WorldMapSvg.jsx       ← Custom SVG world map (zero dependency)
    │   │   │   ├── CountryRanking.jsx    ← Top countries bars
    │   │   │   ├── DeviceBreakdown.jsx   ← Mobile/Desktop/Tablet
    │   │   │   ├── BrowserBreakdown.jsx  ← Chrome/Firefox/Safari
    │   │   │   ├── ActivityFeed.jsx      ← Real-time scrolling feed
    │   │   │   ├── TrendChart.jsx        ← Hourly/Daily graphs
    │   │   │   └── StatsCards.jsx        ← Total/Today/Live cards
    │   │   ├── hooks/
    │   │   │   └── useLiveStream.js      ← SSE connection hook
    │   │   └── utils/
    │   │       └── api.js                ← API fetch helpers
    │   ├── index.html
    │   ├── package.json
    │   └── vite.config.js
    │
    └── tracker/                   ← Embeddable tracking script
        ├── tracker.js             ← Source (readable)
        └── tracker.min.js         ← Minified < 2KB (auto-generated)
```

---

## 📊 Dashboard UI Mockup

```
┌─────────────────────────────────────────────────────────────────────┐
│  🌍 Analytics Dashboard                        ● 12 Users Online   │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  TOTAL   │  │  TODAY   │  │   LIVE   │  │ AVG TIME │           │
│  │  1,247   │  │    89    │  │  ● 12    │  │  3m 42s  │           │
│  │ all-time │  │ visitors │  │  online  │  │ per user │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│                                                                     │
│  ┌─ 🗺️ Custom SVG World Map ──────────────────────────────────────┐  │
│  │                                                               │  │
│  │     ●●                    ●                                   │  │
│  │  ●●●       ●●●●                    ●●●●●●                    │  │
│  │                        ●●●●●●●●●                             │  │
│  │       ●●          ●●●                    ●                   │  │
│  │                                                               │  │
│  │  ● = active user · Size = user count · Pulse = new arrival   │  │
│  │  Color: green=few · amber=many · red=peak                    │  │
│  │  Hover dot → tooltip: City, device, user count               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─ 🏆 Top Countries ──────┐  ┌─ 📱 Devices ─────────────────┐   │
│  │ 🇧🇩 Bangladesh  ████░ 42%│  │ 📱 Mobile    ██████░░░ 58%   │   │
│  │ 🇮🇳 India       ██░░ 18%│  │ 💻 Desktop   ████░░░░░ 35%   │   │
│  │ 🇺🇸 USA         █░░░ 12%│  │ 📟 Tablet    █░░░░░░░░  7%   │   │
│  │ 🇬🇧 UK          █░░░  8%│  └──────────────────────────────┘   │
│  │ 🌍 Others       ██░░ 20%│  ┌─ 🌐 Browsers ────────────────┐   │
│  └──────────────────────────┘  │ 🟡 Chrome    ███████░░ 67%   │   │
│                                │ 🟠 Firefox   ██░░░░░░░ 15%   │   │
│  ┌─ ⚡ Live Activity Feed ──┐  │ 🔵 Safari    █░░░░░░░░ 12%   │   │
│  │ ● 🇧🇩 Dhaka    Desktop  │  │ ⚪ Others    █░░░░░░░░  6%   │   │
│  │   Chrome · just now      │  └──────────────────────────────┘   │
│  │ ● 🇮🇳 Mumbai   Mobile   │                                     │
│  │   Safari · 2s ago        │  ┌─ 📈 Visitors Today ───────────┐  │
│  │ ● 🇺🇸 NYC      Desktop  │  │  12|    ●                      │  │
│  │   Chrome · 5s ago        │  │  10|   ● ●  ●                  │  │
│  │ ● 🇧🇩 CTG      Mobile   │  │   8|  ●   ●  ●   ●            │  │
│  │   Chrome · 8s ago        │  │   6| ●         ● ●  ●         │  │
│  │ ● 🇬🇧 London   Desktop  │  │   4|●              ●          │  │
│  │   Firefox · 12s ago      │  │   0└──────────────────── time  │  │
│  │   (auto-scrolling)       │  │    6am  9am  12pm  3pm  now   │  │
│  └──────────────────────────┘  └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Custom SVG World Map — কিভাবে কাজ করবে?

### Location Detection Flow

```
User visits app  →  Server gets IP  →  GeoIP lookup
→  { country: "Bangladesh", city: "Dhaka", lat: 23.8103, lon: 90.4125 }
→  lat/lon → SVG coordinate এ convert
→  SVG map-এ ● dot/circle place করা হয়
```

### Lat/Lon → SVG Coordinate Conversion

```js
// Simple Mercator projection formula
svgX = (lon + 180) / 360 * svgWidth
svgY = (90 - lat) / 180 * svgHeight

// Example: Dhaka (23.81, 90.41)
svgX = (90.41 + 180) / 360 * 1000 = 750
svgY = (90 - 23.81) / 180 * 500  = 184
// → SVG dot at (750, 184) = exactly where Bangladesh is on map
```

### Location Accuracy

| Level | Accuracy | Example |
|:---|:---|:---|
| Country | ~99% | Bangladesh ✅ |
| City | ~85% | Dhaka ✅ |
| Exact address | ❌ | IP থেকে সম্ভব না |

### SVG Map Features

| Feature | Description |
|:---|:---|
| ● Dots | Country/city-এর lat/lon থেকে SVG coordinate — exact position |
| Size | User count অনুযায়ী circle radius বাড়ে/কমে |
| Color | green=1-5 · amber=6-20 · red=20+ users |
| Pulse ring | নতুন user আসলে expanding ring animation |
| Hover tooltip | City, country, device, user count দেখায় |
| Zero dependency | কোনো npm package বা API key লাগবে না |
| Dark styled | SVG fill/stroke dark dashboard-এর সাথে match |

---

## 📡 Tracking Script — User-এর App-এ যা বসবে


### Installation (user just copy-pastes this):

```html
<!-- Analytics Tracker — paste before </body> -->
<script src="http://your-server:4100/api/embed-script"></script>
```

### Script কী করবে (internally):

```
1. Page load → generate sessionId (sessionStorage)
2. Collect: screen, timezone, language, page URL, referrer
3. POST /api/event → send initial visit data
4. Every 30s → POST /api/heartbeat (only if tab visible)
5. Tab hidden → pause heartbeats
6. Tab closed → session naturally expires after 60s
```

### Script Features:

| Feature | Detail |
|:---|:---|
| Size | < 2KB minified + gzipped |
| Cookies | ❌ None — uses `sessionStorage` only |
| Cross-site tracking | ❌ Impossible — per-tab session only |
| Performance impact | Zero — async, non-blocking |
| Dependencies | Zero — vanilla JS |
| Config needed | Zero — auto-detects server URL |

---

## 🟢 Live Session Management

```
Session States:
  ACTIVE  → heartbeat received < 60s ago    → counted as "live"
  STALE   → no heartbeat for 60-120s        → warning state
  EXPIRED → no heartbeat for > 120s         → removed from memory

Server Cleanup Loop (runs every 30s):
  → Scan all sessions
  → Remove EXPIRED sessions
  → Push updated liveCount via SSE to dashboard
```

---

## 📋 Implementation Steps (14 Steps)

### 🔧 Phase A: Analytics Server (`analytics/server/`)

| Step | File | Description |
|:---|:---|:---|
| 84.1 | `server/index.js` | Express server on port 4100. CORS enabled for any origin. Mount all routes. |
| 84.2 | `server/lib/session-manager.js` | In-memory `Map` for live sessions. Add/update/remove/cleanup methods. SSE broadcast on change. |
| 84.3 | `server/lib/geo-resolver.js` | IP → Country/City via `ip-api.com`. Cache results in-memory (LRU, max 1000). |
| 84.4 | `server/lib/ua-parser.js` | User-Agent string → `{ device, browser, os }`. Lightweight regex-based (no npm dependency). |
| 84.5 | `server/lib/store.js` | JSON file persistence. Daily event logs (JSONL). Aggregate summaries. 30-day auto-cleanup. |
| 84.6 | `server/lib/aggregator.js` | Compute: totalUsers, todayUsers, liveUsers, countryBreakdown, deviceBreakdown, browserBreakdown, hourlyTrend. |
| 84.7 | `server/routes/events.js` | `POST /api/event` — process incoming visit. `POST /api/heartbeat` — keep session alive. |
| 84.8 | `server/routes/stats.js` | `GET /api/stats` — full analytics JSON. `GET /api/live-stream` — SSE endpoint for real-time. |
| 84.9 | `server/routes/embed.js` | `GET /api/embed-script` — serves minified tracker.js with correct server URL injected. |

### 📜 Phase B: Tracking Script (`analytics/tracker/`)

| Step | File | Description |
|:---|:---|:---|
| 84.10 | `tracker/tracker.js` | Full tracking script. SessionId, heartbeat, visibility API, event dispatch. |
| 84.11 | Build step | Minify with esbuild → `tracker.min.js` (< 2KB). |

### 🎨 Phase C: Analytics Dashboard (`analytics/dashboard/`)

| Step | File | Description |
|:---|:---|:---|
| 84.12 | Vite + React scaffold | `npx create-vite` → dark premium dashboard with Inter/Outfit fonts. Port 4200. |
| 84.13 | `src/hooks/useLiveStream.js` | SSE hook → connects to `:4100/api/live-stream`. Auto-reconnect. Exposes all metrics. |
| 84.14 | `src/components/StatsCards.jsx` | 4 animated cards: Total / Today / Live / Avg Duration. |
| 84.15 | `src/components/WorldMapSvg.jsx` | Custom SVG world map (Mercator projection). Dots placed via lat/lon → SVG coordinate formula. Size = user count. Color = traffic intensity. Pulse animation on new arrivals. Hover tooltip per dot. Zero dependency, no API key. |
| 84.16 | `src/components/CountryRanking.jsx` | Top 10 countries with flag emojis + animated percentage bars. |
| 84.17 | `src/components/DeviceBreakdown.jsx` | Mobile/Desktop/Tablet donut chart or bars. |
| 84.18 | `src/components/BrowserBreakdown.jsx` | Chrome/Firefox/Safari/Edge bars with icons. |
| 84.19 | `src/components/ActivityFeed.jsx` | Real-time auto-scrolling feed. Flag + City + Device + "just now". |
| 84.20 | `src/components/TrendChart.jsx` | Canvas/SVG line chart — hourly visitors trend. |
| 84.21 | `src/App.jsx` | Compose all components into single-page analytics dashboard. |

### ✅ Phase D: Verification

| Step | What |
|:---|:---|
| 84.22 | Start analytics server → embed script in test HTML → open in browser → verify events arrive → dashboard shows live data → world map dots → activity feed scrolls → counters animate. |

---

## 🔐 Privacy & Security

| Rule | How |
|:---|:---|
| **No PII** | No names, emails, passwords — ever |
| **No Cookies** | `sessionStorage` only — dies when tab closes |
| **IP Discarded** | IP → Country/City resolved → raw IP never stored |
| **30-Day Cleanup** | Old event logs auto-deleted |
| **CORS Protected** | API accepts events from any origin, but stats/SSE endpoints can be restricted |
| **GDPR Friendly** | Anonymous aggregate data only |

---

## 🛠️ Tech Stack (Analytics System Only)

| Need | Choice | Why |
|:---|:---|:---|
| API Server | Express.js (CommonJS) | Same as main project, lightweight |
| GeoIP | ip-api.com → MaxMind later | Free, accurate, no signup |
| User-Agent | Custom regex parser | Zero dependencies, < 50 lines |
| Real-Time | Server-Sent Events (SSE) | Simpler than WebSocket for one-way |
| Storage | JSON/JSONL files | No database needed |
| Dashboard | Vite + React (ESM) | Fast dev, hot reload |
| World Map | Custom SVG (Mercator projection) | Zero dependency, no API key, full control over styling |
| Charts | Canvas API or SVG | No chart library dependency |
| Tracker | Vanilla JS | Zero dependency, < 2KB |

---

## 🚀 How to Run (after build)

```bash
# Start Analytics API Server
cd analytics/server && node index.js
# → Running on http://localhost:4100

# Start Analytics Dashboard
cd analytics/dashboard && npm run dev
# → Running on http://localhost:4200

# Embed in any website
# Add to your HTML: <script src="http://localhost:4100/api/embed-script"></script>
```

---

**Total: 22 steps | 3 phases | Fully standalone — ai-checkpoint থেকে সম্পূর্ণ আলাদা।**
