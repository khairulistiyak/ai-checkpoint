# Phase 129: Fix Cockpit Progress Card Phase Completion & Plan Count Resolution

> **Objective:** Fix phase completion detection (`percentage >= 100` / `completed >= total`) and blueprint plan count extraction (`planStats.totalFiles` / `files.length`) in `CockpitProgressCard.jsx`.

---

## 📋 Execution Steps

### Step 129.1 — Fix Phase Completion & Plan Count Extraction (`dashboard/src/components/cockpit/CockpitProgressCard.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitProgressCard.jsx`
- **Action**: EDIT
- **Content**: Use robust phase completion detection (`percentage >= 100`, `completed >= total`, or `pct === 100`) and parse `planStats.totalFiles || planStats.files.length`.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 129.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 129.1

### Step 129.3 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 129.2
