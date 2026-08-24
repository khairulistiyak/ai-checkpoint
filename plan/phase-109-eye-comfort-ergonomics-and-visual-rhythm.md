# Phase 109: Eye-Comfort Ergonomics, Velvet Glass Styling & Visual Rhythm Overhaul

> **Objective:** Soften harsh high-contrast white borders into smooth velvet glass, introduce ergonomic off-white reading typography, refine traffic lights and terminal Done-Check gate colors, add subtle left accent guides to step cards, and mute drawer keyboard badges for a calm, distraction-free reading experience.

---

## 📋 Execution Steps

### Step 109.1 — Velvet Glass Borders & Soft Typography in Module List (`dashboard/src/components/plan/PlanPhaseList.jsx`)
- **File**: `dashboard/src/components/plan/PlanPhaseList.jsx`
- **Action**: EDIT
- **Content**: Soften border opacities to velvet glass (`border-white/[0.07]`), upgrade text color palette to ergonomic `text-zinc-200` / `text-zinc-300`, and add breathable line-height.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 109.2 — Step Card Ergonomics & Subdued Terminal Gate (`dashboard/src/components/plan/PlanStepBlock.jsx`)
- **File**: `dashboard/src/components/plan/PlanStepBlock.jsx`
- **Action**: EDIT
- **Content**: Add subtle left accent guide (`border-l-2 border-l-cyan-500/30 hover:border-l-cyan-400/60`) and soften card background to deep velvet `#0f1015`.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 109.3 — Terminal Window & Traffic Lights Softening (`dashboard/src/components/plan/PlanStepMetadata.jsx`)
- **File**: `dashboard/src/components/plan/PlanStepMetadata.jsx`
- **Action**: EDIT
- **Content**: Soften traffic lights opacity (`opacity-60`), add terminal `$` prompt icon, and soften Done-Check emerald text.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 109.4 — Code Block Spacing & Subdued Header (`dashboard/src/components/plan/PlanCodeBlock.jsx`)
- **File**: `dashboard/src/components/plan/PlanCodeBlock.jsx`
- **Action**: EDIT
- **Content**: Soften traffic lights, increase code line-height (`leading-relaxed`), and polish copy button styling.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 109.5 — Drawer Header Keyboard Hints & Muted Controls (`dashboard/src/components/plan/FilePreviewHeader.jsx`)
- **File**: `dashboard/src/components/plan/FilePreviewHeader.jsx`
- **Action**: EDIT
- **Content**: Mute keyboard badges to low-contrast zinc pills (`text-zinc-500 bg-white/[0.03] border-white/[0.06]`) and soften close button.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 109.6 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 109.1 - 109.5

### Step 109.7 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 109 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 109.6
