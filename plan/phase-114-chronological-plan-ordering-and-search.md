# Phase 114: Chronological Plan Ordering & Plan Blueprints Search Engine

> **Objective:** Fix Plan Blueprints ordering so new plans (e.g. Phase 113, Phase 112) appear at the top in natural descending chronological order, and add instant search filtering in the Blueprint gallery.

---

## 📋 Execution Steps

### Step 114.1 — Sort Plan Files Descending by Phase & Date (`dashboard/src/server/parser.js`)
- **File**: `dashboard/src/server/parser.js`
- **Action**: EDIT
- **Content**: Update `parsePlanFiles` to sort `filesData` in descending order by phase number (and creation date fallback) so newest plans always appear first.
- **Done-check**: `node -e "const { parsePlanFiles } = require('./dashboard/src/server/parser.js');"` -> exit 0
- **Depends**: None

### Step 114.2 — Add Real-Time Search & Sorting in PlanFilesTab (`dashboard/src/components/plans/PlanFilesTab.jsx`)
- **File**: `dashboard/src/components/plans/PlanFilesTab.jsx`
- **Action**: EDIT
- **Content**: Add search query filter and sort toggle to `PlanFilesTab` so users can instantly find plans by number, title, or keywords.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 114.3 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 114.1, 114.2

### Step 114.4 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 114 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 114.3
