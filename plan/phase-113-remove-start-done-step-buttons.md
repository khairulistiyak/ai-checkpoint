# Phase 113: Removal of Redundant Start/Done Step Buttons

> **Objective:** Remove the redundant CLI `start` and `done` button segment from each step card in the plan viewer as requested by the user, simplifying the step header to a clean title and a single monochromatic AI Prompt button.

---

## 📋 Execution Steps

### Step 113.1 — Remove Start/Done Button Segment (`dashboard/src/components/plan/PlanStepBlock.jsx`)
- **File**: `dashboard/src/components/plan/PlanStepBlock.jsx`
- **Action**: EDIT
- **Content**: Remove the segmented start/done CLI copy buttons and unused variables (`startCmd`, `completeCmd`, `isStartCopied`, `isCompCopied`), leaving a clean step header with monochromatic AI prompt button.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 113.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 113.1

### Step 113.3 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 113 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 113.2
