# Phase 155: Restore Electron Window Dragging Support

> **Objective:** Restore smooth window dragging in Electron desktop apps by applying `-webkit-app-region: drag` to the top window areas (SidebarHeader and Main Canvas) while preserving no-drag interactive buttons.

---

## 📋 Execution Steps

### Step 155.1 — Configure SidebarHeader Window Dragging (`dashboard/src/components/SidebarHeader.jsx`)
- **File**: `dashboard/src/components/SidebarHeader.jsx`
- **Action**: EDIT
- **Content**: Add `style={{ WebkitAppRegion: isElectron ? 'drag' : undefined }}` to the header wrapper and `style={{ WebkitAppRegion: 'no-drag' }}` to interactive child elements. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 155.2 — Add Electron Drag Region in App (`dashboard/src/App.jsx`)
- **File**: `dashboard/src/App.jsx`
- **Action**: EDIT
- **Content**: Detect `isElectron` and inject top window drag strip in main content canvas so users can drag the desktop window effortlessly. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 155.1

---

### Step 155.3 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 155.2

---

### Step 155.4 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 155.3
