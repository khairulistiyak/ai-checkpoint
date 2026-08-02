import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, Layers } from 'lucide-react';
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

export default function PhaseView({ phase, isActive, index, projectId, hasPlanFiles, planFiles = [], onOpenArchitect, onRefresh }) {
  const [expanded, setExpanded] = useState(isActive || phase.percentage < 100);
  const isDone = phase.percentage === 100;
  const matchingFile = findPlanFileForPhase(phase, planFiles);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className={`bg-black/25 border rounded-xl mb-2 overflow-hidden transition-all ${
        isActive 
          ? 'border-white/20 bg-white/[0.04]' 
          : 'border-white/5 hover:border-white/10'
      }`}
    >
      <div
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors cursor-pointer select-none group"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1 pr-3 text-left">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold shrink-0 border ${
            isDone 
              ? 'bg-white/10 text-white/70 border-white/20' 
              : isActive 
                ? 'bg-white/15 text-white border-white/30' 
                : 'bg-white/5 text-white/40 border-white/5'
          }`}>
            {isDone ? '✓' : phase.number}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-xs sm:text-sm font-semibold text-white/90 tracking-tight truncate group-hover:text-white transition-colors">
              {phase.name}
            </h3>
            <p className="text-[10px] text-white/40 font-mono">
              {phase.statusText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {matchingFile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenArchitect) onOpenArchitect(matchingFile.name);
              }}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/15 flex items-center gap-1 font-mono text-[10px] font-bold transition-all shrink-0 shadow-sm cursor-pointer"
              title={`Open Architect View (${matchingFile.name})`}
            >
              <Layers className="w-3 h-3 text-zinc-400" />
              <span>Architect</span>
            </button>
          )}

          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
            isDone 
              ? 'bg-white/10 text-white/70 border-white/20' 
              : isActive 
                ? 'bg-white/15 text-white border-white/30' 
                : 'bg-white/5 text-white/40 border-white/5'
          }`}>
            {phase.percentage}%
          </span>

          <motion.div 
            animate={{ rotate: expanded ? 180 : 0 }}
            className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors"
          >
            <ChevronDown className="w-3.5 h-3.5 text-white/40" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-2 sm:p-2.5 space-y-1.5">
              {phase.steps.length === 0 ? (
                <div className="text-center p-4 text-white/30 text-xs font-mono bg-white/[0.01] rounded-lg border border-white/5">
                  No steps recorded in this phase yet.
                </div>
              ) : (
                phase.steps.map((step, idx) => (
                  <StepItem 
                    key={step.id || idx} 
                    step={step}
                    index={idx} 
                    projectId={projectId} 
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
