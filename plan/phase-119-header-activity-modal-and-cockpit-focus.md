# Phase 119: Header Live Activity Modal & Cockpit Focus Architecture

> **Objective:** Relocate the Activity Log from the bottom of Cockpit into a dedicated modal opened via an "Activity Log" button in the Project Header bar.

---

## 📋 Execution Steps

### Step 119.1 — Create Dedicated Activity Log Modal Component (`dashboard/src/components/activity/ActivityLogModal.jsx`)
- **File**: `dashboard/src/components/activity/ActivityLogModal.jsx`
- **Action**: CREATE
- **Content**: Framer motion modal with backdrop blur, clean header with Live pulse badge, close button, and embedded `ActivityLog` component.
- **Done-check**: `node -e "const m = require('./dashboard/src/components/activity/ActivityLogModal.jsx');"` -> exit 0
- **Depends**: None

### Step 119.2 — Add Activity Log Button to Project Header (`dashboard/src/components/project/ProjectCardActions.jsx`)
- **File**: `dashboard/src/components/project/ProjectCardActions.jsx`
- **Action**: EDIT
- **Content**: Add `onOpenActivityLog` prop and render green accent `Activity Log` button.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 119.1

### Step 119.3 — Wire Activity Log Modal in Project Header & Grid (`dashboard/src/components/ProjectCard.jsx`)
- **File**: `dashboard/src/components/ProjectCard.jsx`
- **Action**: EDIT
- **Content**: Pass `onOpenActivityLog` through `ProjectCard` and render `ActivityLogModal`.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 119.1, 119.2

### Step 119.4 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 119.1 - 119.3

### Step 119.5 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full validation suite (`./l quality`, `./l health`, `npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 119.4
