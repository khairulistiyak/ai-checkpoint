# Phase 140: Remove Decorative Radar Sweep Line from AdvancedHUDV1

> **Objective:** Completely remove the decorative spinning radar sweep line and arc from `AdvancedHUDV1.jsx` for an ultra-clean, static, eye-comfort Linear Minimalist aesthetic. Zero regressions.

---

## 📋 Execution Steps

### Step 140.1 — Remove Rotating Sweep Element (`dashboard/src/components/intelligence/AdvancedHUDV1.jsx`)
- **File**: `dashboard/src/components/intelligence/AdvancedHUDV1.jsx`
- **Action**: EDIT
- **Content**: Remove the `<g className="animate-[spin_6s_linear_infinite]">...</g>` rotating sweep arc and line.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 140.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 140.1

---

### Step 140.3 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 140.2
