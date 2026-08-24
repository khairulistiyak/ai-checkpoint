# Phase 117: Zero-Disk-Touch In-Memory Live Scores & Keep-Alive Tab Architecture

> **Objective:** Deliver instant live scores across all tabs with zero re-scan flicker, strictly using browser in-memory state (zero cache files created in the user's project directory) and keep-alive tab preservation.

---

## 📋 Execution Steps

### Step 117.1 — Create Pure In-Memory Browser Scan Store (`dashboard/src/utils/scan-cache.js`)
- **File**: `dashboard/src/utils/scan-cache.js`
- **Action**: CREATE
- **Content**: Pure in-memory JS RAM store (zero disk writes) with getter, setter, timestamps, and invalidation helpers.
- **Done-check**: `node -e "const m = require('./dashboard/src/utils/scan-cache.js');"` -> exit 0
- **Depends**: None

### Step 117.2 — Update Health Command Center Hook (`dashboard/src/components/health/useHealthCommandCenter.js`)
- **File**: `dashboard/src/components/health/useHealthCommandCenter.js`
- **Action**: EDIT
- **Content**: Initialize state from in-memory cache, skip redundant scans on tab focus, update in-memory cache upon manual scan.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 117.1

### Step 117.3 — Update Cockpit Health & Intelligence Overview (`dashboard/src/components/cockpit/CockpitHealthOverview.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitHealthOverview.jsx`
- **Action**: EDIT
- **Content**: Connect to in-memory store for instant scores, prevent tab-switch re-scans, show live relative timestamp.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 117.1

### Step 117.4 — Implement Keep-Alive Tab Panel Rendering (`dashboard/src/components/ProjectTabsContent.jsx`)
- **File**: `dashboard/src/components/ProjectTabsContent.jsx`
- **Action**: EDIT
- **Content**: Retain tab panels in the DOM and toggle active visibility using CSS (`hidden` vs `block`) for instant zero-flicker transitions.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 117.2, 117.3

### Step 117.5 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 117.1 - 117.4

### Step 117.6 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 117.5
