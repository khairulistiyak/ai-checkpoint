# Phase 168: Remove Project Progress Percentage Badge from SidebarItem

> **Objective:** Remove the `{progress}%` percentage badge from the sidebar project item in `SidebarItem.jsx` as requested by the user, creating a minimal, clean, and distraction-free sidebar project list.

---

## 📋 Execution Steps

### Step 168.1 — Remove Progress Badge from SidebarItem (`dashboard/src/components/SidebarItem.jsx`)
- **File**: `dashboard/src/components/SidebarItem.jsx`
- **Action**: EDIT
- **Content**: Remove the `{p.isInstalled && (<span ...>{progress}%</span>)}` badge from the expanded sidebar row. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 168.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 168.1

---

### Step 168.3 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 168.2
