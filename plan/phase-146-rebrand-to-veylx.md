# Phase 146: Project Rebranding to Veylx

> **Objective:** Rename and rebrand all public-facing UI components, headers, page titles, electron desktop configurations, prompt diagnostic reports, and metadata from AI Checkpoint to **Veylx** across the repository.

---

## 📋 Execution Steps

### Step 146.1 — Update Dashboard Header Brand Title (`dashboard/src/components/Header.jsx`)
- **File**: `dashboard/src/components/Header.jsx`
- **Action**: EDIT
- **Content**: Update brand title to `VEYLX`. Keep file <= 150 lines.
- **Done-check**: `grep "VEYLX" dashboard/src/components/Header.jsx` -> exit 0
- **Depends**: None

---

### Step 146.2 — Update Dashboard index.html Title & Metadata (`dashboard/index.html`)
- **File**: `dashboard/index.html`
- **Action**: EDIT
- **Content**: Update `<title>` to `Veylx Dashboard` and update meta description / OG tags.
- **Done-check**: `grep "Veylx Dashboard" dashboard/index.html` -> exit 0
- **Depends**: 146.1

---

### Step 146.3 — Update UI Modals & Empty States (`dashboard/src/components/AddProjectModal.jsx`)
- **File**: `dashboard/src/components/AddProjectModal.jsx`
- **Action**: EDIT
- **Content**: Update description to `"Register local repository into Veylx state ledger."`.
- **Done-check**: `grep "Veylx" dashboard/src/components/AddProjectModal.jsx` -> exit 0
- **Depends**: 146.2

---

### Step 146.4 — Update Core Diagnostic Prompt Generator (`packages/core/prompt-generator.js`)
- **File**: `packages/core/prompt-generator.js`
- **Action**: EDIT
- **Content**: Update report header to `# Veylx System Diagnostic Report`.
- **Done-check**: `grep "Veylx" packages/core/prompt-generator.js` -> exit 0
- **Depends**: 146.3

---

### Step 146.5 — Update Electron App Branding (`electron-builder.yml`)
- **File**: `electron-builder.yml`
- **Action**: EDIT
- **Content**: Update productName to `Veylx`, appId to `com.khairulistiyak.veylx`, and installer titles to `Veylx`.
- **Done-check**: `grep "Veylx" electron-builder.yml` -> exit 0
- **Depends**: 146.4

---

### Step 146.6 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 146.5

---

### Step 146.7 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 146.6
