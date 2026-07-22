# Phase 10 — Production Hardening

> Fix confirmed security, reliability, and RULE 0 violations before v1.0.0.

## Audit Findings

- `scripts/ledger.cjs`: 659 lines; violates RULE 0.
- `dashboard/src/server/projects.js`: 188 lines; uses destructive `git reset --hard`.
- `dashboard/src/components/Sidebar.jsx`: 158 lines.
- CLI has no automated test suite.
- `./l start` creates accidental files when plan content contains nested File examples.
- CI only checks shell syntax; no CLI or dashboard tests/build.
- Working tree has 33 uncommitted dashboard changes.
- `v1.0.0` tag is absent; one-week dogfood remains incomplete.

---

## Step 10.1 — Add safe process runner
- **File:** `dashboard/src/server/run-command.js`
- **Action:** CREATE
- **Content:** Export `runCommand(command, args, cwd)` using `execFileSync` with argument arrays, UTF-8 output, and 15-second timeout. Do not invoke a shell.
- **Done-check:** `node --check dashboard/src/server/run-command.js` → exit 0
- **Depends:** None

## Step 10.2 — Remove shell execution from project routes
- **File:** `dashboard/src/server/projects.js`
- **Action:** EDIT
- **Content:** Replace every `execSync` call with `runCommand`. Replace rollback `git reset --hard <hash>` with `./l cp back --force <tag>`; accept only tags matching `^aicp/[0-9]+\.[0-9]+-[0-9]+$`.
- **Done-check:** `! grep -q "execSync\|reset --hard" dashboard/src/server/projects.js` → exit 0
- **Depends:** 10.1

## Step 10.3 — Split checkpoint routes
- **File:** `dashboard/src/server/checkpoints.js`
- **Action:** CREATE
- **Content:** Move checkpoint list and rollback routes from `projects.js` into an Express router under 150 lines.
- **Done-check:** `test "$(wc -l < dashboard/src/server/checkpoints.js)" -le 150` → exit 0
- **Depends:** 10.2

## Step 10.4 — Mount checkpoint routes
- **File:** `dashboard/server.js`
- **Action:** EDIT
- **Content:** Import and mount `checkpoints.js` at `/api/projects`; keep existing API paths unchanged.
- **Done-check:** `node --check dashboard/server.js` → exit 0
- **Depends:** 10.3

## Step 10.5 — Reduce projects router below limit
- **File:** `dashboard/src/server/projects.js`
- **Action:** EDIT
- **Content:** Remove migrated checkpoint code and keep the file at or below 150 lines.
- **Done-check:** `test "$(wc -l < dashboard/src/server/projects.js)" -le 150` → exit 0
- **Depends:** 10.4

## Step 10.6 — Extract sidebar reorder hook
- **File:** `dashboard/src/hooks/use-sidebar-reorder.js`
- **Action:** CREATE
- **Content:** Move Sidebar reorder state, drag handlers, and debounced persistence into one hook under 100 lines.
- **Done-check:** `node --check dashboard/src/hooks/use-sidebar-reorder.js` → exit 0
- **Depends:** 10.5

## Step 10.7 — Reduce Sidebar below limit
- **File:** `dashboard/src/components/Sidebar.jsx`
- **Action:** EDIT
- **Content:** Use `use-sidebar-reorder.js`; keep Sidebar at or below 150 lines without behavior changes.
- **Done-check:** `test "$(wc -l < dashboard/src/components/Sidebar.jsx)" -le 150` → exit 0
- **Depends:** 10.6
