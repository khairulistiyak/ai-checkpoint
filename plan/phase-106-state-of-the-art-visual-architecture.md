# Phase 106: State-of-the-Art Visual Architecture & Structured Step Engine

> **Objective:** Deliver a studio-grade visual overhaul to the Blueprint & Plan Viewer, featuring structured key-value step metadata cards, macOS traffic light code blocks, ambient glow headers, live execution radar ping, and topology micro-progress bars.

---

## 📋 Execution Steps

### Step 106.1 — Create Structured Step Metadata Component (`dashboard/src/components/plan/PlanStepMetadata.jsx`)
- **File**: `dashboard/src/components/plan/PlanStepMetadata.jsx`
- **Action**: CREATE
- **Content**: Build a parser and component to render File, Action, Depends, and Done-check terminal cards.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 106.2 — Integrate Structured Metadata in Plan Step Block (`dashboard/src/components/plan/PlanStepBlock.jsx`)
- **File**: `dashboard/src/components/plan/PlanStepBlock.jsx`
- **Action**: EDIT
- **Content**: Connect `PlanStepMetadata` to render structured cards with futuristic glassmorphic borders and hover glow.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 106.1

### Step 106.3 — Upgrade Code Blocks with macOS Window Styling (`dashboard/src/components/plan/PlanCodeBlock.jsx`)
- **File**: `dashboard/src/components/plan/PlanCodeBlock.jsx`
- **Action**: EDIT
- **Content**: Add macOS traffic lights, language badge, and emerald copy interactions.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 106.4 — Polish Blueprint Header with Ambient Glow & Radar Beacon (`dashboard/src/components/plans/PlanSpecHeader.jsx`)
- **File**: `dashboard/src/components/plans/PlanSpecHeader.jsx`
- **Action**: EDIT
- **Content**: Add ambient radial background glow, animated radar beacon, and file-type radar pills.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 106.5 — Polish Topology Map with Progress Indicators (`dashboard/src/components/plans/PlanSpecTopology.jsx`)
- **File**: `dashboard/src/components/plans/PlanSpecTopology.jsx`
- **Action**: EDIT
- **Content**: Add layer progress bars and glowing active layer indicators.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 106.6 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 106.1 - 106.5

### Step 106.7 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 106 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 106.6
