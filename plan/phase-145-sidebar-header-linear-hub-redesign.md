# Phase 145: Sidebar Header Linear-Style Workspace Hub Redesign

> **Objective:** Upgrade `SidebarHeader.jsx` to Concept 1 (Linear-Style Workspace Hub) with a frosted brand mark, `font-outfit` bold title, clean `•` separator with monospaced counter pill, and a cohesive frosted action button micro-cluster. Zero regressions.

---

## 📋 Execution Steps

### Step 145.1 — Redesign SidebarHeader to Linear Workspace Hub (`dashboard/src/components/SidebarHeader.jsx`)
- **File**: `dashboard/src/components/SidebarHeader.jsx`
- **Action**: EDIT
- **Content**: Implement Concept 1 layout with frosted brand mark, clean typography, separator dot, monospaced counter, and frosted micro-cluster buttons. Keep file <= 150 lines.

Replace the file with:
```jsx
import React from 'react';
import { Layers, Plus, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function SidebarHeader({
  itemsCount, isCollapsed, setIsCollapsed, onAddProject, setIsMobileMenuOpen
}) {
  return (
    <div
      className={`p-3 sm:px-3.5 sm:py-3 border-b border-white/[0.05] bg-[#0a0a0c]/90 backdrop-blur-md relative z-10 flex items-center ${
        isCollapsed ? 'justify-center flex-col gap-2.5' : 'justify-between gap-2'
      }`}
    >
      {!isCollapsed ? (
        <>
          {/* Brand Mark & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.12] flex items-center justify-center text-zinc-100 shrink-0 shadow-sm">
              <Layers className="w-3.5 h-3.5 text-zinc-200" />
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[13px] font-bold text-zinc-100 tracking-tight font-outfit truncate">
                Workspaces
              </span>
              <span className="text-zinc-600 text-[10px] select-none">•</span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-zinc-400 tabular-nums">
                {itemsCount}
              </span>
            </div>
          </div>

          {/* Action Buttons Micro-Cluster */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onAddProject}
              className="w-7 h-7 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Add Workspace (New)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden md:flex w-7 h-7 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08] text-zinc-400 hover:text-white items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden w-7 h-7 rounded-lg bg-white/[0.02] hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Close Sidebar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-0.5">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 rounded-xl bg-white/[0.02] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Expand Sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
          <button
            onClick={onAddProject}
            className="w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.10] border border-white/[0.10] text-zinc-200 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
            title="Add Workspace"
          >
            <Plus className="w-4 h-4" />
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

### Step 145.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 145.1

---

### Step 145.3 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 145.2
