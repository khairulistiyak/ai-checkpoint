# Phase 131: Clean Zen Color Harmonization for 100% States & Cockpit Cards

> **Objective:** Harmonize 100% progress and health states across CockpitProgressCard, HealthScoreGauge, and AdvancedHUDV1 with the project's signature clean zen monochrome palette (zinc-100, zinc-200, crisp white glass) for maximum eye comfort.

---

## 📋 Execution Steps

### Step 131.1 — Clean Color Harmonization for CockpitProgressCard (`dashboard/src/components/cockpit/CockpitProgressCard.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitProgressCard.jsx`
- **Action**: EDIT
- **Content**: Update percentage text to clean `text-zinc-100` and progress track to sleek `bg-zinc-200` with soft white glass aura.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 131.2 — Clean Color Harmonization for HealthScoreGauge (`dashboard/src/components/health/HealthScoreGauge.jsx`)
- **File**: `dashboard/src/components/health/HealthScoreGauge.jsx`
- **Action**: EDIT
- **Content**: Update SVG gauge stroke to clean monochrome `#e4e4e7` and status indicators to zinc-white.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 131.1

### Step 131.3 — Clean Color Harmonization for AdvancedHUDV1 (`dashboard/src/components/intelligence/AdvancedHUDV1.jsx`)
- **File**: `dashboard/src/components/intelligence/AdvancedHUDV1.jsx`
- **Action**: EDIT
- **Content**: Refine radar mesh gradient and vertex colors to match clean glass palette.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 131.2

### Step 131.4 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 131.3

### Step 131.5 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 131.4
