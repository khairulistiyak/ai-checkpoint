# Phase 177: Persistent Always-Visible Execution Status Banner & Stopwatch HUD

> **Objective:** Make the top HUD banner in the Execution Roadmap (`PlanProgressTab.jsx`) persistent so it is always displayed at the very top. When active, display the live stopwatch timer (`⏱️ mm:ss`), target file, glowing amber border, and WORKING status. When standby/idle, display a clean frosted glass system readiness strip with current progress stats and STANDBY status.

---

## 📋 Execution Steps

### Step 177.1 — Refactor ActiveStepBanner to Persistent Dual-State HUD (`dashboard/src/components/plans/ActiveStepBanner.jsx`)
- **File**: `dashboard/src/components/plans/ActiveStepBanner.jsx`
- **Action**: EDIT
- **Content**: Implement dual-state HUD banner (Active mode with live stopwatch timer + Standby/Ready mode with system status). Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build`
- **Depends**: None

---

### Step 177.2 — Pass Rich State and Next Step to ActiveStepBanner (`dashboard/src/components/plans/PlanProgressTab.jsx`)
- **File**: `dashboard/src/components/plans/PlanProgressTab.jsx`
- **Action**: EDIT
- **Content**: Pass `counts`, `nextStep`, and `allPhases` down to `ActiveStepBanner` to render rich standby state. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build`
- **Depends**: 177.1

---

### Step 177.3 — Rebuild Engine & Dashboard Assets, Verify Tests & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Rebuild engine and dashboard bundle, run test suite and release check.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm run release:check`
- **Depends**: 177.2
