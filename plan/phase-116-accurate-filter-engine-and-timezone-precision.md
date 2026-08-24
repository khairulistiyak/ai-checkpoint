# Phase 116: Accurate Real-Time Filter Engine & Local Timezone Precision

> **Objective:** Fix multi-status filter mismatches, sort phase selection dropdown descending, eliminate bogus 'Jan 1, 12:00 AM' timestamps, and implement precision real-time local timezone date formatting across the dashboard.

---

## 📋 Execution Steps

### Step 116.1 — Create Local Timezone Formatter Utility (`dashboard/src/utils/date-formatter.js`)
- **File**: `dashboard/src/utils/date-formatter.js`
- **Action**: CREATE
- **Content**: Robust timezone-aware date and status helper utilities (`formatLocalTime`, `isStepDone`, `isStepActive`, `isStepPending`).
- **Done-check**: `node -e "const { formatLocalTime } = require('./dashboard/src/utils/date-formatter.js');"` -> exit 0
- **Depends**: None

### Step 116.2 — Fix Multi-Status Filter Logic & Descending Phase Dropdown (`dashboard/src/components/plans/PlanProgressTab.jsx`)
- **File**: `dashboard/src/components/plans/PlanProgressTab.jsx`
- **Action**: EDIT
- **Content**: Sort phase select dropdown in descending numerical order and use robust status helpers for filtering.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 116.1

### Step 116.3 — Fix StepItem Timestamp Display with Local Timezone (`dashboard/src/components/StepItem.jsx`)
- **File**: `dashboard/src/components/StepItem.jsx`
- **Action**: EDIT
- **Content**: Replace broken regex/split date logic with `formatLocalTime` and prevent bogus fallback rendering.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 116.1

### Step 116.4 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 116.1 - 116.3

### Step 116.5 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 116 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 116.4
