import React, { useEffect } from 'react';
import { FileCode, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ToastProvider';
import ActionDockButtons from './dock/ActionDockButtons';
import { useDeveloperDock } from './dock/useDeveloperDock';

export default function DeveloperActionDock({
  project,
  nextStep,
  runningStep,
  onRefresh,
  onToggleTerminal,
  isTerminalOpen
}) {
  const { showToast } = useToast();
  const {
    executing,
    copiedPrompt,
    copiedCli,
    isMinimized,
    setIsMinimized,
    isAllComplete,
    isRunning,
    stepNumber,
    cleanTitle,
    filePath,
    handleExecute,
    handleCopyAiPrompt,
    handleCopyCliCommand,
    handleOpenIde,
    handleQuickHealth,
    formattedTimer
  } = useDeveloperDock({ project, nextStep, runningStep, onRefresh, showToast });

  useEffect(() => {
    if (isAllComplete) setIsMinimized(true);
  }, [isAllComplete, setIsMinimized]);

  const completionPct = project?.progress?.overall?.percentage ?? project?.overall?.percentage ?? (isAllComplete ? 100 : 0);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[94%] sm:w-auto min-w-[18.75rem] transition-all duration-300 pointer-events-auto select-none">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0c0d14]/95 backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/80 cursor-pointer hover:border-white/20 transition-all group mx-auto"
            onClick={() => setIsMinimized(false)}
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAllComplete ? 'bg-emerald-400' : isRunning ? 'bg-amber-400' : 'bg-sky-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isAllComplete ? 'bg-emerald-500' : isRunning ? 'bg-amber-500' : 'bg-sky-500'}`}></span>
            </span>
            <span className="text-xs font-mono font-bold text-zinc-200">{isAllComplete ? '100% Done' : `#${stepNumber}`}</span>
            <span className="text-xs text-zinc-400 max-w-[11.25rem] sm:max-w-[13.75rem] truncate font-medium">{isAllComplete ? 'System Verified' : cleanTitle}</span>
            <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors" title="Expand Action Deck"><Maximize2 size={11} /></button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className={`relative bg-[#0b0c13]/95 backdrop-blur-2xl rounded-2xl p-2 sm:px-3 sm:py-2 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 border border-white/[0.12] ring-1 ring-white/5 transition-all duration-500 ${
              isAllComplete
                ? 'shadow-[0_16px_50px_-10px_rgba(16,185,129,0.25)]'
                : isRunning
                ? 'shadow-[0_16px_50px_-10px_rgba(245,158,11,0.25)]'
                : 'shadow-[0_16px_50px_-10px_rgba(56,189,248,0.15)]'
            }`}
          >
            {/* Top Micro Progress Hairline */}
            <div className="absolute top-0 left-3 right-3 h-0.5 bg-white/5 rounded-full overflow-hidden pointer-events-none">
              <div className="h-full bg-gradient-to-r from-sky-400 via-amber-400 to-emerald-400 transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>

            <div className="flex items-center gap-2.5 min-w-0 flex-1 px-1">
              <div className="relative flex items-center justify-center shrink-0">
                <span className="relative flex h-2.5 w-2.5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAllComplete ? 'bg-emerald-400' : isRunning ? 'bg-amber-400' : 'bg-sky-400'} opacity-75`}></span>
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAllComplete ? 'bg-emerald-500' : isRunning ? 'bg-amber-500' : 'bg-sky-500'}`}></span>
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-mono font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded ${isAllComplete ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : isRunning ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' : 'text-sky-400 bg-sky-500/10 border border-sky-500/20'}`}>
                    {isAllComplete ? 'All Complete' : isRunning ? 'Running' : 'Next'}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-300 font-bold bg-white/[0.06] px-1.5 py-0.2 rounded border border-white/10">
                    {isAllComplete ? '100%' : `#${stepNumber}`}
                  </span>
                  {isRunning && formattedTimer && (
                    <span className="text-[9px] font-mono text-amber-300 font-bold bg-amber-500/15 px-1.5 py-0.2 rounded border border-amber-500/25 flex items-center gap-1">
                      <span>⏱</span>
                      <span>{formattedTimer}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-semibold text-zinc-100 truncate max-w-[13.75rem] sm:max-w-xs md:max-w-sm tracking-tight font-outfit">
                    {isAllComplete ? 'System Fully Verified' : cleanTitle}
                  </span>
                  {!isAllComplete && filePath && (
                    <button onClick={handleOpenIde} className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-sky-300 bg-white/[0.04] hover:bg-sky-500/10 px-1.5 py-0.5 rounded border border-white/10 hover:border-sky-500/30 transition-all shrink-0 cursor-pointer group" title="Click to jump to file in IDE">
                      <FileCode className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 group-hover:text-sky-400" />
                      <span className="truncate max-w-[8.125rem]">{filePath}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <ActionDockButtons
              isAllComplete={isAllComplete}
              executing={executing}
              onRefresh={onRefresh}
              handleQuickHealth={handleQuickHealth}
              handleCopyAiPrompt={handleCopyAiPrompt}
              copiedPrompt={copiedPrompt}
              handleCopyCliCommand={handleCopyCliCommand}
              copiedCli={copiedCli}
              filePath={filePath}
              handleOpenIde={handleOpenIde}
              onToggleTerminal={onToggleTerminal}
              isTerminalOpen={isTerminalOpen}
              handleExecute={handleExecute}
              isRunning={isRunning}
              stepNumber={stepNumber}
              setIsMinimized={setIsMinimized}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
