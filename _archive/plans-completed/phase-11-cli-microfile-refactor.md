# Phase 11 — CLI Micro-File Refactor

> Split the 659-line CLI into RULE 0 modules so free-tier models can safely maintain it.

## Goal

Every CLI module is one job and ≤150 lines. `scripts/ledger.cjs` becomes a thin launcher.

---

## Step 11.1 — Create CLI shared paths
- **File:** `packages/cli/paths.js`
- **Action:** CREATE
- **Content:** Export absolute paths for `.agents/`, `PROGRESS.md`, `plan/`, and `drafts/`.
- **Done-check:** `node -e "require('./packages/cli/paths.js')"` → exit 0
- **Depends:** None

## Step 11.2 — Create CLI colors module
- **File:** `packages/cli/colors.js`
- **Action:** CREATE
- **Content:** Export ANSI color map and log helpers (`info`, `success`, `warn`, `error`, `header`).
- **Done-check:** `node -e "require('./packages/cli/colors.js')"` → exit 0
- **Depends:** 11.1

## Step 11.3 — Create progress parser
- **File:** `packages/cli/parse-progress.js`
- **Action:** CREATE
- **Content:** Move `parseProgress`, `getPlanFiles`, and `findStepInPlanFiles` into this module.
- **Done-check:** `node -e "require('./packages/cli/parse-progress.js')"` → exit 0
- **Depends:** 11.2

## Step 11.4 — Create validation module
- **File:** `packages/cli/validate.js`
- **Action:** CREATE
- **Content:** Move plan↔progress sync, completed-file existence checks, and 150-line enforcement here. Count all non-blank non-comment lines. Do not exempt project source files.
- **Done-check:** `node -e "require('./packages/cli/validate.js')"` → exit 0
- **Depends:** 11.3

## Step 11.5 — Create doctor module
- **File:** `packages/cli/doctor.js`
- **Action:** CREATE
- **Content:** Move health checks for `.agents/`, required markdown files, `plan/`, and `.git/`.
- **Done-check:** `node -e "require('./packages/cli/doctor.js')"` → exit 0
- **Depends:** 11.4

## Step 11.6 — Create start command module
- **File:** `packages/cli/cmd-start.js`
- **Action:** CREATE
- **Content:** Move `startCommand` here. Create files only when Action is CREATE and the path is not inside `plan/` or `templates/`. Never create paths that contain `path/to` or are example placeholders.
- **Done-check:** `node -e "require('./packages/cli/cmd-start.js')"` → exit 0
- **Depends:** 11.5

## Step 11.7 — Create complete command module
- **File:** `packages/cli/cmd-complete.js`
- **Action:** CREATE
- **Content:** Move `completeCommand` here. Require validation pass before marking done. Support `.md`, `.sh`, `.yml`, `.cjs` file extensions in target verification.
- **Done-check:** `node -e "require('./packages/cli/cmd-complete.js')"` → exit 0
- **Depends:** 11.6

## Step 11.8 — Create status command module
- **File:** `packages/cli/cmd-status.js`
- **Action:** CREATE
- **Content:** Move dashboard rendering into this module under 150 lines.
- **Done-check:** `node -e "require('./packages/cli/cmd-status.js')"` → exit 0
- **Depends:** 11.7

## Step 11.9 — Create checkpoint command module
- **File:** `packages/cli/cmd-checkpoint.js`
- **Action:** CREATE
- **Content:** Move save/list/back here. Keep non-destructive restore with `git checkout <tag> -- .` and auto-stash.
- **Done-check:** `node -e "require('./packages/cli/cmd-checkpoint.js')"` → exit 0
- **Depends:** 11.8

## Step 11.10 — Create new-plan command module
- **File:** `packages/cli/cmd-new-plan.js`
- **Action:** CREATE
- **Content:** Move `newPlanCommand` here with name validation `^[a-zA-Z0-9-]{1,50}$`.
- **Done-check:** `node -e "require('./packages/cli/cmd-new-plan.js')"` → exit 0
- **Depends:** 11.9

## Step 11.11 — Create CLI router barrel
- **File:** `packages/cli/index.js`
- **Action:** CREATE
- **Content:** Parse argv and dispatch to doctor, validate, start, complete, status, checkpoint, and new-plan modules. Export `run(argv)`.
- **Done-check:** `node -e "require('./packages/cli/index.js')"` → exit 0
- **Depends:** 11.10

## Step 11.12 — Replace monolithic ledger launcher
- **File:** `scripts/ledger.cjs`
- **Action:** EDIT
- **Content:** Replace body with a launcher that requires `packages/cli/index.js` and calls `run(process.argv.slice(2))`. File must be under 30 lines.
- **Done-check:** `test "$(wc -l < scripts/ledger.cjs)" -le 30 && ./l doctor` → exit 0
- **Depends:** 11.11

## Step 11.13 — Sync installed CLI copy
- **File:** `.agents/scripts/ledger.cjs`
- **Action:** EDIT
- **Content:** Make this file identical to `scripts/ledger.cjs`.
- **Done-check:** `diff -q scripts/ledger.cjs .agents/scripts/ledger.cjs` → exit 0
- **Depends:** 11.12

## Step 11.14 — Update setup to install packages/cli
- **File:** `setup.sh`
- **Action:** EDIT
- **Content:** Copy `packages/cli/` and `scripts/ledger.cjs` into the target project. Keep install idempotent.
- **Done-check:** `bash -n setup.sh` → exit 0
- **Depends:** 11.13
