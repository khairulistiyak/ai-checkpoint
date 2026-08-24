# Phase 110: Side Glow & Left Border Elimination for Flat Zen Design

> **Objective:** Remove colored left accent borders (border-l-2), module side stripes, background blur glow orbs, and neon glowing dot shadows across step blocks and module lists for a completely flat, clean, and calm zen aesthetic.

---

## 📋 Execution Steps

### Step 110.1 — Remove Side Accent Border & Corner Glow (`dashboard/src/components/plan/PlanStepBlock.jsx`)
- **File**: `dashboard/src/components/plan/PlanStepBlock.jsx`
- **Action**: EDIT
- **Content**: Remove `border-l-2 border-l-cyan-500/40 hover:border-l-cyan-400/80` and background blur orb to restore uniform, flat velvet borders (`border border-white/[0.07]`).
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 110.2 — Remove Left Accent Strip & Glow Shadows (`dashboard/src/components/plan/PlanPhaseList.jsx`)
- **File**: `dashboard/src/components/plan/PlanPhaseList.jsx`
- **Action**: EDIT
- **Content**: Remove the absolute left side vertical stripe bar (`w-0.5 bg-cyber-accent/60`) and remove `shadow-[0_0_8px...]` neon glow from header and bullet dots.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 110.3 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 110.1, 110.2

### Step 110.4 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 110 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 110.3
