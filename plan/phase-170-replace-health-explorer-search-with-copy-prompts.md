# Phase 170: Replace Search in HealthIssueExplorer with Section-Wise Copy Prompts Button

> **Objective:** Remove the search bar in `HealthIssueExplorer.jsx` and replace it with a sleek, section-aware `Copy Prompts` action button that copies bulk surgical fix prompts for all issues under the currently active category tab.

---

## 📋 Execution Steps

### Step 170.1 — Update HealthIssueExplorer Component (`dashboard/src/components/health/HealthIssueExplorer.jsx`)
- **File**: `dashboard/src/components/health/HealthIssueExplorer.jsx`
- **Action**: EDIT
- **Content**: Remove search input bar. Add `Copy Prompts` button that calls `buildBulkIssuesPrompt({ category: activeCategory, issues: filteredIssues })` with toast notification and copy state. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 170.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 170.1

---

### Step 170.3 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 170.2
