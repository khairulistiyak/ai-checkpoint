# Phase 108: Decluttering, Visual De-duplication & Zen Studio UX

> **Objective:** Remove redundant target file grids from the header, unify the topology/filter/search bars into a single sleek control strip, suppress noisy 'Depends: None' metadata chips, and streamline step action buttons into a minimal, eye-friendly action group.

---

## 📋 Execution Steps

### Step 108.1 — Header Decluttering & Streamlined Metrics (`dashboard/src/components/plans/PlanSpecHeader.jsx`)
- **File**: `dashboard/src/components/plans/PlanSpecHeader.jsx`
- **Action**: EDIT
- **Content**: Remove the heavy redundant target files grid from the header, replace with a clean compact summary pill in the badge row, and streamline header spacing.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 108.2 — Unified Minimalist Studio Topology & Search Bar (`dashboard/src/components/plans/PlanSpecTopology.jsx`)
- **File**: `dashboard/src/components/plans/PlanSpecTopology.jsx`
- **Action**: EDIT
- **Content**: Unify module switcher, active filters (hiding 0-count tabs), and search input into a single sleek, compact control strip.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 108.3 — Clean Step Metadata & Noise Suppression (`dashboard/src/components/plan/PlanStepMetadata.jsx`)
- **File**: `dashboard/src/components/plan/PlanStepMetadata.jsx`
- **Action**: EDIT
- **Content**: Filter out `Depends: None` / empty dependencies and refine terminal container styling.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 108.4 — Streamlined Step Action Group (`dashboard/src/components/plan/PlanStepBlock.jsx`)
- **File**: `dashboard/src/components/plan/PlanStepBlock.jsx`
- **Action**: EDIT
- **Content**: Streamline step header buttons into a clean, minimal 2-element action group (`AI Agent Prompt` and CLI command copy).
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 108.5 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 108.1 - 108.4

### Step 108.6 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 108 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 108.5
