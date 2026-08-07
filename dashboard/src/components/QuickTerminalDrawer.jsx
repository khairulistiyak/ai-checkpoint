import React from 'react';
import { Terminal, X, Trash2, Copy, Maximize2, Minimize2, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './ToastProvider';
import TerminalQuickActions from './terminal/TerminalQuickActions';
import TerminalOutput from './terminal/TerminalOutput';
import { useTerminalDrawer } from './terminal/useTerminalDrawer';

export default function QuickTerminalDrawer({ isOpen, onClose, projectId }) {
  const { showToast } = useToast();
  const {
    logs, runningCmd, isMaximized, setIsMaximized, inputVal, setInputVal,
    copiedLogId, wrapLines, setWrapLines, logsEndRef, inputRef,
    quickActionGroups, handleSubmit, handleKeyDown, handleCopySingle,
    handleCopyAll, handleClear
  } = useTerminalDrawer({ isOpen, onClose, projectId, showToast });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={`relative pointer-events-auto bg-[#090a0f] border-l border-white/10 flex flex-col shadow-2xl font-mono transition-all duration-200 z-10 ${
              isMaximized ? 'w-full md:w-[92vw]' : 'w-full sm:w-[560px] md:w-[680px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0d0e14] border-b border-white/[0.08] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Terminal size={16} className="text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-100 font-mono tracking-tight">Ledger Flight Console</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">READY</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">Run ledger commands in real-time</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button onClick={() => setWrapLines(!wrapLines)} className={`px-2 py-1 rounded-lg text-[10px] border transition-colors cursor-pointer ${wrapLines ? 'bg-white/10 text-zinc-200 border-white/20' : 'bg-transparent text-zinc-500 border-white/5'}`} title="Toggle line wrap">Wrap</button>
                <button onClick={handleCopyAll} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer" title="Copy all logs"><Copy size={13} /></button>
                <button onClick={handleClear} className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer" title="Clear console buffer"><Trash2 size={13} /></button>
                <button onClick={() => setIsMaximized(!isMaximized)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer" title={isMaximized ? 'Restore drawer' : 'Maximize drawer'}>{isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}</button>
                <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer" title="Close console (Esc)"><X size={14} /></button>
              </div>
            </div>

            <TerminalQuickActions actions={quickActionGroups} runningCmd={runningCmd} />

            <TerminalOutput
              logs={logs}
              logsEndRef={logsEndRef}
              wrapLines={wrapLines}
              handleCopySingle={handleCopySingle}
              copiedLogId={copiedLogId}
            />

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="p-3 bg-[#0c0d12] border-t border-white/[0.08] flex items-center gap-2 shrink-0">
              <div className="relative flex-1 flex items-center">
                <span className="absolute left-3 text-amber-400 text-xs font-bold select-none">&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={runningCmd ? 'Executing...' : 'Type ledger command (e.g. ./l status)...'}
                  disabled={!!runningCmd}
                  className="w-full bg-[#050608] border border-white/10 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 disabled:opacity-50 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!inputVal.trim() || !!runningCmd}
                className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-30 active:scale-95 shrink-0"
              >
                <span>Run</span>
                <CornerDownLeft size={12} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
