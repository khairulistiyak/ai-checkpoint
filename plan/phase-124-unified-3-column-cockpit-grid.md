# Phase 124: Unified 3-Column Zen Cockpit Grid Transformation

> **Objective:** Unify Progress & Steps KPI, Health & Quality Fortress, and AI Intelligence Radar into a single, perfectly balanced, eye-comfortable 3-column grid row (`grid grid-cols-1 lg:grid-cols-3`).

---

## 📋 Execution Steps

### Step 124.1 — Create Unified Progress KPI Card (`dashboard/src/components/cockpit/CockpitProgressCard.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitProgressCard.jsx`
- **Action**: CREATE
- **Content**: Compact, slim Progress & Execution card for Column 1 of the 3-column grid.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 124.2 — Refactor Health Score Gauge for 3-Column Grid (`dashboard/src/components/health/HealthScoreGauge.jsx`)
- **File**: `dashboard/src/components/health/HealthScoreGauge.jsx`
- **Action**: EDIT
- **Content**: Update HealthScoreGauge to match Column 2's slim height, padding, and monochrome styling.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 124.1

### Step 124.3 — Refactor CockpitHealthOverview to 3-Column Grid Layout (`dashboard/src/components/cockpit/CockpitHealthOverview.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitHealthOverview.jsx`
- **Action**: EDIT
- **Content**: Update CockpitHealthOverview integrating ProgressCard, HealthScoreGauge, and Intelligence Radar in a single row.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 124.1, 124.2

### Step 124.4 — Wire Unified Grid in CockpitTab (`dashboard/src/components/CockpitTab.jsx`)
- **File**: `dashboard/src/components/CockpitTab.jsx`
- **Action**: EDIT
- **Content**: Replace separate KPI row and 2-column health row with the single unified 3-column grid.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 124.3

### Step 124.5 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 124.1, 124.2, 124.3, 124.4

### Step 124.6 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 124.5
