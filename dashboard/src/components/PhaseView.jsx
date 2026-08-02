import React, { useState } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StepItem from './StepItem';

export default function PhaseView({ phase, isActive, index, projectId, hasPlanFiles, onRefresh }) {
  const [expanded, setExpanded] = useState(isActive || phase.percentage < 100);
  const isDone = phase.percentage === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className={`bg-black/25 border rounded-2xl mb-4 overflow-hidden transition-all ${
        isActive 
          ? 'border-cyan-500/30 bg-cyan-950/10' 
          : 'border-white/5 hover:border-white/10'
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors focus:outline-none group"
      >
        <div className="flex items-center gap-4 min-w-0 flex-1 pr-4 text-left">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 border ${
            isDone 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : isActive 
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' 
                : 'bg-white/5 text-white/40 border-white/5'
          }`}>
            {isDone ? '✓' : phase.number}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-white/90 tracking-tight truncate group-hover:text-white transition-colors">
              {phase.name}
            </h3>
            <p className="mt-0.5 text-xs text-white/40 font-mono">
              {phase.statusText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
            isDone 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : isActive 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' 
                : 'bg-white/5 text-white/40 border-white/5'
          }`}>
            {phase.percentage}%
          </span>

          <motion.div 
            animate={{ rotate: expanded ? 180 : 0 }}
            className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-white/10 transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-white/40" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-4 sm:p-5 space-y-2">
              {phase.steps.length === 0 ? (
                <div className="text-center p-6 text-white/30 text-xs font-mono bg-white/[0.01] rounded-xl border border-white/5">
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
