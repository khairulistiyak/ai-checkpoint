# Phase 151: Move Settings Action to Sidebar Footer

> **Objective:** Relocate the Settings button from the top navigation header (`Header.jsx`) to the bottom of the sidebar (`SidebarFooter.jsx`), providing an intuitive, standard developer IDE layout.

---

## 📋 Execution Steps

### Step 151.1 — Add Settings Button to SidebarFooter (`dashboard/src/components/SidebarFooter.jsx`)
- **File**: `dashboard/src/components/SidebarFooter.jsx`
- **Action**: EDIT
- **Content**: Add clean frosted Settings button to `SidebarFooter.jsx` (with full label in expanded state and icon-only in collapsed state). Keep file <= 150 lines.

Replace with:
```jsx
import React from 'react';
import { Settings } from 'lucide-react';

export default function SidebarFooter({ isCollapsed, onOpenSettings }) {
  return (
    <div className="p-2 border-t border-white/[0.05] bg-[#0a0a0c]/90 backdrop-blur-md relative z-10">
      {!isCollapsed ? (
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 text-zinc-400 hover:text-white transition-all text-xs font-mono font-medium cursor-pointer shadow-sm"
            title="Settings (⌘,)"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>Settings</span>
          </button>

          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 pr-1.5 select-none">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="hidden sm:inline">Online</span>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={onOpenSettings}
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/[0.08]"
            title="Settings (⌘,)"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 151.2 — Pass onOpenSettings through Sidebar (`dashboard/src/components/Sidebar.jsx`)
- **File**: `dashboard/src/components/Sidebar.jsx`
- **Action**: EDIT
- **Content**: Accept `onOpenSettings` prop and pass it to `SidebarFooter`. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 151.1

---

### Step 151.3 — Connect onOpenSettings in App.jsx (`dashboard/src/App.jsx`)
- **File**: `dashboard/src/App.jsx`
- **Action**: EDIT
- **Content**: Pass `onOpenSettings={() => setIsSettingsOpen(true)}` to `<Sidebar />`. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 151.2

---

### Step 151.4 — Remove Settings Button from Header (`dashboard/src/components/Header.jsx`)
- **File**: `dashboard/src/components/Header.jsx`
- **Action**: EDIT
- **Content**: Remove the top header Settings button now that it lives in the sidebar footer. Keep file <= 150 lines.
- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: 151.3

---

### Step 151.5 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 151.4

---

### Step 151.6 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 151.5
