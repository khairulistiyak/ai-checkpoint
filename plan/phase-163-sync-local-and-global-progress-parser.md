# Phase 163: Sync Local and Global Progress Parser

> **Objective:** Ensure the dashboard's project parser checks local `.agents/PROGRESS.md` alongside global store so the UI always reflects the live project state without desync or stale step statuses.

---

## 📋 Execution Steps

### Step 163.1 — Support Local .agents/PROGRESS.md in parser.js (`dashboard/src/server/parser.js`)
- **File**: `dashboard/src/server/parser.js`
- **Action**: EDIT
- **Content**: Update `parseProgress` and `enrichProject` to check local `.agents/PROGRESS.md` and keep global and local progress synchronized. Keep file <= 150 lines.
- **Done-check**: `node -e "import('./dashboard/src/server/parser.js')"` -> exit 0
- **Depends**: None

---

### Step 163.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 163.1

---

### Step 163.3 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 163.2
