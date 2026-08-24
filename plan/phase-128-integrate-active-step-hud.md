# Phase 128: Integrate Active Step HUD into Roadmap Progress Card

> **Objective:** Integrate the active step execution status, target file badge, and milestone metrics directly into `CockpitProgressCard.jsx`, eliminating top banner redundancy and creating a unified zen workflow.

---

## 📋 Execution Steps

### Step 128.1 — Upgrade CockpitProgressCard with Active Step HUD (`dashboard/src/components/cockpit/CockpitProgressCard.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitProgressCard.jsx`
- **Action**: EDIT
- **Content**: Add active step state handling, pulsing execution indicator, target file info, and milestone completion state.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 128.2 — Wire Active Step Props in Cockpit Overview (`dashboard/src/components/cockpit/CockpitHealthOverview.jsx` & `dashboard/src/components/CockpitTab.jsx`)
- **File**: `dashboard/src/components/CockpitTab.jsx`
- **Action**: EDIT
- **Content**: Pass activeStep to CockpitHealthOverview and remove redundant top ActiveStepBanner from CockpitTab.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 128.1

### Step 128.3 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 128.1, 128.2

### Step 128.4 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 128.3
