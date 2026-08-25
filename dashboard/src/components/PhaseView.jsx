import React, { useState } from 'react';
import { ChevronDown, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StepItem from './StepItem';

function findPlanFileForPhase(phase, planFiles = []) {
  if (!phase || !planFiles.length) return null;
  const byNum = planFiles.find((f) => {
    const m = f.name.match(/(?:^|[-_])(?:phase)?[-_]?(\d+)(?:[-_.]|$)/i);
    return m && parseInt(m[1], 10) === phase.number;
  });
  if (byNum) return byNum;
  if (phase.name) {
    const clean = phase.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (clean.length > 3) {
      const byName = planFiles.find((f) => f.name.toLowerCase().includes(clean));
      if (byName) return byName;
    }
  }
  return planFiles.find((f) => f.name.toLowerCase().includes('plan')) || planFiles[0] || null;
}

export default function PhaseView({
  phase, isActive, activeStep = null, index = 0, projectId, projectPath, hasPlanFiles, planFiles = [], onOpenArchitect, onRefresh
}) {
  const activeStepNum = activeStep?.step || activeStep?.number || activeStep?.id;
  const isDone = phase.percentage === 100;
  const hasRunningStep = phase.steps?.some((s) => s.isRunning || s.status === 'running' || s.status === 'in_progress' || (activeStepNum && String(s.number) === String(activeStepNum)));
  const isWorking = hasRunningStep || (isActive && !isDone);
  const isPartiallyDone = phase.percentage > 0 && !isDone && !hasRunningStep;
  const isPending = phase.percentage === 0 && !hasRunningStep && !isActive;

  const [expanded, setExpanded] = useState(isWorking || isActive || (!isDone && phase.percentage > 0));
  const matchingFile = findPlanFileForPhase(phase, planFiles);

  const cardStyle = isWorking
    ? 'border-amber-500/40 bg-[#0e0e11]/95 shadow-[0_0_20px_rgba(245,158,11,0.08)] ring-1 ring-amber-500/20'
    : isPartiallyDone ? 'border-sky-500/25 bg-[#0e0e11]/90 shadow-sm'
    : isDone ? 'border-white/[0.06] hover:border-white/[0.12]' : 'border-white/[0.04] hover:border-white/[0.08]';

  const barColor = isDone
    ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.3)]'
    : isWorking ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
    : isPartiallyDone ? 'bg-sky-400' : 'bg-zinc-700';

  const pctColor = isDone ? 'text-emerald-400 font-semibold' : isWorking ? 'text-amber-300 font-bold' : isPartiallyDone ? 'text-sky-300 font-semibold' : 'text-zinc-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.15 }}
      className={`bg-[#0e0e11]/80 backdrop-blur-md border rounded-2xl mb-2.5 overflow-hidden transition-all shadow-sm ${cardStyle}`}
    >
      <div onClick={() => setExpanded(!expanded)} className="p-2.5 sm:px-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 shrink-0 ${expanded ? '' : '-rotate-90'}`} />
          <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06] shrink-0">Phase {phase.number}</span>
          <span className="text-xs font-semibold text-zinc-100 truncate tracking-tight font-outfit">{phase.name || phase.title}</span>

          {isWorking && (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Working</span>
            </span>
          )}
          {isPartiallyDone && (
            <span className="inline-flex items-center text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-300 border border-sky-500/20 shrink-0">Active</span>
          )}
          {isDone && (
            <span className="inline-flex items-center text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">Complete</span>
          )}
          {isPending && (
            <span className="inline-flex items-center text-[9.5px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/[0.03] text-zinc-500 border border-white/[0.06] shrink-0">Pending</span>
          )}

          {matchingFile && (
            <button
              onClick={(e) => { e.stopPropagation(); if (onOpenArchitect) onOpenArchitect(matchingFile.name); }}
              className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] transition-all shrink-0 cursor-pointer shadow-sm"
              title={`View Blueprint for Phase ${phase.number} (${matchingFile.name})`}
            >
              <Layers className="w-2.5 h-2.5 text-zinc-400" />
              <span>Blueprint</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-16 sm:w-24 bg-white/[0.05] rounded-full h-1.5 overflow-hidden border border-white/[0.05]">
            <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${phase.percentage}%` }} />
          </div>
          <span className={`text-[10px] font-mono w-9 text-right font-medium tabular-nums ${pctColor}`}>{phase.percentage}%</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }} className="border-t border-white/[0.06] bg-black/30"
          >
            <div className="p-2 sm:p-2.5 space-y-1.5">
              {!phase.steps || phase.steps.length === 0 ? (
                <div className="text-center py-3 text-zinc-500 text-xs font-mono bg-white/[0.01] rounded-xl border border-white/[0.04]">
                  No steps recorded in this phase yet.
                </div>
              ) : (
                phase.steps.map((step, idx) => {
                  const isStepRunning = step.isRunning || step.status === 'running' || step.status === 'in_progress' || (activeStepNum && String(step.number) === String(activeStepNum));
                  return (
                    <StepItem
                      key={step.id || step.number || idx}
                      step={{ ...step, isRunning: isStepRunning }} index={idx} projectId={projectId} projectPath={projectPath}
                      hasPlanFiles={hasPlanFiles} matchingFile={matchingFile} onOpenArchitect={onOpenArchitect} onRefresh={onRefresh}
                    />
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
