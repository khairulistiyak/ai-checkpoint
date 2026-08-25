# Phase 171: Clear Visual Distinction for Active, Working, Pending & Completed Plan States

> **Objective:** Ensure plan phases and execution steps on the dashboard clearly and instantly convey whether they are Working (amber + ping), Active (sky), Pending (zinc), or Complete (emerald) through dedicated status pills, high-contrast borders, and animated indicators.

---

## 📋 Execution Steps

### Step 171.1 — Upgrade PhaseView Status Indicators (`dashboard/src/components/PhaseView.jsx`)
- **File**: `dashboard/src/components/PhaseView.jsx`
- **Action**: EDIT
- **Content**: Add dedicated status badges (`WORKING`, `ACTIVE`, `PENDING`, `COMPLETE`), dynamic progress bar glows, and high-visibility border styles based on real-time phase execution state. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 171.2 — Refine StepItem State Styling (`dashboard/src/components/StepItem.jsx`)
- **File**: `dashboard/src/components/StepItem.jsx`
- **Action**: EDIT
- **Content**: Add distinct visual status badges for working/pending/done states, improve button contrasts, and ensure file is strictly <= 140 lines (Rule 0 compliant).
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 171.1

---

### Step 171.3 — Connect Real-Time Active State in PlanProgressTab (`dashboard/src/components/plans/PlanProgressTab.jsx`)
- **File**: `dashboard/src/components/plans/PlanProgressTab.jsx`
- **Action**: EDIT
- **Content**: Pass dynamic `isActive` prop to each `PhaseView` instance based on active running step and progress. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 171.2

---

### Step 171.4 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 171.3

---

### Step 171.5 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 171.4
