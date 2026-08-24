# Phase 152: Remove Online Status Indicator from Sidebar Footer

> **Objective:** Remove the green "Online" pulse indicator from `SidebarFooter.jsx`, making the footer dedicated purely to a sleek Settings button with shortcut indicator.

---

## 📋 Execution Steps

### Step 152.1 — Clean SidebarFooter (`dashboard/src/components/SidebarFooter.jsx`)
- **File**: `dashboard/src/components/SidebarFooter.jsx`
- **Action**: EDIT
- **Content**: Remove Online status badge and style the Settings button cleanly across expanded and collapsed states. Keep file <= 150 lines.

Replace with:
```jsx
import React from 'react';
import { Settings } from 'lucide-react';

export default function SidebarFooter({ isCollapsed, onOpenSettings }) {
  return (
    <div className="p-2 border-t border-white/[0.05] bg-[#0a0a0c]/90 backdrop-blur-md relative z-10">
      {!isCollapsed ? (
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2.5 w-full px-2.5 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 text-zinc-400 hover:text-white transition-all text-xs font-mono font-medium cursor-pointer shadow-sm"
          title="Settings (⌘,)"
        >
          <Settings className="w-3.5 h-3.5 text-zinc-400" />
          <span>Settings</span>
          <span className="ml-auto text-[10px] text-zinc-500 font-mono">⌘,</span>
        </button>
      ) : (
        <div className="flex justify-center">
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

### Step 152.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 152.1

---

### Step 152.3 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 152.2
