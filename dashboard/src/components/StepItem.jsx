import React, { useState } from 'react';
import { CheckCircle2, Circle, Loader2, AlertTriangle, FileCode2, Play, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './ToastProvider';
import * as api from '../utils/api';

export default function StepItem({ step, index, projectId, hasPlanFiles, onRefresh }) {
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

  // Parse file path from title if present
  const fileMatch = step.title.match(/[`(]([^`)]+\.[a-zA-Z0-9]+)[`)]/);
  const filePath = fileMatch ? fileMatch[1] : null;
  const cleanTitle = fileMatch ? step.title.replace(fileMatch[0], '').trim() : step.title;

  const getFormattedCompletedAt = () => {
    if (!step.completedAt) return '';
    try {
      const parts = step.completedAt.split(' ');
      if (parts.length < 2) return step.completedAt;
      const dateParts = parts[0].split('-');
      const timeParts = parts[1].split(':');
      if (dateParts.length < 3 || timeParts.length < 2) return step.completedAt;
      
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1;
      const day = parseInt(dateParts[2]);
      const hour = parseInt(timeParts[0]);
      const minute = parseInt(timeParts[1]);
      
      const date = new Date(year, month, day, hour, minute);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' +
             date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch (e) {
      return step.completedAt;
    }
  };

  const isDone = step.status === 'done';
  const isRunning = step.status === 'running';
  const isBlocked = step.status === 'blocked';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.15 }}
      className={`py-3 px-4 rounded-xl transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border ${
        isRunning 
          ? 'bg-cyan-500/10 border-cyan-500/30' 
          : isDone 
            ? 'bg-white/[0.02] border-transparent hover:bg-white/[0.04]' 
            : 'bg-black/20 border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
      }`}
    >
      {/* Left side: status icon, step number, clean title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="shrink-0">
          {isDone ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : isRunning || executing ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : isBlocked ? (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          ) : (
            <Circle className="w-4 h-4 text-white/20" />
          )}
        </div>

        <span className={`text-xs font-mono shrink-0 ${isDone ? 'text-white/30' : 'text-white/50'}`}>
          #{step.number}
        </span>

        <span className={`text-sm tracking-tight truncate ${
          isDone ? 'text-white/50 line-through decoration-white/20' : 'text-white/90 font-medium'
        }`}>
          {cleanTitle}
        </span>

        {filePath && (
          <span className="hidden md:inline-flex items-center gap-1 text-xs font-mono text-cyan-300/80 bg-white/5 px-2 py-0.5 rounded border border-white/5 shrink-0">
            <FileCode2 className="w-3 h-3 opacity-60" />
            <span className="truncate max-w-[200px]">{filePath}</span>
          </span>
        )}
      </div>

      {/* Right side: completion time or action buttons */}
      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
        {filePath && (
          <span className="md:hidden inline-flex items-center gap-1 text-[11px] font-mono text-cyan-300/80 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            <FileCode2 className="w-3 h-3 opacity-60" />
            <span className="truncate max-w-[150px]">{filePath}</span>
          </span>
        )}

        {isDone && step.completedAt && (
          <span className="text-[11px] font-mono text-white/40">
            {getFormattedCompletedAt()}
          </span>
        )}

        {!isRunning && !isDone && (
          <button
            disabled={executing || !hasPlanFiles}
            onClick={() => handleCommand('start')}
            className={`px-3 py-1.5 rounded-lg transition-all font-mono text-xs font-medium border flex items-center gap-1.5 ${
              !hasPlanFiles 
                ? 'bg-white/5 text-white/20 border-white/5 cursor-not-allowed' 
                : 'bg-white/10 text-white hover:bg-cyan-500 hover:text-black hover:border-cyan-400 border-white/10'
            }`}
            title={!hasPlanFiles ? "Generate a plan using the ai-checkpoint CLI first" : "Start Step"}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Start</span>
          </button>
        )}

        {isRunning && (
          <button
            disabled={executing}
            onClick={() => handleCommand('complete')}
            className="px-3 py-1.5 rounded-lg transition-all font-mono text-xs font-bold border flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black border-emerald-500/40 shadow-sm"
            title="Mark Step as Complete"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Complete</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
