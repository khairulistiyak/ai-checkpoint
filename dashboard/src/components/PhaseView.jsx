import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StepItem from './StepItem';

export default function PhaseView({ phase, isActive, index, projectId, hasPlanFiles, onRefresh }) {
  const [expanded, setExpanded] = useState(isActive || phase.percentage < 100);
  const isDone = phase.percentage === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-[#0A0A0A] border rounded-xl mb-4 relative z-10 overflow-hidden ${isActive ? 'border-white/[0.2]' : 'border-white/[0.08] hover:border-white/[0.1] transition-colors'}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors focus:outline-none group relative z-10"
      >
        <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0 pr-4">
          <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${isDone
              ? 'bg-white/10 border-white/20 text-white'
              : isActive
                ? 'bg-white text-black border-white'
                : 'bg-transparent border-white/[0.1] text-slate-500 group-hover:border-slate-500'
            }`}>
            {isDone ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isActive ? (
              <Zap className="w-5 h-5" />
            ) : (
              <span className="text-sm font-bold">{phase.number}</span>
            )}
          </div>
          <div className="text-left flex-1 min-w-0">
            <h3 className={`text-base font-semibold tracking-tight transition-colors break-words whitespace-normal ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
              Phase {phase.number}: {phase.name}
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">{phase.statusText}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex flex-col items-end gap-1.5">
              <span className={`text-xs font-bold font-mono ${isDone ? 'text-white' : isActive ? 'text-white' : 'text-slate-500'}`}>
                {phase.percentage}%
              </span>
              <div className="w-32 h-1 bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${isDone ? 'bg-white' : isActive ? 'bg-slate-300' : 'bg-slate-600'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${phase.percentage}%` }}
                  transition={{ duration: 1, type: "spring" }}
                />
              </div>
            </div>
          </div>
          <motion.div 
            animate={{ rotate: expanded ? 180 : 0 }}
            className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.05] group-hover:bg-white/[0.1] transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-slate-300" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="border-t border-white/[0.05] bg-[#0A0A0A] overflow-hidden"
          >
            <div className="p-6 space-y-3">
              {phase.steps.length === 0 ? (
                <div className="text-center p-6 text-slate-500 text-sm bg-white/[0.02] rounded-xl border border-white/[0.05] border-dashed">
                  No steps recorded in this phase yet.
                </div>
              ) : (
                <motion.div 
                  variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {phase.steps.map((step, idx) => (
                    <StepItem 
                      key={step.id || idx} 
                      step={step} 
                      projectId={projectId} 
                      hasPlanFiles={hasPlanFiles} 
                      onRefresh={onRefresh} 
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
