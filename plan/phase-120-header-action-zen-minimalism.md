# Phase 120: Header Action Zen Minimalism — Remove Redundant Action Buttons & Export

> **Objective:** Streamline the Project Header actions bar by removing redundant buttons (`Architect View`, `Save Snapshot`, `Intelligence Hub`, `Export`), keeping only essential controls (`Activity Log`, `Settings`, `Remove`).

---

## 📋 Execution Steps

### Step 120.1 — Clean Up Project Header Actions (`dashboard/src/components/project/ProjectCardActions.jsx`)
- **File**: `dashboard/src/components/project/ProjectCardActions.jsx`
- **Action**: EDIT
- **Content**: Remove `Architect View`, `Save Snapshot`, `Intelligence Hub`, and `ExportButton` from `ProjectCardActions.jsx`.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 120.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 120.1

### Step 120.3 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 120.2
