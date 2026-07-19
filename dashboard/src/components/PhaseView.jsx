import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StepItem from './StepItem';

export default function PhaseView({ phase, isActive, index, projectId, onRefresh }) {
  const [expanded, setExpanded] = useState(isActive || phase.percentage < 100);
  const isDone = phase.percentage === 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`glass-card mb-4 relative z-10 ${isActive ? 'border-accent-500/50 shadow-[0_0_20px_rgba(217,70,239,0.15)]' : ''}`}
    >
      <button 
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors focus:outline-none group"
      >
        <div className="flex items-center gap-5">
          <div className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 shadow-lg transition-colors ${
            isDone 
              ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
              : isActive 
                ? 'bg-accent-500/10 border-accent-500 text-accent-400 shadow-[0_0_20px_rgba(217,70,239,0.3)] scale-110' 
                : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-slate-500'
          }`}>
            {isActive && (
              <span className="absolute inset-0 rounded-full bg-accent-500/20 animate-ping"></span>
            )}
            {isDone ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : isActive ? (
              <Zap className="w-6 h-6" />
            ) : (
              <span className="text-lg font-black">{phase.number}</span>
            )}
          </div>
          <div className="text-left">
            <h3 className={`text-lg font-bold tracking-tight transition-colors ${
              isActive ? 'text-accent-400 text-glow' : 'text-slate-200 group-hover:text-white'
            }`}>
              Phase {phase.number}: {phase.name}
            </h3>
            <p className="text-sm text-slate-400 mt-1 font-medium">{phase.statusText}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <span className={`text-sm font-black font-mono ${isDone ? 'text-emerald-400' : isActive ? 'text-accent-400' : 'text-slate-500'}`}>
                {phase.percentage}%
              </span>
              <div className="w-40 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-700/50">
                <motion.div 
                  className={`h-full ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-500 to-accent-500'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${phase.percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/50 group-hover:bg-slate-700 transition-colors">
            {expanded ? <ChevronDown className="w-5 h-5 text-slate-300" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-700/50 bg-black/20 backdrop-blur-sm"
          >
            <div className="p-6 space-y-3">
              {phase.steps.length === 0 ? (
                <div className="text-center p-6 text-slate-500 text-sm font-medium italic bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">
                  No steps recorded in this phase yet.
                </div>
              ) : (
                phase.steps.map((step, idx) => (
                  <StepItem 
                    key={step.number} 
                    step={step} 
                    index={idx} 
                    projectId={projectId} 
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
