# Phase 101: Adaptive Clean & Token-Optimized AI Prompt Engine

> **Objective:** Eliminate redundant nested boilerplate when copying bulk issues or full diagnostic reports, adopting an enterprise-grade hierarchical prompt format (Global Rules Envelope + Compact Matrix + Batch Protocol).

---

## 🎯 Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│      Single Issue Copy        │    Bulk / Section Copy │
├───────────────────────────────┼────────────────────────┤
│ - Rich Target Info            │ - Global Rules (ONCE)  │
│ - Direct Guidance             │ - Compact Issues List  │
│ - Strict Verification Rules   │ - Batch Execution Flow │
└───────────────────────────────┴────────────────────────┘
```

---

## 📋 Execution Steps

### Step 101.1 — Core Token-Optimized Prompt Generator (`packages/core/prompt-generator.js`)
- **File**: `packages/core/prompt-generator.js`
- **Action**: EDIT
- **Content**: Refactor `buildBulkIssuesPrompt` and `buildDiagnosticReportPrompt` to eliminate nested duplicate rule blocks.
- **Done-check**: `node -e "require('./packages/core/prompt-generator.js')"` -> exit 0
- **Depends**: None

### Step 101.2 — Core Intelligence Report Prompt Formatter (`packages/core/intelligence-report.js`)
- **File**: `packages/core/intelligence-report.js`
- **Action**: EDIT
- **Content**: Ensure individual issue items provide concise guidance and single prompts without duplicating headers.
- **Done-check**: `node -e "require('./packages/core/intelligence-report.js')" && npm test` -> exit 0
- **Depends**: 101.1

### Step 101.3 — Dashboard Shared Prompt Builder Optimization (`dashboard/src/utils/prompt-builder.js`)
- **File**: `dashboard/src/utils/prompt-builder.js`
- **Action**: EDIT
- **Content**: Update `buildBulkIssuesPrompt` and `buildDiagnosticReportPrompt` in the dashboard utility to match the clean token-efficient format.
- **Done-check**: `node -e "import('./dashboard/src/utils/prompt-builder.js')"` -> exit 0
- **Depends**: 101.1

### Step 101.4 — Update Actionable Issues List Bulk Copy (`dashboard/src/components/intelligence/ActionableIssuesList.jsx`)
- **File**: `dashboard/src/components/intelligence/ActionableIssuesList.jsx`
- **Action**: EDIT
- **Content**: Connect `handleCopyAllPrompts` to the optimized non-repeating prompt builder.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 101.3

### Step 101.5 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 101.1 - 101.4

### Step 101.6 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full suite of checks (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 101 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 101.5
