# Phase 100: Universal Bullet-Proof & Non-Breaking AI Prompt Generator System

> **Objective:** Centralize and enhance all AI prompt generation across `ai-checkpoint` (Core, CLI, and Dashboard) with strict zero-regression guardrails, non-breaking contract guarantees, and step-by-step verification flows.

---

## 🎯 Architecture Overview

```text
               ┌────────────────────────────────────────────────────────┐
               │         Universal Prompt Engineering Engine            │
               │   (packages/core/prompt-generator.js & prompt-builder) │
               └──────────────────────────┬─────────────────────────────┘
                                          │
        ┌─────────────────────────────────┼────────────────────────────────┐
        ▼                                 ▼                                ▼
┌───────────────────────┐     ┌───────────────────────┐     ┌────────────────────────┐
│ Health & Diagnostics  │     │ Intelligence Engine   │     │ Step & Workflow Dock   │
│ - Diagnostic Report   │     │ - Single Issue Prompt │     │ - Step Item Prompt     │
│ - Individual Cards    │     │ - Bulk Category Copy  │     │ - Action Dock Prompt   │
│ - DRY Refactor Copy   │     │ - Architecture Guide  │     │ - Architectural Plan   │
└───────────────────────┘     └───────────────────────┘     └────────────────────────┘
```

---

## 📋 Execution Steps

### Step 100.1 — Core Prompt Generator Engine (`packages/core/prompt-generator.js`)
- **File**: `packages/core/prompt-generator.js`
- **Action**: CREATE
- **Content**: Implement pure prompt builders with strict negative constraints, contract preservation, and verification commands.
- **Done-check**: `node -e "require('./packages/core/prompt-generator.js')"` -> exit 0
- **Depends**: None

### Step 100.2 — Update Intelligence Report Generator (`packages/core/intelligence-report.js`)
- **File**: `packages/core/intelligence-report.js`
- **Action**: EDIT
- **Content**: Integrate `prompt-generator.js` into intelligence report generator.
- **Done-check**: `node -e "require('./packages/core/intelligence-report.js')" && npm test` -> exit 0
- **Depends**: 100.1

### Step 100.3 — Dashboard Shared Prompt Builder (`dashboard/src/utils/prompt-builder.js`)
- **File**: `dashboard/src/utils/prompt-builder.js`
- **Action**: CREATE
- **Content**: Client-side prompt builder utility providing structured templates for UI copy buttons.
- **Done-check**: `node -e "import('./dashboard/src/utils/prompt-builder.js')"` -> exit 0
- **Depends**: 100.1

### Step 100.4 — Upgrade Health Diagnostic Report Copy (`dashboard/src/components/health/useHealthCommandCenter.js`)
- **File**: `dashboard/src/components/health/useHealthCommandCenter.js`
- **Action**: EDIT
- **Content**: Update `handleCopyDiagnosticReport` to output the full structured zero-regression prompt.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 100.3

### Step 100.5 — Upgrade Individual Health Issue Card Copy (`dashboard/src/components/health/HealthIssueExplorer.jsx`)
- **File**: `dashboard/src/components/health/HealthIssueExplorer.jsx`
- **Action**: EDIT
- **Content**: Update `handleCopyIssue` with surgical edit constraints and test verification steps.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 100.3

### Step 100.6 — Upgrade Intelligence Actionable Issue Lists (`dashboard/src/components/intelligence/ActionableIssuesList.jsx`)
- **File**: `dashboard/src/components/intelligence/ActionableIssuesList.jsx`
- **Action**: EDIT
- **Content**: Upgrade `handleCopyPrompt` and `handleCopyAllPrompts` using `buildSurgicalFixPrompt`.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 100.3

### Step 100.7 — Upgrade Step Item AI Prompt Generator (`dashboard/src/components/StepItem.jsx`)
- **File**: `dashboard/src/components/StepItem.jsx`
- **Action**: EDIT
- **Content**: Upgrade `handleCopyPrompt` with strict 1-step = 1-file, `./l start`, `./l v`, and `./l c` instructions.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 100.3

### Step 100.8 — Upgrade Developer Action Dock AI Prompt (`dashboard/src/components/dock/useDeveloperDock.js`)
- **File**: `dashboard/src/components/dock/useDeveloperDock.js`
- **Action**: EDIT
- **Content**: Upgrade `handleCopyAiPrompt` to generate comprehensive, safe instructions for the active step.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 100.3

### Step 100.9 — Upgrade Architectural Plan Prompt Generator (`dashboard/src/components/plans/useArchitecturalPlan.js`)
- **File**: `dashboard/src/components/plans/useArchitecturalPlan.js`
- **Action**: EDIT
- **Content**: Upgrade architectural plan step copy prompts.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 100.3

### Step 100.10 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 100.1 - 100.9

### Step 100.11 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full suite of checks (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 100 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 100.10
