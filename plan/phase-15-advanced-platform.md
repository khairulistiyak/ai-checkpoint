# Phase 15 — Advanced Platform Features

> Post-v1.0.0 roadmap. Implement only after release evidence proves the core is stable.

## Scope Rule

These steps are optional after v1.0.0. Do not block release on this phase.

---

## Step 15.1 — Shared progress parser package
- **File:** `packages/core/parse-progress.js`
- **Action:** CREATE
- **Content:** Extract progress parsing so CLI and dashboard import the same pure parser.
- **Done-check:** `node -e "require('./packages/core/parse-progress.js')"` → exit 0
- **Depends:** Phase 11 complete

## Step 15.2 — Shared validation package
- **File:** `packages/core/validate-project.js`
- **Action:** CREATE
- **Content:** Move plan sync, file existence, and 150-line validation into one pure module with no process.exit side effects.
- **Done-check:** `node -e "require('./packages/core/validate-project.js')"` → exit 0
- **Depends:** 15.1

## Step 15.3 — Watch mode command
- **File:** `packages/cli/cmd-watch.js`
- **Action:** CREATE
- **Content:** Add `./l watch` that re-renders the dashboard every 2 seconds while PROGRESS.md changes.
- **Done-check:** `node -e "require('./packages/cli/cmd-watch.js')"` → exit 0
- **Depends:** 15.2

## Step 15.4 — Blocked step command
- **File:** `packages/cli/cmd-block.js`
- **Action:** CREATE
- **Content:** Add `./l block X.Y "reason"` that marks a step as blocked (`[!]`), writes the reason into the update log, and stops further automation.
- **Done-check:** `node -e "require('./packages/cli/cmd-block.js')"` → exit 0
- **Depends:** 15.3

## Step 15.5 — JSON status output
- **File:** `packages/cli/cmd-status.js`
- **Action:** EDIT
- **Content:** Support `./l status --json` for machine-readable phase, step, and next-step data.
- **Done-check:** `./l status --json | node -e "JSON.parse(require('fs').readFileSync(0,'utf8'))"` → exit 0
- **Depends:** 15.4

## Step 15.6 — Multi-project CLI list
- **File:** `packages/cli/cmd-projects.js`
- **Action:** CREATE
- **Content:** Read dashboard settings and print registered projects with progress percentages.
- **Done-check:** `node -e "require('./packages/cli/cmd-projects.js')"` → exit 0
- **Depends:** 15.5

## Step 15.7 — Plan lint command
- **File:** `packages/cli/cmd-lint-plan.js`
- **Action:** CREATE
- **Content:** Add `./l lint-plan` that rejects forbidden words, missing Done-check, multi-file steps, and missing Depends fields.
- **Done-check:** `node -e "require('./packages/cli/cmd-lint-plan.js')"` → exit 0
- **Depends:** 15.6

## Step 15.8 — VS Code task template
- **File:** `templates/vscode-tasks.json`
- **Action:** CREATE
- **Content:** Provide VS Code tasks for start, validate, complete, checkpoint save, and doctor.
- **Done-check:** `node -e "JSON.parse(require('fs').readFileSync('templates/vscode-tasks.json','utf8'))"` → exit 0
- **Depends:** 15.7

## Step 15.9 — npm package packaging
- **File:** `package.json`
- **Action:** EDIT
- **Content:** Add `bin` entry for `ai-checkpoint`, files list, engines node >=18, and publish-ready metadata.
- **Done-check:** `node -e "const p=require('./package.json'); if(!p.bin) process.exit(1)"` → exit 0
- **Depends:** 15.8

## Step 15.10 — Publish dry-run
- **File:** `plan/npm-publish-notes.md`
- **Action:** CREATE
- **Content:** Document `npm publish --dry-run` output, package contents, and install verification steps.
- **Done-check:** `grep -q "npm publish --dry-run" plan/npm-publish-notes.md` → exit 0
- **Depends:** 15.9
