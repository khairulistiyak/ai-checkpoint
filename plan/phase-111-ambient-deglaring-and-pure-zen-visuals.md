# Phase 111: Ambient De-glaring, Pulse Animation Removal & Pure Zen Visuals

> **Objective:** Eliminate background blur glow blobs, remove distracting animate-ping pulsing animations, remove neon button box-shadows, convert alert callouts to uniform border cards without thick side lines, soften table borders to velvet glass, and eliminate sidebar hover glows.

---

## 📋 Execution Steps

### Step 111.1 — Header De-glaring, Animation Removal & Static Status Dot (`dashboard/src/components/plans/PlanSpecHeader.jsx`)
- **File**: `dashboard/src/components/plans/PlanSpecHeader.jsx`
- **Action**: EDIT
- **Content**: Remove background blur blobs, replace `animate-ping` pulsing dot with a calm static emerald dot, remove glowing neon box-shadows, and soften borders.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 111.2 — Uniform Rounded Alert Cards without Thick Left Bars (`dashboard/src/components/plan/PlanAlertBlock.jsx`)
- **File**: `dashboard/src/components/plan/PlanAlertBlock.jsx`
- **Action**: EDIT
- **Content**: Remove `border-l-4` side border on Note, Tip, Warning, and Caution boxes, creating uniform, sleek, rounded cards.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 111.3 — Velvet Table Borders & Sidebar De-glowing (`dashboard/src/components/plan/PlanTableBlock.jsx`)
- **File**: `dashboard/src/components/plan/PlanTableBlock.jsx`
- **Action**: EDIT
- **Content**: Soften table borders to `border-white/[0.07]`, refine typography to `text-zinc-200`, and in `FilePreviewSidebar.jsx` remove `hover:shadow` glow on TOC buttons.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 111.4 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 111.1, 111.2, 111.3

### Step 111.5 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 111 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 111.4
