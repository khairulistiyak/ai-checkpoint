# Phase 162: Asynchronous Non-Blocking Command Execution

> **Objective:** Convert `runCommand` from synchronous `execFileSync` to asynchronous `execFile` (Promise-based) to eliminate event-loop blocking and prevent Electron UI freezes / spinning beachballs when completing steps or executing CLI commands.

---

## 📋 Execution Steps

### Step 162.1 — Make runCommand Async (`dashboard/src/server/run-command.js`)
- **File**: `dashboard/src/server/run-command.js`
- **Action**: EDIT
- **Content**: Refactor `runCommand` to use `util.promisify(execFile)` for non-blocking asynchronous execution. Keep file <= 150 lines.
- **Done-check**: `node -e "import('./dashboard/src/server/run-command.js')"` -> exit 0
- **Depends**: None

---

### Step 162.2 — Make handleCommand Async (`dashboard/src/server/project-commands.js`)
- **File**: `dashboard/src/server/project-commands.js`
- **Action**: EDIT
- **Content**: Update `handleCommand`, `handleRawInput`, `handleStepCommand`, and `handleStandardCommand` to be async/await. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 162.1

---

### Step 162.3 — Make checkpoints.js Async (`dashboard/src/server/checkpoints.js`)
- **File**: `dashboard/src/server/checkpoints.js`
- **Action**: EDIT
- **Content**: Update `router.get('/:id/checkpoints')` and `router.post('/:id/rollback')` to use `async (req, res)` with `await runCommand`. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 162.1

---

### Step 162.4 — Make handleSyncPlans Async (`dashboard/src/server/project-actions.js`)
- **File**: `dashboard/src/server/project-actions.js`
- **Action**: EDIT
- **Content**: Update `handleSyncPlans` to `async (req, res)` with `await runCommand`. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 162.1

---

### Step 162.5 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 162.2, 162.3, 162.4

---

### Step 162.6 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 162.5
