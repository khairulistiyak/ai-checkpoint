import React, { useState } from 'react';
import { CheckCircle2, Circle, Loader2, AlertTriangle, FileCode2, Play, Check, Layers, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from './ToastProvider';
import * as api from '../utils/api';
import { buildStepExecutionPrompt } from '../utils/prompt-builder';
import { formatLocalTime } from '../utils/date-formatter';

export default function StepItem({
  step, index = 0, projectId, projectPath, hasPlanFiles, matchingFile, onOpenArchitect, onRefresh
}) {
  const { showToast } = useToast();
  const [executing, setExecuting] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

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

  const handleCopyPrompt = (e) => {
    e.stopPropagation();
    const prompt = buildStepExecutionPrompt({
      stepNumber: step.number, title: cleanTitle, filePath,
      projectPath: projectPath || projectId, status: step.status, doneCheck: './l v && npm test'
    });
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    showToast(`AI Prompt for Step ${step.number} copied!`, 'success');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleOpenIde = (e) => {
    e.stopPropagation();
    if (!filePath) return;
    window.location.href = `vscode://file/${projectPath ? `${projectPath}/${filePath}` : filePath}`;
    showToast(`Opening ${filePath} in IDE...`, 'info');
  };

  const formattedTime = step.completedAt ? formatLocalTime(step.completedAt) : '';
  const isDone = step.status === 'done', isRunning = step.status === 'running', isBlocked = step.status === 'blocked';

  const rowStyle = isRunning
    ? 'bg-amber-500/[0.09] border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.12)] ring-1 ring-amber-500/20'
    : isBlocked ? 'bg-rose-500/[0.08] border-rose-500/30'
    : isDone ? 'bg-white/[0.01] border-transparent hover:bg-white/[0.02]'
    : 'bg-[#09090b]/60 border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.02]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.2), duration: 0.12 }}
      className={`py-1.5 px-3 rounded-xl transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border group ${rowStyle}`}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="shrink-0">
          {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : isRunning || executing ? <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" /> : isBlocked ? <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> : <Circle className="w-3.5 h-3.5 text-zinc-600" />}
        </div>
        <span className={`text-[10px] font-mono shrink-0 ${isRunning ? 'text-amber-300 font-bold' : isDone ? 'text-zinc-600' : 'text-zinc-400'}`}>#{step.number}</span>
        <span className={`text-xs tracking-tight truncate ${isRunning ? 'text-amber-100 font-medium' : isDone ? 'text-zinc-500 line-through decoration-zinc-700' : 'text-zinc-200 font-medium'}`}>{cleanTitle}</span>

        {isRunning && (
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40 shrink-0 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
            <span>WORKING</span>
          </span>
        )}
        {isDone && (
          <span className="text-[8.5px] font-mono font-medium uppercase tracking-wider text-emerald-400/80 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
            DONE
          </span>
        )}
        {isBlocked && (
          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-rose-300 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30 shrink-0">
            BLOCKED
          </span>
        )}

        {filePath && (
          <button
            onClick={handleOpenIde}
            className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-cyan-300 bg-white/[0.03] hover:bg-cyan-500/10 px-2 py-0.5 rounded-md border border-white/[0.06] hover:border-cyan-500/30 shrink-0 transition-all cursor-pointer"
            title={`Click to open ${filePath} in IDE`}
          >
            <FileCode2 className="w-2.5 h-2.5 opacity-60" />
            <span className="truncate max-w-[12rem]">{filePath}</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
        <button
          onClick={handleCopyPrompt}
          className="p-1 px-1.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 hover:border-purple-500/30 flex items-center gap-1 font-mono text-[10px] transition-all cursor-pointer shrink-0"
          title="Copy prompt for AI Agent"
        >
          {copiedPrompt ? <Check className="w-2.5 h-2.5 text-purple-300" /> : <Sparkles className="w-2.5 h-2.5 text-purple-400" />}
          <span className="hidden xl:inline">Prompt</span>
        </button>

        {filePath && (
          <button onClick={handleOpenIde} className="md:hidden inline-flex items-center gap-1 text-[10px] font-mono text-zinc-300 bg-white/5 px-1.5 py-0.2 rounded border border-white/10">
            <FileCode2 className="w-2.5 h-2.5 opacity-60" />
            <span className="truncate max-w-[7.5rem]">{filePath}</span>
          </button>
        )}
        {isDone && formattedTime && <span className="text-[10px] font-mono text-zinc-500">{formattedTime}</span>}
        {matchingFile && (
          <button
            onClick={(e) => { e.stopPropagation(); if (onOpenArchitect) onOpenArchitect(matchingFile.name); }}
            className="px-2 py-0.5 rounded-md bg-white/[0.03] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06] flex items-center gap-1 font-mono text-[10px] transition-all shrink-0 cursor-pointer shadow-sm"
            title={`View Blueprint (${matchingFile.name})`}
          ><Layers className="w-3 h-3 text-zinc-400" /><span>Blueprint</span></button>
        )}
        {!isRunning && !isDone && (
          <button
            disabled={executing || !hasPlanFiles} onClick={() => handleCommand('start')}
            className={`px-2.5 py-0.5 rounded-md transition-all font-mono text-[10px] font-medium border flex items-center gap-1 ${
              !hasPlanFiles ? 'bg-white/[0.02] text-zinc-600 border-white/[0.04] cursor-not-allowed' : 'bg-white/[0.04] text-zinc-200 hover:bg-white/[0.10] hover:text-white border-white/[0.08] cursor-pointer'
            }`}
            title={!hasPlanFiles ? "Generate a plan using the ai-checkpoint CLI first" : "Start Step"}
          ><Play className="w-2.5 h-2.5 fill-current" /><span>Start</span></button>
        )}
        {isRunning && (
          <button
            disabled={executing} onClick={() => handleCommand('complete')}
            className="px-2.5 py-0.5 rounded-md transition-all font-mono text-[10px] font-bold border flex items-center gap-1 bg-amber-400 text-zinc-950 hover:bg-amber-300 border-amber-300 shadow-sm cursor-pointer"
            title="Mark Step as Complete"
          ><Check className="w-2.5 h-2.5" /><span>Complete</span></button>
        )}
      </div>
    </motion.div>
  );
}
