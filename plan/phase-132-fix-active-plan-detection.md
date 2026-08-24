# Phase 132: Zero-Regression Fix for Active Plan & Active Step Detection

> **Objective:** Fix the Active Step / Active Plan detection and filtering bug with full polymorphic compatibility across date-formatter.js, ProjectGrid.jsx, and CockpitTab.jsx so that active steps and active plans are always accurately classified without any regressions.

---

## 📋 Execution Steps

### Step 132.1 — Update Polymorphic Status Helpers (`dashboard/src/utils/date-formatter.js`)
- **File**: `dashboard/src/utils/date-formatter.js`
- **Action**: EDIT
- **Content**: Make `isStepDone`, `isStepActive`, and `isStepPending` polymorphically accept both step objects and raw status strings.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 132.2 — Update ProjectGrid Filter & Active Phase Calculations (`dashboard/src/components/ProjectGrid.jsx`)
- **File**: `dashboard/src/components/ProjectGrid.jsx`
- **Action**: EDIT
- **Content**: Pass step objects to status helpers and include running phases in `activePhases` calculation.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 132.1

### Step 132.3 — Update CockpitTab Active Step Detection (`dashboard/src/components/CockpitTab.jsx`)
- **File**: `dashboard/src/components/CockpitTab.jsx`
- **Action**: EDIT
- **Content**: Use centralized `isStepActive(s)` inside `useMemo` active step lookup.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 132.2

### Step 132.4 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 132.3

### Step 132.5 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 132.4
