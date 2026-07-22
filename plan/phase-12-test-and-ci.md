# Phase 12 — Tests and CI

> Prove CLI reliability with automated tests and expand CI beyond shell syntax.

---

## Step 12.1 — Create BATS helper
- **File:** `tests/test_helper.bash`
- **Action:** CREATE
- **Content:** Create a temp git project, run `setup.sh`, expose `PROJECT_DIR`, and clean up on teardown.
- **Done-check:** `test -f tests/test_helper.bash` → exit 0
- **Depends:** None

## Step 12.2 — Doctor and validate tests
- **File:** `tests/doctor.bats`
- **Action:** CREATE
- **Content:** Assert `./l doctor` passes in a valid project and fails with exit 1 when `.agents/` is missing.
- **Done-check:** `bats tests/doctor.bats` → all pass
- **Depends:** 12.1

## Step 12.3 — Step lifecycle tests
- **File:** `tests/step-lifecycle.bats`
- **Action:** CREATE
- **Content:** Create an atomic plan with one CREATE step, register it in PROGRESS, run `./l start`, `./l v`, and `./l c`, then assert PROGRESS marks the step done.
- **Done-check:** `bats tests/step-lifecycle.bats` → all pass
- **Depends:** 12.2

## Step 12.4 — Line-limit failure test
- **File:** `tests/line-limit.bats`
- **Action:** CREATE
- **Content:** Create a completed step file with 200 non-comment lines and assert `./l v` fails and prints the file name and line count.
- **Done-check:** `bats tests/line-limit.bats` → all pass
- **Depends:** 12.3

## Step 12.5 — Checkpoint tests
- **File:** `tests/checkpoint.bats`
- **Action:** CREATE
- **Content:** Assert `./l cp save "msg"` creates an `aicp/*` tag, `./l cp list` shows it, and `./l cp back --force <tag>` restores a modified file without detaching HEAD.
- **Done-check:** `bats tests/checkpoint.bats` → all pass
- **Depends:** 12.4

## Step 12.6 — Start-command safety test
- **File:** `tests/start-safety.bats`
- **Action:** CREATE
- **Content:** Assert `./l start` never creates `path/to/*`, `exact/path/*`, or files under `plan/` and `templates/` as project source files.
- **Done-check:** `bats tests/start-safety.bats` → all pass
- **Depends:** 12.5

## Step 12.7 — Expand GitHub Actions CI
- **File:** `.github/workflows/shellcheck.yml`
- **Action:** EDIT
- **Content:** Rename workflow purpose to full CI. Add jobs: shellcheck, `bats tests`, `node -c packages/cli/index.js`, and `cd dashboard && npm ci && npm run build` on ubuntu-latest and macos-latest.
- **Done-check:** `grep -q "bats" .github/workflows/shellcheck.yml` → exit 0
- **Depends:** 12.6

## Step 12.8 — Add package.json test script
- **File:** `package.json`
- **Action:** CREATE
- **Content:** Create root package with scripts: `"test": "bats tests"`, `"doctor": "./l doctor"`, `"validate": "./l v"`. No runtime dependencies.
- **Done-check:** `node -e "require('./package.json')"` → exit 0
- **Depends:** 12.7
