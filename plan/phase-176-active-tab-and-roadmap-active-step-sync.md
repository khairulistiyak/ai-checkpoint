# Phase 176: Active Tab Filter & Roadmap Active Step Synchronization

> **Objective:** Synchronize real-time working step detection with the Roadmap tab filters (`Active (1)` count button), `ActiveStepBanner`, `PhaseView`, and `StepItem` rows so that when a step is active (`./l start` / `.active-step`), clicking the "Active" filter tab displays the running step with full amber working glow, live spinner, and WORKING badge.

---

## 📋 Execution Steps

### Step 176.1 — Update PlanProgressTab Active Counts & Memo (`dashboard/src/components/plans/PlanProgressTab.jsx`)
- **File**: `dashboard/src/components/plans/PlanProgressTab.jsx`
- **Action**: EDIT
- **Content**: Update `counts` and `activeStep` memo to recognize `project?.activeStep`, ensuring the `Active` filter button count accurately reflects running steps (`1` instead of `0`). Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build`
- **Depends**: None

---

### Step 176.2 — Update ActiveStepBanner Step Property Support (`dashboard/src/components/plans/ActiveStepBanner.jsx`)
- **File**: `dashboard/src/components/plans/ActiveStepBanner.jsx`
- **Action**: EDIT
- **Content**: Support `activeStep.step || activeStep.id || activeStep.number` so CLI `.active-step` payloads render the step number correctly. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build`
- **Depends**: 176.1

---

### Step 176.3 — Update ProjectGrid FilteredPhases Active State Match (`dashboard/src/components/ProjectGrid.jsx`)
- **File**: `dashboard/src/components/ProjectGrid.jsx`
- **Action**: EDIT
- **Content**: Include `selectedProject?.activeStep` match in `filteredPhases` when `statusFilter === 'in_progress'`, so clicking the "Active" filter button shows the running step. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build`
- **Depends**: 176.2

---

### Step 176.4 — Update PhaseView & StepItem Active Highlight (`dashboard/src/components/PhaseView.jsx`)
- **File**: `dashboard/src/components/PhaseView.jsx`
- **Action**: EDIT
- **Content**: Pass active step matching to `StepItem` children so the active step displays the live amber glow, spinner, and WORKING badge. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build`
- **Depends**: 176.3

---

### Step 176.5 — Rebuild Engine & Dashboard Assets, Verify Tests & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and dashboard bundle, run all test suites and full release check.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm run release:check`
- **Depends**: 176.4
