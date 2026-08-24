# Phase 104: Fix FilePreviewDrawer ReferenceError & Robust Prop Destructuring

> **Objective:** Fix the runtime `ReferenceError: filename is not defined` in `FilePreviewDrawer.jsx` by properly destructuring `filename` and `onSelectFile` from `props`.

---

## 📋 Execution Steps

### Step 104.1 — Fix Prop Destructuring in FilePreviewDrawer (`dashboard/src/components/plans/FilePreviewDrawer.jsx`)
- **File**: `dashboard/src/components/plans/FilePreviewDrawer.jsx`
- **Action**: EDIT
- **Content**: Destructure `filename` and `onSelectFile` from `props` alongside `onClose`.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 104.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 104.1

### Step 104.3 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full suite of checks (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 104 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 104.2
