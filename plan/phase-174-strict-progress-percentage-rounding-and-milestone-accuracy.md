# Phase 174: Strict Progress Percentage Rounding, Floor Protection & Milestone Accuracy

## Problem Statement
When projects have a large number of completed steps with a few pending remaining steps (e.g. 1017 / 1022 steps complete, with 5 remaining), mathematical rounding (`Math.round(1017 / 1022 * 100) = Math.round(99.51) = 100`) caused the progress tracker, CLI, and dashboard hero card to prematurely report `100%` and `Milestone`, while simultaneously displaying `5 steps remaining • Ready`.
Progress percentage must NEVER reach `100%` unless all steps are 100% completed (`completed === total && remaining === 0`). Any partial progress >= 99% with remaining steps must strictly floor/cap at `99%` and show `In Progress` / `Working` / `Pending`, never `100%` or `Milestone`.

---

## Steps

### Step 174.1: Update `packages/core/parse-progress.js`
- **File**: `packages/core/parse-progress.js`
- **Action**: Edit
- **Content**: Update `parsePhasesAndSteps` and `calculateOverallProgress` to use strict non-100% floor calculation (`(done === total) ? 100 : Math.min(99, Math.floor((done / total) * 100))`).
- **Done-check**: `./l v && npm test`
- **Depends**: None

### Step 174.2: Update `packages/cli/progress-updater.js`
- **File**: `packages/cli/progress-updater.js`
- **Action**: Edit
- **Content**: Update `updateProgressState` with strict floor calculation so progress bar and header strings never report 100% when steps remain.
- **Done-check**: `./l v && npm test`
- **Depends**: 174.1

### Step 174.3: Update `packages/cli/plan-sync.js`
- **File**: `packages/cli/plan-sync.js`
- **Action**: Edit
- **Content**: Update `updateOverallBar` with strict floor calculation so sync calculations never round up to 100% if `doneS < totalS`.
- **Done-check**: `./l v && npm test`
- **Depends**: 174.2

### Step 174.4: Update `packages/cli/cmd-status.js`
- **File**: `packages/cli/cmd-status.js`
- **Action**: Edit
- **Content**: Update phase and overall percentage calculation with strict ceiling prevention.
- **Done-check**: `./l v && npm test`
- **Depends**: 174.3

### Step 174.5: Update `dashboard/src/server/parser.js`
- **File**: `dashboard/src/server/parser.js`
- **Action**: Edit
- **Content**: Update `calculateMergedProgress` in `parser.js` so `overall.percentage` uses `(completed === total) ? 100 : Math.min(99, Math.floor((completed / total) * 100))`.
- **Done-check**: `./l v && npm --prefix dashboard run build`
- **Depends**: 174.4

### Step 174.6: Update `dashboard/src/components/cockpit/CockpitProgressCard.jsx`
- **File**: `dashboard/src/components/cockpit/CockpitProgressCard.jsx`
- **Action**: Edit
- **Content**: Update `displayPct`, `hasRemaining`, `isTrulyComplete`, center hero milestone badge (`In Progress` when `hasRemaining`), and top status pill (`READY` / `WORKING` / `COMPLETE`).
- **Done-check**: `./l v && npm --prefix dashboard run build`
- **Depends**: 174.5

### Step 174.7: Update `dashboard/src/components/ProjectCard.jsx`
- **File**: `dashboard/src/components/ProjectCard.jsx`
- **Action**: Edit
- **Content**: Update `isDone`, `hasRemaining`, and `displayPct` to enforce strict 99% cap and prevent premature done state.
- **Done-check**: `./l v && npm --prefix dashboard run build`
- **Depends**: 174.6

### Step 174.8: Rebuild Engine & Dashboard Assets, Verify Tests & Release Gate
- **File**: `.agents/PROGRESS.md`
- **Action**: Edit
- **Content**: Rebuild global engine binary and dashboard bundle, run all test suites and full release check.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm run release:check`
- **Depends**: 174.7
