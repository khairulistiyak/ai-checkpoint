# Phase 133: Modern, Symmetrical & Clean Redesign of CockpitProgressCard

> **Objective:** Redesign CockpitProgressCard into a clean, modern, and symmetrical card matching the 3-column Cockpit grid with a hero progress center and 3-cell metric matrix without affecting any underlying functionality.

---

## 📋 Execution Steps

### Step 133.1 — Redesign CockpitProgressCard Hero Layout & 3-Cell Symmetrical Matrix (`dashboard/src/components/cockpit/CockpitProgressCard.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitProgressCard.jsx`
- **Action**: EDIT
- **Content**: Implement hero progress center, compact active step badge, and 3-cell bottom metric matrix (`[Steps, Phases, Blueprints]`).
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 133.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 133.1

### Step 133.3 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 133.2
