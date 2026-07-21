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
  let bg = 'bg-[#0A0A0A] hover:bg-white/[0.02]';
  let border = 'border-white/[0.05]';

  if (step.status === 'done') {
    Icon = CheckCircle2;
    color = 'text-white';
    bg = 'bg-white/[0.05] hover:bg-white/[0.08]';
    border = 'border-white/[0.1]';
  } else if (step.status === 'running') {
    Icon = Loader2;
    color = 'text-white';
    bg = 'bg-white/[0.02] hover:bg-white/[0.05]';
    border = 'border-white/[0.2]';
  } else if (step.status === 'blocked') {
    Icon = AlertTriangle;
    color = 'text-slate-400';
    bg = 'bg-[#0A0A0A] hover:bg-white/[0.02]';
    border = 'border-white/[0.05] border-dashed';
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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, type: "spring" }}
      className={`p-4 rounded-xl border ${border} ${bg} flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 group`}
    >
      <div className="flex items-start gap-4 w-full sm:w-auto">
        <div className="mt-0.5 shrink-0">
          <motion.div
            animate={step.status === 'running' || executing ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <Icon className={`w-5 h-5 ${color}`} />
          </motion.div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className={`text-xs font-bold tracking-wider shrink-0 ${step.status === 'done' ? 'text-slate-500' : 'text-slate-400'}`}>
              STEP {step.number}
            </span>
            <div className={`w-1 h-1 rounded-full shrink-0 ${step.status === 'done' ? 'bg-slate-700' : 'bg-slate-500'}`}></div>
            <span className={`text-sm font-medium break-all ${step.status === 'done' ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-200'}`}>
              {cleanTitle}
            </span>
          </div>
          {filePath && (
            <div className="mt-2 flex items-center">
              <span className="flex items-center gap-1.5 text-xs font-mono bg-white/[0.03] text-slate-400 px-2 py-1 rounded-md border border-white/[0.05] break-all">
                <FileCode2 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{filePath}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex gap-2 self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
        {step.status !== 'running' && step.status !== 'done' && (
          <button
            disabled={executing || hasPlanFiles === false}
            onClick={() => handleCommand('start')}
            className={`p-2 rounded-lg transition-colors border flex items-center justify-center ${hasPlanFiles === false ? 'bg-white/[0.02] text-slate-500 border-white/[0.05] cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white hover:text-black border-white/20'}`}
            title={hasPlanFiles === false ? "Generate a plan using the ai-checkpoint CLI first" : "Start Step"}
          >
            <Play className="w-4 h-4" />
          </button>
        )}
        {step.status === 'running' && (
          <button
            disabled={executing}
            onClick={() => handleCommand('complete')}
            className="p-2 rounded-lg transition-colors border flex items-center justify-center bg-white/10 text-white hover:bg-white hover:text-black border-white/20"
            title="Mark as Complete"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
