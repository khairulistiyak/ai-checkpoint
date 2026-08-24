# Phase 156: 100% Reliable Electron Window Dragging Engine

> **Objective:** Fix intermittent window dragging in Electron desktop app by creating dedicated `.app-drag` CSS utilities and a full-width top window drag bar for macOS/Windows desktop builds.

---

## 📋 Execution Steps

### Step 156.1 — Add App-Drag CSS Classes (`dashboard/src/index.css`)
- **File**: `dashboard/src/index.css`
- **Action**: EDIT
- **Content**: Add `.app-drag` and `.app-no-drag` CSS classes with `-webkit-app-region` and `user-select: none`. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 156.2 — Implement Full-Width Electron Drag Bar (`dashboard/src/App.jsx`)
- **File**: `dashboard/src/App.jsx`
- **Action**: EDIT
- **Content**: Add robust `isElectron` detection and a dedicated top 28px Electron window drag strip spanning the full width of the window. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 156.1

---

### Step 156.3 — Update SidebarHeader Drag Classes (`dashboard/src/components/SidebarHeader.jsx`)
- **File**: `dashboard/src/components/SidebarHeader.jsx`
- **Action**: EDIT
- **Content**: Apply `.app-drag` and `.app-no-drag` classes cleanly to header container and interactive buttons. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 156.2

---

### Step 156.4 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 156.3

---

### Step 156.5 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 156.4
