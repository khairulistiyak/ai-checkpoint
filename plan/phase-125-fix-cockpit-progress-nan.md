# Phase 125: Fix Cockpit Progress NaN & Robust Progress Handling

> **Objective:** Fix `overall` object destructuring in `CockpitProgressCard.jsx` to prevent `NaN%` display when `overall` is passed as an object `{ percentage, completed, total }`.

---

## 📋 Execution Steps

### Step 125.1 — Fix Robust Progress Calculations (`dashboard/src/components/cockpit/CockpitProgressCard.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitProgressCard.jsx`
- **Action**: EDIT
- **Content**: Safely extract `percentage`, `completed`, and `total` from `overall` (whether object or number) with fallback to phase calculations.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 125.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 125.1

### Step 125.3 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 125.2
