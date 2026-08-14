# Phase 65: Pro-Tier Clean UI/UX Studio Overhaul

> ড্যাশবোর্ডকে Linear, Raycast ও Vercel-এর মতো আল্ট্রা-ক্লিন, আধুনিক ও প্রো-লেভেল লুক দেওয়ার জন্য কমপ্যাক্ট হায়ারার্কি, লিনিয়ার-স্টাইল মাইক্রো-ফিল্টার এবং স্মার্ট অটো-মিনিমাইজিং অ্যাকশন ডক তৈরি করা।
> (AI Tier: Small — Granular, step-by-step instructions with full code blocks)

---

## Phase 65: Pro-Tier Clean UI/UX Studio Overhaul

### Step 65.1 — Polish CockpitTab Executive Pulse (`dashboard/src/components/CockpitTab.jsx`)
- **File:** `dashboard/src/components/CockpitTab.jsx`
- **Action:** MODIFY
- **Depends:** None

**কী করতে হবে:**
KPI মেট্রিক কার্ডগুলোকে কমপ্যাক্ট, শার্প এবং সুন্দর ভিজ্যুয়াল রিদমে আপডেট করো।

```jsx
import React from 'react';
import { Rocket, Target, Activity, Layers, FileText } from 'lucide-react';
import GitVisualizer from './GitVisualizer';
import ActivityLog from './ActivityLog';
import CockpitHealthOverview from './cockpit/CockpitHealthOverview';

export default function CockpitTab({
  selectedProject,
  overall,
  allPhases,
  activePhases,
  remaining,
  planStats,
  totalPlanSteps,
  handleOpenArchitect,
  refresh,
  liveActivityEntry,
  onSelectTab
}) {
  const unsyncedSteps = selectedProject?.unsyncedSteps || 0;
  return (
    <div className="flex flex-col gap-3">
      {/* Top 4 Compact Executive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="bg-[#121214]/90 border border-white/[0.08] hover:border-white/15 rounded-2xl p-3.5 flex flex-col justify-between gap-1.5 shadow-sm transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="font-medium">Completion</span>
            <div className="w-6 h-6 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-sky-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-outfit text-white tracking-tight">{overall.percentage}%</div>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-sky-400 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${overall.percentage}%` }} />
          </div>
        </div>

        <div className="bg-[#121214]/90 border border-white/[0.08] hover:border-white/15 rounded-2xl p-3.5 flex flex-col justify-between gap-1.5 shadow-sm transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="font-medium">Steps Done</span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-outfit text-white tracking-tight">
            {overall.completed} <span className="text-xs font-mono text-zinc-500 font-normal">/ {overall.total}</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500 truncate">{remaining} steps remaining</div>
        </div>

        <div className="bg-[#121214]/90 border border-white/[0.08] hover:border-white/15 rounded-2xl p-3.5 flex flex-col justify-between gap-1.5 shadow-sm transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span className="font-medium">Phases</span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-outfit text-white tracking-tight">
            {allPhases.length} <span className="text-xs font-mono text-zinc-500 font-normal">Phases</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500 truncate">
            {activePhases} active • {allPhases.filter(p => p.percentage === 100).length} done
          </div>
        </div>

        <div
          onClick={() => onSelectTab ? onSelectTab('files') : handleOpenArchitect()}
          className="bg-[#121214]/90 border border-white/[0.08] hover:border-sky-500/30 hover:bg-sky-500/5 rounded-2xl p-3.5 flex flex-col justify-between gap-1.5 shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-zinc-400 group-hover:text-white text-xs font-mono">
            <span className="flex items-center gap-1.5 font-bold">
              <span>Blueprints</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono">CAD</span>
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
          <div className="text-xl font-bold font-outfit text-white tracking-tight">
            {planStats?.files?.length || 0} <span className="text-xs font-mono text-zinc-500 font-normal">Files</span>
          </div>
          <div className="text-[11px] font-mono text-zinc-500 group-hover:text-zinc-300 truncate">
            {totalPlanSteps} planned steps • Open →
          </div>
        </div>
      </div>

      {unsyncedSteps > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex items-center gap-3">
          <span className="text-amber-400 text-sm">⚠</span>
          <div>
            <span className="text-xs font-bold text-amber-300 font-outfit">
              {unsyncedSteps} plan step{unsyncedSteps > 1 ? 's' : ''} not synced to Roadmap & Steps
            </span>
            <p className="text-[11px] text-amber-400/70 font-mono mt-0.5">
              Run <code className="bg-black/40 px-1.5 py-0.5 rounded text-amber-300">./l sync</code> or save plan to update execution ledger
            </p>
          </div>
        </div>
      )}

      {/* Embedded Live Health & Quality Fortress */}
      <CockpitHealthOverview projectId={selectedProject.id} />

      {/* Git Snapshots & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-stretch">
        <div className="bg-[#121214]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-3.5 sm:p-4 flex flex-col shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-white/[0.08] shrink-0">
            <h2 className="text-xs font-bold text-white flex items-center gap-2 font-outfit uppercase tracking-wider">
              <Rocket className="w-3.5 h-3.5 text-sky-400" />
              <span>Git Snapshots & Checkpoints</span>
            </h2>
            <span className="text-[10px] font-mono text-zinc-500">Live Rollback Tree</span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <GitVisualizer projectId={selectedProject.id} onRefresh={refresh} />
          </div>
        </div>

        <div className="flex flex-col min-h-[400px]">
          <ActivityLog projectId={selectedProject.id} liveEntry={liveActivityEntry} />
        </div>
      </div>
    </div>
  );
}
```

- **Done-check:** `test -f dashboard/src/components/CockpitTab.jsx`

---

### Step 65.2 — Upgrade Roadmap with Linear-Style Micro-Filter Pills (`dashboard/src/components/plans/PlanProgressTab.jsx`)
- **File:** `dashboard/src/components/plans/PlanProgressTab.jsx`
- **Action:** MODIFY
- **Depends:** Step 65.1

**কী করতে হবে:**
রোডম্যাপ ফিল্টার টুলবারকে Linear-স্টাইল মাইক্রো-ফিল্টারে রূপান্তর করো যেখানে প্রতিটি ফিল্টারে লাইভ কাউন্টার থাকবে।

```jsx
import React, { useState, useMemo } from 'react';
import { Search, Layers, Activity } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PhaseView from '../PhaseView';
import FilePreviewDrawer from './FilePreviewDrawer';

export default function PlanProgressTab({
  project,
  allPhases,
  filteredPhases,
  statusFilter,
  setStatusFilter,
  searchQuery,
  setSearchQuery,
  selectedPhaseNumber,
  setSelectedPhaseNumber,
  onRefresh
}) {
  const [selectedPlanFile, setSelectedPlanFile] = useState(null);

  const counts = useMemo(() => {
    let total = 0, done = 0, active = 0, pending = 0;
    for (const p of allPhases) {
      for (const s of (p.steps || [])) {
        total++;
        if (s.status === 'completed' || s.status === 'done') done++;
        else if (s.status === 'running' || s.status === 'in_progress') active++;
        else pending++;
      }
    }
    return { total, done, active, pending };
  }, [allPhases]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#09090b] relative overflow-hidden">
      <div className="p-3.5 sm:px-5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3 bg-black/20 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search steps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 w-44 sm:w-52 font-mono transition-all"
            />
          </div>

          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1">
            {[
              { id: 'all', label: 'All', count: counts.total },
              { id: 'done', label: 'Done', count: counts.done, color: 'text-emerald-400' },
              { id: 'in_progress', label: 'Active', count: counts.active, color: 'text-amber-400' },
              { id: 'pending', label: 'Pending', count: counts.pending, color: 'text-zinc-400' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setStatusFilter(item.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                  statusFilter === item.id
                    ? 'bg-white/15 text-white border border-white/25 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
                <span className={`text-[10px] font-mono px-1 rounded bg-black/30 ${item.color || 'text-zinc-400'}`}>
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-zinc-400">Phase:</span>
          <select
            value={selectedPhaseNumber}
            onChange={(e) => setSelectedPhaseNumber(e.target.value)}
            className="bg-white/[0.04] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-white/20 cursor-pointer"
          >
            <option value="all" className="bg-[#121214]">All Phases ({allPhases.length})</option>
            {allPhases.map((phase) => (
              <option key={phase.number} value={phase.number} className="bg-[#121214]">
                Phase {phase.number}: {phase.name || phase.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-4">
        {filteredPhases.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
            <Activity className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white mb-1 font-outfit">No Matching Steps</h3>
            <p className="text-xs text-zinc-500 max-w-xs mx-auto font-mono">
              Adjust your status filter or search term to view execution steps.
            </p>
          </div>
        ) : (
          filteredPhases.map((phase) => (
            <PhaseView
              key={phase.number}
              phase={phase}
              projectId={project?.id}
              projectPath={project?.path}
              planFiles={project?.planStats?.files || []}
              onOpenArchitect={(filename) => setSelectedPlanFile(filename)}
              onRefresh={onRefresh}
            />
          ))
        )}
      </div>

      <AnimatePresence>
        {selectedPlanFile && (
          <FilePreviewDrawer
            projectId={project?.id}
            filename={selectedPlanFile}
            allFiles={project?.planStats?.files || []}
            onSelectFile={(f) => setSelectedPlanFile(f)}
            onClose={() => setSelectedPlanFile(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
```

- **Done-check:** `test -f dashboard/src/components/plans/PlanProgressTab.jsx`

---

### Step 65.3 — Smart Auto-Minimizing Developer Action Dock (`dashboard/src/components/DeveloperActionDock.jsx`)
- **File:** `dashboard/src/components/DeveloperActionDock.jsx`
- **Action:** MODIFY
- **Depends:** Step 65.1

**কী করতে হবে:**
প্রজেক্ট ১০০% কমপ্লিট থাকলে বটম ডকটি স্বয়ংক্রিয়ভাবে একটি স্লিম মিনিমাইজড পিল আকারে থাকবে যাতে নিচের কোনো কন্টেন্ট ব্লক না হয়।

```jsx
import React, { useEffect } from 'react';
import { FileCode, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ToastProvider';
import ActionDockButtons from './dock/ActionDockButtons';
import { useDeveloperDock } from './dock/useDeveloperDock';

export default function DeveloperActionDock({
  project,
  nextStep,
  runningStep,
  onRefresh,
  onToggleTerminal,
  isTerminalOpen
}) {
  const { showToast } = useToast();
  const {
    executing,
    copiedPrompt,
    copiedCli,
    isMinimized,
    setIsMinimized,
    isAllComplete,
    isRunning,
    stepNumber,
    cleanTitle,
    filePath,
    handleExecute,
    handleCopyAiPrompt,
    handleCopyCliCommand,
    handleOpenIde,
    handleQuickHealth
  } = useDeveloperDock({ project, nextStep, runningStep, onRefresh, showToast });

  useEffect(() => {
    if (isAllComplete) setIsMinimized(true);
  }, [isAllComplete, setIsMinimized]);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[94%] sm:w-auto min-w-[300px] transition-all duration-300 pointer-events-auto select-none">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0c0d14]/95 backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/80 cursor-pointer hover:border-white/20 transition-all group mx-auto"
            onClick={() => setIsMinimized(false)}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAllComplete ? 'bg-emerald-400' : isRunning ? 'bg-amber-400' : 'bg-sky-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isAllComplete ? 'bg-emerald-500' : isRunning ? 'bg-amber-500' : 'bg-sky-500'}`}></span>
            </span>
            <span className="text-xs font-mono font-bold text-zinc-200">{isAllComplete ? '100% Done' : `#${stepNumber}`}</span>
            <span className="text-xs text-zinc-400 max-w-[180px] sm:max-w-[220px] truncate font-medium">{isAllComplete ? 'System Verified' : cleanTitle}</span>
            <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors" title="Expand Action Deck"><Maximize2 size={11} /></button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="relative rounded-2xl p-[1px] bg-gradient-to-r from-sky-500/25 via-purple-500/25 to-emerald-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
          >
            <div className="bg-[#0b0c12]/95 backdrop-blur-3xl rounded-[15px] p-2 sm:p-2.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 border border-white/[0.08]">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 px-1">
                <div className="relative flex items-center justify-center shrink-0">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAllComplete ? 'bg-emerald-400' : isRunning ? 'bg-amber-400' : 'bg-sky-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAllComplete ? 'bg-emerald-500' : isRunning ? 'bg-amber-500' : 'bg-sky-500'}`}></span>
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-extrabold uppercase tracking-widest ${isAllComplete ? 'text-emerald-400' : isRunning ? 'text-amber-400' : 'text-sky-400'}`}>
                      {isAllComplete ? 'All Complete' : isRunning ? 'Running' : 'Next Up'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-200 font-bold bg-white/[0.08] px-1.5 py-0.2 rounded-md border border-white/10">
                      {isAllComplete ? '100%' : `#${stepNumber}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-zinc-100 truncate max-w-[200px] sm:max-w-xs md:max-w-sm tracking-tight">
                      {isAllComplete ? 'System Fully Verified • Ready for Operations' : cleanTitle}
                    </span>
                    {!isAllComplete && filePath && (
                      <button onClick={handleOpenIde} className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-sky-300 bg-white/[0.04] hover:bg-sky-500/10 px-2 py-0.5 rounded-md border border-white/10 hover:border-sky-500/30 transition-all shrink-0 cursor-pointer group" title="Click to jump to file in IDE">
                        <FileCode className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 group-hover:text-sky-400" />
                        <span className="truncate max-w-[130px]">{filePath}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <ActionDockButtons
                isAllComplete={isAllComplete}
                executing={executing}
                onRefresh={onRefresh}
                handleQuickHealth={handleQuickHealth}
                handleCopyAiPrompt={handleCopyAiPrompt}
                copiedPrompt={copiedPrompt}
                handleCopyCliCommand={handleCopyCliCommand}
                copiedCli={copiedCli}
                filePath={filePath}
                handleOpenIde={handleOpenIde}
                onToggleTerminal={onToggleTerminal}
                isTerminalOpen={isTerminalOpen}
                handleExecute={handleExecute}
                isRunning={isRunning}
                stepNumber={stepNumber}
                setIsMinimized={setIsMinimized}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- **Done-check:** `test -f dashboard/src/components/DeveloperActionDock.jsx`

---

### Step 65.4 — Run full verification suite (`.agents/PROGRESS.md`)
- **File:** `.agents/PROGRESS.md`
- **Action:** VERIFY
- **Depends:** Step 65.1, Step 65.2, Step 65.3

**কী করতে হবে:**
```bash
./l v
./l health
./l quality
cd dashboard && npm run build
```

- **Done-check:** exit code 0 for all validation commands
