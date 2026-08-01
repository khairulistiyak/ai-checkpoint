import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StepItem from './StepItem';

export default function PhaseView({ phase, isActive, index, projectId, hasPlanFiles, onRefresh }) {
  const [expanded, setExpanded] = useState(isActive || phase.percentage < 100);
  const isDone = phase.percentage === 100;

  const getPhaseActivityStr = () => {
    if (!phase.steps || phase.steps.length === 0) return '';
    const dates = phase.steps
      .map(s => s.completedAt ? new Date(s.completedAt).getTime() : 0)
      .filter(t => t > 0);
    if (dates.length === 0) return '';
    const maxDate = new Date(Math.max(...dates));
    const formatted = maxDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (isDone) {
      return `Completed: ${formatted}`;
    } else {
      return `Last activity: ${formatted}`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 300, damping: 20 }}
      className={`bg-cyber-dark border rounded-xl mb-4 relative z-10 overflow-hidden ${isActive ? 'border-cyber-accent' : 'border-cyber-card-border hover:border-cyber-card-border/80 transition-colors'}`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-cyber-card-border/10 transition-colors focus:outline-none group relative z-10"
      >
        <div className="flex items-center gap-4 sm:gap-5 flex-1 min-w-0 pr-4">
          <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border transition-all duration-300 ${isDone
              ? 'bg-cyber-accent/20 border-cyber-accent/30 text-cyber-text-primary'
              : isActive
                ? 'bg-cyber-accent text-cyber-dark border-cyber-accent'
                : 'bg-transparent border-cyber-card-border text-cyber-text-muted group-hover:border-cyber-text-muted'
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
            <h3 className={`text-base font-semibold tracking-tight transition-colors break-words whitespace-normal ${isActive ? 'text-cyber-text-primary' : 'text-cyber-text-secondary group-hover:text-cyber-text-primary'}`}>
              Phase {phase.number}: {phase.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <p className="text-sm text-cyber-text-secondary">{phase.statusText}</p>
              {getPhaseActivityStr() && (
                <>
                  <span className="w-1 h-1 rounded-full bg-cyber-card-border"></span>
                  <p className="text-xs text-cyber-text-secondary font-mono bg-cyber-dark px-2 py-0.5 rounded border border-cyber-card-border">
                    {getPhaseActivityStr()}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex flex-col items-end gap-1.5">
              <span className={`text-xs font-bold font-mono ${isDone ? 'text-cyber-text-primary' : isActive ? 'text-cyber-text-primary' : 'text-cyber-text-muted'}`}>
                {phase.percentage}%
              </span>
              <div className="w-32 h-1 bg-cyber-card-border/50 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${isDone ? 'bg-cyber-accent' : isActive ? 'bg-cyber-accent/80' : 'bg-cyber-card-border'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${phase.percentage}%` }}
                  transition={{ duration: 1, type: "spring" }}
                />
              </div>
            </div>
          </div>
          <motion.div 
            animate={{ rotate: expanded ? 180 : 0 }}
            className="w-8 h-8 rounded-full bg-cyber-card-border/30 flex items-center justify-center border border-cyber-card-border group-hover:bg-cyber-card-border/50 transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-cyber-text-secondary" />
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
            className="border-t border-cyber-card-border bg-cyber-dark overflow-hidden"
          >
            <div className="p-6 space-y-3">
              {phase.steps.length === 0 ? (
                <div className="text-center p-6 text-cyber-text-muted text-sm bg-cyber-card/30 rounded-xl border border-cyber-card-border border-dashed">
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
