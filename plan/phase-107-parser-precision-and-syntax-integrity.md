# Phase 107: Parser Precision, Syntax Highlighter Integrity & Clean Studio UX

> **Objective:** Fix corrupted nested HTML tags in syntax-highlighted code blocks, resolve H2 Step heading misclassification in the markdown parser, enhance metadata extraction, and deduplicate the target files radar.

---

## 📋 Execution Steps

### Step 107.1 — Safe Token-Based Syntax Highlighter (`dashboard/src/components/plans/plan-formatters.jsx`)
- **File**: `dashboard/src/components/plans/plan-formatters.jsx`
- **Action**: EDIT
- **Content**: Implement safe token-based syntax highlighting in `formatCodeWithTheme` that prevents keyword replacers from corrupting HTML tags.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 107.2 — Universal Step & Module Parser (`dashboard/src/components/plans/parse-plan-content.js`)
- **File**: `dashboard/src/components/plans/parse-plan-content.js`
- **Action**: EDIT
- **Content**: Support both `## Step X.Y` and `### Step X.Y` as execution step blocks without splitting them into dummy modules, and normalize target files.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 107.3 — Robust Metadata Extraction (`dashboard/src/components/plan/PlanStepMetadata.jsx`)
- **File**: `dashboard/src/components/plan/PlanStepMetadata.jsx`
- **Action**: EDIT
- **Content**: Cleanly extract File, Action, Depends, and Done-check across all markdown variations (`- File:`, `**File:**`, `File:`) without duplicating text in the remaining body.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 107.4 — Adaptive Blueprint Header & Deduplicated Radar (`dashboard/src/components/plans/PlanSpecHeader.jsx`)
- **File**: `dashboard/src/components/plans/PlanSpecHeader.jsx`
- **Action**: EDIT
- **Content**: Deduplicate target files radar pills and dynamically show execution steps when checkpoint count is 0.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 107.5 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 107.1 - 107.4

### Step 107.6 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 107 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 107.5
