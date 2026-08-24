# Phase 115: Unified Plans & Blueprints System Consolidation

> **Objective:** Consolidate the duplicate and confusing separate 'Roadmap & Steps' and 'Plan Blueprints' tabs into a single, cohesive 'Plans & Blueprints' hub with an integrated switcher between Execution Roadmap and Blueprint Specifications.

---

## 📋 Execution Steps

### Step 115.1 — Create Unified Plans Tab Component (`dashboard/src/components/plans/UnifiedPlansTab.jsx`)
- **File**: `dashboard/src/components/plans/UnifiedPlansTab.jsx`
- **Action**: CREATE
- **Content**: Build unified component with clean segmented switcher between Roadmap (`PlanProgressTab`) and Blueprints (`PlanFilesTab`).
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 115.2 — Consolidate Navigation Bar Tabs (`dashboard/src/components/ProjectTabBar.jsx`)
- **File**: `dashboard/src/components/ProjectTabBar.jsx`
- **Action**: EDIT
- **Content**: Merge `roadmap` (Tab 2) and `files` (Tab 3) into a single unified tab (`id: 'plans'`, `label: 'Plans & Blueprints'`).
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 115.1

### Step 115.3 — Update ProjectTabsContent Routing (`dashboard/src/components/ProjectTabsContent.jsx`)
- **File**: `dashboard/src/components/ProjectTabsContent.jsx`
- **Action**: EDIT
- **Content**: Replace separate `roadmap` and `files` route branches with single `plans` branch rendering `UnifiedPlansTab`.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 115.2

### Step 115.4 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 115.1 - 115.3

### Step 115.5 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 115 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 115.4
