import React, { useState } from 'react';
import { ChevronDown, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StepItem from './StepItem';

function findPlanFileForPhase(phase, planFiles = []) {
  if (!phase || !planFiles.length) return null;
  const byNumber = planFiles.find((f) => {
    const match = f.name.match(/(?:^|[-_])(?:phase)?[-_]?(\d+)(?:[-_.]|$)/i);
    return match && parseInt(match[1], 10) === phase.number;
  });
  if (byNumber) return byNumber;

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
  phase,
  isActive,
  index = 0,
  projectId,
  projectPath,
  hasPlanFiles,
  planFiles = [],
  onOpenArchitect,
  onRefresh
}) {
  const [expanded, setExpanded] = useState(isActive || phase.percentage < 100);
  const isDone = phase.percentage === 100;
  const matchingFile = findPlanFileForPhase(phase, planFiles);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.15 }}
      className={`bg-[#0e0e11]/80 backdrop-blur-md border rounded-2xl mb-2.5 overflow-hidden transition-all shadow-sm ${
        isActive
          ? 'border-amber-500/30 bg-[#0e0e11]/90 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
          : 'border-white/[0.06] hover:border-white/[0.12]'
      }`}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-2.5 sm:px-3.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors gap-2"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 shrink-0 ${
              expanded ? '' : '-rotate-90'
            }`}
          />
          <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06] shrink-0">
            Phase {phase.number}
          </span>
          <span className="text-xs font-semibold text-zinc-100 truncate tracking-tight font-outfit">
            {phase.name || phase.title}
          </span>
          {matchingFile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenArchitect) onOpenArchitect(matchingFile.name);
              }}
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
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isDone ? 'bg-emerald-400' : 'bg-zinc-300'
              }`}
              style={{ width: `${phase.percentage}%` }}
            />
          </div>
          <span className={`text-[10px] font-mono w-9 text-right font-medium tabular-nums ${isDone ? 'text-emerald-400' : 'text-zinc-400'}`}>
            {phase.percentage}%
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="border-t border-white/[0.06] bg-black/30"
          >
            <div className="p-2 sm:p-2.5 space-y-1.5">
              {!phase.steps || phase.steps.length === 0 ? (
                <div className="text-center py-3 text-zinc-500 text-xs font-mono bg-white/[0.01] rounded-xl border border-white/[0.04]">
                  No steps recorded in this phase yet.
                </div>
              ) : (
                phase.steps.map((step, idx) => (
                  <StepItem
                    key={step.id || step.number || idx}
                    step={step}
                    index={idx}
                    projectId={projectId}
                    projectPath={projectPath}
                    hasPlanFiles={hasPlanFiles}
                    matchingFile={matchingFile}
                    onOpenArchitect={onOpenArchitect}
                    onRefresh={onRefresh}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
