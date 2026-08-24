# Phase 143: Remove Fixed Bottom LogPanel Strip from Dashboard

> **Objective:** Remove the legacy fixed bottom `LogPanel.jsx` component and its mount in `AppModals.jsx` to free up screen real estate and eliminate bottom UI interference. Zero regressions.

---

## 📋 Execution Steps

### Step 143.1 — Remove LogPanel Mount from AppModals (`dashboard/src/components/AppModals.jsx`)
- **File**: `dashboard/src/components/AppModals.jsx`
- **Action**: EDIT
- **Content**: Remove `import LogPanel from './LogPanel';` and `{selectedProject && selectedProject.isInstalled && <LogPanel logs={selectedProject.progress?.timeline} />}` from `AppModals.jsx`. Keep file <= 150 lines.

Replace the file with:
```jsx
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import AddProjectModal from './AddProjectModal';
import ConfigEditor from './ConfigEditor';
import CommandPalette from './CommandPalette';
import SettingsModal from './SettingsModal';
import ConfirmModal from './ConfirmModal';

export default function AppModals({
  configProject,
  setConfigProject,
  isAddModalOpen,
  setIsAddModalOpen,
  handleAddProject,
  selectedProject,
  isCommandPaletteOpen,
  setIsCommandPaletteOpen,
  projects,
  onSelectProject,
  setIsSettingsOpen,
  isSettingsOpen,
  confirmRemove,
  doRemoveProject,
  setConfirmRemove
}) {
  return (
    <>
      <AnimatePresence>
        {configProject && <ConfigEditor projectId={configProject} onClose={() => setConfigProject(null)} />}
      </AnimatePresence>

      <AddProjectModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddProject} />

      <AnimatePresence>
        {isCommandPaletteOpen && (
          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            projects={projects}
            onSelectProject={(id) => { onSelectProject(id); setIsCommandPaletteOpen(false); }}
            onOpenSettings={() => { setIsCommandPaletteOpen(false); setIsSettingsOpen(true); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmRemove}
        title="Remove Project"
        message="Remove this project from the dashboard? The files on disk will not be deleted."
        confirmText="Remove"
        cancelText="Keep"
        danger={true}
        onConfirm={doRemoveProject}
        onCancel={() => setConfirmRemove(false)}
      />
    </>
  );
}
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 143.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 143.1

---

### Step 143.3 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 143.2
