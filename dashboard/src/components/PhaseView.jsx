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

export default function PhaseView({ phase, isActive, index, projectId, projectPath, hasPlanFiles, planFiles = [], onOpenArchitect, onRefresh }) {
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
        className="p-2 sm:p-2.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors gap-2"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <ChevronDown
            className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 shrink-0 ${
              expanded ? '' : '-rotate-90'
            }`}
          />
          <span className="font-mono text-[10px] text-white/50 bg-white/[0.05] px-1.5 py-0.2 rounded border border-white/5 shrink-0">
            Phase {phase.number}
          </span>
          <span className="text-xs font-semibold text-white/90 truncate tracking-tight">
            {phase.name}
          </span>
          {matchingFile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenArchitect) onOpenArchitect(matchingFile.name);
              }}
              className="hidden lg:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/15 transition-all shrink-0 cursor-pointer shadow-sm"
              title={`View Blueprint & Architect Diagram for Phase ${phase.number} (${matchingFile.name})`}
            >
              <Layers className="w-2.5 h-2.5 text-zinc-400" />
              <span>Blueprint</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="w-16 sm:w-24 bg-white/5 rounded-full h-1 overflow-hidden border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isDone ? 'bg-white/80' : 'bg-white/40'
              }`}
              style={{ width: `${phase.percentage}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-white/60 w-8 text-right font-medium">
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
