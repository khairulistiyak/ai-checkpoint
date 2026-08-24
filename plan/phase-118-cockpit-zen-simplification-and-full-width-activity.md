# Phase 118: Cockpit Zen Simplification & Full-Width Activity Stream

> **Objective:** Remove the redundant/cluttering Git Snapshots & Checkpoints widget from the Cockpit overview tab and give full-width layout to the Live Activity Log & Execution Stream.

---

## 📋 Execution Steps

### Step 118.1 — Upgrade Cockpit Layout & Remove Git Visualizer Widget (`dashboard/src/components/CockpitTab.jsx`)
- **File**: `dashboard/src/components/CockpitTab.jsx`
- **Action**: EDIT
- **Content**: Remove `GitVisualizer` import and container, expanding `ActivityLog` to clean full-width.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 118.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 118.1

### Step 118.3 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 118.2
