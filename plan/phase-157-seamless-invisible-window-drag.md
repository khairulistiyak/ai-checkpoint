# Phase 157: Seamless Invisible Electron Window Dragging Architecture

> **Objective:** Transform the Electron window dragging area into a 100% invisible, seamless native design with zero borders, zero contrasting background stripes, and natural layout blending.

---

## 📋 Execution Steps

### Step 157.1 — Remove Contrasting Top Bar & Implement Seamless Dragging (`dashboard/src/App.jsx`)
- **File**: `dashboard/src/App.jsx`
- **Action**: EDIT
- **Content**: Remove visible background color, border, and text from the top drag bar in `App.jsx`. Make it 100% transparent and seamlessly integrated into the window canvas. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 157.2 — Polish SidebarHeader Seamless Aesthetic (`dashboard/src/components/SidebarHeader.jsx`)
- **File**: `dashboard/src/components/SidebarHeader.jsx`
- **Action**: EDIT
- **Content**: Refine `SidebarHeader.jsx` to blend seamlessly with sidebar background and drag zones. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 157.1

---

### Step 157.3 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 157.2

---

### Step 157.4 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 157.3
