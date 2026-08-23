# Phase 103: Accessibility (A11Y) Modal Backdrop & Semantic Role Standardization

> **Objective:** Refactor non-semantic clickable backdrop <div> elements across AddProjectModal, SettingsModal, and CommandPalette to accessible semantic <button aria-label="Close modal backdrop"> elements.

---

## 📋 Execution Steps

### Step 103.1 — AddProjectModal A11Y Semantic Backdrop (`dashboard/src/components/AddProjectModal.jsx`)
- **File**: `dashboard/src/components/AddProjectModal.jsx`
- **Action**: EDIT
- **Content**: Replace backdrop `<div>` with semantic `<button type="button" aria-label="Close modal backdrop" ... />`.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 103.2 — SettingsModal A11Y Semantic Backdrop (`dashboard/src/components/SettingsModal.jsx`)
- **File**: `dashboard/src/components/SettingsModal.jsx`
- **Action**: EDIT
- **Content**: Replace backdrop `<div>` with semantic `<button type="button" aria-label="Close modal backdrop" ... />`.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 103.3 — CommandPalette A11Y Semantic Backdrop (`dashboard/src/components/CommandPalette.jsx`)
- **File**: `dashboard/src/components/CommandPalette.jsx`
- **Action**: EDIT
- **Content**: Replace backdrop `<div>` with semantic `<button type="button" aria-label="Close search overlay" ... />`.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

### Step 103.4 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 103.1 - 103.3

### Step 103.5 — Final Release Gate & Verification (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full suite of checks (`./l quality`, `./l health`, `npm run release:check`) and mark Phase 103 complete.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 103.4
