import React, { useState } from 'react';
import { CheckCircle2, Circle, Loader2, AlertTriangle, FileCode2, Play, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './ToastProvider';
import * as api from '../utils/api';

export default function StepItem({ step, index, projectId, onRefresh }) {
  const { showToast } = useToast();
  const [executing, setExecuting] = useState(false);
  let Icon = Circle;
  let color = 'text-slate-500';
  let bg = 'bg-slate-900/50 hover:bg-slate-800/80';
  let border = 'border-slate-700/50';
  
  if (step.status === 'done') {
    Icon = CheckCircle2;
    color = 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    bg = 'bg-emerald-950/20 hover:bg-emerald-950/40';
    border = 'border-emerald-500/20';
  } else if (step.status === 'running') {
    Icon = Loader2;
    color = 'text-accent-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]';
    bg = 'bg-accent-950/20 hover:bg-accent-950/30';
    border = 'border-accent-500/40 shadow-[0_0_15px_rgba(217,70,239,0.1)]';
  } else if (step.status === 'blocked') {
    Icon = AlertTriangle;
    color = 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    bg = 'bg-amber-950/20 hover:bg-amber-950/40';
    border = 'border-amber-500/30';
  }

  const handleCommand = async (command) => {
    try {
      setExecuting(true);
      await api.executeCommand(projectId, command, step.number, command === 'complete' ? 'Completed from Dashboard' : '');
      if (onRefresh) await onRefresh();
      showToast(`Step ${command === 'start' ? 'started' : 'completed'} successfully`, 'success');
    } catch (err) {
      showToast(`Command failed: ${err.message}`, 'error');
    } finally {
      setExecuting(false);
    }
  };

  // Parse file path from title if present
  const fileMatch = step.title.match(/[`(]([^`)]+\.[a-zA-Z0-9]+)[`)]/);
  const filePath = fileMatch ? fileMatch[1] : null;
  const cleanTitle = fileMatch ? step.title.replace(fileMatch[0], '').trim() : step.title;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01, x: 5 }}
      className={`p-4 rounded-xl border ${border} ${bg} flex items-center justify-between gap-4 transition-all duration-300 group`}
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5">
          <Icon className={`w-6 h-6 ${color} ${(step.status === 'running' || executing) ? 'animate-spin' : ''}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-black tracking-wider ${step.status === 'done' ? 'text-slate-500' : 'text-slate-300'}`}>
              STEP {step.number}
            </span>
            <div className={`w-1 h-1 rounded-full ${step.status === 'done' ? 'bg-slate-700' : 'bg-slate-500'}`}></div>
            <span className={`text-base font-medium ${step.status === 'done' ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-100 group-hover:text-white transition-colors'}`}>
              {cleanTitle}
            </span>
          </div>
          {filePath && (
            <div className="mt-2 flex items-center">
              <span className="flex items-center gap-1.5 text-xs font-mono bg-black/40 text-slate-300 px-3 py-1 rounded-lg border border-slate-700/50 shadow-inner">
                <FileCode2 className="w-3.5 h-3.5 text-primary-400" />
                {filePath}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Interactive Controls */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        {step.status !== 'running' && step.status !== 'done' && (
          <button 
            disabled={executing}
            onClick={() => handleCommand('start')}
            className="p-2 bg-primary-500/20 text-primary-300 rounded-lg hover:bg-primary-500 hover:text-white transition-colors border border-primary-500/30"
            title="Start Step"
          >
            <Play className="w-4 h-4" />
          </button>
        )}
        {step.status === 'running' && (
          <button 
            disabled={executing}
            onClick={() => handleCommand('complete')}
            className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-500/30"
            title="Complete Step"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
