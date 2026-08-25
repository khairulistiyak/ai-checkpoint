# Phase 172: Live Roadmap Progress & Active Working State Synchronization

> **Objective:** Fix live roadmap progress and status display across the dashboard so that when a plan or step is actively working, it immediately reflects the real-time "Working / In Progress" state (warm glowing amber + live stopwatch + dynamic percentage) and never falsely displays "100% Done / Complete" on the KPI cards, hero progress bars, project cards, or sidebar indicators.

---

## 📋 Execution Steps

### Step 172.1 — Upgrade CockpitProgressCard Active Working State (`dashboard/src/components/cockpit/CockpitProgressCard.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitProgressCard.jsx`
- **Action**: EDIT
- **Content**: Ensure active running steps take precedence over `pct === 100`, cap display percentage to 99% while working, render dynamic amber glowing progress bar and `WORKING` HUD badge. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 172.2 — Update ProjectCard & ProgressRing Active State (`dashboard/src/components/ProjectCard.jsx`)
- **File**: `dashboard/src/components/ProjectCard.jsx`
- **Action**: EDIT
- **Content**: Check for real-time running steps and display `Working / In Progress` instead of `100% Done` when tasks are active. Pass `isRunning` to `ProgressRing`. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 172.1

---

### Step 172.3 — Update SidebarItem Real-Time Working Indicator (`dashboard/src/components/SidebarItem.jsx`)
- **File**: `dashboard/src/components/SidebarItem.jsx`
- **Action**: EDIT
- **Content**: Check for active running step in project phases and display animated pulsing amber dot for live working state. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 172.2

---

### Step 172.4 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 172.3

---

### Step 172.5 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 172.4
