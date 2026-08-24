# Phase 160: Harmonize Main Layout Top Clearance with Sidebar Header

> **Objective:** Lower the main layout content in Electron desktop mode with matching top padding (`pt-8` to `pt-10`) to create a perfectly balanced, harmonious horizontal alignment with the sidebar brand header.

---

## 📋 Execution Steps

### Step 160.1 — Add Matching Top Padding to Main Layout (`dashboard/src/App.jsx`)
- **File**: `dashboard/src/App.jsx`
- **Action**: EDIT
- **Content**: Update `<main>` classes in `App.jsx` to add dynamic Electron top padding (`pt-8 md:pt-9`) for harmonious alignment with the sidebar. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 160.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 160.1

---

### Step 160.3 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 160.2
