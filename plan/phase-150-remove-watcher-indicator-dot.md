# Phase 150: Remove Live Watcher Pinging Dot from Hero Progress Indicator

> **Objective:** Remove the live watcher pinging green dot from `dashboard/src/components/ProjectCard.jsx` to keep the radial progress ring completely clean and distraction-free.

---

## 📋 Execution Steps

### Step 150.1 — Remove Watcher Dot in ProjectCard (`dashboard/src/components/ProjectCard.jsx`)
- **File**: `dashboard/src/components/ProjectCard.jsx`
- **Action**: EDIT
- **Content**: Remove the absolute positioned pinging dot over the radial progress ring. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 150.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 150.1

---

### Step 150.3 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 150.2
