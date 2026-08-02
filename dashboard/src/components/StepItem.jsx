import React, { useState } from 'react';
import { CheckCircle2, Circle, Loader2, AlertTriangle, FileCode2, Play, Check, Layers } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './ToastProvider';
import * as api from '../utils/api';

export default function StepItem({ step, index, projectId, hasPlanFiles, matchingFile, onOpenArchitect, onRefresh }) {
  const { showToast } = useToast();
  const [executing, setExecuting] = useState(false);

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

  const fileMatch = step.title.match(/[`(]([^`)]+\.[a-zA-Z0-9]+)[`)]/);
  const filePath = fileMatch ? fileMatch[1] : null;
  const cleanTitle = fileMatch ? step.title.replace(fileMatch[0], '').trim() : step.title;

  const formatCompletedAt = (d) => {
    if (!d) return '';
    try {
      const [y, m, day, h, min] = d.split(/[ -:]/).map(Number);
      return new Date(y, (m || 1) - 1, day || 1, h || 0, min || 0).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    } catch { return d; }
  };

  const isDone = step.status === 'done';
  const isRunning = step.status === 'running';
  const isBlocked = step.status === 'blocked';

  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.015, duration: 0.15 }}
      className={`py-1.5 px-3 rounded-lg transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border ${
        isRunning ? 'bg-white/[0.08] border-white/20' : isDone ? 'bg-white/[0.02] border-transparent hover:bg-white/[0.04]' : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="shrink-0">
          {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-white/70" /> : isRunning || executing ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : isBlocked ? <AlertTriangle className="w-3.5 h-3.5 text-zinc-400" /> : <Circle className="w-3.5 h-3.5 text-white/20" />}
        </div>
        <span className={`text-[10px] font-mono shrink-0 ${isDone ? 'text-white/30' : 'text-white/50'}`}>#{step.number}</span>
        <span className={`text-xs tracking-tight truncate ${isDone ? 'text-white/50 line-through decoration-white/20' : 'text-white/90 font-medium'}`}>{cleanTitle}</span>
        {filePath && (
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-zinc-300 bg-white/5 px-1.5 py-0.2 rounded border border-white/10 shrink-0">
            <FileCode2 className="w-2.5 h-2.5 opacity-60" />
            <span className="truncate max-w-[200px]">{filePath}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        {filePath && (
          <span className="md:hidden inline-flex items-center gap-1 text-[10px] font-mono text-zinc-300 bg-white/5 px-1.5 py-0.2 rounded border border-white/10">
            <FileCode2 className="w-2.5 h-2.5 opacity-60" />
            <span className="truncate max-w-[150px]">{filePath}</span>
          </span>
        )}
        {isDone && step.completedAt && <span className="text-[10px] font-mono text-white/40">{formatCompletedAt(step.completedAt)}</span>}
        {matchingFile && (
          <button
            onClick={(e) => { e.stopPropagation(); if (onOpenArchitect) onOpenArchitect(matchingFile.name); }}
            className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white border border-white/15 flex items-center gap-1 font-mono text-[10px] font-semibold transition-all shrink-0 cursor-pointer shadow-sm"
            title={`View Architect Diagram (${matchingFile.name})`}
          >
            <Layers className="w-3 h-3 text-zinc-400" />
            <span>Architect</span>
          </button>
        )}
        {!isRunning && !isDone && (
          <button
            disabled={executing || !hasPlanFiles}
            onClick={() => handleCommand('start')}
            className={`px-2.5 py-0.5 rounded transition-all font-mono text-[10px] font-medium border flex items-center gap-1 ${
              !hasPlanFiles ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed' : 'bg-white/10 text-white hover:bg-white hover:text-zinc-950 hover:border-white border-white/10 cursor-pointer'
            }`}
            title={!hasPlanFiles ? "Generate a plan using the ai-checkpoint CLI first" : "Start Step"}
          >
            <Play className="w-2.5 h-2.5 fill-current" />
            <span>Start</span>
          </button>
        )}
        {isRunning && (
          <button
            disabled={executing}
            onClick={() => handleCommand('complete')}
            className="px-2.5 py-0.5 rounded transition-all font-mono text-[10px] font-bold border flex items-center gap-1 bg-white text-zinc-950 hover:bg-zinc-200 border-white shadow-sm cursor-pointer"
            title="Mark Step as Complete"
          >
            <Check className="w-2.5 h-2.5" />
            <span>Complete</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
