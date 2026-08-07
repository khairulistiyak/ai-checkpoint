import React from 'react';
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
    handleQuickHealth
  } = useDeveloperDock({ project, nextStep, runningStep, onRefresh, showToast });

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-4xl w-[94%] sm:w-auto min-w-[320px] transition-all duration-300 pointer-events-auto select-none">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#0c0d14]/95 backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/80 cursor-pointer hover:border-white/20 transition-all group mx-auto"
            onClick={() => setIsMinimized(false)}
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAllComplete ? 'bg-emerald-400' : isRunning ? 'bg-amber-400' : 'bg-sky-400'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAllComplete ? 'bg-emerald-500' : isRunning ? 'bg-amber-500' : 'bg-sky-500'}`}></span>
            </span>
            <span className="text-xs font-mono font-bold text-zinc-200">{isAllComplete ? '100% Done' : `#${stepNumber}`}</span>
            <span className="text-xs text-zinc-400 max-w-[180px] sm:max-w-[240px] truncate font-medium">{isAllComplete ? 'All Steps Complete • Quick Tools' : cleanTitle}</span>
            <button className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-white/10 transition-colors" title="Expand Action Deck"><Maximize2 size={12} /></button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className="relative rounded-2xl p-[1px] bg-gradient-to-r from-sky-500/25 via-purple-500/25 to-emerald-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.85)]"
          >
            <div className="bg-[#0b0c12]/95 backdrop-blur-3xl rounded-[15px] p-2 sm:p-2.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-3 border border-white/[0.08]">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 px-1">
                <div className="relative flex items-center justify-center shrink-0">
                  <span className="relative flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAllComplete ? 'bg-emerald-400' : isRunning ? 'bg-amber-400' : 'bg-sky-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 ${isAllComplete ? 'bg-emerald-500' : isRunning ? 'bg-amber-500' : 'bg-sky-500'}`}></span>
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-extrabold uppercase tracking-widest ${isAllComplete ? 'text-emerald-400' : isRunning ? 'text-amber-400' : 'text-sky-400'}`}>
                      {isAllComplete ? 'All Complete' : isRunning ? 'Running' : 'Next Up'}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-200 font-bold bg-white/[0.08] px-1.5 py-0.2 rounded-md border border-white/10">
                      {isAllComplete ? '100%' : `#${stepNumber}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-semibold text-zinc-100 truncate max-w-[200px] sm:max-w-xs md:max-w-sm tracking-tight">
                      {isAllComplete ? 'System Fully Verified • Ready for Operations' : cleanTitle}
                    </span>
                    {!isAllComplete && filePath && (
                      <button onClick={handleOpenIde} className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-zinc-400 hover:text-sky-300 bg-white/[0.04] hover:bg-sky-500/10 px-2 py-0.5 rounded-md border border-white/10 hover:border-sky-500/30 transition-all shrink-0 cursor-pointer group" title="Click to jump to file in IDE">
                        <FileCode className="w-2.5 h-2.5 opacity-70 group-hover:opacity-100 group-hover:text-sky-400" />
                        <span className="truncate max-w-[130px]">{filePath}</span>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
