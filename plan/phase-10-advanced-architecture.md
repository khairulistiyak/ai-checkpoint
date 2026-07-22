# Phase 10: Advanced Architecture & DX 

> Finalize production readiness by eating our own dogfood: removing the monolithic CLI, adding E2E tests, and refining the template language.

## Gaps Identified
1. **Monolithic CLI Debt:** `scripts/ledger.cjs` is 659 lines, actively violating the spirit of RULE 0.
2. **Test Coverage:** No BATS test suite or automated CLI tests exist.
3. **Template Placeholders:** Old plan placeholders (`USER/`, `YOUR-ACTUAL-USERNAME/`) remain in documentation files.

---

## Step 10.1 — Restructure CLI to Micro-Files
- **File:** `packages/cli/index.js`
- **Action:** CREATE
- **Content:** Create the CLI entry point barrel file. Extract the CLI engine (`scripts/ledger.cjs`) into `packages/cli/`.
- **Done-check:** `node -c packages/cli/index.js` → exit 0
- **Depends:** None

## Step 10.2 — Extract CLI Parsers
- **File:** `packages/cli/parser.js`
- **Action:** CREATE
- **Content:** Move `parseProgress` and `findStepInPlanFiles` out of `ledger.cjs` into a 150-line module.
- **Done-check:** `node -c packages/cli/parser.js` → exit 0
- **Depends:** 10.1

## Step 10.3 — Extract CLI Validators
- **File:** `packages/cli/validators.js`
- **Action:** CREATE
- **Content:** Move `verifyTargetFile` and 150-line rule enforcement logic into a discrete module.
- **Done-check:** `node -c packages/cli/validators.js` → exit 0
- **Depends:** 10.2

## Step 10.4 — Extract Git Checkpoints
- **File:** `packages/cli/checkpoints.js`
- **Action:** CREATE
- **Content:** Move `checkpointSave`, `checkpointList`, and `checkpointBack` into a git utility module.
- **Done-check:** `node -c packages/cli/checkpoints.js` → exit 0
- **Depends:** 10.3

## Step 10.5 — Replace `ledger.cjs` with Barrel
- **File:** `scripts/ledger.cjs`
- **Action:** EDIT
- **Content:** Replace the 659-line script with a clean proxy that requires `packages/cli/index.js`.
- **Done-check:** `./l doctor` → exit 0
- **Depends:** 10.4

## Step 10.6 — Setup BATS Test Framework
- **File:** `tests/test_helper.bash`
- **Action:** CREATE
- **Content:** Add BATS setup, teardown, and directory mock helpers.
- **Done-check:** `test -f tests/test_helper.bash` → exit 0
- **Depends:** None

## Step 10.7 — Write CLI E2E Tests
- **File:** `tests/cli.bats`
- **Action:** CREATE
- **Content:** Write BATS scenarios for `./l start`, `./l c`, `./l v` rejecting >150 lines, and `./l cp save`.
- **Done-check:** `bats tests/cli.bats` → all pass
- **Depends:** 10.6

## Step 10.8 — Update Setup Script for Micro-CLI
- **File:** `setup.sh`
- **Action:** EDIT
- **Content:** Update the installer to copy the `packages/cli` directory instead of just a monolithic `.cjs` file.
- **Done-check:** `bash -n setup.sh` → exit 0
- **Depends:** 10.5
