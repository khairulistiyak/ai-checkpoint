# Phase 175: Fix Cockpit Badge & Live Working State Visibility

> **Objective:** Fix two bugs: (1) "Milestone" badge showing at 99% when steps remain, and (2) Live working state (amber glow, stopwatch, WORKING badge) never visible because start→complete happens faster than the dashboard's 5s poll cycle.

---

## 📋 Execution Steps

### Step 175.1 — Write Active Step File on Start (`packages/cli/cmd-start.js`)
- **File**: `packages/cli/cmd-start.js`
- **Action**: Edit
- **Content**: After marking `[~]`, write `.agents/.active-step` JSON file with `{ step: stepNum, title: targetStep.title, phase: targetPhase.number, startedAt: new Date().toISOString() }`.
- **Done-check**: `./l v && npm test`
- **Depends**: None

---

### Step 175.2 — Clear Active Step File on Complete (`packages/cli/cmd-complete.js`)
- **File**: `packages/cli/cmd-complete.js`
- **Action**: Edit
- **Content**: After marking `[x]`, delete `.agents/.active-step` if it exists.
- **Done-check**: `./l v && npm test`
- **Depends**: 175.1

---

### Step 175.3 — Read Active Step in Dashboard Server (`dashboard/src/server/parser.js`)
- **File**: `dashboard/src/server/parser.js`
- **Action**: Edit
- **Content**: In `enrichProject()`, read `.agents/.active-step` file. If it exists and is valid JSON, include its contents as `activeStep` in the enriched project data.
- **Done-check**: `./l v && npm --prefix dashboard run build`
- **Depends**: 175.2

---

### Step 175.4 — Fix Remaining Count & Badge Logic (`dashboard/src/components/cockpit/CockpitProgressCard.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitProgressCard.jsx`
- **Action**: Edit
- **Content**: Compute `trueRemaining` directly from `allPhases` steps that aren't `done`. Fix badge text: when `trueRemaining > 0`, always show `'In Progress'`, never `'Milestone'`. Accept server `activeStep` merged with client-side detection.
- **Done-check**: `./l v && npm --prefix dashboard run build`
- **Depends**: 175.3

---

### Step 175.5 — Pass Server ActiveStep from ProjectGrid to CockpitTab (`dashboard/src/components/ProjectGrid.jsx`)
- **File**: `dashboard/src/components/ProjectGrid.jsx`
- **Action**: Edit
- **Content**: Pass `selectedProject?.activeStep` down to `CockpitTab`. In `CockpitTab.jsx`, merge server-side `activeStep` with client-side `useMemo` detection so either source activates the live HUD.
- **Done-check**: `./l v && npm --prefix dashboard run build`
- **Depends**: 175.4

---

### Step 175.6 — Rebuild & Final Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: Edit
- **Content**: Rebuild engine & dashboard, run all tests, verify release gate.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm run release:check`
- **Depends**: 175.5
