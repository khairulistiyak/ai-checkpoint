# Phase 141: Cockpit Roadmap Progress Card Live Workflow HUD Upgrade

> **Objective:** Upgrade the active step capsule in `CockpitProgressCard.jsx` into a sleek, frosted Linear-style Live Workflow HUD strip with live status pulse, clear monospaced step badge, and legible step title with full tooltip. Zero regressions.

---

## 📋 Execution Steps

### Step 141.1 — Upgrade Active Step Capsule (`dashboard/src/components/cockpit/CockpitProgressCard.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitProgressCard.jsx`
- **Action**: EDIT
- **Content**: Replace cramped amber pill with a sleek, frosted `rounded-xl` live workflow strip (`bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]`) featuring a live pulse beacon, crisp monospaced step tag, and clear truncated title with tooltip. Keep file <= 150 lines.

Replace lines 82-106 with:
```jsx
        {/* Context or Active Step Micro-HUD */}
        {activeStep ? (
          <div className="w-full max-w-[17rem] px-2.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] flex items-center justify-between gap-2 shadow-sm transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0">
                  Step {activeStep.id || activeStep.number}
                </span>
                <span className="text-zinc-600 text-[10px]">•</span>
                <span className="text-[11px] font-mono text-zinc-300 truncate" title={activeStep.title || activeStep.name}>
                  {activeStep.title || activeStep.name}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-center gap-1.5">
            <span className="text-zinc-300 font-medium">
              {pct === 100 ? 'All milestones achieved' : `${remaining} step${remaining === 1 ? '' : 's'} remaining`}
            </span>
            {pct < 100 && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-500">Ready</span>
              </>
            )}
          </div>
        )}
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 141.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 141.1

---

### Step 141.3 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 141.2
