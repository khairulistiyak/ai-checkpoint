import React from 'react';
import { motion } from 'framer-motion';
import { StatusBadge } from '../ui/StatusBadge';
import { CheckCircle2, Circle, PlayCircle, AlertCircle } from 'lucide-react';

export const LedgerTaskCard = ({ 
  stepId, 
  title, 
  description, 
  status = 'pending', 
  fileTarget 
}) => {
  const isDone = status === 'done' || status === 'success';
  const isRunning = status === 'running' || status === 'active';
  const isBlocked = status === 'blocked' || status === 'error';

  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className={`p-3 rounded-xl border transition-all duration-300 ${
        isDone ? 'bg-emerald-500/5 border-emerald-500/10' :
        isRunning ? 'bg-primary-500/5 border-primary-500/20 shadow-[inset_0_0_15px_rgba(99,102,241,0.05)]' :
        isBlocked ? 'bg-red-500/5 border-red-500/10' :
        'bg-white/[0.02] border-white/[0.05]'
      } flex flex-col gap-2`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5">
            {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> :
             isRunning ? <PlayCircle className="w-4 h-4 text-primary-400 animate-pulse" /> :
             isBlocked ? <AlertCircle className="w-4 h-4 text-red-400" /> :
             <Circle className="w-4 h-4 text-slate-600" />}
          </div>
          <div className="flex flex-col">
            <h4 className={`text-sm font-medium ${isDone ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
              <span className="font-bold text-accent-400 mr-1.5">Step {stepId}</span> 
              {title}
            </h4>
            {description && <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        <StatusBadge status={status} />
      </div>
      
      {fileTarget && (
        <div className="ml-6 flex items-center gap-1.5 mt-1">
          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Target File:</span>
          <code className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded text-primary-300 font-mono border border-white/5">
            {fileTarget}
          </code>
        </div>
      )}
    </motion.div>
  );
};
