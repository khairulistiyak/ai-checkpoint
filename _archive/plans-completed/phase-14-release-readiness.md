# Phase 14 — Release Readiness and Launch

> Complete evidence-based dogfooding and publish v1.0.0 only after every gate passes.

---

## Step 14.1 — Update pre-release checks
- **File:** `scripts/pre-release-check.sh`
- **Action:** EDIT
- **Content:** Add checks for every `packages/cli/*.js` file ≤150 lines, all BATS tests pass, dashboard build passes, git tree is clean, and no `USER/` placeholders exist in shipped files.
- **Done-check:** `bash -n scripts/pre-release-check.sh` → exit 0
- **Depends:** Phase 12 and Phase 13 complete

## Step 14.2 — Record dogfood sessions
- **File:** `examples/dogfood-results.md`
- **Action:** CREATE
- **Content:** Record seven dated sessions: model name, plan used, steps attempted, success/failure, human interventions, setup duration, rollback duration, and bugs found.
- **Done-check:** `test "$(grep -c '^## Session' examples/dogfood-results.md)" -eq 7` → exit 0
- **Depends:** 14.1

## Step 14.3 — Add benchmark summary
- **File:** `examples/model-benchmark.md`
- **Action:** CREATE
- **Content:** Compare at least two free-tier models on the same three-step toy plan. Report completion accuracy, retries, blocked steps, duration, and intervention count.
- **Done-check:** `grep -q "Completion accuracy" examples/model-benchmark.md` → exit 0
- **Depends:** 14.2

## Step 14.4 — Update release changelog
- **File:** `CHANGELOG.md`
- **Action:** EDIT
- **Content:** Add final v1.0.0 features, fixes, test coverage, dashboard, micro-file CLI refactor, and known limitations under Unreleased.
- **Done-check:** `grep -q "CLI micro-file refactor" CHANGELOG.md` → exit 0
- **Depends:** 14.3

## Step 14.5 — Final release validation
- **File:** `plan/release-evidence.md`
- **Action:** CREATE
- **Content:** Record output summaries for `scripts/pre-release-check.sh`, `./l doctor`, `./l v`, BATS tests, dashboard build, clean git status, and installer smoke test.
- **Done-check:** `grep -q "All gates passed" plan/release-evidence.md` → exit 0
- **Depends:** 14.4

## Step 14.6 — Create v1.0.0 release
- **File:** `CHANGELOG.md`
- **Action:** EDIT
- **Content:** Run `scripts/release.sh 1.0.0`. Do not push until the command succeeds and creates annotated tag `v1.0.0`.
- **Done-check:** `git tag -n1 --list v1.0.0` → prints release tag
- **Depends:** 14.5

## Step 14.7 — Publish GitHub release
- **File:** `.github/RELEASE_TEMPLATE.md`
- **Action:** EDIT
- **Content:** Replace `{VERSION}` with `1.0.0`, include dogfood metrics and known limitations, push main and tag, then create the GitHub release.
- **Done-check:** `gh release view v1.0.0` → exit 0
- **Depends:** 14.6
