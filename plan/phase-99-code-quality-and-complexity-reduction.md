# Phase 99: Zero-Risk Code Quality 100/100, Complexity Reduction & DRY Consolidation

> 100% Regression-Free & Behavior-Preserving Refactoring across all 25 detected diagnostic issues.

---

## Step 99.1 — Build Script Hygiene Exemption
- **File:** `packages/core/code-hygiene.js`
- **Action:** EDIT
- **Content:**
  Include `scripts/` in CLI/build runner exemption without altering scanner logic.
- **Done-check:** `node -e "const { scanHygiene } = require('./packages/core/code-hygiene.js'); const r = scanHygiene('.'); if (r.issues.length !== 0) process.exit(1);" && npm test` → exit 0
- **Depends:** None

---

## Step 99.2 — StatusBadge Complexity Map Refactor
- **File:** `dashboard/src/components/ui/StatusBadge.jsx`
- **Action:** EDIT
- **Content:**
  Convert nested branches in `getStatusConfig` into constant lookup map `STATUS_MAP` preserving exact same classes and styles.
- **Done-check:** `npm --prefix dashboard run build && npm test` → exit 0
- **Depends:** 99.1

---

## Step 99.3 — Plan Content Parser Complexity Decomposition
- **File:** `dashboard/src/components/plans/parse-plan-content.js`
- **Action:** EDIT
- **Content:**
  Decompose `parsePlanContent` into helper functions `parseStepField` and `parseStepHeader` preserving exact same output structure.
- **Done-check:** `npm --prefix dashboard run build && npm test` → exit 0
- **Depends:** 99.2

---

## Step 99.4 — Project Commands Dispatch Table Refactor
- **File:** `dashboard/src/server/project-commands.js`
- **Action:** EDIT
- **Content:**
  Refactor `handleCommand` into a command router map `COMMAND_HANDLERS` preserving exact same HTTP handling.
- **Done-check:** `node -e "require('./dashboard/src/server/project-commands.js')" && npm test` → exit 0
- **Depends:** 99.3

---

## Step 99.5 — CLI Main Router Complexity Reduction
- **File:** `packages/cli/index.js`
- **Action:** EDIT
- **Content:**
  Refactor command switch in `packages/cli/index.js` into command handler dictionary preserving all CLI flags and aliases.
- **Done-check:** `./l doctor && npm test` → exit 0
- **Depends:** 99.4

---

## Step 99.6 — CLI Start Command Helper Decomposition
- **File:** `packages/cli/cmd-start.js`
- **Action:** EDIT
- **Content:**
  Extract step locator and guard helpers from `startCommand` preserving exact output and workflow.
- **Done-check:** `./l doctor && npm test` → exit 0
- **Depends:** 99.5

---

## Step 99.7 — CLI Complete Command Helper Decomposition
- **File:** `packages/cli/cmd-complete.js`
- **Action:** EDIT
- **Content:**
  Extract step validator and progress updater helpers from `completeCommand` preserving exact validation.
- **Done-check:** `./l doctor && npm test` → exit 0
- **Depends:** 99.6

---

## Step 99.8 — Plan Sync Utils Complexity Reduction
- **File:** `packages/cli/plan-sync-utils.js`
- **Action:** EDIT
- **Content:**
  Extract step parsing logic into modular helper functions preserving sync logic.
- **Done-check:** `./l sync && npm test` → exit 0
- **Depends:** 99.7

---

## Step 99.9 — Parse Progress Complexity Reduction
- **File:** `packages/core/parse-progress.js`
- **Action:** EDIT
- **Content:**
  Decompose `parseProgress` into pure helper parsing functions preserving exact PROGRESS.md parsing.
- **Done-check:** `node -e "require('./packages/core/parse-progress.js')" && npm test` → exit 0
- **Depends:** 99.8

---

## Step 99.10 — Project Validation Checks Decomposition
- **File:** `packages/core/validate-project.js`
- **Action:** EDIT
- **Content:**
  Split complex validation checks into isolated helper validators preserving all validation rules.
- **Done-check:** `./l v && npm test` → exit 0
- **Depends:** 99.9

---

## Step 99.11 — Server Module Loader DRY Extraction
- **File:** `dashboard/src/server/module-loader.js`
- **Action:** CREATE
- **Content:**
  Shared module loader utility for server endpoints (`server/health.js` and `server/dry-analysis.js`).
- **Done-check:** `node -e "require('./dashboard/src/server/module-loader.js')" && npm test` → exit 0
- **Depends:** 99.10

---

## Step 99.12 — Server Worker Runner DRY Extraction
- **File:** `dashboard/src/server/worker-runner.js`
- **Action:** CREATE
- **Content:**
  Shared worker runner utility for `server/intelligence.js` and `server/project-health.js`.
- **Done-check:** `node -e "require('./dashboard/src/server/worker-runner.js')" && npm test` → exit 0
- **Depends:** 99.11

---

## Step 99.13 — Rebuild Engine & Dashboard
- **File:** `assets/engine.bin.js`
- **Action:** EDIT
- **Content:**
  Rebuild global engine binary with all quality & complexity optimizations.
- **Done-check:** `npm run build:engine && npm --prefix dashboard run build && npm test` → exit 0
- **Depends:** 99.12

---

## Step 99.14 — Final Quality & Health Score 100/100 Verification
- **File:** `.agents/PROGRESS.md`
- **Action:** EDIT
- **Content:**
  Verify `./l quality` gives 100/100, `./l health` gives 100/100, and `npm run release:check` passes.
- **Done-check:** `./l quality && ./l health && npm run release:check` → exit 0
- **Depends:** 99.13
