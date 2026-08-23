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
    <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 border-white/[0.06] pt-1.5 md:pt-0">
      {/* Utilities Segmented Bar */}
      <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.08]">
        {isAllComplete ? (
          <>
            <button
              onClick={onRefresh}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Refresh Project State"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              disabled={executing}
              onClick={handleQuickHealth}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              title="Run Health Check"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Health</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleCopyAiPrompt}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                copiedPrompt
                  ? 'bg-purple-500/30 text-purple-200 border border-purple-500/40'
                  : 'text-purple-300 hover:text-purple-200 hover:bg-purple-500/15'
              }`}
              title="Copy AI Prompt formatted for AI Agents"
            >
              {copiedPrompt ? <Check className="w-3 h-3 text-purple-300" /> : <Sparkles className="w-3 h-3 text-purple-400" />}
              <span className="hidden sm:inline">Prompt</span>
            </button>

            <button
              onClick={handleCopyCliCommand}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                copiedCli
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-zinc-300 hover:text-white hover:bg-white/[0.08]'
              }`}
              title="Copy CLI command"
            >
              {copiedCli ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-zinc-400" />}
              <span className="hidden sm:inline">CLI</span>
            </button>

            {filePath && (
              <button
                onClick={handleOpenIde}
                className="px-2 py-1 rounded-lg text-xs font-mono font-medium text-zinc-300 hover:text-sky-300 hover:bg-sky-500/10 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                title="Open in IDE (VS Code / Cursor)"
              >
                <Code2 className="w-3 h-3 text-sky-400" />
                <span className="hidden lg:inline">IDE</span>
              </button>
            )}

            <button
              onClick={onToggleTerminal}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                isTerminalOpen
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-zinc-300 hover:text-amber-300 hover:bg-amber-500/10'
              }`}
              title="Toggle quick terminal (Ctrl + `)"
            >
              <Terminal className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Terminal</span>
            </button>
          </>
        )}
      </div>

      {/* Primary Action Button */}
      {!isAllComplete && (
        <button
          disabled={executing}
          onClick={handleExecute}
          className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 ${
            isRunning
              ? 'bg-emerald-400 hover:bg-emerald-300 text-zinc-950 shadow-emerald-500/20'
              : 'bg-white hover:bg-zinc-200 text-zinc-950 shadow-white/10'
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

      {/* Minimize Button */}
      <button
        onClick={() => setIsMinimized(true)}
        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors cursor-pointer"
        title="Minimize Dock"
      >
        <Minimize2 size={13} />
      </button>
    </div>
  );
}
