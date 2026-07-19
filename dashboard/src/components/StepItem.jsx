import React, { useState } from 'react';
import { CheckCircle2, Circle, Loader2, AlertTriangle, FileCode2, Play, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './ToastProvider';
import * as api from '../utils/api';

export default function StepItem({ step, index, projectId, hasPlanFiles, onRefresh }) {
  const { showToast } = useToast();
  const [executing, setExecuting] = useState(false);
  let Icon = Circle;
  let color = 'text-slate-500';
  let bg = 'bg-white/[0.02] hover:bg-white/[0.05]';
  let border = 'border-white/[0.05]';

  if (step.status === 'done') {
    Icon = CheckCircle2;
    color = 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]';
    bg = 'bg-emerald-500/10 hover:bg-emerald-500/20';
    border = 'border-emerald-500/20 hover:border-emerald-500/40';
  } else if (step.status === 'running') {
    Icon = Loader2;
    color = 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]';
    bg = 'bg-purple-500/10 hover:bg-purple-500/20';
    border = 'border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]';
  } else if (step.status === 'blocked') {
    Icon = AlertTriangle;
    color = 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]';
    bg = 'bg-amber-500/10 hover:bg-amber-500/20';
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
      transition={{ delay: index * 0.05, type: "spring" }}
      whileHover={{ scale: 1.01, x: 5 }}
      className={`p-4 rounded-xl border ${border} ${bg} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 group`}
    >
      <div className="flex items-start gap-4 w-full sm:w-auto">
        <div className="mt-0.5 shrink-0">
          <motion.div
            animate={step.status === 'running' || executing ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Icon className={`w-6 h-6 ${color}`} />
          </motion.div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className={`text-sm font-black tracking-wider shrink-0 ${step.status === 'done' ? 'text-slate-500' : 'text-slate-300'}`}>
              STEP {step.number}
            </span>
            <div className={`w-1 h-1 rounded-full shrink-0 ${step.status === 'done' ? 'bg-slate-700' : 'bg-slate-500'}`}></div>
            <span className={`text-sm sm:text-base font-medium break-all ${step.status === 'done' ? 'text-slate-400 line-through decoration-slate-600' : 'text-white transition-colors'}`}>
              {cleanTitle}
            </span>
          </div>
          {filePath && (
            <div className="mt-2 flex items-center">
              <span className="flex items-center gap-1.5 text-xs font-mono bg-black/40 text-slate-300 px-3 py-1 rounded-lg border border-white/[0.05] shadow-inner break-all">
                <FileCode2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">{filePath}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-2 self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
        {step.status !== 'running' && step.status !== 'done' && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={executing || hasPlanFiles === false}
            onClick={() => handleCommand('start')}
            className={`p-2 rounded-lg transition-colors border flex items-center justify-center ${hasPlanFiles === false ? 'bg-white/[0.02] text-slate-500 border-white/[0.05] cursor-not-allowed' : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-white border-purple-500/30'}`}
            title={hasPlanFiles === false ? "Generate a plan using the ai-checkpoint CLI first" : "Start Step"}
          >
            <Play className="w-4 h-4" />
          </motion.button>
        )}
        {step.status === 'running' && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={executing || hasPlanFiles === false}
            onClick={() => handleCommand('complete')}
            className={`p-2 rounded-lg transition-colors border flex items-center justify-center ${hasPlanFiles === false ? 'bg-white/[0.02] text-slate-500 border-white/[0.05] cursor-not-allowed' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white border-emerald-500/30'}`}
            title={hasPlanFiles === false ? "Generate a plan using the ai-checkpoint CLI first" : "Complete Step"}
          >
            <Check className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
