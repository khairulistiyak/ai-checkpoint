# Phase 142: Add Live Stopwatch / Elapsed Timer to Roadmap Progress HUD

> **Objective:** Add a real-time elapsed timer (stopwatch) to the active step HUD strip inside `CockpitProgressCard.jsx` (`⏱️ mm:ss`) with a clean frosted timer badge, updating every second during active step execution. Zero regressions.

---

## 📋 Execution Steps

### Step 142.1 — Implement Stopwatch Timer in CockpitProgressCard (`dashboard/src/components/cockpit/CockpitProgressCard.jsx`)
- **File**: `dashboard/src/components/cockpit/CockpitProgressCard.jsx`
- **Action**: EDIT
- **Content**: Add `useState`, `useEffect` for 1-second interval timer when `activeStep` is present, format elapsed time as `mm:ss`, and render a clean stopwatch badge with `Timer` icon. Keep file <= 150 lines.

Replace the file with:
```jsx
import React, { useState, useEffect } from 'react';
import { Target, Timer } from 'lucide-react';

export default function CockpitProgressCard({
  overall, remaining = 0, allPhases = [], activePhases = [], planStats = null, totalPlanSteps = 0, activeStep = null, onOpenArchitect
}) {
  const totalPlans = planStats?.totalFiles ?? planStats?.files?.length ?? planStats?.fileNames?.length ?? allPhases.length ?? 0;
  const totalPhases = allPhases.length || totalPlans;
  const fallbackTotalSteps = allPhases.reduce((acc, p) => acc + (p.steps?.length || p.total || 0), 0);
  const totalSteps = overall?.total || fallbackTotalSteps || totalPlanSteps || 0;
  
  const rawPct = typeof overall === 'number' ? overall : (overall?.percentage ?? (totalSteps > 0 ? Math.round(((overall?.completed || 0) / totalSteps) * 100) : 0));
  const pct = Math.min(100, Math.max(0, isNaN(rawPct) ? 0 : Math.round(rawPct)));
  const completedSteps = overall?.completed ?? (pct === 100 ? totalSteps : Math.max(0, totalSteps - remaining));

  const parsedCompletedPhases = allPhases.filter(p => (
    p.status === 'completed' || p.status === 'done' || (typeof p.percentage === 'number' && p.percentage >= 100) || (p.completed && p.total && p.completed >= p.total)
  )).length;
  const completedPhases = (pct === 100 && totalPhases > 0) ? totalPhases : parsedCompletedPhases;

  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!activeStep) { setElapsed(0); return; }
    const timer = setInterval(() => setElapsed(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [activeStep?.id || activeStep?.number || null]);

  const formatElapsed = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#0e0e11]/80 backdrop-blur-md border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-4 flex flex-col justify-between h-full min-h-[14rem] shadow-sm transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-400">
            <Target className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <span className="text-xs font-mono font-medium text-zinc-400">Roadmap Progress</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.02] border border-white/[0.05]">
          <span className={`w-1.5 h-1.5 rounded-full ${pct === 100 ? 'bg-zinc-300 shadow-[0_0_6px_rgba(255,255,255,0.4)]' : (activeStep ? 'bg-amber-400 animate-ping' : 'bg-zinc-400')}`} />
          <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">
            {pct === 100 ? 'COMPLETE' : (activeStep ? 'ACTIVE' : 'STANDBY')}
          </span>
        </div>
      </div>

      {/* Center Hero Progress & Milestone HUD */}
      <div className="my-auto py-1 flex flex-col items-center justify-center relative z-10 w-full text-center">
        <div className="flex items-center justify-center gap-2.5">
          <div className="flex items-baseline">
            <span className="text-4xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-100 to-zinc-400 tabular-nums drop-shadow-[0_2px_8px_rgba(255,255,255,0.06)]">
              {pct}
            </span>
            <span className="text-base font-mono font-semibold text-zinc-500 ml-0.5">%</span>
          </div>

          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-[9.5px] font-mono font-bold uppercase tracking-wider text-zinc-300 shadow-sm">
            {pct === 100 ? 'Completed' : 'Milestone'}
          </div>
        </div>

        <div className="w-full max-w-[15rem] bg-white/[0.04] h-1.5 rounded-full overflow-hidden border border-white/[0.04] my-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)]">
          <div
            className="bg-gradient-to-r from-zinc-300 to-zinc-100 h-full rounded-full transition-all duration-700 ease-out shadow-[0_0_12px_rgba(255,255,255,0.2)]"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Context or Active Step Micro-HUD with Stopwatch */}
        {activeStep ? (
          <div className="w-full max-w-[17.5rem] px-2.5 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] flex items-center justify-between gap-2 shadow-sm transition-all">
            <div className="flex items-center gap-2 min-w-0 flex-1">
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

            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.06] text-zinc-400 shrink-0 tabular-nums shadow-sm" title="Elapsed step time">
              <Timer className="w-2.5 h-2.5 text-amber-400/90" />
              <span className="text-[10px] font-mono font-medium text-zinc-300">
                {formatElapsed(elapsed)}
              </span>
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
      </div>

      {/* 3-Cell Symmetrical Metric Matrix (Steps Done, Phases, Blueprints) */}
      <div className="grid grid-cols-3 gap-1.5 pt-2.5 border-t border-white/[0.04] text-center relative z-10 font-mono">
        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
          <div className="text-zinc-200 font-semibold text-xs tabular-nums">{completedSteps}</div>
          <div className="text-[9px] text-zinc-500 uppercase font-medium">Steps Done</div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-1.5 flex flex-col justify-center">
          <div className="text-zinc-200 font-semibold text-xs tabular-nums">{completedPhases}/{totalPhases}</div>
          <div className="text-[9px] text-zinc-500 uppercase font-medium">Phases</div>
        </div>

        <div
          onClick={onOpenArchitect}
          className="bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] rounded-lg p-1.5 flex flex-col justify-center cursor-pointer transition-all group/bp"
          title="Open Plan Blueprints"
        >
          <div className="text-zinc-200 group-hover/bp:text-white font-semibold text-xs tabular-nums flex items-center justify-center gap-0.5">
            <span>{totalPlans}</span>
            <span className="text-[9px] text-zinc-500 group-hover/bp:text-zinc-300">→</span>
          </div>
          <div className="text-[9px] text-zinc-500 group-hover/bp:text-zinc-400 uppercase font-medium">Plans</div>
        </div>
      </div>
    </div>
  );
}
```

- **Done-check**: `npm --prefix dashboard run build` -> exit 0
- **Depends**: None

---

### Step 142.2 — Rebuild Engine & Dashboard Assets (`assets/engine.bin.js`)
- **File**: `assets/engine.bin.js`
- **Action**: EDIT
- **Content**: Rebuild global engine binary and Vite dashboard bundle. Run test suite.
- **Done-check**: `npm run build:engine && npm --prefix dashboard run build && npm test` -> exit 0
- **Depends**: 142.1

---

### Step 142.3 — Final Verification & Release Gate (`.agents/PROGRESS.md`)
- **File**: `.agents/PROGRESS.md`
- **Action**: EDIT
- **Content**: Run full release check (`npm run release:check`) and save checkpoint.
- **Done-check**: `npm run release:check` -> exit 0
- **Depends**: 142.2
