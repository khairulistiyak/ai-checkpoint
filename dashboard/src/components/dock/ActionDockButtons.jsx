import React from 'react';
import {
  Play,
  CheckCircle2,
  Loader2,
  Sparkles,
  Copy,
  Check,
  Terminal,
  Code2,
  Minimize2,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

export default function ActionDockButtons({
  isAllComplete,
  executing,
  onRefresh,
  handleQuickHealth,
  handleCopyAiPrompt,
  copiedPrompt,
  handleCopyCliCommand,
  copiedCli,
  filePath,
  handleOpenIde,
  onToggleTerminal,
  isTerminalOpen,
  handleExecute,
  isRunning,
  stepNumber,
  setIsMinimized
}) {
  return (
    <div className="flex items-center gap-1.5 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 border-white/[0.06] pt-1.5 md:pt-0">
      {isAllComplete ? (
        <>
          {/* Quick Refresh */}
          <button
            onClick={onRefresh}
            className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Refresh Project State"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Health Check */}
          <button
            disabled={executing}
            onClick={handleQuickHealth}
            className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Run Health Check"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Health</span>
          </button>
        </>
      ) : (
        <>
          {/* 1. Copy AI Prompt */}
          <button
            onClick={handleCopyAiPrompt}
            className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:border-purple-500/50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Copy AI Prompt formatted for Cursor / Claude / ChatGPT"
          >
            {copiedPrompt ? <Check className="w-3.5 h-3.5 text-purple-300" /> : <Sparkles className="w-3.5 h-3.5 text-purple-400" />}
            <span className="hidden sm:inline">Prompt</span>
          </button>

          {/* 2. Copy CLI Command */}
          <button
            onClick={handleCopyCliCommand}
            className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Copy CLI command to clipboard"
          >
            {copiedCli ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
            <span className="hidden sm:inline">CLI</span>
          </button>

          {/* 3. Open in IDE */}
          {filePath && (
            <button
              onClick={handleOpenIde}
              className="px-2.5 py-1.5 rounded-xl text-xs font-mono font-medium bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Open file in IDE (VS Code / Cursor)"
            >
              <Code2 className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden lg:inline">IDE</span>
            </button>
          )}
        </>
      )}

      {/* Terminal Drawer Toggle */}
      <button
        onClick={onToggleTerminal}
        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer border active:scale-95 ${
          isTerminalOpen
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
            : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border-white/10'
        }`}
        title="Toggle quick terminal console (Ctrl + `)"
      >
        <Terminal className="w-3.5 h-3.5 text-amber-400" />
        <span>Terminal</span>
        <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">Ctrl+`</span>
      </button>

      {/* Primary Action Button (Start / Complete Step if active) */}
      {!isAllComplete && (
        <button
          disabled={executing}
          onClick={handleExecute}
          className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 ${
            isRunning
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 shadow-emerald-500/25'
              : 'bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white shadow-sky-500/25'
          }`}
          title={isRunning ? `Complete step ${stepNumber}` : `Start step ${stepNumber}`}
        >
          {executing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isRunning ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isRunning ? 'Complete' : 'Start'}</span>
        </button>
      )}

      {/* Minimize Pill Button */}
      <button
        onClick={() => setIsMinimized(true)}
        className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors cursor-pointer"
        title="Minimize Dock"
      >
        <Minimize2 size={13} />
      </button>
    </div>
  );
}
