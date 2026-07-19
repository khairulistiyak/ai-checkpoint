import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Zap } from 'lucide-react';
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
      className={`bg-[#0a0f1c]/70 backdrop-blur-xl border border-white/[0.05] rounded-xl mb-4 relative z-10 overflow-hidden ${isActive ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'hover:border-white/[0.1] hover:shadow-lg transition-colors'}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors focus:outline-none group relative z-10"
      >
        <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0 pr-4">
          <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${isDone
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
              : isActive
                ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.3)] scale-110'
                : 'bg-white/[0.02] border-white/[0.1] text-slate-500 group-hover:border-slate-500'
            }`}>
            {isActive && (
              <motion.span 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-purple-500/30"
              ></motion.span>
            )}
            {isDone ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <CheckCircle2 className="w-6 h-6" />
              </motion.div>
            ) : isActive ? (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
              >
                <Zap className="w-6 h-6 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
              </motion.div>
            ) : (
              <span className="text-lg font-black">{phase.number}</span>
            )}
          </div>
          <div className="text-left flex-1 min-w-0">
            <h3 className={`text-lg font-bold tracking-tight transition-colors break-words whitespace-normal ${isActive ? 'text-purple-400 text-glow' : 'text-slate-200 group-hover:text-white'
              }`}>
              Phase {phase.number}: {phase.name}
            </h3>
            <p className="text-sm text-slate-400 mt-1 font-medium">{phase.statusText}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <span className={`text-sm font-black font-mono ${isDone ? 'text-emerald-400' : isActive ? 'text-purple-400' : 'text-slate-500'}`}>
                {phase.percentage}%
              </span>
              <div className="w-40 h-2 bg-black/40 rounded-full overflow-hidden border border-white/[0.05] shadow-inner">
                <motion.div
                  className={`h-full ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${phase.percentage}%` }}
                  transition={{ duration: 1, type: "spring" }}
                />
              </div>
            </div>
          </div>
          <motion.div 
            animate={{ rotate: expanded ? 180 : 0 }}
            className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center border border-white/[0.05] group-hover:bg-white/[0.1] transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-slate-300" />
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
            className="border-t border-white/[0.05] bg-black/20 backdrop-blur-sm overflow-hidden"
          >
            <div className="p-6 space-y-3">
              {phase.steps.length === 0 ? (
                <div className="text-center p-6 text-slate-500 text-sm font-medium italic bg-white/[0.02] rounded-xl border border-white/[0.05] border-dashed">
                  No steps recorded in this phase yet.
                </div>
              ) : (
                <motion.div 
                  variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                  initial="hidden" animate="show"
                >
                  {phase.steps.map((step, idx) => (
                    <StepItem
                      key={step.number}
                      step={step}
                      index={idx}
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
