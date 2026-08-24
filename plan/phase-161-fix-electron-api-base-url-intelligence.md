# Phase 161: Fix Electron API Base URL & Restore Intelligence Hub Data

> **Objective:** Fix direct `fetch('/api/...')` calls across dashboard components by routing all requests through `api.js` (`BASE_URL`). In Electron, relative `/api` fetches fail on `file://` protocol, causing "No intelligence data available" and other silent API failures.

---

## 📋 Execution Steps

### Step 161.1 — Export Missing API Methods in api.js (`dashboard/src/utils/api.js`)
- **File**: `dashboard/src/utils/api.js`
- **Action**: EDIT
- **Content**: Export `fetchProjectIntelligence`, `openInIde`, `browseDirectory`, and `updateSettings`. Keep file <= 150 lines.
- **Done-check**: `node -e "import('./dashboard/src/utils/api.js')"` -> exit 0
- **Depends**: None

---

### Step 161.2 — Fix IntelligenceHub & CockpitHealthOverview API Calls (`dashboard/src/components/intelligence/IntelligenceHub.jsx`)
- **File**: `dashboard/src/components/intelligence/IntelligenceHub.jsx`
- **Action**: EDIT
- **Content**: Replace raw `fetch('/api/projects/...')` with `fetchProjectIntelligence` from `utils/api.js`. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 161.1

---

### Step 161.3 — Fix CockpitHealthOverview Intelligence API Call (`dashboard/src/components/cockpit/CockpitHealthOverview.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitHealthOverview.jsx`
- **Action**: EDIT
- **Content**: Replace raw `fetch('/api/projects/.../intelligence')` with `fetchProjectIntelligence` from `utils/api.js`. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 161.1

---

### Step 161.4 — Fix openInIde in ActionableIssuesList (`dashboard/src/components/intelligence/ActionableIssuesList.jsx`)
- **File**: `dashboard/src/components/intelligence/ActionableIssuesList.jsx`
- **Action**: EDIT
- **Content**: Replace raw `fetch('/api/open-in-ide')` with `openInIde` from `utils/api.js`. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 161.1

---

### Step 161.5 — Fix useHealthCommandCenter openInIde API Call (`dashboard/src/components/health/useHealthCommandCenter.js`)
- **File**: `dashboard/src/components/health/useHealthCommandCenter.js`
- **Action**: EDIT
- **Content**: Replace raw `fetch('/api/open-in-ide')` with `openInIde` from `utils/api.js`. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 161.1

---

### Step 161.6 — Fix SettingsModal & AddProjectModal API Calls (`dashboard/src/components/SettingsModal.jsx`)
- **File**: `dashboard/src/components/SettingsModal.jsx`
- **Action**: EDIT
- **Content**: Replace raw `fetch('/api/settings')` with `fetchSettings` and `updateSettings` from `utils/api.js`. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 161.1

---

### Step 161.7 — Fix AddProjectModal Browse API Call (`dashboard/src/components/AddProjectModal.jsx`)
- **File**: `dashboard/src/components/AddProjectModal.jsx`
- **Action**: EDIT
- **Content**: Replace raw `fetch('/api/browse-directory')` with `browseDirectory` from `utils/api.js`. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 161.1

---

### Step 161.8 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 161.2, 161.3, 161.4, 161.5, 161.6, 161.7

---

### Step 161.9 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 161.8
