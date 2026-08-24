# Phase 149: Activity Log & Action Controls Visual Harmonization

> **Objective:** Harmonize the `Activity Log` and action buttons in `ProjectCardActions.jsx` from loud green to clean, distraction-free frosted dark palette styles.

---

## 📋 Execution Steps

### Step 149.1 — Harmonize Action Buttons in ProjectCardActions (`dashboard/src/components/project/ProjectCardActions.jsx`)
- **File**: `dashboard/src/components/project/ProjectCardActions.jsx`
- **Action**: EDIT
- **Content**: Update buttons to clean, frosted neutral style (`bg-white/[0.03] border-white/[0.08] text-zinc-300 hover:text-white`). Keep file <= 150 lines.

Replace with:
```jsx
import React from "react";
import { Settings, Trash2, Activity } from "lucide-react";

export default function ProjectCardActions({
  onOpenConfig,
  onOpenActivityLog,
  onRemove,
}) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        onClick={() => onOpenActivityLog && onOpenActivityLog()}
        className="group px-3 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 hover:text-white transition-all text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer shadow-sm"
        title="Open Live Activity Log & Execution Stream"
      >
        <Activity className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
        <span className="hidden sm:inline">Activity Log</span>
      </button>

      <button
        onClick={onOpenConfig}
        className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/[0.15] text-zinc-400 hover:text-white transition-all cursor-pointer shadow-sm"
        title="Project Rules & Config Editor"
      >
        <Settings className="w-3.5 h-3.5" />
      </button>

      <button
        onClick={onRemove}
        className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-rose-500/15 border border-white/[0.08] hover:border-rose-500/20 text-zinc-400 hover:text-rose-300 transition-all cursor-pointer shadow-sm"
        title="Remove Project from Workspace"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 149.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 149.1

---

### Step 149.3 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 149.2
